import { tool } from "ai";
import { z } from "zod";
import { Transaction } from "@mysten/sui/transactions";
import { Aftermath } from "aftermath-ts-sdk";
import { suiClient, getAllBalances } from "./sui-utils";

function normalizeCoinType(coinType: string): string {
  if (coinType.includes("0000000000000000000000000000000000000000000000000000000000000002::sui::SUI")) {
    return "0x2::sui::SUI";
  }
  return coinType;
}

export const addLiquidityTool = tool({
  description: "Add liquidity to a pool and/or stake LP tokens in a farm",
  parameters: z.object({
    poolId: z.string().describe("The pool object ID to add liquidity to"),
    amountsIn: z.record(z.string()).optional().describe("Map of coin types to amounts to deposit (required for deposit mode)"),
    farmId: z.string().optional().describe("Farm ID to stake LP tokens in"),
    lockDurationDays: z.number().optional().describe("Lock duration in days for farming"),
    slippage: z.number().default(0.01).describe("Slippage tolerance (0.01 = 1%)"),
    walletAddress: z.string().describe("User's wallet address"),
    mode: z.enum(["deposit", "stake", "both"]).default("deposit").describe("Mode: 'deposit' for liquidity only, 'stake' for farming only, 'both' for deposit then stake"),
    lpAmount: z.string().optional().describe("Amount of LP tokens to stake (required for stake-only mode)"),
    lpCoinType: z.string().optional().describe("LP coin type to stake (required for stake-only mode)"),
  }),
  execute: async (args) => {
    try {
      const afSdk = new Aftermath("MAINNET");
      await afSdk.init();
      const poolsClient = afSdk.Pools();
      const farmsClient = afSdk.Farms();
      const coinClient = afSdk.Coin();
      
      let depositTxBytes;
      let stakeTxBytes;
      let poolInfo;
      let farmInfo;
      let depositsInfo;
      let lpAmountOut = BigInt(0);
      
      // Handle deposit transaction
      if (args.mode === "deposit" || args.mode === "both") {
        if (!args.amountsIn) {
          throw new Error("amountsIn is required for deposit mode");
        }
        
        // Get pool
        const pool = await poolsClient.getPool({ objectId: args.poolId });
        if (!pool) {
          throw new Error("Pool not found");
        }

        // Check user balances
        const userBalances = await getAllBalances(args.walletAddress);
        const userBalanceMap = new Map();
        userBalances.forEach(b => {
          userBalanceMap.set(b.coinType, b.totalBalance);
          userBalanceMap.set(normalizeCoinType(b.coinType), b.totalBalance);
        });
        
        // Check if user has the tokens they're trying to deposit
        const missingTokens: string[] = [];
        for (const [coinType, amount] of Object.entries(args.amountsIn)) {
          const userBalance = userBalanceMap.get(normalizeCoinType(coinType)) || userBalanceMap.get(coinType);
          if (!userBalance || BigInt(userBalance) < BigInt(amount)) {
            missingTokens.push(coinType);
          }
        }
        
        if (missingTokens.length > 0) {
          const missingTokenMetadata = await Promise.all(
            missingTokens.map(async (coinType) => {
              const meta = await coinClient.getCoinMetadata(coinType);
              return {
                coinType,
                symbol: meta?.symbol || coinType.split('::').pop(),
              };
            })
          );
          
          return {
            success: false,
            error: "INSUFFICIENT_BALANCE",
            missingTokens: missingTokenMetadata,
            message: `You need more ${missingTokenMetadata.map(t => t.symbol).join(', ')} to add liquidity.`,
          };
        }

        // Convert amounts to match pool's coin types
        const poolCoinTypes = Object.keys(pool.pool.coins);
        const amountsInBigInt: Record<string, bigint> = {};
        
        for (const [userCoinType, amount] of Object.entries(args.amountsIn)) {
          const poolCoinType = poolCoinTypes.find(poolType => {
            const userTokenName = userCoinType.split('::').pop();
            const poolTokenName = poolType.split('::').pop();
            return userTokenName === poolTokenName && 
                   userCoinType.includes('::' + userTokenName);
          });
          
          if (poolCoinType) {
            amountsInBigInt[poolCoinType] = BigInt(amount);
          } else {
            throw new Error(`Token ${userCoinType} not found in pool`);
          }
        }

        // Estimate LP tokens out
        try {
          const lpInfo = pool.getDepositLpAmountOut({
            amountsIn: amountsInBigInt,
            referral: false,
          });
          lpAmountOut = lpInfo.lpAmountOut;
          console.log("Estimated LP tokens:", lpAmountOut.toString());
        } catch (error) {
          console.warn("Could not estimate LP amount:", error);
        }

        // Create deposit transaction
        const depositTx = await pool.getDepositTransaction({
          walletAddress: args.walletAddress,
          amountsIn: amountsInBigInt,
          slippage: args.slippage,
        });
        
        depositTxBytes = await depositTx.build({ client: suiClient });
        
        poolInfo = {
          poolId: pool.pool.objectId,
          poolName: pool.pool.name,
          lpCoinType: pool.pool.lpCoinType,
          estimatedLpTokens: lpAmountOut.toString(),
        };
        
        // Get token metadata for deposits info
        const coinTypes = Object.keys(args.amountsIn);
        const coinMetadata = await Promise.all(
          coinTypes.map(async (coinType) => {
            const meta = await coinClient.getCoinMetadata(coinType);
            return { coinType, metadata: meta };
          })
        );
        
        depositsInfo = Object.entries(args.amountsIn).map(([coinType, amount]) => {
          const meta = coinMetadata.find(m => m.coinType === coinType)?.metadata;
          return {
            coinType,
            amount,
            symbol: meta?.symbol || coinType.split('::').pop(),
            decimals: meta?.decimals || 9,
          };
        });
      }
      
      // Handle stake transaction
      if ((args.mode === "stake" || args.mode === "both") && args.farmId && args.lockDurationDays !== undefined) {
        // Determine LP amount and type for staking
        let stakeAmount: bigint;
        let stakeLpType: string;
        
        if (args.mode === "stake") {
          // Stake-only mode: use provided LP amount and type
          if (!args.lpAmount || !args.lpCoinType) {
            throw new Error("lpAmount and lpCoinType are required for stake-only mode");
          }
          stakeAmount = BigInt(args.lpAmount);
          stakeLpType = args.lpCoinType;
        } else {
          // Both mode: use estimated LP from deposit
          if (lpAmountOut === BigInt(0)) {
            throw new Error("Could not estimate LP amount for staking");
          }
          stakeAmount = lpAmountOut;
          stakeLpType = poolInfo!.lpCoinType;
        }
        
        const farm = await farmsClient.getStakingPool({ objectId: args.farmId });
        if (!farm) {
          throw new Error("Farm not found");
        }

        const lockDurationMs = args.lockDurationDays * 24 * 60 * 60 * 1000;
        
        // Create stake transaction
        const stakeTx = await farm.getStakeTransaction({
          stakeAmount,
          lockDurationMs,
          walletAddress: args.walletAddress,
          isSponsoredTx: false,
        });
        
        stakeTxBytes = await stakeTx.build({ client: suiClient });
        
        farmInfo = {
          farmId: args.farmId,
          lockDurationDays: args.lockDurationDays,
          lpAmountToStake: stakeAmount.toString(),
          lpCoinType: stakeLpType,
        };
      }

      return {
        success: true,
        transactions: {
          deposit: depositTxBytes ? {
            transactionBytes: depositTxBytes,
            description: "Add liquidity to pool",
          } : null,
          stake: stakeTxBytes ? {
            transactionBytes: stakeTxBytes,
            description: "Stake LP tokens in farm",
          } : null,
        },
        poolInfo,
        depositsInfo,
        farmInfo,
      };

    } catch (error) {
      console.error("Error in addLiquidity:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create transactions",
      };
    }
  },
});

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";

export const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

interface SuiBalance {
  totalBalance: string;
}

interface CoinBalance {
  coinType: string;
  totalBalance: string;
  coinObjectCount: number;
}

export const balance = (balance: SuiBalance): number => {
  return Number.parseInt(balance.totalBalance) / Number(MIST_PER_SUI);
};

export const getAllBalances = async (
  address: string
): Promise<CoinBalance[]> => {
  const response = await fetch(getFullnodeUrl("mainnet"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "suix_getAllBalances",
      params: [address],
    }),
  });

  const data = await response.json();
  return data.result;
};

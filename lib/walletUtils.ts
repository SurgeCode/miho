import { toast } from "../hooks/use-toast";
import { Transaction } from "@mysten/sui/transactions";

/**
 * Executes a transaction using the connected wallet's signAndExecuteTransaction method
 * @param wallet The wallet instance from useWallet
 * @param transaction The transaction data to execute (can be transaction bytes or a transaction object)
 * @param onSuccess Optional callback function to execute on success
 * @param onError Optional callback function to execute on error
 * @returns Promise resolving to the transaction result or null on error
 */
export async function executeTransaction(
  wallet: any,
  transaction: any,
  onSuccess?: (txResult: any) => void,
  onError?: (error: Error) => void
) {
  if (!wallet || !wallet.connected) {
    const error = new Error("Wallet not connected");
    onError?.(error);
    toast({
      title: "Error",
      description: "Wallet not connected. Please connect your wallet first.",
      variant: "destructive",
    });
    return null;
  }

  try {
    console.log("Executing transaction with wallet:", wallet);
    console.log("Transaction data received:", transaction);

    // Check if transaction is empty
    if (!transaction) {
      throw new Error("Empty transaction received");
    }

    console.log("Transaction bytes:", transaction);
    const txToExecute = Transaction.from(transaction);
    console.log("Transaction successfully reconstructed:", txToExecute);

    const result = await wallet.signAndExecuteTransaction({
      transaction: txToExecute,
    });

    console.log("Transaction result:", result);
    onSuccess?.(result);
    toast({
      title: "Success",
      description: "Transaction executed successfully!",
    });
    return result;
  } catch (err) {
    console.error("Transaction execution error:", err);
    const error =
      err instanceof Error
        ? err
        : new Error("Unknown error executing transaction");
    onError?.(error);
    toast({
      title: "Error",
      description: `Transaction failed: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
}

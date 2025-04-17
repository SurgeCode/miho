"use client";
import HomeContent from "@/components/HomeContent";
import { WalletProvider } from "@suiet/wallet-kit";


export default function Home() {
  return (
    <WalletProvider>
      <HomeContent />
    </WalletProvider>
  );
}

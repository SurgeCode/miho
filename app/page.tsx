"use client";
import HomeContent from "@/components/HomeContent";
import { WalletProvider } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";

export default function Home() {
  return (
    <WalletProvider>
      <HomeContent />
    </WalletProvider>
  );
}

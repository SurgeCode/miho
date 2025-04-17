import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Miho",
  description: "Miho SUI Defi assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>

        {children}
      </body>

    </html>
  );
}

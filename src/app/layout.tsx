import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "AceInvest — Stock Fair Value Tracker",
  description: "Track fair value of stocks using 14 valuation models and health score",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">{children}</main>
        <footer className="text-center text-slate-500 text-xs py-4 border-t border-slate-800">
          AceInvest — Data from Yahoo Finance. Not financial advice.
          {" "}Chart by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline">TradingView</a>.
        </footer>
      </body>
    </html>
  );
}

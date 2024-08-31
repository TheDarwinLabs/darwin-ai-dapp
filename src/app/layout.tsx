import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
// import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config";
import AppKitProvider from "@/context";
import { AccountDataProvider } from "@/context/AccountDataContext";

import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.scss";
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Darwin",
  description: "Darwin AI Dapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config);
  // const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/logo.svg" sizes="any" />
      </head>
      <body className={spaceMono.className}>
        <AppKitProvider initialState={initialState}>
          <AccountDataProvider>{children}</AccountDataProvider>
        </AppKitProvider>
        <Toaster />
      </body>
    </html>
  );
}

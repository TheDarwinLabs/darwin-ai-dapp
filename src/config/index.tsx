import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage } from "wagmi";
import { Chain, mainnet, sepolia, darwinia } from "wagmi/chains";

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
// https://mainnet.infura.io/v3/f1dae14dcf4745c5b7c49b2d3c989257
if (!projectId) throw new Error("Project ID is not defined");

export const metadata = {
  name: "Sepolia",
  description: "Darwin AI",
  url: "https://web3modal.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const DarwinDevnet: Chain = {
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.sepolia.org"],
      webSocket: ["wss://rpc.sepolia.org"],
      
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://sepolia.etherscan.io" },
    
  },
};
// Create wagmiConfig
const chains = [sepolia] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: false,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

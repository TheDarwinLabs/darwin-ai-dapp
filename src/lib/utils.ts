import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers, BigNumberish, Numeric } from "ethers";
import Decimal from "decimal.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

export function shortenHash(hash?: string) {
  if (!hash) return "";
  return `${hash.slice(0, 5)}...${hash.slice(-4)}`;
}

export function formatUnits(value: unknown, decimals?: string | Numeric) {
  if (!value) return "0";
  return ethers.formatUnits(value as BigNumberish, decimals);
}

export const formatNumber = (
  value?: number | string | null,
  precision = 6,
  rounding = Decimal.ROUND_DOWN
) => {
  if (value === null || value === undefined) return "0.0";
  const numericValue = new Decimal(value);
  return numericValue.toDecimalPlaces(precision, rounding).toString();
};

export interface WalletInfo {
  privateKey: `0x${string}`;
  address: `0x${string}`;
}

const WALLET_KEY = "wallet_info";

export function getOrCreateWallet(): WalletInfo {
  const cachedWallet = localStorage.getItem(WALLET_KEY);

  if (cachedWallet) {
    const parsedWallet = JSON.parse(cachedWallet) as WalletInfo;
    return parsedWallet;
  }

  const privateKeyBytes = ethers.randomBytes(32);
  const privateKey = ethers.hexlify(privateKeyBytes) as `0x${string}`;

  const wallet = new ethers.Wallet(privateKey);

  const walletInfo: WalletInfo = {
    privateKey,
    address: wallet.address as `0x${string}`,
  };

  localStorage.setItem(WALLET_KEY, JSON.stringify(walletInfo));

  return walletInfo;
}

export function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
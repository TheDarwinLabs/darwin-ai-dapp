import { useBalance, useReadContract } from "wagmi";
import { DNAStakeAbi } from "@/abi/DNAStake";
import { DNAStakeContract } from "@/lib/config";
import { formatUnits } from "@/lib/utils";
import Decimal from "decimal.js";

export function useReadMultiplier() {
  return useReadContract({
    abi: DNAStakeAbi,
    address: DNAStakeContract,
    functionName: "multiplier",
    query: {
      select: Number,
      gcTime: Infinity,
      staleTime: Infinity,
    },
  });
}

export function useReadqDNAPerBlockWithOneStake() {
  return useReadContract({
    abi: DNAStakeAbi,
    address: DNAStakeContract,
    functionName: "qDNAPerBlockWithOneStake",
    query: {
      select: (value) => Number(formatUnits(value)),
      gcTime: Infinity,
      staleTime: Infinity,
    },
  });
}

export function useReadTotalStakedDNA() {
  return useReadContract({
    abi: DNAStakeAbi,
    address: DNAStakeContract,
    functionName: "totalStakedDNA",
  });
}

export function useReadUserStakeInfo(address?: `0x${string}`) {
  return useReadContract({
    abi: DNAStakeAbi,
    address: DNAStakeContract,
    functionName: "getUserStakeInfo",
    args: [address ?? "0x"],
    query: {
      enabled: !!address,
      // placeholderData: {
      //   preBlockNumber: BigInt(0),
      //   stakedDNA: BigInt(0),
      //   preQDNA: BigInt(0),
      // },
      // refetchInterval: 5,
      // initialData: {
      //   preBlockNumber: BigInt(0),
      //   stakedDNA: BigInt(0),
      //   preQDNA: BigInt(0),
      // },
      select: (res) => {
        return {
          preBlockNumber: formatUnits(res.preBlockNumber),
          stakedDNA: formatUnits(res.stakedDNA),
          preQDNA: formatUnits(res.preQDNA),
        };
      },
    },
  });
}

export function useReadBalance(address?: `0x${string}`) {
  return useBalance({
    address,
    query: {
      enabled: !!address,
      select: (res) => {
        return {
          ...res,
          formatted: formatUnits(res.value, res.decimals),
        };
      },
    },
  });
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useReadBalance,
  useReadMultiplier,
  useReadqDNAPerBlockWithOneStake,
  useReadUserStakeInfo,
} from "@/hooks/useContractRead";
import { useAccount } from "wagmi";
import Decimal from "decimal.js";

interface AccountDataContextProps {
  balance: string | null;
  stakedDNA: string | null;
  preQDNA: string | null;
  qdnaUpdatedAt: number | null;
  formatBalance: (precision?: number) => string;
  refetchUserStakeInfo: () => void;
}

const AccountDataContext = createContext<AccountDataContextProps | undefined>(
  undefined
);

export const useAccountData = () => {
  const context = useContext(AccountDataContext);
  if (!context) {
    throw new Error("useAccountData must be used within a AccountDataProvider");
  }
  return context;
};

export const AccountDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { address } = useAccount();
  const { data: balanceInfo } = useReadBalance(address);
  const {
    data: UserStakeInfo,
    dataUpdatedAt,
    refetch: refetchUserStakeInfo,
  } = useReadUserStakeInfo(address);

  const [balance, setBalance] = useState<string | null>(null);
  const [stakedDNA, setStakedDNA] = useState<string | null>(null);
  const [preQDNA, setPreQDNA] = useState<string | null>(null);
  const [qdnaUpdatedAt, setQdnaUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    if (balanceInfo) setBalance(balanceInfo.formatted);
  }, [balanceInfo]);

  useEffect(() => {
    if (UserStakeInfo) {
      setStakedDNA(UserStakeInfo.stakedDNA);
      setPreQDNA(UserStakeInfo.preQDNA);
      setQdnaUpdatedAt(dataUpdatedAt);
    }
  }, [UserStakeInfo, dataUpdatedAt]);

  const formatBalance = (precision = 8) => {
    const numericValue = new Decimal(balance ?? 0);
    return numericValue
      .toDecimalPlaces(precision, Decimal.ROUND_DOWN)
      .toString();
  };

  return (
    <AccountDataContext.Provider
      value={{
        balance,
        stakedDNA,
        preQDNA,
        qdnaUpdatedAt,
        formatBalance,
        refetchUserStakeInfo,
        // amount, userId, refetchAccountData
      }}
    >
      {children}
    </AccountDataContext.Provider>
  );
};

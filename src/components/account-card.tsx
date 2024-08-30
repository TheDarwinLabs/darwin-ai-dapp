import { useState } from "react";
import { format } from "date-fns";
import { useWeb3Modal, useWalletInfo } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect } from "wagmi";
import { cn, shortenAddress } from "@/lib/utils";
import SvgIcon from "@/components/SvgIcon";
import { StakeUnStake } from "@/components/stakeUnStake";
import {
  useReadMultiplier,
  useReadqDNAPerBlockWithOneStake,
  useReadTotalStakedDNA,
} from "@/hooks/useContractRead";
import { useAccountData } from "@/context/AccountDataContext";
import { useClipboard } from "@/hooks/useClipboard";

export const AccountCard = () => {
  const { copy, isCopied, isSupported, error } = useClipboard();
  const { address } = useAccount();
  const {
    formatBalance,
    stakedDNA,
    preQDNA,
    qdnaUpdatedAt,
    refetchUserStakeInfo,
  } = useAccountData();
  const { walletInfo } = useWalletInfo();
  const { disconnect } = useDisconnect();
  const [active, setActive] = useState(false);

  // const { data: totalStakedDNA } = useReadTotalStakedDNA();

  const { data: multiplier } = useReadMultiplier();

  const { data: qDNAPerBlockWithOneStake } = useReadqDNAPerBlockWithOneStake();
  const qDNAPerHourWithOneStake = (
    (qDNAPerBlockWithOneStake ?? 0) *
    20 *
    60
  ).toFixed(2);

  const max = (multiplier ?? 0) * Number(stakedDNA ?? 0);

  return (
    <div className="p-6 flex flex-col gap-5">
      <div className=" relative bg-[rgba(99,73,255,0.1)] rounded-[6px]">
        <div className="py-5 px-[14px] leading-[22px] text-[12px] ">
          <div className="flex flex-col gap-[2px] text-brand">
            <div className="flex items-center gap-1">
              <SvgIcon name="dna" />
              DNA
            </div>
            <div className="text-[20px] font-bold">{stakedDNA ?? "0.0"}</div>
            <div className="text-[rgba(255,255,255,0.35)]">
              Balance {formatBalance(8)}
            </div>
          </div>
          <div className="my-[14px] mr-[7px] h-[1px] bg-[rgba(255,255,255,0.03)]"></div>
          <div className="flex flex-col gap-[2px]">
            <div className="flex justify-between ">
              <div className="flex items-center gap-1">
                <SvgIcon name="qdna" />
                <span className="text-[rgba(255,151,31,0.8)]">QDNA</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[rgba(255,255,255,0.35)]">
                  {format(qdnaUpdatedAt || new Date(), "HH:mm")}
                </span>
                <SvgIcon
                  name="refresh"
                  clickRotate
                  onClick={refetchUserStakeInfo}
                  className="cursor-pointer"
                />
              </div>
            </div>
            <div className="text-[#FF971F] text-[20px] font-bold">
              {preQDNA ?? "0.0"}
            </div>
            <div className="text-[rgba(255,255,255,0.35)] flex justify-between">
              <div className="flex items-center gap-[2px]">
                <span>
                  +{qDNAPerHourWithOneStake}*{preQDNA ?? 0}/hr
                </span>
                <SvgIcon name="info" className="cursor-pointer w-[14px]" />
              </div>
              <div>MAX {max}</div>
            </div>
          </div>
        </div>
        <div className="bg-[#171419] p-[14px] flex gap-[10px] select-none">
          <SvgIcon name={walletInfo?.name ?? ""} className="w-6 h-6" />
          <div className="grow flex justify-between rounded text-[rgba(255,255,255,0.6)] text-[14px] transition-all duration-500 group hover:bg-[rgba(99,73,255,0.1)] pl-2 pr-1">
            <span className="transition-all duration-500 group-hover:text-brand">
              {shortenAddress(address)}
            </span>
            <SvgIcon
              name={isCopied ? "right" : "copy"}
              onClick={() => copy(address ?? "")}
              className="cursor-pointer transition-all duration-500 opacity-0 group-hover:opacity-100"
            />
          </div>
          <SvgIcon
            name="arrow"
            onClick={() => {
              setActive((prevValue) => !prevValue);
            }}
            className={cn(
              "cursor-pointer transition-all w-[24px] h-[24px]",
              active ? "transform rotate-180 " : ""
            )}
          />
        </div>
        <div
          className={cn(
            "absolute  bg-[#171419] w-full p-[14px] overflow-hidden select-none",
            active ? "h-[68px]" : "h-0 hidden"
          )}
        >
          <div
            className="flex items-center justify-center h-full gap-[10px] text-[14px] cursor-pointer rounded-[2px] group hover:bg-[rgba(99,73,255,0.15)]"
            onClick={() => {
              disconnect();
            }}
          >
            <SvgIcon
              name="disconnect"
              className="w-6 h-6 text-[#989898] group-hover:text-brand"
            />
            <span className="text-[rgba(255,255,255,0.6)] group-hover:text-brand">
              Disconnect wallet
            </span>
          </div>
        </div>
      </div>
      <StakeUnStake />
    </div>
  );
};

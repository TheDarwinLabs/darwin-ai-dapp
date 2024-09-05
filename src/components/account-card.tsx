import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useWeb3Modal, useWalletInfo } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect, useWaitForTransactionReceipt } from "wagmi";
import { cn, shortenAddress } from "@/lib/utils";
import SvgIcon from "@/components/SvgIcon";
import { StakeUnStake } from "@/components/stakeUnStake";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useReadMultiplier,
  useReadqDNAPerBlockWithOneStake,
  useReadTotalStakedDNA,
} from "@/hooks/useContractRead";
import { useAccountData } from "@/context/AccountDataContext";
import { useClipboard } from "@/hooks/useClipboard";
import { Button } from "./ui/button";
import { TransitionItem } from "@/lib/types";

const AccountCard = () => {
  const { open } = useWeb3Modal();
  const { copy, isCopied, isSupported, error } = useClipboard();
  const { address, isConnected, isConnecting } = useAccount();
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
  const [transitions, setTransitions] = useState<TransitionItem[]>([]);

  // const { data: totalStakedDNA } = useReadTotalStakedDNA();

  const { data: multiplier } = useReadMultiplier();

  const { data: qDNAPerBlockWithOneStake } = useReadqDNAPerBlockWithOneStake();
  const qDNAPerHourWithOneStake = (
    (qDNAPerBlockWithOneStake ?? 0) *
    20 *
    60
  ).toFixed(2);

  const max = (multiplier ?? 0) * Number(stakedDNA ?? 0);

  const addTransition = (item: TransitionItem) => {
    setTransitions((preValue) => [item, ...preValue]);
  };

  const delTransition = (item: TransitionItem) => {
    setTransitions((preValue) =>
      preValue.filter((trans) => trans.hash != item.hash)
    );
  };

  if (!isConnected) {
    return (
      <div className="p-6 border-t-[1px] border-[#2C2C2D]">
        <Button
          onClick={() => {
            console.log("123");
            open();
          }}
          className="text-[#6349FF] bg-[rgba(99,73,255,0.2)] rounded-[6px] w-full h-[80px] text-[18px] uppercase"
        >
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </Button>
      </div>
    );
  }
  return (
    <div className="p-6 flex flex-col gap-5">
      <div className="text-xs flex flex-col gap-[1px] ">
        {transitions.map((item) => (
          <TransitionsItem
            key={item.hash}
            data={item}
            delTransition={delTransition}
          />
        ))}
        {/* <div className="flex items-center justify-between bg-[rgba(241,30,30,0.1)] p-[10px] text-[#F11E1E] rounded">
          88.8 QDNA 充值失败
          <SvgIcon name="close" className="w-[18px] h-[18px] cursor-pointer" />
        </div>
        <div className="flex items-center justify-between bg-[rgba(60,194,27,0.1)] p-[10px] text-[#3CC21B] rounded">
          88.8 QDNA 已充值成功
          <SvgIcon name="close" className="w-[18px] h-[18px] cursor-pointer" />
        </div> */}
      </div>
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
              <div className="flex items-center">
                <span>
                  +{qDNAPerHourWithOneStake}*{Number(stakedDNA).toFixed(2) ?? 0}
                  /hr
                </span>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="py-0 px-1 h-6 hover:bg-transparent"
                      >
                        <SvgIcon name="info" className="w-[14px]" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#CFCBFF] border-[0.5px] border-[#B3ABFF] max-w-[240px] text-[#0B080D] text-xs -ml-4">
                      tooltip
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
      <StakeUnStake addTransition={addTransition} />
    </div>
  );
};

const TransitionsItem = ({
  data,
  delTransition,
}: {
  data: TransitionItem;
  delTransition: (item: TransitionItem) => void;
}) => {
  const isStake = data.type === "stake";
  const { isPending, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: data.hash,
  });
  return (
    <div
      className={cn("flex items-center justify-between p-[10px]  rounded", {
        "bg-[rgba(255,255,255,0.05)] text-[#C6C6C6]": isPending,
        "bg-[rgba(60,194,27,0.1)] text-[#3CC21B]": isSuccess,
        "bg-[rgba(241,30,30,0.1)] text-[#F11E1E]": isError,
      })}
    >
      <span>
        {data.amount} QDNA{" "}
        {isPending
          ? "Processing…"
          : isSuccess
          ? `${isStake ? "Staked" : "UnStaked"} successfully`
          : `${isStake ? "Staking" : "UnStaking"} successfully`}
      </span>
      {!isPending && (
        <SvgIcon
          name="close"
          className="w-[18px] h-[18px] cursor-pointer"
          onClick={() => delTransition(data)}
        />
      )}
    </div>
  );
};

export default AccountCard;

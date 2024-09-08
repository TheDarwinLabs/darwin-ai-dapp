import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract } from "wagmi";
import { DNAStakeAbi } from "@/abi/DNAStake";
import { DNAStakeContract } from "@/lib/config";
import { ethers } from "ethers";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import SvgIcon from "@/components/SvgIcon";
import Decimal from "decimal.js";
import {
  useReadMultiplier,
  useReadqDNAPerBlockWithOneStake,
} from "@/hooks/useContractRead";
import { useToast } from "@/components/ui/use-toast";
import { useAccountData } from "@/context/AccountDataContext";
import { TransitionItem } from "@/lib/types";

const validNumberRegex = /^(?:\d+|\d*\.\d{0,18})$/;

interface StakeUnStakeProps {
  addTransition: (item: TransitionItem) => void;
}

export const StakeUnStake: React.FC<StakeUnStakeProps> = ({
  addTransition,
}) => {
  return (
    <div className="flex gap-5">
      <Stake addTransition={addTransition} />
      <UnStake addTransition={addTransition} />
    </div>
  );
};

const Stake: React.FC<StakeUnStakeProps> = ({ addTransition }) => {
  const { toast } = useToast();
  const {
    stakedDNA,
    preQDNA,
    formatBalance,
    refetchUserStakeInfo,
    showQDNAerror,
    setOpenQDNAerror,
  } = useAccountData();
  const { data: multiplier = 0 } = useReadMultiplier();
  const { data: qDNAPerBlockWithOneStake } = useReadqDNAPerBlockWithOneStake();
  const qDNAPerHourWithOneStake = (
    (qDNAPerBlockWithOneStake ?? 0) *
    20 *
    60
  ).toFixed(2);
  const balanceValue = formatBalance(8);
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const [deposit, setDeposit] = useState("");
  const [receive, setReceive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // updateReceive(deposit);
  }, [hash]);

  const stake = async () => {
    if (!deposit || Number(deposit) > Number(balanceValue)) {
      toast({
        title: "Your DNA balance is not enough to use this function.",
        // description: "",
        className:
          "bg-[rgba(20,20,20)] border-none text-[rgba(255,255,255,0.3)]",
      });
      return;
    }
    const hash = await writeContractAsync({
      address: DNAStakeContract,
      abi: DNAStakeAbi,
      functionName: "stake",
      value: ethers.parseEther(deposit),
    });
    addTransition({
      type: "stake",
      hash,
      amount: deposit,
      status: "Pending",
    });
    refetchUserStakeInfo();
    setOpen(false);
    setDeposit("");
    setReceive("");
  };

  const updateReceive = (value: string) => {
    if (value === "") {
      setReceive("");
    } else {
      try {
        const numericValue = new Decimal(value);
        setReceive(
          numericValue
            .times(multiplier)
            .toDecimalPlaces(8, Decimal.ROUND_DOWN)
            .toString()
        );
      } catch (error) {
        console.error("Invalid number input");
      }
    }
  };
  const handleDepositChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || validNumberRegex.test(value)) {
      setDeposit(value);
      updateReceive(value);
    }
  };
  const handleReceiveChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || validNumberRegex.test(value)) {
      setReceive(value);
      if (value === "") {
        setDeposit("");
      } else {
        try {
          const numericValue = new Decimal(value);
          setDeposit(
            numericValue
              .div(multiplier)
              .toDecimalPlaces(8, Decimal.ROUND_DOWN)
              .toString()
          );
        } catch (error) {
          console.error("Invalid number input");
        }
      }
    }
  };
  const handleAll = () => {
    setDeposit(balanceValue);
    updateReceive(balanceValue);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex-1 rounded-[6px] uppercase bg-[rgba(255,255,255,0.05)] text-[18px] w-full text-brand h-[48px] select-none">
            stake
          </Button>
        </DialogTrigger>
        <DialogContent
          className="bg-[#0B080D] p-[30px] border-none rounded-[6px] gap-[20px]"
          hideCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-[#E2E2E2] text-[36px] font-bold uppercase">
              stake
            </DialogTitle>
          </DialogHeader>
          <div>
            <div className="bg-stake bg-black p-5">
              <div className="flex justify-between text-xs">
                <span className="text-[rgba(255,255,255,0.3)]">
                  You deposit
                </span>
                <div className="text-brand flex items-center gap-1">
                  <SvgIcon name="dna" />
                  <span>DNA</span>
                </div>
              </div>
              <Input
                className="bg-transparent p-0 pt-5 pb-[6px] border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-brand font-bold h-auto text-[36px] leading-9 dna-selection"
                value={deposit}
                maxLength={15}
                onChange={handleDepositChange}
                placeholder="0"
              />
              <div className="text-xs text-[rgba(255,255,255,0.2)] flex items-center  gap-[6px]">
                <span>{balanceValue} DNA is available in wallet </span>
                <span
                  className="bg-[rgba(99,73,255,0.15)] leading-[18px] rounded text-brand px-[7px] cursor-pointer select-none"
                  onClick={handleAll}
                >
                  Stake All
                </span>
              </div>
            </div>
            <div className="bg-[rgba(255,255,255,0.08)] px-5 pt-5 pb-4">
              <div className="flex justify-between text-xs leading-5">
                <span className="text-[rgba(255,255,255,0.3)]">You</span>
                <div className="text-[rgba(255,151,31,0.8)] flex items-center gap-1">
                  <SvgIcon name="qdna" />
                  <span>QDNA</span>
                </div>
              </div>
              <div className="text-xs leading-5 text-[rgba(255,255,255,0.3)]">
                receive
              </div>
              <Input
                className="bg-transparent p-0 pt-5 pb-[6px] border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#FF971F] font-bold h-auto text-[36px] leading-9 qdna-selection"
                value={receive}
                maxLength={15}
                onChange={handleReceiveChange}
                placeholder="0"
              />
              <div className="text-xs text-[rgba(255,255,255,0.2)] flex items-center rounded gap-[6px]">
                <span>{preQDNA ?? 0}</span>
                <span>+{Number(receive).toFixed(8)}</span>
                <span>={(Number(preQDNA) + Number(receive)).toFixed(8)}</span>
              </div>
              <div className="bg-[rgba(255,255,255,0.05)] h-[1px] mt-5 mb-[10px]"></div>
              <div className="flex items-center justify-end gap-1 text-xs leading-5 text-[rgba(255,255,255,0.5)]">
                <span>QDNA Growth Rate</span>
                <span>
                  +{qDNAPerHourWithOneStake}*{stakedDNA ?? 0}/H
                </span>
                <SvgIcon name="info" className="w-[14px]" />
              </div>
            </div>
          </div>
          <DialogFooter className="!justify-normal mt-[10px] gap-5">
            <Button
              onClick={stake}
              type="submit"
              disabled={isPending}
              className="flex-1 py-4 text-brand bg-[rgba(255,255,255,0.08)] uppercase text-[18px] leading-7 font-bold h-auto"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              stake
            </Button>
            <DialogClose asChild>
              <Button
                disabled={isPending}
                className="flex-1  py-4 bg-[rgba(255,255,255,0.08)] text-[#C6C6C6] uppercase  text-[18px] font-bold  h-auto"
              >
                cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showQDNAerror} onOpenChange={setOpenQDNAerror}>
        <DialogContent
          className="bg-[#0B080D] p-[30px] border-none rounded-[6px] gap-[20px]"
          hideCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-[#E2E2E2] text-[36px] font-bold uppercase">
              Error
            </DialogTitle>
          </DialogHeader>
          <SvgIcon name="empty" className="w-[96px] h-[96px] mx-auto my-5" />
          <div className="text-[#C6C6C6] text-sm">
            Your QDNA balance is not enough to use this function. Please top up
            and use it
          </div>
          <DialogFooter className="!justify-normal mt-[10px] gap-5">
            <Button
              onClick={() => {
                setOpenQDNAerror(false);
                setOpen(true);
              }}
              type="submit"
              className="flex-1 py-4 text-brand bg-[rgba(99,73,255,0.1)] uppercase text-[18px] leading-7 font-bold h-auto"
            >
              stake
            </Button>
            <DialogClose asChild>
              <Button
                disabled={isPending}
                className="w-[120px] py-4 bg-[rgba(255,255,255,0.03)] text-[#C6C6C6] uppercase  text-[18px] font-bold  h-auto"
              >
                cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const UnStake: React.FC<StakeUnStakeProps> = ({ addTransition }) => {
  const { toast } = useToast();
  const { preQDNA, formatBalance, refetchUserStakeInfo } = useAccountData();
  const { data: multiplier = 1 } = useReadMultiplier();

  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const [withdraw, setWithdraw] = useState("");
  const [clear, setClear] = useState("");
  const [open, setOpen] = useState(false);
  const maxValue = new Decimal(preQDNA ?? 0)
    .div(multiplier)
    .toDecimalPlaces(8, Decimal.ROUND_DOWN)
    .toString();

  // useEffect(() => {
  //   updateClear(withdraw);
  // });

  const unStake = async () => {
    if (!withdraw || Number(withdraw) > Number(maxValue)) {
      toast({
        title: "Your Staked DNA is not enough to use this function.",
        // description: "",
        className:
          "bg-[rgba(20,20,20)] border-none text-[rgba(255,255,255,0.3)]",
      });
      return;
    }
    const hash = await writeContractAsync({
      address: DNAStakeContract,
      abi: DNAStakeAbi,
      functionName: "unStake",
      args: [ethers.parseEther(withdraw)],
    });
    addTransition({
      type: "unstake",
      hash,
      amount: withdraw,
      status: "Pending",
    });
    refetchUserStakeInfo();
    setOpen(false);
    setWithdraw("");
    setClear("");
  };

  const updateClear = (value: string) => {
    if (value === "") {
      setClear("");
    } else {
      try {
        const numericValue = new Decimal(value);
        setClear(
          numericValue
            .times(multiplier)
            .toDecimalPlaces(8, Decimal.ROUND_DOWN)
            .toString()
        );
      } catch (error) {
        console.error("Invalid number input");
      }
    }
  };

  const handleWithdrawChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || validNumberRegex.test(value)) {
      setWithdraw(value);
      updateClear(value);
    }
  };

  const handleClearChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || validNumberRegex.test(value)) {
      setClear(value);
      if (value === "") {
        setWithdraw("");
      } else {
        try {
          const numericValue = new Decimal(value);
          setWithdraw(
            numericValue
              .div(multiplier)
              .toDecimalPlaces(8, Decimal.ROUND_DOWN)
              .toString()
          );
        } catch (error) {
          console.error("Invalid number input");
        }
      }
    }
  };
  const handleAll = () => {
    setWithdraw(maxValue);
    updateClear(maxValue);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="bg-[rgba(255,255,255,0.05)] h-[48px] w-[48px]"
        >
          <MoreHorizontal className="h-5 w-5 text-[#989898]" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-[#0B080D] p-[30px] border-none rounded-[6px] gap-[20px]"
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-[#E2E2E2] text-[36px] font-bold uppercase">
            unstake
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className="bg-stake bg-black p-5">
            <div className="flex justify-between text-xs">
              <span className="text-[rgba(255,255,255,0.3)]">You withdraw</span>
              <div className="text-brand flex items-center gap-1">
                <SvgIcon name="dna" />
                <span>DNA</span>
              </div>
            </div>
            <Input
              className="bg-transparent p-0 pt-5 pb-[6px] border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-brand font-bold h-auto text-[36px] leading-9  dna-selection qdna-selection"
              value={withdraw}
              maxLength={15}
              onChange={handleWithdrawChange}
              placeholder="0"
            />
            <div className="text-xs text-[rgba(255,255,255,0.2)] flex items-center  gap-[6px]">
              <span>{maxValue} DNA is available </span>
              <span
                className="bg-[rgba(99,73,255,0.15)] leading-[18px] rounded text-brand px-[7px] cursor-pointer select-none"
                onClick={handleAll}
              >
                UnStake All
              </span>
            </div>
          </div>
          <div className="bg-[rgba(255,255,255,0.08)] px-5 pt-5 pb-4">
            <div className="flex justify-between text-xs leading-5">
              <span className="text-[rgba(255,255,255,0.3)]">You clear</span>
              <div className="text-[rgba(255,151,31,0.8)] flex items-center gap-1">
                <SvgIcon name="qdna" />
                <span>QDNA</span>
              </div>
            </div>
            <Input
              className="bg-transparent p-0 pt-5 pb-[6px] border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#FF971F] font-bold h-auto text-[36px] leading-9"
              value={clear}
              maxLength={15}
              onChange={handleClearChange}
              placeholder="0"
            />
            <div className="text-xs text-[rgba(255,255,255,0.2)] flex items-center rounded gap-[6px]">
              <span>{preQDNA ?? 0}</span>
              <span>-{Number(clear).toFixed(8)}</span>
              <span>={(Number(preQDNA) - Number(clear)).toFixed(8)}</span>
            </div>
            <div className="bg-[rgba(255,255,255,0.05)] h-[1px] mt-5 mb-[10px]"></div>
            <div className="flex items-center justify-end gap-1 text-xs leading-5 text-[rgba(255,255,255,0.5)]">
              Calculation Rules
            </div>
          </div>
        </div>
        <DialogFooter className="!justify-normal mt-[10px] gap-5">
          <Button
            onClick={unStake}
            type="submit"
            disabled={isPending}
            className="flex-1 py-4 text-brand bg-[rgba(255,255,255,0.08)] uppercase text-[18px] leading-7 font-bold h-auto"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            unstake
          </Button>
          <DialogClose asChild>
            <Button
              disabled={isPending}
              className="flex-1  py-4 bg-[rgba(255,255,255,0.08)] text-[#C6C6C6] uppercase  text-[18px] font-bold  h-auto"
            >
              cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

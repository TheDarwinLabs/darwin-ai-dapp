"use client";

import SvgIcon from "@/components/SvgIcon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { AccountCard } from "@/components/account-card";

export const SideBar = () => {
  const { address } = useAccount();

  return (
    <div className="fixed left-0 top-0 h-[100vh] flex flex-col w-[310px] bg-[#0B080D] ">
      <div className="grow">
        <div className="px-6 py-9 border-b-[1px] border-[#2C2C2D]">
          <SvgIcon name="logo" className="w-[262px] h-[28px]" />
        </div>
      </div>
      <div className="">
        {address ? <AccountCard /> : <ConnectButton />}
        <div className="flex gap-1 px-6 py-[30px] text-sm uppercase text-[#727272] border-t-[1px] border-[#2C2C2D]">
          <Link href="">Support</Link>
          <span>∙</span>
          <Link href="">FAQ</Link>
          <span>∙</span>
          <Link href="">Give Feedback</Link>
        </div>
      </div>
    </div>
  );
};

const ConnectButton = () => {
  const { isConnecting } = useAccount();
  const { open } = useWeb3Modal();

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
};

"use client";

import SvgIcon from "@/components/SvgIcon";
import Link from "next/link";
import dynamic from "next/dynamic";

const AccountCard = dynamic(() => import("./account-card"), { ssr: false });

export const SideBar = () => {
  return (
    <div className="fixed left-0 top-0 h-[100vh] flex flex-col w-[310px] bg-[#0B080D] ">
      <div className="">
        <div className="px-6 py-9 border-b-[1px] border-[#2C2C2D]">
          <SvgIcon name="logo" className="w-[262px] h-[28px]" />
        </div>
      </div>
      <div className="grow flex flex-col overflow-hidden">
        <AccountCard />
        <div className="flex gap-1 justify-center py-[30px] text-sm uppercase text-[#727272] border-t-[1px] border-[#2C2C2D]">
          <Link href="">Support</Link>
          <span>∙</span>
          <Link href="">FAQ</Link>
          <span>∙</span>
          <Link href="">Give Feedback</Link>
          <span>∙</span>
          <Link
            target="_blank"
            href="https://darwinchain.gitbook.io/darwin-ai/for-users/faucet"
            className="hover:underline"
          >
            Faucet
          </Link>
        </div>
      </div>
    </div>
  );
};
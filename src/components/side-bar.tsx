"use client";

import SvgIcon from "@/components/SvgIcon";
import Link from "next/link";
import dynamic from "next/dynamic";

const AccountCard = dynamic(() => import("./account-card"), { ssr: false });

export const SideBar = () => {
  return (
    <div className="fixed left-0 top-0 h-[100vh] flex flex-col w-[310px] bg-[#0B080D] ">
      <div className="grow">
        <div className="px-6 py-9 border-b-[1px] border-[#2C2C2D]">
          <SvgIcon name="logo" className="w-[262px] h-[28px]" />
        </div>
      </div>
      <div className="">
        <AccountCard />
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
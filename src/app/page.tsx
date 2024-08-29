"use client";

import { SideBar } from "@/components/side-bar";
import { Header } from "@/components/header";
import { Chat } from "@/components/chat";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] w-full ">
      <SideBar />
      <div className="flex-1 flex flex-col h-[100dvh] pl-[310px]">
        <Header />
        <Chat />
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "react-markdown";
import { cn, formatUnits, getOrCreateWallet, WalletInfo } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import SvgIcon from "@/components/SvgIcon";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { DNAStakeAbi } from "@/abi/DNAStake";
import { DNAStakeContract, ForwarderContract } from "@/lib/config";
import {
  SignTypedDataVersion,
  TypedDataUtils,
  type TypedMessage,
  type MessageTypes,
  signTypedData,
} from "@metamask/eth-sig-util";
import { bufferToHex, toBuffer } from "ethereumjs-util";

const EIP712DomainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const ForwardRequestType = [
  { name: "from", type: "address" },
  { name: "approval", type: "address" },
  { name: "to", type: "address" },
  { name: "queryHash", type: "bytes32" },
  { name: "value", type: "uint256" },
  { name: "nonce", type: "uint256" },
  { name: "data", type: "bytes" },
  { name: "validUntilTime", type: "uint256" },
];

const GENERIC_PARAMS =
  "address from,address approval,address to,uint256 value,uint256 nonce,bytes data,uint256 validUntilTime";

export const Chat = () => {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  useEffect(() => {
    const wallet = getOrCreateWallet();
    setWalletInfo(wallet);
  }, []);

  const { data: allowance } = useReadContract({
    abi: DNAStakeAbi,
    address: DNAStakeContract,
    functionName: "allowance",
    args: [address as `0x${string}`, walletInfo?.address ?? "0x"],
    query: {
      enabled: !!walletInfo?.address,
      select: (value) => Number(formatUnits(value)),
    },
  });

  const [input, setInput] = useState("");
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    handleInput();
  }, []);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
      setIsMultiline(textarea.scrollHeight > 44);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!isConnected || !address) {
      console.error("Please connect your wallet first.");
      return;
    }
    if ((allowance ?? 0) < 10000000) {
      await writeContractAsync({
        address: DNAStakeContract,
        abi: DNAStakeAbi,
        functionName: "approve",
        args: [walletInfo?.address ?? "0x", ethers.parseEther("1")],
      });
    }

    const query = "hello";
    const typeName: string = `ForwardRequest(${GENERIC_PARAMS})`;
    const typeHash: string = ethers.keccak256(ethers.toUtf8Bytes(typeName));
    const queryHash = ethers.keccak256(ethers.toUtf8Bytes(query));
    console.log("queryHash : ", queryHash);
    const data: TypedMessage<MessageTypes> = {
      domain: {
        name: "dapp.darwinchain.ai",
        version: "1",
        chainId: 610,
        verifyingContract: ForwarderContract,
      },
      primaryType: "ForwardRequest",
      types: {
        EIP712Domain: EIP712DomainType,
        ForwardRequest: ForwardRequestType,
      },
      message: {},
    };

    const iface = new ethers.Interface(DNAStakeAbi);
    const USER_ORIGIN_ADDRESS = address;
    const APPROVAL_ADDRESS = walletInfo?.address;
    const RECEIPENT_CONTRACT = DNAStakeContract;
    const func = iface.encodeFunctionData("consume", [USER_ORIGIN_ADDRESS]);

    //TODO 从合约获取nonce
    const nonce = 0;

    const req = {
      from: USER_ORIGIN_ADDRESS,
      approval: APPROVAL_ADDRESS,
      to: RECEIPENT_CONTRACT,
      queryHash: queryHash,
      value: 0,
      nonce: nonce,
      data: toBuffer(func),
      validUntilTime: 0,
    };

    const sig = signTypedData({
      privateKey: toBuffer(walletInfo?.privateKey),
      data: { ...data, message: req },
      version: SignTypedDataVersion.V4,
    });

    const domainSeparator = TypedDataUtils.hashStruct(
      "EIP712Domain",
      data.domain,
      data.types,
      SignTypedDataVersion.V4
    );
    console.log("domainSeparator: ", bufferToHex(domainSeparator));
    console.log("typeHash:", typeHash);
    console.log("sig:", sig);

    const chatBody = {
      query: query,
      signature: sig,
      nonce: nonce,
      ownerAddress: USER_ORIGIN_ADDRESS,
      delegate: APPROVAL_ADDRESS,
      domainSeparator: bufferToHex(domainSeparator),
      typeHash,
      data: func,
    };

    // await request.post("http://localhost:8002/chat", chatBody);

    // if (!input.trim()) return;
    // // createMessage(input);
    // setInput("");
    // setTimeout(() => {
    //   handleInput();
    // }, 0);
  };

  const msg = "Remove an element from an array in Swift";

  return (
    <div className=" flex flex-col flex-1 overflow-y-auto">
      <div className="grow flex flex-col items-start overflow-y-auto px-[120px] pt-[62px] ">
        <div className="px-[50px] pt-[50px] pb-10 bg-[#0B080D] rounded-md">
          <div className="flex items-center gap-[10px] mb-6">
            <div className="bg-[rgba(0,0,0,0.2)] w-[46px] h-[46px] border rounded-md"></div>
            <div className="flex-1">
              <div className=" font-bold text-[20px]">Llama 3.1</div>
              <div className="mt-[2px] text-[rgba(255,255,255,0.3)] text-[12px]">
                运营方 / 或一句话介绍
              </div>
            </div>
            <div className="p-[9px]">
              <SvgIcon name="mark" className="w-[18px]" />
            </div>
          </div>
          <div className="mb-8 text-[12px] text-[#727272] leading-5">
            OpenAI
            最强大的模型。在定量问题（数学和物理）、创意写作和许多其他具有挑战性的任务中比
            GPT-3.5 更强大。由 GPT-4o
            提供支持。上下文窗口已缩短，以优化速度和成本。如需更长的上下文消息，请尝试
            GPT-4o-128k。OpenAI
            最强大的模型。在定量问题（数学和物理）、创意写作和许多其他具有挑战性的任务中比
            GPT-3.5 更强大。由 GPT-4o
            提供支持。上下文窗口已缩短，以优化速度和成本。如需更长的上下文消息，请尝试
            GPT-4o-128k。
          </div>
          <div className="flex items-center text-[12px] text-[#727272] gap-1">
            <span>token * 100 消耗</span>
            <SvgIcon name="qdna" />
            <span className="text-[rgba(255,151,31,0.8)]">QDNA * 100</span>
          </div>
        </div>
        <div className="mt-10 self-end inline-block bg-[rgba(99,73,255,0.1)] py-6 px-[30px] rounded-md text-[18px] leading-6 text-primary-700">
          <Markdown>{msg}</Markdown>
        </div>
        <div className="mt-10 items-end inline-block bg-[rgba(99,73,255,0.1)] py-6 px-[30px] rounded-md text-[18px] leading-6 text-primary-700">
          <Markdown>{msg}</Markdown>
        </div>
        <div className="mt-10 items-end inline-block bg-[rgba(99,73,255,0.1)] py-6 px-[30px] rounded-md text-[18px] leading-6 text-primary-700">
          <Markdown>{msg}</Markdown>
        </div>
      </div>
      <div className="bg-[rgba(0,0,0,0.9)] py-[60px] px-[120px]">
        <div
          className={cn(
            "border-[2px] rounded-md flex p-[10px] border-[#2C2C2D] gap-[10px] focus-within:border-[2px] focus-within:border-[#2C2172] group",
            isMultiline ? "items-end" : "items-center"
          )}
          onClick={() => textareaRef.current?.focus()}
        >
          <Textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInput(e.target.value)}
            className={cn(
              "flex-1 bg-[rgba(0,0,0,0.9)] border-none leading-6 box-border outline-none rounded-none resize-none max-h-[160px] overflow-y-auto scrollbar-y-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[18px] text-brand placeholder:text-[#2C2C2D] focus:placeholder:text-primary group"
            )}
            placeholder="Type your message here.."
            style={{
              height: "auto",
              minHeight: "28px",
            }}
          />
          <Button
            className=" h-[60px] w-[147px] uppercase text-brand bg-[rgba(255,255,255,0.1)] text-[18px] font-bold group-focus:bg-blue-500 focus-within:bg-[rgba(99,73,255,0.3)]"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleSendMessage();
            }}
          >
            submit
          </Button>
        </div>
      </div>
    </div>
  );
};

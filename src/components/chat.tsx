"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "react-markdown";
import {
  cn,
  formatUnits,
  getOrCreateWallet,
  shortenHash,
  WalletInfo,
} from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import SvgIcon from "@/components/SvgIcon";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { DNAStakeAbi } from "@/abi/DNAStake";
import { ForwarderAbi } from "@/abi/Forwarder";

import { DNAStakeContract, ForwarderContract } from "@/lib/config";
import {
  SignTypedDataVersion,
  TypedDataUtils,
  type TypedMessage,
  type MessageTypes,
  signTypedData,
} from "@metamask/eth-sig-util";
import { bufferToHex, toBuffer } from "ethereumjs-util";
import { fetchEventSourceWrapper } from "@/services/api/fetchEventSource";
import { Loader2 } from "lucide-react";
import LoadingDots from "./LoadingDots";
import { fetcher } from "@/services/api/fetcher";
import { useAccountData } from "@/context/AccountDataContext";

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
  "address from,address approval,address to,bytes32 queryHash,uint256 value,uint256 nonce,bytes data,uint256 validUntilTime";

export type Message = {
  id: string;
  request: string;
  response: string;
  loading?: boolean;
  finishReason?: string;
  txHash?: string;
  QDNA?: string;
};

type MessageResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  done: boolean;
  finish_reason: string;
  choices: Array<{
    index: number;
    delta: {
      role: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
  usage?: any;
  txHash?: string;
  QDNA?: string;
};

export const Chat = () => {
  const { address, isConnected } = useAccount();
  const { setOpenQDNAerror } = useAccountData();
  const { data: hash, writeContractAsync } = useWriteContract();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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

  const { data: nonce, refetch: refetchNonce } = useReadContract({
    abi: ForwarderAbi,
    address: ForwarderContract,
    functionName: "getNonce",
    args: [walletInfo?.address ?? "0x"],
    query: {
      enabled: !!walletInfo?.address,
      select: (value) => Number(formatUnits(value, 0)),
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
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
    return () => clearTimeout(timer);
  };

  const genMessage = async (msgText: string = input) => {
    if (!isConnected || !address) {
      console.error("Please connect your wallet first.");
      return;
    }
    if (!msgText.trim()) return;
    setLoading(true);
    if ((allowance ?? 0) < 10000) {
      try {
        await writeContractAsync({
          address: DNAStakeContract,
          abi: DNAStakeAbi,
          functionName: "approve",
          args: [
            walletInfo?.address ?? "0x",
            ethers.parseEther("999999999999999"),
          ],
        });
      } catch (error) {
        setLoading(false);
      }
    }
    const { data: newNonce } = await refetchNonce();
    const query = msgText;
    setInput("");
    setTimeout(() => {
      handleInput();
    }, 0);
    const typeName: string = `ForwardRequest(${GENERIC_PARAMS})`;
    const typeHash: string = ethers.keccak256(ethers.toUtf8Bytes(typeName));
    const queryHash = ethers.keccak256(ethers.toUtf8Bytes(query));
    console.log("queryHash : ", queryHash);
    const data: TypedMessage<MessageTypes> = {
      domain: {
        name: "https://dapp.darwinchain.ai",
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
    const req = {
      from: USER_ORIGIN_ADDRESS,
      approval: APPROVAL_ADDRESS,
      to: RECEIPENT_CONTRACT,
      queryHash: queryHash,
      value: 0,
      nonce: newNonce,
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

    const chatBody = {
      query: query,
      queryHash: queryHash,
      signature: sig,
      nonce: nonce,
      ownerAddress: USER_ORIGIN_ADDRESS,
      delegate: APPROVAL_ADDRESS,
      domainSeparator: bufferToHex(domainSeparator),
      typeHash,
      data: func,
    };

    return chatBody;
  };

  const handleSendMessage = async (msgText?: string) => {
    const chatBody = await genMessage(msgText);
    if (!chatBody) {
      setLoading(false);
      return;
    }
    let mid = "temp";
    const newMessage = {
      id: mid,
      request: chatBody.query,
      response: "",
      loading: true,
    };
    setMessages((prevMessages) => {
      return [...(prevMessages ?? []), newMessage];
    });

    scrollToBottom();
    fetchEventSourceWrapper(`chat`, {
      body: chatBody,
      onmessage: (ev: any) => {
        try {
          const { id, choices, done, finish_reason, txHash, QDNA } = JSON.parse(
            ev.data
          ) as MessageResponse;
          if (id) {
            mid = id;
          }
          if (!!choices?.length) {
            const { delta, finish_reason } = choices[0];
            if (
              finish_reason &&
              [
                "stop",
                "Insufficient QDNA",
                "Insufficient authorization QDNA",
                "Signature verification failed",
              ].includes(finish_reason)
            ) {
              setMessages((prevMessages) => {
                if (prevMessages?.length) {
                  const index = prevMessages.findIndex(
                    (message) => message.id === mid
                  );
                  const updatedMessages = [...prevMessages];
                  updatedMessages[index] = {
                    ...updatedMessages[index],
                    loading: false,
                    finishReason: finish_reason,
                  };
                  return updatedMessages;
                }
                return prevMessages;
              });
              setLoading(false);
            } else if (delta.content) {
              setMessages((prevMessages) => {
                if (prevMessages?.length) {
                  const index = prevMessages.findIndex(
                    (message) => message.id === mid
                  );
                  const updatedMessages = [...prevMessages];
                  updatedMessages[index] = {
                    ...updatedMessages[index],
                    response:
                      (updatedMessages[index]?.response ?? "") + delta.content,
                  };
                  return updatedMessages;
                }
                return prevMessages;
              });
            } else if (delta.role) {
              setMessages((prevMessages) => {
                if (prevMessages?.length) {
                  const index = prevMessages.findIndex(
                    (message) => message.id === "temp"
                  );
                  const updatedMessages = [...prevMessages];
                  updatedMessages[index] = {
                    ...updatedMessages[index],
                    id: mid,
                  };
                  return updatedMessages;
                }
                return prevMessages;
              });
            }
          } else if (done) {
            setMessages((prevMessages) => {
              if (prevMessages?.length) {
                const index = prevMessages.findIndex(
                  (message) => message.id === mid
                );
                const updatedMessages = [...prevMessages];
                updatedMessages[index] = {
                  ...updatedMessages[index],
                  loading: false,
                  finishReason: finish_reason,
                  txHash: txHash ?? "",
                  QDNA: QDNA ? formatUnits(QDNA) : "",
                };
                return updatedMessages;
              }
              return prevMessages;
            });
          }
          scrollToBottom();
        } catch (error) {
          if (ev.data == "[DONE]") {
            setLoading(false);
            setMessages((prevMessages) => {
              if (prevMessages?.length) {
                const index = prevMessages.findIndex(
                  (message) => message.id === mid
                );
                const updatedMessages = [...prevMessages];
                updatedMessages[index] = {
                  ...updatedMessages[index],
                  loading: false,
                };
                return updatedMessages;
              }
              return prevMessages;
            });
          }
          scrollToBottom();
        }
      },
      onerror: (err: any) => {
        console.log(err);
        setLoading(false);
      },
    });
  };

  return (
    <>
      <div className="grow px-[120px] pt-[62px] ">
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
        {messages?.map((msg) => {
          return (
            <div key={msg.id} className="flex flex-col items-start">
              <div className="mt-10 max-w-[90%] self-end inline-block bg-[rgba(99,73,255,0.1)] py-6 px-[30px] rounded-md text-[18px] leading-6 text-primary-700">
                <Markdown>{msg.request}</Markdown>
              </div>
              <div className="inline-flex flex-col gap-[10px] mt-10 max-w-[90%]  py-6 px-[30px] rounded-md text-[18px] leading-6 text-[#F2F2F2] text-sm ">
                <div className="flex gap-[10px] items-center">
                  <div className="bg-[#6054AA] w-6 h-6 rounded-full"></div>
                  <span className="text-base">Llama 3.1</span>
                </div>
                <div className="bg-[#0B080D] py-6 px-[30px]">
                  {msg.response ? (
                    <Markdown className="">{msg.response}</Markdown>
                  ) : msg.loading ? (
                    <LoadingDots />
                  ) : null}
                </div>
                {!msg.loading && (
                  <div className="flex items-center flex-wrap gap-1 text-[#989898]">
                    <SvgIcon name="qdna" />
                    QDNA <span>{msg.QDNA}</span> ∙
                    {msg.finishReason != "stop" && (
                      <span className="uppercase text-[rgba(255,151,31,0.8)]">
                        {msg.finishReason},
                        <span
                          className="cursor-pointer"
                          onClick={() => handleSendMessage(msg.request)}
                        >
                          Try again
                        </span>
                        {` ∙ `}
                      </span>
                    )}
                    {msg.txHash && (
                      <span>HASH {shortenHash(msg.txHash)} ∙</span>
                    )}
                    <span
                      className="text-brand cursor-pointer"
                      onClick={() => handleSendMessage(msg.request)}
                    >
                      RETRY
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className=" sticky bottom-0 bg-[rgba(0,0,0,0.99)] py-[60px] px-[120px]">
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
            className={cn(
              "h-[60px] w-[147px] uppercase  bg-[rgba(255,255,255,0.1)] text-[18px] font-bold focus:text-brand focus:bg-[rgba(99,73,255,0.3)]",
              isFocused ? "text-brand bg-[rgba(99,73,255,0.3)]" : ""
            )}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              handleSendMessage();
            }}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            submit
          </Button>
        </div>
      </div>
    </>
  );
};

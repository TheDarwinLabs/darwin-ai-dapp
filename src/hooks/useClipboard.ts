import { useState } from "react";

interface UseClipboardOptions {
  copiedDuring?: number;
}

export function useClipboard({
  copiedDuring = 1500,
}: UseClipboardOptions = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 检查是否支持 Clipboard API
  const isSupported =
    typeof navigator !== "undefined" && "clipboard" in navigator;

  const copy = async (text: string) => {
    if (!isSupported) {
      fallbackCopyToClipboard(text);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuring);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to copy text: ", err);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuring);
    } catch (err) {
      setError(err as Error);
      console.error("Fallback: Failed to copy text: ", err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return { isCopied, copy, error, isSupported };
}

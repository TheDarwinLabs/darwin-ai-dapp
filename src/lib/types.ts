export interface TransitionItem {
  type: "stake" | "unstake";
  hash: `0x${string}`;
  amount: string;
  status: "Pending" | "Successful" | "Failed";
}

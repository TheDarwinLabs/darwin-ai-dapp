declare interface NodeRequire {
  context: (
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ) => {
    keys: () => string[];
    (id: string): { default: string | ComponentType<{ className?: string }> };
  };
}

declare module "ethereumjs-util" {
  export function bufferToHex(buffer: Buffer): string;
  export function toBuffer(input: any): Buffer;
}
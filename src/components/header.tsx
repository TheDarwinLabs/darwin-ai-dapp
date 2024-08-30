"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SvgIcon from "./SvgIcon";
import { Button } from "./ui/button";

export const Header = () => {
  const list = [
    { name: "Llama 3.0" },
    { name: "Llama 2.0" },
    { name: "Llama 1" },
  ];
  return (
    <div className="bg-[rgba(0,0,0,0.99)] py-10 sticky top-0 flex items-center px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center font-bold select-none cursor-pointer gap-2">
            Llama 3.1
            <SvgIcon name="arrow" className="w-[24px] h-[24px]" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[rgba(23,23,23,0.9)] text-white border-none mt-4 py-1">
          {list.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="relative flex items-center px-6 py-4 focus:bg-[rgba(0,0,0,0.2)] focus:text-white cursor-pointer"
            >
              <span className="w-[80px]">{item.name}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="py-0 h-6 hover:bg-transparent"
                    >
                      <SvgIcon name="info" className="w-6 h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

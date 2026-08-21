"use client";

import * as React from "react";
import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-9 w-9 cursor-pointer" })}>
        <Palette className="h-[1.2rem] w-[1.2rem] text-muted-foreground hover:text-foreground transition-colors" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Default (Light) {theme === "light" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Default (Dark) {theme === "dark" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("apple")}>
          Apple {theme === "apple" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("spotify")}>
          Spotify {theme === "spotify" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("airtable")}>
          Airtable {theme === "airtable" && "✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="h-16 border-b bg-card flex items-center px-6 md:hidden">
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
      </Button>
      <h1 className="ml-4 text-xl font-bold">NextFleet</h1>
    </header>
  );
}

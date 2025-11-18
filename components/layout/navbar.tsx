"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 border-b bg-card flex items-center px-6 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <VisuallyHidden>
            <SheetTitle>Sidebar</SheetTitle>
          </VisuallyHidden>
          <Sidebar mobile />
        </SheetContent>
      </Sheet>
      <h1 className="ml-4 text-xl font-bold">NextFleet</h1>
    </header>
  );
}

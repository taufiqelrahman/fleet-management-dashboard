"use client";

import { useSession } from "next-auth/react";
import type { Role, User } from "@/lib/types";

export function useRole() {
  const { data: session } = useSession();

  const role = (session?.user as User)?.role as Role | undefined;
  const isAdmin = role === "ADMIN";
  const isOperator = role === "OPERATOR";

  return {
    role,
    isAdmin,
    isOperator,
    canEdit: isAdmin,
    canDelete: isAdmin,
    canCreate: isAdmin,
  };
}

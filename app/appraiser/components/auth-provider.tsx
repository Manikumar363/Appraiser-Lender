"use client"

import { AuthProvider } from "../../../hooks/use-auth"
import type { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export function AppAuthProvider({ children }: Props) {
  return <AuthProvider>{children}</AuthProvider>
}

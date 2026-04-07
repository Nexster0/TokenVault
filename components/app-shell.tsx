'use client'

import { WalletProvider } from '@/lib/wallet-context'
import { Header } from '@/components/header'
import { AriaWidget } from '@/components/aria-widget'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <Header />
      {children}
      <AriaWidget />
    </WalletProvider>
  )
}

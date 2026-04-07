'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Wallet, Menu, X, Zap, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWallet, truncateAddress } from '@/lib/wallet-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const NAV_LINKS = [
  { href: '/', label: 'Marketplace' },
  { href: '/add-asset', label: 'Add Asset' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/admin', label: 'Admin' },
]

export function Header() {
  const pathname = usePathname()
  const { connected, publicKey, connecting, connect, disconnect, balance, isMockMode } = useWallet()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleConnect = async () => {
    await connect()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Token<span className="text-primary">Vault</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Devnet badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Devnet
            </span>

            {/* Wallet button */}
            {connected && publicKey ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-3 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm">
                  <span className={cn('h-2 w-2 rounded-full', isMockMode ? 'bg-amber-400' : 'bg-primary')} />
                  <span className="font-mono text-xs text-foreground">{truncateAddress(publicKey)}</span>
                  {balance !== null && <span className="text-xs text-muted-foreground">◎ {balance.toFixed(2)} SOL</span>}
                  {isMockMode && <span className="text-[10px] text-amber-400 font-medium">DEMO</span>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDisconnect}
                  className="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive/20"
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={connecting}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
              >
                <Wallet className="h-4 w-4" />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
          {connected && publicKey && (
            <div className="mt-2 flex items-center gap-2 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="font-mono text-xs text-muted-foreground">{truncateAddress(publicKey)}</span>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

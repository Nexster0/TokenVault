'use client'

import { AssetCard } from '@/components/asset-card'
import { useAssetStore } from '@/lib/asset-store'
import { ArrowRight, Shield, Coins, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Shield,
    title: 'Tokenize',
    description:
      'Real-world assets — properties, businesses, equipment — are legally structured and represented as tokens on the Solana blockchain.',
  },
  {
    step: '02',
    icon: Coins,
    title: 'Invest',
    description:
      'Browse the marketplace, connect your Phantom wallet, and purchase tokens in any asset for as little as $1. Own a fraction of high-value assets.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Earn',
    description:
      'Receive on-chain yield distributions monthly. Watch your portfolio grow with rental income, business profits, and asset appreciation.',
  },
]

export default function MarketplacePage() {
  const assets = useAssetStore((s) => s.assets)
  
  const scrollToMarketplace = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })
  }
  
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(0,200,150,0.07)_0%,_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Live on Solana Devnet
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
              Invest in Real-World Assets{' '}
              <span className="text-primary">On-Chain</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Tokenize and trade fractional ownership in real estate, businesses, and equipment.
              Earn real yield, paid monthly, directly to your wallet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/add-asset"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Tokenize an Asset
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#marketplace"
                onClick={scrollToMarketplace}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Browse Assets
              </a>
            </div>
            {/* Stats bar */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div>
                <p className="text-2xl font-bold text-foreground">$430K</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Asset Value</p>
              </div>
              <div className="border-l border-border pl-8">
                <p className="text-2xl font-bold text-foreground">218K</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tokens Sold</p>
              </div>
              <div className="border-l border-border pl-8">
                <p className="text-2xl font-bold text-primary">7.8%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg. APY</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace grid */}
      <section id="marketplace" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Live Assets</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {assets.length} assets available for investment
          </p>
          </div>
          <Link
            href="/add-asset"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            List an asset
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Three simple steps to start earning from real-world assets on Solana.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="relative flex flex-col items-center text-center gap-4 p-6 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors">
                <div className="absolute -top-3 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                  {step}
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 TokenVault. Built on Solana Devnet.
          </p>
          <p className="text-xs text-muted-foreground">
            For demonstration purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </main>
  )
}

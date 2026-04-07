'use client'

import Link from 'next/link'
import { MapPin, TrendingUp, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import type { Asset } from '@/lib/assets'

interface AssetCardProps {
  asset: Asset
}

const TYPE_COLORS: Record<string, string> = {
  'Real Estate': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Art: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Equipment: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Business: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

export function AssetCard({ asset }: AssetCardProps) {
  const progressPct = Math.round((asset.raised / asset.totalValueUsd) * 100)
  const remaining = asset.totalValueUsd - asset.raised

  return (
    <article className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-secondary">
        <img
          src={asset.image}
          alt={`${asset.name} in ${asset.location}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <span
          className={`absolute top-3 left-3 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[asset.type] ?? 'bg-secondary text-foreground border-border'}`}
        >
          {asset.type}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-foreground text-balance leading-snug">{asset.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {asset.location}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary p-3">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Value</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              ${(asset.totalValueUsd / 1000).toFixed(0)}K
            </p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Per Token</p>
            <p className="mt-0.5 flex items-center justify-center gap-0.5 text-sm font-bold text-foreground">
              <Coins className="h-3 w-3 text-primary" />
              ${asset.pricePerToken}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">APY</p>
            <p className="mt-0.5 flex items-center justify-center gap-0.5 text-sm font-bold text-primary">
              <TrendingUp className="h-3 w-3" />
              {asset.apy}%
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              ${formatNumber(asset.raised)} raised
            </span>
            <span className="font-semibold text-primary">{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            ${formatNumber(remaining)} remaining of ${formatNumber(asset.totalValueUsd)}
          </p>
        </div>

        {/* CTA */}
        <Link href={`/asset/${asset.id}`} className="mt-auto">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
            Buy Tokens
          </Button>
        </Link>
      </div>
    </article>
  )
}

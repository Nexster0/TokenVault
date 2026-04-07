'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Building2,
  Palette,
  Wrench,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AssetType, Asset } from '@/lib/assets'
import { useAssetStore } from '@/lib/asset-store'
import { toast } from 'sonner'
import Link from 'next/link'

const ASSET_TYPES: { type: AssetType; icon: React.ElementType; color: string }[] = [
  { type: 'Real Estate', icon: Building2, color: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
  { type: 'Art', icon: Palette, color: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
  { type: 'Equipment', icon: Wrench, color: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  { type: 'Business', icon: Briefcase, color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
]

export default function AddAssetPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const addAsset = useAssetStore((s) => s.addAsset)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    type: '' as AssetType | '',
    location: '',
    valuation: '',
    tokens: '',
    description: '',
    yield: '',
    imageFile: null as File | null,
    imagePreview: '',
  })

  const pricePerToken =
    form.valuation && form.tokens
      ? (parseFloat(form.valuation) / parseFloat(form.tokens)).toFixed(4)
      : ''

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, imageFile: file, imagePreview: url }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.type || !form.location || !form.valuation || !form.tokens || !form.description) {
      toast.error('Missing fields', { description: 'Please fill in all required fields.' })
      return
    }
    setSubmitting(true)
    // Simulate blockchain tokenization
    await new Promise((r) => setTimeout(r, 2500))
    const assetId = form.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36)
    const fakeMint = Math.random().toString(36).slice(2, 10).toUpperCase()
    
    // Create the new asset and add to store
    const newAsset: Asset = {
      id: assetId,
      name: form.name,
      type: form.type as AssetType,
      location: form.location,
      totalValueUsd: parseFloat(form.valuation),
      totalTokens: parseFloat(form.tokens),
      pricePerToken: parseFloat(pricePerToken),
      apy: form.yield ? parseFloat(form.yield) : 7.5,
      raised: 0,
      description: form.description,
      image: form.imagePreview || `https://picsum.photos/seed/${assetId}/800/500`,
      documents: [],
      tags: [form.type as string],
    }
    addAsset(newAsset)
    
    setSubmitting(false)
    setSubmitted(true)
    toast.success('Asset tokenized!', {
      description: `Token mint: ${fakeMint}. Your asset is now live on Devnet.`,
    })
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-primary/30 bg-card p-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center border border-primary/30">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Asset Tokenized!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">{form.name}</strong> has been successfully tokenized on
            Solana Devnet. Your asset tokens are now available in the marketplace.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              href="/"
              className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors text-center"
            >
              View Marketplace
            </Link>
            <Button
              onClick={() => { setSubmitted(false); setForm({ name: '', type: '', location: '', valuation: '', tokens: '', description: '', yield: '', imageFile: null, imagePreview: '' }) }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Add Another
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Marketplace</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Tokenize Asset</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tokenize an Asset</h1>
          <p className="mt-2 text-muted-foreground">
            Convert your real-world asset into on-chain tokens and open it to global investors.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Asset Type <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ASSET_TYPES.map(({ type, icon: Icon, color }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, type }))}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all text-sm font-medium ${
                    form.type === type
                      ? color
                      : 'border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">
                Asset Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="asset-name"
                placeholder="e.g. Downtown Office Building"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. Almaty, Kazakhstan"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Valuation & Tokens */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valuation">
                Total Valuation (USD) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="valuation"
                type="number"
                min={1000}
                placeholder="e.g. 100000"
                value={form.valuation}
                onChange={(e) => set('valuation', e.target.value)}
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokens">
                Number of Tokens <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tokens"
                type="number"
                min={100}
                placeholder="e.g. 100000"
                value={form.tokens}
                onChange={(e) => set('tokens', e.target.value)}
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price-per-token">
                Price per Token (auto)
              </Label>
              <Input
                id="price-per-token"
                readOnly
                value={pricePerToken ? `$${pricePerToken}` : ''}
                placeholder="Auto-calculated"
                className="bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          {/* Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yield">
                Expected Annual Yield (%)
              </Label>
              <Input
                id="yield"
                type="number"
                step={0.1}
                min={0}
                max={100}
                placeholder="e.g. 8.5"
                value={form.yield}
                onChange={(e) => set('yield', e.target.value)}
                className="bg-secondary border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the asset, its revenue model, and why investors should be interested..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              className="bg-secondary border-border focus:border-primary resize-none"
            />
          </div>

          {/* Image upload */}
          <div className="space-y-3">
            <Label>Asset Image</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary hover:border-primary/50 hover:bg-secondary/80 cursor-pointer transition-all min-h-[160px] overflow-hidden"
            >
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="Preview" className="h-full w-full object-cover max-h-52" />
              ) : (
                <div className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Click to upload image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Submitting this form will simulate a token minting transaction on Solana Devnet. 
              No real funds are used. In production, this would call the TokenVault smart contract 
              to create a verified SPL token.
            </p>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 text-base gap-2"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                Tokenizing Asset...
              </>
            ) : (
              'Tokenize Asset'
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}

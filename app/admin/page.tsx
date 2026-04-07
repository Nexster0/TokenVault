'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus, FileCheck, Coins, Shield, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@/lib/wallet-context'
import {
  initializeAsset,
  verifyAsset,
  depositYield,
  hashDocument,
  PROGRAM_ID,
} from '@/lib/anchor'
import { DEMO_ASSETS } from '@/lib/assets'
import { formatNumber } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Admin wallet — only this wallet can access admin functions
// Replace with your actual admin wallet address
const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || ''

type Tab = 'create' | 'verify' | 'yield' | 'assets'

export default function AdminPage() {
  const { connected, publicKey, connect, connecting } = useWallet()
  const [activeTab, setActiveTab] = useState<Tab>('create')

  // Create Asset form state
  const [createForm, setCreateForm] = useState({
    assetId: '',
    name: '',
    totalValue: '',
    totalTokens: '',
  })
  const [creating, setCreating] = useState(false)

  // Verify Asset form state
  const [verifyForm, setVerifyForm] = useState({
    assetId: '',
    file: null as File | null,
  })
  const [verifying, setVerifying] = useState(false)

  // Deposit Yield form state
  const [yieldForm, setYieldForm] = useState({
    assetId: '',
    amount: '',
  })
  const [depositing, setDepositing] = useState(false)

  const isAdmin = publicKey && (ADMIN_WALLET === '' || publicKey === ADMIN_WALLET)

  const handleCreateAsset = async () => {
    if (!connected) { await connect(); return }
    if (!createForm.assetId || !createForm.name || !createForm.totalValue || !createForm.totalTokens) {
      toast.error('All fields are required')
      return
    }
    setCreating(true)
    toast.info('Initializing asset on Solana...', { id: 'create-pending' })
    try {
      const signature = await initializeAsset(
        createForm.assetId,
        createForm.name,
        parseInt(createForm.totalValue),
        parseInt(createForm.totalTokens)
      )
      toast.dismiss('create-pending')
      toast.success('Asset created!', {
        description: (
          <span>
            TX: {signature.slice(0, 8)}...{' '}
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              View on Explorer
            </a>
          </span>
        ),
      })
      setCreateForm({ assetId: '', name: '', totalValue: '', totalTokens: '' })
    } catch (err: any) {
      toast.dismiss('create-pending')
      toast.error('Failed to create asset', { description: err.message })
    } finally {
      setCreating(false)
    }
  }

  const handleVerifyAsset = async () => {
    if (!connected) { await connect(); return }
    if (!verifyForm.assetId || !verifyForm.file) {
      toast.error('Asset ID and document are required')
      return
    }
    setVerifying(true)
    toast.info('Hashing document & verifying on-chain...', { id: 'verify-pending' })
    try {
      const docHash = await hashDocument(verifyForm.file)
      const signature = await verifyAsset(verifyForm.assetId, docHash)
      toast.dismiss('verify-pending')
      toast.success('Asset verified!', {
        description: (
          <span>
            Document hash recorded. TX: {signature.slice(0, 8)}...{' '}
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              View
            </a>
          </span>
        ),
      })
      setVerifyForm({ assetId: '', file: null })
    } catch (err: any) {
      toast.dismiss('verify-pending')
      toast.error('Verification failed', { description: err.message })
    } finally {
      setVerifying(false)
    }
  }

  const handleDepositYield = async () => {
    if (!connected) { await connect(); return }
    if (!yieldForm.assetId || !yieldForm.amount) {
      toast.error('Asset ID and amount are required')
      return
    }
    setDepositing(true)
    toast.info('Depositing yield on-chain...', { id: 'yield-pending' })
    try {
      const signature = await depositYield(yieldForm.assetId, parseInt(yieldForm.amount))
      toast.dismiss('yield-pending')
      toast.success('Yield deposited!', {
        description: (
          <span>
            TX: {signature.slice(0, 8)}...{' '}
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              View on Explorer
            </a>
          </span>
        ),
      })
      setYieldForm({ assetId: '', amount: '' })
    } catch (err: any) {
      toast.dismiss('yield-pending')
      toast.error('Deposit failed', { description: err.message })
    } finally {
      setDepositing(false)
    }
  }

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setVerifyForm((prev) => ({ ...prev, file }))
    } else {
      toast.error('Please upload a PDF document')
    }
  }, [])

  if (!connected) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Admin Access Required</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your admin wallet to access asset management, verification, and yield distribution.
          </p>
          <Button
            onClick={connect}
            disabled={connecting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11"
          >
            {connecting ? 'Connecting...' : 'Connect Admin Wallet'}
          </Button>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-card p-10 text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Unauthorized</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your wallet is not authorized for admin access. Please connect with the admin wallet.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">Back to Marketplace</Button>
          </Link>
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
          <span className="text-foreground">Admin Panel</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Program: <span className="font-mono text-xs">{PROGRAM_ID.toString().slice(0, 16)}...</span>
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Admin Connected</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-px overflow-x-auto">
          {[
            { id: 'create' as Tab, label: 'Create Asset', icon: Plus },
            { id: 'verify' as Tab, label: 'Verify Asset', icon: FileCheck },
            { id: 'yield' as Tab, label: 'Deposit Yield', icon: Coins },
            { id: 'assets' as Tab, label: 'All Assets', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {activeTab === 'create' && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Initialize New Asset</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a new asset account on-chain for tokenization.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset ID</Label>
                  <Input
                    placeholder="e.g. almaty-tower-01"
                    value={createForm.assetId}
                    onChange={(e) => setCreateForm({ ...createForm, assetId: e.target.value })}
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Asset Name</Label>
                  <Input
                    placeholder="e.g. Almaty Business Tower"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="bg-secondary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Total Value (USD cents)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50000000"
                      value={createForm.totalValue}
                      onChange={(e) => setCreateForm({ ...createForm, totalValue: e.target.value })}
                      className="bg-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Tokens</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 10000"
                      value={createForm.totalTokens}
                      onChange={(e) => setCreateForm({ ...createForm, totalTokens: e.target.value })}
                      className="bg-secondary"
                    />
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCreateAsset}
                disabled={creating}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11"
              >
                {creating ? 'Creating...' : 'Initialize Asset On-Chain'}
              </Button>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Verify Asset</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a PDF document and record its SHA256 hash on-chain.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset ID</Label>
                  <Input
                    placeholder="e.g. almaty-tower-01"
                    value={verifyForm.assetId}
                    onChange={(e) => setVerifyForm({ ...verifyForm, assetId: e.target.value })}
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proof Document (PDF)</Label>
                  <div
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                      verifyForm.file
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    )}
                  >
                    {verifyForm.file ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileCheck className="h-8 w-8 text-primary" />
                        <p className="font-medium text-foreground">{verifyForm.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(verifyForm.file.size / 1024).toFixed(1)} KB
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVerifyForm({ ...verifyForm, file: null })}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop PDF or{' '}
                          <label className="text-primary cursor-pointer hover:underline">
                            browse
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setVerifyForm({ ...verifyForm, file })
                              }}
                            />
                          </label>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleVerifyAsset}
                disabled={verifying || !verifyForm.file}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11"
              >
                {verifying ? 'Verifying...' : 'Verify & Record Hash On-Chain'}
              </Button>
            </div>
          )}

          {activeTab === 'yield' && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-foreground">Deposit Yield</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Deposit yield (in lamports) for an asset to distribute to token holders.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset ID</Label>
                  <Input
                    placeholder="e.g. almaty-tower-01"
                    value={yieldForm.assetId}
                    onChange={(e) => setYieldForm({ ...yieldForm, assetId: e.target.value })}
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (lamports)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1000000000"
                    value={yieldForm.amount}
                    onChange={(e) => setYieldForm({ ...yieldForm, amount: e.target.value })}
                    className="bg-secondary"
                  />
                  {yieldForm.amount && (
                    <p className="text-xs text-muted-foreground">
                      = {(parseInt(yieldForm.amount) / 1_000_000_000).toFixed(4)} SOL
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleDepositYield}
                disabled={depositing}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11"
              >
                {depositing ? 'Depositing...' : 'Deposit Yield On-Chain'}
              </Button>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-bold text-foreground">All Assets</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Assets loaded from demo data. Connect to Supabase for live data.
                </p>
              </div>
              <div className="divide-y divide-border">
                {DEMO_ASSETS.map((asset) => (
                  <div
                    key={asset.id}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-secondary/30 transition-colors"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-secondary">
                        <img src={asset.image} alt={asset.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{asset.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground text-sm">${formatNumber(asset.totalValueUsd)}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(asset.totalTokens)} tokens</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary text-sm">{asset.apy}% APY</p>
                      <p className="text-xs text-muted-foreground">${asset.pricePerToken}/token</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/15 text-primary border border-primary/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

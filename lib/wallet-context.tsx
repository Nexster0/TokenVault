'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { toast } from 'sonner'

const DEVNET_RPC = clusterApiUrl('devnet')
const DEVNET_CONNECTION = new Connection(DEVNET_RPC, 'confirmed')

// In v0 preview, Phantom cannot inject into the iframe.
// Enable mock mode for UI testing; real wallet works when deployed.
const ENABLE_MOCK_WALLET = typeof window !== 'undefined' && !window.opener && window.self === window.top === false

interface WalletContextType {
  connected: boolean
  publicKey: string | null
  connecting: boolean
  balance: number | null
  connect: () => Promise<void>
  disconnect: () => void
  connection: Connection
  isMockMode: boolean
}

const WalletContext = createContext<WalletContextType>({
  connected: false,
  publicKey: null,
  connecting: false,
  balance: null,
  connect: async () => {},
  disconnect: () => {},
  connection: DEVNET_CONNECTION,
  isMockMode: false,
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)

  const fetchBalance = useCallback(async (pubkey: string) => {
    try {
      const pk = new PublicKey(pubkey)
      const lamports = await DEVNET_CONNECTION.getBalance(pk)
      setBalance(lamports / LAMPORTS_PER_SOL)
    } catch (err) {
      console.log('[v0] Failed to fetch balance:', err)
      setBalance(null)
    }
  }, [])

  useEffect(() => {
    // Check if we're in an iframe (v0 preview) where Phantom can't inject
    const inIframe = typeof window !== 'undefined' && window.self !== window.top
    
    const phantom = (window as any)?.solana
    console.log('[v0] Wallet init - inIframe:', inIframe, 'phantom:', !!phantom, 'isPhantom:', phantom?.isPhantom)
    
    if (!phantom?.isPhantom) {
      if (inIframe) {
        console.log('[v0] Running in iframe - Phantom cannot inject here. Mock mode available.')
      }
      return
    }

    // Check for existing connection
    if (phantom.isConnected && phantom.publicKey) {
      const address = phantom.publicKey.toString()
      console.log('[v0] Phantom already connected:', address)
      setConnected(true)
      setPublicKey(address)
      fetchBalance(address)
    }

    // Listen for wallet events
    const handleConnect = (pk: PublicKey) => {
      const address = pk.toString()
      console.log('[v0] Phantom connected event:', address)
      setConnected(true)
      setPublicKey(address)
      fetchBalance(address)
    }

    const handleDisconnect = () => {
      console.log('[v0] Phantom disconnected')
      setConnected(false)
      setPublicKey(null)
      setBalance(null)
    }

    phantom.on('connect', handleConnect)
    phantom.on('disconnect', handleDisconnect)

    return () => {
      phantom.off?.('connect', handleConnect)
      phantom.off?.('disconnect', handleDisconnect)
    }
  }, [fetchBalance])

  const connect = useCallback(async () => {
    const phantom = (window as any)?.solana
    const inIframe = typeof window !== 'undefined' && window.self !== window.top
    
    console.log('[v0] Connect attempt - phantom:', !!phantom, 'isPhantom:', phantom?.isPhantom, 'inIframe:', inIframe)
    
    if (!phantom?.isPhantom) {
      if (inIframe) {
        // In iframe, offer mock mode for testing
        toast.info('Preview Mode', {
          description: 'Phantom cannot connect in the v0 preview. Using demo wallet for testing.',
          duration: 5000,
        })
        // Simulate connection with a mock devnet address
        const mockAddress = 'DemoW4LLet1111111111111111111111111111111'
        setConnected(true)
        setPublicKey(mockAddress)
        setBalance(10.5) // Mock balance
        setIsMockMode(true)
        return
      }
      // Not in iframe, prompt to install Phantom
      toast.error('Phantom not found', {
        description: 'Please install Phantom wallet extension.',
        action: {
          label: 'Install',
          onClick: () => window.open('https://phantom.app/', '_blank'),
        },
      })
      return
    }

    setConnecting(true)
    try {
      // First try to reconnect if already trusted (no popup)
      try {
        const eager = await phantom.connect({ onlyIfTrusted: true })
        if (eager?.publicKey) {
          const address = eager.publicKey.toString()
          setConnected(true)
          setPublicKey(address)
          setIsMockMode(false)
          await fetchBalance(address)
          toast.success('Wallet connected!', {
            description: `Connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
          })
          setConnecting(false)
          return
        }
      } catch {
        // Not trusted yet, will need user approval
      }

      // Request connection with user approval
      const resp = await phantom.connect()
      const address = resp.publicKey.toString()
      setConnected(true)
      setPublicKey(address)
      setIsMockMode(false)
      await fetchBalance(address)
      toast.success('Wallet connected!', {
        description: `Connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
      })
    } catch (err: any) {
      const msg = err?.message || ''
      // Handle specific Phantom errors
      if (err.code === 4001 || msg.includes('rejected')) {
        toast.error('Connection rejected', { description: 'You rejected the connection request.' })
      } else if (msg.includes('Unexpected error')) {
        // This error often means popup was blocked or Phantom is in a bad state
        toast.error('Phantom connection issue', {
          description: 'Please open Phantom extension manually, unlock it, and try again. If popup was blocked, allow popups for this site.',
          duration: 8000,
        })
      } else if (msg.includes('User rejected')) {
        toast.error('Connection cancelled', { description: 'You closed the Phantom popup.' })
      } else {
        toast.error('Connection failed', { description: msg || 'Unknown error occurred' })
      }
    } finally {
      setConnecting(false)
    }
  }, [fetchBalance])

  const disconnect = useCallback(async () => {
    console.log('[v0] Disconnecting wallet...')
    if (!isMockMode) {
      await (window as any)?.solana?.disconnect()
    }
    setConnected(false)
    setPublicKey(null)
    setBalance(null)
    setIsMockMode(false)
    toast.info('Wallet disconnected')
  }, [isMockMode])

  return (
    <WalletContext.Provider value={{ 
      connected, 
      publicKey, 
      connecting, 
      balance, 
      connect, 
      disconnect, 
      connection: DEVNET_CONNECTION,
      isMockMode,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() { return useContext(WalletContext) }

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

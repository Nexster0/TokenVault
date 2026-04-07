'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Asset, PortfolioHolding, Transaction } from './assets'
import { DEMO_ASSETS, MOCK_PORTFOLIO, MOCK_TRANSACTIONS } from './assets'

interface AssetStore {
  assets: Asset[]
  portfolio: PortfolioHolding[]
  transactions: Transaction[]
  addAsset: (asset: Asset) => void
  addToPortfolio: (holding: PortfolioHolding) => void
  addTransaction: (tx: Transaction) => void
  getAssetById: (id: string) => Asset | undefined
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      assets: [...DEMO_ASSETS],
      portfolio: [...MOCK_PORTFOLIO],
      transactions: [...MOCK_TRANSACTIONS],

      addAsset: (asset) =>
        set((state) => ({
          assets: [asset, ...state.assets],
        })),

      addToPortfolio: (holding) =>
        set((state) => {
          const existing = state.portfolio.find((h) => h.assetId === holding.assetId)
          if (existing) {
            return {
              portfolio: state.portfolio.map((h) =>
                h.assetId === holding.assetId
                  ? { ...h, tokensOwned: h.tokensOwned + holding.tokensOwned }
                  : h
              ),
            }
          }
          return { portfolio: [...state.portfolio, holding] }
        }),

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
        })),

      getAssetById: (id) => get().assets.find((a) => a.id === id),
    }),
    {
      name: 'tokenvault-storage',
    }
  )
)

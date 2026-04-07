export type AssetType = 'Real Estate' | 'Art' | 'Equipment' | 'Business'

export interface Asset {
  id: string
  name: string
  type: AssetType
  location: string
  totalValueUsd: number
  totalTokens: number
  pricePerToken: number
  apy: number
  raised: number
  description: string
  image: string
  documents: { name: string; url: string }[]
  tags: string[]
}

export const DEMO_ASSETS: Asset[] = [
  {
    id: 'almaty-apartment',
    name: 'Luxury Apartment Complex',
    type: 'Real Estate',
    location: 'Almaty, Kazakhstan',
    totalValueUsd: 100000,
    totalTokens: 100000,
    pricePerToken: 1,
    apy: 7.2,
    raised: 63000,
    description:
      'A premium residential apartment complex in the heart of Almaty, Kazakhstan\'s largest city. The property features 24 modern units across 6 floors, with amenities including underground parking, a gym, and a rooftop terrace. Rental income is distributed monthly to token holders.',
    image: 'https://picsum.photos/seed/almaty-apt/800/500',
    documents: [
      { name: 'Property Deed', url: '#' },
      { name: 'Valuation Report', url: '#' },
      { name: 'Rental Agreement', url: '#' },
    ],
    tags: ['Residential', 'Rental Income', 'Central Location'],
  },
  {
    id: 'astana-coffee',
    name: 'Aroma Coffee House',
    type: 'Business',
    location: 'Astana, Kazakhstan',
    totalValueUsd: 50000,
    totalTokens: 10000,
    pricePerToken: 5,
    apy: 9.1,
    raised: 38500,
    description:
      'A thriving specialty coffee shop located in Astana\'s bustling Esil district. Established in 2019, the business has maintained consistent revenue growth of 18% YoY. Token holders earn a proportional share of monthly net profits. The shop also operates a wholesale roasting operation supplying local hotels.',
    image: 'https://picsum.photos/seed/astana-coffee/800/500',
    documents: [
      { name: 'Business License', url: '#' },
      { name: 'Audited Financials', url: '#' },
      { name: 'Revenue Projections', url: '#' },
    ],
    tags: ['F&B', 'High Yield', 'Growing Revenue'],
  },
  {
    id: 'aktobe-farmland',
    name: 'Grain Farmland Portfolio',
    type: 'Real Estate',
    location: 'Aktobe Region, Kazakhstan',
    totalValueUsd: 200000,
    totalTokens: 100000,
    pricePerToken: 2,
    apy: 6.5,
    raised: 91000,
    description:
      'A 1,200-hectare portfolio of productive grain farmland in the fertile Aktobe region. The land is leased to a certified agribusiness operator under a 10-year agreement. Yield is driven by wheat and barley harvests, with land appreciation providing additional long-term upside. Ideal for inflation-protected returns.',
    image: 'https://picsum.photos/seed/aktobe-farm/800/500',
    documents: [
      { name: 'Land Title', url: '#' },
      { name: 'Lease Agreement', url: '#' },
      { name: 'Soil Quality Report', url: '#' },
    ],
    tags: ['Agriculture', 'Long-term Lease', 'Inflation Hedge'],
  },
  {
    id: 'shymkent-trucks',
    name: 'Commercial Truck Fleet',
    type: 'Equipment',
    location: 'Shymkent, Kazakhstan',
    totalValueUsd: 80000,
    totalTokens: 8000,
    pricePerToken: 10,
    apy: 8.3,
    raised: 52800,
    description:
      'A fleet of 12 heavy-duty commercial trucks operating logistics routes across southern Kazakhstan and into Uzbekistan. The fleet is managed by a licensed logistics company under a revenue-sharing model. All vehicles are 2021-2023 models, regularly maintained and fully insured. Token holders receive monthly distributions from freight revenue.',
    image: 'https://picsum.photos/seed/shymkent-truck/800/500',
    documents: [
      { name: 'Fleet Registration', url: '#' },
      { name: 'Insurance Certificates', url: '#' },
      { name: 'Logistics Contract', url: '#' },
    ],
    tags: ['Logistics', 'Monthly Payouts', 'Cross-border'],
  },
]

export interface PortfolioHolding {
  assetId: string
  tokensOwned: number
  purchasePrice: number
  purchaseDate: string
}

export const MOCK_PORTFOLIO: PortfolioHolding[] = [
  { assetId: 'almaty-apartment', tokensOwned: 500, purchasePrice: 1, purchaseDate: '2024-11-15' },
  { assetId: 'astana-coffee', tokensOwned: 100, purchasePrice: 5, purchaseDate: '2024-12-03' },
  { assetId: 'shymkent-trucks', tokensOwned: 20, purchasePrice: 10, purchaseDate: '2025-01-22' },
]

export interface Transaction {
  id: string
  assetId: string
  assetName: string
  type: 'BUY' | 'YIELD'
  tokens: number
  amountUsd: number
  solAmount: number
  date: string
  txHash: string
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    assetId: 'almaty-apartment',
    assetName: 'Luxury Apartment Complex',
    type: 'BUY',
    tokens: 500,
    amountUsd: 500,
    solAmount: 3.2,
    date: '2024-11-15',
    txHash: '5xQ...mK9',
  },
  {
    id: 'tx2',
    assetId: 'astana-coffee',
    assetName: 'Aroma Coffee House',
    type: 'BUY',
    tokens: 100,
    amountUsd: 500,
    solAmount: 3.2,
    date: '2024-12-03',
    txHash: '9aR...pL2',
  },
  {
    id: 'tx3',
    assetId: 'almaty-apartment',
    assetName: 'Luxury Apartment Complex',
    type: 'YIELD',
    tokens: 0,
    amountUsd: 3,
    solAmount: 0.019,
    date: '2024-12-31',
    txHash: '3bN...xW7',
  },
  {
    id: 'tx4',
    assetId: 'shymkent-trucks',
    assetName: 'Commercial Truck Fleet',
    type: 'BUY',
    tokens: 20,
    amountUsd: 200,
    solAmount: 1.28,
    date: '2025-01-22',
    txHash: '7fG...tY4',
  },
  {
    id: 'tx5',
    assetId: 'astana-coffee',
    assetName: 'Aroma Coffee House',
    type: 'YIELD',
    tokens: 0,
    amountUsd: 3.79,
    solAmount: 0.024,
    date: '2025-01-31',
    txHash: '1hJ...kZ6',
  },
]

export const SOL_PRICE_USD = 156.42

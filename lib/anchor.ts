import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Program, AnchorProvider, BN, type Idl } from '@coral-xyz/anchor'
import IDL from '@/idl/propchain.json'

// Program ID from your deployed contract
export const PROGRAM_ID = new PublicKey('AChm6qgo74Fe5jDVokJj9Nyz16shZdFZsYuL4GM5ocjf')

// Platform wallet that receives payments (set this to your devnet wallet)
export const PLATFORM_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_PLATFORM_WALLET || '11111111111111111111111111111111'
)

// Devnet connection
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

// Get Anchor provider from Phantom wallet
export function getProvider(): AnchorProvider | null {
  if (typeof window === 'undefined') return null
  const phantom = (window as any)?.solana
  if (!phantom?.isPhantom || !phantom.isConnected) return null

  return new AnchorProvider(
    connection,
    phantom,
    { preflightCommitment: 'confirmed' }
  )
}

// Get program instance
export function getProgram(): Program | null {
  const provider = getProvider()
  if (!provider) return null
  return new Program(IDL as Idl, provider)
}

// Derive AssetAccount PDA: seeds = ["asset", asset_id]
export function getAssetPDA(assetId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('asset'), Buffer.from(assetId)],
    PROGRAM_ID
  )
}

// Derive UserState PDA: seeds = ["user", user_pubkey, asset_id]
export function getUserStatePDA(userPubkey: PublicKey, assetId: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), userPubkey.toBuffer(), Buffer.from(assetId)],
    PROGRAM_ID
  )
}

// ====== INSTRUCTION FUNCTIONS ======

// Initialize a new asset (admin only)
export async function initializeAsset(
  assetId: string,
  name: string,
  totalValue: number,
  totalTokens: number
): Promise<string> {
  const program = getProgram()
  if (!program) throw new Error('Wallet not connected')

  const [assetPDA] = getAssetPDA(assetId)
  const authority = program.provider.publicKey

  const tx = await program.methods
    .initializeAsset(assetId, name, new BN(totalValue), new BN(totalTokens))
    .accounts({
      asset: assetPDA,
      authority,
    })
    .rpc()

  return tx
}

// Verify an asset with document hash (admin only)
export async function verifyAsset(
  assetId: string,
  docHash: Uint8Array
): Promise<string> {
  const program = getProgram()
  if (!program) throw new Error('Wallet not connected')

  const [assetPDA] = getAssetPDA(assetId)

  const tx = await program.methods
    .verifyAsset(Array.from(docHash))
    .accounts({
      asset: assetPDA,
      authority: program.provider.publicKey,
    })
    .rpc()

  return tx
}

// Buy fractions of an asset
export async function buyFraction(
  assetId: string,
  tokenAmount: number
): Promise<string> {
  const program = getProgram()
  if (!program) throw new Error('Wallet not connected')

  const buyer = program.provider.publicKey
  const [assetPDA] = getAssetPDA(assetId)
  const [userStatePDA] = getUserStatePDA(buyer, assetId)

  const tx = await program.methods
    .buyFraction(new BN(tokenAmount))
    .accounts({
      asset: assetPDA,
      userState: userStatePDA,
      buyer,
      platformWallet: PLATFORM_WALLET,
    })
    .rpc()

  return tx
}

// Deposit yield into an asset (admin only)
export async function depositYield(
  assetId: string,
  amount: number
): Promise<string> {
  const program = getProgram()
  if (!program) throw new Error('Wallet not connected')

  const [assetPDA] = getAssetPDA(assetId)

  const tx = await program.methods
    .depositYield(new BN(amount))
    .accounts({
      asset: assetPDA,
      authority: program.provider.publicKey,
    })
    .rpc()

  return tx
}

// Claim yield for a specific asset
export async function claimYield(assetId: string): Promise<string> {
  const program = getProgram()
  if (!program) throw new Error('Wallet not connected')

  const user = program.provider.publicKey
  const [assetPDA] = getAssetPDA(assetId)
  const [userStatePDA] = getUserStatePDA(user, assetId)

  // Yield vault is typically another PDA or a token account
  // For now using asset PDA as the vault (adjust based on your contract)
  const tx = await program.methods
    .claimYield()
    .accounts({
      asset: assetPDA,
      userState: userStatePDA,
      user,
      yieldVault: assetPDA, // Adjust this based on your contract's yield vault
    })
    .rpc()

  return tx
}

// ====== READ FUNCTIONS ======

// Fetch asset account data
export async function fetchAsset(assetId: string) {
  const program = getProgram()
  if (!program) return null

  const [assetPDA] = getAssetPDA(assetId)
  try {
    const account = await program.account.assetAccount.fetch(assetPDA)
    return {
      assetId: account.assetId,
      name: account.name,
      authority: account.authority.toString(),
      totalValue: (account.totalValue as BN).toNumber(),
      totalTokens: (account.totalTokens as BN).toNumber(),
      tokensSold: (account.tokensSold as BN).toNumber(),
      isVerified: account.isVerified,
      docHash: account.docHash,
      totalYieldDeposited: (account.totalYieldDeposited as BN).toNumber(),
      yieldPerToken: (account.yieldPerToken as BN).toNumber(),
    }
  } catch {
    return null
  }
}

// Fetch user state for a specific asset
export async function fetchUserState(userPubkey: PublicKey, assetId: string) {
  const program = getProgram()
  if (!program) return null

  const [userStatePDA] = getUserStatePDA(userPubkey, assetId)
  try {
    const account = await program.account.userState.fetch(userStatePDA)
    return {
      user: account.user.toString(),
      assetId: account.assetId,
      tokensOwned: (account.tokensOwned as BN).toNumber(),
      yieldClaimed: (account.yieldClaimed as BN).toNumber(),
      lastClaimTimestamp: (account.lastClaimTimestamp as BN).toNumber(),
    }
  } catch {
    return null
  }
}

// Generate SHA256 hash for document verification
export async function hashDocument(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return new Uint8Array(hashBuffer)
}

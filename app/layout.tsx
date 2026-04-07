import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/app-shell'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'TokenVault — Solana RWA Tokenization Platform',
  description: 'Tokenize and invest in real-world assets on the Solana blockchain. Earn yield from real estate, equipment, and more.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <AppShell>
          {children}
        </AppShell>
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#161b27',
              border: '1px solid #1e2a3e',
              color: '#e8eaf0',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>

    </html>
  )
}

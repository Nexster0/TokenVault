'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Sparkles, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { DEMO_ASSETS } from '@/lib/assets'

type Message = {
  id: string
  role: 'assistant' | 'user'
  content: string
  quickReplies?: string[]
}

const LESSONS = [
  { id: 1, title: 'What is a property token?', duration: '2 min', completed: true },
  { id: 2, title: 'How rental income works', duration: '3 min', completed: true },
  { id: 3, title: 'Understanding Yield Strip', duration: '3 min', completed: false },
  { id: 4, title: 'Secure token storage', duration: '2 min', completed: false },
  { id: 5, title: 'How to sell tokens', duration: '2 min', completed: false },
]

function getContextualGreeting(pathname: string): Message {
  const assetMatch = pathname.match(/\/asset\/(.+)/)
  
  if (assetMatch) {
    const assetId = assetMatch[1]
    const asset = DEMO_ASSETS.find(a => a.id === assetId)
    if (asset) {
      const monthlyYield = ((asset.pricePerToken * 1000 * asset.apy) / 100 / 12).toFixed(2)
      return {
        id: 'greeting',
        role: 'assistant',
        content: `Hi! I see you're looking at **${asset.name}**. If you invest $${(asset.pricePerToken * 1000).toLocaleString()} (1,000 tokens), you'd earn approximately **$${monthlyYield}/month** at ${asset.apy}% APY. Want me to explain the risks or help you calculate a different amount?`,
        quickReplies: ['Explain the risks', 'Calculate for $500', 'What is Yield Strip?'],
      }
    }
  }
  
  if (pathname === '/portfolio') {
    return {
      id: 'greeting',
      role: 'assistant',
      content: `Welcome to your portfolio! Your next yield payment is estimated around **$23.40** on May 1st. Would you like tips on how to increase your passive income?`,
      quickReplies: ['How to increase yield', 'Explain my holdings', 'Claim all pending'],
    }
  }
  
  if (pathname === '/add-asset') {
    return {
      id: 'greeting',
      role: 'assistant',
      content: `Ready to tokenize an asset? I can guide you through the process step by step. The platform supports real estate, businesses, and equipment. What type of asset would you like to list?`,
      quickReplies: ['Real estate', 'Business', 'Equipment'],
    }
  }
  
  // Default marketplace greeting
  const topYieldAsset = DEMO_ASSETS.reduce((a, b) => a.apy > b.apy ? a : b)
  return {
    id: 'greeting',
    role: 'assistant',
    content: `Hi! I'm **Aria**, your investment guide. Today's highest yield is **${topYieldAsset.name}** at **${topYieldAsset.apy}% APY**. Want me to show you the details or help you compare assets?`,
    quickReplies: ['Show top yields', 'How does this work?', 'What is APY?'],
  }
}

const MOCK_RESPONSES: Record<string, string> = {
  'explain the risks': `Every investment carries risk. For real estate tokens, key risks include:\n\n• **Market risk** — property values can decline\n• **Liquidity risk** — tokens may be hard to sell quickly\n• **Tenant risk** — vacancies affect rental income\n• **Smart contract risk** — bugs in code\n\nThe risk score on each asset card summarizes these factors. Scores above 70 are considered lower risk.`,
  'what is yield strip?': `**Yield Strip** is an advanced feature that lets you separate your token into two parts:\n\n• **PT (Principal Token)** — represents ownership of the asset\n• **YT (Yield Token)** — represents 12 months of rental income\n\nYou can sell the YT to get cash now while keeping the PT for long-term ownership. It's like selling future rent in advance. Want me to show you an example?`,
  'how does this work?': `Here's how TokenVault works in 3 steps:\n\n1. **Browse** — Find assets on the marketplace with transparent yields and risk scores\n2. **Invest** — Connect your Phantom wallet and buy tokens (as little as $1)\n3. **Earn** — Receive monthly yield payments directly to your wallet\n\nAll assets are legally structured and verified on-chain. Would you like to see available assets?`,
  'what is apy?': `**APY (Annual Percentage Yield)** is the total return you'd earn in one year, including compound interest.\n\nFor example, if an asset has 7% APY and you invest $1,000:\n• You'd earn ~$70/year\n• Or about $5.83/month\n\nOur APY is based on historical rental income and projected returns.`,
  'show top yields': `Here are today's highest-yielding assets:\n\n1. **Aroma Coffee House** — 9.1% APY (Business)\n2. **Commercial Truck Fleet** — 8.3% APY (Equipment)\n3. **Luxury Apartment Complex** — 7.2% APY (Real Estate)\n\nHigher yields often come with higher risk. Want me to explain the trade-offs?`,
  'calculate for $500': `For a **$500 investment** at 7.2% APY:\n\n• Monthly income: **$3.00**\n• Annual income: **$36.00**\n• You'd own 500 tokens (0.5% of the asset)\n\nWant me to run numbers for a different amount?`,
  'how to increase yield': `Here are 3 ways to boost your portfolio yield:\n\n1. **Diversify** — Add higher-APY assets like businesses\n2. **Compound** — Reinvest your monthly payouts\n3. **Yield Strip** — Sell future yield (YT) and reinvest principal\n\nYour current portfolio averages ~4.8% APY. Adding some business tokens could push that to 6%+.`,
}

function getMockResponse(input: string): string {
  const lowerInput = input.toLowerCase()
  
  for (const [key, response] of Object.entries(MOCK_RESPONSES)) {
    if (lowerInput.includes(key) || key.includes(lowerInput.slice(0, 10))) {
      return response
    }
  }
  
  // Default response
  return `That's a great question! While I'm in demo mode, I can help with:\n\n• Explaining risks and yields\n• Understanding Yield Strip\n• Calculating investment returns\n• Navigating the platform\n\nTry asking "What is APY?" or "Explain the risks" to see how I can help!`
}

export function AriaWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'risk' | 'learn'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset greeting when pathname changes
  useEffect(() => {
    setMessages([getContextualGreeting(pathname)])
  }, [pathname])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      inputRef.current?.focus()
    }
  }, [isOpen, activeTab])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700))

    const response = getMockResponse(content)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
    }
    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }, [])

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl',
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open AI assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300',
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              A
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Aria</p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">online</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'chat' as const, label: 'Chat', icon: MessageCircle },
            { id: 'risk' as const, label: 'Risk', icon: ShieldCheck },
            { id: 'learn' as const, label: 'Learn', icon: GraduationCap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors',
                activeTab === id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="flex h-full flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-foreground rounded-bl-md'
                      )}
                    >
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br />')
                      }} />
                    </div>
                  </div>
                ))}
                
                {/* Quick replies */}
                {messages[messages.length - 1]?.quickReplies && !isTyping && (
                  <div className="flex flex-wrap gap-2">
                    {messages[messages.length - 1].quickReplies!.map((reply) => (
                      <button
                        key={reply}
                        onClick={() => handleQuickReply(reply)}
                        className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="border-t border-border p-3">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Aria anything..."
                    className="flex-1 bg-secondary border-0 text-sm"
                    disabled={isTyping}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="p-4 space-y-4">
              <div className="text-center py-4">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-4 border-emerald-500">
                  <span className="text-3xl font-bold text-emerald-500">74</span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">Portfolio Risk Score</p>
                <p className="text-xs text-muted-foreground">Lower risk than 68% of investors</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Tenant Quality', score: 85, color: 'bg-emerald-500' },
                  { label: 'Liquidity', score: 45, color: 'bg-amber-500' },
                  { label: 'Oracle Health', score: 80, color: 'bg-emerald-500' },
                  { label: 'Holder Distribution', score: 60, color: 'bg-amber-500' },
                ].map(({ label, score, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground">{score}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className={cn('h-full rounded-full', color)} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">AI Summary:</strong> Your portfolio has good tenant quality but lower liquidity. Consider diversifying into more traded assets for easier exit options.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'learn' && (
            <div className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Complete lessons to earn NFT badges</p>
              {LESSONS.map((lesson) => (
                <button
                  key={lesson.id}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    lesson.completed
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border hover:border-primary/30 hover:bg-primary/5'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                      lesson.completed ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {lesson.completed ? '✓' : lesson.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

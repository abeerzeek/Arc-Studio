import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Shield } from 'lucide-react'
import { AgentCard } from './components/AgentCard'
import { RegisterAgent } from './components/RegisterAgent'
import { PaymentDemo } from './components/PaymentDemo'
import { ReputationPanel } from './components/ReputationPanel'

const ARC_TESTNET_CHAIN_ID = 5042002
const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const

const AGENT_URI = `${window.location.origin}/agent-registration.json`

const identityAbi = [
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export default function App() {
  const { address, isConnected } = useAccount()
  const [registeredAgentId, setRegisteredAgentId] = useState<bigint | null>(null)
  const [activeTab, setActiveTab] = useState<'register' | 'pay' | 'reputation'>('register')

  const { data: totalSupply } = useReadContract({
    address: IDENTITY_REGISTRY,
    abi: identityAbi,
    functionName: 'totalSupply',
    chainId: ARC_TESTNET_CHAIN_ID,
  })

  const tabs = [
    { id: 'register' as const, label: 'Register' },
    { id: 'pay' as const, label: 'x402 Demo' },
    { id: 'reputation' as const, label: 'Reputation' },
  ]

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'var(--bg-gradient)' }}
    >
      {/* Header */}
      <header
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        className="backdrop-blur-md sticky top-0 z-10"
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              style={{ background: 'linear-gradient(135deg, #acc6e9 0%, #122d45 100%)' }}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
            >
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="display font-bold text-sm leading-tight" style={{ color: 'var(--ink)' }}>
                Arc Agent
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                ERC-8004 + x402
              </p>
            </div>
          </div>
          <ConnectKitButton />
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-5">
        {/* Hero */}
        <div className="text-center pt-2 pb-1">
          <h1
            className="display font-bold text-3xl mb-2"
            style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}
          >
            Onchain Agent Identity
          </h1>
          <p className="text-sm max-w-xs mx-auto text-pretty" style={{ color: 'var(--muted)' }}>
            Register on ERC-8004, accept USDC payments via x402, and build onchain reputation — all on Arc Testnet.
          </p>
          {totalSupply !== undefined && (
            <p className="mono text-xs mt-2 tabular-nums" style={{ color: 'var(--subtle)' }}>
              {totalSupply.toString()} agents registered on Arc Testnet
            </p>
          )}
        </div>

        {/* Agent identity card */}
        <AgentCard
          agentId={registeredAgentId}
          owner={isConnected ? (address ?? null) : null}
          agentURI={AGENT_URI}
          loading={false}
        />

        {/* Tabs */}
        <div
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          className="rounded-2xl p-1.5 flex gap-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'register' && (
          <RegisterAgent
            onRegistered={(agentId) => {
              setRegisteredAgentId(agentId)
              setActiveTab('pay')
            }}
            alreadyRegisteredId={registeredAgentId}
          />
        )}

        {activeTab === 'pay' && <PaymentDemo agentId={registeredAgentId} />}

        {activeTab === 'reputation' && <ReputationPanel agentId={registeredAgentId} />}

        {/* Setup instructions */}
        <div
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          className="rounded-2xl p-5"
        >
          <p className="display font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>
            Setup & Testing
          </p>
          <ol className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
            <li className="flex gap-2">
              <span className="mono font-bold flex-shrink-0" style={{ color: 'var(--ink-2)' }}>1.</span>
              <span>Get testnet USDC from the <strong>Get test USDC</strong> button in the Arc Studio sidebar.</span>
            </li>
            <li className="flex gap-2">
              <span className="mono font-bold flex-shrink-0" style={{ color: 'var(--ink-2)' }}>2.</span>
              <span>Connect wallet and click <strong>Register Agent</strong> — pays ≈ 0.006 USDC gas.</span>
            </li>
            <li className="flex gap-2">
              <span className="mono font-bold flex-shrink-0" style={{ color: 'var(--ink-2)' }}>3.</span>
              <span>Add <span className="mono text-xs">VITE_SELLER_ADDRESS=0x…</span> to .env, then run <span className="mono text-xs">bun run server</span> to start the x402 payment server.</span>
            </li>
            <li className="flex gap-2">
              <span className="mono font-bold flex-shrink-0" style={{ color: 'var(--ink-2)' }}>4.</span>
              <span>Use the <strong>x402 Demo</strong> tab to hit the paid endpoint. Without a Circle agent wallet it returns HTTP 402 (correct behaviour).</span>
            </li>
            <li className="flex gap-2">
              <span className="mono font-bold flex-shrink-0" style={{ color: 'var(--ink-2)' }}>5.</span>
              <span>Use a <em>second</em> wallet on the <strong>Reputation</strong> tab to leave ERC-8004 onchain feedback for the registered agent.</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}

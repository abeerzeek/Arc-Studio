import { ExternalLink, CheckCircle, Zap, Shield, Globe } from 'lucide-react'
import { buildAddressExplorerUrl } from '@/onchain-facts'

const ARC_TESTNET_CHAIN_ID = 5042002
const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'

interface AgentCardProps {
  agentId: bigint | null
  owner: string | null
  agentURI: string
  loading: boolean
}

export function AgentCard({ agentId, owner, agentURI, loading }: AgentCardProps) {
  const registryExplorerUrl = buildAddressExplorerUrl(ARC_TESTNET_CHAIN_ID, IDENTITY_REGISTRY)

  return (
    <div
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      className="rounded-2xl p-6 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            style={{ background: 'linear-gradient(135deg, #acc6e9 0%, #122d45 100%)' }}
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <p className="display font-semibold text-lg leading-tight" style={{ color: 'var(--ink)' }}>
              Arc Data Agent
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              ERC-8004 Identity
            </p>
          </div>
        </div>
        {agentId !== null && (
          <span
            style={{ background: '#e8f5e9', color: '#1a8047', border: '1px solid #c8e6c9' }}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          >
            <CheckCircle size={11} />
            Registered
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          className="rounded-xl p-3"
        >
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
            Agent ID
          </p>
          <p className="mono font-medium text-sm tabular-nums" style={{ color: 'var(--ink)' }}>
            {loading ? '—' : agentId !== null ? `#${agentId.toString()}` : 'Unregistered'}
          </p>
        </div>
        <div
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          className="rounded-xl p-3"
        >
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
            Network
          </p>
          <p className="font-medium text-sm" style={{ color: 'var(--ink)' }}>Arc Testnet</p>
        </div>
      </div>

      {/* Owner */}
      {owner && (
        <div
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
          className="rounded-xl p-3 mb-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
            Owner
          </p>
          <p className="mono text-xs break-all" style={{ color: 'var(--ink-2)' }}>{owner}</p>
        </div>
      )}

      {/* Capabilities */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Chip icon={<Zap size={11} />} label="x402 Payments" />
        <Chip icon={<Shield size={11} />} label="ERC-8004 Identity" />
        <Chip icon={<Globe size={11} />} label="A2A Service" />
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2">
        {agentId !== null && (
          <a
            href={`${registryExplorerUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
            style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              color: 'var(--ink-2)',
            }}
          >
            <span>View Identity Registry</span>
            <ExternalLink size={14} />
          </a>
        )}
        <a
          href="/agent-registration.json"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--ink-2)',
          }}
        >
          <span>Agent Registration File</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {agentURI && (
        <p className="mono text-xs mt-3 break-all" style={{ color: 'var(--subtle)' }}>
          URI: {agentURI}
        </p>
      )}
    </div>
  )
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink-2)' }}
      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
    >
      {icon}
      {label}
    </span>
  )
}

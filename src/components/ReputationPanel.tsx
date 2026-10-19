import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { toast } from 'sonner'
import { Star, Loader2, ArrowRight } from 'lucide-react'
import { buildTxExplorerUrl } from '@/onchain-facts'

const ARC_TESTNET_CHAIN_ID = 5042002
const REPUTATION_REGISTRY = '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const

const reputationAbi = [
  {
    type: 'function',
    name: 'giveFeedback',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'value', type: 'int128' },
      { name: 'valueDecimals', type: 'uint8' },
      { name: 'tag1', type: 'string' },
      { name: 'tag2', type: 'string' },
      { name: 'endpoint', type: 'string' },
      { name: 'feedbackURI', type: 'string' },
      { name: 'feedbackHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'event',
    name: 'NewFeedback',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'clientAddress', type: 'address', indexed: true },
      { name: 'feedbackIndex', type: 'uint64', indexed: false },
      { name: 'value', type: 'int128', indexed: false },
      { name: 'valueDecimals', type: 'uint8', indexed: false },
      { name: 'indexedTag1', type: 'string', indexed: true },
      { name: 'tag1', type: 'string', indexed: false },
      { name: 'tag2', type: 'string', indexed: false },
      { name: 'endpoint', type: 'string', indexed: false },
      { name: 'feedbackURI', type: 'string', indexed: false },
      { name: 'feedbackHash', type: 'bytes32', indexed: false },
    ],
  },
] as const

interface ReputationPanelProps {
  agentId: bigint | null
}

export function ReputationPanel({ agentId }: ReputationPanelProps) {
  const { chainId, isConnected } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [rating, setRating] = useState(90)
  const [comment, setComment] = useState('Great summary, delivered fast.')
  const [submitted, setSubmitted] = useState(false)

  const isWrongChain = isConnected && chainId !== ARC_TESTNET_CHAIN_ID

  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  if (isSuccess && !submitted) {
    setSubmitted(true)
    toast.success('Feedback recorded onchain!')
  }

  const handleFeedback = () => {
    if (!agentId || !isConnected) return
    if (isWrongChain) {
      switchChain({ chainId: ARC_TESTNET_CHAIN_ID })
      return
    }
    const body = JSON.stringify({ rating, comment })
    writeContract({
      address: REPUTATION_REGISTRY,
      abi: reputationAbi,
      functionName: 'giveFeedback',
      args: [
        agentId,
        BigInt(rating),
        0,
        'service-quality',
        '',
        '/api/summarize',
        '',
        keccak256(toBytes(body)),
      ],
      chainId: ARC_TESTNET_CHAIN_ID,
    })
  }

  if (!agentId) {
    return (
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.6 }}
        className="rounded-2xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <Star size={16} style={{ color: 'var(--muted)' }} />
          <p className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Reputation</p>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Register an agent first to leave onchain feedback.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      className="rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <Star size={16} style={{ color: '#b45309' }} />
        <p className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>Leave Feedback</p>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        Record ERC-8004 reputation for agent{' '}
        <span className="mono font-medium">#{agentId.toString()}</span> (≈ 0.006 USDC gas). Must come from a different wallet than the owner.
      </p>

      {/* Rating slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
            Rating
          </label>
          <span className="mono text-sm font-semibold tabular-nums" style={{ color: 'var(--ink)' }}>
            {rating} / 100
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full accent-ink"
          style={{ accentColor: 'var(--accent)' }}
        />
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="text-xs uppercase tracking-wider font-medium block mb-2" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
          Comment
        </label>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Short comment committed onchain…"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {submitted ? (
        <div className="space-y-3">
          <div
            style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#1a8047' }}
            className="rounded-xl px-4 py-3 text-sm font-medium"
          >
            Feedback confirmed onchain!
          </div>
          {txHash && (
            <a
              href={buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl"
              style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--ink-2)' }}
            >
              View on explorer <ArrowRight size={14} />
            </a>
          )}
          <button
            onClick={() => { setSubmitted(false); reset() }}
            className="w-full py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Leave another
          </button>
        </div>
      ) : (
        <button
          onClick={isWrongChain ? () => switchChain({ chainId: ARC_TESTNET_CHAIN_ID }) : handleFeedback}
          disabled={isPending || isConfirming || isSwitching || !isConnected}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          style={{
            background: isWrongChain ? '#ba2b4c' : 'var(--accent)',
            color: '#fff',
            opacity: isPending || isConfirming || !isConnected ? 0.7 : 1,
          }}
        >
          {isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Confirm in wallet…</>
          ) : isConfirming ? (
            <><Loader2 size={16} className="animate-spin" /> Confirming…</>
          ) : isWrongChain ? (
            'Switch to Arc Testnet'
          ) : !isConnected ? (
            'Connect wallet first'
          ) : (
            <><Star size={15} /> Submit Feedback <ArrowRight size={14} /></>
          )}
        </button>
      )}
    </div>
  )
}

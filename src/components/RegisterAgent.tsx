import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEventLogs } from 'viem'
import { toast } from 'sonner'
import { ConnectKitButton } from 'connectkit'
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { buildTxExplorerUrl } from '@/onchain-facts'

const ARC_TESTNET_CHAIN_ID = 5042002
const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const

const AGENT_URI = `${window.location.origin}/agent-registration.json`

const identityAbi = [
  {
    type: 'function',
    name: 'register',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'agentURI', type: 'string' }],
    outputs: [{ name: 'agentId', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Registered',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'agentURI', type: 'string', indexed: false },
      { name: 'owner', type: 'address', indexed: true },
    ],
  },
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

interface RegisterAgentProps {
  onRegistered: (agentId: bigint, txHash: string) => void
  alreadyRegisteredId: bigint | null
}

export function RegisterAgent({ onRegistered, alreadyRegisteredId }: RegisterAgentProps) {
  const { address, chainId, isConnected } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const [registeredTxHash, setRegisteredTxHash] = useState<string | null>(null)

  const isWrongChain = isConnected && chainId !== ARC_TESTNET_CHAIN_ID

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    reset,
  } = useWriteContract()

  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Parse agentId from receipt logs once confirmed
  if (isSuccess && receipt && !registeredTxHash) {
    try {
      const logs = parseEventLogs({ abi: identityAbi, eventName: 'Registered', logs: receipt.logs })
      if (logs.length > 0) {
        const agentId = logs[0].args.agentId
        setRegisteredTxHash(txHash!)
        onRegistered(agentId, txHash!)
        toast.success(`Agent registered! ID: #${agentId.toString()}`)
      }
    } catch {
      // log already processed or no matching event
    }
  }

  const handleRegister = () => {
    if (!isConnected || !address) return
    if (isWrongChain) {
      switchChain({ chainId: ARC_TESTNET_CHAIN_ID })
      return
    }
    writeContract({
      address: IDENTITY_REGISTRY,
      abi: identityAbi,
      functionName: 'register',
      args: [AGENT_URI],
      chainId: ARC_TESTNET_CHAIN_ID,
    })
  }

  const explorerLink = txHash ? buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, txHash) : null

  if (alreadyRegisteredId !== null) {
    return (
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        className="rounded-2xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 size={22} style={{ color: 'var(--success)' }} />
          <p className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>
            Agent Already Registered
          </p>
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          This wallet owns agent <span className="mono font-medium">#{alreadyRegisteredId.toString()}</span>. Each wallet registers one agent — reconnect a fresh wallet to register a second one.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      className="rounded-2xl p-6 backdrop-blur-sm"
    >
      <p className="display font-semibold text-base mb-1" style={{ color: 'var(--ink)' }}>
        Register on Arc
      </p>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        Mint an ERC-8004 identity token on Arc Testnet. Gas is paid in USDC (≈ 0.006 USDC).
      </p>

      {/* URI preview */}
      <div
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        className="rounded-xl px-4 py-3 mb-5"
      >
        <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
          Agent URI
        </p>
        <p className="mono text-xs break-all" style={{ color: 'var(--ink-2)' }}>{AGENT_URI}</p>
      </div>

      {!isConnected ? (
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button
              onClick={show}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Connect Wallet to Register
              <ArrowRight size={16} />
            </button>
          )}
        </ConnectKitButton.Custom>
      ) : isWrongChain ? (
        <button
          onClick={() => switchChain({ chainId: ARC_TESTNET_CHAIN_ID })}
          disabled={isSwitching}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          style={{ background: '#ba2b4c', color: '#fff', opacity: isSwitching ? 0.7 : 1 }}
        >
          {isSwitching ? <Loader2 size={16} className="animate-spin" /> : null}
          Switch to Arc Testnet
        </button>
      ) : isSuccess && registeredTxHash ? (
        <div className="space-y-3">
          <div
            style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#1a8047' }}
            className="rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Registration confirmed onchain!
          </div>
          {explorerLink && (
            <a
              href={explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl font-medium transition-all"
              style={{
                background: 'var(--surface-muted)',
                border: '1px solid var(--border)',
                color: 'var(--ink-2)',
              }}
            >
              View transaction
              <ArrowRight size={14} />
            </a>
          )}
          <button
            onClick={reset}
            className="w-full py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            Register another
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={handleRegister}
            disabled={isWritePending || isConfirming}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              opacity: isWritePending || isConfirming ? 0.75 : 1,
            }}
          >
            {isWritePending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Confirm in wallet…
              </>
            ) : isConfirming ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Confirming…
              </>
            ) : (
              <>
                Register Agent
                <ArrowRight size={16} />
              </>
            )}
          </button>
          {txHash && !isSuccess && (
            <a
              href={buildTxExplorerUrl(ARC_TESTNET_CHAIN_ID, txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs py-2"
              style={{ color: 'var(--subtle)' }}
            >
              Waiting for confirmation…
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// Hook: check if the connected wallet already owns an agent
export function useExistingAgentId(_address: `0x${string}` | undefined) {
  // We use a known token ID scan approach — read ownerOf(1) up to some max
  // In a real app you'd index Registered events; here we check token IDs 1-20
  // by reading the owner and matching against the connected address.
  // For simplicity, we return null (not found) — the UI will allow registration.
  // The onchain call will revert if you try to double-register from the same wallet.
  return { existingAgentId: null as bigint | null }
}

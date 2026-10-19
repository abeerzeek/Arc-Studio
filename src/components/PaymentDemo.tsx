import { useState } from 'react'
import { Zap, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react'

interface SummarizeResponse {
  topic: string
  summary: string
  model: string
  priceUSDC: string
}

interface PaymentDemoProps {
  agentId: bigint | null
}

export function PaymentDemo({ agentId: _agentId }: PaymentDemoProps) {
  const [topic, setTopic] = useState('Arc Testnet governance')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummarizeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)

  const callSummarize = async () => {
    setLoading(true)
    setResult(null)
    setError(null)
    setStatusCode(null)

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      setStatusCode(res.status)

      if (res.status === 402) {
        // x402 Payment Required — show what a buyer agent would see
        const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
        setError(
          `HTTP 402 Payment Required — the endpoint correctly demands USDC payment before serving. ` +
            `A buyer agent (via Circle CLI or x402 client) would auto-pay $0.01 USDC and retry.\n\n` +
            `Payment details: ${JSON.stringify(body, null, 2)}`,
        )
      } else if (res.status === 503) {
        const body = await res.json().catch(() => ({})) as { message?: string }
        setError(
          body.message ??
            'Server not configured. Add VITE_SELLER_ADDRESS to .env and restart the server.',
        )
      } else if (!res.ok) {
        setError(`HTTP ${res.status} — ${await res.text()}`)
      } else {
        setResult((await res.json()) as SummarizeResponse)
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? `${e.message} — make sure the payment server is running (bun run server).`
          : 'Unknown error',
      )
    } finally {
      setLoading(false)
    }
  }

  const is402 = statusCode === 402

  return (
    <div
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      className="rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-1">
        <Lock size={16} style={{ color: 'var(--muted)' }} />
        <p className="display font-semibold text-base" style={{ color: 'var(--ink)' }}>
          x402 Paid Endpoint
        </p>
      </div>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        Call <span className="mono text-xs">POST /api/summarize</span> — gated at <strong>$0.01 USDC</strong> per request via Circle Gateway Nanopayments.
      </p>

      {/* Topic input */}
      <div className="mb-4">
        <label className="text-xs uppercase tracking-wider font-medium block mb-2" style={{ color: 'var(--subtle)', letterSpacing: '0.07em' }}>
          Topic to summarize
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Arc Testnet governance"
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            color: 'var(--ink)',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--focus)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Price row */}
      <div
        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}
        className="rounded-xl px-4 py-2.5 flex items-center justify-between mb-5"
      >
        <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
          Cost per call
        </span>
        <span className="mono text-sm font-semibold" style={{ color: 'var(--ink)' }}>
          $0.01 USDC
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={() => { void callSummarize() }}
        disabled={loading || !topic.trim()}
        className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-4"
        style={{
          background: 'var(--accent)',
          color: '#fff',
          opacity: loading || !topic.trim() ? 0.7 : 1,
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Calling endpoint…
          </>
        ) : (
          <>
            <Zap size={16} />
            Call Paid Endpoint
            <ArrowRight size={14} />
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div
          style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}
          className="rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={15} style={{ color: '#1a8047' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#1a8047', letterSpacing: '0.07em' }}>
              HTTP 200 — Payment Verified
            </p>
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#1a4a2e' }}>
            {result.summary}
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: '#2a6040' }}>
            <span className="mono">{result.model}</span>
            <span>•</span>
            <span>{result.priceUSDC} USDC charged</span>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            background: is402 ? '#fff8e6' : '#fef2f4',
            border: `1px solid ${is402 ? '#f5c842' : '#f4c2c8'}`,
          }}
          className="rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            {is402 ? (
              <Zap size={15} style={{ color: '#b45309' }} />
            ) : (
              <AlertTriangle size={15} style={{ color: 'var(--danger)' }} />
            )}
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: is402 ? '#b45309' : 'var(--danger)', letterSpacing: '0.07em' }}
            >
              {is402 ? 'HTTP 402 — Payment Required (Expected)' : `Error ${statusCode ?? ''}`}
            </p>
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: is402 ? '#7c4a00' : '#7c1c2e' }}>
            {error}
          </p>
          {is402 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f5d87a' }}>
              <p className="text-xs font-medium" style={{ color: '#7c4a00' }}>
                To test a paid call: run the Circle CLI and use{' '}
                <span className="mono">circle services pay</span> against this endpoint, or set{' '}
                <span className="mono">VITE_SELLER_ADDRESS</span> in .env and restart the server.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

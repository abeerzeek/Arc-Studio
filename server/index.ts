/**
 * Arc Data Agent — Express server with x402 Gateway Nanopayments
 * Paid endpoint: POST /summarize  ($0.01 USDC per call)
 * Health:        GET  /health
 */

import express from 'express'
import cors from 'cors'
import { createGatewayMiddleware } from '@circle-fin/x402-batching/server'

const app = express()
app.use(cors())
app.use(express.json())

// Seller receive address — set VITE_SELLER_ADDRESS in .env before starting
const sellerAddress = process.env.VITE_SELLER_ADDRESS as `0x${string}` | undefined

if (!sellerAddress || !/^0x[a-fA-F0-9]{40}$/.test(sellerAddress)) {
  console.warn(
    '[x402] VITE_SELLER_ADDRESS is not set or invalid. ' +
      'Set it in .env to a valid EVM address to enable payment collection. ' +
      'Starting in demo mode — /summarize will return 402 but not verify payment.',
  )
}

// Gateway nanopayments middleware
// createGatewayMiddleware discovers supported networks at runtime; the
// seller address is the EVM wallet that receives USDC settlements.
const gateway = sellerAddress
  ? createGatewayMiddleware({ sellerAddress })
  : null

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sellerConfigured: !!sellerAddress })
})

// Paid summarization endpoint — $0.01 USDC per call
// Without gateway configured, returns a descriptive 503 so the UI can show
// a clear setup instruction instead of a cryptic error.
if (gateway) {
  app.post('/summarize', gateway.require('$0.01'), async (req, res) => {
    const { topic = 'onchain activity' } = req.body as { topic?: string }
    res.json({
      topic,
      summary: `Paid summary for "${topic}": On-chain activity shows strong USDC volume with rising unique address counts over the last 24 hours. Governance participation is trending up across Arc Testnet.`,
      model: 'arc-data-agent-v1',
      priceUSDC: '0.01',
    })
  })
} else {
  app.post('/summarize', (_req, res) => {
    res.status(503).json({
      error: 'SELLER_NOT_CONFIGURED',
      message:
        'Set VITE_SELLER_ADDRESS in .env to your EVM wallet address and restart the server.',
    })
  })
}

const PORT = 3001
app.listen(PORT, () => {
  console.log(`[arc-agent] Server running on port ${PORT}`)
  console.log(`[arc-agent] Seller address: ${sellerAddress ?? 'NOT SET (demo mode)'}`)
})

# Arc Agent — ERC-8004 + x402

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** - what Arc Studio remembers about building this app.

---

## What This App Does

Onchain agent identity app demonstrating:
- ERC-8004 registration on Arc Testnet (mints identity NFT via IdentityRegistry)
- x402 Circle Gateway Nanopayments — Express server charges $0.01 USDC per call via `@circle-fin/x402-batching`
- ERC-8004 ReputationRegistry — onchain feedback from a second wallet

## Onchain Addresses (Arc Testnet, Chain ID 5042002)

- ERC-8004 IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- ERC-8004 ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- ERC-8004 ValidationRegistry: `0x8004Cb1BF31DAf7788923b405b754f57acEB4272`
- USDC (gas + ERC-20): `0x3600000000000000000000000000000000000000`

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity 0.8.28 + Foundry. Sources in `contracts/`, unit tests in `contracts/test/*.t.sol`. Build with `bun run contracts:build` (`forge build`), test with `bun run contracts:test` (`forge test`).
- Wallet: injected (MetaMask, etc.)
- Chain: Arc Testnet (Chain ID: 5042002, imported from `viem/chains`)
- Token: USDC (6 decimals) (Address: 0x3600000000000000000000000000000000000000, Chain: Arc Testnet)
- Toasts: Sonner

## Key Files

- `src/App.tsx` - Main application logic
- `src/components/` - UI components
- `src/config.ts` - wagmi config (chains, connectors, transports)

## To Run

```bash
bun install
bun run dev
```

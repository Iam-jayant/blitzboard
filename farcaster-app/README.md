# BlitzBoard - Farcaster Mini App

A Farcaster Mini App companion for [BlitzBoard](../wannabe/), the on-chain quadratic voting platform built on Monad blockchain.

## Features

- **Browse Live Events** — See all active hackathon/competition events
- **Quadratic Voting** — Vote on submissions directly from Farcaster using on-chain quadratic voting
- **Leaderboard** — View real-time rankings for any event
- **Wallet Integration** — Connect Farcaster wallet for Monad Testnet transactions
- **Share to Farcaster** — Cast about events and leaderboards directly
- **Notifications** — Get notified about new events and voting results

## Architecture

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Farcaster SDK | @farcaster/miniapp-sdk |
| Wallet | Farcaster Wallet + wagmi + viem |
| Chain | Monad Testnet (Chain ID: 10143) |
| Backend Data | Supabase (shared with main app) |
| Smart Contract | AgentConsensus @ `0xc410352706ac0Ae9eB670afda875E602c83bFce0` |
| Styling | Tailwind CSS |

## Getting Started

### Prerequisites

- Node.js 18+
- yarn or npm
- A Supabase project (same as the main wannabe app)

### Install dependencies

```bash
cd wannabe-farcaster
yarn install
```

### Copy environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials (same as the main wannabe app).

### Run the dev server

```bash
yarn dev
```

The app runs at `http://localhost:3000`.

### Test in Farcaster

Since Farcaster's embed tool requires a remote URL:

1. Install cloudflared:
   ```bash
   # macOS
   brew install cloudflared

   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
   chmod +x cloudflared
   ```

2. Expose localhost:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

3. Set the tunnel URL in `.env.local`:
   ```
   NEXT_PUBLIC_URL=https://your-tunnel-url.trycloudflare.com
   ```

4. Open the [Farcaster Embed Tool](https://farcaster.xyz/~/developers/mini-apps/embed) and enter your tunnel URL.

## Project Structure

```
wannabe-farcaster/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Entry page with frame metadata
│   ├── globals.css             # Global styles
│   ├── .well-known/
│   │   └── farcaster.json/
│   │       └── route.ts        # Farcaster manifest
│   └── api/
│       ├── webhook/route.ts    # Farcaster webhook handler
│       ├── send-notification/route.ts
│       └── og/route.tsx        # Dynamic OG image generation
├── components/
│   ├── farcaster-provider.tsx  # Farcaster SDK context
│   ├── wallet-provider.tsx     # Wagmi + Monad config
│   ├── providers.tsx           # Combined providers
│   ├── safe-area-container.tsx # Safe area insets
│   ├── pages/
│   │   └── app.tsx             # Main app page
│   └── Home/
│       ├── index.tsx           # App shell with tabs
│       ├── UserProfile.tsx     # Farcaster user display
│       ├── LiveEvents.tsx      # Events from Supabase
│       ├── VotingPanel.tsx     # Quadratic voting UI
│       ├── Leaderboard.tsx     # Rankings display
│       ├── WalletActions.tsx   # Wallet management
│       └── FarcasterActions.tsx # Cast, save, share
├── lib/
│   ├── constants.ts
│   ├── contract.ts             # AgentConsensus ABI
│   ├── supabase.ts             # Supabase client
│   ├── kv.ts                   # Notification token storage
│   └── notifs.ts               # Push notification helpers
├── types/
│   └── index.ts
└── public/
    └── images/
        ├── feed.png            # Embed image (3:2)
        ├── splash.png          # Splash screen icon (200x200)
        └── icon.png            # App store icon
```

## How It Works

### Quadratic Voting

- Each voter gets 100 credits per event
- Cost = votes² (1 vote = 1 credit, 3 votes = 9 credits, 10 votes = 100 credits)
- Votes are submitted on-chain to the AgentConsensus smart contract on Monad Testnet
- Sharded storage ensures parallel execution without write conflicts

### Data Flow

1. Events and submissions are stored in **Supabase** (shared with the main wannabe app)
2. Votes are recorded **on-chain** via the AgentConsensus contract
3. Leaderboard scores are aggregated from Supabase

### Farcaster Integration

- **User Context**: Display Farcaster username, profile pic, and FID
- **Wallet**: Use Farcaster's built-in wallet for Monad transactions
- **Actions**: Cast about events, save the app, share leaderboards
- **Notifications**: Welcome messages and event updates via push notifications

## Publishing

When ready to publish your Mini App:

1. Generate account association keys following [Farcaster docs](https://miniapps.farcaster.xyz/docs/guides/publishing)
2. Update `app/.well-known/farcaster.json/route.ts` with your keys
3. Replace placeholder images in `public/images/` with real assets
4. Deploy to Vercel or your preferred hosting
5. Submit to the [Farcaster Mini App Store](https://farcaster.xyz/~/developers/mini-apps)

## Related

- [Main BlitzBoard App](../wannabe/) — Full web application
- [Monad Mini App Template](https://github.com/monad-developers/monad-miniapp-template)
- [Farcaster Mini App Docs](https://miniapps.farcaster.xyz/)
- [Monad Docs](https://docs.monad.xyz/)

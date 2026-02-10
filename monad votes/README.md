# BlitzBoard - Decentralized Voting Platform on Monad

BlitzBoard is a high-performance decentralized voting platform built for the Monad blockchain. It features parallel-execution smart contracts, AI agent consensus voting, and a comprehensive submission management system for hackathons, competitions, and community events.

## 🚀 Key Features

### For Event Hosts
- **Create & Manage Events**: Set up custom voting events with unique event codes
- **Submission Management**: Review and manage participant submissions
- **Real-time Leaderboards**: Track voting results as they happen
- **On-chain Verification**: All votes are recorded immutably on Monad testnet

### For Voters
- **Quadratic Voting**: Fair voting system with credit allocation
- **Wallet Integration**: Connect via RainbowKit with Privy authentication
- **Real-time Updates**: See submission rankings update live
- **Transparent Results**: All votes are verifiable on-chain

### For Submitters
- **Easy Submission**: Submit projects with descriptions and links
- **QR Code Support**: Generate QR codes for easy event joining
- **Profile Management**: Track your submissions across multiple events

### AI Agent Consensus
- **Parallel Voting**: AI agents can vote concurrently without conflicts
- **Sharded State**: Optimized for Monad's parallel execution capabilities
- **Agent API**: Automated voting through agent endpoints
- **Consensus Aggregation**: Aggregate multiple agent votes efficiently

## 🏗️ Architecture

### Smart Contracts
- **AgentConsensus.sol**: Parallel-execution voting contract with sharded state
- Deployed on Monad Testnet
- Supports concurrent writes without conflicts
- Event registry with submission and voting management

### Frontend Stack
- **React 19** with TypeScript
- **Vite** for fast development and building
- **RainbowKit** for wallet connectivity
- **Privy** for authentication
- **Wagmi v3** for Ethereum interactions
- **React Router** for navigation
- **Lucide React** for icons

### Backend Services
- **Supabase**: Database and real-time subscriptions
- **Agent API**: Node.js service for AI agent voting
- **Aggregation Service**: Vote counting and leaderboard calculation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Monad Testnet RPC access

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd blitzboard/monad-votes
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Privy Authentication
VITE_PRIVY_APP_ID=your_privy_app_id

# Contract Address (Monad Testnet)
VITE_CONTRACT_ADDRESS=your_deployed_contract_address

# Monad Testnet RPC
VITE_MONAD_RPC_URL=https://testnet.monad.xyz

# Agent API (optional)
AGENT_API_PORT=3001
```

4. **Deploy Smart Contract** (if not already deployed)
```bash
npx hardhat run scripts/deploy.cjs --network monad
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### With AI Agent API
Run the agent voting service in a separate terminal:
```bash
npm run dev:agents
```
This starts the agent API on port 3001 for automated voting.

### Production Build
```bash
npm run build
npm run preview
```

## 📝 Usage Guide

### Creating an Event (Host)
1. Connect your wallet and select "Host" role
2. Navigate to "Create Event"
3. Fill in event details and generate a unique event code
4. Share the event code or QR code with participants
5. Monitor submissions and voting in real-time

### Submitting to an Event (Submitter)
1. Connect wallet and select "Submitter" role
2. Enter the event code or scan QR code
3. Submit your project with title, description, and links
4. Track your submission's performance on the leaderboard

### Voting (Voter)
1. Connect wallet and select "Voter" role
2. Enter event code to join
3. Allocate voting credits using quadratic voting
4. Submit votes on-chain (transaction required)
5. View results on the leaderboard

### AI Agent Voting
Agents can vote programmatically via the agent API:
```bash
# Generate agent wallets
node scripts/generate-wallets.cjs

# Fund agent wallets
node scripts/fund-all-wallets.cjs

# Run parallel voting test
node scripts/test-parallel-voting.cjs
```

## 🧪 Testing

### Test Scripts
- `npm run test:quick` - Quick contract functionality test
- `npm run test:full` - Comprehensive voting test
- `npm run test:parallel` - Parallel agent voting test
- `npm run test:sequential` - Sequential voting test

### Hardhat Testing
```bash
npx hardhat test
```

## 🔧 Project Structure

```
monad-votes/
├── contracts/              # Solidity smart contracts
│   └── AgentConsensus.sol # Main voting contract
├── scripts/               # Deployment and testing scripts
│   ├── deploy.cjs        # Contract deployment
│   ├── agent-api.cjs     # Agent voting service
│   └── test-*.cjs        # Various test scripts
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Services and utilities
│   │   ├── contract.ts         # Contract interaction
│   │   ├── votingService.ts    # Voting logic
│   │   ├── agentVotingService.ts # AI agent voting
│   │   ├── aggregationService.ts # Vote aggregation
│   │   └── supabase.ts         # Database client
│   └── styles/          # CSS styles
├── public/              # Static assets
└── artifacts/           # Compiled contracts

```

## 🌐 Monad Integration

This project leverages Monad's unique features:
- **Parallel Execution**: Smart contract designed for concurrent vote submissions
- **Sharded State**: Event and submission data sharded to prevent conflicts
- **High Throughput**: Handle hundreds of votes per second
- **Low Latency**: Fast transaction confirmation times

## 🛠️ Tech Stack

**Blockchain**
- Solidity 0.8.24
- Hardhat
- Ethers.js v6

**Frontend**
- React 19.2
- TypeScript 5.9
- Vite 7.2
- RainbowKit 2.2
- Wagmi 3.4
- Privy Auth 3.13

**Backend**
- Supabase (PostgreSQL + Realtime)
- Node.js Agent API
- Express.js

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For questions or support, please open an issue in the repository or contact the development team.

---

Built with ⚡ for Monad Blitz Nagpur

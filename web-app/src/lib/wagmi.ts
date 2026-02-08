import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define Monad Testnet chain
export const monadTestnet = defineChain({
  id: 10143, // 0x279f in hex
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
});

// Configure wagmi with RainbowKit
export const config = getDefaultConfig({
  appName: 'BlitzBoard',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'development',
  chains: [monadTestnet, mainnet, sepolia],
  ssr: false,
});

// Export chain configurations for easy access
export const supportedChains = {
  monadTestnet,
  mainnet,
  sepolia,
};

// Target chain for the app
export const TARGET_CHAIN_ID = monadTestnet.id;

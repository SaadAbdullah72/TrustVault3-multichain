import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import VaultPage from './pages/VaultPage'

// Configure wallet manager
const walletManager = new WalletManager({
  wallets: [
    {
      id: WalletId.WALLETCONNECT,
      options: {
        projectId: 'c1b47ac841baf67be16a927a3c3e7b16',
        themeMode: 'dark',
        enableExplorer: true,
        explorerRecommendedWalletIds: 'NONE', // Can put pera wallet id later
        privacyPolicyUrl: '',
        termsOfServiceUrl: '',
        themeVariables: {}
      } // Required for mobile wallets like Pera
    },
    WalletId.DEFLY,
    WalletId.EXODUS
  ],
  defaultNetwork: NetworkId.TESTNET,
  networks: {
    [NetworkId.TESTNET]: {
      algod: {
        baseServer: 'https://testnet-api.algonode.cloud',
        port: '',
        token: ''
      }
    }
  }
})

export default function App() {
  return (
    <WalletProvider manager={walletManager}>
      <SnackbarProvider maxSnack={3}>
        <VaultPage />
      </SnackbarProvider>
    </WalletProvider>
  )
}

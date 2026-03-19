import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import VaultPage from './pages/VaultPage'
import { ChainProvider } from './contexts/ChainContext'
import { SolanaWalletProvider } from './components/SolanaWalletProvider'
import './styles/chain-switcher.css'

// Configure Algorand wallet manager
const walletManager = new WalletManager({
  wallets: [
    {
      id: WalletId.PERA,
      options: { compactMode: false }
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
    <SolanaWalletProvider>
      <WalletProvider manager={walletManager}>
        <ChainProvider>
          <SnackbarProvider maxSnack={3}>
            <VaultPage />
          </SnackbarProvider>
        </ChainProvider>
      </WalletProvider>
    </SolanaWalletProvider>
  )
}

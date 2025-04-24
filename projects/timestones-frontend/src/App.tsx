import Homepage from './Home';

import { SnackbarProvider } from 'notistack';

import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react';
import { WalletUIProvider } from '@txnlab/use-wallet-ui-react';
// Configure the wallets you want to use
const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.LUTE,
    // Add more wallets as needed
  ],
  defaultNetwork: NetworkId.TESTNET,
});

function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <WalletUIProvider>
          <Homepage />
        </WalletUIProvider>
      </WalletProvider>
    </SnackbarProvider>
  );
}

export default App;

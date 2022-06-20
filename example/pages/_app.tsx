import type { AppProps } from 'next/app'
import {
  Mainnet,
  Polygon,
  Gnosis,
  Optimism,
  Arbitrum,
  DAppProvider,
  Config,
  // Chain,
} from '@usedapp/core'
import 'chota/dist/chota.css'

function MyApp({ Component, pageProps }: AppProps) {
  const config: Config = {
    readOnlyChainId: Mainnet.chainId,
    networks: [Mainnet, Polygon, Gnosis, Optimism, Arbitrum],
    // supportedChains: [
    //   Chain.Mainnet,
    //   Polygon.chainId,
    //   Optimism.chainId,
    //   Arbitrum.chainId,
    //   Gnosis.chainId,
    // ],
  }
  return (
    <div>
      <DAppProvider config={config}>
        <Component {...pageProps} />
      </DAppProvider>
    </div>
  )
}

export default MyApp

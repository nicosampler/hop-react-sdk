import type { AppProps } from 'next/app'
import { Mainnet, Polygon, Gnosis, Optimism, Arbitrum, DAppProvider, Config } from '@usedapp/core'

function MyApp({ Component, pageProps }: AppProps) {
  const config: Config = {
    readOnlyChainId: Mainnet.chainId,
    supportedChains: [
      Mainnet.chainId,
      Polygon.chainId,
      Optimism.chainId,
      Arbitrum.chainId,
      Gnosis.chainId,
    ],
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

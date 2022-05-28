import { mainnet as mainnetNetworks, Network } from '@hop-protocol/core/networks'
import { Slug } from '@hop-protocol/sdk'

import { arrayOfAll } from '../types/utils'

export type BridgeChainName = Extract<
  `${Slug}`,
  'ethereum' | 'gnosis' | 'arbitrum' | 'optimism' | 'polygon'
>

const chainIsLayer1: Record<BridgeChainName, boolean> = {
  ethereum: true,
  gnosis: false,
  arbitrum: false,
  optimism: false,
  polygon: false,
}

const arrayOfAllChainNames = arrayOfAll<BridgeChainName>()
export const bridgeChainNames = arrayOfAllChainNames([
  'ethereum',
  'gnosis',
  'arbitrum',
  'optimism',
  'polygon',
])

export const bridgeChainNameId: Record<BridgeChainName, number> = {
  ethereum: 1,
  optimism: 10,
  arbitrum: 42161,
  polygon: 137,
  gnosis: 100,
}

type ChainInfo = {
  name: string
  slug: string
  chainId: number
  publicRpcUrl: string | undefined
  explorerUrls: string[]
  nativeBridgeUrl: string | undefined
  waitConfirmations: number
  isLayer1: boolean
}

export const bridgeChains: Record<BridgeChainName, ChainInfo> = bridgeChainNames.reduce(
  (acc, name) => {
    const chainInfo = mainnetNetworks[name] as Network

    if (!chainInfo) {
      throw new Error(`Network ${name} has no configuration`)
    }

    acc[name] = {
      name: chainInfo.name,
      slug: chainInfo.name.toLowerCase(),
      chainId: chainInfo.networkId,
      publicRpcUrl: chainInfo.publicRpcUrl,
      explorerUrls: chainInfo.explorerUrls,
      nativeBridgeUrl: chainInfo.nativeBridgeUrl,
      waitConfirmations: chainInfo.waitConfirmations,
      isLayer1: chainIsLayer1[name],
    }

    return acc
  },
  {} as Record<BridgeChainName, ChainInfo>,
)

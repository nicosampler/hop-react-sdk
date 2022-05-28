import { CanonicalToken } from '@hop-protocol/sdk'
import { mainnet as mainnetAddresses } from '@hop-protocol/core/addresses'
import { mainnet as mainnetMetadata } from '@hop-protocol/core/metadata'

import TokenModel from '../models/Token'
import { arrayOfAll } from '../types/utils'

type AllBridge = `${CanonicalToken}`
export type BridgeSymbol = Extract<AllBridge, 'ETH' | 'MATIC' | 'USDC' | 'USDT' | 'DAI'>

const arrayOfAllBridgedSymbol = arrayOfAll<BridgeSymbol>()
export const bridgeSymbols = arrayOfAllBridgedSymbol(['ETH', 'MATIC', 'USDC', 'USDT', 'DAI'])

export const bridgeTokens: Record<BridgeSymbol, TokenModel> = bridgeSymbols.reduce(
  (acc, symbol) => {
    const tokenInfo = mainnetMetadata.tokens[symbol]

    if (!tokenInfo) {
      throw new Error(`Token ${symbol} has no configuration`)
    }

    acc[symbol] = new TokenModel({
      symbol: symbol,
      tokenName: tokenInfo.name,
      decimals: tokenInfo.decimals,
      imageUrl: '',
      supportedNetworks: Object.keys(mainnetAddresses.bridges[symbol]),
    })

    return acc
  },
  {} as Record<BridgeSymbol, TokenModel>,
)

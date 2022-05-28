import { useCallback } from 'react'
import { AddressZero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'
import { getAddress } from '@ethersproject/address'
import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers'
import { Token as SdkHopToken, Hop, ChainId as AllChainId } from '@hop-protocol/sdk'
import { mainnet as mainnetAddresses } from '@hop-protocol/core/addresses'

import { formatError } from './utils/format'
import { getBonderFeeWithId } from './utils/getBonderFeeWithId'
import { bridgeTokens, BridgeSymbol } from './config/bridge'
import { bridgeChains, BridgeChainName } from './config/chian'
import calculateSend, { CalculateSendResponse } from './utils/calculateSend'

const defaultDeadlineMinutes = 60 * 24 * 7
const hopExplorerUrl = 'https://explorer.hop.exchange/?transferId='

export type ChainId = `${AllChainId}`

type Props = {
  provider: JsonRpcProvider
}

type BridgeSendParams = {
  token: BridgeSymbol
  fromChainName: BridgeChainName
  toChainName: BridgeChainName
  tokenAmount: BigNumber
  toAddress: string
  slippageTolerance: number
}

export type UseHopBridgeFunctionResponse = {
  tokenDecimals: number,
  estimation: CalculateSendResponse
  isApprovalNeeded: boolean
  sendApproval: () => Promise<TransactionResponse>
  sendSwap: () => Promise<{
    tx?: TransactionResponse
    hopExplorerLink?: string
    error?: any
    formattedMessage?: string
  }>
}

export function useHopBridge({ provider }: Props) {
  return useCallback(
    async ({
      token: tokenName,
      tokenAmount,
      fromChainName,
      toChainName,
      toAddress: toAddressRaw,
      slippageTolerance,
    }: BridgeSendParams): Promise<UseHopBridgeFunctionResponse> => {
      const signer = provider.getSigner()
      // const address = await signer.getAddress()
      const chainFrom = bridgeChains[fromChainName]
      const chainTo = bridgeChains[toChainName]
      const token = bridgeTokens[tokenName]
      const amountBN = tokenAmount
      const toAddress = toAddressRaw.toLowerCase()

      // verify signer
      if (!signer) {
        throw new Error(
          'Cannot send: the provider passed as argument does not have a valid signer.',
        )
      }

      // verify provider chainId matches chainFrom
      const providerChainId = (await provider.getNetwork()).chainId
      if (chainFrom.chainId !== providerChainId) {
        throw new Error('Provider chainId does not match toNetwork chainId')
      }

      // verify to address
      try {
        getAddress(toAddress)
      } catch (err) {
        throw new Error('toAddress is now a valid address')
      }

      // verify slippage
      if (slippageTolerance < 0) {
        throw new Error('slippageTolerance must be greater or equal than 0')
      }

      const sdk = new Hop('mainnet', signer)
      const hopBridge = sdk.bridge(tokenName).connect(signer)

      // estimate swap
      let estimation: CalculateSendResponse
      try {
        estimation = await calculateSend(
          hopBridge,
          fromChainName,
          toChainName,
          amountBN,
          slippageTolerance,
        )
      } catch (error) {
        console.error('Error calculating swap stats', error)
        throw Error({ ...error, customMessage: 'There was a problem trying to estimate the swap.' })
      }

      // verify amount > fee
      if (estimation.totalFee.gt(amountBN)) {
        throw new Error('Amount must be greater than bonder fee')
      }

      const isApprovalNeeded = async () => {
        const tokenBridge = mainnetAddresses.bridges[tokenName][fromChainName] as {
          l1CanonicalToken?: string
          l2CanonicalToken?: string
        }
        const tokenAddress = (tokenBridge.l1CanonicalToken ??
          tokenBridge.l2CanonicalToken) as string

        const hopSdkToken = new SdkHopToken(
          'mainnet',
          fromChainName,
          tokenAddress,
          token.decimals,
          token.symbol,
          token.symbol,
          '',
          signer,
        )

        if (hopSdkToken.isNativeToken) {
          return false
        }

        const currentAllowance = await hopSdkToken.allowance(
          hopBridge.getSendApprovalAddress(fromChainName, false),
        )

        return amountBN.gt(currentAllowance)
      }

      return {
        tokenDecimals: token.decimals,
        estimation,
        isApprovalNeeded: await isApprovalNeeded(),
        sendApproval: () => hopBridge.sendApproval(amountBN, fromChainName, toChainName),
        sendSwap: async () => {
          const deadline = Math.ceil(Date.now() / 1000 + Number(defaultDeadlineMinutes) * 60)
          try {
            if (chainFrom.isLayer1) {
              const tx = await hopBridge.send(amountBN, sdk.Chain.Ethereum, toChainName, {
                deadline: deadline,
                relayer: AddressZero,
                relayerFee: 0,
                recipient: toAddress,
                amountOutMin: estimation.amountOutMin,
              })

              const receipt = await tx.wait()
              return {
                tx,
                hopExplorerLink: `${hopExplorerUrl}${receipt.transactionHash}`,
              }
            } else if (chainTo.isLayer1) {
              const bonderFeeWithId = getBonderFeeWithId(estimation.totalFee)

              const tx = await hopBridge.send(amountBN, fromChainName, toChainName, {
                deadline: deadline,
                recipient: toAddress,
                bonderFee: bonderFeeWithId,
                amountOutMin: estimation.amountOutMin.sub(bonderFeeWithId),
                destinationAmountOutMin: 0,
                destinationDeadline: 0,
              })
              const receipt = await tx.wait()

              const hopExplorerLink = `${hopExplorerUrl}${receipt.transactionHash}`

              return {
                tx,
                hopExplorerLink,
              }
            } else {
              const bonderFeeWithId = getBonderFeeWithId(estimation.totalFee)

              const tx = await hopBridge.send(amountBN, fromChainName, toChainName, {
                recipient: toAddress,
                bonderFee: bonderFeeWithId,
                amountOutMin: estimation.intermediaryAmountOutMin.sub(bonderFeeWithId),
                deadline: deadline,
                destinationAmountOutMin: estimation.amountOutMin.sub(bonderFeeWithId),
                destinationDeadline: deadline,
              })

              const receipt = await tx.wait()
              return {
                tx,
                hopExplorerLink: `${hopExplorerUrl}${receipt.transactionHash}`,
              }
            }
          } catch (error: any) {
            return {
              formattedMessage: !/cancelled/gi.test(error.message)
                ? formatError(error)
                : 'Transaction cancelled',
              error,
            }
          }
        },
      }
    },
    [provider],
  )
}
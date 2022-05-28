import { BigNumber } from '@ethersproject/bignumber'
import { HopBridge } from '@hop-protocol/sdk'
import { BridgeChainName } from '../config/chian'

export type CalculateSendResponse = {
  amountOut: BigNumber
  rate: number
  priceImpact: number
  requiredLiquidity: BigNumber
  lpFees: BigNumber
  adjustedBonderFee: BigNumber
  adjustedDestinationTxFee: BigNumber
  totalFee: BigNumber
  estimatedReceived: BigNumber
  amountOutMin: BigNumber
  intermediaryAmountOutMin: BigNumber
}

async function calculateSend(
  hopBridge: HopBridge,
  fromChainName: BridgeChainName,
  toChainName: BridgeChainName,
  amount: BigNumber,
  slippageTolerance: number,
): Promise<CalculateSendResponse> {
  const data = await hopBridge.getSendData(amount, fromChainName, toChainName, false)

  const slippageToleranceBps = slippageTolerance * 100
  const minBps = Math.ceil(10000 - slippageToleranceBps)

  const amountOutMin = data.amountOut.mul(minBps).div(10000)
  const intermediaryAmountOutMin = data.requiredLiquidity.mul(minBps).div(10000)

  return {
    ...data,
    amountOutMin,
    intermediaryAmountOutMin,
  }
}

export default calculateSend

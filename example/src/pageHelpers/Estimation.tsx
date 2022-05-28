import { formatUnits } from '@ethersproject/units'
import { UseHopBridgeFunctionResponse } from 'hop-react-sdk'
type Props = {
  hopResponse: UseHopBridgeFunctionResponse
}

function Estimation({ hopResponse }: Props) {
  return (
    <>
      <h3>Estimation</h3>
      <div>{`amountOut: ${formatUnits(
        hopResponse.estimation.amountOut,
        hopResponse.tokenDecimals,
      )}`}</div>
      <div>{`rate: ${hopResponse.estimation.rate.toString()}`} </div>
      <div>{`priceImpact: ${hopResponse.estimation.priceImpact.toString()}`}</div>
      <div>{`requiredLiquidity: ${formatUnits(
        hopResponse.estimation.requiredLiquidity,
        hopResponse.tokenDecimals,
      )}`}</div>
      <div>{`lpFees: ${formatUnits(
        hopResponse.estimation.lpFees,
        hopResponse.tokenDecimals,
      )}`}</div>
      <div>{`adjustedBonderFee: ${formatUnits(
        hopResponse.estimation.adjustedBonderFee,
        hopResponse.tokenDecimals,
      )}`}</div>
      <div>
        {`adjustedDestinationTxFee: ${formatUnits(
          hopResponse.estimation.adjustedDestinationTxFee,
          hopResponse.tokenDecimals,
        )}`}
      </div>
      <div>{`estimatedReceived: ${formatUnits(
        hopResponse.estimation.estimatedReceived,
        hopResponse.tokenDecimals,
      )}`}</div>
    </>
  )
}

export default Estimation

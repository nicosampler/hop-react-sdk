import { formatUnits } from '@ethersproject/units'
import { UseHopBridgeFunctionResponse } from 'hop-react-sdk'
import { formatNumber } from '../utils'
type Props = {
  hopResponse: UseHopBridgeFunctionResponse
}

function Estimation({ hopResponse }: Props) {
  return (
    <>
      <h3>Estimation</h3>
      <div className="row">
        <div className="col-6">{`amountOut: ${formatNumber(
          formatUnits(hopResponse.estimation.amountOut, hopResponse.tokenDecimals),
        )}`}</div>
        <div className="col-6">
          {`rate: ${formatNumber(hopResponse.estimation.rate.toString())}`}{' '}
        </div>
        <div className="col-6">{`priceImpact: ${formatNumber(
          hopResponse.estimation.priceImpact.toString(),
        )}`}</div>
        <div className="col-6">{`requiredLiquidity: ${formatNumber(
          formatUnits(hopResponse.estimation.requiredLiquidity, hopResponse.tokenDecimals),
        )}`}</div>
        <div className="col-6">{`lpFees: ${formatNumber(
          formatUnits(hopResponse.estimation.lpFees, hopResponse.tokenDecimals),
        )}`}</div>
        <div className="col-6">{`bonderFee: ${formatNumber(
          formatUnits(hopResponse.estimation.adjustedBonderFee, hopResponse.tokenDecimals),
        )}`}</div>
        <div className="col-6">
          {`destinationTxFee: ${formatNumber(
            formatUnits(hopResponse.estimation.adjustedDestinationTxFee, hopResponse.tokenDecimals),
          )}`}
        </div>
        <div className="col-6">{`estimatedReceived: ${formatNumber(
          formatUnits(hopResponse.estimation.estimatedReceived, hopResponse.tokenDecimals),
        )}`}</div>
      </div>
    </>
  )
}

export default Estimation

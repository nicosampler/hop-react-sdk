import React, { useEffect, useState } from 'react'

import { useEthers, useNetwork } from '@usedapp/core'
import {
  useHopBridge,
  getHopToken,
  UseHopBridgeFunctionResponse,
  bridgeChainNames,
  bridgeSymbols,
  BridgeSymbol,
  BridgeChainName,
  bridgeChainNameId,
  bridgeTokens,
} from 'hop-react-sdk'
import { JsonRpcProvider } from 'ethers/node_modules/@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { BigNumberInput } from 'big-number-input'
import { formatEther, formatUnits } from '@ethersproject/units'
import { Zero } from '@ethersproject/constants'

import AccountHandler from '../src/pageHelpers/AccountHandler '
import Estimation from '../src/pageHelpers/Estimation'
import { formatNumber } from '../src/utils'

function App() {
  const [selectedToken, setSelectedToken] = useState<BridgeSymbol>('USDC')
  const [selectedChainFrom, setSelectedChainFrom] = useState<BridgeChainName>('gnosis')
  const [selectedChainTo, setSelectedChainTo] = useState<BridgeChainName>('polygon')
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [txs, setTxs] = useState<
    { from: BridgeChainName; to: BridgeChainName; amount: string; link: string }[]
  >([])
  const { account, chainId: ethersChainId } = useEthers()
  const [accountBalance, setAccountBalance] = useState(Zero)
  const [tokenBalance, setTokenBalance] = useState(Zero)
  const {
    network: { provider },
  } = useNetwork()
  const initiateHopTransaction = useHopBridge({
    provider: provider as JsonRpcProvider,
  })
  const [hopResponse, setHopResponse] = useState<UseHopBridgeFunctionResponse | null>(null)
  const [isApprovalNeeded, setIsApprovalNeeded] = useState(false)
  const selectedTokenDecimals = bridgeTokens[selectedToken].decimals

  // get account chain balance
  useEffect(() => {
    if (account && provider) {
      provider?.getBalance(account).then(setAccountBalance)
    } else {
      setAccountBalance(Zero)
    }
  }, [account, provider])

  // get account token balance
  useEffect(() => {
    const calculateTokenBalance = async () => {
      const signer = provider?.getSigner()
      if (!signer) return

      const hopToken = getHopToken(signer, selectedToken, selectedChainFrom)
      const balance = await hopToken.balanceOf()
      setTokenBalance(balance)
    }
    calculateTokenBalance()
  }, [selectedToken, selectedChainFrom, provider, account])

  // clear amount when token changes
  useEffect(() => setAmount(''), [selectedToken])

  const initiateSwap = async () => {
    if (!account) {
      console.error('No account found')
      return
    }

    setLoading(true)

    try {
      const res = await initiateHopTransaction({
        token: selectedToken,
        fromChainName: selectedChainFrom,
        toChainName: selectedChainTo,
        tokenAmount: BigNumber.from(amount),
        toAddress: account,
        slippageTolerance: 0.5,
      })
      console.log({ res })
      setIsApprovalNeeded(res.isApprovalNeeded)
      setLoading(false)
      setHopResponse(res)
    } catch (error) {
      alert(error)
      setLoading(false)
    }
  }

  const sendSwap = async () => {
    if (!hopResponse) {
      return null
    }

    setLoading(true)
    const swapRes = await hopResponse.sendSwap()
    setLoading(false)

    if (swapRes.hopExplorerLink) {
      setTxs([
        ...txs,
        {
          from: selectedChainFrom,
          to: selectedChainTo,
          amount,
          link: swapRes.hopExplorerLink,
        },
      ])

      setLoading(false)
      setHopResponse(null)
      setAmount('')
    }
  }

  const approve = async () => {
    if (!hopResponse) {
      return
    }
    try {
      setLoading(true)
      const tx = await hopResponse.sendApproval()
      await tx.wait()
      setIsApprovalNeeded(true)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      alert(error)
    }
  }

  const areNetworksConsistent = () => ethersChainId === bridgeChainNameId[selectedChainFrom]

  return (
    <div className="container">
      <div className="col-8">
        <nav className="nav">
          <div className="nav-center">
            <h1>Hop React SDK</h1>
          </div>
        </nav>

        <AccountHandler
          chainBalance={`${formatNumber(formatEther(accountBalance || Zero))} ${
            provider?._network.name
          }`}
        />

        <br />

        {account && (
          <>
            <div className="card">
              <div className="row">
                <div className="col-3">
                  <select
                    value={selectedToken}
                    onChange={(event) => setSelectedToken(event.target.value as BridgeSymbol)}
                  >
                    {bridgeSymbols.map((tokenSymbols) => (
                      <option key={tokenSymbols} value={tokenSymbols}>
                        {tokenSymbols}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-4">
                  <select
                    value={selectedChainFrom}
                    onChange={(event) =>
                      setSelectedChainFrom(event.target.value as BridgeChainName)
                    }
                  >
                    {bridgeChainNames.map((chainName) => (
                      <option
                        key={chainName}
                        value={chainName}
                        disabled={chainName === selectedChainTo}
                      >
                        {chainName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-1">
                  <button
                    className="button icon-only"
                    onClick={() => {
                      setSelectedChainFrom(selectedChainTo)
                      setSelectedChainTo(selectedChainFrom)
                    }}
                  >
                    {'<>'}
                  </button>
                </div>

                <div className="col-4">
                  <select
                    value={selectedChainTo}
                    onChange={(event) => setSelectedChainTo(event.target.value as BridgeChainName)}
                  >
                    {bridgeChainNames.map((chainName) => (
                      <option
                        key={chainName}
                        value={chainName}
                        disabled={chainName === selectedChainFrom}
                      >
                        {chainName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row is-vertical-align">
                <div className="col-8">
                  <div className="row">
                    <div className="col-8">
                      <BigNumberInput
                        decimals={bridgeTokens[selectedToken].decimals}
                        value={amount}
                        onChange={setAmount}
                        renderInput={(props) => (
                          <input {...props} disabled={!!hopResponse || loading} />
                        )}
                      />
                    </div>
                    <div className="col-4 is-vertical-align">
                      {`${formatNumber(
                        formatUnits(tokenBalance, selectedTokenDecimals),
                      )} ${selectedToken}`}
                    </div>
                  </div>
                </div>

                <div className="col-4 is-right">
                  <button
                    className="button primary"
                    onClick={() => initiateSwap()}
                    disabled={
                      !account ||
                      loading ||
                      !amount ||
                      BigNumber.from(amount).eq(0) ||
                      ethersChainId !== bridgeChainNameId[selectedChainFrom] ||
                      BigNumber.from(amount).gt(tokenBalance)
                    }
                  >
                    Get Stats
                  </button>
                </div>
              </div>

              {!areNetworksConsistent() && (
                <div className="text-error">
                  Change connected wallet to {selectedChainFrom} chain.
                </div>
              )}

              {amount && BigNumber.from(amount).gt(tokenBalance) && (
                <div className="text-error">Not enough balance.</div>
              )}
            </div>

            <br />

            {loading && <div className="is-center text-primary">Loading...</div>}
            {hopResponse && (
              <div className="card">
                <Estimation hopResponse={hopResponse} />
                {hopResponse.estimation && (
                  <div className="is-center">
                    <button className="button" onClick={() => setHopResponse(null)}>
                      Cancel
                    </button>
                    {!isApprovalNeeded && (
                      <button
                        className="button primary"
                        onClick={sendSwap}
                        disabled={
                          !account ||
                          loading ||
                          !areNetworksConsistent() ||
                          (!!amount && BigNumber.from(amount).gt(tokenBalance))
                        }
                      >
                        {areNetworksConsistent() ? 'Send swap' : 'Wrong network'}
                      </button>
                    )}
                    {isApprovalNeeded && (
                      <button
                        className="button primary outline"
                        onClick={approve}
                        disabled={!account || !areNetworksConsistent()}
                      >
                        {areNetworksConsistent() ? `Approve ${selectedToken}` : 'Wrong network'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {txs.length > 0 &&
          txs.map((tx, index) => {
            return (
              <div key={index} className="card">
                <h3>Txs history</h3>
                <div className="row">
                  <div className="col-4">{`${tx.from} > ${tx.to}`}</div>
                  <div className="col-2">{formatUnits(tx.amount, selectedTokenDecimals)}</div>
                  <div className="col-4">
                    <a href={tx.link} target="_blank" rel="noreferrer">
                      hop explorer link
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default App

import React, { useEffect, useState } from 'react'

import { useEthers, useNetwork } from '@usedapp/core'
import {
  useHopBridge,
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
import AccountHandler from '../src/pageHelpers/AccountHandler '
import Estimation from '../src/pageHelpers/Estimation'
import { BigNumberInput } from 'big-number-input'

function App() {
  const [approvalNeeded, setApprovalNeeded] = useState(false)
  const [selectedToken, setSelectedToken] = useState<BridgeSymbol>('USDC')
  const [selectedChainFrom, setSelectedChainFrom] = useState<BridgeChainName>('gnosis')
  const [selectedChainTo, setSelectedChainTo] = useState<BridgeChainName>('polygon')
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [txs, setTxs] = useState<
    { from: BridgeChainName; to: BridgeChainName; amount: string; link: string }[]
  >([])

  const { account, chainId: ethersChainId } = useEthers()
  const {
    network: { provider },
  } = useNetwork()

  const initiateHopTransaction = useHopBridge({
    provider: provider as JsonRpcProvider,
  })

  const [hopResponse, setHopResponse] = useState<UseHopBridgeFunctionResponse | null>(null)

  useEffect(() => {
    setHopResponse(null)
  }, [account])

  const initiateSwap = async () => {
    if (!account) {
      console.error('No account found')
      return
    }

    setLoading(true)

    const res = await initiateHopTransaction({
      token: selectedToken,
      fromChainName: selectedChainFrom,
      toChainName: selectedChainTo,
      tokenAmount: BigNumber.from(amount),
      toAddress: account,
      slippageTolerance: 0.5,
    })

    setLoading(false)
    setApprovalNeeded(res.isApprovalNeeded)
    setHopResponse(res)
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
      setApprovalNeeded(false)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error(error)
    }
  }

  return (
    <div>
      <AccountHandler />

      {account && (
        <>
          <div>
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

            <select
              value={selectedChainFrom}
              onChange={(event) => setSelectedChainFrom(event.target.value as BridgeChainName)}
            >
              {bridgeChainNames.map((chainName) => (
                <option key={chainName} value={chainName} disabled={chainName === selectedChainTo}>
                  {chainName}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSelectedChainFrom(selectedChainTo)
                setSelectedChainTo(selectedChainFrom)
              }}
            >
              {'<>'}
            </button>

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

            <BigNumberInput
              decimals={bridgeTokens[selectedToken].decimals}
              value={amount}
              onChange={setAmount}
            />
          </div>

          {ethersChainId !== bridgeChainNameId[selectedChainFrom] && (
            <div>Change connected wallet to {selectedChainFrom} chain.</div>
          )}

          <button
            onClick={() => initiateSwap()}
            disabled={
              !account ||
              loading ||
              !amount ||
              BigNumber.from(amount).eq(0) ||
              ethersChainId !== bridgeChainNameId[selectedChainFrom]
            }
          >
            Get swap estimation
          </button>

          {loading && <div>Loading...</div>}

          {hopResponse && <Estimation hopResponse={hopResponse} />}

          {hopResponse?.estimation && (
            <div>
              {!approvalNeeded && (
                <button onClick={sendSwap} disabled={!account || loading}>
                  send swap
                </button>
              )}
            </div>
          )}

          {approvalNeeded && (
            <button onClick={approve} disabled={!account || loading}>
              Approve
            </button>
          )}
        </>
      )}

      {txs.length > 0 &&
        txs.map((tx, index) => {
          return (
            <div key={index}>
              <div>
                {tx.from} {' -> '} {tx.to} {'  '} {tx.amount}{' '}
                <a href={tx.link} target="_blank" rel="noreferrer">
                  hop explorer link
                </a>
              </div>
            </div>
          )
        })}
    </div>
  )
}

export default App

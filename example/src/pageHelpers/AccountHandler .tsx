import { useEthers, useNetwork } from '@usedapp/core'

function AccountHandler() {
  const { activateBrowserWallet, account, /* active, */ chainId: ethersChainId } = useEthers()
  const {
    network: { /* provider, */ chainId: networkChainId },
  } = useNetwork()

  return (
    <div>
      <div>account: {account}</div>
      <div>ethersChainId: {ethersChainId}</div>
      <div>networkChainId: {networkChainId}</div>
      {/* <div>active {active ? 'yes' : 'no'}</div>
      <div>provider: {provider ? 'yes' : 'no'}</div> */}

      {!account && <button onClick={activateBrowserWallet}>Connect</button>}
    </div>
  )
}

export default AccountHandler

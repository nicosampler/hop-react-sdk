import { useEthers, useNetwork } from '@usedapp/core'

function AccountHandler() {
  const { activateBrowserWallet, account, deactivate, chainId: ethersChainId } = useEthers()
  const {
    network: { chainId: networkChainId },
  } = useNetwork()

  return (
    <div>
      <div>
        account:{' '}
        {account ? (
          <div>
            {account} - <button onClick={deactivate}>Disconnect</button>
          </div>
        ) : (
          <button onClick={activateBrowserWallet}>Connect</button>
        )}
      </div>
      <div>ethersChainId: {ethersChainId}</div>
      <div>networkChainId: {networkChainId}</div>
    </div>
  )
}

export default AccountHandler

import { useEthers } from '@usedapp/core'

function AccountHandler({ chainBalance }: { chainBalance: string }) {
  const { activateBrowserWallet, account, deactivate, chainId: ethersChainId } = useEthers()

  return (
    <div>
      {account ? (
        <div className="card">
          <div className="is-full-width is-right">
            <button className="button outline" onClick={deactivate}>
              Disconnect
            </button>
          </div>
          <div>
            {`Address: ${account.substring(0, 6)}...${account.substring(
              account.length - 4,
              account.length,
            )}`}{' '}
          </div>

          <div>ChainId: {ethersChainId}</div>
          <div>ChainBalance: {chainBalance}</div>
        </div>
      ) : (
        <div className="is-center">
          <button className="button primary" onClick={activateBrowserWallet}>
            Connect
          </button>
        </div>
      )}
    </div>
  )
}

export default AccountHandler

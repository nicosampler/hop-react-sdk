# hop-react-sdk
Allows to bridge tokens through Hop Platform

## Usage

```tsx
// First, import the Hop SDK and some helpers
import {
  useHopBridge, // A hook to use the Hop bridge
  UseHopBridgeFunctionResponse, // Type of the hook response
  bridgeChainNames, // A list of available bridge chains
  bridgeSymbols, // A list of available bridge symbols
  bridgeChainNameId,
} from 'hop-react-sdk'
// Call useHopBridge to receive a function that will be called to initiate a Swap.
const initiateHopTransaction = useHopBridge({
  provider: provider as JsonRpcProvider,
})

const hopRes: UseHopBridgeFunctionResponse = await initiateHopTransaction({
  token, // The token to swap from. (bridgeSymbols)
  fromChainName, // The chain name of the token to swap from. (bridgeChainNames)
  toChainName, // The chain name of the token to swap to. (bridgeChainNames)
  tokenAmount, // Amount of tokens to send. (BigNumber)
  toAddress, // The address to send the token to.
  slippageTolerance: 0.5, 
})

// hopRes will receive an object with the following properties:
tokenDecimals: number;
estimation: CalculateSendResponse; // Some Stats about the Swap
isApprovalNeeded: boolean; // If the user needs to approve the Swap or not
sendApproval: () => Promise<TransactionResponse>; // A function to call the approve on the ERC20 token
sendSwap: () => Promise<{
  tx?: TransactionResponse;
  hopExplorerLink?: string;
  error?: any;
  formattedMessage?: string;
}>;

```

## Example app

We have developed an example app that allows using the Hop bridge.
You can find it in the `example` folder. To run the example app follow the steps below:

```bash
yarn install
yarn dev:example
```

## Building the SDK

```bash
yarn install
yarn build
```


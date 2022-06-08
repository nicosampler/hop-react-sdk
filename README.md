# hop-react-sdk
Allows to bridge tokens using thought HOP Platform

## Usage

```tsx
// First, import the HOP SDK and some helpers
import {
  useHopBridge, // a hook to use the HOP bridge
  UseHopBridgeFunctionResponse, // Type of the hook response
  bridgeChainNames, // a list of available bridge chains
  bridgeSymbols, // a list of available bridge symbols
  bridgeChainNameId,
} from 'hop-react-sdk'
// Call useHopBridge to receive a function that will be called to initiate a Swap.
const initiateHopTransaction = useHopBridge({
  provider: provider as JsonRpcProvider,
})

const res: UseHopBridgeFunctionResponse = await initiateHopTransaction({
  token, // the token to swap from. (bridgeSymbols)
  fromChainName, // the chain name of the token to swap from. (bridgeChainNames)
  toChainName, // the chain name of the token to swap to. (bridgeChainNames)
  tokenAmount, // amount of tokens to send. (BigNumberish)
  toAddress, // the address to send the token to.
  slippageTolerance: 0.5,
})

// res, will receive an object with the following properties:
tokenDecimals: number;
estimation: CalculateSendResponse; // stats about the Swap
isApprovalNeeded: boolean; // if the user needs to approve the Swap
sendApproval: () => Promise<TransactionResponse>; // a function to approve the Swap
sendSwap: () => Promise<{
  tx?: TransactionResponse;
  hopExplorerLink?: string;
  error?: any;
  formattedMessage?: string;
}>;

```

## Example app

We have developed an example app that allows using the HOP bridge.
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


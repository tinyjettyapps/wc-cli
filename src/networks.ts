// Networks and per-namespace methods/events, taken from the WalletConnect React
// test dapp (reown-com/web-examples advanced/dapps/react-dapp-v2: constants/default.ts,
// helpers/namespaces.ts, chains/*.ts). Regenerate from there if it changes.

export interface Network {
  id: string;
  name: string;
  testnet: boolean;
  aliases: string[];
}

export const NETWORKS: Network[] = [
  { id: "eip155:1", name: "Ethereum Mainnet", testnet: false, aliases: ["ethereum-mainnet", "ethereum", "eth"] },
  { id: "eip155:10", name: "Optimism Mainnet", testnet: false, aliases: ["optimism-mainnet", "optimism", "op"] },
  { id: "eip155:100", name: "xDAI", testnet: false, aliases: ["xdai", "gnosis"] },
  { id: "eip155:137", name: "Polygon Mainnet", testnet: false, aliases: ["polygon-mainnet", "polygon", "matic"] },
  { id: "eip155:324", name: "zkSync Era", testnet: false, aliases: ["zksync-era", "zksync"] },
  { id: "eip155:42161", name: "Arbitrum One", testnet: false, aliases: ["arbitrum-one", "arbitrum", "arb"] },
  { id: "eip155:42220", name: "Celo Mainnet", testnet: false, aliases: ["celo-mainnet", "celo"] },
  { id: "eip155:56", name: "BNB Smart Chain", testnet: false, aliases: ["bnb-smart-chain", "bsc", "bnb"] },
  { id: "eip155:143", name: "Monad", testnet: false, aliases: ["monad"] },
  { id: "eip155:36900", name: "ADI Chain", testnet: false, aliases: ["adi-chain", "adi"] },
  { id: "ton:-239", name: "TON Mainnet", testnet: false, aliases: ["ton-mainnet", "ton"] },
  { id: "cosmos:cosmoshub-4", name: "Cosmos Hub", testnet: false, aliases: ["cosmos-hub", "cosmos", "atom"] },
  { id: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", name: "Solana Mainnet", testnet: false, aliases: ["solana-mainnet", "solana", "sol"] },
  { id: "polkadot:91b171bb158e2d3848fa23a9f1c25182", name: "Polkadot Mainnet", testnet: false, aliases: ["polkadot-mainnet", "polkadot", "dot"] },
  { id: "mvx:1", name: "MultiversX Mainnet", testnet: false, aliases: ["multiversx-mainnet", "multiversx", "mvx"] },
  { id: "tron:0x2b6653dc", name: "Tron Mainnet", testnet: false, aliases: ["tron-mainnet", "tron", "trx"] },
  { id: "tezos:mainnet", name: "Tezos", testnet: false, aliases: ["tezos", "xtz"] },
  { id: "kadena:mainnet01", name: "Kadena", testnet: false, aliases: ["kadena"] },
  { id: "bip122:000000000019d6689c085ae165831e93", name: "BTC Mainnet", testnet: false, aliases: ["btc-mainnet", "bitcoin", "btc"] },
  { id: "sui:mainnet", name: "SUI Mainnet", testnet: false, aliases: ["sui-mainnet", "sui"] },
  { id: "stacks:1", name: "Stacks Mainnet", testnet: false, aliases: ["stacks-mainnet", "stacks", "stx"] },
  { id: "canton:mainnet", name: "Canton Network", testnet: false, aliases: ["canton-network", "canton"] },
  { id: "stellar:pubnet", name: "Stellar", testnet: false, aliases: ["stellar", "xlm"] },
  { id: "eip155:5", name: "Ethereum Goerli", testnet: true, aliases: ["ethereum-goerli", "goerli"] },
  { id: "eip155:11155111", name: "Ethereum Sepolia", testnet: true, aliases: ["ethereum-sepolia", "sepolia"] },
  { id: "eip155:280", name: "zkSync Era Testnet", testnet: true, aliases: ["zksync-era-testnet"] },
  { id: "eip155:420", name: "Optimism Goerli", testnet: true, aliases: ["optimism-goerli"] },
  { id: "eip155:80001", name: "Polygon Mumbai", testnet: true, aliases: ["polygon-mumbai"] },
  { id: "eip155:421611", name: "Arbitrum Rinkeby", testnet: true, aliases: ["arbitrum-rinkeby"] },
  { id: "eip155:44787", name: "Celo Alfajores", testnet: true, aliases: ["celo-alfajores"] },
  { id: "eip155:10143", name: "Monad Testnet", testnet: true, aliases: ["monad-testnet"] },
  { id: "ton:-3", name: "TON Testnet", testnet: true, aliases: ["ton-testnet"] },
  { id: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", name: "Solana Devnet", testnet: true, aliases: ["solana-devnet"] },
  { id: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z", name: "Solana Testnet", testnet: true, aliases: ["solana-testnet"] },
  { id: "polkadot:e143f23803ac50e8f6f8e62695d1ce9e", name: "Polkadot Testnet (Westend)", testnet: true, aliases: ["polkadot-testnet-westend"] },
  { id: "near:testnet", name: "NEAR Testnet", testnet: true, aliases: ["near-testnet", "near"] },
  { id: "mvx:D", name: "MultiversX Devnet", testnet: true, aliases: ["multiversx-devnet"] },
  { id: "tron:0xcd8690dc", name: "Tron Testnet (Nile)", testnet: true, aliases: ["tron-testnet-nile"] },
  { id: "tron:0x94a9059e", name: "Tron Testnet (Shasta)", testnet: true, aliases: ["tron-testnet-shasta"] },
  { id: "tezos:testnet", name: "Tezos Testnet", testnet: true, aliases: ["tezos-testnet"] },
  { id: "kadena:testnet04", name: "Kadena Testnet", testnet: true, aliases: ["kadena-testnet"] },
  { id: "bip122:000000000933ea01ad0ee984209779ba", name: "BTC Testnet", testnet: true, aliases: ["btc-testnet"] },
  { id: "sui:testnet", name: "SUI Testnet", testnet: true, aliases: ["sui-testnet"] },
  { id: "sui:devnet", name: "SUI Devnet", testnet: true, aliases: ["sui-devnet"] },
  { id: "stacks:2147483648", name: "Stacks Testnet", testnet: true, aliases: ["stacks-testnet"] },
  { id: "canton:devnet", name: "Canton Devnet", testnet: true, aliases: ["canton-devnet"] },
  { id: "stellar:testnet", name: "Stellar Testnet", testnet: true, aliases: ["stellar-testnet"] },
];

export const NAMESPACES: Record<
  string,
  { methods: string[]; optionalMethods: string[]; events: string[] }
> = {
  eip155: {
    methods: ["eth_sendTransaction", "personal_sign"],
    optionalMethods: ["eth_signTransaction", "eth_sign", "eth_signTypedData", "eth_signTypedData_v4", "wallet_getCapabilities", "wallet_sendCalls", "wallet_getCallsStatus", "wallet_grantPermissions"],
    events: ["chainChanged", "accountsChanged"],
  },
  ton: {
    methods: ["ton_sendMessage", "ton_signData"],
    optionalMethods: [],
    events: [],
  },
  cosmos: {
    methods: ["cosmos_signDirect", "cosmos_signAmino"],
    optionalMethods: [],
    events: [],
  },
  solana: {
    methods: ["solana_signTransaction", "solana_signMessage", "solana_signAndSendTransaction", "solana_signAllTransactions"],
    optionalMethods: [],
    events: [],
  },
  polkadot: {
    methods: ["polkadot_signTransaction", "polkadot_signMessage"],
    optionalMethods: [],
    events: [],
  },
  mvx: {
    methods: ["mvx_signTransaction", "mvx_signTransactions", "mvx_signMessage", "mvx_signLoginToken", "mvx_signNativeAuthToken", "mvx_cancelAction"],
    optionalMethods: [],
    events: [],
  },
  tron: {
    methods: ["tron_signTransaction", "tron_signMessage", "tron_sendTransaction"],
    optionalMethods: [],
    events: [],
  },
  tezos: {
    methods: ["tezos_getAccounts", "tezos_send", "tezos_sign"],
    optionalMethods: [],
    events: [],
  },
  kadena: {
    methods: ["kadena_getAccounts_v1", "kadena_sign_v1", "kadena_quicksign_v1"],
    optionalMethods: [],
    events: [],
  },
  bip122: {
    methods: ["sendTransfer", "getAccountAddresses", "signMessage", "signPsbt"],
    optionalMethods: [],
    events: ["bip122_addressesChanged"],
  },
  sui: {
    methods: ["sui_signTransaction", "sui_signAndExecuteTransaction", "sui_signPersonalMessage"],
    optionalMethods: [],
    events: ["sui_accountsChanged", "sui_chainChanged"],
  },
  stacks: {
    methods: ["stx_transferStx", "stx_signMessage"],
    optionalMethods: [],
    events: ["stx_chainChanged", "stx_accountsChanged"],
  },
  canton: {
    methods: ["canton_prepareSignExecute", "canton_listAccounts", "canton_getPrimaryAccount", "canton_getActiveNetwork", "canton_status", "canton_ledgerApi", "canton_signMessage"],
    optionalMethods: [],
    events: ["accountsChanged", "statusChanged"],
  },
  stellar: {
    methods: ["stellar_signXDR", "stellar_signAndSubmitXDR", "stellar_signMessage", "stellar_signAuthEntry"],
    optionalMethods: [],
    events: [],
  },
  near: {
    methods: ["near_signIn", "near_signOut", "near_getAccounts", "near_signAndSendTransaction", "near_signAndSendTransactions", "near_signTransaction", "near_signTransactions"],
    optionalMethods: [],
    events: [],
  },
};

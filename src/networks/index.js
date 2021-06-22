const ChainIds =  {
    Mainnet: 'mainnet',
    Testnet: 'testnet',
    TestnetSapphire: 'testnet_sapphire',
    Privatenet: 'privatenet',
    EliteEdgeTestnet: 'testnet_amber'
};

const Mainnet = {
    chainId: ChainIds.Mainnet,
    name: "Mainnet",
    rpcUrl: "https://theta-bridge-rpc.thetatoken.org/rpc",
    explorerUrl: "https://explorer.thetatoken.org",
    color: "#1BDED0",
};

const Testnet = {
    chainId: ChainIds.Testnet,
    name: "Testnet",
    rpcUrl: "http://theta-node-rpc-testnet.thetatoken.org:16888/rpc",
    explorerUrl: "https://beta-explorer.thetatoken.org",
    color: "#FF4A8D",
};

const TestnetSapphire = {
    chainId: ChainIds.TestnetSapphire,
    name: "Testnet (Sapphire)",
    rpcUrl: null,
    explorerUrl: null,
    color: "#3199F2",
};

const Privatenet = {
    chainId: ChainIds.Privatenet,
    name: "Smart Contracts Sandbox",
    rpcUrl: "https://theta-node-rpc-smart-contract-sandbox.thetatoken.org/rpc",
    explorerUrl: "https://smart-contract-testnet-explorer.thetatoken.org",
    color: "#7157FF",
};

const EliteEdgeTestnet = {
    chainId: ChainIds.EliteEdgeTestnet,
    name: "Elite Edge Testnet",
    rpcUrl: "http://35.235.73.165:16888/rpc",
    explorerUrl: "https://elite-edge-testnet-explorer.thetatoken.org",
    color: "#E0B421",
};

const networks = {
    [ChainIds.Mainnet]: Mainnet,
    [ChainIds.Testnet]: Testnet,
    [ChainIds.TestnetSapphire]: TestnetSapphire,
    [ChainIds.Privatenet]: Privatenet,
    [ChainIds.EliteEdgeTestnet]: EliteEdgeTestnet,
}

const getRPCUrlForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId]['rpcUrl'];
}

const getExplorerUrlForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId]['explorerUrl'];
}

const getNetworkForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId];
}

export {
    Mainnet,
    Testnet,
    TestnetSapphire,
    Privatenet,
    EliteEdgeTestnet,

    ChainIds,

    getRPCUrlForChainId,
    getExplorerUrlForChainId,
    getNetworkForChainId
};


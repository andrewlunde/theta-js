require('isomorphic-fetch');
const thetajs = require('..');
const {HttpProvider} = thetajs.providers;
const {ChainIds} = thetajs.networks;

function createHttpProvider(chainId){
    const provider = new HttpProvider(chainId);
    // provider.setRequestLogger(function(reqData){
    //     console.log(reqData);
    // });
    // HttpProvider.extraRequestOpts = {
    //     tester: true
    // }
    // HttpProvider.requestLogger = function(reqData){
    //     console.log(reqData);
    // };
    return provider;
}

test('should create a HttpProvider', () => {
    let provider = createHttpProvider(ChainIds.Mainnet);

    expect(provider).not.toBe(null);
});

test('should getAccount with a HttpProvider', async () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const address = "0x19dAe549081a1D5881eE925889685846fE06Fd9f";
    const account = await provider.getAccount(address);
    console.log('account == ');
    console.log(account);

    expect(account).not.toBe(null);
});

test('should getTransactionCount with a HttpProvider', async () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const address = "0x19dAe549081a1D5881eE925889685846fE06Fd9f";
    const count = await provider.getTransactionCount(address);

    expect(count).not.toBe(null);
});

const example = {
    request:
        {
            method: 'POST',
            body:
                '{"jsonrpc":"2.0","id":0,"method":"theta.GetStatus","params":{}}',
            headers: {'Content-Type': 'application/json'},
            url: 'https://theta-bridge-rpc.thetatoken.org/rpc'
        },
    response:
        {
            url: 'https://theta-bridge-rpc.thetatoken.org/rpc',
            status: 200,
            body:
                '{"jsonrpc":"2.0","id":0,"result":{"address":"0xaBe3FE7D5f42DF43870c517450b1Be306b85Afc8","chain_id":"mainnet","peer_id":"0xaBe3FE7D5f42DF43870c517450b1Be306b85Afc8","latest_finalized_block_hash":"0xf02d9ffd4551768386296f3661a1a3d4b1c2136b84d345a5afa394923814cfa8","latest_finalized_block_height":"10117849","latest_finalized_block_time":"1619475563","latest_finalized_block_epoch":"10196228","current_epoch":"10196230","current_height":"10117849","current_time":"1619475578","syncing":false}}\n'
        }
}

test('should getTransaction with a HttpProvider', async () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const transactionHash = "0xdcd49f2d25e457b3916cda14e069cd2d13c446658df97356e44e95a072d186e8";
    const transaction = await provider.getTransaction(transactionHash);

    expect(transaction).not.toBe(null);
});

test('should getBlock with a HttpProvider', async () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const blockHash = "0x54fe766347c620ad412be93a8091e3ab80a115ad46a77d2d557e4bb3e977c4a1";
    const transaction = await provider.getBlock(blockHash);

    expect(transaction).not.toBe(null);
});

test('should getBlockByHeight with a HttpProvider', async () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const blockHeight = "7801192";
    const transaction = await provider.getBlockByHeight(blockHeight);

    expect(transaction).not.toBe(null);
});

test('should getBlockNumber with a HttpProvider', async () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const number = await provider.getBlockNumber();

    expect(number).not.toBe(null);
});

require('isomorphic-fetch');
const thetajs = require('..');
const {HttpProvider} = thetajs.providers;
const {ChainIds} = thetajs.networks;

function createHttpProvider(chainId){
    const provider = new HttpProvider(chainId);
    provider.setRequestLogger(function(reqData){
        console.log(reqData);
    });
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

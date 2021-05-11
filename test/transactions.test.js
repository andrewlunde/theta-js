require('isomorphic-fetch');
const BigNumber = require('bignumber.js');
const thetajs = require('..');
const Wallet = thetajs.Wallet;
const {SendTransaction, DepositStakeV2Transaction, WithdrawStakeTransaction} = thetajs.transactions;
const {HttpProvider} = thetajs.providers;
const {ChainIds} = thetajs.networks;
const {StakePurpose} = thetajs.constants;

function createHttpProvider(chainId){
    const provider = new HttpProvider(chainId);
    return provider;
}

function createSendTransaction(){
    const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei
    const thetaWeiToSend = (new BigNumber(0));
    const tfuelWeiToSend = (new BigNumber(0.0001)).multipliedBy(ten18);
    const senderAddr =  "0x59c32D1F9fF59FE524aaA34B703C0aC8Fad4d4d0";
    const receiverAddr = "0xB91f6163E6f1A60b6d932dcD1C190BD364e0df05";
    const txData = {
        from: senderAddr,
        outputs: [
            {
                address: receiverAddr,
                thetaWei: thetaWeiToSend,
                tfuelWei: tfuelWeiToSend,
            }
        ]
    }

    let tx = new SendTransaction(txData);

    return tx;
}

function createDepositStakeTransaction(){
    const ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei, 1 Gamma = 10^ TFuelWei
    const thetaWeiToStake = (new BigNumber(10000)).multipliedBy(ten18);
    const source =  "0x59c32D1F9fF59FE524aaA34B703C0aC8Fad4d4d0";
    const holderSummary = "0x51bB30dDC5C2b42ca042Bf58b283fcA4B0a59307a746f3fe492607c743c52a1fb729cb432e6b3971fb51fb08ea66c5c3042bab805d98a06c4c503a8621c937c292d8d2ac8c0b6eef8ec400936bbce9895656f30220218d00e70fa05981a2335779415bdcbf36d46702cd0ee794ff251ab0ad8713058507380a935bece580ff0d8521d15ed888e934fbaabe346f320bc9817f455107bc5c47fbf8147b5fea266624cb0c24da5563b790fbe94fa377d6a8eec532e45f6f25e9f5aebe299476f5268bb7c1336dfb46861b1b0dd4e33267db5a27c70100086038c6be37c58db09f02361a04bd01";

    const txData = {
        source: source,
        holderSummary: holderSummary,
        stake: thetaWeiToStake,
        purpose: StakePurpose.StakeForGuardian
    }

    let tx = new DepositStakeV2Transaction(txData);

    return tx;
}

function createWithdrawStakeTransaction(){
    const source =  "0x59c32D1F9fF59FE524aaA34B703C0aC8Fad4d4d0";
    const holder = "0x8f3bc1b9adf6e543efe1f4021025aa974a8ee819";

    const txData = {
        source: source,
        holder: holder,
        purpose: StakePurpose.StakeForGuardian
    }

    let tx = new WithdrawStakeTransaction(txData);

    return tx;
}





test('should create a SendTransaction', () => {
    const sendTx = createSendTransaction();

    expect(sendTx).not.toBe(null);
});

test('should sign a SendTransaction', () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const privateKey = "0x19f66b5f75f0cf6fe4fbbcca24aba2031031affef8b596b922b9dfd669f8f5ae";
    const wallet = new Wallet(privateKey, provider);
    const transaction = createSendTransaction();
    const signedRawTxBytes = wallet.signTransaction(transaction);

    expect(signedRawTxBytes).not.toBe(null);
});

test('should send 0.0001 TFUEL to 0xB91f6163E6f1A60b6d932dcD1C190BD364e0df05 [via signer]', async () => {
    const provider = new HttpProvider(ChainIds.Privatenet);
    provider.setBroadcastAsync(true);
    const privateKey = "0xc88b2d8a81ceea76b41e005556c1c77c0062a5ba0566a1fe214770f485adde4f";
    const wallet = new Wallet(privateKey, provider);
    const transaction = createSendTransaction();
    const result = await wallet.sendTransaction(transaction);

    expect(result.hash).not.toBe(null);
});





test('should create a DepositStakeTransaction', () => {
    const sendTx = createDepositStakeTransaction();

    expect(sendTx).not.toBe(null);
});

test('should sign a DepositStakeTransaction', () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const privateKey = "0x19f66b5f75f0cf6fe4fbbcca24aba2031031affef8b596b922b9dfd669f8f5ae";
    const wallet = new Wallet(privateKey, provider);
    const transaction = createDepositStakeTransaction();
    const signedRawTxBytes = wallet.signTransaction(transaction);

    expect(signedRawTxBytes).not.toBe(null);
});





test('should create a WithdrawStakeTransaction', () => {
    const sendTx = createWithdrawStakeTransaction();

    expect(sendTx).not.toBe(null);
});

test('should sign a WithdrawStakeTransaction', () => {
    const provider = createHttpProvider(ChainIds.Mainnet);
    const privateKey = "0x19f66b5f75f0cf6fe4fbbcca24aba2031031affef8b596b922b9dfd669f8f5ae";
    const wallet = new Wallet(privateKey, provider);
    const transaction = createWithdrawStakeTransaction();
    const signedRawTxBytes = wallet.signTransaction(transaction);

    expect(signedRawTxBytes).not.toBe(null);
});

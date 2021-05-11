require('isomorphic-fetch');
const thetajs = require('..');
const Wallet = thetajs.Wallet;
const {HttpProvider} = thetajs.providers;
const {ChainIds} = thetajs.networks;

test('should create a random Wallet', () => {
    const wallet = Wallet.createRandom()
    expect(wallet).not.toBe(null);
});

test('should create a Wallet from mnemonic', () => {
    const expectedWalletAddress = "0x95944D0F9C86794284ABc375616C83B0E6A1A8B7";
    const mnemonic = "remain sorry remember trick purse also roast kidney history dragon fatigue chuckle";
    const wallet = Wallet.fromMnemonic(mnemonic);

    expect(wallet.address).toBe(expectedWalletAddress);
});

test('should create a Wallet from mnemonic index 0', () => {
    //This should match the wallet returned without passing in a custom path!
    const expectedWalletAddress = "0x95944D0F9C86794284ABc375616C83B0E6A1A8B7";
    const mnemonic = "remain sorry remember trick purse also roast kidney history dragon fatigue chuckle";
    const wallet = Wallet.fromMnemonic(mnemonic, null, {
        path: `${thetajs.constants.DerivationPaths.Theta}0`
    });

    expect(wallet.address).toBe(expectedWalletAddress);
});

test('should create a Wallet from mnemonic index 1', () => {
    const expectedWalletAddress = "0x471E2Aa03dbDc153a92b89Fb10B67020b729BD98";
    const mnemonic = "remain sorry remember trick purse also roast kidney history dragon fatigue chuckle";
    const wallet = Wallet.fromMnemonic(mnemonic, null, {
        path: `${thetajs.constants.DerivationPaths.Theta}1`
    });

    expect(wallet.address).toBe(expectedWalletAddress);
});

test('should create a Wallet from private key', () => {
    const expectedWalletAddress = "0x95944D0F9C86794284ABc375616C83B0E6A1A8B7";
    const privateKey = "0x19f66b5f75f0cf6fe4fbbcca24aba2031031affef8b596b922b9dfd669f8f5ae";
    const wallet = new Wallet(privateKey);

    expect(wallet.address).toBe(expectedWalletAddress);
});

test('should encrypt a Wallet to json with password qwertyuiop', async () => {
    const privateKey = "0x19f66b5f75f0cf6fe4fbbcca24aba2031031affef8b596b922b9dfd669f8f5ae";
    const password = "qwertyuiop";
    const wallet = new Wallet(privateKey);
    const json = await wallet.encryptToJson(password);

    expect(json).not.toBe(null);
});

test('should decrypt a Wallet with password qwertyuiop', async () => {
    const expectedWalletAddress = "0x95944D0F9C86794284ABc375616C83B0E6A1A8B7";
    const json = "{\"version\":3,\"id\":\"65da41e2-4c0a-487a-b2a4-2e5785786917\",\"address\":\"95944d0f9c86794284abc375616c83b0e6a1a8b7\",\"crypto\":{\"ciphertext\":\"f50a7176a4b6fb2dd402a3cedb9a9b7660566e9f2d6c4a800c7f20fb061aecb2\",\"cipherparams\":{\"iv\":\"75f7c49fabc77fbc78177e86cc7c2ff2\"},\"cipher\":\"aes-128-ctr\",\"kdf\":\"scrypt\",\"kdfparams\":{\"dklen\":32,\"salt\":\"68798f658e6adeeb2de05aaeaa9699c10281f9837966824f4d34a4b53bb4a7d3\",\"n\":8192,\"r\":8,\"p\":1},\"mac\":\"d46c1baa5228a8f31343f16bcccdb70adabbbd2b8577605c56e14dbc093f212c\"}}"
    const password = "qwertyuiop";
    const decryptedWallet = Wallet.fromEncryptedJson(json, password);

    expect(decryptedWallet.address).toBe(expectedWalletAddress);
});

test('should decrypt a Wallet with password qwertyuiop with a provider', async () => {
    const expectedWalletAddress = "0x95944D0F9C86794284ABc375616C83B0E6A1A8B7";
    const json = "{\"version\":3,\"id\":\"65da41e2-4c0a-487a-b2a4-2e5785786917\",\"address\":\"95944d0f9c86794284abc375616c83b0e6a1a8b7\",\"crypto\":{\"ciphertext\":\"f50a7176a4b6fb2dd402a3cedb9a9b7660566e9f2d6c4a800c7f20fb061aecb2\",\"cipherparams\":{\"iv\":\"75f7c49fabc77fbc78177e86cc7c2ff2\"},\"cipher\":\"aes-128-ctr\",\"kdf\":\"scrypt\",\"kdfparams\":{\"dklen\":32,\"salt\":\"68798f658e6adeeb2de05aaeaa9699c10281f9837966824f4d34a4b53bb4a7d3\",\"n\":8192,\"r\":8,\"p\":1},\"mac\":\"d46c1baa5228a8f31343f16bcccdb70adabbbd2b8577605c56e14dbc093f212c\"}}"
    const password = "qwertyuiop";
    const provider = new HttpProvider(ChainIds.Mainnet);
    const decryptedWallet = Wallet.fromEncryptedJson(json, password, provider);

    expect(decryptedWallet.address).toBe(expectedWalletAddress);
    expect(decryptedWallet.provider).not.toBe(null);
});

test('should sign message "hello world"', () => {
    const expectedSignature = "0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b81c";
    const privateKey = "0x0123456789012345678901234567890123456789012345678901234567890123";
    const wallet = new Wallet(privateKey);
    const signature = wallet.signMessage('hello world');

    expect(signature).toBe(expectedSignature);
});

test('should sign typed date', () => {
    const expectedSignature = "0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c";
    const privateKey = "0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4";
    const wallet = new Wallet(privateKey);

    const testInfo = {
        name: "EIP712 example",
        domain: {
            name: 'Ether Mail',
            version: '1',
            chainId: 1,
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
        },
        primaryType: "Mail",
        types: {
            Person: [
                { name: 'name', type: 'string' },
                { name: 'wallet', type: 'address' }
            ],
            Mail: [
                { name: 'from', type: 'Person' },
                { name: 'to', type: 'Person' },
                { name: 'contents', type: 'string' }
            ]
        },
        data: {
            from: {
                name: 'Cow',
                wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
            },
            to: {
                name: 'Bob',
                wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
            },
            contents: 'Hello, Bob!'
        },
        encoded: "0xa0cedeb2dc280ba39b857546d74f5549c3a1d7bdc2dd96bf881f76108e23dac2fc71e5fa27ff56c350aa531bc129ebdf613b772b6604664f5d8dbe21b85eb0c8cd54f074a4af31b4411ff6a60c9719dbd559c221c8ac3492d9d872b041d703d1b5aadf3154a261abdd9086fc627b61efca26ae5702701d05cd2305f7c52a2fc8",
        digest: "0xbe609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2",
        privateKey: "0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4",
        signature: "0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c"
    };

    const signature = wallet.signTypedData(testInfo.domain, testInfo.types, testInfo.data);

    expect(signature).toBe(expectedSignature);
});

test('should sign typed data with Order', () => {
    const expectedSignature = "0x48c1ac431acefbaf51399edd83e2da0e51ef6def86f3009ec776e53fc3b8c6d32c9a29e1202ec9cbf8f8c976024ca8d5f58b972fb28d1d69c11c680a818ceebf1c";
    const privateKey = "0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4";
    const wallet = new Wallet(privateKey);

    const testInfo2 = {
        types:
            {
                Order: [{name: 'registry', type: 'address'},
                    {name: 'maker', type: 'address'},
                    {name: 'staticTarget', type: 'address'},
                    {name: 'staticSelector', type: 'bytes4'},
                    {name: 'staticExtradata', type: 'bytes'},
                    {name: 'maximumFill', type: 'uint256'},
                    {name: 'listingTime', type: 'uint256'},
                    {name: 'expirationTime', type: 'uint256'},
                    {name: 'salt', type: 'uint256'}
                ]
            },
        domain:
            {
                name: 'Wyvern Exchange',
                version: '3.1',
                chainId: 50,
                verifyingContract: '0x4fcc4889107e2d169ca2715284e1afc4e3f64e18'
            },
        primaryType: 'Order',
        message:
            {
                registry: '0x7c65500d6f119228643ba0872f0861eb9f29a7e3',
                maker: '0x1cEb88E721c9Da4B25305274Fd8859F1e5462100',
                staticTarget: '0x2b719f42774f56e743b5ef0443ff77ef6e307448',
                staticSelector: '0xba352743',
                staticExtradata:
                    '0x0000000000000000000000004227812d28dba6cba23bed6d2875403eb1df71900000000000000000000000004227812d28dba6cba23bed6d2875403eb1df719000000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000000000004',
                maximumFill: '1',
                listingTime: '0',
                expirationTime: '10000000000',
                salt: '3'
            }
    }

    const signature = wallet.signTypedData(testInfo2.domain, testInfo2.types, testInfo2.message)

    expect(signature).toBe(expectedSignature);
});

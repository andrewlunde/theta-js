import ethers from 'ethers';
import {BaseSigner} from "../signers/index";
import {sign, serialize} from "../transactions/index";
import {DerivationPaths} from "../constants/index";
import {sha3} from "../crypto";
import {concat, joinSignature} from "@ethersproject/bytes";
import {toUtf8Bytes} from "@ethersproject/strings";
import { _TypedDataEncoder } from "@ethersproject/hash";

const {
    defineReadOnly, computeAddress, getAddress,
    HDNode, entropyToMnemonic,
    randomBytes, isHexString,
    SigningKey
} = ethers.utils;

function isAccount(value) {
    return (value != null && isHexString(value.privateKey, 32) && value.address != null);
}

function hasMnemonic(value) {
    const mnemonic = value.mnemonic;
    return (mnemonic && mnemonic.phrase);
}

const messagePrefix = "\x19Ethereum Signed Message:\n"; // potential for cross-chain support

function hashMessage(message){
    if(typeof (message) === "string"){
        message = toUtf8Bytes(message);
    }

    return sha3(concat([
        toUtf8Bytes(messagePrefix),
        toUtf8Bytes(String(message.length)),
        message
    ]));
}

export default class Wallet extends BaseSigner {
    constructor(privateKeyOrAccount, provider) {
        super();

        if (isAccount(privateKeyOrAccount)) {
            const account = privateKeyOrAccount;
            const signingKey = new SigningKey(account.privateKey);
            defineReadOnly(this, "_signingKey", () => signingKey);
            defineReadOnly(this, "address", computeAddress(this.publicKey));

            if (this.address !== getAddress(account.address)) {
                //TODO: throw error - privateKey/address mismatch
            }

            if (hasMnemonic(privateKeyOrAccount)) {
                const srcMnemonic = privateKeyOrAccount.mnemonic;
                defineReadOnly(this, "_mnemonic", () => (
                    {
                        phrase: srcMnemonic.phrase,
                        path: srcMnemonic.path || DerivationPaths.Default,
                        locale: srcMnemonic.locale
                    }
                ));
            } else {
                defineReadOnly(this, "_mnemonic", () => null);
            }
        }
        else {
            if (SigningKey.isSigningKey(privateKeyOrAccount)) {
                /* istanbul ignore if */
                const signingKey = privateKeyOrAccount;
                if (signingKey.curve !== "secp256k1") {
                    //TODO: throw error - unsupported curve; must be secp256k1
                }
                defineReadOnly(this, "_signingKey", () => signingKey);
            }
            else {
                const privateKey = privateKeyOrAccount;
                const signingKey = new SigningKey(privateKey);
                defineReadOnly(this, "_signingKey", () => signingKey);
            }
            defineReadOnly(this, "_mnemonic", () => null);
            defineReadOnly(this, "address", computeAddress(this.publicKey));
        }

        defineReadOnly(this, "provider", provider || null);
    }

    get mnemonic() {
        return this._mnemonic();
    }

    get privateKey() {
        return this._signingKey().privateKey;
    }

    get publicKey() {
        return this._signingKey().publicKey;
    }

    getChainId() {
        return this.provider.getChainId();
    }

    getAddress() {
        return this.address;
    }

    getAccount() {
        return {
            address: this.getAddress(),
            privateKey: this.privateKey
        };
    }

    connect(provider) {
        return new Wallet(this, provider);
    }

    signTransaction(transaction) {
        const signature = sign(this.getChainId(), transaction, this.privateKey);
        return serialize(transaction, signature);
    }

    signMessage(message){
        return joinSignature(this._signingKey().signDigest(hashMessage(message)));
    }

    signTypedData(domain, types, value){
        return joinSignature(this._signingKey().signDigest(_TypedDataEncoder.hash(domain, types, value)));
    }

    async encryptToJson(password) {
        const wallet = new ethers.Wallet(this.privateKey);
        const json = await wallet.encrypt(password);

        return json;
    }

    /**
     *  Static methods to create Wallet instances. Provider is optional.
     *  Provider can be connected later by calling connect()
     */
    static createRandom(provider) {
        let entropy = randomBytes(16);
        const mnemonic = entropyToMnemonic(entropy);

        return Wallet.fromMnemonic(mnemonic, provider);
    }

    static fromEncryptedJson(json, password, provider) {
        const wallet = ethers.Wallet.fromEncryptedJsonSync(json, password);
        const privateKey = wallet.privateKey;
        return new Wallet(privateKey, provider);
    }

    static fromMnemonic(mnemonic, provider, opts) {
        opts = opts || {};
        const path = opts.path || DerivationPaths.Default;
        const account = HDNode.fromMnemonic(mnemonic, null).derivePath(path);
        return new Wallet(account, provider);
    }
}

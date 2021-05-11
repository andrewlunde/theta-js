import {BaseSigner} from "./BaseSigner";


export default class PartnerVaultWallet extends BaseSigner {
    constructor(provider, userWalletAddress) {
        super();

        this.provider = provider;
        this._userWalletAddress = userWalletAddress;
    }

    setUserWalletAddress(userWalletAddress){
        this._userWalletAddress = userWalletAddress;
    }

    // Returns the checksum address
    getAddress(){
        return this._userWalletAddress;
    }

    signTransaction(transaction) {
        //No signing
        return null;
    }

    async sendTransaction(transaction) {
        //No signing, no sequence injection
        return await this.provider.sendTransaction(transaction);
    }
}

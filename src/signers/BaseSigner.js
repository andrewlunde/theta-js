import _ from 'lodash';

// Sub-Class Notes:
//  - A Signer MUST always make sure, that if present, the "from" field
//    matches the Signer, before sending or signing a transaction
//  - A Signer SHOULD always wrap private information (such as a private
//    key or mnemonic) in a function, so that console.log does not leak
//    the data

export class BaseSigner {
    ///////////////////
    // Sub-classes MUST call super
    constructor() {
        this._isSigner = true;
    }

    ///////////////////
    // Sub-classes MUST implement these

    // Returns the checksum address
    getAddress(){
        return null;
    }

    // Signs a transaxction and returns the fully serialized, signed transaction.
    // The EXACT transaction MUST be signed, and NO additional properties to be added.
    // - This MAY throw if signing transactions is not supports, but if
    //   it does, sentTransaction MUST be overridden.
    signTransaction(transaction){
        return null;
    }

    // Returns a new instance of the Signer, connected to provider.
    // This MAY throw if changing providers is not supported.
    connect(provider){
        return null;
    }

    ///////////////////
    // Sub-classes MAY override these

    async getAccount() {
        return await this.provider.getAccount(this.getAddress());
    }

    async getTransactionCount() {
        return await this.provider.getTransactionCount(this.getAddress());
    }

    // Populates "from" if unspecified, and calls with the transation
    async callSmartContract(transaction) {
        return await this.provider.callSmartContract(transaction);
    }

    // Populates all fields in a transaction, signs it and sends it to the network
    async sendTransaction(transaction) {
        if(_.isNil(transaction.getSequenceOverride())){
            let sequence = await this.getTransactionCount();
            sequence = sequence + 1;
            transaction.setSequence(sequence);
        }
        const signedTx = this.signTransaction(transaction);

        return await this.provider.sendTransaction(signedTx);
    }

    getChainId() {
        return this.provider.getChainId();
    }
}


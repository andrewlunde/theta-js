// I think the problem is that I'm not encoding the source payload properly before signing it.
// Also, it's unclear if how setSignature gets called from the inherited container.
// rlpInput may be wrong depending on how it's used to represend the payload
// I am logging signature values from the GoLang calls, but that doesn't mean that they have
//   to match exactly just decode properly.  Not sure.  -Andrew

class ServicePaymentTransaction extends BaseTransaction{
    constructor(tx){
        super(tx);

        //TODO ensure these fields are here
        let {source, target, payment_seq, reserve_seq, resource_id, theta, tfuel, gasPrice } = tx;

        //Set default gas price if needed
        if(_.isNil(gasPrice)){
            gasPrice = gasPriceDefault;
        }

        let feeInTFuelWeiBN = BigNumber.isBigNumber(gasPrice) ? gasPrice : (new BigNumber(gasPrice));

        this.fee = new Coins(new BigNumber(0), feeInTFuelWeiBN);

        let sourceInThetaWeiBN = BigNumber.isBigNumber(theta) ? theta : (new BigNumber(theta));
        let sourceInTFuelWeiBN = BigNumber.isBigNumber(tfuel) ? tfuel : (new BigNumber(tfuel));

        let txSource = new TxInput(source, sourceInThetaWeiBN, sourceInTFuelWeiBN, payment_seq);
        this.source = txSource;

        let targetInThetaWeiBN = BigNumber.isBigNumber(theta) ? theta : (new BigNumber(theta));
        let targetInTFuelWeiBN = BigNumber.isBigNumber(tfuel) ? tfuel : (new BigNumber(tfuel));

        let txTarget = new TxInput(target, targetInThetaWeiBN, targetInTFuelWeiBN, 0);
        this.target = txTarget;

        if(_.isNil(payment_seq)){
            this.setSequence(1);
        }

        this.payment_sequence = payment_seq;
        this.reserve_sequence = reserve_seq;
        this.resource_id = resource_id;
    }

    setSequence(sequence){
        const input = this.source;
        input.payment_seq = sequence;
    }

    getSequence(){
        return this.source.payment_seq;
    }

    setFrom(address){
        let firstInput = this.inputs[0];
        firstInput.address = address;
        this.inputs = [firstInput];
    }

    setSignature(signature){
        let source = this.source;
        source.setSignature(signature);
    }

    setSourceSignature(signature){
        let source = this.source;
        source.setSignature(signature);
    }

    setTargetSignature(signature){
        let target = this.target;
        target.setSignature(signature);
    }

    signBytes(chainID){
        // Detach the existing signature from the source if any, so that we don't sign the signature
        let sig = this.source.signature;

        this.source.signature = "";

        let encodedChainID = RLP.encode(Bytes.fromString(chainID));
        let encodedTxType = RLP.encode(Bytes.fromNumber(this.getType()));
        let encodedTx = RLP.encode(this.rlpInput());
        let payload = encodedChainID + encodedTxType.slice(2) + encodedTx.slice(2);

        // For ethereum tx compatibility, encode the tx as the payload
        let ethTxWrapper = new EthereumTx(payload);
        let signedBytes = RLP.encode(ethTxWrapper.rlpInput()); // the signBytes conforms to the Ethereum raw tx format

        // Attach the original signature back to the source
        this.source.signature = sig;

        return signedBytes;
    }

    sourceSignBytes(chainID) {
        //     signBytes := encodeToBytes(chainID)
        // 8a707269766174656e6574
        let encodedChainID = RLP.encode(Bytes.fromString(chainID));
        //console.log("signBytes:\n" + JSON.stringify(transaction,null,2));
        console.log("encodedChainID:" + encodedChainID);
        console.log("encodedChainID:" + "  8a707269766174656e6574");
        //var signBytes = utils.bytesToHex(chainID);
    //     source := tx.Source
        let source = this.source;
    //     target := tx.Target
        let target = this.target;
    //     fee := tx.Fee
        let fee = this.fee;

    //     tx.Source = TxInput{Address: source.Address, Coins: source.Coins}
        this.source = new TxInput(source.address, source.coins.thetaWei, source.coins.tfuelWei);
    //     tx.Target = TxInput{Address: target.Address}
        this.target = new TxInput(target.address);
    //     tx.Fee = NewCoins(0, 0)
        this.fee = new Coins(0, 0);
        // delete this._rawTx;
        this.source.sequence = "0";
        // this.target.signature = null;
        // this.target.sequence = "0";
        // this.target.coins.thetawei = null;
        // this.target.coins.tfuelwei = null;
        console.log("tx:\n" + JSON.stringify(this,null,2));
    // //     txBytes, _ := TxToBytes(tx)
        // 05f849c28080e2942e833968e5bb786ae419c4d13189fb081cc43babca80887ce66c50e28400008080da9470f587259738cb626a1720af7038b8dcdb6a42a0c28080808004058568656c6c6f
        // 05f84...6c6f
        let encodedTxType = RLP.encode(Bytes.fromNumber(this.getType()));
        let encodedTx = RLP.encode(this.rlpInput());
    //     signBytes = append(signBytes, txBytes...)
        console.log("encodedTx:" + encodedTx);
        console.log("encodedTx:" + "  05f849c28080e2942e833968e5bb786ae419c4d13189fb081cc43babca80887ce66c50e28400008080da9470f587259738cb626a1720af7038b8dcdb6a42a0c28080808004058568656c6c6f");

        let payload = encodedChainID + encodedTxType.slice(2) + encodedTx.slice(2);

        //let payload = encodedChainID + encodedTx.slice(2);
// f87280808094000000000000000000000000000000000000000080b857
        // For ethereum tx compatibility, encode the tx as the payload
        let ethTxWrapper = new EthereumTx(payload);
        let signedBytes = RLP.encode(ethTxWrapper.rlpInput()); // the signBytes conforms to the Ethereum raw tx format

    //     tx.Source = source
        this.source = source;
    //     tx.Target = target
        this.target = target;
    //     tx.Fee = fee
        this.fee = fee;
    
    //     signedBytes = addPrefixForSignBytes(signedBytes)
        console.log("signedBytes:" + signedBytes);
        console.log("signedBytes:" + "  f87280808094000000000000000000000000000000000000000080b8578a707269766174656e657405f849c28080e2942e833968e5bb786ae419c4d13189fb081cc43babca80887ce66c50e28400008080da9470f587259738cb626a1720af7038b8dcdb6a42a0c28080808004058568656c6c6f");
        //f87280808094000000000000000000000000000000000000000080b857-8a707269766174656e6574-05f849c28080e2942e833968e5bb786ae419c4d13189fb081cc43babca80887ce66c50e28400008080da9470f587259738cb626a1720af7038b8dcdb6a42a0c28080808004058568656c6c6f
        return signedBytes;
    }
    
    targetSignBytes(chainID) {
	// // TODO: remove chainID from all Tx sign bytes.
	// signBytes := encodeToBytes(chainID)
        let encodedChainID = RLP.encode(Bytes.fromString(chainID));
	// targetSig := tx.Target.Signature
        let targetSig = this.target.signature;
	// tx.Target.Signature = nil
        this.target.signature = "";

        this.target.sequence = "0";
        // delete this._rawTx;

        console.log("tx:\n" + JSON.stringify(this,null,2));

	// txBytes, _ := TxToBytes(tx)
        let encodedTxType = RLP.encode(Bytes.fromNumber(this.getType()));
        let encodedTx = RLP.encode(this.rlpInput());
    //let encodedTx = RLP.encode(this);

	// signBytes = append(signBytes, txBytes...)
        let payload = encodedChainID + encodedTxType.slice(2) + encodedTx.slice(2);

	// signBytes = addPrefixForSignBytes(signBytes)
        // f87280808094000000000000000000000000000000000000000080b857
        // For ethereum tx compatibility, encode the tx as the payload
        let ethTxWrapper = new EthereumTx(payload);
        let signedBytes = RLP.encode(ethTxWrapper.rlpInput()); // the signBytes conforms to the Ethereum raw tx format

	// tx.Target.Signature = targetSig
        this.target.signature = targetSig;
	// return signBytes
        return signedBytes;
    }
    
    getType(){
        return TxType.ServicePayment;
    }

    rlpInput(){

        let rlpInput = [
            this.fee.rlpInput(),
            this.source.rlpInput(),
            this.target.rlpInput(),
//            Bytes.fromNumber(this.payment_sequence),
//            Bytes.fromNumber(this.reserve_sequence),
            this.payment_sequence,
            this.reserve_sequence,
            this.resource_id,
        ];

        return rlpInput;
    }
}
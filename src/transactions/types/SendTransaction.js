import _ from 'lodash';
import BaseTransaction from '../common/BaseTransaction'
import TxInput from '../common/TxInput'
import TxOutput from '../common/TxOutput'
import TxType from '../common/TxType'
import Coins from '../common/Coins'
import EthereumTx from '../common/EthereumTx'
import BigNumber from "bignumber.js"
import RLP from 'eth-lib/lib/rlp';
import Bytes from 'eth-lib/lib/bytes';
import {gasPriceDefault} from '../../constants/index';

export default class SendTransaction extends BaseTransaction{
    constructor(tx){
        super(tx);

        //TODO ensure these fields are here
        let {from, outputs, gasPrice, sequence} = tx;

        //Set default gas price if needed
        if(_.isNil(gasPrice)){
            gasPrice = gasPriceDefault;
        }

        let totalThetaWeiBN = new BigNumber(0);
        let totalTfuelWeiBN = new BigNumber(0);
        let feeInTFuelWeiBN = BigNumber.isBigNumber(gasPrice) ? gasPrice : (new BigNumber(gasPrice));

        for(var i = 0; i < outputs.length; i++){
            let output = outputs[i];
            let thetaWei = output.thetaWei;
            let tfuelWei = output.tfuelWei;

            let thetaWeiBN = BigNumber.isBigNumber(thetaWei) ? thetaWei : (new BigNumber(thetaWei));
            let tfuelWeiBN = BigNumber.isBigNumber(tfuelWei) ? tfuelWei : (new BigNumber(tfuelWei));

            totalThetaWeiBN = totalThetaWeiBN.plus(thetaWeiBN);
            totalTfuelWeiBN = totalTfuelWeiBN.plus(tfuelWeiBN);
        }

        this.fee = new Coins(new BigNumber(0), feeInTFuelWeiBN);

        let txInput = new TxInput(from, totalThetaWeiBN, totalTfuelWeiBN.plus(feeInTFuelWeiBN), sequence);
        this.inputs = [txInput];

        this.outputs = [];
        for(var j = 0; j < outputs.length; j++){
            let output = outputs[j];
            let address = output.address;
            let thetaWei = output.thetaWei;
            let tfuelWei = output.tfuelWei;

            let thetaWeiBN = BigNumber.isBigNumber(thetaWei) ? thetaWei : (new BigNumber(thetaWei));
            let tfuelWeiBN = BigNumber.isBigNumber(tfuelWei) ? tfuelWei : (new BigNumber(tfuelWei));

            let txOutput = new TxOutput(address, thetaWeiBN, tfuelWeiBN);

            this.outputs.push(txOutput);
        }

        if(_.isNil(sequence)){
            this.setSequence(1);
        }
    }

    setSequence(sequence){
        let firstInput = this.inputs[0];
        firstInput.sequence = sequence;
        this.inputs = [firstInput];
    }

    getSequence(){
        const firstInput = this.inputs[0];
        return firstInput.sequence;
    }

    setFrom(address){
        let firstInput = this.inputs[0];
        firstInput.address = address;
        this.inputs = [firstInput];
    }

    setSignature(signature){
        //TODO support multiple inputs
        let input = this.inputs[0];
        input.setSignature(signature);
    }

    signBytes(chainID){
        let sigz = [];
        //let input = this.inputs[0];

        // Detach the existing signatures from the input if any, so that we don't sign the signature
        //let originalSignature = input.signature;
        //input.signature = "";

        // Detach the existing signatures from the input if any, so that we don't sign the signature
        for(var i = 0; i < this.inputs.length; i++){
            let input = this.inputs[i];

            sigz[i] = input.signature;
            input.signature = "";
        }

        let encodedChainID = RLP.encode(Bytes.fromString(chainID));
        let encodedTxType = RLP.encode(Bytes.fromNumber(this.getType()));
        let encodedTx = RLP.encode(this.rlpInput());
        let payload = encodedChainID + encodedTxType.slice(2) + encodedTx.slice(2);

        // For ethereum tx compatibility, encode the tx as the payload
        let ethTxWrapper = new EthereumTx(payload);
        let signedBytes = RLP.encode(ethTxWrapper.rlpInput()); // the signBytes conforms to the Ethereum raw tx format

        // Attach the original signature back to the inputs
        //input.signature = originalSignature;

        // Attach the original signature back to the inputs
        for(var j = 0; j < this.inputs.length; j++){
            let input = this.inputs[j];

            input.signature = sigz[j];
        }

        return signedBytes;
    }

    getType(){
        return TxType.Send;
    }

    rlpInput(){
        let numInputs = this.inputs.length;
        let numOutputs = this.outputs.length;
        let inputBytesArray = [];
        let outputBytesArray = [];

        for(let i = 0; i < numInputs; i ++) {
            inputBytesArray[i] = this.inputs[i].rlpInput();
        }

        for (let i = 0; i < numOutputs; i ++) {
            outputBytesArray[i] = this.outputs[i].rlpInput();
        }

        let rlpInput = [
            this.fee.rlpInput(),
            inputBytesArray,
            outputBytesArray
        ];

        return rlpInput;
    }
}

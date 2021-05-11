import _ from 'lodash';
import TxInput from '../common/TxInput'
import TxOutput from '../common/TxOutput'
import TxType from '../common/TxType'
import EthereumTx from '../common/EthereumTx'
import BigNumber from "bignumber.js"
import RLP from 'eth-lib/lib/rlp';
import Bytes from 'eth-lib/lib/bytes';
import BaseTransaction from "../common/BaseTransaction";
import {encodeWei} from '../../utils';
import {AddressZero, gasPriceDefault, gasLimitDefault} from '../../constants/index';

export default class SmartContractTransaction extends BaseTransaction{
    constructor(tx){
        super(tx);

        let {from, to, gasLimit, gasPrice, data, value, sequence} = tx;

        //Set gas price and gas limit defaults if needed
        if(_.isNil(gasLimit)){
            gasLimit = gasLimitDefault;
        }

        if(_.isNil(gasPrice)){
            gasPrice = gasPriceDefault;
        }

        if(_.isNil(value)){
            value = 0;
        }

        let valueWeiBN = BigNumber.isBigNumber(value) ? value : (new BigNumber(value));

        this.fromInput = new TxInput(from ? from : AddressZero, null, valueWeiBN, sequence);
        this.toOutput = new TxOutput(to, null, null);
        this.gasLimit = gasLimit;
        this.gasPrice = gasPrice;

        this.rawData = "" + data;

        if(data.toLowerCase().startsWith("0x") === false){
            data = "0x" + data;
        }

        this.data = Bytes.toArray(data);

        if(_.isNil(sequence)){
            this.setSequence(1);
        }
    }

    setSequence(sequence){
        const input = this.fromInput;
        input.sequence = sequence;
    }

    getSequence(){
        const input = this.fromInput;
        return input.sequence;
    }

    setFrom(address){
        const input = this.fromInput;
        input.address = address;
    }

    setSignature(signature){
        let input = this.fromInput;
        input.setSignature(signature);
    }

    signBytes(chainID){
        // Detach the existing signature from the source if any, so that we don't sign the signature
        let sig = this.fromInput.signature;

        this.fromInput.signature = "";

        let encodedChainID = RLP.encode(Bytes.fromString(chainID));
        let encodedTxType = RLP.encode(Bytes.fromNumber(this.getType()));
        let encodedTx = RLP.encode(this.rlpInput());
        let payload = encodedChainID + encodedTxType.slice(2) + encodedTx.slice(2);

        // For ethereum tx compatibility, encode the tx as the payload
        let ethTxWrapper = new EthereumTx(payload);
        let signedBytes = RLP.encode(ethTxWrapper.rlpInput()); // the signBytes conforms to the Ethereum raw tx format

        // Attach the original signature back to the source
        this.fromInput.signature = sig;

        return signedBytes;
    }

    getType(){
        return TxType.SmartContract;
    }

    rlpInput(){
        let rlpInput = [
            this.fromInput.rlpInput(),
            this.toOutput.rlpInput(),

            Bytes.fromNumber(this.gasLimit),
            encodeWei(this.gasPrice),

            Bytes.fromArray(this.data)
        ];

        return rlpInput;
    }
}

import _ from 'lodash';
import TxInput from '../common/TxInput'
import TxOutput from '../common/TxOutput'
import TxType from '../common/TxType'
import Coins from '../common/Coins'
import EthereumTx from '../common/EthereumTx'
import BigNumber from "bignumber.js"
import RLP from 'eth-lib/lib/rlp';
import Bytes from 'eth-lib/lib/bytes';
import BaseTransaction from "../common/BaseTransaction";
import {gasPriceDefault} from "../../constants/index";

export default class DepositStakeV2Transaction extends BaseTransaction{
    constructor(tx){
        super(tx);

        let {source, holder, purpose, amount, gasPrice, sequence} = tx;

        if(_.isNil(gasPrice)){
            gasPrice = gasPriceDefault;
        }

        let feeInTFuelWeiBN = BigNumber.isBigNumber(gasPrice) ? gasPrice : (new BigNumber(gasPrice));
        this.fee = new Coins(new BigNumber(0), feeInTFuelWeiBN);

        let stakeInThetaWeiBN = BigNumber.isBigNumber(amount) ? amount : (new BigNumber(amount));
        this.source = new TxInput(source, stakeInThetaWeiBN, null, sequence);

        this.purpose = purpose;

        //Parse out the info from the holder param
        let holderAddress = holder;

        if(!holderAddress.startsWith('0x')){
            holderAddress = "0x" + holder;
        }

        if(holderAddress.length !== 42) {
            //TODO: throw error
            console.log("Holder must be a valid address");
        }

        this.holder = new TxOutput(holderAddress, null, null);

        if(_.isNil(sequence)){
            this.setSequence(1);
        }
    }

    setSequence(sequence){
        const input = this.source;
        input.sequence = sequence;
    }

    getSequence(){
        const input = this.source;
        return input.sequence;
    }

    setFrom(address){
        const input = this.source;
        input.address = address;
    }

    setSignature(signature){
        let input = this.source;
        input.setSignature(signature);
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

    getType(){
        return TxType.DepositStake;
    }

    rlpInput(){
        let rlpInput = [
            this.fee.rlpInput(),
            this.source.rlpInput(),
            this.holder.rlpInput(),

            Bytes.fromNumber(this.purpose),
        ];

        return rlpInput;
    }
}

import RLP from 'eth-lib/lib/rlp';
import Bytes from 'eth-lib/lib/bytes';
import {sha3, signWithKey} from '../crypto'
import SendTransaction from "./types/SendTransaction";
import DepositStakeTransaction from "./types/DepositStakeTransaction";
import DepositStakeV2Transaction from "./types/DepositStakeV2Transaction";
import SmartContractTransaction from "./types/SmartContractTransaction";
import WithdrawStakeTransaction from "./types/WithdrawStakeTransaction";
import TxType from "./common/TxType";

function sign(chainID, tx, privateKey) {
    const txRawBytes = tx.signBytes(chainID);
    const txHash = sha3(txRawBytes);
    const signature = signWithKey(txHash, privateKey);

    return signature;
}

function serialize(tx, signature) {
    if(signature){
        tx.setSignature(signature);
    }

    const encodedTxType = RLP.encode(Bytes.fromNumber(tx.getType()));
    const encodedTx = RLP.encode(tx.rlpInput());
    const rawBytes = encodedTxType + encodedTx.slice(2);

    //Reset the signature back to null
    if(signature){
        tx.setSignature(null);
    }

    return rawBytes.toString('hex').slice(2);
}

function transactionFromJson(data){
    const {txType, txData} = data;

    if(txType === TxType.Send){
        return new SendTransaction(txData);
    }
    if(txType === TxType.SmartContract){
        return new SmartContractTransaction(txData);
    }
    if(txType === TxType.DepositStake){
        return new DepositStakeTransaction(txData);
    }
    if(txType === TxType.DepositStakeV2){
        return new DepositStakeV2Transaction(txData);
    }
    if(txType === TxType.WithdrawStake){
        return new WithdrawStakeTransaction(txData);
    }

    // Unknown transaction type. Throw error?
    return null;
}

export {
    sign,
    serialize,

    transactionFromJson,

    SendTransaction,
    DepositStakeTransaction,
    DepositStakeV2Transaction,
    WithdrawStakeTransaction,
    SmartContractTransaction
}

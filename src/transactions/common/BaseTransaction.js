export default class BaseTransaction{
    constructor(tx){
        this._rawTx = tx;
    }

    setSequence(sequence){

    }

    getSequence(){

    }

    getSequenceOverride(){
        return this._rawTx.sequence;
    }

    setFrom(address){

    }

    signBytes(chainID){

    }

    getType(){

    }

    rlpInput(){

    }

    toJson(){
        return JSON.parse(JSON.stringify({
            txType: this.getType(),
            txData: this._rawTx
        }));
    }
}

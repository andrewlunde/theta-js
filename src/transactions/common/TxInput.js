import Coins from './Coins'
import Bytes from 'eth-lib/lib/bytes';

export default class TxInput{
    constructor(address, thetaWei, tfuelWei, sequence) {
        this.address = address;
        this.sequence = sequence || 0;
        this.signature = "";

        if(thetaWei || tfuelWei){
            this.coins = new Coins(thetaWei, tfuelWei);
        }
        else{
            this.coins = new Coins(null, null);
        }
    }

    setSignature(signature) {
        this.signature = signature;
    }

    rlpInput(){
        let address = null;

        if(this.address){
            address = this.address.toLowerCase();
        }
        else{
            address = Bytes.fromNat("0x0");
        }

        let rplInput = [
            address,
            this.coins.rlpInput(),
            Bytes.fromNumber(this.sequence),
            this.signature
        ];

        return rplInput;
    }
}

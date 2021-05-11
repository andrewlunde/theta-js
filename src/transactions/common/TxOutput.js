import Coins from './Coins';

export default class TxOutput {
    constructor(address, thetaWei, tfuelWei) {
        this.address = address;

        if(thetaWei || tfuelWei){
            this.coins = new Coins(thetaWei, tfuelWei);
        }
        else{
            //TODO should this be undefined or null?
            this.coins = new Coins(null, null);
        }
    }

    rlpInput(){
        let address = null;

        if(this.address){
            address = this.address.toLowerCase();
        }
        else{
            //Empty address
            address = "0x0000000000000000000000000000000000000000";
        }

        let rplInput = [
            address,
            this.coins.rlpInput()
        ];

        return rplInput;
    }
}

import {encodeWei} from '../../utils';
import BigNumber from "bignumber.js";

export default class Coins{
    constructor(thetaWei, tfuelWei){
        this.thetaWei = (thetaWei ? thetaWei : new BigNumber(0));
        this.tfuelWei = (tfuelWei ? tfuelWei : new BigNumber(0));
    }

    rlpInput(){
        let rlpInput = [
            encodeWei(this.thetaWei),
            encodeWei(this.tfuelWei)
        ];

        return rlpInput;
    }
}

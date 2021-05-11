import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import BigNumber from 'bignumber.js';
import Bytes from "eth-lib/lib/bytes";

import {Ten18} from "./constants/index";

// /**
//  * Check if string is HEX, requires a 0x in front
//  *
//  * @method isHexStrict
//  *
//  * @param {String} hex to be checked
//  *
//  * @returns {Boolean}
//  */
export const isHexStrict = (hex) => {
    return (isString(hex) || isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex);
};

/**
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 *
 * @param {String} hex
 *
 * @returns {Array} the byte array
 */
export const hexToBytes = (hex) => {
    hex = hex.toString(16);

    if (!isHexStrict(hex)) {
        throw new Error(`Given value "${hex}" is not a valid hex string.`);
    }

    hex = hex.replace(/^0x/i, '');
    hex = hex.length % 2 ? '0' + hex : hex;

    let bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }

    return bytes;
};

// Convert a byte array to a hex string
export const bytesToHex = function(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
};

BigNumber.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
};

export const bnFromString = str => {
    const base = str.slice(0, 2) === "0x" ? 16 : 10;
    const bigNum = new BigNumber(str, base);
    const bigNumWithPad = "0x" + bigNum.pad(2);
    return bigNumWithPad; // Jieyi: return "0x00" instead of "0x" to be compatible with the Golang/Java signature
};

export const encodeWei = (wei) =>{
    if(wei === null || wei === undefined){
        return Bytes.fromNat("0x0");
    }
    else if(wei.isEqualTo(new BigNumber(0))){
        return Bytes.fromNat("0x0");
    }
    else{
        return Bytes.fromNumber(wei);
    }
};

export const fromWei = (number) => {
    BigNumber.config({ EXPONENTIAL_AT: 1e+9 });
    const bn = new BigNumber(number);

    return bn.dividedBy(Ten18).toString();
}

export const toWei = (number) => {
    BigNumber.config({ EXPONENTIAL_AT: 1e+9 });
    const bn = new BigNumber(number);

    return bn.multipliedBy(Ten18).toString();
}

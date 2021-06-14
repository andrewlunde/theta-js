'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var BigNumber = _interopDefault(require('bignumber.js'));
var isString = _interopDefault(require('lodash/isString'));
var isNumber = _interopDefault(require('lodash/isNumber'));
var Bytes = _interopDefault(require('eth-lib/lib/bytes'));
var Hash = _interopDefault(require('eth-lib/lib/hash'));
var _ = _interopDefault(require('lodash'));
var RLP = _interopDefault(require('eth-lib/lib/rlp'));
var ethers = _interopDefault(require('ethers'));
var bytes = require('@ethersproject/bytes');
var strings = require('@ethersproject/strings');
var hash = require('@ethersproject/hash');

const TxType = {
    Coinbase: 0,
    Slash: 1,
    Send: 2,
    ReserveFund: 3,
    ReleaseFund: 4,
    ServicePayment: 5,
    SplitRule: 6,
    SmartContract: 7,
    DepositStake: 8,
    WithdrawStake: 9,
    DepositStakeV2: 10,
};

const StakePurpose = {
    StakeForValidator: 0,
    StakeForGuardian: 1
};

const ThetaBaseDerivationPath = "m/44'/500'/0'/0/";
const DerivationPaths = {
    Default: `${ThetaBaseDerivationPath}0`,
    Theta: ThetaBaseDerivationPath,
    Ethereum: "m/44'/60'/0'/0/",
    EthereumOther: "m/44'/60'/0'/",
    EthereumLedgerLive: "m/44'/60'/"
};

const AddressZero = "0x0000000000000000000000000000000000000000";
const HashZero = "0x0000000000000000000000000000000000000000000000000000000000000000";

const Zero = new BigNumber(0);
const One = new BigNumber(1);
const Ten18 = (new BigNumber(10)).pow(18); // 10^18, 1 Theta = 10^18 ThetaWei

const gasPriceDefault = (new BigNumber(0.3)).multipliedBy(Ten18);
const gasPriceSmartContractDefault = (new BigNumber(0.000004)).multipliedBy(Ten18);
const gasLimitDefault = 10000000;

var index = /*#__PURE__*/Object.freeze({
    StakePurpose: StakePurpose,
    TxType: TxType,
    AddressZero: AddressZero,
    HashZero: HashZero,
    Zero: Zero,
    One: One,
    Ten18: Ten18,
    DerivationPaths: DerivationPaths,
    gasPriceDefault: gasPriceDefault,
    gasPriceSmartContractDefault: gasPriceSmartContractDefault,
    gasLimitDefault: gasLimitDefault
});

// /**
//  * Check if string is HEX, requires a 0x in front
//  *
//  * @method isHexStrict
//  *
//  * @param {String} hex to be checked
//  *
//  * @returns {Boolean}
//  */
const isHexStrict = (hex) => {
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
const hexToBytes = (hex) => {
    hex = hex.toString(16);

    if (!isHexStrict(hex)) {
        throw new Error(`Given value "${hex}" is not a valid hex string.`);
    }

    hex = hex.replace(/^0x/i, '');
    hex = hex.length % 2 ? '0' + hex : hex;

    let bytes$$1 = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes$$1.push(parseInt(hex.substr(c, 2), 16));
    }

    return bytes$$1;
};

// Convert a byte array to a hex string
const bytesToHex = function(bytes$$1) {
    for (var hex = [], i = 0; i < bytes$$1.length; i++) {
        hex.push((bytes$$1[i] >>> 4).toString(16));
        hex.push((bytes$$1[i] & 0xF).toString(16));
    }
    return hex.join("");
};

BigNumber.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
};

const bnFromString = str => {
    const base = str.slice(0, 2) === "0x" ? 16 : 10;
    const bigNum = new BigNumber(str, base);
    const bigNumWithPad = "0x" + bigNum.pad(2);
    return bigNumWithPad; // Jieyi: return "0x00" instead of "0x" to be compatible with the Golang/Java signature
};

const encodeWei = (wei) =>{
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

const fromWei = (number) => {
    BigNumber.config({ EXPONENTIAL_AT: 1e+9 });
    const bn = new BigNumber(number);

    return bn.dividedBy(Ten18).toString();
};

const toWei = (number) => {
    BigNumber.config({ EXPONENTIAL_AT: 1e+9 });
    const bn = new BigNumber(number);

    return bn.multipliedBy(Ten18).toString();
};

var utils = /*#__PURE__*/Object.freeze({
    isHexStrict: isHexStrict,
    hexToBytes: hexToBytes,
    bytesToHex: bytesToHex,
    bnFromString: bnFromString,
    encodeWei: encodeWei,
    fromWei: fromWei,
    toWei: toWei
});

const elliptic = (((typeof window !== 'undefined') && window.elliptic) || require("elliptic"));
const secp256k1 = new elliptic.ec("secp256k1"); // eslint-disable-line
const SHA3_NULL_S = '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

const sha3 = (value) => {
    if (isHexStrict(value) && /^0x/i.test(value.toString())) {
        value = hexToBytes(value);
    }

    const returnValue = Hash.keccak256(value); // jshint ignore:line

    if (returnValue === SHA3_NULL_S) {
        return null;
    } else {
        return returnValue;
    }
};

const encodeSignature = ([v, r, s]) => Bytes.flatten([r, s, v]);

const makeSigner = addToV => (hash$$1, privateKey) => {
  const ecKey = secp256k1.keyFromPrivate(new Buffer(privateKey.slice(2), "hex"));
  const signature = ecKey.sign(new Buffer(hash$$1.slice(2), "hex"), { canonical: true });
  return encodeSignature([
      bnFromString(Bytes.fromNumber(addToV + signature.recoveryParam)),
      Bytes.pad(32, Bytes.fromNat("0x" + signature.r.toString(16))),
      Bytes.pad(32, Bytes.fromNat("0x" + signature.s.toString(16)))
    ]);
};

const signWithKey = makeSigner(0);

class BaseTransaction{
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

class Coins{
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

class TxInput{
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

class TxOutput {
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

class EthereumTx{
    constructor(payload){
        this.nonce = "0x0";
        this.gasPrice = "0x0";
        this.gas = "0x0";
        this.to = "0x0000000000000000000000000000000000000000";
        this.value = "0x0";
        this.input = payload;
    }
    
    rlpInput() {
        let rplInput= [
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.input,
        ];

        return rplInput;
    }
}

class SendTransaction extends BaseTransaction{
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

class DepositStakeV2Transaction extends BaseTransaction{
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

class DepositStakeV2Transaction$1 extends BaseTransaction{
    constructor(tx){
        super(tx);

        let {source, holderSummary, purpose, amount, gasPrice, sequence} = tx;

        if(_.isNil(gasPrice)){
            gasPrice = gasPriceDefault;
        }

        let feeInTFuelWeiBN = BigNumber.isBigNumber(gasPrice) ? gasPrice : (new BigNumber(gasPrice));
        this.fee = new Coins(new BigNumber(0), feeInTFuelWeiBN);

        let stakeInThetaWeiBN = BigNumber.isBigNumber(amount) ? amount : (new BigNumber(amount));
        this.source = new TxInput(source, stakeInThetaWeiBN, null, sequence);

        this.purpose = purpose;

        //Parse out the info from the holder (summary) param
        if(!holderSummary.startsWith('0x')){
            holderSummary = "0x" + holderSummary;
        }

        //Ensure correct size
        if(holderSummary.length !== 460) {
            //TODO: throw error
            console.log("Holder must be a valid guardian address");
        }

        //let guardianKeyBytes = Bytes.fromString(holderSummary);
        let guardianKeyBytes = Bytes.toArray(holderSummary);

        //slice instead of subarray
        let holderAddressBytes = guardianKeyBytes.slice(0, 20);

        this.blsPubkeyBytes = guardianKeyBytes.slice(20, 68);
        this.blsPopBytes = guardianKeyBytes.slice(68, 164);
        this.holderSigBytes = guardianKeyBytes.slice(164);

        let holderAddress = Bytes.fromArray(holderAddressBytes);

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
        return TxType.DepositStakeV2;
    }

    rlpInput(){
        let rlpInput = [
            this.fee.rlpInput(),
            this.source.rlpInput(),
            this.holder.rlpInput(),

            Bytes.fromNumber(this.purpose),

            Bytes.fromArray(this.blsPubkeyBytes),
            Bytes.fromArray(this.blsPopBytes),
            Bytes.fromArray(this.holderSigBytes)
        ];

        return rlpInput;
    }
}

class SmartContractTransaction extends BaseTransaction{
    constructor(tx){
        super(tx);

        let {from, to, gasLimit, gasPrice, data, value, sequence} = tx;

        //Set gas price and gas limit defaults if needed
        if(_.isNil(gasLimit)){
            gasLimit = gasLimitDefault;
        }

        if(_.isNil(gasPrice)){
            gasPrice = gasPriceSmartContractDefault;
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

class WithdrawStakeTransaction extends BaseTransaction{
    constructor(tx){
        super(tx);

        let {source, holder, purpose, gasPrice, sequence} = tx;

        if(_.isNil(gasPrice)){
            gasPrice = gasPriceDefault;
        }

        let feeInTFuelWeiBN = BigNumber.isBigNumber(gasPrice) ? gasPrice : (new BigNumber(gasPrice));
        this.fee = new Coins(new BigNumber(0), feeInTFuelWeiBN);

        this.source = new TxInput(source, null, null, sequence);

        this.holder = new TxOutput(holder, null, null);

        this.purpose = purpose;

        if(_.isNil(sequence)){
            this.setSequence(1);
        }
    }

    setSequence(sequence){
        let input = this.source;
        input.sequence = sequence;
    }

    getSequence(){
        const input = this.source;
        return input.sequence;
    }

    setSignature(signature){
        let input = this.source;
        input.setSignature(signature);
    }

    setFrom(address){
        const input = this.source;
        input.address = address;
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
        return TxType.WithdrawStake;
    }

    rlpInput(){
        let rlpInput = [
            this.fee.rlpInput(),
            this.source.rlpInput(),
            this.holder.rlpInput(),

            (this.purpose === 0 ? Bytes.fromNat("0x0") : Bytes.fromNumber(this.purpose)),
        ];

        return rlpInput;
    }
}

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
        return new DepositStakeV2Transaction(txData);
    }
    if(txType === TxType.DepositStakeV2){
        return new DepositStakeV2Transaction$1(txData);
    }
    if(txType === TxType.WithdrawStake){
        return new WithdrawStakeTransaction(txData);
    }

    // Unknown transaction type. Throw error?
    return null;
}

var index$1 = /*#__PURE__*/Object.freeze({
    sign: sign,
    serialize: serialize,
    transactionFromJson: transactionFromJson,
    SendTransaction: SendTransaction,
    DepositStakeTransaction: DepositStakeV2Transaction,
    DepositStakeV2Transaction: DepositStakeV2Transaction$1,
    WithdrawStakeTransaction: WithdrawStakeTransaction,
    SmartContractTransaction: SmartContractTransaction
});

class BaseProvider {
    constructor(chainId) {
        this._chainId = chainId;

        this._isProvider = true;
    }

    perform(method, params) {
        // Subclasses will implement this
    }

    getChainId() {
        return this._chainId;
    }

    async getAccount(address) {
        const params = {
            address: address
        };

        return await this.perform("theta.GetAccount", params);
    }

    async getTransactionCount(address) {
        const params = {
            address: address
        };

        let account = null;
        try {
            account = await this.perform("theta.GetAccount", params);
        }
        catch (e) {
            // Default when the account is not null
            account = {};
            account.sequence = 0;
        }

        return parseInt(account.sequence);
    }

    async sendTransaction(signedTransaction) {
        return await this.perform("theta.BroadcastRawTransaction", { tx_bytes: signedTransaction });
    }

    async callSmartContract(transaction) {
        const rawTxBytes = serialize(transaction, null);

        return await this.perform("theta.CallSmartContract", { sctx_bytes: rawTxBytes });
    }

    async getTransaction(transactionHash) {
        const params = { hash: transactionHash };
        return await this.perform("theta.GetTransaction", params);
    }

    async getBlock(blockHash) {
        const params = { hash: blockHash };
        return await this.perform("theta.GetBlock", params);
    }

    async getBlockByHeight(blockHeight) {
        const params = { height: blockHeight };
        return await this.perform("theta.GetBlockByHeight", params);
    }

    async getBlockNumber() {
        try {
            let status = await this.perform("theta.GetStatus", {});
            return parseInt(status.current_height);
        } catch (e) {
            throw new Error(e);
        }
    }
}

const ChainIds =  {
    Mainnet: 'mainnet',
    Testnet: 'testnet',
    TestnetSapphire: 'testnet_sapphire',
    Privatenet: 'privatenet'
};

const Mainnet = {
    chainId: ChainIds.Mainnet,
    name: "Mainnet",
    rpcUrl: "https://theta-bridge-rpc.thetatoken.org/rpc",
    explorerUrl: "https://explorer.thetatoken.org",
    color: "#1BDED0",
};

const Testnet = {
    chainId: ChainIds.Testnet,
    name: "Testnet",
    rpcUrl: "http://theta-node-rpc-testnet.thetatoken.org:16888/rpc",
    explorerUrl: "https://beta-explorer.thetatoken.org",
    color: "#FF4A8D",
};

const TestnetSapphire = {
    chainId: ChainIds.TestnetSapphire,
    name: "Testnet (Sapphire)",
    rpcUrl: null,
    explorerUrl: null,
    color: "#3199F2",
};

const Privatenet = {
    chainId: ChainIds.Privatenet,
    name: "Smart Contracts Sandbox",
    rpcUrl: "https://theta-node-rpc-smart-contract-sandbox.thetatoken.org/rpc",
    explorerUrl: "https://smart-contract-testnet-explorer.thetatoken.org",
    color: "#7157FF",
};

const networks = {
    [ChainIds.Mainnet]: Mainnet,
    [ChainIds.Testnet]: Testnet,
    [ChainIds.TestnetSapphire]: TestnetSapphire,
    [ChainIds.Privatenet]: Privatenet,
};

const getRPCUrlForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId]['rpcUrl'];
};

const getExplorerUrlForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId]['explorerUrl'];
};

const getNetworkForChainId = (chainId) => {
    //TODO throw if unknown
    return networks[chainId];
};

var index$2 = /*#__PURE__*/Object.freeze({
    Mainnet: Mainnet,
    Testnet: Testnet,
    TestnetSapphire: TestnetSapphire,
    Privatenet: Privatenet,
    ChainIds: ChainIds,
    getRPCUrlForChainId: getRPCUrlForChainId,
    getExplorerUrlForChainId: getExplorerUrlForChainId,
    getNetworkForChainId: getNetworkForChainId
});

function getResult(response) {
    if (response.error) {
        const error = new Error(response.error.message);
        error.code = response.error.code;
        error.data = response.error.data;
        throw error;
    }

    return response.result;
}

class HttpProvider extends BaseProvider {
    constructor(chainId, url) {
        if (chainId === null || chainId === undefined) {
            chainId = ChainIds.Mainnet;
        }

        super(chainId);

        if (url === null || url === undefined) {
            url = getRPCUrlForChainId(chainId);
        }

        this.url = url;
        this._nextId = 0;
        this.isBroadcastAsync = false;

        this._reqLogger = null;
    }

    setRequestLogger(reqLogger){
        this._reqLogger = reqLogger;
    }

    setBroadcastAsync(isAsync) {
        this.isBroadcastAsync = isAsync;
    }

    prepareRequest(method, params) {
        // Do any extra processing needed to params, etc
        switch (method) {
            case "theta.GetAccount":
                return [method, params];

            case "theta.BroadcastRawTransaction":
                return [(this.isBroadcastAsync ? 'theta.BroadcastRawTransactionAsync' : 'theta.BroadcastRawTransaction'), params];

            case "theta.GetBlock":
                return [method, params];

            case "theta.GetBlockByHeight":
                return [method, params];

            case "theta.GetTransaction":
                return [method, params];

            case "theta.CallSmartContract":
                return [method, params];

            case "theta.GetStatus":
                return [method, params];

            default:
                break;
        }

        return null;
    }

    async send(method, params) {
        const requestBody = {
            jsonrpc: "2.0",
            id: (this._nextId++),
            method: method,
            params: params,
        };

        const reqOpts = _.merge({
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json"
            }
        }, HttpProvider.extraRequestOpts);

        const reqStartTime = new Date().getTime();
        const response = await fetch(this.url, reqOpts);

        const responseText = await response.text();

        if(this._reqLogger || HttpProvider.requestLogger){
            const reqLogger = this._reqLogger || HttpProvider.requestLogger;
            const requestTime = new Date().getTime() - reqStartTime;
            let uri = new URL(response.url);
            uri.path = uri.pathname;
            const req = Object.assign({}, reqOpts, {
                url: response.url,
                uri: uri
            });
            reqLogger({
                request: req,
                response: {
                    status: response.status,
                    statusCode: response.status,
                    url: response.url,
                    uri: uri,
                    body: responseText,
                    request: req,
                    timingPhases: {
                        total: requestTime
                    }
                }
            });
        }

        return getResult(JSON.parse(responseText));
    }

    perform(method, params) {
        const args = this.prepareRequest(method, params);

        return this.send(args[0], args[1])
    }
}

HttpProvider.extraRequestOpts = null;
HttpProvider.requestLogger = null;

function transactionToParams(transaction, dryRun, isAsync) {
    if (transaction instanceof SmartContractTransaction) {
        const params = {
            "to": transaction.toOutput.address || null,
            "amount":
                {
                    "tfuelwei": transaction.value || "0"
                },
            "gas_price": transaction.gasPrice.toString(),
            "gas_limit": transaction.gasLimit,
            "data": transaction.rawData.slice(2),
            "dryrun": dryRun,
            "async": isAsync,
        };

        if(!_.isNil(transaction.sequence)){
            params.sequence = transaction.sequence;
        }

        return params;
    }
}

class PartnerVaultHttpProvider extends HttpProvider {
    constructor(chainId, url, vaultUrl) {
        super(chainId, url);

        this.vaultUrl = vaultUrl;
        this.partnerId = null;
        this.userId = null;
        this.accessToken = null;
        this.isDryrun = false;
        this.isAsync = false;
    }

    setDryrun(isDryrun) {
        this.isDryrun = isDryrun;
    }

    setAsync(isAsync) {
        this.isAsync = isAsync;
    }

    setPartnerId(partnerId) {
        this.partnerId = partnerId;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }

    async sendTransaction(transaction) {
        let params = transactionToParams(transaction, this.isDryrun, this.isAsync);
        params = Object.assign(params, {
            userid: this.userId,
            partner_id: this.partnerId,
        });

        const requestBody = {
            jsonrpc: "2.0",
            id: (this._nextId++),
            method: "theta.SmartContractTx",
            params: [params]
        };
        const requestBodyStr = JSON.stringify(requestBody);

        const response = await fetch(this.vaultUrl, {
            method: 'POST',
            body: requestBodyStr,
            headers: {
                "x-access-token": this.accessToken,
                "Content-Type": "application/json"
            }
        });

        const responseJson = await response.json();

        return responseJson;
    }
}



var index$3 = /*#__PURE__*/Object.freeze({
    BaseProvider: BaseProvider,
    HttpProvider: HttpProvider,
    PartnerVaultHttpProvider: PartnerVaultHttpProvider
});

// Sub-Class Notes:
//  - A Signer MUST always make sure, that if present, the "from" field
//    matches the Signer, before sending or signing a transaction
//  - A Signer SHOULD always wrap private information (such as a private
//    key or mnemonic) in a function, so that console.log does not leak
//    the data

class BaseSigner {
    ///////////////////
    // Sub-classes MUST call super
    constructor() {
        this._isSigner = true;
    }

    ///////////////////
    // Sub-classes MUST implement these

    // Returns the checksum address
    getAddress(){
        return null;
    }

    // Signs a transaxction and returns the fully serialized, signed transaction.
    // The EXACT transaction MUST be signed, and NO additional properties to be added.
    // - This MAY throw if signing transactions is not supports, but if
    //   it does, sentTransaction MUST be overridden.
    signTransaction(transaction){
        return null;
    }

    // Returns a new instance of the Signer, connected to provider.
    // This MAY throw if changing providers is not supported.
    connect(provider){
        return null;
    }

    ///////////////////
    // Sub-classes MAY override these

    async getAccount() {
        return await this.provider.getAccount(this.getAddress());
    }

    async getTransactionCount() {
        return await this.provider.getTransactionCount(this.getAddress());
    }

    // Populates "from" if unspecified, and calls with the transation
    async callSmartContract(transaction) {
        return await this.provider.callSmartContract(transaction);
    }

    // Populates all fields in a transaction, signs it and sends it to the network
    async sendTransaction(transaction) {
        if(_.isNil(transaction.getSequenceOverride())){
            let sequence = await this.getTransactionCount();
            sequence = sequence + 1;
            transaction.setSequence(sequence);
        }
        const signedTx = this.signTransaction(transaction);

        return await this.provider.sendTransaction(signedTx);
    }

    getChainId() {
        return this.provider.getChainId();
    }
}

class PartnerVaultWallet extends BaseSigner {
    constructor(provider, userWalletAddress) {
        super();

        this.provider = provider;
        this._userWalletAddress = userWalletAddress;
    }

    setUserWalletAddress(userWalletAddress){
        this._userWalletAddress = userWalletAddress;
    }

    // Returns the checksum address
    getAddress(){
        return this._userWalletAddress;
    }

    signTransaction(transaction) {
        //No signing
        return null;
    }

    async sendTransaction(transaction) {
        //No signing, no sequence injection
        return await this.provider.sendTransaction(transaction);
    }
}



var index$4 = /*#__PURE__*/Object.freeze({
    BaseSigner: BaseSigner,
    PartnerVaultSigner: PartnerVaultWallet
});

function transformInsufficientFundRegexMatch(match){
    let amount = match[1];
    let currency = match[2];

    let amountBN = new BigNumber(amount);
    let amountDecimalStr = amountBN.dividedBy(Ten18).toString();

    return {
        amount: amountDecimalStr,
        amountWei: amount,
        amountBN: amountBN,
        currency: (currency === "ThetaWei" ? 'THETA' : 'TFUEL')
    }
}

function humanizeInsufficientFundErrorMessage(errorMessage, isSendTransaction){
    const regex = /(\d+)[^\d]+(ThetaWei|TFuelWei)/gm;
    let m;
    let amounts = [];

    while ((m = regex.exec(errorMessage)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        amounts.push(transformInsufficientFundRegexMatch(m));
    }

    let currentThetaBalance = amounts[0];
    let currentTfuelBalance = amounts[1];
    let attemptedToSendTheta = amounts[2];
    let attemptedToSendTfuel = amounts[3];

    if((currentTfuelBalance.amountBN.isLessThan(attemptedToSendTfuel.amountBN)) &&
        attemptedToSendTfuel.amountWei === "1000000000000" && isSendTransaction){
        return `Insufficient gas. You need at least ${attemptedToSendTfuel.amount} TFUEL to send this transaction.`;
    }
    else if(currentThetaBalance.amountBN.isLessThan(attemptedToSendTheta.amountBN) && isSendTransaction){
        return `Insufficient funds. You only have ${currentThetaBalance.amount} THETA but tried to send ${attemptedToSendTheta.amount} THETA.`;
    }
    else if(currentTfuelBalance.amountBN.isLessThan(attemptedToSendTfuel.amountBN) && isSendTransaction){
        return `Insufficient funds. You only have ${currentTfuelBalance.amount} TFUEL but tried to send ${attemptedToSendTfuel.amount} TFUEL.`;
    }
    else if(currentTfuelBalance.amountBN.isLessThan(attemptedToSendTfuel.amountBN) && (isSendTransaction === false)){
        return `Insufficient funds. You need at least ${attemptedToSendTfuel.amount} TFUEL to send this transaction.`;
    }
    else{
        return errorMessage;
    }
}

function humanizeErrorMessage(errorMessage){
    let humanizedErrorMessage = errorMessage;
    let errorMessageLC = errorMessage.toLowerCase();

    try {
        if(errorMessageLC.includes('insufficient fund')){
            humanizedErrorMessage = humanizeInsufficientFundErrorMessage(errorMessage, true);
        }
        else if(errorMessageLC.includes('required minimal balance')){
            humanizedErrorMessage = humanizeInsufficientFundErrorMessage(errorMessage, false);
        }
    }
    catch (e) {
        // Back to default (just in case)
        humanizedErrorMessage = errorMessage;
    }

    return humanizedErrorMessage;
}

var errors = /*#__PURE__*/Object.freeze({
    humanizeErrorMessage: humanizeErrorMessage
});

const {
    defineReadOnly, computeAddress, getAddress,
    HDNode, entropyToMnemonic,
    randomBytes, isHexString,
    SigningKey
} = ethers.utils;

function isAccount(value) {
    return (value != null && isHexString(value.privateKey, 32) && value.address != null);
}

function hasMnemonic(value) {
    const mnemonic = value.mnemonic;
    return (mnemonic && mnemonic.phrase);
}

const messagePrefix = "\x19Ethereum Signed Message:\n"; // potential for cross-chain support

function hashMessage(message){
    if(typeof (message) === "string"){
        message = strings.toUtf8Bytes(message);
    }

    return sha3(bytes.concat([
        strings.toUtf8Bytes(messagePrefix),
        strings.toUtf8Bytes(String(message.length)),
        message
    ]));
}

class Wallet extends BaseSigner {
    constructor(privateKeyOrAccount, provider) {
        super();

        if (isAccount(privateKeyOrAccount)) {
            const account = privateKeyOrAccount;
            const signingKey = new SigningKey(account.privateKey);
            defineReadOnly(this, "_signingKey", () => signingKey);
            defineReadOnly(this, "address", computeAddress(this.publicKey));

            if (this.address !== getAddress(account.address)) ;

            if (hasMnemonic(privateKeyOrAccount)) {
                const srcMnemonic = privateKeyOrAccount.mnemonic;
                defineReadOnly(this, "_mnemonic", () => (
                    {
                        phrase: srcMnemonic.phrase,
                        path: srcMnemonic.path || DerivationPaths.Default,
                        locale: srcMnemonic.locale
                    }
                ));
            } else {
                defineReadOnly(this, "_mnemonic", () => null);
            }
        }
        else {
            if (SigningKey.isSigningKey(privateKeyOrAccount)) {
                /* istanbul ignore if */
                const signingKey = privateKeyOrAccount;
                if (signingKey.curve !== "secp256k1") ;
                defineReadOnly(this, "_signingKey", () => signingKey);
            }
            else {
                const privateKey = privateKeyOrAccount;
                const signingKey = new SigningKey(privateKey);
                defineReadOnly(this, "_signingKey", () => signingKey);
            }
            defineReadOnly(this, "_mnemonic", () => null);
            defineReadOnly(this, "address", computeAddress(this.publicKey));
        }

        defineReadOnly(this, "provider", provider || null);
    }

    get mnemonic() {
        return this._mnemonic();
    }

    get privateKey() {
        return this._signingKey().privateKey;
    }

    get publicKey() {
        return this._signingKey().publicKey;
    }

    getChainId() {
        return this.provider.getChainId();
    }

    getAddress() {
        return this.address;
    }

    getAccount() {
        return {
            address: this.getAddress(),
            privateKey: this.privateKey
        };
    }

    connect(provider) {
        return new Wallet(this, provider);
    }

    signTransaction(transaction) {
        const signature = sign(this.getChainId(), transaction, this.privateKey);
        return serialize(transaction, signature);
    }

    signMessage(message){
        return bytes.joinSignature(this._signingKey().signDigest(hashMessage(message)));
    }

    signTypedData(domain, types, value){
        return bytes.joinSignature(this._signingKey().signDigest(hash._TypedDataEncoder.hash(domain, types, value)));
    }

    async encryptToJson(password) {
        const wallet = new ethers.Wallet(this.privateKey);
        const json = await wallet.encrypt(password);

        return json;
    }

    /**
     *  Static methods to create Wallet instances. Provider is optional.
     *  Provider can be connected later by calling connect()
     */
    static createRandom(provider) {
        let entropy = randomBytes(16);
        const mnemonic = entropyToMnemonic(entropy);

        return Wallet.fromMnemonic(mnemonic, provider);
    }

    static fromEncryptedJson(json, password, provider) {
        const wallet = ethers.Wallet.fromEncryptedJsonSync(json, password);
        const privateKey = wallet.privateKey;
        return new Wallet(privateKey, provider);
    }

    static fromMnemonic(mnemonic, provider, opts) {
        opts = opts || {};
        const path = opts.path || DerivationPaths.Default;
        const account = HDNode.fromMnemonic(mnemonic, null).derivePath(path);
        return new Wallet(account, provider);
    }
}

const {
    defineReadOnly: defineReadOnly$1,
    isHexString: isHexString$1, hexlify, isBytes,
    Interface, shallowCopy
} = ethers.utils;

async function populateTransaction(contract, fragment, args) {

    // If an extra argument is given, it is overrides
    let overrides = { };
    if (args.length === fragment.inputs.length + 1 && typeof(args[args.length - 1]) === "object") {
        overrides = shallowCopy(args.pop());
    }

    // Wait for all dependencies to be resolved (prefer the signer over the provider)
    const resolved = {
        args: args,
        address: contract.address,
        overrides: overrides
    };

    let from = null;
    if(contract.signer){
        from = contract.signer.getAddress();
    }

    // The ABI coded transaction
    const tx = {
        data: contract.interface.encodeFunctionData(fragment, resolved.args),
        to: resolved.address,
        from: from
    };

    // Resolved Overrides
    const ro = resolved.overrides;

    // Populate simple overrides
    if (ro.sequence != null) { tx.sequence = new BigNumber(ro.sequence).toNumber(); }
    if (ro.gasLimit != null) { tx.gasLimit = new BigNumber(ro.gasLimit).toNumber(); }
    if (ro.gasPrice != null) { tx.gasPrice = new BigNumber(ro.gasPrice); }
    if (ro.from != null) { tx.from = ro.from; }

    // If there was no "gasLimit" override, but the ABI specifies a default, use it
    if (tx.gasLimit == null && fragment.gas != null) {
        tx.gasLimit = new BigNumber(fragment.gas).add(21000);
    }

    // Populate "value" override
    if (ro.value) {
        const roValue = new BigNumber(ro.value);
        if (!roValue.isZero() && !fragment.payable) ;
        tx.value = roValue;
    }

    // Remove the overrides
    delete overrides.sequence;
    delete overrides.gasLimit;
    delete overrides.gasPrice;
    delete overrides.from;
    delete overrides.value;

    // Make sure there are no stray overrides, which may indicate a
    // typo or using an unsupported key.
    const leftovers = Object.keys(overrides).filter((key) => (overrides[key] != null));
    if (leftovers.length) ;

    return new SmartContractTransaction(tx);
}

function buildSend(contract, fragment) {
    return async function(...args){
        if (!contract.signer) ;

        const txRequest = await populateTransaction(contract, fragment, args);

        const tx = await contract.signer.sendTransaction(txRequest);
        return tx;
    };
}

function buildEstimate(contract, fragment) {
    const signerOrProvider = (contract.signer || contract.provider);

    return async function(...args) {
        if (args.length === fragment.inputs.length + 1 && typeof(args[args.length - 1]) === "object") {
            const overrides = shallowCopy(args.pop());
            args.push(overrides);
        }

        // Call a node and get the result
        const tx = await populateTransaction(contract, fragment, args);
        const result = await signerOrProvider.callSmartContract(tx);

        return new BigNumber(result.gas_used);
    };
}

function buildCall(contract, fragment, collapseSimple) {
    const signerOrProvider = (contract.signer || contract.provider);

    return async function(...args) {
        if (args.length === fragment.inputs.length + 1 && typeof(args[args.length - 1]) === "object") {
            const overrides = shallowCopy(args.pop());
            args.push(overrides);
        }

        // Call a node and get the result
        const tx = await populateTransaction(contract, fragment, args);
        const result = await signerOrProvider.callSmartContract(tx);

        try {
            let value = contract.interface.decodeFunctionResult(fragment, "0x" + result.vm_return);

            if (collapseSimple && fragment.outputs.length === 1) {
                value = value[0];
            }
            return value;

        } catch (error) {
            throw error;
        }
    };
}

function buildPopulate(contract, fragment) {
    return async function(...args) {
        return populateTransaction(contract, fragment, args);
    };
}

function buildDefault(contract, fragment, collapseSimple) {
    if (fragment.constant) {
        return buildCall(contract, fragment, collapseSimple);
    }
    return buildSend(contract, fragment);
}

class Contract {
    constructor(address, contractInterface, signerOrProvider) {

        defineReadOnly$1(this, "interface", Contract.getInterface(contractInterface));

        if (signerOrProvider == null) {
            defineReadOnly$1(this, "provider", null);
            defineReadOnly$1(this, "signer", null);
        } else if (signerOrProvider._isSigner) {
            defineReadOnly$1(this, "provider", signerOrProvider.provider || null);
            defineReadOnly$1(this, "signer", signerOrProvider);
        } else if (signerOrProvider._isProvider) {
            defineReadOnly$1(this, "provider", signerOrProvider);
            defineReadOnly$1(this, "signer", null);
        }

        defineReadOnly$1(this, "callStatic", {});
        defineReadOnly$1(this, "estimateGas", {});
        defineReadOnly$1(this, "functions", {});
        defineReadOnly$1(this, "populateTransaction", {});

        defineReadOnly$1(this, "address", address);

        const uniqueNames = {};
        const uniqueSignatures = {};
        Object.keys(this.interface.functions).forEach((signature) => {
            const fragment = this.interface.functions[signature];

            // Check that the signature is unique; if not the ABI generation has
            // not been cleaned or may be incorrectly generated
            if (uniqueSignatures[signature]) {
                //TODO: throw warning - Duplicate ABI entry for ${JSON.stringify(name)}
                return;
            }
            uniqueSignatures[signature] = true;

            // Track unique names; we only expose bare named functions if they
            // are ambiguous
            {
                const name = fragment.name;
                if (!uniqueNames[name]) {
                    uniqueNames[name] = [];
                }
                uniqueNames[name].push(signature);
            }

            if (this[signature] == null) {
                defineReadOnly$1(this, signature, buildDefault(this, fragment, true));
            }

            // We do not collapse simple calls on this bucket, which allows
            // frameworks to safely use this without introspection as well as
            // allows decoding error recovery.
            if (this.functions[signature] == null) {
                defineReadOnly$1(this.functions, signature, buildDefault(this, fragment, false));
            }

            if (this.callStatic[signature] == null) {
                defineReadOnly$1(this.callStatic, signature, buildCall(this, fragment, true));
            }

            if (this.populateTransaction[signature] == null) {
                defineReadOnly$1(this.populateTransaction, signature, buildPopulate(this, fragment));
            }

            if (this.estimateGas[signature] == null) {
                defineReadOnly$1(this.estimateGas, signature, buildEstimate(this, fragment));
            }
        });

        Object.keys(uniqueNames).forEach((name) => {

            // Ambiguous names to not get attached as bare names
            const signatures = uniqueNames[name];
            if (signatures.length > 1) {
                return;
            }

            const signature = signatures[0];

            if (this[name] == null) {
                defineReadOnly$1(this, name, this[signature]);
            }

            if (this.functions[name] == null) {
                defineReadOnly$1(this.functions, name, this.functions[signature]);
            }

            if (this.callStatic[name] == null) {
                defineReadOnly$1(this.callStatic, name, this.callStatic[signature]);
            }

            if (this.populateTransaction[name] == null) {
                defineReadOnly$1(this.populateTransaction, name, this.populateTransaction[signature]);
            }

            if (this.estimateGas[name] == null) {
                defineReadOnly$1(this.estimateGas, name, this.estimateGas[signature]);
            }
        });
    }

    static getInterface(contractInterface) {
        if (Interface.isInterface(contractInterface)) {
            return contractInterface;
        }
        return new Interface(contractInterface);
    }

    static getContract(address, contractInterface) {
        return new Contract(address, contractInterface);
    }
}

const allowedTransactionKeys = {
    chainId: true, data: true, from: true, gasLimit: true, gasPrice: true, sequence: true, to: true, value: true
};

class ContractFactory {
    constructor(contractInterface, bytecode, signer) {

        let bytecodeHex = null;

        if (typeof (bytecode) === "string") {
            bytecodeHex = bytecode;
        } else if (isBytes(bytecode)) {
            bytecodeHex = hexlify(bytecode);
        } else if (bytecode && typeof (bytecode.object) === "string") {
            // Allow the bytecode object from the Solidity compiler
            bytecodeHex = (bytecode).object;
        } else {
            // Crash in the next verification step
            bytecodeHex = "!";
        }

        // Make sure it is 0x prefixed
        if (bytecodeHex.substring(0, 2) !== "0x") {
            bytecodeHex = "0x" + bytecodeHex;
        }

        // Make sure the final result is valid bytecode
        if (!isHexString$1(bytecodeHex) || (bytecodeHex.length % 2)) ;

        defineReadOnly$1(this, "bytecode", bytecodeHex);
        defineReadOnly$1(this, "interface", ContractFactory.getInterface(contractInterface));
        defineReadOnly$1(this, "signer", signer || null);
    }

    _populateTransaction(args) {
        let tx = {};

        // If we have 1 additional argument, we allow transaction overrides
        if (args && args.length === this.interface.deploy.inputs.length + 1 && typeof (args[args.length - 1]) === "object") {
            tx = shallowCopy(args.pop());
            for (const key in tx) {
                if (!allowedTransactionKeys[key]) {
                    throw new Error("unknown transaction override " + key);
                }
            }
        }

        // Set the data to the bytecode + the encoded constructor arguments
        let encodedArguments = this.interface.encodeDeploy(args).slice(2);
        tx.data = this.bytecode + encodedArguments;

        if(this.signer){
            tx.from = this.signer.getAddress();
        }

        return new SmartContractTransaction(tx);
    }

    async populateDeployTransaction(...args){
        const transaction = this._populateTransaction(args);
        return transaction;
    }

    async deploy(...args){
        if(!this.signer){
            throw new Error('Signer must be valid to deploy a contract');
        }

        //Run a dry run so we can grab the contract address
        const sequence = args.sequence || (await this.signer.getTransactionCount()) + 1;
        const txRequest = this._populateTransaction(args);
        txRequest.setSequence(sequence);
        const dryRunTxResponse = await this.signer.callSmartContract(txRequest);
        const tx = await this.signer.sendTransaction(txRequest);

        if(tx && dryRunTxResponse.contract_address){
            this._deployResult = dryRunTxResponse.contract_address;
        }

        return Object.assign(tx, {
            contract_address: dryRunTxResponse.contract_address
        });
    }

    async simulateDeploy(...args){
        if(!this.signer){
            throw new Error('Signer must be valid to simulate a contract deployment');
        }

        const sequence = args.sequence || (await this.signer.getTransactionCount()) + 1;
        const txRequest = this._populateTransaction(args);
        txRequest.setSequence(sequence);
        const dryRunTxResponse = await this.signer.callSmartContract(txRequest);
        return dryRunTxResponse;
    }

    contractAddress(){
        return this._deployResult.contract_address;
    }

    static getInterface(contractInterface) {
        return Contract.getInterface(contractInterface);
    }
}

exports.constants = index;
exports.networks = index$2;
exports.providers = index$3;
exports.signers = index$4;
exports.transactions = index$1;
exports.Wallet = Wallet;
exports.Contract = Contract;
exports.ContractFactory = ContractFactory;
exports.utils = utils;
exports.errors = errors;

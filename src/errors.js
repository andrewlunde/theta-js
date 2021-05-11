import BigNumber from 'bignumber.js';
import {Ten18} from "./constants/index";

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

export function humanizeErrorMessage(errorMessage){
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

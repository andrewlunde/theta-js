require('isomorphic-fetch');
const thetajs = require('..');

test('should humanize non-send transaction error', () => {
    const rawErrorMessage = 'Source balance is 0 ThetaWei, 83219719973005968227 TFuelWei, but required minimal balance is 0 ThetaWei, 93000000000000000000 TFuelWei';
    const humanizedErrorMessage = thetajs.errors.humanizeErrorMessage(rawErrorMessage);
    const expectedMessage = `Insufficient funds. You need at least 93 TFUEL to send this transaction.`;

    expect(humanizedErrorMessage).toBe(expectedMessage);
});

test('should humanize send transaction error (no tfuel for gas)', () => {
    const rawErrorMessage = 'Insufficient fund: balance is 1000000000000000000 ThetaWei, 0 TFuelWei, tried to send 1000000000000000000 ThetaWei, 1000000000000 TFuelWei';
    const humanizedErrorMessage = thetajs.errors.humanizeErrorMessage(rawErrorMessage);
    const expectedMessage = `Insufficient gas. You need at least 0.000001 TFUEL to send this transaction.`;

    expect(humanizedErrorMessage).toBe(expectedMessage);
});

test('should leave unknown errors alone', () => {
    const rawErrorMessage = 'Something happened on the vm';
    const humanizedErrorMessage = thetajs.errors.humanizeErrorMessage(rawErrorMessage);
    const expectedMessage = `Something happened on the vm`;

    expect(humanizedErrorMessage).toBe(expectedMessage);
});

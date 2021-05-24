```
$ tree
.
├── NOTES.md
├── README.md
├── dist
│   ├── thetajs.browser.js
│   ├── thetajs.cjs.js
│   ├── thetajs.esm.js
│   └── thetajs.umd.js
├── docs
│   └── css
│       └── styles.css
├── index.html
├── jest.config.js
├── jest.setup.js
├── mkdocs.yml
├── package-lock.json
├── package.json
├── rollup.config.js
├── src
│   ├── constants
│   │   └── index.js
│   ├── contracts
│   │   └── index.js
│   ├── crypto.js
│   ├── errors.js
│   ├── index.js
│   ├── networks
│   │   └── index.js
│   ├── providers
│   │   ├── BaseProvider.js
│   │   ├── HttpProvider.js
│   │   ├── PartnerVaultHttpProvider.js
│   │   └── index.js
│   ├── signers
│   │   ├── BaseSigner.js
│   │   ├── PartnerVaultSigner.js
│   │   └── index.js
│   ├── transactions
│   │   ├── common
│   │   │   ├── BaseTransaction.js
│   │   │   ├── Coins.js
│   │   │   ├── EthereumTx.js
│   │   │   ├── TxInput.js
│   │   │   ├── TxOutput.js
│   │   │   └── TxType.js
│   │   ├── index.js
│   │   └── types
│   │       ├── DepositStakeTransaction.js
│   │       ├── DepositStakeV2Transaction.js
│   │       ├── SendTransaction.js
│   │       ├── SmartContractTransaction.js
│   │       └── WithdrawStakeTransaction.js
│   ├── utils.js
│   └── wallet
│       └── index.js
└── test
    ├── contracts.test.js
    ├── errors.test.js
    ├── interface.test.js
    ├── providers.test.js
    ├── transactions.test.js
    └── wallet.test.js


$ find . -type f -exec grep -n "DepositStakeV2Transaction" {} \; -print
5:const {SendTransaction, DepositStakeV2Transaction, WithdrawStakeTransaction} = thetajs.transactions;
50:    let tx = new DepositStakeV2Transaction(txData);
./test/transactions.test.js
491:class DepositStakeV2Transaction extends BaseTransaction{
586:class DepositStakeV2Transaction$1 extends BaseTransaction{
911:        return new DepositStakeV2Transaction(txData);
914:        return new DepositStakeV2Transaction$1(txData);
929:    DepositStakeTransaction: DepositStakeV2Transaction,
930:    DepositStakeV2Transaction: DepositStakeV2Transaction$1,
./dist/thetajs.esm.js
497:class DepositStakeV2Transaction extends BaseTransaction{
592:class DepositStakeV2Transaction$1 extends BaseTransaction{
917:        return new DepositStakeV2Transaction(txData);
920:        return new DepositStakeV2Transaction$1(txData);
935:    DepositStakeTransaction: DepositStakeV2Transaction,
936:    DepositStakeV2Transaction: DepositStakeV2Transaction$1,
+ ./dist/thetajs.cjs.js
21188:  class DepositStakeV2Transaction extends BaseTransaction {
21277:  class DepositStakeV2Transaction$1 extends BaseTransaction {
21578:          return new DepositStakeV2Transaction(txData);
21581:          return new DepositStakeV2Transaction$1(txData);
21596:    DepositStakeTransaction: DepositStakeV2Transaction,
21597:    DepositStakeV2Transaction: DepositStakeV2Transaction$1,
+ ./dist/thetajs.umd.js
13:export default class DepositStakeV2Transaction extends BaseTransaction{
./src/transactions/types/DepositStakeTransaction.js
13:export default class DepositStakeV2Transaction extends BaseTransaction{
+ ./src/transactions/types/DepositStakeV2Transaction.js
6:import DepositStakeV2Transaction from "./types/DepositStakeV2Transaction";
49:        return new DepositStakeV2Transaction(txData);
67:    DepositStakeV2Transaction,
+ ./src/transactions/index.js

npm run build

```
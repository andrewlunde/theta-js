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

Debugging:

Configuration
```
  {
    "name": "Launch Trustee",
    "program": "${workspaceFolder}/cf/trustee/server.js",
    "request": "launch",
    "envFile": "${workspaceFolder}/cf/trustee/.env",
    "skipFiles": [
      "<node_internals>/**"
    ],
    "type": "pwa-node"
  },

```

.env
```
PORT=8080
destinations='[{"forwardAuthToken":true,"name":"theta_privatenet_be","url":"https://partner-prova-dev-theta-privatenet.cfapps.us21.hana.ondemand.com"}]'
VCAP_SERVICES='{  "credstore": [   {    "binding_guid": "499be50d-6104-4646-9e7f-8b97cf12e7ec",    "binding_name": null,    "credentials": {     "encryption": {      "client_private_key": "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCXNkqupf1PI6wlrQeVbWkAccNQSrSqb3J5KyHeO2tA6GUnbPgCIVvK61j7ZqG6PB+rcooe8AQU4oDdz1UrZKEQYvwfVtC1a+wPHIvYypz+a08c7jcUIkuuqLv14djWXb5RGJap04LcVaNMAuyHMF3QOmnuKpSDmFjZf24UoZg7nOBufFqo8fqaaeX0yziKAfs4l5/dmvSntQnIyafi9THw/cjWWqEZbl6T+IYqPo3Z8HlpApP8GvuFfevLcSINniTLWW0GxCGpLG+TS0KF7WbU3mmPWgaN6Pg1u/muxKz7q/DNR6oD0jseSRJsqSzIpDlrgCSAiAwWvrJwPhILk9LbAgMBAAECggEAdOCiGRx0Dxejl/uGQRmwb4d/UDBuNM6vzLhqFTwYSrNWfILdr8fZC5+dx7QsjaarU/nUiNU8UmhA8zGuwzukwuW/uvl/mLsyWvvVnFv/vSd0nwgByq43kWka35MR55/N2yEGU34JSAVpkvcvm87mtGxyNIT1BkJbasH0dD3zTR9gKTIUddbV2WMvs9ehrM0o+1icNheBXLCqcPm0Schczhdn1hetlrayYOJaKO/BofwS6aE36RqI0jZcr9IcmBvjdDZhDeEluJgFSB7CX2RY4O3MfrAziWJN8/ockZpyVFGC7VDWgBMPWUUMSpEUzJ0SKBXLXeZXm7nf6ZxsxaMeAQKBgQDpynEXOvZTj0mAQLAjV1+kDcgIIKeenTN+mOabPlwK6DJONd4gmwFNpaw8qghG58WwkSNn02H3wKVZ/WzvqITG/9p78+1dHP0srz8bftc6KZ86HsZCIbtWiDONfw0pNpBUYrQcnLQraDkp4QxzkN+SXQnoN46sCJRjSsMbsZbKwwKBgQClk55G8ojvaUgiT/cSloBFAwUqBNDFhkqGAPe5BFo19e7yOu4CcU4hysblBEklDqQhHNLfxqDT/2Rha3SHPs9SZKyZuWXKE+CtTPtxRAU7rpvxmaucBoJBBPtSFy5bltZHMlw5tYChrjJThiCG72PKH5BV5hMkNYlCg8fTu79mCQKBgQDdwwaVB3vidRc+TZ4GV/nDrsLgWsFEpk7TNgwAlB1Qx0H4iAZEnWOWGKGRBaRGRdFyk6mm8Y6LKLRv8QDlL8+Kx+SiERZFbZsFSNIurZlQdWyw/8IFtuNxyE5GWI7OWhB7ywiX31jTl9ApVmyuLmyz9AbSu+hcbOL8cE00NrcXawKBgHfZqIHWYQRbAtnDZCZSRjqt+vj1T2EK2bqxzJ5h5iKVCAbSXSHrfhC7xMhVF9T5Chjl0kYkcpnBjZluvISBFHShZsZHCsUBKmqHBKJyCA+xTjPNdgiUNYh24KwFF4s4XZZff55OIPPnMYp/1d+WPHc77bAfv88/6UD6PpSmm95xAoGAPNVnBnosaTWeqCMurjgexhf4V0Kvl5Qr9nF0ie/ioqayojbxXYC+OEvzMuKIA6J6iBsUL7mxcOfebUm9mFY0Bytw65eQHjDcba7IJT/62M279rDKDjTGp29l4q8e2yXztqCqRRNv+A0WNacj3hVWEGnTbxiRqablZW1YKyzg6jg=",      "server_public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqAp8XZbw+MnQQ2OYBUHwZfMM/1YnMXGkyWN0xEh0FihGyvPt+SSOYQFK/JRby2morMppHS2Dkmx9uMp2bcWPfspiWLXmPnS9pU9Pv6JaJFMxHPZEEpARIKQx2FhbsFtDYDHaYyCEzHohS165SIPdeAy1CU/C+eMeIU090eclDomVEyDFTzUylxm0atYvk8BurCKJviSzbOGu5VoQb1dDASHHiX4ou4004hBbmroXFLrIBIY0NX+TymrNuZZWkM21OBU9nrwFSccx1fY20RFK8941jTnhDO6ztSgo8VVeyBkzgoyDmQPMikeALyq7Y8vsMtiKATX9Cpfhd1RNBZ1xQwIDAQAB"     },     "parameters": {      "authorization": {       "default_permissions": [        "create",        "decrypt",        "delete",        "encrypt",        "info",        "list",        "namespaces",        "read",        "update"       ],       "namespace_permissions": {        "\u003cnamespace\u003e": [         "create",         "decrypt",         "delete",         "encrypt",         "list",         "read",         "update"        ]       }      }     },     "password": "n0LhBY5sq30aFzEqqpp6rbWl8C73bEycTC5Ow4tF9Bi3kdsv53EKcZaBRtqScEuz.0.LP27D8yv1b7Ys7VkuASV3oMjvb3hJDLdTVr4r/f1czs=",     "url": "https://credstore.cfapps.us21.hana.ondemand.com/api/v1/credentials",     "username": "499be50d-6104-4646-9e7f-8b97cf12e7ec.0.lm3vO66NypmJPtyZ4MNU2i9x3vJI3SPrFbdO3nYzqQI="    },    "instance_guid": "78180153-0f00-45b9-a62a-a17c38fcc4d4",    "instance_name": "THETA_CRED",    "label": "credstore",    "name": "THETA_CRED",    "plan": "standard",    "provider": null,    "syslog_drain_url": null,    "tags": [     "credstore",     "securestore",     "keystore",     "credentials"    ],    "volume_mounts": []   }  ],  "xsuaa": [   {    "binding_guid": "a8b728bc-3b50-400d-b335-4202ab5168f8",    "binding_name": null,    "credentials": {     "apiurl": "https://api.authentication.us21.hana.ondemand.com",     "clientid": "sb-dev-theta-app!t380",     "clientsecret": "HStV3jA9S3JLmzlEcBQ4efdIC9A=",     "identityzone": "partner-prova",     "identityzoneid": "bc6ba931-d86a-4804-8e5a-60429930e9b3",     "sburl": "https://internal-xsuaa.authentication.us21.hana.ondemand.com",     "subaccountid": "bc6ba931-d86a-4804-8e5a-60429930e9b3",     "tenantid": "bc6ba931-d86a-4804-8e5a-60429930e9b3",     "tenantmode": "dedicated",     "uaadomain": "authentication.us21.hana.ondemand.com",     "url": "https://partner-prova.authentication.us21.hana.ondemand.com",     "verificationkey": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqxBpX2ZM+Z0KCkkx30DdaUAS775+Hh02fhW5JgXlaDqRll1qrqpwynmcGb+kwz8GBW3OXB1pc9G+f/ZZfJcEUTCZeUbVqeVqTJ0sEoLwNoo7l/2Z1BAe/FB/hMnvz1JTQSZi9PZJNQCTZPFJ1xGAsduS+2Q43Zs0zYzD62UbTZrS9Ub4W7XI8qFeuUtojRKXJM0cAG+vo+u7RQhzXMSZlQsZbpXYLftvoV2N/aKIrlxMZsiBE0mS938584LW8+DL5ocJlIs2yWBXtHNDkkm7vsGFNzDeRjcq/2XEQ45jBl5xzdRgSUtUIw3B/of6piB9hp2b8BL25AmNyo6DqShx1QIDAQAB-----END PUBLIC KEY-----",     "xsappname": "dev-theta-app!t380",     "zoneid": "bc6ba931-d86a-4804-8e5a-60429930e9b3"    },    "instance_guid": "01a21dee-db9d-48aa-91e4-4edc366a32cd",    "instance_name": "THETA_UAA",    "label": "xsuaa",    "name": "THETA_UAA",    "plan": "application",    "provider": null,    "syslog_drain_url": null,    "tags": [     "xsuaa"    ],    "volume_mounts": []   }  ] }'

```
change in lib

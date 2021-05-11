import _ from 'lodash';
import ethers from "ethers";
import BigNumber from "bignumber.js";
import {SmartContractTransaction} from '../transactions/index';

const {
    defineReadOnly,
    isHexString, hexlify, isBytes,
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
        if (!roValue.isZero() && !fragment.payable) {
            //TODO: throw error - non-payable method cannot override value
        }
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
    if (leftovers.length) {
        //TODO: throw error - cannot override ${ leftovers.map((l) => JSON.stringify(l)).join(",") }
    }

    return new SmartContractTransaction(tx);
}

function buildSend(contract, fragment) {
    return async function(...args){
        if (!contract.signer) {
            //TODO: throw error - sending a transaction requires a signer
        }

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

export class Contract {
    constructor(address, contractInterface, signerOrProvider) {

        defineReadOnly(this, "interface", Contract.getInterface(contractInterface));

        if (signerOrProvider == null) {
            defineReadOnly(this, "provider", null);
            defineReadOnly(this, "signer", null);
        } else if (signerOrProvider._isSigner) {
            defineReadOnly(this, "provider", signerOrProvider.provider || null);
            defineReadOnly(this, "signer", signerOrProvider);
        } else if (signerOrProvider._isProvider) {
            defineReadOnly(this, "provider", signerOrProvider);
            defineReadOnly(this, "signer", null);
        } else {
            //TODO: throw error - invalid signer or provider
        }

        defineReadOnly(this, "callStatic", {});
        defineReadOnly(this, "estimateGas", {});
        defineReadOnly(this, "functions", {});
        defineReadOnly(this, "populateTransaction", {});

        defineReadOnly(this, "address", address);

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
                defineReadOnly(this, signature, buildDefault(this, fragment, true));
            }

            // We do not collapse simple calls on this bucket, which allows
            // frameworks to safely use this without introspection as well as
            // allows decoding error recovery.
            if (this.functions[signature] == null) {
                defineReadOnly(this.functions, signature, buildDefault(this, fragment, false));
            }

            if (this.callStatic[signature] == null) {
                defineReadOnly(this.callStatic, signature, buildCall(this, fragment, true));
            }

            if (this.populateTransaction[signature] == null) {
                defineReadOnly(this.populateTransaction, signature, buildPopulate(this, fragment));
            }

            if (this.estimateGas[signature] == null) {
                defineReadOnly(this.estimateGas, signature, buildEstimate(this, fragment));
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
                defineReadOnly(this, name, this[signature]);
            }

            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, this.functions[signature]);
            }

            if (this.callStatic[name] == null) {
                defineReadOnly(this.callStatic, name, this.callStatic[signature]);
            }

            if (this.populateTransaction[name] == null) {
                defineReadOnly(this.populateTransaction, name, this.populateTransaction[signature]);
            }

            if (this.estimateGas[name] == null) {
                defineReadOnly(this.estimateGas, name, this.estimateGas[signature]);
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
}

export class ContractFactory {
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
        if (!isHexString(bytecodeHex) || (bytecodeHex.length % 2)) {
            //TODO: throw error - invalid bytecode", "bytecode", bytecode
        }

        defineReadOnly(this, "bytecode", bytecodeHex);
        defineReadOnly(this, "interface", ContractFactory.getInterface(contractInterface));
        defineReadOnly(this, "signer", signer || null);
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

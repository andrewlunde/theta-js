import { BaseProvider } from "./BaseProvider";
import { getRPCUrlForChainId, ChainIds } from "../networks/index";

function getResult(response) {
    if (response.error) {
        const error = new Error(response.error.message);
        error.code = response.error.code;
        error.data = response.error.data;
        throw error;
    }

    return response.result;
}

export default class HttpProvider extends BaseProvider {
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

        const reqOpts = {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                "Content-Type": "application/json"
            }
        };
        const response = await fetch(this.url, reqOpts);

        const responseText = await response.text();

        if(this._reqLogger){
            this._reqLogger({
                request: Object.assign({}, reqOpts, {
                    url: response.url,
                }),
                response: {
                    status: response.status,
                    url: response.url,
                    body: responseText,
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

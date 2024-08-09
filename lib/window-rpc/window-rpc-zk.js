"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ENC_ALGORITHMS = void 0;
exports.makeWindowRpcZkOperator = makeWindowRpcZkOperator;
const utils_1 = require("ethers/lib/utils");
const utils_2 = require("../utils");
const utils_3 = require("./utils");
exports.ALL_ENC_ALGORITHMS = [
    'aes-256-ctr',
    'aes-128-ctr',
    'chacha20',
];
/**
 * The goal of this RPC operator is if the witness
 * is running in a WebView, it can call the native
 * application to perform the ZK operations
 */
function makeWindowRpcZkOperator(algorithm, bridge) {
    return {
        async generateWitness(input) {
            const operator = await (0, utils_2.makeDefaultZkOperator)(algorithm, 'snarkJS', utils_2.logger);
            return operator.generateWitness(input);
        },
        groth16Prove(input) {
            const id = (0, utils_3.generateRpcRequestId)();
            const waitForRes = waitForResponse('zkProve', id);
            bridge.send({
                type: 'zkProve',
                id,
                request: {
                    algorithm,
                    input: { witnessB64: utils_1.base64.encode(input) },
                },
                module: 'witness-sdk'
            });
            return waitForRes;
        },
        groth16Verify(publicSignals, proof) {
            const id = (0, utils_3.generateRpcRequestId)();
            const waitForRes = waitForResponse('zkVerify', id);
            bridge.send({
                type: 'zkVerify',
                id,
                request: {
                    algorithm,
                    publicSignals,
                    proof,
                },
                module: 'witness-sdk'
            });
            return waitForRes;
        },
    };
    function waitForResponse(type, requestId) {
        const returnType = `${type}Done`;
        return new Promise((resolve, reject) => {
            const cancel = bridge.onMessage(msg => {
                if (msg.id === requestId) {
                    if (msg.type === 'error') {
                        reject(new Error(msg.data.message));
                    }
                    else if (msg.type === returnType) {
                        resolve(msg.response);
                    }
                    cancel();
                }
            });
        });
    }
}

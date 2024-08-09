"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWindowRpc = setupWindowRpc;
const create_claim_1 = require("../create-claim");
const utils_1 = require("../providers/http/utils");
const utils_2 = require("../utils");
const benchmark_1 = require("../utils/benchmark");
const utils_3 = require("./utils");
const window_rpc_zk_1 = require("./window-rpc-zk");
class WindowRPCEvent extends Event {
    constructor(data) {
        super('message');
        this.data = data;
    }
}
let logger = (0, utils_2.makeLogger)(true);
/**
 * Sets up the current window to listen for RPC requests
 * from React Native or other windows
 */
function setupWindowRpc() {
    window.addEventListener('message', handleMessage, false);
    const windowMsgs = new EventTarget();
    const defaultWitnessUrl = (0, utils_3.getWsApiUrlFromLocation)();
    logger.info({ defaultWitnessUrl }, 'window RPC setup');
    async function handleMessage(event) {
        let id = '';
        let channel = '';
        try {
            if (!event.data) {
                return;
            }
            const req = (typeof event.data === 'string'
                ? JSON.parse(event.data)
                : event.data);
            // ignore any messages not for us
            if (req.module !== 'witness-sdk') {
                return;
            }
            id = req.id;
            channel = req.channel || '';
            windowMsgs.dispatchEvent(new WindowRPCEvent(req));
            // ignore response messages
            if (('isResponse' in req && req.isResponse)) {
                return;
            }
            if (!req.id) {
                logger.warn({ req }, 'Window RPC request missing ID');
                return;
            }
            logger.info({ req, origin: event.origin }, 'processing RPC request');
            switch (req.type) {
                case 'createClaim':
                    const claimTunnelRes = await (0, create_claim_1.createClaimOnWitness)({
                        ...req.request,
                        context: req.request.context
                            ? JSON.parse(req.request.context)
                            : undefined,
                        zkOperators: getZkOperators(req.request.zkOperatorMode),
                        client: { url: defaultWitnessUrl },
                        logger,
                        onStep(step) {
                            sendMessage({
                                type: 'createClaimStep',
                                step: {
                                    name: 'witness-progress',
                                    step,
                                },
                                module: 'witness-sdk',
                                id: req.id,
                            });
                        },
                    });
                    const response = (0, utils_3.mapToCreateClaimResponse)(claimTunnelRes);
                    respond({
                        type: 'createClaimDone',
                        response,
                    });
                    break;
                case 'extractHtmlElement':
                    respond({
                        type: 'extractHtmlElementDone',
                        response: (0, utils_1.extractHTMLElement)(req.request.html, req.request.xpathExpression, req.request.contentsOnly),
                    });
                    break;
                case 'extractJSONValueIndex':
                    respond({
                        type: 'extractJSONValueIndexDone',
                        response: (0, utils_1.extractJSONValueIndex)(req.request.json, req.request.jsonPath),
                    });
                    break;
                case 'getCurrentMemoryUsage':
                    respond({
                        type: 'getCurrentMemoryUsageDone',
                        response: await (0, utils_3.getCurrentMemoryUsage)(),
                    });
                    break;
                case 'setLogLevel':
                    logger = (0, utils_2.makeLogger)(true, req.request.logLevel, req.request.sendLogsToApp
                        ? (level, message) => (sendMessage({
                            type: 'log',
                            level,
                            message,
                            module: 'witness-sdk',
                            id: req.id,
                        }))
                        : undefined);
                    respond({
                        type: 'setLogLevelDone',
                        response: undefined
                    });
                    break;
                case 'benchmarkZK':
                    respond({
                        type: 'benchmarkZKDone',
                        response: await (0, benchmark_1.Benchmark)(),
                    });
                    break;
                default:
                    break;
            }
        }
        catch (err) {
            logger.error({ err, data: event.data }, 'error in RPC');
            respond({
                type: 'error',
                data: {
                    message: err.message,
                    stack: err.stack,
                }
            });
        }
        function getZkOperators(zkOperatorMode = 'default') {
            // use default snarkJS ops
            if (zkOperatorMode === 'default') {
                return;
            }
            // the native app/window calling implements
            // a ZK operator & wants to use it
            const operators = {};
            for (const alg of window_rpc_zk_1.ALL_ENC_ALGORITHMS) {
                operators[alg] = (0, window_rpc_zk_1.makeWindowRpcZkOperator)(alg, makeCommunicationBridge());
            }
            return operators;
        }
        function makeCommunicationBridge() {
            return {
                send: sendMessage,
                onMessage(cb) {
                    windowMsgs.addEventListener('message', handle);
                    return () => {
                        windowMsgs.removeEventListener('message', handle);
                    };
                    function handle(msg) {
                        cb(msg.data);
                    }
                },
            };
        }
        function respond(data) {
            const res = {
                ...data,
                id,
                module: 'witness-sdk',
                isResponse: true
            };
            return sendMessage(res);
        }
        function sendMessage(data) {
            var _a;
            const str = JSON.stringify(data);
            if (channel) {
                (_a = window[channel]) === null || _a === void 0 ? void 0 : _a.postMessage(str);
            }
            else {
                event.source.postMessage(str);
            }
        }
    }
}

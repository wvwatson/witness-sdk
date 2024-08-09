"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_NO_DATA_INTERVAL_MS = exports.PING_INTERVAL_MS = exports.DEFAULT_METADATA = exports.MAX_CLAIM_TIMESTAMP_DIFF_S = exports.DNS_SERVERS = exports.CONNECTION_TIMEOUT_MS = exports.API_SERVER_PORT = exports.DEFAULT_REMOTE_ZK_PARAMS = exports.BROWSER_RPC_PATHNAME = exports.WS_PATHNAME = exports.DEFAULT_HTTPS_PORT = exports.DEFAULT_BEACON_IDENTIFIER = exports.RECLAIM_USER_AGENT = exports.DEFAULT_ZK_CONCURRENCY = exports.MAX_ZK_CHUNKS = void 0;
const config_json_1 = __importDefault(require("../beacon/reclaim-trusted/config.json"));
const api_1 = require("../proto/api");
exports.MAX_ZK_CHUNKS = 40;
exports.DEFAULT_ZK_CONCURRENCY = 10;
exports.RECLAIM_USER_AGENT = 'reclaim/0.0.1';
exports.DEFAULT_BEACON_IDENTIFIER = {
    type: api_1.BeaconType.BEACON_TYPE_RECLAIM_TRUSTED,
    id: config_json_1.default.id
};
exports.DEFAULT_HTTPS_PORT = 443;
exports.WS_PATHNAME = '/ws';
exports.BROWSER_RPC_PATHNAME = '/browser-rpc';
exports.DEFAULT_REMOTE_ZK_PARAMS = {
    zkeyUrl: `${exports.BROWSER_RPC_PATHNAME}/resources/{algorithm}/circuit_final.zkey`,
    circuitWasmUrl: `${exports.BROWSER_RPC_PATHNAME}/resources/{algorithm}/circuit.wasm`,
};
exports.API_SERVER_PORT = 8001;
// 10s
exports.CONNECTION_TIMEOUT_MS = 10000;
exports.DNS_SERVERS = [
    '8.8.8.8',
    '8.8.4.4'
];
// 10m
exports.MAX_CLAIM_TIMESTAMP_DIFF_S = 10 * 60;
exports.DEFAULT_METADATA = {
    signatureType: api_1.ServiceSignatureType.SERVICE_SIGNATURE_TYPE_ETH,
    clientVersion: api_1.WitnessVersion.WITNESS_VERSION_2_0_0
};
exports.PING_INTERVAL_MS = 10000;
/**
 * Maximum interval in seconds to wait for before assuming
 * the connection is dead
 * @default 30s
 */
exports.MAX_NO_DATA_INTERVAL_MS = 30000;

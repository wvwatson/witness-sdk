import { type BeaconIdentifier, InitRequest } from '../proto/api';
export declare const MAX_ZK_CHUNKS = 40;
export declare const DEFAULT_ZK_CONCURRENCY = 10;
export declare const RECLAIM_USER_AGENT = "reclaim/0.0.1";
export declare const DEFAULT_BEACON_IDENTIFIER: BeaconIdentifier;
export declare const DEFAULT_HTTPS_PORT = 443;
export declare const WS_PATHNAME = "/ws";
export declare const BROWSER_RPC_PATHNAME = "/browser-rpc";
export declare const DEFAULT_REMOTE_ZK_PARAMS: {
    zkeyUrl: string;
    circuitWasmUrl: string;
};
export declare const API_SERVER_PORT = 8001;
export declare const CONNECTION_TIMEOUT_MS = 10000;
export declare const DNS_SERVERS: string[];
export declare const MAX_CLAIM_TIMESTAMP_DIFF_S: number;
export declare const DEFAULT_METADATA: InitRequest;
export declare const PING_INTERVAL_MS = 10000;
/**
 * Maximum interval in seconds to wait for before assuming
 * the connection is dead
 * @default 30s
 */
export declare const MAX_NO_DATA_INTERVAL_MS = 30000;

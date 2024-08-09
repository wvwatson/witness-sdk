import { EncryptionAlgorithm, ZKOperator } from '@reclaimprotocol/circom-symmetric-crypto';
import { CommunicationBridge } from './types';
export declare const ALL_ENC_ALGORITHMS: EncryptionAlgorithm[];
/**
 * The goal of this RPC operator is if the witness
 * is running in a WebView, it can call the native
 * application to perform the ZK operations
 */
export declare function makeWindowRpcZkOperator(algorithm: EncryptionAlgorithm, bridge: CommunicationBridge): ZKOperator;

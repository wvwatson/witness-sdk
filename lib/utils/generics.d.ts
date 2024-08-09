import { CipherSuite } from '@reclaimprotocol/tls';
import { RPCMessage, RPCMessages } from '../proto/api';
import { CompleteTLSPacket, IDecryptedTranscript, ProviderField, RPCEvent, RPCEventMap, RPCEventType, RPCType, Transcript } from '../types';
export declare function uint8ArrayToStr(arr: Uint8Array): string;
export declare function getTranscriptString(receipt: IDecryptedTranscript): string;
export declare const unixTimestampSeconds: () => number;
/**
 * Find index of needle in haystack
 */
export declare function findIndexInUint8Array(haystack: Uint8Array, needle: Uint8Array): number;
/**
 * convert a Uint8Array to a binary encoded str
 * from: https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L1063
 * @param buf
 * @returns
 */
export declare function uint8ArrayToBinaryStr(buf: Uint8Array): string;
export declare function gunzipSync(buf: Uint8Array): Uint8Array;
/**
 * Fetch the ZK algorithm for the specified cipher suite
 */
export declare function getZkAlgorithmForCipherSuite(cipherSuite: CipherSuite): "aes-256-ctr" | "aes-128-ctr" | "chacha20";
/**
 * Get the pure ciphertext without any MAC,
 * or authentication tag,
 * @param content content w/o header
 */
export declare function getPureCiphertext(content: Uint8Array, cipherSuite: CipherSuite): Uint8Array;
export declare function getProviderValue<P, T>(params: P, fn: ProviderField<P, T>): T;
export declare function generateRpcMessageId(): number;
/**
 * Random session ID for a WebSocket client.
 */
export declare function generateSessionId(): number;
/**
 * Random ID for a tunnel.
 */
export declare function generateTunnelId(): number;
export declare function makeRpcEvent<T extends RPCEventType>(type: T, data: RPCEventMap[T]): RPCEvent<T>;
/**
 * Get the RPC type from the key.
 * For eg. "claimTunnelRequest" ->
 * 	{ type: 'claimTunnel', direction: 'request' }
 */
export declare function getRpcTypeFromKey(key: string): {
    type: RPCType;
    direction: "request";
} | {
    type: RPCType;
    direction: "response";
} | undefined;
/**
 * Get the RPC response type from the RPC type.
 * For eg. "claimTunnel" -> "claimTunnelResponse"
 */
export declare function getRpcResponseType<T extends RPCType>(type: T): `${T}Response`;
/**
 * Get the RPC request type from the RPC type.
 * For eg. "claimTunnel" -> "claimTunnelRequest"
 */
export declare function getRpcRequestType<T extends RPCType>(type: T): `${T}Request`;
export declare function isApplicationData(packet: CompleteTLSPacket, tlsVersion: string): boolean;
/**
 * Convert the received data from a WS to a Uint8Array
 */
export declare function extractArrayBufferFromWsData(data: unknown): Promise<Uint8Array>;
/**
 * Check if the RPC message is a request or a response.
 */
export declare function getRpcRequest(msg: RPCMessage): {
    type: RPCType;
    direction: "request";
} | {
    type: RPCType;
    direction: "response";
} | {
    direction: "response";
    type: "error";
} | undefined;
/**
 * Finds all application data messages in a transcript
 * and returns them. Removes the "contentType" suffix from the message.
 * in TLS 1.3
 */
export declare function extractApplicationDataFromTranscript({ transcript, tlsVersion }: IDecryptedTranscript): Transcript<Uint8Array>;
export declare function packRpcMessages(...msgs: Partial<RPCMessage>[]): RPCMessages;

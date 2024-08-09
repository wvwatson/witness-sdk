"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unixTimestampSeconds = void 0;
exports.uint8ArrayToStr = uint8ArrayToStr;
exports.getTranscriptString = getTranscriptString;
exports.findIndexInUint8Array = findIndexInUint8Array;
exports.uint8ArrayToBinaryStr = uint8ArrayToBinaryStr;
exports.gunzipSync = gunzipSync;
exports.getZkAlgorithmForCipherSuite = getZkAlgorithmForCipherSuite;
exports.getPureCiphertext = getPureCiphertext;
exports.getProviderValue = getProviderValue;
exports.generateRpcMessageId = generateRpcMessageId;
exports.generateSessionId = generateSessionId;
exports.generateTunnelId = generateTunnelId;
exports.makeRpcEvent = makeRpcEvent;
exports.getRpcTypeFromKey = getRpcTypeFromKey;
exports.getRpcResponseType = getRpcResponseType;
exports.getRpcRequestType = getRpcRequestType;
exports.isApplicationData = isApplicationData;
exports.extractArrayBufferFromWsData = extractArrayBufferFromWsData;
exports.getRpcRequest = getRpcRequest;
exports.extractApplicationDataFromTranscript = extractApplicationDataFromTranscript;
exports.packRpcMessages = packRpcMessages;
const circom_symmetric_crypto_1 = require("@reclaimprotocol/circom-symmetric-crypto");
const tls_1 = require("@reclaimprotocol/tls");
const api_1 = require("../proto/api");
const DEFAULT_REDACTION_DATA = new Uint8Array(4)
    .fill(circom_symmetric_crypto_1.REDACTION_CHAR_CODE);
function uint8ArrayToStr(arr) {
    return new TextDecoder().decode(arr);
}
function getTranscriptString(receipt) {
    var _a;
    const applMsgs = extractApplicationDataFromTranscript(receipt);
    const strList = [];
    for (const { message, sender } of applMsgs) {
        const content = uint8ArrayToStr(message);
        if ((_a = strList[strList.length - 1]) === null || _a === void 0 ? void 0 : _a.startsWith(sender)) {
            strList[strList.length - 1] += content;
        }
        else {
            strList.push(`${sender}: ${content}`);
        }
    }
    return strList.join('\n');
}
const unixTimestampSeconds = () => Math.floor(Date.now() / 1000);
exports.unixTimestampSeconds = unixTimestampSeconds;
/**
 * Find index of needle in haystack
 */
function findIndexInUint8Array(haystack, needle) {
    for (let i = 0; i < haystack.length; i++) {
        if ((0, tls_1.areUint8ArraysEqual)(haystack.slice(i, i + needle.length), needle)) {
            return i;
        }
    }
    return -1;
}
/**
 * convert a Uint8Array to a binary encoded str
 * from: https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js#L1063
 * @param buf
 * @returns
 */
function uint8ArrayToBinaryStr(buf) {
    let ret = '';
    buf.forEach(v => (ret += String.fromCharCode(v)));
    return ret;
}
function gunzipSync(buf) {
    const { gunzipSync } = require('zlib');
    return gunzipSync(buf);
}
/**
 * Fetch the ZK algorithm for the specified cipher suite
 */
function getZkAlgorithmForCipherSuite(cipherSuite) {
    if (cipherSuite.includes('CHACHA20')) {
        return 'chacha20';
    }
    if (cipherSuite.includes('AES_256_GCM')) {
        return 'aes-256-ctr';
    }
    if (cipherSuite.includes('AES_128_GCM')) {
        return 'aes-128-ctr';
    }
    throw new Error(`${cipherSuite} not supported for ZK ops`);
}
/**
 * Get the pure ciphertext without any MAC,
 * or authentication tag,
 * @param content content w/o header
 */
function getPureCiphertext(content, cipherSuite) {
    // assert that the cipher suite is supported
    getZkAlgorithmForCipherSuite(cipherSuite);
    // 16 => auth tag length
    content = content.slice(0, -16);
    const { ivLength: fixedIvLength, } = tls_1.SUPPORTED_CIPHER_SUITE_MAP[cipherSuite];
    // 12 => total IV length
    const recordIvLength = 12 - fixedIvLength;
    // record IV is prefixed to the ciphertext
    content = content.slice(recordIvLength);
    return content;
}
function getProviderValue(params, fn) {
    return typeof fn === 'function'
        // @ts-ignore
        ? fn(params)
        : fn;
}
function generateRpcMessageId() {
    return (0, tls_1.uint8ArrayToDataView)(tls_1.crypto.randomBytes(8)).getUint32(0);
}
/**
 * Random session ID for a WebSocket client.
 */
function generateSessionId() {
    return generateRpcMessageId();
}
/**
 * Random ID for a tunnel.
 */
function generateTunnelId() {
    return generateRpcMessageId();
}
function makeRpcEvent(type, data) {
    const ev = new Event(type);
    ev.data = data;
    return ev;
}
/**
 * Get the RPC type from the key.
 * For eg. "claimTunnelRequest" ->
 * 	{ type: 'claimTunnel', direction: 'request' }
 */
function getRpcTypeFromKey(key) {
    if (key.endsWith('Request')) {
        return {
            type: key.slice(0, -7),
            direction: 'request'
        };
    }
    if (key.endsWith('Response')) {
        return {
            type: key.slice(0, -8),
            direction: 'response'
        };
    }
}
/**
 * Get the RPC response type from the RPC type.
 * For eg. "claimTunnel" -> "claimTunnelResponse"
 */
function getRpcResponseType(type) {
    return `${type}Response`;
}
/**
 * Get the RPC request type from the RPC type.
 * For eg. "claimTunnel" -> "claimTunnelRequest"
 */
function getRpcRequestType(type) {
    return `${type}Request`;
}
function isApplicationData(packet, tlsVersion) {
    return packet.type === 'ciphertext'
        && (packet.contentType === 'APPLICATION_DATA'
            || (packet.data[0] === tls_1.PACKET_TYPE.WRAPPED_RECORD
                && tlsVersion === 'TLS1_2'));
}
/**
 * Convert the received data from a WS to a Uint8Array
 */
async function extractArrayBufferFromWsData(data) {
    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }
    // uint8array/Buffer
    if (typeof data === 'object' && data && 'buffer' in data) {
        return data;
    }
    if (typeof data === 'string') {
        return (0, tls_1.strToUint8Array)(data);
    }
    if (data instanceof Blob) {
        return new Uint8Array(await data.arrayBuffer());
    }
    throw new Error('unsupported data: ' + String(data));
}
/**
 * Check if the RPC message is a request or a response.
 */
function getRpcRequest(msg) {
    if (msg.requestError) {
        return {
            direction: 'response',
            type: 'error'
        };
    }
    for (const key in msg) {
        if (!msg[key]) {
            continue;
        }
        const rpcType = getRpcTypeFromKey(key);
        if (!rpcType) {
            continue;
        }
        return rpcType;
    }
}
/**
 * Finds all application data messages in a transcript
 * and returns them. Removes the "contentType" suffix from the message.
 * in TLS 1.3
 */
function extractApplicationDataFromTranscript({ transcript, tlsVersion }) {
    const msgs = [];
    for (const m of transcript) {
        let message;
        // redacted msgs but with a valid packet header
        // can be considered application data messages
        if (m.redacted) {
            if (!m.plaintextLength) {
                message = DEFAULT_REDACTION_DATA;
            }
            else {
                const len = tlsVersion === 'TLS1_3'
                    // remove content type suffix
                    ? m.plaintextLength - 1
                    : m.plaintextLength;
                message = new Uint8Array(len)
                    .fill(circom_symmetric_crypto_1.REDACTION_CHAR_CODE);
            }
            // otherwise, we need to check the content type
        }
        else if (tlsVersion === 'TLS1_3') {
            const contentType = m.message[m.message.length - 1];
            if (contentType !== tls_1.CONTENT_TYPE_MAP['APPLICATION_DATA']) {
                continue;
            }
            message = m.message.slice(0, -1);
        }
        else if (m.recordHeader[0] === tls_1.PACKET_TYPE.WRAPPED_RECORD) {
            message = m.message;
        }
        else {
            continue;
        }
        msgs.push({ message, sender: m.sender });
    }
    return msgs;
}
function packRpcMessages(...msgs) {
    return api_1.RPCMessages.create({
        messages: msgs.map(msg => (api_1.RPCMessage.create({
            ...msg,
            id: msg.id || generateRpcMessageId()
        })))
    });
}

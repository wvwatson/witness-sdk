"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidClaimRequest = assertValidClaimRequest;
exports.assertValidProviderTranscript = assertValidProviderTranscript;
exports.assertTranscriptsMatch = assertTranscriptsMatch;
exports.decryptTranscript = decryptTranscript;
const tls_1 = require("@reclaimprotocol/tls");
const api_1 = require("../../proto/api");
const providers_1 = require("../../providers");
const signatures_1 = require("../../signatures");
const utils_1 = require("../../utils");
const generics_1 = require("./generics");
/**
 * Asserts that the claim request is valid.
 *
 * 1. We begin by verifying the signature of the claim request.
 * 2. Next, we produce the transcript of the TLS exchange
 * from the proofs provided by the client.
 * 3. We then pull the provider the client is trying to claim
 * from
 * 4. We then use the provider's verification function to verify
 *  whether the claim is valid.
 *
 * If any of these steps fail, we throw an error.
 */
async function assertValidClaimRequest(request, metadata, logger) {
    var _a;
    const { data, signatures: { requestSignature } = {}, zkEngine } = request;
    if (!data) {
        throw new utils_1.WitnessError('WITNESS_ERROR_INVALID_CLAIM', 'No info provided on claim request');
    }
    if (!(requestSignature === null || requestSignature === void 0 ? void 0 : requestSignature.length)) {
        throw new utils_1.WitnessError('WITNESS_ERROR_INVALID_CLAIM', 'No signature provided on claim request');
    }
    // verify request signature
    const serialisedReq = api_1.ClaimTunnelRequest
        .encode({ ...request, signatures: undefined })
        .finish();
    const { verify: verifySig } = signatures_1.SIGNATURES[metadata.signatureType];
    const verified = await verifySig(serialisedReq, requestSignature, data.owner);
    if (!verified) {
        throw new utils_1.WitnessError('WITNESS_ERROR_INVALID_CLAIM', 'Invalid signature on claim request');
    }
    const receipt = await decryptTranscript(request.transcript, logger, zkEngine !== api_1.ZKProofEngine.UNRECOGNIZED ? (zkEngine === api_1.ZKProofEngine.ZK_ENGINE_SNARKJS ? 'snarkJS' : 'gnark') : 'snarkJS');
    const reqHost = (_a = request.request) === null || _a === void 0 ? void 0 : _a.host;
    if (receipt.hostname !== reqHost) {
        throw new Error(`Expected server name ${reqHost}, got ${receipt.hostname}`);
    }
    // get all application data messages
    const applData = (0, utils_1.extractApplicationDataFromTranscript)(receipt);
    const newData = await assertValidProviderTranscript(applData, data);
    if (newData !== data) {
        logger.info({ newData }, 'updated claim info');
    }
    return newData;
}
/**
 * Verify that the transcript contains a valid claim
 * for the provider.
 */
async function assertValidProviderTranscript(applData, info) {
    var _a;
    const providerName = info.provider;
    const provider = providers_1.providers[providerName];
    if (!provider) {
        throw new utils_1.WitnessError('WITNESS_ERROR_INVALID_CLAIM', `Unsupported provider: ${providerName}`);
    }
    const params = (0, generics_1.niceParseJsonObject)(info.parameters, 'params');
    const ctx = (0, generics_1.niceParseJsonObject)(info.context, 'context');
    (0, utils_1.assertValidateProviderParams)(providerName, params);
    const rslt = await provider.assertValidProviderReceipt(applData, params);
    const extractedParameters = (rslt === null || rslt === void 0 ? void 0 : rslt.extractedParameters) || {};
    if (!Object.keys(extractedParameters).length) {
        return info;
    }
    const newInfo = { ...info };
    ctx.extractedParameters = extractedParameters;
    ctx.providerHash = (0, utils_1.hashProviderParams)(params);
    newInfo.context = (_a = (0, utils_1.canonicalStringify)(ctx)) !== null && _a !== void 0 ? _a : '';
    return newInfo;
}
/**
 * Verify that the transcript provided by the client
 * matches the transcript of the tunnel, the server
 * has created.
 */
function assertTranscriptsMatch(clientTranscript, tunnelTranscript) {
    const clientSends = (0, tls_1.concatenateUint8Arrays)(clientTranscript
        .filter(m => m.sender === api_1.TranscriptMessageSenderType.TRANSCRIPT_MESSAGE_SENDER_TYPE_CLIENT)
        .map(m => m.message));
    const tunnelSends = (0, tls_1.concatenateUint8Arrays)(tunnelTranscript
        .filter(m => m.sender === 'client')
        .map(m => m.message));
    if (!(0, tls_1.areUint8ArraysEqual)(clientSends, tunnelSends)) {
        throw utils_1.WitnessError.badRequest('Outgoing messages from client do not match the tunnel transcript');
    }
    const clientRecvs = (0, tls_1.concatenateUint8Arrays)(clientTranscript
        .filter(m => m.sender === api_1.TranscriptMessageSenderType.TRANSCRIPT_MESSAGE_SENDER_TYPE_SERVER)
        .map(m => m.message));
    const tunnelRecvs = (0, tls_1.concatenateUint8Arrays)(tunnelTranscript
        .filter(m => m.sender === 'server')
        .map(m => m.message))
        // We only need to compare the first N messages
        // that the client claims to have received
        // the rest are not relevant -- so even if they're
        // not present in the tunnel transcript, it's fine
        .slice(0, clientRecvs.length);
    if (!(0, tls_1.areUint8ArraysEqual)(clientRecvs, tunnelRecvs)) {
        throw utils_1.WitnessError.badRequest('Incoming messages from server do not match the tunnel transcript');
    }
}
async function decryptTranscript(transcript, logger, zkEngine) {
    // first server packet is hello packet
    const { serverTlsVersion, cipherSuite, } = await getServerHello();
    logger.info({ serverTlsVersion, cipherSuite }, 'extracted server hello params');
    const clientHello = getClientHello();
    const { SERVER_NAME: sni } = clientHello.extensions;
    const hostname = sni === null || sni === void 0 ? void 0 : sni.serverName;
    if (!hostname) {
        throw new Error('client hello has no SNI');
    }
    // use this to determine encrypted packets on TLS1.2
    const changeCipherSpecMsgIdx = serverTlsVersion === 'TLS1_2'
        ? transcript.findIndex(p => (p.message[0] === tls_1.PACKET_TYPE['CHANGE_CIPHER_SPEC']))
        : -1;
    const mappedTranscriptResults = await Promise.allSettled(transcript.map(async ({ sender, message, reveal: { zkReveal, directReveal } = {} }, i) => {
        var _a, _b, _c, _d;
        const isEncrypted = isEncryptedPacket(i);
        if (
        // if someone provided a reveal, but the packet
        // is not encrypted, it's probably a mistake
        !isEncrypted
            && (((_a = zkReveal === null || zkReveal === void 0 ? void 0 : zkReveal.proofs) === null || _a === void 0 ? void 0 : _a.length) || ((_b = directReveal === null || directReveal === void 0 ? void 0 : directReveal.key) === null || _b === void 0 ? void 0 : _b.length))) {
            throw new Error('packet not encrypted, but has a reveal');
        }
        let redacted = isEncrypted;
        let plaintext = new Uint8Array();
        let plaintextLength;
        const recordHeader = message.slice(0, 5);
        const content = getWithoutHeader(message);
        if ((_c = directReveal === null || directReveal === void 0 ? void 0 : directReveal.key) === null || _c === void 0 ? void 0 : _c.length) {
            const { key, iv, recordNumber } = directReveal;
            const { cipher } = tls_1.SUPPORTED_CIPHER_SUITE_MAP[cipherSuite];
            const importedKey = await tls_1.crypto.importKey(cipher, key);
            const result = await (0, tls_1.decryptWrappedRecord)(content, {
                iv,
                key: importedKey,
                recordHeader,
                recordNumber,
                version: serverTlsVersion,
                cipherSuite,
            });
            redacted = false;
            plaintext = result.plaintext;
            plaintextLength = plaintext.length;
        }
        else if ((_d = zkReveal === null || zkReveal === void 0 ? void 0 : zkReveal.proofs) === null || _d === void 0 ? void 0 : _d.length) {
            const result = await (0, utils_1.verifyZkPacket)({
                ciphertext: content,
                zkReveal,
                logger,
                cipherSuite,
                zkEngine: zkEngine
            });
            plaintext = result.redactedPlaintext;
            redacted = false;
            plaintextLength = plaintext.length;
        }
        else {
            plaintextLength = (0, utils_1.getPureCiphertext)(getWithoutHeader(message), cipherSuite).length;
        }
        return {
            sender: sender === api_1.TranscriptMessageSenderType.TRANSCRIPT_MESSAGE_SENDER_TYPE_CLIENT
                ? 'client'
                : 'server',
            redacted,
            message: plaintext,
            recordHeader,
            plaintextLength,
        };
    }));
    const mappedTranscript = mappedTranscriptResults.map((r, i) => {
        if (r.status === 'fulfilled') {
            return r.value;
        }
        logger === null || logger === void 0 ? void 0 : logger.error({ i, err: r.reason }, 'error in handling packet');
        throw new utils_1.WitnessError('WITNESS_ERROR_INVALID_CLAIM', `error in handling packet at idx ${i}: ${r.reason.message}`, {
            packetIdx: i,
            error: r.reason,
        });
    });
    return {
        transcript: mappedTranscript,
        hostname,
        tlsVersion: serverTlsVersion,
    };
    function isEncryptedPacket(pktIdx) {
        const { message } = transcript[pktIdx];
        if (message[0] === tls_1.PACKET_TYPE['WRAPPED_RECORD']) {
            return true;
        }
        // msg is after change cipher spec
        return changeCipherSpecMsgIdx >= 0
            && pktIdx > changeCipherSpecMsgIdx;
    }
    function getServerHello() {
        // first server packet is hello packet
        const serverHelloPacket = transcript.find(p => p.sender === api_1.TranscriptMessageSenderType
            .TRANSCRIPT_MESSAGE_SENDER_TYPE_SERVER);
        if (!serverHelloPacket) {
            throw new Error('session has no server hello params');
        }
        // strip the record header & packet prefix (02 00 00 97)
        // & parse the message
        const message = getWithoutHeader(serverHelloPacket.message)
            .slice(4);
        return (0, tls_1.parseServerHello)(message);
    }
    function getClientHello() {
        // first client packet is hello packet
        const message = getWithoutHeader(transcript[0].message);
        return (0, tls_1.parseClientHello)(message);
    }
    function getWithoutHeader(message) {
        // strip the record header (xx 03 03 xx xx)
        return message.slice(5);
    }
}

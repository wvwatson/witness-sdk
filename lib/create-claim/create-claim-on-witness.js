"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClaimOnWitness = createClaimOnWitness;
const tls_1 = require("@reclaimprotocol/tls");
const config_1 = require("../config");
const api_1 = require("../proto/api");
const providers_1 = require("../providers");
const signatures_1 = require("../signatures");
const make_rpc_tls_tunnel_1 = require("../tunnels/make-rpc-tls-tunnel");
const utils_1 = require("../utils");
const retries_1 = require("../utils/retries");
const tls_2 = require("../utils/tls");
const witness_pool_1 = require("./witness-pool");
/**
 * Create a claim on a witness server
 */
function createClaimOnWitness({ logger: _logger, ...opts }) {
    const logger = _logger
        // if the client has already been initialised
        // and no logger is provided, use the client's logger
        // otherwise default to the global logger
        || ('logger' in opts.client ? opts.client.logger : utils_1.logger);
    return (0, retries_1.executeWithRetries)(attempt => (_createClaimOnWitness({
        ...opts,
        logger: attempt
            ? logger.child({ attempt })
            : logger
    })), { logger, shouldRetry });
}
function shouldRetry(err) {
    if (err instanceof TypeError) {
        return false;
    }
    return err instanceof utils_1.WitnessError
        && err.code !== 'WITNESS_ERROR_INVALID_CLAIM'
        && err.code !== 'WITNESS_ERROR_BAD_REQUEST';
}
async function _createClaimOnWitness({ name, params, secretParams, context, onStep, ownerPrivateKey, client: clientInit, logger = utils_1.logger, ...zkOpts }) {
    const provider = providers_1.providers[name];
    const hostPort = (0, utils_1.getProviderValue)(params, provider.hostPort);
    const geoLocation = (0, utils_1.getProviderValue)(params, provider.geoLocation);
    const providerTlsOpts = (0, utils_1.getProviderValue)(params, provider.additionalClientOptions);
    const tlsOpts = {
        ...(0, tls_2.getDefaultTlsOptions)(),
        ...providerTlsOpts,
    };
    let redactionMode = (0, utils_1.getProviderValue)(params, provider.writeRedactionMode);
    const [host, port] = hostPort.split(':');
    const resParser = (0, utils_1.makeHttpResponseParser)();
    let client;
    let lastMsgRevealed = false;
    const revealMap = new Map();
    onStep === null || onStep === void 0 ? void 0 : onStep({ name: 'connecting' });
    let endedHttpRequest;
    const createTunnelReq = {
        host,
        port: port ? +port : config_1.DEFAULT_HTTPS_PORT,
        geoLocation,
        id: (0, utils_1.generateTunnelId)()
    };
    const tunnel = await (0, make_rpc_tls_tunnel_1.makeRpcTlsTunnel)({
        tlsOpts,
        connect: (initMessages) => {
            let created = false;
            if ('metadata' in clientInit) {
                client = clientInit;
            }
            else {
                client = (0, witness_pool_1.getWitnessClientFromPool)(clientInit.url, () => {
                    created = true;
                    return { initMessages, logger };
                });
            }
            if (!created) {
                client
                    .waitForInit()
                    .then(() => client.sendMessage(...initMessages))
                    .catch(err => {
                    logger.error({ err }, 'error in sending init msgs');
                });
            }
            return client;
        },
        logger,
        request: createTunnelReq,
        onMessage(data) {
            resParser.onChunk(data);
            if (resParser.res.complete) {
                logger === null || logger === void 0 ? void 0 : logger.debug('got complete HTTP response from server');
                // wait a little bit to make sure the client has
                // finished writing the response
                setTimeout(() => {
                    endedHttpRequest === null || endedHttpRequest === void 0 ? void 0 : endedHttpRequest();
                }, 100);
            }
        },
        onClose(err) {
            const level = err ? 'error' : 'debug';
            logger === null || logger === void 0 ? void 0 : logger[level]({ err }, 'tls session ended');
            endedHttpRequest === null || endedHttpRequest === void 0 ? void 0 : endedHttpRequest(err);
            try {
                resParser.streamEnded();
            }
            catch (_a) { }
        },
    });
    const { version: tlsVersion, cipherSuite } = tunnel.tls.getMetadata();
    if (tlsVersion === 'TLS1_2' && redactionMode !== 'zk') {
        redactionMode = 'zk';
        logger.info('TLS1.2 detected, defaulting to zk redaction mode');
    }
    const { redactions, data: requestStr } = provider.createRequest(
    // @ts-ignore
    secretParams, params);
    const requestData = typeof requestStr === 'string'
        ? (0, tls_1.strToUint8Array)(requestStr)
        : requestStr;
    logger.debug({ redactions: redactions.length }, 'generated request');
    const waitForAllData = new Promise((resolve, reject) => {
        endedHttpRequest = err => (err ? reject(err) : resolve());
    });
    onStep === null || onStep === void 0 ? void 0 : onStep({ name: 'sending-request-data' });
    try {
        if (redactionMode === 'zk') {
            await writeRedactedZk();
        }
        else {
            await writeRedactedWithKeyUpdate();
        }
        logger.info('wrote request to server');
    }
    catch (err) {
        // wait for complete stream end when the session is closed
        // mid-write, as this means the server could not process
        // our request due to some error. Hope the stream end
        // error will be more descriptive
        logger.error({ err }, 'session errored during write, waiting for stream end');
    }
    onStep === null || onStep === void 0 ? void 0 : onStep({ name: 'waiting-for-response' });
    await waitForAllData;
    await tunnel.close();
    logger.info('got full response from server');
    const signatureAlg = signatures_1.SIGNATURES[client.metadata.signatureType];
    // now that we have the full transcript, we need
    // to generate the ZK proofs & send them to the witness
    // to verify & sign our claim
    const claimTunnelReq = api_1.ClaimTunnelRequest.create({
        request: createTunnelReq,
        data: {
            provider: name,
            parameters: (0, utils_1.canonicalStringify)(params),
            context: (0, utils_1.canonicalStringify)(context),
            timestampS: (0, utils_1.unixTimestampSeconds)(),
            owner: getAddress(),
        },
        transcript: await generateTranscript(),
        zkEngine: zkOpts.zkEngine ? (zkOpts.zkEngine === 'snarkJS' ? api_1.ZKProofEngine.ZK_ENGINE_SNARKJS : api_1.ZKProofEngine.ZK_ENGINE_GNARK) : api_1.ZKProofEngine.ZK_ENGINE_SNARKJS
    });
    onStep === null || onStep === void 0 ? void 0 : onStep({ name: 'waiting-for-verification' });
    const claimTunnelBytes = api_1.ClaimTunnelRequest
        .encode(claimTunnelReq).finish();
    const requestSignature = await signatureAlg
        .sign(claimTunnelBytes, ownerPrivateKey);
    claimTunnelReq.signatures = { requestSignature };
    const result = await client.rpc('claimTunnel', claimTunnelReq);
    logger.info({ success: !!result.claim }, 'recv claim response from witness');
    return result;
    async function writeRedactedWithKeyUpdate() {
        var _a;
        let currentIndex = 0;
        for (let i = 0; i < redactions.length; i++) {
            const section = redactions[i];
            const block = requestData
                .slice(currentIndex, section.fromIndex);
            if (block.length) {
                await writeWithReveal(block, true);
            }
            const redacted = requestData
                .slice(section.fromIndex, section.toIndex);
            await writeWithReveal(redacted, false);
            currentIndex = section.toIndex;
        }
        // write if redactions were there
        const lastBlockStart = ((_a = redactions === null || redactions === void 0 ? void 0 : redactions[redactions.length - 1]) === null || _a === void 0 ? void 0 : _a.toIndex) || 0;
        const block = requestData.slice(lastBlockStart);
        if (block.length) {
            await writeWithReveal(block, true);
        }
    }
    async function writeRedactedZk() {
        await tunnel.tls.write(requestData);
        setRevealOfLastSentBlock({
            type: 'zk',
            redactedPlaintext: (0, utils_1.redactSlices)(requestData, redactions)
        });
    }
    /**
     * Write data to the tunnel, with the option to mark the packet
     * as revealable to the witness or not
     */
    async function writeWithReveal(data, reveal) {
        // if the reveal state has changed, update the traffic keys
        // to not accidentally reveal a packet not meant to be revealed
        // and vice versa
        if (reveal !== lastMsgRevealed) {
            await tunnel.tls.updateTrafficKeys();
        }
        await tunnel.write(data);
        // now we mark the packet to be revealed to the witness
        setRevealOfLastSentBlock(reveal ? { type: 'complete' } : undefined);
        lastMsgRevealed = reveal;
    }
    function setRevealOfLastSentBlock(reveal) {
        const lastBlock = getLastBlock('client');
        if (!lastBlock) {
            return;
        }
        setRevealOfMessage(lastBlock.message, reveal);
    }
    function getLastBlock(sender) {
        // set the correct index for the server blocks
        for (let i = tunnel.transcript.length - 1; i >= 0; i--) {
            const block = tunnel.transcript[i];
            if (block.sender === sender) {
                return block;
            }
        }
    }
    /**
     * Generate transcript with reveal data for the witness to verify
     */
    async function generateTranscript() {
        addServerSideReveals();
        const startMs = Date.now();
        const revealedMessages = await (0, utils_1.preparePacketsForReveal)(tunnel.transcript, revealMap, {
            logger,
            cipherSuite: cipherSuite,
            onZkProgress(done, total) {
                const timeSinceStartMs = Date.now() - startMs;
                const timePerBlockMs = timeSinceStartMs / done;
                const timeLeftMs = timePerBlockMs * (total - done);
                onStep === null || onStep === void 0 ? void 0 : onStep({
                    name: 'generating-zk-proofs',
                    proofsDone: done,
                    proofsTotal: total,
                    approxTimeLeftS: Math.round(timeLeftMs / 1000),
                });
            },
            ...zkOpts,
        });
        return revealedMessages;
    }
    /**
     * Add reveals for server side blocks, using
     * the provider's redaction function if available.
     * Otherwise, opts to reveal all server side blocks.
     */
    function addServerSideReveals() {
        const allPackets = tunnel.transcript;
        let serverPacketsToReveal = 'all';
        const packets = [];
        const serverBlocks = [];
        for (let i = 0; i < allPackets.length; i++) {
            const b = allPackets[i];
            if (b.message.type !== 'ciphertext'
                || !(0, utils_1.isApplicationData)(b.message, tlsVersion)) {
                continue;
            }
            const plaintext = tlsVersion === 'TLS1_3'
                ? b.message.plaintext.slice(0, -1)
                : b.message.plaintext;
            packets.push({
                message: plaintext,
                sender: b.sender
            });
            if (b.sender === 'server') {
                serverBlocks.push({
                    plaintext: plaintext,
                    message: b.message
                });
            }
        }
        provider.assertValidProviderReceipt(packets, {
            ...params,
            secretParams: secretParams //provide secret params for proper request body validation
        });
        if (provider.getResponseRedactions) {
            serverPacketsToReveal = (0, utils_1.getBlocksToReveal)(serverBlocks, total => provider.getResponseRedactions(total, params));
        }
        if (serverPacketsToReveal === 'all') {
            // reveal all server side blocks
            for (const { message, sender } of allPackets) {
                if (sender === 'server') {
                    setRevealOfMessage(message, { type: 'complete' });
                }
            }
        }
        else {
            for (const { block, redactedPlaintext } of serverPacketsToReveal) {
                setRevealOfMessage(block.message, {
                    type: 'zk',
                    redactedPlaintext
                });
            }
        }
        // reveal all client side handshake blocks
        // so the witness can verify there was no
        // hanky-panky
        for (const p of allPackets) {
            if (p.sender !== 'client') {
                continue;
            }
            if (p.message.type !== 'ciphertext') {
                continue;
            }
            // break the moment we hit the first
            // application data packet
            if ((0, utils_1.isApplicationData)(p.message, tlsVersion)) {
                break;
            }
            if (redactionMode === 'zk') {
                setRevealOfMessage(p.message, {
                    type: 'zk',
                    redactedPlaintext: p.message.plaintext
                });
            }
            else {
                setRevealOfMessage(p.message, { type: 'complete' });
            }
        }
    }
    function setRevealOfMessage(message, reveal) {
        if (reveal) {
            revealMap.set(message, reveal);
            return;
        }
        revealMap.delete(message);
    }
    function getAddress() {
        const { getAddress, getPublicKey, } = signatureAlg;
        const pubKey = getPublicKey(ownerPrivateKey);
        return getAddress(pubKey);
    }
}

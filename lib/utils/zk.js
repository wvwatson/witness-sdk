"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeZkProofGenerator = makeZkProofGenerator;
exports.verifyZkPacket = verifyZkPacket;
exports.makeDefaultZkOperator = makeDefaultZkOperator;
const circom_symmetric_crypto_1 = require("@reclaimprotocol/circom-symmetric-crypto");
const gnark_1 = require("@reclaimprotocol/circom-symmetric-crypto/lib/gnark");
const tls_1 = require("@reclaimprotocol/tls");
const config_1 = require("../config");
const env_1 = require("./env");
const error_1 = require("./error");
const generics_1 = require("./generics");
const logger_1 = require("./logger");
const redactions_1 = require("./redactions");
const retries_1 = require("./retries");
const ZK_CONCURRENCY = +((0, env_1.getEnvVariable)('ZK_CONCURRENCY')
    || config_1.DEFAULT_ZK_CONCURRENCY);
async function makeZkProofGenerator({ zkOperators, logger = logger_1.logger, zkProofConcurrency = ZK_CONCURRENCY, maxZkChunks = config_1.MAX_ZK_CHUNKS, cipherSuite, zkEngine = 'snarkJS' }) {
    const { default: PQueue } = await import('p-queue');
    const zkQueue = new PQueue({
        concurrency: zkProofConcurrency,
        autoStart: true,
    });
    const packetsToProve = [];
    logger = (logger || logger_1.logger).child({ module: 'zk', zkEngine: zkEngine });
    let zkChunksToProve = 0;
    return {
        /**
         * Adds the given packet to the list of packets to
         * generate ZK proofs for.
         *
         * Call `generateProofs()` to finally generate the proofs
         */
        async addPacketToProve(packet, reveal, onGeneratedProofs) {
            if (packet.type === 'plaintext') {
                throw new Error('Cannot generate proof for plaintext');
            }
            if (zkChunksToProve > maxZkChunks) {
                throw new Error(`Too many chunks to prove: ${zkChunksToProve} > ${maxZkChunks}`);
            }
            const alg = (0, generics_1.getZkAlgorithmForCipherSuite)(cipherSuite);
            const chunkSizeBytes = getChunkSizeBytes(alg);
            const { redactedPlaintext } = reveal;
            const key = await tls_1.crypto.exportKey(packet.encKey);
            const iv = packet.iv;
            const ciphertext = (0, generics_1.getPureCiphertext)(packet.ciphertext, cipherSuite);
            const chunks = Math.ceil(ciphertext.length / chunkSizeBytes);
            const packetToProve = {
                onGeneratedProofs,
                algorithm: alg,
                proofsToGenerate: [],
            };
            for (let i = 0; i < chunks; i++) {
                const proof = getProofGenerationParamsForChunk(alg, {
                    key,
                    iv,
                    ciphertext,
                    redactedPlaintext,
                    offsetChunks: i
                });
                if (!proof) {
                    continue;
                }
                packetToProve.proofsToGenerate.push(proof);
                zkChunksToProve += 1;
            }
            packetsToProve.push(packetToProve);
        },
        getTotalChunksToProve() {
            return zkChunksToProve;
        },
        async generateProofs(onChunkDone) {
            var _a;
            if (!packetsToProve.length) {
                return;
            }
            const start = Date.now();
            const tasks = [];
            for (const { onGeneratedProofs, algorithm, proofsToGenerate } of packetsToProve) {
                const proofs = [];
                let proofsLeft = proofsToGenerate.length;
                for (const proofToGen of proofsToGenerate) {
                    tasks.push(zkQueue.add(async () => {
                        const proof = await generateProofForChunk(algorithm, proofToGen);
                        onChunkDone === null || onChunkDone === void 0 ? void 0 : onChunkDone();
                        proofs.push(proof);
                        proofsLeft -= 1;
                        if (proofsLeft === 0) {
                            onGeneratedProofs(proofs);
                        }
                    }, { throwOnTimeout: true }));
                }
            }
            await Promise.all(tasks);
            logger === null || logger === void 0 ? void 0 : logger.info({
                durationMs: Date.now() - start,
                chunks: zkChunksToProve,
            }, 'generated ZK proofs');
            // reset the packets to prove
            packetsToProve.splice(0, packetsToProve.length);
            zkChunksToProve = 0;
            // release ZK resources to free up memory
            const alg = (0, generics_1.getZkAlgorithmForCipherSuite)(cipherSuite);
            const zkOperator = await getZkOperatorForAlgorithm(alg);
            (_a = zkOperator.release) === null || _a === void 0 ? void 0 : _a.call(zkOperator);
        },
    };
    function getProofGenerationParamsForChunk(algorithm, { key, iv, ciphertext, redactedPlaintext, offsetChunks, }) {
        const chunkSize = getChunkSizeBytes(algorithm);
        const startIdx = offsetChunks * chunkSize;
        const endIdx = (offsetChunks + 1) * chunkSize;
        const ciphertextChunk = ciphertext
            .slice(startIdx, endIdx);
        const plaintextChunk = redactedPlaintext
            .slice(startIdx, endIdx);
        if ((0, redactions_1.isFullyRedacted)(plaintextChunk)) {
            return;
        }
        // redact ciphertext if plaintext is redacted
        // to prepare for decryption in ZK circuit
        // the ZK circuit will take in the redacted ciphertext,
        // which shall produce the redacted plaintext
        for (let i = 0; i < ciphertextChunk.length; i++) {
            if (plaintextChunk[i] === redactions_1.REDACTION_CHAR_CODE) {
                ciphertextChunk[i] = redactions_1.REDACTION_CHAR_CODE;
            }
        }
        return {
            startIdx,
            redactedPlaintext: plaintextChunk,
            privateInput: { key, iv, offset: offsetChunks },
            publicInput: { ciphertext: ciphertextChunk },
        };
    }
    async function generateProofForChunk(algorithm, { startIdx, redactedPlaintext, privateInput, publicInput }) {
        const operator = await getZkOperatorForAlgorithm(algorithm);
        const proof = await (0, circom_symmetric_crypto_1.generateProof)({
            algorithm,
            privateInput,
            publicInput,
            operator,
            logger
        });
        logger === null || logger === void 0 ? void 0 : logger.debug({ startIdx }, 'generated proof for chunk');
        return {
            proofJson: proof.proofJson,
            decryptedRedactedCiphertext: proof.plaintext,
            redactedPlaintext,
            startIdx,
        };
    }
    async function getZkOperatorForAlgorithm(algorithm) {
        return (zkOperators === null || zkOperators === void 0 ? void 0 : zkOperators[algorithm])
            || await makeDefaultZkOperator(algorithm, zkEngine, logger);
    }
}
/**
 * Verify the given ZK proof
 */
async function verifyZkPacket({ cipherSuite, ciphertext, zkReveal, zkOperators, logger = logger_1.logger, zkEngine = 'snarkJS' }) {
    if (!zkReveal) {
        throw new Error('No ZK reveal');
    }
    const { proofs } = zkReveal;
    const algorithm = (0, generics_1.getZkAlgorithmForCipherSuite)(cipherSuite);
    const operator = (zkOperators === null || zkOperators === void 0 ? void 0 : zkOperators[algorithm])
        || await makeDefaultZkOperator(algorithm, zkEngine, logger);
    ciphertext = (0, generics_1.getPureCiphertext)(ciphertext, cipherSuite);
    /**
     * to verify if the user has given us the correct redacted plaintext,
     * and isn't providing plaintext that they haven't proven they have
     * we start with a fully redacted plaintext, and then replace the
     * redacted parts with the plaintext that the user has provided
     * in the proofs
     */
    const realRedactedPlaintext = new Uint8Array(ciphertext.length).fill(redactions_1.REDACTION_CHAR_CODE);
    await Promise.all(proofs.map(async ({ proofJson, decryptedRedactedCiphertext, redactedPlaintext, startIdx, }, i) => {
        // get the ciphertext chunk we received from the server
        // the ZK library, will verify that the decrypted redacted
        // ciphertext matches the ciphertext received from the server
        const ciphertextChunk = ciphertext.slice(startIdx, startIdx + redactedPlaintext.length);
        // redact ciphertext if plaintext is redacted
        // to prepare for decryption in ZK circuit
        // the ZK circuit will take in the redacted ciphertext,
        // which shall produce the redacted plaintext
        for (let i = 0; i < ciphertextChunk.length; i++) {
            if (redactedPlaintext[i] === redactions_1.REDACTION_CHAR_CODE) {
                ciphertextChunk[i] = redactions_1.REDACTION_CHAR_CODE;
            }
        }
        if (!(0, redactions_1.isRedactionCongruent)(redactedPlaintext, decryptedRedactedCiphertext)) {
            throw new Error(`redacted ciphertext (${i}) not congruent`);
        }
        await (0, circom_symmetric_crypto_1.verifyProof)({
            proof: {
                algorithm,
                proofJson,
                plaintext: decryptedRedactedCiphertext,
            },
            publicInput: { ciphertext: ciphertextChunk },
            operator,
            logger,
        });
        logger === null || logger === void 0 ? void 0 : logger.debug({ startIdx, endIdx: startIdx + redactedPlaintext.length }, 'verified proof');
        realRedactedPlaintext.set(redactedPlaintext, startIdx);
    }));
    return { redactedPlaintext: realRedactedPlaintext };
}
function getChunkSizeBytes(alg) {
    const { chunkSize, bitsPerWord } = circom_symmetric_crypto_1.CONFIG[alg];
    return chunkSize * bitsPerWord / 8;
}
const zkEngines = {};
const operatorMakers = {
    'snarkJS': snarkJSOperator,
    'gnark': gnark_1.makeLocalGnarkZkOperator
};
function makeDefaultZkOperator(algorithm, zkEngine, logger) {
    const engine = zkEngine || 'snarkJS';
    let zkOperators = zkEngines[engine];
    if (!zkOperators) {
        zkEngines[engine] = {};
        zkOperators = zkEngines[engine];
    }
    if (!zkOperators[algorithm]) {
        zkOperators[algorithm] = operatorMakers[engine](algorithm, logger);
    }
    return zkOperators[algorithm];
}
function snarkJSOperator(algorithm, logger) {
    const isNode = (0, env_1.detectEnvironment)() === 'node';
    const opType = isNode ? 'local' : 'remote';
    logger === null || logger === void 0 ? void 0 : logger.info({
        type: opType,
        algorithm
    }, 'fetching zk operator');
    if (isNode) {
        return (0, circom_symmetric_crypto_1.makeLocalSnarkJsZkOperator)(algorithm);
    }
    else {
        const { zkeyUrl, circuitWasmUrl } = config_1.DEFAULT_REMOTE_ZK_PARAMS;
        const operator = makeRemoteSnarkJsZkOperator(zkeyUrl.replace('{algorithm}', algorithm), circuitWasmUrl.replace('{algorithm}', algorithm), logger);
        return Promise.resolve(operator);
    }
}
function makeRemoteSnarkJsZkOperator(zkeyUrl, wasmUrl, logger) {
    return (0, circom_symmetric_crypto_1.makeSnarkJsZKOperator)({
        getCircuitWasm: () => fetchArrayBuffer('wasm', wasmUrl),
        getZkey: () => (fetchArrayBuffer('zkey', zkeyUrl)
            .then(data => ({ data }))),
    });
    async function fetchArrayBuffer(type, url) {
        const res = await (0, retries_1.executeWithRetries)(async () => {
            const res = await fetch(url);
            if (!res.ok) {
                throw new error_1.WitnessError('WITNESS_ERROR_NETWORK_ERROR', `${type} fetch failed with code: ${res.status}`, { url, status: res.status });
            }
            return await res.arrayBuffer();
        }, {
            logger: logger.child({ type }),
            maxRetries: 3,
            shouldRetry(error) {
                // network errors are TypeErrors
                // in fetch
                // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API#concepts_and_usage
                return error instanceof TypeError;
            },
        });
        return new Uint8Array(res);
    }
}

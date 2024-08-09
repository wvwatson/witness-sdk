"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignDataForClaim = createSignDataForClaim;
exports.assertValidClaimSignatures = assertValidClaimSignatures;
exports.getIdentifierFromClaimInfo = getIdentifierFromClaimInfo;
exports.canonicalStringify = canonicalStringify;
exports.hashProviderParams = hashProviderParams;
const tls_1 = require("@reclaimprotocol/tls");
const canonicalize_1 = __importDefault(require("canonicalize"));
const ethers_1 = require("ethers");
const config_1 = require("../config");
const api_1 = require("../proto/api");
const signatures_1 = require("../signatures");
/**
 * Creates the standard string to sign for a claim.
 * This data is what the witness will sign when it successfully
 * verifies a claim.
 */
function createSignDataForClaim(data) {
    const identifier = 'identifier' in data
        ? data.identifier
        : getIdentifierFromClaimInfo(data);
    const lines = [
        identifier,
        // we lowercase the owner to ensure that the
        // ETH addresses always serialize the same way
        data.owner.toLowerCase(),
        data.timestampS.toString(),
        data.epoch.toString(),
    ];
    return lines.join('\n');
}
/**
 * Verify the claim tunnel response from a witness.
 *
 * If you'd only like to verify the claim signature, you can
 * optionally only pass "claim" & "signatures.claimSignature"
 * to this function.
 *
 * The successful run of this function means that the claim
 * is valid, and the witness that signed the claim is valid.
 */
async function assertValidClaimSignatures({ signatures, ...res }, metadata = config_1.DEFAULT_METADATA) {
    if (!signatures) {
        throw new Error('No signatures provided');
    }
    const { resultSignature, claimSignature, witnessAddress } = signatures;
    const { verify } = signatures_1.SIGNATURES[metadata.signatureType];
    if (signatures === null || signatures === void 0 ? void 0 : signatures.resultSignature) {
        const resBytes = api_1.ClaimTunnelResponse.encode(api_1.ClaimTunnelResponse.create(res)).finish();
        const verified = await verify(resBytes, resultSignature, witnessAddress);
        if (!verified) {
            throw new Error('Invalid result signature');
        }
    }
    // claim wasn't generated -- i.e. the transcript
    // did not contain the necessary data
    if (!res.claim) {
        return;
    }
    const signData = createSignDataForClaim(res.claim);
    const verifiedClaim = await verify((0, tls_1.strToUint8Array)(signData), claimSignature, witnessAddress);
    if (!verifiedClaim) {
        throw new Error('Invalid claim signature');
    }
}
/**
 * Generates a unique identifier for given claim info
 * @param info
 * @returns
 */
function getIdentifierFromClaimInfo(info) {
    var _a;
    //re-canonicalize context if it's not empty
    if (((_a = info.context) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        try {
            const ctx = JSON.parse(info.context);
            info.context = canonicalStringify(ctx);
        }
        catch (e) {
            throw new Error('unable to parse non-empty context. Must be JSON');
        }
    }
    const str = `${info.provider}\n${info.parameters}\n${info.context || ''}`;
    return ethers_1.utils.keccak256((0, tls_1.strToUint8Array)(str)).toLowerCase();
}
/**
 * Canonically stringifies an object, so that the same object will always
 * produce the same string despite the order of keys
 */
function canonicalStringify(params) {
    if (!params) {
        return '';
    }
    return (0, canonicalize_1.default)(params) || '';
}
function hashProviderParams(params) {
    const filteredParams = {
        url: params.url,
        method: params.method,
        responseMatches: params.responseMatches,
        responseRedactions: params.responseRedactions,
        geoLocation: params.geoLocation
    };
    const serializedParams = canonicalStringify(filteredParams);
    return ethers_1.utils.keccak256((0, tls_1.strToUint8Array)(serializedParams)).toLowerCase();
}

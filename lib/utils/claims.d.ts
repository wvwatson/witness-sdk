import { ClaimTunnelResponse } from '../proto/api';
import { ClaimID, ClaimInfo, CompleteClaimData, ProviderParams } from '../types';
/**
 * Creates the standard string to sign for a claim.
 * This data is what the witness will sign when it successfully
 * verifies a claim.
 */
export declare function createSignDataForClaim(data: CompleteClaimData): string;
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
export declare function assertValidClaimSignatures({ signatures, ...res }: Partial<ClaimTunnelResponse>, metadata?: import("../proto/api").InitRequest): Promise<void>;
/**
 * Generates a unique identifier for given claim info
 * @param info
 * @returns
 */
export declare function getIdentifierFromClaimInfo(info: ClaimInfo): ClaimID;
/**
 * Canonically stringifies an object, so that the same object will always
 * produce the same string despite the order of keys
 */
export declare function canonicalStringify(params: {
    [key: string]: any;
} | undefined): string;
export declare function hashProviderParams(params: ProviderParams<'http'>): string;

import { ClaimTunnelRequest, InitRequest, ProviderClaimInfo } from '../../proto/api';
import { IDecryptedTranscript, Logger, TCPSocketProperties, Transcript, ZKEngine } from '../../types';
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
export declare function assertValidClaimRequest(request: ClaimTunnelRequest, metadata: InitRequest, logger: Logger): Promise<import("../../proto/api").ClaimRequestData>;
/**
 * Verify that the transcript contains a valid claim
 * for the provider.
 */
export declare function assertValidProviderTranscript<T extends ProviderClaimInfo>(applData: Transcript<Uint8Array>, info: T): Promise<T>;
/**
 * Verify that the transcript provided by the client
 * matches the transcript of the tunnel, the server
 * has created.
 */
export declare function assertTranscriptsMatch(clientTranscript: ClaimTunnelRequest['transcript'], tunnelTranscript: TCPSocketProperties['transcript']): void;
export declare function decryptTranscript(transcript: ClaimTunnelRequest['transcript'], logger: Logger, zkEngine: ZKEngine): Promise<IDecryptedTranscript>;

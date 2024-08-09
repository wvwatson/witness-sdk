import type { TLSConnectionOptions } from '@reclaimprotocol/tls';
import type { ProviderClaimData } from '../proto/api';
import type { WitnessData } from './beacon';
import type { ArraySlice } from './general';
import type { ProvidersConfig } from './providers.gen';
import type { Transcript } from './tunnel';
type CreateRequestResult = {
    /**
     * Raw request to be sent
     * If a string, it is assumed to be an
     * ASCII encoded string. If it contains
     * non-ASCII characters, the redactions
     * may not work as expected
     */
    data: Uint8Array | string;
    redactions: ArraySlice[];
};
export type ProviderName = keyof ProvidersConfig;
export type ProviderParams<T extends ProviderName> = ProvidersConfig[T]['parameters'];
export type ProviderSecretParams<T extends ProviderName> = ProvidersConfig[T]['secretParameters'];
export type RedactionMode = 'key-update' | 'zk';
export type ProviderField<Params, T> = T | ((params: Params) => T);
/**
 * Generic interface for a provider that can be used to verify
 * claims on a TLS receipt
 *
 * @notice "Params" are the parameters you want to claim against.
 * These would typically be found in the response body
 *
 * @notice "SecretParams" are the parameters that are used to make the API request.
 * These must be redacted in the request construction in "createRequest" & cannot be viewed by anyone
 */
export interface Provider<N extends ProviderName, Params = ProviderParams<N>, SecretParams = ProviderSecretParams<N>> {
    /**
     * host:port to connect to for this provider;
     * the protocol establishes a connection to the first one
     * when a request is received from a user.
     *
     * Run on witness side when creating a new session
     *
     * Eg. "www.google.com:443", (p) => p.url.host
     * */
    hostPort: ProviderField<Params, string>;
    /**
     * Which geo location to send the request from
     * Provide 2 letter country code, or a function
     * that returns the country code
     * @example "US", "IN"
     */
    geoLocation?: ProviderField<Params, string | undefined>;
    /** extra options to pass to the client like root CA certificates */
    additionalClientOptions?: ProviderField<Params, TLSConnectionOptions | undefined>;
    /**
     * default redaction mode to use. If not specified,
     * the default is 'key-update'.
     *
     * It's switched to 'zk' for TLS1.2 requests as TLS1.2
     * don't support key updates
     *
     * @default 'key-update'
     */
    writeRedactionMode?: ProviderField<Params, RedactionMode | undefined>;
    /** generate the raw request to be sent to through the TLS receipt */
    createRequest(secretParams: SecretParams, params: Params): CreateRequestResult;
    /**
     * Return the slices of the response to redact
     * Eg. if the response is "hello my secret is xyz",
     * and you want to redact "xyz", you would return
     * [{start: 17, end: 20}]
     *
     * This is run on the client side, to selct which portions of
     * the server response to send to the witness
     * */
    getResponseRedactions?(response: Uint8Array, params: Params): ArraySlice[];
    /**
     * verify a generated TLS receipt against given parameters
     * to ensure the receipt does contain the claims the
     * user is claiming to have
     *
     * This is run on the witness side.
     * @param receipt application data messages exchanged in the TLS session
     * @param params the parameters to verify the receipt against.
     *  Eg. `{"email": "abcd@gmail.com"}`
     * @returns sucessful verification or throws an error message.
       *  Optionally return parameters extracted from the receipt
       *  that will then be included in the claim context
     * */
    assertValidProviderReceipt(receipt: Transcript<Uint8Array>, params: Params): void | Promise<void> | {
        extractedParameters: {
            [key: string]: string;
        };
    };
}
export type ProofGenerationStep = {
    name: 'connecting';
} | {
    name: 'sending-request-data';
} | {
    name: 'waiting-for-response';
} | {
    name: 'generating-zk-proofs';
    proofsDone: number;
    proofsTotal: number;
    /**
     * approximate time left in seconds.
     * Only computed after the first block
     * is done
     * */
    approxTimeLeftS?: number;
} | {
    name: 'waiting-for-verification';
};
type StepData = {
    timestampS: number;
    epoch: number;
    /** @deprecated use 'witnesses' */
    witnessHosts: string[];
    witnesses: WitnessData[];
};
export type CreateStep = ({
    name: 'creating';
} & StepData) | ({
    name: 'witness-progress';
    currentWitness: WitnessData;
    step: ProofGenerationStep;
} & StepData) | {
    name: 'witness-done';
    timestampS: number;
    epoch: number;
    /** @deprecated use 'witnessesLeft' */
    witnessHostsLeft: string[];
    witnessesLeft: WitnessData[];
    claimData: ProviderClaimData;
    signaturesDone: string[];
};
export {};

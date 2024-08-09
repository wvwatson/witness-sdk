import _m0 from "protobufjs/minimal";
export declare const protobufPackage = "reclaim_witness";
export declare enum TranscriptMessageSenderType {
    TRANSCRIPT_MESSAGE_SENDER_TYPE_UNKNOWN = 0,
    TRANSCRIPT_MESSAGE_SENDER_TYPE_CLIENT = 1,
    TRANSCRIPT_MESSAGE_SENDER_TYPE_SERVER = 2,
    UNRECOGNIZED = -1
}
export declare function transcriptMessageSenderTypeFromJSON(object: any): TranscriptMessageSenderType;
export declare function transcriptMessageSenderTypeToJSON(object: TranscriptMessageSenderType): string;
export declare enum ServiceSignatureType {
    SERVICE_SIGNATURE_TYPE_UNKNOWN = 0,
    /**
     * SERVICE_SIGNATURE_TYPE_ETH - ETH keys & signature
     * keys: secp256k1
     * signature: ethereum flavor of ECDSA (https://goethereumbook.org/signature-generate/)
     */
    SERVICE_SIGNATURE_TYPE_ETH = 1,
    UNRECOGNIZED = -1
}
export declare function serviceSignatureTypeFromJSON(object: any): ServiceSignatureType;
export declare function serviceSignatureTypeToJSON(object: ServiceSignatureType): string;
export declare enum WitnessVersion {
    WITNESS_VERSION_UNKNOWN = 0,
    WITNESS_VERSION_1_0_0 = 1,
    WITNESS_VERSION_1_1_0 = 2,
    WITNESS_VERSION_2_0_0 = 3,
    UNRECOGNIZED = -1
}
export declare function witnessVersionFromJSON(object: any): WitnessVersion;
export declare function witnessVersionToJSON(object: WitnessVersion): string;
export declare enum BeaconType {
    BEACON_TYPE_UNKNOWN = 0,
    BEACON_TYPE_SMART_CONTRACT = 1,
    BEACON_TYPE_RECLAIM_TRUSTED = 2,
    UNRECOGNIZED = -1
}
export declare function beaconTypeFromJSON(object: any): BeaconType;
export declare function beaconTypeToJSON(object: BeaconType): string;
export declare enum WitnessErrorCode {
    /**
     * WITNESS_ERROR_NO_ERROR - 0 should be treated as the absence of an error
     * should be used when gracefully closing the connection
     */
    WITNESS_ERROR_NO_ERROR = 0,
    /**
     * WITNESS_ERROR_INTERNAL - internal error in the witness -- all "Error/TypeError"
     * messages are mapped to this
     */
    WITNESS_ERROR_INTERNAL = 1,
    /** WITNESS_ERROR_BAD_REQUEST - bad request from the client */
    WITNESS_ERROR_BAD_REQUEST = 2,
    /** WITNESS_ERROR_NOT_FOUND - the item requested was not found */
    WITNESS_ERROR_NOT_FOUND = 3,
    /** WITNESS_ERROR_PROXY_ERROR - error in the proxy */
    WITNESS_ERROR_PROXY_ERROR = 4,
    /**
     * WITNESS_ERROR_INVALID_CLAIM - claim creation failed -- i.e. the transcript
     * did not result in a valid claim
     */
    WITNESS_ERROR_INVALID_CLAIM = 5,
    /** WITNESS_ERROR_NETWORK_ERROR - any network error */
    WITNESS_ERROR_NETWORK_ERROR = 6,
    UNRECOGNIZED = -1
}
export declare function witnessErrorCodeFromJSON(object: any): WitnessErrorCode;
export declare function witnessErrorCodeToJSON(object: WitnessErrorCode): string;
export declare enum ZKProofEngine {
    ZK_ENGINE_SNARKJS = 0,
    ZK_ENGINE_GNARK = 1,
    UNRECOGNIZED = -1
}
export declare function zKProofEngineFromJSON(object: any): ZKProofEngine;
export declare function zKProofEngineToJSON(object: ZKProofEngine): string;
export interface ClaimContext {
    /**
     * Extracted parameters from the TLS transcript
     * by the provider. Any parameters provided by the
     * user will be overwritten
     */
    extractedParameters: {
        [key: string]: string;
    };
    /** Provider hash. TODO: docs */
    providerHash: string;
}
export interface ClaimContext_ExtractedParametersEntry {
    key: string;
    value: string;
}
export interface ProviderClaimData {
    /**
     * Name of the provider to generate the
     * claim using.
     * @example "http"
     */
    provider: string;
    /**
     * Canonically JSON stringified parameters
     * of the claim, as specified by the provider.
     * @example '{"url":"https://example.com","method":"GET"}'
     */
    parameters: string;
    /**
     * Owner of the claim. Must be the public key/address
     * @example "0x1234..."
     */
    owner: string;
    /**
     * Unix timestamp in seconds of the claim being made.
     * Cannot be more than 10 minutes in the past or future
     */
    timestampS: number;
    /**
     * Any additional data you want to store with the claim.
     * Also expected to be a canonical JSON string.
     */
    context: string;
    /**
     * identifier of the claim;
     * Hash of (provider, parameters, context)
     */
    identifier: string;
    /** Legacy V1 Beacon epoch number */
    epoch: number;
}
export interface ProviderClaimInfo {
    provider: string;
    parameters: string;
    context: string;
}
export interface BeaconIdentifier {
    /** type of beacon */
    type: BeaconType;
    /**
     * ID of the Beacon.
     * For smart contract, it's the chain ID.
     */
    id: string;
}
export interface WitnessErrorData {
    code: WitnessErrorCode;
    message: string;
    data: string;
}
export interface CreateTunnelRequest {
    /**
     * Assign a unique ID to the client for this tunnel
     * request. This ID will be used to identify the tunnel
     * to later send messages or disconnect the tunnel.
     */
    id: number;
    host: string;
    port: number;
    /**
     * Geo location from which the request will be made.
     * Provide 2 letter ISO country code. Leave empty
     * if you don't want to use geo location.
     *
     * Geo location is implemented using an https proxy
     * eg. US, IN, GB, etc.
     */
    geoLocation: string;
}
export interface DisconnectTunnelRequest {
    id: number;
}
/** empty message */
export interface Empty {
}
export interface TunnelMessage {
    /** ID of the tunnel where this message belongs */
    tunnelId: number;
    message: Uint8Array;
}
export interface TunnelDisconnectEvent {
    tunnelId: number;
    error: WitnessErrorData | undefined;
}
export interface MessageReveal {
    /**
     * direct reveal of the block via the key & IV
     * cipher (aes, chacha) for decryption
     * selected based on `cipherSuite`
     * determined by the server hello packet
     */
    directReveal?: MessageReveal_MessageRevealDirect | undefined;
    /** partially or fully reveal the block via a zk proof */
    zkReveal?: MessageReveal_MessageRevealZk | undefined;
}
export interface MessageReveal_MessageRevealDirect {
    /** key for the block */
    key: Uint8Array;
    /** IV for the block */
    iv: Uint8Array;
    /**
     * used to generate IV in authenticated
     * cipher suites
     */
    recordNumber: number;
}
export interface MessageReveal_MessageRevealZk {
    proofs: MessageReveal_ZKProof[];
}
export interface MessageReveal_ZKProof {
    /** JSON encoded snarkJS proof */
    proofJson: string;
    /** the decrypted ciphertext as output by the ZK proof */
    decryptedRedactedCiphertext: Uint8Array;
    /** the plaintext that is fully or partially revealed */
    redactedPlaintext: Uint8Array;
    /**
     * start of this specific block
     * in the redactedPlaintext
     */
    startIdx: number;
}
export interface ClaimRequestData {
    provider: string;
    parameters: string;
    /**
     * Owner of the claim. Must be the public key/address
     * of the signatures
     */
    owner: string;
    /**
     * Timestamp of the claim being made.
     * Cannot be more than 10 minutes in the past
     * or in the future
     */
    timestampS: number;
    context: string;
}
export interface ClaimTunnelRequest {
    /**
     * parameters supplied to establish the tunnel
     * & connect to the end server
     */
    request: CreateTunnelRequest | undefined;
    /** data describing the claim you want to prove */
    data: ClaimRequestData | undefined;
    /**
     * messages from the client & server
     * in the order they were sent/received
     *
     * Attach a proof (if any) to each message
     * to reveal the contents of the message inside
     *
     * The revealed messages should support the proving
     * of the claim as defined in the provider's implementation
     */
    transcript: ClaimTunnelRequest_TranscriptMessage[];
    signatures: ClaimTunnelRequest_Signatures | undefined;
    /** type of ZK engine used. SnarkJS or Gnark */
    zkEngine: ZKProofEngine;
}
export interface ClaimTunnelRequest_Signatures {
    /**
     * signature of ClaimTunnelRequest
     * with empty "signatures" field
     */
    requestSignature: Uint8Array;
}
export interface ClaimTunnelRequest_TranscriptMessage {
    /** client or server */
    sender: TranscriptMessageSenderType;
    /** packet data */
    message: Uint8Array;
    reveal: MessageReveal | undefined;
}
export interface ClaimTunnelResponse {
    /** The original request that was made to claim the tunnel */
    request: ClaimTunnelRequest | undefined;
    claim?: ProviderClaimData | undefined;
    error?: WitnessErrorData | undefined;
    signatures: ClaimTunnelResponse_Signatures | undefined;
}
export interface ClaimTunnelResponse_Signatures {
    /** Address of the witness that has signed the claim */
    witnessAddress: string;
    /**
     * signature of `stringifyProviderClaimData(claim)`,
     * if the claim was successful
     */
    claimSignature: Uint8Array;
    /**
     * signature of the complete ClaimTunnelResponse
     * structure with empty "signatures" field
     */
    resultSignature: Uint8Array;
}
export interface InitRequest {
    /** Witness client version */
    clientVersion: WitnessVersion;
    /** Signature type used & expected by the user */
    signatureType: ServiceSignatureType;
}
export interface RPCMessage {
    /**
     * Per connection unique RPC message ID. Either party sending a
     * duplicate ID will do nothing except confuse the other party.
     *
     * For response messages, the ID should be the same as the request
     * to which it is responding.
     */
    id: number;
    initRequest?: InitRequest | undefined;
    /** Response to the init request. */
    initResponse?: Empty | undefined;
    /**
     * Data representing an error in the WebSocket connection.
     * The party sending this message should close the connection
     * immediately after sending this message.
     */
    connectionTerminationAlert?: WitnessErrorData | undefined;
    /**
     * Data representing an error in the witness's
     * request to the server. This should be sent in case
     * there was an error in processing the request.
     */
    requestError?: WitnessErrorData | undefined;
    /** Create a tunnel to the specified host & port. */
    createTunnelRequest?: CreateTunnelRequest | undefined;
    createTunnelResponse?: Empty | undefined;
    /** Disconnect a tunnel. */
    disconnectTunnelRequest?: DisconnectTunnelRequest | undefined;
    disconnectTunnelResponse?: Empty | undefined;
    /**
     * Message to send through a tunnel. Client can send
     * this message to forward data to the server.
     */
    tunnelMessage?: TunnelMessage | undefined;
    /**
     * Event indicating that a tunnel has been disconnected.
     * The client should not send any more messages through
     * this tunnel.
     */
    tunnelDisconnectEvent?: TunnelDisconnectEvent | undefined;
    /**
     * Using the transcript of a tunnel, make a claim.
     * The tunnel must be disconnected before making a claim.
     */
    claimTunnelRequest?: ClaimTunnelRequest | undefined;
    claimTunnelResponse?: ClaimTunnelResponse | undefined;
}
export interface RPCMessages {
    messages: RPCMessage[];
}
export declare const ClaimContext: {
    encode(message: ClaimContext, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimContext;
    fromJSON(object: any): ClaimContext;
    toJSON(message: ClaimContext): unknown;
    create(base?: DeepPartial<ClaimContext>): ClaimContext;
    fromPartial(object: DeepPartial<ClaimContext>): ClaimContext;
};
export declare const ClaimContext_ExtractedParametersEntry: {
    encode(message: ClaimContext_ExtractedParametersEntry, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimContext_ExtractedParametersEntry;
    fromJSON(object: any): ClaimContext_ExtractedParametersEntry;
    toJSON(message: ClaimContext_ExtractedParametersEntry): unknown;
    create(base?: DeepPartial<ClaimContext_ExtractedParametersEntry>): ClaimContext_ExtractedParametersEntry;
    fromPartial(object: DeepPartial<ClaimContext_ExtractedParametersEntry>): ClaimContext_ExtractedParametersEntry;
};
export declare const ProviderClaimData: {
    encode(message: ProviderClaimData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ProviderClaimData;
    fromJSON(object: any): ProviderClaimData;
    toJSON(message: ProviderClaimData): unknown;
    create(base?: DeepPartial<ProviderClaimData>): ProviderClaimData;
    fromPartial(object: DeepPartial<ProviderClaimData>): ProviderClaimData;
};
export declare const ProviderClaimInfo: {
    encode(message: ProviderClaimInfo, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ProviderClaimInfo;
    fromJSON(object: any): ProviderClaimInfo;
    toJSON(message: ProviderClaimInfo): unknown;
    create(base?: DeepPartial<ProviderClaimInfo>): ProviderClaimInfo;
    fromPartial(object: DeepPartial<ProviderClaimInfo>): ProviderClaimInfo;
};
export declare const BeaconIdentifier: {
    encode(message: BeaconIdentifier, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): BeaconIdentifier;
    fromJSON(object: any): BeaconIdentifier;
    toJSON(message: BeaconIdentifier): unknown;
    create(base?: DeepPartial<BeaconIdentifier>): BeaconIdentifier;
    fromPartial(object: DeepPartial<BeaconIdentifier>): BeaconIdentifier;
};
export declare const WitnessErrorData: {
    encode(message: WitnessErrorData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): WitnessErrorData;
    fromJSON(object: any): WitnessErrorData;
    toJSON(message: WitnessErrorData): unknown;
    create(base?: DeepPartial<WitnessErrorData>): WitnessErrorData;
    fromPartial(object: DeepPartial<WitnessErrorData>): WitnessErrorData;
};
export declare const CreateTunnelRequest: {
    encode(message: CreateTunnelRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): CreateTunnelRequest;
    fromJSON(object: any): CreateTunnelRequest;
    toJSON(message: CreateTunnelRequest): unknown;
    create(base?: DeepPartial<CreateTunnelRequest>): CreateTunnelRequest;
    fromPartial(object: DeepPartial<CreateTunnelRequest>): CreateTunnelRequest;
};
export declare const DisconnectTunnelRequest: {
    encode(message: DisconnectTunnelRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): DisconnectTunnelRequest;
    fromJSON(object: any): DisconnectTunnelRequest;
    toJSON(message: DisconnectTunnelRequest): unknown;
    create(base?: DeepPartial<DisconnectTunnelRequest>): DisconnectTunnelRequest;
    fromPartial(object: DeepPartial<DisconnectTunnelRequest>): DisconnectTunnelRequest;
};
export declare const Empty: {
    encode(_: Empty, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): Empty;
    fromJSON(_: any): Empty;
    toJSON(_: Empty): unknown;
    create(base?: DeepPartial<Empty>): Empty;
    fromPartial(_: DeepPartial<Empty>): Empty;
};
export declare const TunnelMessage: {
    encode(message: TunnelMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TunnelMessage;
    fromJSON(object: any): TunnelMessage;
    toJSON(message: TunnelMessage): unknown;
    create(base?: DeepPartial<TunnelMessage>): TunnelMessage;
    fromPartial(object: DeepPartial<TunnelMessage>): TunnelMessage;
};
export declare const TunnelDisconnectEvent: {
    encode(message: TunnelDisconnectEvent, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): TunnelDisconnectEvent;
    fromJSON(object: any): TunnelDisconnectEvent;
    toJSON(message: TunnelDisconnectEvent): unknown;
    create(base?: DeepPartial<TunnelDisconnectEvent>): TunnelDisconnectEvent;
    fromPartial(object: DeepPartial<TunnelDisconnectEvent>): TunnelDisconnectEvent;
};
export declare const MessageReveal: {
    encode(message: MessageReveal, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MessageReveal;
    fromJSON(object: any): MessageReveal;
    toJSON(message: MessageReveal): unknown;
    create(base?: DeepPartial<MessageReveal>): MessageReveal;
    fromPartial(object: DeepPartial<MessageReveal>): MessageReveal;
};
export declare const MessageReveal_MessageRevealDirect: {
    encode(message: MessageReveal_MessageRevealDirect, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MessageReveal_MessageRevealDirect;
    fromJSON(object: any): MessageReveal_MessageRevealDirect;
    toJSON(message: MessageReveal_MessageRevealDirect): unknown;
    create(base?: DeepPartial<MessageReveal_MessageRevealDirect>): MessageReveal_MessageRevealDirect;
    fromPartial(object: DeepPartial<MessageReveal_MessageRevealDirect>): MessageReveal_MessageRevealDirect;
};
export declare const MessageReveal_MessageRevealZk: {
    encode(message: MessageReveal_MessageRevealZk, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MessageReveal_MessageRevealZk;
    fromJSON(object: any): MessageReveal_MessageRevealZk;
    toJSON(message: MessageReveal_MessageRevealZk): unknown;
    create(base?: DeepPartial<MessageReveal_MessageRevealZk>): MessageReveal_MessageRevealZk;
    fromPartial(object: DeepPartial<MessageReveal_MessageRevealZk>): MessageReveal_MessageRevealZk;
};
export declare const MessageReveal_ZKProof: {
    encode(message: MessageReveal_ZKProof, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): MessageReveal_ZKProof;
    fromJSON(object: any): MessageReveal_ZKProof;
    toJSON(message: MessageReveal_ZKProof): unknown;
    create(base?: DeepPartial<MessageReveal_ZKProof>): MessageReveal_ZKProof;
    fromPartial(object: DeepPartial<MessageReveal_ZKProof>): MessageReveal_ZKProof;
};
export declare const ClaimRequestData: {
    encode(message: ClaimRequestData, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimRequestData;
    fromJSON(object: any): ClaimRequestData;
    toJSON(message: ClaimRequestData): unknown;
    create(base?: DeepPartial<ClaimRequestData>): ClaimRequestData;
    fromPartial(object: DeepPartial<ClaimRequestData>): ClaimRequestData;
};
export declare const ClaimTunnelRequest: {
    encode(message: ClaimTunnelRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimTunnelRequest;
    fromJSON(object: any): ClaimTunnelRequest;
    toJSON(message: ClaimTunnelRequest): unknown;
    create(base?: DeepPartial<ClaimTunnelRequest>): ClaimTunnelRequest;
    fromPartial(object: DeepPartial<ClaimTunnelRequest>): ClaimTunnelRequest;
};
export declare const ClaimTunnelRequest_Signatures: {
    encode(message: ClaimTunnelRequest_Signatures, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimTunnelRequest_Signatures;
    fromJSON(object: any): ClaimTunnelRequest_Signatures;
    toJSON(message: ClaimTunnelRequest_Signatures): unknown;
    create(base?: DeepPartial<ClaimTunnelRequest_Signatures>): ClaimTunnelRequest_Signatures;
    fromPartial(object: DeepPartial<ClaimTunnelRequest_Signatures>): ClaimTunnelRequest_Signatures;
};
export declare const ClaimTunnelRequest_TranscriptMessage: {
    encode(message: ClaimTunnelRequest_TranscriptMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimTunnelRequest_TranscriptMessage;
    fromJSON(object: any): ClaimTunnelRequest_TranscriptMessage;
    toJSON(message: ClaimTunnelRequest_TranscriptMessage): unknown;
    create(base?: DeepPartial<ClaimTunnelRequest_TranscriptMessage>): ClaimTunnelRequest_TranscriptMessage;
    fromPartial(object: DeepPartial<ClaimTunnelRequest_TranscriptMessage>): ClaimTunnelRequest_TranscriptMessage;
};
export declare const ClaimTunnelResponse: {
    encode(message: ClaimTunnelResponse, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimTunnelResponse;
    fromJSON(object: any): ClaimTunnelResponse;
    toJSON(message: ClaimTunnelResponse): unknown;
    create(base?: DeepPartial<ClaimTunnelResponse>): ClaimTunnelResponse;
    fromPartial(object: DeepPartial<ClaimTunnelResponse>): ClaimTunnelResponse;
};
export declare const ClaimTunnelResponse_Signatures: {
    encode(message: ClaimTunnelResponse_Signatures, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): ClaimTunnelResponse_Signatures;
    fromJSON(object: any): ClaimTunnelResponse_Signatures;
    toJSON(message: ClaimTunnelResponse_Signatures): unknown;
    create(base?: DeepPartial<ClaimTunnelResponse_Signatures>): ClaimTunnelResponse_Signatures;
    fromPartial(object: DeepPartial<ClaimTunnelResponse_Signatures>): ClaimTunnelResponse_Signatures;
};
export declare const InitRequest: {
    encode(message: InitRequest, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): InitRequest;
    fromJSON(object: any): InitRequest;
    toJSON(message: InitRequest): unknown;
    create(base?: DeepPartial<InitRequest>): InitRequest;
    fromPartial(object: DeepPartial<InitRequest>): InitRequest;
};
export declare const RPCMessage: {
    encode(message: RPCMessage, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RPCMessage;
    fromJSON(object: any): RPCMessage;
    toJSON(message: RPCMessage): unknown;
    create(base?: DeepPartial<RPCMessage>): RPCMessage;
    fromPartial(object: DeepPartial<RPCMessage>): RPCMessage;
};
export declare const RPCMessages: {
    encode(message: RPCMessages, writer?: _m0.Writer): _m0.Writer;
    decode(input: _m0.Reader | Uint8Array, length?: number): RPCMessages;
    fromJSON(object: any): RPCMessages;
    toJSON(message: RPCMessages): unknown;
    create(base?: DeepPartial<RPCMessages>): RPCMessages;
    fromPartial(object: DeepPartial<RPCMessages>): RPCMessages;
};
type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;
export type DeepPartial<T> = T extends Builtin ? T : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : T extends {} ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : Partial<T>;
export {};

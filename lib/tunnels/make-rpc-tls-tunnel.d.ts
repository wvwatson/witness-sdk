import { makeTLSClient, TLSConnectionOptions } from '@reclaimprotocol/tls';
import { CreateTunnelRequest, RPCMessage } from '../proto/api';
import { CompleteTLSPacket, IWitnessClient, Logger, MakeTunnelFn, Transcript } from '../types';
type ExtraTLSOptions = {
    request: Partial<CreateTunnelRequest>;
    logger: Logger;
    /**
     * Either create a client with the given initMessages,
     * or simply send the messages to the server via an existing
     * client
     *
     * @returns the client that was used to send the messages
     */
    connect(initMessages: Partial<RPCMessage>[]): IWitnessClient;
    tlsOpts?: TLSConnectionOptions;
};
type TLSTunnelProperties = {
    transcript: Transcript<CompleteTLSPacket>;
    tls: ReturnType<typeof makeTLSClient>;
};
/**
 * Makes a TLS tunnel that connects to the server via RPC protocol
 */
export declare const makeRpcTlsTunnel: MakeTunnelFn<ExtraTLSOptions, TLSTunnelProperties>;
export {};

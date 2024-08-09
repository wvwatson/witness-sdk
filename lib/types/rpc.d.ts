import type { RPCMessage, TunnelDisconnectEvent, TunnelMessage } from '../proto/api';
import type { WitnessError } from '../utils/error';
type ExtractPrefix<T, S extends string> = T extends `${infer _}${S}` ? _ : never;
export type RPCType = ExtractPrefix<keyof RPCMessage, 'Request'>;
type RPCRequestType<T extends RPCType> = `${T}Request`;
type RPCResponseType<T extends RPCType> = `${T}Response`;
export type RPCRequestData<T extends RPCType> = Exclude<RPCMessage[RPCRequestType<T>], undefined>;
export type RPCResponseData<T extends RPCType> = Exclude<RPCMessage[RPCResponseType<T>], undefined>;
export type RPCRequest<T extends RPCType> = {
    requestId: RPCMessage['id'];
    type: T;
    data: RPCRequestData<T>;
    respond(res: RPCResponseData<T> | WitnessError): void;
};
export type RPCResponse<T extends RPCType> = {
    id: RPCMessage['id'];
    type: T;
    data: RPCResponseData<T>;
} | {
    id: RPCMessage['id'];
    error: WitnessError;
};
export type RPCEventMap = {
    'connection-terminated': WitnessError;
    'tunnel-message': TunnelMessage;
    'tunnel-disconnect-event': TunnelDisconnectEvent;
    'rpc-request': RPCRequest<RPCType>;
    'rpc-response': RPCResponse<RPCType>;
};
export type RPCEventType = keyof RPCEventMap;
export interface RPCEvent<T extends RPCEventType> extends Event {
    type: T;
    data: RPCEventMap[T];
}
export {};

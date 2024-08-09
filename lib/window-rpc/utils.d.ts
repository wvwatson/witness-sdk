import { ClaimTunnelResponse } from '../proto/api';
import { CreateClaimResponse } from './types';
export declare function getCurrentMemoryUsage(): Promise<{
    available: boolean;
    content: string;
}>;
export declare function generateRpcRequestId(): string;
/**
 * The window RPC will be served from the same origin as the API server.
 * so we can get the API server's origin from the location.
 */
export declare function getWsApiUrlFromLocation(): string;
export declare function mapToCreateClaimResponse(res: ClaimTunnelResponse): CreateClaimResponse;

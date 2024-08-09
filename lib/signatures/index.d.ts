import { ServiceSignatureType } from '../proto/api';
import { ServiceSignatureProvider } from '../types';
export declare const SIGNATURES: { [key in ServiceSignatureType]: ServiceSignatureProvider; };
export declare const SelectedServiceSignatureType = ServiceSignatureType.SERVICE_SIGNATURE_TYPE_ETH;
export declare const SelectedServiceSignature: ServiceSignatureProvider;

import type { IncomingHttpHeaders } from 'http';
import { ArraySlice, Transcript } from '../types';
type HttpRequest = {
    method: string;
    url: string;
    protocol: string;
    headers: IncomingHttpHeaders;
    body?: Uint8Array;
};
type HttpResponse = {
    statusCode: number;
    statusMessage: string;
    headers: IncomingHttpHeaders;
    body: Uint8Array;
    headersComplete: boolean;
    complete: boolean;
    /**
     * Index of the first byte of the status line
     */
    statusLineEndIndex?: number;
    /**
     * Index of the first byte of the body
     * in the complete response
     */
    bodyStartIndex?: number;
    /**
     * If using chunked transfer encoding,
     * this will be set & contain indices of each
     * chunk in the complete response
     */
    chunks?: ArraySlice[];
    headerIndices: Map<string, ArraySlice>;
};
/**
 * parses http/1.1 responses
 */
export declare function makeHttpResponseParser(): {
    res: HttpResponse;
    /**
     * Parse the next chunk of data
     * @param data the data to parse
     */
    onChunk(data: Uint8Array): void;
    /**
     * Call to prevent further parsing; indicating the end of the request
     * Checks that the response is valid & complete, otherwise throws an error
     */
    streamEnded(): void;
};
/**
 * Read the HTTP request from a TLS receipt transcript.
 * @param receipt the transcript to read from or application messages if they were extracted beforehand
 * @returns the parsed HTTP request
 */
export declare function getHttpRequestDataFromTranscript(receipt: Transcript<Uint8Array>): HttpRequest;
export {};

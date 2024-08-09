import { AnyWebSocketConstructor } from '../types';
/**
 * Default WebSocket implementation, uses `ws` package
 * for Node.js and the native WebSocket for the browser & other
 * environments.
 */
export declare let Websocket: AnyWebSocketConstructor;
/**
 * Replace the default WebSocket implementation utilised
 * by the Witness client.
 */
export declare function setWebsocket(ws: AnyWebSocketConstructor): void;

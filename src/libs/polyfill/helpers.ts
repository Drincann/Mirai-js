/**
 * detect runtime environment
 * {@link https://stackoverflow.com/questions/17575790/environment-detection-node-js-or-browser}
 */
const isBrowser = new Function('try { return this === window } catch(e) { return false }')
const isNode = new Function('try { return this === global } catch(e) { return false }')
export const runtime: 'browser' | 'nodejs' | 'unknown' = isBrowser() ? 'browser' : isNode() ? 'nodejs' : 'unknown'

/**
 * type guards for WebSocket
 */
import ws from 'ws'
export const guardForWebSocketUnderWindow = (obj: any): obj is /* window. */ WebSocket => true
export const guardForNodeWs = (obj: any): obj is ws.WebSocket => true

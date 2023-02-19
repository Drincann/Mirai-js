import { EventEmitter } from "../event-emitter"
import { runtime } from "./helpers"
import * as ws from "ws"

export class WebSocketCompatibilityLayer extends EventEmitter<{
  'message': [/* message */ string | ArrayBuffer]
  'error': [/* reason */ string]
  'close': [/* code */ number, /* reason */ string]
  'open': []
}> {
  private socket: null | /* window. */ WebSocket | ws.WebSocket = null

  public constructor(url: string) {
    super()
    if (runtime === 'browser') {
      this.socket = new window.WebSocket(url)
      this.socket.binaryType = 'arraybuffer'
      this.socket.onopen = () => this.emit('open')
      this.socket.onmessage = (event) => this.emit('message', event.data)
      this.socket.onerror = (/* event */) => this.emit('error', 'browser does not provide error reason on error event') // browser does not provide error reason on error event
      this.socket.onclose = (event) => this.emit('close', event.code, event.reason)
    } else if (runtime === 'nodejs') {
      this.socket = new ws.WebSocket(url)
      this.socket.binaryType = 'arraybuffer'
      this.socket.on('open', () => this.emit('open'))
      this.socket.on('message', (data /*, isBinary */) => this.emit('message', typeof data === 'string' ? data : data instanceof Buffer ? data.toString() : data as ArrayBuffer))
      this.socket.on('error', (error) => this.emit('error', error.message))
      this.socket.on('close', (code, reason) => this.emit('close', code, typeof reason === 'string' ? reason : reason?.toString?.() ?? 'unknown'))
    } else {
      throw new Error('Unknown runtime environment')
    }
  }

  public send(data: string | ArrayBuffer): void {
    this.socket?.send(data)
  }

  public close(code?: number, reason?: string): void {
    this.socket?.close(code, reason)
  }
}
import { EventEmitter } from "../libs/event-emitter"
import { MiraiVerifiedWebSocketResponse, MiraiWebSocketResponse } from "../types"
import { WebSocketCompatibilityLayer } from "../libs/polyfill/ws"

interface MiraiWebSocketSyncContext {
    syncId: number
    resolveContext: (data: MiraiWebSocketResponse) => void
}

/**
 * WebSocket Adapter for mirai-api-http
 */
export class WebSocketAdapter extends EventEmitter<{
    // from websocket compatibility layer
    'message': [/* message */ string | ArrayBuffer]
    'error': [/* reason */ Error]
    'close': [/* code */ number, /* reason */ string]
    'open': []
    // from mirai
    'miraiEvent': [/* event */ MiraiWebSocketResponse]
}> {
    private socket: WebSocketCompatibilityLayer
    private verifiedPromise: Promise<any> | null = null
    private syncContextMap: Map<number, MiraiWebSocketSyncContext> = new Map
    private _sessionKey: string | null = null
    public get sessionKey(): string | null { return this._sessionKey }

    public constructor(private connectionString: string, private syncId: number = -1) {
        super()
        this.socket = new WebSocketCompatibilityLayer(this.connectionString)
        this.verifiedPromise = new Promise((resolve, reject) => {
            const errorHandler = this.socket.on('error', reason => reject(new Error(reason)))
            const messageHandler = this.socket.on('message', message => {
                if (!(typeof message === 'string')) throw new Error('Verification message is not valid')
                let verifiedMessage: MiraiVerifiedWebSocketResponse | null = null
                try { verifiedMessage = JSON.parse(message) } catch (e) { reject(e) }
                if (verifiedMessage?.data?.code === 0) {
                    this._sessionKey = verifiedMessage.data.session
                    resolve(undefined)
                } else {
                    return reject(new Error(`Verification failed ${JSON.stringify(verifiedMessage)}`))
                }
                // remove event listeners for verification
                this.socket.off('error', errorHandler)
                this.socket.off('message', messageHandler)
                // expose websocket events
                this.socket.on('message', message => this.emit('message', message));
                this.socket.on('open', () => this.emit('open'));
                this.socket.on('error', reason => this.emit('error', new Error(reason)));
                this.socket.on('close', (code, reason) => this.emit('close', code, reason))
                // start to receive message
                this.startToReceiveMessage()
            })
        }).catch(err => console.error(err))
    }

    private startToReceiveMessage(): void {
        this.socket.on('message', websocketMsg => {
            let miraiMessage: MiraiWebSocketResponse | null = null
            try {
                miraiMessage = JSON.parse(websocketMsg?.toString())
            } catch (e) {
                return this.emit('error', e instanceof Error ? e : typeof e === 'string' ? new Error(e) : new Error('unknown error', { cause: e }))
            }

            const syncId = Number(miraiMessage?.syncId)
            if (typeof syncId === 'number') {
                if (syncId === this.syncId && miraiMessage !== null) {
                    // mriai events like 'FriendMessage'
                    return this.emit('miraiEvent', miraiMessage)
                }
                if (this.syncContextMap.has(syncId)) {
                    this.syncContextMap.get(syncId)?.resolveContext(miraiMessage as MiraiWebSocketResponse)
                }
            }
        })
    }

    public async verify(): Promise<void> {
        await this.verifiedPromise
    }

    /**
     * 用于生成一个抽象的同步上下文放在 syncContextMap 中
     * this.sendCommand 负责调用，从而生成上下文
     * this.startToReceiveMessage 负责结束某个上下文
     * TODO: 考虑一下 forever pending 的情况
     * @param resolve 该上下文结束时回调
     * @returns 该上下文 entity
     */
    private generateSyncContext(resolve: (data: MiraiWebSocketResponse) => void): MiraiWebSocketSyncContext {
        let syncId = Math.floor(Math.random() * 1E9 /* assert concurrency < 1E9 */)
        while (this.syncContextMap.has(syncId)) {
            syncId = Math.floor(Math.random() * 1E9)
        }

        return this.syncContextMap.set(syncId, {
            syncId,
            resolveContext: (data: MiraiWebSocketResponse) => {
                this.syncContextMap.delete(syncId)
                resolve(data)
            }
        }).get(syncId) as MiraiWebSocketSyncContext
    }

    public async sendCommand({ command, subCommand, content }: {
        command: string, subCommand?: string | null, content?: any
    }): Promise<MiraiWebSocketResponse> {
        await this.verifiedPromise
        return new Promise((resolve, reject) => {
            try {
                this.socket.send(JSON.stringify({
                    syncId: this.generateSyncContext(resolve).syncId,
                    command,
                    subCommand,
                    content,
                }))
            } catch (e) { reject(e) }
        })
    }
}

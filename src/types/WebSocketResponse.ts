export interface MiraiWebSocketResponse {
    syncId: string
    data: Record<string, any>
}

export interface MiraiVerifiedWebSocketResponse extends MiraiWebSocketResponse {
    data: {
        session: string
        code: number
    }
}

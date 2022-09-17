import { EventMap, isFriendMessageEventOrGroupMessage, textPropContext } from "../types"

type NextFunc = () => Promise<any>
type MiddlewareFunc<Context> = (ctx: Context, next: NextFunc) => Promise<any> | any
type MiddlewareEntry<Context> = (ctx: Context) => Promise<any>

export class Middleware<EventName extends keyof EventMap, Context extends EventMap[EventName] = any> {
    private middleware: Array<MiddlewareFunc<Context>> = []

    public constructor() { }

    public use(middleware: MiddlewareFunc<Context>): this {
        this.middleware.push(middleware)
        return this
    }

    public textProcessor(): Middleware<EventName, EventMap[EventName] & { text: string }> {
        this.middleware.push(async (ctx, next) => {
            if (!textPropContext(ctx)) return
            if (isFriendMessageEventOrGroupMessage(ctx)) {
                ctx.text = ctx.messageChain
                    ?.filter(messageChainItem => messageChainItem.type === 'Plain')
                    ?.map(messageChainItem => messageChainItem.text).join('') ?? ''
            }
            ctx.text = ctx.text ?? ''
            await next()
        })
        return this as any
    }

    public getEntry(): MiddlewareEntry<Context> {
        return async (ctx: Context) => {
            /**
             * 递归地从底层中间件包装到最外层
             * TODO: 这里允许多次调用 next, feature or bug?
             */
            return await this.middleware.reduceRight<NextFunc>((next, middleware) => {
                return async () => await middleware(ctx, next)
            }, async () => { })()
        }
    }
}
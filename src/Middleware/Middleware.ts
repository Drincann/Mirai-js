import { isFriendMessageEventOrGroupMessage, } from "../types"
import { Cover, CoverTuple, Equals, } from "../types/typeHelpers"

type AnyFunc = (...args: any[]) => any
export type NextFunc = () => Promise<any>
export type MiddlewareFunc<Context> = (ctx: Context, next: NextFunc) => Promise<any> | any

export class MiddlewareWrapper<Context extends Record<PropertyKey, any> = {}> {
    private wrappedFunc: MiddlewareFunc<Context>
    public constructor(func: MiddlewareFunc<Context>) { this.wrappedFunc = func }
    public getEntry(): MiddlewareFunc<Context> { return this.wrappedFunc }
}

export class Middlewares {
    private constructor() { }

    public static textProcessor(): MiddlewareWrapper<{ text: string }> {
        return new MiddlewareWrapper(
            async (ctx, next) => {
                if (isFriendMessageEventOrGroupMessage(ctx)) {
                    ctx.text = ctx.messageChain
                        ?.filter(messageChainItem => messageChainItem.type === 'Plain')
                        ?.map(messageChainItem => messageChainItem.text).join('') ?? ''
                }
                ctx.text = ctx.text ?? ''
                await next?.()
            }
        );
    }
}

export class ProcessChain<Context extends Record<PropertyKey, any> = {}, InitContext extends Record<PropertyKey, any> = Context> {
    private chain: (MiddlewareFunc<Context> | ProcessChain<any>)[] = []

    public constructor(initFunc?: MiddlewareFunc<Context>) { if (initFunc instanceof Function) this.chain.push(initFunc) }

    public pipe<
        CommingContext extends Record<PropertyKey, any> = {},
        CommingContextFromMiddlewareWrapper extends Record<PropertyKey, any> = {},
        CommingContextFromAnotherProcessChain extends Record<PropertyKey, any> = {},
    >(
        pipeable:
            MiddlewareFunc<Equals<CommingContext, {}> extends true ? Context : Cover<Context, Partial<CommingContext>>>
            | MiddlewareWrapper<CommingContextFromMiddlewareWrapper>
            | ProcessChain<CommingContextFromAnotherProcessChain>
    ): ProcessChain<
        CoverTuple<[
            Context,
            CommingContextFromMiddlewareWrapper,
            CommingContextFromAnotherProcessChain,
            CommingContext
        ]>,
        InitContext
    > {
        if (pipeable instanceof MiddlewareWrapper) {
            this.chain.push(pipeable.getEntry())
        } else if (pipeable instanceof ProcessChain || pipeable instanceof Function) {
            this.chain.push(pipeable as any)
        } else {
            throw new Error('Invalid pipeable, should be a middleware function or a middleware wrapper instance or a process chain instance')
        }
        return this as any
    }

    public async run(ctx: InitContext): Promise<void> {
        await (async (ctx: InitContext) => {
            /**
             * 递归地从底层中间件包装到最外层
             * TODO: 这里允许多次调用 next, feature or bug?
             */
            return await this.chain.reduceRight<NextFunc>((next, middleware) => {
                return async () => await (middleware instanceof ProcessChain ? middleware.pipe(next).run(ctx) : middleware?.(ctx, next))
            }, async () => { })()
        })(ctx)
    }
}

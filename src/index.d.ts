import { Bot as BotType } from './Bot';
import { Message as MessageType } from './Message';
import { Middleware as MiddlewareType } from './Middleware';
declare module 'mirai-js' {
    export const Bot: typeof BotType;
    export const Message: typeof MessageType;
    export const Middleware: typeof MiddlewareType;
}
import { Bot, Bot as BotType } from './Bot';
import { Message, Message as MessageType } from './Message';
import { Middleware, Middleware as MiddlewareType } from './Middleware';

export { Bot, Message, Middleware };
declare module 'mirai-js' {
    export const Bot: typeof BotType;
    export const Message: typeof MessageType;
    export const Middleware: typeof MiddlewareType;
}
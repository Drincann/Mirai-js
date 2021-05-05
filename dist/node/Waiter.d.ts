import { EventType, Processor } from './BaseType';
import { Bot } from './Bot';

export class Waiter {
    private bot: Bot;

    /**
     * @description 等待一次消息，经过开发者提供的处理器后返回到异步代码处
     * @param eventType 事件类型
     * @param callback  处理器，其返回值将被 resolve，传递到外部
     */
    wait(eventType: EventType, callback: Processor): Promise<any>;
}
const { Bot } = require('./Bot');
const { Message } = require('./Message');
const { Middleware } = require('./Middleware');
const { ForwardNode } = require('./ForwardNode');

if (process.browser) {
    window.miraiJs = {
        Bot,
        Message,
        Middleware,
        ForwardNode
    };
} else {
    module.exports = {
        Bot,
        Message,
        Middleware,
        ForwardNode
    };
}

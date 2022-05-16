const { Bot } = require('./Bot');
const { Message } = require('./Message');
const { Middleware } = require('./Middleware');

(function (window, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
        // eslint-disable-next-line no-undef
    } else if (typeof define === 'function' && define.amd) {
        // eslint-disable-next-line no-undef
        define(factory);
    } else {
        window.miraiJs = factory();
    }
})(this, function () {
    return {
        Bot,
        Message,
        Middleware,
    };
});
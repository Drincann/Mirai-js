const { isBrowserEnv } = require('../util/isBrowserEnv');

module.exports = {
    wsStartListening: isBrowserEnv() ? require('../core/startListeningBrowser') : require('../core/startListeningNode'),
    wsStopListening: isBrowserEnv() ? require('../core/stopListeningBrowser') : require('../core/stopListeningNode'),
};
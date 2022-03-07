module.exports = {
    wsStartListening: process.browser ? require('../core/startListeningBrowser') : require('../core/startListeningNode'),
    wsStopListening: process.browser ? require('../core/stopListeningBrowser') : require('../core/stopListeningNode'),
};
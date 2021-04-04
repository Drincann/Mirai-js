const { ProvidePlugin } = require('webpack');

module.exports = {
    context: __dirname,
    entry: './src/index.js',
    output: {
        path: require('path').resolve(__dirname, 'dist'),
        filename: 'mirai-js.js',
        clean: true
    },
    plugins: [
        new ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    mode: 'production',
    resolve: {
        fallback: {
            url: false,
            fs: false
        }
    },

};
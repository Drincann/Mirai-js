const { ProvidePlugin } = require('webpack');

module.exports = {
    context: __dirname,
    entry: './src/index.js',
    output: {
        path: require('path').resolve(__dirname, 'dist', 'browser'),
        filename: 'mirai-js.js',
        clean: true
    },
    externals: {
        // ws v8+ 会需要配置更多 polyfill, 这里通过外部依赖直接忽略它
        ws: 'ws'
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
            fs: false,
            util: false,
            path: require.resolve('path-browserify'),
        }
    },

};
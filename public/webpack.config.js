const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require("path");

const config = {
    entry: {
        app: "./assets/js/index.js",
        db: "./assets/js/db.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js",
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    plugins: [
        new WebpackPwaManifest({
            filename: "manifest.json",
            fingerprints: false,
            name: "Budget Tracker",
            short_name: "Budget",
            description: "An app to track your budget on and offline",
            background_color: '#01579b',
            theme_color: '#ffffff',
            'theme-color': '#ffffff',
            start_url: '/',
            icons: [
                {
                    src: path.resolve('assets/images/icons/icon-192x192.png'),
                    sizes: [96, 128, 192, 256, 384, 512],
                    destination: path.join('assets', 'images', 'icons'),
                },
            ],
        }),
    ],
};

module.exports = config;
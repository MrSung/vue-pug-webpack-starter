// eslint-disable-next-line no-unused-vars
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const environment = process.env.NODE_ENV;
const isDev = environment === 'development';
const isProd = environment === 'production';

/**
 * Get pure css files pattern
 * @return {String} Regex pattern
 */
function getPureCssFilesPattern() {
  const pureCssFiles = glob.sync('./src/**/*.scss').map((filePath) => filePath.split('/').pop().split('.').shift());
  const pureCssFileNames = pureCssFiles.filter((item, index) => pureCssFiles.indexOf(item) === index).join('|');
  return `(${pureCssFileNames})\.s?css$`; // eslint-disable-line no-useless-escape
}

const pureCssFilesPattern = getPureCssFilesPattern();
const pureCssFilesRegExp = new RegExp(pureCssFilesPattern);

/**
 * Get pug files for HTML generation
 * @param {String} templateDir Pug template views directory
 * @return {Object} Instance of HtmlWebpackPlugin
 */
function generateHtmlPlugins(templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  const templateSubDirName = templateDir.split('/').pop();
  return templateFiles
    .filter((templatePath) => templatePath.endsWith('.pug'))
    .map((item) => {
      const [name, extension] = item.split('.');
      const subDirName = templateDir.split('/views/').pop();
      const pluginOption = {
        inject: false,
        chunks: name,
        filename: `${subDirName}/${name}.html`,
        template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
        minify: false,
        isDev,
        isProd,
        // Custom property
        entrypointName: templateSubDirName,
      };
      // eslint-disable-next-line no-console
      console.log(pluginOption);
      return new HtmlWebpackPlugin(pluginOption);
    });
}

const sampleHtmlPlugins = generateHtmlPlugins('./src/templates/views/sample');

const webpackConfig = {
  mode: isProd ? 'production' : 'development',
  cache: true,
  devtool: !isProd && 'inline-source-map',
  entry: {
    sample: './src/js/sample.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          'cache-loader',
          {
            loader: 'thread-loader',
            options: {
              workers: 2,
              workerNodeArgs: ['--max-old-space-size=1024'],
              poolTimeout: 500,
            },
          },
          {
            loader: 'vue-loader',
            options: {
              transformAssetUrls: {
                img: ['src', 'data-src'],
                image: 'xlink:href',
                hotReload: isDev,
              },
            },
          },
          'vue-svg-inline-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 2,
              workerNodeArgs: ['--max-old-space-size=1024'],
              poolTimeout: 500,
            },
          },
          'babel-loader',
        ],
      },
      {
        // For CSS modules
        test: /\.s?css$/,
        exclude: pureCssFilesRegExp,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        // For pure CSS (without CSS modules)
        test: pureCssFilesRegExp,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.pug$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
              root: path.join(__dirname, 'src/template'),
              self: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ['cache-loader', 'svg-inline-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: '[path][name].[ext]',
              fallback: 'file-loader',
              outputPath: 'img/',
              context: path.join(__dirname, 'src/img'),
            },
          },
        ],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    contentBase: [path.join(__dirname, 'static')],
    port: 3150,
    open: true,
    proxy: {
      // e.g. API server
    },
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        sourceMap: !isProd,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: isProd,
          },
          output: {
            comments: !isProd,
            beautify: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: [
            'advanced',
            {
              autoprefixer: {
                add: true,
              },
              discardComments: { removeAll: isProd },
              cssDeclarationSorter: { order: 'smacss' },
            },
          ],
        },
        canPrint: true,
      }),
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
};

// Set HtmlWebpackPlugin instances
webpackConfig.plugins = (webpackConfig.plugins || []).concat(
  sampleHtmlPlugins,
);

if (!isDev) {
  webpackConfig.plugins.push(new CleanWebpackPlugin());
  // Comment out below when analyzing bundle size
  // eslint-disable-next-line global-require
  // const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  // webpackConfig.plugins.unshift(new BundleAnalyzerPlugin({ openAnalyzer: true }));
}

module.exports = webpackConfig;

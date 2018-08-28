'use strict'
const path = require('path')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const packageConfig = require('../package.json')
const glob = require('glob')
const merge = require("webpack-merge");
const VIEW_PATH = path.resolve(__dirname, '../src/views')
const packageViews = process.argv[2] || packageConfig.pages
console.log('packageViews')
console.log(packageViews);
/**
 * @param {string, string} 文件类型和需要打包的页面名
 * @returns {page_1: '../src/views/...',...}
*/
function getViews(fileStr) {
  let map = {}
  if(fileStr){
    let fileArr = fileStr.split(',')
    fileArr.forEach(item => {
      map = getFiles(item)
    })
  }else {
    map = getFiles()
  }
  console.log('map')
  console.log(map)
  return map;
}
/**
 * @param {string} 需要打包的页面名
 * @returns map
*/
function getFiles(file){
  let map = {}
  let _file = file || '\*'
  let entriesFile = glob.sync(`${VIEW_PATH}/${_file}/\*.js`)
  entriesFile.forEach(pathItem => {
    let arr = pathItem.split("/")
    let _filename = arr[arr.length - 2]
    map[_filename] = pathItem
  });
  return map
}
// 多入口配置
exports.entries = function () {
  return getViews(packageViews)
}
// 多出口配置
exports.htmlPlugin = function (params) {
  let entryHtml = glob.sync(VIEW_PATH + '/*/*.html')
  let tempArr = []
  entryHtml.forEach(pathItem=>{
    let filename = pathItem.substring(pathItem.lastIndexOf('\/')+1,pathItem.lastIndexOf('.'))
    console.log('filename')
    console.log(filename)
    let conf = {
      template: pathItem,
      filename: filename + '.html',
      chunks: [filename],
      inject: true
    }
    if(process.env.NODE_ENV = 'production'){
      conf = merge(conf, {
        chunks: ["manifest", "vendor", filename],
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        chunksSortMode: "dependency"
      });
    }
    tempArr.push(new HtmlWebpackPlugin(conf))
  })
  return tempArr
}


exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}

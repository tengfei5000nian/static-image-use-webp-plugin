# Webp plugin for webpack

一个webpack插件，用来为静态图片创建webp格式备份，并判断浏览器兼容动态切换。

> NOTE: Node v10+ and webpack v4+ are supported and tested.

## 关于

在生成图片模块的时候创建webp格式备份（如果webp格式不比原图像小不设置），然后在每个图片模块中引入isSupportWebp模块判断兼容来切换导出的图片扩展名。

## 安装

`npm install --save-dev static-image-use-webp-plugin`

## 使用

```js
import StaticImageUseWebpPlugin from 'static-image-use-webp-plugin'

const webpackConfig = {
    plugins: [
        new StaticImageUseWebpPlugin(),
    ],
};

module.exports = webpackConfig;
```

## 选项

```js
new StaticImageUseWebpPlugin({
    // 判断是否支持webp模块路径。
    //
    // default: static-image-use-webp-plugin/dist/support.js
    isSupportWebpModule: 'static-image-use-webp-plugin/dist/support.js',

    // 需要支持webp的图片扩展名数组。
    //
    // default: ['png', 'jpg', 'jpeg']
    includeExtension: ['png', 'jpg', 'jpeg'],

    // imagemin-webp的options，用来生成webp格式图片。
    // See https://github.com/imagemin/imagemin-webp
    //
    // default: {}
    imageminWebpOptions: {},

    // file-loader的options，当模块不是导出路径时，通过file-loader来emitFile文件，并获取导出路径。
    // See https://github.com/webpack-contrib/file-loader
    //
    // default: {}
    fileLoaderOptions: {},
});
```

## isSupportWebpModule

默认判断是否支持webp的模块。
See static-image-use-webp-plugin/dist/support.js

```js
export default global.document?.createElement('canvas').toDataURL('image/webp', 0.5).indexOf('data:image/webp') === 0 || false
```

## 生成的图片模块

```js
import isSupportWebp from 'static-image-use-webp-plugin/dist/support.js';
export default "test_image." + (isSupportWebp === true ? "webp" : "png") + ""
```

## vue-cli@5 中使用

```js
const StaticImageUseWebpPlugin = require('static-image-use-webp-plugin').default
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: config => {
    const rules = config.module.rules
    const imageRule = rules.find(r => r.test.test('.png'))
    const imageRuleIndex = rules.indexOf(imageRule)
    rules.splice(
      imageRuleIndex,
      1,
      {
        test: /\.(png|jpe?g)(\?.*)?$/,
        type: 'javascript/auto',
      },
      {
        test: /\.(gif|webp|avif)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'img/[name].[hash:8][ext]' }
      }
    )

    config.plugins.push(
      new StaticImageUseWebpPlugin({
        fileLoaderOptions: {
          esModule: false,
          name: 'img/[name].[hash:8].[ext]'
        }
      })
    )
  },
  css: {
    // 生产环境中想在style中动态使用切换功能需将extract设成false，否则在提取到css文件时默认不支持webp。
    // See https://cli.vuejs.org/zh/config/#css-extract
    extract: false
  }
})
```

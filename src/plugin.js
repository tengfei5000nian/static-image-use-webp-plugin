import path from 'path'
import { validate } from 'schema-utils'
import { NormalModule } from 'webpack'

import defaultOptions from './options.json'

const pluginName = 'static-image-use-webp-plugin'

export default class StaticImageUseWebpPlugin {
  constructor(options = {}) {
    this.options = Object.assign({
      isSupportWebpModule: `${pluginName}/dist/support.js`,
      includeExtensions: ['png', 'jpg', 'jpeg']
    }, options)

    validate(defaultOptions, this.options)
  }

  apply(compiler) {
    const isWebpackV5 = compiler.webpack && compiler.webpack.version >= '5'
    const loader = path.join(__dirname, 'loader.js')
    const test = new RegExp(`\\.(${this.options.includeExtensions.join('|')})($|\\"|\\'|\\?)`)

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {

      const tapCallback = (loaderContext, module) => {
        if (!test.test(module.userRequest)) return

        Object.defineProperty(loaderContext, 'currentModule', {
          get: () => module
        })

        module.loaders.unshift({
          loader,
          options: this.options
        })
      }

      if (isWebpackV5) {
        NormalModule.getCompilationHooks(compilation).loader.tap(
          pluginName,
          tapCallback
        )
      } else {
        compilation.hooks.normalModuleLoader.tap(pluginName, tapCallback)
      }
    })
  }
}

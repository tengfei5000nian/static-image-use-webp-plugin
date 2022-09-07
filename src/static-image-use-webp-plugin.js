import path from 'path'
import { validate } from 'schema-utils'
import { NormalModule } from 'webpack'

import defaultOptions from './options.json'

const pluginName = 'static-image-use-webp-plugin'

export default class StaticImageUseWebpPlugin {
  constructor(options = {}) {
    this.options = Object.assign({
      isSupportWebpPath: path.join(__dirname, 'is-support-webp.js'),
      includeExtensions: ['png', 'jpg', 'jpeg']
    }, options)

    validate(defaultOptions, this.options)
  }

  apply(compiler) {
    this.setVerifyIsSupportWebp(compiler)
    this.setExtensionToggle(compiler)
  }

  setVerifyIsSupportWebp(compiler) {
    compiler.hooks.entryOption.tap(pluginName, (_, entry) => {
      if (typeof entry !== 'function') {
        for (const name of Object.keys(entry)) {
          entry[name].import?.unshift(this.options.isSupportWebpPath)
        }
      } else {
        throw new Error(
          `${pluginName} doesn't support dynamic entry (function) yet`
        );
      }
    })
  }

  setExtensionToggle(compiler) {
    const loader = path.join(__dirname, 'static-image-use-webp-loader.js')
    const test = new RegExp(`\\.(${this.options.includeExtensions.join('|')})($|\\"|\\'|\\?)`)

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const hooks = NormalModule.getCompilationHooks(compilation)
      hooks.loader.tap(pluginName, (loaderContext, module) => {
        if (!test.test(module.userRequest)) return

        Object.defineProperty(loaderContext, 'currentModule', {
          get: () => module
        })

        module.loaders.unshift({
          loader,
          options: this.options
        })
      })
    })
  }
}

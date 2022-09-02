import 'webpack/types'

import path from 'path'
import { Dependency, NormalModule } from 'webpack'

import type { Compiler, Compilation, EntryNormalized } from 'webpack'
import type { ReplaceSource } from 'webpack-sources'

function isPlainObject(value: unknown): boolean {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.getPrototypeOf({})
}

class TempDependency extends Dependency {
  constructor() {
    super()
  }

  static Template = class Template extends DependencyTemplate {
    constructor() {
  
    }
  
    apply(dependency: Dependency, source: ReplaceSource) {
      
    }
  }
}

export interface Options {
  /**
   * 设置global参数isSupportWebp，用来判断是否支持webp。浏览器中它是window.isSupportWebp: boolean。
   *
   * default: ''
   */
  isSupportWebpPath?: string,
  /**
   * 设置global参数isSupportWebp，用来判断是否支持webp。浏览器中它是window.isSupportWebp: boolean。
   *
   * default: null
   */
  test?: RegExp,
}

export default class StaticImageUseWebpPlugin {
  private readonly pluginName: string = 'static-image-use-webp-plugin'
  private readonly isSupportWebpPath: string
  private readonly test: RegExp

  constructor(options: Options = {}) {
    if (isPlainObject(options) === false) {
      throw new Error(`${this.pluginName} only accepts an options object.`)
    }

    this.isSupportWebpPath = options.isSupportWebpPath || path.join(__dirname, 'is-support-webp.js')
    this.test = options.test || /\.png|jpe?g($|\?)/i
  }

  apply(compiler: Compiler) {
    this.setVerifyIsSupportWebp(compiler)
    this.setExtensionToggle(compiler)
  }

  setVerifyIsSupportWebp(compiler: Compiler): void {
    compiler.hooks.entryOption.tap(this.pluginName, (_: String, entry: EntryNormalized): any => {
      if (typeof entry !== 'function') {
        for (const name of Object.keys(entry)) {
          entry[name].import?.unshift(this.isSupportWebpPath)
        }
      } else {
        throw new Error(
          `${this.pluginName} doesn't support dynamic entry (function) yet`
        );
      }
    })
  }

  setExtensionToggle(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(this.pluginName, (compilation: Compilation): void => {
      compilation.dependencyTemplates.set(
        TempDependency,
        new TempDependency.Template()
      )

      const hooks = NormalModule.getCompilationHooks(compilation)
      hooks.loader.tap(this.pluginName, (loaderContext, module: NormalModule) => {
        if (!this.test.test(module.resource)) return
        
      })
    })
  }
}

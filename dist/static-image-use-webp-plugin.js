"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _schemaUtils = require("schema-utils");

var _webpack = require("webpack");

var _options = _interopRequireDefault(require("./options.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pluginName = 'static-image-use-webp-plugin';

class StaticImageUseWebpPlugin {
  constructor(options = {}) {
    this.options = Object.assign({
      isSupportWebpPath: _path.default.join(__dirname, 'is-support-webp.js'),
      includeExtensions: ['png', 'jpg', 'jpeg']
    }, options);
    (0, _schemaUtils.validate)(_options.default, this.options);
  }

  apply(compiler) {
    this.setVerifyIsSupportWebp(compiler);
    this.setExtensionToggle(compiler);
  }

  setVerifyIsSupportWebp(compiler) {
    compiler.hooks.entryOption.tap(pluginName, (_, entry) => {
      if (typeof entry !== 'function') {
        for (const name of Object.keys(entry)) {
          var _entry$name$import;

          (_entry$name$import = entry[name].import) === null || _entry$name$import === void 0 ? void 0 : _entry$name$import.unshift(this.options.isSupportWebpPath);
        }
      } else {
        throw new Error(`${pluginName} doesn't support dynamic entry (function) yet`);
      }
    });
  }

  setExtensionToggle(compiler) {
    const isWebpackV5 = compiler.webpack && compiler.webpack.version >= '5';

    const loader = _path.default.join(__dirname, 'static-image-use-webp-loader.js');

    const test = new RegExp(`\\.(${this.options.includeExtensions.join('|')})($|\\"|\\'|\\?)`);
    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      const tapCallback = (loaderContext, module) => {
        if (!test.test(module.userRequest)) return;
        Object.defineProperty(loaderContext, 'currentModule', {
          get: () => module
        });
        module.loaders.unshift({
          loader,
          options: this.options
        });
      };

      if (isWebpackV5) {
        _webpack.NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, tapCallback);
      } else {
        compilation.hooks.normalModuleLoader.tap(pluginName, tapCallback);
      }
    });
  }

}

exports.default = StaticImageUseWebpPlugin;
//# sourceMappingURL=static-image-use-webp-plugin.js.map
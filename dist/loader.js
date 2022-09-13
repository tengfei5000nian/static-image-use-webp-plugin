"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.raw = void 0;

var _imageminWebp = _interopRequireDefault(require("imagemin-webp"));

var _fileLoader = _interopRequireDefault(require("file-loader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {String} data content.toString()的值
 * @return {Boolean} 是否是CommonJs导出模块
*/
function isCommonExport(data) {
  return /module\.exports/.test(data);
}
/**
 * @param {String} data content.toString()的值
 * @return {Boolean} 是否是ES6导出模块
*/


function isES6Export(data) {
  return /export\sdefault/.test(data);
}
/**
 * @param {String} data content.toString()的值
 * @return {Boolean} 是否是导出模块
*/


function isExportModule(data) {
  return isCommonExport(data) || isES6Export(data);
}
/**
 * @param {Array} includeExtensions 要求生成webp的图片扩展名数组
 * @return {RegExp} 图片扩展名正则
*/


function extensionRegExp(includeExtensions) {
  return new RegExp(`\\.(${includeExtensions.join('|')})($|\\"|\\'|\\?)`, 'g');
}
/**
 * @param {NormalModule} module 当前模块
 * @param {String} data content.toString()的值
 * @return {String} 之前loader emitFile文件的name
*/


function getExportName(module, data) {
  const assets = Object.keys(module.buildInfo.assets);
  const name = assets.find(asset => ~data.indexOf(asset));
  return name;
}
/**
 * @param {Object} loaderContext 当前loader的this
 * @param {Buffer} content loader第一个参数content
 * @return {Buffer} 返回导出文件的content buffer
*/


function getImageContent(loaderContext, content) {
  const data = content.toString();

  if (isExportModule(data)) {
    var _loaderContext$curren;

    if (!extensionRegExp(loaderContext.query.includeExtensions).test(data)) return null;
    const name = getExportName(loaderContext.currentModule, data);
    return name ? (_loaderContext$curren = loaderContext.currentModule.buildInfo.assets[name]) === null || _loaderContext$curren === void 0 ? void 0 : _loaderContext$curren.source() : null;
  } else {
    return content;
  }
}
/**
 * @param {Object} loaderContext 当前loader的this
 * @param {Buffer} imageContent 其它图片buffer
 * @return {Buffer} 返回webp图片buffer
*/


async function createWebpContent(loaderContext, imageContent) {
  return await (0, _imageminWebp.default)(loaderContext.query.imageminWebpOptions || {})(imageContent);
}
/**
 * @param {Object} loaderContext 当前loader的this
 * @param {Buffer} content loader第一个参数content
 * @param {Object} sourceMap loader第一个参数content
 * @return {String} 导出模块文件路径
*/


function createPublicPath(loaderContext, content, sourceMap) {
  const data = content.toString();

  if (isExportModule(data)) {
    return data;
  } else {
    const fileLoaderContext = Object.assign({}, loaderContext, {
      query: loaderContext.query.fileLoaderOptions || {}
    });
    return _fileLoader.default.call(fileLoaderContext, content, sourceMap);
  }
}
/**
 * @param {Object} loaderContext 当前loader的this
 * @param {Buffer} webpContent webp图片buffer
 * @param {String} exportPath 导出模块文件路径
 * @param {Object} sourceMap loader第一个参数content
 * @return {String} 导出模块文件路径
*/


function setWebpToggle(loaderContext, webpContent, exportPath, sourceMap) {
  var _loaderContext$curren2;

  const otherImageName = getExportName(loaderContext.currentModule, exportPath);
  const extRE = extensionRegExp(loaderContext.query.includeExtensions);
  const webpImageName = otherImageName.replace(extRE, (res, ext) => res.replace(ext, 'webp'));
  loaderContext.emitFile(webpImageName, webpContent, sourceMap, (_loaderContext$curren2 = loaderContext.currentModule.buildInfo.assetsInfo) === null || _loaderContext$curren2 === void 0 ? void 0 : _loaderContext$curren2.get(otherImageName));
  let isSupportWebp = '';

  if (isCommonExport(exportPath)) {
    isSupportWebp = `const isSupportWebp = require("${loaderContext.query.isSupportWebpModule}").default;\n`;
  } else if (isES6Export(exportPath)) {
    isSupportWebp = `import isSupportWebp from "${loaderContext.query.isSupportWebpModule}";\n`;
  }

  return isSupportWebp.concat(exportPath.replace(extRE, (res, ext) => res.replace(ext, `" + (isSupportWebp === true ? "webp" : "${ext}") + "`)));
}

const raw = true;
exports.raw = raw;

async function _default(content, map, meta) {
  const callback = this.async();

  try {
    const image = getImageContent(this, content);

    if (!image) {
      callback(null, content, map, meta);
      return;
    }

    const webp = await createWebpContent(this, image);

    if (image.length <= webp.length) {
      callback(null, content, map, meta);
      return;
    }

    const path = setWebpToggle(this, webp, createPublicPath(this, content, map), map);
    callback(null, path, map, meta);
  } catch (err) {
    callback(err, '', map, meta);
  }
}
//# sourceMappingURL=loader.js.map
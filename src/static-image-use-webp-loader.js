import imageminWebp from 'imagemin-webp'
import fileLoader from 'file-loader'

/**
 * @param {String} data content.toString()的值
 * @return {Boolean} 是否是导出模块文件路径
*/
function isExportPath(data) {
  return /export\sdefault|module\.exports/.test(data)
}

/**
 * @param {Array} includeExtensions 要求生成webp的图片扩展名数组
 * @return {RegExp} 图片扩展名正则
*/
function extensionRegExp(includeExtensions) {
  return new RegExp(`\\.(${includeExtensions.join('|')})($|\\"|\\'|\\?)`, 'g')
}

/**
 * @param {NormalModule} module 当前模块
 * @param {String} data content.toString()的值
 * @return {String} 之前loader emitFile文件的name
*/
function getExportName(module, data) {
  const assets = Object.keys(module.buildInfo.assets)
  const name = assets.find(asset => ~data.indexOf(asset))
  return name
}

/**
 * @param {Object} loaderContext 当前loader的this
 * @param {Buffer} content loader第一个参数content
 * @return {Buffer} 返回导出文件的content buffer
*/
function getImageContent(loaderContext, content) {
  const data = content.toString()
  if (isExportPath(data)) {
    if (!extensionRegExp(loaderContext.query.includeExtensions).test(data)) return null
    const name = getExportName(loaderContext.currentModule, data)
    return name ? loaderContext.currentModule.buildInfo.assets[name]?.source() : null
  } else {
    return content
  }
}

/**
 * @param {Object} loaderContext 当前loader的this
 * @param {Buffer} imageContent 其它图片buffer
 * @return {Buffer} 返回webp图片buffer
*/
async function createWebpContent(loaderContext, imageContent) {
  return await imageminWebp(loaderContext.query.imageminWebpOptions || {})(imageContent)
}

/**
 * @param {Object} loaderContext 当前loader的this
 * @param {Buffer} content loader第一个参数content
 * @param {Object} sourceMap loader第一个参数content
 * @return {String} 导出模块文件路径
*/
function createPublicPath(loaderContext, content, sourceMap) {
  const data = content.toString()
  if (isExportPath(data)) {
    return data
  } else {
    const fileLoaderContext = Object.assign({}, loaderContext, {
      getOptions: () => loaderContext.getOptions(loaderContext)?.fileLoaderOptions || {}
    })
    return fileLoader.call(fileLoaderContext, content, sourceMap)
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
  const otherImageName = getExportName(loaderContext.currentModule, exportPath)
  const extRE = extensionRegExp(loaderContext.query.includeExtensions)
  const webpImageName = otherImageName.replace(
    extRE,
    (res, ext) => res.replace(ext, 'webp')
  )
  loaderContext.emitFile(
    webpImageName,
    webpContent,
    sourceMap,
    loaderContext.currentModule.buildInfo.assetsInfo?.get(otherImageName)
  )
  return exportPath.replace(
    extRE,
    (res, ext) => res.replace(
      ext,
      `" + (global.isSupportWebp === true ? "webp" : "${ext}") + "`
    )
  )
}

export const raw = true

export default async function (content, map, meta) {
  const callback = this.async()
  try {
    const image = getImageContent(this, content)
    if (!image) {
      callback(null, content, map, meta)
      return
    }

    const webp = await createWebpContent(this, image)
    if (image.length <= webp.length) {
      callback(null, content, map, meta)
      return
    }

    const path = setWebpToggle(
      this,
      webp,
      createPublicPath(this, content, map),
      map
    )

    callback(null, path, map, meta)
  } catch (err) {
    callback(err, '', map, meta)
  }
}

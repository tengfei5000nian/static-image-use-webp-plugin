export default global.document?.createElement('canvas').toDataURL('image/webp', 0.5).indexOf('data:image/webp') === 0 || false

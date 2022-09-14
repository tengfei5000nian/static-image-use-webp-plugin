"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _global$document;

var _default = ((_global$document = global.document) === null || _global$document === void 0 ? void 0 : _global$document.createElement('canvas').toDataURL('image/webp', 0.5).indexOf('data:image/webp')) === 0 || false;

exports.default = _default;
//# sourceMappingURL=support.js.map
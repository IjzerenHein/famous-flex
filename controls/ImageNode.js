import Control from './Control';
import DOMNode from '../core/DOMNode';

/**
 * @private
 */
function layout(rect) {
  this._image.rect = rect;
}

const defaults = {
  classes: ['image'],
  layout: layout
};

export default class ImageNode extends Control {

  /**
   * @param {Object} options Configuration options.
   */
  constructor(options) {
    super();
    this._image = this.addChild(new DOMNode({
      attributes: {
        draggable: false
      }
    }, 'img'));
    this.setOptions(defaults, options);
  }

  get src() {
    return this._src;
  }

  set src(value) {
    if (this._src !== value) {
      this._src = value;
      this._image.el.setAttribute('src', value);
    }
  }
}

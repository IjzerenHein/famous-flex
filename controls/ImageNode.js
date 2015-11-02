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

  measure(rect) {
    if (this._configuredSize) {
      if (this._configuredSize.requiresNaturalSize) {
        if (!this._imageObj) {
          this._imageObj = new Image();
          this._imageObj.onload = () => {
            // do something
          };
        }
        if (this._imageObj.src !== this._src) {
          this._imageObj.src = this._src;
        }
        rect.width = this._imageObj.width;
        rect.height = this._imageObj.width;
      }
      this._configuredSize.measure(rect);
    }
  }
}

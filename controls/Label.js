import ControlBase from './ControlBase';
import {Animation} from '../core';
import {Margins} from '../utilities';

/**
 * Static text label.
 */
export default class Label extends ControlBase {

  /**
   * @param {Object} options Configuration options.
   * @param {String} [options.text] Text displayed in the label.
   * @param {Bool} [options.autoScale] Automatically scales the font when text doesn't fit.
   * @param {Bool} [options.hasBackground] Set to `true` when using css-classes to style the background.
   */
  constructor(options) {
    super(options);
    this._setLayout(Label.layout.bind(this));
    this._primaryText = this._createDOMNode(['classes', 'styles', 'attributes', 'content']);
    this._frontText = this._primaryText;
    if (options) {
      if (options.autoScale) this.autoScale = options.autoScale;
      if (options.text) this.text = options.text;
      if (options.hasBackground) {
        this._background = this._createDOMNode(['classes', 'styles']);
        this._background.addClass('background');
      }
      if (options.color) this.color = options.color;
      if (options.backgroundColor) this.backgroundColor = options.backgroundColor;
    }
    this.addClass('label');
  }

  /**
   * @private
   */
  static layout(left, top, width, height) {
    let zIndex = 0;
    if (this._background) {
      this._background.setRect(left, top, width, height);
      zIndex += 2;
    }
    left += Margins.getLeft(this.padding, width);
    top += Margins.getTop(this.padding, height);
    width = Margins.getWidth(this.padding, width);
    height = Margins.getHeight(this.padding, height);
    if (this._secondaryText) {
      this._secondaryText.setRect(left, top, width, height);
      this._secondaryText.zIndex = zIndex;
      zIndex += 2;
    }
    this._primaryText.setRect(left, top, width, height);
    this._primaryText.zIndex = zIndex;
  }

  _updateSecondaryText() {
    if ((this.animated || this._autoScale) && !this._secondaryText) {
      this._secondaryText = this._createDOMNode(['classes', 'styles', 'attributes', 'content']);
      this._secondaryText.opacity = 0;
    } else if (!this.animated && !this._autoScale && this._secondaryText) {
      this._removeDOMNode(this._secondaryText);
      this._secondaryText = undefined;
    }
  }

  /**
   * @private
   */
  get animated() {
    return super.animated;
  }

  /**
   * @private
   */
  set animated(value) {
    super.animated = value;
    this._updateSecondaryText();
  }

  /*get autoScale() {
    return this._autoScale;
  }

  set autoScale(value) {
    this._autoScale = value;
    this._updateSecondaryText();
  }*/

  /**
   * Text that is displayed in the label.
   *
   * @type {String}
   */
  get text() {
    return this._text;
  }

  /**
   * Sets the text that is displayed in the label.
   *
   * @type {String}
   */
  set text(text) {
    text = text || '';
    if (this._text !== text) {
      this._text = text;
      if (this.animated) {
        const showSecondary = (this._frontText === this._primaryText);
        this._frontText = showSecondary ? this._secondaryText : this._primaryText;
        this._animate(() => {
          this._primaryText.opacity = showSecondary ? 0 : 1;
          this._secondaryText.opacity = showSecondary ? 1 : 0;
        });
        this._frontText.el.setContent('<div>' + this._text + '</div>');
      } else {
        this._setContent('<div>' + this._text + '</div>');
      }
    }
  }

  get color() {
    return this._primaryText.color;
  }

  set color(value) {
    this._primaryText.color = value;
    if (this._secondaryText) {
      this._secondaryText.color = value;
    }
  }

  get hasBackground() {
    return !!this._background;
  }

  get background() {
    if (!this._background) {
      this._background = this._createDOMNode(['classes', 'styles']);
      this._background.addClass('background');
    }
    return this._background;
  }

  get backgroundColor() {
    return this._background ? this._background.backgroundColor : undefined;
  }

  set backgroundColor(value) {
    this.background.backgroundColor = value;
  }
}

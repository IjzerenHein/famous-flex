import {Opacity} from 'famous/components';
import {DOMNode, Animation} from '../core';
import ControlBase from './ControlBase';
import Margins from './Margins';

/**
 * Static text label.
 */
export default class Label extends ControlBase {

  /**
   * @param {Object} options
   * @param {String} [options.text] Text displayed in the label.
   * @param {Bool} [options.autoScale] Automatically scales the font when text doesn't fit.
   * @param {Bool} [options.animate] Animates the text (fade-effect) when it changes.
   * @param {Bool} [options.innerMargins]
   * @param {Bool} [options.outerMargins]
   * @param {Bool} [options.background]
   * @param {Array.String} [options.classes] Initial css-classes.
   * @param {Object} [options.styles] Initial css-styles.
   */
  constructor(options) {
    super(options);
    this._setLayout(Label.layout.bind(this));
    this._primaryText = this._createDOMNode(['classes', 'styles', 'attributes']);
    this._frontText = this._primaryText;
    if (options) {
      if (options.autoScale) this.autoScale = options.autoScale;
      if (options.text) this.text = options.text
      if (options.background) {
        this._background = this._createDOMNode(['classes', 'styles']);
        this._background.addClass('background')
      }
    }
    this.addClass('label');
  }

  /**
   * @private
   */
  static layout(size) {
    let zIndex = 0;
    const left = Margins.outerLeft(this._margins);
    const top = Margins.outerTop(this._margins);
    const width = size[0] - Margins.outerWidth(this._margins);
    const height = size[1] - Margins.outerHeight(this._margins);
    if (this._backgroundText) {
      this._backgroundText.setRect(left, top, width, height);
      this._backgroundText.zIndex = zIndex;
      zIndex += 2;
    }
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
      this._secondaryText = this._createDOMNode(['classes', 'styles', 'attributes']);
      this._secondaryText.opacity = 0;
    }
    else if (!this.animated && !this._autoScale && this._secondaryText) {
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
   * Overriden in order to create/destroy secondary-text if needed.
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
      }
      else {
        this._setContent('<div>' + this._text + '</div>');
      }
    }
  }
}

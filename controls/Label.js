import Control from './Control';
import DOMNode from '../core/DOMNode';
import ShowNode from '../core/ShowNode';
import Styles from '../core/Styles';

/**
 * @private
 */
function layout(rect) {
  if (this._background) {
    this._background.rect = rect;
    rect.inFront();
  }
  rect.subtract(this._padding);
  this._text.rect = rect;
}

const defaults = {
  classes: ['label'],
  layout: layout
};

/**
 * Static text label.
 */
export default class Label extends Control {

  /**
   * @param {Object} options Configuration options.
   * @param {String} [options.text] Text displayed in the label.
   * @param {Bool} [options.autoScale] Automatically scales the font when text doesn't fit.
   * @param {Bool} [options.hasBackground] Set to `true` when using css-classes to style the background.
   */
  constructor(options) {
    super();
    this._text = this.addChild(new ShowNode());
    this._text1 = this.addSharedClassesChild(new DOMNode({classes: ['text']}));
    this.setOptions(defaults, options);
  }

  get animation() {
    return this._text.animation;
  }

  set animation(options) {
    this._text.animation = options;
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
    return this._textValue;
  }

  /**
   * Sets the text that is displayed in the label.
   *
   * @type {String}
   */
  set text(text) {
    text = text || '';
    if (this._textValue !== text) {
      this._textValue = text;
      if (this._visibleText && !this._text2) {
        this._text2 = this.addSharedClassesChild(new DOMNode({classes: ['text']}));
        console.log('yep');
        const styles = this._styles ? this._styles.get() : undefined;
        if (styles) {
          this._text2.styles.setOptions(styles);
        }
      }
      this._visibleText = (this._visibleText === this._text2) ? this._text1 : this._text2;
      this._visibleText.innerHTML = '<div>' + this._textValue + '</div>';
      this._text.show(this._visibleText);
    }
  }

  /**
   * @private
   */
  onSetStyle(style, value) {
    this._text1.onSetStyle(style, value);
    if (this._text2) this._text2.onSetStyle(style, value);
  }

  get styles() {
    this._styles = this._styles || new Styles(this);
    return this._styles;
  }

  set styles(options) {
    this.styles.setOptions(options);
  }

  get textAlign() {
    return this._styles ? this._styles.textAlign : undefined;
  }

  set textAlign(value) {
    console.log('heuj');
    this.styles.textAlign = value;
  }

  get fontSize() {
    return this._styles ? this._styles.fontSize : undefined;
  }

  set fontSize(value) {
    this.styles.fontSize = value;
  }

  get color() {
    return this._styles ? this._styles.color : undefined;
  }

  set color(value) {
    this.styles.color = value;
  }

  get hasBackground() {
    return !!this._background;
  }

  set hasBackground(value) {
    if (value) {
      this._background = this._background || this.addChild(new DOMNode({classes: ['background']}));
    }
  }

  get background() {
    this.hasBackground = true;
    return this._background;
  }

  get backgroundColor() {
    return this._background ? this._background.styles.backgroundColor : undefined;
  }

  set backgroundColor(value) {
    this.background.styles.backgroundColor = value;
  }
}

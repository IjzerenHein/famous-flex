import Control from './Control';
import DOMNode from '../core/DOMNode';
import ShowNode from '../core/ShowNode';
import Style from '../core/Style';
import Margins from '../core/Margins';

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
    this._padding = new Margins();
    this._padding.onChange = () => this.requestLayout();
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

  /*get textWrap() {
    return this._textWrap;
  }

  set textWrap(value) {
    this._textWrap = value;
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
        const style = this._style ? this._style.get() : undefined;
        if (style) {
          this._text2.style.setOptions(style);
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

  get style() {
    this._style = this._style || new Style(this);
    return this._style;
  }

  set style(options) {
    this.style.setOptions(options);
  }

  get textAlign() {
    return this._style ? this._style.textAlign : undefined;
  }

  set textAlign(value) {
    console.log('heuj');
    this.style.textAlign = value;
  }

  get fontSize() {
    return this._style ? this._style.fontSize : undefined;
  }

  set fontSize(value) {
    this.style.fontSize = value;
  }

  get color() {
    return this._style ? this._style.color : undefined;
  }

  set color(value) {
    this.style.color = value;
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
    return this._background ? this._background.style.backgroundColor : undefined;
  }

  set backgroundColor(value) {
    this.background.style.backgroundColor = value;
  }
}

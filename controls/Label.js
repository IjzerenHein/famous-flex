import ControlBase from './ControlBase';
import DOMNode from '../core/DOMNode';
import ShowAnimation from '../core/ShowAnimation';
import Animation from '../animation/Animation';

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
export default class Label extends ControlBase {

  /**
   * @param {Object} options Configuration options.
   * @param {String} [options.text] Text displayed in the label.
   * @param {Bool} [options.autoScale] Automatically scales the font when text doesn't fit.
   * @param {Bool} [options.hasBackground] Set to `true` when using css-classes to style the background.
   */
  constructor(options) {
    super();
    this._text = this.addChild(new ShowAnimation());
    this._text1 = this.addSharedClassesChild(new DOMNode({classes: ['text']}));
    this.setOptions(defaults, options);
  }

  /*_updateAnimation() {
    const enabled = !!this._showAnimation.showEffect || !!this._showAnimation.hideEffect;
    if (enabled && (this._text !== this._showAnimation)) {
      this.removeChild(this._text1, true);
      this.addChild(this._showAnimation);
      this._showAnimation._showNode(this._visibleText, null);
      if (!this._text2) {
        this._text2 = new DOMNode({classes: ['text']});
        this.addSharedClassesChild(this._text2);
      }
      this._text = this._showAnimation;
      this.requestLayout();

    } else if (!enabled && (this._text === this._showAnimation)) {
      // disabling of animation not yet supported
    }
  }*/

  get animation() {
    /*if (!this._showAnimation) {
      this._showAnimation = new ShowAnimation();
      this._showAnimation.onChanged = () => this._updateAnimation();
    }*/
    return this._text;
  }

  set animation(value) {
    /*if (!this._showAnimation) {
      this._showAnimation = new ShowAnimation();
      this._showAnimation.onChanged = () => this._updateAnimation();
    }*/
    this._text.setOptions(value);
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
      console.log('whoop');
      this._textValue = text;
      if (this._visibleText && !this._text2) this._text2 = this.addSharedClassesChild(new DOMNode({classes: ['text']}));
      this._visibleText = (this._visibleText === this._text2) ? this._text1 : this._text2;
      this._visibleText.innerHTML = '<div>' + this._textValue + '</div>';
      this._text._showNode(this._visibleText);
    }
  }

  get textAlign() {
    return this._textAlign;
  }

  set textAlign(value) {
    if (this._textAlign !== value) {
      this._textAlign = value;
      this._text1.styles.set('textAlign', value);
      if (this._text2) this._text2.styles.set('textAlign', value);
    }
  }

  get fontSize() {
    return this._fontSize;
  }

  set fontSize(value) {
    if (this._fontSize !== value) {
      this._fontSize = value;
      this._text1.styles.fontSize = value;
      if (this._text2) this._text2.styles.fontSize = value;
    }
  }

  get styles() {
    // TODO, the returned styles should modify both text1 & text2
    return this._text1.styles;
  }

  set styles(value) {
    this._text1.styles.setAll(value);
    if (this._text2) {
      this._text2.styles.setAll(value);
    }
  }

  get color() {
    // TODO, the returned color should modify both text1 & text2
    return this._text1.styles.color;
  }

  set color(value) {
    this._text1.styles.color = value;
    if (this._text2) {
      this._text2.styles.color = value;
    }
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

import ControlBase from './ControlBase';
import DOMNode from '../core/DOMNode';
import Animation from '../animation/Animation';

const defaults = {
  classes: ['label']
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
    this._primaryText = this.addChild(new DOMNode({classes: ['text']}));
    this._frontText = this._primaryText;
    this.setOptions(options, defaults);
  }

  static layout(rect) {
    if (this._background) {
      this._background.rect = rect;
      rect.inFront();
    }
    rect.subtract(this._padding);
    if (this._secondaryText) {
      this._secondaryText.rect = rect;
      rect.inFront();
    }
    this._primaryText.rect = rect;
  }

  _updateSecondaryText() {
    if ((this.animated || this._autoScale) && !this._secondaryText) {
      this._secondaryText = this.addChild(new DOMNode({classes: ['text']}));
      this._secondaryText.opacity = 0;
    } else if (!this.animated && !this._autoScale && this._secondaryText) {
      this.removeChild(this._secondaryText);
      this._secondaryText = undefined;
    }
  }

  get animated() {
    return super.animated;
  }

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
      }
      this._primaryText.innerHTML = '<div>' + this._text + '</div>';
      if (this._secondaryText) {
        this._secondaryText.innerHTML = '<div>' + this._text + '</div>';
      }
    }
  }

  get styles() {
    return this._primaryText.styles;
  }

  set styles(value) {
    console.log('heuj');
    this._primaryText.styles.setAll(value);
    if (this._secondaryText) {
      this._secondaryText.styles.setAll(value);
    }
  }

  get color() {
    return this._primaryText.styles.color;
  }

  set color(value) {
    this._primaryText.styles.color = value;
    if (this._secondaryText) {
      this._secondaryText.styles.color = value;
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
Label.defaults = defaults;
Label.defaults.layout = Label.layout;

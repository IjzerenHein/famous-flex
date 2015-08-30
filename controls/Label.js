import {Surface} from 'Famous';

const Align = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

export default class Label extends Surface {
  constructor(options) {
    super(options);
    this.text = (options && options.text) ? options.text : '';
    this.textAlign = (options && options.textAlign) ? options.textAlign : 'center';
    if (options) {
      if (options.color) {
        this.color = options.color;
      }
    }

    this.addClass('label');
  }

  /**
   * Text that is displayed in the label.
   *
   * @type {String}
   */
  get text() {
    return this._text;
  }

  set text(text) {
    text = text || '';
    if (this._text !== text) {
      this._text = text;
      this.setContent('<div>' + this._text + '</div>');
    }
  }

  /**
   * Text color (eg `#00FF00` or `rgba(255,200,77,0.4)`).
   *
   * @type {String}
   */
  get color() {
    return this._color;
  }

  set color(color) {
    color = color || '';
    if (this._color !== color) {
      this._color = color;
      this.setProperties({
        color: this._color,
      });
    }
  }

  /**
   * Text-alignment, `left`, `center` or `right`.
   *
   * @type {String}
   */
  get textAlign() {
    return this._textAlign;
  }

  set textAlign(value) {
    if (this._textAlign !== value) {
      this._textAlign = value;
      this.setProperties({
        textAlign: this._textAlign,
      });
    }
  }
}

Label.Align = Align;

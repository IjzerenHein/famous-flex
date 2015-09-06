import DOMNode from '../core/DOMNode';
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
    this._setLayout(Label.layout);
    this._primaryDOMNode = new DOMNode();
    this._primaryDOMNode.setSizeMode('absolute', 'absolute');
    this._addDOMNode(this._primaryDOMNode);
    if (options) {
      if (options.animate || options.autoScale) {
        this._secondaryDOMNode = new DOMNode();
        this._addDOMNode(this._secondaryDOMNode);
      }
      if (options.text) this.text = options.text
      if (options.background) {
        this._backgroundDOMNode = new DOMNode();
        this._backgroundDOMNode.setSizeMode('absolute', 'absolute');
        this._addDOMNode(this._backgroundDOMNode);
      }
    }
    this.addClass('label');
  }

  /**
   * @private
   */
  static layout(label, size) {
    let zIndex = 0;
    if (label._backgroundDOMNode) {
      label._backgroundDOMNode
        .setAbsoluteSize(size[0] - Margins.outerWidth(this._margins), size[1] - Margins.outerHeight(this._margins))
        .setPosition(Margins.outerLeft(this._margins), Margins.outerTop(this._margins), zIndex);
      zIndex += 2;
    }
    if (label._secondaryDOMNode) {
      label._secondaryDOMNode
        .setAbsoluteSize(size[0] - Margins.innerWidth(this._margins), size[1] - Margins.innerHeight(this._margins))
        .setPosition(Margins.innerLeft(this._margins), Margins.innerTop(this._margins), zIndex);
      zIndex += 2;
    }
    label._primaryDOMNode
      .setAbsoluteSize(size[0] - Margins.innerWidth(this._margins), size[1] - Margins.innerHeight(this._margins))
      .setPosition(Margins.innerLeft(this._margins), Margins.innerTop(this._margins), zIndex);
  }

  /**
   * Text that is displayed in the label.
   *
   * @type {String}
   * @readonly
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
      this._setContent('<div>' + this._text + '</div>');
    }
  }
}

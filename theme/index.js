import {Color} from '../core';

class Theme {
  constructor() {
    this._color = new Color(this, '#00FF00');
    this._secondaryColor = new Color(this, '#00FFFF');
    this._darkColor = new Color(this, '#00CC00');
    this._textColor = new Color(this, '#888888');
    this._outlineColor = new Color(this, '#AAAAAA');
    this._neutralColor = new Color(this, '#888888');
  }

  init(theme) {
    this.defaults = theme.defaults;
    this.color = theme.color;
    this.secondaryColor = theme.secondaryColor;
    this.darkColor = theme.darkColor;
    this.textColor = theme.textColor;
    this.outlineColor = theme.outlineColor;
    this.neutralColor = theme.neutralColor;
    return this;
  }

  /**
   * Returns the primary theme color.
   *
   * Corresponds to the following platform colors:
   * |Platform|Color|
   * |--------|-----|
   * |iOS     |tintColor|
   * |Android |colorPrimary|
   */
  get color() {
    return this._color;
  }

  set color(color) {
    this._color.set(color);
  }

  get secondaryColor() {
    return this._secondaryColor;
  }

  set secondaryColor(color) {
    this._secondaryColor.set(color);
  }

  get darkColor() {
    return this._darkColor;
  }

  set darkColor(color) {
    this._darkColor.set(color);
  }

  get textColor() {
    return this._textColor;
  }

  set textColor(color) {
    this._textColor.set(color);
  }

  get outlineColor() {
    return this._outlineColor;
  }

  set outlineColor(color) {
    this._outlineColor.set(color);
  }

  get neutralColor() {
    return this._neutralColor;
  }

  set neutralColor(color) {
    this._neutralColor.set(color);
  }
}

window.__blingGlobalTheme = window.__blingGlobalTheme || new Theme();

export default window.__blingGlobalTheme;

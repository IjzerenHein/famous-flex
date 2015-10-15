import Theme from '..';

function layout(rect) {
  this._background.rect = rect;
  this._background.styles.backgroundColor = this._backgroundColor;
  if (this._borderRadius === 'auto') this._background.styles.borderRadius = Math.min(rect.width, rect.height) / 2;

  rect.subtract(this._padding).inFront();
  this._text.rect = rect;
}

function measure(rect) {
  rect.width = 200;
  rect.height = 44;
}

export default {
  layout: layout,
  measure: measure,
  color: Theme.color,
  backgroundColor: Theme.neutralColor,
  borderRadius: 4
};

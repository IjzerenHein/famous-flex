import Theme from '..';

function layout(rect) {
  this._background.rect = rect;
  this._background.style.backgroundColor = this._backgroundColor;
  if (this._borderRadius === 'auto') this._background.style.borderRadius = Math.min(rect.width, rect.height) / 2;

  if (this._label) {
    rect.subtract(this._padding).inFront();
    this._label.rect = rect;
  }
}

export default {
  layout: layout,
  size: [200, 44],
  color: '#FFFFFF',
  fontSize: 20,
  backgroundColor: Theme.color,
  borderRadius: 5
};

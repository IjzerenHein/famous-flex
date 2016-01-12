import Theme from '..';

function layout(rect) {
  this._background.rect = rect;
  this._background.style.backgroundColor = this._backgroundColor;
  if (this._borderRadius === 'auto') this._background.style.borderRadius = Math.min(rect.width, rect.height) / 2;

  rect.inFront();
  if (this._borderRadius === 'auto') this._inside.style.borderRadius = Math.min(rect.width, rect.height) / 2;
  rect.subtract(this._padding);
  rect.width = rect.width * Math.min(Math.max(this._particle.value, 0), 1);
  this._inside.rect = rect;
  this._inside.style.backgroundColor = this._color;
}

export default {
  layout: layout,
  color: Theme.color,
  backgroundColor: Theme.neutralColor,
  size: ['90%', 80],
  animation: {
    enabled: true
  },
  padding: 1,
  borderRadius: 'auto'
};

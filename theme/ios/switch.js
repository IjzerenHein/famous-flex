import Theme from '..';

function layout(rect, size) {
  this._background.rect = rect;
  this._background.styles.backgroundColor.interpolate(this.backgroundColor, this.color, this._checkedRatio);
  this._background.styles.borderColor.interpolate(this.borderColor, this.color, this._checkedRatio);

  rect.subtract(this._padding).inFront();
  const handleWidth = Math.min(rect.width, rect.height);
  rect.x += ((rect.width - handleWidth) * this._checkedRatio);
  rect.width = handleWidth;
  this._handle.rect = rect;
}

export default {
  layout: layout,
  intrinsicSize: [60, 35],
  animated: true,
  animationDuration: 300,
  animationCurve: 'inOutQuad',
  padding: 1,
  color: Theme.color,
  backgroundColor: '#FFFFFF',
  borderColor: Theme.outlineColor
};

//import defaults from './defaults';
import {interpolate} from '../../utils';

function layout(rect, size) {
  this._background.rect = rect;
  this._background.styles.backgroundColor = interpolate(this.backgroundColor, this.color, this._checkedRatio);
  this._background.styles.borderColor = interpolate(this.borderColor, this.color, this._checkedRatio);

  rect.subtract(this._padding).inFront();
  const handleWidth = Math.min(rect.width, rect.height);
  rect.x += ((rect.width - handleWidth) * this._checkedRatio);
  rect.width = handleWidth;
  this._handle.rect = rect;
}

export default {
  intrinsicSize: [60, 35],
  animation: {
    enabled: true,
    duration: 300,
    curve: 'inOutQuad'
  },
  padding: 1,
  color: '#3d59fd',
  backgroundColor: '#FFFFFF',
  borderColor: '#E8E8E8',
  layout: layout
};

import Button from './button';
import Switch from './switch';
import ProgressBar from './progressBar';
import Slider from './slider';

export default class IOSTheme {
}

IOSTheme.color = '#4dd164';
IOSTheme.secondaryColor = '#d14d64';
IOSTheme.outlineColor = '#E8E8E8';
IOSTheme.neutralColor = '#E8E8E8';
IOSTheme.defaults = {
  button: Button,
  switch: Switch,
  progressBar: ProgressBar,
  slider: Slider
};

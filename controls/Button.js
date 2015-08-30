import {View, Surface} from 'Famous';

export default class Button extends View {
  constructor(options) {
    super(options);
    this.surface = new Surface({
      classes: this.options.classes.concat(['btn', 'va']),
    });
    this.surface.on('click', () => {
      this._eventOutput.emit('click', this);
    });
    this.add(this.surface);
    this._updateView();
  }

  _updateView() {
    if (this.options.image) {
      this.surface.setContent('<img src="' + this.options.image + '" width=100% height=100%/>');
    } else if (this.options.icon && this.options.text) {
      this.surface.setContent('<div>TODO</div>');
    } else if (this.options.icon) {
      this.surface.setContent('<div><span class="icon icon-' + this.options.icon + '"></span></div>');
    } else {
      this.surface.setContent('<div>' + this.options.text + '</div>');
    }
  }

  get text() {
    return this.options.text;
  }

  set text(value) {
    this.setOptions({
      text: value,
    });
    this._updateView();
  }

  get icon() {
    return this.options.icon;
  }

  set icon(icon) {
    this.setOptions({
      icon: icon,
    });
    this._updateView();
  }

  get image() {
    return this.options.icon;
  }

  set image(image) {
    this.setOptions({
      image: image,
    });
    this._updateView();
  }

  get enabled() {
    return !this._disabled;
  }

  set enabled(enabled) {
    if (!enabled !== this._disabled) {
      this._disabled = !enabled;
      if (this._disabled) {
        this.surface.addClass('disabled');
      } else {
        this.surface.removeClass('disabled');
      }
    }
  }
}

Button.DEFAULT_OPTIONS = {
  classes: [],
  size: [60, 35],
};

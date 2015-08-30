import {InputSurface} from 'Famous';

export default class TextInput extends InputSurface {
  constructor(options) {
    super(options);
    if (options && options.autoFocus) {
      this.on('deploy', () => this.focus());
    }
  }

  get type() {
    return this._type;
  }

  get name() {
    return this.getName();
  }

  get value() {
    return this.getValue();
  }

  set value(value) {
    this.setValue(value);
  }

  get placeholder() {
    return this._placeholder;
  }

  set placeholder(value) {
    this.setPlaceholer(value);
  }

  get enabled() {
    return !this._disabled;
  }

  set enabled(enabled) {
    if (!enabled !== this._disabled) {
      this._disabled = !enabled;
      if (this._disabled) {
        this.setAttributes({disabled: true});
      } else {
        this.setAttributes({disabled: false});
        delete this.attributes.disabled;
        if (this._currentTarget) {
          this._currentTarget.removeAttribute('disabled');
        }
      }
    }
  }

  select() {
    if (this._currentTarget) {
      this._currentTarget.setSelectionRange(0, this.value.length);
    }
  }
}


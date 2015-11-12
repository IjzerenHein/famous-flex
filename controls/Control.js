import BaseNode from '../core/BaseNode';
import Padding from '../core/Padding';
import Animation from '../animation/Animation';
import Classes from '../core/Classes';
import Size from '../core/Size';
import Rect from '../core/Rect';

const defaults = {
  classes: ['ff-control']
};

export default class Control extends BaseNode {
  constructor(options) {
    super();
    this.setOptions(defaults, options);
  }

  onLayout() {
    if (!this._layoutRect) {
      this._layoutRect = new Rect();
      this._layoutRect.parent = new Rect();
    }
    const rect = this._layoutRect;
    rect.parent.width = this.rect.width;
    rect.parent.height = this.rect.height;
    rect.x = 0;
    rect.y = 0;
    rect.z = 0;
    rect.width = rect.parent.width;
    rect.height = rect.parent.height;
    const size = this.measure(rect);
    rect.width = size.width;
    rect.height = size.height;
    rect.center();
    this._layout(rect, this._layoutOptions);
  }

  requestLayout(immediate) {
    if (immediate) {
      this.onLayout();
    } else {
      this._updateLayout = this._updateLayout || this.registerUpdate(() => this.onLayout(), true);
      this._updateLayout.request();
    }
  }

  get layout() {
    return this._layout;
  }

  set layout(layout) {
    if (layout !== this._layout) {
      this._layout = layout;
      this.requestLayout();
    }
  }

  get layoutOptions() {
    return this._layoutOptions;
  }

  set layoutOptions(options) {
    if (this._layoutOptions !== options) {
      this._layoutOptions = options;
      this.requestLayout();
    }
  }

  measure(rect) {
    if (this._configuredSize) {
      return this._configuredSize.measure(rect);
    }
    return rect;
  }

  get size() {
    if (!this._configuredSize) {
      this._configuredSize = new Size(this);
      this._configuredSize.onChange = () => this.requestLayout();
    }
    return this._configuredSize;
  }

  set size(value) {
    this.size.set(value);
  }

  get padding() {
    this._padding = this._padding || Padding.identity;
    return this._padding;
  }

  set padding(padding) {
    this._padding = this._padding || Padding.identity;
    if (!Animation.collect(this, 'padding', Padding.parse(padding))) {
      this._padding = Padding.parse(padding);
      this.requestLayout();
    }
  }

  onClasses(add, remove) {
    const children = this.getChildren();
    const sharedClassesChildren = this._sharedClassesChildren;
    if (add) {
      for (let i = 0; i < children.length; i++) {
        if (children[i].classes) {
          children[i].classes.add(add);
        }
      }
      if (sharedClassesChildren) {
        for (let i = 0; i < sharedClassesChildren.length; i++) {
          if (sharedClassesChildren[i].classes) {
            sharedClassesChildren[i].classes.add(add);
          }
        }
      }
    }
    if (remove) {
      for (let i = 0; i < children.length; i++) {
        if (children[i].classes) {
          children[i].classes.remove(remove);
        }
      }
      if (sharedClassesChildren) {
        for (let i = 0; i < sharedClassesChildren.length; i++) {
          if (sharedClassesChildren[i].classes) {
            sharedClassesChildren[i].classes.remove(remove);
          }
        }
      }
    }
  }

  get classes() {
    this._classes = this._classes || new Classes(this);
    return this._classes;
  }

  set classes(values) {
    this.classes.add(values);
  }

  addChild(child) {
    super.addChild(child);
    if (this._classes && child.classes) {
      for (let i = 0; i < this._classes.length; i++) {
        child.classes.add(this._classes.getAt(i));
      }
    }
    this.requestLayout();
    return child;
  }

  removeChild(child, migrateToSharedClasses) {
    if (migrateToSharedClasses) {
      this._sharedClassesChildren = this._sharedClassesChildren || [];
      this._sharedClassesChildren.push(child);
    } else if (this._classes && child.classes) {
      for (let i = 0; i < this._classes.length; i++) {
        child.classes.remove(this._classes.getAt(i));
      }
    }
    return super.removeChild(child);
  }

  addSharedClassesChild(child) {
    this._sharedClassesChildren = this._sharedClassesChildren || [];
    this._sharedClassesChildren.push(child);
    if (this._classes && child.classes) {
      for (let i = 0; i < this._classes.length; i++) {
        child.classes.add(this._classes.getAt(i));
      }
    }
    return child;
  }

  removeSharedClassesChild(child) {
    if (this._classes && child.classes) {
      for (let i = 0; i < this._classes.length; i++) {
        child.classes.remove(this._classes.getAt(i));
      }
    }
    let i = this._sharedClassesChildren.indexOf(child);
    if (i >= 0) {
      this._sharedClassesChildren.splice(i, 1);
    }
    return child;
  }
}

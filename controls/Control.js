import BaseNode from '../core/BaseNode';
import Animation from '../animation/Animation';
import Classes from '../core/Classes';
import Rect from '../core/Rect';
import Size from '../core/Size';
import Margins from '../core/Margins';
import Alignment from '../core/Alignment';

const defaults = {
  classes: ['ff-control'],
  alignment: [0.5, 0.5]
};

export default class Control extends BaseNode {
  constructor(options) {
    super();
    this._layoutRect = new Rect();
    this._layoutRect.parent = this.rect;
    this._updateLayout = this.registerUpdate(() => this.requestLayout(true), true);
    const onChange = () => this.requestLayout();
    this._configuredSize = new Size(this);
    this._configuredSize.onChange = onChange;
    this._alignment = new Alignment();
    this._alignment.onChange = onChange;
    this.setOptions(defaults, options);
  }

  onLayout(rect) {
    const size = this.measure(rect);
    rect.width = size.width;
    rect.height = size.height;
    rect.align(this._alignment);
    this._layout(rect);
  }

  onMeasure(rect) {
    return this._configuredSize.measure(rect);
  }

  requestLayout(immediate) {
    if (immediate) {
      const rect = this._layoutRect;
      rect.x = 0;
      rect.y = 0;
      rect.z = 0;
      rect.width = rect.parent.width;
      rect.height = rect.parent.height;
      this.onLayout(rect);
    } else {
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

  measure(rect) {
    return this.onMeasure(rect);
  }

  get size() {
    return this._configuredSize;
  }

  set size(value) {
    this._configuredSize.set(value);
  }

  get alignment() {
    return this._alignment;
  }

  set alignment(value) {
    this._alignment.set(value);
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

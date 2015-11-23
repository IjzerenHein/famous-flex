import {assert} from '../utils';

export default class LayoutContext {
  constructor(node, nodes) {
    this._node = node;
    this._nodes = nodes;
    this.size = [0, 0];
  }

  _prepareForLayout(rect, offset, options) {
    this.length = this._nodes.length;
    this.rect = rect;
    this.offset = offset;
    this.direction = options.direction;
    this.alignment = options.alignment;
    this._prevIndex = this._nodes.index;
    this._nextIndex = this._prevIndex;

    // oldskool
    this.size[0] = rect.parent.width;
    this.size[1] = rect.parent.height;
    if (offset && (options.direction !== undefined)) {
      this.scrollOffset = options.direction ? offset.y : offset.x;
      this.scrollStart = options.direction ? rect.y : rect.x;
      this.scrollEnd = options.direction ? (rect.y + rect.height) : (rect.x + rect.width);
    }
  }

  set(node, spec) {
    if ((node instanceof String) || (typeof node === 'string')) {
      node = nodes.getById(node);
    }
    if (node) {
      if (spec.opacity !== undefined) node.opacity = node.opacity;
      if (spec.translate) {
        node.rect.x = spec.translate[0];
        node.rect.y = spec.translate[1];
        node.rect.z = spec.translate[2];
      }
      if (spec.size) {
        node.rect.width = spec.size[0];
        node.rect.height = spec.size[1];
      }
      if (spec.rotate) {
        node.rotation.x = spec.rotate[0];
        node.rotation.y = spec.rotate[1];
        node.rotation.z = spec.rotate[2];
      }
      if (spec.scale) {
        node.scale.x = spec.scale[0];
        node.scale.y = spec.scale[1];
        node.scale.z = spec.scale[2];
      }
      if (spec.origin) {
        node.origin.x = spec.origin[0];
        node.origin.y = spec.origin[1];
      }
    }
    return spec;
  }

  next() {
    // TODO ALIGN
    return (this._nextIndex < this.length) ? this._nodes.getAt(this._nextIndex++) : undefined;
  }

  prev() {
    // TODO ALIGN
    return (this._prevIndex > 0) ? this._nodes.getAt(--this._prevIndex) : undefined;
  }

  get nodes() {
    return this._nodes;
  }
}

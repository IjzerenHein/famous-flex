import Control from '../controls/Control';
import ImageNode from '../controls/ImageNode';
import ShowNode from '../core/ShowNode';
import ContainerNode from '../core/ContainerNode';
import Rect from '../core/Rect';
import {assert} from '../utils';

function tilesLayout(rect) {

  const contentRect = this._contentRect;
  const size = this.measure(rect);
  contentRect.x = rect.x;
  contentRect.y = rect.y;
  contentRect.with = size.width;
  contentRect.height = size.height;
  contentRect.center();
  contentRect.inFront();
  this._image.rect = contentRect;

  const tileRect = this._tileRect;
  tileRect.width = contentRect.width;
  tileRect.height = contentRect.height;

  const rows = this._cells[1];
  const cols = this._cells[0];
  rect.width = rect.parent.width / cols;
  rect.height = rect.parent.height / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = this._tiles[(row * cols) + col];
      rect.x = col * rect.width;
      rect.y = row * rect.height;
      tile.rect = rect;
      tileRect.x = contentRect.x - rect.x;
      tileRect.y = contentRect.y - rect.y;
      tile.contentRect = tileRect;
    }
  }
}

class Tile extends ContainerNode {
  constructor() {
    super({styles: {overflow: 'hidden'}});

    this.rect.debug = true;

    console.log('reg');
    this.registerUpdate(() => {
      console.log('heuj');
      this._showNode.rect.width = this.rect.width;
      this._showNode.rect.height = this.rect.height;
    }, true);

    this._showNode = new ShowNode({
      origin: [0.5, 0.5]
    });
    this._showNode.rect.debug = true;
    this._showNode.rect.width = this.rect.width;
    this._showNode.rect.height = this.rect.height;

    this._content1 = new ImageNode();
    this._container1 = new ContainerNode({styles: {overflow: 'hidden'}});
    this._container1.addChild(this._content1);

    this._content2 = new ImageNode();
    this._container2 = new ContainerNode({styles: {overflow: 'hidden'}});
    this._container2.addChild(this._content2);
  }

  get visible() {
    return this._visible;
  }

  set visible(value) {
    if (this._visible !== value) {
      this._visible = value;
      if (this._visible) {
        this.addChild(this._showNode);
      } else {
        this.removeChild(this._showNode);
      }
    }
  }

  setSource(value) {
    if (this._activeContent === this._content1) {
      this._activeContent = this._content2;
      this._activeContent.rect = this._content1.rect;
      this._activeContainer = this._container2;
    } else {
      this._activeContent = this._content1;
      this._activeContent.rect = this._content2.rect;
      this._activeContainer = this._container1;
    }
    this._activeContent.src = value;
    return this._showNode.show(this._activeContainer);
  }

  get contentRect() {
    return this._activeContent ? this._activeContent.rect : undefined;
  }

  set contentRect(value) {
    if (this._activeContent) {
      this._activeContent.rect = value;
    }
  }

  get animation() {
    return this._showNode.animation;
  }

  set animation(value) {
    this._showNode.animation.setOptions(value);
  }
}

const defaults = {
  layout: tilesLayout,
  //cells: [5, 5],
  size: 'cover',
  animation: {
    effect: 'slideLeftUp',
    duration: 6000
  }
};

export default class ImageTileView extends Control {
  constructor(options) {
    super();
    this._contentRect = new Rect();
    this._tileRect = new Rect();
    this._image = this.addChild(new ImageNode());
    this._imageObj = new Image();
    this._imageObj.onload = () => this.onLoadImage();
    this._cells = [1, 1];
    this._tiles = [this.addChild(new Tile())];
    this.setOptions(defaults, options);
  }

  on(event, callback) {
    return this._image.on(event, callback);
  }

  onLoadImage() {
    console.log('image loaded');
    if (!this._initial) {
      this._image.opacity = 0;
      this._image.src = this._src;
    }
    const promises = [];
    for (let i = 0; i < this._tiles.length; i++) {
      promises.push(this._tiles[i].setSource(this._src));
    }
    if (!this._initial) {
      Promise.all(promises).then(() => {
        this._image.opacity = 1;
        this.debounce(() => this._showTiles(false), 10);
      });
    }
    this.requestLayout();
  }

  get cells() {
    return this._cells;
  }

  set cells(value) {
    if ((this._cells[0] !== value[0]) ||
        (this._cells[1] !== value[1])) {
      this._cells[0] = value[0];
      this._cells[1] = value[1];
      const count = this._cells[0] * this.cells[1];
      assert(count > 1, 'number of cells must be larger than 0');
      while (count > this._tiles.length) {
        const tile = this.addChild(new Tile());
        tile.animation = this.animation;
        this._tiles.push(tile);
      }
      while (count < this._tiles.length) {
        const tile = this._tiles.pop();
        if (tile.getParent()) this.removeChild(tile);
      }
    }
  }

  _showTiles(show) {
    for (let i = 0; i < this._tiles.length; i++) {
      const tile = this._tiles[i];
      tile.visible = show;
    }
    this.requestLayout();
  }

  get src() {
    return this._src;
  }

  set src(value) {
    if (this._src !== value) {
      this._initial = !this._src;
      this._src = value;
      this._imageObj.src = this._src;
      if (this._initial) {
        this._image.src = this._src;
      } else {
        this._showTiles(true);
      }
      this.requestLayout();
    }
  }

  get animation() {
    return this._tiles[0].animation;
  }

  set animation(value) {
    for (let i = 0; i < this._tiles.length; i++) {
      this._tiles[i].animation = value;
    }
  }

  get size() {
    return super.size;
  }

  set size(value) {
    super.size = value;
    this.requestLayout();
  }

  measure(rect) {
    if (this._configuredSize) {
      return this._configuredSize.measure(rect, this._imageObj);
    }
    return rect;
  }
}

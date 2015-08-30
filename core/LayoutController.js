/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import {Node} from 'famous/core';
import ObjectDataSource from './ObjectDataSource';
import ArrayDataSource from './ArrayDataSource';
import LayoutNode from './LayoutNode';

/**
 * LayoutController
 *
 * @class
 */
export default class LayoutController extends Node {
    constructor(options) {
      super(options);

      this._nodes = {}; // all nodes
      this._layoutOptions = {};
      this._data = {
        source: undefined,
        nodes: {}, // nodes that are in the dataSource
        insertOffFn: undefined,
        removeOffFn: undefined,
      };

      this._comp = this.addComponent({
        onUpdate: () => this._updateLayout(),
        onSizeChange: () => this._updateLayout()
      });
      if (options) {
        if (options.layout) {
          this.layout = options.layout;
        }
        if (options.layoutOptions) {
          this.layoutOptions = options.layoutOptions;
        }
        if (options.dataSource) {
          this.dataSource = options.dataSource;
        }
      }
    }

    createDataSource(data) {
      return Array.isArray(data) ? new ArrayDataSource(data) : new ObjectDataSource(data);
    }

    reflowLayout() {
      this.requestUpdate(this._comp);
    }

    get layout() {
      return this._layout;
    }

    set layout(layout) {
      if (this._layout !== layout) {
        this._layout = layout;
        this.reflowLayout();
      }
    }

    get layoutOptions() {
      return this._layoutOptions;
    }

    set layoutOptions(layoutOptions) {
      this._layoutOptions = layoutOptions;
      this.reflowLayout();
    }

    get dataSource() {
      return this._data.source;
    }

    set dataSource(dataSource) {
      if (this._data.source === dataSource) {
        return;
      }

      if (Array.isArray(dataSource)) {
        dataSource = new ArrayDataSource(dataSource);
      } else if (!(dataSource instanceof ArrayDataSource) &&
          !(dataSource instanceof ObjectDataSource)) {
        dataSource = new ObjectDataSource(dataSource);
      }

      if (this._data.insertOffFn) {
        this._data.insertOffFn();
        this._data.insertOffFn = undefined;
      }

      if (this._data.removeOffFn) {
        this._data.removeOffFn();
        this._data.removeOffFn = undefined;
      }

      this._data.source = dataSource;
      this.data = this._data.source;
      for (id in this._data.nodes) {
        this._data.nodes[id].inDataSource = false;
      }

      if (this._data.source) {
        this._data.insertOffFn = this._data.source.on('insert', this._insert.bind(this));
        this._data.removeOffFn = this._data.source.on('remove', this._remove.bind(this));
        this._data.source.forEach((node, id) => {
          this._nodes[id] = this._nodes[id] || new LayoutNode();
          this._nodes[id].setNode(node);
          this._nodes[id].inDataSource = true;
          this._data.nodes[id] = this._nodes[id];
        });
      }

      var id;
      for (id in this._data.nodes) {
        if (!this._data.nodes[id].inDataSource) {
          delete this._data.nodes[id];
        }
      }

      this.reflowLayout();
    }

    _updateLayout() {
      var id;
      var node;
      for (id in this._nodes) {
        this._nodes[id].reset(true);
      }

      if (this._layout) {
        this._layout(this._data.nodes, this.getSize(), this._layoutOptions);
      }

      for (id in this._nodes) {
        node = this._nodes[id];
        node.reset(false);
        if (!node.inLayout && node.inSceneGraph) {
          this.removeChild(node.node);
          if (!node.inDataSource) {
            delete this._nodes[id];
            delete this._data.nodes[id];
          }
        } else if (node.inLayout && !node.inSceneGraph) {
          node.inSceneGraph = true;
          this.addChild(node.node);
        }
      }
    }

    _insert(id) {
      this._nodes[id] = this._nodes[id] || new LayoutNode();
      this._nodes[id].setNode(this._data.source.get(id));
      this._nodes[id].inDataSource = true;
      this._data.nodes[id] = this._nodes[id];
      this.reflowLayout();
    }

    _remove(id) {
      this._nodes[id].inDataSource = false;
      delete this._data.nodes[id];
      this.reflowLayout();
    }
}

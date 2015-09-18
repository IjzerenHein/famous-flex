/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import LayoutNode from './LayoutNode';

/**
 * LayoutNode
 *
 * Purpose of layout-nodes:
 * - Flow-animations between layouts (physics particle between diffs)
 * - ScrollLength
 *
 * @class
 * @constructor
 */
export default class LayoutNodeManager {
    constructor() {
      this.nodes = {};
    }

    _insertFromDataSource(node, id) {
      if (!this.nodes[id]) {
        this.nodes[id] = new LayoutNode();
        this.nodes[id].setNode(node);
      }
    }

    _removeFromDataSource(node, id) {
      delete this.nodes[id];
    }

    setDataSource(dataSource) {
      if (this._dataSourceInsert) {
        this._dataSourceInsert();
        this._dataSourceInsert = undefined;
      }

      if (this._dataSourceRemove) {
        this._dataSourceRemove();
        this._dataSourceRemove = undefined;
      }

      this.dataSource = dataSource;
      if (this.dataSource) {
        this._dataSourceInsert = this.dataSource.on('insert', _insertFromDataSource.bind(this));
        this._dataSourceRemove = this.dataSource.on('remove', _removeFromDataSource.bind(this));
        this.dataSource.forEach(function(node, id) {
          //this.addChild(node);
        }.bind(this));
      }

      this.reflowLayout();
    };

    getDataSource() {
      return this.dataSource;
    }
}

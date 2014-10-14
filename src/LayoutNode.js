/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define*/
/*eslint no-use-before-define:0 */

/**
 * Internal LayoutNode class used by `LayoutController`.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Transform = require('famous/core/Transform');
    var LayoutUtility = require('./LayoutUtility');

    /**
     * @class
     * @param {Object} renderNode Render-node which this layout-node represents
     * @alias module:LayoutNode
     */
    function LayoutNode(renderNode, spec) {
        this.renderNode = renderNode;
        this._spec = spec ? LayoutUtility.cloneSpec(spec) : {};
        this._spec.renderNode = renderNode; // also store in spec
        this._invalidated = false;
        this._removing = false;
        //this.scrollLength = undefined;
        //this.trueSizeRequested = false;
    }

    /**
     * Called when the node is destroyed
     */
    LayoutNode.prototype.destroy = function() {
        // override to implement
    };

    /**
     * Reset the end-state. This function is called on all layout-nodes prior to
     * calling the layout-function. So that the layout-function starts with a clean slate.
     */
    LayoutNode.prototype.reset = function() {
        this._invalidated = false;
        this.trueSizeRequested = false;
    };

    /**
     * Set the spec of the node
     *
     * @param {Object} spec
     */
    LayoutNode.prototype.setSpec = function(spec) {
        this._spec.align = spec.align;
        this._spec.origin = spec.origin;
        this._spec.size = spec.size;
        this._spec.transform = spec.transform;
        this._spec.opacity = spec.opacity;
    };

    /**
     * Set the content of the node
     *
     * @param {Object} set
     */
    LayoutNode.prototype.set = function(set, size) {
        this._invalidated = true;
        this._removing = false;
        var spec = this._spec;
        spec.opacity = set.opacity;
        spec.size = set.size;
        spec.origin = set.origin;
        spec.align = set.align;
        if (set.translate || set.skew || set.rotate || set.scale) {
            this._spec.transform = Transform.build({
                translate: set.translate || [0, 0, 0],
                skew: set.skew || [0, 0, 0],
                scale: set.scale || [1, 1, 1],
                rotate: set.rotate || [0, 0, 0]
            });
        }
        else {
            this._spec.transform = undefined;
        }
        this.scrollLength = set.scrollLength;
    };

    /**
     * Creates the render-spec
     */
    LayoutNode.prototype.getSpec = function() {
        return this._invalidated ? this._spec : undefined;
    };

    /**
     * Marks the node for removal
     */
    LayoutNode.prototype.remove = function(removeSpec) {
        this._removing = true;
    };

    module.exports = LayoutNode;
});

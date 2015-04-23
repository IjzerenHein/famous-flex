/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

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
        this._specModified = true;
        this._invalidated = false;
        this._removing = false;
        //this.scrollLength = undefined;
        //this.trueSizeRequested = false;
    }

    /**
     * Called to update the underlying render-node
     */
    LayoutNode.prototype.setRenderNode = function(renderNode) {
        this.renderNode = renderNode;
        this._spec.renderNode = renderNode;
    };

    /**
     * Called to update the options for the node
     */
    LayoutNode.prototype.setOptions = function(options) {
        // override to implement
    };

    /**
     * Called when the node is destroyed
     */
    LayoutNode.prototype.destroy = function() {
        this.renderNode = undefined;
        this._spec.renderNode = undefined;
        this._viewSequence = undefined;
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
        this._specModified = true;
        if (spec.align) {
            if (!spec.align) {
                this._spec.align = [0, 0];
            }
            this._spec.align[0] = spec.align[0];
            this._spec.align[1] = spec.align[1];
        }
        else {
            this._spec.align = undefined;
        }
        if (spec.origin) {
            if (!spec.origin) {
                this._spec.origin = [0, 0];
            }
            this._spec.origin[0] = spec.origin[0];
            this._spec.origin[1] = spec.origin[1];
        }
        else {
            this._spec.origin = undefined;
        }
        if (spec.size) {
            if (!spec.size) {
                this._spec.size = [0, 0];
            }
            this._spec.size[0] = spec.size[0];
            this._spec.size[1] = spec.size[1];
        }
        else {
            this._spec.size = undefined;
        }
        if (spec.transform) {
            if (!spec.transform) {
                this._spec.transform = spec.transform.slice(0);
            }
            else {
                for (var i = 0; i < 16; i++) {
                    this._spec.transform[i] = spec.transform[i];
                }
            }
        }
        else {
            this._spec.transform = undefined;
        }
        this._spec.opacity = spec.opacity;
    };

    /**
     * Set the content of the node
     *
     * @param {Object} set
     */
    LayoutNode.prototype.set = function(set, size) {
        this._invalidated = true;
        this._specModified = true;
        this._removing = false;
        var spec = this._spec;
        spec.opacity = set.opacity;
        if (set.size) {
            if (!spec.size) {
                spec.size = [0, 0];
            }
            spec.size[0] = set.size[0];
            spec.size[1] = set.size[1];
        }
        else {
            spec.size = undefined;
        }
        if (set.origin) {
            if (!spec.origin) {
                spec.origin = [0, 0];
            }
            spec.origin[0] = set.origin[0];
            spec.origin[1] = set.origin[1];
        }
        else {
            spec.origin = undefined;
        }
        if (set.align) {
            if (!spec.align) {
                spec.align = [0, 0];
            }
            spec.align[0] = set.align[0];
            spec.align[1] = set.align[1];
        }
        else {
            spec.align = undefined;
        }

        if (set.skew || set.rotate || set.scale) {
            this._spec.transform = Transform.build({
                translate: set.translate || [0, 0, 0],
                skew: set.skew || [0, 0, 0],
                scale: set.scale || [1, 1, 1],
                rotate: set.rotate || [0, 0, 0]
            });
        }
        else if (set.translate) {
            this._spec.transform = Transform.translate(set.translate[0], set.translate[1], set.translate[2]);
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
        this._specModified = false;
        this._spec.removed = !this._invalidated;
        return this._spec;
    };

    /**
     * Marks the node for removal
     */
    LayoutNode.prototype.remove = function(removeSpec) {
        this._removing = true;
    };

    module.exports = LayoutNode;
});

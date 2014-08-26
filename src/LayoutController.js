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
 * TODO
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var BaseLayoutController = require('./BaseLayoutController');
    var Transform = require('famous/core/Transform');
    var LayoutNodesContext = require('./LayoutNodesContext');

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:LayoutController
     */
    function LayoutController(options) {
        BaseLayoutController.apply(this, arguments);
        this._layoutNodesContext = new LayoutNodesContext({
            byId: _getSpecIdByNodeId.bind(this),
            next: _getNextSpecId.bind(this),
            byArrayElement: _getSpecIdByArrayElement.bind(this),
            getData: _getRenderNodeSpecById.bind(this),
            set: _setSpecById.bind(this)
        });
    }
    LayoutController.prototype = Object.create(BaseLayoutController.prototype);
    LayoutController.prototype.constructor = LayoutController;

    /**
     * Re-flows the layout based on the given size
     */
    LayoutController.prototype._reflowLayout = function(size) {

        // Prepare context
        this._specMapSeed = '__' + Math.round(Math.random() * 10000); // generate a fresh seed for a opaque spec-id
        this._specMapNextId = 0;
        this._specMap = {};
        this._specResult = [];
        this._currentSequence = this._viewSequence;

        // Layout objects
        this._layout(size, this._layoutNodesContext, this._layoutOptions);

        // Return result
        return this._specResult;
    };

    /**
     * Get the next spec-id in the view-sequence
     */
    function _getNextSpecId() {

        // Get the next node from the sequence
        if (!this._currentSequence) {
            return undefined;
        }
        var renderNode = this._currentSequence.get();
        if (!renderNode) {
            return undefined;
        }
        this._currentSequence = this._currentSequence.getNext();
        var specId = this._specMapSeed + 'seq' + this._specMapNextId++;
        this._specMap[specId] = {
            renderNode: renderNode
        };
        return specId;
    }

    /**
     * Get the spec-id for a node-id
     */
    function _getSpecIdByNodeId(nodeId) {

        // This function is only possible when the nodes were provided based on id
        if (!this._nodesById) {
            return undefined;
        }
        var renderNode = this._nodesById[nodeId];
        if (!renderNode) {
            return undefined;
        }
        if (renderNode instanceof Array) {
            return renderNode;
        }
        var specId = this._specMapSeed + 'id' + nodeId;
        if (!this._specMap[specId]) {
            this._specMap[specId] = {
                renderNode: renderNode
            };
        }
        return specId;
    }

    /**
     * Get the spec-id for an array element
     */
    function _getSpecIdByArrayElement(arrayElement) {
        for (var n in this._specMap) {
            var spec = this._specMap[n];
            if (spec.renderNode === arrayElement) {
                return n;
            }
        }
        var specId = this._specMapSeed + 'elm' + this._specMapNextId++;
        this._specMap[specId] = {
            renderNode: arrayElement
        };
        return specId;
    }

    /**
     * Get the spec for a spec-id
     */
    function _getRenderNodeSpecById(specId) {
        if (!specId) {
            return undefined;
        }
        var spec = this._specMap[specId];
        return spec ? spec.renderNode : undefined;
    }

    /**
     * Get the spec for a spec-id
     */
    function _getSpecById(specId) {
        if (!specId) {
            return undefined;
        }
        var spec = this._specMap[specId];
        if (!spec) {
            // try lookup by node-id
            spec = this._specMap[_getSpecIdByNodeId.call(this, specId)];
            if (!spec) {
                return undefined;
            }
        }
        if (!spec.init) {
            this._specResult.push(spec);
            spec.init = true;
        }
        return spec;
    }

    function _setSpecById(node, set) {
        var spec = _getSpecById.call(this, node);
        if (!spec) {
            return;
        }
        if (set.size) {
            spec.size = set.size;
        }
        if (set.origin) {
            spec.origin = set.origin;
        }
        if (set.align) {
            spec.align = set.align;
        }
        if (set.translate) {
            var xyz = set.translate;
            if (!spec.transform) {
                spec.transform = Transform.translate(xyz[0], xyz[1], xyz[2]);
            }
            else {
                spec.transform[12] = xyz[0];
                spec.transform[13] = xyz[1];
                spec.transform[14] = xyz[2];
            }
        }
        // todo skew, scale, rotate
    }

    module.exports = LayoutController;
});

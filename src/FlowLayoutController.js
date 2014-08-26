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
    var OptionsManager = require('famous/core/OptionsManager');
    var ViewSequence = require('famous/core/ViewSequence');
    var LayoutNode = require('./FlowLayoutNode');
    var LayoutNodesContext = require('./LayoutNodesContext');
    var LayoutUtility = require('./LayoutUtility');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:FlowLayoutController
     */
    function FlowLayoutController(options) {
        BaseLayoutController.apply(this, arguments);

        // Set options
        this.options = Object.create(FlowLayoutController.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) {
            this.setOptions(options);
        }

        // Layout-context
        this._layoutContext = new LayoutNodesContext({
            next: _getNextLayoutNode.bind(this),
            byId: _getLayoutNodeById.bind(this),
            byArrayElement: _getCreateAndOrderLayoutNodes.bind(this),
            set: _setLayoutNode.bind(this),
            getData: _getLayoutNodeData.bind(this)
        });

        // Physics
        var mainPE = new PhysicsEngine();
        this._physicsEngines = {
            opacity: mainPE,
            size: mainPE,
            align: mainPE,
            origin: mainPE,
            rotate: mainPE,
            skew: mainPE,
            scale: mainPE,
            translate: new PhysicsEngine()
        };
    }
    FlowLayoutController.prototype = Object.create(BaseLayoutController.prototype);
    FlowLayoutController.prototype.constructor = FlowLayoutController;

    FlowLayoutController.DEFAULT_OPTIONS = {
        showOpacity: 1,
        insertSpec: {
            opacity: 0,
            size: undefined,
            transform: undefined,
            origin: undefined,
            align: undefined
        },
        removeSpec: {
            opacity: 0,
            size: undefined,
            transform: undefined,
            origin: undefined,
            align: undefined
        }
    };

    /**
     * Patches the FlowLayoutController instance's options with the passed-in ones.
     *
     * @method setOptions
     * @param {Options} options An object of configurable options for the FlowLayoutController instance.
     */
    FlowLayoutController.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    /**
     * Inserts a renderable into the data-source.
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @param {Object} renderable Rendeable to add to the data-source
     * @param {Object} [insertSpec] Spec (size, transform, etc..) to start with when inserting
     * @return {FlowLayoutController} this
     */
    FlowLayoutController.prototype.insert = function(indexOrId, renderable, insertSpec) {

        // Add the renderable in case of an id (String)
        if (indexOrId instanceof String) {

            // Create data-source if neccesary
            if (this._dataSource === undefined) {
                this._dataSource = {};
                this._nodesById = this._dataSource._dataSource;
            }

            // Insert renderable
            this._nodesById[indexOrId] = renderable;
        }

        // Add the renderable using an index
        else {

            // Create data-source if neccesary
            if (this._dataSource === undefined) {
                this._dataSource = [];
                this._viewSequence = new ViewSequence(this._dataSource);
            }

            // Using insert in this way, only works when the data-source is an array
            if (!(this._dataSource instanceof Array)) {
                return LayoutUtility.error('FlowLayoutController.insert(index) only works when the dataSource is an array');
            }

            // Insert into array
            if (indexOrId < 0) {
                this._dataSource.push(renderable);
            }
            else {
                this._dataSource.splice(indexOrId, 0, renderable);
            }
        }

        // When a custom insert-spec was specified, store that in the layout-node
        if (insertSpec) {
            var layoutNode = new LayoutNode(this._physicsEngines, renderable, insertSpec || this.options.insertSpec);
            if (this.options.showOpacity !== undefined) {
               layoutNode._set({opacity: this.options.showOpacity});
           }
            layoutNode._next = this._firstLayoutNode;
            this._firstLayoutNode = layoutNode;
        }

        // Force a reflow
        this._isDirty = true;

        return this;
    };

    /**
     * Removes a renderable from the data-source. If the renderable is visible
     * then it will be removed using an animation (see removeSpec).
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @param {Object} [removeSpec] Spec (size, transform, etc..) to end with when removing
     * @return {FlowLayoutController} this
     */
    FlowLayoutController.prototype.remove = function(indexOrId, removeSpec) {

        // Remove the renderable in case of an id (String)
        var renderNode;
        if (indexOrId instanceof String) {

            // Find and remove renderable from data-source
            renderNode = this._nodesById[indexOrId];
            if (renderNode) {
                delete this._nodesById[indexOrId];
            }
        }

        // Remove the renderable using an index
        else {

            // Using remove in this way, only works when the data-source is an array
            if (!(this._dataSource instanceof Array)) {
                return LayoutUtility.error('FlowLayoutController.remove(index) only works when the dataSource is an array');
            }

            // Remove from array
            renderNode = this._dataSource.splice(indexOrId, 1)[0];
        }

        // When a custom remove-spec was specified, store that in the layout-node
        if (renderNode && removeSpec) {
            var layoutNode = _getLayoutNode.call(this, renderNode);
            if (layoutNode) {
                layoutNode._remove(removeSpec || this.options.removeSpec);
            }
        }

        // Force a reflow
        if (renderNode) {
            this._isDirty = true;
        }

        return this;
    };

    // Update commit-output
    function _getCommitResult() {
        var result = [];
        var layoutNode = this._firstLayoutNode;
        var prevLayoutNode;
        while (layoutNode) {
            var spec = layoutNode._buildSpec();
            if (!spec) {
                var destroyLayoutNode = layoutNode;
                layoutNode = layoutNode._next;
                if (prevLayoutNode) {
                    prevLayoutNode._next = layoutNode;
                }
                else {
                    this._firstLayoutNode = layoutNode;
                }
                destroyLayoutNode._destroy();
            }
            else {
                spec.target = layoutNode._renderNode.render();
                result.push(spec);
                prevLayoutNode = layoutNode;
                layoutNode = layoutNode._next;
            }
        }
        return result;
    }

    /**
     * Re-flows the layout based on the given size
     *
     * @param {Array.Number} size Size to calculate the layout for
     */
    FlowLayoutController.prototype._reflowLayout = function(size) {

        // Reset all layout-nodes
        var layoutNode = this._firstLayoutNode;
        while (layoutNode) {
            layoutNode._reset();
            layoutNode = layoutNode._next;
        }

        // Prepare context
        this._currentSequence = this._viewSequence;
        this._prevLayoutNode = undefined;
        this._currentLayoutNode = this._firstLayoutNode;

        // Layout objects
        this._layout(size, this._layoutContext, this._layoutOptions);

        // Check whether any nodes are no longer rendered. In that case
        // mark them as removing and set the removeSpec
        layoutNode = this._firstLayoutNode;
        while (layoutNode) {
            if (!layoutNode._invalidated) {
                layoutNode._remove(this.options.removeSpec);
            }
            layoutNode = layoutNode._next;
        }

        // Return result function that is executed during every commit
        return _getCommitResult.bind(this);
    };

    /**
     * Get the layout-node for a given render-node. When no layout-node exists
     * a new one is created. This function is optimized to return almost
     * immediately when the layout-function requests the layout-nodes in the
     * same order. When the layout-nodes are requested in a new/difference
     * order, then the layout-nodes are re-arragned in that new order so that
     * they can be accessed efficiently the next time the layout is reflowed.
     *
     * @param {Object} renderNode render-node for which to lookup the layout-node
     * @return {FlowLayoutNode} layout-node
     */
    function _getCreateAndOrderLayoutNodes(renderNode) {

        // Optimized path. If the next current layout-node matches the renderNode
        // return that immediately.
        if (this._currentLayoutNode && (this._currentLayoutNode._renderNode === renderNode)) {
            this._prevLayoutNode = this._currentLayoutNode;
            this._currentLayoutNode = this._currentLayoutNode._next;
            return this._prevLayoutNode;
        }

        // Look for a layout-node with this render-node
        var layoutNode = this._currentLayoutNode;
        var prevLayoutNode = this._prevLayoutNode;
        while (layoutNode) {
            if (layoutNode._renderNode === renderNode) {

                // Remove from old position in linked-list
                if (prevLayoutNode) {
                    prevLayoutNode._next = layoutNode._next;
                }

                // Insert before current
                layoutNode._next = this._currentLayoutNode;
                if (this._prevLayoutNode) {
                    this._prevLayoutNode._next = layoutNode;
                }
                else {
                    this._firstLayoutNode = layoutNode;
                }
                this._prevLayoutNode = layoutNode;
                return layoutNode;
            }
            prevLayoutNode = layoutNode;
            layoutNode = layoutNode._next;
        }

        // No layout-node found, create new one
        layoutNode = new LayoutNode(this._physicsEngines, renderNode, this.options.insertSpec);
        if (this.options.showOpacity !== undefined) {
            layoutNode._set({opacity: this.options.showOpacity});
        }
        layoutNode._next = this._currentLayoutNode;
        if (this._prevLayoutNode) {
            this._prevLayoutNode._next = layoutNode;
        }
        else {
            this._firstLayoutNode = layoutNode;
        }
        this._prevLayoutNode = layoutNode;
        return layoutNode;
    }

    /**
     * Get the next layout-node
     *
     * @return {FlowLayoutNode} next layout-node or undefined
     */
    function _getNextLayoutNode() {

        // Get the next node from the sequence
        if (!this._currentSequence) {
            return undefined;
        }
        var renderNode = this._currentSequence.get();
        if (!renderNode) {
            return undefined;
        }
        this._currentSequence = this._currentSequence.getNext();

        // Get the layout-node by its render-node
        return _getCreateAndOrderLayoutNodes.call(this, renderNode);
    }

    /**
     * Get the layout-node by id.
     *
     * @param {String} nodeId id of the layout-node
     * @return {FlowLayoutNode} layout-node or undefined
     */
    function _getLayoutNodeById(nodeId) {

        // This function is only possible when the nodes were provided based on id
        if (!this._nodesById) {
            return undefined;
        }
        var renderNode = this._nodesById[nodeId];
        if (!renderNode) {
            return undefined;
        }

        // If the result was an array, return that instead
        if (renderNode instanceof Array) {
            return renderNode;
        }

        // Get the layout-node by its render-node
        return _getCreateAndOrderLayoutNodes.call(this, renderNode);
    }

    /**
     * Get the layout-node by its renderable.
     *
     * @param {Object} renderable renderable
     * @return {FlowLayoutNode} layout-node or undefined
     */
    function _getLayoutNode (renderable) {
        var layoutNode = this._firstLayoutNode;
        while (layoutNode) {
            if (layoutNode._renderNode === renderable) {
                return layoutNode;
            }
            layoutNode = layoutNode._next;
        }
        return undefined;
    }

    /**
     * Get the renderable associated with the given layout-node
     *
     * @param {Object|Srting} node node or node-id
     * @return {Object} render-node or undefined
     */
    function _getLayoutNodeData (node) {
        if (!node) {
            return undefined;
        }
        return node._renderNode;
    }

    /**
     * Set the content of a layout-node
     *
     * @param {FlowLayoutNode|String} node node or node-id
     * @return {FlowLayoutController} this
     */
    function _setLayoutNode (node, set) {
        if (!node) {
            return this;
        }
        if (!(node instanceof LayoutNode) && ((node instanceof String) || (typeof node !== 'string'))) {
            node = _getLayoutNodeById(node);
            if (!node) {
                return this;
            }
        }
        node._set(set);
        return this;
    }

    module.exports = FlowLayoutController;
});

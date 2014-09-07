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
 * LayoutNodeManager is a private class used internally by the LayoutControllers and
 * ScrollViews. It manages the layout-nodes that are rendered exposes the layout-context
 * which is passed along to the layout-function.
 *
 * LayoutNodeManager keept track of every rendered node through an ordered single-linked
 * list. The first time the layout-function is called, the linked list is created.
 * After that, the linked list is updated to reflect the output of the layout-function.
 * When the layout is unchanged, then the linked-list exactly matches the order of the
 * accessed nodes in the layout-function, and no layout-nodes need to be created or
 * re-ordered.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutNode = require('./LayoutNode');
    var LayoutContext = require('./LayoutContext');

    /**
     * @class
     * @param {Function} createLayoutNodeFunction function to use when creating new nodes
     * @alias module:LayoutNodeManager
     */
    function LayoutNodeManager(createLayoutNodeFunction) {
        this._createLayoutNodeFunction = createLayoutNodeFunction;
        this._context = new LayoutContext({
            next: _contextNextNode.bind(this),
            get: _contextGetNode.bind(this),
            set: _contextSetNode.bind(this),
            resolveSize: _contextResolveSize.bind(this)
        });
        //this._first = undefined;
        //this._currentSequence = undefined;
        //this._nodesById = undefined;
        //this._trueSizeRequested = false;
    }

    /**
     * Prepares the manager for a new layout iteration, after which it returns the
     * context which can be used by the layout-function.
     *
     * @param {ViewSequence} viewSequence first node to layout
     * @param {Object} [nodesById] dictionary to use when looking up nodes by id
     * @return {LayoutContext} context which can be passed to the layout-function
     */
    LayoutNodeManager.prototype.prepareForLayout = function(viewSequence, nodesById, contextData) {

        // Reset all nodes
        var node = this._first;
        while (node) {
            node.reset();
            node = node._next;
        }

        // Prepare data
        this._currentSequence = viewSequence;
        this._nodesById = nodesById;
        this._prev = undefined;
        this._current = this._first;
        this._trueSizeRequested = false;

        // Prepare content
        this._context.size = contextData.size;
        this._context.direction = contextData.direction;
        this._context.reverse = contextData.reverse;
        return this._context;
    };

    /**
     * When the layout-function no longer lays-out the node, then it is not longer
     * being invalidated. In this case the destination is set to the removeSpec
     * after which the node is animated towards the remove-spec.
     *
     * @param {Spec} [removeSpec] spec towards which the no longer layed-out nodes are animated
     */
    LayoutNodeManager.prototype.removeNonInvalidatedNodes = function(removeSpec, showOpacity) {
        var node = this._first;
        while (node) {
            if (!node._invalidated && !node._removing) {
                node.remove(removeSpec);
            }
            else if (node._removing && node._invalidated && showOpacity) {
                node._removing = false;
                node.set({
                    opacity: showOpacity
                });
            }
            node = node._next;
        }
    };

    /**
     * Builds the render-spec and destroy any layout-nodes that no longer
     * return a render-spec.
     *
     * @return {Array.Spec} array of Specs
     */
    LayoutNodeManager.prototype.buildSpecAndDestroyUnrenderedNodes = function() {
        var result = [];
        var node = this._first;
        var prevNode;
        while (node) {
            var spec = node.getSpec();
            if (!spec) {
                var destroyNode = node;
                node = node._next;
                if (prevNode) {
                    prevNode._next = node;
                }
                else {
                    this._first = node;
                }
                destroyNode.destroy();
            }
            else {
                result.push(spec);
                prevNode = node;
                node = node._next;
            }
        }
        return result;
    };

    /**
     * Get the layout-node by its renderable.
     *
     * @param {Object} renderable renderable
     * @return {LayoutNode} layout-node or undefined
     */
    LayoutNodeManager.prototype.getNodeByRenderNode = function(renderable) {
        var node = this._first;
        while (node) {
            if (node._spec.renderNode === renderable) {
                return node;
            }
            node = node._next;
        }
        return undefined;
    };

    /**
     * Inserts a layout-node into the linked-list.
     *
     * @param {LayoutNode} node layout-node to insert
     */
    LayoutNodeManager.prototype.insertNode = function(node) {
        node._next = this._first;
        this._first = node;
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
    function _contextGetCreateAndOrderNodes(renderNode) {

        // Optimized path. If the next current layout-node matches the renderNode
        // return that immediately.
        if (this._current && (this._current._spec.renderNode === renderNode)) {
            this._prev = this._current;
            this._current = this._current._next;
            return this._prev;
        }

        // Look for a layout-node with this render-node
        var node = this._current;
        var prev = this._prev;
        while (node) {
            if (node._spec.renderNode === renderNode) {

                // Remove from old position in linked-list
                if (prev) {
                    prev._next = node._next;
                }

                // Insert before current
                node._next = this._current;
                if (this._prev) {
                    this._prev._next = node;
                }
                else {
                    this._first = node;
                }
                this._prev = node;
                return node;
            }
            prev = node;
            node = node._next;
        }

        // No layout-node found, create new one
        node = this._createLayoutNodeFunction(renderNode);
        node._next = this._current;
        if (this._prev) {
            this._prev._next = node;
        }
        else {
            this._first = node;
        }
        this._prev = node;
        return node;
    }

    /**
     * Get the next layout-node
     */
    function _contextNextNode() {

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
        return _contextGetCreateAndOrderNodes.call(this, renderNode);
    }

    /**
     * Get the layout-node by id.
     */
     function _contextGetNode(nodeId) {
        if (!nodeId) {
            return undefined;
        }
        if (nodeId instanceof LayoutNode) {
            return nodeId;
        }
        var renderNode;
        if ((nodeId instanceof String) || (typeof nodeId === 'string')) {
            if (!this._nodesById) {
               return undefined;
            }
            renderNode = this._nodesById[nodeId];
            if (!renderNode) {
                return undefined;
            }

            // If the result was an array, return that instead
            if (renderNode instanceof Array) {
                return renderNode;
            }
        }
        else {
            renderNode = nodeId;
        }

        // Get the layout-node by its render-node
        return _contextGetCreateAndOrderNodes.call(this, renderNode);
    }

    /**
     * Set the node content
     */
    function _contextSetNode(node, set) {
        node = _contextGetNode.call(this, node);
        if (!node) {
            return this;
        }
        else {
            node.set(set);
        }
    }

    /**
     * Resolve the size of the layout-node from the renderable itsself
     */
    function _contextResolveSize(node, parentSize) {
        node = _contextGetNode.call(this, node);
        if (!node) {
            return this;
        }
        var size = node._spec.renderNode.getSize(true);
        if (!size) {
            size = node._spec.renderNode.getSize(false);
            if (!size) {
                size = parentSize;
            }
            else {
                var newSize = [size[0], size[1]];
                if (size[0] === true) {
                   newSize[0] = 0; // true cannot be resolved at this stage, try again next render-cycle
                   this._trueSizeRequested = true;
                }
                else if (size[0] === undefined) {
                    newSize[0] = parentSize[0];
                }
                if (size[1] === true) {
                   newSize[1] = 0; // true cannot be resolved at this stage, try again next render-cycle
                   this._trueSizeRequested = true;
                }
                else if (size[1] === undefined) {
                    newSize[1] = parentSize[1];
                }
                size = newSize;
            }
        }
        return size;
    }

    module.exports = LayoutNodeManager;
});

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
 * ScrollViews. It manages the layout-nodes that are rendered and exposes the layout-context
 * which is passed along to the layout-function.
 *
 * LayoutNodeManager keeps track of every rendered node through an ordered double-linked
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
    var LayoutUtility = require('./LayoutUtility');

    var MAX_POOL_SIZE = 100;
    var LOG_PREFIX = 'Nodes: ';

    /**
     * @class
     * @param {LayoutNode} LayoutNode Layout-nodes to create
     * @param {Function} initLayoutNodeFn function to use when initializing new nodes
     * @alias module:LayoutNodeManager
     */
    function LayoutNodeManager(LayoutNode, initLayoutNodeFn) {
        this.LayoutNode = LayoutNode;
        this._initLayoutNodeFn = initLayoutNodeFn;
        this._context = new LayoutContext({
            next: _contextNext.bind(this),
            prev: _contextPrev.bind(this),
            get: _contextGet.bind(this),
            set: _contextSet.bind(this),
            getRenderNode: _contextGetRenderNode.bind(this),
            resolveSize: _contextResolveSize.bind(this)
        });
        this._contextState = {
            // enumation state for the context
            //nextSequence: undefined,
            //prevSequence: undefined,
            //next: undefined
            //prev: undefined
            //start: undefined
        };
        this._pool = {
            size: 0
            //first: undefined
        };
        this.verbose = false;
        //this._first = undefined; // first item in the linked list
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
        this._nodesById = nodesById;
        this._trueSizeRequested = false;

        // Prepare context for enumation
        this._contextState.nextSequence = viewSequence;
        this._contextState.prevSequence = viewSequence;
        this._contextState.next = undefined;
        this._contextState.prev = undefined;

        // Prepare content
        this._context.size = contextData.size;
        this._context.direction = contextData.direction;
        this._context.scrollOffset = contextData.scrollOffset || 0;
        this._context.scrollStart = contextData.scrollStart || 0;
        this._context.scrollEnd = contextData.scrollEnd || this._context.size[this._context.direction];
        return this._context;
    };

    /**
     * When the layout-function no longer lays-out the node, then it is not longer
     * being invalidated. In this case the destination is set to the removeSpec
     * after which the node is animated towards the remove-spec.
     *
     * @param {Spec} [removeSpec] spec towards which the no longer layed-out nodes are animated
     */
    LayoutNodeManager.prototype.removeNonInvalidatedNodes = function(removeSpec) {
        var node = this._first;
        while (node) {

            // If a node existed, but it is no longer being layed out,
            // then set it to the '_removing' state.
            if (!node._invalidated && !node._removing) {
                if (this.verbose) {
                    LayoutUtility.log(LOG_PREFIX, 'removing node');
                }
                node.remove(removeSpec);
            }

            // Move to next node
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
        var specs = [];
        var result = {
            specs: specs,
            modified: false
        };
        var node = this._first;
        while (node) {
            var oldEndStateReached = node._endStateReached;
            var spec = node.getSpec();
            if (!spec) {

                // Remove node from linked-list
                if (node._next) {
                    node._next._prev = node._prev;
                }
                if (node._prev) {
                    node._prev._next = node._next;
                }
                else {
                    this._first = node._next;
                }

                // Destroy the node
                var destroyNode = node;
                node = node._next;
                destroyNode.destroy();
                if (this.verbose) {
                    LayoutUtility.log(LOG_PREFIX, 'destroying node');
                }

                // Add node to pool
                if (this._pool.size < MAX_POOL_SIZE) {
                    this._pool.size++;
                    destroyNode._next = this._pool.first;
                    this._pool.first = destroyNode;
                }

                // Mark as modified
                result.modified = true;

                _checkIntegrity.call(this);
            }
            else {

                // Update stats
                if (!node._endStateReached || !oldEndStateReached) {
                    result.modified = true;
                }

                // Add node to result output
                specs.push(spec);
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
            if (node.renderNode === renderable) {
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
        if (this._first) {
            this._first._prev = node;
        }
        this._first = node;
        _checkIntegrity.call(this);
    };

    /**
     * Creates a layout-node
     *
     * @param {Object} renderNode render-node for whom to create a layout-node for
     * @return {LayoutNode} layout-node
     */
    LayoutNodeManager.prototype.createNode = function(renderNode, spec) {
        var node;
        if (this._pool.first) {
            node = this._pool.first;
            this._pool.first = node._next;
            this._pool.size--;
            node.constructor.apply(node, arguments);
        }
        else {
            node = new this.LayoutNode(renderNode, spec);
        }
        node._prev = undefined;
        node._next = undefined;
        if (this._initLayoutNodeFn) {
            this._initLayoutNodeFn.call(this, node, spec);
        }
        return node;
    };

    /**
     * Enumates all layout-nodes.
     *
     * @param {Function} callback Function that is called every node
     * @param {Bool} [next] undefined = all, true = all next, false = all previous
     */
    LayoutNodeManager.prototype.forEach = function(callback, next) {
        var node;
        if (next === undefined) {
            node = this._first;
            while (node) {
                if (callback(node)) {
                    return;
                }
                node = node._next;
            }
        } else if (next === true) {
            node = this._contextState.start;
            while (node) {
                if (!node._invalidated || callback(node)) {
                    return;
                }
                node = node._next;
            }
        } else if (next === false) {
            node = this._contextState.start ? this._contextState.start._prev : undefined;
            while (node) {
                if (!node._invalidated || callback(node)) {
                    return;
                }
                node = node._prev;
            }
        }
    };

    /**
     * Checks the integrity of the linked-list.
     */
    function _checkIntegrity() {
        var node = this._first;
        var count = 0;
        var prevNode;
        while (node) {
            if (!node._prev && (node !== this._first)) {
                throw 'No prev but not first';
            }
            if (node._prev !== prevNode) {
                throw 'Bork';
            }
            prevNode = node;
            node = node._next;
            count++;
        }
    }

    /**
     * Creates or gets a layout node.
     */
    function _contextGetCreateAndOrderNodes(renderNode, prev) {

        // The first time this function is called, the current
        // prev/next position is obtained.
        var node;
        if (!this._contextState.next) {
            node = this._first;
            while (node) {
                if (node.renderNode === renderNode) {
                    break;
                }
                node = node._next;
            }
            if (!node) {
                node = this.createNode(renderNode);
                node._next = this._first;
                if (this._first) {
                    this._first._prev = node;
                }
                this._first = node;
            }
            this._contextState.start = node;
            this._contextState.next = node;
            this._contextState.prev = node;

            _checkIntegrity.call(this);
        }

        // Check whether node already exist at the correct position
        // in the linked-list. If so, return that node immediately
        // and advanced the prev/next pointer for the next/prev
        // lookup operation.
        if (prev) {
            if (this._contextState.prev) {
                var prevNode = this._contextState.prev._prev;
                if (prevNode && (prevNode.renderNode === renderNode)) {
                    this._contextState.prev = prevNode;
                    _checkIntegrity.call(this);
                    return prevNode;
                }
            }
        }
        else {
            var nextNode = this._contextState.next;
            if (nextNode && (nextNode.renderNode === renderNode)) {
                if (nextNode._next) {
                    this._contextState.next = nextNode._next;
                }
                _checkIntegrity.call(this);
                return nextNode;
            }
        }

        // Lookup the node anywhere in the list..
        node = this._first;
        while (node) {
            if (node.renderNode === renderNode) {
                break;
            }
            node = node._next;
        }

        // Create new node if neccessary
        if (!node) {
            node = this.createNode(renderNode);
        }

        // Node existed, remove from linked-list
        else {
            if (node._next) {
                node._next._prev = node._prev;
            }
            if (node._prev) {
                node._prev._next = node._next;
            }
            else {
                this._first = node._next;
            }
            node._next = undefined;
            node._prev = undefined;
            _checkIntegrity.call(this);
        }

        // Insert node into the linked list
        if (prev) {
            if (this._contextState.prev._prev) {
                node._prev = this._contextState.prev._prev;
                this._contextState.prev._prev._next = node;
            }
            else {
                this._first = node;
            }
            this._contextState.prev._prev = node;
            node._next = this._contextState.prev;
            this._contextState.prev = node;
        }
        else {
            if (this._contextState.next._next) {
                node._next = this._contextState.next._next;
                this._contextState.next._next._prev = node;
            }
            this._contextState.next._next = node;
            node._prev = this._contextState.next;
            this._contextState.next = node;
        }
        _checkIntegrity.call(this);

        return node;
    }

    /**
     * Get the next render-node
     */
    function _contextNext() {

        // Get the next node from the sequence
        if (!this._contextState.nextSequence) {
            return undefined;
        }
        var renderNode = this._contextState.nextSequence.get();
        if (!renderNode) {
            this._contextState.nextSequence = undefined;
            return undefined;
        }
        var nextSequence = this._contextState.nextSequence;
        this._contextState.nextSequence = this._contextState.nextSequence.getNext();
        return {
            renderNode: renderNode,
            viewSequence: nextSequence,
            next: true
        };
    }

    /**
     * Get the previous render-node
     */
    function _contextPrev() {

        // Get the previous node from the sequence
        if (!this._contextState.prevSequence) {
            return undefined;
        }
        this._contextState.prevSequence = this._contextState.prevSequence.getPrevious();
        if (!this._contextState.prevSequence) {
            return undefined;
        }
        var renderNode = this._contextState.prevSequence.get();
        if (!renderNode) {
            this._contextState.prevSequence = undefined;
            return undefined;
        }
        return {
            renderNode: renderNode,
            viewSequence: this._contextState.prevSequence,
            prev: true
        };
    }

    /**
     * Resolve id into a context-node.
     */
     function _contextGet(contextNodeOrId) {
        if (!contextNodeOrId) {
            return undefined;
        }
        if ((contextNodeOrId instanceof String) || (typeof contextNodeOrId === 'string')) {
            if (!this._nodesById) {
               return undefined;
            }
            var renderNode = this._nodesById[contextNodeOrId];
            if (!renderNode) {
                return undefined;
            }

            // Return array
            if (renderNode instanceof Array) {
                var result = [];
                for (var i = 0 ; i < renderNode.length; i++) {
                    result.push({
                        renderNode: renderNode[i],
                        arrayElement: true
                    });
                }
                return result;
            }

            // Create context node
            return {
                renderNode: renderNode,
                byId: true
            };
        }
        else {
            return contextNodeOrId;
        }
    }

    /**
     * Get render-node by its id.
     */
     function _contextGetRenderNode(contextNodeOrId) {
        if (!contextNodeOrId) {
            return undefined;
        }
        if ((contextNodeOrId instanceof String) || (typeof contextNodeOrId === 'string')) {
            if (!this._nodesById) {
               return undefined;
            }
            return this._nodesById[contextNodeOrId];
        }
        else {
            return contextNodeOrId.renderNode;
        }
    }

    /**
     * Set the node content
     */
    function _contextSet(contextNodeOrId, set) {
        var contextNode = _contextGet.call(this, contextNodeOrId);
        if (contextNode) {
            var node = _contextGetCreateAndOrderNodes.call(this, contextNode.renderNode, contextNode.prev);
            node._viewSequence = contextNode.viewSequence;
            node.trueSizeRequested = contextNode.trueSizeRequested;
            node.set(set);
        }
    }

    /**
     * Resolve the size of the layout-node from the renderable itsself
     */
    function _contextResolveSize(contextNodeOrId, parentSize) {
        var contextNode = _contextGet.call(this, contextNodeOrId);
        if (!contextNode) {
            return this;
        }
        var size = contextNode.renderNode.getSize(true);
        if (!size) {
            size = contextNode.renderNode.getSize(false);
            if (!size) {
                size = parentSize;
            }
            else {
                var newSize = [size[0], size[1]];
                if (size[0] === true) {
                   newSize[0] = 0; // true cannot be resolved at this stage, try again next render-cycle
                   this._trueSizeRequested = true;
                   contextNode.trueSizeRequested = true;
                }
                else if (size[0] === undefined) {
                    newSize[0] = parentSize[0];
                }
                if (size[1] === true) {
                   newSize[1] = 0; // true cannot be resolved at this stage, try again next render-cycle
                   this._trueSizeRequested = true;
                   contextNode.trueSizeRequested = true;
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

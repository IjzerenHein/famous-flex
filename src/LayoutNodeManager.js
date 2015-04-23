/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014 - 2015
 */

/**
 * LayoutNodeManager is a private class used internally by LayoutController, ScrollController
 * and ScrollView. It manages the layout-nodes that are rendered and exposes the layout-context
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
    var LayoutContext = require('./LayoutContext');
    var LayoutUtility = require('./LayoutUtility');

    var MAX_POOL_SIZE = 100;

    /**
     * @class
     * @param {LayoutNode} LayoutNode Layout-nodes to create
     * @param {Function} initLayoutNodeFn function to use when initializing new nodes
     * @alias module:LayoutNodeManager
     */
    function LayoutNodeManager(LayoutNode, initLayoutNodeFn) {
        this.LayoutNode = LayoutNode;
        this._initLayoutNodeFn = initLayoutNodeFn;
        this._layoutCount = 0;
        this._context = new LayoutContext({
            next: _contextNext.bind(this),
            prev: _contextPrev.bind(this),
            get: _contextGet.bind(this),
            set: _contextSet.bind(this),
            resolveSize: _contextResolveSize.bind(this),
            size: [0, 0]
            //,cycle: 0
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
            layoutNodes: {
                size: 0
                //first: undefined
            },
            resolveSize: [0, 0]
        };
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
        var context = this._context;
        this._layoutCount++;
        this._nodesById = nodesById;
        this._trueSizeRequested = false;
        this._reevalTrueSize =
            contextData.reevalTrueSize ||
            !context.size ||
            (context.size[0] !== contextData.size[0]) ||
            (context.size[1] !== contextData.size[1]);

        // Prepare context for enumation
        var contextState = this._contextState;
        contextState.startSequence = viewSequence;
        contextState.nextSequence = viewSequence;
        contextState.prevSequence = viewSequence;
        contextState.start = undefined;
        contextState.nextGetIndex = 0;
        contextState.prevGetIndex = 0;
        contextState.nextSetIndex = 0;
        contextState.prevSetIndex = 0;
        contextState.addCount = 0;
        contextState.removeCount = 0;
        contextState.lastRenderNode = undefined;

        // Prepare content
        context.size[0] = contextData.size[0];
        context.size[1] = contextData.size[1];
        context.direction = contextData.direction;
        context.reverse = contextData.reverse;
        context.alignment = contextData.reverse ? 1 : 0;
        context.scrollOffset = contextData.scrollOffset || 0;
        context.scrollStart = contextData.scrollStart || 0;
        context.scrollEnd = contextData.scrollEnd || context.size[context.direction];
        //context.cycle++;
        return context;
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
                node.remove(removeSpec);
            }

            // Move to next node
            node = node._next;
        }
    };

    /**
     * Cleans up any unaccessed virtual nodes that have been created by a VirtualViewSequence.
     */
    LayoutNodeManager.prototype.removeVirtualViewSequenceNodes = function() {
        if (this._contextState.startSequence && this._contextState.startSequence.cleanup) {
            this._contextState.startSequence.cleanup();
        }
    };

    /**
     * Builds the render-spec and destroy any layout-nodes that no longer
     * return a render-spec.
     *
     * @return {Array.Spec} array of Specs
     */
    LayoutNodeManager.prototype.buildSpecAndDestroyUnrenderedNodes = function(translate) {
        var specs = [];
        var result = {
            specs: specs,
            modified: false
        };
        var node = this._first;
        while (node) {
            var modified = node._specModified;
            var spec = node.getSpec();
            if (spec.removed) {

                // Destroy node
                var destroyNode = node;
                node = node._next;
                _destroyNode.call(this, destroyNode);

                // Mark as modified
                result.modified = true;
            }
            else {

                // Update stats
                if (modified) {
                    if (spec.transform && translate) {
                        spec.transform[12] += translate[0];
                        spec.transform[13] += translate[1];
                        spec.transform[14] += translate[2];
                        spec.transform[12] = Math.round(spec.transform[12] * 100000) / 100000;
                        spec.transform[13] = Math.round(spec.transform[13] * 100000) / 100000;
                        if (spec.endState) {
                            spec.endState.transform[12] += translate[0];
                            spec.endState.transform[13] += translate[1];
                            spec.endState.transform[14] += translate[2];
                            spec.endState.transform[12] = Math.round(spec.endState.transform[12] * 100000) / 100000;
                            spec.endState.transform[13] = Math.round(spec.endState.transform[13] * 100000) / 100000;
                        }
                    }
                    result.modified = true;
                }

                // Add node to result output
                specs.push(spec);
                node = node._next;
            }
        }
        this._contextState.addCount = 0;
        this._contextState.removeCount = 0;
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
    };

    /**
     * Sets the options for all nodes.
     *
     * @param {Object} options node options
     */
    LayoutNodeManager.prototype.setNodeOptions = function(options) {
        this._nodeOptions = options;
        var node = this._first;
        while (node) {
            node.setOptions(options);
            node = node._next;
        }
        node = this._pool.layoutNodes.first;
        while (node) {
            node.setOptions(options);
            node = node._next;
        }
    };

    /**
     * Pre-allocate layout-nodes ahead of using them.
     *
     * @param {Number} count number of nodes to pre-allocate with the given spec
     * @param {Spec} [spec] render-spec (defined the node properties which to pre-allocate)
     */
    LayoutNodeManager.prototype.preallocateNodes = function(count, spec) {
        var nodes = [];
        for (var i = 0; i < count ; i++) {
            nodes.push(this.createNode(undefined, spec));
        }
        for (i = 0; i < count ; i++) {
            _destroyNode.call(this, nodes[i]);
        }
    };

    /**
     * Creates a layout-node
     *
     * @param {Object} renderNode render-node for whom to create a layout-node for
     * @return {LayoutNode} layout-node
     */
    LayoutNodeManager.prototype.createNode = function(renderNode, spec) {
        var node;
        if (this._pool.layoutNodes.first) {
            node = this._pool.layoutNodes.first;
            this._pool.layoutNodes.first = node._next;
            this._pool.layoutNodes.size--;
            node.constructor.apply(node, arguments);
        }
        else {
            node = new this.LayoutNode(renderNode, spec);
            if (this._nodeOptions) {
                node.setOptions(this._nodeOptions);
            }
        }
        node._prev = undefined;
        node._next = undefined;
        node._viewSequence = undefined;
        node._layoutCount = 0;
        if (this._initLayoutNodeFn) {
            this._initLayoutNodeFn.call(this, node, spec);
        }
        return node;
    };

    /**
     * Removes all nodes.
     */
    LayoutNodeManager.prototype.removeAll = function() {
        var node = this._first;
        while (node) {
          var next = node._next;
          _destroyNode.call(this, node);
          node = next;
        }
        this._first = undefined;
    };

    /**
     * Destroys a layout-node
     */
    function _destroyNode(node) {

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
        node.destroy();

        // Add node to pool
        if (this._pool.layoutNodes.size < MAX_POOL_SIZE) {
            this._pool.layoutNodes.size++;
            node._prev = undefined;
            node._next = this._pool.layoutNodes.first;
            this._pool.layoutNodes.first = node;
        }
    }

    /**
     * Gets start layout-node for enumeration.
     *
     * @param {Bool} [next] undefined = all, true = all next, false = all previous
     * @return {LayoutNode} layout-node or undefined
     */
    LayoutNodeManager.prototype.getStartEnumNode = function(next) {
        if (next === undefined) {
            return this._first;
        }
        else if (next === true) {
            return (this._contextState.start && this._contextState.startPrev) ? this._contextState.start._next : this._contextState.start;
        }
        else if (next === false) {
            return (this._contextState.start && !this._contextState.startPrev) ? this._contextState.start._prev : this._contextState.start;
        }
    };

    /**
     * Checks the integrity of the linked-list.
     */
    /*function _checkIntegrity() {
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

    function _checkContextStateIntegrity() {
        var node = this._contextState.start;
        while (node) {
            if (node === this._contextState.next) {
                break;
            }
            if (!node._invalidated) {
                throw 'WTF';
            }
            node = node._next;
        }
        node = this._contextState.start;
        while (node) {
            if (node === this._contextState.prev) {
                break;
            }
            if (!node._invalidated) {
                throw 'WTF';
            }
            node = node._prev;
        }
    }*/

    /**
     * Creates or gets a layout node.
     */
    function _contextGetCreateAndOrderNodes(renderNode, prev) {

        // The first time this function is called, the current
        // prev/next position is obtained.
        var node;
        var state = this._contextState;
        if (!state.start) {
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
            state.start = node;
            state.startPrev = prev;
            state.prev = node;
            state.next = node;
            return node;
        }

        // Check whether node already exist at the correct position
        // in the linked-list. If so, return that node immediately
        // and advance the prev/next pointer for the next/prev
        // lookup operation.
        if (prev) {
            if (state.prev._prev && (state.prev._prev.renderNode === renderNode)) {
                state.prev = state.prev._prev;
                return state.prev;
            }
        }
        else {
            if (state.next._next && (state.next._next.renderNode === renderNode)) {
                state.next = state.next._next;
                return state.next;
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
        }

        // Insert node into the linked list
        if (prev) {
            if (state.prev._prev) {
                node._prev = state.prev._prev;
                state.prev._prev._next = node;
            }
            else {
                this._first = node;
            }
            state.prev._prev = node;
            node._next = state.prev;
            state.prev = node;
        }
        else {
            if (state.next._next) {
                node._next = state.next._next;
                state.next._next._prev = node;
            }
            state.next._next = node;
            node._prev = state.next;
            state.next = node;
        }

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
        if (this._context.reverse) {
            this._contextState.nextSequence = this._contextState.nextSequence.getNext();
            if (!this._contextState.nextSequence) {
                return undefined;
            }
        }
        var renderNode = this._contextState.nextSequence.get();
        if (!renderNode) {
            this._contextState.nextSequence = undefined;
            return undefined;
        }
        var nextSequence = this._contextState.nextSequence;
        if (!this._context.reverse) {
            this._contextState.nextSequence = this._contextState.nextSequence.getNext();
        }
        if (this._contextState.lastRenderNode === renderNode) {
          throw 'ViewSequence is corrupted, should never contain the same renderNode twice, index: ' + nextSequence.getIndex();
        }
        this._contextState.lastRenderNode = renderNode;
        return {
            renderNode: renderNode,
            viewSequence: nextSequence,
            next: true,
            index: ++this._contextState.nextGetIndex
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
        if (!this._context.reverse) {
            this._contextState.prevSequence = this._contextState.prevSequence.getPrevious();
            if (!this._contextState.prevSequence) {
                return undefined;
            }
        }
        var renderNode = this._contextState.prevSequence.get();
        if (!renderNode) {
            this._contextState.prevSequence = undefined;
            return undefined;
        }
        var prevSequence = this._contextState.prevSequence;
        if (this._context.reverse) {
            this._contextState.prevSequence = this._contextState.prevSequence.getPrevious();
        }
        if (this._contextState.lastRenderNode === renderNode) {
          throw 'ViewSequence is corrupted, should never contain the same renderNode twice, index: ' + prevSequence.getIndex();
        }
        this._contextState.lastRenderNode = renderNode;
        return {
            renderNode: renderNode,
            viewSequence: prevSequence,
            prev: true,
            index: --this._contextState.prevGetIndex
        };
    }

    /**
     * Resolve id into a context-node.
     */
     function _contextGet(contextNodeOrId) {
        if (this._nodesById && ((contextNodeOrId instanceof String) || (typeof contextNodeOrId === 'string'))) {
            var renderNode = this._nodesById[contextNodeOrId];
            if (!renderNode) {
                return undefined;
            }

            // Return array
            if (renderNode instanceof Array) {
                var result = [];
                for (var i = 0, j = renderNode.length; i < j; i++) {
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
     * Set the node content
     */
    function _contextSet(contextNodeOrId, set) {
        var contextNode = this._nodesById ? _contextGet.call(this, contextNodeOrId) : contextNodeOrId;
        if (contextNode) {
            var node = contextNode.node;
            if (!node) {
                if (contextNode.next) {
                     if (contextNode.index < this._contextState.nextSetIndex) {
                        LayoutUtility.error('Nodes must be layed out in the same order as they were requested!');
                     }
                     this._contextState.nextSetIndex = contextNode.index;
                }
                else if (contextNode.prev) {
                     if (contextNode.index > this._contextState.prevSetIndex) {
                        LayoutUtility.error('Nodes must be layed out in the same order as they were requested!');
                     }
                     this._contextState.prevSetIndex = contextNode.index;
                }
                node = _contextGetCreateAndOrderNodes.call(this, contextNode.renderNode, contextNode.prev);
                node._viewSequence = contextNode.viewSequence;
                node._layoutCount++;
                if (node._layoutCount === 1) {
                    this._contextState.addCount++;
                }
                contextNode.node = node;
            }
            node.usesTrueSize = contextNode.usesTrueSize;
            node.trueSizeRequested = contextNode.trueSizeRequested;
            node.set(set, this._context.size);
            contextNode.set = set;
        }
        return set;
    }

    /**
     * Resolve the size of the layout-node from the renderable itsself
     */
    function _contextResolveSize(contextNodeOrId, parentSize) {
        var contextNode = this._nodesById ? _contextGet.call(this, contextNodeOrId) : contextNodeOrId;
        var resolveSize = this._pool.resolveSize;
        if (!contextNode) {
            resolveSize[0] = 0;
            resolveSize[1] = 0;
            return resolveSize;
        }

        // Get in use size
        var renderNode = contextNode.renderNode;
        var size = renderNode.getSize();
        if (!size) {
            return parentSize;
        }

        // Check if true-size is used and it must be reavaluated.
        // This particular piece of code specifically handles true-size Surfaces in famo.us.
        // It contains portions that ensure that the true-size of a Surface is re-evaluated
        // and also workaround code that backs up the size of a Surface, so that when the surface
        // is re-added to the DOM (e.g. when scrolling) it doesn't temporarily have a size of 0.
        var configSize = renderNode.size && (renderNode._trueSizeCheck !== undefined) ? renderNode.size : undefined;
        if (configSize && ((configSize[0] === true) || (configSize[1] === true))) {
            contextNode.usesTrueSize = true;
            var backupSize = renderNode._backupSize;
            if (renderNode._contentDirty || renderNode._trueSizeCheck) {
              this._trueSizeRequested = true;
              contextNode.trueSizeRequested = true;
            }
            if (renderNode._trueSizeCheck) {

                // Fix for true-size renderables. When true-size is used, the size
                // is incorrect for one render-cycle due to the fact that Surface.commit
                // updates the content after asking the DOM for the offsetHeight/offsetWidth.
                // The code below backs the size up, and re-uses that when this scenario
                // occurs.
                if (backupSize && (configSize !== size)) {
                    var newWidth = (configSize[0] === true) ? Math.max(backupSize[0], size[0]) : size[0];
                    var newHeight = (configSize[1] === true) ? Math.max(backupSize[1], size[1]) : size[1];
                    backupSize[0] = newWidth;
                    backupSize[1] = newHeight;
                    size = backupSize;
                    renderNode._backupSize = undefined;
                    backupSize = undefined;
                }
            }
            if (this._reevalTrueSize || (backupSize && ((backupSize[0] !== size[0]) || (backupSize[1] !== size[1])))) {
                renderNode._trueSizeCheck = true; // force request of true-size from DOM
                renderNode._sizeDirty = true;
                this._trueSizeRequested = true;
            }

            // Backup the size of the node
            if (!backupSize) {
                renderNode._backupSize = [0, 0];
                backupSize = renderNode._backupSize;
            }
            backupSize[0] = size[0];
            backupSize[1] = size[1];
        }

        // Ensure re-layout when a child layout-controller is using true-size and it
        // has ben changed.
        configSize = renderNode._nodes ? renderNode.options.size : undefined;
        if (configSize && ((configSize[0] === true) || (configSize[1] === true))) {
            if (this._reevalTrueSize || renderNode._nodes._trueSizeRequested) {
                contextNode.usesTrueSize = true;
                contextNode.trueSizeRequested = true;
                this._trueSizeRequested = true;
            }
        }

        // Resolve 'undefined' to parent-size and true to 0
        if ((size[0] === undefined) || (size[0] === true) || (size[1] === undefined) || (size[1] === true)) {
            resolveSize[0] = size[0];
            resolveSize[1] = size[1];
            size = resolveSize;
            if (size[0] === undefined) {
                size[0] = parentSize[0];
            }
            else if (size[0] === true) {
                size[0] = 0;
                this._trueSizeRequested = true;
                contextNode.trueSizeRequested = true;
            }
            if (size[1] === undefined) {
                size[1] = parentSize[1];
            }
            else if (size[1] === true) {
                size[1] = 0;
                this._trueSizeRequested = true;
                contextNode.trueSizeRequested = true;
            }
        }
        return size;
    }

    module.exports = LayoutNodeManager;
});

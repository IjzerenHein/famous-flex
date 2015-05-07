/**
* This Source Code is licensed under the MIT license. If a copy of the
* MIT-license was not distributed with this file, You can obtain one at:
* http://opensource.org/licenses/mit-license.html.
*
* @author: Hein Rutjes (IjzerenHein)
* @license MIT
* @copyright Gloey Apps, 2014/2015
*
* @library famous-flex
* @version 0.3.2
* @generated 07-05-2015
*/
/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global console*/
/*eslint no-console:0*/

/**
 * Utility class for famous-flex.
 *
 * @module
 */
define('famous-flex/LayoutUtility',['require','exports','module','famous/utilities/Utility'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');

    /**
     * @class
     * @alias module:LayoutUtility
     */
    function LayoutUtility() {
    }
    LayoutUtility.registeredHelpers = {};

    var Capabilities = {
        SEQUENCE: 1,
        DIRECTION_X: 2,
        DIRECTION_Y: 4,
        SCROLLING: 8
    };
    LayoutUtility.Capabilities = Capabilities;

    /**
     *  Normalizes the margins argument.
     *
     *  @param {Array.Number} margins
     */
    LayoutUtility.normalizeMargins = function(margins) {
        if (!margins) {
            return [0, 0, 0, 0];
        }
        else if (!Array.isArray(margins)) {
            return [margins, margins, margins, margins];
        }
        else if (margins.length === 0) {
            return [0, 0, 0, 0];
        }
        else if (margins.length === 1) {
            return [margins[0], margins[0], margins[0], margins[0]];
        }
        else if (margins.length === 2) {
            return [margins[0], margins[1], margins[0], margins[1]];
        }
        else {
            return margins;
        }
    };

    /**
     * Makes a (shallow) copy of a spec.
     *
     * @param {Spec} spec Spec to clone
     * @return {Spec} cloned spec
     */
    LayoutUtility.cloneSpec = function(spec) {
        var clone = {};
        if (spec.opacity !== undefined) {
            clone.opacity = spec.opacity;
        }
        if (spec.size !== undefined) {
            clone.size = spec.size.slice(0);
        }
        if (spec.transform !== undefined) {
            clone.transform = spec.transform.slice(0);
        }
        if (spec.origin !== undefined) {
            clone.origin = spec.origin.slice(0);
        }
        if (spec.align !== undefined) {
            clone.align = spec.align.slice(0);
        }
        return clone;
    };

    /**
     * Compares two arrays for equality.
     */
    function _isEqualArray(a, b) {
        if (a === b) {
            return true;
        }
        if ((a === undefined) || (b === undefined)) {
            return false;
        }
        var i = a.length;
        if (i !== b.length){
            return false;
        }
        while (i--) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Compares two specs for equality.
     *
     * @param {Spec} spec1 Spec to compare
     * @param {Spec} spec2 Spec to compare
     * @return {Boolean} true/false
     */
    LayoutUtility.isEqualSpec = function(spec1, spec2) {
        if (spec1.opacity !== spec2.opacity) {
            return false;
        }
        if (!_isEqualArray(spec1.size, spec2.size)) {
            return false;
        }
        if (!_isEqualArray(spec1.transform, spec2.transform)) {
            return false;
        }
        if (!_isEqualArray(spec1.origin, spec2.origin)) {
            return false;
        }
        if (!_isEqualArray(spec1.align, spec2.align)) {
            return false;
        }
        return true;
    };

    /**
     * Helper function that returns a string containing the differences
     * between two specs.
     *
     * @param {Spec} spec1 Spec to compare
     * @param {Spec} spec2 Spec to compare
     * @return {String} text
     */
    LayoutUtility.getSpecDiffText = function(spec1, spec2) {
        var result = 'spec diff:';
        if (spec1.opacity !== spec2.opacity) {
            result += '\nopacity: ' + spec1.opacity + ' != ' + spec2.opacity;
        }
        if (!_isEqualArray(spec1.size, spec2.size)) {
            result += '\nsize: ' + JSON.stringify(spec1.size) + ' != ' + JSON.stringify(spec2.size);
        }
        if (!_isEqualArray(spec1.transform, spec2.transform)) {
            result += '\ntransform: ' + JSON.stringify(spec1.transform) + ' != ' + JSON.stringify(spec2.transform);
        }
        if (!_isEqualArray(spec1.origin, spec2.origin)) {
            result += '\norigin: ' + JSON.stringify(spec1.origin) + ' != ' + JSON.stringify(spec2.origin);
        }
        if (!_isEqualArray(spec1.align, spec2.align)) {
            result += '\nalign: ' + JSON.stringify(spec1.align) + ' != ' + JSON.stringify(spec2.align);
        }
        return result;
    };

    /**
     * Helper function to call whenever a critical error has occurred.
     *
     * @param {String} message error-message
     */
    LayoutUtility.error = function(message) {
        console.log('ERROR: ' + message);
        throw message;
    };

    /**
     * Helper function to call whenever a warning error has occurred.
     *
     * @param {String} message warning-message
     */
    LayoutUtility.warning = function(message) {
        console.log('WARNING: ' + message);
    };

    /**
     * Helper function to log 1 or more arguments. All the arguments
     * are concatenated to produce a single string which is logged.
     *
     * @param {String|Array|Object} args arguments to stringify and concatenate
     */
    LayoutUtility.log = function(args) {
        var message = '';
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if ((arg instanceof Object) || (arg instanceof Array)) {
                message += JSON.stringify(arg);
            }
            else {
                message += arg;
            }
        }
        console.log(message);
    };

    /**
     * Combines two sets of options into a single set.
     *
     * @param {Object} options1 base set of options
     * @param {Object} options2 set of options to merge into `options1`
     * @param {Bool} [forceClone] ensures that a clone is returned rather that one of the original options objects
     * @return {Object} Combined options
     */
    LayoutUtility.combineOptions = function(options1, options2, forceClone) {
        if (options1 && !options2 && !forceClone) {
            return options1;
        }
        else if (!options1 && options2 && !forceClone) {
            return options2;
        }
        var options = Utility.clone(options1 || {});
        if (options2) {
            for (var key in options2) {
                options[key] = options2[key];
            }
        }
        return options;
    };

    /**
     * Registers a layout-helper so it can be used as a layout-literal for
     * a layout-controller. The LayoutHelper instance must support the `parse`
     * function, which is fed the layout-literal content.
     *
     * **Example:**
     *
     * ```javascript
     * Layout.registerHelper('dock', LayoutDockHelper);
     *
     * var layoutController = new LayoutController({
     *   layout: { dock: [,
     *     ['top', 'header', 50],
     *     ['bottom', 'footer', 50],
     *     ['fill', 'content'],
     *   ]},
     *   dataSource: {
     *     header: new Surface({content: 'Header'}),
     *     footer: new Surface({content: 'Footer'}),
     *     content: new Surface({content: 'Content'}),
     *   }
     * })
     * ```
     *
     * @param {String} name name of the helper (e.g. 'dock')
     * @param {Function} Helper Helper to register (e.g. LayoutDockHelper)
     */
    LayoutUtility.registerHelper = function(name, Helper) {
        if (!Helper.prototype.parse) {
            LayoutUtility.error('The layout-helper for name "' + name + '" is required to support the "parse" method');
        }
        if (this.registeredHelpers[name] !== undefined) {
            LayoutUtility.warning('A layout-helper with the name "' + name + '" is already registered and will be overwritten');
        }
        this.registeredHelpers[name] = Helper;
    };

    /**
     * Unregisters a layout-helper.
     *
     * @param {String} name name of the layout-helper
     */
    LayoutUtility.unregisterHelper = function(name) {
        delete this.registeredHelpers[name];
    };

    /**
     * Gets a registered layout-helper by its name.
     *
     * @param {String} name name of the layout-helper
     * @return {Function} layout-helper or undefined
     */
    LayoutUtility.getRegisteredHelper = function(name) {
        return this.registeredHelpers[name];
    };

    // Layout function
    module.exports = LayoutUtility;
});

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
 * LayoutContext is the interface for a layout-function to access
 * renderables in the data-source and set their size, position, tranformation, etc...
 *
 * The `next`, `prev` and `get` functions return an opaque object which represents
 * the renderable that is to be layed out. To access the actual renderable, use the
 * `.renderNode` property of this opaque object.
 *
 * @module
 */
define('famous-flex/LayoutContext',['require','exports','module'],function(require, exports, module) {

    /**
     * @class
     * @alias module:LayoutContext
     */
    function LayoutContext(methods) {
        for (var n in methods) {
            this[n] = methods[n];
        }
    }

    /**
     * {Property} Size in which to layout the renderables.
     */
    LayoutContext.prototype.size = undefined;

    /**
     * {Property} Direction in which to layout the renderables (0 = X, 1 = Y).
     */
    LayoutContext.prototype.direction = undefined;

    /**
     * {Property} {Number} Scrolling offset at which to start laying out next/prev renderables.
     */
    LayoutContext.prototype.scrollOffset = undefined;

    /**
     * {Property} {Number} Top/left boundary to which to layout renderables (default: 0).
     */
    LayoutContext.prototype.scrollStart = undefined;

    /**
     * {Property} {Number} Bottom/right boundary to which to continue laying out renderables.
     */
    LayoutContext.prototype.scrollEnd = undefined;

    /**
     * Get the context-node for the next renderable in the data-source. When
     * the end of the data-source is reached, `undefined` is returned.
     * Use this function to enumerate the contents of a data-source that is
     * either an Array or a ViewSequence.
     *
     * **Example:**
     *
     * ```javascript
     * function MyLayoutFunction(context, options) {
     *   var height = 0;
     *   var node = context.next(); // get first next node
     *   while (node) {
     *     context.set(node, {
     *       size: [context.size[0], 100],
     *       translate: [0, height, 0]
     *     });
     *     height += 100;
     *     node = context.next(); // get next node
     *   }
     * }
     * ```
     *
     * @return {Object} context-node or undefined
     */
    LayoutContext.prototype.next = function() {
        // dummy implementation, override in constructor
    };

    /**
     * Get the context-node for the previous renderable in the data-source. When
     * the start of the data-source is reached, `undefined` is returned.
     * Use this function to enumerate the contents of a data-source that is
     * either an Array or a ViewSequence.
     *
     * **Example:**
     *
     * ```javascript
     * function MyLayoutFunction(context, options) {
     *   var height = 0;
     *   var node = context.prev(); // get first previous
     *   while (node) {
     *     height -= 100;
     *     context.set(node, {
     *       size: [context.size[0], 100],
     *       translate: [0, height, 0]
     *     });
     *     node = context.prev(); // get prev node
     *   }
     * }
     * ```
     *
     * @return {Object} context-node or undefined
     */
    LayoutContext.prototype.prev = function() {
        // dummy implementation, override in constructor
    };

    /**
     * Get the context-node for a renderable with a specific id. This function
     * should be used to access data-sources which are key-value collections.
     * When a data-source is an Array or a ViewSequence, use `next()`.
     * In many cases it is not neccesary to use `get()`, instead you can pass
     * the id of the renderable straight to the `set` function.
     *
     * **Example:**
     *
     * ```javascript
     * var layoutController = new LayoutController({
     *   layout: function (context, options) {
     *     var size = context.size;
     *     var left = context.get('left');
     *     context.set(left, { size: [100, size[1]] });
     *
     *     var right = context.get('right');
     *     context.set(right, {
     *       size: [100, size[1]],
     *       translate: [size[1] - 100, 0, 0]
     *     });
     *
     *     var middle = context.get('middle');
     *     context.set(middle, {
     *       size: [size[0] - 200, size[1]],
     *       translate: [100, 0, 0]
     *     });
     *   },
     *   dataSource: {
     *     left: new Surface({content: 'left'}),
     *     right: new Surface({content: 'right'}),
     *     middle: new Surface({content: 'middle'})
     *   }
     * });
     * ```
     *
     * **Arrays:**
     *
     * A value at a specific id in the datasource can also be an array. To access the
     * context-nodes in the array use `get()` to get the array and the elements in the
     * array:
     *
     * ```javascript
     * var layoutController = new LayoutController({
     *   layout: function (context, options) {
     *     var size = context.size;
     *     var left = 0;
     *
     *     // Position title
     *     context.set('title', { size: [100, size[1]] });
     *     left += 100;
     *
     *     // Position left-items (array)
     *     var leftItems = context.get('leftItems');
     *     for (var i = 0; i < leftItems.length; i++) {
     *       var leftItem = context.get(leftItems[i]);
     *       context.set(leftItem, {
     *         size: [100, size[1]],
     *         translate: [left, 0, 0]
     *       });
     *       left += 100;
     *     }
     *   },
     *   dataSource: {
     *     title: new Surface({content: 'title'}),
     *     leftItems: [
     *       new Surface({content: 'item1'}),
     *       new Surface({content: 'item2'})
     *     ]
     *   }
     * });
     * ```
     *
     * @param {Object|String} node context-node or node-id
     * @return {Object} context-node or undefined
     */
    LayoutContext.prototype.get = function(node) {
        // dummy implementation, override in constructor
    };

    /**
     * Set the size, origin, align, translation, scale, rotate, skew & opacity for a context-node.
     *
     * **Overview of all supported properties:**
     *
     * ```javascript
     * function MyLayoutFunction(context, options) {
     *   context.set('mynode', {
     *     size: [100, 20],
     *     origin: [0.5, 0.5],
     *     align: [0.5, 0.5],
     *     translate: [50, 10, 0],
     *     scale: [1, 1, 1],
     *     skew: [0, 0, 0],
     *     rotate: [Math.PI, 0, 0],
     *     opacity: 1
     *   })
     * }
     * ```
     *
     * @param {Object|String} node context-node or node-id
     * @param {Object} set properties: size, origin, align, translate, scale, rotate, skew & opacity
     */
    LayoutContext.prototype.set = function(node, set) {
        // dummy implementation, override in constructor
    };

    /**
     * Resolve the size of a context-node by accessing the `getSize` function
     * of the renderable.
     *
     * **Example:**
     *
     * ```javascript
     * var layoutController = new LayoutController({
     *   layout: function (context, options) {
     *     var centerSize = context.resolveSize('center');
     *     context.set('center', {origin: [0.5, 0.5]});
     *     context.set('centerRight', {
     *       origin: [0.5, 0.5],
     *       translate: [centerSize[0] / 2, 0, 0]
     *     });
     *   },
     *   dataSource: {
     *     center: new Surface({content: 'center'}),
     *     centerRight: new Surface({content: 'centerRight'}),
     *   }
     * });
     * ```
     *
     * **When the size of the renderable is calculated by the DOM (`true` size)**
     *
     * When the layout-function performs its layout for the first time, it is
     * possible that the renderable has not yet been rendered and its size
     * is unknown. In this case, the LayoutController will cause a second
     * reflow of the layout the next render-cycle, ensuring that the renderables
     * are layed out as expected.
     *
     * @param {Object|String} node context-node, node-id or array-element
     * @return {Size} size of the node
     */
    LayoutContext.prototype.resolveSize = function(node) {
        // dummy implementation, override in constructor
    };

    module.exports = LayoutContext;
});

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
define('famous-flex/LayoutNodeManager',['require','exports','module','./LayoutContext','./LayoutUtility'],function(require, exports, module) {

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
define('famous-flex/LayoutNode',['require','exports','module','famous/core/Transform','./LayoutUtility'],function(require, exports, module) {

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
 * Internal LayoutNode class used by `LayoutNodeManager`.
 *
 * @module
 */
define('famous-flex/FlowLayoutNode',['require','exports','module','famous/core/OptionsManager','famous/core/Transform','famous/math/Vector','famous/physics/bodies/Particle','famous/physics/forces/Spring','famous/physics/PhysicsEngine','./LayoutNode','famous/transitions/Transitionable'],function(require, exports, module) {

    // import dependencies
    var OptionsManager = require('famous/core/OptionsManager');
    var Transform = require('famous/core/Transform');
    var Vector = require('famous/math/Vector');
    var Particle = require('famous/physics/bodies/Particle');
    var Spring = require('famous/physics/forces/Spring');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var LayoutNode = require('./LayoutNode');
    var Transitionable = require('famous/transitions/Transitionable');

    /**
     * @class
     * @extends LayoutNode
     * @param {Object} renderNode Render-node which this layout-node represents
     * @param {Spec} spec Initial state
     * @param {Object} physicsEngines physics-engines to use
     * @alias module:FlowLayoutNode
     */
    function FlowLayoutNode(renderNode, spec) {
        LayoutNode.apply(this, arguments);

        if (!this.options) {
            this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
            this._optionsManager = new OptionsManager(this.options);
        }

        if (!this._pe) {
            this._pe = new PhysicsEngine();
            this._pe.sleep();
        }

        if (!this._properties) {
            this._properties = {};
        }
        else {
            for (var propName in this._properties) {
                this._properties[propName].init = false;
            }
        }

        if (!this._lockTransitionable) {
            this._lockTransitionable = new Transitionable(1);
        }
        else {
            this._lockTransitionable.halt();
            this._lockTransitionable.reset(1);
        }

        this._specModified = true;
        this._initial = true;
        this._spec.endState = {};
        if (spec) {
            this.setSpec(spec);
        }
    }
    FlowLayoutNode.prototype = Object.create(LayoutNode.prototype);
    FlowLayoutNode.prototype.constructor = FlowLayoutNode;

    FlowLayoutNode.DEFAULT_OPTIONS = {
        spring: {
            dampingRatio: 0.8,
            period: 300
        },
        properties: {
            opacity: true,
            align: true,
            origin: true,
            size: true,
            translate: true,
            skew: true,
            rotate: true,
            scale: true
        },
        particleRounding: 0.001
    };

    /**
     * Defaults
     */
    var DEFAULT = {
        opacity: 1,
        opacity2D: [1, 0],
        size: [0, 0],
        origin: [0, 0],
        align: [0, 0],
        scale: [1, 1, 1],
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        skew: [0, 0, 0]
    };

    /**
     * Verifies that the integrity of the layout-node is oke.
     */
    /*function _verifyIntegrity() {
        var i;
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (prop.particle) {
                if (isNaN(prop.particle.getEnergy())) {
                    throw 'invalid particle energy: ' + propName;
                }
                var value = prop.particle.getPosition();
                for (i = 0; i < value.length; i++) {
                    if (isNaN(value[i])) {
                       throw 'invalid particle value: ' + propName + '(' + i + ')';
                    }
                }
                value = prop.endState.get();
                for (i = 0; i < value.length; i++) {
                    if (isNaN(value[i])) {
                       throw 'invalid endState value: ' + propName + '(' + i + ')';
                    }
                }
            }
        }
    }*/

    /**
     * Sets the configuration options
     */
    FlowLayoutNode.prototype.setOptions = function(options) {
        this._optionsManager.setOptions(options);
        var wasSleeping = this._pe.isSleeping();
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (options.spring && prop.force) {
                prop.force.setOptions(this.options.spring);
            }
            if (options.properties && (options.properties[propName] !== undefined)) {
                if (this.options.properties[propName].length) {
                    prop.enabled = this.options.properties[propName];
                }
                else {
                    prop.enabled = [
                        this.options.properties[propName],
                        this.options.properties[propName],
                        this.options.properties[propName]
                    ];
                }
            }
        }
        if (wasSleeping) {
            this._pe.sleep();
        }
        return this;
    };

    /**
     * Set the properties from a spec.
     */
    FlowLayoutNode.prototype.setSpec = function(spec) {
        var set;
        if (spec.transform) {
            set = Transform.interpret(spec.transform);
        }
        if (!set) {
            set = {};
        }
        set.opacity = spec.opacity;
        set.size = spec.size;
        set.align = spec.align;
        set.origin = spec.origin;

        var oldRemoving = this._removing;
        var oldInvalidated = this._invalidated;
        this.set(set);
        this._removing = oldRemoving;
        this._invalidated = oldInvalidated;
    };

    /**
     * Reset the end-state. This function is called on all layout-nodes prior to
     * calling the layout-function. So that the layout-function starts with a clean slate.
     */
    FlowLayoutNode.prototype.reset = function() {
        if (this._invalidated) {
            for (var propName in this._properties) {
                this._properties[propName].invalidated = false;
            }
            this._invalidated = false;
        }
        this.trueSizeRequested = false;
        this.usesTrueSize = false;
    };

    /**
     * Markes the node for removal.
     */
    FlowLayoutNode.prototype.remove = function(removeSpec) {

        // Transition to the remove-spec state
        this._removing = true;
        if (removeSpec) {
            this.setSpec(removeSpec);
        }
        else {
            this._pe.sleep();
            this._specModified = false;
        }

        // Mark for removal
        this._invalidated = false;
    };

    /**
     * Temporarily releases the flowing-lock that is applied to the node.
     * E.g., when changing position, resizing, the lock should be released so that
     * the renderables can smoothly transition to their new positions.
     */
    FlowLayoutNode.prototype.releaseLock = function(enable) {
        this._lockTransitionable.halt();
        this._lockTransitionable.reset(0);
        if (enable) {
          this._lockTransitionable.set(1, {
              duration: this.options.spring.period || 1000
          });
        }
    };

    /**
     * Helper function for getting the property value.
     */
    function _getRoundedValue3D(prop, def, precision, lockValue) {
        if (!prop || !prop.init) {
            return def;
        }
        return [
            prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / precision) * precision) : prop.endState.x,
            prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / precision) * precision) : prop.endState.y,
            prop.enabled[2] ? (Math.round((prop.curState.z + ((prop.endState.z - prop.curState.z) * lockValue)) / precision) * precision) : prop.endState.z
        ];
    }

    /**
     * Creates the render-spec
     */
    FlowLayoutNode.prototype.getSpec = function() {

        // When the end state was reached, return the previous spec
        var endStateReached = this._pe.isSleeping();
        if (!this._specModified && endStateReached) {
            this._spec.removed = !this._invalidated;
            return this._spec;
        }
        this._initial = false;
        this._specModified = !endStateReached;
        this._spec.removed = false;

        // Step physics engine when not sleeping
        if (!endStateReached) {
            this._pe.step();
        }

        // Build fresh spec
        var spec = this._spec;
        var precision = this.options.particleRounding;
        var lockValue = this._lockTransitionable.get();

        // opacity
        var prop = this._properties.opacity;
        if (prop && prop.init) {
            spec.opacity = prop.enabled[0] ? (Math.round(Math.max(0, Math.min(1, prop.curState.x)) / precision) * precision) : prop.endState.x;
            spec.endState.opacity = prop.endState.x;
        }
        else {
            spec.opacity = undefined;
            spec.endState.opacity = undefined;
        }

        // size
        prop = this._properties.size;
        if (prop && prop.init) {
            spec.size = spec.size || [0, 0];
            spec.size[0] = prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / 0.1) * 0.1) : prop.endState.x;
            spec.size[1] = prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / 0.1) * 0.1) : prop.endState.y;
            spec.endState.size = spec.endState.size || [0, 0];
            spec.endState.size[0] = prop.endState.x;
            spec.endState.size[1] = prop.endState.y;
        }
        else {
            spec.size = undefined;
            spec.endState.size = undefined;
        }

        // align
        prop = this._properties.align;
        if (prop && prop.init) {
            spec.align = spec.align || [0, 0];
            spec.align[0] = prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / 0.1) * 0.1) : prop.endState.x;
            spec.align[1] = prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / 0.1) * 0.1) : prop.endState.y;
            spec.endState.align = spec.endState.align || [0, 0];
            spec.endState.align[0] = prop.endState.x;
            spec.endState.align[1] = prop.endState.y;
        }
        else {
            spec.align = undefined;
            spec.endState.align = undefined;
        }

        // origin
        prop = this._properties.origin;
        if (prop && prop.init) {
            spec.origin = spec.origin || [0, 0];
            spec.origin[0] = prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / 0.1) * 0.1) : prop.endState.x;
            spec.origin[1] = prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / 0.1) * 0.1) : prop.endState.y;
            spec.endState.origin = spec.endState.origin || [0, 0];
            spec.endState.origin[0] = prop.endState.x;
            spec.endState.origin[1] = prop.endState.y;
        }
        else {
            spec.origin = undefined;
            spec.endState.origin = undefined;
        }

        // translate
        var translate = this._properties.translate;
        var translateX;
        var translateY;
        var translateZ;
        if (translate && translate.init) {
            translateX = translate.enabled[0] ? (Math.round((translate.curState.x + ((translate.endState.x - translate.curState.x) * lockValue)) / precision) * precision) : translate.endState.x;
            translateY = translate.enabled[1] ? (Math.round((translate.curState.y + ((translate.endState.y - translate.curState.y) * lockValue)) / precision) * precision) : translate.endState.y;
            translateZ = translate.enabled[2] ? (Math.round((translate.curState.z + ((translate.endState.z - translate.curState.z) * lockValue)) / precision) * precision) : translate.endState.z;
        }
        else {
            translateX = 0;
            translateY = 0;
            translateZ = 0;
        }

        // scale, skew, scale
        var scale = this._properties.scale;
        var skew = this._properties.skew;
        var rotate = this._properties.rotate;
        if (scale || skew || rotate) {
            spec.transform = Transform.build({
                translate: [translateX, translateY, translateZ],
                skew: _getRoundedValue3D.call(this, skew, DEFAULT.skew, this.options.particleRounding, lockValue),
                scale: _getRoundedValue3D.call(this, scale, DEFAULT.scale, this.options.particleRounding, lockValue),
                rotate: _getRoundedValue3D.call(this, rotate, DEFAULT.rotate, this.options.particleRounding, lockValue)
            });
            spec.endState.transform = Transform.build({
                translate: translate ? [translate.endState.x, translate.endState.y, translate.endState.z] : DEFAULT.translate,
                scale: scale ? [scale.endState.x, scale.endState.y, scale.endState.z] : DEFAULT.scale,
                skew: skew ? [skew.endState.x, skew.endState.y, skew.endState.z] : DEFAULT.skew,
                rotate: rotate ? [rotate.endState.x, rotate.endState.y, rotate.endState.z] : DEFAULT.rotate
            });
        }
        else if (translate) {
            if (!spec.transform) {
                spec.transform = Transform.translate(translateX, translateY, translateZ);
            }
            else {
                spec.transform[12] = translateX;
                spec.transform[13] = translateY;
                spec.transform[14] = translateZ;
            }
            if (!spec.endState.transform) {
                spec.endState.transform = Transform.translate(translate.endState.x, translate.endState.y, translate.endState.z);
            }
            else {
                spec.endState.transform[12] = translate.endState.x;
                spec.endState.transform[13] = translate.endState.y;
                spec.endState.transform[14] = translate.endState.z;
            }
        }
        else {
            spec.transform = undefined;
            spec.endState.transform = undefined;
        }
        return this._spec;
    };

    /**
     * Helper function to set the property of a node (e.g. opacity, translate, etc..)
     */
    function _setPropertyValue(prop, propName, endState, defaultValue, immediate, isTranslate) {

        // Get property
        prop = prop || this._properties[propName];

        // Update the property
        if (prop && prop.init) {
            prop.invalidated = true;
            var value = defaultValue;
            if (endState !== undefined) {
                value = endState;
            }
            else if (this._removing) {
                value = prop.particle.getPosition();
            }
            //if (isTranslate && (this._lockDirection !== undefined) && (this._lockTransitionable.get() === 1)) {
            //    immediate = true; // this is a bit dirty, it should check !_lockDirection for non changes as well before setting immediate to true
            //}
            // set new end state (the quick way)
            prop.endState.x = value[0];
            prop.endState.y = (value.length > 1) ? value[1] : 0;
            prop.endState.z = (value.length > 2) ? value[2] : 0;
            if (immediate) {
                // set current state (the quick way)
                prop.curState.x = prop.endState.x;
                prop.curState.y = prop.endState.y;
                prop.curState.z = prop.endState.z;
                // reset velocity (the quick way)
                prop.velocity.x = 0;
                prop.velocity.y = 0;
                prop.velocity.z = 0;
            }
            else if ((prop.endState.x !== prop.curState.x) ||
                     (prop.endState.y !== prop.curState.y) ||
                     (prop.endState.z !== prop.curState.z)) {
                this._pe.wake();
            }
            return;
        }
        else {

            // Create property if neccesary
            var wasSleeping = this._pe.isSleeping();
            if (!prop) {
                prop = {
                    particle: new Particle({
                        position: (this._initial || immediate) ? endState : defaultValue
                    }),
                    endState: new Vector(endState)
                };
                prop.curState = prop.particle.position;
                prop.velocity = prop.particle.velocity;
                prop.force = new Spring(this.options.spring);
                prop.force.setOptions({
                    anchor: prop.endState
                });
                this._pe.addBody(prop.particle);
                prop.forceId = this._pe.attach(prop.force, prop.particle);
                this._properties[propName] = prop;
            }
            else {
                prop.particle.setPosition((this._initial || immediate) ? endState : defaultValue);
                prop.endState.set(endState);
            }
            if (!this._initial && !immediate) {
                this._pe.wake();
            }
            else if (wasSleeping) {
                this._pe.sleep(); // nothing has changed, put back to sleep
            }
            if (this.options.properties[propName] && this.options.properties[propName].length) {
                prop.enabled = this.options.properties[propName];
            }
            else {
                prop.enabled = [
                  this.options.properties[propName],
                  this.options.properties[propName],
                  this.options.properties[propName]
                ];
            }
            prop.init = true;
            prop.invalidated = true;
        }
    }

    /**
     * Get value if not equals.
     */
    function _getIfNE2D(a1, a2) {
        return ((a1[0] === a2[0]) && (a1[1] === a2[1])) ? undefined : a1;
    }
    function _getIfNE3D(a1, a2) {
        return ((a1[0] === a2[0]) && (a1[1] === a2[1]) && (a1[2] === a2[2])) ? undefined : a1;
    }

    /**
     * context.set(..)
     */
    FlowLayoutNode.prototype.set = function(set, defaultSize) {
        if (defaultSize) {
            this._removing = false;
        }
        this._invalidated = true;
        this.scrollLength = set.scrollLength;
        this._specModified = true;

        // opacity
        var prop = this._properties.opacity;
        var value = (set.opacity === DEFAULT.opacity) ? undefined : set.opacity;
        if ((value !== undefined) || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'opacity', (value === undefined) ? undefined : [value, 0], DEFAULT.opacity2D);
        }

        // set align
        prop = this._properties.align;
        value = set.align ? _getIfNE2D(set.align, DEFAULT.align) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'align', value, DEFAULT.align);
        }

        // set orgin
        prop = this._properties.origin;
        value = set.origin ? _getIfNE2D(set.origin, DEFAULT.origin) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'origin', value, DEFAULT.origin);
        }

        // set size
        prop = this._properties.size;
        value = set.size || defaultSize;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'size', value, defaultSize, this.usesTrueSize);
        }

        // set translate
        prop = this._properties.translate;
        value = set.translate;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'translate', value, DEFAULT.translate, undefined, true);
        }

        // set scale
        prop = this._properties.scale;
        value = set.scale ? _getIfNE3D(set.scale, DEFAULT.scale) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'scale', value, DEFAULT.scale);
        }

        // set rotate
        prop = this._properties.rotate;
        value = set.rotate ? _getIfNE3D(set.rotate, DEFAULT.rotate) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'rotate', value, DEFAULT.rotate);
        }

        // set skew
        prop = this._properties.skew;
        value = set.skew ? _getIfNE3D(set.skew, DEFAULT.skew) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'skew', value, DEFAULT.skew);
        }
    };

    module.exports = FlowLayoutNode;
});

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
 * LayoutDockHelper helps positioning nodes using docking principles.
 *
 * **Example:**
 *
 * ```javascript
 * var LayoutDockHelper = require('famous-flex/helpers/LayoutDockHelper');
 *
 * function HeaderFooterLayout(context, options) {
 *   var dock = new LayoutDockHelper(context);
 *   dock.top('header', options.headerSize);
 *   dock.bottom('footer', options.footerSize);
 *   dock.fill('content');
 * };
 * ```
 *
 * You can also use layout-literals to create layouts using docking semantics:
 *
 * ```javascript
 * var layoutController = new LayoutController({
 *   layout: {dock: [
 *     ['top', 'header', 40],
 *     ['bottom', 'footer', 40, 1], // z-index +1
 *     ['fill', 'content']
 *   ]},
 *   dataSource: {
 *     header: new Surface({content: 'header'}),
 *     footer: new Surface({content: 'footer'}),
 *     content: new Surface({content: 'content'}),
 *   }
 * });
 * ```
 *
 * @module
 */
define('famous-flex/helpers/LayoutDockHelper',['require','exports','module','../LayoutUtility'],function(require, exports, module) {

    // import dependencies
    var LayoutUtility = require('../LayoutUtility');

    /**
     * @class
     * @param {LayoutContext} context layout-context
     * @param {Object} [options] additional options
     * @param {Object} [options.margins] margins to start out with (default: 0px)
     * @param {Number} [options.translateZ] z-index to use when translating objects (default: 0)
     * @alias module:LayoutDockHelper
     */
    function LayoutDockHelper(context, options) {
        var size = context.size;
        this._size = size;
        this._context = context;
        this._options = options;
        this._z = (options && options.translateZ) ? options.translateZ : 0;
        if (options && options.margins) {
            var margins = LayoutUtility.normalizeMargins(options.margins);
            this._left = margins[3];
            this._top = margins[0];
            this._right = size[0] - margins[1];
            this._bottom = size[1] - margins[2];
        }
        else {
            this._left = 0;
            this._top = 0;
            this._right = size[0];
            this._bottom = size[1];
        }
    }

    /**
     * Parses the layout-rules based on a JSON data object.
     * The object should be an array with the following syntax:
     * `[[rule, node, value, z], [rule, node, value, z], ...]`
     *
     * **Example:**
     *
     * ```JSON
     * [
     *   ['top', 'header', 50],
     *   ['bottom', 'footer', 50, 10], // z-index: 10
     *   ['margins', [10, 5]], // marginate remaining space: 10px top/bottom, 5px left/right
     *   ['fill', 'content']
     * ]
     * ```
     *
     * @param {Object} data JSON object
     */
    LayoutDockHelper.prototype.parse = function(data) {
        for (var i = 0; i < data.length; i++) {
            var rule = data[i];
            var value = (rule.length >= 3) ? rule[2] : undefined;
            if (rule[0] === 'top') {
                this.top(rule[1], value, (rule.length >=4) ? rule[3] : undefined);
            }
            else if (rule[0] === 'left') {
                this.left(rule[1], value, (rule.length >=4) ? rule[3] : undefined);
            }
            else if (rule[0] === 'right') {
                this.right(rule[1], value, (rule.length >=4) ? rule[3] : undefined);
            }
            else if (rule[0] === 'bottom') {
                this.bottom(rule[1], value, (rule.length >=4) ? rule[3] : undefined);
            }
            else if (rule[0] === 'fill') {
                this.fill(rule[1], (rule.length >=3) ? rule[2] : undefined);
            }
            else if (rule[0] === 'margins') {
                this.margins(rule[1]);
            }
        }
    };

    /**
     * Dock the node to the top.
     *
     * @param {LayoutNode|String} [node] layout-node to dock, when omitted the `height` argument argument is used for padding
     * @param {Number} [height] height of the layout-node, when omitted the height of the node is used
     * @param {Number} [z] z-index to use for the node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.top = function(node, height, z) {
        if (height instanceof Array) {
            height = height[1];
        }
        if (height === undefined) {
            var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
            height = size[1];
        }
        this._context.set(node, {
            size: [this._right - this._left, height],
            origin: [0, 0],
            align: [0, 0],
            translate: [this._left, this._top, (z === undefined) ? this._z : z]
        });
        this._top += height;
        return this;
    };

    /**
     * Dock the node to the left
     *
     * @param {LayoutNode|String} [node] layout-node to dock, when omitted the `width` argument argument is used for padding
     * @param {Number} [width] width of the layout-node, when omitted the width of the node is used
     * @param {Number} [z] z-index to use for the node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.left = function(node, width, z) {
        if (width instanceof Array) {
            width = width[0];
        }
        if (width === undefined) {
            var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
            width = size[0];
        }
        this._context.set(node, {
            size: [width, this._bottom - this._top],
            origin: [0, 0],
            align: [0, 0],
            translate: [this._left, this._top, (z === undefined) ? this._z : z]
        });
        this._left += width;
        return this;
    };

    /**
     * Dock the node to the bottom
     *
     * @param {LayoutNode|String} [node] layout-node to dock, when omitted the `height` argument argument is used for padding
     * @param {Number} [height] height of the layout-node, when omitted the height of the node is used
     * @param {Number} [z] z-index to use for the node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.bottom = function(node, height, z) {
        if (height instanceof Array) {
            height = height[1];
        }
        if (height === undefined) {
            var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
            height = size[1];
        }
        this._context.set(node, {
            size: [this._right - this._left, height],
            origin: [0, 1],
            align: [0, 1],
            translate: [this._left, -(this._size[1] - this._bottom), (z === undefined) ? this._z : z]
        });
        this._bottom -= height;
        return this;
    };

    /**
     * Dock the node to the right.
     *
     * @param {LayoutNode|String} [node] layout-node to dock, when omitted the `width` argument argument is used for padding
     * @param {Number} [width] width of the layout-node, when omitted the width of the node is used
     * @param {Number} [z] z-index to use for the node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.right = function(node, width, z) {
        if (width instanceof Array) {
            width = width[0];
        }
        if (node) {
            if (width === undefined) {
                var size = this._context.resolveSize(node, [this._right - this._left, this._bottom - this._top]);
                width = size[0];
            }
            this._context.set(node, {
                size: [width, this._bottom - this._top],
                origin: [1, 0],
                align: [1, 0],
                translate: [-(this._size[0] - this._right), this._top, (z === undefined) ? this._z : z]
            });
        }
        if (width) {
            this._right -= width;
        }
        return this;
    };

    /**
     * Fills the node to the remaining content.
     *
     * @param {LayoutNode|String} node layout-node to dock
     * @param {Number} [z] z-index to use for the node
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.fill = function(node, z) {
        this._context.set(node, {
            size: [this._right - this._left, this._bottom - this._top],
            translate: [this._left, this._top, (z === undefined) ? this._z : z]
        });
        return this;
    };

    /**
     * Applies indent margins to the remaining content.
     *
     * @param {Number|Array} margins margins shorthand (e.g. '5', [10, 10], [5, 10, 5, 10])
     * @return {LayoutDockHelper} this
     */
    LayoutDockHelper.prototype.margins = function(margins) {
        margins = LayoutUtility.normalizeMargins(margins);
        this._left += margins[3];
        this._top += margins[0];
        this._right -= margins[1];
        this._bottom -= margins[2];
        return this;
    };

    // Register the helper
    LayoutUtility.registerHelper('dock', LayoutDockHelper);

    module.exports = LayoutDockHelper;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014 - 2015
 */

/*global console*/
/*eslint no-console: 0*/

/**
 * LayoutController lays out renderables according to a layout-
 * function and a data-source.
 *
 * Events:
 *
 * |event      |description|
 * |-----------|-----------|
 * |layoutstart|Emitted before the layout function is executed.|
 * |layoutend  |Emitted after the layout function has been executed.|
 * |reflow     |Emitted after one or more renderables have been changed.|
 *
 * @module
 */
define('famous-flex/LayoutController',['require','exports','module','famous/utilities/Utility','famous/core/Entity','famous/core/ViewSequence','famous/core/OptionsManager','famous/core/EventHandler','./LayoutUtility','./LayoutNodeManager','./LayoutNode','./FlowLayoutNode','famous/core/Transform','./helpers/LayoutDockHelper'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');
    var Entity = require('famous/core/Entity');
    var ViewSequence = require('famous/core/ViewSequence');
    var OptionsManager = require('famous/core/OptionsManager');
    var EventHandler = require('famous/core/EventHandler');
    var LayoutUtility = require('./LayoutUtility');
    var LayoutNodeManager = require('./LayoutNodeManager');
    var LayoutNode = require('./LayoutNode');
    var FlowLayoutNode = require('./FlowLayoutNode');
    var Transform = require('famous/core/Transform');
    require('./helpers/LayoutDockHelper');

    /**
     * @class
     * @param {Object} options Options.
     * @param {Function|Object} [options.layout] Layout function or layout-literal.
     * @param {Object} [options.layoutOptions] Options to pass in to the layout-function.
     * @param {Array|ViewSequence|Object} [options.dataSource] Array, ViewSequence or Object with key/value pairs.
     * @param {Utility.Direction} [options.direction] Direction to layout into (e.g. Utility.Direction.Y) (when omitted the default direction of the layout is used)
     * @param {Bool} [options.flow] Enables flow animations when the layout changes (default: `false`).
     * @param {Object} [options.flowOptions] Options used by nodes when reflowing.
     * @param {Bool} [options.flowOptions.reflowOnResize] Smoothly reflows renderables on resize (only used when flow = true) (default: `true`).
     * @param {Object} [options.flowOptions.spring] Spring options used by nodes when reflowing (default: `{dampingRatio: 0.8, period: 300}`).
     * @param {Object} [options.flowOptions.properties] Properties which should be enabled or disabled for flowing.
     * @param {Spec} [options.flowOptions.insertSpec] Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`).
     * @param {Spec} [options.flowOptions.removeSpec] Size, transform, opacity... to use when removing renderables from the scene (default: `{}`).
     * @param {Bool} [options.alwaysLayout] When set to true, always calls the layout function on every render-cycle (default: `false`).
     * @param {Bool} [options.autoPipeEvents] When set to true, automatically calls .pipe on all renderables when inserted (default: `false`).
     * @param {Object} [options.preallocateNodes] Optimisation option to improve initial scrolling/animation performance by pre-allocating nodes, e.g.: `{count: 50, spec: {size:[0, 0], transform: Transform.identity}}`.
     * @alias module:LayoutController
     */
    function LayoutController(options, nodeManager) {

        // Commit
        this.id = Entity.register(this);
        this._isDirty = true;
        this._contextSizeCache = [0, 0];
        this._commitOutput = {};

        // Create an object to we can capture the famo.us cleanup call on
        // LayoutController.
        this._cleanupRegistration = {
          commit: function() {
              return undefined;
          },
          cleanup: function(context) {
              this.cleanup(context);
          }.bind(this)
        };
        this._cleanupRegistration.target = Entity.register(this._cleanupRegistration);
        this._cleanupRegistration.render = function() {
          return this.target;
        }.bind(this._cleanupRegistration);

        // Setup input event handler
        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);

        // Setup event handlers
        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);

        // Data-source
        //this._dataSource = undefined;
        //this._nodesById = undefined;
        //this._viewSequence = undefined;

        // Layout
        this._layout = {
            //function: undefined,
            //literal: undefined,
            //capabilities: undefined,
            options: Object.create({})
        };
        //this._direction = undefined;
        this._layout.optionsManager = new OptionsManager(this._layout.options);
        this._layout.optionsManager.on('change', function() {
            this._isDirty = true;
        }.bind(this));

        // Create options
        this.options = Object.create(LayoutController.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);

        // Create node manager that manages (Flow)LayoutNode instances
        if (nodeManager) {
            this._nodes = nodeManager;
        }
        else if (options && options.flow) {
            this._nodes = new LayoutNodeManager(FlowLayoutNode, _initFlowLayoutNode.bind(this));
        }
        else {
            this._nodes = new LayoutNodeManager(LayoutNode);
        }

        // Set options
        this.setDirection(undefined);
        if (options) {
            this.setOptions(options);
        }
    }

    LayoutController.DEFAULT_OPTIONS = {
        flow: false,
        flowOptions: {
            reflowOnResize: true,
            properties: {
                opacity: true,
                align: true,
                origin: true,
                size: true,
                translate: true,
                skew: true,
                rotate: true,
                scale: true
            },
            spring: {
                dampingRatio: 0.8,
                period: 300
            }
            /*insertSpec: {
                opacity: undefined,
                size: undefined,
                transform: undefined,
                origin: undefined,
                align: undefined
            },
            removeSpec: {
                opacity: undefined,
                size: undefined,
                transform: undefined,
                origin: undefined,
                align: undefined
            }*/
        }
    };

    /**
     * Called whenever a layout-node is created/re-used. Initializes
     * the node with the `insertSpec` if it has been defined.
     */
    function _initFlowLayoutNode(node, spec) {
        if (!spec && this.options.flowOptions.insertSpec) {
            node.setSpec(this.options.flowOptions.insertSpec);
        }
    }

    /**
     * Patches the LayoutController instance's options with the passed-in ones.
     *
     * @param {Options} options An object of configurable options for the LayoutController instance.
     * @param {Function|Object} [options.layout] Layout function or layout-literal.
     * @param {Object} [options.layoutOptions] Options to pass in to the layout-function.
     * @param {Array|ViewSequence|Object} [options.dataSource] Array, ViewSequence or Object with key/value pairs.
     * @param {Utility.Direction} [options.direction] Direction to layout into (e.g. Utility.Direction.Y) (when omitted the default direction of the layout is used)
     * @param {Object} [options.flowOptions] Options used by nodes when reflowing.
     * @param {Bool} [options.flowOptions.reflowOnResize] Smoothly reflows renderables on resize (only used when flow = true) (default: `true`).
     * @param {Object} [options.flowOptions.spring] Spring options used by nodes when reflowing (default: `{dampingRatio: 0.8, period: 300}`).
     * @param {Object} [options.flowOptions.properties] Properties which should be enabled or disabled for flowing.
     * @param {Spec} [options.flowOptions.insertSpec] Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`).
     * @param {Spec} [options.flowOptions.removeSpec] Size, transform, opacity... to use when removing renderables from the scene (default: `{}`).
     * @param {Bool} [options.alwaysLayout] When set to true, always calls the layout function on every render-cycle (default: `false`).
     * @return {LayoutController} this
     */
    LayoutController.prototype.setOptions = function(options) {
        if ((options.alignment !== undefined) && (options.alignment !== this.options.alignment)) {
            this._isDirty = true;
        }
        this._optionsManager.setOptions(options);
        if (options.nodeSpring) {
            console.warn('nodeSpring options have been moved inside `flowOptions`. Use `flowOptions.spring` instead.');
            this._optionsManager.setOptions({
                flowOptions: {
                    spring: options.nodeSpring
                }
            });
            this._nodes.setNodeOptions(this.options.flowOptions);
        }
        if (options.reflowOnResize !== undefined) {
            console.warn('reflowOnResize options have been moved inside `flowOptions`. Use `flowOptions.reflowOnResize` instead.');
            this._optionsManager.setOptions({
                flowOptions: {
                    reflowOnResize: options.reflowOnResize
                }
            });
            this._nodes.setNodeOptions(this.options.flowOptions);
        }
        if (options.insertSpec) {
            console.warn('insertSpec options have been moved inside `flowOptions`. Use `flowOptions.insertSpec` instead.');
            this._optionsManager.setOptions({
                flowOptions: {
                    insertSpec: options.insertSpec
                }
            });
            this._nodes.setNodeOptions(this.options.flowOptions);
        }
        if (options.removeSpec) {
            console.warn('removeSpec options have been moved inside `flowOptions`. Use `flowOptions.removeSpec` instead.');
            this._optionsManager.setOptions({
                flowOptions: {
                    removeSpec: options.removeSpec
                }
            });
            this._nodes.setNodeOptions(this.options.flowOptions);
        }
        if (options.dataSource) {
            this.setDataSource(options.dataSource);
        }
        if (options.layout) {
            this.setLayout(options.layout, options.layoutOptions);
        }
        else if (options.layoutOptions) {
            this.setLayoutOptions(options.layoutOptions);
        }
        if (options.direction !== undefined) {
            this.setDirection(options.direction);
        }
        if (options.flowOptions && this.options.flow) {
            this._nodes.setNodeOptions(this.options.flowOptions);
        }
        if (options.preallocateNodes) {
            this._nodes.preallocateNodes(options.preallocateNodes.count || 0, options.preallocateNodes.spec);
        }
        return this;
    };

    /**
     * Helper function to enumerate all the renderables in the datasource
     */
    function _forEachRenderable(callback) {
        var dataSource = this._dataSource;
        if (dataSource instanceof Array) {
            for (var i = 0, j = dataSource.length; i < j; i++) {
                callback(dataSource[i]);
            }
        }
        else if (dataSource instanceof ViewSequence) {
            var renderable;
            while (dataSource) {
                renderable = dataSource.get();
                if (!renderable) {
                    break;
                }
                callback(renderable);
                dataSource = dataSource.getNext();
            }
        }
        else {
            for (var key in dataSource) {
                callback(dataSource[key]);
            }
        }
    }

    /**
     * Sets the collection of renderables which are layed out according to
     * the layout-function.
     *
     * The data-source can be either an Array, ViewSequence or Object
     * with key/value pairs.
     *
     * @param {Array|Object|ViewSequence} dataSource Array, ViewSequence or Object.
     * @return {LayoutController} this
     */
    LayoutController.prototype.setDataSource = function(dataSource) {
        this._dataSource = dataSource;
        this._initialViewSequence = undefined;
        this._nodesById = undefined;
        if (dataSource instanceof Array) {
            this._viewSequence = new ViewSequence(dataSource);
            this._initialViewSequence = this._viewSequence;
        }
        else if ((dataSource instanceof ViewSequence) || dataSource.getNext) {
            this._viewSequence = dataSource;
            this._initialViewSequence = dataSource;
        }
        else if (dataSource instanceof Object){
            this._nodesById = dataSource;
        }
        if (this.options.autoPipeEvents) {
            if (this._dataSource.pipe) {
                this._dataSource.pipe(this);
                this._dataSource.pipe(this._eventOutput);
            }
            else {
                _forEachRenderable.call(this, function(renderable) {
                    if (renderable && renderable.pipe) {
                        renderable.pipe(this);
                        renderable.pipe(this._eventOutput);
                    }
                }.bind(this));
            }
        }
        this._isDirty = true;
        return this;
    };

    /**
     * Get the data-source.
     *
     * @return {Array|ViewSequence|Object} data-source
     */
    LayoutController.prototype.getDataSource = function() {
        return this._dataSource;
    };

    /**
     * Set the new layout.
     *
     * @param {Function|Object} layout Layout function or layout-literal
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {LayoutController} this
     */
    LayoutController.prototype.setLayout = function(layout, options) {

        // Set new layout funtion
        if (layout instanceof Function) {
            this._layout._function = layout;
            this._layout.capabilities = layout.Capabilities;
            this._layout.literal = undefined;

        // If the layout is an object, treat it as a layout-literal
        }
        else if (layout instanceof Object) {
            this._layout.literal = layout;
            this._layout.capabilities = undefined; // todo - derive from literal somehow?
            var helperName = Object.keys(layout)[0];
            var Helper = LayoutUtility.getRegisteredHelper(helperName);
            this._layout._function = Helper ? function(context, options2) {
                var helper = new Helper(context, options2);
                helper.parse(layout[helperName]);
            } : undefined;
        }
        else {
            this._layout._function = undefined;
            this._layout.capabilities = undefined;
            this._layout.literal = undefined;
        }

        // Update options
        if (options) {
            this.setLayoutOptions(options);
        }

        // Update direction
        this.setDirection(this._configuredDirection);
        this._isDirty = true;
        return this;
    };

    /**
     * Get the current layout.
     *
     * @return {Function|Object} Layout function or layout literal
     */
    LayoutController.prototype.getLayout = function() {
        return this._layout.literal || this._layout._function;
    };

    /**
     * Set the options for the current layout. Use this function after
     * `setLayout` to update one or more options for the layout-function.
     *
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {LayoutController} this
     */
    LayoutController.prototype.setLayoutOptions = function(options) {
        this._layout.optionsManager.setOptions(options);
        return this;
    };

    /**
     * Get the current layout options.
     *
     * @return {Object} Layout options
     */
    LayoutController.prototype.getLayoutOptions = function() {
        return this._layout.options;
    };

    /**
     * Calculates the actual in-use direction based on the given direction
     * and supported capabilities of the layout-function.
     */
    function _getActualDirection(direction) {

        // When the direction is configured in the capabilities, look it up there
        if (this._layout.capabilities && this._layout.capabilities.direction) {

            // Multiple directions are supported
            if (Array.isArray(this._layout.capabilities.direction)) {
                for (var i = 0; i < this._layout.capabilities.direction.length; i++) {
                    if (this._layout.capabilities.direction[i] === direction) {
                        return direction;
                    }
                }
                return this._layout.capabilities.direction[0];
            }

            // Only one direction is supported, we must use that
            else {
                return this._layout.capabilities.direction;
            }
        }

        // Use Y-direction as a fallback
        return (direction === undefined) ? Utility.Direction.Y : direction;
    }

    /**
     * Set the direction of the layout. When no direction is set, the default
     * direction of the layout function is used.
     *
     * @param {Utility.Direction} direction Direction (e.g. Utility.Direction.X)
     * @return {LayoutController} this
     */
    LayoutController.prototype.setDirection = function(direction) {
        this._configuredDirection = direction;
        var newDirection = _getActualDirection.call(this, direction);
        if (newDirection !== this._direction) {
            this._direction = newDirection;
            this._isDirty = true;
        }
    };

    /**
     * Get the direction (e.g. Utility.Direction.Y). By default, this function
     * returns the direction that was configured by setting `setDirection`. When
     * the direction has not been set, `undefined` is returned.
     *
     * When no direction has been set, the first direction is used that is specified
     * in the capabilities of the layout-function. To obtain the actual in-use direction,
     * use `getDirection(true)`. This method returns the actual in-use direction and
     * never returns undefined.
     *
     * @param {Boolean} [actual] Set to true to obtain the actual in-use direction
     * @return {Utility.Direction} Direction or undefined
     */
    LayoutController.prototype.getDirection = function(actual) {
        return actual ? this._direction : this._configuredDirection;
    };

    /**
     * Get the spec (size, transform, etc..) for the given renderable or
     * Id.
     *
     * @param {Renderable|String} node Renderabe or Id to look for
     * @param {Bool} [normalize] When set to `true` normalizes the origin/align into the transform translation (default: `false`).
     * @param {Bool} [endState] When set to `true` returns the flowing end-state spec rather than the current spec.
     * @return {Spec} spec or undefined
     */
    LayoutController.prototype.getSpec = function(node, normalize, endState) {
        if (!node) {
            return undefined;
        }
        if ((node instanceof String) || (typeof node === 'string')) {
            if (!this._nodesById) {
               return undefined;
            }
            node = this._nodesById[node];
            if (!node) {
                return undefined;
            }

            // If the result was an array, return that instead
            if (node instanceof Array) {
                return node;
            }
        }
        if (this._specs) {
            for (var i = 0; i < this._specs.length; i++) {
                var spec = this._specs[i];
                if (spec.renderNode === node) {
                    if (endState && spec.endState) {
                        spec = spec.endState;
                    }
                    // normalize align & origin into transform
                    if (normalize && spec.transform && spec.size && (spec.align || spec.origin)) {
                        var transform = spec.transform;
                        if (spec.align && (spec.align[0] || spec.align[1])) {
                            transform = Transform.thenMove(transform, [spec.align[0] * this._contextSizeCache[0], spec.align[1] * this._contextSizeCache[1], 0]);
                        }
                        if (spec.origin && (spec.origin[0] || spec.origin[1])) {
                            transform = Transform.moveThen([-spec.origin[0] * spec.size[0], -spec.origin[1] * spec.size[1], 0], transform);
                        }
                        return {
                            opacity: spec.opacity,
                            size: spec.size,
                            transform: transform
                        };
                    }
                    return spec;
                }
            }
        }
        return undefined;
    };

    /**
     * Forces a reflow of the layout the next render cycle.
     *
     * @return {LayoutController} this
     */
    LayoutController.prototype.reflowLayout = function() {
        this._isDirty = true;
        return this;
    };

    /**
     * Resets the current flow state, so that all renderables
     * are immediately displayed in their end-state.
     *
     * @return {LayoutController} this
     */
    LayoutController.prototype.resetFlowState = function() {
        if (this.options.flow) {
            this._resetFlowState = true;
        }
        return this;
    };

    /**
     * Inserts a renderable into the data-source.
     *
     * The optional argument `insertSpec` is only used `flow` mode is enabled.
     * When specified, the renderable is inserted using an animation starting with
     * size, origin, opacity, transform, etc... as specified in `insertSpec'.
     *
     * @param {Number|String} indexOrId Index (0 = before first, -1 at end), within dataSource array or id (String)
     * @param {Object} renderable Renderable to add to the data-source
     * @param {Spec} [insertSpec] Size, transform, etc.. to start with when inserting
     * @return {LayoutController} this
     */
    LayoutController.prototype.insert = function(indexOrId, renderable, insertSpec) {

        // Add the renderable in case of an id (String)
        if ((indexOrId instanceof String) || (typeof indexOrId === 'string')) {

            // Create data-source if neccesary
            if (this._dataSource === undefined) {
                this._dataSource = {};
                this._nodesById = this._dataSource;
            }

            // Insert renderable
            if (this._nodesById[indexOrId] === renderable) {
                return this;
            }
            this._nodesById[indexOrId] = renderable;
        }

        // Add the renderable using an index
        else {

            // Create data-source if neccesary
            if (this._dataSource === undefined) {
                this._dataSource = [];
                this._viewSequence = new ViewSequence(this._dataSource);
                this._initialViewSequence = this._viewSequence;
            }

            // Insert into array
            var dataSource = this._viewSequence || this._dataSource;
            var array = _getDataSourceArray.call(this);
            if (array && (indexOrId === array.length)) {
                indexOrId = -1;
            }
            if (indexOrId === -1) {
                dataSource.push(renderable);
            }
            else if (indexOrId === 0) {
                if (dataSource === this._viewSequence) {
                    dataSource.splice(0, 0, renderable);
                    if (this._viewSequence.getIndex() === 0) {
                        var nextViewSequence = this._viewSequence.getNext();
                        if (nextViewSequence && nextViewSequence.get()) {
                            this._viewSequence = nextViewSequence;
                        }
                    }
                }
                else {
                    dataSource.splice(0, 0, renderable);
                }
            }
            else {
                dataSource.splice(indexOrId, 0, renderable);
            }
        }

        // When a custom insert-spec was specified, store that in the layout-node
        if (insertSpec) {
            this._nodes.insertNode(this._nodes.createNode(renderable, insertSpec));
        }

        // Auto pipe events
        if (this.options.autoPipeEvents && renderable && renderable.pipe) {
            renderable.pipe(this);
            renderable.pipe(this._eventOutput);
        }

        // Force a reflow
        this._isDirty = true;

        return this;
    };

    /**
     * Adds a renderable to the end of a sequential data-source.
     *
     * The optional argument `insertSpec` is only used `flow` mode is enabled.
     * When specified, the renderable is inserted using an animation starting with
     * size, origin, opacity, transform, etc... as specified in `insertSpec'.
     *
     * @param {Object} renderable Renderable to add to the data-source
     * @param {Spec} [insertSpec] Size, transform, etc.. to start with when inserting
     * @return {LayoutController} this
     */
    LayoutController.prototype.push = function(renderable, insertSpec) {
        return this.insert(-1, renderable, insertSpec);
    };

    /**
     * Helper function for finding the view-sequence node at the given position.
     */
    function _getViewSequenceAtIndex(index, startViewSequence) {
        var viewSequence = startViewSequence || this._viewSequence;
        var i = viewSequence ? viewSequence.getIndex() : index;
        if (index > i) {
            while (viewSequence) {
                viewSequence = viewSequence.getNext();
                if (!viewSequence) {
                    return undefined;
                }
                i = viewSequence.getIndex();
                if (i === index) {
                    return viewSequence;
                }
                else if (index < i) {
                    return undefined;
                }
            }
        }
        else if (index < i) {
            while (viewSequence) {
                viewSequence = viewSequence.getPrevious();
                if (!viewSequence) {
                    return undefined;
                }
                i = viewSequence.getIndex();
                if (i === index) {
                    return viewSequence;
                }
                else if (index > i) {
                    return undefined;
                }
            }
        }
        return viewSequence;
    }

    /**
     * Helper that return the underlying array datasource if available.
     */
    function _getDataSourceArray() {
      if (Array.isArray(this._dataSource)) {
        return this._dataSource;
      }
      else if (this._viewSequence || this._viewSequence._) {
        return this._viewSequence._.array;
      }
      return undefined;
    }

    /**
     * Get the renderable at the given index or Id.
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @return {Renderable} renderable or `undefined`
     */
    LayoutController.prototype.get = function(indexOrId) {
      if (this._nodesById || (indexOrId instanceof String) || (typeof indexOrId === 'string')) {
        return this._nodesById[indexOrId];
      }
      var viewSequence = _getViewSequenceAtIndex.call(this, indexOrId);
      return viewSequence ? viewSequence.get() : undefined;
    };

    /**
     * Swaps two renderables at the given positions.
     *
     * This method is only supported for dataSources of type Array or ViewSequence.
     *
     * @param {Number} index Index of the renderable to swap
     * @param {Number} index2 Index of the renderable to swap with
     * @return {LayoutController} this
     */
    LayoutController.prototype.swap = function(index, index2) {
        var array = _getDataSourceArray.call(this);
        if (!array) {
            throw '.swap is only supported for dataSources of type Array or ViewSequence';
        }
        if (index === index2) {
          return this;
        }
        if ((index < 0) || (index >= array.length)) {
          throw 'Invalid index (' + index + ') specified to .swap';
        }
        if ((index2 < 0) || (index2 >= array.length)) {
          throw 'Invalid second index (' + index2 + ') specified to .swap';
        }
        var renderNode = array[index];
        array[index] = array[index2];
        array[index2] = renderNode;
        this._isDirty = true;
        return this;
    };

    /**
     * Replaces a renderable at the given index or id.
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @param {Renderable} renderable renderable to replace with
     * @param {Bool} [noAnimation] When set to `true`, replaces the renderable without any flowing animation.
     * @return {Renderable} old renderable that has been replaced
     */
    LayoutController.prototype.replace = function(indexOrId, renderable, noAnimation) {
        var oldRenderable;
        if (this._nodesById || (indexOrId instanceof String) || (typeof indexOrId === 'string')) {
            oldRenderable = this._nodesById[indexOrId];
            if (oldRenderable !== renderable) {
                if (noAnimation && oldRenderable) {
                    var node = this._nodes.getNodeByRenderNode(oldRenderable);
                    if (node) {
                        node.setRenderNode(renderable);
                    }
                }
                this._nodesById[indexOrId] = renderable;
                this._isDirty = true;
            }
            return oldRenderable;
        }
        var array = _getDataSourceArray.call(this);
        if (!array) {
          return undefined;
        }
        if ((indexOrId < 0) || (indexOrId >= array.length)) {
          throw 'Invalid index (' + indexOrId + ') specified to .replace';
        }
        oldRenderable = array[indexOrId];
        if (oldRenderable !== renderable) {
          array[indexOrId] = renderable;
          this._isDirty = true;
        }
        return oldRenderable;
    };

    /**
     * Moves a renderable to a new index.
     *
     * This method is only supported for dataSources of type Array or ViewSequence.
     *
     * @param {Number} index Index of the renderable to move.
     * @param {Number} newIndex New index of the renderable.
     * @return {LayoutController} this
     */
    LayoutController.prototype.move = function(index, newIndex) {
        var array = _getDataSourceArray.call(this);
        if (!array) {
            throw '.move is only supported for dataSources of type Array or ViewSequence';
        }
        if ((index < 0) || (index >= array.length)) {
          throw 'Invalid index (' + index + ') specified to .move';
        }
        if ((newIndex < 0) || (newIndex >= array.length)) {
          throw 'Invalid newIndex (' + newIndex + ') specified to .move';
        }
        var item = array.splice(index, 1)[0];
        array.splice(newIndex, 0, item);
        this._isDirty = true;
        return this;
    };

    /**
     * Removes a renderable from the data-source.
     *
     * The optional argument `removeSpec` is only used `flow` mode is enabled.
     * When specified, the renderable is removed using an animation ending at
     * the size, origin, opacity, transform, etc... as specified in `removeSpec'.
     *
     * @param {Number|String|Renderable} indexOrId Index, id (String) or renderable to remove.
     * @param {Spec} [removeSpec] Size, transform, etc.. to end with when removing
     * @return {Renderable} renderable that has been removed
     */
    LayoutController.prototype.remove = function(indexOrId, removeSpec) {
        var renderNode;

        // Remove the renderable in case of an id (String)
        if (this._nodesById || (indexOrId instanceof String) || (typeof indexOrId === 'string')) {

            // Find and remove renderable from data-source
            if ((indexOrId instanceof String) || (typeof indexOrId === 'string')) {
                renderNode = this._nodesById[indexOrId];
                if (renderNode) {
                    delete this._nodesById[indexOrId];
                }
            }
            else {
                for (var key in this._nodesById) {
                    if (this._nodesById[key] === indexOrId) {
                        delete this._nodesById[key];
                        renderNode = indexOrId;
                        break;
                    }
                }
            }
        }

        // Remove the renderable using an index
        else if ((indexOrId instanceof Number) || (typeof indexOrId === 'number')) {
            var array = _getDataSourceArray.call(this);
            if (!array || (indexOrId < 0) || (indexOrId >= array.length)) {
                throw 'Invalid index (' + indexOrId + ') specified to .remove (or dataSource doesn\'t support remove)';
            }
            renderNode = array[indexOrId];
            this._dataSource.splice(indexOrId, 1);
        }

        // Remove by renderable
        else {
            indexOrId = this._dataSource.indexOf(indexOrId);
            if (indexOrId >= 0) {
                this._dataSource.splice(indexOrId, 1);
                renderNode = indexOrId;
            }
        }

        // When a node is removed from the view-sequence, the current this._viewSequence
        // node may not be part of the valid view-sequence anymore. This seems to be a bug
        // in the famo.us ViewSequence implementation/concept. The following check was added
        // to ensure that always a valid viewSequence node is selected into the ScrollView.
        if (this._viewSequence && renderNode) {
            var viewSequence = _getViewSequenceAtIndex.call(this, this._viewSequence.getIndex(), this._initialViewSequence);
            viewSequence = viewSequence || _getViewSequenceAtIndex.call(this, this._viewSequence.getIndex() - 1, this._initialViewSequence);
            viewSequence = viewSequence || this._dataSource;
            this._viewSequence = viewSequence;
        }

        // When a custom remove-spec was specified, store that in the layout-node
        if (renderNode && removeSpec) {
            var node = this._nodes.getNodeByRenderNode(renderNode);
            if (node) {
                node.remove(removeSpec || this.options.flowOptions.removeSpec);
            }
        }

        // Force a reflow
        if (renderNode) {
            this._isDirty = true;
        }

        return renderNode;
    };

    /**
     * Removes all renderables from the data-source.
     *
     * The optional argument `removeSpec` is only used when `flow` mode is enabled.
     * When specified, the renderables are removed using an animation ending at
     * the size, origin, opacity, transform, etc... as specified in `removeSpec'.
     *
     * @param {Spec} [removeSpec] Size, transform, etc.. to end with when removing
     * @return {LayoutController} this
     */
    LayoutController.prototype.removeAll = function(removeSpec) {
        if (this._nodesById) {
            var dirty = false;
            for (var key in this._nodesById) {
                delete this._nodesById[key];
                dirty = true;
            }
            if (dirty) {
                this._isDirty = true;
            }
        }
        else if (this._dataSource){
            this.setDataSource([]);
        }
        if (removeSpec) {
            var node = this._nodes.getStartEnumNode();
            while (node) {
                node.remove(removeSpec || this.options.flowOptions.removeSpec);
                node = node._next;
            }
        }
        return this;
    };

    /**
     * Return size of contained element or `undefined` when size is not defined.
     *
     * @return {Array.Number} [width, height]
     */
    LayoutController.prototype.getSize = function() {
        return this._size || this.options.size;
    };

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {Object} Render spec for this component
     */
    LayoutController.prototype.render = function render() {
        return this.id;
    };

    /**
     * Apply changes from this component to the corresponding document element.
     * This includes changes to classes, styles, size, content, opacity, origin,
     * and matrix transforms.
     *
     * @private
     * @method commit
     * @param {Context} context commit context
     */
    LayoutController.prototype.commit = function commit(context) {
        var transform = context.transform;
        var origin = context.origin;
        var size = context.size;
        var opacity = context.opacity;

        // Reset the flow-state when requested
        if (this._resetFlowState) {
            this._resetFlowState = false;
            this._isDirty = true;
            this._nodes.removeAll();
        }

        // When the size or layout function has changed, reflow the layout
        if (size[0] !== this._contextSizeCache[0] ||
            size[1] !== this._contextSizeCache[1] ||
            this._isDirty ||
            this._nodes._trueSizeRequested ||
            this.options.alwaysLayout){

            // Emit start event
            var eventData = {
                target: this,
                oldSize: this._contextSizeCache,
                size: size,
                dirty: this._isDirty,
                trueSizeRequested: this._nodes._trueSizeRequested
            };
            this._eventOutput.emit('layoutstart', eventData);

            // When the layout has changed, and we are not just scrolling,
            // disable the locked state of the layout-nodes so that they
            // can freely transition between the old and new state.
            if (this.options.flow) {
                var lock = false;
                if (!this.options.flowOptions.reflowOnResize) {
                    if (!this._isDirty &&
                        ((size[0] !== this._contextSizeCache[0]) ||
                         (size[1] !== this._contextSizeCache[1]))) {
                        lock = undefined;
                    }
                    else {
                      lock = true;
                    }
                }
                if (lock !== undefined) {
                    var node = this._nodes.getStartEnumNode();
                    while (node) {
                        node.releaseLock(lock);
                        node = node._next;
                    }
                }
            }

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._isDirty = false;

            // Prepare for layout
            var scrollEnd;
            if (this.options.size && (this.options.size[this._direction] === true)) {
                scrollEnd = 1000000; // calculate scroll-length
            }
            var layoutContext = this._nodes.prepareForLayout(
                this._viewSequence,     // first node to layout
                this._nodesById, {      // so we can do fast id lookups
                    size: size,
                    direction: this._direction,
                    scrollEnd: scrollEnd
                }
            );

            // Layout objects
            if (this._layout._function) {
                this._layout._function(
                    layoutContext,          // context which the layout-function can use
                    this._layout.options    // additional layout-options
                );
            }

            // Mark non-invalidated nodes for removal
            this._nodes.removeNonInvalidatedNodes(this.options.flowOptions.removeSpec);

            // Cleanup any nodes in case of a VirtualViewSequence
            this._nodes.removeVirtualViewSequenceNodes();

            // Calculate scroll-length and use that as the true-size (height)
            if (scrollEnd) {
                scrollEnd = 0;
                node = this._nodes.getStartEnumNode();
                while (node) {
                    if (node._invalidated && node.scrollLength) {
                        scrollEnd += node.scrollLength;
                    }
                    node = node._next;
                }
                this._size = this._size || [0, 0];
                this._size[0] = this.options.size[0];
                this._size[1] = this.options.size[1];
                this._size[this._direction] = scrollEnd;
            }

            // Update output and optionally emit event
            var result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
            this._specs = result.specs;
            this._commitOutput.target = result.specs;
            this._eventOutput.emit('layoutend', eventData);
            this._eventOutput.emit('reflow', {
                target: this
            });
        }
        else if (this.options.flow) {

            // Update output and optionally emit event
            result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
            this._specs = result.specs;
            this._commitOutput.target = result.specs;
            if (result.modified) {
                this._eventOutput.emit('reflow', {
                    target: this
                });
            }
        }

        // Render child-nodes every commit
        var target = this._commitOutput.target;
        for (var i = 0, j = target.length; i < j; i++) {
            if (target[i].renderNode) {
                target[i].target = target[i].renderNode.render();
            }
        }

        // Add our cleanup-registration id also to the list, so that the
        // cleanup function is called by famo.us when the LayoutController is
        // removed from the render-tree.
        if (!target.length || (target[target.length-1] !== this._cleanupRegistration)) {
            target.push(this._cleanupRegistration);
        }

        // Translate dependent on origin
        if (origin && ((origin[0] !== 0) || (origin[1] !== 0))) {
            transform = Transform.moveThen([-size[0]*origin[0], -size[1]*origin[1], 0], transform);
        }
        this._commitOutput.size = size;
        this._commitOutput.opacity = opacity;
        this._commitOutput.transform = transform;
        return this._commitOutput;
    };

    /**
     * Called whenever the layout-controller is removed from the render-tree.
     *
     * @private
     * @param {Context} context cleanup context
     */
    LayoutController.prototype.cleanup = function(context) {
        if (this.options.flow) {
            this._resetFlowState = true;
        }
    };

    module.exports = LayoutController;
});

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
 * Scrollable layout-controller.
 *
 * Key features:
 * -    Customizable layout
 * -    Insert/remove renderables into the scene using animations/spec
 * -    Support for `true` size renderables
 * -    Horizontal/vertical direction
 * -    Top/left or bottom/right alignment
 * -    Pagination
 * -    Option to embed in a ContainerSurface
 *
 * Events:
 *
 * |event      |description|
 * |-----------|-----------|
 * |scrollstart|Emitted when scrolling starts.|
 * |scroll     |Emitted as the content scrolls (once for each frame the visible offset has changed).|
 * |pagechange |Emitted whenever the visible page changes.|
 * |scrollend  |Emitted after scrolling stops (when the scroll particle settles).|
 *
 * Inherited from: [LayoutController](./LayoutController.md)
 * @module
 */
define('famous-flex/ScrollController',['require','exports','module','./LayoutUtility','./LayoutController','./LayoutNode','./FlowLayoutNode','./LayoutNodeManager','famous/surfaces/ContainerSurface','famous/core/Transform','famous/core/EventHandler','famous/core/Group','famous/math/Vector','famous/physics/PhysicsEngine','famous/physics/bodies/Particle','famous/physics/forces/Drag','famous/physics/forces/Spring','famous/inputs/ScrollSync','famous/core/ViewSequence'],function(require, exports, module) {

    // import dependencies
    var LayoutUtility = require('./LayoutUtility');
    var LayoutController = require('./LayoutController');
    var LayoutNode = require('./LayoutNode');
    var FlowLayoutNode = require('./FlowLayoutNode');
    var LayoutNodeManager = require('./LayoutNodeManager');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Transform = require('famous/core/Transform');
    var EventHandler = require('famous/core/EventHandler');
    var Group = require('famous/core/Group');
    var Vector = require('famous/math/Vector');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Particle = require('famous/physics/bodies/Particle');
    var Drag = require('famous/physics/forces/Drag');
    var Spring = require('famous/physics/forces/Spring');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var ViewSequence = require('famous/core/ViewSequence');

    /**
     * Boudary reached detection
     */
    var Bounds = {
        NONE: 0,
        PREV: 1, // top
        NEXT: 2, // bottom
        BOTH: 3
    };

    /**
     * Source of the spring
     */
    var SpringSource = {
        NONE: 'none',
        NEXTBOUNDS: 'next-bounds', // top
        PREVBOUNDS: 'prev-bounds', // bottom
        MINSIZE: 'minimal-size',
        GOTOSEQUENCE: 'goto-sequence',
        ENSUREVISIBLE: 'ensure-visible',
        GOTOPREVDIRECTION: 'goto-prev-direction',
        GOTONEXTDIRECTION: 'goto-next-direction'
    };

    /**
     * Pagination modes
     */
    var PaginationMode = {
        PAGE: 0,
        SCROLL: 1
    };

    /**
     * @class
     * @extends LayoutController
     * @param {Object} options Configurable options (see LayoutController for all inherited options).
     * @param {Bool} [options.useContainer] Embeds the view in a ContainerSurface to hide any overflow and capture input events (default: `false`).
     * @param {String} [options.container] Options that are passed to the ContainerSurface in case `useContainer` is true.
     * @param {Bool} [options.paginated] Enabled pagination when set to `true` (default: `false`).
     * @param {Number} [options.paginationEnergyThresshold] Thresshold after which pagination kicks in (default: `0.01`).
     * @param {PaginationMode} [options.paginationMode] Pagination-mode (either page-based or scroll-based) (default: `PaginationMode.PAGE`).
     * @param {Number} [options.alignment] Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`).
     * @param {Bool} [options.mouseMove] Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`).
     * @param {Bool} [options.enabled] Enables or disabled user input (default: `true`).
     * @param {Bool} [options.overscroll] Enables or disables overscroll (default: `true`).
     * @param {Object} [options.scrollParticle] Options for the scroll particle (default: `{}`)
     * @param {Object} [options.scrollSpring] Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 350}`)
     * @param {Object} [options.scrollDrag] Drag-force options to apply on the scroll particle
     * @param {Object} [options.scrollFriction] Friction-force options to apply on the scroll particle
     * @param {Bool} [options.layoutAll] When set to true, always lays out all renderables in the datasource (default: `false`).
     * @alias module:ScrollController
     */
    function ScrollController(options) {
        options = LayoutUtility.combineOptions(ScrollController.DEFAULT_OPTIONS, options);
        var layoutManager = new LayoutNodeManager(options.flow ? FlowLayoutNode : LayoutNode, _initLayoutNode.bind(this));
        LayoutController.call(this, options, layoutManager);

        // Scrolling
        this._scroll = {
            activeTouches: [],
            // physics-engine to use for scrolling
            pe: new PhysicsEngine(),
            // particle that represents the scroll-offset
            particle: new Particle(this.options.scrollParticle),
            // drag-force that slows the particle down after a "flick"
            dragForce: new Drag(this.options.scrollDrag),
            frictionForce: new Drag(this.options.scrollFriction),
            // spring
            springValue: undefined,
            springForce: new Spring(this.options.scrollSpring),
            springEndState: new Vector([0, 0, 0]),
            // group
            groupStart: 0,
            groupTranslate: [0, 0, 0],
            // delta
            scrollDelta: 0,
            normalizedScrollDelta: 0,
            scrollForce: 0,
            scrollForceCount: 0,
            unnormalizedScrollOffset: 0,
            // state
            isScrolling: false
        };

        // Diagnostics
        this._debug = {
            layoutCount: 0,
            commitCount: 0
        };

        // Create groupt for faster rendering
        this.group = new Group();
        this.group.add({render: _innerRender.bind(this)});

        // Configure physics engine with particle and drag
        this._scroll.pe.addBody(this._scroll.particle);
        if (!this.options.scrollDrag.disabled) {
            this._scroll.dragForceId = this._scroll.pe.attach(this._scroll.dragForce, this._scroll.particle);
        }
        if (!this.options.scrollFriction.disabled) {
            this._scroll.frictionForceId = this._scroll.pe.attach(this._scroll.frictionForce, this._scroll.particle);
        }
        this._scroll.springForce.setOptions({ anchor: this._scroll.springEndState });

        // Listen to touch events
        this._eventInput.on('touchstart', _touchStart.bind(this));
        this._eventInput.on('touchmove', _touchMove.bind(this));
        this._eventInput.on('touchend', _touchEnd.bind(this));
        this._eventInput.on('touchcancel', _touchEnd.bind(this));

        // Listen to mouse-move events
        this._eventInput.on('mousedown', _mouseDown.bind(this));
        this._eventInput.on('mouseup', _mouseUp.bind(this));
        this._eventInput.on('mousemove', _mouseMove.bind(this));

        // Listen to mouse-wheel events
        this._scrollSync = new ScrollSync(this.options.scrollSync);
        this._eventInput.pipe(this._scrollSync);
        this._scrollSync.on('update', _scrollUpdate.bind(this));

        // Embed in container surface if neccesary
        if (this.options.useContainer) {
            this.container = new ContainerSurface(this.options.container);

            // Create container surface, which has one child, which just returns
            // the entity-id of this scrollview. This causes the Commit function
            // of this scrollview to be called
            this.container.add({
                render: function() {
                    return this.id;
                }.bind(this)
            });

            // Pipe events received in container to this scrollview
            if (!this.options.autoPipeEvents) {
                this.subscribe(this.container);
                EventHandler.setInputHandler(this.container, this);
                EventHandler.setOutputHandler(this.container, this);
            }
        }
    }
    ScrollController.prototype = Object.create(LayoutController.prototype);
    ScrollController.prototype.constructor = ScrollController;
    ScrollController.Bounds = Bounds;
    ScrollController.PaginationMode = PaginationMode;

    ScrollController.DEFAULT_OPTIONS = {
        useContainer: false,    // when true embeds inside a ContainerSurface for capturing input events & clipping
        container: {
            properties: {
                overflow: 'hidden' // overflow mode when useContainer is enabled
            }
        },
        scrollParticle: {
            // use defaults
        },
        scrollDrag: {
            forceFunction: Drag.FORCE_FUNCTIONS.QUADRATIC,
            strength: 0.001,
            disabled: true
        },
        scrollFriction: {
            forceFunction: Drag.FORCE_FUNCTIONS.LINEAR,
            strength: 0.0025,
            disabled: false
        },
        scrollSpring: {
            dampingRatio: 1.0,
            period: 350
        },
        scrollSync: {
            scale: 0.2
        },
        overscroll: true,
        paginated: false,
        paginationMode: PaginationMode.PAGE,
        paginationEnergyThresshold: 0.01,
        alignment: 0,         // [0: top/left, 1: bottom/right]
        touchMoveDirectionThresshold: undefined, // 0..1
        touchMoveNoVelocityDuration: 100,
        mouseMove: false,
        enabled: true,          // set to false to disable scrolling
        layoutAll: false,       // set to true is you want all renderables layed out/rendered
        alwaysLayout: false,    // set to true to always call the layout function
        extraBoundsSpace: [100, 100],
        debug: false
    };

    /**
     * Patches the ScrollController instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options (see LayoutController for all inherited options).
     * @param {Bool} [options.paginated] Enabled pagination when set to `true` (default: `false`).
     * @param {Number} [options.paginationEnergyThresshold] Thresshold after which pagination kicks in (default: `0.01`).
     * @param {PaginationMode} [options.paginationMode] Pagination-mode (either page-based or scroll-based) (default: `PaginationMode.PAGE`).
     * @param {Number} [options.alignment] Alignment of the renderables (0 = top/left, 1 = bottom/right) (default: `0`).
     * @param {Bool} [options.mouseMove] Enables scrolling by holding the mouse-button down and moving the mouse (default: `false`).
     * @param {Bool} [options.enabled] Enables or disables user input (default: `true`).
     * @param {Bool} [options.overscroll] Enables or disables overscroll (default: `true`).
     * @param {Object} [options.scrollParticle] Options for the scroll particle (default: `{}`)
     * @param {Object} [options.scrollSpring] Spring-force options that are applied on the scroll particle when e.g. bounds is reached (default: `{dampingRatio: 1.0, period: 500}`)
     * @param {Object} [options.scrollDrag] Drag-force options to apply on the scroll particle
     * @param {Object} [options.scrollFriction] Friction-force options to apply on the scroll particle
     * @param {Bool} [options.layoutAll] When set to true, always lays out all renderables in the datasource (default: `false`).
     * @return {ScrollController} this
     */
    ScrollController.prototype.setOptions = function(options) {
        LayoutController.prototype.setOptions.call(this, options);
        if (this._scroll) {
            if (options.scrollSpring) {
                this._scroll.springForce.setOptions(options.scrollSpring);
            }
            if (options.scrollDrag) {
                this._scroll.dragForce.setOptions(options.scrollDrag);
            }
        }
        if (options.scrollSync && this._scrollSync) {
            this._scrollSync.setOptions(options.scrollSync);
        }
        return this;
    };

    /**
     * Called whenever a layout-node is created/re-used. Initializes
     * the node with the `insertSpec` if it has been defined and enabled
     * locking of the x/y translation so that the x/y position of the renderable
     * is immediately updated when the user scrolls the view.
     */
    function _initLayoutNode(node, spec) {
        if (!spec && this.options.flowOptions.insertSpec) {
            node.setSpec(this.options.flowOptions.insertSpec);
        }
    }

    /**
     * Helper that detects when layout is scrolling optimized (default: true).
     */
    function _isSequentiallyScrollingOptimized() {
        return !this._layout.capabilities ||
                (this._layout.capabilities.sequentialScrollingOptimized === undefined) ||
                this._layout.capabilities.sequentialScrollingOptimized;
    }

    /**
     * Helper function for logging debug statements to the console.
     */
    /*function _log(args) {
        if (!this.options.debug) {
            return;
        }
        var message = this._debug.commitCount + ': ';
        for (var i = 0, j = arguments.length; i < j; i++) {
            var arg = arguments[i];
            if ((arg instanceof Object) || (arg instanceof Array)) {
                message += JSON.stringify(arg);
            }
            else {
                message += arg;
            }
        }
        console.log(message);
    }*/

    /**
     * Sets the value for the spring, or set to `undefined` to disable the spring
     */
    function _updateSpring() {
        var springValue = this._scroll.scrollForceCount ? undefined : this._scroll.springPosition;
        if (this._scroll.springValue !== springValue) {
            this._scroll.springValue = springValue;
            if (springValue === undefined) {
                if (this._scroll.springForceId !== undefined) {
                    this._scroll.pe.detach(this._scroll.springForceId);
                    this._scroll.springForceId = undefined;
                    //_log.call(this, 'disabled spring');
                }
            }
            else {
                if (this._scroll.springForceId === undefined) {
                    this._scroll.springForceId = this._scroll.pe.attach(this._scroll.springForce, this._scroll.particle);
                }
                this._scroll.springEndState.set1D(springValue);
                this._scroll.pe.wake();
                //_log.call(this, 'setting spring to: ', springValue, ' (', this._scroll.springSource, ')');
            }
        }
    }

    /**
     * Returns the time from the given input event.
     */
    function _getEventTimestamp(event) {
        return event.timeStamp || Date.now();
    }

    /**
     * Called whenever the user presses the mouse button on the scrollview
     */
    function _mouseDown(event) {

        // Check whether mouse-scrolling is enabled
        if (!this.options.mouseMove) {
            return;
        }

        // Reset any previous mouse-move operation that has not yet been
        // cleared.
        if (this._scroll.mouseMove) {
            this.releaseScrollForce(this._scroll.mouseMove.delta);
        }

        // Calculate start of move operation
        var current = [event.clientX, event.clientY];
        var time = _getEventTimestamp(event);
        this._scroll.mouseMove = {
            delta: 0,
            start: current,
            current: current,
            prev: current,
            time: time,
            prevTime: time
        };

        // Apply scroll force
        this.applyScrollForce(this._scroll.mouseMove.delta);
    }
    function _mouseMove(event) {

        // Check if any mouse-move is active
        if (!this._scroll.mouseMove || !this.options.enabled) {
            return;
        }

        // When a thresshold is configured, check whether the move operation (x/y ratio)
        // lies within the thresshold. A move of 10 pixels x and 10 pixels y is considered 45 deg,
        // which corresponds to a thresshold of 0.5.
        var moveDirection = Math.atan2(
            Math.abs(event.clientY - this._scroll.mouseMove.prev[1]),
            Math.abs(event.clientX - this._scroll.mouseMove.prev[0])) / (Math.PI / 2.0);
        var directionDiff = Math.abs(this._direction - moveDirection);
        if ((this.options.touchMoveDirectionThresshold === undefined) || (directionDiff <= this.options.touchMoveDirectionThresshold)){
            this._scroll.mouseMove.prev = this._scroll.mouseMove.current;
            this._scroll.mouseMove.current = [event.clientX, event.clientY];
            this._scroll.mouseMove.prevTime = this._scroll.mouseMove.time;
            this._scroll.mouseMove.direction = moveDirection;
            this._scroll.mouseMove.time = _getEventTimestamp(event);
        }

        // Update scroll-force
        var delta = this._scroll.mouseMove.current[this._direction] - this._scroll.mouseMove.start[this._direction];
        this.updateScrollForce(this._scroll.mouseMove.delta, delta);
        this._scroll.mouseMove.delta = delta;
    }
    function _mouseUp(event) {

        // Check if any mouse-move is active
        if (!this._scroll.mouseMove) {
            return;
        }

        // Calculate delta and velocity
        var velocity = 0;
        var diffTime = this._scroll.mouseMove.time - this._scroll.mouseMove.prevTime;
        if ((diffTime > 0) && ((_getEventTimestamp(event) - this._scroll.mouseMove.time) <= this.options.touchMoveNoVelocityDuration)) {
            var diffOffset = this._scroll.mouseMove.current[this._direction] - this._scroll.mouseMove.prev[this._direction];
            velocity = diffOffset / diffTime;
        }

        // Release scroll force
        this.releaseScrollForce(this._scroll.mouseMove.delta, velocity);
        this._scroll.mouseMove = undefined;
    }

    /**
     * Called whenever the user starts moving the scroll-view, using
     * touch gestures.
     */
    function _touchStart(event) {

        // Create touch-end event listener
        if (!this._touchEndEventListener) {
            this._touchEndEventListener = function(event2) {
                event2.target.removeEventListener('touchend', this._touchEndEventListener);
                _touchEnd.call(this, event2);
            }.bind(this);
        }

        // Remove any touches that are no longer active
        var oldTouchesCount = this._scroll.activeTouches.length;
        var i = 0;
        var j;
        var touchFound;
        while (i < this._scroll.activeTouches.length) {
            var activeTouch = this._scroll.activeTouches[i];
            touchFound = false;
            for (j = 0; j < event.touches.length; j++) {
                var touch = event.touches[j];
                if (touch.identifier === activeTouch.id) {
                    touchFound = true;
                    break;
                }
            }
            if (!touchFound) {
                //_log.cal(this, 'removing touch with id: ', activeTouch.id);
                this._scroll.activeTouches.splice(i, 1);
            }
            else {
                i++;
            }
        }

        // Process touch
        for (i = 0; i < event.touches.length; i++) {
            var changedTouch = event.touches[i];
            touchFound = false;
            for (j = 0; j < this._scroll.activeTouches.length; j++) {
                if (this._scroll.activeTouches[j].id === changedTouch.identifier) {
                    touchFound = true;
                    break;
                }
            }
            if (!touchFound) {
                var current = [changedTouch.clientX, changedTouch.clientY];
                var time = _getEventTimestamp(event);
                this._scroll.activeTouches.push({
                    id: changedTouch.identifier,
                    start: current,
                    current: current,
                    prev: current,
                    time: time,
                    prevTime: time
                });

                // The following listener is automatically removed after touchend is received
                // and ensures that the scrollview always received touchend.
                changedTouch.target.addEventListener('touchend', this._touchEndEventListener);
            }
        }

        // The first time a touch new touch gesture has arrived, emit event
        if (!oldTouchesCount && this._scroll.activeTouches.length) {
            this.applyScrollForce(0);
            this._scroll.touchDelta = 0;
        }
    }

    /**
     * Called whenever the user is moving his/her fingers to scroll the view.
     * Updates the moveOffset so that the scroll-offset on the view is updated.
     */
    function _touchMove(event) {
        if (!this.options.enabled) {
            return;
        }

        // Process the touch event
        var primaryTouch;
        for (var i = 0; i < event.changedTouches.length; i++) {
            var changedTouch = event.changedTouches[i];
            for (var j = 0; j < this._scroll.activeTouches.length; j++) {
                var touch = this._scroll.activeTouches[j];
                if (touch.id === changedTouch.identifier) {

                    // When a thresshold is configured, check whether the move operation (x/y ratio)
                    // lies within the thresshold. A move of 10 pixels x and 10 pixels y is considered 45 deg,
                    // which corresponds to a thresshold of 0.5.
                    var moveDirection = Math.atan2(
                        Math.abs(changedTouch.clientY - touch.prev[1]),
                        Math.abs(changedTouch.clientX - touch.prev[0])) / (Math.PI / 2.0);
                    var directionDiff = Math.abs(this._direction - moveDirection);
                    if ((this.options.touchMoveDirectionThresshold === undefined) || (directionDiff <= this.options.touchMoveDirectionThresshold)){
                        touch.prev = touch.current;
                        touch.current = [changedTouch.clientX, changedTouch.clientY];
                        touch.prevTime = touch.time;
                        touch.direction = moveDirection;
                        touch.time = _getEventTimestamp(event);
                        primaryTouch = (j === 0) ? touch : undefined;
                    }
                }
            }
        }

        // Update move offset and emit event
        if (primaryTouch) {
            var delta = primaryTouch.current[this._direction] - primaryTouch.start[this._direction];
            this.updateScrollForce(this._scroll.touchDelta, delta);
            this._scroll.touchDelta = delta;
        }
    }

    /**
     * Called whenever the user releases his fingers and the touch gesture
     * has completed. This will set the new position and if the user used a 'flick'
     * gesture give the scroll-offset particle a velocity and momentum into a
     * certain direction.
     */
    function _touchEnd(event) {

        // Remove touch
        var primaryTouch = this._scroll.activeTouches.length ? this._scroll.activeTouches[0] : undefined;
        for (var i = 0; i < event.changedTouches.length; i++) {
            var changedTouch = event.changedTouches[i];
            for (var j = 0; j < this._scroll.activeTouches.length; j++) {
                var touch = this._scroll.activeTouches[j];
                if (touch.id === changedTouch.identifier) {

                    // Remove touch from active-touches
                    this._scroll.activeTouches.splice(j, 1);

                    // When a different touch now becomes the primary touch, update
                    // its start position to match the current move offset.
                    if ((j === 0) && this._scroll.activeTouches.length) {
                        var newPrimaryTouch = this._scroll.activeTouches[0];
                        newPrimaryTouch.start[0] = newPrimaryTouch.current[0] - (touch.current[0] - touch.start[0]);
                        newPrimaryTouch.start[1] = newPrimaryTouch.current[1] - (touch.current[1] - touch.start[1]);
                    }
                    break;
                }
            }
        }

        // Wait for all fingers to be released from the screen before resetting the move-spring
        if (!primaryTouch || this._scroll.activeTouches.length) {
            return;
        }

        // Determine velocity and add to particle
        var velocity = 0;
        var diffTime = primaryTouch.time - primaryTouch.prevTime;
        if ((diffTime > 0) && ((_getEventTimestamp(event) - primaryTouch.time) <= this.options.touchMoveNoVelocityDuration)) {
            var diffOffset = primaryTouch.current[this._direction] - primaryTouch.prev[this._direction];
            velocity = diffOffset / diffTime;
        }

        // Release scroll force
        var delta = this._scroll.touchDelta;
        this.releaseScrollForce(delta, velocity);
        this._scroll.touchDelta = 0;
    }

    /**
     * Called whenever the user is scrolling the view using either a mouse
     * scroll wheel or a track-pad.
     */
    function _scrollUpdate(event) {
        if (!this.options.enabled) {
            return;
        }
        var offset = Array.isArray(event.delta) ? event.delta[this._direction] : event.delta;
        this.scroll(offset);
    }

    /**
     * Updates the scroll offset particle.
     */
    function _setParticle(position, velocity, phase) {
        if (position !== undefined) {
            //var oldPosition = this._scroll.particle.getPosition1D();
            this._scroll.particleValue = position;
            this._scroll.particle.setPosition1D(position);
            //_log.call(this, 'setParticle.position: ', position, ' (old: ', oldPosition, ', delta: ', position - oldPosition, ', phase: ', phase, ')');
        }
        if (velocity !== undefined) {
            var oldVelocity = this._scroll.particle.getVelocity1D();
            if (oldVelocity !== velocity) {
                this._scroll.particle.setVelocity1D(velocity);
                //_log.call(this, 'setParticle.velocity: ', velocity, ' (old: ', oldVelocity, ', delta: ', velocity - oldVelocity, ', phase: ', phase, ')');
            }
        }
    }

    /**
     * Get the in-use scroll-offset.
     */
    function _calcScrollOffset(normalize, refreshParticle) {

        // When moving using touch-gestures, make the offset stick to the
        // finger. When the bounds is exceeded, decrease the scroll distance
        // by two.
        if (refreshParticle || (this._scroll.particleValue === undefined)) {
            this._scroll.particleValue = this._scroll.particle.getPosition1D();
            this._scroll.particleValue = Math.round(this._scroll.particleValue * 1000) / 1000;
        }

        // do stuff
        var scrollOffset = this._scroll.particleValue;
        if (this._scroll.scrollDelta || this._scroll.normalizedScrollDelta) {
            scrollOffset += this._scroll.scrollDelta + this._scroll.normalizedScrollDelta;
            if (((this._scroll.boundsReached & Bounds.PREV) && (scrollOffset > this._scroll.springPosition)) ||
               ((this._scroll.boundsReached & Bounds.NEXT) && (scrollOffset < this._scroll.springPosition)) ||
               (this._scroll.boundsReached === Bounds.BOTH)) {
                scrollOffset = this._scroll.springPosition;
            }
            if (normalize) {
                if (!this._scroll.scrollDelta) {
                    this._scroll.normalizedScrollDelta = 0;
                    _setParticle.call(this, scrollOffset, undefined, '_calcScrollOffset');
                }
                this._scroll.normalizedScrollDelta += this._scroll.scrollDelta;
                this._scroll.scrollDelta = 0;
            }
        }

        if (this._scroll.scrollForceCount && this._scroll.scrollForce) {
            if (this._scroll.springPosition !== undefined) {
                scrollOffset = (scrollOffset + this._scroll.scrollForce + this._scroll.springPosition) / 2.0;
            }
            else {
                scrollOffset += this._scroll.scrollForce;
            }
        }

        // Prevent the scroll position from exceeding the bounds when overscroll is disabled
        if (!this.options.overscroll) {
            if ((this._scroll.boundsReached === Bounds.BOTH) ||
                ((this._scroll.boundsReached === Bounds.PREV) && (scrollOffset > this._scroll.springPosition)) ||
                ((this._scroll.boundsReached === Bounds.NEXT) && (scrollOffset < this._scroll.springPosition))) {
                scrollOffset = this._scroll.springPosition;
            }
        }

        //_log.call(this, 'scrollOffset: ', scrollOffset, ', particle:', this._scroll.particle.getPosition1D(), ', moveToPosition: ', this._scroll.moveToPosition, ', springPosition: ', this._scroll.springPosition);
        return scrollOffset;
    }

    /**
     * Helper function that calculates the next/prev layed out height.
     * @private
     */
    ScrollController.prototype._calcScrollHeight = function(next, lastNodeOnly) {
        var calcedHeight = 0;
        var node = this._nodes.getStartEnumNode(next);
        while (node) {
            if (node._invalidated) {
                if (node.trueSizeRequested) {
                    calcedHeight = undefined;
                    break;
                }
                if (node.scrollLength !== undefined) {
                    calcedHeight = lastNodeOnly ? node.scrollLength : (calcedHeight + node.scrollLength);
                    if (!next && lastNodeOnly) {
                        break;
                    }
                }
            }
            node = next ? node._next : node._prev;
        }
        return calcedHeight;
    };

    /**
     * Calculates the scroll boundaries and sets the spring accordingly.
     */
    function _calcBounds(size, scrollOffset) {

        // Local data
        var prevHeight = this._calcScrollHeight(false);
        var nextHeight = this._calcScrollHeight(true);
        var enforeMinSize = _isSequentiallyScrollingOptimized.call(this);

        // 1. When the rendered height is smaller than the total height,
        //    then lock to the primary bounds
        var totalHeight;
        if (enforeMinSize) {
            if ((nextHeight !== undefined) && (prevHeight !== undefined)) {
                totalHeight = prevHeight + nextHeight;
            }
            if ((totalHeight !== undefined) && (totalHeight <= size[this._direction])) {
                this._scroll.boundsReached = Bounds.BOTH;
                this._scroll.springPosition = this.options.alignment ? -nextHeight : prevHeight;
                this._scroll.springSource = SpringSource.MINSIZE;
                return;
            }
        }

        // 2. Check whether primary boundary has been reached
        if (this.options.alignment) {
            if (enforeMinSize) {
                if ((nextHeight !== undefined) && ((scrollOffset + nextHeight) <= 0)) {
                    this._scroll.boundsReached = Bounds.NEXT;
                    this._scroll.springPosition = -nextHeight;
                    this._scroll.springSource = SpringSource.NEXTBOUNDS;
                    return;
                }
            }
            else {
                var firstPrevItemHeight = this._calcScrollHeight(false, true);
                if ((nextHeight !== undefined) && firstPrevItemHeight && ((scrollOffset + nextHeight + size[this._direction]) <= firstPrevItemHeight)) {
                    this._scroll.boundsReached = Bounds.NEXT;
                    this._scroll.springPosition = nextHeight - (size[this._direction] - firstPrevItemHeight);
                    this._scroll.springSource = SpringSource.NEXTBOUNDS;
                    return;
                }
            }
        }
        else {
            if ((prevHeight !== undefined) && ((scrollOffset - prevHeight) >= 0)) {
                this._scroll.boundsReached = Bounds.PREV;
                this._scroll.springPosition = prevHeight;
                this._scroll.springSource = SpringSource.PREVBOUNDS;
                return;
            }
        }

        // 3. Check if secondary bounds has been reached
        if (this.options.alignment) {
            if ((prevHeight !== undefined) && ((scrollOffset - prevHeight) >= -size[this._direction])) {
                this._scroll.boundsReached = Bounds.PREV;
                this._scroll.springPosition = -size[this._direction] + prevHeight;
                this._scroll.springSource = SpringSource.PREVBOUNDS;
                return;
            }
        }
        else {
            var nextBounds = enforeMinSize ? size[this._direction] : this._calcScrollHeight(true, true);
            if ((nextHeight !== undefined) && ((scrollOffset + nextHeight) <= nextBounds)){
                this._scroll.boundsReached = Bounds.NEXT;
                this._scroll.springPosition = nextBounds - nextHeight;
                this._scroll.springSource = SpringSource.NEXTBOUNDS;
                return;
            }
        }

        // No bounds reached
        this._scroll.boundsReached = Bounds.NONE;
        this._scroll.springPosition = undefined;
        this._scroll.springSource = SpringSource.NONE;
    }

    /**
     * Calculates the scrollto-offset to which the spring is set.
     */
    function _calcScrollToOffset(size, scrollOffset) {
        var scrollToRenderNode = this._scroll.scrollToRenderNode || this._scroll.ensureVisibleRenderNode;
        if (!scrollToRenderNode) {
            return;
        }

        // 1. When boundary is reached, stop scrolling in that direction
        if ((this._scroll.boundsReached === Bounds.BOTH) ||
            (!this._scroll.scrollToDirection && (this._scroll.boundsReached === Bounds.PREV)) ||
            (this._scroll.scrollToDirection && (this._scroll.boundsReached === Bounds.NEXT))) {
            return;
        }

        // 2. Find the node to scroll to
        var foundNode;
        var scrollToOffset = 0;
        var node = this._nodes.getStartEnumNode(true);
        var count = 0;
        while (node) {
            count++;
            if (!node._invalidated || (node.scrollLength === undefined)) {
                break;
            }
            if (this.options.alignment) {
                scrollToOffset -= node.scrollLength;
            }
            if (node.renderNode === scrollToRenderNode) {
                foundNode = node;
                break;
            }
            if (!this.options.alignment) {
                scrollToOffset -= node.scrollLength;
            }
            node = node._next;
        }
        if (!foundNode) {
            scrollToOffset = 0;
            node = this._nodes.getStartEnumNode(false);
            while (node) {
                if (!node._invalidated || (node.scrollLength === undefined)) {
                   break;
                }
                if (!this.options.alignment) {
                    scrollToOffset += node.scrollLength;
                }
                if (node.renderNode === scrollToRenderNode) {
                    foundNode = node;
                    break;
                }
                if (this.options.alignment) {
                    scrollToOffset += node.scrollLength;
                }
                node = node._prev;
            }
        }

        // 3. Update springs
        if (foundNode) {
            if (this._scroll.ensureVisibleRenderNode) {
                if (this.options.alignment) {
                    if ((scrollToOffset - foundNode.scrollLength) < 0) {
                        this._scroll.springPosition = scrollToOffset;
                        this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                    }
                    else if (scrollToOffset > size[this._direction]) {
                        this._scroll.springPosition = size[this._direction] - scrollToOffset;
                        this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                    }
                    else {
                        if (!foundNode.trueSizeRequested) {
                            this._scroll.ensureVisibleRenderNode = undefined;
                        }
                    }
                }
                else {
                    scrollToOffset = -scrollToOffset;
                    if (scrollToOffset < 0) {
                        this._scroll.springPosition = scrollToOffset;
                        this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                    }
                    else if ((scrollToOffset + foundNode.scrollLength) > size[this._direction]) {
                        this._scroll.springPosition = size[this._direction] - (scrollToOffset + foundNode.scrollLength);
                        this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                    }
                    else {
                        if (!foundNode.trueSizeRequested) {
                          this._scroll.ensureVisibleRenderNode = undefined;
                        }
                    }
                }
            }
            else { // scrollToSequence
                this._scroll.springPosition = scrollToOffset;
                this._scroll.springSource = SpringSource.GOTOSEQUENCE;
            }
            return;
        }

        // 4. When node not found, keep searching
        if (this._scroll.scrollToDirection) {
            this._scroll.springPosition = scrollOffset - size[this._direction];
            this._scroll.springSource = SpringSource.GOTONEXTDIRECTION;

        }
        else {
            this._scroll.springPosition = scrollOffset + size[this._direction];
            this._scroll.springSource = SpringSource.GOTOPREVDIRECTION;
        }

        // 5. In case of a VirtualViewSequnce, make sure all the view-sequence nodes are touched, so
        //    that they are not cleaned up.
        if (this._viewSequence.cleanup) {
            var viewSequence = this._viewSequence;
            while (viewSequence.get() !== scrollToRenderNode) {
                viewSequence = this._scroll.scrollToDirection ? viewSequence.getNext(true) : viewSequence.getPrevious(true);
                if (!viewSequence) {
                    break;
                }
            }
        }
    }

    /**
     * Snaps to a page when pagination is enabled.
     */
    function _snapToPage() {

        // Check whether pagination is active
        if (!this.options.paginated ||
            this._scroll.scrollForceCount || //don't paginate while moving
            (this._scroll.springPosition !== undefined)) {
            return;
        }

        // When the energy is below the thresshold, paginate to the current page
        var item;
        switch (this.options.paginationMode) {
            case PaginationMode.SCROLL:
                if (!this.options.paginationEnergyThresshold || (Math.abs(this._scroll.particle.getEnergy()) <= this.options.paginationEnergyThresshold)) {
                    item = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
                    if (item && item.renderNode) {
                        this.goToRenderNode(item.renderNode);
                    }
                }
                break;
            case PaginationMode.PAGE:
                item = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
                if (item && item.renderNode) {
                    this.goToRenderNode(item.renderNode);
                }
                break;
        }
    }

    /**
     * Normalizes the view-sequence node so that the view-sequence is near to 0.
     */
    function _normalizePrevViewSequence(scrollOffset) {
        var count = 0;
        var normalizedScrollOffset = scrollOffset;
        var normalizeNextPrev = false;
        var node = this._nodes.getStartEnumNode(false);
        while (node) {
            if (!node._invalidated || !node._viewSequence) {
                break;
            }
            if (normalizeNextPrev) {
                this._viewSequence = node._viewSequence;
                normalizedScrollOffset = scrollOffset;
                normalizeNextPrev = false;
            }
            if ((node.scrollLength === undefined) || node.trueSizeRequested || (scrollOffset < 0)) {
                break;
            }
            scrollOffset -= node.scrollLength;
            count++;
            if (node.scrollLength) {
                if (this.options.alignment) {
                    normalizeNextPrev = (scrollOffset >= 0);
                }
                else {
                    this._viewSequence = node._viewSequence;
                    normalizedScrollOffset = scrollOffset;
                }
            }
            node = node._prev;
        }
        return normalizedScrollOffset;
    }
    function _normalizeNextViewSequence(scrollOffset) {
        var count = 0;
        var normalizedScrollOffset = scrollOffset;
        var node = this._nodes.getStartEnumNode(true);
        while (node) {
            if (!node._invalidated || (node.scrollLength === undefined) || node.trueSizeRequested || !node._viewSequence ||
                ((scrollOffset > 0) && (!this.options.alignment || (node.scrollLength !== 0)))) {
                break;
            }
            if (this.options.alignment) {
                scrollOffset += node.scrollLength;
                count++;
            }
            if (node.scrollLength || this.options.alignment) {
                this._viewSequence = node._viewSequence;
                normalizedScrollOffset = scrollOffset;
            }
            if (!this.options.alignment) {
                scrollOffset += node.scrollLength;
                count++;
            }
            node = node._next;
        }
        return normalizedScrollOffset;
    }
    function _normalizeViewSequence(size, scrollOffset) {

        // Check whether normalisation is disabled
        var caps = this._layout.capabilities;
        if (caps && caps.debug &&
            (caps.debug.normalize !== undefined) &&
            !caps.debug.normalize) {
            return scrollOffset;
        }

        // Don't normalize when forces are at work
        if (this._scroll.scrollForceCount) {
            return scrollOffset;
        }

        // 1. Normalize in primary direction
        var normalizedScrollOffset = scrollOffset;
        if (this.options.alignment && (scrollOffset < 0)) {
            normalizedScrollOffset = _normalizeNextViewSequence.call(this, scrollOffset);
        }
        else if (!this.options.alignment && (scrollOffset > 0)){
            normalizedScrollOffset = _normalizePrevViewSequence.call(this, scrollOffset);
        }

        // 2. Normalize in secondary direction
        if (normalizedScrollOffset === scrollOffset) {
            if (this.options.alignment && (scrollOffset > 0)) {
                normalizedScrollOffset = _normalizePrevViewSequence.call(this, scrollOffset);
            }
            else if (!this.options.alignment && (scrollOffset < 0)) {
                normalizedScrollOffset = _normalizeNextViewSequence.call(this, scrollOffset);
            }
        }

        // Adjust particle and springs
        if (normalizedScrollOffset !== scrollOffset) {
            var delta = normalizedScrollOffset - scrollOffset;

            // Adjust particle
            var particleValue = this._scroll.particle.getPosition1D();
            //var particleValue = this._scroll.particleValue;
            _setParticle.call(this, particleValue + delta, undefined, 'normalize');
            //_log.call(this, 'normalized scrollOffset: ', normalizedScrollOffset, ', old: ', scrollOffset, ', particle: ', particleValue + delta);

            // Adjust scroll spring
            if (this._scroll.springPosition !== undefined) {
                this._scroll.springPosition += delta;
            }

            // Adjust group offset
            if (_isSequentiallyScrollingOptimized.call(this)) {
                this._scroll.groupStart -= delta;
            }
        }
        return normalizedScrollOffset;
    }

    /**
     * Get all items that are partly or completely visible.
     *
     * The returned result is an array of objects containing the
     * following properties. Example:
     * ```javascript
     * {
     *   viewSequence: {ViewSequence},
     *   index: {Number},
     *   renderNode: {renderable},
     *   visiblePerc: {Number} 0..1
     * }
     * ```
     * @return {Array} array of items
     */
    ScrollController.prototype.getVisibleItems = function() {
        var size = this._contextSizeCache;
        var scrollOffset = this.options.alignment ? (this._scroll.unnormalizedScrollOffset + size[this._direction]) : this._scroll.unnormalizedScrollOffset;
        var result = [];
        var node = this._nodes.getStartEnumNode(true);
        while (node) {
            if (!node._invalidated || (node.scrollLength === undefined) || (scrollOffset > size[this._direction])) {
                break;
            }
            scrollOffset += node.scrollLength;
            if ((scrollOffset >= 0) && node._viewSequence){
                result.push({
                    index: node._viewSequence.getIndex(),
                    viewSequence: node._viewSequence,
                    renderNode: node.renderNode,
                    visiblePerc: node.scrollLength ? ((Math.min(scrollOffset, size[this._direction]) - Math.max(scrollOffset - node.scrollLength, 0)) / node.scrollLength) : 1,
                    scrollOffset: scrollOffset - node.scrollLength,
                    scrollLength: node.scrollLength,
                    _node: node
                });
            }
            node = node._next;
        }
        scrollOffset = this.options.alignment ? (this._scroll.unnormalizedScrollOffset + size[this._direction]) : this._scroll.unnormalizedScrollOffset;
        node = this._nodes.getStartEnumNode(false);
        while (node) {
            if (!node._invalidated || (node.scrollLength === undefined) || (scrollOffset < 0)) {
                break;
            }
            scrollOffset -= node.scrollLength;
            if ((scrollOffset < size[this._direction]) && node._viewSequence) {
                result.unshift({
                    index: node._viewSequence.getIndex(),
                    viewSequence: node._viewSequence,
                    renderNode: node.renderNode,
                    visiblePerc: node.scrollLength ? ((Math.min(scrollOffset + node.scrollLength, size[this._direction]) - Math.max(scrollOffset, 0)) / node.scrollLength) : 1,
                    scrollOffset: scrollOffset,
                    scrollLength: node.scrollLength,
                    _node: node
                });
            }
            node = node._prev;
        }
        return result;
    };

    /**
     * Get the first or last visible item in the view.
     */
    function _getVisibleItem(first) {
        var result = {};
        var diff;
        var prevDiff = 10000000;
        var diffDelta = (first && this.options.alignment) ? -this._contextSizeCache[this._direction] : ((!first && !this.options.alignment) ? this._contextSizeCache[this._direction] : 0);
        var scrollOffset = this._scroll.unnormalizedScrollOffset;
        var node = this._nodes.getStartEnumNode(true);
        while (node) {
            if (!node._invalidated || (node.scrollLength === undefined)) {
                break;
            }
            if (node._viewSequence) {
                diff = Math.abs(diffDelta - (scrollOffset + (!first ? node.scrollLength : 0)));
                if (diff >= prevDiff) {
                    break;
                }
                prevDiff = diff;
                result.scrollOffset = scrollOffset;
                result._node = node;
                scrollOffset += node.scrollLength;
            }
            node = node._next;
        }
        scrollOffset = this._scroll.unnormalizedScrollOffset;
        node = this._nodes.getStartEnumNode(false);
        while (node) {
            if (!node._invalidated || (node.scrollLength === undefined)) {
                break;
            }
            if (node._viewSequence) {
                scrollOffset -= node.scrollLength;
                diff = Math.abs(diffDelta - (scrollOffset + (!first ? node.scrollLength : 0)));
                if (diff >= prevDiff) {
                    break;
                }
                prevDiff = diff;
                result.scrollOffset = scrollOffset;
                result._node = node;
            }
            node = node._prev;
        }
        if (!result._node) {
            return undefined;
        }
        result.scrollLength = result._node.scrollLength;
        if (this.options.alignment) {
            result.visiblePerc = (Math.min(result.scrollOffset + result.scrollLength, 0) - Math.max(result.scrollOffset, -this._contextSizeCache[this._direction])) / result.scrollLength;
        }
        else {
            result.visiblePerc = (Math.min(result.scrollOffset + result.scrollLength, this._contextSizeCache[this._direction]) - Math.max(result.scrollOffset, 0)) / result.scrollLength;
        }
        result.index = result._node._viewSequence.getIndex();
        result.viewSequence = result._node._viewSequence;
        result.renderNode = result._node.renderNode;
        return result;
    }

    /**
     * Get the first visible item in the view.
     *
     * @return {Object} item or `undefined`
     */
    ScrollController.prototype.getFirstVisibleItem = function() {
        return _getVisibleItem.call(this, true);
    };

    /**
     * Get the last visible item in the view.
     *
     * @return {Object} item or `undefined`
     */
    ScrollController.prototype.getLastVisibleItem = function() {
        return _getVisibleItem.call(this, false);
    };

    /**
     * Helper function that goes to a view-sequence either by scrolling
     * or immediately without any scrolling animation.
     */
    function _goToSequence(viewSequence, next, noAnimation) {
        if (noAnimation) {
            this._viewSequence = viewSequence;
            this._scroll.springPosition = undefined;
            _updateSpring.call(this);
            this.halt();
            this._scroll.scrollDelta = 0;
            _setParticle.call(this, 0, 0, '_goToSequence');
            this._isDirty = true;
        }
        else {
            this._scroll.scrollToSequence = viewSequence;
            this._scroll.scrollToRenderNode = viewSequence.get();
            this._scroll.ensureVisibleRenderNode = undefined;
            this._scroll.scrollToDirection = next;
            this._scroll.scrollDirty = true;
        }
    }

    /**
     * Helper function that scrolls the view towards a view-sequence node.
     */
    function _ensureVisibleSequence(viewSequence, next) {
        this._scroll.scrollToSequence = undefined;
        this._scroll.scrollToRenderNode = undefined;
        this._scroll.ensureVisibleRenderNode = viewSequence.get();
        this._scroll.scrollToDirection = next;
        this._scroll.scrollDirty = true;
    }

    /**
     * Moves to the next node in the viewSequence.
     *
     * @param {Number} [amount] Amount of nodes to move
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without any scrolling animation.
     */
    function _goToPage(amount, noAnimation) {

        // Get current scroll-position. When a previous call was made to
        // `scroll' or `scrollTo` and that node has not yet been reached, then
        // the amount is accumalated onto that scroll target.
        var viewSequence = (!noAnimation ? this._scroll.scrollToSequence : undefined) || this._viewSequence;
        if (!this._scroll.scrollToSequence && !noAnimation) {
            var firstVisibleItem = this.getFirstVisibleItem();
            if (firstVisibleItem) {
                viewSequence = firstVisibleItem.viewSequence;
                if (((amount < 0) && (firstVisibleItem.scrollOffset < 0)) ||
                    ((amount > 0) && (firstVisibleItem.scrollOffset > 0))) {
                    amount = 0;
                }
            }
        }
        if (!viewSequence) {
            return;
        }

        // Find scroll target
        for (var i = 0; i < Math.abs(amount); i++) {
            var nextViewSequence = (amount > 0) ? viewSequence.getNext() : viewSequence.getPrevious();
            if (nextViewSequence) {
                viewSequence = nextViewSequence;
            }
            else {
                break;
            }
        }
        _goToSequence.call(this, viewSequence, amount >= 0, noAnimation);
    }

    /**
     * Goes to the first page, making it visible.
     *
     * NOTE: This function does not work on ViewSequences that have the `loop` property enabled.
     *
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without any scrolling animation.
     * @return {ScrollController} this
     */
    ScrollController.prototype.goToFirstPage = function(noAnimation) {
        if (!this._viewSequence) {
            return this;
        }
        if (this._viewSequence._ && this._viewSequence._.loop) {
            LayoutUtility.error('Unable to go to first item of looped ViewSequence');
            return this;
        }
        var viewSequence = this._viewSequence;
        while (viewSequence) {
            var prev = viewSequence.getPrevious();
            if (prev && prev.get()) {
                viewSequence = prev;
            }
            else {
                break;
            }
        }
        _goToSequence.call(this, viewSequence, false, noAnimation);
        return this;
    };

    /**
     * Goes to the previous page, making it visible.
     *
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without any scrolling animation.
     * @return {ScrollController} this
     */
    ScrollController.prototype.goToPreviousPage = function(noAnimation) {
        _goToPage.call(this, -1, noAnimation);
        return this;
    };

    /**
     * Goes to the next page, making it visible.
     *
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without any scrolling animation.
     * @return {ScrollController} this
     */
    ScrollController.prototype.goToNextPage = function(noAnimation) {
        _goToPage.call(this, 1, noAnimation);
        return this;
    };

    /**
     * Goes to the last page, making it visible.
     *
     * NOTE: This function does not work on ViewSequences that have the `loop` property enabled.
     *
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without any scrolling animation.
     * @return {ScrollController} this
     */
    ScrollController.prototype.goToLastPage = function(noAnimation) {
        if (!this._viewSequence) {
            return this;
        }
        if (this._viewSequence._ && this._viewSequence._.loop) {
            LayoutUtility.error('Unable to go to last item of looped ViewSequence');
            return this;
        }
        var viewSequence = this._viewSequence;
        while (viewSequence) {
            var next = viewSequence.getNext();
            if (next && next.get()) {
                viewSequence = next;
            }
            else {
                break;
            }
        }
        _goToSequence.call(this, viewSequence, true, noAnimation);
        return this;
    };

    /**
     * Goes to the given renderable in the datasource.
     *
     * @param {RenderNode} node renderable to scroll to.
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without scrolling animation.
     * @return {ScrollController} this
     */
    ScrollController.prototype.goToRenderNode = function(node, noAnimation) {

        // Verify arguments and state
        if (!this._viewSequence || !node) {
            return this;
        }

        // Check current node
        if (this._viewSequence.get() === node) {
            var next = _calcScrollOffset.call(this) >= 0;
            _goToSequence.call(this, this._viewSequence, next, noAnimation);
            return this;
        }

        // Find the sequence-node that we want to scroll to.
        // We look at both directions at the same time.
        // The first match that is encountered, that direction is chosen.
        var nextSequence = this._viewSequence.getNext();
        var prevSequence = this._viewSequence.getPrevious();
        while ((nextSequence || prevSequence) && (nextSequence !== this._viewSequence)){
            var nextNode = nextSequence ? nextSequence.get() : undefined;
            if (nextNode === node) {
                _goToSequence.call(this, nextSequence, true, noAnimation);
                break;
            }
            var prevNode = prevSequence ? prevSequence.get() : undefined;
            if (prevNode === node) {
                _goToSequence.call(this, prevSequence, false, noAnimation);
                break;
            }
            nextSequence = nextNode ? nextSequence.getNext() : undefined;
            prevSequence = prevNode ? prevSequence.getPrevious() : undefined;
        }
        return this;
    };

    /**
     * Ensures that a render-node is entirely visible.
     *
     * When the node is already visible, nothing happens. If the node is not entirely visible
     * the view is scrolled as much as needed to make it entirely visibl.
     *
     * @param {Number|ViewSequence|Renderable} node index, renderNode or ViewSequence
     * @return {ScrollController} this
     */
    ScrollController.prototype.ensureVisible = function(node) {

        // Convert argument into renderNode
        if (node instanceof ViewSequence) {
            node = node.get();
        }
        else if ((node instanceof Number) || (typeof node === 'number')) {
            var viewSequence = this._viewSequence;
            while (viewSequence.getIndex() < node) {
                viewSequence = viewSequence.getNext();
                if (!viewSequence) {
                    return this;
                }
            }
            while (viewSequence.getIndex() > node) {
                viewSequence = viewSequence.getPrevious();
                if (!viewSequence) {
                    return this;
                }
            }
        }

        // Check current node
        if (this._viewSequence.get() === node) {
            var next = _calcScrollOffset.call(this) >= 0;
            _ensureVisibleSequence.call(this, this._viewSequence, next);
            return this;
        }

        // Find the sequence-node that we want to scroll to.
        // We look at both directions at the same time.
        // The first match that is encountered, that direction is chosen.
        var nextSequence = this._viewSequence.getNext();
        var prevSequence = this._viewSequence.getPrevious();
        while ((nextSequence || prevSequence) && (nextSequence !== this._viewSequence)){
            var nextNode = nextSequence ? nextSequence.get() : undefined;
            if (nextNode === node) {
                _ensureVisibleSequence.call(this, nextSequence, true);
                break;
            }
            var prevNode = prevSequence ? prevSequence.get() : undefined;
            if (prevNode === node) {
                _ensureVisibleSequence.call(this, prevSequence, false);
                break;
            }
            nextSequence = nextNode ? nextSequence.getNext() : undefined;
            prevSequence = prevNode ? prevSequence.getPrevious() : undefined;
        }

        return this;
    };

    /**
     * Scrolls the view by the specified number of pixels.
     *
     * @param {Number} delta Delta in pixels (< 0 = down/right, > 0 = top/left).
     * @return {ScrollController} this
     */
    ScrollController.prototype.scroll = function(delta) {
        this.halt();
        this._scroll.scrollDelta += delta;
        return this;
    };

    /**
     * Checks whether the scrollview can scroll the given delta.
     * When the scrollView can scroll the whole delta, then
     * the return value is the same as the delta. If it cannot
     * scroll the entire delta, the return value is the number of
     * pixels that can be scrolled.
     *
     * @param {Number} delta Delta to test
     * @return {Number} Number of pixels the view is allowed to scroll
     */
    ScrollController.prototype.canScroll = function(delta) {

        // Calculate height in both directions
        var scrollOffset = _calcScrollOffset.call(this);
        var prevHeight = this._calcScrollHeight(false);
        var nextHeight = this._calcScrollHeight(true);

        // When the rendered height is smaller than the total height,
        // then no scrolling whatsover is allowed.
        var totalHeight;
        if ((nextHeight !== undefined) && (prevHeight !== undefined)) {
            totalHeight = prevHeight + nextHeight;
        }
        if ((totalHeight !== undefined) && (totalHeight <= this._contextSizeCache[this._direction])) {
            return 0; // no scrolling at all allowed
        }

        // Determine the offset that we can scroll
        if ((delta < 0) && (nextHeight !== undefined)) {
            var nextOffset = this._contextSizeCache[this._direction] - (scrollOffset + nextHeight);
            return Math.max(nextOffset, delta);
        }
        else if ((delta > 0) && (prevHeight !== undefined)) {
            var prevOffset = -(scrollOffset - prevHeight);
            return Math.min(prevOffset, delta);
        }
        return delta;
    };

    /**
     * Halts all scrolling going on. In essence this function sets
     * the velocity to 0 and cancels any `goToXxx` operation that
     * was applied.
     *
     * @return {ScrollController} this
     */
    ScrollController.prototype.halt = function() {
        this._scroll.scrollToSequence = undefined;
        this._scroll.scrollToRenderNode = undefined;
        this._scroll.ensureVisibleRenderNode = undefined;
        _setParticle.call(this, undefined, 0, 'halt');
        return this;
    };

    /**
     * Checks whether scrolling is in progress or not.
     *
     * @return {Bool} true when scrolling is active
     */
    ScrollController.prototype.isScrolling = function() {
        return this._scroll.isScrolling;
    };

    /**
     * Checks whether any boundaries have been reached.
     *
     * @return {ScrollController.Bounds} Either, Bounds.PREV, Bounds.NEXT, Bounds.BOTH or Bounds.NONE
     */
    ScrollController.prototype.getBoundsReached = function() {
        return this._scroll.boundsReached;
    };

    /**
     * Get the current scrolling velocity.
     *
     * @return {Number} Scroll velocity
     */
    ScrollController.prototype.getVelocity = function() {
        return this._scroll.particle.getVelocity1D();
    };

    /**
     * Get the current energy of the scrolling particle.
     *
     * @return {Number} Energy
     */
    ScrollController.prototype.getEnergy = function() {
        return this._scroll.particle.getEnergy();
    };

    /**
     * Set the scrolling velocity.
     *
     * @param {Number} velocity New scroll velocity
     * @return {ScrollController} this
     */
    ScrollController.prototype.setVelocity = function(velocity) {
        return this._scroll.particle.setVelocity1D(velocity);
    };

    /**
     * Applies a permanent scroll-force (delta) until it is released.
     * When the cumulative scroll-offset lies outside the allowed bounds
     * a strech effect is used, and the offset beyond the bounds is
     * substracted by halve. This function should always be accompanied
     * by a call to `releaseScrollForce`.
     *
     * This method is used for instance when using touch gestures to move
     * the scroll offset and corresponds to the `touchstart` event.
     *
     * @param {Number} delta Starting scroll-delta force to apply
     * @return {ScrollController} this
     */
    ScrollController.prototype.applyScrollForce = function(delta) {
        this.halt();
        if (this._scroll.scrollForceCount === 0) {
            this._scroll.scrollForceStartItem = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
        }
        this._scroll.scrollForceCount++;
        this._scroll.scrollForce += delta;
        this._eventOutput.emit((this._scroll.scrollForceCount === 1) ? 'swipestart' : 'swipeupdate', {
            target: this,
            total: this._scroll.scrollForce,
            delta: delta
        });
        return this;
    };

    /**
     * Updates a existing scroll-force previously applied by calling
     * `applyScrollForce`.
     *
     * This method is used for instance when using touch gestures to move
     * the scroll offset and corresponds to the `touchmove` event.
     *
     * @param {Number} prevDelta Previous delta
     * @param {Number} newDelta New delta
     * @return {ScrollController} this
     */
    ScrollController.prototype.updateScrollForce = function(prevDelta, newDelta) {
        this.halt();
        newDelta -= prevDelta;
        this._scroll.scrollForce += newDelta;
        this._eventOutput.emit('swipeupdate', {
            target: this,
            total: this._scroll.scrollForce,
            delta: newDelta
        });
        return this;
    };

    /**
     * Releases a scroll-force and sets the velocity.
     *
     * This method is used for instance when using touch gestures to move
     * the scroll offset and corresponds to the `touchend` event.
     *
     * @param {Number} delta Scroll delta to release
     * @param {Number} [velocity] Velocity to apply after which the view keeps scrolling
     * @return {ScrollController} this
     */
    ScrollController.prototype.releaseScrollForce = function(delta, velocity) {
        this.halt();
        if (this._scroll.scrollForceCount === 1) {
            var scrollOffset = _calcScrollOffset.call(this);
            _setParticle.call(this, scrollOffset, velocity, 'releaseScrollForce');
            this._scroll.pe.wake();
            this._scroll.scrollForce = 0;
            this._scroll.scrollDirty = true;
            if (this._scroll.scrollForceStartItem && this.options.paginated && (this.options.paginationMode === PaginationMode.PAGE)) {
                var item = this.options.alignment ? this.getLastVisibleItem(true) : this.getFirstVisibleItem(true);
                if (item) {
                    if (item.renderNode !== this._scroll.scrollForceStartItem.renderNode) {
                        this.goToRenderNode(item.renderNode);
                    }
                    else if (this.options.paginationEnergyThresshold && (Math.abs(this._scroll.particle.getEnergy()) >= this.options.paginationEnergyThresshold)) {
                        velocity = velocity || 0;
                        if ((velocity < 0) && item._node._next && item._node._next.renderNode) {
                            this.goToRenderNode(item._node._next.renderNode);
                        }
                        else if ((velocity >= 0) && item._node._prev && item._node._prev.renderNode) {
                            this.goToRenderNode(item._node._prev.renderNode);
                        }
                    }
                    else {
                        this.goToRenderNode(item.renderNode);
                    }
                }
            }
            this._scroll.scrollForceStartItem = undefined;
            this._scroll.scrollForceCount--;
            this._eventOutput.emit('swipeend', {
                target: this,
                total: delta,
                delta: 0,
                velocity: velocity
            });
        }
        else {
            this._scroll.scrollForce -= delta;
            this._scroll.scrollForceCount--;
            this._eventOutput.emit('swipeupdate', {
                target: this,
                total: this._scroll.scrollForce,
                delta: delta
            });
        }
        return this;
    };

     /**
     * Get the spec (size, transform, etc..) for the given renderable or
     * Id.
     *
     * @param {Renderable|String} node Renderabe or Id to look for.
     * @param {Bool} normalize When set to `true` normalizes the origin/align into the transform translation (default: `false`).
     * @return {Spec} spec or undefined
     */
    ScrollController.prototype.getSpec = function(node, normalize) {
        var spec = LayoutController.prototype.getSpec.apply(this, arguments);
        if (spec && _isSequentiallyScrollingOptimized.call(this)) {
            spec = {
                origin: spec.origin,
                align: spec.align,
                opacity: spec.opacity,
                size: spec.size,
                renderNode: spec.renderNode,
                transform: spec.transform
            };
            var translate = [0, 0, 0];
            translate[this._direction] = this._scrollOffsetCache + this._scroll.groupStart;
            spec.transform = Transform.thenMove(spec.transform, translate);
        }
        return spec;
    };

    /**
     * Executes the layout and updates the state of the scrollview.
     */
    function _layout(size, scrollOffset, nested) {

        // Track the number of times the layout-function was executed
        this._debug.layoutCount++;
        //_log.call(this, 'Layout, scrollOffset: ', scrollOffset, ', particle: ', this._scroll.particle.getPosition1D());

        // Determine start & end
        var scrollStart = 0 - Math.max(this.options.extraBoundsSpace[0], 1);
        var scrollEnd = size[this._direction] + Math.max(this.options.extraBoundsSpace[1], 1);
        if (this.options.layoutAll) {
            scrollStart = -1000000;
            scrollEnd = 1000000;
        }

        // Prepare for layout
        var layoutContext = this._nodes.prepareForLayout(
            this._viewSequence,     // first node to layout
            this._nodesById, {      // so we can do fast id lookups
                size: size,
                direction: this._direction,
                reverse: this.options.alignment ? true : false,
                scrollOffset: this.options.alignment ? (scrollOffset + size[this._direction]) : scrollOffset,
                scrollStart: scrollStart,
                scrollEnd: scrollEnd
            }
        );

        // Layout objects
        if (this._layout._function) {
            this._layout._function(
                layoutContext,          // context which the layout-function can use
                this._layout.options    // additional layout-options
            );
        }
        this._scroll.unnormalizedScrollOffset = scrollOffset;

        // Call post-layout function
        if (this._postLayout) {
            this._postLayout(size, scrollOffset);
        }

        // Mark non-invalidated nodes for removal
        this._nodes.removeNonInvalidatedNodes(this.options.flowOptions.removeSpec);

        // Check whether the bounds have been reached
        //var oldBoundsReached = this._scroll.boundsReached;
        _calcBounds.call(this, size, scrollOffset);
        //if (oldBoundsReached !== this._scroll.boundsReached) {
        //    _log.call(this, 'bounds reached changed (', oldBoundsReached, ' != ', this._scroll.boundsReached, ')');
        //}

        // Update scroll-to spring
        _calcScrollToOffset.call(this, size, scrollOffset);

        // When pagination is enabled, snap to page
        _snapToPage.call(this);

        // If the bounds have changed, and the scroll-offset would be different
        // than before, then re-layout entirely using the new offset.
        var newScrollOffset = _calcScrollOffset.call(this, true);
        if (!nested && (newScrollOffset !== scrollOffset)) {
            //_log.call(this, 'offset changed, re-layouting... (', scrollOffset, ' != ', newScrollOffset, ')');
            return _layout.call(this, size, newScrollOffset, true);
        }

        // Normalize scroll offset so that the current viewsequence node is as close to the
        // top as possible and the layout function will need to process the least amount
        // of renderables.
        scrollOffset = _normalizeViewSequence.call(this, size, scrollOffset);

        // Update spring
        _updateSpring.call(this);

        // Cleanup any nodes in case of a VirtualViewSequence
        this._nodes.removeVirtualViewSequenceNodes();

        // Calculate scroll-length and use that as the true-size (height)
        if (this.options.size && (this.options.size[this._direction] === true)) {
            var scrollLength = 0;
            var node = this._nodes.getStartEnumNode();
            while (node) {
                if (node._invalidated && node.scrollLength) {
                    scrollLength += node.scrollLength;
                }
                node = node._next;
            }
            this._size = this._size || [0, 0];
            this._size[0] = this.options.size[0];
            this._size[1] = this.options.size[1];
            this._size[this._direction] = scrollLength;
        }

        return scrollOffset;
    }

    /**
     * Inner render function of the Group
     */
    function _innerRender() {
        var specs = this._specs;
        for (var i3 = 0, j3 = specs.length; i3 < j3; i3++) {
            if (specs[i3].renderNode) {
                specs[i3].target = specs[i3].renderNode.render();
            }
        }

        // Add our cleanup-registration id also to the list, so that the
        // cleanup function is called by famo.us when the LayoutController is
        // removed from the render-tree.
        if (!specs.length || (specs[specs.length-1] !== this._cleanupRegistration)) {
            specs.push(this._cleanupRegistration);
        }
        return specs;
    }

    /**
     * Apply changes from this component to the corresponding document element.
     * This includes changes to classes, styles, size, content, opacity, origin,
     * and matrix transforms.
     *
     * @private
     * @method commit
     * @param {Context} context commit context
     */
    ScrollController.prototype.commit = function commit(context) {
        var size = context.size;

        // Update debug info
        this._debug.commitCount++;

        // Reset the flow-state when requested
        if (this._resetFlowState) {
            this._resetFlowState = false;
            this._isDirty = true;
            this._nodes.removeAll();
        }

        // Calculate scroll offset
        var scrollOffset = _calcScrollOffset.call(this, true, true);
        if (this._scrollOffsetCache === undefined) {
            this._scrollOffsetCache = scrollOffset;
        }

        // When the size or layout function has changed, reflow the layout
        var emitEndScrollingEvent = false;
        var emitScrollEvent = false;
        var eventData;
        if (size[0] !== this._contextSizeCache[0] ||
            size[1] !== this._contextSizeCache[1] ||
            this._isDirty ||
            this._scroll.scrollDirty ||
            this._nodes._trueSizeRequested ||
            this.options.alwaysLayout ||
            this._scrollOffsetCache !== scrollOffset) {

            // Prepare event data
            eventData = {
                target: this,
                oldSize: this._contextSizeCache,
                size: size,
                oldScrollOffset: -(this._scrollOffsetCache + this._scroll.groupStart),
                scrollOffset: -(scrollOffset + this._scroll.groupStart)
            };

            // When scroll-offset has changed, emit scroll-start and scroll events
            if (this._scrollOffsetCache !== scrollOffset) {
                if (!this._scroll.isScrolling) {
                    this._scroll.isScrolling = true;
                    this._eventOutput.emit('scrollstart', eventData);
                }
                emitScrollEvent = true;
            }
            else if (this._scroll.isScrolling && !this._scroll.scrollForceCount) {
                emitEndScrollingEvent = true;
            }

            this._eventOutput.emit('layoutstart', eventData);

            // When the layout has changed, and we are not just scrolling,
            // disable the locked state of the layout-nodes so that they
            // can freely transition between the old and new state.
            if (this.options.flow && (this._isDirty ||
                (this.options.flowOptions.reflowOnResize &&
                ((size[0] !== this._contextSizeCache[0]) ||
                 (size[1] !== this._contextSizeCache[1]))))) {
                var node = this._nodes.getStartEnumNode();
                while (node) {
                    node.releaseLock(true);
                    node = node._next;
                }
            }

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._isDirty = false;
            this._scroll.scrollDirty = false;

            // Perform layout
            scrollOffset = _layout.call(this, size, scrollOffset);
            this._scrollOffsetCache = scrollOffset;

            // Emit end event
            eventData.scrollOffset = -(this._scrollOffsetCache + this._scroll.groupStart);
        }
        else if (this._scroll.isScrolling && !this._scroll.scrollForceCount) {
            emitEndScrollingEvent = true;
        }

        // Update output and optionally emit event
        var groupTranslate = this._scroll.groupTranslate;
        groupTranslate[0] = 0;
        groupTranslate[1] = 0;
        groupTranslate[2] = 0;
        groupTranslate[this._direction] = -this._scroll.groupStart - scrollOffset;
        var sequentialScrollingOptimized = _isSequentiallyScrollingOptimized.call(this);
        var result = this._nodes.buildSpecAndDestroyUnrenderedNodes(sequentialScrollingOptimized ? groupTranslate : undefined);
        this._specs = result.specs;
        if (!this._specs.length) {
          this._scroll.groupStart = 0;
        }
        if (eventData) { // eventData is only used here to check whether there has been a re-layout
            this._eventOutput.emit('layoutend', eventData);
        }
        if (result.modified) {
            this._eventOutput.emit('reflow', {
                target: this
            });
        }

        // View has been scrolled, emit event
        if (emitScrollEvent) {
            this._eventOutput.emit('scroll', eventData);
        }

        // Check whether the current page has changed
        if (eventData) { // eventData is only used here to check whether there has been a re-layout
            var visibleItem = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
            if ((visibleItem && !this._visibleItemCache) || (!visibleItem && this._visibleItemCache) ||
                (visibleItem && this._visibleItemCache && (visibleItem.renderNode !== this._visibleItemCache.renderNode))) {
                this._eventOutput.emit('pagechange', {
                    target: this,
                    oldViewSequence: this._visibleItemCache ? this._visibleItemCache.viewSequence : undefined,
                    viewSequence: visibleItem ? visibleItem.viewSequence : undefined,
                    oldIndex: this._visibleItemCache ? this._visibleItemCache.index : undefined,
                    index: visibleItem ? visibleItem.index : undefined,
                    renderNode: visibleItem ? visibleItem.renderNode : undefined,
                    oldRenderNode: this._visibleItemCache ? this._visibleItemCache.renderNode : undefined
                });
                this._visibleItemCache = visibleItem;
            }
        }

        // Emit end scrolling event
        if (emitEndScrollingEvent) {
            this._scroll.isScrolling = false;
            eventData = {
                target: this,
                oldSize: size,
                size: size,
                oldScrollOffset: -(this._scroll.groupStart + scrollOffset),
                scrollOffset: -(this._scroll.groupStart + scrollOffset)
            };
            this._eventOutput.emit('scrollend', eventData);
        }

        // When renderables are layed out sequentiall (e.g. a ListLayout or
        // CollectionLayout), then offset the renderables onto the Group
        // and move the group offset instead. This creates a very big performance gain
        // as the renderables don't have to be repositioned for every change
        // to the scrollOffset. For layouts that don't layout sequence, disable
        // this behavior as it will be decremental to the performance.
        var transform = context.transform;
        if (sequentialScrollingOptimized) {
            var windowOffset = scrollOffset + this._scroll.groupStart;
            var translate = [0, 0, 0];
            translate[this._direction] = windowOffset;
            transform = Transform.thenMove(transform, translate);
        }

        // Return the spec
        return {
            transform: transform,
            size: size,
            opacity: context.opacity,
            origin: context.origin,
            target: this.group.render()
        };
    };

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {number} Render spec for this component
     */
    ScrollController.prototype.render = function render() {
        if (this.container) {
            return this.container.render.apply(this.container, arguments);
        }
        else {
            return this.id;
        }
    };

    module.exports = ScrollController;
});

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
 * Lays out items and optionally sticky sections from top to bottom or left to right.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[itemSize]`|Number/Function|Height or width in pixels of an item (used when renderNode has no size)|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[spacing]`|Number|Spacing between items|
 * |`[isSectionCallback]`|Function|Callback that is called in order to check if a render-node is a section rather than a cell.|
 *
 * Example:
 *
 * ```javascript
 * var FlexScrollView = require('famous-flex/FlexScrollView');
 * var ListLayout = require('famous-flex/layouts/ListLayout');
 *
 * var scrollView = new FlexScrollView({
 *   layout: ListLayout,
 *   layoutOptions: {
 *     margins: [20, 10, 20, 10],
 *     spacing: 1,
 *     isSectionCallback: function(renderNode) {
 *       return renderNode.isSection;
 *     },
 *   },
 *   dataSource: [
 *     // first section
 *     _createSection(),
 *     _createCell(),
 *     _createCell(),
 *     // second section
 *     _createSection(),
 *     _createCell(),
 *   ]
 * });
 * this.add(scrollView);
 *
 * function _createCell() {
 *   return new Surface({
 *     size: [undefined, 50],
 *     content: 'my cell'
 *   });
 * }
 *
 * function _createSection() {
 *   var section = new Surface({
 *     size: [undefined, 30],
 *     content: 'my sticky section'
 *   });
 *   section.isSection = true; // mark renderNode as section
 *   return section;
 * }
 * ```
 * @module
 */
define('famous-flex/layouts/ListLayout',['require','exports','module','famous/utilities/Utility','../LayoutUtility'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');
    var LayoutUtility = require('../LayoutUtility');

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.Y, Utility.Direction.X],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: true
    };

    // Data
    var set = {
        size: [0, 0],
        translate: [0, 0, 0],
        scrollLength: undefined
    };
    var margin = [0, 0];

    // Layout function
    function ListLayout(context, options) {

        // Local data
        var size = context.size;
        var direction = context.direction;
        var alignment = context.alignment;
        var revDirection = direction ? 0 : 1;
        var offset;
        var margins = LayoutUtility.normalizeMargins(options.margins);
        var spacing = options.spacing || 0;
        var node;
        var nodeSize;
        var itemSize;
        var getItemSize;
        var lastSectionBeforeVisibleCell;
        var lastSectionBeforeVisibleCellOffset;
        var lastSectionBeforeVisibleCellLength;
        var lastSectionBeforeVisibleCellScrollLength;
        var lastSectionBeforeVisibleCellTopReached;
        var firstVisibleCell;
        var lastNode;
        var lastCellOffsetInFirstVisibleSection;
        var isSectionCallback = options.isSectionCallback;
        var bound;

        //
        // reset size & translation
        //
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.size[revDirection] -= (margins[1 - revDirection] + margins[3 - revDirection]);
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = 0;
        set.translate[revDirection] = margins[direction ? 3 : 0];

        //
        // Determine item-size or use true=size
        //
        if ((options.itemSize === true) || !options.hasOwnProperty('itemSize')) {
            itemSize = true;
        }
        else if (options.itemSize instanceof Function) {
            getItemSize = options.itemSize;
        }
        else {
            itemSize = (options.itemSize === undefined) ? size[direction] : options.itemSize;
        }

        //
        // Determine leading/trailing margins
        //
        margin[0] = margins[direction ? 0 : 3];
        margin[1] = -margins[direction ? 2 : 1];

        //
        // Process all next nodes
        //
        offset = context.scrollOffset + margin[alignment];
        bound = context.scrollEnd + margin[alignment];
        while (offset < (bound + spacing)) {
            lastNode = node;
            node = context.next();
            if (!node) {
                break;
            }

            //
            // Get node size
            //
            nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
            nodeSize = (nodeSize === true) ? context.resolveSize(node, size)[direction] : nodeSize;

            //
            // Position node
            //
            set.size[direction] = nodeSize;
            set.translate[direction] = offset + (alignment ? spacing : 0);
            set.scrollLength = nodeSize + spacing;
            context.set(node, set);
            offset += set.scrollLength;

            //
            // Keep track of the last section before the first visible cell
            //
            if (isSectionCallback && isSectionCallback(node.renderNode)) {
                if ((set.translate[direction] <= margin[0]) && !lastSectionBeforeVisibleCellTopReached) {
                    lastSectionBeforeVisibleCellTopReached = true;
                    set.translate[direction] = margin[0];
                    context.set(node, set);
                }
                if (!firstVisibleCell) {
                    lastSectionBeforeVisibleCell = node;
                    lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                    lastSectionBeforeVisibleCellLength = nodeSize;
                    lastSectionBeforeVisibleCellScrollLength = nodeSize;
                }
                else if (lastCellOffsetInFirstVisibleSection === undefined) {
                    lastCellOffsetInFirstVisibleSection = offset - nodeSize;
                }
            }
            else if (!firstVisibleCell && (offset >= 0)) {
                firstVisibleCell = node;
            }
        }
        if (lastNode && !node && !alignment) {
            set.scrollLength = nodeSize + margin[0] + -margin[1];
            context.set(lastNode, set);
        }

        //
        // Process previous nodes
        //
        lastNode = undefined;
        node = undefined;
        offset = context.scrollOffset + margin[alignment];
        bound = context.scrollStart + margin[alignment];
        while (offset > (bound - spacing)) {
            lastNode = node;
            node = context.prev();
            if (!node) {
                break;
            }

            //
            // Get node size
            //
            nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
            nodeSize = (nodeSize === true) ? context.resolveSize(node, size)[direction] : nodeSize;

            //
            // Position node
            //
            set.scrollLength = nodeSize + spacing;
            offset -= set.scrollLength;
            set.size[direction] = nodeSize;
            set.translate[direction] = offset + (alignment ? spacing : 0);
            context.set(node, set);

            //
            // Keep track of the last section before the first visible cell
            //
            if (isSectionCallback && isSectionCallback(node.renderNode)) {
                if ((set.translate[direction] <= margin[0]) && !lastSectionBeforeVisibleCellTopReached) {
                    lastSectionBeforeVisibleCellTopReached = true;
                    set.translate[direction] = margin[0];
                    context.set(node, set);
                }
                if (!lastSectionBeforeVisibleCell) {
                    lastSectionBeforeVisibleCell = node;
                    lastSectionBeforeVisibleCellOffset = offset;
                    lastSectionBeforeVisibleCellLength = nodeSize;
                    lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
                }
            }
            else if ((offset + nodeSize) >= 0) {
                firstVisibleCell = node;
                if (lastSectionBeforeVisibleCell) {
                    lastCellOffsetInFirstVisibleSection = offset + nodeSize;
                }
                lastSectionBeforeVisibleCell = undefined;
            }
        }
        if (lastNode && !node && alignment) {
            set.scrollLength = nodeSize + margin[0] + -margin[1];
            context.set(lastNode, set);
            if (lastSectionBeforeVisibleCell === lastNode) {
                lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
            }
        }

        //
        // When no first section is in the scrollable range, then
        // look back further in search for that section
        //
        if (isSectionCallback && !lastSectionBeforeVisibleCell) {
            node = context.prev();
            while (node) {
                if (isSectionCallback(node.renderNode)) {
                    lastSectionBeforeVisibleCell = node;
                    nodeSize = options.itemSize || context.resolveSize(node, size)[direction];
                    lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                    lastSectionBeforeVisibleCellLength = nodeSize;
                    lastSectionBeforeVisibleCellScrollLength = undefined;
                    break;
                }
                else {
                    node = context.prev();
                }
            }
        }

        //
        // Reposition "last section before first visible cell" to the top of the layout
        //
        if (lastSectionBeforeVisibleCell) {
            var correctedOffset = Math.max(margin[0], lastSectionBeforeVisibleCellOffset);
            if ((lastCellOffsetInFirstVisibleSection !== undefined) &&
                (lastSectionBeforeVisibleCellLength > (lastCellOffsetInFirstVisibleSection - margin[0]))) {
                correctedOffset = ((lastCellOffsetInFirstVisibleSection - lastSectionBeforeVisibleCellLength));
            }
            set.size[direction] = lastSectionBeforeVisibleCellLength;
            set.translate[direction] = correctedOffset;
            set.scrollLength = lastSectionBeforeVisibleCellScrollLength;
            context.set(lastSectionBeforeVisibleCell, set);
        }
    }

    ListLayout.Capabilities = capabilities;
    ListLayout.Name = 'ListLayout';
    ListLayout.Description = 'List-layout with margins, spacing and sticky headers';
    module.exports = ListLayout;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Flexible FlexScrollView for famo.us.
 *
 * Key features:
 * -    Customizable layout (uses ListLayout by default)
 * -    Insert/remove at any position using animations
 * -    Support for `true` size renderables
 * -    Pull to refresh (header & footer)
 * -    Horizontal/vertical direction
 * -    Top/left or bottom/right alignment
 * -    Pagination
 * -    Option to embed in a ContainerSurface
 * -    FlexScrollView linking
 *
 * Inherited from: [ScrollController](./ScrollController.md)
 * @module
 */
define('famous-flex/FlexScrollView',['require','exports','module','./LayoutUtility','./ScrollController','./layouts/ListLayout'],function(require, exports, module) {

    // import dependencies
    var LayoutUtility = require('./LayoutUtility');
    var ScrollController = require('./ScrollController');
    var ListLayout = require('./layouts/ListLayout');

    //
    // Pull to refresh states
    //
    var PullToRefreshState = {
        HIDDEN: 0,
        PULLING: 1,
        ACTIVE: 2,
        COMPLETED: 3,
        HIDDING: 4
    };

    /**
     * @class
     * @extends ScrollController
     * @param {Object} options Configurable options (see ScrollController for all inherited options).
     * @param {Renderable} [options.pullToRefreshHeader] Pull to refresh renderable that is displayed when pulling down from the top.
     * @param {Renderable} [options.pullToRefreshFooter] Pull to refresh renderable that is displayed when pulling up from the bottom.
     * @param {FlexScrollView} [options.leadingScrollView] Leading scrollview into which input events are piped (see Tutorial)
     * @param {FlexScrollView} [options.trailingScrollView] Trailing scrollview into which input events are piped (see Tutorial)
     * @alias module:FlexScrollView
     */
    function FlexScrollView(options) {
        ScrollController.call(this, LayoutUtility.combineOptions(FlexScrollView.DEFAULT_OPTIONS, options));
        this._thisScrollViewDelta = 0;
        this._leadingScrollViewDelta = 0;
        this._trailingScrollViewDelta = 0;
    }
    FlexScrollView.prototype = Object.create(ScrollController.prototype);
    FlexScrollView.prototype.constructor = FlexScrollView;
    FlexScrollView.PullToRefreshState = PullToRefreshState;
    FlexScrollView.Bounds = ScrollController.Bounds;
    FlexScrollView.PaginationMode = ScrollController.PaginationMode;

    FlexScrollView.DEFAULT_OPTIONS = {
        layout: ListLayout,         // sequential layout, uses width/height from renderable
        direction: undefined,       // 0 = X, 1 = Y, undefined = use default from layout
        paginated: false,           // pagination on/off
        alignment: 0,               // 0 = top/left, 1 = bottom/right
        flow: false,                // allow renderables to flow between layouts when not scrolling
        mouseMove: false,           // allow mouse to hold and move the view
        useContainer: false,        // embeds inside a ContainerSurface for clipping and capturing input events
        visibleItemThresshold: 0.5, // by default, when an item is 50% visible, it is considered visible by `getFirstVisibleItem`
        pullToRefreshHeader: undefined, // assign pull-to-refresh renderable here (renderable must have a size)
        pullToRefreshFooter: undefined, // assign pull-to-refresh renderable here (renderable must have a size)
        leadingScrollView: undefined,
        trailingScrollView: undefined
        // see ScrollController for all other options
    };

    /**
     * Patches the FlexScrollView instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options (see ScrollController for all inherited options).
     * @param {Renderable} [options.pullToRefreshHeader] Pull to refresh renderable that is displayed when pulling down from the top.
     * @param {Renderable} [options.pullToRefreshFooter] Pull to refresh renderable that is displayed when pulling up from the bottom.
     * @param {FlexScrollView} [options.leadingScrollView] Leading scrollview into which input events are piped (see Tutorial).
     * @param {FlexScrollView} [options.trailingScrollView] Trailing scrollview into which input events are piped (see Tutorial).
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.setOptions = function(options) {
        ScrollController.prototype.setOptions.call(this, options);

        // Update pull to refresh renderables
        if (options.pullToRefreshHeader || options.pullToRefreshFooter || this._pullToRefresh) {
            if (options.pullToRefreshHeader) {
                this._pullToRefresh = this._pullToRefresh || [undefined, undefined];
                if (!this._pullToRefresh[0]) {
                    this._pullToRefresh[0] = {
                        state: PullToRefreshState.HIDDEN,
                        prevState: PullToRefreshState.HIDDEN,
                        footer: false
                    };
                }
                this._pullToRefresh[0].node = options.pullToRefreshHeader;
            }
            else if (!this.options.pullToRefreshHeader && this._pullToRefresh) {
                this._pullToRefresh[0] = undefined;
            }
            if (options.pullToRefreshFooter) {
                this._pullToRefresh = this._pullToRefresh || [undefined, undefined];
                if (!this._pullToRefresh[1]) {
                    this._pullToRefresh[1] = {
                        state: PullToRefreshState.HIDDEN,
                        prevState: PullToRefreshState.HIDDEN,
                        footer: true
                    };
                }
                this._pullToRefresh[1].node = options.pullToRefreshFooter;
            }
            else if (!this.options.pullToRefreshFooter && this._pullToRefresh) {
                this._pullToRefresh[1] = undefined;
            }
            if (this._pullToRefresh && !this._pullToRefresh[0] && !this._pullToRefresh[1]) {
                this._pullToRefresh = undefined;
            }
        }
        return this;
    };

    /**
     * Sets the data-source (alias for setDataSource).
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @param {Array|ViewSequence} node Either an array of renderables or a Famous viewSequence.
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.sequenceFrom = function(node) {
        return this.setDataSource(node);
    };

    /**
     * Returns the index of the first visible renderable.
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @return {Number} The current index of the ViewSequence
     */
    FlexScrollView.prototype.getCurrentIndex = function() {
        var item = this.getFirstVisibleItem();
        return item ? item.viewSequence.getIndex() : -1;
    };

    /**
     * Paginates the Scrollview to an absolute page index. This function is a shim provided
     * for compatibility with the stock famo.us Scrollview.
     *
     * @param {Number} index view-sequence index to go to.
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without scrolling animation.
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.goToPage = function(index, noAnimation) {
        var viewSequence = this._viewSequence;
        if (!viewSequence) {
            return this;
        }
        while (viewSequence.getIndex() < index) {
            viewSequence = viewSequence.getNext();
            if (!viewSequence) {
                return this;
            }
        }
        while (viewSequence.getIndex() > index) {
            viewSequence = viewSequence.getPrevious();
            if (!viewSequence) {
                return this;
            }
        }
        this.goToRenderNode(viewSequence.get(), noAnimation);
        return this;
    };

    /**
     * Returns the offset associated with the Scrollview instance's current node
     * (generally the node currently at the top).
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @return {number} The position of either the specified node, or the Scrollview's current Node,
     * in pixels translated.
     */
    FlexScrollView.prototype.getOffset = function() {
        return this._scrollOffsetCache;
    };

    /**
     * Returns the position associated with the Scrollview instance's current node
     * (generally the node currently at the top).
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @deprecated
     * @param {number} [node] If specified, returns the position of the node at that index in the
     * Scrollview instance's currently managed collection.
     * @return {number} The position of either the specified node, or the Scrollview's current Node,
     * in pixels translated.
     */
    FlexScrollView.prototype.getPosition = FlexScrollView.prototype.getOffset;

    /**
     * Returns the absolute position associated with the Scrollview instance.
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @return {number} The position of the Scrollview's current Node, in pixels translated.
     */
    FlexScrollView.prototype.getAbsolutePosition = function() {
        return -(this._scrollOffsetCache + this._scroll.groupStart);
    };

    /**
     * Helper function for setting the pull-to-refresh status.
     */
    function _setPullToRefreshState(pullToRefresh, state) {
        if (pullToRefresh.state !== state) {
            pullToRefresh.state = state;
            if (pullToRefresh.node && pullToRefresh.node.setPullToRefreshStatus) {
                pullToRefresh.node.setPullToRefreshStatus(state);
            }
        }
    }

    /**
     * Helper function for getting the pull-to-refresh data.
     */
    function _getPullToRefresh(footer) {
        return this._pullToRefresh ? this._pullToRefresh[footer ? 1 : 0] : undefined;
    }

    /**
     * Post-layout function that adds the pull-to-refresh renderables.
     * @private
     */
    FlexScrollView.prototype._postLayout = function(size, scrollOffset) {

        // Exit immediately when pull to refresh is not configured
        if (!this._pullToRefresh) {
            return;
        }

        // Adjust scroll-offset for alignment
        if (this.options.alignment) {
            scrollOffset += size[this._direction];
        }

        // Prepare
        var prevHeight;
        var nextHeight;
        var totalHeight;

        // Show/activate pull to refresh renderables
        for (var i = 0; i < 2 ; i++) {
            var pullToRefresh = this._pullToRefresh[i];
            if (pullToRefresh) {

                // Calculate offset
                var length = pullToRefresh.node.getSize()[this._direction];
                var pullLength = pullToRefresh.node.getPullToRefreshSize ? pullToRefresh.node.getPullToRefreshSize()[this._direction] : length;
                var offset;
                if (!pullToRefresh.footer) {
                    // header
                    prevHeight = this._calcScrollHeight(false);
                    prevHeight = (prevHeight === undefined) ? -1 : prevHeight;
                    offset = (prevHeight >= 0) ? (scrollOffset - prevHeight) : prevHeight;
                    if (this.options.alignment) {
                        nextHeight = this._calcScrollHeight(true);
                        nextHeight = (nextHeight === undefined) ? -1 : nextHeight;
                        totalHeight = ((prevHeight >= 0) && (nextHeight >= 0)) ? (prevHeight + nextHeight) : -1;
                        if ((totalHeight >= 0) && (totalHeight < size[this._direction])) {
                            offset = Math.round((scrollOffset - size[this._direction]) + nextHeight);
                        }
                    }
                }
                else {
                    // footer
                    nextHeight = (nextHeight === undefined) ? nextHeight = this._calcScrollHeight(true) : nextHeight;
                    nextHeight = (nextHeight === undefined) ? -1 : nextHeight;
                    offset = (nextHeight >= 0) ? (scrollOffset + nextHeight) : (size[this._direction] + 1);
                    if (!this.options.alignment) {
                        prevHeight = (prevHeight === undefined) ? this._calcScrollHeight(false) : prevHeight;
                        prevHeight = (prevHeight === undefined) ? -1 : prevHeight;
                        totalHeight = ((prevHeight >= 0) && (nextHeight >= 0)) ? (prevHeight + nextHeight) : -1;
                        if ((totalHeight >= 0) && (totalHeight < size[this._direction])) {
                            offset = Math.round((scrollOffset - prevHeight) + size[this._direction]);
                        }
                    }
                    offset = -(offset - size[this._direction]);
                }

                // Determine current state
                var visiblePerc = Math.max(Math.min(offset / pullLength, 1), 0);
                switch (pullToRefresh.state) {
                    case PullToRefreshState.HIDDEN:
                        if (this._scroll.scrollForceCount) {
                            if (visiblePerc >= 1) {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                            }
                            else if (offset >= 0.2) {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.PULLING);
                            }
                        }
                        break;
                    case PullToRefreshState.PULLING:
                        if (this._scroll.scrollForceCount && (visiblePerc >= 1)) {
                            _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                        }
                        else if (offset < 0.2) {
                            _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                        }
                        break;
                    case PullToRefreshState.ACTIVE:
                        // nothing to do, wait for completed
                        break;
                    case PullToRefreshState.COMPLETED:
                        if (!this._scroll.scrollForceCount) {
                            if (offset >= 0.2) {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDING);
                            }
                            else {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                            }
                        }
                        break;
                    case PullToRefreshState.HIDDING:
                        if (offset < 0.2) {
                            _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                        }
                        break;
                }

                // Show pull to refresh node
                if (pullToRefresh.state !== PullToRefreshState.HIDDEN) {
                    var contextNode = {
                        renderNode: pullToRefresh.node,
                        prev: !pullToRefresh.footer,
                        next: pullToRefresh.footer,
                        index: !pullToRefresh.footer ? --this._nodes._contextState.prevGetIndex : ++this._nodes._contextState.nextGetIndex
                    };
                    var scrollLength;
                    if (pullToRefresh.state === PullToRefreshState.ACTIVE) {
                        scrollLength = length;
                    }
                    else if (this._scroll.scrollForceCount) {
                        scrollLength = Math.min(offset, length);
                    }
                    var set = {
                        size: [size[0], size[1]],
                        translate: [0, 0, -1e-3], // transform.behind
                        scrollLength: scrollLength
                    };
                    set.size[this._direction] = Math.max(Math.min(offset, pullLength), 0);
                    set.translate[this._direction] = pullToRefresh.footer ? (size[this._direction] - length) : 0;
                    this._nodes._context.set(contextNode, set);
                }
            }
        }
    };

    /**
     * Shows the pulls-to-refresh renderable indicating that a refresh is in progress.
     *
     * @param {Bool} [footer] set to true to show pull-to-refresh at the footer (default: false).
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.showPullToRefresh = function(footer) {
        var pullToRefresh = _getPullToRefresh.call(this, footer);
        if (pullToRefresh) {
            _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
            this._scroll.scrollDirty = true;
        }
    };

    /**
     * Hides the pull-to-refresh renderable in case it was visible.
     *
     * @param {Bool} [footer] set to true to hide the pull-to-refresh at the footer (default: false).
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.hidePullToRefresh = function(footer) {
        var pullToRefresh = _getPullToRefresh.call(this, footer);
        if (pullToRefresh && (pullToRefresh.state === PullToRefreshState.ACTIVE)) {
            _setPullToRefreshState(pullToRefresh, PullToRefreshState.COMPLETED);
            this._scroll.scrollDirty = true;
        }
        return this;
    };

    /**
     * Get the visible state of the pull-to-refresh renderable.
     *
     * @param {Bool} [footer] set to true to get the state of the pull-to-refresh footer (default: false).
     */
    FlexScrollView.prototype.isPullToRefreshVisible = function(footer) {
        var pullToRefresh = _getPullToRefresh.call(this, footer);
        return pullToRefresh ? (pullToRefresh.state === PullToRefreshState.ACTIVE) : false;
    };

    /**
     * Delegates any scroll force to leading/trailing scrollviews.
     * @private
     */
    FlexScrollView.prototype.applyScrollForce = function(delta) {
        var leadingScrollView = this.options.leadingScrollView;
        var trailingScrollView = this.options.trailingScrollView;
        if (!leadingScrollView && !trailingScrollView) {
            return ScrollController.prototype.applyScrollForce.call(this, delta);
        }
        var partialDelta;
        if (delta < 0) {
            if (leadingScrollView) {
                partialDelta = leadingScrollView.canScroll(delta);
                this._leadingScrollViewDelta += partialDelta;
                leadingScrollView.applyScrollForce(partialDelta);
                delta -= partialDelta;
            }
            if (trailingScrollView) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.applyScrollForce.call(this, partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                trailingScrollView.applyScrollForce(delta);
                this._trailingScrollViewDelta += delta;
            }
            else {
                ScrollController.prototype.applyScrollForce.call(this, delta);
                this._thisScrollViewDelta += delta;
            }
        }
        else {
            if (trailingScrollView) {
                partialDelta = trailingScrollView.canScroll(delta);
                trailingScrollView.applyScrollForce(partialDelta);
                this._trailingScrollViewDelta += partialDelta;
                delta -= partialDelta;
            }
            if (leadingScrollView) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.applyScrollForce.call(this, partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                leadingScrollView.applyScrollForce(delta);
                this._leadingScrollViewDelta += delta;
            }
            else {
                ScrollController.prototype.applyScrollForce.call(this, delta);
                this._thisScrollViewDelta += delta;
            }
        }
        return this;
    };

    /**
     * Delegates any scroll force to leading/trailing scrollviews.
     * @private
     */
    FlexScrollView.prototype.updateScrollForce = function(prevDelta, newDelta) {
        var leadingScrollView = this.options.leadingScrollView;
        var trailingScrollView = this.options.trailingScrollView;
        if (!leadingScrollView && !trailingScrollView) {
            return ScrollController.prototype.updateScrollForce.call(this, prevDelta, newDelta);
        }
        var partialDelta;
        var delta = newDelta - prevDelta;
        if (delta < 0) {
            if (leadingScrollView) {
                partialDelta = leadingScrollView.canScroll(delta);
                leadingScrollView.updateScrollForce(this._leadingScrollViewDelta, this._leadingScrollViewDelta + partialDelta);
                this._leadingScrollViewDelta += partialDelta;
                delta -= partialDelta;
            }
            if (trailingScrollView && delta) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                this._trailingScrollViewDelta += delta;
                trailingScrollView.updateScrollForce(this._trailingScrollViewDelta, this._trailingScrollViewDelta + delta);
            }
            else if (delta) {
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
                this._thisScrollViewDelta += delta;
            }
        }
        else {
            if (trailingScrollView) {
                partialDelta = trailingScrollView.canScroll(delta);
                trailingScrollView.updateScrollForce(this._trailingScrollViewDelta, this._trailingScrollViewDelta + partialDelta);
                this._trailingScrollViewDelta += partialDelta;
                delta -= partialDelta;
            }
            if (leadingScrollView) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                leadingScrollView.updateScrollForce(this._leadingScrollViewDelta, this._leadingScrollViewDelta + delta);
                this._leadingScrollViewDelta += delta;
            }
            else {
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
                this._thisScrollViewDelta += delta;
            }
        }
        return this;
    };

    /**
     * Delegates any scroll force to leading/trailing scrollviews.
     * @private
     */
    FlexScrollView.prototype.releaseScrollForce = function(delta, velocity) {
        var leadingScrollView = this.options.leadingScrollView;
        var trailingScrollView = this.options.trailingScrollView;
        if (!leadingScrollView && !trailingScrollView) {
            return ScrollController.prototype.releaseScrollForce.call(this, delta, velocity);
        }
        var partialDelta;
        if (delta < 0) {
            if (leadingScrollView) {
                partialDelta = Math.max(this._leadingScrollViewDelta, delta);
                this._leadingScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                leadingScrollView.releaseScrollForce(this._leadingScrollViewDelta, delta ? 0 : velocity);
            }
            if (trailingScrollView) {
                partialDelta = Math.max(this._thisScrollViewDelta, delta);
                this._thisScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? 0 : velocity);
                this._trailingScrollViewDelta -= delta;
                trailingScrollView.releaseScrollForce(this._trailingScrollViewDelta, delta ? velocity : 0);
            }
            else {
                this._thisScrollViewDelta -= delta;
                ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
            }
        }
        else {
            if (trailingScrollView) {
                partialDelta = Math.min(this._trailingScrollViewDelta, delta);
                this._trailingScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                trailingScrollView.releaseScrollForce(this._trailingScrollViewDelta, delta ? 0 : velocity);
            }
            if (leadingScrollView) {
                partialDelta = Math.min(this._thisScrollViewDelta, delta);
                this._thisScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? 0 : velocity);
                this._leadingScrollViewDelta -= delta;
                leadingScrollView.releaseScrollForce(this._leadingScrollViewDelta, delta ? velocity : 0);
            }
            else {
                this._thisScrollViewDelta -= delta;
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
            }
        }
        return this;
    };

    /**
     * Overriden commit, in order to emit pull-to-refresh event after
     * all the rendering has been done.
     * @private
     */
    FlexScrollView.prototype.commit = function(context) {

        // Call base class
        var result = ScrollController.prototype.commit.call(this, context);

        // Emit pull to refresh events after the whole commit call has been executed
        // so that when the refresh event is received, the FlexScrollView is in a valid state
        // and can be queried.
        if (this._pullToRefresh) {
            for (var i = 0; i < 2; i++) {
                var pullToRefresh = this._pullToRefresh[i];
                if (pullToRefresh) {
                    if ((pullToRefresh.state === PullToRefreshState.ACTIVE) &&
                        (pullToRefresh.prevState !== PullToRefreshState.ACTIVE)) {
                        this._eventOutput.emit('refresh', {
                            target: this,
                            footer: pullToRefresh.footer
                        });
                    }
                    pullToRefresh.prevState = pullToRefresh.state;
                }
            }
        }
        return result;
    };

    module.exports = FlexScrollView;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/*global console*/
/*eslint no-console:0 */

/**
 * Virtual ViewSequence for famo.us which creates & destroys nodes using a
 * factory delegate. The factory class should support the following functions:
 * - create()
 * - createNext(prevRenderable)
 * - createPrevious(nextRenderable)
 * - destroy(renderable) (optional)
 *
 * Example:
 *
 * ```javascript
 * var VirtualViewSequence = require('famous-flex/VirtualViewSequence');
 *
 * // Factory for creating surfaces
 * function MyFactory() {}
 * MyFactory.prototype.create = function(index) {
 *   var surface = new Surface({
 *     size: [undefined, 100],
 *     classes: ['my-surface']
 *   });
 *   surface.index = index || 0; // add property to renderable
 *   return surface;
 * };
 * MyFactory.prototype.createNext = function(renderable) {
 *   return this.create(renderable.index + 1);
 * };
 * MyFactory.prototype.createPrevious = function(renderable) {
 *   return this.create(renderable.index - 1);
 * };
 *
 * // Create infinite scrollview
 * var viewSequence = new VirtualViewSequence({
 *   factory: new MyFactory()
 * });
 * var scrollView = new FlexScrollView({
 *   dataSource: viewSequence
 * });
 * ```
 * @module
 */
define('famous-flex/VirtualViewSequence',['require','exports','module','famous/core/EventHandler'],function(require, exports, module) {

    // import dependencies
    var EventHandler = require('famous/core/EventHandler');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {Object} options.factory Factory delegate for creating new renderables.
     * @param {Renderable} [options.value] Renderable for this node (when omitted, `factory.create()` is called)
     * @param {Number} [options.index] Index of this node (default: 0).
     * @alias module:VirtualViewSequence
     */
    function VirtualViewSequence(options) {
        options = options || {};
        this._ = options._ || new (this.constructor.Backing)(options);
        this.touched = true;
        this.value = options.value || this._.factory.create();
        this.index = options.index || 0;
        this.next = options.next;
        this.prev = options.prev;
        EventHandler.setOutputHandler(this, this._.eventOutput);
        this.value.pipe(this._.eventOutput);
    }

    VirtualViewSequence.Backing = function Backing(options) {
        this.factory = options.factory;
        this.eventOutput = new EventHandler();
    };

    /**
     * Get previous node.
     *
     * When no previous node exists, the factory-delegate function `createPrevious`
     * is called to construct a renderable for the previous node. When `createPrevious`
     * returns `undefined`, no previous-node will be created.
     *
     * @return {VirtualViewSequence} previous node.
     */
    VirtualViewSequence.prototype.getPrevious = function(noCreate) {
        if (this.prev) {
            this.prev.touched = true;
            return this.prev;
        }
        if (noCreate) {
            return undefined;
        }
        var value = this._.factory.createPrevious(this.get());
        if (!value) {
            return undefined;
        }
        //console.log('creating new prev node');
        this.prev = new VirtualViewSequence({
            _: this._,
            value: value,
            index: this.index - 1,
            next: this
        });
        return this.prev;
    };

    /**
     * Get next node.
     *
     * When no next node exists, the factory-delegate function `createNext`
     * is called to construct a renderable for the next node. When `createNext`
     * returns `undefined`, no next-node will be created.
     *
     * @return {VirtualViewSequence} next node.
     */
    VirtualViewSequence.prototype.getNext = function(noCreate) {
        if (this.next) {
            this.next.touched = true;
            return this.next;
        }
        if (noCreate) {
            return undefined;
        }
        var value = this._.factory.createNext(this.get());
        if (!value) {
            return undefined;
        }
        //console.log('creating new next node');
        this.next = new VirtualViewSequence({
            _: this._,
            value: value,
            index: this.index + 1,
            prev: this
        });
        return this.next;
    };

    /**
     * Get the value of this node.
     *
     * @return {Renderable} surface/view
     */
    VirtualViewSequence.prototype.get = function() {
        this.touched = true;
        return this.value;
    };

    /**
     * Get the index of the node.
     *
     * @return {Number} Index of node.
     */
    VirtualViewSequence.prototype.getIndex = function() {
        this.touched = true;
        return this.index;
    };

    /**
     * Get human readable string verion of the node.
     *
     * @return {String} node as a human readable string
     */
    VirtualViewSequence.prototype.toString = function() {
        return '' + this.index;
    };

    /**
     * Cleans up any un-accessed nodes since the previous call to `cleanup`.
     *
     * This function cleans up any nodes that have not been accessed
     * since the last call to `cleanup`. When a node is accessed
     * through a call to `getNext`, `getPrevious`, `get` or `getIndex`
     * it is considered `touched` and should not be cleaned up.
     *
     * @return {VirtualViewSequence} this.
     */
    VirtualViewSequence.prototype.cleanup = function() {
        var node = this.prev;
        while (node) {
            if (!node.touched) {
                node.next.prev = undefined;
                node.next = undefined;
                if (this._.factory.destroy) {
                    while (node) {
                        this._.factory.destroy(node.value);
                        node = node.prev;
                    }
                }
                break;
            }
            node.touched = false;
            node = node.prev;
        }
        node = this.next;
        while (node) {
            if (!node.touched) {
                node.prev.next = undefined;
                node.prev = undefined;
                if (this._.factory.destroy) {
                    while (node) {
                        this._.factory.destroy(node.value);
                        node = node.next;
                    }
                }
                break;
            }
            node.touched = false;
            node = node.next;
        }
        return this;
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.unshift = function() {
        if (console.error) {
            console.error('VirtualViewSequence.unshift is not supported and should not be called');
        }
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.push = function() {
        if (console.error) {
            console.error('VirtualViewSequence.push is not supported and should not be called');
        }
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.splice = function() {
        if (console.error) {
            console.error('VirtualViewSequence.splice is not supported and should not be called');
        }
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.swap = function() {
        if (console.error) {
            console.error('VirtualViewSequence.swap is not supported and should not be called');
        }
    };

    module.exports = VirtualViewSequence;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Animating between famo.us views in awesome ways.
 *
 * @module
 */
define('famous-flex/AnimationController',['require','exports','module','famous/core/View','./LayoutController','famous/core/Transform','famous/core/Modifier','famous/modifiers/StateModifier','famous/core/RenderNode','famous/utilities/Timer','famous/transitions/Easing'],function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var LayoutController = require('./LayoutController');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var RenderNode = require('famous/core/RenderNode');
    var Timer = require('famous/utilities/Timer');
    var Easing = require('famous/transitions/Easing');

    /**
     * @class
     * @param {Object} [options] Configurable options.
     * @param {Object} [options.transition] Transition options (default: `{duration: 400, curve: Easing.inOutQuad}`).
     * @param {Function} [options.animation] Animation function (default: `AnimationController.Animation.Slide.Left`).
     * @param {Number} [options.zIndexOffset] Optional z-index difference between the hiding & showing renderable (default: 0).
     * @param {Object} [options.show] Show specific options.
     * @param {Object} [options.show.transition] Show specific transition options.
     * @param {Function} [options.show.animation] Show specific animation function.
     * @param {Object} [options.hide] Hide specific options.
     * @param {Object} [options.hide.transition] Hide specific transition options.
     * @param {Function} [options.hide.animation] Hide specific animation function.
     * @param {Object} [options.transfer] Transfer options.
     * @param {Object} [options.transfer.transition] Transfer specific transition options.
     * @param {Number} [options.transfer.zIndex] Z-index the tranferables are moved on top while animating (default: 10).
     * @param {Bool} [options.transfer.fastResize] When enabled, scales the renderable i.s.o. resizing when doing the transfer animation (default: true).
     * @param {Array} [options.transfer.items] Ids (key/value) pairs (source-id/target-id) of the renderables that should be transferred.
     * @alias module:AnimationController
     */
    function AnimationController(options) {
        View.apply(this, arguments);

        _createLayout.call(this);

        if (options) {
            this.setOptions(options);
        }
    }
    AnimationController.prototype = Object.create(View.prototype);
    AnimationController.prototype.constructor = AnimationController;

    /**
     * Out of the box supported animations.
     */
    AnimationController.Animation = {
        Slide: {
            Left: function(show, size) {
                return {transform: Transform.translate(show ? size[0] : -size[0], 0, 0)};
            },
            Right: function(show, size) {
                return {transform: Transform.translate(show ? -size[0] : size[0], 0, 0)};
            },
            Up: function(show, size) {
                return {transform: Transform.translate(0, show ? size[1] : -size[1], 0)};
            },
            Down: function(show, size) {
                return {transform: Transform.translate(0, show ? -size[1] : size[1], 0)};
            }
        },
        Fade: function(show, size) {
            return {
                opacity: (this && (this.opacity !== undefined)) ? this.opacity : 0
            };
        },
        Zoom: function(show, size) {
            var scale = (this && (this.scale !== undefined)) ? this.scale : 0.5;
            return {
                transform: Transform.scale(scale, scale, 1),
                align: [0.5, 0.5],
                origin: [0.5, 0.5]
            };
        },
        FadedZoom: function(show, size) {
            var scale = show ? ((this && (this.showScale !== undefined)) ? this.showScale : 0.9) : ((this && (this.hideScale !== undefined)) ? this.hideScale : 1.1);
            return {
                opacity: (this && (this.opacity !== undefined)) ? this.opacity : 0,
                transform: Transform.scale(scale, scale, 1),
                align: [0.5, 0.5],
                origin: [0.5, 0.5]
            };
        }
        /*,
        Flip: {
            Left: function(show, size) {
                return {transform: Transform.rotate(0, show ? Math.PI : -Math.PI, 0)};
            },
            Right: function(show, size) {
                return {transform: Transform.rotate(0, show ? -Math.PI : Math.PI, 0)};
            },
            Up: function(show, size) {
                return {transform: Transform.rotate(show ? Math.PI : -Math.PI, 0, 0)};
            },
            Down: function(show, size) {
                return {transform: Transform.rotate(show ? -Math.PI : Math.PI, 0, 0)};
            }
        }*/
    };

    AnimationController.DEFAULT_OPTIONS = {
        transition: {duration: 400, curve: Easing.inOutQuad},
        animation: AnimationController.Animation.Fade,
        show: {
            // transition,
            // animation
        },
        hide: {
            // transition,
            // animation
        },
        transfer: {
            fastResize: true,
            zIndex: 10 // z-index offset the items are translated while transferring
            // transition,
            // items: {
            //   'image': 'image'
            //   'image': ['image', 'image2']
            // }
        },
        zIndexOffset: 0
    };

    var ItemState = {
        NONE: 0,
        HIDE: 1,
        HIDING: 2,
        SHOW: 3,
        SHOWING: 4,
        VISIBLE: 5,
        QUEUED: 6
    };

    /**
     * Stacks the renderables on top of each other
     * with a z-translation of this.options.zIndexOffset.
     */
    function ViewStackLayout(context, options) {
        var set = {
            size: context.size,
            translate: [0, 0, 0]
        };
        var views = context.get('views');
        var transferables = context.get('transferables');
        for (var i = 0; i < Math.min(views.length, 2); i++) {
            var item = this._viewStack[i];
            switch (item.state) {
                case ItemState.HIDE:
                case ItemState.HIDING:
                case ItemState.VISIBLE:
                case ItemState.SHOW:
                case ItemState.SHOWING:

                    // Layout view
                    var view = views[i];
                    context.set(view, set);

                    // Layout any transferables
                    for (var j = 0; j < transferables.length; j++) {
                        for (var k = 0; k < item.transferables.length; k++) {
                            if (transferables[j].renderNode === item.transferables[k].renderNode) {
                                context.set(transferables[j], {
                                    translate: [0, 0, set.translate[2]],
                                    size: [context.size[0], context.size[1]]
                                });
                            }
                        }
                    }

                    // Increase z-index for next view
                    set.translate[2] += options.zIndexOffset;
                    break;
            }
        }
    }

    /**
     * Creates the view-stack layout.
     */
    function _createLayout() {
        this._renderables = {
            views: [],
            transferables: []
        };
        this._viewStack = [];
        this.layout = new LayoutController({
            layout: ViewStackLayout.bind(this),
            layoutOptions: this.options,
            dataSource: this._renderables
        });
        this.add(this.layout);
        this.layout.on('layoutend', _startAnimations.bind(this));
    }

    /**
     * Gets the spec from a spec.
     */
    function _getViewSpec(item, view, id, callback) {
        if (!item.view) {
            return;
        }
        var spec = view.getSpec(id);
        if (spec) {
            callback(spec);
        }
        else {
            Timer.after(_getViewSpec.bind(this, item, view, id, callback), 1);
        }
    }

    /**
     * Gets the transferable delegate for the given id.
     */
    function _getTransferable(item, view, id) {
        // 1. If view supports getTransferable, use that
        if (view.getTransferable) {
            return view.getTransferable(id);
        }
        // 2. If view is derived from layoutcontroller, use that
        if (view.getSpec && view.get && view.replace) {
            if (view.get(id) !== undefined) {
                return {
                    get: function() {
                        return view.get(id);
                    },
                    show: function(renderable) {
                        view.replace(id, renderable);
                    },
                    getSpec: _getViewSpec.bind(this, item, view, id)
                };
            }
        }
        // 3. If view has an embedded layout, use that as fallback
        if (view.layout) {
            return _getTransferable.call(this, item, view.layout, id);
        }
    }

    /**
     * Begins visual transfer or renderables from the previous item
     * to the new item.
     */
    function _startTransferableAnimations(item, prevItem) {
        for (var sourceId in item.options.transfer.items) {
            _startTransferableAnimation.call(this, item, prevItem, sourceId);
        }
    }
    function _startTransferableAnimation(item, prevItem, sourceId) {
        var target = item.options.transfer.items[sourceId];
        var transferable = {};
        transferable.source = _getTransferable.call(this, prevItem, prevItem.view, sourceId);
        if (Array.isArray(target)) {
            for (var i = 0; i < target.length; i++) {
                transferable.target = _getTransferable.call(this, item, item.view, target[i]);
                if (transferable.target) {
                    break;
                }
            }
        }
        else {
            transferable.target = _getTransferable.call(this, item, item.view, target);
        }
        if (transferable.source && transferable.target) {
            transferable.source.getSpec(function(sourceSpec) {

                // Replace source & target renderables in the views
                // source: dummy-node
                // target: target-renderable with opacity: 0.
                transferable.originalSource = transferable.source.get();
                transferable.source.show(new RenderNode(new Modifier(sourceSpec)));
                transferable.originalTarget = transferable.target.get();
                var targetNode = new RenderNode(new Modifier({opacity: 0}));
                targetNode.add(transferable.originalTarget);
                transferable.target.show(targetNode);

                // Take ownership of the source renderable.
                // This renderable will be layouted by the layout-function
                var zIndexMod = new Modifier({
                    transform: Transform.translate(0, 0, item.options.transfer.zIndex)
                });
                var mod = new StateModifier(sourceSpec);
                transferable.renderNode = new RenderNode(zIndexMod);
                transferable.renderNode.add(mod).add(transferable.originalSource);
                item.transferables.push(transferable);
                this._renderables.transferables.push(transferable.renderNode);
                this.layout.reflowLayout();

                // Wait for the target spec to have settled. This may take a couple render
                // cycles if for instance, this involves a true-size renderable or the
                // renderable is affected by other true-size renderables around itsself.
                Timer.after(function() {
                    transferable.target.getSpec(function(targetSpec, transition) {
                        mod.halt();
                        if ((sourceSpec.opacity !== undefined) || (targetSpec.opacity !== undefined)) {
                            mod.setOpacity((targetSpec.opacity === undefined) ? 1 : targetSpec.opacity, transition|| item.options.transfer.transition);
                        }
                        if (item.options.transfer.fastResize) {
                            if (sourceSpec.transform || targetSpec.transform || sourceSpec.size || targetSpec.size) {
                                var transform = targetSpec.transform || Transform.identity;
                                if (sourceSpec.size && targetSpec.size) {
                                    transform = Transform.multiply(transform, Transform.scale(targetSpec.size[0] / sourceSpec.size[0], targetSpec.size[1] / sourceSpec.size[1], 1));
                                }
                                mod.setTransform(transform, transition || item.options.transfer.transition);
                            }
                        }
                        else {
                            if (sourceSpec.transform || targetSpec.transform) {
                                mod.setTransform(targetSpec.transform || Transform.identity, transition || item.options.transfer.transition);
                            }
                            if (sourceSpec.size || targetSpec.size) {
                                mod.setSize(targetSpec.size || sourceSpec.size, transition || item.options.transfer.transition);
                            }
                        }
                    }, true);
                }, 1);
            }.bind(this), false);
        }
    }

    /**
     * Called whenever the view has been shown and the
     * transferable animations should be ended. This returns
     * the renderables to their original views.
     */
    function _endTransferableAnimations(item) {
        for (var j = 0; j < item.transferables.length; j++) {
            var transferable = item.transferables[j];
            for (var i = 0; i < this._renderables.transferables.length; i++) {
                if (this._renderables.transferables[i] === transferable.renderNode) {
                    this._renderables.transferables.splice(i, 1);
                    break;
                }
            }
            transferable.source.show(transferable.originalSource);
            transferable.target.show(transferable.originalTarget);
        }
        item.transferables = [];
        this.layout.reflowLayout();
    }

    /**
     * Starts a show or hide animation.
     */
    function _startAnimations(event) {
        var prevItem;
        for (var i = 0; i < this._viewStack.length; i++) {
            var item = this._viewStack[i];
            switch (item.state) {
                case ItemState.HIDE:
                    item.state = ItemState.HIDING;
                    _startAnimation.call(this, item, prevItem, event.size, false);
                    _updateState.call(this);
                    break;
                case ItemState.SHOW:
                    item.state = ItemState.SHOWING;
                    _startAnimation.call(this, item, prevItem, event.size, true);
                    _updateState.call(this);
                    break;
            }
            prevItem = item;
        }
    }

    /**
     * Starts the view animation.
     */
    function _startAnimation(item, prevItem, size, show) {
        var animation = show ? item.options.show.animation : item.options.hide.animation;
        var spec = animation ? animation.call(undefined, show, size) : {};
        item.mod.halt();
        var callback;
        if (show) {
            callback = item.showCallback;
            if (spec.transform) {
                item.mod.setTransform(spec.transform);
                item.mod.setTransform(Transform.identity, item.options.show.transition, callback);
                callback = undefined;
            }
            if (spec.opacity !== undefined) {
                item.mod.setOpacity(spec.opacity);
                item.mod.setOpacity(1, item.options.show.transition, callback);
                callback = undefined;
            }
            if (spec.align) {
                item.mod.setAlign(spec.align);
            }
            if (spec.origin) {
                item.mod.setOrigin(spec.origin);
            }
            if (prevItem) {
                _startTransferableAnimations.call(this, item, prevItem);
            }
            if (callback) {
                callback();
            }
        }
        else {
            callback = item.hideCallback;
            if (spec.transform) {
                item.mod.setTransform(spec.transform, item.options.hide.transition, callback);
                callback = undefined;
            }
            if (spec.opacity !== undefined) {
                item.mod.setOpacity(spec.opacity, item.options.hide.transition, callback);
                callback = undefined;
            }
            if (callback) {
                callback();
            }
        }
    }

    /**
     * Sets the options for an item.
     */
    function _setItemOptions(item, options) {
        item.options = {
            show: {
                transition: this.options.show.transition || this.options.transition,
                animation: this.options.show.animation || this.options.animation
            },
            hide: {
                transition: this.options.hide.transition || this.options.transition,
                animation: this.options.hide.animation || this.options.animation
            },
            transfer: {
                transition: this.options.transfer.transition || this.options.transition,
                items: this.options.transfer.items || {},
                zIndex: this.options.transfer.zIndex,
                fastResize: this.options.transfer.fastResize
            }
        };
        if (options) {
            item.options.show.transition = (options.show ? options.show.transition : undefined) || options.transition || item.options.show.transition;
            if (options && options.show && (options.show.animation !== undefined)) {
                item.options.show.animation = options.show.animation;
            }
            else if (options && (options.animation !== undefined)) {
                item.options.show.animation = options.animation;
            }
            item.options.transfer.transition = (options.transfer ? options.transfer.transition : undefined) || options.transition || item.options.transfer.transition;
            item.options.transfer.items = (options.transfer ? options.transfer.items : undefined) || item.options.transfer.items;
            item.options.transfer.zIndex = (options.transfer && (options.transfer.zIndex !== undefined)) ? options.transfer.zIndex : item.options.transfer.zIndex;
            item.options.transfer.fastResize = (options.transfer && (options.transfer.fastResize !== undefined)) ? options.transfer.fastResize : item.options.transfer.fastResize;
        }
    }

    /**
     * Updates the state.
     */
    function _updateState() {
        var prevItem;
        var invalidated = false;
        for (var i = 0; i < Math.min(this._viewStack.length, 2); i++) {
            var item = this._viewStack[i];
            if (item.state === ItemState.QUEUED) {
                if (!prevItem ||
                    (prevItem.state === ItemState.VISIBLE) ||
                    (prevItem.state === ItemState.HIDING)) {
                    if (prevItem && (prevItem.state === ItemState.VISIBLE)) {
                        prevItem.state = ItemState.HIDE;
                    }
                    item.state = ItemState.SHOW;
                    invalidated = true;
                }
                break;
            }
            else if ((item.state === ItemState.VISIBLE) && item.hide) {
                item.state = ItemState.HIDE;
            }
            if ((item.state === ItemState.SHOW) || (item.state === ItemState.HIDE)) {
                this.layout.reflowLayout();
            }
            prevItem = item;
        }
        if (invalidated) {
            _updateState.call(this);
            this.layout.reflowLayout();
        }
    }

    /**
     * Shows a renderable using an animation and hides the old renderable.
     *
     * When multiple show operations are executed, they are queued and
     * shown in that sequence. Use `.halt` to cancel any pending show
     * operations from the queue.
     *
     * @param {Renderable} renderable View or surface to show
     * @param {Object} [options] Options.
     * @param {Object} [options.transition] Transition options for both show & hide.
     * @param {Function} [options.animation] Animation function for both show & hide.
     * @param {Object} [options.show] Show specific options.
     * @param {Object} [options.show.transition] Show specific transition options.
     * @param {Function} [options.show.animation] Show specific animation function.
     * @param {Object} [options.hide] Hide specific options.
     * @param {Object} [options.hide.transition] Hide specific transition options.
     * @param {Function} [options.hide.animation] Hide specific animation function.
     * @param {Object} [options.transfer] Transfer options.
     * @param {Object} [options.transfer.transition] Transfer specific transition options.
     * @param {Number} [options.transfer.zIndex] Z-index the tranferables are moved on top while animating.
     * @param {Array} [options.transfer.items] Ids (key/value) pairs (source-id/target-id) of the renderables that should be transferred.
     * @param {Function} [callback] Function that is called on completion.
     * @return {AnimationController} this
     */
    AnimationController.prototype.show = function(renderable, options, callback) {
        if (!renderable) {
            return this.hide(options, callback);
        }
        var item = this._viewStack.length ? this._viewStack[this._viewStack.length - 1] : undefined;
        if (item && (item.view === renderable)) {
            item.hide = false;
            if (item.state === ItemState.HIDE) {
                item.state = ItemState.QUEUED;
                _setItemOptions.call(this, item, options);
                _updateState.call(this);
            }
            return this;
        }
        if (item && (item.state !== ItemState.HIDING) && options) {
            item.options.hide.transition = (options.hide ? options.hide.transition : undefined) || options.transition || item.options.hide.transition;
            if (options && options.hide && (options.hide.animation !== undefined)) {
                item.options.hide.animation = options.hide.animation;
            }
            else if (options && (options.animation !== undefined)) {
                item.options.hide.animation = options.animation;
            }
        }

        item = {
            view: renderable,
            mod: new StateModifier(),
            state: ItemState.QUEUED,
            callback: callback,
            transferables: [] // renderables currently being transfered
        };
        item.node = new RenderNode(item.mod);
        item.node.add(renderable);
        _setItemOptions.call(this, item, options);
        item.showCallback = function() {
            item.state = ItemState.VISIBLE;
            _updateState.call(this);
            _endTransferableAnimations.call(this, item);
            if (callback) {
                callback();
            }
        }.bind(this);
        item.hideCallback = function() {
            var index = this._viewStack.indexOf(item);
            this._renderables.views.splice(index, 1);
            this._viewStack.splice(index, 1);
            item.view = undefined;
            _updateState.call(this);
            this.layout.reflowLayout();
        }.bind(this);
        this._renderables.views.push(item.node);
        this._viewStack.push(item);
        _updateState.call(this);
        return this;
    };

    /**
     * Hides the current view with an animation.
     *
     * @param {Object} [options] Hide options
     * @param {Object} [options.transition] Hide transition options.
     * @param {Function} [options.animation] Hide animation function.
     * @param {Function} [callback] Function that is called an completion.
     * @return {AnimationController} this
     */
    AnimationController.prototype.hide = function(options, callback) {
        var item = this._viewStack.length ? this._viewStack[this._viewStack.length - 1] : undefined;
        if (!item || (item.state === ItemState.HIDING)) {
            return this;
        }
        item.hide = true;
        if (options) {
            item.options.hide.transition = (options.hide ? options.hide.transition : undefined) || options.transition || item.options.hide.transition;
            if (options && options.hide && (options.hide.animation !== undefined)) {
                item.options.hide.animation = options.hide.animation;
            }
            else if (options && (options.animation !== undefined)) {
                item.options.hide.animation = options.animation;
            }
        }
        item.hideCallback = function() {
            var index = this._viewStack.indexOf(item);
            this._renderables.views.splice(index, 1);
            this._viewStack.splice(index, 1);
            item.view = undefined;
            _updateState.call(this);
            this.layout.reflowLayout();
            if (callback) {
                callback();
            }
        }.bind(this);
        _updateState.call(this);
        return this;
    };

    /**
     * Clears the queue of any pending show animations.
     *
     * @return {AnimationController} this
     */
    AnimationController.prototype.halt = function() {
        for (var i = 0; i < this._viewStack.length; i++) {
            var item = this._viewStack[this._viewStack.length - 1];
            if ((item.state === ItemState.QUEUED) || (item.state === ItemState.SHOW)) {
                this._renderables.views.splice(this._viewStack.length - 1, 1);
                this._viewStack.splice(this._viewStack.length - 1, 1);
                item.view = undefined;
            }
            else {
                break;
            }
        }
        return this;
    };

    /**
     * Gets the currently visible or being shown renderable.
     *
     * @return {Renderable} currently visible view/surface
     */
    AnimationController.prototype.get = function() {
        for (var i = 0; i < this._viewStack.length; i++) {
            var item = this._viewStack[i];
            if ((item.state === ItemState.VISIBLE) ||
                (item.state === ItemState.SHOW) ||
                (item.state === ItemState.SHOWING)) {
                return item.view;
            }
        }
        return undefined;
    };

    module.exports = AnimationController;
});

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
 * Lays out renderables in a spinner wheel (slot-machine wheel) formation.
 *
 * |options|type|description|
 * |---|---|---|
 * |`itemSize`|Size|Size (width or height) of an item to layout.|
 * |`[diameter]`|Number|Diameter of the wheel in pixels (default: `3 x itemSize`).|
 * |`[radialOpacity]`|Number|Opacity (0..1) at the diameter edges of the wheel (default: 1).|
 *
 * Example:
 *
 * ```javascript
 * var ContainerSurface = require('famous/surfaces/ContainerSurface');
 * var ScrollController = require('famous-flex/ScrollController');
 * var WheelLayout = require('famous-flex/layouts/WheelLayout');
 *
 * // Create scroll-wheel
 * var scrollWheel = new ScrollController({
 *   layout: WheelLayout,
 *   layoutOptions: {
 *     itemSize: 100,      // item has height of 100 pixels
 *     radialOpacity: 0.5  // make items at the edges more transparent
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * });
 *
 * // Create a container-surface for clipping and give it a nice perspective
 * var container = new ContainerSurface({
 *   properties: {
 *     overflow: 'hidden'
 *   }
 * });
 * container.context.setPerspective(1500);
 * container.add(scrollWheel);
 * ```
 * @module
 */
define('famous-flex/layouts/WheelLayout',['require','exports','module','famous/utilities/Utility'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.Y, Utility.Direction.X],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: false
    };

    // Data
    var size;
    var direction;
    var revDirection;
    var node;
    var itemSize;
    var diameter;
    var offset;
    var bound;
    var angle;
    var radius;
    var itemAngle;
    var radialOpacity;
    var set = {
        opacity: 1,
        size: [0, 0],
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        scrollLength: undefined
    };

    /**
     * Wheel-layout
     */
    function WheelLayout(context, options) {

		//
		// Prepare
		//
		size = context.size;
		direction = context.direction;
		revDirection = direction ? 0 : 1;
		itemSize = options.itemSize || (size[direction] / 2);
		diameter = options.diameter || (itemSize * 3);
		radius = diameter / 2;
        itemAngle = Math.atan2((itemSize / 2), radius) * 2;
        radialOpacity = (options.radialOpacity === undefined) ? 1 : options.radialOpacity;

		//
        // reset size & translation
        //
        set.opacity = 1;
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.size[revDirection] = size[revDirection];
        set.size[direction] = itemSize;
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = 0;
        set.rotate[0] = 0;
        set.rotate[1] = 0;
        set.rotate[2] = 0;
        set.scrollLength = itemSize;

        //
        // process next nodes
        //
        offset = context.scrollOffset;
        bound = (((Math.PI / 2) / itemAngle) * itemSize) + itemSize;
		while (offset <= bound) {
			node = context.next();
            if (!node) {
				break;
            }
            if (offset >= -bound) {
				angle = (offset / itemSize) * itemAngle;
				set.translate[direction] = radius * Math.sin(angle);
				set.translate[2] = (radius * Math.cos(angle)) - radius;
				set.rotate[revDirection] = direction ? -angle : angle;
                set.opacity = 1 - ((Math.abs(angle) / (Math.PI / 2)) * (1 - radialOpacity));
				context.set(node, set);
			}
			offset += itemSize;
		}

		//
		// process previous nodes
		//
		offset = context.scrollOffset - itemSize;
		while (offset >= -bound) {
			node = context.prev();
            if (!node) {
				break;
            }
            if (offset <= bound) {
				angle = (offset / itemSize) * itemAngle;
				set.translate[direction] = radius * Math.sin(angle);
				set.translate[2] = (radius * Math.cos(angle)) - radius;
				set.rotate[revDirection] = direction ? -angle : angle;
                set.opacity = 1 - ((Math.abs(angle) / (Math.PI / 2)) * (1 - radialOpacity));
				context.set(node, set);
			}
			offset -= itemSize;
		}
    }

    WheelLayout.Capabilities = capabilities;
    WheelLayout.Name = 'WheelLayout';
    WheelLayout.Description = 'Spinner-wheel/slot-machine layout';
    module.exports = WheelLayout;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Lays-out renderables sequentially based on size-ratios (similar to the stock famo.us FlexibleLayout view).
 *
 * |options|type|description|
 * |---|---|---|
 * |`ratios`|Array|Size-ratios of the renderables.|
 *
 * Example:
 *
 * ```javascript
 * var ProportionalLayout = require('famous-flex/layouts/ProportionalLayout');
 *
 * var layoutController = new LayoutController({
 *   layout: ProportionalLayout,
 *   layoutOptions: {
 *     ratios: [1, 1, 2, 1],      // total size: 5
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}), // 20%
 *     new Surface({content: 'item 2'}), // 20%
 *     new Surface({content: 'item 3'}), // 40%
 *     new Surface({content: 'item 4'})  // 20%
 *   ]
 * });
 * ```
 * @module
 */
define('famous-flex/layouts/ProportionalLayout',['require','exports','module','famous/utilities/Utility'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.Y, Utility.Direction.X],
        scrolling: false
    };

    // data
    var direction;
    var size;
    var ratios;
    var total;
    var offset;
    var index;
    var node;
    var set = {
        size: [0, 0],
        translate: [0, 0, 0]
    };

    // Layout function
    function ProportionalLayout(context, options) {

        // init
        size = context.size;
        direction = context.direction;
        ratios = options.ratios;
        total = 0;

        // Calculate total sum of ratios
        for (index = 0; index < ratios.length; index++) {
            total += ratios[index];
        }

        // Prepare
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.translate[0] = 0;
        set.translate[1] = 0;

        // Layout renderables
        node = context.next();
        offset = 0;
        index = 0;
        while (node && (index < ratios.length)) {

            // Position renderable
            set.size[direction] = ((size[direction] - offset) / total) * ratios[index];
            set.translate[direction] = offset;
            context.set(node, set);

            // Move to next renderable
            offset += set.size[direction];
            total -= ratios[index];
            index++;
            node = context.next();
        }
    }

    ProportionalLayout.Capabilities = capabilities;
    module.exports = ProportionalLayout;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Date/time components helper class (minute, seconds, full-day, month, etc...).
 *
 * @module
 */
define('famous-flex/widgets/DatePickerComponents',['require','exports','module','famous/core/Surface','famous/core/EventHandler'],function(require, exports, module) {

    // import dependencies
    var Surface = require('famous/core/Surface');
    var EventHandler = require('famous/core/EventHandler');

    /**
     * Helper functions for formatting values with X decimal places.
     */
    function decimal1(date) {
        return ('' + date[this.get]());
    }
    function decimal2(date) {
        return ('0' + date[this.get]()).slice(-2);
    }
    function decimal3(date) {
        return ('00' + date[this.get]()).slice(-3);
    }
    function decimal4(date) {
        return ('000' + date[this.get]()).slice(-4);
    }

    /**
     * Base component class
     */
    function Base(options) {
        this._eventOutput = new EventHandler();
        this._pool = [];
        EventHandler.setOutputHandler(this, this._eventOutput);
        if (options) {
            for (var key in options) {
                this[key] = options[key];
            }
        }
    }
    Base.prototype.step = 1;
    Base.prototype.classes = ['item'];
    Base.prototype.getComponent = function(date) {
        return date[this.get]();
    };
    Base.prototype.setComponent = function(date, value) {
        return date[this.set](value);
    };
    Base.prototype.format = function(date) {
        return 'overide to implement';
    };
    Base.prototype.createNext = function(renderable) {
        var date = this.getNext(renderable.date);
        return date ? this.create(date) : undefined;
    };
    Base.prototype.getNext = function(date) {
        date = new Date(date.getTime());
        var newVal = this.getComponent(date) + this.step;
        if ((this.upperBound !== undefined) && (newVal >= this.upperBound)) {
            if (!this.loop) {
                return undefined;
            }
            newVal = Math.max(newVal % this.upperBound, this.lowerBound || 0);
        }
        this.setComponent(date, newVal);
        return date;
    };
    Base.prototype.createPrevious = function(renderable) {
        var date = this.getPrevious(renderable.date);
        return date ? this.create(date) : undefined;
    };
    Base.prototype.getPrevious = function(date) {
        date = new Date(date.getTime());
        var newVal = this.getComponent(date) - this.step;
        if ((this.lowerBound !== undefined) && (newVal < this.lowerBound)) {
            if (!this.loop) {
                return undefined;
            }
            newVal = newVal % this.upperBound;
        }
        this.setComponent(date, newVal);
        return date;
    };
    Base.prototype.installClickHandler = function(renderable) {
        renderable.on('click', function(event) {
            this._eventOutput.emit('click', {
                target: renderable,
                event: event
            });
        }.bind(this));
    };
    Base.prototype.createRenderable = function(classes, data) {
        return new Surface({
            classes: classes,
            content: '<div>' + data + '</div>'
        });
    };
    Base.prototype.create = function(date) {
        date = date || new Date();
        var renderable;
        if (this._pool.length) {
            renderable = this._pool[0];
            this._pool.splice(0, 1);
            renderable.setContent(this.format(date));
        }
        else {
            renderable = this.createRenderable(this.classes, this.format(date));
            this.installClickHandler(renderable);
        }
        renderable.date = date;
        return renderable;
    };
    Base.prototype.destroy = function(renderable) {
        // push the renderable into the pool for re-use
        this._pool.push(renderable);
    };

    /**
     * Year component
     */
    function Year() {
        Base.apply(this, arguments);
    }
    Year.prototype = Object.create(Base.prototype);
    Year.prototype.constructor = Year;
    Year.prototype.classes = ['item', 'year'];
    Year.prototype.format = decimal4;
    Year.prototype.sizeRatio = 1;
    Year.prototype.step = 1;
    Year.prototype.loop = false;
    Year.prototype.set = 'setFullYear';
    Year.prototype.get = 'getFullYear';

    /**
     * Month component
     */
    function Month() {
        Base.apply(this, arguments);
    }
    Month.prototype = Object.create(Base.prototype);
    Month.prototype.constructor = Month;
    Month.prototype.classes = ['item', 'month'];
    Month.prototype.sizeRatio = 2;
    Month.prototype.lowerBound = 0;
    Month.prototype.upperBound = 12;
    Month.prototype.step = 1;
    Month.prototype.loop = true;
    Month.prototype.set = 'setMonth';
    Month.prototype.get = 'getMonth';
    Month.prototype.strings = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    Month.prototype.format = function(date) {
        return this.strings[date.getMonth()];
    };

    /**
     * Full-day component
     */
    function FullDay() {
        Base.apply(this, arguments);
    }
    FullDay.prototype = Object.create(Base.prototype);
    FullDay.prototype.constructor = FullDay;
    FullDay.prototype.classes = ['item', 'fullday'];
    FullDay.prototype.sizeRatio = 2;
    FullDay.prototype.step = 1;
    FullDay.prototype.set = 'setDate';
    FullDay.prototype.get = 'getDate';
    FullDay.prototype.format = function(date) {
        return date.toLocaleDateString();
    };

    /**
     * Week-day component
     */
    function WeekDay() {
        Base.apply(this, arguments);
    }
    WeekDay.prototype = Object.create(Base.prototype);
    WeekDay.prototype.constructor = WeekDay;
    WeekDay.prototype.classes = ['item', 'weekday'];
    WeekDay.prototype.sizeRatio = 2;
    WeekDay.prototype.lowerBound = 0;
    WeekDay.prototype.upperBound = 7;
    WeekDay.prototype.step = 1;
    WeekDay.prototype.loop = true;
    WeekDay.prototype.set = 'setDate';
    WeekDay.prototype.get = 'getDate';
    WeekDay.prototype.strings = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
    ];
    WeekDay.prototype.format = function(date) {
        return this.strings[date.getDay()];
    };

    /**
     * Day component
     */
    function Day() {
        Base.apply(this, arguments);
    }
    Day.prototype = Object.create(Base.prototype);
    Day.prototype.constructor = Day;
    Day.prototype.classes = ['item', 'day'];
    Day.prototype.format = decimal1;
    Day.prototype.sizeRatio = 1;
    Day.prototype.lowerBound = 1;
    Day.prototype.upperBound = 32;
    Day.prototype.step = 1;
    Day.prototype.loop = true;
    Day.prototype.set = 'setDate';
    Day.prototype.get = 'getDate';

    /**
     * Hour component
     */
    function Hour() {
        Base.apply(this, arguments);
    }
    Hour.prototype = Object.create(Base.prototype);
    Hour.prototype.constructor = Hour;
    Hour.prototype.classes = ['item', 'hour'];
    Hour.prototype.format = decimal2;
    Hour.prototype.sizeRatio = 1;
    Hour.prototype.lowerBound = 0;
    Hour.prototype.upperBound = 24;
    Hour.prototype.step = 1;
    Hour.prototype.loop = true;
    Hour.prototype.set = 'setHours';
    Hour.prototype.get = 'getHours';

    /**
     * Minute component
     */
    function Minute() {
        Base.apply(this, arguments);
    }
    Minute.prototype = Object.create(Base.prototype);
    Minute.prototype.constructor = Minute;
    Minute.prototype.classes = ['item', 'minute'];
    Minute.prototype.format = decimal2;
    Minute.prototype.sizeRatio = 1;
    Minute.prototype.lowerBound = 0;
    Minute.prototype.upperBound = 60;
    Minute.prototype.step = 1;
    Minute.prototype.loop = true;
    Minute.prototype.set = 'setMinutes';
    Minute.prototype.get = 'getMinutes';

    /**
     * Second component
     */
    function Second() {
        Base.apply(this, arguments);
    }
    Second.prototype = Object.create(Base.prototype);
    Second.prototype.constructor = Second;
    Second.prototype.classes = ['item', 'second'];
    Second.prototype.format = decimal2;
    Second.prototype.sizeRatio = 1;
    Second.prototype.lowerBound = 0;
    Second.prototype.upperBound = 60;
    Second.prototype.step = 1;
    Second.prototype.loop = true;
    Second.prototype.set = 'setSeconds';
    Second.prototype.get = 'getSeconds';

    /**
     * Millisecond component
     */
    function Millisecond() {
        Base.apply(this, arguments);
    }
    Millisecond.prototype = Object.create(Base.prototype);
    Millisecond.prototype.constructor = Millisecond;
    Millisecond.prototype.classes = ['item', 'millisecond'];
    Millisecond.prototype.format = decimal3;
    Millisecond.prototype.sizeRatio = 1;
    Millisecond.prototype.lowerBound = 0;
    Millisecond.prototype.upperBound = 1000;
    Millisecond.prototype.step = 1;
    Millisecond.prototype.loop = true;
    Millisecond.prototype.set = 'setMilliseconds';
    Millisecond.prototype.get = 'getMilliseconds';

    module.exports = {
        Base: Base,
        Year: Year,
        Month: Month,
        FullDay: FullDay,
        WeekDay: WeekDay,
        Day: Day,
        Hour: Hour,
        Minute: Minute,
        Second: Second,
        Millisecond: Millisecond
    };
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Date/time picker wheel for famo.us.
 *
 * This component can be used as a date/time picker, a clock or
 * any other application which requires a date/time wheel.
 *
 * Example:
 *
 * ```javascript
 * var DatePicker = require('famous-flex/widgets/DatePicker');
 *
 * var datePicker = new DatePicker({
 *   date: new Date(),        // initial date
 *   wheelLayout: {
 *     itemSize: 100,         // height of an item on the date/wheel
 *     diameter: 300,         // diameter of the wheel (undefined = 3 x itemSize)
 *     radialOpacity: 0       // opacity at the top and bottom diameter edge
 *   });
 * });
 * datePicker.setComponents([
 *   new DatePicker.Component.FullDay(),  // full-day component (year + month + day)
 *   new DatePicker.Component.Hour(),     // hour component (0..23)
 *   new DatePicker.Component.Minute()    // minute compoent (0..59)
 * ]);
 * this.add(datePicker); // add to the render-tree
 *
 * datePicker.on('datechange', function(event) {
 *   console.log('new date selected: ' + event.date.toLocaleString());
 * });
 * ```
 *
 * CSS:
 *
 * ```css
 * .ff-datepicker .item {
 *   color: blue;
 *   font-size: 30px;
 * }
 * ```
 * @module
 */
define('famous-flex/widgets/DatePicker',['require','exports','module','famous/core/View','famous/core/Surface','famous/utilities/Utility','famous/surfaces/ContainerSurface','../LayoutController','../ScrollController','../layouts/WheelLayout','../layouts/ProportionalLayout','../VirtualViewSequence','./DatePickerComponents','../LayoutUtility'],function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Utility = require('famous/utilities/Utility');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var LayoutController = require('../LayoutController');
    var ScrollController = require('../ScrollController');
    var WheelLayout = require('../layouts/WheelLayout');
    var ProportionalLayout = require('../layouts/ProportionalLayout');
    var VirtualViewSequence = require('../VirtualViewSequence');
    var DatePickerComponents = require('./DatePickerComponents');
    var LayoutUtility = require('../LayoutUtility');

    /**
     * @class
     * @extends View
     * @param {Object} options Configurable options.
     * @param {Number} [options.perspective] Perspective to use when rendering the wheel.
     * @param {Object} [options.wheelLayout] Layout-options that are passed to the WheelLayout.
     * @param {Object} [options.scrollController] Options that are passed to the underlying ScrollControllers.
     * @param {Object} [options.container] Container-options that are passed to the underlying ContainerSurface.
     * @param {Array.String} [options.classes] Css-classes that are added to the surfaces that are created.
     * @param {Object} [options.createRenderables] Options that specify which renderables should be created.
     * @alias module:DatePicker
     */
    function DatePicker(options) {
        View.apply(this, arguments);

        // Init
        options = options || {};
        this._date = new Date(options.date ? options.date.getTime() : undefined);
        this._components = [];
        this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;

        _createLayout.call(this);
        _updateComponents.call(this);

        // create overlay layout + renderables
        this._overlayRenderables = {
            top: _createRenderable.call(this, 'top'),
            middle: _createRenderable.call(this, 'middle'),
            bottom: _createRenderable.call(this, 'bottom')
        };
        _createOverlay.call(this);

        this.setOptions(this.options);
    }
    DatePicker.prototype = Object.create(View.prototype);
    DatePicker.prototype.constructor = DatePicker;
    DatePicker.prototype.classes = ['ff-widget', 'ff-datepicker'];
    DatePicker.Component = DatePickerComponents;

    DatePicker.DEFAULT_OPTIONS = {
        perspective: 500,
        wheelLayout: {
            itemSize: 100,
            diameter: 500
        },
        createRenderables: {
            item: true,
            top: false,
            middle: false,
            bottom: false
        },
        scrollController: {
            enabled: true,
            paginated: true,
            paginationMode: ScrollController.PaginationMode.SCROLL,
            mouseMove: true,
            scrollSpring: {
                dampingRatio: 1.0,
                period: 800
            }
        }
    };

    /**
     * Creates a new renderable for the given renderable-id.
     *
     */
    function _createRenderable (id, data) {
        var option = this.options.createRenderables[Array.isArray(id) ? id[0] : id];
        if (option instanceof Function) {
            return option.call(this, id, data);
        }
        else if (!option) {
            return undefined;
        }
        if ((data !== undefined) && (data instanceof Object)) {
            return data;
        }
        var surface = new Surface({
            classes: this.classes,
            content: data ? ('<div>' + data + '</div>') : undefined
        });
        if (Array.isArray(id)) {
            for (var i = 0; i < id.length; i++) {
                surface.addClass(id[i]);
            }
        }
        else {
            surface.addClass(id);
        }
        return surface;
    }

    /**
     * Patches the DatePicker instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options (see ScrollController for all inherited options).
     * @param {Number} [options.perspective] Perspective to use when rendering the wheel.
     * @param {Object} [options.wheelLayout] Layout-options that are passed to the WheelLayout.
     * @param {Object} [options.scrollController] Options that are passed to the underlying ScrollControllers.
     * @return {DatePicker} this
     */
    DatePicker.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (!this.layout) {
            return this;
        }
        if (options.perspective !== undefined) {
            this.container.context.setPerspective(options.perspective);
        }
        var i;
        if (options.wheelLayout !== undefined) {
            for (i = 0; i < this.scrollWheels.length; i++) {
                this.scrollWheels[i].scrollController.setLayoutOptions(options.wheelLayout);
            }
            this.overlay.setLayoutOptions({
                itemSize: this.options.wheelLayout.itemSize
            });
        }
        if (options.scrollController !== undefined) {
            for (i = 0; i < this.scrollWheels.length; i++) {
                this.scrollWheels[i].scrollController.setOptions(options.scrollController);
            }
        }
        return this;
    };

    /**
     * Sets the components for the date-picker.
     *
     * @param {Array} components Array of DatePicker.Component objects.
     * @return {DatePicker} this
     */
    DatePicker.prototype.setComponents = function(components) {
        this._components = components;
        _updateComponents.call(this);
        return this;
    };

    /**
     * Get the components for the date-picker.
     *
     * @return {Array} components
     */
    DatePicker.prototype.getComponents = function() {
        return this._components;
    };

    /**
     * Set the selected date.
     *
     * @param {Date} date Selected date/time.
     * @return {DatePicker} this
     */
    DatePicker.prototype.setDate = function(date) {
        this._date.setTime(date.getTime());
        _setDateToScrollWheels.call(this, this._date);
        return this;
    };

    /**
     * Get the selected date.
     *
     * @return {Date} selected date
     */
    DatePicker.prototype.getDate = function() {
        return this._date;
    };

    /**
     * Selects the given date into the scrollwheels (causes scrolling)
     */
    function _setDateToScrollWheels(date) {
        for (var i = 0; i < this.scrollWheels.length; i++) {
            var scrollWheel = this.scrollWheels[i];
            var component = scrollWheel.component;
            var item = scrollWheel.scrollController.getFirstVisibleItem();
            if (item && item.viewSequence) {
                var viewSequence = item.viewSequence;
                var renderNode = item.viewSequence.get();
                var currentValue = component.getComponent(renderNode.date);
                var destValue = component.getComponent(date);

                // Determine the direction to scroll to
                var steps = 0;
                if (currentValue !== destValue) {
                    steps = destValue - currentValue;
                    // when loop is enables, check whether there is a faster path
                    if (component.loop) {
                        var revSteps = (steps < 0) ? (steps + component.upperBound) : (steps - component.upperBound);
                        if (Math.abs(revSteps) < Math.abs(steps)) {
                            steps = revSteps;
                        }
                    }
                }

                // Scroll to the item
                if (!steps) {
                    scrollWheel.scrollController.goToRenderNode(renderNode);
                }
                else {
                    while (currentValue !== destValue) {
                        viewSequence = (steps > 0) ? viewSequence.getNext() : viewSequence.getPrevious();
                        renderNode = viewSequence ? viewSequence.get() : undefined;
                        if (!renderNode) {
                            break;
                        }
                        currentValue = component.getComponent(renderNode.date);
                        if (steps > 0) {
                            scrollWheel.scrollController.goToNextPage();
                        }
                        else {
                            scrollWheel.scrollController.goToPreviousPage();
                        }
                    }
                }
            }
        }
    }

    /**
     * Gets the selected date from all the scroll-wheels.
     */
    function _getDateFromScrollWheels() {
        var date = new Date(this._date);
        for (var i = 0; i < this.scrollWheels.length; i++) {
            var scrollWheel = this.scrollWheels[i];
            var component = scrollWheel.component;
            var item = scrollWheel.scrollController.getFirstVisibleItem();
            if (item && item.renderNode) {
                component.setComponent(date, component.getComponent(item.renderNode.date));
            }
        }
        return date;
    }

    /**
     * Sets up the overal layout
     */
    function _createLayout() {
        this.container = new ContainerSurface(
            this.options.container
        );
        this.container.setClasses(this.classes);
        this.layout = new LayoutController({
            layout: ProportionalLayout,
            layoutOptions: {
                ratios: []
            },
            direction: Utility.Direction.X
        });
        this.container.add(this.layout);
        this.add(this.container);
    }

    /**
     * Called whenever an item is clicked, causes the scrollwheel to scroll to that item.
     */
    function _clickItem(scrollWheel, event) {
        /*if (scrollWheel && event && event.target) {
            scrollWheel.scrollController.goToRenderNode(event.target);
        }*/
    }

    /**
     * Emit scrollstart event when a wheel starts scrolling
     */
    function _scrollWheelScrollStart() {
        this._scrollingCount++;
        if (this._scrollingCount === 1) {
            this._eventOutput.emit('scrollstart', {
                target: this
            });
        }
    }

    /**
     * Emit scrollend event whenever all scrolling has come to a halt
     */
    function _scrollWheelScrollEnd() {
        this._scrollingCount--;
        if (this._scrollingCount === 0) {
            this._eventOutput.emit('scrollend', {
                target: this,
                date: this._date
            });
        }
    }

    /**
     * Emit scrollend event whenever all scrolling has come to a halt
     */
    function _scrollWheelPageChange() {
        this._date = _getDateFromScrollWheels.call(this);
        this._eventOutput.emit('datechange', {
            target: this,
            date: this._date
        });
    }

    /**
     * Updates the date/time components
     */
    function _updateComponents() {
        this.scrollWheels = [];
        this._scrollingCount = 0;
        var dataSource = [];
        var sizeRatios = [];
        for (var i = 0; i < this._components.length; i++) {
            var component = this._components[i];
            component.createRenderable = _createRenderable.bind(this);
            var viewSequence = new VirtualViewSequence({
                factory: component,
                value: component.create(this._date)
            });
            var options = LayoutUtility.combineOptions(
                this.options.scrollController, {
                    layout: WheelLayout,
                    layoutOptions: this.options.wheelLayout,
                    flow: false,
                    direction: Utility.Direction.Y,
                    dataSource: viewSequence,
                    autoPipeEvents: true
                }
            );
            var scrollController = new ScrollController(options);
            scrollController.on('scrollstart', _scrollWheelScrollStart.bind(this));
            scrollController.on('scrollend', _scrollWheelScrollEnd.bind(this));
            scrollController.on('pagechange', _scrollWheelPageChange.bind(this));
            var scrollWheel = {
                component: component,
                scrollController: scrollController,
                viewSequence: viewSequence
            };
            this.scrollWheels.push(scrollWheel);
            component.on('click', _clickItem.bind(this, scrollWheel));
            dataSource.push(scrollController);
            sizeRatios.push(component.sizeRatio);
        }

        this.layout.setDataSource(dataSource);
        this.layout.setLayoutOptions({
            ratios: sizeRatios
        });
    }

    /**
     * Positions the overlay elements: top, middle & bottom.
     */
    function OverlayLayout(context, options) {
        var height = (context.size[1] - options.itemSize) / 2;
        context.set('top', {
            size: [context.size[0], height],
            translate: [0, 0, 1]
        });
        context.set('middle', {
            size: [context.size[0], context.size[1] - (height * 2)],
            translate: [0, height, 1]
        });
        context.set('bottom', {
            size: [context.size[0], height],
            translate: [0, context.size[1] - height, 1]
        });
    }

    /**
     * Creates the overlay LayoutController
     */
    function _createOverlay() {
        this.overlay = new LayoutController({
            layout: OverlayLayout,
            layoutOptions: {
                itemSize: this.options.wheelLayout.itemSize
            },
            dataSource: this._overlayRenderables
        });
        this.add(this.overlay);
    }

    module.exports = DatePicker;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * Tab-bar layout supporting both horizontal (default) and vertical orientation.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[spacing]`|Number|Space in between items|
 * |`[zIncrement]`|Number|Z-translation increment used to stack the elements correctly (default: 0.001)|
 * |`[itemSize]`|Number/Bool|Width or height of the item (see below)|
 *
 * `itemSize` can have of the following values:
 *
 * |itemSize|description|
 * |---|---|---|
 * |`undefined`|When itemSize is undefined or omitted, all items are spread out equally over the full size.|
 * |`Number`|Size of the item.|
 * |`true`|Use the size of the renderable (calls `getSize` on the item).|
 *
 * Example:
 *
 * ```javascript
 * var TabBarLayout = require('famous-flex/layouts/TabBarLayout');
 *
 * var layout = new LayoutController({
 *   layout: TabBarLayout,
 *   layoutOptions: {
 *     itemSize: undefined,   // undefined = fill equally to full width
 *     margins: [5, 1, 5, 1], // margins to utilize
 *     spacing: 10            // space in between items
 *   },
 *   dataSource: {
 *     background: new Surface({properties: {backgroundColor: 'black'}}),
 *     items: [
 *       new Surface({ content: 'one' }),
 *       new Surface({ content: 'two' }),
 *       new Surface({ content: 'three' })
 *     ],
 *     spacers: [ // spacers in between the items
 *       new Surface({properties: {backgroundColor: 'gray'}}),
 *       new Surface({properties: {backgroundColor: 'gray'}})
 *     ],
 *     selectedItemOverlay: {
 *       new Surface({ properties: {borderBottom: '4px solid blue'}})
 *     }
 *   }
 * });
 * ```
 * @module
 */
define('famous-flex/layouts/TabBarLayout',['require','exports','module','famous/utilities/Utility','../LayoutUtility'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');
    var LayoutUtility = require('../LayoutUtility');

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.X, Utility.Direction.Y],
        trueSize: true
    };

    // global data
    var size;
    var direction;
    var revDirection;
    var items;
    var spacers;
    var margins;
    var spacing;
    var sizeLeft;
    var set = {
        size: [0, 0],
        translate: [0, 0, 0],
        align: [0, 0],
        origin: [0, 0]
    };
    var nodeSize;
    var offset;
    var zIncrement;

    // Layout function
    function TabBarLayout(context, options) {

        // Prepare data
        size = context.size;
        direction = context.direction;
        revDirection = direction ? 0 : 1;
        spacing = options.spacing || 0;
        items = context.get('items');
        spacers = context.get('spacers');
        margins = LayoutUtility.normalizeMargins(options.margins);
        zIncrement = options.zIncrement || 0.001;
        set.size[0] = context.size[0];
        set.size[1] = context.size[1];
        set.size[revDirection] -= (margins[1 - revDirection] + margins[3 - revDirection]);
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = zIncrement;
        set.translate[revDirection] = margins[direction ? 3 : 0];
        set.align[0] = 0;
        set.align[1] = 0;
        set.origin[0] = 0;
        set.origin[1] = 0;

        // When no item-size specified, spread all items
        // out equally over the full width/height, taking into
        // account margins & spacing
        offset = direction ? margins[0] : margins[3];
        sizeLeft = size[direction] - (offset + (direction ? margins[2] : margins[1]));
        sizeLeft -= ((items.length - 1) * spacing);
        for (var i = 0; i < items.length; i++) {

            // Calculate item size
            if (options.itemSize === undefined) {
                nodeSize = Math.round(sizeLeft / (items.length - i));
            }
            else {
                nodeSize = (options.itemSize === true) ? context.resolveSize(items[i], size)[direction] : options.itemSize;
            }

            // Calculate length used
            set.scrollLength = nodeSize;
            if (i === 0) {
                set.scrollLength += direction ? margins[0] : margins[3];
            }
            if (i === (items.length - 1)) {
                set.scrollLength += direction ? margins[2] : margins[1];
            }
            else {
                set.scrollLength += spacing;
            }

            // Position item
            set.size[direction] = nodeSize;
            set.translate[direction] = offset;
            context.set(items[i], set);
            offset += nodeSize;
            sizeLeft -= nodeSize;

            // Place selected item overlay
            if (i === options.selectedItemIndex) {
                set.scrollLength = 0;
                set.translate[direction] += (nodeSize / 2);
                set.translate[2] = zIncrement * 2;
                set.origin[direction] = 0.5;
                context.set('selectedItemOverlay', set);
                set.origin[direction] = 0;
                set.translate[2] = zIncrement;
            }

            // Position spacer (optional)
            if (i < (items.length - 1)) {
                if (spacers && (i < spacers.length)) {
                    set.size[direction] = spacing;
                    set.translate[direction] = offset;
                    context.set(spacers[i], set);
                }
                offset += spacing;
            }
            else {
                offset += direction ? margins[2] : margins[1];
            }
        }

        // Set background
        set.scrollLength = 0;
        set.size[0] = size[0];
        set.size[1] = size[1];
        set.size[direction] = size[direction];
        set.translate[0] = 0;
        set.translate[1] = 0;
        set.translate[2] = 0;
        set.translate[direction] = 0;
        context.set('background', set);
    }

    TabBarLayout.Capabilities = capabilities;
    TabBarLayout.Name = 'TabBarLayout';
    TabBarLayout.Description = 'TabBar widget layout';
    module.exports = TabBarLayout;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * TabBar widget for famo.us.
 *
 * ```javascript
 * var TabBar = require('famous-flex/widgets/TabBar');
 *
 * var tabBar = new TabBar({
 *   classes: ['black'],
 *   createRenderables: {
 *     background: true,
 *     selectedItemOverlay: true,
 *     spacers: true
 *   }
 * });
 * tabBar.setItems([
 *   'one',
 *   'two',
 *   'three'
 * ]);
 * this.add(tabBar); // add to the render-tree
 *
 * tabBar.on('tabchange', function(event) {
 *   console.log('new tab selected: ' + event.index);
 * });
 * ```
 *
 * The surfaces that are created, use the the css-classes `ff-widget` and `ff-tabbar`.
 * You can add additional css-classes by using the `classes` option in the constructor.
 *
 * Example css styles for a black theme:
 *
 * ```css
 * .ff-tabbar.background.black {
 *   background-color: #101010;
 * }
 * .ff-tabbar.item.black {
 *   color: #f7f3f7;
 * }
 * .ff-tabbar.selectedItemOverlay.black {
 *   border-bottom: 6px solid #30b6e7;
 * }
 * .ff-tabbar.spacer.black:after {
 *   content: "";
 *   background-color: #333333;
 *   width: 100%;
 *   top: 10px;
 *   bottom: 10px;
 *   position: absolute;
 * }
 * ```
 *
 * @module
 */
define('famous-flex/widgets/TabBar',['require','exports','module','famous/core/Surface','famous/core/View','../LayoutController','../layouts/TabBarLayout'],function(require, exports, module) {

    // import dependencies
    var Surface = require('famous/core/Surface');
    var View = require('famous/core/View');
    var LayoutController = require('../LayoutController');
    var TabBarLayout = require('../layouts/TabBarLayout');

    /**
     * @class
     * @extends View
     * @param {Object} options Configurable options.
     * @param {Object} [options.tabBarLayout] Layout-options that are passed to the TabBarLayout.
     * @param {Object} [options.layoutController] Options that are passed to the underlying layout-controller.
     * @param {Array.String} [options.classes] Css-classes that are added to the surfaces that are created.
     * @param {Object} [options.createRenderables] Options that specify which renderables should be created.
     * @alias module:TabBar
     */
    function TabBar(options) {
        View.apply(this, arguments);

        // init
        this._selectedItemIndex = -1;
        options = options || {};
        this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;

        // create TabBar layout
        this.layout = new LayoutController(this.options.layoutController);
        this.add(this.layout);
        this.layout.pipe(this._eventOutput);

        // create initial renderables
        this._renderables = {
            items: [],
            spacers: [],
            background: _createRenderable.call(this, 'background'),
            selectedItemOverlay: _createRenderable.call(this, 'selectedItemOverlay')
        };

        this.setOptions(this.options);
    }
    TabBar.prototype = Object.create(View.prototype);
    TabBar.prototype.constructor = TabBar;
    TabBar.prototype.classes = ['ff-widget', 'ff-tabbar'];

    TabBar.DEFAULT_OPTIONS = {
        tabBarLayout: {
            margins: [0, 0, 0, 0],
            spacing: 0
        },
        createRenderables: {
            item: true,
            background: false,
            selectedItemOverlay: false,
            spacer: false
        },
        layoutController: {
            autoPipeEvents: true,
            layout: TabBarLayout,
            flow: true,
            flowOptions: {
                reflowOnResize: false,
                spring: {
                    dampingRatio: 0.8,
                    period: 300
                }
            }
        }
    };

    /**
     * Helper function that is called whenever a new item is selected
     */
    function _setSelectedItem(index) {
        if (index !== this._selectedItemIndex) {
            var oldIndex = this._selectedItemIndex;
            this._selectedItemIndex = index;
            this.layout.setLayoutOptions({
                selectedItemIndex: index
            });
            if ((oldIndex >= 0) && this._renderables.items[oldIndex].removeClass){
                this._renderables.items[oldIndex].removeClass('selected');
            }
            if (this._renderables.items[index].addClass) {
                this._renderables.items[index].addClass('selected');
            }
            if (oldIndex >= 0) {
                this._eventOutput.emit('tabchange', {
                    target: this,
                    index: index,
                    oldIndex: oldIndex,
                    item: this._renderables.items[index],
                    oldItem: ((oldIndex >= 0) && (oldIndex < this._renderables.items.length)) ? this._renderables.items[oldIndex] : undefined
                });
            }
        }
    }

    /**
     * Creates a new renderable for the given renderable-id.
     *
     */
    function _createRenderable (id, data) {
        var option = this.options.createRenderables[id];
        if (option instanceof Function) {
            return option.call(this, id, data);
        }
        else if (!option) {
            return undefined;
        }
        if ((data !== undefined) && (data instanceof Object)) {
            return data;
        }
        var surface = new Surface({
            classes: this.classes,
            content: data ? ('<div>' + data + '</div>') : undefined
        });
        surface.addClass(id);
        if (id === 'item') {
            if (this.options.tabBarLayout && this.options.tabBarLayout.itemSize && (this.options.tabBarLayout.itemSize === true)) {
                surface.setSize(this.layout.getDirection() ? [undefined, true] : [true, undefined]);
            }
        }
        return surface;
    }

    /**
     * Patches the TabBar instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options.
     * @param {Object} [options.tabBarLayout] Layout-options that are passed to the TabBarLayout.
     * @param {Object} [options.layoutController] Options that are passed to the underlying layout-controller.
     * @return {TabBar} this
     */
    TabBar.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (!this.layout) {
            return this;
        }
        if (options.tabBarLayout !== undefined) {
            this.layout.setLayoutOptions(options.tabBarLayout);
        }
        if (options.layoutController) {
            this.layout.setOptions(options.layoutController);
        }
        return this;
    };

    /**
     * Sets the items for the tab-bar.
     *
     * Example 1:
     *
     * ```javascript
     * var tabBar = new TabBar();
     * tabBar.setItems([
     *   'one',
     *   'two',
     *   'three'
     * ]);
     *```
     *
     * Example using Ionic icons:
     *
     * ```javascript
     * var tabBar = new TabBar();
     * tabBar.setItems([
     *   '<div class="icon ion-flag"></div>Flag',
     *   '<div class="icon ion-map"></div>Map',
     *   '<div class="icon ion-gear-a"></div>Settings'
     * ]);
     *```
     *
     * CSS:
     *
     * ```css
     * .ff-tabbar.item {
     *   font-size: 12px;
     * }
     * .ff-tabbar.item .icon {
     *   font-size: 24px;
     * }
     * ```
     *
     * @param {Array} items Array of tab-item renderables.
     * @return {TabBar} this
     */
    TabBar.prototype.setItems = function(items) {
        var currentIndex = this._selectedItemIndex;
        this._selectedItemIndex = -1;
        this._renderables.items = [];
        this._renderables.spacers = [];
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var item = _createRenderable.call(this, 'item', items[i]);
                if (item.on) {
                    item.on('click', _setSelectedItem.bind(this, i));
                }
                this._renderables.items.push(item);
                if ((i < (items.length - 1))) {
                    var spacer = _createRenderable.call(this, 'spacer', ' ');
                    if (spacer) {
                        this._renderables.spacers.push(spacer);
                    }
                }
            }
        }
        this.layout.setDataSource(this._renderables);
        if (this._renderables.items.length) {
            _setSelectedItem.call(this, Math.max(Math.min(currentIndex, this._renderables.items.length - 1), 0));
        }
        return this;
    };

    /**
     * Get the tab-item renderables for the tab-bar.
     *
     * @return {Array} tab-item renderables
     */
    TabBar.prototype.getItems = function() {
        return this._renderables.items;
    };

    /**
     * Get the spec (size, transform, etc..) of the given tab-item.
     *
     * @param {Number} index Index of the tab-item.
     * @return {Spec} item spec
     */
    TabBar.prototype.getItemSpec = function(index, normalize) {
        return this.layout.getSpec(this._renderables.items[index], normalize);
    };

    /**
     * Sets the index of the selected tab.
     *
     * @param {Number} index selected index.
     * @return {TabBar} this
     */
    TabBar.prototype.setSelectedItemIndex = function(index) {
        _setSelectedItem.call(this, index);
        return this;
    };

    /**
     * Get the index of the selected tab-item.
     *
     * @return {Number} selected index
     */
    TabBar.prototype.getSelectedItemIndex = function() {
        return this._selectedItemIndex;
    };

    /**
     * Get the size of the widget.
     *
     * @return {Array} size.
     */
    TabBar.prototype.getSize = function() {
        return this.options.size || (this.layout ? this.layout.getSize() : View.prototype.getSize.call(this));
    };

    module.exports = TabBar;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * TabBarController.
 *
 * @module
 */
define('famous-flex/widgets/TabBarController',['require','exports','module','famous/core/View','../AnimationController','./TabBar','../helpers/LayoutDockHelper','../LayoutController','famous/transitions/Easing'],function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var AnimationController = require('../AnimationController');
    var TabBar = require('./TabBar');
    var LayoutDockHelper = require('../helpers/LayoutDockHelper');
    var LayoutController = require('../LayoutController');
    var Easing = require('famous/transitions/Easing');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {TabBarController.Position} [options.tabBarPosition] Position (default: BOTTOM).
     * @param {Number} [options.tabBarSize] Size of the tabBar (default: 50).
     * @param {Number} [options.tabBarZIndex] Z-index the tabBar is put above the content (AnimationController) (default: 10).
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.animationController] Options that are passed to the AnimationController.
     * @alias module:TabBarController
     */
    function TabBarController(options) {
        View.apply(this, arguments);

        _createRenderables.call(this);
        _createLayout.call(this);
        _setListeners.call(this);

        this.tabBar.setOptions({
            layoutController: {
                direction: ((this.options.tabBarPosition === TabBarController.Position.TOP) || (this.options.tabBarPosition === TabBarController.Position.BOTTOM)) ? 0 : 1
            }
        });
    }
    TabBarController.prototype = Object.create(View.prototype);
    TabBarController.prototype.constructor = TabBarController;

    TabBarController.Position = {
        TOP: 0,
        BOTTOM: 1,
        LEFT: 2,
        RIGHT: 3
    };

    /**
     * Default layout-function for the TabBarController. Supports simple
     * docking to any of the four edges.
     */
    TabBarController.DEFAULT_LAYOUT = function(context, options) {
        var dock = new LayoutDockHelper(context, options);
        switch (this.options.tabBarPosition) {
            case TabBarController.Position.TOP:
                dock.top('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
            case TabBarController.Position.BOTTOM:
                dock.bottom('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
            case TabBarController.Position.LEFT:
                dock.left('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
            case TabBarController.Position.RIGHT:
                dock.right('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
        }
        dock.fill('content');
    };

    TabBarController.DEFAULT_OPTIONS = {
        tabBarPosition: TabBarController.Position.BOTTOM,
        tabBarSize: 50,
        tabBarZIndex: 10,
        tabBar: {
            createRenderables: {
                background: true
            }
        },
        animationController: {
            transition: {duration: 300, curve: Easing.inOutQuad},
            animation: AnimationController.Animation.FadedZoom
        }
    };

    /**
     * Creates the renderables (tabBar, animationController).
     */
    function _createRenderables() {
        this.tabBar = new TabBar(this.options.tabBar);
        this.animationController = new AnimationController(this.options.animationController);
        this._renderables = {
            tabBar: this.tabBar,
            content: this.animationController
        };
    }

    /**
     * Creates the outer (header-footer) layout.
     */
    function _createLayout() {
        this.layout = new LayoutController(this.options.layoutController);
        this.layout.setLayout(TabBarController.DEFAULT_LAYOUT.bind(this));
        this.layout.setDataSource(this._renderables);
        this.add(this.layout);
    }

    /**
     * Sets the listeners.
     */
    function _setListeners() {
        this.tabBar.on('tabchange', function(event) {
            _updateView.call(this, event);
            this._eventOutput.emit('tabchange', {
                target: this,
                index: event.index,
                oldIndex: event.oldIndex,
                item: this._items[event.index],
                oldItem: ((event.oldIndex >= 0) && (event.oldIndex < this._items.length)) ? this._items[event.oldIndex] : undefined
            });
        }.bind(this));
    }

    /**
     * Updates the view-container with the selected view.
     */
    function _updateView(event) {
        var index = this.tabBar.getSelectedItemIndex();
        this.animationController.halt();
        if (index >= 0) {
            this.animationController.show(this._items[index].view);
        }
        else {
            this.animationController.hide();
        }
    }

    /**
     * Patches the TabBarController instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options.
     * @param {TabBarController.Position} [options.tabBarPosition] Position (default: BOTTOM).
     * @param {Number} [options.tabBarSize] Size of the tabBar (default: 50).
     * @param {Number} [options.tabBarZIndex] Z-index the tabBar is put above the content (AnimationController) (default: 10).
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.animationController] Options that are passed to the AnimationController.
     * @return {TabBarController} this
     */
    TabBarController.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (this.layout && options.layoutController) {
            this.layout.setOptions(options.layoutController);
        }
        if (this.tabBar && options.tabBar) {
            this.tabBar.setOptions(options.tabBar);
        }
        if (this.animationController && options.animationController) {
            this.animationController(options.animationController);
        }
        if (this.layout && (options.tabBarPosition !== undefined)) {
            this.tabBar.setOptions({
                layoutController: {
                    direction: ((options.tabBarPosition === TabBarController.Position.TOP) || (options.tabBarPosition === TabBarController.Position.BOTTOM)) ? 0 : 1
                }
            });
        }
        if (this.layout) {
            this.layout.reflowLayout();
        }
        return this;
    };

    /**
     * Sets the items for the tab-bar controller.
     *
     * Example 1:
     *
     * ```javascript
     * var tabBarController = new TabBarController();
     * tabBarController.setItems([
     *   {tabItem: 'Profile', view: new ProfileView()},
     *   {tabItem: 'Map', view: new MapView()},
     *   {tabItem: 'Login', view: new LoginView()}
     *   {tabItem: 'Settings', view: new SettingsView()}
     * ]);
     *```
     *
     * @param {Array} items Array of tab-bar controller items.
     * @return {TabBarController} this
     */
    TabBarController.prototype.setItems = function(items) {
        this._items = items;
        var tabItems = [];
        for (var i = 0; i < items.length; i++) {
            tabItems.push(items[i].tabItem);
        }
        this.tabBar.setItems(tabItems);
        _updateView.call(this);
        return this;
    };

    /**
     * Get the tab-items (also see `setItems`).
     *
     * @return {Array} tab-items
     */
    TabBarController.prototype.getItems = function() {
        return this._items;
    };

    /**
     * Sets the index of the selected tab.
     *
     * @param {Number} index selected index.
     * @return {TabBar} this
     */
    TabBarController.prototype.setSelectedItemIndex = function(index) {
        this.tabBar.setSelectedItemIndex(index);
        return this;
    };

    /**
     * Get the index of the selected tab-item.
     *
     * @return {Number} selected index
     */
    TabBarController.prototype.getSelectedItemIndex = function() {
        return this.tabBar.getSelectedItemIndex();
    };

    module.exports = TabBarController;
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global console*/
/*eslint no-console: 0*/

/**
 * Lays a collection of renderables from left to right or top to bottom, and when the right/bottom edge is reached,
 * continues at the next column/row.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[itemSize]`|Size/Function|Size of an item to layout or callback function which should return the size, e.g.: `function(renderNode, contextSize)`|
 * |`[cells]`|Array.Number|Number of columns and rows: [columns, rows]. When used causes the itemSize to be calculated from the number of number of cells that should be displayed.|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[spacing]`|Number/Array|Spacing between items (e.g. 5, [10, 10])|
 * |`[justify]`|Bool/Array.Bool|Justify the renderables accross the width/height|
 * |`[suppressWarnings]`|Bool|Suppresses any warnings generated by faulty configuration options|
 *
 * Example:
 *
 * ```javascript
 * var CollectionLayout = require('famous-flex/layouts/CollectionLayout');
 *
 * // Create scrollable layout where items have a fixed width/height
 * var scrollView = new FlexScrollView({
 *   layout: CollectionLayout,
 *   layoutOptions: {
 *     itemSize: [100, 100],    // item has width and height of 100 pixels
 *     margins: [10, 5, 10, 5], // outer margins
 *     spacing: [10, 10]        // spacing between items
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * });
 *
 * // Create grid layout with a fixed number of columns and rows.
 * var gridLayout = new LayoutController({
 *   layout: CollectionLayout,
 *   layoutOptions: {
 *     cells: [3, 5],           // 3 columns and 5 rows
 *     margins: [10, 5, 10, 5], // outer margins
 *     spacing: [10, 10]        // spacing between items
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * });
 * ```
 *
 * Notes:
 *
 * * Recall that the **`direction`** option is given to `FlexScrollView` and not
 * the `ColllectionLayout`.  As such, it affects *scroll direction* and not
 * *layout direction*.  With direction `Y`, items are *laid out horizontally*,
 * but multiple rows *scroll vertically*, and this is the correct behaviour.
 * @module
 */
define('famous-flex/layouts/CollectionLayout',['require','exports','module','famous/utilities/Utility','../LayoutUtility'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');
    var LayoutUtility = require('../LayoutUtility');

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.Y, Utility.Direction.X],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: true
    };

    // Prepare
    var context;
    var size;
    var direction;
    var alignment;
    var lineDirection;
    var lineLength;
    var offset;
    var margins;
    var margin = [0, 0];
    var spacing;
    var justify;
    var itemSize;
    var getItemSize;
    var lineNodes;

    /**
     * Lays out the renderables in a single line. Taking into account
     * the following variables:
     * - true-size
     * - margins
     * - spacing
     * - justify
     * - center align
     */
    function _layoutLine(next, endReached) {
        if (!lineNodes.length) {
            return 0;
        }

        // Determine size of the line
        var i;
        var lineSize = [0, 0];
        var lineNode;
        for (i = 0; i < lineNodes.length; i++) {
            lineSize[direction] = Math.max(lineSize[direction], lineNodes[i].size[direction]);
            lineSize[lineDirection] += ((i > 0) ? spacing[lineDirection] : 0) + lineNodes[i].size[lineDirection];
        }

        // Layout nodes from left to right or top to bottom
        var justifyOffset = justify[lineDirection] ? ((lineLength - lineSize[lineDirection]) / (lineNodes.length * 2)) : 0;
        var lineOffset = (direction ? margins[3] : margins[0]) + justifyOffset;
        var scrollLength;
        for (i = 0; i < lineNodes.length; i++) {
            lineNode = lineNodes[i];
            var translate = [0, 0, 0];
            translate[lineDirection] = lineOffset;
            translate[direction] = next ? offset : (offset - (lineSize[direction]));
            scrollLength = 0;
            if (i === 0) {
                scrollLength = lineSize[direction];
                if (endReached && ((next && !alignment) || (!next && alignment))) {
                    scrollLength += direction ? (margins[0] + margins[2]) : (margins[3] + margins[1]);
                }
                else {
                    scrollLength += spacing[direction];
                }
            }
            lineNode.set = {
                size: lineNode.size,
                translate: translate,
                scrollLength: scrollLength
            };
            lineOffset += lineNode.size[lineDirection] + spacing[lineDirection] + (justifyOffset * 2);
        }

        // Set nodes
        for (i = 0; i < lineNodes.length; i++) {
            lineNode = next ? lineNodes[i] : lineNodes[(lineNodes.length - 1) - i];
            context.set(lineNode.node, lineNode.set);
        }

        // Prepare for next line
        lineNodes = [];
        return lineSize[direction] + spacing[direction];
    }

    /**
     * Helper function to resolving the size of a node.
     */
    function _resolveNodeSize(node) {
        var localItemSize = itemSize;
        if (getItemSize) {
            localItemSize = getItemSize(node.renderNode, size);
        }
        if ((localItemSize[0] === true) || (localItemSize[1] === true)) {
            var result = context.resolveSize(node, size);
            if (localItemSize[0] !== true) {
                result[0] = itemSize[0];
            }
            if (localItemSize[1] !== true) {
                result[1] = itemSize[1];
            }
            return result;
        }
        else {
            return localItemSize;
        }
    }

    /**
     * Collection-layout
     */
    function CollectionLayout(context_, options) {

        // Prepare
        context = context_;
        size = context.size;
        direction = context.direction;
        alignment = context.alignment;
        lineDirection = (direction + 1) % 2;
        if ((options.gutter !== undefined) && console.warn && !options.suppressWarnings) {
            console.warn('option `gutter` has been deprecated for CollectionLayout, use margins & spacing instead');
        }
        if (options.gutter && !options.margins && !options.spacing) {
            var gutter = Array.isArray(options.gutter) ? options.gutter : [options.gutter, options.gutter];
            margins = [gutter[1], gutter[0], gutter[1], gutter[0]];
            spacing = gutter;
        }
        else {
            margins = LayoutUtility.normalizeMargins(options.margins);
            spacing = options.spacing || 0;
            spacing = Array.isArray(spacing) ? spacing : [spacing, spacing];
        }
        margin[0] = margins[direction ? 0 : 3];
        margin[1] = -margins[direction ? 2 : 1];
        justify = Array.isArray(options.justify) ? options.justify : (options.justify ? [true, true] : [false, false]);
        lineLength = size[lineDirection] - (direction ? (margins[3] + margins[1]) : (margins[0] + margins[2]));
        var node;
        var nodeSize;
        var lineOffset;
        var bound;

        //
        // Prepare item-size
        //
        if (options.cells) {
            if (options.itemSize && console.warn && !options.suppressWarnings) {
                console.warn('options `cells` and `itemSize` cannot both be specified for CollectionLayout, only use one of the two');
            }
            itemSize = [
                (size[0] - (margins[1] + margins[3] + (spacing[0] * (options.cells[0] - 1)))) / options.cells[0],
                (size[1] - (margins[0] + margins[2] + (spacing[1] * (options.cells[1] - 1)))) / options.cells[1]
            ];
        }
        else if (!options.itemSize) {
            itemSize = [true, true]; // when no item-size specified, use size from renderables
        }
        else if (options.itemSize instanceof Function) {
            getItemSize = options.itemSize;
        }
        else if ((options.itemSize[0] === undefined) || (options.itemSize[0] === undefined)){
            // resolve 'undefined' into a fixed size
            itemSize = [
                (options.itemSize[0] === undefined) ? size[0] : options.itemSize[0],
                (options.itemSize[1] === undefined) ? size[1] : options.itemSize[1]
            ];
        }
        else {
            itemSize = options.itemSize;
        }

        //
        // Process all next nodes
        //
        offset = context.scrollOffset + (alignment ? 0 : margin[alignment]);
        bound = context.scrollEnd + (alignment ? 0 : margin[alignment]);
        lineOffset = 0;
        lineNodes = [];
        while (offset < bound) {
            node = context.next();
            if (!node) {
                _layoutLine(true, true);
                break;
            }
            nodeSize = _resolveNodeSize(node);
            lineOffset += (lineNodes.length ? spacing[lineDirection] : 0) + nodeSize[lineDirection];
            if (lineOffset > lineLength) {
                offset += _layoutLine(true, !node);
                lineOffset = nodeSize[lineDirection];
            }
            lineNodes.push({node: node, size: nodeSize});
        }

        //
        // Process previous nodes
        //
        offset = context.scrollOffset + (alignment ? margin[alignment] : 0);
        bound = context.scrollStart + (alignment ? margin[alignment] : 0);
        lineOffset = 0;
        lineNodes = [];
        while (offset > bound) {
            node = context.prev();
            if (!node) {
                _layoutLine(false, true);
                break;
            }
            nodeSize = _resolveNodeSize(node);
            lineOffset += (lineNodes.length ? spacing[lineDirection] : 0) + nodeSize[lineDirection];
            if (lineOffset > lineLength) {
                offset -= _layoutLine(false, !node);
                lineOffset = nodeSize[lineDirection];
            }
            lineNodes.unshift({node: node, size: nodeSize});
        }
    }

    CollectionLayout.Capabilities = capabilities;
    CollectionLayout.Name = 'CollectionLayout';
    CollectionLayout.Description = 'Multi-cell collection-layout with margins & spacing';
    module.exports = CollectionLayout;
});

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
 * Lays a collection of renderables from left to right, and when the right edge is reached,
 * continues at the left of the next line.
 *
 * |options|type|description|
 * |---|---|---|
 * |`itemSize`|Size|Size of an item to layout|
 * |`[gutter]`|Size|Gutter-space between renderables|
 *
 * Example:
 *
 * ```javascript
 * var CoverLayout = require('famous-flex/layouts/CoverLayout');
 *
 * new LayoutController({
 *   layout: CoverLayout,
 *   layoutOptions: {
 *     itemSize: [100, 100],  // item has width and height of 100 pixels
 *     gutter: [5, 5],        // gutter of 5 pixels in between cells
 *     justify: true          // justify the items neatly across the whole width and height
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * })
 * ```
 * @module
 */
define('famous-flex/layouts/CoverLayout',['require','exports','module','famous/utilities/Utility'],function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');

    // Define capabilities of this layout function
    var capabilities = {
        sequence: true,
        direction: [Utility.Direction.X, Utility.Direction.Y],
        scrolling: true,
        sequentialScrollingOptimized: false
    };

    function CoverLayout(context, options) {

        // Get first renderable
        var node = context.next();
        if (!node) {
            return;
        }

        // Prepare
        var size = context.size;
        var direction = context.direction;
        var itemSize = options.itemSize;
        var opacityStep = 0.2;
        var scaleStep = 0.1;
        var translateStep = 30;
        var zStart = 100;

        // Layout the first renderable in the center
        context.set(node, {
            size: itemSize,
            origin: [0.5, 0.5],
            align: [0.5, 0.5],
            translate: [0, 0, zStart],
            scrollLength: itemSize[direction]
        });

        // Layout renderables
        var translate = itemSize[0] / 2;
        var opacity = 1 - opacityStep;
        var zIndex = zStart - 1;
        var scale = 1 - scaleStep;
        var prev = false;
        var endReached = false;
        node = context.next();
        if (!node) {
            node = context.prev();
            prev = true;
        }
        while (node) {

            // Layout next node
            context.set(node, {
                size: itemSize,
                origin: [0.5, 0.5],
                align: [0.5, 0.5],
                translate: direction ? [0, prev ? -translate : translate, zIndex] : [prev ? -translate : translate, 0, zIndex],
                scale: [scale, scale, 1],
                opacity: opacity,
                scrollLength: itemSize[direction]
            });
            opacity -= opacityStep;
            scale -= scaleStep;
            translate += translateStep;
            zIndex--;

            // Check if the end is reached
            if (translate >= (size[direction]/2)) {
                endReached = true;
            }
            else {
                node = prev ? context.prev() : context.next();
                endReached = !node;
            }

            // When end is reached for next, start processing prev
            if (endReached) {
                if (prev) {
                    break;
                }
                endReached = false;
                prev = true;
                node = context.prev();
                if (node) {
                    translate = (itemSize[direction] / 2);
                    opacity = 1 - opacityStep;
                    zIndex = zStart - 1;
                    scale = 1 - scaleStep;
                }
            }
        }
    }

    CoverLayout.Capabilities = capabilities;
    module.exports = CoverLayout;
});

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
 * Lays-out renderables from left to right, in a grid with fixed number of
 * columns and rows.
 *
 * |options|type|description|
 * |---|---|---|
 * |`cells`|Size|Number of cells: [columns, rows]|
 * |`[direction]`|Number|Direction into which to layout: 0 = X, 1 = Y (default)|
 * |`[gutter]`|Size|Gutter-space between renderables|
 *
 * Example:
 *
 * ```javascript
 * var GridLayout = require('famous-flex/layouts/GridLayout');
 *
 * new LayoutController({
 *   layout: GridLayout,
 *   layoutOptions: {
 *     cells: [10, 5],    // 10 columns, 5 rows
 *     gutter: [20, 20],  // gutter of 20 pixels in between cells
 *   },
 *   dataSource: [
 *     new Surface({content: 'item 1'}),
 *     new Surface({content: 'item 2'}),
 *     new Surface({content: 'item 3'})
 *   ]
 * })
 * ```
 * @module
 */
define('famous-flex/layouts/CubeLayout',['require','exports','module'],function(require, exports, module) {

    // Layout function
    module.exports = function CubeLayout(context, options) {

        var itemSize = options.itemSize;

        // right
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [0, Math.PI/2, 0],
            translate: [itemSize[0] / 2, 0, 0]
        });

        // left
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [0, Math.PI/2, 0],
            translate: [-(itemSize[0] / 2), 0, 0]
        });

        // top
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [Math.PI/2, 0, 0],
            translate: [0, -(itemSize[1] / 2), 0]
        });

        // bottom
        context.set(context.next(), {
            size: itemSize,
            origin: [0.5, 0.5],
            rotate: [Math.PI/2, 0, 0],
            translate: [0, itemSize[1] / 2, 0]
        });

    };
});

/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global console*/
/*eslint no-console: 0*/

/**
 * DEPRECATED - this layout has been merged into CollectionLayout, use CollectionLayout instead.
 *
 * This module will be removed in the future, please switch to CollectionLayout.
 *
 * @module
 */
define('famous-flex/layouts/GridLayout',['require','exports','module','./CollectionLayout'],function(require, exports, module) {
    if (console.warn) {
        console.warn('GridLayout has been deprecated and will be removed in the future, use CollectionLayout instead');
    }
    module.exports = require('./CollectionLayout');
});

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
 * Three part layout consisting of a top-header, bottom-footer and middle part.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[headerSize]`|Number|Height of the header|
 * |`[footerSize]`|Number|Height of the footer|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 *
 * Example:
 *
 * ```javascript
 * var HeaderFooterLayout = require('famous-flex/layouts/HeaderFooterLayout');
 *
 * var layout = new LayoutController({
 *   layout: HeaderFooterLayout,
 *   layoutOptions: {
 *     headerSize: 60,    // header has height of 60 pixels
 *     footerSize: 20     // footer has height of 20 pixels
 *   },
 *   dataSource: {
 *	   header: new Surface({content: 'This is the header surface'}),
 *	   content: new Surface({content: 'This is the content surface'}),
 *	   footer: new Surface({content: 'This is the footer surface'})
 *   }
 * });
 * ```
 * @module
 */
define('famous-flex/layouts/HeaderFooterLayout',['require','exports','module','../helpers/LayoutDockHelper'],function(require, exports, module) {

    // import dependencies
    var LayoutDockHelper = require('../helpers/LayoutDockHelper');

    // Layout function
    module.exports = function HeaderFooterLayout(context, options) {
        var dock = new LayoutDockHelper(context, options);
        dock.top('header', (options.headerSize !== undefined) ? options.headerSize : options.headerHeight);
        dock.bottom('footer', (options.footerSize !== undefined) ? options.footerSize : options.footerHeight);
        dock.fill('content');
    };
});

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
 * Navigation-bar layout consisting of optionally left and right items and a
 * title in the middle.
 *
 * When no item-width is specified, the width of the renderable itsself is used.
 *
 * |options|type|description|
 * |---|---|---|
 * |`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
 * |`[itemWidth]`|Number|Width of the left & right items|
 * |`[leftItemWidth]`|Number|Width of the left items|
 * |`[rightItemWidth]`|Number|Width of the right items|
 * |`[itemSpacer]`|Number|Space in between items|
 *
 * Example:
 *
 * ```javascript
 * var NavBarLayout = require('famous-flex/layouts/NavBarLayout');
 *
 * var layout = new LayoutController({
 *   layout: NavBarLayout,
 *   layoutOptions: {
 *     margins: [5, 5, 5, 5], // margins to utilize
 *     itemSpacer: 10,        // space in between items
 *   },
 *   dataSource: {
 *     background: new Surface({properties: {backgroundColor: 'black'}}),
 *     title: new Surface({content: 'My title'}),
 *     leftItems:[
 *       new Surface({
 *         content: 'left1',
 *         size: [100, undefined] // use fixed width
 *       })
 *     ],
 *     rightItems: [
 *       new Surface({
 *         content: 'right1',
 *         size: [true, undefined] // use actual width of DOM-node
 *       }),
 *       new Surface({
 *         content: 'right2'
 *         size: [true, undefined] // use actual width of DOM-node
 *       })
 *     ]
 *   }
 * });
 * ```
 * @module
 */
define('famous-flex/layouts/NavBarLayout',['require','exports','module','../helpers/LayoutDockHelper'],function(require, exports, module) {

    // import dependencies
    var LayoutDockHelper = require('../helpers/LayoutDockHelper');

    // Layout function
    module.exports = function NavBarLayout(context, options) {
        var dock = new LayoutDockHelper(context, {
            margins: options.margins,
            translateZ: 1
        });

        // Position background
        context.set('background', {size: context.size});

        // Position right items
        var node;
        var i;
        var rightItems = context.get('rightItems');
        if (rightItems) {
            for (i = 0; i < rightItems.length; i++) {
                // dock node
                node = context.get(rightItems[i]);
                dock.right(node, options.rightItemWidth || options.itemWidth);
                // spacer
                dock.right(undefined, options.rightItemSpacer || options.itemSpacer);
            }
        }

        // Position left item
        var leftItems = context.get('leftItems');
        if (leftItems) {
            for (i = 0; i < leftItems.length; i++) {
                // dock node
                node = context.get(leftItems[i]);
                dock.left(node, options.leftItemWidth || options.itemWidth);
                // spacer
                dock.left(undefined, options.leftItemSpacer || options.itemSpacer);
            }
        }

        // Position title
        dock.fill('title');
    };
});

define('template.js',['require','famous-flex/FlexScrollView','famous-flex/FlowLayoutNode','famous-flex/LayoutContext','famous-flex/LayoutController','famous-flex/LayoutNode','famous-flex/LayoutNodeManager','famous-flex/LayoutUtility','famous-flex/ScrollController','famous-flex/VirtualViewSequence','famous-flex/AnimationController','famous-flex/widgets/DatePicker','famous-flex/widgets/TabBar','famous-flex/widgets/TabBarController','famous-flex/layouts/CollectionLayout','famous-flex/layouts/CoverLayout','famous-flex/layouts/CubeLayout','famous-flex/layouts/GridLayout','famous-flex/layouts/HeaderFooterLayout','famous-flex/layouts/ListLayout','famous-flex/layouts/NavBarLayout','famous-flex/layouts/ProportionalLayout','famous-flex/layouts/WheelLayout','famous-flex/helpers/LayoutDockHelper'],function(require) {
    require('famous-flex/FlexScrollView');
    require('famous-flex/FlowLayoutNode');
    require('famous-flex/LayoutContext');
    require('famous-flex/LayoutController');
    require('famous-flex/LayoutNode');
    require('famous-flex/LayoutNodeManager');
    require('famous-flex/LayoutUtility');
    require('famous-flex/ScrollController');
    require('famous-flex/VirtualViewSequence');
    require('famous-flex/AnimationController');

    require('famous-flex/widgets/DatePicker');
    require('famous-flex/widgets/TabBar');
    require('famous-flex/widgets/TabBarController');

    require('famous-flex/layouts/CollectionLayout');
    require('famous-flex/layouts/CoverLayout');
    require('famous-flex/layouts/CubeLayout');
    require('famous-flex/layouts/GridLayout');
    require('famous-flex/layouts/HeaderFooterLayout');
    require('famous-flex/layouts/ListLayout');
    require('famous-flex/layouts/NavBarLayout');
    require('famous-flex/layouts/ProportionalLayout');
    require('famous-flex/layouts/WheelLayout');

    require('famous-flex/helpers/LayoutDockHelper');
});


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
define(function(require, exports, module) {

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
     * @param {Utility.Direction} [options.direction] Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)
     * @param {Bool} [options.flow] Enables flow animations when the layout changes (default: `false`).
     * @param {Spec} [options.insertSpec] Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`).
     * @param {Spec} [options.removeSpec] Size, transform, opacity... to use when removing renderables from the scene (default: `{}`).
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
        } else if (options && options.flow) {
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
        nodeSpring: {
            dampingRatio: 0.8,
            period: 300
        },
        alwaysLayout: false    // set to true to always call the layout function
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
    };

    /**
     * Called whenever a layout-node is created/re-used. Initializes
     * the node with the `insertSpec` if it has been defined.
     */
    function _initFlowLayoutNode(node, spec) {
        if (!spec && this.options.insertSpec) {
            node.setSpec(this.options.insertSpec);
        }
    }

    /**
     * Patches the LayoutController instance's options with the passed-in ones.
     *
     * @param {Options} options An object of configurable options for the LayoutController instance.
     * @param {Function|Object} [options.layout] Layout function or layout-literal.
     * @param {Object} [options.layoutOptions] Options to pass in to the layout-function.
     * @param {Array|ViewSequence|Object} [options.dataSource] Array, ViewSequence or Object with key/value pairs.
     * @param {Utility.Direction} [options.direction] Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)
     * @param {Spec} [options.insertSpec] Size, transform, opacity... to use when inserting new renderables into the scene (default: `{}`).
     * @param {Spec} [options.removeSpec] Size, transform, opacity... to use when removing renderables from the scene (default: `{}`).
     * @param {Bool} [options.alwaysLayout] When set to true, always calls the layout function on every render-cycle (default: `false`).
     * @param {Bool} [options.autoPipeEvents] When set to true, automatically calls .pipe on all renderables when inserted (default: `false`).
     * @return {LayoutController} this
     */
    LayoutController.prototype.setOptions = function setOptions(options) {
        this._optionsManager.setOptions(options);
        if (options.dataSource) {
            this.setDataSource(options.dataSource);
        }
        if (options.layout || options.layoutOptions) {
            this.setLayout(options.layout, options.layoutOptions);
        }
        if (options.direction !== undefined) {
            this.setDirection(options.direction);
        }
        if (options.nodeSpring && this.options.flow) {
            this._nodes.setNodeOptions({
                spring: options.nodeSpring
            });
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
    	var i = 0;
        var dataSource = this._dataSource;
        if (dataSource instanceof Array) {
            for (i = 0, j = dataSource.length; i < j; i++) {
                callback(dataSource[i], i);
            }
        } else if (dataSource instanceof ViewSequence) {
            var renderable;
            while (dataSource) {
                renderable = dataSource.get();
                if (!renderable) {
                    break;
                }
                callback(renderable, i);
                dataSource = dataSource.getNext();
                i++;
            }
        }
        else {
            for (var key in dataSource) {
                callback(dataSource[key], key);
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
        this._nodesById = undefined;
        if (dataSource instanceof Array) {
            this._viewSequence = new ViewSequence(dataSource);
        } else if (dataSource instanceof ViewSequence) {
            this._viewSequence = dataSource;
        } else if (dataSource instanceof Object){
            this._nodesById = dataSource;
        }
        if (this.options.autoPipeEvents) {
            _forEachRenderable.call(this, function(renderable) {
                renderable.pipe(this);
            }.bind(this));
        }
        this._isDirty = true;
        return this;
    };

    /**
     * Helper function to call functions on enumerated renderables in the datasource.
     */
    function _recursiveFunction(funcName, funcArguments) {
        if (this[funcName]) {
            if (Array.isArray(funcArguments)) {
                this[funcName].apply(this, funcArguments);
            } else {
                this[funcName].call(this, funcArguments);
            }
        }

        if (Array.isArray(this)) {
            for (var i = 0; i < this.length; i++) {
                _recursiveFunction.call(this[i], funcName, funcArguments);
            }
        }
    }

    /**
     * Sets the options for each validated renderable in the data-source.
     * 
     * @param {Object} options The options to pass to the `setOptions` function for  each renderable.
     * @param {Function|String|Array.String} [filter=undefined] A key or function to filter renderables with.
     *            If ommited all renderables are valid;
     *            In the case of using one or more Strings, valid identifiers are the keys for the `options.dataSource` you provided in the constructor, or through `setDataSource`;
     *            If using a function, return `true` to accept a key or `false` to reject a key.
     * @return {LayoutController} this
     */
    LayoutController.prototype.setDataSourceOptions = function(options, filter) {
        if (!filter) { // no filter
            _forEachRenderable.call(this, function(renderable) {
                _recursiveFunction.call(renderable, 'setOptions', options);
            }.bind(this));
        } else if (filter.constructor && filter.call && filter.apply) { // filter function
            _forEachRenderable.call(this, function(renderable, key) {
                if (filter.call(renderable, key) === true) {
                    _recursiveFunction.call(renderable, 'setOptions', options);
                }
            }.bind(this));
        } else if (Array.isArray(filter)) { // multiple string identifiers
            _forEachRenderable.call(this, function(renderable, key) {
                if (filter.indexOf(key) > -1) {
                    _recursiveFunction.call(renderable, 'setOptions', options);
                }
            }.bind(this));
        } else { // single string identifier
            return this.setDataSourceOptions.call(this, options, [filter]);
        }
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
        } else if (layout instanceof Object) {
            this._layout.literal = layout;
            this._layout.capabilities = undefined; // todo - derive from literal somehow?
            var helperName = Object.keys(layout)[0];
            var Helper = LayoutUtility.getRegisteredHelper(helperName);
            this._layout._function = Helper ? function(context, options) {
                var helper = new Helper(context, options);
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
     * @return {Spec} spec or undefined
     */
    LayoutController.prototype.getSpec = function(node) {
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
        for (var i = 0; i < this._commitOutput.target.length; i++) {
            var spec = this._commitOutput.target[i];
            if (spec.renderNode === node) {
                return spec;
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
            this._nodesById[indexOrId] = renderable;
        }

        // Add the renderable using an index
        else {

            // Create data-source if neccesary
            if (this._dataSource === undefined) {
                this._dataSource = [];
                this._viewSequence = new ViewSequence(this._dataSource);
            }

            // Insert into array
            var dataSource = this._viewSequence || this._dataSource;
            if (indexOrId === -1) {
                dataSource.push(renderable);
            }
            else if (indexOrId === 0) {
                dataSource.splice(0, 0, renderable);
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
        if (this.options.autoPipeEvents) {
            renderable.pipe(this);
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
    function _getViewSequenceAtIndex(index) {
        var viewSequence = this._viewSequence;
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
                } else if (index < i) {
                    return undefined;
                }
            }
        } else if (index < i) {
            while (viewSequence) {
                viewSequence = viewSequence.getPrevious();
                if (!viewSequence) {
                    return undefined;
                }
                i = viewSequence.getIndex();
                if (i === index) {
                    return viewSequence;
                } else if (index > i) {
                    return undefined;
                }
            }
        }
        return viewSequence;
    }

    /**
     * Swaps two renderables at the given positions.
     *
     * @param {Number} index Index of the renderable to swap
     * @param {Number} index2 Index of the renderable to swap with
     * @return {LayoutController} this
     */
    LayoutController.prototype.swap = function(index, index2) {
        if (this._viewSequence) {
            _getViewSequenceAtIndex.call(this, index).swap(_getViewSequenceAtIndex.call(this, index2));
            this._isDirty = true;
        }
        return this;
    };

    /**
     * Removes a renderable from the data-source.
     *
     * The optional argument `removeSpec` is only used `flow` mode is enabled.
     * When specified, the renderable is removed using an animation ending at
     * the size, origin, opacity, transform, etc... as specified in `removeSpec'.
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @param {Spec} [removeSpec] Size, transform, etc.. to end with when removing
     * @return {LayoutController} this
     */
    LayoutController.prototype.remove = function(indexOrId, removeSpec) {

        // Remove the renderable in case of an id (String)
        var renderNode;
        if (this._nodesById || (indexOrId instanceof String) || (typeof indexOrId === 'string')) {

            // Find and remove renderable from data-source
            renderNode = this._nodesById[indexOrId];
            if (renderNode) {
                delete this._nodesById[indexOrId];
            }
        }

        // Remove the renderable using an index
        else {

            // Remove from array
            renderNode = this._dataSource.splice(indexOrId, 1)[0];
        }

        // When a custom remove-spec was specified, store that in the layout-node
        if (renderNode && removeSpec) {
            var node = this._nodes.getNodeByRenderNode(renderNode);
            if (node) {
                node.remove(removeSpec || this.options.removeSpec);
            }
        }

        // Force a reflow
        if (renderNode) {
            this._isDirty = true;
        }

        return this;
    };

    /**
     * Removes all renderables from the data-source.
     *
     * @return {LayoutController} this
     */
    LayoutController.prototype.removeAll = function() {
        if (this._nodesById) {
            var dirty = false;
            for (var key in this._nodesById) {
                delete this._nodesById[key];
                dirty = true;
            }
            if (dirty) {
                this._isDirty = true;
            }
        } else if (this._dataSource){
          this.setDataSource([]);
        }
        return this;
    };

    /**
     * Return size of contained element or `undefined` when size is not defined.
     *
     * @return {Array.Number} [width, height]
     */
    LayoutController.prototype.getSize = function() {
        return this.options.size;
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

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._isDirty = false;

            // Prepare for layout
            var layoutContext = this._nodes.prepareForLayout(
                this._viewSequence,     // first node to layout
                this._nodesById, {      // so we can do fast id lookups
                    size: size,
                    direction: this._direction
                }
            );

            // Layout objects
            if (this._layout._function) {
                this._layout._function(
                    layoutContext,          // context which the layout-function can use
                    this._layout.options    // additional layout-options
                );
            }

            // Update output and optionally emit event
            var result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
            this._commitOutput.target = result.specs;
            this._eventOutput.emit('reflow', {
                target: this
            });

            // Emit end event
            this._eventOutput.emit('layoutend', eventData);
        }
        else if (this.options.flow) {

            // Update output and optionally emit event
            result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
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
            target[i].target = target[i].renderNode.render();
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

    module.exports = LayoutController;
});

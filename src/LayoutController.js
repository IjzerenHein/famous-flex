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

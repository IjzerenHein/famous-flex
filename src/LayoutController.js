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
    var Entity = require('famous/core/Entity');
    var EventHandler = require('famous/core/EventHandler');
    var OptionsManager = require('famous/core/OptionsManager');
    var ViewSequence = require('famous/core/ViewSequence');
    var Easing = require('famous/transitions/Easing');
    var LayoutNode = require('./LayoutNode');
    var LayoutContext = require('./LayoutContext');
    var LayoutUtility = require('./LayoutUtility');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:LayoutController
     */
    function LayoutController(options) {

        // Options
        this.options = Object.create(LayoutController.DEFAULT_OPTIONS);
        this.optionsManager = new OptionsManager(this.options);
        if (options) {
            this.setOptions(options);
        }

        // Commit
        this.id = Entity.register(this);

        // Data-source
        this._dataSource = undefined;
        this._nodesById = undefined;
        this._viewSequence = undefined;
        this._firstLayoutNode = undefined; // linked list of layout-nodes

        // Layout-context
        this._layoutContext = new LayoutContext();
        this._layoutContext.nextNode = _getNextLayoutNode.bind(this);
        this._layoutContext.nodeById = _getLayoutNodeById.bind(this);
        this._layoutContext.nodeByArrayElement = _getCreateAndOrderLayoutNodes.bind(this);

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

        // Caching
        this._isDirty = true;
        this._contextSizeCache = [0, 0];
        this._commitOutput = {
            transform: undefined,
            opacity: undefined,
            size: undefined,
            target: undefined
        };

        // Event handling
        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);

        // Apply options
        if (this.options.dataSource) {
            this.setDataSource(this.options.dataSource);
        }
        if (this.options.layout || this.options.layoutOptions) {
            this.setLayout(this.options.layout, this.options.layoutOptions);
        }
    }

    LayoutController.DEFAULT_OPTIONS = {
        showOpacity: 1,
        insertSpec: {
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
        },
        verbose: true
    };

    /**
     * Patches the LayoutController instance's options with the passed-in ones.
     *
     * @method setOptions
     * @param {Options} options An object of configurable options for the LayoutController instance.
     */
    LayoutController.prototype.setOptions = function setOptions(options) {
        return this.optionsManager.setOptions(options);
    };

    /**
     * Sets the collection of renderables which are layed out according to
     * the layout-function.
     *
     * @method setDataSource
     * @param {Array|Object|ViewSequence} dataSource Either an array of renderables or a Famous viewSequence.
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
     * Inserts a renderable into the data-source.
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @param {Object} renderable Rendeable to add to the data-source
     * @param {Object} [insertSpec] Spec (size, transform, etc..) to start with when inserting
     * @return {LayoutController} this
     */
    LayoutController.prototype.insert = function(indexOrId, renderable, insertSpec) {

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
                return LayoutUtility.error('LayoutController.insert(index) only works when the dataSource is an array');
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
            var layoutNode = new LayoutNode(this._physicsEngines, renderable, insertSpec);
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
     * @return {LayoutController} this
     */
    LayoutController.prototype.remove = function(indexOrId, removeSpec) {

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
                return LayoutUtility.error('LayoutController.remove(index) only works when the dataSource is an array');
            }

            // Remove from array
            renderNode = this._dataSource.splice(indexOrId, 1)[0];
        }

        // When a custom remove-spec was specified, store that in the layout-node
        if (renderNode && removeSpec) {
            var layoutNode = this.getLayoutNode(renderNode);
            if (layoutNode) {
                layoutNode._reset();
                layoutNode._setFromSpec(removeSpec || this.options.removeSpec);
                layoutNode._invalidated = false;
            }
        }

        // Force a reflow
        if (renderNode) {
            this._isDirty = true;
        }

        return this;
    };

    /**
     * Set the new layout
     *
     * @param {Function} layout Layout function
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {LayoutController} this
     */
    LayoutController.prototype.setLayout = function(layout, options) {
        this._layout = layout;
        this._layoutOptions = options;
        this._isDirty = true;
        return this;
    };

    /**
     * Get the current layout-function
     *
     * @return {Function} Layout function
     */
    LayoutController.prototype.getLayout = function() {
        return this._layout;
    };

    /**
     * Set the options for the current layout. Use this function after
     * `setLayout` to update the options for the layout-function.
     *
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {LayoutController} this
     */
    LayoutController.prototype.setLayoutOptions = function(options) {
        this._layoutOptions = options;
        this._isDirty = true;
        return this;
    };

    /**
     * Patches the options for the current layout. Use this function to change
     * just one or a couple of layout-options, instead to having to set all
     * the options again.
     *
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {LayoutController} this
     */
    LayoutController.prototype.patchLayoutOptions = function(options) {
        for (var n in options) {
            if (this._layoutOptions === undefined) {
                this._layoutOptions = {};
            }
            this._layoutOptions[n] = options[n];
        }
        this._isDirty = true;
        return this;
    };

    /**
     * Get the current layout options.
     *
     * @return {Object} Layout options
     */
    LayoutController.prototype.getLayoutOptions = function() {
        return this._layoutOptions;
    };

    /**
     * Get the layout-node based on the renderable that was provided
     * in the data-source.
     *
     * @param {Object} renderable Renderable to look for
     * @return {LayoutNode} layout-node or undefined
     */
    LayoutController.prototype.getLayoutNode = function(renderable) {
        var layoutNode = this._firstLayoutNode;
        while (layoutNode) {
            if (layoutNode._renderNode === renderable) {
                return layoutNode;
            }
            layoutNode = layoutNode._next;
        }
        return undefined;
    };

    /**
     * Get the layout-node based on the id of the renderable that was provided
     * in the data-source. If the content at the given id was an array, then
     * that array is returned as is. You can use `getLayoutNode` on the elements
     * of the array to obtain their `LayoutNode`s.
     *
     * @param {String} nodeId Node-id to look for
     * @return {LayoutNode|Array} layout-node, undefined or an error of renderables.
     */
    LayoutController.prototype.getLayoutNodeById = function(nodeId) {

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

        return this.getLayoutNode(renderNode);
    };

    /**
     * Forces a reflow of the layout, the next render cycle.
     *
     * @return {LayoutController} this
     */
    LayoutController.prototype.reflowLayout = function() {
        this._isDirty = true;
        return this;
    };

    /**
     * Log debug info to the console
     */
    function _log() {
        if (this.options.verbose) {
            LayoutUtility.log.apply(LayoutUtility, arguments);
        }
    }

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
        var size = context.size;

        // When the size or layout function has changed, reflow the layout
        if (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1] || this._isDirty) {

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._isDirty = false;

            // Reflow layout
            //_log.call(this, 'Reflowing layout... size: ', size);
            _reflowLayout.call(this, size);
        }

        // Update commit-output
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
        this._commitOutput.target = result;

        // Return
        //if (size) transform = Transform.moveThen([-size[0]*origin[0], -size[1]*origin[1], 0], transform);
        this._commitOutput.size = size;
        this._commitOutput.opacity = context.opacity;
        this._commitOutput.transform = context.transform;
        return this._commitOutput;
    };

    /**
     * Re-flows the layout based on the given size
     *
     * @param {Array.Number} size Size to calculate the layout for
     */
    function _reflowLayout(size) {

        // Reset all layout-nodes
        var zeroArray2 = [0, 0];
        var layoutNode = this._firstLayoutNode;
        while (layoutNode) {
            layoutNode._reset(size, this.options.showOpacity, zeroArray2, zeroArray2);
            layoutNode = layoutNode._next;
        }

        // Prepare context
        this._currentSequence = this._viewSequence;
        this._prevLayoutNode = undefined;
        this._currentLayoutNode = this._firstLayoutNode;
        this._layoutContext.size = size;

        // Layout objects
        this._layout(this._layoutContext, this._layoutOptions);
    }

    /**
     * Get the layout-node for a given render-node. When no layout-node exists
     * a new one is created. This function is optimized to return almost
     * immediately when the layout-function requests the layout-nodes in the
     * same order. When the layout-nodes are requested in a new/difference
     * order, then the layout-nodes are re-arragned in that new order so that
     * they can be accessed efficiently the next time the layout is reflowed.
     *
     * @param {Object} renderNode render-node for which to lookup the layout-node
     * @return {LayoutNode} layout-node
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
        layoutNode = new LayoutNode(this._physicsEngines, renderNode);
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
     * @param {LayoutNode} layoutNode
     * @return {LayoutNode} next layout-node or undefined
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
     * @return {LayoutNode} layout-node or undefined
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

    module.exports = LayoutController;
});

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
 * FlowLayoutController transitions renderables smoothly from one
 * layout to another. When the data-source or layout is changed,
 * the renderables are transitioned from their old state (size,
 * transform, origin, etc..) to the new state.
 *
 * Inherited from: [LayoutController](./LayoutController.md)
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutController = require('./LayoutController');
    var LayoutNodeManager = require('./LayoutNodeManager');
    var OptionsManager = require('famous/core/OptionsManager');
    var ViewSequence = require('famous/core/ViewSequence');
    var FlowLayoutNode = require('./FlowLayoutNode');
    var LayoutUtility = require('./LayoutUtility');
    var Transform = require('famous/core/Transform');

    /**
     * @class
     * @extends LayoutController
     * @param {Object} options Options.
     * @param {Function} [options.layout] Layout function to use.
     * @param {Array|ViewSequence|Object} [options.dataSource] Array, ViewSequence or Object.
     * @param {Utility.Direction} [options.direction] Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)
     * @param {Number} [options.showOpacity] Opacity to use when showing renderables (default: 1)
     * @param {Spec} [options.insertSpec] Default spec to use when animating renderables into the scene (default: opacity=0)
     * @param {Spec} [options.removeSpec] Default spec to use when animating renderables out of the scene (default: opacity=0)
     * @alias module:FlowLayoutController
     */
    function FlowLayoutController(options, nodeManager) {
        LayoutController.call(this, options, nodeManager || new LayoutNodeManager(FlowLayoutNode, _initLayoutNode.bind(this)));

        // Set options
        this.options = Object.create(FlowLayoutController.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) {
            this.setOptions(options);
        }
    }
    FlowLayoutController.prototype = Object.create(LayoutController.prototype);
    FlowLayoutController.prototype.constructor = FlowLayoutController;

    FlowLayoutController.DEFAULT_OPTIONS = {
        nodeSpring: {
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
    };

    /**
     * Called whenever a layout-node is created/re-used. Initializes
     * the node with the `insertSpec` if it has been defined.
     */
    function _initLayoutNode(layoutNode, spec) {
        layoutNode.setOptions({
            spring: this.options.nodeSpring
        });
        if (!spec && this.options.insertSpec) {
            layoutNode.setSpec(this.options.insertSpec);
        }
    }

    /**
     * Patches the FlowLayoutController instance's options with the passed-in ones.
     *
     * @param {Options} options An object of configurable options for the FlowLayoutController instance.
     * @param {Number} [options.showOpacity] Opacity to use when showing renderables (default: 1)
     * @param {Spec} [options.insertSpec] Default spec to use when animating renderables into the scene (default: opacity=0)
     * @param {Spec} [options.removeSpec] Default spec to use when animating renderables out of the scene (default: opacity=0)
     * @return {FlowLayoutController} this
     */
    FlowLayoutController.prototype.setOptions = function setOptions(options) {
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
        if (options.nodeSpring) {
            this._nodes.forEach(function(node) {
                node.setOptions({spring: options.nodeSpring});
            });
        }
        return this;
    };

    /**
     * Inserts a renderable into the data-source. If the renderable is visible
     * then it is inserted using an animation.
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @param {Object} renderable Rendeable to add to the data-source
     * @param {Spec} [spec] Size, transform, etc.. to start with when inserting
     * @return {FlowLayoutController} this
     */
    FlowLayoutController.prototype.insert = function(indexOrId, renderable, spec) {

        // Add the renderable in case of an id (String)
        if ((indexOrId instanceof String) || (typeof indexOrId === 'string')) {

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
                LayoutUtility.error('FlowLayoutController.insert(index) only works when the dataSource is an array');
                return this;
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
        if (spec) {
            this._nodes.insertNode(this._nodes.createNode(renderable, spec));
        }

        // Force a reflow
        this._isDirty = true;

        return this;
    };

    /**
     * Removes a renderable from the data-source. If the renderable is visible
     * then it will be removed using an animation.
     *
     * @param {Number|String} indexOrId Index within dataSource array or id (String)
     * @param {Spec} [spec] Size, transform, etc.. to end with when removing
     * @return {FlowLayoutController} this
     */
    FlowLayoutController.prototype.remove = function(indexOrId, spec) {

        // Remove the renderable in case of an id (String)
        var renderNode;
        if ((indexOrId instanceof String) || (typeof indexOrId === 'string')) {

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
                LayoutUtility.error('FlowLayoutController.remove(index) only works when the dataSource is an array');
                return this;
            }

            // Remove from array
            renderNode = this._dataSource.splice(indexOrId, 1)[0];
        }

        // When a custom remove-spec was specified, store that in the layout-node
        if (renderNode && spec) {
            var layoutNode = this._nodes.getNodeByRenderNode(renderNode);
            if (layoutNode) {
                layoutNode.remove(spec || this.options.removeSpec);
            }
        }

        // Force a reflow
        if (renderNode) {
            this._isDirty = true;
        }

        return this;
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
    FlowLayoutController.prototype.commit = function commit(context) {
        var transform = context.transform;
        var origin = context.origin;
        var size = context.size;
        var opacity = context.opacity;

        // When the size or layout function has changed, reflow the layout
        if (size[0] !== this._contextSizeCache[0] ||
            size[1] !== this._contextSizeCache[1] ||
            this._isDirty ||
            this._nodes._trueSizeRequested) {

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
            if (this._layout.function) {
                this._layout.function(
                    layoutContext,          // context which the layout-function can use
                    this._layout.options    // additional layout-options
                );
            }

            // Mark non-invalidated nodes for removal
            this._nodes.removeNonInvalidatedNodes(this.options.removeSpec);

            // Update output
            this._commitOutput.target = this._nodes.buildSpecAndDestroyUnrenderedNodes();

            // Emit end event
            this._eventOutput.emit('layoutend', eventData);
        }
        else {
            this._commitOutput.target = this._nodes.buildSpecAndDestroyUnrenderedNodes();
        }

        // Render child-nodes every commit
        for (var i = 0; i < this._commitOutput.target.length; i++) {
            this._commitOutput.target[i].target = this._commitOutput.target[i].renderNode.render();
        }

        // Return
        if (size) {
            transform = Transform.moveThen([-size[0]*origin[0], -size[1]*origin[1], 0], transform);
        }
        this._commitOutput.size = size;
        this._commitOutput.opacity = opacity;
        this._commitOutput.transform = transform;
        return this._commitOutput;
    };

    module.exports = FlowLayoutController;
});

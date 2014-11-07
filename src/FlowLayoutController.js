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
    var FlowLayoutNode = require('./FlowLayoutNode');
    var Transform = require('famous/core/Transform');

    /**
     * @class
     * @extends LayoutController
     * @param {Object} options Options.
     * @param {Function|Object} [options.layout] Layout function or layout-literal.
     * @param {Object} [options.layoutOptions] Options to pass in to the layout-function.
     * @param {Array|ViewSequence|Object} [options.dataSource] Array, ViewSequence or Object with key/value pairs.
     * @param {Utility.Direction} [options.direction] Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)
     * @param {Spec} [options.insertSpec] Size, transform, opacity... to use when inserting new renderables into the scene.
     * @param {Spec} [options.removeSpec] Size, transform, opacity... to use when removing renderables from the scene.
     * @param {Object} [options.nodeSpring] Spring options to use when transitioning between states
     * @alias module:FlowLayoutController
     */
    function FlowLayoutController(options, nodeManager) {
        LayoutController.call(this, FlowLayoutController.DEFAULT_OPTIONS, nodeManager || new LayoutNodeManager(FlowLayoutNode, _initLayoutNode.bind(this)));
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
    function _initLayoutNode(node, spec) {
        if (node.setOptions) {
            node.setOptions({
                spring: this.options.nodeSpring
            });
        }
        if (!spec && this.options.insertSpec) {
            node.setSpec(this.options.insertSpec);
        }
    }

    var oldSetOptions = FlowLayoutController.prototype.setOptions;
    /**
     * Patches the FlowLayoutController instance's options with the passed-in ones.
     *
     * @param {Options} options An object of configurable options for the FlowLayoutController instance.
     * @param {Function|Object} [options.layout] Layout function or layout-literal.
     * @param {Object} [options.layoutOptions] Options to pass in to the layout-function.
     * @param {Array|ViewSequence|Object} [options.dataSource] Array, ViewSequence or Object with key/value pairs.
     * @param {Utility.Direction} [options.direction] Direction to layout into (e.g. Utility.Direction.Y) (when ommited the default direction of the layout is used)
     * @param {Spec} [options.insertSpec] Size, transform, opacity... to use when inserting new renderables into the scene.
     * @param {Spec} [options.removeSpec] Size, transform, opacity... to use when removing renderables from the scene.
     * @param {Object} [options.nodeSpring] Spring options to use when transitioning between states
     * @return {FlowLayoutController} this
     */
    FlowLayoutController.prototype.setOptions = function setOptions(options) {
        oldSetOptions.call(this, options);
        if (options.nodeSpring) {
            this._nodes.forEach(function(node) {
                node.setOptions({spring: options.nodeSpring});
            });
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
        var result;

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

            // Update output and optionally emit event
            result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
            this._commitOutput.target = result.specs;
            this._eventOutput.emit('reflow', {
                target: this
            });

            // Emit end event
            this._eventOutput.emit('layoutend', eventData);
        }
        else {

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

    module.exports = FlowLayoutController;
});

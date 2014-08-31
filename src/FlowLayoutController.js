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
    var LayoutController = require('./LayoutController');
    var OptionsManager = require('famous/core/OptionsManager');
    var ViewSequence = require('famous/core/ViewSequence');
    var FlowLayoutNode = require('./FlowLayoutNode');
    var LayoutUtility = require('./LayoutUtility');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Transform = require('famous/core/Transform');

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:FlowLayoutController
     */
    function FlowLayoutController(options) {
        LayoutController.call(this, options, _createLayoutNode.bind(this));

        // Set options
        this.options = Object.create(FlowLayoutController.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) {
            this.setOptions(options);
        }

        // Create physics engines
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
    FlowLayoutController.prototype = Object.create(LayoutController.prototype);
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
     * Creates a new layout-node for a render-node
     */
    function _createLayoutNode (renderNode, spec) {
        var node = new FlowLayoutNode(renderNode, spec || this.options.insertSpec, this._physicsEngines);
        if (this.options.showOpacity !== undefined) {
            node.set({opacity: this.options.showOpacity});
        }
        return node;
    }

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
            this._nodes.insertNode(_createLayoutNode.call(this, renderable, insertSpec));
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
            var layoutNode = this._nodes.getNodeByRenderNode(renderNode);
            if (layoutNode) {
                layoutNode.remove(removeSpec || this.options.removeSpec);
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

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._isDirty = false;

            // Prepare for layout
            var context = this._nodes.prepareForLayout(
                this._viewSequence,     // first node to layout
                this._nodesById         // so we can do fast id lookups
            );

            // Layout objects
            this._layout(
                size,                   // size to layout renderables into
                context,                // context which the layout-function can use 
                this._layoutOptions     // additional layout-options
            );

            // Mark non-invalidated nodes for removal
            this._nodes.removeNonInvalidatedNodes(this.options.removeSpec);
        }

        // Update output
        this._commitOutput.target = this._nodes.buildSpecAndDestroyUnrenderedNodes();

        // Render child-nodes every commit
        for (var i = 0; i < this._commitOutput.target.length; i++) {
            this._commitOutput.target[i].target = this._commitOutput.target[i].renderNode.render();
        }

        // Return
        if (size) transform = Transform.moveThen([-size[0]*origin[0], -size[1]*origin[1], 0], transform);
        this._commitOutput.size = size;
        this._commitOutput.opacity = opacity;
        this._commitOutput.transform = transform;
        return this._commitOutput;
    };

    module.exports = FlowLayoutController;
});

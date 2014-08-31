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
    var Entity = require('famous/core/Entity');;
    var ViewSequence = require('famous/core/ViewSequence');
    var LayoutNodeManager = require('./LayoutNodeManager');
    var LayoutNode = require('./LayoutNode');
    var Transform = require('famous/core/Transform');

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:LayoutController
     */
    function LayoutController(options, createNodeFn) {

        // Commit
        this.id = Entity.register(this);
        this._isDirty = true;
        this._contextSizeCache = [0, 0];
        this._commitOutput = {};

        // Data-source
        //this._dataSource = undefined;
        //this._nodesById = undefined;
        //this._viewSequence = undefined;

        // Layout
        //this._layout = undefined;
        this._layoutOptions = {};

        // Create node manager that manages result LayoutNode instances
        var fn = createNodeFn || function(renderNode) {
            return new LayoutNode(renderNode)
        };
        this._nodes = new LayoutNodeManager(fn);

        // Apply options
        if (options && options.dataSource) {
            this.setDataSource(options.dataSource);
        }
        if (options && (options.layout || options.layoutOptions)) {
            this.setLayout(options.layout, options.layoutOptions);
        }
    }

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
     * Set the new layout
     *
     * @param {Function} layout Layout function
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {LayoutController} this
     */
    LayoutController.prototype.setLayout = function(layout, options) {
        this._layout = layout;
        this._layoutOptions = options || this._layoutOptions;
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
        this._layoutOptions = options || {};
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
     * Get the spec based on the renderable that was provided
     * in the data-source.
     *
     * @param {Object} node Render-node to look for
     * @return {Object} spec or undefined
     */
    LayoutController.prototype.getSpecByNode = function(node) {
        for (var i = 0; i < this._commitOutput.target.length; i++) {
            var spec = this._commitOutput.target[i];
            if (spec.renderNode === node) {
                return spec;
            }
        }
        return undefined;
    };

    /**
     * Get the spec based on the id of the renderable that was provided
     * in the data-source. If the content at the given id was an array, then
     * that array is returned as is. You can use `getSpecByNode` on the elements
     * of the array to obtain their specs
     *
     * @param {String} nodeId Node-id to look for
     * @return {Object|Array} spec, undefined or an array of nodes.
     */
    LayoutController.prototype.getSpecByNodeId = function(nodeId) {
        if (!this._nodesById) {
            return undefined;
        }
        var renderNode = this._nodesById[nodeId];
        if (!renderNode) {
            return undefined;
        }
        if (renderNode instanceof Array) {
            return renderNode;
        }
        return this.getSpecByNode(renderNode);
    };

    /**
     * Forces a reflow of the layout, the next render cycle.
     *
     * @return {BaseLayoutController} this
     */
    LayoutController.prototype.reflowLayout = function() {
        this._isDirty = true;
        return this;
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

            // Update output
            this._commitOutput.target = this._nodes.buildSpecAndDestroyUnrenderedNodes();
        }

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

    module.exports = LayoutController;
});

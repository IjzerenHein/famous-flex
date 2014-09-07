/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define, console*/
/*eslint no-use-before-define:0, no-console:0 */

/**
 * TODO
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Entity = require('famous/core/Entity');
    var OptionsManager = require('famous/core/OptionsManager');
    var ViewSequence = require('famous/core/ViewSequence');
    var Transform = require('famous/core/Transform');
    var Utility = require('famous/utilities/Utility');
    var EventHandler = require('famous/core/EventHandler');
    var GenericSync = require('famous/inputs/GenericSync');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var TouchSync = require('famous/inputs/TouchSync');
    var LayoutNodeManager = require('./LayoutNodeManager');
    var LayoutNode = require('./LayoutNode');
    GenericSync.register({scroll : ScrollSync, touch : TouchSync});

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:ScrollView
     */
    function ScrollView(options, createNodeFn) {

        // Set options
        this.options = Object.create(ScrollView.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
        if (options) {
            this.setOptions(options);
        }

        // Commit
        this.id = Entity.register(this);
        this._isDirty = true;
        this._contextSizeCache = [0, 0];
        this._commitOutput = {};

        // Scrolling
        this._scroll = {
            startX: 0,
            startY: 0,
            currentOffset: 0,
            newOffset: 0
            //renderNode: undefined,
            //sequenceNode: undefined
        };
        this.sync = new GenericSync(['scroll', 'touch'], {direction : this.options.direction});
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        this._eventInput.pipe(this.sync);
        this.sync.pipe(this._eventInput);
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);
        this._eventInput.on('start', _handleStart.bind(this));
        this._eventInput.on('update', _handleMove.bind(this));
        this._eventInput.on('end', _handleEnd.bind(this));

        // Data-source
        //this._viewSequence = undefined;

        // Layout
        //this._layout = undefined;
        this._direction = Utility.Direction.Y;
        this._layoutOptions = Object.create({});
        this._layoutOptionsManager = new OptionsManager(this._layoutOptions);
        this._layoutOptionsManager.on('change', function() {
            this._isDirty = true;
        }.bind(this));

        // Create node manager that manages result LayoutNode instances
        this._nodes = new LayoutNodeManager(createNodeFn || _createLayoutNode);

        // Apply options
        if (options && options.sequence) {
            this.sequenceFrom(options.sequence);
        }
        if (options && (options.layout || options.layoutOptions)) {
            this.setLayout(options.layout, options.layoutOptions);
        }
    }
    ScrollView.DEFAULT_OPTIONS = {

    };

    /**
     * Creates a new layout-node for a render-node
     */
    function _createLayoutNode (renderNode, spec) {
        return new LayoutNode(renderNode, spec);
    }

    /**
     * Patches the instance's options with the passed-in ones.
     *
     * @method setOptions
     * @param {Options} options An object of configurable options for this instance.
     */
    ScrollView.prototype.setOptions = function setOptions(options) {
        return this._optionsManager.setOptions(options);
    };

    /**
     * Sets the collection of renderables which are layed out according to
     * the layout-function.
     *
     * @param {Array|Object|ViewSequence} sequence Either an array of renderables or a Famous viewSequence.
     * @return {ScrollView} this
     */
    ScrollView.prototype.sequenceFrom = function(sequence) {
        if (sequence instanceof Array) {
            this._viewSequence = new ViewSequence({array: sequence});
        }
        else {
            this._viewSequence = sequence;
        }

        // TODO - CHECK CURRENT NODE
        this._scroll.sequenceNode = this._viewSequence;
        this._isDirty = true;
        return this;
    };

    /**
     * Set the new layout
     *
     * @param {Function} layout Layout function
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {ScrollView} this
     */
    ScrollView.prototype.setLayout = function(layout, options) {
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
    ScrollView.prototype.getLayout = function() {
        return this._layout;
    };

    /**
     * Set the options for the current layout. Use this function after
     * `setLayout` to update one or more options for the layout-function.
     *
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {ScrollView} this
     */
    ScrollView.prototype.setLayoutOptions = function(options) {
        this._layoutOptionsManager.setOptions(options);
        return this;
    };

    /**
     * Get the current layout options.
     *
     * @return {Object} Layout options
     */
    ScrollView.prototype.getLayoutOptions = function() {
        return this._layoutOptions;
    };

    /**
     * Set the direction of the layout. The default direction is Utility.Direction.Y.
     *
     * @param {Utility.Direction} direction Direction (e.g. Utility.Direction.X)
     * @return {ScrollView} this
     */
    ScrollView.prototype.setDirection = function(direction) {
        if (this._direction !== direction) {
            this._direction = direction;
            this._isDirty = true;
        }
        return this;
    };

    /**
     * Get the direction (e.g. Utility.Direction.Y).
     *
     * @return {Utility.Direction} Direction in which the renderables are layed out
     */
    ScrollView.prototype.getDirection = function() {
        return this._direction;
    };

    /**
     * Get the spec based on the renderable that was provided
     * in the sequence
     *
     * @param {Object} node Render-node to look for
     * @return {Object} spec or undefined
     */
    ScrollView.prototype.getSpecByNode = function(node) {
        for (var i = 0; i < this._commitOutput.target.length; i++) {
            var spec = this._commitOutput.target[i];
            if (spec.renderNode === node) {
                return spec;
            }
        }
        return undefined;
    };

    /**
     * Forces a reflow of the layout, the next render cycle.
     *
     * @return {ScrollView} this
     */
    ScrollView.prototype.reflowLayout = function() {
        this._isDirty = true;
        return this;
    };

    /**
     * Inserts a renderable into the data-source. If the renderable is visible
     * then it is inserted using an animation.
     *
     * @param {Number|String} index Index within vireSeuqnce
     * @param {Object} renderable Rendeable to add to the data-source
     * @return {ScrollView} this
     */
    ScrollView.prototype.insert = function(index, renderable) {

        // Todo
        this._viewSequence.push(renderable);

        // Force a reflow
        this._isDirty = true;

        return this;
    };

    /**
     * Removes a renderable from the data-source. If the renderable is visible
     * then it will be removed using an animation.
     *
     * @param {Number|String} index Index within dataSource array or id (String)
     * @param {Spec} [spec] Size, transform, etc.. to end with when removing
     * @return {ScrollView} this
     */
    ScrollView.prototype.remove = function(index) {

        // Todo
        var renderNode; //this._dataSource.splice(indexOrId, 1)[0];

        // Force a reflow
        if (renderNode) {
            this._isDirty = true;
        }

        return this;
    };

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {Object} Render spec for this component
     */
    ScrollView.prototype.render = function render() {
        return this.id;
    };

    function _handleStart(event) {
        this._scroll.moveStart = (this.options.direction ? event.clientY : event.clientX) - this._scroll.currentOffset;

        //var velocity = -event.velocity;
        //var delta = -event.delta;
        //console.log('scrollstart: ' + JSON.stringify({velocity: velocity, delta: delta}));
        /*this._touchCount = event.count;
        if (event.count === undefined) this._touchCount = 1;

        _detachAgents.call(this);
        this.setVelocity(0);
        this._touchVelocity = 0;
        this._earlyEnd = false;*/
    }

    function _handleMove(event) {
        //var velocity = -event.velocity;
        //var delta = -event.delta;
        //console.log('scrollmove: ' + JSON.stringify({velocity: velocity, delta: delta}));

        this._scroll.moveCurrent = this.options.direction ? event.clientY : event.clientX;
        this._scroll.newOffset = this._scroll.moveCurrent - this._scroll.moveStart;

        //console.log('handleMove: ')
        /*var velocity = -event.velocity;
        var delta = -event.delta;

        if (this._onEdge && event.slip) {
            if ((velocity < 0 && this._onEdge < 0) || (velocity > 0 && this._onEdge > 0)) {
                if (!this._earlyEnd) {
                    _handleEnd.call(this, event);
                    this._earlyEnd = true;
                }
            }
            else if (this._earlyEnd && (Math.abs(velocity) > Math.abs(this.getVelocity()))) {
                _handleStart.call(this, event);
            }
        }
        if (this._earlyEnd) return;
        this._touchVelocity = velocity;

        if (event.slip) this.setVelocity(velocity);
        else this.setPosition(this.getPosition() + delta);*/
    }

    function _handleEnd(event) {
        //var velocity = -event.velocity;
        //var delta = -event.delta;
        //console.log('scrollend: ' + JSON.stringify({velocity: velocity, delta: delta}));
        /*this._touchCount = event.count || 0;
        if (!this._touchCount) {
            _detachAgents.call(this);
            if (this._onEdge) _setSpring.call(this, this._edgeSpringPosition, SpringStates.EDGE);
            _attachAgents.call(this);
            var velocity = -event.velocity;
            var speedLimit = this.options.speedLimit;
            if (event.slip) speedLimit *= this.options.edgeGrip;
            if (velocity < -speedLimit) velocity = -speedLimit;
            else if (velocity > speedLimit) velocity = speedLimit;
            this.setVelocity(velocity);
            this._touchVelocity = undefined;
            this._needsPaginationCheck = true;
        }*/
    }

    /*
     * Adjust the output from the layout function so that it
     * is vertically/horizontally shifted according to the
     * current scroll offset.
     */
    function _adjustSpecsForScrollOffset(specs) {
        if (!this._scroll.currentOffset) {
            return specs;
        }
        var result = [];
        for (var i = 0; i < specs.length; i++) {
            var spec = specs[i];
            var newSpec = {
                opacity: spec.opacity,
                size: spec.size,
                align: spec.align,
                origin: spec.origin,
                renderNode: spec.renderNode
            };
            if (spec.transform) {
                newSpec.transform = Transform.thenMove(spec.transform, [0, this._scroll.currentOffset, 0]);
            }
            else {
                newSpec.transform = Transform.translate(0, this._scroll.currentOffset, 0);
            }
            result.push(newSpec);
        }
        return result;
    }

    /**
     * Calculates the scroll offset and length for each spec after
     * each layout function execution.
     */
    function _calcScrollInfoForSpecs(specs, direction) {
        for (var i = 0; i < specs.length; i++) {
            var spec = specs[i];
            var specTransform = spec.transform || [0, 0, 0];
            if (direction === Utility.Direction.X){
                spec.scrollOffset = specTransform[12];
                spec.scrollLength = spec.size[0];
            }
            else {
                spec.scrollOffset = specTransform[13];
                spec.scrollLength = spec.size[1];
            }
        }
    }

    /**
     * Helper function that gets the first visible spec
     * from a ordered spec-array, starting at offset and
     * using a specific direction (X/Y).
     */
    function _getFirstVisibleSpec(specs, offset, direction) {
        for (var i = 0; i < specs.length; i++) {
            var spec = specs[i];
            if (((spec.scrollOffset + spec.scrollLength) >= offset) ||
                (i === (specs.length - 1))){
                return spec;
            }
        }
    }

    function _shouldReflowAfterOffsetChange() {

        // When the offset hasn'changed, excellent return immediately
        if (this._scroll.newOffset === this._scroll.currentOffset) {
            return false;
        }
        console.log(this._scroll.currentOffset);

        // Offset has changed, check whether the first visible node
        // has changed.
        if (!this._layout || !this._layoutResult.length) {
            return false; // nothing to layout
        }

        // Handle scroll up/left
        if (this._scroll.newOffset > 0) {
            // TODO
            console.log('todo');

        // Handle scroll down/right
        }
        else if (this._scroll.newOffset < 0){

            // Get the first visible spec
            var firstVisibleSpec = _getFirstVisibleSpec(
                this._layoutResult,
                -this._scroll.newOffset,
                this.options.direction
            );
            if (firstVisibleSpec.renderNode === this._scroll.renderNode) {
                return false;
            }

            // Store the current render node
            this._scroll.renderNode = firstVisibleSpec.renderNode;

            // Find the corresponding sequence-node
            while (this._scroll.sequenceNode.get() !== this._scroll.renderNode) {
                this._scroll.sequenceNode = this._scroll.sequenceNode.getNext();
            }

            // Adjust scroll offset
            this._scroll.newOffset += firstVisibleSpec.scrollOffset;
            this._scroll.moveStart -= firstVisibleSpec.scrollOffset;

            // Reflow-layout
            return true;
        }
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
    ScrollView.prototype.commit = function commit(context) {
        var transform = context.transform;
        var origin = context.origin;
        var size = context.size;
        var opacity = context.opacity;

        // When the size or layout function has changed, reflow the layout
        if (_shouldReflowAfterOffsetChange.call(this) ||
            size[0] !== this._contextSizeCache[0] ||
            size[1] !== this._contextSizeCache[1] ||
            this._isDirty ||
            this._nodes._trueSizeRequested) {

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._isDirty = false;

            // Prepare for layout
            var layoutContext = this._nodes.prepareForLayout(
                this._scroll.sequenceNode,  // first visible node
                undefined, {
                    size: size
                }
            );

            // Layout objects
            if (this._layout) {
                this._layout(
                    layoutContext,          // context which the layout-function can use
                    this._layoutOptions     // additional layout-options
                );
            }

            // Update output
            this._layoutResult = this._nodes.buildSpecAndDestroyUnrenderedNodes();

            // Update offset and length for all results
            _calcScrollInfoForSpecs.call(this, this._layoutResult, this.options.direction);

            // Adjust for current scroll offset
            this._scroll.currentOffset = this._scroll.newOffset;
            this._commitOutput.target = _adjustSpecsForScrollOffset.call(this, this._layoutResult);

        // Then scroll-offset has changed without requiring a reflow of the layout
        // just adjust the output-spec for the scroll offset
        } else if (this._scroll.newOffset !== this._scroll.currentOffset) {
            this._scroll.currentOffset = this._scroll.newOffset;
            this._commitOutput.target = _adjustSpecsForScrollOffset.call(this, this._layoutResult);
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

    module.exports = ScrollView;
});

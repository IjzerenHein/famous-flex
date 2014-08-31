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
        this._scrollOffset = 0;
        this._scroll = {
            startX: 0,
            startY: 0,
            currentOffset: 0,
            newOffset: 0
        }
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
        this._layoutOptions = {};

        // Create node manager that manages result LayoutNode instances
        var fn = createNodeFn || function(renderNode) {
            return new LayoutNode(renderNode)
        };
        this._nodes = new LayoutNodeManager(fn);

        // Apply options
        if (options && options.sequence) {
            this.sequenceFrom(options.sequence);
        }
        if (options && (options.layout || options.layoutOptions)) {
            this.setLayout(options.layout, options.layoutOptions);
        }
    }
    ScrollView.DEFAULT_OPTIONS = {
        direction: Utility.Direction.Y
    };

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
     * @method setDataSource
     * @param {Array|Object|ViewSequence} dataSource Either an array of renderables or a Famous viewSequence.
     * @return {ScrollView} this
     */
    ScrollView.prototype.sequenceFrom = function(sequence) {
        if (sequence instanceof Array) {
            this._viewSequence = new ViewSequence({array: sequence});
        }
        else {
            this._viewSequence = sequence;
        }
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
     * `setLayout` to update the options for the layout-function.
     *
     * @param {Object} [options] Options to pass in to the layout-function
     * @return {ScrollView} this
     */
    ScrollView.prototype.setLayoutOptions = function(options) {
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
     * @return {ScrollView} this
     */
    ScrollView.prototype.patchLayoutOptions = function(options) {
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
    ScrollView.prototype.getLayoutOptions = function() {
        return this._layoutOptions;
    };

    /**
     * Get the spec based on the renderable that was provided
     * in the data-source.
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
     * @return {BaseScrollView} this
     */
    ScrollView.prototype.reflowLayout = function() {
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
    ScrollView.prototype.render = function render() {
        return this.id;
    };


    function _handleStart(event) {

        this._scroll.startX = event.clientX;
        this._scroll.startY = event.clientY;

        var velocity = -event.velocity;
        var delta = -event.delta;
        console.log('scrollstart: ' + JSON.stringify({velocity: velocity, delta: delta}));
        /*this._touchCount = event.count;
        if (event.count === undefined) this._touchCount = 1;

        _detachAgents.call(this);
        this.setVelocity(0);
        this._touchVelocity = 0;
        this._earlyEnd = false;*/
    }

    function _handleMove(event) {
        var velocity = -event.velocity;
        var delta = -event.delta;
        console.log('scrollmove: ' + JSON.stringify({velocity: velocity, delta: delta}));

        offsetY = this._scroll.startY - event.clientY;

        this._scroll.newOffset = offsetY;

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
        var velocity = -event.velocity;
        var delta = -event.delta;
        console.log('scrollend: ' + JSON.stringify({velocity: velocity, delta: delta}));
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

    function _adjustSpecForScrollOffset(specArray) {
        if (!this._scroll.currentOffset) {
            return specArray;
        }

        var result = [];
        for (var i = 0; i < specArray.length; i++) {
            var spec = specArray[i];
            var newSpec = {
                opacity: spec.opacity,
                size: spec.size,
                align: spec.align,
                origin: spec.origin,
                renderNode: spec.renderNode,
            }
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

    function _shouldReflowAfterOffsetChange() {
        if (this._scroll.newOffset === this._scroll.currentOffset) {
            return false;
        }
        return true;
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
        if (size[0] !== this._contextSizeCache[0] || 
            size[1] !== this._contextSizeCache[1] || 
            this._isDirty ||
            this._nodes._trueSizeRequested ||
            _shouldReflowAfterOffsetChange.call(this)) {

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._isDirty = false;

            // Prepare for layout
            var context = this._nodes.prepareForLayout(
                this._viewSequence      // first node to layout
            );

            // Layout objects
            this._layout(
                size,                   // size to layout renderables into
                context,                // context which the layout-function can use 
                this._layoutOptions     // additional layout-options
            );

            // Update output
            this._layoutResult = this._nodes.buildSpecAndDestroyUnrenderedNodes();

            // Adjust for current scroll offset
            this._scroll.currentOffset = this._scroll.newOffset;
            this._commitOutput.target = _adjustSpecForScrollOffset.call(this, this._layoutResult);

        // Then scroll-offset has changed without requiring a reflow of the layout
        // just adjust the output-spec for the scroll offset
        } else if (this._scroll.newOffset !== this._scroll.currentOffset) {
            this._scroll.currentOffset = this._scroll.newOffset;
            this._commitOutput.target = _adjustSpecForScrollOffset.call(this, this._layoutResult);
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

    module.exports = ScrollView;
});

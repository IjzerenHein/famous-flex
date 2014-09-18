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
    var FlowLayoutController = require('./FlowLayoutController');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Transform = require('famous/core/Transform');
    var EventHandler = require('famous/core/EventHandler');
    var Vector = require('famous/math/Vector');
    var Particle = require('famous/physics/bodies/Particle');
    var Drag = require('famous/physics/forces/Drag');
    var Spring = require('famous/physics/forces/Spring');
    var GenericSync = require('famous/inputs/GenericSync');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var TouchSync = require('famous/inputs/TouchSync');
    GenericSync.register({scroll : ScrollSync, touch : TouchSync});

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:ScrollView
     */
    function ScrollView(options, createNodeFn) {
        FlowLayoutController.call(this, options);

        // Scrolling
        this._scroll = {
            startX: 0,
            startY: 0,
            moveOffset: 0,
            // physics-engine to use for scrolling
            pe: this._physicsEngines.opacity,
            // particle that represents the scroll-offset
            particle: new Particle({
                axis: Particle.AXES.X | Particle.AXES.X,
                position: [0, 0]
            }),
            // drag-force that slows the particle down after a "flick"
            dragForce: new Drag(),
            // spring-force that acts upon the particle to ensure that
            // the particle doesn't scroll past the edges
            edgeSpringVector: new Vector([0, 0, 0]),
            edgeSpringForce: new Spring({
                dampingRatio: 0.8,
                period: 300
            })
        };

        // Configure physics engine with particle and drag
        this._scroll.pe.addBody(this._scroll.particle);
        this._scroll.dragForceId = this._scroll.pe.attach(this._scroll.dragForce, this._scroll.particle);
        this._scroll.edgeSpringForce.setOptions({ anchor: this._scroll.edgeSpringVector });

        // Listen to scroll and touch events
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

        // Embed in container surface if neccesary
        if (this.options.useContainer) {
            this.container = new ContainerSurface({
                properties: {overflow : 'hidden'}
            });

            // Create container surface, which has one child, which just returns
            // the entity-id of this scrollview. This causes the Commit function
            // of this scrollview to be called
            this.container.add({
                render: function() {
                    return this.id;
                }.bind(this)
            });

            // Pipe events received in container to this scrollview
            this.subscribe(this.container);
            EventHandler.setInputHandler(this.container, this);
            EventHandler.setOutputHandler(this.container, this);
        }
    }
    ScrollView.prototype = Object.create(FlowLayoutController.prototype);
    ScrollView.prototype.constructor = ScrollView;

    //function _applyMove(offset, )

    /**
     * Called whenever the user starts moving the scroll-view, using either
     * touch-gestures, mouse-drags or mouse-scroll.
     */
    function _handleStart(event) {
        this._scroll.moveStart = this._direction ? event.clientY : event.clientX;
        this._scroll.particle.setVelocity1D(0);
        //console.log('moveStart: ' + this._scroll.moveStart);

        // TODO
    }

    /**
     * Called whenever the user is moving the scroll-view, using either
     * touch-gestures, mouse-drags or mouse-scroll.
     */
    function _handleMove(event) {
        //console.log('move-velocity: ' + JSON.stringify(event.velocity));
        this._scroll.moveOffset = (this._direction ? event.clientY : event.clientX) - this._scroll.moveStart;
        //,console.log('move: ' + this._scroll.moveOffset);

        // TODO
    }

    /**
     * Called whenever the user has stopped moving the scroll-view, using either
     * touch-gestures, mouse-drags or mouse-scroll.
     */
    function _handleEnd(event) {
        //console.log('end-velocity: ' + JSON.stringify(event.velocity));
        //console.log('moveEnd: ' + (this._scroll.moveOffset + this._scroll.offset));
        this._scroll.particle.setPosition1D(this._scroll.particle.getPosition1D() + this._scroll.moveOffset);
        this._scroll.particle.setVelocity1D(event.velocity[this._direction]);
        this._scroll.moveOffset = 0;
        this._scroll.moveStart = undefined;
        //console.log('moveEnd: ' + (this._scroll.moveOffset + this._scroll.offset));

        // TODO
    }

    /**
     * Helper function that looks up a spec/index for a view-sequence node
     * in the given specs-array.
     */
    function _lookupSpecByViewSequence(specs, viewSequence, getIndex, startIndex) {
        // todo - use start-index
        if (!viewSequence) {
            return getIndex ? -1 : undefined;
        }
        var renderNode = viewSequence.get();
        if (!renderNode) {
            return getIndex ? -1 : undefined;
        }
        for (var i = 0; i < specs.length; i++) {
            if (specs[i].renderNode === renderNode) {
                return getIndex ? i : specs[i];
            }
        }
        return getIndex ? -1 : undefined;
    }

    /**
     * Normalizes the scroll-offset so that scroll-offset is as close
     * to 0 as can be. This function modifies the scrollOffset and the
     * viewSeuqnce so that the least possible view-sequence nodes
     * need to be rendered.
     *
     * I.e., when the scroll-offset is changed, e.g. by scrolling up
     * or down, then renderables may end-up outside the visible range.
     */
    function _normalizeScrollOffset() {

        if (!this._viewSequence) {
            return;
        }

        // Prepare
        var specs = this._commitOutput.target;
        var offset = _getScrollOffset.call(this);
        var startSpecIndex = _lookupSpecByViewSequence(specs, this._viewSequence, true);
        var sequenceNode;
        if (offset >= 0) {

            // Move scroll-offset up as long as view-sequence nodes
            // are not visible.
            sequenceNode = this._viewSequence.getPrevious();
            while (sequenceNode && sequenceNode.get()) {

                // Get previous spec and check whether it can be normalized
                var spec = _lookupSpecByViewSequence(specs, sequenceNode, false, startSpecIndex);
                if (!spec || spec.trueSizeRequested) {
                    return;
                }

                // Check whether previous node is still visible
                var specOffset = spec.transform[12 + this._direction];
                var specSize = spec.size[this._direction];
                if ((specOffset + specSize) < 0) {
                    return; // previous is not visible, stop normalize
                }

                // Normalize and make this the first visible node
                this._viewSequence = sequenceNode;
                this._scroll.particle.setPosition1D(this._scroll.particle.getPosition1D() - prevSpecSize);
                console.log('normalized prev-node with size: ' + specSize);

                // Move to previous node
                sequenceNode = this._viewSequence.getPrevious();
            }
        }
        else {

            // Move scroll-offset down as long as view-sequence nodes
            // are not visible.
            var prevSequenceNode = this._viewSequence;
            sequenceNode = prevSequenceNode.getNext();
            while (sequenceNode && sequenceNode.get()) {

                // Get previous spec and check whether it can be normalized
                var prevSpec = _lookupSpecByViewSequence(specs, prevSequenceNode, false, startSpecIndex);
                if (!prevSpec || prevSpec.trueSizeRequested) {
                    return;
                }

                // Check whether previous node is still visible
                var prevSpecOffset = prevSpec.transform[12 + this._direction];
                var prevSpecSize = prevSpec.size[this._direction];
                if ((prevSpecOffset + prevSpecSize) >= 0) {
                    return; // yes it is visible, stop normalize
                }

                // Normalize and make this the first visible node
                this._viewSequence = sequenceNode;
                this._scroll.particle.setPosition1D(this._scroll.particle.getPosition1D() + prevSpecSize);
                console.log('normalized next-node with size: ' + prevSpecSize);

                // Move to next node
                prevSequenceNode = sequenceNode;
                sequenceNode = this._viewSequence.getNext();
            }
        }
    }

    /**
     * Generate a render spec from the contents of this component.
     *
     * @private
     * @method render
     * @return {number} Render spec for this component
     */
    ScrollView.prototype.render = function render() {
        if (this.container) {
            return this.container.render.apply(this.container, arguments);
        }
        else {
            return this.id;
        }
    };

    function _getScrollOffset() {
        return this._scroll.particle.getPosition1D() + this._scroll.moveOffset;
    }

    function _layout(size, scrollOffset) {

        // Prepare for layout
        var layoutContext = this._nodes.prepareForLayout(
            this._viewSequence,     // first node to layout
            this._nodesById, {      // so we can do fast id lookups
                size: size,
                direction: this._direction,
                scrollOffset: scrollOffset
            }
        );
        //console.log('total: ' + offset + ', offset: ' + this._scroll.offset + ', move: ' + this._scroll.moveOffset);

        // Layout objects
        if (this._layout.function) {
            this._layout.function(
                layoutContext,          // context which the layout-function can use
                this._layout.options    // additional layout-options
            );
        }
    }

    /**
     * When the edge is reached, attach a spring to the edge, so that the
     * particle is locked into that position
     */
    function _updateEdgeSpring() {
        if (this._nodes.endReached(true)) {

            // Enable edge spring
            if (!this._scroll.edgeSpringForceId) {
                this._scroll.edgeSpringVector.set([0, 0, 0]);
                this._scroll.edgeSpringForceId = this._scroll.pe.attach(this._scroll.edgeSpringForce, this._scroll.particle);
                console.log('enable edge-spring top');
                return true;
            }

        } else if (this._nodes.endReached(false)) {
            console.log('enable edge-spring bottom (TODO)');
            // TODO
        }
        else {

            // Disable edge spring
            if (this._scroll.edgeSpringForceId) {
                this._scroll.pe.detach(this._scroll.edgeSpringForceId);
                this._scroll.edgeSpringForceId = undefined;
                console.log('disable edge-spring');
                return true;
            }
            else {
                return false;
            }
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
        var scrollOffset = _getScrollOffset.call(this);

        // When the size or layout function has changed, reflow the layout
        if (size[0] !== this._contextSizeCache[0] ||
            size[1] !== this._contextSizeCache[1] ||
            this._isDirty ||
            this._nodes._trueSizeRequested ||
            this._scrollOffsetCache !== scrollOffset) {

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._scrollOffsetCache = scrollOffset;
            this._isDirty = false;

            // Perform layout
            _layout.call(this, size, scrollOffset);
            //_normalizeScrollOffset.call(this);
            _updateEdgeSpring.call(this);

            // Mark non-invalidated nodes for removal
            this._nodes.removeNonInvalidatedNodes(this.options.removeSpec, this.options.showOpacity);
        }

        // Update output
        this._commitOutput.target = this._nodes.buildSpecAndDestroyUnrenderedNodes(this._direction);
        _normalizeScrollOffset.call(this);

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

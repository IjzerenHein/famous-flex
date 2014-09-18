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
    var LayoutController = require('./FlowLayoutController');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Transform = require('famous/core/Transform');
    var EventHandler = require('famous/core/EventHandler');
    var Vector = require('famous/math/Vector');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Particle = require('famous/physics/bodies/Particle');
    var Drag = require('famous/physics/forces/Drag');
    var Spring = require('famous/physics/forces/Spring');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var TouchSync = require('famous/inputs/TouchSync');

    var Bounds = {
        NONE: 0,
        FIRST: 1,
        LAST: 2
    };

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:ScrollView
     */
    function ScrollView(options, createNodeFn) {
        LayoutController.call(this, options);

        // Scrolling
        this._scroll = {
            startX: 0,
            startY: 0,
            moveOffset: 0,
            scrollDelta: 0,
            // physics-engine to use for scrolling
            pe: new PhysicsEngine(),
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

        // Setup event handlers
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);

        // Listen to scroll and touch events
        this._touchSync = new TouchSync();
        this._eventInput.pipe(this._touchSync);
        //this._touchSync.pipe(this._eventInput);
        this._touchSync.on('start', _moveStart.bind(this, this._touchSync));
        this._touchSync.on('update', _moveUpdate.bind(this, this._touchSync));
        this._touchSync.on('end', _moveEnd.bind(this, this._touchSync));

        // Listen to mouse-wheel events
        this._scrollSync = new ScrollSync({
            scale: 0.1
        });
        this._eventInput.pipe(this._scrollSync);
        //this._scrollSync.on('start', _moveStart.bind(this, this._scrollSync));
        this._scrollSync.on('update', _moveUpdate.bind(this, this._scrollSync));
        //this._scrollSync.on('end', _moveEnd.bind(this, this._scrollSync));

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
    ScrollView.prototype = Object.create(LayoutController.prototype);
    ScrollView.prototype.constructor = ScrollView;

    function _verifyIntegrity() {
        if ((this._scroll.moveStart !== undefined) && isNaN(this._scroll.moveStart)) {
            throw 'hey goffer';
        }
        if ((this._scroll.moveOffset !== undefined) && isNaN(this._scroll.moveOffset)) {
            throw 'hey goffer';
        }
        if ((this._scroll.scrollDelta !== undefined) && isNaN(this._scroll.scrollDelta)) {
            throw 'hey goffer';
        }
        if ((this._scroll.edgeSpringOffset !== undefined) && isNaN(this._scroll.edgeSpringOffset)) {
            throw 'hey goffer';
        }
        if (isNaN(this._scroll.particle.getVelocity1D(0))) {
            throw 'hey goffer';
        }
        if (isNaN(this._scroll.particle.getPosition1D(0))) {
            throw 'hey goffer';
        }
    }

    /**
     * Called whenever the user starts moving the scroll-view, using either
     * touch-gestures, mouse-drags or mouse-scroll.
     */
    function _moveStart(sync, event) {
        if (sync === this._touchSync) {
            this._scroll.moveStart = Array.isArray(event.position) ? event.position[this._direction] : event.position;
        } else if (sync === this._scrollSync) {
            this._scroll.scrollDelta += Array.isArray(event.delta) ? event.delta[this._direction] : event.delta;
            //console.log('scroll-move:' + this._scroll.scrollDelta);
        }
        _verifyIntegrity.call(this);
        this._scroll.particle.setVelocity1D(0);
        _verifyIntegrity.call(this);
        //console.log('moveStart: ' + this._scroll.moveStart);
    }

    /**
     * Called whenever the user is moving the scroll-view, using either
     * touch-gestures, mouse-drags or mouse-scroll.
     */
    function _moveUpdate(sync, event) {
        if (sync === this._touchSync) {
            this._scroll.moveOffset = event.position[this._direction] - this._scroll.moveStart;
        } else if (sync === this._scrollSync) {
            this._scroll.scrollDelta += Array.isArray(event.delta) ? event.delta[this._direction] : event.delta;
            //console.log('scroll-move:' + this._scroll.scrollDelta);
            this._scroll.particle.setVelocity1D(0);
            _verifyIntegrity.call(this);
        }
        _verifyIntegrity.call(this);
        //,console.log('move: ' + this._scroll.moveOffset);
    }

    /**
     * Called whenever the user has stopped moving the scroll-view, using either
     * touch-gestures, mouse-drags or mouse-scroll.
     */
    function _moveEnd(sync, event) {
        if (sync === this._touchSync) {
            this._scroll.particle.setPosition1D(this._scroll.particle.getPosition1D() + this._scroll.moveOffset);
            _verifyIntegrity.call(this);
            if (event.velocity !== undefined) {
                this._scroll.particle.setVelocity1D(Array.isArray(event.velocity) ? event.velocity[this._direction] : event.velocity);
                _verifyIntegrity.call(this);
            }
            this._scroll.moveOffset = 0;
            this._scroll.moveStart = undefined;
        } else if (sync === this._scrollSync) {
            this._scroll.scrollDelta += Array.isArray(event.delta) ? event.delta[this._direction] : event.delta;
            //console.log('scroll-move:' + this._scroll.scrollDelta);
            this._scroll.particle.setVelocity1D(0);
            _verifyIntegrity.call(this);
        }
        //console.log('moveEnd: ' + (this._scroll.moveOffset + this._scroll.offset));
    }

    function _getScrollOffset() {
        _verifyIntegrity.call(this);

        // When scrolling using the mouse-wheel, halt at the boundary entirely
        /*if ((this._scroll.scrollDelta > 0) && this._nodes.endReached(true)) {
            console.log('ignoring scroll-delta, top-reached: ' + this._scroll.scrollDelta);
            this._scroll.scrollDelta = 0;
        } else if ((this._scroll.scrollDelta < 0) && this._nodes.endReached(false)) {
            console.log('ignoring scroll-delta, bottom-reached: ' + this._scroll.scrollDelta);
            this._scroll.scrollDelta = 0;
        }*/

        // Calculate new offset
        return this._scroll.particle.getPosition1D() + this._scroll.moveOffset + this._scroll.scrollDelta;
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
                this._scroll.particle.setPosition1D(this._scroll.particle.getPosition1D() - specSize);
                _verifyIntegrity.call(this);
                console.log('normalized prev-node with size: ' + specSize);

                // Move to previous node
                sequenceNode = this._viewSequence.getPrevious();
            }
        }
        else if (!this._nodes.endReached(false)) {

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
                _verifyIntegrity.call(this);
                console.log('normalized next-node with size: ' + prevSpecSize);

                // Move to next node
                prevSequenceNode = sequenceNode;
                sequenceNode = this._viewSequence.getNext();
            }
        }
    }

    /**
     * Calculates whether a boundary exists for either the prev or next direction.
     * When no boundary exists, undefined is returned. When a boundary does exist,
     * 0 is returned for the prev-direction and (size - size-of-last-renderable)
     * is returned for the next direction.
     *
     * NOTE: This function assumes that the scroll-offset/current view-sequence
     *       has been normalized.
     */
    function _boundsReached(size, scrollOffset) {

        // Check whether the top was reached
        if (!this._viewSequence || (this._nodes.endReached(true) && (scrollOffset >= 0))) {
            return Bounds.FIRST;
        }

        // Check whether the bottom was reached
        var specs = this._commitOutput.target;
        var startSpecIndex = _lookupSpecByViewSequence(specs, this._viewSequence, true);
        var sequenceNode = this._viewSequence;
        var spec;
        while (sequenceNode && sequenceNode.get()) {
            spec = _lookupSpecByViewSequence(specs, sequenceNode, false, startSpecIndex);
            if (!spec || spec.trueSizeRequested) {
                return Bounds.NONE;
            }
            sequenceNode = sequenceNode.getNext();
        }

        // When the last item is still partially visible, then the end is not
        // yet reached.
        var specOffset = spec.transform[12 + this._direction];
        var specSize = spec.size[this._direction];
        if ((specOffset + specSize) > size[this._direction]) {
            return Bounds.NONE;
        }

        // When both top and bottom reached, choose top, otherwise bottom
        if (this._nodes.endReached(true)) {
            return Bounds.FIRST;
        }
        else {
            this._scroll.lastScrollOffset = (size[this._direction] - (specOffset + specSize)) + scrollOffset;
            return Bounds.LAST;
        }
    }

    /**
     * When the boundaries are reached, set a spring which pulls on the particle
     * and ensures that the boundary is not exceeded.
     */
    function _updateEdgeSpring(edgeSpringOffset) {

        // Update edge-spring
        if (edgeSpringOffset === this._scroll.edgeSpringOffset) {
            return;
        }
        this._scroll.edgeSpringOffset = edgeSpringOffset;
        if (edgeSpringOffset === undefined) {
            if (this._scroll.edgeSpringForceId) {
                this._scroll.pe.detach(this._scroll.edgeSpringForceId);
                this._scroll.edgeSpringForceId = undefined;
                console.log('disabled edge-spring');
            }
        }
        else {
            if (!this._scroll.edgeSpringForceId) {
                this._scroll.edgeSpringForceId = this._scroll.pe.attach(this._scroll.edgeSpringForce, this._scroll.particle);
            }
            this._scroll.edgeSpringVector.set([edgeSpringOffset, 0, 0]);
            console.log('setting edge-spring to: ' + edgeSpringOffset);
            _verifyIntegrity.call(this);
        }
    }

    /**
     * When the boundaries are reached, set a spring which pulls on the particle
     * and ensures that the boundary is not exceeded.
     */
    function _updateBounds(size, scrollOffset) {

        // Check whether the top or bottom has been reached (0: top, 1: bottom)
        var boundsReached = _boundsReached.call(this, size, scrollOffset);
        if (this._scroll.boundsReached !== boundsReached) {
            this._scroll.boundsReached = boundsReached;
            console.log('bounds reached changed: ' + boundsReached);
        }

        // Calculate new edge spring offset
        var edgeSpringOffset;
        if (this._scroll.boundsReached === Bounds.FIRST) {
            edgeSpringOffset = 0;
        } else if (this._scroll.boundsReached === Bounds.LAST) {
            edgeSpringOffset = this._scroll.lastScrollOffset;
        }

        // Update the edge spring
        _updateEdgeSpring.call(this, edgeSpringOffset);
    }

    /**
     * Integrates the scroll-delta ino the particle position.
     */
    function _integrateScrollDelta() {

        // Get offset
        var oldOffset = this._scroll.particle.getPosition1D();
        if (!this._scroll.scrollDelta) {
            return oldOffset + this._scroll.moveOffset;
        }
        var newOffset = oldOffset + this._scroll.scrollDelta;

        // Ensure that the new position doesn't exceed the boundaries
        if (this._scroll.boundsReached === Bounds.FIRST){
            newOffset = 0;
        } else if (this._scroll.boundsReached === Bounds.LAST){
            newOffset = Math.max(this._scroll.lastScrollOffset, newOffset);
        }

        // Integrate delta and update particle
        this._scroll.particle.setPosition1D(newOffset);
        this._scroll.particle.setVelocity1D(0);
        this._scroll.scrollDelta = 0;

        // When the offset as adjusted (because a boundary was reached), return
        // true so that the layout-function re-layouts.
        return newOffset + this._scroll.moveOffset;
    }

    /**
     * Executes the layout and updates the state of the scrollview.
     */
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

        // Mark non-invalidated nodes for removal
        this._nodes.removeNonInvalidatedNodes(this.options.removeSpec, this.options.showOpacity);

        // Calculate the spec-output
        this._commitOutput.target = this._nodes.buildSpecAndDestroyUnrenderedNodes(this._direction);

        // Normalize scroll offset so that the current viewsequence node is as close to the
        // top as possible and the layout function will need to process the least amount
        // of renderables.
        _normalizeScrollOffset.call(this);

        // Update bounds
        _updateBounds.call(this, size, scrollOffset);

        // Integrate the scroll-delta into the particle position.
        var newOffset = _integrateScrollDelta.call(this);
        if (newOffset !== scrollOffset) {
            _layout.call(this, size, newOffset);
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
        _verifyIntegrity.call(this);

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
        }
        else {
            this._commitOutput.target = this._nodes.buildSpecAndDestroyUnrenderedNodes(this._direction);
            _normalizeScrollOffset.call(this);
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

    module.exports = ScrollView;
});

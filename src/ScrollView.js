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
    var FlowLayoutNode = require('./FlowLayoutNode');
    var LayoutNodeManager = require('./LayoutNodeManager');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Transform = require('famous/core/Transform');
    var EventHandler = require('famous/core/EventHandler');
    var Vector = require('famous/math/Vector');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Particle = require('famous/physics/bodies/Particle');
    var Drag = require('famous/physics/forces/Drag');
    var Spring = require('famous/physics/forces/Spring');
    var ScrollSync = require('famous/inputs/ScrollSync');

    /**
     * Boudary reached detection
     */
    var Bounds = {
        NONE: 0,
        PREV: 1, // top
        NEXT: 2, // bottom
        BOTH: 3
    };

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:ScrollView
     */
    function ScrollView(options, createNodeFn) {
        FlowLayoutController.call(this, ScrollView.DEFAULT_OPTIONS, new LayoutNodeManager(FlowLayoutNode, _initLayoutNode.bind(this)));
        if (options) {
            this.setOptions(options);
        }

        // Scrolling
        this._scroll = {
            activeTouches: [],
            scrollDelta: 0,
            // physics-engine to use for scrolling
            pe: new PhysicsEngine(),
            // particle that represents the scroll-offset
            particle: new Particle({
                position: [0, 0]
            }),
            // drag-force that slows the particle down after a "flick"
            dragForce: new Drag(this.options.scrollDrag)
        };

        // Diagnostics
        this._debug = {
            layoutCount: 0,
            logging: true
        };

        // Configure physics engine with particle and drag
        this._scroll.pe.addBody(this._scroll.particle);
        //this._scroll.dragForceId = this._scroll.pe.attach(this._scroll.dragForce, this._scroll.particle);
        this._springs = {};
        _createSpring.call(this, 'scroll', this.options.scrollSpring);
        _createSpring.call(this, 'move', this.options.moveSpring);

        // Setup input event handler
        this._eventInput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);

        // Listen to touch events
        this._eventInput.on('touchstart', _touchStart.bind(this));
        this._eventInput.on('touchmove', _touchMove.bind(this));
        this._eventInput.on('touchend', _touchEnd.bind(this));
        this._eventInput.on('touchcancel', _touchEnd.bind(this));

        // Listen to mouse-wheel events
        this._scrollSync = new ScrollSync(this.options.scrollSync);
        this._eventInput.pipe(this._scrollSync);
        //this._scrollSync.on('start', _moveStart.bind(this, this._scrollSync));
        this._scrollSync.on('update', _scrollUpdate.bind(this));
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
    ScrollView.prototype = Object.create(FlowLayoutController.prototype);
    ScrollView.prototype.constructor = ScrollView;

    ScrollView.DEFAULT_OPTIONS = {
        useContainer: false,
        offsetRounding: 0.2,
        scrollDrag: {
            strength : 0.001
        },
        scrollSpring: {
            dampingRatio: 0.8,
            period: 300
        },
        moveSpring: {
            dampingRatio: 1.0,
            period: 300
        },
        scrollSync: {
            scale: 0.1
        },
        paginated: false,
        //paginationEnergyThresshold: 0.001,
        reverse: true,
        touchMoveDirectionThresshold: undefined // 0..1
    };

    /**
     * Called whenever a layout-node is created/re-used. Initializes
     * the node with the `insertSpec` if it has been defined and enabled
     * locking of the x/y translation so that the x/y position of the renderable
     * is immediately updated when the user scrolls the view.
     */
    function _initLayoutNode(node, spec) {
        node.setOptions({
            spring: this.options.nodeSpring
        });
        if (!spec && this.options.insertSpec) {
            node.setSpec(this.options.insertSpec);
        }
        if (!spec && !this.options.insertSpec) {
            node.lock('translate', true, true);
        }
        else {
            node.lock('translate', true, false);
        }
    }

    /**
     * Helper function for logging debug statements to the console.
     */
    function _log(args) {
        if (!this._debug.logging) {
            return;
        }
        var message = this._debug.layoutCount + ': ';
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if ((arg instanceof Object) || (arg instanceof Array)) {
                message += JSON.stringify(arg);
            }
            else {
                message += arg;
            }
        }
        console.log(message);
    }

    /**
     * Helper function to aid development and find bugs.
     */
    function _verifyIntegrity(phase) {
        phase = phase ? ' (' + phase + ')' : '';
        if ((this._scroll.scrollDelta !== undefined) && isNaN(this._scroll.scrollDelta)) {
            throw 'invalid scrollDelta: ' + this._scroll.scrollDelta + phase;
        }
        for (var key in this._springs) {
            var spring = this._springs[key];
            if ((spring.value !== undefined) && isNaN(spring.value)) {
                throw 'invalid ' + key + ' spring offset: ' + spring.value + phase;
            }
        }
        if (isNaN(this._scroll.particle.getVelocity1D(0))) {
            throw 'invalid particle velocity: ' + this._scroll.particle.getVelocity1D(0) + phase;
        }
        if (isNaN(this._scroll.particle.getPosition1D(0))) {
            throw 'invalid particle position: ' + this._scroll.particle.getPosition1D(0) + phase;
        }
    }

    /**
     * Creates a spring which acts upon the scroll offset particle
     */
    function _createSpring(name, options) {
        var spring = {
            vector: new Vector([0, 0, 0]),
            force: new Spring(options)
        };
        spring.force.setOptions({ anchor: spring.vector });
        this._springs[name] = spring;
    }

    /**
     * Sets the value for the spring, or set to `undefined` to disable the spring
     */
    function _setSpring(name, value) {
        if (value !== undefined) {
            value = _roundScrollOffset.call(this, value);
        }
        var spring = this._springs[name];
        if (spring.value === value) {
            return undefined;
        }
        spring.value = value;
        if (value === undefined) {
            if (spring.forceId !== undefined) {
                this._scroll.pe.detach(spring.forceId);
                spring.forceId = undefined;
                _log.call(this, 'disabled ', name, '-spring');
                return false;
            }
        }
        else {
            if (spring.forceId === undefined) {
                spring.forceId = this._scroll.pe.attach(spring.force, this._scroll.particle);
            }
            spring.vector.set([value, 0, 0]);
            this._scroll.pe.wake();
            _log.call(this, 'setting ', name, '-spring to: ', value);
            return true;
        }
        return undefined;
    }

    /**
     * Gets the current spring-value.
     */
    function _getSpring(name) {
        var spring = this._springs[name];
        return spring ? spring.value : undefined;
    }

    /**
     * Called whenever the user starts moving the scroll-view, using
     * touch gestures.
     */
    function _touchStart(event) {
        this._eventOutput.emit('touchstart', event);

        // Process touch
        var oldTouchesCount = this._scroll.activeTouches.length;
        for (var i = 0; i < event.changedTouches.length; i++) {
            var changedTouch = event.changedTouches[i];
            var current = [changedTouch.clientX, changedTouch.clientY];
            var time = Date.now();
            var touch = {
                id: changedTouch.identifier,
                start: current,
                current: current,
                prev: current,
                time: time,
                prevTime: time
            };
            this._scroll.activeTouches.push(touch);
        }

        // Reset any programmatic scrollTo request when the user is doing stuff
        this._scroll.scrollToSequence = undefined;

        // The first time a touch new touch gesture has arrived, emit event
        if (!oldTouchesCount && this._scroll.activeTouches.length) {
            _setParticle.call(this, undefined, 0, 'touchStart'); // reset particle velocity
            this._scroll.moveToStartPosition = this._scroll.particle.getPosition1D();
            _setSpring.call(this, 'move', this._scroll.moveToStartPosition);
            this._eventOutput.emit('scrollstart', this._scroll.activeTouches[0]);
        }
    }

    /**
     * Called whenever the user is moving his/her fingers to scroll the view.
     * Updates the moveOffset so that the scroll-offset on the view is updated.
     */
    function _touchMove(event) {
        this._eventOutput.emit('touchmove', event);

        // Reset any programmatic scrollTo request when the user is doing stuff
        this._scroll.scrollToSequence = undefined;

        // Process the touch event
        var primaryTouch;
        for (var i = 0; i < event.changedTouches.length; i++) {
            var changedTouch = event.changedTouches[i];
            for (var j = 0; j < this._scroll.activeTouches.length; j++) {
                var touch = this._scroll.activeTouches[j];
                if (touch.id === changedTouch.identifier) {

                    // When a thresshold is configured, check whether the move operation (x/y ratio)
                    // lies within the thresshold. A move of 10 pixels x and 10 pixels y is considered 45 deg,
                    // which corresponds to a thresshold of 0.5.
                    var moveDirection = Math.atan2(
                        Math.abs(changedTouch.clientY - touch.prev[1]),
                        Math.abs(changedTouch.clientX - touch.prev[0])) / (Math.PI / 2.0);
                    var directionDiff = Math.abs(this._direction - moveDirection);
                    if ((this.options.touchMoveDirectionThresshold === undefined) || (directionDiff <= this.options.touchMoveDirectionThresshold)){
                        touch.prev = touch.current;
                        touch.current = [changedTouch.clientX, changedTouch.clientY];
                        touch.prevTime = touch.time;
                        touch.direction = moveDirection;
                        touch.time = Date.now();
                        primaryTouch = (j === 0) ? touch : undefined;
                    }
                }
            }
        }

        // Update move offset and emit event
        if (primaryTouch) {
            var delta = primaryTouch.current[this._direction] - primaryTouch.start[this._direction];
            _setSpring.call(this, 'move', this._scroll.moveToStartPosition + delta);
            this._eventOutput.emit('scrollmove', this._scroll.activeTouches[0]);
            //_verifyIntegrity.call(this, 'touchMove');
        }
    }

    /**
     * Called whenever the user releases his fingers and the touch gesture
     * has completed. This will set the new position and if the user used a 'flick'
     * gesture give the scroll-offset particle a velocity and momentum into a
     * certain direction.
     */
    function _touchEnd(event) {
        this._eventOutput.emit('touchend', event);

        // Reset any programmatic scrollTo request when the user is doing stuff
        this._scroll.scrollToSequence = undefined;

        // Remove touch
        var primaryTouch = this._scroll.activeTouches.length ? this._scroll.activeTouches[0] : undefined;
        for (var i = 0; i < event.changedTouches.length; i++) {
            var changedTouch = event.changedTouches[i];
            for (var j = 0; j < this._scroll.activeTouches.length; j++) {
                var touch = this._scroll.activeTouches[j];
                if (touch.id === changedTouch.identifier) {

                    // Remove touch
                    this._scroll.activeTouches.splice(j, 1);

                    // When a different touch now becomes the primary touch, update
                    // its start position to match the current move offset.
                    if ((j === 0) && this._scroll.activeTouches.length) {
                        var newPrimaryTouch = this._scroll.activeTouches[0];
                        newPrimaryTouch.start[0] = newPrimaryTouch.current[0] - (touch.current[0] - touch.start[0]);
                        newPrimaryTouch.start[1] = newPrimaryTouch.current[1] - (touch.current[1] - touch.start[1]);
                    }
                    break;
                }
            }
        }

        // Wait for all fingers to be released from the screen before resetting the move-spring
        if (this._scroll.activeTouches.length) {
            return;
        }

        // Disable the move-spring
        this._scroll.moveToStartPosition = undefined;
        _setSpring.call(this, 'move', undefined);
        this._isDirty = true;

        // Emit end event
        this._eventOutput.emit('scrollend', primaryTouch);
    }

    /**
     * Called whenever the user is scrolling the view using either a mouse
     * scroll wheel or a track-pad.
     */
    function _scrollUpdate(event) {
        //this._scroll.scrollDelta += Array.isArray(event.delta) ? event.delta[this._direction] : event.delta;
        //_setParticle.call(this, undefined, 0, 'scrollUpdate');
        //this._scroll.scrollToSequence = undefined;
        //console.log('scrollDelta: ' + this._scroll.scrollDelta);
    }

    /**
     * Helper function which rounds the scroll-offset to ensure it reaches an end-state and doesn't
     * move infinitely.
     */
    function _roundScrollOffset(scrollOffset) {
        return Math.round(scrollOffset / this.options.offsetRounding) * this.options.offsetRounding;
    }

    /**
     * Updates the scroll offset particle.
     */
    function _setParticle(position, velocity, phase) {
        phase = phase ? ' (' + phase + ')' : '';
        if (position !== undefined) {
            var oldPosition = this._scroll.particle.getPosition1D();
            this._scroll.particle.setPosition1D(position);
            _log.call(this, 'setParticle.position: ', position, ' (old: ', oldPosition, ', delta: ', position - oldPosition, ')', phase);
        }
        if (velocity !== undefined) {
            var oldVelocity = this._scroll.particle.getVelocity1D();
            this._scroll.particle.setVelocity1D(velocity);
            _log.call(this, 'setParticle.velocity: ', velocity, ' (old: ', oldVelocity, ', delta: ', velocity - oldVelocity, ')', phase);
        }
    }

    /**
     * Get the in-use scroll-offset.
     */
    function _calcScrollOffset() {

        // When scrolling using the mouse-wheel, halt at the boundary entirely
        /*if ((this._scroll.scrollDelta > 0) && (this._scroll.boundsReached & Bounds.PREV)) {
            _log.call(this, 'ignoring scroll-delta, top-reached: ' + this._scroll.scrollDelta);
            this._scroll.scrollDelta = 0;
        } else if ((this._scroll.scrollDelta < 0) && (this._scroll.boundsReached & Bounds.NEXT)) {
            _log.call(this, 'ignoring scroll-delta, bottom-reached: ' + this._scroll.scrollDelta);
            this._scroll.scrollDelta = 0;
        }*/

        // Calculate new offset
        //var particlePosition = _roundScrollOffset.call(this, this._scroll.particle.getPosition1D());
        //return particlePosition + this._scroll.moveOffset[this._direction] + this._scroll.scrollDelta;
        return _roundScrollOffset.call(this, this._scroll.particle.getPosition1D());
    }

    /**
     * Helper function that calculates the prev layed out height.
     */
    function _calcPrevHeight() {
        var height = 0;
        this._nodes.forEach(function(node) {
            if ((node.scrollLength === undefined) || node.trueSizeRequested) {
                height = undefined; // can't determine height
                return true;
            }
            height += node.scrollLength;
        }.bind(this), false);
        return height;
    }

    /**
     * Helper function that calculates the next layed out height.
     */
    function _calcNextHeight() {
        var height = 0;
        this._nodes.forEach(function(node) {
            if ((node.scrollLength === undefined) || node.trueSizeRequested) {
                height = undefined; // can't determine height
                return true;
            }
            height += node.scrollLength;
        }.bind(this), true);
        return height;
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
    function _calcBounds(size, scrollOffset) {

        // Local data
        var prevHeight;
        var nextHeight;

        // 1. Check whether primary boundary has been reached
        if (this.options.reverse) {
            nextHeight = _calcNextHeight.call(this);
            if ((nextHeight !== undefined) && ((scrollOffset + nextHeight) < size[this._direction])) {
                this._scroll.boundsReached = Bounds.NEXT;
                this._scroll.springPosition = size[this._direction] - nextHeight;
                return;
            }
            prevHeight = _calcPrevHeight.call(this);
        }
        else {
            prevHeight = _calcPrevHeight.call(this);
            if ((prevHeight !== undefined) && ((scrollOffset - prevHeight) > 0)) {
                this._scroll.boundsReached = Bounds.PREV;
                this._scroll.springPosition = prevHeight;
                return;
            }
            nextHeight = _calcNextHeight.call(this);
        }

        // 2. When the rendered height is smaller than the total height,
        //    then lock to the primary bounds
        var totalHeight;
        if ((nextHeight !== undefined) && (prevHeight !== undefined)) {
            totalHeight = prevHeight + nextHeight;
        }
        if ((totalHeight !== undefined) && (totalHeight < size[this._direction])) {
            this._scroll.boundsReached = Bounds.BOTH;
            this._scroll.springPosition = this.options.reverse ? size[this._direction] - nextHeight : prevHeight;
            return;
        }

        // 3. Check if secondary bounds has been reached
        if (this.options.reverse) {
            if ((prevHeight !== undefined) && ((scrollOffset - prevHeight) > 0)) {
                this._scroll.boundsReached = Bounds.PREV;
                this._scroll.springPosition = prevHeight;
                return;
            }
        }
        else {
            if ((nextHeight !== undefined) && ((scrollOffset + nextHeight) < size[this._direction])){
                this._scroll.boundsReached = Bounds.NEXT;
                this._scroll.springPosition = size[this._direction] - nextHeight;
                return;

            }
        }

        // No bounds reached
        this._scroll.boundsReached = Bounds.NONE;
        this._scroll.springPosition = undefined;
    }

    /**
     * Calculates the scrollto-offset to which the spring is set.
     */
    function _calcScrollToOffset(size, scrollOffset) {
        if (!this._scroll.scrollToSequence) {
            return;
        }

        // 1. When boundary is reached, stop scrolling in that direction
        if ((this._scroll.boundsReached === Bounds.BOTH) ||
            (!this._scroll.scrollToDirection && (this._scroll.boundsReached === Bounds.PREV)) ||
            (this._scroll.scrollToDirection && (this._scroll.boundsReached === Bounds.NEXT))) {
            this._scroll.scrollToSequence = undefined;
            return;
        }

        // 2. Find the node to scroll to
        var foundNode;
        var scrollToOffset = 0;
        this._nodes.forEach(function(node) {
            if (node.scrollLength === undefined) {
                return true;
            }
            if (node._viewSequence === this._scroll.scrollToSequence) {
                foundNode = node;
                return true;
            }
            scrollToOffset -= node.scrollLength;
        }.bind(this), true);
        if (!foundNode) {
            scrollToOffset = 0;
            this._nodes.forEach(function(node) {
                if (node.scrollLength === undefined) {
                    return true;
                }
                scrollToOffset += node.scrollLength;
                if (node._viewSequence === this._scroll.scrollToSequence) {
                    foundNode = node;
                    return true;
                }
            }.bind(this), false);
        }
        if (foundNode) {
            this._scroll.springPosition = scrollToOffset;
            return;
        }

        // 3. When node not found, set the spring to a position into that direction
        if (this._scroll.scrollToDirection) {
            this._scroll.springPosition = scrollOffset - size[this._direction];
        }
        else {
            this._scroll.springPosition = scrollOffset + size[this._direction];
        }
    }

    /**
     * Snaps to a page when paginanation is enabled and the energy of the particle
     * is below the thesshold.
     */
    function _snapToPage(size, scrollOffset) {

        // Check whether pagination is active
        if (!this.options.paginated ||
            (Math.abs(this._scroll.particle.getEnergy()) > this.options.paginationEnergyThresshold) ||
            (this._scroll.springPosition !== undefined) ||
            (_getSpring.call(this, 'move') !== undefined)) {
            return;
        }

        // Local data
        var pageOffset = scrollOffset;
        var pageLength;
        var hasNext;

        // Lookup page in previous direction
        var bound = this.options.reverse ? size[this._direction] : 0;
        this._nodes.forEach(function(node) {
            if (node.scrollLength !== 0) {
                if ((pageOffset <= bound) || (node.scrollLength === undefined)) {
                    return true;
                }
                hasNext = (pageLength !== undefined);
                pageLength = node.scrollLength;
                pageOffset -= node.scrollLength;
            }
        }.bind(this), false);

        // Lookup page in next direction
        if (pageLength === undefined) {
            this._nodes.forEach(function(node) {
                if (node.scrollLength !== 0) {
                    if (node.scrollLength === undefined) {
                        return true;
                    }
                    hasNext = (pageLength !== undefined);
                    if (hasNext) {
                        if ((pageOffset + pageLength) > bound) {
                            return true;
                        }
                        pageOffset += pageLength;
                    }
                    pageLength = node.scrollLength;
                }
            }.bind(this), true);
        }
        if (!pageLength) {
            return;
        }

        // Determine snap spring-position
        var boundOffset = pageOffset - bound;
        if (!hasNext || (Math.abs(boundOffset) < Math.abs(boundOffset + pageLength))) {
            this._scroll.springPosition = (scrollOffset - pageOffset) + (this.options.reverse ? size[this._direction] : 0);
            _log.call(this, 'setting snap-spring to #1: ', this._scroll.springPosition, ', scrollOffset: ' + scrollOffset);
        }
        else {
            this._scroll.springPosition = (scrollOffset - (pageOffset + pageLength)) + (this.options.reverse ? size[this._direction] : 0);
            _log.call(this, 'setting snap-spring to #2: ', this._scroll.springPosition, ', scrollOffset: ' + scrollOffset);
        }
    }

    /**
     * Normalizes the view-sequence node so that the view-sequence is near to 0.
     */
    function _normalizePrevViewSequence(size, scrollOffset) {
        this._nodes.forEach(function(node) {
            if ((node.scrollLength === undefined) || node.trueSizeRequested) {
                return true;
            }
            if (scrollOffset < 0){
                return true;
            }
            this._viewSequence = node._viewSequence;
            scrollOffset -= node.scrollLength;
            _log.call(this, 'normalized prev node with length: ', node.scrollLength, ', scrollOffset: ', scrollOffset);
        }.bind(this), false);
        return scrollOffset;
    }
    function _normalizeNextViewSequence(size, scrollOffset) {
        var prevScrollLength;
        this._nodes.forEach(function(node) {
            if ((node.scrollLength === undefined) || node.trueSizeRequested) {
                return true;
            }
            if (prevScrollLength !== undefined) {
                prevScrollLength = node.scrollLength;
                if ((scrollOffset + prevScrollLength) >= 0){
                    return true;
                }
                this._viewSequence = node._viewSequence;
                scrollOffset += prevScrollLength;
                _log.call(this, 'normalized next node with length: ', prevScrollLength, ', scrollOffset: ', scrollOffset);
            }
            prevScrollLength = node.scrollLength;
        }.bind(this), true);
        return scrollOffset;
    }
    function _normalizeViewSequence(size, scrollOffset) {

        // Don't normalize when moving
        if (_getSpring.call(this, 'move') !== undefined) {
            return scrollOffset;
        }

        // 1. Normalize in primary direction
        var normalizedScrollOffset = scrollOffset;
        if (this.options.reverse) {
            normalizedScrollOffset = _normalizeNextViewSequence.call(this, size, scrollOffset);
        }
        else {
            normalizedScrollOffset = _normalizePrevViewSequence.call(this, size, scrollOffset);
        }

        // 2. Normalize in secondary direction
        if (normalizedScrollOffset === scrollOffset) {
            if (this.options.reverse) {
                normalizedScrollOffset = _normalizePrevViewSequence.call(this, size, scrollOffset);
            }
            else {
                normalizedScrollOffset = _normalizeNextViewSequence.call(this, size, scrollOffset);
            }
        }

        // Adjust particle and springs
        if (normalizedScrollOffset !== scrollOffset) {
            var delta = normalizedScrollOffset - scrollOffset;

            // Adjust particle
            _setParticle.call(this, this._scroll.particle.getPosition1D() + delta, undefined, 'normalize');

            // Adjust scroll spring
            if (this._scroll.springPosition !== undefined) {
                this._scroll.springPosition += delta;
            }

            // Adjust move spring
            if (this._scroll.moveToStartPosition !== undefined) {
                this._scroll.moveToStartPosition += delta;
            }
            var scrollSpring = _getSpring.call(this, 'move');
            if (scrollSpring !== undefined) {
                scrollSpring += delta;
                _setSpring.call(this, 'move', scrollSpring);
            }
        }
        return normalizedScrollOffset;
    }

    /**
     * Integrates the scroll-delta (mouse-wheel) ino the particle position.
     */
    /*function _integrateScrollDelta(scrollOffset) {

        // Check if we need to integrate
        if (!this._scroll.scrollDelta) {
            return scrollOffset;
        }

        // Ensure that the new position doesn't exceed the boundaries
        var newOffset = scrollOffset - this._scroll.moveOffset[this._direction];
        if (this._scroll.boundsReached & Bounds.PREV){
            newOffset = 0;
        } else if (this._scroll.boundsReached & Bounds.NEXT){
            newOffset = Math.max(this._scroll.springPosition, newOffset);
        }

        // Integrate delta and update particle
        _setParticle.call(this, newOffset, 0, 'integrateScrollDelta');
        this._scroll.scrollDelta = 0;

        // When the offset as adjusted (because a boundary was reached), return
        // true so that the layout-function re-layouts.
        return newOffset + this._scroll.moveOffset[this._direction];
    }*/


        /*function _getVisiblePercentage(spec) {
        var specLeft = spec.transform[12];
        var specTop = spec.transform[13];
        var specSize = spec.size;
        var left = Math.max(0, specLeft);
        var top = Math.max(0, specTop);
        var right = Math.min(this._contextSizeCache[0], specLeft + specSize[0]);
        var bottom = Math.min(this._contextSizeCache[1], specTop + specSize[1]);
        var width = right - left;
        var height = bottom - top;
        var volume = width * height;
        var totalVolume = spec.size[0] * spec.size[1];
        return totalVolume ? (volume / totalVolume) : 0;
    }

    function _getVisibleItem(spec) {
        return {
            spec: {
                opacity: spec.opacity,
                align: spec.align,
                origin: spec.origin,
                size: spec.size,
                transform: spec.transform
            },
            renderNode: spec.renderNode,
            visiblePerc: _getVisiblePercentage.call(this, spec)
        };
    }*/

    /**
     * Get the first visible item that meets the visible percentage criteria.
     * The percentage indicates how many pixels should at least visible before
     * the renderable is considered visible.
     * `visible percentage = (width * height) / (visible width * visible height)`
     *
     * @param {Number} [visiblePerc] percentage in the range of 0..1 (default: 0.99)
     * @return {Object} item object or undefined
     */
    ScrollView.prototype.getFirstVisibleItem = function(visiblePerc) {
        var scrollOffset = _calcScrollOffset.call(this);
        var next = scrollOffset <= 0;
        var foundNode;
        this._nodes.forEach(function(node) {
            if (node.scrollLength === undefined) {
                return true;
            }
            scrollOffset += next ? node.scrollLength : -node.scrollLength;
            if ((next && (scrollOffset > 0)) ||
                (!next && (scrollOffset <= 0))) {
                foundNode = node;
                return true;
            }
        }, next);
        return foundNode ? foundNode._viewSequence : undefined;
    };

    /**
     * Helper function that scrolls the view towards a view-sequence node.
     */
    function _scrollToSequence(viewSequence, next) {
        this._scroll.scrollToSequence = viewSequence;
        this._scroll.scrollToDirection = next;
        this._isDirty = true;
    }

    /**
     * Moves to the next node in the viewSequence.
     *
     * @param {Number} [amount] Amount of nodes to move
     * @return {ScrollView} this
     */
    ScrollView.prototype.scroll = function(amount) {

        // Get current scroll-position. When a previous call was made to
        // `scroll' or `scrollTo` and that node has not yet been reached, then
        // the amount is accumalated onto that scroll target.
        var viewSequence = this._scroll.scrollToSequence || this.getFirstVisibleItem() || this._viewSequence;
        if (!viewSequence) {
            return this;
        }

        // When the first renderable is partially shown, then treat `-1` (previous)
        // as `show the current renderable fully`.
        if (!this._scroll.scrollToSequence && (amount < 0) && (_calcScrollOffset.call(this) < 0)){
            amount += 1;
        }

        // Find scroll target
        for (var i = 0; i < Math.abs(amount); i++) {
            var nextViewSequence = (amount > 0) ? viewSequence.getNext() : viewSequence.getPrevious();
            if (nextViewSequence) {
                viewSequence = nextViewSequence;
            }
            else {
                break;
            }
        }
        _scrollToSequence.call(this, viewSequence, amount >= 0);
        return this;
    };

    /**
     * Scroll to the given renderable in the datasource.
     *
     * @param {RenderNode} [node] renderable to scroll to
     * @return {LayoutController} this
     */
    ScrollView.prototype.scrollTo = function(node) {

        // Verify arguments and state
        if (!this._viewSequence || !node) {
            return this;
        }

        // Check current node
        if (this._viewSequence.get() === node) {
            _scrollToSequence.call(this, this._viewSequence, true);
            return this;
        }

        // Find the sequence-node that we want to scroll to.
        // We look at both directions at the same time.
        // The first match that is encountered, that direction is chosen.
        var nextSequence = this._viewSequence.getNext();
        var prevSequence = this._viewSequence.getPrevious();
        while ((nextSequence || prevSequence) && (nextSequence !== this._viewSequence)){
            var nextNode = nextSequence ? nextSequence.get() : undefined;
            if (nextNode === node) {
                _scrollToSequence.call(this, nextSequence, true);
                break;
            }
            var prevNode = prevSequence ? prevSequence.get() : undefined;
            if (prevNode === node) {
                _scrollToSequence.call(this, prevSequence, false);
                break;
            }
            nextSequence = nextNode ? nextSequence.getNext() : undefined;
            prevSequence = prevNode ? prevSequence.getPrevious() : undefined;
        }
        return this;
    };

    /**
     * Executes the layout and updates the state of the scrollview.
     */
    function _layout(size, scrollOffset) {

        // Track the number of times the layout-function was executed
        this._debug.layoutCount++;
        //_log.call(this, 'Layout, scrollOffset: ', scrollOffset, ', particle: ', this._scroll.particle.getPosition1D(), ', scrollDelta: ', this._scroll.scrollDelta);

        // Prepare for layout
        var layoutContext = this._nodes.prepareForLayout(
            this._viewSequence,     // first node to layout
            this._nodesById, {      // so we can do fast id lookups
                size: size,
                direction: this._direction,
                scrollOffset: scrollOffset,
                scrollStart: Math.min(scrollOffset, -size[this._direction]),
                scrollEnd: Math.max(scrollOffset, size[this._direction] * 2)
            }
        );

        // Layout objects
        if (this._layout.function) {
            this._layout.function(
                layoutContext,          // context which the layout-function can use
                this._layout.options    // additional layout-options
            );
        }
        _verifyIntegrity.call(this, 'layout.function');

        // Mark non-invalidated nodes for removal
        this._nodes.removeNonInvalidatedNodes(this.options.removeSpec);
        _verifyIntegrity.call(this, 'removeNonInvalidatedNodes');

        // Calculate the spec-output
        var result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
        _verifyIntegrity.call(this, 'buildSpecAndDestroyUnrenderedNodes');
        this._commitOutput.target = result.specs;
        if (result.modified || true) {
            this._eventOutput.emit('reflow', {
                target: this
            });
        }

        // Calculate the bounds reached
        _calcBounds.call(this, size, scrollOffset);
        _verifyIntegrity.call(this, 'calcBounds');

        // Update scroll-to spring
        _calcScrollToOffset.call(this, size, scrollOffset);
        _verifyIntegrity.call(this, 'calcScrollToOffset');

        // When pagination is enabled, snap to page
        _snapToPage.call(this, size, scrollOffset);
        _verifyIntegrity.call(this, 'snapToPage');

        // Normalize scroll offset so that the current viewsequence node is as close to the
        // top as possible and the layout function will need to process the least amount
        // of renderables.
        scrollOffset = _normalizeViewSequence.call(this, size, scrollOffset);
        _verifyIntegrity.call(this, 'normalizeViewSequence');

        // Update spring
        _setSpring.call(this, 'scroll', this._scroll.springPosition);
        _verifyIntegrity.call(this, 'setSpring: scroll');

        // Integrate the scroll-delta into the particle position.
        /*var newOffset = _roundScrollOffset.call(this, _integrateScrollDelta.call(this, scrollOffset));
        _verifyIntegrity.call(this, 'integrateScrollDelta');
        if (newOffset !== scrollOffset) {
            //console.log('re-layout after delta integration: ' + scrollOffset + ' != ' + newOffset);
            _layout.call(this, size, newOffset);
        }*/
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
        var scrollOffset = _calcScrollOffset.call(this);
        //_log.call(this, 'scrollOffset: ' + scrollOffset);

        // When the size or layout function has changed, reflow the layout
        if (size[0] !== this._contextSizeCache[0] ||
            size[1] !== this._contextSizeCache[1] ||
            this._isDirty ||
            this._nodes._trueSizeRequested ||
            this._scrollOffsetCache !== scrollOffset) {

            // Emit start event
            var eventData = {
                target: this,
                oldSize: this._contextSizeCache,
                size: size,
                oldScrollOffset: this._scrollOffsetCache,
                scrollOffset: scrollOffset,
                dirty: this._isDirty,
                trueSizeRequested: this._nodes._trueSizeRequested
            };
            this._eventOutput.emit('layoutstart', eventData);

            // When the layout has changed, and we are not just scrolling,
            // disable the locked state of the layout-nodes so that they
            // can freely transition between the old and new state.
            if (this._isDirty) {
                this._nodes.forEach(function(node) {
                    node.lock('translate', true, false); // keep lock enabled, but reset lock
                });
            }

            // Update state
            this._contextSizeCache[0] = size[0];
            this._contextSizeCache[1] = size[1];
            this._scrollOffsetCache = scrollOffset;
            this._isDirty = false;

            // Perform layout
            _layout.call(this, size, scrollOffset);

            // Emit end event
            this._eventOutput.emit('layoutend', eventData);
        }
        else {

            // Update output and optionally emit event
            var result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
            this._commitOutput.target = result.specs;
            if (result.modified) {
                this._eventOutput.emit('reflow', {
                    target: this
                });
            }
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

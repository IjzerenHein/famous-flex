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
 * Internal LayoutNode class used by `FlowLayoutController`.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var OptionsManager = require('famous/core/OptionsManager');
    var Transform = require('famous/core/Transform');
    var Vector = require('famous/math/Vector');
    var Particle = require('famous/physics/bodies/Particle');
    var Spring = require('famous/physics/forces/Spring');
    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var LayoutNode = require('./LayoutNode');

    /**
     * @class
     * @extends LayoutNode
     * @param {Object} renderNode Render-node which this layout-node represents
     * @param {Spec} spec Initial state
     * @param {Object} physicsEngines physics-engines to use
     * @alias module:FlowLayoutNode
     */
    function FlowLayoutNode(renderNode, spec) {
        LayoutNode.apply(this, arguments);

        if (!this.options) {
            this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
            this._optionsManager = new OptionsManager(this.options);
        }

        if (!this._pe) {
            this._pe = new PhysicsEngine();
        }

        this._options = {
            spring: {
                dampingRatio: 0.8,
                period: 300
            }
        };

        if (!this._properties) {
            this._properties = {
                /*opacity: undefined,
                size: undefined,
                origin: undefined,
                align: undefined,
                translate: undefined,
                skew: undefined,
                rotate: undefined,
                scale: undefined*/
            };
        }
        else {
            for (var propName in this._properties) {
                this._properties[propName].init = false;
            }
            delete this._locks;
        }
        _verifyIntegrity.call(this);

        this._endStateReached = false;
        if (spec) {
            this.setSpec(spec);
        }
        _verifyIntegrity.call(this);
    }
    FlowLayoutNode.prototype = Object.create(LayoutNode.prototype);
    FlowLayoutNode.prototype.constructor = FlowLayoutNode;

    FlowLayoutNode.DEFAULT_OPTIONS = {
        spring: {
            dampingRatio: 0.8,
            period: 300
        }
    };

    /**
     * Defaults
     */
    var DEFAULT = {
        opacity: 1,
        size: [0, 0],
        origin: [0, 0],
        align: [0, 0],
        scale: [1, 1, 1],
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
        skew: [0, 0, 0]
    };

    /**
     * Verifies that the integrity of the layout-node is oke.
     */
    function _verifyIntegrity() {
        var i;
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (prop.particle) {
                if (isNaN(prop.particle.getEnergy())) {
                    throw 'invalid particle energy: ' + propName;
                }
                var value = prop.particle.getPosition();
                for (i = 0; i < value.length; i++) {
                    if (isNaN(value[i])) {
                       throw 'invalid particle value: ' + propName + '(' + i + ')';
                    }
                }
                value = prop.endState.get();
                for (i = 0; i < value.length; i++) {
                    if (isNaN(value[i])) {
                       throw 'invalid endState value: ' + propName + '(' + i + ')';
                    }
                }
            }
        }
    }

    /**
     * Sets the configuration options
     */
    FlowLayoutNode.prototype.setOptions = function(options) {
        this._optionsManager.setOptions(options);
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (prop.force) {
                var springOptions = {};
                for (var key in this.options.spring) {
                    springOptions[key] = this.options.spring[key];
                }
                springOptions.anchor = prop.endState;
                prop.force.setOptions(springOptions);
            }
        }
        _verifyIntegrity.call(this);
        return this;
    };

    /**
     * Set the properties from a spec.
     */
    function _equalsXYZ(ar1, ar2) {
        return (ar1[0] === ar2[0]) && (ar1[1] === ar2[1]) && (ar1[2] === ar2[2]);
    }
    FlowLayoutNode.prototype.setSpec = function(spec) {
        _setPropertyValue.call(this, 'opacity', spec.opacity, DEFAULT.opacity, true);
        _setPropertyValue.call(this, 'size', spec.size, DEFAULT.size, true);
        _setPropertyValue.call(this, 'align', spec.align, DEFAULT.align, true);
        _setPropertyValue.call(this, 'origin', spec.origin, DEFAULT.origin, true);
        if (spec.transform) {
            var transform = Transform.interpret(spec.transform);
            _setPropertyValue.call(this, 'translate', transform.translate, DEFAULT.translate, true);
            _setPropertyValue.call(this, 'scale', transform.scale, DEFAULT.scale, true);
            _setPropertyValue.call(this, 'skew', transform.skew, DEFAULT.skew, true);
            _setPropertyValue.call(this, 'rotate', transform.rotate, DEFAULT.rotate, true);
        }
        else {
            _setPropertyValue.call(this, 'translate', undefined, DEFAULT.translate, true);
            _setPropertyValue.call(this, 'scale', undefined, DEFAULT.scale, true);
            _setPropertyValue.call(this, 'skew', undefined, DEFAULT.skew, true);
            _setPropertyValue.call(this, 'rotate', undefined, DEFAULT.rotate, true);
        }
    };

    /**
     * Reset the end-state. This function is called on all layout-nodes prior to
     * calling the layout-function. So that the layout-function starts with a clean slate.
     */
    FlowLayoutNode.prototype.reset = function() {
        if (this._invalidated) {
            for (var propName in this._properties) {
                this._properties[propName].invalidated = false;
            }
            this._invalidated = false;
        }
        this._spec.trueSizeRequested = false;
        this._scrollLength = undefined;
        _verifyIntegrity.call(this);
    };

    /**
     * Markes the node for removal.
     */
    FlowLayoutNode.prototype.remove = function(removeSpec) {

        // Transition to the remove-spec state
        if (removeSpec) {

            // Stop the particle from moving by setting the end-state
            // to the current particle state
            for (var propName in this._properties) {
                if (removeSpec[propName] === undefined) {
                    this._properties[propName].endState.set(
                        this._properties[propName].particle.position.get()
                    );
                    this._pe.wake();
                }
            }

            // Set end-state
            this.setSpec(removeSpec);
        }

        // Mark for removal
        this._removing = true;
        this._invalidated = false;
        _verifyIntegrity.call(this);
    };

    /**
     * Checks whether a property has reached its end-state.
     */
    var ENERGY_RESTTOLERANCE = 1e-4;
    var RESTTOLERANCE = {
        opacity:    1e-5,
        size:       0.1,
        origin:     1e-5,
        align:      1e-5,
        scale:      1e-5,
        translate:  0.1,
        rotate:     1e-5,
        skew:       1e-5
    };
    function _endStateReached(prop, propName) {

        // When the particle still has too much energy, state not reached
        var energy = prop.particle.getEnergy();
        var restTolerance = RESTTOLERANCE[propName];
        if (energy > ENERGY_RESTTOLERANCE) {
            //console.log('endstate not reached: ' + propName + ' - energy: ' + energy);
            return false;
        }

        // Check whether the current particle value, and end-state value are really close
        var curState = prop.particle.getPosition();
        var endState = prop.endState.get();
        if (endState.length !== curState.length) {
            //console.log('endstate not reached: ' + propName + ' - length !=');
            return false;
        }
        for (var i = 0; i < curState.length; i++) {
            if (Math.abs(curState[i] - endState[i]) > restTolerance) {
                //console.log('endstate not reached: ' + propName + ' - ' + curState[i] + ' != ' + endState[i]);
                return false;
            }
        }

        // End state reached
        return true;
    }

    /**
     * Helper function for getting the property value.
     */
    function _getPropertyValue(prop, def) {
        return (prop && prop.init) ? (prop.endStateReached ? prop.endState.get() : prop.particle.getPosition()) : def;
    }
    function _getOpacityValue() {
        var prop = this._properties.opacity;
        return (prop && prop.init) ? Math.max(0,Math.min(1, prop.particle.getPosition1D())) : undefined;
    }

    /**
     * Creates the render-spec
     */
    FlowLayoutNode.prototype.getSpec = function() {

        // Check whether any properties have reached their end-state.
        var endStateReached = true;
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (prop.init) {
                prop.endStateReached = _endStateReached.call(this, prop, propName);
                if (!prop.endStateReached) {
                    endStateReached = false;
                }
            }
        }

        // When the end state was reached, return the previous spec
        if (this._endStateReached && endStateReached) {
            if (this._invalidated) {
                return this._spec;
            }
            else {
                return undefined;
            }
        }
        this._endStateReached = endStateReached;

        // Build fresh spec
        this._spec.opacity = _getOpacityValue.call(this);
        this._spec.size = _getPropertyValue(this._properties.size, undefined);
        this._spec.align = _getPropertyValue(this._properties.align, undefined);
        this._spec.origin = _getPropertyValue(this._properties.origin, undefined);
        this._spec.transform = Transform.build({
            translate: _getPropertyValue(this._properties.translate, DEFAULT.translate),
            skew: _getPropertyValue(this._properties.skew, DEFAULT.skew),
            scale: _getPropertyValue(this._properties.scale, DEFAULT.scale),
            rotate: _getPropertyValue(this._properties.rotate, DEFAULT.rotate)
        });
        //if (this._spec.renderNode._debug) {
            //this._spec.renderNode._debug = false;
            console.log(JSON.stringify({
                opacity: this._spec.opacity,
                size: this._spec.size,
                align: this._spec.align,
                origin: this._spec.origin,
                transform: this._spec.transform
            }));
        //}

        _verifyIntegrity.call(this);
        return this._spec;
    };

    /**
     * Locks a property, or a specific array-dimension of the property
     * fixed to the end-state value. Use this to e.g. lock the x-translation
     * to a the fixed end-state, so that when scrolling the renderable sticks
     * to the x-axis and does not feel sluggish.
     */
    FlowLayoutNode.prototype.lock = function(property, lock, endStateReached) {

        // Update lock
        if (!this._locks) {
            this._locks = {};
        }
        this._locks[property] = lock;
        if (endStateReached !== undefined) {
            if (this._properties[property]) {
                this._properties[property].endStateReached = endStateReached;
            }
        }
    };

    /**
     * Set the content of the node
     *
     * @param {Object} set
     */
     function _setPropertyValue(propName, endState, defaultValue, initial) {

        // Check if end-state equals default-value, if so reset it to undefined
        if ((endState !== undefined) && (defaultValue !== undefined)) {
            if (Array.isArray(endState) && Array.isArray(defaultValue) && (endState.length === defaultValue.length)) {
                var same = true;
                for (var i = 0 ; i < endState.length; i++) {
                    if (endState[i] !== defaultValue[i]) {
                        same = false;
                        break;
                    }
                }
                endState = same ? undefined : endState;
            }
            else if (endState === defaultValue) {
                endState = undefined;
            }
        }

        // Get property
        var prop = this._properties[propName];

        // When property doesn't exist, and no end-state, nothing to do
        if ((endState === undefined) && (!prop || !prop.init)) {
            return;
        }

        // Update the property
        if (prop && prop.init) {
            prop.invalidated = true;
            prop.endState.set(endState || defaultValue);
            this._pe.wake();
            return;
        }

        // Create property if neccesary
        if (!prop) {
            prop = {
                particle: new Particle({
                    position: initial ? endState : defaultValue
                }),
                endState: new Vector(endState)
            };
            var springOptions = {};
            for (var key in this.options.spring) {
                springOptions[key] = this.options.spring[key];
            }
            springOptions.anchor = prop.endState;
            prop.force = new Spring(springOptions);
            this._pe.addBody(prop.particle);
            prop.forceId = this._pe.attach(prop.force, prop.particle);
            this._properties[propName] = prop;
        }
        else {
            prop.particle.setPosition(initial ? endState : defaultValue);
            prop.endState.set(endState);
            this._pe.wake();
        }
        prop.init = true;
        //prop.endStateReached = true;
        prop.invalidated = true;

        // huh
        /*if ((this._locks && this._locks[propName] && prop.endStateReached) || this.options.spring.disabled) {
            prop.particle.setPosition(defaultValue);
        }*/
    }
    FlowLayoutNode.prototype.set = function(set) {
        this._scrollLength = set.scrollLength;
        _setPropertyValue.call(this, 'opacity', set.opacity, DEFAULT.opacity, false);
        _setPropertyValue.call(this, 'align', set.align, DEFAULT.align, false);
        _setPropertyValue.call(this, 'origin', set.origin, DEFAULT.origin, false);
        _setPropertyValue.call(this, 'size', set.size, DEFAULT.size, false);
        _setPropertyValue.call(this, 'translate', set.translate, DEFAULT.translate, false);
        _setPropertyValue.call(this, 'skew', set.skew, DEFAULT.skew, false);
        _setPropertyValue.call(this, 'rotate', set.rotate, DEFAULT.rotate, false);
        _setPropertyValue.call(this, 'scale', set.scale, DEFAULT.scale, false);
        this._invalidated = true;
        this._removing = false;
        _verifyIntegrity.call(this);
    };

    module.exports = FlowLayoutNode;
});

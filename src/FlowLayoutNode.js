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
    var Transitionable = require('famous/transitions/Transitionable');

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
            this._properties = {};
        }
        else {
            for (var propName in this._properties) {
                this._properties[propName].init = false;
            }
        }
        _verifyIntegrity.call(this);

        this._endStateReached = false;
        this._initial = true;
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
        /*var i;
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
        }*/
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
    FlowLayoutNode.prototype.setSpec = function(spec) {
        if ((spec.opacity !== undefined) || this._removing) {
            _setPropertyValue.call(this, 'opacity', spec.opacity, DEFAULT.opacity);
        }
        if (spec.size|| this._removing) {
            _setPropertyValue.call(this, 'size', spec.size, DEFAULT.size);
        }
        if (spec.align|| this._removing) {
            _setPropertyValue.call(this, 'align', spec.align, DEFAULT.align);
        }
        if (spec.origin|| this._removing) {
            _setPropertyValue.call(this, 'origin', spec.origin, DEFAULT.origin);
        }
        if (spec.transform || this._removing) {
            var transform = spec.transform ? Transform.interpret(spec.transform) : {};
            _setPropertyValue.call(this, 'translate', transform.translate, DEFAULT.translate);
            _setPropertyValue.call(this, 'scale', transform.scale, DEFAULT.scale);
            _setPropertyValue.call(this, 'skew', transform.skew, DEFAULT.skew);
            _setPropertyValue.call(this, 'rotate', transform.rotate, DEFAULT.rotate);
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
        this.trueSizeRequested = false;
        _verifyIntegrity.call(this);
    };

    /**
     * Markes the node for removal.
     */
    FlowLayoutNode.prototype.remove = function(removeSpec) {

        // Transition to the remove-spec state
        this._removing = true;
        if (removeSpec) {
            this.setSpec(removeSpec);
        }

        // Mark for removal
        this._invalidated = false;
        _verifyIntegrity.call(this);
    };

    /**
     * Locks a property, or a specific array-dimension of the property
     * fixed to the end-state value. Use this to e.g. lock the x-translation
     * to a the fixed end-state, so that when scrolling the renderable sticks
     * to the x-axis and does not feel sluggish.
     */
    FlowLayoutNode.prototype.setDirectionLock = function(direction, value) {
        if (direction === undefined) {
            this._lockDirection = undefined;
        }
        else {
            this._lockDirection = direction;
            if (value !== undefined) {
                if (!this._lockTransitionable) {
                    this._lockTransitionable = new Transitionable(1);
                }
                this._lockTransitionable.halt();
                this._lockTransitionable.reset(value);
                if (value !== 1) {
                    this._lockTransitionable.set(1, {
                        duration: (1 - value) * 1000
                    });
                }
            }
        }
    };

    /**
     * Helper function for getting the property value.
     */
    function _getPropertyValue(prop, def) {
        return (prop && prop.init) ? prop.particle.getPosition() : def;
    }
    function _getOpacityValue() {
        var prop = this._properties.opacity;
        return (prop && prop.init) ? Math.max(0,Math.min(1, prop.particle.getPosition1D())) : undefined;
    }
    function _getTranslateValue(def) {
        var prop = this._properties.translate;
        if (!prop || !prop.init) {
            return def;
        }
        var position = prop.particle.getPosition();
        if (this._lockDirection !== undefined) {
            var value = position[this._lockDirection];
            var endState = prop.endState.get()[this._lockDirection];
            var lockValue = value + ((endState - value) * this._lockTransitionable.get());
            position = [position[0], position[1], position[2]];
            position[this._lockDirection] = lockValue;
        }
        return position;
    }

    /**
     * Creates the render-spec
     */
    FlowLayoutNode.prototype.getSpec = function() {

        // When the end state was reached, return the previous spec
        var endStateReached = this._pe.isSleeping();
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
        this._initial = false;
        this._spec.opacity = _getOpacityValue.call(this);
        this._spec.size = _getPropertyValue(this._properties.size, undefined);
        this._spec.align = _getPropertyValue(this._properties.align, undefined);
        this._spec.origin = _getPropertyValue(this._properties.origin, undefined);
        this._spec.transform = Transform.build({
            translate: _getTranslateValue.call(this, DEFAULT.translate),
            skew: _getPropertyValue(this._properties.skew, DEFAULT.skew),
            scale: _getPropertyValue(this._properties.scale, DEFAULT.scale),
            rotate: _getPropertyValue(this._properties.rotate, DEFAULT.rotate)
        });
        //if (this.renderNode._debug) {
            //this.renderNode._debug = false;
            /*console.log(JSON.stringify({
                opacity: this._spec.opacity,
                size: this._spec.size,
                align: this._spec.align,
                origin: this._spec.origin,
                transform: this._spec.transform
            }));*/
        //}

        _verifyIntegrity.call(this);
        return this._spec;
    };

    /**
     * Helper function to set the property of a node (e.g. opacity, translate, etc..)
     */
    function _setPropertyValue(propName, endState, defaultValue) {

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
            if (endState !== undefined) {
                prop.endState.set(endState);
            }
            else if (this._removing) {
                prop.endState.set(prop.particle.getPosition());
            }
            else {
                prop.endState.set(defaultValue);
            }
            this._pe.wake();
            return;
        }

        // Create property if neccesary
        if (!prop) {
            prop = {
                particle: new Particle({
                    position: this._initial ? endState : defaultValue
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
            prop.particle.setPosition(this._initial ? endState : defaultValue);
            prop.endState.set(endState);
            this._pe.wake();
        }
        prop.init = true;
        prop.invalidated = true;
    }
    FlowLayoutNode.prototype.set = function(set, size) {
        this._removing = false;
        this.scrollLength = set.scrollLength;
        _setPropertyValue.call(this, 'opacity', set.opacity, DEFAULT.opacity);
        _setPropertyValue.call(this, 'align', set.align, DEFAULT.align);
        _setPropertyValue.call(this, 'origin', set.origin, DEFAULT.origin);
        _setPropertyValue.call(this, 'size', set.size, size);
        _setPropertyValue.call(this, 'translate', set.translate, DEFAULT.translate);
        _setPropertyValue.call(this, 'skew', set.skew, DEFAULT.skew);
        _setPropertyValue.call(this, 'rotate', set.rotate, DEFAULT.rotate);
        _setPropertyValue.call(this, 'scale', set.scale, DEFAULT.scale);
        this._invalidated = true;
        _verifyIntegrity.call(this);
    };

    module.exports = FlowLayoutNode;
});

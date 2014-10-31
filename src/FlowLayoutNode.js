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
        },
        particleRounding: 0.001
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
     * Helper function which rounds a particle value to ensure it reaches an end-state and doesn't
     * move infinitely.
     */
    function _roundParticleValue(value, precision) {
        precision = precision || this.options.particleRounding;
        return Math.round(value / precision) * precision;
    }

    /**
     * Sets the configuration options
     */
    FlowLayoutNode.prototype.setOptions = function(options) {
        this._optionsManager.setOptions(options);
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (prop.force) {
                prop.force.setOptions(prop.force);
            }
        }
        _verifyIntegrity.call(this);
        return this;
    };

    /**
     * Set the properties from a spec.
     */
    FlowLayoutNode.prototype.setSpec = function(spec) {
        var set;
        if (spec.transform) {
            set = Transform.interpret(spec.transform);
        }
        if (!set) {
            set = {};
        }
        set.opacity = spec.opacity;
        set.size = spec.size;
        set.align = spec.align;
        set.origin = spec.origin;
        _set.call(this, set, DEFAULT.size);
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
        this.usesTrueSize = false;
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
        else {
            this._pe.sleep();
            this._endStateReached = true;
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
    function _getRoundedValue2D(prop, def, precision) {
        if (!prop || !prop.init) {
            return def;
        }
        var value = prop.particle.getPosition();
        return [
            _roundParticleValue.call(this, value[0], precision),
            _roundParticleValue.call(this, value[1], precision)
        ];
    }
    function _getRoundedValue3D(prop, def, precision) {
        if (!prop || !prop.init) {
            return def;
        }
        var value = prop.particle.getPosition();
        return [
            _roundParticleValue.call(this, value[0], precision),
            _roundParticleValue.call(this, value[1], precision),
            _roundParticleValue.call(this, value[2], precision)
        ];
    }
    function _getOpacityValue() {
        var prop = this._properties.opacity;
        return (prop && prop.init) ? _roundParticleValue.call(this, Math.max(0,Math.min(1, prop.particle.getPosition1D()))) : undefined;
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
            position = [
                _roundParticleValue.call(this, position[0]),
                _roundParticleValue.call(this, position[1]),
                _roundParticleValue.call(this, position[2])
            ];
            position[this._lockDirection] = _roundParticleValue.call(this, lockValue);
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
        this._spec.size = _getRoundedValue2D.call(this, this._properties.size, undefined, 0.1);
        this._spec.align = _getRoundedValue2D.call(this, this._properties.align, undefined);
        this._spec.origin = _getRoundedValue2D.call(this, this._properties.origin, undefined);
        var translate = _getTranslateValue.call(this, DEFAULT.translate);
        if (!this._properties.scale && !this._properties.rotate && !this._properties.skew) {
            this._spec.transform = Transform.translate(translate[0], translate[1], translate[2]);
        }
        else {
            this._spec.transform = Transform.build({
                translate: translate,
                skew: _getRoundedValue3D.call(this, this._properties.skew, DEFAULT.skew),
                scale: _getRoundedValue3D.call(this, this._properties.scale, DEFAULT.scale),
                rotate: _getRoundedValue3D.call(this, this._properties.rotate, DEFAULT.rotate)
            });
        }
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
    function _setPropertyValue(prop, propName, endState, defaultValue, immediate, isTranslate) {

        // Get property
        prop = prop || this._properties[propName];

        // Update the property
        if (prop && prop.init) {
            prop.invalidated = true;
            var value = defaultValue;
            if (endState !== undefined) {
                value = endState;
            }
            else if (this._removing) {
                value = prop.particle.getPosition();
            }
            prop.endState.set(value);
            if (isTranslate && (this._lockDirection !== undefined) && (this._lockTransitionable.get() === 1)) {
                immediate = true; // this is a bit dirty, it should check !_lockDirection for non changes as well before setting immediate to true
            }
            if (immediate) {
                prop.particle.setPosition(value);
                this._endStateReached = false;
            }
            else {
                this._pe.wake();
            }
            return;
        }

        // Create property if neccesary
        if (!prop) {
            prop = {
                particle: new Particle({
                    position: (this._initial || immediate) ? endState : defaultValue
                }),
                endState: new Vector(endState)
            };
            prop.force = new Spring(this.options.spring);
            prop.force.setOptions({
                anchor: prop.endState
            });
            this._pe.addBody(prop.particle);
            prop.forceId = this._pe.attach(prop.force, prop.particle);
            this._properties[propName] = prop;
        }
        else {
            prop.particle.setPosition((this._initial || immediate) ? endState : defaultValue);
            prop.endState.set(endState);
            if (!this._initial && !immediate) {
                this._pe.wake();
            }
        }
        prop.init = true;
        prop.invalidated = true;
    }

    /**
     * Get value if not equals.
     */
    function _getIfNE2D(a1, a2) {
        return ((a1[0] === a2[0]) && (a1[1] === a2[1])) ? undefined : a1;
    }
    function _getIfNE3D(a1, a2) {
        return ((a1[0] === a2[0]) && (a1[1] === a2[1]) && (a1[2] === a2[2])) ? undefined : a1;
    }

    /**
     * context.set(..)
     */
    FlowLayoutNode.prototype.set = function(set, defaultSize) {
        this._removing = false;
        this.scrollLength = set.scrollLength;
        _set.call(this, set, defaultSize);
        this._invalidated = true;
        _verifyIntegrity.call(this);
    };

    /**
     * context.set(..)
     */
    function _set(set, defaultSize) {

        // set opacity
        var opacity = (set.opacity === DEFAULT.opacity) ? undefined : set.opacity;
        if ((opacity !== undefined) || (this._properties.opacity && this._properties.opacity.init)) {
            _setPropertyValue.call(this, this._properties.opacity, 'opacity', opacity, DEFAULT.opacity);
        }

        // set align
        var align = set.align ? _getIfNE2D(set.align, DEFAULT.align) : undefined;
        if ((align !== undefined) || (this._properties.align && this._properties.align.init)) {
            _setPropertyValue.call(this, this._properties.align, 'align', align, DEFAULT.align);
        }

        // set orgin
        var origin = set.origin ? _getIfNE2D(set.origin, DEFAULT.origin) : undefined;
        if ((origin !== undefined) || (this._properties.origin && this._properties.origin.init)) {
            _setPropertyValue.call(this, this._properties.origin, 'origin', origin, DEFAULT.origin);
        }

        // set size
        var size = set.size ? _getIfNE2D(set.size, defaultSize) : undefined;
        if ((size !== undefined) || (this._properties.size && this._properties.size.init)) {
            _setPropertyValue.call(this, this._properties.size, 'size', size, defaultSize, this.usesTrueSize);
        }

        // set translate
        var translate = set.translate ? _getIfNE3D(set.translate, DEFAULT.translate) : undefined;
        if ((translate !== undefined) || (this._properties.translate && this._properties.translate.init)) {
            _setPropertyValue.call(this, this._properties.translate, 'translate', translate, DEFAULT.translate, undefined, true);
        }

        // set scale
        var scale = set.scale ? _getIfNE3D(set.scale, DEFAULT.scale) : undefined;
        if ((scale !== undefined) || (this._properties.scale && this._properties.scale.init)) {
            _setPropertyValue.call(this, this._properties.scale, 'scale', scale, DEFAULT.scale);
        }

        // set rotate
        var rotate = set.rotate ? _getIfNE3D(set.rotate, DEFAULT.rotate) : undefined;
        if ((rotate !== undefined) || (this._properties.rotate && this._properties.rotate.init)) {
            _setPropertyValue.call(this, this._properties.rotate, 'rotate', rotate, DEFAULT.rotate);
        }

        // set skew
        var skew = set.skew ? _getIfNE3D(set.skew, DEFAULT.skew) : undefined;
        if ((skew !== undefined) || (this._properties.skew && this._properties.skew.init)) {
            _setPropertyValue.call(this, this._properties.skew, 'skew', skew, DEFAULT.skew);
        }
    }

    module.exports = FlowLayoutNode;
});

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

        this._specModified = true;
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
        opacity2D: [1, 0],
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

        var oldRemoving = this._removing;
        var oldInvalidated = this._invalidated;
        this.set(set, DEFAULT.size);
        this._removing = oldRemoving;
        this._invalidated = oldInvalidated;
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
            this._specModified = false;
        }

        // Mark for removal
        this._invalidated = false;
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
    function _getRoundedValue3D(prop, def, precision) {
        if (!prop || !prop.init) {
            return def;
        }
        precision = precision || this.options.particleRounding;
        var value = prop.particle.getPosition();
        return [
            Math.round(value[0] / precision) * precision,
            Math.round(value[1] / precision) * precision,
            Math.round(value[2] / precision) * precision
        ];
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
            var precision = this.options.particleRounding;
            position = [
                Math.round(position[0] / precision) * precision,
                Math.round(position[1] / precision) * precision,
                Math.round(position[2] / precision) * precision
            ];
            position[this._lockDirection] = Math.round(lockValue / precision) * precision;
        }
        return position;
    }

    /**
     * Creates the render-spec
     */
    FlowLayoutNode.prototype.getSpec = function() {

        // When the end state was reached, return the previous spec
        var endStateReached = this._pe.isSleeping();
        if (!this._specModified && endStateReached) {
            if (this._invalidated) {
                return this._spec;
            }
            else {
                return undefined;
            }
        }
        this._initial = false;
        this._specModified = !endStateReached;

        // Build fresh spec
        var value;
        var spec = this._spec;
        var precision = this.options.particleRounding;

        // opacity
        var opacity = this._properties.opacity;
        if (opacity && opacity.init) {
            spec.opacity = Math.round(Math.max(0,Math.min(1, opacity.particle.getPosition1D())) / precision) * precision;
        }
        else {
            spec.opacity = undefined;
        }

        // size
        var size = this._properties.size;
        if (size && size.init) {
            value = size.particle.getPosition();
            if (!spec.size) {
                spec.size = [0, 0];
            }
            spec.size[0] = Math.round(value[0] / 0.1) * 0.1;
            spec.size[1] = Math.round(value[1] / 0.1) * 0.1;
        }
        else {
            spec.size = undefined;
        }

        // align
        var align = this._properties.align;
        if (align && align.init) {
            value = align.particle.getPosition();
            if (!spec.align) {
                spec.align = [0, 0];
            }
            spec.align[0] = Math.round(value[0] / 0.1) * 0.1;
            spec.align[1] = Math.round(value[1] / 0.1) * 0.1;
        }
        else {
            spec.align = undefined;
        }

        // origin
        var origin = this._properties.origin;
        if (origin && origin.init) {
            value = origin.particle.getPosition();
            if (!spec.origin) {
                spec.origin = [0, 0];
            }
            spec.origin[0] = Math.round(value[0] / 0.1) * 0.1;
            spec.origin[1] = Math.round(value[1] / 0.1) * 0.1;
        }
        else {
            spec.origin = undefined;
        }

        // translate
        var translate = this._properties.translate;
        var translateVal;
        if (translate && translate.init) {
            translateVal = translate.particle.getPosition();
            if (this._lockDirection !== undefined) {
                value = translateVal[this._lockDirection];
                var endState = translate.endState.get()[this._lockDirection];
                var lockValue = value + ((endState - value) * this._lockTransitionable.get());
                translateVal[0] = Math.round(translateVal[0] / precision) * precision;
                translateVal[1] = Math.round(translateVal[1] / precision) * precision;
                translateVal[2] = Math.round(translateVal[2] / precision) * precision;
                translateVal[this._lockDirection] = Math.round(lockValue / precision) * precision;
            }
        }
        else {
            translateVal = DEFAULT.translate;
        }

        // scale, skew, scale
        var scale = this._properties.scale;
        var skew = this._properties.skew;
        var rotate = this._properties.rotate;
        if (scale || skew || rotate) {
            spec.transform = Transform.build({
                translate: translateVal,
                skew: _getRoundedValue3D.call(this, skew, DEFAULT.skew),
                scale: _getRoundedValue3D.call(this, scale, DEFAULT.scale),
                rotate: _getRoundedValue3D.call(this, rotate, DEFAULT.rotate)
            });
        }
        else if (translate) {
            if (!spec.transform) {
                spec.transform = Transform.translate(translateVal[0], translateVal[1], translateVal[2]);
            }
            else {
                spec.transform[12] = translateVal[0];
                spec.transform[13] = translateVal[1];
                spec.transform[14] = translateVal[2];
            }
        }
        else {
            spec.transform = undefined;
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
            prop.endState.x = value[0];
            prop.endState.y = (value.length > 1) ? value[1] : 0;
            prop.endState.z = (value.length > 2) ? value[2] : 0;
            if (isTranslate && (this._lockDirection !== undefined) && (this._lockTransitionable.get() === 1)) {
                immediate = true; // this is a bit dirty, it should check !_lockDirection for non changes as well before setting immediate to true
            }
            if (immediate) {
                prop.particle.position.x = value[0];
                prop.particle.position.y = (value.length > 1) ? value[1] : 0;
                prop.particle.position.z = (value.length > 2) ? value[2] : 0;
            }
            else {
                this._pe.wake();
            }
            return;
        }
        else {

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
        this._invalidated = true;
        this._specModified = true;
        this.scrollLength = set.scrollLength;

        // set opacity
        var opacity = (set.opacity === DEFAULT.opacity) ? undefined : set.opacity;
        if ((opacity !== undefined) || (this._properties.opacity && this._properties.opacity.init)) {
            _setPropertyValue.call(this, this._properties.opacity, 'opacity', [opacity, 0], DEFAULT.opacity2D);
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
    };

    module.exports = FlowLayoutNode;
});

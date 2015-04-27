/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014 - 2015
 */

/**
 * Internal LayoutNode class used by `LayoutNodeManager`.
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
            this._pe.sleep();
        }

        if (!this._properties) {
            this._properties = {};
        }
        else {
            for (var propName in this._properties) {
                this._properties[propName].init = false;
            }
        }

        if (!this._lockTransitionable) {
            this._lockTransitionable = new Transitionable(1);
        }
        else {
            this._lockTransitionable.halt();
            this._lockTransitionable.reset(1);
        }

        this._specModified = true;
        this._initial = true;
        this._spec.endState = {};
        if (spec) {
            this.setSpec(spec);
        }
    }
    FlowLayoutNode.prototype = Object.create(LayoutNode.prototype);
    FlowLayoutNode.prototype.constructor = FlowLayoutNode;

    FlowLayoutNode.DEFAULT_OPTIONS = {
        spring: {
            dampingRatio: 0.8,
            period: 300
        },
        properties: {
            opacity: true,
            align: true,
            origin: true,
            size: true,
            translate: true,
            skew: true,
            rotate: true,
            scale: true
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
    /*function _verifyIntegrity() {
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
    }*/

    /**
     * Sets the configuration options
     */
    FlowLayoutNode.prototype.setOptions = function(options) {
        this._optionsManager.setOptions(options);
        var wasSleeping = this._pe.isSleeping();
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (options.spring && prop.force) {
                prop.force.setOptions(this.options.spring);
            }
            if (options.properties && (options.properties[propName] !== undefined)) {
                if (this.options.properties[propName].length) {
                    prop.enabled = this.options.properties[propName];
                }
                else {
                    prop.enabled = [
                        this.options.properties[propName],
                        this.options.properties[propName],
                        this.options.properties[propName]
                    ];
                }
            }
        }
        if (wasSleeping) {
            this._pe.sleep();
        }
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
        this.set(set);
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
     * Temporarily releases the flowing-lock that is applied to the node.
     * E.g., when changing position, resizing, the lock should be released so that
     * the renderables can smoothly transition to their new positions.
     */
    FlowLayoutNode.prototype.releaseLock = function(enable) {
        this._lockTransitionable.halt();
        this._lockTransitionable.reset(0);
        if (enable) {
          this._lockTransitionable.set(1, {
              duration: this.options.spring.period || 1000
          });
        }
    };

    /**
     * Helper function for getting the property value.
     */
    function _getRoundedValue3D(prop, def, precision, lockValue) {
        if (!prop || !prop.init) {
            return def;
        }
        return [
            prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / precision) * precision) : prop.endState.x,
            prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / precision) * precision) : prop.endState.y,
            prop.enabled[2] ? (Math.round((prop.curState.z + ((prop.endState.z - prop.curState.z) * lockValue)) / precision) * precision) : prop.endState.z
        ];
    }

    /**
     * Creates the render-spec
     */
    FlowLayoutNode.prototype.getSpec = function() {

        // When the end state was reached, return the previous spec
        var endStateReached = this._pe.isSleeping();
        if (!this._specModified && endStateReached) {
            this._spec.removed = !this._invalidated;
            return this._spec;
        }
        this._initial = false;
        this._specModified = !endStateReached;
        this._spec.removed = false;

        // Step physics engine when not sleeping
        if (!endStateReached) {
            this._pe.step();
        }

        // Build fresh spec
        var spec = this._spec;
        var precision = this.options.particleRounding;
        var lockValue = this._lockTransitionable.get();

        // opacity
        var prop = this._properties.opacity;
        if (prop && prop.init) {
            spec.opacity = prop.enabled[0] ? (Math.round(Math.max(0, Math.min(1, prop.curState.x)) / precision) * precision) : prop.endState.x;
            spec.endState.opacity = prop.endState.x;
        }
        else {
            spec.opacity = undefined;
            spec.endState.opacity = undefined;
        }

        // size
        prop = this._properties.size;
        if (prop && prop.init) {
            spec.size = spec.size || [0, 0];
            spec.size[0] = prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / 0.1) * 0.1) : prop.endState.x;
            spec.size[1] = prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / 0.1) * 0.1) : prop.endState.y;
            spec.endState.size = spec.endState.size || [0, 0];
            spec.endState.size[0] = prop.endState.x;
            spec.endState.size[1] = prop.endState.y;
        }
        else {
            spec.size = undefined;
            spec.endState.size = undefined;
        }

        // align
        prop = this._properties.align;
        if (prop && prop.init) {
            spec.align = spec.align || [0, 0];
            spec.align[0] = prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / 0.1) * 0.1) : prop.endState.x;
            spec.align[1] = prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / 0.1) * 0.1) : prop.endState.y;
            spec.endState.align = spec.endState.align || [0, 0];
            spec.endState.align[0] = prop.endState.x;
            spec.endState.align[1] = prop.endState.y;
        }
        else {
            spec.align = undefined;
            spec.endState.align = undefined;
        }

        // origin
        prop = this._properties.origin;
        if (prop && prop.init) {
            spec.origin = spec.origin || [0, 0];
            spec.origin[0] = prop.enabled[0] ? (Math.round((prop.curState.x + ((prop.endState.x - prop.curState.x) * lockValue)) / 0.1) * 0.1) : prop.endState.x;
            spec.origin[1] = prop.enabled[1] ? (Math.round((prop.curState.y + ((prop.endState.y - prop.curState.y) * lockValue)) / 0.1) * 0.1) : prop.endState.y;
            spec.endState.origin = spec.endState.origin || [0, 0];
            spec.endState.origin[0] = prop.endState.x;
            spec.endState.origin[1] = prop.endState.y;
        }
        else {
            spec.origin = undefined;
            spec.endState.origin = undefined;
        }

        // translate
        var translate = this._properties.translate;
        var translateX;
        var translateY;
        var translateZ;
        if (translate && translate.init) {
            translateX = translate.enabled[0] ? (Math.round((translate.curState.x + ((translate.endState.x - translate.curState.x) * lockValue)) / precision) * precision) : translate.endState.x;
            translateY = translate.enabled[1] ? (Math.round((translate.curState.y + ((translate.endState.y - translate.curState.y) * lockValue)) / precision) * precision) : translate.endState.y;
            translateZ = translate.enabled[2] ? (Math.round((translate.curState.z + ((translate.endState.z - translate.curState.z) * lockValue)) / precision) * precision) : translate.endState.z;
        }
        else {
            translateX = 0;
            translateY = 0;
            translateZ = 0;
        }

        // scale, skew, scale
        var scale = this._properties.scale;
        var skew = this._properties.skew;
        var rotate = this._properties.rotate;
        if (scale || skew || rotate) {
            spec.transform = Transform.build({
                translate: [translateX, translateY, translateZ],
                skew: _getRoundedValue3D.call(this, skew, DEFAULT.skew, this.options.particleRounding, lockValue),
                scale: _getRoundedValue3D.call(this, scale, DEFAULT.scale, this.options.particleRounding, lockValue),
                rotate: _getRoundedValue3D.call(this, rotate, DEFAULT.rotate, this.options.particleRounding, lockValue)
            });
            spec.endState.transform = Transform.build({
                translate: translate ? [translate.endState.x, translate.endState.y, translate.endState.z] : DEFAULT.translate,
                scale: scale ? [scale.endState.x, scale.endState.y, scale.endState.z] : DEFAULT.scale,
                skew: skew ? [skew.endState.x, skew.endState.y, skew.endState.z] : DEFAULT.skew,
                rotate: rotate ? [rotate.endState.x, rotate.endState.y, rotate.endState.z] : DEFAULT.rotate
            });
        }
        else if (translate) {
            if (!spec.transform) {
                spec.transform = Transform.translate(translateX, translateY, translateZ);
            }
            else {
                spec.transform[12] = translateX;
                spec.transform[13] = translateY;
                spec.transform[14] = translateZ;
            }
            if (!spec.endState.transform) {
                spec.endState.transform = Transform.translate(translate.endState.x, translate.endState.y, translate.endState.z);
            }
            else {
                spec.endState.transform[12] = translate.endState.x;
                spec.endState.transform[13] = translate.endState.y;
                spec.endState.transform[14] = translate.endState.z;
            }
        }
        else {
            spec.transform = undefined;
            spec.endState.transform = undefined;
        }
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
            //if (isTranslate && (this._lockDirection !== undefined) && (this._lockTransitionable.get() === 1)) {
            //    immediate = true; // this is a bit dirty, it should check !_lockDirection for non changes as well before setting immediate to true
            //}
            // set new end state (the quick way)
            prop.endState.x = value[0];
            prop.endState.y = (value.length > 1) ? value[1] : 0;
            prop.endState.z = (value.length > 2) ? value[2] : 0;
            if (immediate) {
                // set current state (the quick way)
                prop.curState.x = prop.endState.x;
                prop.curState.y = prop.endState.y;
                prop.curState.z = prop.endState.z;
                // reset velocity (the quick way)
                prop.velocity.x = 0;
                prop.velocity.y = 0;
                prop.velocity.z = 0;
            }
            else if ((prop.endState.x !== prop.curState.x) ||
                     (prop.endState.y !== prop.curState.y) ||
                     (prop.endState.z !== prop.curState.z)) {
                this._pe.wake();
            }
            return;
        }
        else {

            // Create property if neccesary
            var wasSleeping = this._pe.isSleeping();
            if (!prop) {
                prop = {
                    particle: new Particle({
                        position: (this._initial || immediate) ? endState : defaultValue
                    }),
                    endState: new Vector(endState)
                };
                prop.curState = prop.particle.position;
                prop.velocity = prop.particle.velocity;
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
            }
            if (!this._initial && !immediate) {
                this._pe.wake();
            }
            else if (wasSleeping) {
                this._pe.sleep(); // nothing has changed, put back to sleep
            }
            if (this.options.properties[propName] && this.options.properties[propName].length) {
                prop.enabled = this.options.properties[propName];
            }
            else {
                prop.enabled = [
                  this.options.properties[propName],
                  this.options.properties[propName],
                  this.options.properties[propName]
                ];
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
        if (defaultSize) {
            this._removing = false;
        }
        this._invalidated = true;
        this.scrollLength = set.scrollLength;
        this._specModified = true;

        // opacity
        var prop = this._properties.opacity;
        var value = (set.opacity === DEFAULT.opacity) ? undefined : set.opacity;
        if ((value !== undefined) || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'opacity', (value === undefined) ? undefined : [value, 0], DEFAULT.opacity2D);
        }

        // set align
        prop = this._properties.align;
        value = set.align ? _getIfNE2D(set.align, DEFAULT.align) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'align', value, DEFAULT.align);
        }

        // set orgin
        prop = this._properties.origin;
        value = set.origin ? _getIfNE2D(set.origin, DEFAULT.origin) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'origin', value, DEFAULT.origin);
        }

        // set size
        prop = this._properties.size;
        value = set.size || defaultSize;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'size', value, defaultSize, this.usesTrueSize);
        }

        // set translate
        prop = this._properties.translate;
        value = set.translate;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'translate', value, DEFAULT.translate, undefined, true);
        }

        // set scale
        prop = this._properties.scale;
        value = set.scale ? _getIfNE3D(set.scale, DEFAULT.scale) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'scale', value, DEFAULT.scale);
        }

        // set rotate
        prop = this._properties.rotate;
        value = set.rotate ? _getIfNE3D(set.rotate, DEFAULT.rotate) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'rotate', value, DEFAULT.rotate);
        }

        // set skew
        prop = this._properties.skew;
        value = set.skew ? _getIfNE3D(set.skew, DEFAULT.skew) : undefined;
        if (value || (prop && prop.init)) {
            _setPropertyValue.call(this, prop, 'skew', value, DEFAULT.skew);
        }
    };

    module.exports = FlowLayoutNode;
});

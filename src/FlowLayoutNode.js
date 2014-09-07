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
    var Transform = require('famous/core/Transform');
    var Vector = require('famous/math/Vector');
    var Particle = require('famous/physics/bodies/Particle');
    var Spring = require('famous/physics/forces/Spring');
    var LayoutNode = require('./LayoutNode');

    /**
     * @class
     * @extends LayoutNode
     * @param {Object} renderNode Render-node which this layout-node represents
     * @param {Spec} spec Initial state
     * @param {Object} physicsEngines physics-engines to use
     * @alias module:FlowLayoutNode
     */
    function FlowLayoutNode(renderNode, spec, physicsEngines) {
        LayoutNode.apply(this, arguments);

        this._physicsEngines = physicsEngines;
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
        //this._endstatereached = false;
        this._initial = true;
        this._removing = false;
        if (spec) {
            _setFromSpec.call(this, spec);
        }
    }
    FlowLayoutNode.prototype = Object.create(LayoutNode.prototype);
    FlowLayoutNode.prototype.constructor = FlowLayoutNode;

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
     * Set the properties from a spec.
     */
    function _equalsXYZ(ar1, ar2) {
        return (ar1[0] === ar2[0]) && (ar1[1] === ar2[1]) && (ar1[2] === ar2[2]);
    }
    function _setFromSpec(spec) {
        var set = {};
        if (spec.opacity !== undefined) {
            set.opacity = spec.opacity;
        }
        if (spec.size !== undefined) {
            set.size = spec.size;
        }
        if (spec.align !== undefined) {
            set.align = spec.align;
        }
        if (spec.origin !== undefined) {
            set.origin = spec.origin;
        }
        if (spec.transform) {
            var transform = Transform.interpret(spec.transform);
            if (!_equalsXYZ(transform.translate, DEFAULT.translate)) {
                set.translate = transform.translate;
            }
            if (!_equalsXYZ(transform.scale, DEFAULT.scale)) {
                set.scale = transform.scale;
            }
            if (!_equalsXYZ(transform.skew, DEFAULT.skew)) {
                set.skew = transform.skew;
            }
            if (!_equalsXYZ(transform.rotate, DEFAULT.rotate)) {
                set.rotate = transform.rotate;
            }
        }
        this.set(set);
        return set;
    }

    /**
     * Reset the end-state. This function is called on all layout-nodes prior to
     * calling the layout-function. So that the layout-function starts with a clean slate.
     */
    FlowLayoutNode.prototype.reset = function() {
        if (this._invalidated) {
            for (var propName in this._properties) {
                this._properties[propName].endState.set(DEFAULT[propName]);
            }
            this._invalidated = false;
        }
    };

    /**
     * Markes the node for removal.
     */
    FlowLayoutNode.prototype.remove = function(removeSpec) {

        // Stop the particle from moving by setting the end-state
        // to the current particle state
        for (var propName in this._properties) {
            if (removeSpec && (removeSpec[propName] === undefined)) {
                this._properties[propName].endState.set(
                    this._properties[propName].particle.position.get()
                );
            }
        }

        // Transition towards the new spec
        if (removeSpec) {
            _setFromSpec.call(this, removeSpec);
        }
        this._removing = true;
        this._invalidated = false;
    };

    /**
     * Destroys the layout-node by removing all the particles and
     * forces from the physics-engine.
     */
    FlowLayoutNode.prototype.destroy = function() {
        for (var propName in this._properties) {
            var prop = this._properties[propName];
            if (prop.particle) {
                var pe = this._physicsEngines[propName];
                pe.removeBody(prop.particle);
                delete prop.particle;
                delete prop.force;
                delete prop.endstate;
            }
            delete this._properties[propName];
        }
    };

    /**
     * Creates the render-spec
     */
    var ENERGY_RESTTOLERANCE = 1e-10;
    var VALUE_RESTTOLERANCE = 1e-6;
    FlowLayoutNode.prototype.getSpec = function() {

        // Check whether the any property is still animating
        if (!this._endstatereached &&
            !(!this._invalidated && this._initial)) { // when a node was added (e.g. using insert), but it was immediately not layed-out, then remove it
            this._endstatereached = true;
            for (var propName in this._properties) {
                var prop = this._properties[propName];
                var energy = prop.particle.getEnergy();
                if (energy > ENERGY_RESTTOLERANCE) {
                    this._endstatereached = false;
                    break;
                }
                else {
                    var curState = prop.particle.getPosition();
                    var endState = prop.endState.get();
                    if (endState.length !== curState.length) {
                        this._endstatereached = false;
                        break;
                    }
                    for (var i = 0; i < curState.length; i++) {
                        if (Math.abs(curState[i] - endState[i]) > VALUE_RESTTOLERANCE) {
                            this._endstatereached = false;
                            break;
                        }
                    }
                }
            }
        }
        else {

            // Animations have stopped
            //return !this._invalidated ? undefined : this._spec;
            if (this._invalidated) {
                return this._spec;
            }
            else {
                return undefined;
            }
        }

        // Animations are still going, build new spec
        this._initial = false;
        this._spec.opacity = this._properties.opacity ? Math.max(0,Math.min(1, this._properties.opacity.particle.getPosition1D())) : undefined;
        this._spec.size = this._properties.size ? this._properties.size.particle.getPosition() : undefined;
        this._spec.align = this._properties.align ? this._properties.align.particle.getPosition() : undefined;
        this._spec.origin = this._properties.origin ? this._properties.origin.particle.getPosition() : undefined;
        this._spec.transform = Transform.build({
            translate: this._properties.translate ? this._properties.translate.particle.getPosition() : DEFAULT.translate,
            skew: this._properties.skew ? this._properties.skew.particle.getPosition() : DEFAULT.skew,
            scale: this._properties.scale ? this._properties.scale.particle.getPosition() : DEFAULT.scale,
            rotate: this._properties.rotate ? this._properties.rotate.particle.getPosition() : DEFAULT.rotate
        });
        /*console.log(JSON.stringify({
            opacity: this._spec.opacity,
            size: this._spec.size,
            align: this._spec.align,
            origin: this._spec.origin,
            transform: this._spec.transform
        }));*/

        return this._spec;
    };

    /**
     * Set the content of the node
     *
     * @param {Object} set
     */
     var AXES = {
        opacity:    Particle.AXES.X,
        size:       Particle.AXES.X | Particle.AXES.Y,
        origin:     Particle.AXES.X | Particle.AXES.Y,
        align:      Particle.AXES.X | Particle.AXES.Y,
        scale:      Particle.AXES.X | Particle.AXES.Y | Particle.AXES.Z,
        translate:  Particle.AXES.X | Particle.AXES.Y | Particle.AXES.Z,
        rotate:     Particle.AXES.X | Particle.AXES.Y | Particle.AXES.Z,
        skew:       Particle.AXES.X | Particle.AXES.Y | Particle.AXES.Z
    };
    FlowLayoutNode.prototype.set = function(set) {
        for (var propName in set) {
            var value = set[propName];
            if (value !== undefined) {
                var prop = this._properties[propName];
                if (!prop) {
                    prop = {
                        particle: new Particle({
                            axis: AXES[propName],
                            position: this._initial ? value : DEFAULT[propName]
                        }),
                        endState: new Vector(value)
                    };
                    prop.force = new Spring({
                        dampingRatio: 0.8,
                        period: 300,
                        anchor : prop.endState
                    });
                    var pe = this._physicsEngines[propName];
                    pe.addBody(prop.particle);
                    prop.forceId = pe.attach(prop.force, prop.particle);
                    this._properties[propName] = prop;
                }
                else {
                    prop.endState.set(value);
                }
                this._invalidated = true;
                this._endstatereached = false;
            }
        }
    };

    module.exports = FlowLayoutNode;
});

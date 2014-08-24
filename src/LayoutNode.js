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

/**
 * LayoutNode is the interface for setting the size and transform in a layout-
 * function.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Transform = require('famous/core/Transform');
    var Vector = require('famous/math/Vector');
    var Particle = require('famous/physics/bodies/Particle');
    var Spring = require('famous/physics/forces/Spring');
    var LayoutUtility = require('./LayoutUtility');

    /**
     * @class
     * @param {Object} physicsEngines physics-engines to use
     * @param {Object} renderNode Render-node which this layout-node represents
     * @param {Object} initialSpec Initial state
     * @alias module:LayoutNode
     */
    function LayoutNode(physicsEngines, renderNode, initialSpec) {
        this._renderNode = renderNode;
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
        this._invalidated = false;
        this._endstatereached = false;
        this._initial = true;
        this._spec = initialSpec ? LayoutUtility.cloneSpec(initialSpec) : {};
        this._spec.renderNode = renderNode;
        if (initialSpec) {
            this._setFromSpec(initialSpec);
        }
    }

    /**
     * Set the properties from a spec.
     */
    LayoutNode.prototype._setFromSpec = function(spec) {
        if (spec.opacity) {
            this._setOpacity(spec.opacity);
        }
        if (spec.size) {
            this.setSize(spec.size);
        }
        if (spec.align) {
            this.setAlign(spec.align);
        }
        if (spec.origin) {
            this.setOrigin(spec.origin);
        }
        if (spec.transform) {
            var transform = Transform.interpret(spec.transform);
            if (transform.translate) {
                this.setTranslate(transform.translate[0], transform.translate[1], transform.translate[2]);
            }
            if (transform.rotate) {
                this.setRotation(transform.rotate[0], transform.rotate[1], transform.rotate[2]);
            }
            if (transform.skew) {
                this.setSkew(transform.skew[0], transform.skew[1], transform.skew[2]);
            }
            if (transform.scale) {
                this.setScale(transform.scale[0], transform.scale[1], transform.scale[2]);
            }
        }
    };

    /**
     * Reset the end-state. This function is called on all layout-nodes prior to
     * calling the layout-function. So that the layout-function starts with a clean slate.
     */
    var DEFAULT_OPACITY = 1;
    var DEFAULT_SIZE = [0, 0];
    var DEFAULT_ORIGIN = [0, 0];
    var DEFAULT_ALIGN = [0, 0];
    var DEFAULT_SCALE = [1, 1, 1];
    var DEFAULT_ROTATE = [0, 0, 0];
    var DEFAULT_SKEW = [0, 0, 0];
    var DEFAULT_TRANSLATE = [0, 0, 0];
    LayoutNode.prototype._reset = function() {
        if (!this._invalidated) {
            return this;
        }
        if (this._properties.opacity) {
            this._properties.opacity.endState.set(DEFAULT_OPACITY);
        }
        if (this._properties.origin) {
            this._properties.origin.endState.set(DEFAULT_ORIGIN);
        }
        if (this._properties.align) {
            this._properties.align.endState.set(DEFAULT_ALIGN);
        }
        if (this._properties.size) {
            this._properties.size.endState.set(DEFAULT_SIZE);
        }
        if (this._properties.translate) {
            this._properties.translate.endState.set(DEFAULT_TRANSLATE);
        }
        if (this._properties.skew) {
            this._properties.skew.endState.set(DEFAULT_SKEW);
        }
        if (this._properties.rotate) {
            this._properties.rotate.endState.set(DEFAULT_ROTATE);
        }
        if (this._properties.scale) {
            this._properties.scale.endState.set(DEFAULT_SCALE);
        }
        this._invalidated = false;
        return this;
    };

    /**
     * Destroys the layout-node by removing all the particles and
     * forces from the physics-engine.
     */
    LayoutNode.prototype._destroy = function() {
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
    LayoutNode.prototype._buildSpec = function() {

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
            return !this._invalidated ? undefined : this._spec;
        }

        // Animations are still going, build new spec
        this._initial = false;
        this._spec.opacity = this._properties.opacity ? this._properties.opacity.particle.getPosition1D() : undefined;
        this._spec.size = this._properties.size ? this._properties.size.particle.getPosition() : undefined;
        this._spec.align = this._properties.align ? this._properties.align.particle.getPosition() : undefined;
        this._spec.origin = this._properties.origin ? this._properties.origin.particle.getPosition() : undefined;
        this._spec.transform = Transform.build({
            translate: this._properties.translate ? this._properties.translate.particle.getPosition() : DEFAULT_TRANSLATE,
            skew: this._properties.skew ? this._properties.skew.particle.getPosition() : DEFAULT_SKEW,
            scale: this._properties.scale ? this._properties.scale.particle.getPosition() : DEFAULT_SCALE,
            rotate: this._properties.rotate ? this._properties.rotate.particle.getPosition() : DEFAULT_ROTATE
        });
        return this._spec;
    };

    /**
     * Create force that is applied on the layout-node particle
     */
    function _createForce (endState) {
        return new Spring({
            dampingRatio: 0.8,
            period: 300,
            anchor : endState
        });
    }

    /**
     * Set an 2-element array property (size, origin, align..)
     */
    function _setPropertyArray2 (propName, value) {
        var prop = this._properties[propName];
        if (!prop) {
            prop = {
                particle: new Particle({
                    axis: Particle.AXES.X | Particle.AXES.Y,
                    position: value
                }),
                endState: new Vector(value)
            };
            prop.force = _createForce.call(this, prop.endState);
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
        return this;
    }

    /**
     * Set an XYZ property (translate, etc..)
     */
    function _setPropertyXYZ (propName, x, y, z) {
        var prop = this._properties[propName];
        if (!prop) {
            prop = {
                particle: new Particle({
                    axis: Particle.AXES.X | Particle.AXES.Y | Particle.AXES.Z,
                    position: [x, y, z]
                }),
                endState: new Vector(x, y, z)
            };
            prop.force = _createForce.call(this, prop.endState);
            var pe = this._physicsEngines[propName];
            pe.addBody(prop.particle);
            prop.forceId = pe.attach(prop.force, prop.particle);
            this._properties[propName] = prop;
        }
        else {
            prop.endState.setXYZ(x, y, z);
        }
        this._invalidated = true;
        this._endstatereached = false;
        return this;
    }

    /**
     * Set the opacity
     */
    LayoutNode.prototype._setOpacity = function(opacity) {
        var prop = this._properties.opacity;
        if (!prop) {
            prop = {
                particle: new Particle({
                    axis: Particle.AXES.X,
                    position: [opacity]
                }),
                endState: new Vector(opacity)
            };
            prop.force = _createForce.call(this, prop.endState);
            var pe = this._physicsEngines.opacity;
            pe.addBody(prop.particle);
            prop.forceId = pe.attach(prop.force, prop.particle);
            this._properties.opacity = prop;
        }
        else {
            prop.endState.set(opacity);
        }
        this._invalidated = true;
        this._endstatereached = false;
        return this;
    };

    /**
     * Set the size of the node.
     *
     * @param {Array.Number} size
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setSize = function(size) {
        return _setPropertyArray2.call(this, 'size', size);
    };

    /**
     * Set the align of the node.
     *
     * @param {Array.Number} align
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setAlign = function(align) {
        return _setPropertyArray2.call(this, 'align', align);
    };

    /**
     * Set the origin of the node.
     *
     * @param {Array.Number} origin
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setOrigin = function(origin) {
        return _setPropertyArray2.call(this, 'origin', origin);
    };

    /**
     * Set the translate for the node
     *
     * @param {Number} [x] x-translation
     * @param {Number} [y] y-translation
     * @param {Number} [z] z-translation
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setTranslate = function(x, y, z) {
        return _setPropertyXYZ.call(this, 'translate', x || 0, y || 0, z || 0);
    };

    /**
     * Set the rotation for the node
     *
     * @param {Number} [x] x-translation
     * @param {Number} [y] y-translation
     * @param {Number} [z] z-translation
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setRotation = function(x, y, z) {
        return _setPropertyXYZ.call(this, 'rotate', x || 0, y || 0, z || 0);
    };

    /**
     * Set the scale for the node
     *
     * @param {Number} [x] x-translation
     * @param {Number} [y] y-translation
     * @param {Number} [z] z-translation
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setScale = function(x, y, z) {
        return _setPropertyXYZ.call(this, 'scale', x || 1, y || 1, z || 1);
    };

    /**
     * Set the skew for the node
     *
     * @param {Number} [x] x-translation
     * @param {Number} [y] y-translation
     * @param {Number} [z] z-translation
     * @return {LayoutNode} this
     */
    LayoutNode.prototype.setSkew = function(x, y, z) {
        return _setPropertyXYZ.call(this, 'skew', x || 0, y || 0, z || 0);
    };

    /**
     * Get the renderable that this layout-node represents.
     *
     * @return {Object} renderable
     */
    LayoutNode.prototype.get = function() {
        return this._renderNode;
    };

    /**
     * Get the last render-spec
     *
     * @return {Object} spec
     */
    LayoutNode.prototype.getSpec = function() {
        return this._spec;
    };

    /**
     *  Get the json that can be stringified for this object.
     *
     *  @return {Object} clean object
     */
    LayoutNode.prototype.toJSON = function() {
        /*return {
            start: LayoutUtility.cloneSpec(this._start),
            current: LayoutUtility.cloneSpec(this._current),
            final: LayoutUtility.cloneSpec(this._final)
        };*/
        // TODO
        return {};
    };

    module.exports = LayoutNode;
});

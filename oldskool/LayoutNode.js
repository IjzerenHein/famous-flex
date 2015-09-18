/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author Hein Rutjes (IjzerenHein)
 * @license MIT
 * copyright Hein Rutjes, 2015
 */

import {Node} from 'famous/core';

var Property = {
  ALIGN: 1,
  MOUNTPOINT: 2,
  ORIGIN: 4,
  POSITION: 8,
  ROTATION: 16,
  SCALE: 32,
  OPACITY: 64,
  SIZEMODE: 128,
  PROPSIZE: 256,
  DIFFSIZE: 512,
  ABSSIZE: 1024,
  SCROLLLENGTH: 2048,
};

/**
 * LayoutNode
 *
 * Purpose of layout-nodes:
 * - Flow-animations between layouts (physics particle between diffs)
 * - ScrollLength
 *
 * @class
 */
export default class LayoutNode {
    constructor() {
      this.hasProp = 0;
    }

    /**
     * Sets the node associated with this layoutnode
     */
    setNode(node) {
      this.node = node;
    }

    reset(beforeLayout) {
      if (beforeLayout) {
        this.prevHasProp = this.hasProp;
        this.hasProp = 0;
        return;
      }

      this.inLayout = (this.hasProp !== 0);
      if (this.inLayout && (this.hasProp !== this.prevHasProp)) {
        if ((this.prevHasProp & ~this.hasProp & Property.ALIGN) === Property.ALIGN) {
          this.node.setAlign(0, 0, 0);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.MOUNTPOINT) === Property.MOUNTPOINT) {
          this.node.setMountPoint(0, 0, 0);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.ORIGIN) === Property.ORIGIN) {
          this.node.setOrigin(0, 0, 0);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.POSITION) === Property.POSITION) {
          this.node.setPosition(0, 0, 0);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.ROTATION) === Property.ROTATION) {
          this.node.setRotation(0, 0, 0, 1);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.SCALE) === Property.SCALE) {
          this.node.setScale(1, 1, 1);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.OPACITY) === Property.OPACITY) {
          this.node.setOpacity(1);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.SIZEMODE) === Property.SIZEMODE) {
          this.node.setSizeMode(Node.RELATIVE_SIZE, Node.RELATIVE_SIZE, Node.RELATIVE_SIZE);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.PROPSIZE) === Property.PROPSIZE) {
          this.node.setProportionalSize(1, 1, 1);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.DIFFSIZE) === Property.DIFFSIZE) {
          this.node.setDifferentialSize(0, 0, 0);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.ABSSIZE) === Property.ABSSIZE) {
          this.node.setAbsoluteSize(0, 0, 0);
        }

        if ((this.prevHasProp & ~this.hasProp & Property.SCROLLLENGTH) === Property.SCROLLLENGTH) {
          this.scrollLength[0] = undefined;
          this.scrollLength[1] = undefined;
          this.scrollLength[2] = undefined;
        }
      }
    }

    /**
     * Sets the align value of the node. Will call onAlignChange
     * on all of the Node's components.
     *
     * @param {Number} x Align value in the x dimension.
     * @param {Number} y Align value in the y dimension.
     * @param {Number} z Align value in the z dimension.
     *
     * @return {LayoutNode} this
     */
    setAlign(x, y, z) {
      this.node.setAlign.apply(this.node, arguments);
      this.hasProp |= Property.ALIGN;
      return this;
    }

    /**
     * Sets the mount point value of the node. Will call onMountPointChange
     * on all of the node's components.
     *
     * @param {Number} x MountPoint value in x dimension
     * @param {Number} y MountPoint value in y dimension
     * @param {Number} z MountPoint value in z dimension
     *
     * @return {LayoutNode} this
     */
    setMountPoint(x, y, z) {
      this.node.setMountPoint.apply(this.node, arguments);
      this.hasProp |= Property.MOUNTPOINT;
      return this;
    }

    /**
     * Sets the origin value of the node. Will call onOriginChange
     * on all of the node's components.
     *
     * @param {Number} x Origin value in x dimension
     * @param {Number} y Origin value in y dimension
     * @param {Number} z Origin value in z dimension
     *
     * @return {LayoutNode} this
     */
    setOrigin(x, y, z) {
      this.node.setOrigin.apply(this.node, arguments);
      this.hasProp |= Property.ORIGIN;
      return this;
    }

    /**
     * Sets the position of the node. Will call onPositionChange
     * on all of the node's components.
     *
     * @param {Number} x Position in x
     * @param {Number} y Position in y
     * @param {Number} z Position in z
     *
     * @return {LayoutNode} this
     */
    setPosition(x, y, z) {
      this.node.setPosition.apply(this.node, arguments);
      this.hasProp |= Property.POSITION;
      return this;
    }

    /**
     * Sets the rotation of the node. Will call onRotationChange
     * on all of the node's components. This method takes either
     * Euler angles or a quaternion. If the fourth argument is undefined
     * Euler angles are assumed.
     *
     * @param {Number} x Either the rotation around the x axis or the magnitude in x of the axis of rotation.
     * @param {Number} y Either the rotation around the y axis or the magnitude in y of the axis of rotation.
     * @param {Number} z Either the rotation around the z axis or the magnitude in z of the axis of rotation.
     * @param {Number|undefined} w the amount of rotation around the axis of rotation, if a quaternion is specified.
     *
     * @return {LayoutNode} this
     */
    setRotation(x, y, z, w) {
      this.node.setRotation.apply(this.node, arguments);
      this.hasProp |= Property.ROTATION;
      return this;
    }

    /**
     * Sets the scale of the node. The default value is 1 in all dimensions.
     * The node's components will have onScaleChanged called on them.
     *
     * @param {Number} x Scale value in x
     * @param {Number} y Scale value in y
     * @param {Number} z Scale value in z
     *
     * @return {LayoutNode} this
     */
    setScale(x, y, z) {
      this.node.setScale.apply(this.node, arguments);
      this.hasProp |= Property.SCALE;
      return this;
    }

    /**
     * Sets the value of the opacity of this node. All of the node's
     * components will have onOpacityChange called on them/
     *
     * @param {Number} val Value of the opacity. 1 is the default.
     *
     * @return {LayoutNode} this
     */
    setOpacity(val) {
      this.node.setOpacity.apply(this.node, arguments);
      this.hasProp |= Property.OPACITY;
      return this;
    }

    /**
     * Sets the size mode being used for determining the nodes final width, height
     * and depth.
     * Size modes are a way to define the way the node's size is being calculated.
     * Size modes are enums set on the @{@link Size} constructor (and aliased on
     * the Node).
     *
     * @example
     * node.setSizeMode(Node.RELATIVE_SIZE, Node.ABSOLUTE_SIZE, Node.ABSOLUTE_SIZE);
     * // Instead of null, any proporional height or depth can be passed in, since
     * // it would be ignored in any case.
     * node.setProportionalSize(0.5, null, null);
     * node.setAbsoluteSize(null, 100, 200);
     *
     * @param {SizeMode} x    The size mode being used for determining the size in
     *                        x direction ("width").
     * @param {SizeMode} y    The size mode being used for determining the size in
     *                        y direction ("height").
     * @param {SizeMode} z    The size mode being used for determining the size in
     *                        z direction ("depth").
     *
     * @return {LayoutNode} this
     */
    setSizeMode(x, y, z) {
      this.node.setSizeMode.apply(this.node, arguments);
      this.hasProp |= Property.SIZEMODE;
      return this;
    }

    /**
     * A proportional size defines the node's dimensions relative to its parents
     * final size.
     * Proportional sizes need to be within the range of [0, 1].
     *
     * @param {Number} x    x-Size in pixels ("width").
     * @param {Number} y    y-Size in pixels ("height").
     * @param {Number} z    z-Size in pixels ("depth").
     *
     * @return {LayoutNode} this
     */
    setProportionalSize(x, y, z) {
      this.node.setProportionalSize.apply(this.node, arguments);
      this.hasProp |= Property.PROPSIZE;
      return this;
    }

    /**
     * Differential sizing can be used to add or subtract an absolute size from a
     * otherwise proportionally sized node.
     * E.g. a differential width of `-10` and a proportional width of `0.5` is
     * being interpreted as setting the node's size to 50% of its parent's width
     * *minus* 10 pixels.
     *
     * @param {Number} x    x-Size to be added to the relatively sized node in
     *                      pixels ("width").
     * @param {Number} y    y-Size to be added to the relatively sized node in
     *                      pixels ("height").
     * @param {Number} z    z-Size to be added to the relatively sized node in
     *                      pixels ("depth").
     *
     * @return {LayoutNode} this
     */
    setDifferentialSize(x, y, z) {
      this.node.setDifferentialSize.apply(this.node, arguments);
      this.hasProp |= Property.DIFFSIZE;
      return this;
    }

    /**
     * Sets the nodes size in pixels, independent of its parent.
     *
     * @param {Number} x    x-Size in pixels ("width").
     * @param {Number} y    y-Size in pixels ("height").
     * @param {Number} z    z-Size in pixels ("depth").
     *
     * @return {LayoutNode} this
     */
    setAbsoluteSize(x, y, z) {
      this.node.setAbsoluteSize.apply(this.node, arguments);
      this.hasProp |= Property.ABSSIZE;
      return this;
    }

    /**
     * Sets the nodes scroll length.
     *
     * @param {Number} x    x-Scroll-length in pixels ("horizontal").
     * @param {Number} y    y-Scroll-length in pixels ("vertical").
     * @param {Number} z    z-Scroll-length in pixels ("depth").
     *
     * @return {LayoutNode} this
     */
    setScrollLength(x, y, z) {
      this.scrollLength = this.scrollLength || [0, 0, 0];
      this.scrollLength[0] = x;
      this.scrollLength[1] = y;
      this.scrollLength[2] = z;
      this.hasProp |= Property.SCROLLLENGTH;
      return this;
    }
}

LayoutNode.Property = Property;

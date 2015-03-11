/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/*global console*/
/*eslint no-console:0 */

/**
 * Virtual ViewSequence for famo.us which creates & destroys nodes using a
 * factory delegate. The factory class should support the following functions:
 * - create()
 * - createNext(prevRenderable)
 * - createPrevious(nextRenderable)
 * - destroy(renderable) (optional)
 *
 * Example:
 *
 * ```javascript
 * var VirtualViewSequence = require('famous-flex/VirtualViewSequence');
 *
 * // Factory for creating surfaces
 * function MyFactory() {}
 * MyFactory.prototype.create = function(index) {
 *   var surface = new Surface({
 *     size: [undefined, 100],
 *     classes: ['my-surface']
 *   });
 *   surface.index = index || 0; // add property to renderable
 *   return surface;
 * };
 * MyFactory.prototype.createNext = function(renderable) {
 *   return this.create(renderable.index + 1);
 * };
 * MyFactory.prototype.createPrevious = function(renderable) {
 *   return this.create(renderable.index - 1);
 * };
 *
 * // Create infinite scrollview
 * var viewSequence = new VirtualViewSequence({
 *   factory: new MyFactory()
 * });
 * var scrollView = new FlexScrollView({
 *   dataSource: viewSequence
 * });
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var EventHandler = require('famous/core/EventHandler');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {Object} options.factory Factory delegate for creating new renderables.
     * @param {Renderable} [options.value] Renderable for this node (when omitted, `factory.create()` is called)
     * @param {Number} [options.index] Index of this node (default: 0).
     * @alias module:VirtualViewSequence
     */
    function VirtualViewSequence(options) {
        options = options || {};
        this._ = options._ || new (this.constructor.Backing)(options);
        this.touched = true;
        this.value = options.value || this._.factory.create();
        this.index = options.index || 0;
        this.next = options.next;
        this.prev = options.prev;
        EventHandler.setOutputHandler(this, this._.eventOutput);
        this.value.pipe(this._.eventOutput);
    }

    VirtualViewSequence.Backing = function Backing(options) {
        this.factory = options.factory;
        this.eventOutput = new EventHandler();
    };

    /**
     * Get previous node.
     *
     * When no previous node exists, the factory-delegate function `createPrevious`
     * is called to construct a renderable for the previous node. When `createPrevious`
     * returns `undefined`, no previous-node will be created.
     *
     * @return {VirtualViewSequence} previous node.
     */
    VirtualViewSequence.prototype.getPrevious = function(noCreate) {
        if (this.prev) {
            this.prev.touched = true;
            return this.prev;
        }
        if (noCreate) {
            return undefined;
        }
        var value = this._.factory.createPrevious(this.get());
        if (!value) {
            return undefined;
        }
        //console.log('creating new prev node');
        this.prev = new VirtualViewSequence({
            _: this._,
            value: value,
            index: this.index - 1,
            next: this
        });
        return this.prev;
    };

    /**
     * Get next node.
     *
     * When no next node exists, the factory-delegate function `createNext`
     * is called to construct a renderable for the next node. When `createNext`
     * returns `undefined`, no next-node will be created.
     *
     * @return {VirtualViewSequence} next node.
     */
    VirtualViewSequence.prototype.getNext = function(noCreate) {
        if (this.next) {
            this.next.touched = true;
            return this.next;
        }
        if (noCreate) {
            return undefined;
        }
        var value = this._.factory.createNext(this.get());
        if (!value) {
            return undefined;
        }
        //console.log('creating new next node');
        this.next = new VirtualViewSequence({
            _: this._,
            value: value,
            index: this.index + 1,
            prev: this
        });
        return this.next;
    };

    /**
     * Get the value of this node.
     *
     * @return {Renderable} surface/view
     */
    VirtualViewSequence.prototype.get = function() {
        this.touched = true;
        return this.value;
    };

    /**
     * Get the index of the node.
     *
     * @return {Number} Index of node.
     */
    VirtualViewSequence.prototype.getIndex = function() {
        this.touched = true;
        return this.index;
    };

    /**
     * Get human readable string verion of the node.
     *
     * @return {String} node as a human readable string
     */
    VirtualViewSequence.prototype.toString = function() {
        return '' + this.index;
    };

    /**
     * Cleans up any un-accessed nodes since the previous call to `cleanup`.
     *
     * This function cleans up any nodes that have not been accessed
     * since the last call to `cleanup`. When a node is accessed
     * through a call to `getNext`, `getPrevious`, `get` or `getIndex`
     * it is considered `touched` and should not be cleaned up.
     *
     * @return {VirtualViewSequence} this.
     */
    VirtualViewSequence.prototype.cleanup = function() {
        var node = this.prev;
        while (node) {
            if (!node.touched) {
                node.next.prev = undefined;
                node.next = undefined;
                if (this._.factory.destroy) {
                    while (node) {
                        this._.factory.destroy(node.value);
                        node = node.prev;
                    }
                }
                break;
            }
            node.touched = false;
            node = node.prev;
        }
        node = this.next;
        while (node) {
            if (!node.touched) {
                node.prev.next = undefined;
                node.prev = undefined;
                if (this._.factory.destroy) {
                    while (node) {
                        this._.factory.destroy(node.value);
                        node = node.next;
                    }
                }
                break;
            }
            node.touched = false;
            node = node.next;
        }
        return this;
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.unshift = function() {
        if (console.error) {
            console.error('VirtualViewSequence.unshift is not supported and should not be called');
        }
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.push = function() {
        if (console.error) {
            console.error('VirtualViewSequence.push is not supported and should not be called');
        }
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.splice = function() {
        if (console.error) {
            console.error('VirtualViewSequence.splice is not supported and should not be called');
        }
    };

    /**
     * Not supported
     * @private
     */
    VirtualViewSequence.prototype.swap = function() {
        if (console.error) {
            console.error('VirtualViewSequence.swap is not supported and should not be called');
        }
    };

    module.exports = VirtualViewSequence;
});

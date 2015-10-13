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
 * @private
 */
function assert(value, message) {
    if (!value) {
        //debugger;
        throw new Error(message);
    }
}

/**
 * Linked-list based implementation of a view-sequence which fixes
 * several issues in the stock famo.us ViewSequence.
 *
 * @module
 */
define(function(require, exports, module) {

    /**
     * @class
     * @param {Object} options Configurable options.
     * @alias module:LinkedListViewSequence
     */
    function LinkedListViewSequence(items) {
        if (Array.isArray(items)) {
            this._ = new (this.constructor.Backing)(this);
            for (var i = 0; i < items.length; i++) {
                this.push(items[i]);
            }
        }
        else {
            this._ = items || new (this.constructor.Backing)(this);
        }
    }

    LinkedListViewSequence.Backing = function Backing() {
        this.length = 0;
        //this.head = undefined;
        //this.tail = undefined;
    };

    /*LinkedListViewSequence.prototype.verifyIntegrity = function() {
        var item = this._.head;
        var count = 0;
        while (item) {
          assert(item._value, 'no rendernode at index: ' + count);
          count++;
          assert(count <= this._.length, 'head -> tail, node-count exceeds length: ' + count + ' > ' + this._.length);
          item = item._next;
        }
        assert(count === this._.length, 'head -> tail, different count: ' + count + ' != ' + this._.length);
        item = this._.tail;
        count = 0;
        while (item) {
          count++;
          assert(count <= this._.length, 'tail -> head, node-count exceeds length: ' + count + ' > ' + this._.length);
          item = item._prev;
        }
        assert(count === this._.length, 'tail -> head, different count: ' + count + ' != ' + this._.length);
    };*/

    /**
     * Get head node.
     *
     * @return {LinkedListViewSequence} head node.
     */
    LinkedListViewSequence.prototype.getHead = function() {
        return this._.head;
    };

    /**
     * Get tail node.
     *
     * @return {LinkedListViewSequence} tail node.
     */
    LinkedListViewSequence.prototype.getTail = function() {
        return this._.tail;
    };

    /**
     * Get previous node.
     *
     * @return {LinkedListViewSequence} previous node.
     */
    LinkedListViewSequence.prototype.getPrevious = function() {
        return this._prev;
    };

    /**
     * Get next node.
     *
     * @return {LinkedListViewSequence} next node.
     */
    LinkedListViewSequence.prototype.getNext = function() {
        return this._next;
    };

    /**
     * Gets the value of this node.
     *
     * @return {Renderable} surface/view
     */
    LinkedListViewSequence.prototype.get = function() {
        return this._value;
    };

    /**
     * Sets the value of this node.
     *
     * @param {Renderable} value surface/view
     * @return {LinkedListViewSequence} this
     */
    LinkedListViewSequence.prototype.set = function(value) {
        this._value = value;
        return this;
    };

    /**
     * Get the index of the node.
     *
     * @return {Number} Index of node.
     */
    LinkedListViewSequence.prototype.getIndex = function() {
        return this._value ? this.indexOf(this._value) : 0;
    };

    /**
     * Get human readable string verion of the node.
     *
     * @return {String} node as a human readable string
     */
    LinkedListViewSequence.prototype.toString = function() {
        return '' + this.getIndex();
    };

    /**
     * Finds the index of a given render-node.
     *
     * @param {Renderable} item Render-node to find.
     * @return {Number} Index or -1 when not found.
     */
    LinkedListViewSequence.prototype.indexOf = function(item) {
        var sequence = this._.head;
        var index = 0;
        while (sequence) {
            if (sequence._value === item) {
                return index;
            }
            index++;
            sequence = sequence._next;
        }
        return -1;
    };

    /**
     * Finds the view-sequence item at the given index.
     *
     * @param {Number} index 0-based index.
     * @return {LinkedListViewSequence} View-sequence node or undefined.
     */
    LinkedListViewSequence.prototype.findByIndex = function(index) {
        index = (index === -1) ? (this._.length - 1) : index;
        if ((index < 0) || (index >= this._.length)) {
            return undefined;
        }

        // search for specific index
        var searchIndex;
        var searchSequence;
        if (index > (this._.length / 2)) {
            // start searching from the tail
            searchSequence = this._.tail;
            searchIndex = this._.length - 1;
            while (searchIndex > index) {
                searchSequence = searchSequence._prev;
                searchIndex--;
            }
        }
        else {
            // start searching from the head
            searchSequence = this._.head;
            searchIndex = 0;
            while (searchIndex < index) {
                searchSequence = searchSequence._next;
                searchIndex++;
            }
        }
        return searchSequence;
    };

    /**
     * Finds the view-sequence node by the given renderable.
     *
     * @param {Renderable} value Render-node to search for.
     * @return {LinkedListViewSequence} View-sequence node or undefined.
     */
    LinkedListViewSequence.prototype.findByValue = function(value) {
        var sequence = this._.head;
        while (sequence) {
            if (sequence.get() === value) {
                return sequence;
            }
            sequence = sequence._next;
        }
        return undefined;
    };

    /**
     * Inserts an item into the view-sequence.
     *
     * @param {Number} index 0-based index (-1 inserts at the tail).
     * @param {Renderable} renderNode Renderable to insert.
     * @return {LinkedListViewSequence} newly inserted view-sequence node.
     */
    LinkedListViewSequence.prototype.insert = function(index, renderNode) {
        index = (index === -1) ? this._.length : index;
        /*if (this._.debug) {
            console.log(this._.logName + ': insert (length: ' + this._.length + ')');
        }*/
        if (!this._.length) {
            assert(index === 0, 'inserting in empty view-sequence, but not at index 0 (but ' + index + ' instead)');
            this._value = renderNode;
            this._.head = this;
            this._.tail = this;
            this._.length = 1;
            //this.verifyIntegrity();
            return this;
        }
        var sequence;
        if (index === 0) {
            // insert at head (quick!)
            sequence = new LinkedListViewSequence(this._);
            sequence._value = renderNode;
            sequence._next = this._.head;
            this._.head._prev = sequence;
            this._.head = sequence;
        }
        else if (index === this._.length) {
            // insert at tail (quick!)
            sequence = new LinkedListViewSequence(this._);
            sequence._value = renderNode;
            sequence._prev = this._.tail;
            this._.tail._next = sequence;
            this._.tail = sequence;
        }
        else {
            // search for specific index (slow!) ... but fricking solid famo.us...
            var searchIndex;
            var searchSequence;
            assert((index > 0) && (index < this._.length), 'invalid insert index: ' + index + ' (length: ' + this._.length + ')');
            if (index > (this._.length / 2)) {
                // start searching from the tail
                searchSequence = this._.tail;
                searchIndex = this._.length - 1;
                while (searchIndex >= index) {
                    searchSequence = searchSequence._prev;
                    searchIndex--;
                }
            }
            else {
                // start searching from the head
                searchSequence = this._.head;
                searchIndex = 1;
                while (searchIndex < index) {
                    searchSequence = searchSequence._next;
                    searchIndex++;
                }
            }
            // insert after searchSequence
            sequence = new LinkedListViewSequence(this._);
            sequence._value = renderNode;
            sequence._prev = searchSequence;
            sequence._next = searchSequence._next;
            searchSequence._next._prev = sequence;
            searchSequence._next = sequence;
        }
        this._.length++;
        //this.verifyIntegrity();
        return sequence;
    };

    /**
     * Removes the view-sequence item at the given index.
     *
     * @param {LinkedListViewSequence} sequence Node to remove
     * @return {LinkedListViewSequence} New current view-sequence node to display.
     */
    LinkedListViewSequence.prototype.remove = function(sequence) {
        /*if (this._.debug) {
            console.log(this._.logName + ': remove (length: ' + this._.length + ')');
        }*/
        if (sequence._prev && sequence._next) {
            sequence._prev._next = sequence._next;
            sequence._next._prev = sequence._prev;
            this._.length--;
            //this.verifyIntegrity();
            return (sequence === this) ? sequence._prev : this;
        }
        else if (!sequence._prev && !sequence._next) {
            assert(sequence === this, 'only one sequence exists, should be this one');
            assert(this._value, 'last node should have a value');
            assert(this._.head, 'head is invalid');
            assert(this._.tail, 'tail is invalid');
            assert(this._.length === 1, 'length should be 1');
            this._value = undefined;
            this._.head = undefined;
            this._.tail = undefined;
            this._.length--;
            //this.verifyIntegrity();
            return this;
        }
        else if (!sequence._prev) {
            assert(this._.head === sequence, 'head is invalid');
            sequence._next._prev = undefined;
            this._.head = sequence._next;
            this._.length--;
            //this.verifyIntegrity();
            return (sequence === this) ? this._.head : this;
        }
        else {
            assert(!sequence._next, 'next should be empty');
            assert(this._.tail === sequence, 'tail is invalid');
            sequence._prev._next = undefined;
            this._.tail = sequence._prev;
            this._.length--;
            //this.verifyIntegrity();
            return (sequence === this) ? this._.tail : this;
        }
    };

    /**
     * Gets the number of items in the view-sequence.
     *
     * @return {Number} length.
     */
    LinkedListViewSequence.prototype.getLength = function() {
        return this._.length;
    };

    /**
     * Removes all items.
     *
     * @return {LinkedListViewSequence} Last remaining view-sequence node.
     */
    LinkedListViewSequence.prototype.clear = function() {
        var sequence = this; //eslint-disable-line consistent-this
        while (this._.length) {
          sequence = sequence.remove(this._.tail);
        }
        //sequence.verifyIntegrity();
        return sequence;
    };

    /**
     * Inserts an item at the beginning of the view-sequence.
     *
     * @param {Renderable} renderNode Renderable to insert.
     * @return {LinkedListViewSequence} newly inserted view-sequence node.
     */
    LinkedListViewSequence.prototype.unshift = function(renderNode) {
        return this.insert(0, renderNode);
    };

    /**
     * Inserts an item at the end of the view-sequence.
     *
     * @param {Renderable} renderNode Renderable to insert.
     * @return {LinkedListViewSequence} newly inserted view-sequence node.
     */
    LinkedListViewSequence.prototype.push = function(renderNode) {
        return this.insert(-1, renderNode);
    };

    LinkedListViewSequence.prototype.splice = function(index, remove, items) {
        if (console.error) {
            console.error('LinkedListViewSequence.splice is not supported');
        }
    };

    /**
     * Swaps the values of two view-sequence nodes.
     *
     * @param {Number} index Index of the first item to swap.
     * @param {Number} index2 Index of item to swap with.
     * @return {LinkedListViewSequence} this
     */
    LinkedListViewSequence.prototype.swap = function(index, index2) {
        var sequence1 = this.findByIndex(index);
        if (!sequence1) {
            throw new Error('Invalid first index specified to swap: ' + index);
        }
        var sequence2 = this.findByIndex(index2);
        if (!sequence2) {
            throw new Error('Invalid second index specified to swap: ' + index2);
        }
        var swap = sequence1._value;
        sequence1._value = sequence2._value;
        sequence2._value = swap;
        //this.verifyIntegrity();
        return this;
    };

    module.exports = LinkedListViewSequence;
});

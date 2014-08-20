/**
 * Copyright (c) 2014 Gloey Apps
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define, console*/
/*eslint no-console:0*/

/**
 * @module
 */
define(function(require, exports, module) {

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:LayoutContext
     */
    function LayoutUtility(options) {
    }

    /**
     *  Normalizes the margins argument.
     *
     *  @param {Array.Number} margins
     */
    var zeroMargins = [0, 0, 0, 0];
    LayoutUtility.normalizeMargins = function(margins) {
        if (!margins || (margins.length === 0)) {
            return zeroMargins;
        } else if (margins.length === 1) {
            return [margins[0], margins[0], margins[0], margins[0]];
        } else if (margins.length === 2) {
            return [margins[0], margins[1], margins[0], margins[1]];
        }
        else {
            return margins;
        }
    };

    function _resolveSizeValue(value, parentValue) {
        if ((value === undefined) || (value === true)){
            return parentValue;
        } else if (value instanceof String) {
            // todo e.g. handle 50% ?
            return parseInt(value);
        }
        else {
            return value;
        }
    }

    /**
     * Resolves the gives size into a fixed size.  E.g., if the size is e.g.
     * [50, undefined]), then the retured size would have a width of 50, and
     * would try to resolve `undefined` using the `defaultSize` and `parentSize`.
     * The size is resolved in the following order:
     * - width/height as specified in `size`
     * - width/height as specified in `defaultSize`
     * - width/height as specified in `parentSize`
     *
     * @param {Array.Number} size size to resolve
     * @param {Array.Number} parentSize parent-size
     * @param {Array.Number} [defaultSize] default-size to use
     * @return {Array.Number} resolved size
     */
    LayoutUtility.resolveSize = function(size, parentSize, defaultSize) {
        return [
            _resolveSizeValue(size ? size[0] : (defaultSize ? defaultSize[0] : undefined), parentSize[0]),
            _resolveSizeValue(size ? size[1] : (defaultSize ? defaultSize[1] : undefined), parentSize[1])
        ];
    };

    /**
     * Makes a (shallow) copy of a spec.
     *
     * @param {Object} spec Spec to clone
     * @return {Object} cloned spec
     */
    LayoutUtility.cloneSpec = function(spec) {
        var clone = {};
        if (spec.opacity !== undefined) {
            clone.opacity = spec.opacity;
        }
        if (spec.size !== undefined) {
            clone.size = spec.size.slice(0);
        }
        if (spec.transform !== undefined) {
            clone.transform = spec.transform.slice(0);
        }
        return clone;
    };

    /**
     * Clears the contents of a spec.
     *
     * @param {Object} spec Spec to clear
     * @return {Object} spec
     */
    LayoutUtility.clearSpec = function(spec) {
        delete spec.opacity;
        delete spec.size;
        delete spec.transform;
        return spec;
    };

    /**
     * Compares two arrays for equality.
     */
    function _isEqualArray(a, b) {
        if (a === b) {
            return true;
        }
        if ((a === undefined) || (b === undefined)) {
            return false;
        }
        var i = a.length;
        if (i !== b.length){
            return false;
        }
        while (i--) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Compares two specs for equality.
     *
     * @param {Object} spec1 Spec to compare
     * @param {Object} spec2 Spec to compare
     * @return {Bool} true/false
     */
    LayoutUtility.isEqualSpec = function(spec1, spec2) {
        if (spec1.opacity !== spec2.opacity) {
            return false;
        }
        if (!_isEqualArray(spec1.size, spec2.size)) {
            return false;
        }
        if (!_isEqualArray(spec1.transform, spec2.transform)) {
            return false;
        }
        return true;
    };

    /**
     * Helper function to call whenever a critical error has occurred.
     *
     * @param {String} message error-message
     */
    LayoutUtility.error = function(message) {
        console.log('ERROR: ' + message);
        throw message;
    };

    /**
     * Helper function to log 1 or more arguments. All the arguments
     * are concatenated to produce a single string which is logged.
     *
     * @param {String|Array|Object} arguments arguments to stringify and concatenate
     */
    LayoutUtility.log = function() {
        var message = '';
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if ((arg instanceof Object) || (arg instanceof Array)) {
                message += JSON.stringify(arg);
            }
            else {
                message += arg;
            }
        }
        console.log(message);
    };

    // Layout function
    module.exports = LayoutUtility;
});

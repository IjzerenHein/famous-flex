/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define, console*/
/*eslint no-console:0*/

/**
 * Utility class for famous-flex.
 *
 * @module
 */
define(function(require, exports, module) {

    /**
     * @class
     * @alias module:LayoutUtility
     */
    function LayoutUtility() {
    }
    LayoutUtility.registeredHelpers = {};

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

    /**
     * Makes a (shallow) copy of a spec.
     *
     * @param {Spec} spec Spec to clone
     * @return {Spec} cloned spec
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
        if (spec.origin !== undefined) {
            clone.origin = spec.origin.slice(0);
        }
        if (spec.align !== undefined) {
            clone.align = spec.align.slice(0);
        }
        return clone;
    };

    /**
     * Clears the contents of a spec.
     *
     * @param {Spec} spec Spec to clear
     * @return {Spec} spec
     */
    LayoutUtility.clearSpec = function(spec) {
        delete spec.opacity;
        delete spec.size;
        delete spec.transform;
        delete spec.origin;
        delete spec.align;
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
     * @param {Spec} spec1 Spec to compare
     * @param {Spec} spec2 Spec to compare
     * @return {Boolean} true/false
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
        if (!_isEqualArray(spec1.origin, spec2.origin)) {
            return false;
        }
        if (!_isEqualArray(spec1.align, spec2.align)) {
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
     * Helper function to call whenever a warning error has occurred.
     *
     * @param {String} message warning-message
     */
    LayoutUtility.warning = function(message) {
        console.log('WARNING: ' + message);
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

    /**
     * Registers a layout-helper so it can be used as a layout-literal for
     * a layout-controller. The LayoutHelper instance must support the `parse`
     * function, which is fed the layout-literal content.
     *
     * **Example:**
     *
     * ```javascript
     * Layout.registerHelper('dock', LayoutDockHelper);
     *
     * var layoutController = new LayoutController({
     *   layout: { dock: [,
     *     ['top', 'header', 50],
     *     ['bottom', 'footer', 50],
     *     ['fill', 'content'],
     *   ]},
     *   dataSource: {
     *     header: new Surface({content: 'Header'}),
     *     footer: new Surface({content: 'Footer'}),
     *     content: new Surface({content: 'Content'}),
     *   }
     * })
     * ```
     *
     * @param {String} name name of the helper (e.g. 'dock')
     * @param {Function} Helper Helper to register (e.g. LayoutDockHelper)
     */
    LayoutUtility.registerHelper = function(name, Helper) {
        if (!Helper.prototype.parse) {
            LayoutUtility.error('The layout-helper for name "' + name + '" is required to support the "parse" method');
        }
        if (this.registeredHelpers[name] !== undefined) {
            LayoutUtility.warning('A layout-helper with the name "' + name + '" is already registered and will be overwritten');
        }
        this.registeredHelpers[name] = Helper;
    };

    /**
     * Unregisters a layout-helper.
     *
     * @param {String} name name of the layout-helper
     */
    LayoutUtility.unregisterHelper = function(name) {
        delete this.registeredHelpers[name];
    };

    /**
     * Gets a registered layout-helper by its name.
     *
     * @param {String} name name of the layout-helper
     * @return {Function} layout-helper or undefined
     */
    LayoutUtility.getRegisteredHelper = function(name) {
        return this.registeredHelpers[name];
    };

    // Layout function
    module.exports = LayoutUtility;
});

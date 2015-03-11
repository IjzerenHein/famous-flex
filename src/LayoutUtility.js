/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global console*/
/*eslint no-console:0*/

/**
 * Utility class for famous-flex.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var Utility = require('famous/utilities/Utility');

    /**
     * @class
     * @alias module:LayoutUtility
     */
    function LayoutUtility() {
    }
    LayoutUtility.registeredHelpers = {};

    var Capabilities = {
        SEQUENCE: 1,
        DIRECTION_X: 2,
        DIRECTION_Y: 4,
        SCROLLING: 8
    };
    LayoutUtility.Capabilities = Capabilities;

    /**
     *  Normalizes the margins argument.
     *
     *  @param {Array.Number} margins
     */
    LayoutUtility.normalizeMargins = function(margins) {
        if (!margins) {
            return [0, 0, 0, 0];
        }
        else if (!Array.isArray(margins)) {
            return [margins, margins, margins, margins];
        }
        else if (margins.length === 0) {
            return [0, 0, 0, 0];
        }
        else if (margins.length === 1) {
            return [margins[0], margins[0], margins[0], margins[0]];
        }
        else if (margins.length === 2) {
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
     * Helper function that returns a string containing the differences
     * between two specs.
     *
     * @param {Spec} spec1 Spec to compare
     * @param {Spec} spec2 Spec to compare
     * @return {String} text
     */
    LayoutUtility.getSpecDiffText = function(spec1, spec2) {
        var result = 'spec diff:';
        if (spec1.opacity !== spec2.opacity) {
            result += '\nopacity: ' + spec1.opacity + ' != ' + spec2.opacity;
        }
        if (!_isEqualArray(spec1.size, spec2.size)) {
            result += '\nsize: ' + JSON.stringify(spec1.size) + ' != ' + JSON.stringify(spec2.size);
        }
        if (!_isEqualArray(spec1.transform, spec2.transform)) {
            result += '\ntransform: ' + JSON.stringify(spec1.transform) + ' != ' + JSON.stringify(spec2.transform);
        }
        if (!_isEqualArray(spec1.origin, spec2.origin)) {
            result += '\norigin: ' + JSON.stringify(spec1.origin) + ' != ' + JSON.stringify(spec2.origin);
        }
        if (!_isEqualArray(spec1.align, spec2.align)) {
            result += '\nalign: ' + JSON.stringify(spec1.align) + ' != ' + JSON.stringify(spec2.align);
        }
        return result;
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
     * @param {String|Array|Object} args arguments to stringify and concatenate
     */
    LayoutUtility.log = function(args) {
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
     * Combines two sets of options into a single set.
     *
     * @param {Object} options1 base set of options
     * @param {Object} options2 set of options to merge into `options1`
     * @param {Bool} [forceClone] ensures that a clone is returned rather that one of the original options objects
     * @return {Object} Combined options
     */
    LayoutUtility.combineOptions = function(options1, options2, forceClone) {
        if (options1 && !options2 && !forceClone) {
            return options1;
        }
        else if (!options1 && options2 && !forceClone) {
            return options2;
        }
        var options = Utility.clone(options1 || {});
        if (options2) {
            for (var key in options2) {
                options[key] = options2[key];
            }
        }
        return options;
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

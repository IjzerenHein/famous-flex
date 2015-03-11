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
/*eslint no-console: 0*/

/**
 * DEPRECATED - this layout has been merged into ListLayout, use ListLayout instead.
 *
 * This module will be removed in the future, please switch to ListLayout.
 *
 * @module
 */
define(function(require, exports, module) {
	if (console.warn) {
		console.warn('TableLayout has been deprecated and will be removed in the future, use ListLayout instead');
	}
    module.exports = require('./ListLayout');
});

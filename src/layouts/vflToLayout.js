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
/*eslint no-console: 0*/

/**
 * Lays out renderables based on Apple's Visual Format Language.
 *
 * @module
 */
define(function(require, exports, module) {

	// import dependencies
	var AutoLayout = require('autolayout');

	function vflToLayout(visualFormat, options) {
		var view = new AutoLayout.View(options);
		try {
			var constraints = AutoLayout.VisualFormat.parse(visualFormat, {extended: true, strict: false});
			var metaInfo = AutoLayout.VisualFormat.parseMetaInfo(visualFormat);
			view.addConstraints(constraints);
			return function(context) {
				var key;
				var subView;
				for (key in metaInfo.widths) {
					subView = view.subViews[key];
					if (subView) {
						subView.intrinsicWidth = (metaInfo.widths[key] === true) ? context.resolveSize(key, context.size)[0] : metaInfo.widths[key];
					}
				}
				for (key in metaInfo.heights) {
					subView = view.subViews[key];
					if (subView) {
						subView.intrinsicHeight = (metaInfo.heights[key] === true) ? context.resolveSize(key, context.size)[1] : metaInfo.heights[key];
					}
				}
				view.setSize(context.size[0], context.size[1]);
				for (key in view.subViews) {
					subView = view.subViews[key];
					if ((key.indexOf('_') !== 0) && (subView.type !== 'stack')) {
						context.set(subView.name, {
							size: [subView.width, subView.height],
							translate: [subView.left, subView.top, subView.zIndex * 5]
						});
					}
				}
			};
		}
		catch (err) {
			console.log(err); //eslint-disable-line no-console
		}
	}

    module.exports = vflToLayout;
});

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
 * TODO
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var BaseLayoutController = require('./BaseLayoutController');
    var LayoutNodeManager = require('./LayoutNodeManager');
    var LayoutNode = require('./LayoutNode');

    /**
     * @class
     * @param {Object} options Options.
     * @alias module:LayoutController
     */
    function LayoutController(options) {
        BaseLayoutController.apply(this, arguments);

        // Create node manager that manages result LayoutNode instances
        this._nodes = new LayoutNodeManager(function(renderNode) {
            return new LayoutNode(renderNode)
        });
    }
    LayoutController.prototype = Object.create(BaseLayoutController.prototype);
    LayoutController.prototype.constructor = LayoutController;

    /**
     * Re-flows the layout based on the given size
     */
    LayoutController.prototype._reflowLayout = function(size) {

        // Prepare for layout
        var context = this._nodes.prepareForLayout(
            this._viewSequence,     // first node to layout
            this._nodesById         // so we can do fast id lookups
        );

        // Layout objects
        this._layout(
            size,                   // size to layout renderables into
            context,                // context which the layout-function can use 
            this._layoutOptions     // additional layout-options
        );

        // Return render spec
        return this._nodes.buildSpecAndDestroyUnrenderedNodes();
    };

    module.exports = LayoutController;
});

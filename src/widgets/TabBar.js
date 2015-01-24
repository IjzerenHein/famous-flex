/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/*global define, console*/
/*eslint no-use-before-define:0, no-console:0 */

/**
 * TabBar widget for famo.us.
 *
 * Example:
 *
 * ```javascript
 * var TabBar = require('famous-flex/widgets/TabBar');
 *
 * var tabBar = new TabBar({
 *   layoutOptions: {
 *   });
 * });
 * tabBar.setTabs([
 * ]);
 * this.add(tabBar); // add to the render-tree
 *
 * tabBar.on('tabchange', function(event) {
 *   console.log('new tab selected');
 * });
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var LayoutController = require('../LayoutController');
    var TabBarLayout = require('../layouts/TabBarLayout');

    /**
     * @class
     * @extends View
     * @param {Object} options Configurable options.
     * @param {Object} [options.tabBarLayout] Layout-options that are passed to the TabBarLayout.
     * @param {Array} [items] Tab item renderables (see `setItems`).
     * @alias module:TabBar
     */
    function TabBar(options) {
        View.apply(this, arguments);

        this._dataSource = {
            items: [],
            selectedItemOverlay: undefined
        };
        this._selectedItemIndex = 0;

        _createLayout.call(this);
        _updateDataSource.call(this);

        this.setOptions(this.options);
    }
    TabBar.prototype = Object.create(View.prototype);
    TabBar.prototype.constructor = TabBar;

    TabBar.DEFAULT_OPTIONS = {
        tabBarLayout: {
            margins: [0, 0, 0, 0],
            spacing: 0,
            selectedItemIndex: 0
        },
        layoutController: {
            autoPipeEvents: true,
            layout: TabBarLayout,
            flow: true,
            relowOnResize: false,
            nodeSpring: {
                dampingRatio: 0.8,
                period: 300
            }
        }
    };

    function _createLayout() {
        this.layout = new LayoutController(this.options.layoutController);
        this.add(this.layout);
        this.layout.pipe(this._eventOutput);
    }

    function _setSelectedItem(index) {
        if (index !== this._selectedItemIndex) {
            this._selectedItemIndex = index;
            this.layout.setLayoutOptions({
                selectedItemIndex: index
            });
        }
    }

    function _updateDataSource() {
        this.layout.setDataSource(this._dataSource);
        for (var i = 0; i < this._dataSource.items.length; i++) {
            var item = this._dataSource.items[i];
            item.on('click', _setSelectedItem.bind(this, i));
        }
    }

    /**
     * Patches the TabBar instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options.
     * @param {Object} [options.tabBarLayout] Layout-options that are passed to the TabBarLayout.
     * @return {TabBar} this
     */
    TabBar.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (!this.layout) {
            return this;
        }
        if (options.tabBarLayout !== undefined) {
            this.layout.setLayoutOptions(options.tabBarLayout);
        }
        return this;
    };

    /**
     * Sets the items for the tab-bar.
     *
     * @param {Array} items Array of tab-item renderables.
     * @return {TabBar} this
     */
    TabBar.prototype.setItems = function(items) {
        this._dataSource.items = items;
        _updateDataSource.call(this);
        return this;
    };

    /**
     * Get the tab-item renderables for the tab-bar.
     *
     * @return {Array} tab-item renderables
     */
    TabBar.prototype.getItems = function() {
        return this._dataSource.items;
    };

    /**
     * Sets the items for the tab-bar.
     *
     * @param {Renderable} selectedItemOverlay Array of tab-item renderables.
     * @return {TabBar} this
     */
    TabBar.prototype.setSelectedItemOverlay = function(selectedItemOverlay) {
        this._dataSource.selectedItemOverlay = selectedItemOverlay;
        _updateDataSource.call(this);
        return this;
    };

    /**
     * Get the tab-item renderables for the tab-bar.
     *
     * @return {Array} tab-item renderables
     */
    TabBar.prototype.getSelectedItemOverlay = function() {
        return this._dataSource.selectedItemOverlay;
    };

    /**
     * Sets the tabs for the tab-bar.
     *
     * @param {Number} index Array of tab-renderables.
     * @return {TabBar} this
     */
    TabBar.prototype.setSelectedItemIndex = function(index) {
        _setSelectedItem(index);
        return this;
    };

    /**
     * Get the tabs for the tab-bar.
     *
     * @return {Array} tabs
     */
    TabBar.prototype.getSelectedItemIndex = function() {
        return this._selectedItemIndex;
    };

    module.exports = TabBar;
});

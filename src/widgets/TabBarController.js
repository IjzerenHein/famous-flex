/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2015
 */

/**
 * TabBarController.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var AnimationController = require('../AnimationController');
    var TabBar = require('./TabBar');
    var LayoutDockHelper = require('../helpers/LayoutDockHelper');
    var LayoutController = require('../LayoutController');
    var Easing = require('famous/transitions/Easing');

    /**
     * @class
     * @param {Object} options Configurable options.
     * @param {TabBarController.Position} [options.tabBarPosition] Position (default: BOTTOM).
     * @param {Number} [options.tabBarSize] Size of the tabBar (default: 50).
     * @param {Number} [options.tabBarZIndex] Z-index the tabBar is put above the content (AnimationController) (default: 10).
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.animationController] Options that are passed to the AnimationController.
     * @alias module:TabBarController
     */
    function TabBarController(options) {
        View.apply(this, arguments);

        _createRenderables.call(this);
        _createLayout.call(this);
        _setListeners.call(this);

        this.tabBar.setOptions({
            layoutController: {
                direction: ((this.options.tabBarPosition === TabBarController.Position.TOP) || (this.options.tabBarPosition === TabBarController.Position.BOTTOM)) ? 0 : 1
            }
        });
    }
    TabBarController.prototype = Object.create(View.prototype);
    TabBarController.prototype.constructor = TabBarController;

    TabBarController.Position = {
        TOP: 0,
        BOTTOM: 1,
        LEFT: 2,
        RIGHT: 3
    };

    /**
     * Default layout-function for the TabBarController. Supports simple
     * docking to any of the four edges.
     */
    TabBarController.DEFAULT_LAYOUT = function(context, options) {
        var dock = new LayoutDockHelper(context, options);
        switch (this.options.tabBarPosition) {
            case TabBarController.Position.TOP:
                dock.top('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
            case TabBarController.Position.BOTTOM:
                dock.bottom('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
            case TabBarController.Position.LEFT:
                dock.left('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
            case TabBarController.Position.RIGHT:
                dock.right('tabBar', this.options.tabBarSize, this.options.tabBarZIndex);
                break;
        }
        dock.fill('content');
    };

    TabBarController.DEFAULT_OPTIONS = {
        tabBarPosition: TabBarController.Position.BOTTOM,
        tabBarSize: 50,
        tabBarZIndex: 10,
        tabBar: {
            createRenderables: {
                background: true
            }
        },
        animationController: {
            transition: {duration: 300, curve: Easing.inOutQuad},
            animation: AnimationController.Animation.FadedZoom
        }
    };

    /**
     * Creates the renderables (tabBar, animationController).
     */
    function _createRenderables() {
        this.tabBar = new TabBar(this.options.tabBar);
        this.animationController = new AnimationController(this.options.animationController);
        this._renderables = {
            tabBar: this.tabBar,
            content: this.animationController
        };
    }

    /**
     * Creates the outer (header-footer) layout.
     */
    function _createLayout() {
        this.layout = new LayoutController(this.options.layoutController);
        this.layout.setLayout(TabBarController.DEFAULT_LAYOUT.bind(this));
        this.layout.setDataSource(this._renderables);
        this.add(this.layout);
    }

    /**
     * Sets the listeners.
     */
    function _setListeners() {
        this.tabBar.on('tabchange', function(event) {
            _updateView.call(this, event);
            this._eventOutput.emit('tabchange', {
                target: this,
                index: event.index,
                oldIndex: event.oldIndex,
                item: this._items[event.index],
                oldItem: ((event.oldIndex >= 0) && (event.oldIndex < this._items.length)) ? this._items[event.oldIndex] : undefined
            });
        }.bind(this));
    }

    /**
     * Updates the view-container with the selected view.
     */
    function _updateView(event) {
        var index = this.tabBar.getSelectedItemIndex();
        this.animationController.halt();
        if (index >= 0) {
            this.animationController.show(this._items[index].view);
        }
        else {
            this.animationController.hide();
        }
    }

    /**
     * Patches the TabBarController instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options.
     * @param {TabBarController.Position} [options.tabBarPosition] Position (default: BOTTOM).
     * @param {Number} [options.tabBarSize] Size of the tabBar (default: 50).
     * @param {Number} [options.tabBarZIndex] Z-index the tabBar is put above the content (AnimationController) (default: 10).
     * @param {Object} [options.tabBar] Options that are passed to the TabBar.
     * @param {Object} [options.animationController] Options that are passed to the AnimationController.
     * @return {TabBarController} this
     */
    TabBarController.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (this.layout && options.layoutController) {
            this.layout.setOptions(options.layoutController);
        }
        if (this.tabBar && options.tabBar) {
            this.tabBar.setOptions(options.tabBar);
        }
        if (this.animationController && options.animationController) {
            this.animationController(options.animationController);
        }
        if (this.layout && (options.tabBarPosition !== undefined)) {
            this.tabBar.setOptions({
                layoutController: {
                    direction: ((options.tabBarPosition === TabBarController.Position.TOP) || (options.tabBarPosition === TabBarController.Position.BOTTOM)) ? 0 : 1
                }
            });
        }
        if (this.layout) {
            this.layout.reflowLayout();
        }
        return this;
    };

    /**
     * Sets the items for the tab-bar controller.
     *
     * Example 1:
     *
     * ```javascript
     * var tabBarController = new TabBarController();
     * tabBarController.setItems([
     *   {tabItem: 'Profile', view: new ProfileView()},
     *   {tabItem: 'Map', view: new MapView()},
     *   {tabItem: 'Login', view: new LoginView()}
     *   {tabItem: 'Settings', view: new SettingsView()}
     * ]);
     *```
     *
     * @param {Array} items Array of tab-bar controller items.
     * @return {TabBarController} this
     */
    TabBarController.prototype.setItems = function(items) {
        this._items = items;
        var tabItems = [];
        for (var i = 0; i < items.length; i++) {
            tabItems.push(items[i].tabItem);
        }
        this.tabBar.setItems(tabItems);
        _updateView.call(this);
        return this;
    };

    /**
     * Get the tab-items (also see `setItems`).
     *
     * @return {Array} tab-items
     */
    TabBarController.prototype.getItems = function() {
        return this._items;
    };

    /**
     * Sets the index of the selected tab.
     *
     * @param {Number} index selected index.
     * @return {TabBar} this
     */
    TabBarController.prototype.setSelectedItemIndex = function(index) {
        this.tabBar.setSelectedItemIndex(index);
        return this;
    };

    /**
     * Get the index of the selected tab-item.
     *
     * @return {Number} selected index
     */
    TabBarController.prototype.getSelectedItemIndex = function() {
        return this.tabBar.getSelectedItemIndex();
    };

    module.exports = TabBarController;
});

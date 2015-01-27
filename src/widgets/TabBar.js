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
    var Surface = require('famous/core/Surface');
    var View = require('famous/core/View');
    var LayoutController = require('../LayoutController');
    var TabBarLayout = require('../layouts/TabBarLayout');

    /**
     * @class
     * @extends View
     * @param {Object} options Configurable options.
     * @param {Object} [options.tabBarLayout] Layout-options that are passed to the TabBarLayout.
     * @param {Object} [options.layoutController] Options that are passed to the underlying layout-controller.
     * @alias module:TabBar
     */
    function TabBar(options) {
        View.apply(this, arguments);

        // init
        this._selectedItemIndex = -1;
        if (options && options.classes) {
            this.classes = this.classes.concat(options.classes);
        }

        // create TabBar layout
        this.layout = new LayoutController(this.options.layoutController);
        this.add(this.layout);
        this.layout.pipe(this._eventOutput);

        // create initial renderables
        this._renderables = {
            items: [],
            background: this.createRenderable('background'),
            selectedItemOverlay: this.createRenderable('selectedItemOverlay')
        };

        this.setOptions(this.options);
    }
    TabBar.prototype = Object.create(View.prototype);
    TabBar.prototype.constructor = TabBar;
    TabBar.prototype.classes = ['ff-widget', 'ff-tabbar'];

    TabBar.DEFAULT_OPTIONS = {
        tabBarLayout: {
            margins: [0, 0, 0, 0],
            spacing: 0
        },
        layoutController: {
            autoPipeEvents: true,
            layout: TabBarLayout,
            flow: true,
            reflowOnResize: false,
            nodeSpring: {
                dampingRatio: 0.8,
                period: 300
            }
        }
    };

    /**
     * Helper function that is called whenever a new item is selected
     */
    function _setSelectedItem(index) {
        if (index !== this._selectedItemIndex) {
            var oldIndex = this._selectedItemIndex;
            this._selectedItemIndex = index;
            this.layout.setLayoutOptions({
                selectedItemIndex: index
            });
            if (oldIndex >= 0) {
                this.updateRenderableState('item', this._renderables.items[oldIndex], 'selected', false);
            }
            this.updateRenderableState('item', this._renderables.items[index], 'selected', true);
            if (oldIndex >= 0) {
                this._eventOutput.emit('tabchange', {
                    target: this,
                    index: index,
                    oldIndex: oldIndex,
                    item: this._renderables.items[index]
                });
            }
        }
    }

    /**
     * Creates a new renderable for the given renderable-id.
     *
     * @param {String} id id of the renderable to create.
     * @param {String|Object|Renderable} [data] data-content passed to the renderable.
     * @return {TabBar} this
     */
    TabBar.prototype.createRenderable = function(id, data) {
        if ((data !== undefined) && (data instanceof Function)) {
            return data;
        }
        var surface = new Surface({
            classes: this.classes,
            content: data ? ('<div>' + data + '</div>') : undefined
        });
        surface.addClass(id);
        if (id === 'item') {
            if (this.options.size && ((this.options.size[0] === true) || (this.options.size[1] === true))) {
                surface.setSize(this.options.size);
            }
        }
        return surface;
    };

    /**
     * Adds or removes a state to or from a renderable.
     *
     * @param {String} id id of the renderable
     * @param {Renderable} renderable Renderable to update.
     * @param {String} state State to add or remove.
     * @param {Bool} value true = add, false = remove.
     * @return {TabBar} this
     */
    TabBar.prototype.updateRenderableState = function(id, renderable, state, value) {
        if (renderable) {
            if (value && renderable.addClass) {
                renderable.addClass(state);
            } else if (!value && renderable.removeClass) {
                renderable.removeClass(state);
            }
        }
        return this;
    };

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
     * Sets the renderable with the given id.
     *
     * @param {String} id id of the renderable
     * @param {Renderable} renderable Renderable to update.
     * @return {TabBar} this
     */
    TabBar.prototype.setRenderable = function(id, renderable) {
        this._renderables[id] = renderable;
        this.layout.setDataSource(this._renderables);
        return this;
    };

    /**
     * Get the renderable with the given id.
     *
     * @return {Renderable} Background renderable.
     */
    TabBar.prototype.getRenderable = function(id) {
        return this._renderables[id];
    };

    /**
     * Sets the items for the tab-bar.
     *
     * @param {Array} items Array of tab-item renderables.
     * @return {TabBar} this
     */
    TabBar.prototype.setItems = function(items) {
        var currentIndex = this._selectedItemIndex;
        this._selectedItemIndex = -1;
        this._renderables.items = [];
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var renderable = this.createRenderable('item', items[i]);
                renderable.on('click', _setSelectedItem.bind(this, i));
                this._renderables.items.push(renderable);
            }
        }
        this.layout.setDataSource(this._renderables);
        if (this._renderables.items.length) {
            _setSelectedItem.call(this, Math.max(Math.min(currentIndex, this._renderables.items.length - 1), 0));
        }
        return this;
    };

    /**
     * Get the tab-item renderables for the tab-bar.
     *
     * @return {Array} tab-item renderables
     */
    TabBar.prototype.getItems = function() {
        return this._renderables.items;
    };

    /**
     * Sets the index of the selected tab.
     *
     * @param {Number} index selected index.
     * @return {TabBar} this
     */
    TabBar.prototype.setSelectedItemIndex = function(index) {
        _setSelectedItem(index);
        return this;
    };

    /**
     * Get the index of the selected tab-item.
     *
     * @return {Number} selected index
     */
    TabBar.prototype.getSelectedItemIndex = function() {
        return this._selectedItemIndex;
    };

    module.exports = TabBar;
});

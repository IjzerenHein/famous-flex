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
 * TabBar widget for famo.us.
 *
 * ```javascript
 * var TabBar = require('famous-flex/widgets/TabBar');
 *
 * var tabBar = new TabBar({
 *   classes: ['black'],
 *   createRenderables: {
 *     background: true,
 *     selectedItemOverlay: true,
 *     spacers: true
 *   }
 * });
 * tabBar.setItems([
 *   'one',
 *   'two',
 *   'three'
 * ]);
 * this.add(tabBar); // add to the render-tree
 *
 * tabBar.on('tabchange', function(event) {
 *   console.log('new tab selected: ' + event.index);
 * });
 * ```
 *
 * The surfaces that are created, use the the css-classes `ff-widget` and `ff-tabbar`.
 * You can add additional css-classes by using the `classes` option in the constructor.
 *
 * Example css styles for a black theme:
 *
 * ```css
 * .ff-tabbar.background.black {
 *   background-color: #101010;
 * }
 * .ff-tabbar.item.black {
 *   color: #f7f3f7;
 * }
 * .ff-tabbar.selectedItemOverlay.black {
 *   border-bottom: 6px solid #30b6e7;
 * }
 * .ff-tabbar.spacer.black:after {
 *   content: "";
 *   background-color: #333333;
 *   width: 100%;
 *   top: 10px;
 *   bottom: 10px;
 *   position: absolute;
 * }
 * ```
 *
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
     * @param {Array.String} [options.classes] Css-classes that are added to the surfaces that are created.
     * @param {Object} [options.createRenderables] Options that specify which renderables should be created.
     * @alias module:TabBar
     */
    function TabBar(options) {
        View.apply(this, arguments);

        // init
        this._selectedItemIndex = -1;
        options = options || {};
        this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;

        // create TabBar layout
        this.layout = new LayoutController(this.options.layoutController);
        this.add(this.layout);
        this.layout.pipe(this._eventOutput);

        // create initial renderables
        this._renderables = {
            items: [],
            spacers: [],
            background: _createRenderable.call(this, 'background'),
            selectedItemOverlay: _createRenderable.call(this, 'selectedItemOverlay')
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
        createRenderables: {
            item: true,
            background: false,
            selectedItemOverlay: false,
            spacer: false
        },
        layoutController: {
            autoPipeEvents: true,
            layout: TabBarLayout,
            flow: true,
            flowOptions: {
                reflowOnResize: false,
                spring: {
                    dampingRatio: 0.8,
                    period: 300
                }
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
            if ((oldIndex >= 0) && this._renderables.items[oldIndex].removeClass){
                this._renderables.items[oldIndex].removeClass('selected');
            }
            if (this._renderables.items[index].addClass) {
                this._renderables.items[index].addClass('selected');
            }
            if (oldIndex >= 0) {
                this._eventOutput.emit('tabchange', {
                    target: this,
                    index: index,
                    oldIndex: oldIndex,
                    item: this._renderables.items[index],
                    oldItem: ((oldIndex >= 0) && (oldIndex < this._renderables.items.length)) ? this._renderables.items[oldIndex] : undefined
                });
            }
        }
    }

    /**
     * Creates a new renderable for the given renderable-id.
     *
     */
    function _createRenderable (id, data) {
        var option = this.options.createRenderables[id];
        if (option instanceof Function) {
            return option.call(this, id, data);
        }
        else if (!option) {
            return undefined;
        }
        if ((data !== undefined) && (data instanceof Object)) {
            return data;
        }
        var surface = new Surface({
            classes: this.classes,
            content: data ? ('<div>' + data + '</div>') : undefined
        });
        surface.addClass(id);
        if (id === 'item') {
            if (this.options.tabBarLayout && this.options.tabBarLayout.itemSize && (this.options.tabBarLayout.itemSize === true)) {
                surface.setSize(this.layout.getDirection() ? [undefined, true] : [true, undefined]);
            }
        }
        return surface;
    }

    /**
     * Patches the TabBar instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options.
     * @param {Object} [options.tabBarLayout] Layout-options that are passed to the TabBarLayout.
     * @param {Object} [options.layoutController] Options that are passed to the underlying layout-controller.
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
        if (options.layoutController) {
            this.layout.setOptions(options.layoutController);
        }
        return this;
    };

    /**
     * Sets the items for the tab-bar.
     *
     * Example 1:
     *
     * ```javascript
     * var tabBar = new TabBar();
     * tabBar.setItems([
     *   'one',
     *   'two',
     *   'three'
     * ]);
     *```
     *
     * Example using Ionic icons:
     *
     * ```javascript
     * var tabBar = new TabBar();
     * tabBar.setItems([
     *   '<div class="icon ion-flag"></div>Flag',
     *   '<div class="icon ion-map"></div>Map',
     *   '<div class="icon ion-gear-a"></div>Settings'
     * ]);
     *```
     *
     * CSS:
     *
     * ```css
     * .ff-tabbar.item {
     *   font-size: 12px;
     * }
     * .ff-tabbar.item .icon {
     *   font-size: 24px;
     * }
     * ```
     *
     * @param {Array} items Array of tab-item renderables.
     * @return {TabBar} this
     */
    TabBar.prototype.setItems = function(items) {
        var currentIndex = this._selectedItemIndex;
        this._selectedItemIndex = -1;
        this._renderables.items = [];
        this._renderables.spacers = [];
        if (items) {
            for (var i = 0; i < items.length; i++) {
                var item = _createRenderable.call(this, 'item', items[i]);
                if (item.on) {
                    item.on('click', _setSelectedItem.bind(this, i));
                }
                this._renderables.items.push(item);
                if ((i < (items.length - 1))) {
                    var spacer = _createRenderable.call(this, 'spacer', ' ');
                    if (spacer) {
                        this._renderables.spacers.push(spacer);
                    }
                }
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
     * Get the spec (size, transform, etc..) of the given tab-item.
     *
     * @param {Number} index Index of the tab-item.
     * @return {Spec} item spec
     */
    TabBar.prototype.getItemSpec = function(index, normalize) {
        return this.layout.getSpec(this._renderables.items[index], normalize);
    };

    /**
     * Sets the index of the selected tab.
     *
     * @param {Number} index selected index.
     * @return {TabBar} this
     */
    TabBar.prototype.setSelectedItemIndex = function(index) {
        _setSelectedItem.call(this, index);
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

    /**
     * Get the size of the widget.
     *
     * @return {Array} size.
     */
    TabBar.prototype.getSize = function() {
        return this.options.size || (this.layout ? this.layout.getSize() : View.prototype.getSize.call(this));
    };

    module.exports = TabBar;
});

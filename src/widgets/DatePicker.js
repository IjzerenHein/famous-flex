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
 * Date/time picker wheel for famo.us.
 *
 * This component can be used as a date/time picker, a clock or
 * any other application which requires a date/time wheel.
 *
 * Example:
 *
 * ```javascript
 * var DatePicker = require('famous-flex/widgets/DatePicker');
 *
 * var datePicker = new DatePicker({
 *   date: new Date(),        // initial date
 *   wheelLayout: {
 *     itemSize: 100,         // height of an item on the date/wheel
 *     diameter: 300,         // diameter of the wheel (undefined = 3 x itemSize)
 *     radialOpacity: 0       // opacity at the top and bottom diameter edge
 *   });
 * });
 * datePicker.setComponents([
 *   new DatePicker.Component.FullDay(),  // full-day component (year + month + day)
 *   new DatePicker.Component.Hour(),     // hour component (0..23)
 *   new DatePicker.Component.Minute()    // minute compoent (0..59)
 * ]);
 * this.add(datePicker); // add to the render-tree
 *
 * datePicker.on('datechange', function(event) {
 *   console.log('new date selected: ' + event.date.toLocaleString());
 * });
 * ```
 *
 * CSS:
 *
 * ```css
 * .ff-datepicker .item {
 *   color: blue;
 *   font-size: 30px;
 * }
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Utility = require('famous/utilities/Utility');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var LayoutController = require('../LayoutController');
    var ScrollController = require('../ScrollController');
    var WheelLayout = require('../layouts/WheelLayout');
    var ProportionalLayout = require('../layouts/ProportionalLayout');
    var VirtualViewSequence = require('../VirtualViewSequence');
    var DatePickerComponents = require('./DatePickerComponents');
    var LayoutUtility = require('../LayoutUtility');

    /**
     * @class
     * @extends View
     * @param {Object} options Configurable options.
     * @param {Number} [options.perspective] Perspective to use when rendering the wheel.
     * @param {Object} [options.wheelLayout] Layout-options that are passed to the WheelLayout.
     * @param {Object} [options.scrollController] Options that are passed to the underlying ScrollControllers.
     * @param {Object} [options.container] Container-options that are passed to the underlying ContainerSurface.
     * @param {Array.String} [options.classes] Css-classes that are added to the surfaces that are created.
     * @param {Object} [options.createRenderables] Options that specify which renderables should be created.
     * @alias module:DatePicker
     */
    function DatePicker(options) {
        View.apply(this, arguments);

        // Init
        options = options || {};
        this._date = new Date(options.date ? options.date.getTime() : undefined);
        this._components = [];
        this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;

        _createLayout.call(this);
        _updateComponents.call(this);

        // create overlay layout + renderables
        this._overlayRenderables = {
            top: _createRenderable.call(this, 'top'),
            middle: _createRenderable.call(this, 'middle'),
            bottom: _createRenderable.call(this, 'bottom')
        };
        _createOverlay.call(this);

        this.setOptions(this.options);
    }
    DatePicker.prototype = Object.create(View.prototype);
    DatePicker.prototype.constructor = DatePicker;
    DatePicker.prototype.classes = ['ff-widget', 'ff-datepicker'];
    DatePicker.Component = DatePickerComponents;

    DatePicker.DEFAULT_OPTIONS = {
        perspective: 500,
        wheelLayout: {
            itemSize: 100,
            diameter: 500
        },
        createRenderables: {
            item: true,
            top: false,
            middle: false,
            bottom: false
        },
        scrollController: {
            enabled: true,
            paginated: true,
            paginationMode: ScrollController.PaginationMode.SCROLL,
            mouseMove: true,
            scrollSpring: {
                dampingRatio: 1.0,
                period: 800
            }
        }
    };

    /**
     * Creates a new renderable for the given renderable-id.
     *
     */
    function _createRenderable (id, data) {
        var option = this.options.createRenderables[Array.isArray(id) ? id[0] : id];
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
        if (Array.isArray(id)) {
            for (var i = 0; i < id.length; i++) {
                surface.addClass(id[i]);
            }
        }
        else {
            surface.addClass(id);
        }
        return surface;
    }

    /**
     * Patches the DatePicker instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options (see ScrollController for all inherited options).
     * @param {Number} [options.perspective] Perspective to use when rendering the wheel.
     * @param {Object} [options.wheelLayout] Layout-options that are passed to the WheelLayout.
     * @param {Object} [options.scrollController] Options that are passed to the underlying ScrollControllers.
     * @return {DatePicker} this
     */
    DatePicker.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (!this.layout) {
            return this;
        }
        if (options.perspective !== undefined) {
            this.container.context.setPerspective(options.perspective);
        }
        var i;
        if (options.wheelLayout !== undefined) {
            for (i = 0; i < this.scrollWheels.length; i++) {
                this.scrollWheels[i].scrollController.setLayoutOptions(options.wheelLayout);
            }
            this.overlay.setLayoutOptions({
                itemSize: this.options.wheelLayout.itemSize
            });
        }
        if (options.scrollController !== undefined) {
            for (i = 0; i < this.scrollWheels.length; i++) {
                this.scrollWheels[i].scrollController.setOptions(options.scrollController);
            }
        }
        return this;
    };

    /**
     * Sets the components for the date-picker.
     *
     * @param {Array} components Array of DatePicker.Component objects.
     * @return {DatePicker} this
     */
    DatePicker.prototype.setComponents = function(components) {
        this._components = components;
        _updateComponents.call(this);
        return this;
    };

    /**
     * Get the components for the date-picker.
     *
     * @return {Array} components
     */
    DatePicker.prototype.getComponents = function() {
        return this._components;
    };

    /**
     * Set the selected date.
     *
     * @param {Date} date Selected date/time.
     * @return {DatePicker} this
     */
    DatePicker.prototype.setDate = function(date) {
        this._date.setTime(date.getTime());
        _setDateToScrollWheels.call(this, this._date);
        return this;
    };

    /**
     * Get the selected date.
     *
     * @return {Date} selected date
     */
    DatePicker.prototype.getDate = function() {
        return this._date;
    };

    /**
     * Selects the given date into the scrollwheels (causes scrolling)
     */
    function _setDateToScrollWheels(date) {
        for (var i = 0; i < this.scrollWheels.length; i++) {
            var scrollWheel = this.scrollWheels[i];
            var component = scrollWheel.component;
            var item = scrollWheel.scrollController.getFirstVisibleItem();
            if (item && item.viewSequence) {
                var viewSequence = item.viewSequence;
                var renderNode = item.viewSequence.get();
                var currentValue = component.getComponent(renderNode.date);
                var destValue = component.getComponent(date);

                // Determine the direction to scroll to
                var steps = 0;
                if (currentValue !== destValue) {
                    steps = destValue - currentValue;
                    // when loop is enables, check whether there is a faster path
                    if (component.loop) {
                        var revSteps = (steps < 0) ? (steps + component.upperBound) : (steps - component.upperBound);
                        if (Math.abs(revSteps) < Math.abs(steps)) {
                            steps = revSteps;
                        }
                    }
                }

                // Scroll to the item
                if (!steps) {
                    scrollWheel.scrollController.goToRenderNode(renderNode);
                }
                else {
                    while (currentValue !== destValue) {
                        viewSequence = (steps > 0) ? viewSequence.getNext() : viewSequence.getPrevious();
                        renderNode = viewSequence ? viewSequence.get() : undefined;
                        if (!renderNode) {
                            break;
                        }
                        currentValue = component.getComponent(renderNode.date);
                        if (steps > 0) {
                            scrollWheel.scrollController.goToNextPage();
                        }
                        else {
                            scrollWheel.scrollController.goToPreviousPage();
                        }
                    }
                }
            }
        }
    }

    /**
     * Gets the selected date from all the scroll-wheels.
     */
    function _getDateFromScrollWheels() {
        var date = new Date(this._date);
        for (var i = 0; i < this.scrollWheels.length; i++) {
            var scrollWheel = this.scrollWheels[i];
            var component = scrollWheel.component;
            var item = scrollWheel.scrollController.getFirstVisibleItem();
            if (item && item.renderNode) {
                component.setComponent(date, component.getComponent(item.renderNode.date));
            }
        }
        return date;
    }

    /**
     * Sets up the overal layout
     */
    function _createLayout() {
        this.container = new ContainerSurface(
            this.options.container
        );
        this.container.setClasses(this.classes);
        this.layout = new LayoutController({
            layout: ProportionalLayout,
            layoutOptions: {
                ratios: []
            },
            direction: Utility.Direction.X
        });
        this.container.add(this.layout);
        this.add(this.container);
    }

    /**
     * Called whenever an item is clicked, causes the scrollwheel to scroll to that item.
     */
    function _clickItem(scrollWheel, event) {
        /*if (scrollWheel && event && event.target) {
            scrollWheel.scrollController.goToRenderNode(event.target);
        }*/
    }

    /**
     * Emit scrollstart event when a wheel starts scrolling
     */
    function _scrollWheelScrollStart() {
        this._scrollingCount++;
        if (this._scrollingCount === 1) {
            this._eventOutput.emit('scrollstart', {
                target: this
            });
        }
    }

    /**
     * Emit scrollend event whenever all scrolling has come to a halt
     */
    function _scrollWheelScrollEnd() {
        this._scrollingCount--;
        if (this._scrollingCount === 0) {
            this._eventOutput.emit('scrollend', {
                target: this,
                date: this._date
            });
        }
    }

    /**
     * Emit scrollend event whenever all scrolling has come to a halt
     */
    function _scrollWheelPageChange() {
        this._date = _getDateFromScrollWheels.call(this);
        this._eventOutput.emit('datechange', {
            target: this,
            date: this._date
        });
    }

    /**
     * Updates the date/time components
     */
    function _updateComponents() {
        this.scrollWheels = [];
        this._scrollingCount = 0;
        var dataSource = [];
        var sizeRatios = [];
        for (var i = 0; i < this._components.length; i++) {
            var component = this._components[i];
            component.createRenderable = _createRenderable.bind(this);
            var viewSequence = new VirtualViewSequence({
                factory: component,
                value: component.create(this._date)
            });
            var options = LayoutUtility.combineOptions(
                this.options.scrollController, {
                    layout: WheelLayout,
                    layoutOptions: this.options.wheelLayout,
                    flow: false,
                    direction: Utility.Direction.Y,
                    dataSource: viewSequence,
                    autoPipeEvents: true
                }
            );
            var scrollController = new ScrollController(options);
            scrollController.on('scrollstart', _scrollWheelScrollStart.bind(this));
            scrollController.on('scrollend', _scrollWheelScrollEnd.bind(this));
            scrollController.on('pagechange', _scrollWheelPageChange.bind(this));
            var scrollWheel = {
                component: component,
                scrollController: scrollController,
                viewSequence: viewSequence
            };
            this.scrollWheels.push(scrollWheel);
            component.on('click', _clickItem.bind(this, scrollWheel));
            dataSource.push(scrollController);
            sizeRatios.push(component.sizeRatio);
        }

        this.layout.setDataSource(dataSource);
        this.layout.setLayoutOptions({
            ratios: sizeRatios
        });
    }

    /**
     * Positions the overlay elements: top, middle & bottom.
     */
    function OverlayLayout(context, options) {
        var height = (context.size[1] - options.itemSize) / 2;
        context.set('top', {
            size: [context.size[0], height],
            translate: [0, 0, 1]
        });
        context.set('middle', {
            size: [context.size[0], context.size[1] - (height * 2)],
            translate: [0, height, 1]
        });
        context.set('bottom', {
            size: [context.size[0], height],
            translate: [0, context.size[1] - height, 1]
        });
    }

    /**
     * Creates the overlay LayoutController
     */
    function _createOverlay() {
        this.overlay = new LayoutController({
            layout: OverlayLayout,
            layoutOptions: {
                itemSize: this.options.wheelLayout.itemSize
            },
            dataSource: this._overlayRenderables
        });
        this.add(this.overlay);
    }

    module.exports = DatePicker;
});

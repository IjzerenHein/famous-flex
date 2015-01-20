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
 * Date/time wheel (slot-machine layout) for famo.us.
 *
 * This component can be used as a date/time picker, a clock or
 * any other application which requires a date/time wheel.
 *
 * Example:
 *
 * ```javascript
 * var DateWheel = require('famous-flex/widgets/DateWheel');
 *
 * var dateWheel = new DateWheel({
 *   date: new Date(),        // initial date
 *   wheelLayout: {
 *     itemSize: 100,         // height of an item on the date/wheel
 *     diameter: 300,         // diameter of the wheel (undefined = 3 x itemSize)
 *     radialOpacity: 0       // opacity at the top and bottom diameter edge
 *   },
 *   components: [
 *     new DateWheel.Component.FullDay(),  // full-day component (year + month + day)
 *     new DateWheel.Component.Hour(),     // hour component (0..23)
 *     new DateWheel.Component.Minute()    // minute compoent (0..59)
 *   ]
 * });
 * this.add(dateWheel); // add to the render-tree
 *
 * dateWheel.on('datechange', function(event) {
 *   console.log('new date selected: ' + event.date.toLocaleString());
 * });
 * ```
 *
 * CSS:
 *
 * ```css
 * .famous-flex-datewheel .item > div {
 *   position: relative;
 *   top: 50%;
 *   transform: translateY(-50%);
 *   text-align: center;
 *   font-size: 40px;
 * }
 * ```
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var Utility = require('famous/utilities/Utility');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var LayoutController = require('../LayoutController');
    var ScrollController = require('../ScrollController');
    var WheelLayout = require('../layouts/WheelLayout');
    var ProportionalLayout = require('../layouts/ProportionalLayout');
    var VirtualViewSequence = require('../VirtualViewSequence');
    var DateComponents = require('./DateComponents');
    var LayoutUtility = require('famous-flex/LayoutUtility');

    /**
     * @class
     * @extends View
     * @param {Object} options Configurable options.
     * @param {Number} [options.perspective] Perspective to use when rendering the wheel.
     * @param {Array} [options.components] Date/time components that are displayed.
     * @param {Object} [options.wheelLayout] Layout-options that are passed to the WheelLayout.
     * @param {Object} [options.scrollView] Options that are passed to the underlying ScrollControllers.
     * @param {Object} [options.container] Container-options that are passed to the underlying ContainerSurface.
     * @alias module:DateWheel
     */
    function DateWheel(options) {
        View.apply(this, arguments);

        this._date = new Date((options && options.date) ? options.date.getTime() : undefined);
        _createLayout.call(this);
        _createComponents.call(this);

        this.setOptions(this.options);
    }
    DateWheel.prototype = Object.create(View.prototype);
    DateWheel.prototype.constructor = DateWheel;
    DateWheel.Component = DateComponents;

    DateWheel.DEFAULT_OPTIONS = {
        perspective: 1000,
        wheelLayout: {
            itemSize: 100,
            diameter: 500
        },
        scrollView: {
            enabled: true,
            paginated: true,
            mouseMove: true,
            scrollSpring: {
                dampingRatio: 1.0,
                period: 800
            }
        },
        container: {
            classes: ['famous-flex-datewheel']
        },
        components: [
            new DateWheel.Component.FullDay(),
            new DateWheel.Component.Hour(),
            new DateWheel.Component.Minute()
        ]
    };

    /**
     * Patches the DateWheel instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options (see ScrollController for all inherited options).
     * @param {Number} [options.perspective] Perspective to use when rendering the wheel.
     * @param {Array} [options.components] Date/time components that are displayed.
     * @param {Object} [options.wheelLayout] Layout-options that are passed to the WheelLayout.
     * @param {Object} [options.scrollView] Options that are passed to the underlying ScrollControllers.
     * @return {DateWheel} this
     */
    DateWheel.prototype.setOptions = function(options) {
        View.prototype.setOptions.call(this, options);
        if (!this.layout) {
            return this;
        }
        if (options.perspective !== undefined) {
            this.container.context.setPerspective(options.perspective);
        }
        if (options.components) {
            _createComponents.call(this);
        }
        var i;
        if (options.wheelLayout !== undefined) {
            for (i = 0; i < this.scrollWheels.length; i++) {
                this.scrollWheels[i].scrollView.setLayoutOptions(options.wheelLayout);
            }
        }
        if (options.scrollView !== undefined) {
            for (i = 0; i < this.scrollWheels.length; i++) {
                this.scrollWheels[i].scrollView.setOptions(options.scrollView);
            }
        }
        return this;
    };

    /**
     * Set the selected date.
     *
     * @param {Date} date Selected date/time.
     * @return {DateWheel} this
     */
    DateWheel.prototype.setDate = function(date) {
        this._date.setTime(date.getTime());
        _setDateToScrollWheels.call(this, this._date);
        return this;
    };

    /**
     * Get the selected date.
     *
     * @return {Date} selected date
     */
    DateWheel.prototype.getDate = function() {
        return this._date;
    };

    /**
     * Selects the given date into the scrollwheels (causes scrolling)
     */
    function _setDateToScrollWheels(date) {
        for (var i = 0; i < this.scrollWheels.length; i++) {
            var scrollWheel = this.scrollWheels[i];
            var component = scrollWheel.component;
            var item = scrollWheel.scrollView.getFirstVisibleItem();
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
                    scrollWheel.scrollView.goToRenderNode(renderNode);
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
                            scrollWheel.scrollView.goToNextPage();
                        }
                        else {
                            scrollWheel.scrollView.goToPreviousPage();
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
            var item = scrollWheel.scrollView.getFirstVisibleItem();
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
    function _createComponents() {
        this.scrollWheels = [];
        this._scrollingCount = 0;
        var dataSource = [];
        var sizeRatios = [];

        for (var i = 0; i < this.options.components.length; i++) {
            var component = this.options.components[i];
            var viewSequence = new VirtualViewSequence({
                factory: component,
                value: component.create(this._date)
            });
            var options = LayoutUtility.combineOptions(
                this.options.scrollView, {
                    layout: WheelLayout,
                    layoutOptions: this.options.wheelLayout,
                    flow: false,
                    direction: Utility.Direction.Y,
                    dataSource: viewSequence,
                    autoPipeEvents: true
                }
            );
            var scrollView = new ScrollController(options);
            scrollView.on('scrollstart', _scrollWheelScrollStart.bind(this));
            scrollView.on('scrollend', _scrollWheelScrollEnd.bind(this));
            scrollView.on('pagechange', _scrollWheelPageChange.bind(this));
            this.scrollWheels.push({
                component: component,
                scrollView: scrollView,
                viewSequence: viewSequence
            });
            dataSource.push(scrollView);
            sizeRatios.push(component.sizeRatio);
        }

        this.layout.setDataSource(dataSource);
        this.layout.setLayoutOptions({
            ratios: sizeRatios
        });
    }

    module.exports = DateWheel;
});

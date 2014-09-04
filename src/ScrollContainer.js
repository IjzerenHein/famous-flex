/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: felix@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

/*global module*/

var ContainerSurface = require('famous/surfaces/ContainerSurface');
var EventHandler = require('famous/core/EventHandler');
var Scrollview = require('./Scrollview');
var Utility = require('famous/utilities/Utility');
var OptionsManager = require('famous/core/OptionsManager');

/**
 * @module
 */

/**
 * A Container surface with a scrollview automatically added. The convenience of ScrollContainer lies in
 * being able to clip out portions of the associated scrollview that lie outside the bounding surface,
 * and in being able to move the scrollview more easily by applying modifiers to the parent container
 * surface.
 * @class ScrollContainer
 * @constructor
 * @param {Options} [options] An object of configurable options.
 * @param {Options} [options.container=undefined] Options for the ScrollContainer instance's surface.
 * @param {Options} [options.scrollview={direction:Utility.Direction.X}]  Options for the ScrollContainer instance's scrollview.
 */
function ScrollContainer(options) {
    this.options = Object.create(ScrollContainer.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);

    if (options) {
        this.setOptions(options);
    }

    this.container = new ContainerSurface(this.options.container);
    this.scrollview = new Scrollview(this.options.scrollview);

    this.container.add(this.scrollview);

    EventHandler.setInputHandler(this, this.scrollview);
    EventHandler.setOutputHandler(this, this.scrollview);
    this.scrollview.subscribe(this.container);
}

ScrollContainer.DEFAULT_OPTIONS = {
    container: {
        properties: {overflow : 'hidden'}
    }
    //scrollview: {direction: Utility.Direction.Y}
};

/**
 * Patches the ScrollContainer instance's options with the passed-in ones.
 *
 * @method setOptions
 * @param {Options} options An object of configurable options for the ScrollContainer instance.
 */
ScrollContainer.prototype.setOptions = function setOptions(options) {
    return this._optionsManager.setOptions(options);
};

/**
 * Sets the collection of renderables under the ScrollContainer instance scrollview's control.
 *
 * @param {Array|ViewSequence} sequence Either an array of renderables or a Famous ViewSequence.
 */
ScrollContainer.prototype.sequenceFrom = function sequenceFrom() {
    return this.scrollview.sequenceFrom.apply(this.scrollview, arguments);
};

/**
 * Set the new layout.
 *
 * @param {Function} layout Layout function
 * @param {Object} [options] Options to pass in to the layout-function
 * @return {ScrollContainer} this
 */
ScrollContainer.prototype.setLayout = function(layout, options) {
    this.scrollview.setLayout(layout, options);
    return this;
};

/**
 * Get the current layout-function
 *
 * @return {Function} Layout function
 */
ScrollContainer.prototype.getLayout = function() {
    return this.scrollview.getLayout();
};

/**
 * Set the options for the current layout. Use this function after
 * `setLayout` to update the options for the layout-function.
 *
 * @param {Object} [options] Options to pass in to the layout-function
 * @return {ScrollContainer} this
 */
ScrollContainer.prototype.setLayoutOptions = function(options) {
    this.scrollview.setLayoutOptions(options);
    return this;
};

/**
 * Patches the options for the current layout. Use this function to change
 * just one or a couple of layout-options, instead to having to set all
 * the options again.
 *
 * @param {Object} [options] Options to pass in to the layout-function
 * @return {ScrollContainer} this
 */
ScrollContainer.prototype.patchLayoutOptions = function(options) {
    this.scrollview.patchLayoutOptions(options);
    return this;
};

/**
 * Get the current layout options.
 *
 * @return {Object} Layout options
 */
ScrollContainer.prototype.getLayoutOptions = function() {
    return this.scrollview.getLayoutOptions();
};

/**
 * Get the spec based on the renderable that was provided
 * in the data-source.
 *
 * @param {Object} node Render-node to look for
 * @return {Object} spec or undefined
 */
ScrollContainer.prototype.getSpecByNode = function(node) {
    return this.scrollview.getSpecByNode(node);
};

/**
 * Forces a reflow of the layout, the next render cycle.
 *
 * @return {ScrollContainer} this
 */
ScrollContainer.prototype.reflowLayout = function() {
    this.scrollview.reflowLayout();
    return this;
};

/**
 * Inserts a renderable into the data-source. If the renderable is visible
 * then it is inserted using an animation.
 *
 * @param {Number|String} index Index within vireSeuqnce
 * @param {Object} renderable Rendeable to add to the data-source
 * @return {ScrollView} this
 */
ScrollContainer.prototype.insert = function(index, renderable) {
    this.scrollview.insert.apply(this.scrollview, arguments);
    return this;
};

/**
 * Removes a renderable from the data-source. If the renderable is visible
 * then it will be removed using an animation.
 *
 * @param {Number|String} index Index within dataSource array or id (String)
 * @param {Spec} [spec] Size, transform, etc.. to end with when removing
 * @return {ScrollView} this
 */
ScrollContainer.prototype.remove = function(index) {
    this.scrollview.remove.apply(this.scrollview, arguments);
    return this;
};

/**
 * Generate a render spec from the contents of this component.
 *
 * @private
 * @method render
 * @return {number} Render spec for this component
 */
ScrollContainer.prototype.render = function render() {
    return this.container.render.apply(this.container, arguments);
};

module.exports = ScrollContainer;

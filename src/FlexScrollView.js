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
 * Flexible FlexScrollView for famo.us.
 *
 * Key features:
 * -    Customizable layout (uses ListLayout by default)
 * -    Insert/remove at any position using animations
 * -    Support for `true` size renderables
 * -    Pull to refresh (header & footer)
 * -    Horizontal/vertical direction
 * -    Top/left or bottom/right alignment
 * -    Pagination
 * -    Option to embed in a ContainerSurface
 * -    FlexScrollView linking
 *
 * Inherited from: [ScrollController](./ScrollController.md)
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var LayoutUtility = require('./LayoutUtility');
    var ScrollController = require('./ScrollController');
    var ListLayout = require('./layouts/ListLayout');

    //
    // Pull to refresh states
    //
    var PullToRefreshState = {
        HIDDEN: 0,
        PULLING: 1,
        ACTIVE: 2,
        COMPLETED: 3,
        HIDDING: 4
    };

    /**
     * @class
     * @extends ScrollController
     * @param {Object} options Configurable options (see ScrollController for all inherited options).
     * @param {Renderable} [options.pullToRefreshHeader] Pull to refresh renderable that is displayed when pulling down from the top.
     * @param {Renderable} [options.pullToRefreshFooter] Pull to refresh renderable that is displayed when pulling up from the bottom.
     * @param {FlexScrollView} [options.leadingScrollView] Leading scrollview into which input events are piped (see Tutorial)
     * @param {FlexScrollView} [options.trailingScrollView] Trailing scrollview into which input events are piped (see Tutorial)
     * @alias module:FlexScrollView
     */
    function FlexScrollView(options) {
        ScrollController.call(this, LayoutUtility.combineOptions(FlexScrollView.DEFAULT_OPTIONS, options));
        this._thisScrollViewDelta = 0;
        this._leadingScrollViewDelta = 0;
        this._trailingScrollViewDelta = 0;
    }
    FlexScrollView.prototype = Object.create(ScrollController.prototype);
    FlexScrollView.prototype.constructor = FlexScrollView;
    FlexScrollView.PullToRefreshState = PullToRefreshState;
    FlexScrollView.Bounds = ScrollController.Bounds;
    FlexScrollView.PaginationMode = ScrollController.PaginationMode;

    FlexScrollView.DEFAULT_OPTIONS = {
        layout: ListLayout,         // sequential layout, uses width/height from renderable
        direction: undefined,       // 0 = X, 1 = Y, undefined = use default from layout
        paginated: false,           // pagination on/off
        alignment: 0,               // 0 = top/left, 1 = bottom/right
        flow: false,                // allow renderables to flow between layouts when not scrolling
        mouseMove: false,           // allow mouse to hold and move the view
        useContainer: false,        // embeds inside a ContainerSurface for clipping and capturing input events
        visibleItemThresshold: 0.5, // by default, when an item is 50% visible, it is considered visible by `getFirstVisibleItem`
        pullToRefreshHeader: undefined, // assign pull-to-refresh renderable here (renderable must have a size)
        pullToRefreshFooter: undefined, // assign pull-to-refresh renderable here (renderable must have a size)
        leadingScrollView: undefined,
        trailingScrollView: undefined
        // see ScrollController for all other options
    };

    /**
     * Patches the FlexScrollView instance's options with the passed-in ones.
     *
     * @param {Object} options Configurable options (see ScrollController for all inherited options).
     * @param {Renderable} [options.pullToRefreshHeader] Pull to refresh renderable that is displayed when pulling down from the top.
     * @param {Renderable} [options.pullToRefreshFooter] Pull to refresh renderable that is displayed when pulling up from the bottom.
     * @param {FlexScrollView} [options.leadingScrollView] Leading scrollview into which input events are piped (see Tutorial).
     * @param {FlexScrollView} [options.trailingScrollView] Trailing scrollview into which input events are piped (see Tutorial).
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.setOptions = function(options) {
        ScrollController.prototype.setOptions.call(this, options);

        // Update pull to refresh renderables
        if (options.pullToRefreshHeader || options.pullToRefreshFooter || this._pullToRefresh) {
            if (options.pullToRefreshHeader) {
                this._pullToRefresh = this._pullToRefresh || [undefined, undefined];
                if (!this._pullToRefresh[0]) {
                    this._pullToRefresh[0] = {
                        state: PullToRefreshState.HIDDEN,
                        prevState: PullToRefreshState.HIDDEN,
                        footer: false
                    };
                }
                this._pullToRefresh[0].node = options.pullToRefreshHeader;
            }
            else if (!this.options.pullToRefreshHeader && this._pullToRefresh) {
                this._pullToRefresh[0] = undefined;
            }
            if (options.pullToRefreshFooter) {
                this._pullToRefresh = this._pullToRefresh || [undefined, undefined];
                if (!this._pullToRefresh[1]) {
                    this._pullToRefresh[1] = {
                        state: PullToRefreshState.HIDDEN,
                        prevState: PullToRefreshState.HIDDEN,
                        footer: true
                    };
                }
                this._pullToRefresh[1].node = options.pullToRefreshFooter;
            }
            else if (!this.options.pullToRefreshFooter && this._pullToRefresh) {
                this._pullToRefresh[1] = undefined;
            }
            if (this._pullToRefresh && !this._pullToRefresh[0] && !this._pullToRefresh[1]) {
                this._pullToRefresh = undefined;
            }
        }
        return this;
    };

    /**
     * Sets the data-source (alias for setDataSource).
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @param {Array|ViewSequence} node Either an array of renderables or a Famous viewSequence.
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.sequenceFrom = function(node) {
        return this.setDataSource(node);
    };

    /**
     * Returns the index of the first visible renderable.
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @return {Number} The current index of the ViewSequence
     */
    FlexScrollView.prototype.getCurrentIndex = function() {
        var item = this.getFirstVisibleItem();
        return item ? item.viewSequence.getIndex() : -1;
    };

    /**
     * Paginates the Scrollview to an absolute page index. This function is a shim provided
     * for compatibility with the stock famo.us Scrollview.
     *
     * @param {Number} index view-sequence index to go to.
     * @param {Bool} [noAnimation] When set to true, immediately shows the node without scrolling animation.
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.goToPage = function(index, noAnimation) {
        var viewSequence = this._viewSequence;
        if (!viewSequence) {
            return this;
        }
        while (viewSequence.getIndex() < index) {
            viewSequence = viewSequence.getNext();
            if (!viewSequence) {
                return this;
            }
        }
        while (viewSequence.getIndex() > index) {
            viewSequence = viewSequence.getPrevious();
            if (!viewSequence) {
                return this;
            }
        }
        this.goToRenderNode(viewSequence.get(), noAnimation);
        return this;
    };

    /**
     * Returns the offset associated with the Scrollview instance's current node
     * (generally the node currently at the top).
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @return {number} The position of either the specified node, or the Scrollview's current Node,
     * in pixels translated.
     */
    FlexScrollView.prototype.getOffset = function() {
        return this._scrollOffsetCache;
    };

    /**
     * Returns the position associated with the Scrollview instance's current node
     * (generally the node currently at the top).
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @deprecated
     * @param {number} [node] If specified, returns the position of the node at that index in the
     * Scrollview instance's currently managed collection.
     * @return {number} The position of either the specified node, or the Scrollview's current Node,
     * in pixels translated.
     */
    FlexScrollView.prototype.getPosition = FlexScrollView.prototype.getOffset;

    /**
     * Returns the absolute position associated with the Scrollview instance.
     *
     * This function is a shim provided for compatibility with the stock famo.us Scrollview.
     *
     * @return {number} The position of the Scrollview's current Node, in pixels translated.
     */
    FlexScrollView.prototype.getAbsolutePosition = function() {
        return -(this._scrollOffsetCache + this._scroll.groupStart);
    };

    /**
     * Helper function for setting the pull-to-refresh status.
     */
    function _setPullToRefreshState(pullToRefresh, state) {
        if (pullToRefresh.state !== state) {
            pullToRefresh.state = state;
            if (pullToRefresh.node && pullToRefresh.node.setPullToRefreshStatus) {
                pullToRefresh.node.setPullToRefreshStatus(state);
            }
        }
    }

    /**
     * Helper function for getting the pull-to-refresh data.
     */
    function _getPullToRefresh(footer) {
        return this._pullToRefresh ? this._pullToRefresh[footer ? 1 : 0] : undefined;
    }

    /**
     * Post-layout function that adds the pull-to-refresh renderables.
     * @private
     */
    FlexScrollView.prototype._postLayout = function(size, scrollOffset) {

        // Exit immediately when pull to refresh is not configured
        if (!this._pullToRefresh) {
            return;
        }

        // Adjust scroll-offset for alignment
        if (this.options.alignment) {
            scrollOffset += size[this._direction];
        }

        // Prepare
        var prevHeight;
        var nextHeight;
        var totalHeight;

        // Show/activate pull to refresh renderables
        for (var i = 0; i < 2; i++) {
            var pullToRefresh = this._pullToRefresh[i];
            if (pullToRefresh) {

                // Calculate offset
                var length = pullToRefresh.node.getSize()[this._direction];
                var pullLength = pullToRefresh.node.getPullToRefreshSize ? pullToRefresh.node.getPullToRefreshSize()[this._direction] : length;
                var offset;
                if (!pullToRefresh.footer) {
                    // header
                    prevHeight = this._calcScrollHeight(false);
                    prevHeight = (prevHeight === undefined) ? -1 : prevHeight;
                    offset = (prevHeight >= 0) ? (scrollOffset - prevHeight) : prevHeight;
                    if (this.options.alignment) {
                        nextHeight = this._calcScrollHeight(true);
                        nextHeight = (nextHeight === undefined) ? -1 : nextHeight;
                        totalHeight = ((prevHeight >= 0) && (nextHeight >= 0)) ? (prevHeight + nextHeight) : -1;
                        if ((totalHeight >= 0) && (totalHeight < size[this._direction])) {
                            offset = Math.round((scrollOffset - size[this._direction]) + nextHeight);
                        }
                    }
                }
                else {
                    // footer
                    nextHeight = (nextHeight === undefined) ? nextHeight = this._calcScrollHeight(true) : nextHeight;
                    nextHeight = (nextHeight === undefined) ? -1 : nextHeight;
                    offset = (nextHeight >= 0) ? (scrollOffset + nextHeight) : (size[this._direction] + 1);
                    if (!this.options.alignment) {
                        prevHeight = (prevHeight === undefined) ? this._calcScrollHeight(false) : prevHeight;
                        prevHeight = (prevHeight === undefined) ? -1 : prevHeight;
                        totalHeight = ((prevHeight >= 0) && (nextHeight >= 0)) ? (prevHeight + nextHeight) : -1;
                        if ((totalHeight >= 0) && (totalHeight < size[this._direction])) {
                            offset = Math.round((scrollOffset - prevHeight) + size[this._direction]);
                        }
                    }
                    offset = -(offset - size[this._direction]);
                }

                // Determine current state
                var visiblePerc = Math.max(Math.min(offset / pullLength, 1), 0);
                switch (pullToRefresh.state) {
                    case PullToRefreshState.HIDDEN:
                        if (this._scroll.scrollForceCount) {
                            if (visiblePerc >= 1) {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                            }
                            else if (offset >= 0.2) {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.PULLING);
                            }
                        }
                        break;
                    case PullToRefreshState.PULLING:
                        if (this._scroll.scrollForceCount && (visiblePerc >= 1)) {
                            _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                        }
                        else if (offset < 0.2) {
                            _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                        }
                        break;
                    case PullToRefreshState.ACTIVE:
                        // nothing to do, wait for completed
                        break;
                    case PullToRefreshState.COMPLETED:
                        if (!this._scroll.scrollForceCount) {
                            if (offset >= 0.2) {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDING);
                            }
                            else {
                                _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                            }
                        }
                        break;
                    case PullToRefreshState.HIDDING:
                        if (offset < 0.2) {
                            _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                        }
                        break;
                }

                // Show pull to refresh node
                if (pullToRefresh.state !== PullToRefreshState.HIDDEN) {
                    var contextNode = {
                        renderNode: pullToRefresh.node,
                        prev: !pullToRefresh.footer,
                        next: pullToRefresh.footer,
                        index: !pullToRefresh.footer ? --this._nodes._contextState.prevGetIndex : ++this._nodes._contextState.nextGetIndex
                    };
                    var scrollLength;
                    if (pullToRefresh.state === PullToRefreshState.ACTIVE) {
                        scrollLength = length;
                    }
                    else if (this._scroll.scrollForceCount) {
                        scrollLength = Math.min(offset, length);
                    }
                    var set = {
                        size: [size[0], size[1]],
                        translate: [0, 0, -1e-3], // transform.behind
                        scrollLength: scrollLength
                    };
                    set.size[this._direction] = Math.max(Math.min(offset, pullLength), 0);
                    set.translate[this._direction] = pullToRefresh.footer ? (size[this._direction] - length) : 0;
                    this._nodes._context.set(contextNode, set);
                }
            }
        }
    };

    /**
     * Shows the pulls-to-refresh renderable indicating that a refresh is in progress.
     *
     * @param {Bool} [footer] set to true to show pull-to-refresh at the footer (default: false).
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.showPullToRefresh = function(footer) {
        var pullToRefresh = _getPullToRefresh.call(this, footer);
        if (pullToRefresh) {
            _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
            this._scroll.scrollDirty = true;
        }
    };

    /**
     * Hides the pull-to-refresh renderable in case it was visible.
     *
     * @param {Bool} [footer] set to true to hide the pull-to-refresh at the footer (default: false).
     * @return {FlexScrollView} this
     */
    FlexScrollView.prototype.hidePullToRefresh = function(footer) {
        var pullToRefresh = _getPullToRefresh.call(this, footer);
        if (pullToRefresh && (pullToRefresh.state === PullToRefreshState.ACTIVE)) {
            _setPullToRefreshState(pullToRefresh, PullToRefreshState.COMPLETED);
            this._scroll.scrollDirty = true;
        }
        return this;
    };

    /**
     * Get the visible state of the pull-to-refresh renderable.
     *
     * @param {Bool} [footer] set to true to get the state of the pull-to-refresh footer (default: false).
     */
    FlexScrollView.prototype.isPullToRefreshVisible = function(footer) {
        var pullToRefresh = _getPullToRefresh.call(this, footer);
        return pullToRefresh ? (pullToRefresh.state === PullToRefreshState.ACTIVE) : false;
    };

    /**
     * Delegates any scroll force to leading/trailing scrollviews.
     * @private
     */
    FlexScrollView.prototype.applyScrollForce = function(delta) {
        var leadingScrollView = this.options.leadingScrollView;
        var trailingScrollView = this.options.trailingScrollView;
        if (!leadingScrollView && !trailingScrollView) {
            return ScrollController.prototype.applyScrollForce.call(this, delta);
        }
        var partialDelta;
        if (delta < 0) {
            if (leadingScrollView) {
                partialDelta = leadingScrollView.canScroll(delta);
                this._leadingScrollViewDelta += partialDelta;
                leadingScrollView.applyScrollForce(partialDelta);
                delta -= partialDelta;
            }
            if (trailingScrollView) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.applyScrollForce.call(this, partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                trailingScrollView.applyScrollForce(delta);
                this._trailingScrollViewDelta += delta;
            }
            else {
                ScrollController.prototype.applyScrollForce.call(this, delta);
                this._thisScrollViewDelta += delta;
            }
        }
        else {
            if (trailingScrollView) {
                partialDelta = trailingScrollView.canScroll(delta);
                trailingScrollView.applyScrollForce(partialDelta);
                this._trailingScrollViewDelta += partialDelta;
                delta -= partialDelta;
            }
            if (leadingScrollView) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.applyScrollForce.call(this, partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                leadingScrollView.applyScrollForce(delta);
                this._leadingScrollViewDelta += delta;
            }
            else {
                ScrollController.prototype.applyScrollForce.call(this, delta);
                this._thisScrollViewDelta += delta;
            }
        }
        return this;
    };

    /**
     * Delegates any scroll force to leading/trailing scrollviews.
     * @private
     */
    FlexScrollView.prototype.updateScrollForce = function(prevDelta, newDelta) {
        var leadingScrollView = this.options.leadingScrollView;
        var trailingScrollView = this.options.trailingScrollView;
        if (!leadingScrollView && !trailingScrollView) {
            return ScrollController.prototype.updateScrollForce.call(this, prevDelta, newDelta);
        }
        var partialDelta;
        var delta = newDelta - prevDelta;
        if (delta < 0) {
            if (leadingScrollView) {
                partialDelta = leadingScrollView.canScroll(delta);
                leadingScrollView.updateScrollForce(this._leadingScrollViewDelta, this._leadingScrollViewDelta + partialDelta);
                this._leadingScrollViewDelta += partialDelta;
                delta -= partialDelta;
            }
            if (trailingScrollView && delta) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                this._trailingScrollViewDelta += delta;
                trailingScrollView.updateScrollForce(this._trailingScrollViewDelta, this._trailingScrollViewDelta + delta);
            }
            else if (delta) {
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
                this._thisScrollViewDelta += delta;
            }
        }
        else {
            if (trailingScrollView) {
                partialDelta = trailingScrollView.canScroll(delta);
                trailingScrollView.updateScrollForce(this._trailingScrollViewDelta, this._trailingScrollViewDelta + partialDelta);
                this._trailingScrollViewDelta += partialDelta;
                delta -= partialDelta;
            }
            if (leadingScrollView) {
                partialDelta = this.canScroll(delta);
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + partialDelta);
                this._thisScrollViewDelta += partialDelta;
                delta -= partialDelta;
                leadingScrollView.updateScrollForce(this._leadingScrollViewDelta, this._leadingScrollViewDelta + delta);
                this._leadingScrollViewDelta += delta;
            }
            else {
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
                this._thisScrollViewDelta += delta;
            }
        }
        return this;
    };

    /**
     * Delegates any scroll force to leading/trailing scrollviews.
     * @private
     */
    FlexScrollView.prototype.releaseScrollForce = function(delta, velocity) {
        var leadingScrollView = this.options.leadingScrollView;
        var trailingScrollView = this.options.trailingScrollView;
        if (!leadingScrollView && !trailingScrollView) {
            return ScrollController.prototype.releaseScrollForce.call(this, delta, velocity);
        }
        var partialDelta;
        if (delta < 0) {
            if (leadingScrollView) {
                partialDelta = Math.max(this._leadingScrollViewDelta, delta);
                this._leadingScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                leadingScrollView.releaseScrollForce(this._leadingScrollViewDelta, delta ? 0 : velocity);
            }
            if (trailingScrollView) {
                partialDelta = Math.max(this._thisScrollViewDelta, delta);
                this._thisScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? 0 : velocity);
                this._trailingScrollViewDelta -= delta;
                trailingScrollView.releaseScrollForce(this._trailingScrollViewDelta, delta ? velocity : 0);
            }
            else {
                this._thisScrollViewDelta -= delta;
                ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
            }
        }
        else {
            if (trailingScrollView) {
                partialDelta = Math.min(this._trailingScrollViewDelta, delta);
                this._trailingScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                trailingScrollView.releaseScrollForce(this._trailingScrollViewDelta, delta ? 0 : velocity);
            }
            if (leadingScrollView) {
                partialDelta = Math.min(this._thisScrollViewDelta, delta);
                this._thisScrollViewDelta -= partialDelta;
                delta -= partialDelta;
                ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? 0 : velocity);
                this._leadingScrollViewDelta -= delta;
                leadingScrollView.releaseScrollForce(this._leadingScrollViewDelta, delta ? velocity : 0);
            }
            else {
                this._thisScrollViewDelta -= delta;
                ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
            }
        }
        return this;
    };

    /**
     * Overriden commit, in order to emit pull-to-refresh event after
     * all the rendering has been done.
     * @private
     */
    FlexScrollView.prototype.commit = function(context) {

        // Call base class
        var result = ScrollController.prototype.commit.call(this, context);

        // Emit pull to refresh events after the whole commit call has been executed
        // so that when the refresh event is received, the FlexScrollView is in a valid state
        // and can be queried.
        if (this._pullToRefresh) {
            for (var i = 0; i < 2; i++) {
                var pullToRefresh = this._pullToRefresh[i];
                if (pullToRefresh) {
                    if ((pullToRefresh.state === PullToRefreshState.ACTIVE) &&
                        (pullToRefresh.prevState !== PullToRefreshState.ACTIVE)) {
                        this._eventOutput.emit('refresh', {
                            target: this,
                            footer: pullToRefresh.footer
                        });
                    }
                    pullToRefresh.prevState = pullToRefresh.state;
                }
            }
        }
        return result;
    };

    module.exports = FlexScrollView;
});

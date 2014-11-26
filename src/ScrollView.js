/**
 * This Source Code is licensed under the MIT license. If a copy of the
 * MIT-license was not distributed with this file, You can obtain one at:
 * http://opensource.org/licenses/mit-license.html.
 *
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*global define, console*/
/*eslint no-use-before-define:0, no-console:0 */

/**
 * Flexible ScrollView drop-in replacement for famo.us.
 *
 * Key features:
 * -    Customizable layout (uses ListLayout by default)
 * -    Insert/remove at any position using animations
 * -    Support for `true` size renderables
 * -    Pull to refresh
 * -    Horizontal/vertical direction
 * -    Top/left or bottom/right alignment
 * -    Pagination
 * -    Option to embed in a ContainerSurface
 * -    ScrollView linking
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
        SHOWN: 1,
        HIDDING: 2
    };

    /**
     * @class
     * @extends ScrollController
     * @param {Object} options Options (see ScrollController).
     * @alias module:ScrollView
     */
    function ScrollView(options) {
        ScrollController.call(this, LayoutUtility.combineOptions(ScrollView.DEFAULT_OPTIONS, options));
        this._pullToRefreshHeaderState = PullToRefreshState.HIDDEN;
        this._pullToRefreshFooterState = PullToRefreshState.HIDDEN;
        this._thisScrollViewDelta = 0;
        this._leadingScrollViewDelta = 0;
        this._trailingScrollViewDelta = 0;
    }
    ScrollView.prototype = Object.create(ScrollController.prototype);
    ScrollView.prototype.constructor = ScrollView;

    ScrollView.DEFAULT_OPTIONS = {
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
     * Sets the data-source (alias for setDataSource).
     *
     * This function is a shim provided for compatibility with the stock famo.us ScrollView.
     *
     * @param {Array|ViewSequence} node Either an array of renderables or a Famous viewSequence.
     * @return {ScrollView} this
     */
    ScrollView.prototype.sequenceFrom = function(node) {
        return this.setDataSource(node);
    };

    /**
     * Returns the index of the first visible renderable.
     *
     * This function is a shim provided for compatibility with the stock famo.us ScrollView.
     *
     * @return {Number} The current index of the ViewSequence
     */
    ScrollView.prototype.getCurrentIndex = function getCurrentIndex() {
        var item = this.getFirstVisibleItem();
        return item ? item.viewSequence.getIndex() : -1;
    };

    /**
     * Paginates the Scrollview to an absolute page index. This function is a shim provided
     * for compatibility with the stock famo.us ScrollView.
     *
     * @param {Number} index view-sequence index to go to.
     * @return {ScrollView} this
     */
    ScrollView.prototype.goToPage = function goToPage(index) {
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
        this.goToRenderNode(viewSequence.get());
        return this;
    };

    /**
     * Returns the offset associated with the Scrollview instance's current node
     * (generally the node currently at the top).
     *
     * This function is a shim provided for compatibility with the stock famo.us ScrollView.
     *
     * @return {number} The position of either the specified node, or the Scrollview's current Node,
     * in pixels translated.
     */
    ScrollView.prototype.getOffset = function() {
        return this._scrollOffsetCache;
    };

    /**
     * Returns the position associated with the Scrollview instance's current node
     * (generally the node currently at the top).
     *
     * This function is a shim provided for compatibility with the stock famo.us ScrollView.
     *
     * @deprecated
     * @method getPosition
     * @param {number} [node] If specified, returns the position of the node at that index in the
     * Scrollview instance's currently managed collection.
     * @return {number} The position of either the specified node, or the Scrollview's current Node,
     * in pixels translated.
     */
    ScrollView.prototype.getPosition = ScrollView.prototype.getOffset;

    /**
     * Post-layout function that adds the pull-to-refresh renderables.
     * @private
     */
    ScrollView.prototype._postLayout = function(size, scrollOffset) {

        // Exit immediately when pull to refresh is not configured
        if (!this.options.pullToRefreshHeader && !this.options.pullToRefreshFooter) {
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

        // Show/activate pull to refresh header
        var pullToRefreshHeader = this.options.pullToRefreshHeader;
        if (pullToRefreshHeader) {

            // Calculate offset
            prevHeight = this._calcScrollHeight(false);
            prevHeight = (prevHeight === undefined) ? -1 : prevHeight;
            var length = pullToRefreshHeader.getSize()[this._direction];
            var offset = (prevHeight >= 0) ? (scrollOffset - prevHeight) : prevHeight;
            if (this.options.alignment) {
                nextHeight = this._calcScrollHeight(true);
                nextHeight = (nextHeight === undefined) ? -1 : nextHeight;
                totalHeight = ((prevHeight >= 0) && (nextHeight >= 0)) ? (prevHeight + nextHeight) : -1;
                if ((totalHeight >= 0) && (totalHeight < size[this._direction])) {
                    offset = Math.round((scrollOffset - size[this._direction]) + nextHeight);
                }
            }

            // Determine whether to show or hide the pull-to-refresh node
            var showing = (this._pullToRefreshHeaderState === PullToRefreshState.SHOWN);
            if (!showing) {
                var visiblePerc = Math.max(Math.min(offset / length, 1), 0);
                if (offset > 0.2) {
                    if (this._scroll.scrollForceCount) {
                        showing = true;
                        this._pullToRefreshHeaderVisiblePerc = visiblePerc;
                    } else if (this._pullToRefreshHeaderVisiblePerc > 0) {
                        showing = true;
                    }
                }
                else {
                    this._pullToRefreshHeaderVisiblePerc = 0;
                }
            }
            else {
                this._pullToRefreshHeaderVisiblePerc = 1;
            }

            // Detect when fully shown
            if ((this._pullToRefreshHeaderVisiblePerc >= 1) && this._scroll.scrollForceCount &&
                (this._pullToRefreshHeaderState === PullToRefreshState.HIDDEN)) {
                this._pullToRefreshHeaderState = PullToRefreshState.SHOWN;
                if (this.options.pullToRefreshHeader && this.options.pullToRefreshHeader.setPullToRefreshStatus) {
                    this.options.pullToRefreshHeader.setPullToRefreshStatus(this._pullToRefreshHeaderState);
                }
            }

            // Show pull to refresh node
            if (showing) {
                var contextNode = {
                    renderNode: pullToRefreshHeader,
                    prev: true,
                    index: --this._nodes._contextState.prevGetIndex
                };
                var scrollLength = (this._scroll.scrollForceCount || (this._pullToRefreshHeaderState === PullToRefreshState.SHOWN)) ? length : undefined;
                var set = {
                    size: [size[0], size[1]],
                    translate: [0, 0, -1e-3], // transform.behind
                    scrollLength: scrollLength
                };
                set.size[this._direction] = Math.max(Math.min(offset, length), 0);
                this._nodes._context.set(contextNode, set);
            }
        }

        // Show/activate pull to refresh header
        var pullToRefreshFooter = this.options.pullToRefreshFooter;
        if (pullToRefreshFooter) {
            nextHeight = (nextHeight === undefined) ? nextHeight = this._calcScrollHeight(true) : nextHeight;
            nextHeight = (nextHeight === undefined) ? -1 : nextHeight;
            length = pullToRefreshFooter.getSize()[this._direction];
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

            // Determine whether to show or hide the pull-to-refresh node
            showing = (this._pullToRefreshFooterState === PullToRefreshState.SHOWN);
            if (!showing) {
                visiblePerc = Math.max(Math.min(offset / length, 1), 0);
                if (offset > 0.2) {
                    if (this._scroll.scrollForceCount) {
                        showing = true;
                        this._pullToRefreshFooterVisiblePerc = visiblePerc;
                    }
                    else if (this._pullToRefreshFooterVisiblePerc > 0) {
                        showing = true;
                    }
                }
                else {
                    this._pullToRefreshFooterVisiblePerc = 0;
                }
            }
            else {
                this._pullToRefreshFooterVisiblePerc = 1;
            }

            // Detect when fully shown
            if ((this._pullToRefreshFooterVisiblePerc >= 1) && this._scroll.scrollForceCount &&
                (this._pullToRefreshFooterState === PullToRefreshState.HIDDEN)) {
                this._pullToRefreshFooterState = PullToRefreshState.SHOWN;
                if (this.options.pullToRefreshFooter && this.options.pullToRefreshFooter.setPullToRefreshStatus) {
                    this.options.pullToRefreshFooter.setPullToRefreshStatus(this._pullToRefreshFooterState);
                }
            }

            // Show pull to refresh node
            if (showing) {
                contextNode = {
                    renderNode: pullToRefreshFooter,
                    next: true,
                    index: ++this._nodes._contextState.nextGetIndex
                };
                scrollLength = (this._scroll.scrollForceCount || (this._pullToRefreshFooterState === PullToRefreshState.SHOWN)) ? length : undefined;
                set = {
                    size: [size[0], size[1]],
                    translate: [0, 0, -1e-3], // transform.behind
                    scrollLength: scrollLength
                };
                set.translate[this._direction] = size[this._direction] - length;
                set.size[this._direction] = Math.max(Math.min(offset, length), 0);
                this._nodes._context.set(contextNode, set);
            }
        }
    };

    /**
     * Shows the pulls-to-refresh renderable indicating that a refresh is in progress.
     *
     * @param {Bool} [footer] set to true to show pull-to-refresh at the end (default: false).
     */
    ScrollView.prototype.showPullToRefresh = function(footer) {
        if (footer) {
            if (this._pullToRefreshFooterState !== PullToRefreshState.SHOWN) {
                this._pullToRefreshFooterState = PullToRefreshState.SHOWN;
                if (this.options.pullToRefreshFooter && this.options.pullToRefreshFooter.setPullToRefreshStatus) {
                    this.options.pullToRefreshFooter.setPullToRefreshStatus(this._pullToRefreshFooterState);
                }
                this._scroll.scrollDirty = true;
            }
        }
        else {
            if (this._pullToRefreshHeaderState !== PullToRefreshState.SHOWN) {
                this._pullToRefreshHeaderState = PullToRefreshState.SHOWN;
                if (this.options.pullToRefreshHeader && this.options.pullToRefreshHeader.setPullToRefreshStatus) {
                    this.options.pullToRefreshHeader.setPullToRefreshStatus(this._pullToRefreshHeaderState);
                }
                this._scroll.scrollDirty = true;
            }
        }
        return this;
    };

    /**
     * Hides the pull-to-refresh renderable in case it was visible.
     */
    ScrollView.prototype.hidePullToRefresh = function(footer) {
        if (footer) {
            if (this._pullToRefreshFooterState === PullToRefreshState.SHOWN) {
                this._pullToRefreshFooterState = PullToRefreshState.HIDDING;
                if (this.options.pullToRefreshFooter && this.options.pullToRefreshFooter.setPullToRefreshStatus) {
                    this.options.pullToRefreshFooter.setPullToRefreshStatus(this._pullToRefreshFooterState);
                }
                this._pullToRefreshFooterVisiblePerc = 0;
                this._scroll.scrollDirty = true;
            }
        }
        else {
            if (this._pullToRefreshHeaderState === PullToRefreshState.SHOWN) {
                this._pullToRefreshHeaderState = PullToRefreshState.HIDDING;
                if (this.options.pullToRefreshHeader && this.options.pullToRefreshHeader.setPullToRefreshStatus) {
                    this.options.pullToRefreshHeader.setPullToRefreshStatus(this._pullToRefreshHeaderState);
                }
                this._pullToRefreshHeaderVisiblePerc = 0;
                this._scroll.scrollDirty = true;
            }
        }
        return this;
    };

    /**
     * Get the visible state of the pull-to-refresh renderable.
     */
    ScrollView.prototype.isPullToRefreshVisible = function(footer) {
        return footer ? (this._pullToRefreshFooterState === PullToRefreshState.SHOWN) : (this._pullToRefreshHeaderState === PullToRefreshState.SHOWN);
    };

    /**
     * Delegates any scroll force to leading/trailing scrollviews.
     */
    ScrollView.prototype.applyScrollForce = function(delta) {
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
     */
    ScrollView.prototype.updateScrollForce = function(prevDelta, newDelta) {
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
     */
    ScrollView.prototype.releaseScrollForce = function(delta, velocity) {
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
    ScrollView.prototype.commit = function(context) {

        // Must release touch first, prior to detect a new pull to refresh change
        if ((this._pullToRefreshHeaderState === PullToRefreshState.HIDDING) &&
            !this._scroll.scrollForceCount) {
            this._pullToRefreshHeaderState = PullToRefreshState.HIDDEN;
            if (this.options.pullToRefreshHeader && this.options.pullToRefreshHeader.setPullToRefreshStatus) {
                this.options.pullToRefreshHeader.setPullToRefreshStatus(this._pullToRefreshHeaderState);
            }
            this._scroll.scrollDirty = true;
        }

        // Must release touch first, prior to detect a new pull to refresh change
        if ((this._pullToRefreshFooterState === PullToRefreshState.HIDDING) &&
            (!this._scroll.scrollForceCount)) {
            this._pullToRefreshFooterState = PullToRefreshState.HIDDEN;
            if (this.options.pullToRefreshFooter && this.options.pullToRefreshFooter.setPullToRefreshStatus) {
                this.options.pullToRefreshFooter.setPullToRefreshStatus(this._pullToRefreshFooterState);
            }
            this._scroll.scrollDirty = true;
        }

        // Call base class
        var result = ScrollController.prototype.commit.call(this, context);

        // Emit pull to refresh events after the whole commit call has been executed
        // so that when code is executed in the event, the ScrollView is in a correct state.
        if ((this._cachedPullToRefreshHeaderState === PullToRefreshState.HIDDEN) &&
            (this._pullToRefreshHeaderState === PullToRefreshState.SHOWN)) {
            this._eventOutput.emit('refresh', {
                target: this,
                footer: false
            });
        }
        this._cachedPullToRefreshHeaderState = this._pullToRefreshHeaderState;
        if ((this._cachedPullToRefreshFooterState === PullToRefreshState.HIDDEN) &&
            (this._pullToRefreshFooterState === PullToRefreshState.SHOWN)) {
            this._eventOutput.emit('refresh', {
                target: this,
                footer: true
            });
        }
        this._cachedPullToRefreshFooterState = this._pullToRefreshFooterState;
        return result;
    };

    module.exports = ScrollView;
});

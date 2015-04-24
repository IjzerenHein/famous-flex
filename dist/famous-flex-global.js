(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof famousflex === 'undefined') {
    famousflex = {};
}

famousflex.FlexScrollView = require('../src/FlexScrollView');
famousflex.FlowLayoutNode = require('../src/FlowLayoutNode');
famousflex.LayoutContext = require('../src/LayoutContext');
famousflex.LayoutController = require('../src/LayoutController');
famousflex.LayoutNode = require('../src/LayoutNode');
famousflex.LayoutNodeManager = require('../src/LayoutNodeManager');
famousflex.LayoutUtility = require('../src/LayoutUtility');
famousflex.ScrollController = require('../src/ScrollController');
famousflex.VirtualViewSequence = require('../src/VirtualViewSequence');
famousflex.AnimationController = require('../src/AnimationController');

famousflex.widgets = famousflex.widgets || {};
famousflex.widgets.DatePicker = require('../src/widgets/DatePicker');
famousflex.widgets.TabBar = require('../src/widgets/TabBar');

famousflex.layouts = famousflex.layouts || {};
famousflex.layouts.CollectionLayout = require('../src/layouts/CollectionLayout');
famousflex.layouts.CoverLayout = require('../src/layouts/CoverLayout');
famousflex.layouts.CubeLayout = require('../src/layouts/CubeLayout');
famousflex.layouts.GridLayout = require('../src/layouts/GridLayout');
famousflex.layouts.HeaderFooterLayout = require('../src/layouts/HeaderFooterLayout');
famousflex.layouts.ListLayout = require('../src/layouts/ListLayout');
famousflex.layouts.NavBarLayout = require('../src/layouts/NavBarLayout');
famousflex.layouts.ProportionalLayout = require('../src/layouts/ProportionalLayout');
famousflex.layouts.WheelLayout = require('../src/layouts/WheelLayout');

famousflex.helpers = famousflex.helpers || {};
famousflex.helpers.LayoutDockHelper = require('../src/helpers/LayoutDockHelper');

},{"../src/AnimationController":2,"../src/FlexScrollView":3,"../src/FlowLayoutNode":4,"../src/LayoutContext":5,"../src/LayoutController":6,"../src/LayoutNode":7,"../src/LayoutNodeManager":8,"../src/LayoutUtility":9,"../src/ScrollController":10,"../src/VirtualViewSequence":11,"../src/helpers/LayoutDockHelper":12,"../src/layouts/CollectionLayout":13,"../src/layouts/CoverLayout":14,"../src/layouts/CubeLayout":15,"../src/layouts/GridLayout":16,"../src/layouts/HeaderFooterLayout":17,"../src/layouts/ListLayout":18,"../src/layouts/NavBarLayout":19,"../src/layouts/ProportionalLayout":20,"../src/layouts/WheelLayout":22,"../src/widgets/DatePicker":23,"../src/widgets/TabBar":25}],2:[function(require,module,exports){
(function (global){
var View = typeof window !== 'undefined' ? window.famous.core.View : typeof global !== 'undefined' ? global.famous.core.View : null;
var LayoutController = require('./LayoutController');
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
var Modifier = typeof window !== 'undefined' ? window.famous.core.Modifier : typeof global !== 'undefined' ? global.famous.core.Modifier : null;
var StateModifier = typeof window !== 'undefined' ? window.famous.modifiers.StateModifier : typeof global !== 'undefined' ? global.famous.modifiers.StateModifier : null;
var RenderNode = typeof window !== 'undefined' ? window.famous.core.RenderNode : typeof global !== 'undefined' ? global.famous.core.RenderNode : null;
var Timer = typeof window !== 'undefined' ? window.famous.utilities.Timer : typeof global !== 'undefined' ? global.famous.utilities.Timer : null;
var Easing = typeof window !== 'undefined' ? window.famous.transitions.Easing : typeof global !== 'undefined' ? global.famous.transitions.Easing : null;
function AnimationController(options) {
    View.apply(this, arguments);
    _createLayout.call(this);
    if (options) {
        this.setOptions(options);
    }
}
AnimationController.prototype = Object.create(View.prototype);
AnimationController.prototype.constructor = AnimationController;
AnimationController.Animation = {
    Slide: {
        Left: function (show, size) {
            return { transform: Transform.translate(show ? size[0] : -size[0], 0, 0) };
        },
        Right: function (show, size) {
            return { transform: Transform.translate(show ? -size[0] : size[0], 0, 0) };
        },
        Up: function (show, size) {
            return { transform: Transform.translate(0, show ? size[1] : -size[1], 0) };
        },
        Down: function (show, size) {
            return { transform: Transform.translate(0, show ? -size[1] : size[1], 0) };
        }
    },
    Fade: function (show, size, opacity) {
        return { opacity: opacity === undefined ? 0 : opacity };
    },
    Zoom: function (show, size, scale) {
        return {
            transform: Transform.scale(scale ? scale[0] : 0.5, scale ? scale[1] : 0.5, 1),
            align: [
                0.5,
                0.5
            ],
            origin: [
                0.5,
                0.5
            ]
        };
    }
};
AnimationController.DEFAULT_OPTIONS = {
    transition: {
        duration: 400,
        curve: Easing.inOutQuad
    },
    animation: AnimationController.Animation.Fade,
    show: {},
    hide: {},
    transfer: { zIndex: 10 },
    zIndexOffset: 0
};
var ItemState = {
        NONE: 0,
        HIDE: 1,
        HIDING: 2,
        SHOW: 3,
        SHOWING: 4,
        VISIBLE: 5,
        QUEUED: 6
    };
function ViewStackLayout(context, options) {
    var set = {
            size: context.size,
            translate: [
                0,
                0,
                0
            ]
        };
    var views = context.get('views');
    var transferables = context.get('transferables');
    for (var i = 0; i < Math.min(views.length, 2); i++) {
        var item = this._viewStack[i];
        switch (item.state) {
        case ItemState.HIDE:
        case ItemState.HIDING:
        case ItemState.VISIBLE:
        case ItemState.SHOW:
        case ItemState.SHOWING:
            var view = views[i];
            context.set(view, set);
            for (var j = 0; j < transferables.length; j++) {
                for (var k = 0; k < item.transferables.length; k++) {
                    if (transferables[j].renderNode === item.transferables[k].renderNode) {
                        context.set(transferables[j], {
                            translate: [
                                0,
                                0,
                                set.translate[2]
                            ],
                            size: [
                                context.size[0],
                                context.size[1]
                            ]
                        });
                    }
                }
            }
            set.translate[2] += options.zIndexOffset;
            break;
        }
    }
}
function _createLayout() {
    this._renderables = {
        views: [],
        transferables: []
    };
    this._viewStack = [];
    this.layout = new LayoutController({
        layout: ViewStackLayout.bind(this),
        layoutOptions: this.options,
        dataSource: this._renderables
    });
    this.add(this.layout);
    this.layout.on('layoutend', _startAnimations.bind(this));
}
function _getViewSpec(item, view, id, callback) {
    if (!item.view) {
        return;
    }
    var spec = view.getSpec(id);
    if (spec) {
        callback(spec);
    } else {
        Timer.after(_getViewSpec.bind(this, item, view, id, callback), 1);
    }
}
function _getTransferable(item, view, id) {
    if (view.getTransferable) {
        return view.getTransferable(id);
    }
    if (view.getSpec && view.get && view.replace) {
        if (view.get(id) !== undefined) {
            return {
                get: function () {
                    return view.get(id);
                },
                show: function (renderable) {
                    view.replace(id, renderable);
                },
                getSpec: _getViewSpec.bind(this, item, view, id)
            };
        }
    }
    if (view.layout) {
        return _getTransferable.call(this, item, view.layout, id);
    }
}
function _startTransferableAnimations(item, prevItem) {
    for (var sourceId in item.options.transfer.items) {
        _startTransferableAnimation.call(this, item, prevItem, sourceId);
    }
}
function _startTransferableAnimation(item, prevItem, sourceId) {
    var target = item.options.transfer.items[sourceId];
    var transferable = {};
    transferable.source = _getTransferable.call(this, prevItem, prevItem.view, sourceId);
    if (Array.isArray(target)) {
        for (var i = 0; i < target.length; i++) {
            transferable.target = _getTransferable.call(this, item, item.view, target[i]);
            if (transferable.target) {
                break;
            }
        }
    } else {
        transferable.target = _getTransferable.call(this, item, item.view, target);
    }
    if (transferable.source && transferable.target) {
        transferable.source.getSpec(function (sourceSpec) {
            transferable.originalSource = transferable.source.get();
            transferable.source.show(new RenderNode(new Modifier(sourceSpec)));
            transferable.originalTarget = transferable.target.get();
            var targetNode = new RenderNode(new Modifier({ opacity: 0 }));
            targetNode.add(transferable.originalTarget);
            transferable.target.show(targetNode);
            var zIndexMod = new Modifier({ transform: Transform.translate(0, 0, item.options.transfer.zIndex) });
            var mod = new StateModifier(sourceSpec);
            transferable.renderNode = new RenderNode(zIndexMod);
            transferable.renderNode.add(mod).add(transferable.originalSource);
            item.transferables.push(transferable);
            this._renderables.transferables.push(transferable.renderNode);
            this.layout.reflowLayout();
            Timer.after(function () {
                transferable.target.getSpec(function (targetSpec, transition) {
                    mod.halt();
                    if (sourceSpec.transform || targetSpec.transform) {
                        mod.setTransform(targetSpec.transform || Transform.identity, transition || item.options.transfer.transition);
                    }
                    if (sourceSpec.opacity !== undefined || targetSpec.opacity !== undefined) {
                        mod.setOpacity(targetSpec.opacity === undefined ? 1 : targetSpec.opacity, transition || item.options.transfer.transition);
                    }
                    if (sourceSpec.size || targetSpec.size) {
                        mod.setSize(targetSpec.size || sourceSpec.size, transition || item.options.transfer.transition);
                    }
                }, true);
            }, 1);
        }.bind(this), false);
    }
}
function _endTransferableAnimations(item) {
    for (var j = 0; j < item.transferables.length; j++) {
        var transferable = item.transferables[j];
        for (var i = 0; i < this._renderables.transferables.length; i++) {
            if (this._renderables.transferables[i] === transferable.renderNode) {
                this._renderables.transferables.splice(i, 1);
                break;
            }
        }
        transferable.source.show(transferable.originalSource);
        transferable.target.show(transferable.originalTarget);
    }
    item.transferables = [];
    this.layout.reflowLayout();
}
function _startAnimations(event) {
    var prevItem;
    for (var i = 0; i < this._viewStack.length; i++) {
        var item = this._viewStack[i];
        switch (item.state) {
        case ItemState.HIDE:
            item.state = ItemState.HIDING;
            _startAnimation.call(this, item, prevItem, event.size, false);
            _updateState.call(this);
            break;
        case ItemState.SHOW:
            item.state = ItemState.SHOWING;
            _startAnimation.call(this, item, prevItem, event.size, true);
            _updateState.call(this);
            break;
        }
        prevItem = item;
    }
}
function _startAnimation(item, prevItem, size, show) {
    var animation = show ? item.options.show.animation : item.options.hide.animation;
    var spec = animation ? animation(show, size) : {};
    item.mod.halt();
    var callback;
    if (show) {
        callback = item.showCallback;
        if (spec.transform) {
            item.mod.setTransform(spec.transform);
            item.mod.setTransform(Transform.identity, item.options.show.transition, callback);
            callback = undefined;
        }
        if (spec.opacity !== undefined) {
            item.mod.setOpacity(spec.opacity);
            item.mod.setOpacity(1, item.options.show.transition, callback);
            callback = undefined;
        }
        if (spec.align) {
            item.mod.setAlign(spec.align);
        }
        if (spec.origin) {
            item.mod.setOrigin(spec.origin);
        }
        if (prevItem) {
            _startTransferableAnimations.call(this, item, prevItem);
        }
        if (callback) {
            callback();
        }
    } else {
        callback = item.hideCallback;
        if (spec.transform) {
            item.mod.setTransform(spec.transform, item.options.hide.transition, callback);
            callback = undefined;
        }
        if (spec.opacity !== undefined) {
            item.mod.setOpacity(spec.opacity, item.options.hide.transition, callback);
            callback = undefined;
        }
        if (callback) {
            callback();
        }
    }
}
function _createItem(view, options, callback) {
    var item = {
            view: view,
            mod: new StateModifier(),
            state: ItemState.QUEUED,
            options: {
                show: {
                    transition: this.options.show.transition || this.options.transition,
                    animation: this.options.show.animation || this.options.animation
                },
                hide: {
                    transition: this.options.hide.transition || this.options.transition,
                    animation: this.options.hide.animation || this.options.animation
                },
                transfer: {
                    transition: this.options.transfer.transition || this.options.transition,
                    items: this.options.transfer.items || {},
                    zIndex: this.options.transfer.zIndex
                }
            },
            callback: callback,
            transferables: []
        };
    if (options) {
        item.options.show.transition = (options.show ? options.show.transition : undefined) || options.transition || item.options.show.transition;
        item.options.show.animation = (options.show ? options.show.animation : undefined) || options.animation || item.options.show.animation;
        item.options.transfer.transition = (options.transfer ? options.transfer.transition : undefined) || options.transition || item.options.transfer.transition;
        item.options.transfer.items = (options.transfer ? options.transfer.items : undefined) || item.options.transfer.items;
        item.options.transfer.zIndex = options.transfer && options.transfer.zIndex !== undefined ? options.transfer.zIndex : item.options.transfer.zIndex;
    }
    item.node = new RenderNode(item.mod);
    item.node.add(view);
    return item;
}
function _updateState() {
    var prevItem;
    var invalidated = false;
    for (var i = 0; i < Math.min(this._viewStack.length, 2); i++) {
        var item = this._viewStack[i];
        if (item.state === ItemState.QUEUED) {
            if (!prevItem || prevItem.state === ItemState.VISIBLE || prevItem.state === ItemState.HIDING) {
                if (prevItem && prevItem.state === ItemState.VISIBLE) {
                    prevItem.state = ItemState.HIDE;
                }
                item.state = ItemState.SHOW;
                invalidated = true;
            }
            break;
        } else if (item.state === ItemState.VISIBLE && item.hide) {
            item.state = ItemState.HIDE;
        }
        if (item.state === ItemState.SHOW || item.state === ItemState.HIDE) {
            this.layout.reflowLayout();
        }
        prevItem = item;
    }
    if (invalidated) {
        _updateState.call(this);
        this.layout.reflowLayout();
    }
}
AnimationController.prototype.show = function (renderable, options, callback) {
    if (!renderable) {
        return this.hide(options, callback);
    }
    var item = this._viewStack.length ? this._viewStack[this._viewStack.length - 1] : undefined;
    if (item && item.view === renderable) {
        item.hide = false;
        return this;
    }
    if (item && item.state !== ItemState.HIDING && options) {
        item.options.hide.transition = (options.hide ? options.hide.transition : undefined) || options.transition || item.options.hide.transition;
        item.options.hide.animation = (options.hide ? options.hide.animation : undefined) || options.animation || item.options.hide.animation;
    }
    item = _createItem.call(this, renderable, options, callback);
    item.showCallback = function () {
        item.state = ItemState.VISIBLE;
        _updateState.call(this);
        _endTransferableAnimations.call(this, item);
        if (callback) {
            callback();
        }
    }.bind(this);
    item.hideCallback = function () {
        var index = this._viewStack.indexOf(item);
        this._renderables.views.splice(index, 1);
        this._viewStack.splice(index, 1);
        item.view = undefined;
        _updateState.call(this);
    }.bind(this);
    this._renderables.views.push(item.node);
    this._viewStack.push(item);
    _updateState.call(this);
    return this;
};
AnimationController.prototype.hide = function (options, callback) {
    var item = this._viewStack.length ? this._viewStack[this._viewStack.length - 1] : undefined;
    if (!item || item.state === ItemState.HIDING) {
        return this;
    }
    item.hide = true;
    if (options) {
        item.options.hide.transition = (options.hide ? options.hide.transition : undefined) || options.transition || item.options.hide.transition;
        item.options.hide.animation = (options.hide ? options.hide.animation : undefined) || options.animation || item.options.hide.animation;
    }
    item.hideCallback = function () {
        var index = this._viewStack.indexOf(item);
        this._renderables.views.splice(index, 1);
        this._viewStack.splice(index, 1);
        item.view = undefined;
        _updateState.call(this);
        if (callback) {
            callback();
        }
    }.bind(this);
    _updateState.call(this);
    return this;
};
AnimationController.prototype.halt = function () {
    for (var i = 0; i < this._viewStack.length; i++) {
        var item = this._viewStack[this._viewStack.length - 1];
        if (item.state === ItemState.QUEUED || item.state === ItemState.SHOW) {
            this._renderables.views.splice(this._viewStack.length - 1, 1);
            this._viewStack.splice(this._viewStack.length - 1, 1);
            item.view = undefined;
        } else {
            break;
        }
    }
    return this;
};
AnimationController.prototype.get = function () {
    for (var i = 0; i < this._viewStack.length; i++) {
        var item = this._viewStack[i];
        if (item.state === ItemState.VISIBLE || item.state === ItemState.SHOW || item.state === ItemState.SHOWING) {
            return item.view;
        }
    }
    return undefined;
};
module.exports = AnimationController;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./LayoutController":6}],3:[function(require,module,exports){
var LayoutUtility = require('./LayoutUtility');
var ScrollController = require('./ScrollController');
var ListLayout = require('./layouts/ListLayout');
var PullToRefreshState = {
        HIDDEN: 0,
        PULLING: 1,
        ACTIVE: 2,
        COMPLETED: 3,
        HIDDING: 4
    };
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
    layout: ListLayout,
    direction: undefined,
    paginated: false,
    alignment: 0,
    flow: false,
    mouseMove: false,
    useContainer: false,
    visibleItemThresshold: 0.5,
    pullToRefreshHeader: undefined,
    pullToRefreshFooter: undefined,
    leadingScrollView: undefined,
    trailingScrollView: undefined
};
FlexScrollView.prototype.setOptions = function (options) {
    ScrollController.prototype.setOptions.call(this, options);
    if (options.pullToRefreshHeader || options.pullToRefreshFooter || this._pullToRefresh) {
        if (options.pullToRefreshHeader) {
            this._pullToRefresh = this._pullToRefresh || [
                undefined,
                undefined
            ];
            if (!this._pullToRefresh[0]) {
                this._pullToRefresh[0] = {
                    state: PullToRefreshState.HIDDEN,
                    prevState: PullToRefreshState.HIDDEN,
                    footer: false
                };
            }
            this._pullToRefresh[0].node = options.pullToRefreshHeader;
        } else if (!this.options.pullToRefreshHeader && this._pullToRefresh) {
            this._pullToRefresh[0] = undefined;
        }
        if (options.pullToRefreshFooter) {
            this._pullToRefresh = this._pullToRefresh || [
                undefined,
                undefined
            ];
            if (!this._pullToRefresh[1]) {
                this._pullToRefresh[1] = {
                    state: PullToRefreshState.HIDDEN,
                    prevState: PullToRefreshState.HIDDEN,
                    footer: true
                };
            }
            this._pullToRefresh[1].node = options.pullToRefreshFooter;
        } else if (!this.options.pullToRefreshFooter && this._pullToRefresh) {
            this._pullToRefresh[1] = undefined;
        }
        if (this._pullToRefresh && !this._pullToRefresh[0] && !this._pullToRefresh[1]) {
            this._pullToRefresh = undefined;
        }
    }
    return this;
};
FlexScrollView.prototype.sequenceFrom = function (node) {
    return this.setDataSource(node);
};
FlexScrollView.prototype.getCurrentIndex = function () {
    var item = this.getFirstVisibleItem();
    return item ? item.viewSequence.getIndex() : -1;
};
FlexScrollView.prototype.goToPage = function (index, noAnimation) {
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
FlexScrollView.prototype.getOffset = function () {
    return this._scrollOffsetCache;
};
FlexScrollView.prototype.getPosition = FlexScrollView.prototype.getOffset;
FlexScrollView.prototype.getAbsolutePosition = function () {
    return -(this._scrollOffsetCache + this._scroll.groupStart);
};
function _setPullToRefreshState(pullToRefresh, state) {
    if (pullToRefresh.state !== state) {
        pullToRefresh.state = state;
        if (pullToRefresh.node && pullToRefresh.node.setPullToRefreshStatus) {
            pullToRefresh.node.setPullToRefreshStatus(state);
        }
    }
}
function _getPullToRefresh(footer) {
    return this._pullToRefresh ? this._pullToRefresh[footer ? 1 : 0] : undefined;
}
FlexScrollView.prototype._postLayout = function (size, scrollOffset) {
    if (!this._pullToRefresh) {
        return;
    }
    if (this.options.alignment) {
        scrollOffset += size[this._direction];
    }
    var prevHeight;
    var nextHeight;
    var totalHeight;
    for (var i = 0; i < 2; i++) {
        var pullToRefresh = this._pullToRefresh[i];
        if (pullToRefresh) {
            var length = pullToRefresh.node.getSize()[this._direction];
            var pullLength = pullToRefresh.node.getPullToRefreshSize ? pullToRefresh.node.getPullToRefreshSize()[this._direction] : length;
            var offset;
            if (!pullToRefresh.footer) {
                prevHeight = this._calcScrollHeight(false);
                prevHeight = prevHeight === undefined ? -1 : prevHeight;
                offset = prevHeight >= 0 ? scrollOffset - prevHeight : prevHeight;
                if (this.options.alignment) {
                    nextHeight = this._calcScrollHeight(true);
                    nextHeight = nextHeight === undefined ? -1 : nextHeight;
                    totalHeight = prevHeight >= 0 && nextHeight >= 0 ? prevHeight + nextHeight : -1;
                    if (totalHeight >= 0 && totalHeight < size[this._direction]) {
                        offset = Math.round(scrollOffset - size[this._direction] + nextHeight);
                    }
                }
            } else {
                nextHeight = nextHeight === undefined ? nextHeight = this._calcScrollHeight(true) : nextHeight;
                nextHeight = nextHeight === undefined ? -1 : nextHeight;
                offset = nextHeight >= 0 ? scrollOffset + nextHeight : size[this._direction] + 1;
                if (!this.options.alignment) {
                    prevHeight = prevHeight === undefined ? this._calcScrollHeight(false) : prevHeight;
                    prevHeight = prevHeight === undefined ? -1 : prevHeight;
                    totalHeight = prevHeight >= 0 && nextHeight >= 0 ? prevHeight + nextHeight : -1;
                    if (totalHeight >= 0 && totalHeight < size[this._direction]) {
                        offset = Math.round(scrollOffset - prevHeight + size[this._direction]);
                    }
                }
                offset = -(offset - size[this._direction]);
            }
            var visiblePerc = Math.max(Math.min(offset / pullLength, 1), 0);
            switch (pullToRefresh.state) {
            case PullToRefreshState.HIDDEN:
                if (this._scroll.scrollForceCount) {
                    if (visiblePerc >= 1) {
                        _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                    } else if (offset >= 0.2) {
                        _setPullToRefreshState(pullToRefresh, PullToRefreshState.PULLING);
                    }
                }
                break;
            case PullToRefreshState.PULLING:
                if (this._scroll.scrollForceCount && visiblePerc >= 1) {
                    _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
                } else if (offset < 0.2) {
                    _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDEN);
                }
                break;
            case PullToRefreshState.ACTIVE:
                break;
            case PullToRefreshState.COMPLETED:
                if (!this._scroll.scrollForceCount) {
                    if (offset >= 0.2) {
                        _setPullToRefreshState(pullToRefresh, PullToRefreshState.HIDDING);
                    } else {
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
                } else if (this._scroll.scrollForceCount) {
                    scrollLength = Math.min(offset, length);
                }
                var set = {
                        size: [
                            size[0],
                            size[1]
                        ],
                        translate: [
                            0,
                            0,
                            -0.001
                        ],
                        scrollLength: scrollLength
                    };
                set.size[this._direction] = Math.max(Math.min(offset, pullLength), 0);
                set.translate[this._direction] = pullToRefresh.footer ? size[this._direction] - length : 0;
                this._nodes._context.set(contextNode, set);
            }
        }
    }
};
FlexScrollView.prototype.showPullToRefresh = function (footer) {
    var pullToRefresh = _getPullToRefresh.call(this, footer);
    if (pullToRefresh) {
        _setPullToRefreshState(pullToRefresh, PullToRefreshState.ACTIVE);
        this._scroll.scrollDirty = true;
    }
};
FlexScrollView.prototype.hidePullToRefresh = function (footer) {
    var pullToRefresh = _getPullToRefresh.call(this, footer);
    if (pullToRefresh && pullToRefresh.state === PullToRefreshState.ACTIVE) {
        _setPullToRefreshState(pullToRefresh, PullToRefreshState.COMPLETED);
        this._scroll.scrollDirty = true;
    }
    return this;
};
FlexScrollView.prototype.isPullToRefreshVisible = function (footer) {
    var pullToRefresh = _getPullToRefresh.call(this, footer);
    return pullToRefresh ? pullToRefresh.state === PullToRefreshState.ACTIVE : false;
};
FlexScrollView.prototype.applyScrollForce = function (delta) {
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
        } else {
            ScrollController.prototype.applyScrollForce.call(this, delta);
            this._thisScrollViewDelta += delta;
        }
    } else {
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
        } else {
            ScrollController.prototype.applyScrollForce.call(this, delta);
            this._thisScrollViewDelta += delta;
        }
    }
    return this;
};
FlexScrollView.prototype.updateScrollForce = function (prevDelta, newDelta) {
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
        } else if (delta) {
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
            this._thisScrollViewDelta += delta;
        }
    } else {
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
        } else {
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, this._thisScrollViewDelta + delta);
            this._thisScrollViewDelta += delta;
        }
    }
    return this;
};
FlexScrollView.prototype.releaseScrollForce = function (delta, velocity) {
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
        } else {
            this._thisScrollViewDelta -= delta;
            ScrollController.prototype.releaseScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
        }
    } else {
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
        } else {
            this._thisScrollViewDelta -= delta;
            ScrollController.prototype.updateScrollForce.call(this, this._thisScrollViewDelta, delta ? velocity : 0);
        }
    }
    return this;
};
FlexScrollView.prototype.commit = function (context) {
    var result = ScrollController.prototype.commit.call(this, context);
    if (this._pullToRefresh) {
        for (var i = 0; i < 2; i++) {
            var pullToRefresh = this._pullToRefresh[i];
            if (pullToRefresh) {
                if (pullToRefresh.state === PullToRefreshState.ACTIVE && pullToRefresh.prevState !== PullToRefreshState.ACTIVE) {
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
},{"./LayoutUtility":9,"./ScrollController":10,"./layouts/ListLayout":18}],4:[function(require,module,exports){
(function (global){
var OptionsManager = typeof window !== 'undefined' ? window.famous.core.OptionsManager : typeof global !== 'undefined' ? global.famous.core.OptionsManager : null;
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
var Vector = typeof window !== 'undefined' ? window.famous.math.Vector : typeof global !== 'undefined' ? global.famous.math.Vector : null;
var Particle = typeof window !== 'undefined' ? window.famous.physics.bodies.Particle : typeof global !== 'undefined' ? global.famous.physics.bodies.Particle : null;
var Spring = typeof window !== 'undefined' ? window.famous.physics.forces.Spring : typeof global !== 'undefined' ? global.famous.physics.forces.Spring : null;
var PhysicsEngine = typeof window !== 'undefined' ? window.famous.physics.PhysicsEngine : typeof global !== 'undefined' ? global.famous.physics.PhysicsEngine : null;
var LayoutNode = require('./LayoutNode');
var Transitionable = typeof window !== 'undefined' ? window.famous.transitions.Transitionable : typeof global !== 'undefined' ? global.famous.transitions.Transitionable : null;
function FlowLayoutNode(renderNode, spec) {
    LayoutNode.apply(this, arguments);
    if (!this.options) {
        this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
        this._optionsManager = new OptionsManager(this.options);
    }
    if (!this._pe) {
        this._pe = new PhysicsEngine();
        this._pe.sleep();
    }
    if (!this._properties) {
        this._properties = {};
    } else {
        for (var propName in this._properties) {
            this._properties[propName].init = false;
        }
    }
    if (!this._lockTransitionable) {
        this._lockTransitionable = new Transitionable(1);
    } else {
        this._lockTransitionable.halt();
        this._lockTransitionable.reset(1);
    }
    this._specModified = true;
    this._initial = true;
    this._spec.endState = {};
    if (spec) {
        this.setSpec(spec);
    }
}
FlowLayoutNode.prototype = Object.create(LayoutNode.prototype);
FlowLayoutNode.prototype.constructor = FlowLayoutNode;
FlowLayoutNode.DEFAULT_OPTIONS = {
    spring: {
        dampingRatio: 0.8,
        period: 300
    },
    properties: {
        opacity: true,
        align: true,
        origin: true,
        size: true,
        translate: true,
        skew: true,
        rotate: true,
        scale: true
    },
    particleRounding: 0.001
};
var DEFAULT = {
        opacity: 1,
        opacity2D: [
            1,
            0
        ],
        size: [
            0,
            0
        ],
        origin: [
            0,
            0
        ],
        align: [
            0,
            0
        ],
        scale: [
            1,
            1,
            1
        ],
        translate: [
            0,
            0,
            0
        ],
        rotate: [
            0,
            0,
            0
        ],
        skew: [
            0,
            0,
            0
        ]
    };
FlowLayoutNode.prototype.setOptions = function (options) {
    this._optionsManager.setOptions(options);
    var wasSleeping = this._pe.isSleeping();
    for (var propName in this._properties) {
        var prop = this._properties[propName];
        if (options.spring && prop.force) {
            prop.force.setOptions(this.options.spring);
        }
        if (options.properties && options.properties[propName] !== undefined) {
            if (this.options.properties[propName].length) {
                prop.enabled = this.options.properties[propName];
            } else {
                prop.enabled = [
                    this.options.properties[propName],
                    this.options.properties[propName],
                    this.options.properties[propName]
                ];
            }
        }
    }
    if (wasSleeping) {
        this._pe.sleep();
    }
    return this;
};
FlowLayoutNode.prototype.setSpec = function (spec) {
    var set;
    if (spec.transform) {
        set = Transform.interpret(spec.transform);
    }
    if (!set) {
        set = {};
    }
    set.opacity = spec.opacity;
    set.size = spec.size;
    set.align = spec.align;
    set.origin = spec.origin;
    var oldRemoving = this._removing;
    var oldInvalidated = this._invalidated;
    this.set(set);
    this._removing = oldRemoving;
    this._invalidated = oldInvalidated;
};
FlowLayoutNode.prototype.reset = function () {
    if (this._invalidated) {
        for (var propName in this._properties) {
            this._properties[propName].invalidated = false;
        }
        this._invalidated = false;
    }
    this.trueSizeRequested = false;
    this.usesTrueSize = false;
};
FlowLayoutNode.prototype.remove = function (removeSpec) {
    this._removing = true;
    if (removeSpec) {
        this.setSpec(removeSpec);
    } else {
        this._pe.sleep();
        this._specModified = false;
    }
    this._invalidated = false;
};
FlowLayoutNode.prototype.releaseLock = function (enable) {
    this._lockTransitionable.halt();
    this._lockTransitionable.reset(0);
    if (enable) {
        this._lockTransitionable.set(1, { duration: this.options.spring.period || 1000 });
    }
};
function _getRoundedValue3D(prop, def, precision, lockValue) {
    if (!prop || !prop.init) {
        return def;
    }
    return [
        prop.enabled[0] ? Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / precision) * precision : prop.endState.x,
        prop.enabled[1] ? Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / precision) * precision : prop.endState.y,
        prop.enabled[2] ? Math.round((prop.curState.z + (prop.endState.z - prop.curState.z) * lockValue) / precision) * precision : prop.endState.z
    ];
}
FlowLayoutNode.prototype.getSpec = function () {
    var endStateReached = this._pe.isSleeping();
    if (!this._specModified && endStateReached) {
        this._spec.removed = !this._invalidated;
        return this._spec;
    }
    this._initial = false;
    this._specModified = !endStateReached;
    this._spec.removed = false;
    if (!endStateReached) {
        this._pe.step();
    }
    var spec = this._spec;
    var precision = this.options.particleRounding;
    var lockValue = this._lockTransitionable.get();
    var prop = this._properties.opacity;
    if (prop && prop.init) {
        spec.opacity = prop.enabled[0] ? Math.round(Math.max(0, Math.min(1, prop.curState.x)) / precision) * precision : prop.endState.x;
        spec.endState.opacity = prop.endState.x;
    } else {
        spec.opacity = undefined;
        spec.endState.opacity = undefined;
    }
    prop = this._properties.size;
    if (prop && prop.init) {
        spec.size = spec.size || [
            0,
            0
        ];
        spec.size[0] = prop.enabled[0] ? Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1 : prop.endState.x;
        spec.size[1] = prop.enabled[1] ? Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1 : prop.endState.y;
        spec.endState.size = spec.endState.size || [
            0,
            0
        ];
        spec.endState.size[0] = prop.endState.x;
        spec.endState.size[1] = prop.endState.y;
    } else {
        spec.size = undefined;
        spec.endState.size = undefined;
    }
    prop = this._properties.align;
    if (prop && prop.init) {
        spec.align = spec.align || [
            0,
            0
        ];
        spec.align[0] = prop.enabled[0] ? Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1 : prop.endState.x;
        spec.align[1] = prop.enabled[1] ? Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1 : prop.endState.y;
        spec.endState.align = spec.endState.align || [
            0,
            0
        ];
        spec.endState.align[0] = prop.endState.x;
        spec.endState.align[1] = prop.endState.y;
    } else {
        spec.align = undefined;
        spec.endState.align = undefined;
    }
    prop = this._properties.origin;
    if (prop && prop.init) {
        spec.origin = spec.origin || [
            0,
            0
        ];
        spec.origin[0] = prop.enabled[0] ? Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1 : prop.endState.x;
        spec.origin[1] = prop.enabled[1] ? Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1 : prop.endState.y;
        spec.endState.origin = spec.endState.origin || [
            0,
            0
        ];
        spec.endState.origin[0] = prop.endState.x;
        spec.endState.origin[1] = prop.endState.y;
    } else {
        spec.origin = undefined;
        spec.endState.origin = undefined;
    }
    var translate = this._properties.translate;
    var translateX;
    var translateY;
    var translateZ;
    if (translate && translate.init) {
        translateX = translate.enabled[0] ? Math.round((translate.curState.x + (translate.endState.x - translate.curState.x) * lockValue) / precision) * precision : translate.endState.x;
        translateY = translate.enabled[1] ? Math.round((translate.curState.y + (translate.endState.y - translate.curState.y) * lockValue) / precision) * precision : translate.endState.y;
        translateZ = translate.enabled[2] ? Math.round((translate.curState.z + (translate.endState.z - translate.curState.z) * lockValue) / precision) * precision : translate.endState.z;
    } else {
        translateX = 0;
        translateY = 0;
        translateZ = 0;
    }
    var scale = this._properties.scale;
    var skew = this._properties.skew;
    var rotate = this._properties.rotate;
    if (scale || skew || rotate) {
        spec.transform = Transform.build({
            translate: [
                translateX,
                translateY,
                translateZ
            ],
            skew: _getRoundedValue3D.call(this, skew, DEFAULT.skew, this.options.particleRounding, lockValue),
            scale: _getRoundedValue3D.call(this, scale, DEFAULT.scale, this.options.particleRounding, lockValue),
            rotate: _getRoundedValue3D.call(this, rotate, DEFAULT.rotate, this.options.particleRounding, lockValue)
        });
        spec.endState.transform = Transform.build({
            translate: translate ? [
                translate.endState.x,
                translate.endState.y,
                translate.endState.z
            ] : DEFAULT.translate,
            scale: scale ? [
                scale.endState.x,
                scale.endState.y,
                scale.endState.z
            ] : DEFAULT.scale,
            skew: skew ? [
                skew.endState.x,
                skew.endState.y,
                skew.endState.z
            ] : DEFAULT.skew,
            rotate: rotate ? [
                rotate.endState.x,
                rotate.endState.y,
                rotate.endState.z
            ] : DEFAULT.rotate
        });
    } else if (translate) {
        if (!spec.transform) {
            spec.transform = Transform.translate(translateX, translateY, translateZ);
            spec.endState.transform = Transform.translate(translate.endState.x, translate.endState.y, translate.endState.z);
        } else {
            spec.transform[12] = translateX;
            spec.transform[13] = translateY;
            spec.transform[14] = translateZ;
            spec.endState.transform[12] = translate.endState.x;
            spec.endState.transform[13] = translate.endState.y;
            spec.endState.transform[14] = translate.endState.z;
        }
    } else {
        spec.transform = undefined;
        spec.endState.transform = undefined;
    }
    return this._spec;
};
function _setPropertyValue(prop, propName, endState, defaultValue, immediate, isTranslate) {
    prop = prop || this._properties[propName];
    if (prop && prop.init) {
        prop.invalidated = true;
        var value = defaultValue;
        if (endState !== undefined) {
            value = endState;
        } else if (this._removing) {
            value = prop.particle.getPosition();
        }
        prop.endState.x = value[0];
        prop.endState.y = value.length > 1 ? value[1] : 0;
        prop.endState.z = value.length > 2 ? value[2] : 0;
        if (immediate) {
            prop.curState.x = prop.endState.x;
            prop.curState.y = prop.endState.y;
            prop.curState.z = prop.endState.z;
            prop.velocity.x = 0;
            prop.velocity.y = 0;
            prop.velocity.z = 0;
        } else if (prop.endState.x !== prop.curState.x || prop.endState.y !== prop.curState.y || prop.endState.z !== prop.curState.z) {
            this._pe.wake();
        }
        return;
    } else {
        var wasSleeping = this._pe.isSleeping();
        if (!prop) {
            prop = {
                particle: new Particle({ position: this._initial || immediate ? endState : defaultValue }),
                endState: new Vector(endState)
            };
            prop.curState = prop.particle.position;
            prop.velocity = prop.particle.velocity;
            prop.force = new Spring(this.options.spring);
            prop.force.setOptions({ anchor: prop.endState });
            this._pe.addBody(prop.particle);
            prop.forceId = this._pe.attach(prop.force, prop.particle);
            this._properties[propName] = prop;
        } else {
            prop.particle.setPosition(this._initial || immediate ? endState : defaultValue);
            prop.endState.set(endState);
        }
        if (!this._initial && !immediate) {
            this._pe.wake();
        } else if (wasSleeping) {
            this._pe.sleep();
        }
        if (this.options.properties[propName] && this.options.properties[propName].length) {
            prop.enabled = this.options.properties[propName];
        } else {
            prop.enabled = [
                this.options.properties[propName],
                this.options.properties[propName],
                this.options.properties[propName]
            ];
        }
        prop.init = true;
        prop.invalidated = true;
    }
}
function _getIfNE2D(a1, a2) {
    return a1[0] === a2[0] && a1[1] === a2[1] ? undefined : a1;
}
function _getIfNE3D(a1, a2) {
    return a1[0] === a2[0] && a1[1] === a2[1] && a1[2] === a2[2] ? undefined : a1;
}
FlowLayoutNode.prototype.set = function (set, defaultSize) {
    if (defaultSize) {
        this._removing = false;
    }
    this._invalidated = true;
    this.scrollLength = set.scrollLength;
    this._specModified = true;
    var prop = this._properties.opacity;
    var value = set.opacity === DEFAULT.opacity ? undefined : set.opacity;
    if (value !== undefined || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'opacity', value === undefined ? undefined : [
            value,
            0
        ], DEFAULT.opacity2D);
    }
    prop = this._properties.align;
    value = set.align ? _getIfNE2D(set.align, DEFAULT.align) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'align', value, DEFAULT.align);
    }
    prop = this._properties.origin;
    value = set.origin ? _getIfNE2D(set.origin, DEFAULT.origin) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'origin', value, DEFAULT.origin);
    }
    prop = this._properties.size;
    value = set.size || defaultSize;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'size', value, defaultSize, this.usesTrueSize);
    }
    prop = this._properties.translate;
    value = set.translate;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'translate', value, DEFAULT.translate, undefined, true);
    }
    prop = this._properties.scale;
    value = set.scale ? _getIfNE3D(set.scale, DEFAULT.scale) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'scale', value, DEFAULT.scale);
    }
    prop = this._properties.rotate;
    value = set.rotate ? _getIfNE3D(set.rotate, DEFAULT.rotate) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'rotate', value, DEFAULT.rotate);
    }
    prop = this._properties.skew;
    value = set.skew ? _getIfNE3D(set.skew, DEFAULT.skew) : undefined;
    if (value || prop && prop.init) {
        _setPropertyValue.call(this, prop, 'skew', value, DEFAULT.skew);
    }
};
module.exports = FlowLayoutNode;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./LayoutNode":7}],5:[function(require,module,exports){
function LayoutContext(methods) {
    for (var n in methods) {
        this[n] = methods[n];
    }
}
LayoutContext.prototype.size = undefined;
LayoutContext.prototype.direction = undefined;
LayoutContext.prototype.scrollOffset = undefined;
LayoutContext.prototype.scrollStart = undefined;
LayoutContext.prototype.scrollEnd = undefined;
LayoutContext.prototype.next = function () {
};
LayoutContext.prototype.prev = function () {
};
LayoutContext.prototype.get = function (node) {
};
LayoutContext.prototype.set = function (node, set) {
};
LayoutContext.prototype.resolveSize = function (node) {
};
module.exports = LayoutContext;
},{}],6:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var Entity = typeof window !== 'undefined' ? window.famous.core.Entity : typeof global !== 'undefined' ? global.famous.core.Entity : null;
var ViewSequence = typeof window !== 'undefined' ? window.famous.core.ViewSequence : typeof global !== 'undefined' ? global.famous.core.ViewSequence : null;
var OptionsManager = typeof window !== 'undefined' ? window.famous.core.OptionsManager : typeof global !== 'undefined' ? global.famous.core.OptionsManager : null;
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
var LayoutUtility = require('./LayoutUtility');
var LayoutNodeManager = require('./LayoutNodeManager');
var LayoutNode = require('./LayoutNode');
var FlowLayoutNode = require('./FlowLayoutNode');
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
require('./helpers/LayoutDockHelper');
function LayoutController(options, nodeManager) {
    this.id = Entity.register(this);
    this._isDirty = true;
    this._contextSizeCache = [
        0,
        0
    ];
    this._commitOutput = {};
    this._cleanupRegistration = {
        commit: function () {
            return undefined;
        },
        cleanup: function (context) {
            this.cleanup(context);
        }.bind(this)
    };
    this._cleanupRegistration.target = Entity.register(this._cleanupRegistration);
    this._cleanupRegistration.render = function () {
        return this.target;
    }.bind(this._cleanupRegistration);
    this._eventInput = new EventHandler();
    EventHandler.setInputHandler(this, this._eventInput);
    this._eventOutput = new EventHandler();
    EventHandler.setOutputHandler(this, this._eventOutput);
    this._layout = { options: Object.create({}) };
    this._layout.optionsManager = new OptionsManager(this._layout.options);
    this._layout.optionsManager.on('change', function () {
        this._isDirty = true;
    }.bind(this));
    this.options = Object.create(LayoutController.DEFAULT_OPTIONS);
    this._optionsManager = new OptionsManager(this.options);
    if (nodeManager) {
        this._nodes = nodeManager;
    } else if (options && options.flow) {
        this._nodes = new LayoutNodeManager(FlowLayoutNode, _initFlowLayoutNode.bind(this));
    } else {
        this._nodes = new LayoutNodeManager(LayoutNode);
    }
    this.setDirection(undefined);
    if (options) {
        this.setOptions(options);
    }
}
LayoutController.DEFAULT_OPTIONS = {
    flow: false,
    flowOptions: {
        reflowOnResize: true,
        properties: {
            opacity: true,
            align: true,
            origin: true,
            size: true,
            translate: true,
            skew: true,
            rotate: true,
            scale: true
        },
        spring: {
            dampingRatio: 0.8,
            period: 300
        }
    }
};
function _initFlowLayoutNode(node, spec) {
    if (!spec && this.options.flowOptions.insertSpec) {
        node.setSpec(this.options.flowOptions.insertSpec);
    }
}
LayoutController.prototype.setOptions = function (options) {
    if (options.alignment !== undefined && options.alignment !== this.options.alignment) {
        this._isDirty = true;
    }
    this._optionsManager.setOptions(options);
    if (options.nodeSpring) {
        console.warn('nodeSpring options have been moved inside `flowOptions`. Use `flowOptions.spring` instead.');
        this._optionsManager.setOptions({ flowOptions: { spring: options.nodeSpring } });
        this._nodes.setNodeOptions(this.options.flowOptions);
    }
    if (options.reflowOnResize !== undefined) {
        console.warn('reflowOnResize options have been moved inside `flowOptions`. Use `flowOptions.reflowOnResize` instead.');
        this._optionsManager.setOptions({ flowOptions: { reflowOnResize: options.reflowOnResize } });
        this._nodes.setNodeOptions(this.options.flowOptions);
    }
    if (options.insertSpec) {
        console.warn('insertSpec options have been moved inside `flowOptions`. Use `flowOptions.insertSpec` instead.');
        this._optionsManager.setOptions({ flowOptions: { insertSpec: options.insertSpec } });
        this._nodes.setNodeOptions(this.options.flowOptions);
    }
    if (options.removeSpec) {
        console.warn('removeSpec options have been moved inside `flowOptions`. Use `flowOptions.removeSpec` instead.');
        this._optionsManager.setOptions({ flowOptions: { removeSpec: options.removeSpec } });
        this._nodes.setNodeOptions(this.options.flowOptions);
    }
    if (options.dataSource) {
        this.setDataSource(options.dataSource);
    }
    if (options.layout) {
        this.setLayout(options.layout, options.layoutOptions);
    } else if (options.layoutOptions) {
        this.setLayoutOptions(options.layoutOptions);
    }
    if (options.direction !== undefined) {
        this.setDirection(options.direction);
    }
    if (options.flowOptions && this.options.flow) {
        this._nodes.setNodeOptions(this.options.flowOptions);
    }
    if (options.preallocateNodes) {
        this._nodes.preallocateNodes(options.preallocateNodes.count || 0, options.preallocateNodes.spec);
    }
    return this;
};
function _forEachRenderable(callback) {
    var dataSource = this._dataSource;
    if (dataSource instanceof Array) {
        for (var i = 0, j = dataSource.length; i < j; i++) {
            callback(dataSource[i]);
        }
    } else if (dataSource instanceof ViewSequence) {
        var renderable;
        while (dataSource) {
            renderable = dataSource.get();
            if (!renderable) {
                break;
            }
            callback(renderable);
            dataSource = dataSource.getNext();
        }
    } else {
        for (var key in dataSource) {
            callback(dataSource[key]);
        }
    }
}
LayoutController.prototype.setDataSource = function (dataSource) {
    this._dataSource = dataSource;
    this._nodesById = undefined;
    if (dataSource instanceof Array) {
        this._viewSequence = new ViewSequence(dataSource);
    } else if (dataSource instanceof ViewSequence || dataSource.getNext) {
        this._viewSequence = dataSource;
    } else if (dataSource instanceof Object) {
        this._nodesById = dataSource;
    }
    if (this.options.autoPipeEvents) {
        if (this._dataSource.pipe) {
            this._dataSource.pipe(this);
            this._dataSource.pipe(this._eventOutput);
        } else {
            _forEachRenderable.call(this, function (renderable) {
                if (renderable && renderable.pipe) {
                    renderable.pipe(this);
                    renderable.pipe(this._eventOutput);
                }
            }.bind(this));
        }
    }
    this._isDirty = true;
    return this;
};
LayoutController.prototype.getDataSource = function () {
    return this._dataSource;
};
LayoutController.prototype.setLayout = function (layout, options) {
    if (layout instanceof Function) {
        this._layout._function = layout;
        this._layout.capabilities = layout.Capabilities;
        this._layout.literal = undefined;
    } else if (layout instanceof Object) {
        this._layout.literal = layout;
        this._layout.capabilities = undefined;
        var helperName = Object.keys(layout)[0];
        var Helper = LayoutUtility.getRegisteredHelper(helperName);
        this._layout._function = Helper ? function (context, options2) {
            var helper = new Helper(context, options2);
            helper.parse(layout[helperName]);
        } : undefined;
    } else {
        this._layout._function = undefined;
        this._layout.capabilities = undefined;
        this._layout.literal = undefined;
    }
    if (options) {
        this.setLayoutOptions(options);
    }
    this.setDirection(this._configuredDirection);
    this._isDirty = true;
    return this;
};
LayoutController.prototype.getLayout = function () {
    return this._layout.literal || this._layout._function;
};
LayoutController.prototype.setLayoutOptions = function (options) {
    this._layout.optionsManager.setOptions(options);
    return this;
};
LayoutController.prototype.getLayoutOptions = function () {
    return this._layout.options;
};
function _getActualDirection(direction) {
    if (this._layout.capabilities && this._layout.capabilities.direction) {
        if (Array.isArray(this._layout.capabilities.direction)) {
            for (var i = 0; i < this._layout.capabilities.direction.length; i++) {
                if (this._layout.capabilities.direction[i] === direction) {
                    return direction;
                }
            }
            return this._layout.capabilities.direction[0];
        } else {
            return this._layout.capabilities.direction;
        }
    }
    return direction === undefined ? Utility.Direction.Y : direction;
}
LayoutController.prototype.setDirection = function (direction) {
    this._configuredDirection = direction;
    var newDirection = _getActualDirection.call(this, direction);
    if (newDirection !== this._direction) {
        this._direction = newDirection;
        this._isDirty = true;
    }
};
LayoutController.prototype.getDirection = function (actual) {
    return actual ? this._direction : this._configuredDirection;
};
LayoutController.prototype.getSpec = function (node, normalize, endState) {
    if (!node) {
        return undefined;
    }
    if (node instanceof String || typeof node === 'string') {
        if (!this._nodesById) {
            return undefined;
        }
        node = this._nodesById[node];
        if (!node) {
            return undefined;
        }
        if (node instanceof Array) {
            return node;
        }
    }
    if (this._specs) {
        for (var i = 0; i < this._specs.length; i++) {
            var spec = this._specs[i];
            if (spec.renderNode === node) {
                if (endState && spec.endState) {
                    spec = spec.endState;
                }
                if (normalize && spec.transform && spec.size && (spec.align || spec.origin)) {
                    var transform = spec.transform;
                    if (spec.align && (spec.align[0] || spec.align[1])) {
                        transform = Transform.thenMove(transform, [
                            spec.align[0] * this._contextSizeCache[0],
                            spec.align[1] * this._contextSizeCache[1],
                            0
                        ]);
                    }
                    if (spec.origin && (spec.origin[0] || spec.origin[1])) {
                        transform = Transform.moveThen([
                            -spec.origin[0] * spec.size[0],
                            -spec.origin[1] * spec.size[1],
                            0
                        ], transform);
                    }
                    return {
                        opacity: spec.opacity,
                        size: spec.size,
                        transform: transform
                    };
                }
                return spec;
            }
        }
    }
    return undefined;
};
LayoutController.prototype.reflowLayout = function () {
    this._isDirty = true;
    return this;
};
LayoutController.prototype.resetFlowState = function () {
    if (this.options.flow) {
        this._resetFlowState = true;
    }
    return this;
};
LayoutController.prototype.insert = function (indexOrId, renderable, insertSpec) {
    if (indexOrId instanceof String || typeof indexOrId === 'string') {
        if (this._dataSource === undefined) {
            this._dataSource = {};
            this._nodesById = this._dataSource;
        }
        if (this._nodesById[indexOrId] === renderable) {
            return this;
        }
        this._nodesById[indexOrId] = renderable;
    } else {
        if (this._dataSource === undefined) {
            this._dataSource = [];
            this._viewSequence = new ViewSequence(this._dataSource);
        }
        var dataSource = this._viewSequence || this._dataSource;
        if (indexOrId === -1) {
            dataSource.push(renderable);
        } else if (indexOrId === 0) {
            if (dataSource === this._viewSequence) {
                dataSource.splice(0, 0, renderable);
                if (this._viewSequence.getIndex() === 0) {
                    var nextViewSequence = this._viewSequence.getNext();
                    if (nextViewSequence && nextViewSequence.get()) {
                        this._viewSequence = nextViewSequence;
                    }
                }
            } else {
                dataSource.splice(0, 0, renderable);
            }
        } else {
            dataSource.splice(indexOrId, 0, renderable);
        }
    }
    if (insertSpec) {
        this._nodes.insertNode(this._nodes.createNode(renderable, insertSpec));
    }
    if (this.options.autoPipeEvents && renderable && renderable.pipe) {
        renderable.pipe(this);
        renderable.pipe(this._eventOutput);
    }
    this._isDirty = true;
    return this;
};
LayoutController.prototype.push = function (renderable, insertSpec) {
    return this.insert(-1, renderable, insertSpec);
};
function _getViewSequenceAtIndex(index, startViewSequence) {
    var viewSequence = startViewSequence || this._viewSequence;
    var i = viewSequence ? viewSequence.getIndex() : index;
    if (index > i) {
        while (viewSequence) {
            viewSequence = viewSequence.getNext();
            if (!viewSequence) {
                return undefined;
            }
            i = viewSequence.getIndex();
            if (i === index) {
                return viewSequence;
            } else if (index < i) {
                return undefined;
            }
        }
    } else if (index < i) {
        while (viewSequence) {
            viewSequence = viewSequence.getPrevious();
            if (!viewSequence) {
                return undefined;
            }
            i = viewSequence.getIndex();
            if (i === index) {
                return viewSequence;
            } else if (index > i) {
                return undefined;
            }
        }
    }
    return viewSequence;
}
function _getDataSourceArray() {
    if (Array.isArray(this._dataSource)) {
        return this._dataSource;
    } else if (this._viewSequence || this._viewSequence._) {
        return this._viewSequence._.array;
    }
    return undefined;
}
LayoutController.prototype.get = function (indexOrId) {
    if (this._nodesById || indexOrId instanceof String || typeof indexOrId === 'string') {
        return this._nodesById[indexOrId];
    }
    var viewSequence = _getViewSequenceAtIndex.call(this, indexOrId);
    return viewSequence ? viewSequence.get() : undefined;
};
LayoutController.prototype.swap = function (index, index2) {
    var array = _getDataSourceArray.call(this);
    if (!array) {
        throw '.swap is only supported for dataSources of type Array or ViewSequence';
    }
    if (index === index2) {
        return this;
    }
    if (index < 0 || index >= array.length) {
        throw 'Invalid index (' + index + ') specified to .swap';
    }
    if (index2 < 0 || index2 >= array.length) {
        throw 'Invalid second index (' + index2 + ') specified to .swap';
    }
    var renderNode = array[index];
    array[index] = array[index2];
    array[index2] = renderNode;
    this._isDirty = true;
    return this;
};
LayoutController.prototype.replace = function (indexOrId, renderable, noAnimation) {
    var oldRenderable;
    if (this._nodesById || indexOrId instanceof String || typeof indexOrId === 'string') {
        oldRenderable = this._nodesById[indexOrId];
        if (oldRenderable !== renderable) {
            if (noAnimation && oldRenderable) {
                var node = this._nodes.getNodeByRenderNode(oldRenderable);
                if (node) {
                    node.setRenderNode(renderable);
                }
            }
            this._nodesById[indexOrId] = renderable;
            this._isDirty = true;
        }
        return oldRenderable;
    }
    var array = _getDataSourceArray.call(this);
    if (!array) {
        return undefined;
    }
    if (indexOrId < 0 || indexOrId >= array.length) {
        throw 'Invalid index (' + indexOrId + ') specified to .replace';
    }
    oldRenderable = array[indexOrId];
    if (oldRenderable !== renderable) {
        array[indexOrId] = renderable;
        this._isDirty = true;
    }
    return oldRenderable;
};
LayoutController.prototype.move = function (index, newIndex) {
    var array = _getDataSourceArray.call(this);
    if (!array) {
        throw '.move is only supported for dataSources of type Array or ViewSequence';
    }
    if (index < 0 || index >= array.length) {
        throw 'Invalid index (' + index + ') specified to .move';
    }
    if (newIndex < 0 || newIndex >= array.length) {
        throw 'Invalid newIndex (' + newIndex + ') specified to .move';
    }
    var item = array.splice(index, 1)[0];
    array.splice(newIndex, 0, item);
    this._isDirty = true;
    return this;
};
LayoutController.prototype.remove = function (indexOrId, removeSpec) {
    var renderNode;
    if (this._nodesById || indexOrId instanceof String || typeof indexOrId === 'string') {
        if (indexOrId instanceof String || typeof indexOrId === 'string') {
            renderNode = this._nodesById[indexOrId];
            if (renderNode) {
                delete this._nodesById[indexOrId];
            }
        } else {
            for (var key in this._nodesById) {
                if (this._nodesById[key] === indexOrId) {
                    delete this._nodesById[key];
                    renderNode = indexOrId;
                    break;
                }
            }
        }
    } else if (indexOrId instanceof Number || typeof indexOrId === 'number') {
        var array = _getDataSourceArray.call(this);
        if (!array || indexOrId < 0 || indexOrId >= array.length) {
            throw 'Invalid index (' + indexOrId + ') specified to .remove (or dataSource doesn\'t support remove)';
        }
        renderNode = array[indexOrId];
        this._dataSource.splice(indexOrId, 1);
    } else {
        indexOrId = this._dataSource.indexOf(indexOrId);
        if (indexOrId >= 0) {
            this._dataSource.splice(indexOrId, 1);
            renderNode = indexOrId;
        }
    }
    if (this._viewSequence && renderNode) {
        var viewSequence = _getViewSequenceAtIndex.call(this, this._viewSequence.getIndex(), this._dataSource);
        viewSequence = viewSequence || _getViewSequenceAtIndex.call(this, this._viewSequence.getIndex() - 1, this._dataSource);
        viewSequence = viewSequence || this._dataSource;
        this._viewSequence = viewSequence;
    }
    if (renderNode && removeSpec) {
        var node = this._nodes.getNodeByRenderNode(renderNode);
        if (node) {
            node.remove(removeSpec || this.options.flowOptions.removeSpec);
        }
    }
    if (renderNode) {
        this._isDirty = true;
    }
    return renderNode;
};
LayoutController.prototype.removeAll = function (removeSpec) {
    if (this._nodesById) {
        var dirty = false;
        for (var key in this._nodesById) {
            delete this._nodesById[key];
            dirty = true;
        }
        if (dirty) {
            this._isDirty = true;
        }
    } else if (this._dataSource) {
        this.setDataSource([]);
    }
    if (removeSpec) {
        var node = this._nodes.getStartEnumNode();
        while (node) {
            node.remove(removeSpec || this.options.flowOptions.removeSpec);
            node = node._next;
        }
    }
    return this;
};
LayoutController.prototype.getSize = function () {
    return this._size || this.options.size;
};
LayoutController.prototype.render = function render() {
    return this.id;
};
LayoutController.prototype.commit = function commit(context) {
    var transform = context.transform;
    var origin = context.origin;
    var size = context.size;
    var opacity = context.opacity;
    if (this._resetFlowState) {
        this._resetFlowState = false;
        this._isDirty = true;
        this._nodes.removeAll();
    }
    if (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1] || this._isDirty || this._nodes._trueSizeRequested || this.options.alwaysLayout) {
        var eventData = {
                target: this,
                oldSize: this._contextSizeCache,
                size: size,
                dirty: this._isDirty,
                trueSizeRequested: this._nodes._trueSizeRequested
            };
        this._eventOutput.emit('layoutstart', eventData);
        if (this.options.flow) {
            var lock = false;
            if (!this.options.flowOptions.reflowOnResize) {
                if (!this._isDirty && (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1])) {
                    lock = undefined;
                } else {
                    lock = true;
                }
            }
            if (lock !== undefined) {
                var node = this._nodes.getStartEnumNode();
                while (node) {
                    node.releaseLock(lock);
                    node = node._next;
                }
            }
        }
        this._contextSizeCache[0] = size[0];
        this._contextSizeCache[1] = size[1];
        this._isDirty = false;
        var scrollEnd;
        if (this.options.size && this.options.size[this._direction] === true) {
            scrollEnd = 1000000;
        }
        var layoutContext = this._nodes.prepareForLayout(this._viewSequence, this._nodesById, {
                size: size,
                direction: this._direction,
                scrollEnd: scrollEnd
            });
        if (this._layout._function) {
            this._layout._function(layoutContext, this._layout.options);
        }
        this._nodes.removeNonInvalidatedNodes(this.options.flowOptions.removeSpec);
        this._nodes.removeVirtualViewSequenceNodes();
        if (scrollEnd) {
            scrollEnd = 0;
            node = this._nodes.getStartEnumNode();
            while (node) {
                if (node._invalidated && node.scrollLength) {
                    scrollEnd += node.scrollLength;
                }
                node = node._next;
            }
            this._size = this._size || [
                0,
                0
            ];
            this._size[0] = this.options.size[0];
            this._size[1] = this.options.size[1];
            this._size[this._direction] = scrollEnd;
        }
        var result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
        this._specs = result.specs;
        this._commitOutput.target = result.specs;
        this._eventOutput.emit('layoutend', eventData);
        this._eventOutput.emit('reflow', { target: this });
    } else if (this.options.flow) {
        result = this._nodes.buildSpecAndDestroyUnrenderedNodes();
        this._specs = result.specs;
        this._commitOutput.target = result.specs;
        if (result.modified) {
            this._eventOutput.emit('reflow', { target: this });
        }
    }
    var target = this._commitOutput.target;
    for (var i = 0, j = target.length; i < j; i++) {
        if (target[i].renderNode) {
            target[i].target = target[i].renderNode.render();
        }
    }
    if (!target.length || target[target.length - 1] !== this._cleanupRegistration) {
        target.push(this._cleanupRegistration);
    }
    if (origin && (origin[0] !== 0 || origin[1] !== 0)) {
        transform = Transform.moveThen([
            -size[0] * origin[0],
            -size[1] * origin[1],
            0
        ], transform);
    }
    this._commitOutput.size = size;
    this._commitOutput.opacity = opacity;
    this._commitOutput.transform = transform;
    return this._commitOutput;
};
LayoutController.prototype.cleanup = function (context) {
    if (this.options.flow) {
        this._resetFlowState = true;
    }
};
module.exports = LayoutController;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./FlowLayoutNode":4,"./LayoutNode":7,"./LayoutNodeManager":8,"./LayoutUtility":9,"./helpers/LayoutDockHelper":12}],7:[function(require,module,exports){
(function (global){
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
var LayoutUtility = require('./LayoutUtility');
function LayoutNode(renderNode, spec) {
    this.renderNode = renderNode;
    this._spec = spec ? LayoutUtility.cloneSpec(spec) : {};
    this._spec.renderNode = renderNode;
    this._specModified = true;
    this._invalidated = false;
    this._removing = false;
}
LayoutNode.prototype.setRenderNode = function (renderNode) {
    this.renderNode = renderNode;
    this._spec.renderNode = renderNode;
};
LayoutNode.prototype.setOptions = function (options) {
};
LayoutNode.prototype.destroy = function () {
    this.renderNode = undefined;
    this._spec.renderNode = undefined;
    this._viewSequence = undefined;
};
LayoutNode.prototype.reset = function () {
    this._invalidated = false;
    this.trueSizeRequested = false;
};
LayoutNode.prototype.setSpec = function (spec) {
    this._specModified = true;
    if (spec.align) {
        if (!spec.align) {
            this._spec.align = [
                0,
                0
            ];
        }
        this._spec.align[0] = spec.align[0];
        this._spec.align[1] = spec.align[1];
    } else {
        this._spec.align = undefined;
    }
    if (spec.origin) {
        if (!spec.origin) {
            this._spec.origin = [
                0,
                0
            ];
        }
        this._spec.origin[0] = spec.origin[0];
        this._spec.origin[1] = spec.origin[1];
    } else {
        this._spec.origin = undefined;
    }
    if (spec.size) {
        if (!spec.size) {
            this._spec.size = [
                0,
                0
            ];
        }
        this._spec.size[0] = spec.size[0];
        this._spec.size[1] = spec.size[1];
    } else {
        this._spec.size = undefined;
    }
    if (spec.transform) {
        if (!spec.transform) {
            this._spec.transform = spec.transform.slice(0);
        } else {
            for (var i = 0; i < 16; i++) {
                this._spec.transform[i] = spec.transform[i];
            }
        }
    } else {
        this._spec.transform = undefined;
    }
    this._spec.opacity = spec.opacity;
};
LayoutNode.prototype.set = function (set, size) {
    this._invalidated = true;
    this._specModified = true;
    this._removing = false;
    var spec = this._spec;
    spec.opacity = set.opacity;
    if (set.size) {
        if (!spec.size) {
            spec.size = [
                0,
                0
            ];
        }
        spec.size[0] = set.size[0];
        spec.size[1] = set.size[1];
    } else {
        spec.size = undefined;
    }
    if (set.origin) {
        if (!spec.origin) {
            spec.origin = [
                0,
                0
            ];
        }
        spec.origin[0] = set.origin[0];
        spec.origin[1] = set.origin[1];
    } else {
        spec.origin = undefined;
    }
    if (set.align) {
        if (!spec.align) {
            spec.align = [
                0,
                0
            ];
        }
        spec.align[0] = set.align[0];
        spec.align[1] = set.align[1];
    } else {
        spec.align = undefined;
    }
    if (set.skew || set.rotate || set.scale) {
        this._spec.transform = Transform.build({
            translate: set.translate || [
                0,
                0,
                0
            ],
            skew: set.skew || [
                0,
                0,
                0
            ],
            scale: set.scale || [
                1,
                1,
                1
            ],
            rotate: set.rotate || [
                0,
                0,
                0
            ]
        });
    } else if (set.translate) {
        this._spec.transform = Transform.translate(set.translate[0], set.translate[1], set.translate[2]);
    } else {
        this._spec.transform = undefined;
    }
    this.scrollLength = set.scrollLength;
};
LayoutNode.prototype.getSpec = function () {
    this._specModified = false;
    this._spec.removed = !this._invalidated;
    return this._spec;
};
LayoutNode.prototype.remove = function (removeSpec) {
    this._removing = true;
};
module.exports = LayoutNode;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./LayoutUtility":9}],8:[function(require,module,exports){
var LayoutContext = require('./LayoutContext');
var LayoutUtility = require('./LayoutUtility');
var MAX_POOL_SIZE = 100;
function LayoutNodeManager(LayoutNode, initLayoutNodeFn) {
    this.LayoutNode = LayoutNode;
    this._initLayoutNodeFn = initLayoutNodeFn;
    this._layoutCount = 0;
    this._context = new LayoutContext({
        next: _contextNext.bind(this),
        prev: _contextPrev.bind(this),
        get: _contextGet.bind(this),
        set: _contextSet.bind(this),
        resolveSize: _contextResolveSize.bind(this),
        size: [
            0,
            0
        ]
    });
    this._contextState = {};
    this._pool = {
        layoutNodes: { size: 0 },
        resolveSize: [
            0,
            0
        ]
    };
}
LayoutNodeManager.prototype.prepareForLayout = function (viewSequence, nodesById, contextData) {
    var node = this._first;
    while (node) {
        node.reset();
        node = node._next;
    }
    var context = this._context;
    this._layoutCount++;
    this._nodesById = nodesById;
    this._trueSizeRequested = false;
    this._reevalTrueSize = contextData.reevalTrueSize || !context.size || context.size[0] !== contextData.size[0] || context.size[1] !== contextData.size[1];
    var contextState = this._contextState;
    contextState.startSequence = viewSequence;
    contextState.nextSequence = viewSequence;
    contextState.prevSequence = viewSequence;
    contextState.start = undefined;
    contextState.nextGetIndex = 0;
    contextState.prevGetIndex = 0;
    contextState.nextSetIndex = 0;
    contextState.prevSetIndex = 0;
    contextState.addCount = 0;
    contextState.removeCount = 0;
    contextState.lastRenderNode = undefined;
    context.size[0] = contextData.size[0];
    context.size[1] = contextData.size[1];
    context.direction = contextData.direction;
    context.reverse = contextData.reverse;
    context.alignment = contextData.reverse ? 1 : 0;
    context.scrollOffset = contextData.scrollOffset || 0;
    context.scrollStart = contextData.scrollStart || 0;
    context.scrollEnd = contextData.scrollEnd || context.size[context.direction];
    return context;
};
LayoutNodeManager.prototype.removeNonInvalidatedNodes = function (removeSpec) {
    var node = this._first;
    while (node) {
        if (!node._invalidated && !node._removing) {
            node.remove(removeSpec);
        }
        node = node._next;
    }
};
LayoutNodeManager.prototype.removeVirtualViewSequenceNodes = function () {
    if (this._contextState.startSequence && this._contextState.startSequence.cleanup) {
        this._contextState.startSequence.cleanup();
    }
};
LayoutNodeManager.prototype.buildSpecAndDestroyUnrenderedNodes = function (translate) {
    var specs = [];
    var result = {
            specs: specs,
            modified: false
        };
    var node = this._first;
    while (node) {
        var modified = node._specModified;
        var spec = node.getSpec();
        if (spec.removed) {
            var destroyNode = node;
            node = node._next;
            _destroyNode.call(this, destroyNode);
            result.modified = true;
        } else {
            if (modified) {
                if (spec.transform && translate) {
                    spec.transform[12] += translate[0];
                    spec.transform[13] += translate[1];
                    spec.transform[14] += translate[2];
                    spec.transform[12] = Math.round(spec.transform[12] * 100000) / 100000;
                    spec.transform[13] = Math.round(spec.transform[13] * 100000) / 100000;
                    if (spec.endState) {
                        spec.endState.transform[12] += translate[0];
                        spec.endState.transform[13] += translate[1];
                        spec.endState.transform[14] += translate[2];
                        spec.endState.transform[12] = Math.round(spec.endState.transform[12] * 100000) / 100000;
                        spec.endState.transform[13] = Math.round(spec.endState.transform[13] * 100000) / 100000;
                    }
                }
                result.modified = true;
            }
            specs.push(spec);
            node = node._next;
        }
    }
    this._contextState.addCount = 0;
    this._contextState.removeCount = 0;
    return result;
};
LayoutNodeManager.prototype.getNodeByRenderNode = function (renderable) {
    var node = this._first;
    while (node) {
        if (node.renderNode === renderable) {
            return node;
        }
        node = node._next;
    }
    return undefined;
};
LayoutNodeManager.prototype.insertNode = function (node) {
    node._next = this._first;
    if (this._first) {
        this._first._prev = node;
    }
    this._first = node;
};
LayoutNodeManager.prototype.setNodeOptions = function (options) {
    this._nodeOptions = options;
    var node = this._first;
    while (node) {
        node.setOptions(options);
        node = node._next;
    }
    node = this._pool.layoutNodes.first;
    while (node) {
        node.setOptions(options);
        node = node._next;
    }
};
LayoutNodeManager.prototype.preallocateNodes = function (count, spec) {
    var nodes = [];
    for (var i = 0; i < count; i++) {
        nodes.push(this.createNode(undefined, spec));
    }
    for (i = 0; i < count; i++) {
        _destroyNode.call(this, nodes[i]);
    }
};
LayoutNodeManager.prototype.createNode = function (renderNode, spec) {
    var node;
    if (this._pool.layoutNodes.first) {
        node = this._pool.layoutNodes.first;
        this._pool.layoutNodes.first = node._next;
        this._pool.layoutNodes.size--;
        node.constructor.apply(node, arguments);
    } else {
        node = new this.LayoutNode(renderNode, spec);
        if (this._nodeOptions) {
            node.setOptions(this._nodeOptions);
        }
    }
    node._prev = undefined;
    node._next = undefined;
    node._viewSequence = undefined;
    node._layoutCount = 0;
    if (this._initLayoutNodeFn) {
        this._initLayoutNodeFn.call(this, node, spec);
    }
    return node;
};
LayoutNodeManager.prototype.removeAll = function () {
    var node = this._first;
    while (node) {
        var next = node._next;
        _destroyNode.call(this, node);
        node = next;
    }
    this._first = undefined;
};
function _destroyNode(node) {
    if (node._next) {
        node._next._prev = node._prev;
    }
    if (node._prev) {
        node._prev._next = node._next;
    } else {
        this._first = node._next;
    }
    node.destroy();
    if (this._pool.layoutNodes.size < MAX_POOL_SIZE) {
        this._pool.layoutNodes.size++;
        node._prev = undefined;
        node._next = this._pool.layoutNodes.first;
        this._pool.layoutNodes.first = node;
    }
}
LayoutNodeManager.prototype.getStartEnumNode = function (next) {
    if (next === undefined) {
        return this._first;
    } else if (next === true) {
        return this._contextState.start && this._contextState.startPrev ? this._contextState.start._next : this._contextState.start;
    } else if (next === false) {
        return this._contextState.start && !this._contextState.startPrev ? this._contextState.start._prev : this._contextState.start;
    }
};
function _contextGetCreateAndOrderNodes(renderNode, prev) {
    var node;
    var state = this._contextState;
    if (!state.start) {
        node = this._first;
        while (node) {
            if (node.renderNode === renderNode) {
                break;
            }
            node = node._next;
        }
        if (!node) {
            node = this.createNode(renderNode);
            node._next = this._first;
            if (this._first) {
                this._first._prev = node;
            }
            this._first = node;
        }
        state.start = node;
        state.startPrev = prev;
        state.prev = node;
        state.next = node;
        return node;
    }
    if (prev) {
        if (state.prev._prev && state.prev._prev.renderNode === renderNode) {
            state.prev = state.prev._prev;
            return state.prev;
        }
    } else {
        if (state.next._next && state.next._next.renderNode === renderNode) {
            state.next = state.next._next;
            return state.next;
        }
    }
    node = this._first;
    while (node) {
        if (node.renderNode === renderNode) {
            break;
        }
        node = node._next;
    }
    if (!node) {
        node = this.createNode(renderNode);
    } else {
        if (node._next) {
            node._next._prev = node._prev;
        }
        if (node._prev) {
            node._prev._next = node._next;
        } else {
            this._first = node._next;
        }
        node._next = undefined;
        node._prev = undefined;
    }
    if (prev) {
        if (state.prev._prev) {
            node._prev = state.prev._prev;
            state.prev._prev._next = node;
        } else {
            this._first = node;
        }
        state.prev._prev = node;
        node._next = state.prev;
        state.prev = node;
    } else {
        if (state.next._next) {
            node._next = state.next._next;
            state.next._next._prev = node;
        }
        state.next._next = node;
        node._prev = state.next;
        state.next = node;
    }
    return node;
}
function _contextNext() {
    if (!this._contextState.nextSequence) {
        return undefined;
    }
    if (this._context.reverse) {
        this._contextState.nextSequence = this._contextState.nextSequence.getNext();
        if (!this._contextState.nextSequence) {
            return undefined;
        }
    }
    var renderNode = this._contextState.nextSequence.get();
    if (!renderNode) {
        this._contextState.nextSequence = undefined;
        return undefined;
    }
    var nextSequence = this._contextState.nextSequence;
    if (!this._context.reverse) {
        this._contextState.nextSequence = this._contextState.nextSequence.getNext();
    }
    if (this._contextState.lastRenderNode === renderNode) {
        throw 'ViewSequence is corrupted, should never contain the same renderNode twice, index: ' + nextSequence.getIndex();
    }
    this._contextState.lastRenderNode = renderNode;
    return {
        renderNode: renderNode,
        viewSequence: nextSequence,
        next: true,
        index: ++this._contextState.nextGetIndex
    };
}
function _contextPrev() {
    if (!this._contextState.prevSequence) {
        return undefined;
    }
    if (!this._context.reverse) {
        this._contextState.prevSequence = this._contextState.prevSequence.getPrevious();
        if (!this._contextState.prevSequence) {
            return undefined;
        }
    }
    var renderNode = this._contextState.prevSequence.get();
    if (!renderNode) {
        this._contextState.prevSequence = undefined;
        return undefined;
    }
    var prevSequence = this._contextState.prevSequence;
    if (this._context.reverse) {
        this._contextState.prevSequence = this._contextState.prevSequence.getPrevious();
    }
    if (this._contextState.lastRenderNode === renderNode) {
        throw 'ViewSequence is corrupted, should never contain the same renderNode twice, index: ' + prevSequence.getIndex();
    }
    this._contextState.lastRenderNode = renderNode;
    return {
        renderNode: renderNode,
        viewSequence: prevSequence,
        prev: true,
        index: --this._contextState.prevGetIndex
    };
}
function _contextGet(contextNodeOrId) {
    if (this._nodesById && (contextNodeOrId instanceof String || typeof contextNodeOrId === 'string')) {
        var renderNode = this._nodesById[contextNodeOrId];
        if (!renderNode) {
            return undefined;
        }
        if (renderNode instanceof Array) {
            var result = [];
            for (var i = 0, j = renderNode.length; i < j; i++) {
                result.push({
                    renderNode: renderNode[i],
                    arrayElement: true
                });
            }
            return result;
        }
        return {
            renderNode: renderNode,
            byId: true
        };
    } else {
        return contextNodeOrId;
    }
}
function _contextSet(contextNodeOrId, set) {
    var contextNode = this._nodesById ? _contextGet.call(this, contextNodeOrId) : contextNodeOrId;
    if (contextNode) {
        var node = contextNode.node;
        if (!node) {
            if (contextNode.next) {
                if (contextNode.index < this._contextState.nextSetIndex) {
                    LayoutUtility.error('Nodes must be layed out in the same order as they were requested!');
                }
                this._contextState.nextSetIndex = contextNode.index;
            } else if (contextNode.prev) {
                if (contextNode.index > this._contextState.prevSetIndex) {
                    LayoutUtility.error('Nodes must be layed out in the same order as they were requested!');
                }
                this._contextState.prevSetIndex = contextNode.index;
            }
            node = _contextGetCreateAndOrderNodes.call(this, contextNode.renderNode, contextNode.prev);
            node._viewSequence = contextNode.viewSequence;
            node._layoutCount++;
            if (node._layoutCount === 1) {
                this._contextState.addCount++;
            }
            contextNode.node = node;
        }
        node.usesTrueSize = contextNode.usesTrueSize;
        node.trueSizeRequested = contextNode.trueSizeRequested;
        node.set(set, this._context.size);
        contextNode.set = set;
    }
    return set;
}
function _contextResolveSize(contextNodeOrId, parentSize) {
    var contextNode = this._nodesById ? _contextGet.call(this, contextNodeOrId) : contextNodeOrId;
    var resolveSize = this._pool.resolveSize;
    if (!contextNode) {
        resolveSize[0] = 0;
        resolveSize[1] = 0;
        return resolveSize;
    }
    var renderNode = contextNode.renderNode;
    var size = renderNode.getSize();
    if (!size) {
        return parentSize;
    }
    var configSize = renderNode.size && renderNode._trueSizeCheck !== undefined ? renderNode.size : undefined;
    if (configSize && (configSize[0] === true || configSize[1] === true)) {
        contextNode.usesTrueSize = true;
        var backupSize = renderNode._backupSize;
        if (renderNode._contentDirty || renderNode._trueSizeCheck) {
            this._trueSizeRequested = true;
            contextNode.trueSizeRequested = true;
        }
        if (renderNode._trueSizeCheck) {
            if (backupSize && configSize !== size) {
                var newWidth = configSize[0] === true ? Math.max(backupSize[0], size[0]) : size[0];
                var newHeight = configSize[1] === true ? Math.max(backupSize[1], size[1]) : size[1];
                backupSize[0] = newWidth;
                backupSize[1] = newHeight;
                size = backupSize;
                renderNode._backupSize = undefined;
                backupSize = undefined;
            }
        }
        if (this._reevalTrueSize || backupSize && (backupSize[0] !== size[0] || backupSize[1] !== size[1])) {
            renderNode._trueSizeCheck = true;
            renderNode._sizeDirty = true;
            this._trueSizeRequested = true;
        }
        if (!backupSize) {
            renderNode._backupSize = [
                0,
                0
            ];
            backupSize = renderNode._backupSize;
        }
        backupSize[0] = size[0];
        backupSize[1] = size[1];
    }
    configSize = renderNode._nodes ? renderNode.options.size : undefined;
    if (configSize && (configSize[0] === true || configSize[1] === true)) {
        if (this._reevalTrueSize || renderNode._nodes._trueSizeRequested) {
            contextNode.usesTrueSize = true;
            contextNode.trueSizeRequested = true;
            this._trueSizeRequested = true;
        }
    }
    if (size[0] === undefined || size[0] === true || size[1] === undefined || size[1] === true) {
        resolveSize[0] = size[0];
        resolveSize[1] = size[1];
        size = resolveSize;
        if (size[0] === undefined) {
            size[0] = parentSize[0];
        } else if (size[0] === true) {
            size[0] = 0;
            this._trueSizeRequested = true;
            contextNode.trueSizeRequested = true;
        }
        if (size[1] === undefined) {
            size[1] = parentSize[1];
        } else if (size[1] === true) {
            size[1] = 0;
            this._trueSizeRequested = true;
            contextNode.trueSizeRequested = true;
        }
    }
    return size;
}
module.exports = LayoutNodeManager;
},{"./LayoutContext":5,"./LayoutUtility":9}],9:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
function LayoutUtility() {
}
LayoutUtility.registeredHelpers = {};
var Capabilities = {
        SEQUENCE: 1,
        DIRECTION_X: 2,
        DIRECTION_Y: 4,
        SCROLLING: 8
    };
LayoutUtility.Capabilities = Capabilities;
LayoutUtility.normalizeMargins = function (margins) {
    if (!margins) {
        return [
            0,
            0,
            0,
            0
        ];
    } else if (!Array.isArray(margins)) {
        return [
            margins,
            margins,
            margins,
            margins
        ];
    } else if (margins.length === 0) {
        return [
            0,
            0,
            0,
            0
        ];
    } else if (margins.length === 1) {
        return [
            margins[0],
            margins[0],
            margins[0],
            margins[0]
        ];
    } else if (margins.length === 2) {
        return [
            margins[0],
            margins[1],
            margins[0],
            margins[1]
        ];
    } else {
        return margins;
    }
};
LayoutUtility.cloneSpec = function (spec) {
    var clone = {};
    if (spec.opacity !== undefined) {
        clone.opacity = spec.opacity;
    }
    if (spec.size !== undefined) {
        clone.size = spec.size.slice(0);
    }
    if (spec.transform !== undefined) {
        clone.transform = spec.transform.slice(0);
    }
    if (spec.origin !== undefined) {
        clone.origin = spec.origin.slice(0);
    }
    if (spec.align !== undefined) {
        clone.align = spec.align.slice(0);
    }
    return clone;
};
function _isEqualArray(a, b) {
    if (a === b) {
        return true;
    }
    if (a === undefined || b === undefined) {
        return false;
    }
    var i = a.length;
    if (i !== b.length) {
        return false;
    }
    while (i--) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
LayoutUtility.isEqualSpec = function (spec1, spec2) {
    if (spec1.opacity !== spec2.opacity) {
        return false;
    }
    if (!_isEqualArray(spec1.size, spec2.size)) {
        return false;
    }
    if (!_isEqualArray(spec1.transform, spec2.transform)) {
        return false;
    }
    if (!_isEqualArray(spec1.origin, spec2.origin)) {
        return false;
    }
    if (!_isEqualArray(spec1.align, spec2.align)) {
        return false;
    }
    return true;
};
LayoutUtility.getSpecDiffText = function (spec1, spec2) {
    var result = 'spec diff:';
    if (spec1.opacity !== spec2.opacity) {
        result += '\nopacity: ' + spec1.opacity + ' != ' + spec2.opacity;
    }
    if (!_isEqualArray(spec1.size, spec2.size)) {
        result += '\nsize: ' + JSON.stringify(spec1.size) + ' != ' + JSON.stringify(spec2.size);
    }
    if (!_isEqualArray(spec1.transform, spec2.transform)) {
        result += '\ntransform: ' + JSON.stringify(spec1.transform) + ' != ' + JSON.stringify(spec2.transform);
    }
    if (!_isEqualArray(spec1.origin, spec2.origin)) {
        result += '\norigin: ' + JSON.stringify(spec1.origin) + ' != ' + JSON.stringify(spec2.origin);
    }
    if (!_isEqualArray(spec1.align, spec2.align)) {
        result += '\nalign: ' + JSON.stringify(spec1.align) + ' != ' + JSON.stringify(spec2.align);
    }
    return result;
};
LayoutUtility.error = function (message) {
    console.log('ERROR: ' + message);
    throw message;
};
LayoutUtility.warning = function (message) {
    console.log('WARNING: ' + message);
};
LayoutUtility.log = function (args) {
    var message = '';
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg instanceof Object || arg instanceof Array) {
            message += JSON.stringify(arg);
        } else {
            message += arg;
        }
    }
    console.log(message);
};
LayoutUtility.combineOptions = function (options1, options2, forceClone) {
    if (options1 && !options2 && !forceClone) {
        return options1;
    } else if (!options1 && options2 && !forceClone) {
        return options2;
    }
    var options = Utility.clone(options1 || {});
    if (options2) {
        for (var key in options2) {
            options[key] = options2[key];
        }
    }
    return options;
};
LayoutUtility.registerHelper = function (name, Helper) {
    if (!Helper.prototype.parse) {
        LayoutUtility.error('The layout-helper for name "' + name + '" is required to support the "parse" method');
    }
    if (this.registeredHelpers[name] !== undefined) {
        LayoutUtility.warning('A layout-helper with the name "' + name + '" is already registered and will be overwritten');
    }
    this.registeredHelpers[name] = Helper;
};
LayoutUtility.unregisterHelper = function (name) {
    delete this.registeredHelpers[name];
};
LayoutUtility.getRegisteredHelper = function (name) {
    return this.registeredHelpers[name];
};
module.exports = LayoutUtility;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){
(function (global){
var LayoutUtility = require('./LayoutUtility');
var LayoutController = require('./LayoutController');
var LayoutNode = require('./LayoutNode');
var FlowLayoutNode = require('./FlowLayoutNode');
var LayoutNodeManager = require('./LayoutNodeManager');
var ContainerSurface = typeof window !== 'undefined' ? window.famous.surfaces.ContainerSurface : typeof global !== 'undefined' ? global.famous.surfaces.ContainerSurface : null;
var Transform = typeof window !== 'undefined' ? window.famous.core.Transform : typeof global !== 'undefined' ? global.famous.core.Transform : null;
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
var Group = typeof window !== 'undefined' ? window.famous.core.Group : typeof global !== 'undefined' ? global.famous.core.Group : null;
var Vector = typeof window !== 'undefined' ? window.famous.math.Vector : typeof global !== 'undefined' ? global.famous.math.Vector : null;
var PhysicsEngine = typeof window !== 'undefined' ? window.famous.physics.PhysicsEngine : typeof global !== 'undefined' ? global.famous.physics.PhysicsEngine : null;
var Particle = typeof window !== 'undefined' ? window.famous.physics.bodies.Particle : typeof global !== 'undefined' ? global.famous.physics.bodies.Particle : null;
var Drag = typeof window !== 'undefined' ? window.famous.physics.forces.Drag : typeof global !== 'undefined' ? global.famous.physics.forces.Drag : null;
var Spring = typeof window !== 'undefined' ? window.famous.physics.forces.Spring : typeof global !== 'undefined' ? global.famous.physics.forces.Spring : null;
var ScrollSync = typeof window !== 'undefined' ? window.famous.inputs.ScrollSync : typeof global !== 'undefined' ? global.famous.inputs.ScrollSync : null;
var ViewSequence = typeof window !== 'undefined' ? window.famous.core.ViewSequence : typeof global !== 'undefined' ? global.famous.core.ViewSequence : null;
var Bounds = {
        NONE: 0,
        PREV: 1,
        NEXT: 2,
        BOTH: 3
    };
var SpringSource = {
        NONE: 'none',
        NEXTBOUNDS: 'next-bounds',
        PREVBOUNDS: 'prev-bounds',
        MINSIZE: 'minimal-size',
        GOTOSEQUENCE: 'goto-sequence',
        ENSUREVISIBLE: 'ensure-visible',
        GOTOPREVDIRECTION: 'goto-prev-direction',
        GOTONEXTDIRECTION: 'goto-next-direction'
    };
var PaginationMode = {
        PAGE: 0,
        SCROLL: 1
    };
function ScrollController(options) {
    options = LayoutUtility.combineOptions(ScrollController.DEFAULT_OPTIONS, options);
    var layoutManager = new LayoutNodeManager(options.flow ? FlowLayoutNode : LayoutNode, _initLayoutNode.bind(this));
    LayoutController.call(this, options, layoutManager);
    this._scroll = {
        activeTouches: [],
        pe: new PhysicsEngine(),
        particle: new Particle(this.options.scrollParticle),
        dragForce: new Drag(this.options.scrollDrag),
        frictionForce: new Drag(this.options.scrollFriction),
        springValue: undefined,
        springForce: new Spring(this.options.scrollSpring),
        springEndState: new Vector([
            0,
            0,
            0
        ]),
        groupStart: 0,
        groupTranslate: [
            0,
            0,
            0
        ],
        scrollDelta: 0,
        normalizedScrollDelta: 0,
        scrollForce: 0,
        scrollForceCount: 0,
        unnormalizedScrollOffset: 0,
        isScrolling: false
    };
    this._debug = {
        layoutCount: 0,
        commitCount: 0
    };
    this.group = new Group();
    this.group.add({ render: _innerRender.bind(this) });
    this._scroll.pe.addBody(this._scroll.particle);
    if (!this.options.scrollDrag.disabled) {
        this._scroll.dragForceId = this._scroll.pe.attach(this._scroll.dragForce, this._scroll.particle);
    }
    if (!this.options.scrollFriction.disabled) {
        this._scroll.frictionForceId = this._scroll.pe.attach(this._scroll.frictionForce, this._scroll.particle);
    }
    this._scroll.springForce.setOptions({ anchor: this._scroll.springEndState });
    this._eventInput.on('touchstart', _touchStart.bind(this));
    this._eventInput.on('touchmove', _touchMove.bind(this));
    this._eventInput.on('touchend', _touchEnd.bind(this));
    this._eventInput.on('touchcancel', _touchEnd.bind(this));
    this._eventInput.on('mousedown', _mouseDown.bind(this));
    this._eventInput.on('mouseup', _mouseUp.bind(this));
    this._eventInput.on('mousemove', _mouseMove.bind(this));
    this._scrollSync = new ScrollSync(this.options.scrollSync);
    this._eventInput.pipe(this._scrollSync);
    this._scrollSync.on('update', _scrollUpdate.bind(this));
    if (this.options.useContainer) {
        this.container = new ContainerSurface(this.options.container);
        this.container.add({
            render: function () {
                return this.id;
            }.bind(this)
        });
        if (!this.options.autoPipeEvents) {
            this.subscribe(this.container);
            EventHandler.setInputHandler(this.container, this);
            EventHandler.setOutputHandler(this.container, this);
        }
    }
}
ScrollController.prototype = Object.create(LayoutController.prototype);
ScrollController.prototype.constructor = ScrollController;
ScrollController.Bounds = Bounds;
ScrollController.PaginationMode = PaginationMode;
ScrollController.DEFAULT_OPTIONS = {
    useContainer: false,
    container: { properties: { overflow: 'hidden' } },
    scrollParticle: {},
    scrollDrag: {
        forceFunction: Drag.FORCE_FUNCTIONS.QUADRATIC,
        strength: 0.001,
        disabled: true
    },
    scrollFriction: {
        forceFunction: Drag.FORCE_FUNCTIONS.LINEAR,
        strength: 0.0025,
        disabled: false
    },
    scrollSpring: {
        dampingRatio: 1,
        period: 350
    },
    scrollSync: { scale: 0.2 },
    overscroll: true,
    paginated: false,
    paginationMode: PaginationMode.PAGE,
    paginationEnergyThresshold: 0.01,
    alignment: 0,
    touchMoveDirectionThresshold: undefined,
    touchMoveNoVelocityDuration: 100,
    mouseMove: false,
    enabled: true,
    layoutAll: false,
    alwaysLayout: false,
    extraBoundsSpace: [
        100,
        100
    ],
    debug: false
};
ScrollController.prototype.setOptions = function (options) {
    LayoutController.prototype.setOptions.call(this, options);
    if (this._scroll) {
        if (options.scrollSpring) {
            this._scroll.springForce.setOptions(options.scrollSpring);
        }
        if (options.scrollDrag) {
            this._scroll.dragForce.setOptions(options.scrollDrag);
        }
    }
    if (options.scrollSync && this._scrollSync) {
        this._scrollSync.setOptions(options.scrollSync);
    }
    return this;
};
function _initLayoutNode(node, spec) {
    if (!spec && this.options.flowOptions.insertSpec) {
        node.setSpec(this.options.flowOptions.insertSpec);
    }
}
function _updateSpring() {
    var springValue = this._scroll.scrollForceCount ? undefined : this._scroll.springPosition;
    if (this._scroll.springValue !== springValue) {
        this._scroll.springValue = springValue;
        if (springValue === undefined) {
            if (this._scroll.springForceId !== undefined) {
                this._scroll.pe.detach(this._scroll.springForceId);
                this._scroll.springForceId = undefined;
            }
        } else {
            if (this._scroll.springForceId === undefined) {
                this._scroll.springForceId = this._scroll.pe.attach(this._scroll.springForce, this._scroll.particle);
            }
            this._scroll.springEndState.set1D(springValue);
            this._scroll.pe.wake();
        }
    }
}
function _mouseDown(event) {
    if (!this.options.mouseMove) {
        return;
    }
    if (this._scroll.mouseMove) {
        this.releaseScrollForce(this._scroll.mouseMove.delta);
    }
    var current = [
            event.clientX,
            event.clientY
        ];
    var time = Date.now();
    this._scroll.mouseMove = {
        delta: 0,
        start: current,
        current: current,
        prev: current,
        time: time,
        prevTime: time
    };
    this.applyScrollForce(this._scroll.mouseMove.delta);
}
function _mouseMove(event) {
    if (!this._scroll.mouseMove || !this.options.enabled) {
        return;
    }
    var moveDirection = Math.atan2(Math.abs(event.clientY - this._scroll.mouseMove.prev[1]), Math.abs(event.clientX - this._scroll.mouseMove.prev[0])) / (Math.PI / 2);
    var directionDiff = Math.abs(this._direction - moveDirection);
    if (this.options.touchMoveDirectionThresshold === undefined || directionDiff <= this.options.touchMoveDirectionThresshold) {
        this._scroll.mouseMove.prev = this._scroll.mouseMove.current;
        this._scroll.mouseMove.current = [
            event.clientX,
            event.clientY
        ];
        this._scroll.mouseMove.prevTime = this._scroll.mouseMove.time;
        this._scroll.mouseMove.direction = moveDirection;
        this._scroll.mouseMove.time = Date.now();
    }
    var delta = this._scroll.mouseMove.current[this._direction] - this._scroll.mouseMove.start[this._direction];
    this.updateScrollForce(this._scroll.mouseMove.delta, delta);
    this._scroll.mouseMove.delta = delta;
}
function _mouseUp(event) {
    if (!this._scroll.mouseMove) {
        return;
    }
    var velocity = 0;
    var diffTime = this._scroll.mouseMove.time - this._scroll.mouseMove.prevTime;
    if (diffTime > 0 && Date.now() - this._scroll.mouseMove.time <= this.options.touchMoveNoVelocityDuration) {
        var diffOffset = this._scroll.mouseMove.current[this._direction] - this._scroll.mouseMove.prev[this._direction];
        velocity = diffOffset / diffTime;
    }
    this.releaseScrollForce(this._scroll.mouseMove.delta, velocity);
    this._scroll.mouseMove = undefined;
}
function _touchStart(event) {
    if (!this._touchEndEventListener) {
        this._touchEndEventListener = function (event2) {
            event2.target.removeEventListener('touchend', this._touchEndEventListener);
            _touchEnd.call(this, event2);
        }.bind(this);
    }
    var oldTouchesCount = this._scroll.activeTouches.length;
    var i = 0;
    var j;
    var touchFound;
    while (i < this._scroll.activeTouches.length) {
        var activeTouch = this._scroll.activeTouches[i];
        touchFound = false;
        for (j = 0; j < event.touches.length; j++) {
            var touch = event.touches[j];
            if (touch.identifier === activeTouch.id) {
                touchFound = true;
                break;
            }
        }
        if (!touchFound) {
            this._scroll.activeTouches.splice(i, 1);
        } else {
            i++;
        }
    }
    for (i = 0; i < event.touches.length; i++) {
        var changedTouch = event.touches[i];
        touchFound = false;
        for (j = 0; j < this._scroll.activeTouches.length; j++) {
            if (this._scroll.activeTouches[j].id === changedTouch.identifier) {
                touchFound = true;
                break;
            }
        }
        if (!touchFound) {
            var current = [
                    changedTouch.clientX,
                    changedTouch.clientY
                ];
            var time = Date.now();
            this._scroll.activeTouches.push({
                id: changedTouch.identifier,
                start: current,
                current: current,
                prev: current,
                time: time,
                prevTime: time
            });
            changedTouch.target.addEventListener('touchend', this._touchEndEventListener);
        }
    }
    if (!oldTouchesCount && this._scroll.activeTouches.length) {
        this.applyScrollForce(0);
        this._scroll.touchDelta = 0;
    }
}
function _touchMove(event) {
    if (!this.options.enabled) {
        return;
    }
    var primaryTouch;
    for (var i = 0; i < event.changedTouches.length; i++) {
        var changedTouch = event.changedTouches[i];
        for (var j = 0; j < this._scroll.activeTouches.length; j++) {
            var touch = this._scroll.activeTouches[j];
            if (touch.id === changedTouch.identifier) {
                var moveDirection = Math.atan2(Math.abs(changedTouch.clientY - touch.prev[1]), Math.abs(changedTouch.clientX - touch.prev[0])) / (Math.PI / 2);
                var directionDiff = Math.abs(this._direction - moveDirection);
                if (this.options.touchMoveDirectionThresshold === undefined || directionDiff <= this.options.touchMoveDirectionThresshold) {
                    touch.prev = touch.current;
                    touch.current = [
                        changedTouch.clientX,
                        changedTouch.clientY
                    ];
                    touch.prevTime = touch.time;
                    touch.direction = moveDirection;
                    touch.time = Date.now();
                    primaryTouch = j === 0 ? touch : undefined;
                }
            }
        }
    }
    if (primaryTouch) {
        var delta = primaryTouch.current[this._direction] - primaryTouch.start[this._direction];
        this.updateScrollForce(this._scroll.touchDelta, delta);
        this._scroll.touchDelta = delta;
    }
}
function _touchEnd(event) {
    var primaryTouch = this._scroll.activeTouches.length ? this._scroll.activeTouches[0] : undefined;
    for (var i = 0; i < event.changedTouches.length; i++) {
        var changedTouch = event.changedTouches[i];
        for (var j = 0; j < this._scroll.activeTouches.length; j++) {
            var touch = this._scroll.activeTouches[j];
            if (touch.id === changedTouch.identifier) {
                this._scroll.activeTouches.splice(j, 1);
                if (j === 0 && this._scroll.activeTouches.length) {
                    var newPrimaryTouch = this._scroll.activeTouches[0];
                    newPrimaryTouch.start[0] = newPrimaryTouch.current[0] - (touch.current[0] - touch.start[0]);
                    newPrimaryTouch.start[1] = newPrimaryTouch.current[1] - (touch.current[1] - touch.start[1]);
                }
                break;
            }
        }
    }
    if (!primaryTouch || this._scroll.activeTouches.length) {
        return;
    }
    var velocity = 0;
    var diffTime = primaryTouch.time - primaryTouch.prevTime;
    if (diffTime > 0 && Date.now() - primaryTouch.time <= this.options.touchMoveNoVelocityDuration) {
        var diffOffset = primaryTouch.current[this._direction] - primaryTouch.prev[this._direction];
        velocity = diffOffset / diffTime;
    }
    var delta = this._scroll.touchDelta;
    this.releaseScrollForce(delta, velocity);
    this._scroll.touchDelta = 0;
}
function _scrollUpdate(event) {
    if (!this.options.enabled) {
        return;
    }
    var offset = Array.isArray(event.delta) ? event.delta[this._direction] : event.delta;
    this.scroll(offset);
}
function _setParticle(position, velocity, phase) {
    if (position !== undefined) {
        this._scroll.particleValue = position;
        this._scroll.particle.setPosition1D(position);
    }
    if (velocity !== undefined) {
        var oldVelocity = this._scroll.particle.getVelocity1D();
        if (oldVelocity !== velocity) {
            this._scroll.particle.setVelocity1D(velocity);
        }
    }
}
function _calcScrollOffset(normalize, refreshParticle) {
    if (refreshParticle || this._scroll.particleValue === undefined) {
        this._scroll.particleValue = this._scroll.particle.getPosition1D();
        this._scroll.particleValue = Math.round(this._scroll.particleValue * 1000) / 1000;
    }
    var scrollOffset = this._scroll.particleValue;
    if (this._scroll.scrollDelta || this._scroll.normalizedScrollDelta) {
        scrollOffset += this._scroll.scrollDelta + this._scroll.normalizedScrollDelta;
        if (this._scroll.boundsReached & Bounds.PREV && scrollOffset > this._scroll.springPosition || this._scroll.boundsReached & Bounds.NEXT && scrollOffset < this._scroll.springPosition || this._scroll.boundsReached === Bounds.BOTH) {
            scrollOffset = this._scroll.springPosition;
        }
        if (normalize) {
            if (!this._scroll.scrollDelta) {
                this._scroll.normalizedScrollDelta = 0;
                _setParticle.call(this, scrollOffset, undefined, '_calcScrollOffset');
            }
            this._scroll.normalizedScrollDelta += this._scroll.scrollDelta;
            this._scroll.scrollDelta = 0;
        }
    }
    if (this._scroll.scrollForceCount && this._scroll.scrollForce) {
        if (this._scroll.springPosition !== undefined) {
            scrollOffset = (scrollOffset + this._scroll.scrollForce + this._scroll.springPosition) / 2;
        } else {
            scrollOffset += this._scroll.scrollForce;
        }
    }
    if (!this.options.overscroll) {
        if (this._scroll.boundsReached === Bounds.BOTH || this._scroll.boundsReached === Bounds.PREV && scrollOffset > this._scroll.springPosition || this._scroll.boundsReached === Bounds.NEXT && scrollOffset < this._scroll.springPosition) {
            scrollOffset = this._scroll.springPosition;
        }
    }
    return scrollOffset;
}
ScrollController.prototype._calcScrollHeight = function (next, lastNodeOnly) {
    var calcedHeight = 0;
    var node = this._nodes.getStartEnumNode(next);
    while (node) {
        if (node._invalidated) {
            if (node.trueSizeRequested) {
                calcedHeight = undefined;
                break;
            }
            if (node.scrollLength !== undefined) {
                calcedHeight = lastNodeOnly ? node.scrollLength : calcedHeight + node.scrollLength;
                if (!next && lastNodeOnly) {
                    break;
                }
            }
        }
        node = next ? node._next : node._prev;
    }
    return calcedHeight;
};
function _calcBounds(size, scrollOffset) {
    var prevHeight = this._calcScrollHeight(false);
    var nextHeight = this._calcScrollHeight(true);
    var enforeMinSize = this._layout.capabilities && this._layout.capabilities.sequentialScrollingOptimized;
    var totalHeight;
    if (enforeMinSize) {
        if (nextHeight !== undefined && prevHeight !== undefined) {
            totalHeight = prevHeight + nextHeight;
        }
        if (totalHeight !== undefined && totalHeight <= size[this._direction]) {
            this._scroll.boundsReached = Bounds.BOTH;
            this._scroll.springPosition = this.options.alignment ? -nextHeight : prevHeight;
            this._scroll.springSource = SpringSource.MINSIZE;
            return;
        }
    }
    if (this.options.alignment) {
        if (enforeMinSize) {
            if (nextHeight !== undefined && scrollOffset + nextHeight <= 0) {
                this._scroll.boundsReached = Bounds.NEXT;
                this._scroll.springPosition = -nextHeight;
                this._scroll.springSource = SpringSource.NEXTBOUNDS;
                return;
            }
        } else {
            var firstPrevItemHeight = this._calcScrollHeight(false, true);
            if (nextHeight !== undefined && firstPrevItemHeight && scrollOffset + nextHeight + size[this._direction] <= firstPrevItemHeight) {
                this._scroll.boundsReached = Bounds.NEXT;
                this._scroll.springPosition = nextHeight - (size[this._direction] - firstPrevItemHeight);
                this._scroll.springSource = SpringSource.NEXTBOUNDS;
                return;
            }
        }
    } else {
        if (prevHeight !== undefined && scrollOffset - prevHeight >= 0) {
            this._scroll.boundsReached = Bounds.PREV;
            this._scroll.springPosition = prevHeight;
            this._scroll.springSource = SpringSource.PREVBOUNDS;
            return;
        }
    }
    if (this.options.alignment) {
        if (prevHeight !== undefined && scrollOffset - prevHeight >= -size[this._direction]) {
            this._scroll.boundsReached = Bounds.PREV;
            this._scroll.springPosition = -size[this._direction] + prevHeight;
            this._scroll.springSource = SpringSource.PREVBOUNDS;
            return;
        }
    } else {
        var nextBounds = enforeMinSize ? size[this._direction] : this._calcScrollHeight(true, true);
        if (nextHeight !== undefined && scrollOffset + nextHeight <= nextBounds) {
            this._scroll.boundsReached = Bounds.NEXT;
            this._scroll.springPosition = nextBounds - nextHeight;
            this._scroll.springSource = SpringSource.NEXTBOUNDS;
            return;
        }
    }
    this._scroll.boundsReached = Bounds.NONE;
    this._scroll.springPosition = undefined;
    this._scroll.springSource = SpringSource.NONE;
}
function _calcScrollToOffset(size, scrollOffset) {
    var scrollToRenderNode = this._scroll.scrollToRenderNode || this._scroll.ensureVisibleRenderNode;
    if (!scrollToRenderNode) {
        return;
    }
    if (this._scroll.boundsReached === Bounds.BOTH || !this._scroll.scrollToDirection && this._scroll.boundsReached === Bounds.PREV || this._scroll.scrollToDirection && this._scroll.boundsReached === Bounds.NEXT) {
        return;
    }
    var foundNode;
    var scrollToOffset = 0;
    var node = this._nodes.getStartEnumNode(true);
    var count = 0;
    while (node) {
        count++;
        if (!node._invalidated || node.scrollLength === undefined) {
            break;
        }
        if (this.options.alignment) {
            scrollToOffset -= node.scrollLength;
        }
        if (node.renderNode === scrollToRenderNode) {
            foundNode = node;
            break;
        }
        if (!this.options.alignment) {
            scrollToOffset -= node.scrollLength;
        }
        node = node._next;
    }
    if (!foundNode) {
        scrollToOffset = 0;
        node = this._nodes.getStartEnumNode(false);
        while (node) {
            if (!node._invalidated || node.scrollLength === undefined) {
                break;
            }
            if (!this.options.alignment) {
                scrollToOffset += node.scrollLength;
            }
            if (node.renderNode === scrollToRenderNode) {
                foundNode = node;
                break;
            }
            if (this.options.alignment) {
                scrollToOffset += node.scrollLength;
            }
            node = node._prev;
        }
    }
    if (foundNode) {
        if (this._scroll.ensureVisibleRenderNode) {
            if (this.options.alignment) {
                if (scrollToOffset - foundNode.scrollLength < 0) {
                    this._scroll.springPosition = scrollToOffset;
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else if (scrollToOffset > size[this._direction]) {
                    this._scroll.springPosition = size[this._direction] - scrollToOffset;
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else {
                    if (!foundNode.trueSizeRequested) {
                        this._scroll.ensureVisibleRenderNode = undefined;
                    }
                }
            } else {
                scrollToOffset = -scrollToOffset;
                if (scrollToOffset < 0) {
                    this._scroll.springPosition = scrollToOffset;
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else if (scrollToOffset + foundNode.scrollLength > size[this._direction]) {
                    this._scroll.springPosition = size[this._direction] - (scrollToOffset + foundNode.scrollLength);
                    this._scroll.springSource = SpringSource.ENSUREVISIBLE;
                } else {
                    if (!foundNode.trueSizeRequested) {
                        this._scroll.ensureVisibleRenderNode = undefined;
                    }
                }
            }
        } else {
            this._scroll.springPosition = scrollToOffset;
            this._scroll.springSource = SpringSource.GOTOSEQUENCE;
        }
        return;
    }
    if (this._scroll.scrollToDirection) {
        this._scroll.springPosition = scrollOffset - size[this._direction];
        this._scroll.springSource = SpringSource.GOTONEXTDIRECTION;
    } else {
        this._scroll.springPosition = scrollOffset + size[this._direction];
        this._scroll.springSource = SpringSource.GOTOPREVDIRECTION;
    }
    if (this._viewSequence.cleanup) {
        var viewSequence = this._viewSequence;
        while (viewSequence.get() !== scrollToRenderNode) {
            viewSequence = this._scroll.scrollToDirection ? viewSequence.getNext(true) : viewSequence.getPrevious(true);
            if (!viewSequence) {
                break;
            }
        }
    }
}
function _snapToPage() {
    if (!this.options.paginated || this._scroll.scrollForceCount || this._scroll.springPosition !== undefined) {
        return;
    }
    var item;
    switch (this.options.paginationMode) {
    case PaginationMode.SCROLL:
        if (!this.options.paginationEnergyThresshold || Math.abs(this._scroll.particle.getEnergy()) <= this.options.paginationEnergyThresshold) {
            item = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
            if (item && item.renderNode) {
                this.goToRenderNode(item.renderNode);
            }
        }
        break;
    case PaginationMode.PAGE:
        item = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
        if (item && item.renderNode) {
            this.goToRenderNode(item.renderNode);
        }
        break;
    }
}
function _normalizePrevViewSequence(scrollOffset) {
    var count = 0;
    var normalizedScrollOffset = scrollOffset;
    var normalizeNextPrev = false;
    var node = this._nodes.getStartEnumNode(false);
    while (node) {
        if (!node._invalidated || !node._viewSequence) {
            break;
        }
        if (normalizeNextPrev) {
            this._viewSequence = node._viewSequence;
            normalizedScrollOffset = scrollOffset;
            normalizeNextPrev = false;
        }
        if (node.scrollLength === undefined || node.trueSizeRequested || scrollOffset < 0) {
            break;
        }
        scrollOffset -= node.scrollLength;
        count++;
        if (node.scrollLength) {
            if (this.options.alignment) {
                normalizeNextPrev = scrollOffset >= 0;
            } else {
                this._viewSequence = node._viewSequence;
                normalizedScrollOffset = scrollOffset;
            }
        }
        node = node._prev;
    }
    return normalizedScrollOffset;
}
function _normalizeNextViewSequence(scrollOffset) {
    var count = 0;
    var normalizedScrollOffset = scrollOffset;
    var node = this._nodes.getStartEnumNode(true);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || node.trueSizeRequested || !node._viewSequence || scrollOffset > 0 && (!this.options.alignment || node.scrollLength !== 0)) {
            break;
        }
        if (this.options.alignment) {
            scrollOffset += node.scrollLength;
            count++;
        }
        if (node.scrollLength || this.options.alignment) {
            this._viewSequence = node._viewSequence;
            normalizedScrollOffset = scrollOffset;
        }
        if (!this.options.alignment) {
            scrollOffset += node.scrollLength;
            count++;
        }
        node = node._next;
    }
    return normalizedScrollOffset;
}
function _normalizeViewSequence(size, scrollOffset) {
    var caps = this._layout.capabilities;
    if (caps && caps.debug && caps.debug.normalize !== undefined && !caps.debug.normalize) {
        return scrollOffset;
    }
    if (this._scroll.scrollForceCount) {
        return scrollOffset;
    }
    var normalizedScrollOffset = scrollOffset;
    if (this.options.alignment && scrollOffset < 0) {
        normalizedScrollOffset = _normalizeNextViewSequence.call(this, scrollOffset);
    } else if (!this.options.alignment && scrollOffset > 0) {
        normalizedScrollOffset = _normalizePrevViewSequence.call(this, scrollOffset);
    }
    if (normalizedScrollOffset === scrollOffset) {
        if (this.options.alignment && scrollOffset > 0) {
            normalizedScrollOffset = _normalizePrevViewSequence.call(this, scrollOffset);
        } else if (!this.options.alignment && scrollOffset < 0) {
            normalizedScrollOffset = _normalizeNextViewSequence.call(this, scrollOffset);
        }
    }
    if (normalizedScrollOffset !== scrollOffset) {
        var delta = normalizedScrollOffset - scrollOffset;
        var particleValue = this._scroll.particle.getPosition1D();
        _setParticle.call(this, particleValue + delta, undefined, 'normalize');
        if (this._scroll.springPosition !== undefined) {
            this._scroll.springPosition += delta;
        }
        if (caps && caps.sequentialScrollingOptimized) {
            this._scroll.groupStart -= delta;
        }
    }
    return normalizedScrollOffset;
}
ScrollController.prototype.getVisibleItems = function () {
    var size = this._contextSizeCache;
    var scrollOffset = this.options.alignment ? this._scroll.unnormalizedScrollOffset + size[this._direction] : this._scroll.unnormalizedScrollOffset;
    var result = [];
    var node = this._nodes.getStartEnumNode(true);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || scrollOffset > size[this._direction]) {
            break;
        }
        scrollOffset += node.scrollLength;
        if (scrollOffset >= 0 && node._viewSequence) {
            result.push({
                index: node._viewSequence.getIndex(),
                viewSequence: node._viewSequence,
                renderNode: node.renderNode,
                visiblePerc: node.scrollLength ? (Math.min(scrollOffset, size[this._direction]) - Math.max(scrollOffset - node.scrollLength, 0)) / node.scrollLength : 1,
                scrollOffset: scrollOffset - node.scrollLength,
                scrollLength: node.scrollLength,
                _node: node
            });
        }
        node = node._next;
    }
    scrollOffset = this.options.alignment ? this._scroll.unnormalizedScrollOffset + size[this._direction] : this._scroll.unnormalizedScrollOffset;
    node = this._nodes.getStartEnumNode(false);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || scrollOffset < 0) {
            break;
        }
        scrollOffset -= node.scrollLength;
        if (scrollOffset < size[this._direction] && node._viewSequence) {
            result.unshift({
                index: node._viewSequence.getIndex(),
                viewSequence: node._viewSequence,
                renderNode: node.renderNode,
                visiblePerc: node.scrollLength ? (Math.min(scrollOffset + node.scrollLength, size[this._direction]) - Math.max(scrollOffset, 0)) / node.scrollLength : 1,
                scrollOffset: scrollOffset,
                scrollLength: node.scrollLength,
                _node: node
            });
        }
        node = node._prev;
    }
    return result;
};
function _getVisibleItem(first) {
    var result = {};
    var diff;
    var prevDiff = 10000000;
    var diffDelta = first && this.options.alignment ? -this._contextSizeCache[this._direction] : !first && !this.options.alignment ? this._contextSizeCache[this._direction] : 0;
    var scrollOffset = this._scroll.unnormalizedScrollOffset;
    var node = this._nodes.getStartEnumNode(true);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined) {
            break;
        }
        if (node._viewSequence) {
            diff = Math.abs(diffDelta - (scrollOffset + (!first ? node.scrollLength : 0)));
            if (diff >= prevDiff) {
                break;
            }
            prevDiff = diff;
            result.scrollOffset = scrollOffset;
            result._node = node;
            scrollOffset += node.scrollLength;
        }
        node = node._next;
    }
    scrollOffset = this._scroll.unnormalizedScrollOffset;
    node = this._nodes.getStartEnumNode(false);
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined) {
            break;
        }
        if (node._viewSequence) {
            scrollOffset -= node.scrollLength;
            diff = Math.abs(diffDelta - (scrollOffset + (!first ? node.scrollLength : 0)));
            if (diff >= prevDiff) {
                break;
            }
            prevDiff = diff;
            result.scrollOffset = scrollOffset;
            result._node = node;
        }
        node = node._prev;
    }
    if (!result._node) {
        return undefined;
    }
    result.scrollLength = result._node.scrollLength;
    if (this.options.alignment) {
        result.visiblePerc = (Math.min(result.scrollOffset + result.scrollLength, 0) - Math.max(result.scrollOffset, -this._contextSizeCache[this._direction])) / result.scrollLength;
    } else {
        result.visiblePerc = (Math.min(result.scrollOffset + result.scrollLength, this._contextSizeCache[this._direction]) - Math.max(result.scrollOffset, 0)) / result.scrollLength;
    }
    result.index = result._node._viewSequence.getIndex();
    result.viewSequence = result._node._viewSequence;
    result.renderNode = result._node.renderNode;
    return result;
}
ScrollController.prototype.getFirstVisibleItem = function () {
    return _getVisibleItem.call(this, true);
};
ScrollController.prototype.getLastVisibleItem = function () {
    return _getVisibleItem.call(this, false);
};
function _goToSequence(viewSequence, next, noAnimation) {
    if (noAnimation) {
        this._viewSequence = viewSequence;
        this._scroll.springPosition = undefined;
        _updateSpring.call(this);
        this.halt();
        this._scroll.scrollDelta = 0;
        _setParticle.call(this, 0, 0, '_goToSequence');
        this._isDirty = true;
    } else {
        this._scroll.scrollToSequence = viewSequence;
        this._scroll.scrollToRenderNode = viewSequence.get();
        this._scroll.ensureVisibleRenderNode = undefined;
        this._scroll.scrollToDirection = next;
        this._scroll.scrollDirty = true;
    }
}
function _ensureVisibleSequence(viewSequence, next) {
    this._scroll.scrollToSequence = undefined;
    this._scroll.scrollToRenderNode = undefined;
    this._scroll.ensureVisibleRenderNode = viewSequence.get();
    this._scroll.scrollToDirection = next;
    this._scroll.scrollDirty = true;
}
function _goToPage(amount, noAnimation) {
    var viewSequence = (!noAnimation ? this._scroll.scrollToSequence : undefined) || this._viewSequence;
    if (!this._scroll.scrollToSequence && !noAnimation) {
        var firstVisibleItem = this.getFirstVisibleItem();
        if (firstVisibleItem) {
            viewSequence = firstVisibleItem.viewSequence;
            if (amount < 0 && firstVisibleItem.scrollOffset < 0 || amount > 0 && firstVisibleItem.scrollOffset > 0) {
                amount = 0;
            }
        }
    }
    if (!viewSequence) {
        return;
    }
    for (var i = 0; i < Math.abs(amount); i++) {
        var nextViewSequence = amount > 0 ? viewSequence.getNext() : viewSequence.getPrevious();
        if (nextViewSequence) {
            viewSequence = nextViewSequence;
        } else {
            break;
        }
    }
    _goToSequence.call(this, viewSequence, amount >= 0, noAnimation);
}
ScrollController.prototype.goToFirstPage = function (noAnimation) {
    if (!this._viewSequence) {
        return this;
    }
    if (this._viewSequence._ && this._viewSequence._.loop) {
        LayoutUtility.error('Unable to go to first item of looped ViewSequence');
        return this;
    }
    var viewSequence = this._viewSequence;
    while (viewSequence) {
        var prev = viewSequence.getPrevious();
        if (prev && prev.get()) {
            viewSequence = prev;
        } else {
            break;
        }
    }
    _goToSequence.call(this, viewSequence, false, noAnimation);
    return this;
};
ScrollController.prototype.goToPreviousPage = function (noAnimation) {
    _goToPage.call(this, -1, noAnimation);
    return this;
};
ScrollController.prototype.goToNextPage = function (noAnimation) {
    _goToPage.call(this, 1, noAnimation);
    return this;
};
ScrollController.prototype.goToLastPage = function (noAnimation) {
    if (!this._viewSequence) {
        return this;
    }
    if (this._viewSequence._ && this._viewSequence._.loop) {
        LayoutUtility.error('Unable to go to last item of looped ViewSequence');
        return this;
    }
    var viewSequence = this._viewSequence;
    while (viewSequence) {
        var next = viewSequence.getNext();
        if (next && next.get()) {
            viewSequence = next;
        } else {
            break;
        }
    }
    _goToSequence.call(this, viewSequence, true, noAnimation);
    return this;
};
ScrollController.prototype.goToRenderNode = function (node, noAnimation) {
    if (!this._viewSequence || !node) {
        return this;
    }
    if (this._viewSequence.get() === node) {
        var next = _calcScrollOffset.call(this) >= 0;
        _goToSequence.call(this, this._viewSequence, next, noAnimation);
        return this;
    }
    var nextSequence = this._viewSequence.getNext();
    var prevSequence = this._viewSequence.getPrevious();
    while ((nextSequence || prevSequence) && nextSequence !== this._viewSequence) {
        var nextNode = nextSequence ? nextSequence.get() : undefined;
        if (nextNode === node) {
            _goToSequence.call(this, nextSequence, true, noAnimation);
            break;
        }
        var prevNode = prevSequence ? prevSequence.get() : undefined;
        if (prevNode === node) {
            _goToSequence.call(this, prevSequence, false, noAnimation);
            break;
        }
        nextSequence = nextNode ? nextSequence.getNext() : undefined;
        prevSequence = prevNode ? prevSequence.getPrevious() : undefined;
    }
    return this;
};
ScrollController.prototype.ensureVisible = function (node) {
    if (node instanceof ViewSequence) {
        node = node.get();
    } else if (node instanceof Number || typeof node === 'number') {
        var viewSequence = this._viewSequence;
        while (viewSequence.getIndex() < node) {
            viewSequence = viewSequence.getNext();
            if (!viewSequence) {
                return this;
            }
        }
        while (viewSequence.getIndex() > node) {
            viewSequence = viewSequence.getPrevious();
            if (!viewSequence) {
                return this;
            }
        }
    }
    if (this._viewSequence.get() === node) {
        var next = _calcScrollOffset.call(this) >= 0;
        _ensureVisibleSequence.call(this, this._viewSequence, next);
        return this;
    }
    var nextSequence = this._viewSequence.getNext();
    var prevSequence = this._viewSequence.getPrevious();
    while ((nextSequence || prevSequence) && nextSequence !== this._viewSequence) {
        var nextNode = nextSequence ? nextSequence.get() : undefined;
        if (nextNode === node) {
            _ensureVisibleSequence.call(this, nextSequence, true);
            break;
        }
        var prevNode = prevSequence ? prevSequence.get() : undefined;
        if (prevNode === node) {
            _ensureVisibleSequence.call(this, prevSequence, false);
            break;
        }
        nextSequence = nextNode ? nextSequence.getNext() : undefined;
        prevSequence = prevNode ? prevSequence.getPrevious() : undefined;
    }
    return this;
};
ScrollController.prototype.scroll = function (delta) {
    this.halt();
    this._scroll.scrollDelta += delta;
    return this;
};
ScrollController.prototype.canScroll = function (delta) {
    var scrollOffset = _calcScrollOffset.call(this);
    var prevHeight = this._calcScrollHeight(false);
    var nextHeight = this._calcScrollHeight(true);
    var totalHeight;
    if (nextHeight !== undefined && prevHeight !== undefined) {
        totalHeight = prevHeight + nextHeight;
    }
    if (totalHeight !== undefined && totalHeight <= this._contextSizeCache[this._direction]) {
        return 0;
    }
    if (delta < 0 && nextHeight !== undefined) {
        var nextOffset = this._contextSizeCache[this._direction] - (scrollOffset + nextHeight);
        return Math.max(nextOffset, delta);
    } else if (delta > 0 && prevHeight !== undefined) {
        var prevOffset = -(scrollOffset - prevHeight);
        return Math.min(prevOffset, delta);
    }
    return delta;
};
ScrollController.prototype.halt = function () {
    this._scroll.scrollToSequence = undefined;
    this._scroll.scrollToRenderNode = undefined;
    this._scroll.ensureVisibleRenderNode = undefined;
    _setParticle.call(this, undefined, 0, 'halt');
    return this;
};
ScrollController.prototype.isScrolling = function () {
    return this._scroll.isScrolling;
};
ScrollController.prototype.getBoundsReached = function () {
    return this._scroll.boundsReached;
};
ScrollController.prototype.getVelocity = function () {
    return this._scroll.particle.getVelocity1D();
};
ScrollController.prototype.getEnergy = function () {
    return this._scroll.particle.getEnergy();
};
ScrollController.prototype.setVelocity = function (velocity) {
    return this._scroll.particle.setVelocity1D(velocity);
};
ScrollController.prototype.applyScrollForce = function (delta) {
    this.halt();
    if (this._scroll.scrollForceCount === 0) {
        this._scroll.scrollForceStartItem = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
    }
    this._scroll.scrollForceCount++;
    this._scroll.scrollForce += delta;
    return this;
};
ScrollController.prototype.updateScrollForce = function (prevDelta, newDelta) {
    this.halt();
    newDelta -= prevDelta;
    this._scroll.scrollForce += newDelta;
    return this;
};
ScrollController.prototype.releaseScrollForce = function (delta, velocity) {
    this.halt();
    if (this._scroll.scrollForceCount === 1) {
        var scrollOffset = _calcScrollOffset.call(this);
        _setParticle.call(this, scrollOffset, velocity, 'releaseScrollForce');
        this._scroll.pe.wake();
        this._scroll.scrollForce = 0;
        this._scroll.scrollDirty = true;
        if (this._scroll.scrollForceStartItem && this.options.paginated && this.options.paginationMode === PaginationMode.PAGE) {
            var item = this.options.alignment ? this.getLastVisibleItem(true) : this.getFirstVisibleItem(true);
            if (item) {
                if (item.renderNode !== this._scroll.scrollForceStartItem.renderNode) {
                    this.goToRenderNode(item.renderNode);
                } else if (this.options.paginationEnergyThresshold && Math.abs(this._scroll.particle.getEnergy()) >= this.options.paginationEnergyThresshold) {
                    velocity = velocity || 0;
                    if (velocity < 0 && item._node._next && item._node._next.renderNode) {
                        this.goToRenderNode(item._node._next.renderNode);
                    } else if (velocity >= 0 && item._node._prev && item._node._prev.renderNode) {
                        this.goToRenderNode(item._node._prev.renderNode);
                    }
                } else {
                    this.goToRenderNode(item.renderNode);
                }
            }
        }
        this._scroll.scrollForceStartItem = undefined;
    } else {
        this._scroll.scrollForce -= delta;
    }
    this._scroll.scrollForceCount--;
    return this;
};
ScrollController.prototype.getSpec = function (node, normalize) {
    var spec = LayoutController.prototype.getSpec.apply(this, arguments);
    if (spec && this._layout.capabilities && this._layout.capabilities.sequentialScrollingOptimized) {
        spec = {
            origin: spec.origin,
            align: spec.align,
            opacity: spec.opacity,
            size: spec.size,
            renderNode: spec.renderNode,
            transform: spec.transform
        };
        var translate = [
                0,
                0,
                0
            ];
        translate[this._direction] = this._scrollOffsetCache + this._scroll.groupStart;
        spec.transform = Transform.thenMove(spec.transform, translate);
    }
    return spec;
};
function _layout(size, scrollOffset, nested) {
    this._debug.layoutCount++;
    var scrollStart = 0 - Math.max(this.options.extraBoundsSpace[0], 1);
    var scrollEnd = size[this._direction] + Math.max(this.options.extraBoundsSpace[1], 1);
    if (this.options.layoutAll) {
        scrollStart = -1000000;
        scrollEnd = 1000000;
    }
    var layoutContext = this._nodes.prepareForLayout(this._viewSequence, this._nodesById, {
            size: size,
            direction: this._direction,
            reverse: this.options.alignment ? true : false,
            scrollOffset: this.options.alignment ? scrollOffset + size[this._direction] : scrollOffset,
            scrollStart: scrollStart,
            scrollEnd: scrollEnd
        });
    if (this._layout._function) {
        this._layout._function(layoutContext, this._layout.options);
    }
    this._scroll.unnormalizedScrollOffset = scrollOffset;
    if (this._postLayout) {
        this._postLayout(size, scrollOffset);
    }
    this._nodes.removeNonInvalidatedNodes(this.options.flowOptions.removeSpec);
    _calcBounds.call(this, size, scrollOffset);
    _calcScrollToOffset.call(this, size, scrollOffset);
    _snapToPage.call(this);
    var newScrollOffset = _calcScrollOffset.call(this, true);
    if (!nested && newScrollOffset !== scrollOffset) {
        return _layout.call(this, size, newScrollOffset, true);
    }
    scrollOffset = _normalizeViewSequence.call(this, size, scrollOffset);
    _updateSpring.call(this);
    this._nodes.removeVirtualViewSequenceNodes();
    if (this.options.size && this.options.size[this._direction] === true) {
        var scrollLength = 0;
        var node = this._nodes.getStartEnumNode();
        while (node) {
            if (node._invalidated && node.scrollLength) {
                scrollLength += node.scrollLength;
            }
            node = node._next;
        }
        this._size = this._size || [
            0,
            0
        ];
        this._size[0] = this.options.size[0];
        this._size[1] = this.options.size[1];
        this._size[this._direction] = scrollLength;
    }
    return scrollOffset;
}
function _innerRender() {
    var specs = this._specs;
    for (var i3 = 0, j3 = specs.length; i3 < j3; i3++) {
        if (specs[i3].renderNode) {
            specs[i3].target = specs[i3].renderNode.render();
        }
    }
    if (!specs.length || specs[specs.length - 1] !== this._cleanupRegistration) {
        specs.push(this._cleanupRegistration);
    }
    return specs;
}
ScrollController.prototype.commit = function commit(context) {
    var size = context.size;
    this._debug.commitCount++;
    if (this._resetFlowState) {
        this._resetFlowState = false;
        this._isDirty = true;
        this._nodes.removeAll();
    }
    var scrollOffset = _calcScrollOffset.call(this, true, true);
    if (this._scrollOffsetCache === undefined) {
        this._scrollOffsetCache = scrollOffset;
    }
    var emitEndScrollingEvent = false;
    var emitScrollEvent = false;
    var eventData;
    if (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1] || this._isDirty || this._scroll.scrollDirty || this._nodes._trueSizeRequested || this.options.alwaysLayout || this._scrollOffsetCache !== scrollOffset) {
        eventData = {
            target: this,
            oldSize: this._contextSizeCache,
            size: size,
            oldScrollOffset: -(this._scrollOffsetCache + this._scroll.groupStart),
            scrollOffset: -(scrollOffset + this._scroll.groupStart)
        };
        if (this._scrollOffsetCache !== scrollOffset) {
            if (!this._scroll.isScrolling) {
                this._scroll.isScrolling = true;
                this._eventOutput.emit('scrollstart', eventData);
            }
            emitScrollEvent = true;
        } else if (this._scroll.isScrolling && !this._scroll.scrollForceCount) {
            emitEndScrollingEvent = true;
        }
        this._eventOutput.emit('layoutstart', eventData);
        if (this.options.flow && (this._isDirty || this.options.flowOptions.reflowOnResize && (size[0] !== this._contextSizeCache[0] || size[1] !== this._contextSizeCache[1]))) {
            var node = this._nodes.getStartEnumNode();
            while (node) {
                node.releaseLock(true);
                node = node._next;
            }
        }
        this._contextSizeCache[0] = size[0];
        this._contextSizeCache[1] = size[1];
        this._isDirty = false;
        this._scroll.scrollDirty = false;
        scrollOffset = _layout.call(this, size, scrollOffset);
        this._scrollOffsetCache = scrollOffset;
        eventData.scrollOffset = -(this._scrollOffsetCache + this._scroll.groupStart);
    } else if (this._scroll.isScrolling && !this._scroll.scrollForceCount) {
        emitEndScrollingEvent = true;
    }
    var groupTranslate = this._scroll.groupTranslate;
    groupTranslate[0] = 0;
    groupTranslate[1] = 0;
    groupTranslate[2] = 0;
    groupTranslate[this._direction] = -this._scroll.groupStart - scrollOffset;
    var sequentialScrollingOptimized = this._layout.capabilities ? this._layout.capabilities.sequentialScrollingOptimized : false;
    var result = this._nodes.buildSpecAndDestroyUnrenderedNodes(sequentialScrollingOptimized ? groupTranslate : undefined);
    this._specs = result.specs;
    if (!this._specs.length) {
        this._scroll.groupStart = 0;
    }
    if (eventData) {
        this._eventOutput.emit('layoutend', eventData);
    }
    if (result.modified) {
        this._eventOutput.emit('reflow', { target: this });
    }
    if (emitScrollEvent) {
        this._eventOutput.emit('scroll', eventData);
    }
    if (eventData) {
        var visibleItem = this.options.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
        if (visibleItem && !this._visibleItemCache || !visibleItem && this._visibleItemCache || visibleItem && this._visibleItemCache && visibleItem.renderNode !== this._visibleItemCache.renderNode) {
            this._eventOutput.emit('pagechange', {
                target: this,
                oldViewSequence: this._visibleItemCache ? this._visibleItemCache.viewSequence : undefined,
                viewSequence: visibleItem ? visibleItem.viewSequence : undefined,
                oldIndex: this._visibleItemCache ? this._visibleItemCache.index : undefined,
                index: visibleItem ? visibleItem.index : undefined,
                renderNode: visibleItem ? visibleItem.renderNode : undefined,
                oldRenderNode: this._visibleItemCache ? this._visibleItemCache.renderNode : undefined
            });
            this._visibleItemCache = visibleItem;
        }
    }
    if (emitEndScrollingEvent) {
        this._scroll.isScrolling = false;
        eventData = {
            target: this,
            oldSize: size,
            size: size,
            oldScrollOffset: -(this._scroll.groupStart + scrollOffset),
            scrollOffset: -(this._scroll.groupStart + scrollOffset)
        };
        this._eventOutput.emit('scrollend', eventData);
    }
    var transform = context.transform;
    if (sequentialScrollingOptimized) {
        var windowOffset = scrollOffset + this._scroll.groupStart;
        var translate = [
                0,
                0,
                0
            ];
        translate[this._direction] = windowOffset;
        transform = Transform.thenMove(transform, translate);
    }
    return {
        transform: transform,
        size: size,
        opacity: context.opacity,
        origin: context.origin,
        target: this.group.render()
    };
};
ScrollController.prototype.render = function render() {
    if (this.container) {
        return this.container.render.apply(this.container, arguments);
    } else {
        return this.id;
    }
};
module.exports = ScrollController;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./FlowLayoutNode":4,"./LayoutController":6,"./LayoutNode":7,"./LayoutNodeManager":8,"./LayoutUtility":9}],11:[function(require,module,exports){
(function (global){
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
function VirtualViewSequence(options) {
    options = options || {};
    this._ = options._ || new this.constructor.Backing(options);
    this.touched = true;
    this.value = options.value || this._.factory.create();
    this.index = options.index || 0;
    this.next = options.next;
    this.prev = options.prev;
    EventHandler.setOutputHandler(this, this._.eventOutput);
    this.value.pipe(this._.eventOutput);
}
VirtualViewSequence.Backing = function Backing(options) {
    this.factory = options.factory;
    this.eventOutput = new EventHandler();
};
VirtualViewSequence.prototype.getPrevious = function (noCreate) {
    if (this.prev) {
        this.prev.touched = true;
        return this.prev;
    }
    if (noCreate) {
        return undefined;
    }
    var value = this._.factory.createPrevious(this.get());
    if (!value) {
        return undefined;
    }
    this.prev = new VirtualViewSequence({
        _: this._,
        value: value,
        index: this.index - 1,
        next: this
    });
    return this.prev;
};
VirtualViewSequence.prototype.getNext = function (noCreate) {
    if (this.next) {
        this.next.touched = true;
        return this.next;
    }
    if (noCreate) {
        return undefined;
    }
    var value = this._.factory.createNext(this.get());
    if (!value) {
        return undefined;
    }
    this.next = new VirtualViewSequence({
        _: this._,
        value: value,
        index: this.index + 1,
        prev: this
    });
    return this.next;
};
VirtualViewSequence.prototype.get = function () {
    this.touched = true;
    return this.value;
};
VirtualViewSequence.prototype.getIndex = function () {
    this.touched = true;
    return this.index;
};
VirtualViewSequence.prototype.toString = function () {
    return '' + this.index;
};
VirtualViewSequence.prototype.cleanup = function () {
    var node = this.prev;
    while (node) {
        if (!node.touched) {
            node.next.prev = undefined;
            node.next = undefined;
            if (this._.factory.destroy) {
                while (node) {
                    this._.factory.destroy(node.value);
                    node = node.prev;
                }
            }
            break;
        }
        node.touched = false;
        node = node.prev;
    }
    node = this.next;
    while (node) {
        if (!node.touched) {
            node.prev.next = undefined;
            node.prev = undefined;
            if (this._.factory.destroy) {
                while (node) {
                    this._.factory.destroy(node.value);
                    node = node.next;
                }
            }
            break;
        }
        node.touched = false;
        node = node.next;
    }
    return this;
};
VirtualViewSequence.prototype.unshift = function () {
    if (console.error) {
        console.error('VirtualViewSequence.unshift is not supported and should not be called');
    }
};
VirtualViewSequence.prototype.push = function () {
    if (console.error) {
        console.error('VirtualViewSequence.push is not supported and should not be called');
    }
};
VirtualViewSequence.prototype.splice = function () {
    if (console.error) {
        console.error('VirtualViewSequence.splice is not supported and should not be called');
    }
};
VirtualViewSequence.prototype.swap = function () {
    if (console.error) {
        console.error('VirtualViewSequence.swap is not supported and should not be called');
    }
};
module.exports = VirtualViewSequence;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
var LayoutUtility = require('../LayoutUtility');
function LayoutDockHelper(context, options) {
    var size = context.size;
    this._size = size;
    this._context = context;
    this._options = options;
    this._z = options && options.translateZ ? options.translateZ : 0;
    if (options && options.margins) {
        var margins = LayoutUtility.normalizeMargins(options.margins);
        this._left = margins[3];
        this._top = margins[0];
        this._right = size[0] - margins[1];
        this._bottom = size[1] - margins[2];
    } else {
        this._left = 0;
        this._top = 0;
        this._right = size[0];
        this._bottom = size[1];
    }
}
LayoutDockHelper.prototype.parse = function (data) {
    for (var i = 0; i < data.length; i++) {
        var rule = data[i];
        var value = rule.length >= 3 ? rule[2] : undefined;
        if (rule[0] === 'top') {
            this.top(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'left') {
            this.left(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'right') {
            this.right(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'bottom') {
            this.bottom(rule[1], value, rule.length >= 4 ? rule[3] : undefined);
        } else if (rule[0] === 'fill') {
            this.fill(rule[1], rule.length >= 3 ? rule[2] : undefined);
        } else if (rule[0] === 'margins') {
            this.margins(rule[1]);
        }
    }
};
LayoutDockHelper.prototype.top = function (node, height, z) {
    if (height instanceof Array) {
        height = height[1];
    }
    if (height === undefined) {
        var size = this._context.resolveSize(node, [
                this._right - this._left,
                this._bottom - this._top
            ]);
        height = size[1];
    }
    this._context.set(node, {
        size: [
            this._right - this._left,
            height
        ],
        origin: [
            0,
            0
        ],
        align: [
            0,
            0
        ],
        translate: [
            this._left,
            this._top,
            z === undefined ? this._z : z
        ]
    });
    this._top += height;
    return this;
};
LayoutDockHelper.prototype.left = function (node, width, z) {
    if (width instanceof Array) {
        width = width[0];
    }
    if (width === undefined) {
        var size = this._context.resolveSize(node, [
                this._right - this._left,
                this._bottom - this._top
            ]);
        width = size[0];
    }
    this._context.set(node, {
        size: [
            width,
            this._bottom - this._top
        ],
        origin: [
            0,
            0
        ],
        align: [
            0,
            0
        ],
        translate: [
            this._left,
            this._top,
            z === undefined ? this._z : z
        ]
    });
    this._left += width;
    return this;
};
LayoutDockHelper.prototype.bottom = function (node, height, z) {
    if (height instanceof Array) {
        height = height[1];
    }
    if (height === undefined) {
        var size = this._context.resolveSize(node, [
                this._right - this._left,
                this._bottom - this._top
            ]);
        height = size[1];
    }
    this._context.set(node, {
        size: [
            this._right - this._left,
            height
        ],
        origin: [
            0,
            1
        ],
        align: [
            0,
            1
        ],
        translate: [
            this._left,
            -(this._size[1] - this._bottom),
            z === undefined ? this._z : z
        ]
    });
    this._bottom -= height;
    return this;
};
LayoutDockHelper.prototype.right = function (node, width, z) {
    if (width instanceof Array) {
        width = width[0];
    }
    if (node) {
        if (width === undefined) {
            var size = this._context.resolveSize(node, [
                    this._right - this._left,
                    this._bottom - this._top
                ]);
            width = size[0];
        }
        this._context.set(node, {
            size: [
                width,
                this._bottom - this._top
            ],
            origin: [
                1,
                0
            ],
            align: [
                1,
                0
            ],
            translate: [
                -(this._size[0] - this._right),
                this._top,
                z === undefined ? this._z : z
            ]
        });
    }
    if (width) {
        this._right -= width;
    }
    return this;
};
LayoutDockHelper.prototype.fill = function (node, z) {
    this._context.set(node, {
        size: [
            this._right - this._left,
            this._bottom - this._top
        ],
        translate: [
            this._left,
            this._top,
            z === undefined ? this._z : z
        ]
    });
    return this;
};
LayoutDockHelper.prototype.margins = function (margins) {
    margins = LayoutUtility.normalizeMargins(margins);
    this._left += margins[3];
    this._top += margins[0];
    this._right -= margins[1];
    this._bottom -= margins[2];
    return this;
};
LayoutUtility.registerHelper('dock', LayoutDockHelper);
module.exports = LayoutDockHelper;
},{"../LayoutUtility":9}],13:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var LayoutUtility = require('../LayoutUtility');
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: true
    };
var context;
var size;
var direction;
var alignment;
var lineDirection;
var lineLength;
var offset;
var margins;
var margin = [
        0,
        0
    ];
var spacing;
var justify;
var itemSize;
var getItemSize;
var lineNodes;
function _layoutLine(next, endReached) {
    if (!lineNodes.length) {
        return 0;
    }
    var i;
    var lineSize = [
            0,
            0
        ];
    var lineNode;
    for (i = 0; i < lineNodes.length; i++) {
        lineSize[direction] = Math.max(lineSize[direction], lineNodes[i].size[direction]);
        lineSize[lineDirection] += (i > 0 ? spacing[lineDirection] : 0) + lineNodes[i].size[lineDirection];
    }
    var justifyOffset = justify[lineDirection] ? (lineLength - lineSize[lineDirection]) / (lineNodes.length * 2) : 0;
    var lineOffset = (direction ? margins[3] : margins[0]) + justifyOffset;
    var scrollLength;
    for (i = 0; i < lineNodes.length; i++) {
        lineNode = lineNodes[i];
        var translate = [
                0,
                0,
                0
            ];
        translate[lineDirection] = lineOffset;
        translate[direction] = next ? offset : offset - lineSize[direction];
        scrollLength = 0;
        if (i === 0) {
            scrollLength = lineSize[direction];
            if (endReached && (next && !alignment || !next && alignment)) {
                scrollLength += direction ? margins[0] + margins[2] : margins[3] + margins[1];
            } else {
                scrollLength += spacing[direction];
            }
        }
        lineNode.set = {
            size: lineNode.size,
            translate: translate,
            scrollLength: scrollLength
        };
        lineOffset += lineNode.size[lineDirection] + spacing[lineDirection] + justifyOffset * 2;
    }
    for (i = 0; i < lineNodes.length; i++) {
        lineNode = next ? lineNodes[i] : lineNodes[lineNodes.length - 1 - i];
        context.set(lineNode.node, lineNode.set);
    }
    lineNodes = [];
    return lineSize[direction] + spacing[direction];
}
function _resolveNodeSize(node) {
    var localItemSize = itemSize;
    if (getItemSize) {
        localItemSize = getItemSize(node.renderNode, size);
    }
    if (localItemSize[0] === true || localItemSize[1] === true) {
        var result = context.resolveSize(node, size);
        if (localItemSize[0] !== true) {
            result[0] = itemSize[0];
        }
        if (localItemSize[1] !== true) {
            result[1] = itemSize[1];
        }
        return result;
    } else {
        return localItemSize;
    }
}
function CollectionLayout(context_, options) {
    context = context_;
    size = context.size;
    direction = context.direction;
    alignment = context.alignment;
    lineDirection = (direction + 1) % 2;
    if (options.gutter !== undefined && console.warn) {
        console.warn('option `gutter` has been deprecated for CollectionLayout, use margins & spacing instead');
    }
    if (options.gutter && !options.margins && !options.spacing) {
        var gutter = Array.isArray(options.gutter) ? options.gutter : [
                options.gutter,
                options.gutter
            ];
        margins = [
            gutter[1],
            gutter[0],
            gutter[1],
            gutter[0]
        ];
        spacing = gutter;
    } else {
        margins = LayoutUtility.normalizeMargins(options.margins);
        spacing = options.spacing || 0;
        spacing = Array.isArray(spacing) ? spacing : [
            spacing,
            spacing
        ];
    }
    margin[0] = margins[direction ? 0 : 3];
    margin[1] = -margins[direction ? 2 : 1];
    justify = Array.isArray(options.justify) ? options.justify : options.justify ? [
        true,
        true
    ] : [
        false,
        false
    ];
    lineLength = size[lineDirection] - (direction ? margins[3] + margins[1] : margins[0] + margins[2]);
    var node;
    var nodeSize;
    var lineOffset;
    var bound;
    if (options.cells) {
        if (options.itemSize && console.warn) {
            console.warn('options `cells` and `itemSize` cannot both be specified for CollectionLayout, only use one of the two');
        }
        itemSize = [
            (size[0] - (margins[1] + margins[3] + spacing[0] * (options.cells[0] - 1))) / options.cells[0],
            (size[1] - (margins[0] + margins[2] + spacing[1] * (options.cells[1] - 1))) / options.cells[1]
        ];
    } else if (!options.itemSize) {
        itemSize = [
            true,
            true
        ];
    } else if (options.itemSize instanceof Function) {
        getItemSize = options.itemSize;
    } else if (options.itemSize[0] === undefined || options.itemSize[0] === undefined) {
        itemSize = [
            options.itemSize[0] === undefined ? size[0] : options.itemSize[0],
            options.itemSize[1] === undefined ? size[1] : options.itemSize[1]
        ];
    } else {
        itemSize = options.itemSize;
    }
    offset = context.scrollOffset + (alignment ? 0 : margin[alignment]);
    bound = context.scrollEnd + (alignment ? 0 : margin[alignment]);
    lineOffset = 0;
    lineNodes = [];
    while (offset < bound) {
        node = context.next();
        if (!node) {
            _layoutLine(true, true);
            break;
        }
        nodeSize = _resolveNodeSize(node);
        lineOffset += (lineNodes.length ? spacing[lineDirection] : 0) + nodeSize[lineDirection];
        if (lineOffset > lineLength) {
            offset += _layoutLine(true, !node);
            lineOffset = nodeSize[lineDirection];
        }
        lineNodes.push({
            node: node,
            size: nodeSize
        });
    }
    offset = context.scrollOffset + (alignment ? margin[alignment] : 0);
    bound = context.scrollStart + (alignment ? margin[alignment] : 0);
    lineOffset = 0;
    lineNodes = [];
    while (offset > bound) {
        node = context.prev();
        if (!node) {
            _layoutLine(false, true);
            break;
        }
        nodeSize = _resolveNodeSize(node);
        lineOffset += (lineNodes.length ? spacing[lineDirection] : 0) + nodeSize[lineDirection];
        if (lineOffset > lineLength) {
            offset -= _layoutLine(false, !node);
            lineOffset = nodeSize[lineDirection];
        }
        lineNodes.unshift({
            node: node,
            size: nodeSize
        });
    }
}
CollectionLayout.Capabilities = capabilities;
CollectionLayout.Name = 'CollectionLayout';
CollectionLayout.Description = 'Multi-cell collection-layout with margins & spacing';
module.exports = CollectionLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutUtility":9}],14:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.X,
            Utility.Direction.Y
        ],
        scrolling: true
    };
function CoverLayout(context, options) {
    var node = context.next();
    if (!node) {
        return;
    }
    var size = context.size;
    var direction = context.direction;
    var itemSize = options.itemSize;
    var opacityStep = 0.2;
    var scaleStep = 0.1;
    var translateStep = 30;
    var zStart = 100;
    context.set(node, {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        align: [
            0.5,
            0.5
        ],
        translate: [
            0,
            0,
            zStart
        ],
        scrollLength: itemSize[direction]
    });
    var translate = itemSize[0] / 2;
    var opacity = 1 - opacityStep;
    var zIndex = zStart - 1;
    var scale = 1 - scaleStep;
    var prev = false;
    var endReached = false;
    node = context.next();
    if (!node) {
        node = context.prev();
        prev = true;
    }
    while (node) {
        context.set(node, {
            size: itemSize,
            origin: [
                0.5,
                0.5
            ],
            align: [
                0.5,
                0.5
            ],
            translate: direction ? [
                0,
                prev ? -translate : translate,
                zIndex
            ] : [
                prev ? -translate : translate,
                0,
                zIndex
            ],
            scale: [
                scale,
                scale,
                1
            ],
            opacity: opacity,
            scrollLength: itemSize[direction]
        });
        opacity -= opacityStep;
        scale -= scaleStep;
        translate += translateStep;
        zIndex--;
        if (translate >= size[direction] / 2) {
            endReached = true;
        } else {
            node = prev ? context.prev() : context.next();
            endReached = !node;
        }
        if (endReached) {
            if (prev) {
                break;
            }
            endReached = false;
            prev = true;
            node = context.prev();
            if (node) {
                translate = itemSize[direction] / 2;
                opacity = 1 - opacityStep;
                zIndex = zStart - 1;
                scale = 1 - scaleStep;
            }
        }
    }
}
CoverLayout.Capabilities = capabilities;
module.exports = CoverLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],15:[function(require,module,exports){
module.exports = function CubeLayout(context, options) {
    var itemSize = options.itemSize;
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            0,
            Math.PI / 2,
            0
        ],
        translate: [
            itemSize[0] / 2,
            0,
            0
        ]
    });
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            0,
            Math.PI / 2,
            0
        ],
        translate: [
            -(itemSize[0] / 2),
            0,
            0
        ]
    });
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            Math.PI / 2,
            0,
            0
        ],
        translate: [
            0,
            -(itemSize[1] / 2),
            0
        ]
    });
    context.set(context.next(), {
        size: itemSize,
        origin: [
            0.5,
            0.5
        ],
        rotate: [
            Math.PI / 2,
            0,
            0
        ],
        translate: [
            0,
            itemSize[1] / 2,
            0
        ]
    });
};
},{}],16:[function(require,module,exports){
if (console.warn) {
    console.warn('GridLayout has been deprecated and will be removed in the future, use CollectionLayout instead');
}
module.exports = require('./CollectionLayout');
},{"./CollectionLayout":13}],17:[function(require,module,exports){
var LayoutDockHelper = require('../helpers/LayoutDockHelper');
module.exports = function HeaderFooterLayout(context, options) {
    var dock = new LayoutDockHelper(context, options);
    dock.top('header', options.headerSize !== undefined ? options.headerSize : options.headerHeight);
    dock.bottom('footer', options.footerSize !== undefined ? options.footerSize : options.footerHeight);
    dock.fill('content');
};
},{"../helpers/LayoutDockHelper":12}],18:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var LayoutUtility = require('../LayoutUtility');
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: true,
        trueSize: true,
        sequentialScrollingOptimized: true
    };
var set = {
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ],
        scrollLength: undefined
    };
var margin = [
        0,
        0
    ];
function ListLayout(context, options) {
    var size = context.size;
    var direction = context.direction;
    var alignment = context.alignment;
    var revDirection = direction ? 0 : 1;
    var offset;
    var margins = LayoutUtility.normalizeMargins(options.margins);
    var spacing = options.spacing || 0;
    var node;
    var nodeSize;
    var itemSize;
    var getItemSize;
    var lastSectionBeforeVisibleCell;
    var lastSectionBeforeVisibleCellOffset;
    var lastSectionBeforeVisibleCellLength;
    var lastSectionBeforeVisibleCellScrollLength;
    var firstVisibleCell;
    var lastNode;
    var lastCellOffsetInFirstVisibleSection;
    var isSectionCallback = options.isSectionCallback;
    var bound;
    set.size[0] = size[0];
    set.size[1] = size[1];
    set.size[revDirection] -= margins[1 - revDirection] + margins[3 - revDirection];
    set.translate[0] = 0;
    set.translate[1] = 0;
    set.translate[2] = 0;
    set.translate[revDirection] = margins[direction ? 3 : 0];
    if (options.itemSize === true || !options.hasOwnProperty('itemSize')) {
        itemSize = true;
    } else if (options.itemSize instanceof Function) {
        getItemSize = options.itemSize;
    } else {
        itemSize = options.itemSize === undefined ? size[direction] : options.itemSize;
    }
    margin[0] = margins[direction ? 0 : 3];
    margin[1] = -margins[direction ? 2 : 1];
    offset = context.scrollOffset + margin[alignment];
    bound = context.scrollEnd + margin[alignment];
    while (offset < bound + spacing) {
        lastNode = node;
        node = context.next();
        if (!node) {
            break;
        }
        nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
        nodeSize = nodeSize === true ? context.resolveSize(node, size)[direction] : nodeSize;
        set.size[direction] = nodeSize;
        set.translate[direction] = offset + (alignment ? spacing : 0);
        set.scrollLength = nodeSize + spacing;
        context.set(node, set);
        offset += set.scrollLength;
        if (isSectionCallback && isSectionCallback(node.renderNode)) {
            set.translate[direction] = Math.max(margin[0], set.translate[direction]);
            context.set(node, set);
            if (!firstVisibleCell) {
                lastSectionBeforeVisibleCell = node;
                lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                lastSectionBeforeVisibleCellLength = nodeSize;
                lastSectionBeforeVisibleCellScrollLength = nodeSize;
            } else if (lastCellOffsetInFirstVisibleSection === undefined) {
                lastCellOffsetInFirstVisibleSection = offset - nodeSize;
            }
        } else if (!firstVisibleCell && offset >= 0) {
            firstVisibleCell = node;
        }
    }
    if (lastNode && !node && !alignment) {
        set.scrollLength = nodeSize + margin[0] + -margin[1];
        context.set(lastNode, set);
    }
    lastNode = undefined;
    node = undefined;
    offset = context.scrollOffset + margin[alignment];
    bound = context.scrollStart + margin[alignment];
    while (offset > bound - spacing) {
        lastNode = node;
        node = context.prev();
        if (!node) {
            break;
        }
        nodeSize = getItemSize ? getItemSize(node.renderNode) : itemSize;
        nodeSize = nodeSize === true ? context.resolveSize(node, size)[direction] : nodeSize;
        set.scrollLength = nodeSize + spacing;
        offset -= set.scrollLength;
        set.size[direction] = nodeSize;
        set.translate[direction] = offset + (alignment ? spacing : 0);
        context.set(node, set);
        if (isSectionCallback && isSectionCallback(node.renderNode)) {
            set.translate[direction] = Math.max(margin[0], set.translate[direction]);
            context.set(node, set);
            if (!lastSectionBeforeVisibleCell) {
                lastSectionBeforeVisibleCell = node;
                lastSectionBeforeVisibleCellOffset = offset;
                lastSectionBeforeVisibleCellLength = nodeSize;
                lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
            }
        } else if (offset + nodeSize >= 0) {
            firstVisibleCell = node;
            if (lastSectionBeforeVisibleCell) {
                lastCellOffsetInFirstVisibleSection = offset + nodeSize;
            }
            lastSectionBeforeVisibleCell = undefined;
        }
    }
    if (lastNode && !node && alignment) {
        set.scrollLength = nodeSize + margin[0] + -margin[1];
        context.set(lastNode, set);
        if (lastSectionBeforeVisibleCell === lastNode) {
            lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
        }
    }
    if (isSectionCallback && !lastSectionBeforeVisibleCell) {
        node = context.prev();
        while (node) {
            if (isSectionCallback(node.renderNode)) {
                lastSectionBeforeVisibleCell = node;
                nodeSize = options.itemSize || context.resolveSize(node, size)[direction];
                lastSectionBeforeVisibleCellOffset = offset - nodeSize;
                lastSectionBeforeVisibleCellLength = nodeSize;
                lastSectionBeforeVisibleCellScrollLength = undefined;
                break;
            } else {
                node = context.prev();
            }
        }
    }
    if (lastSectionBeforeVisibleCell) {
        var correctedOffset = Math.max(margin[0], lastSectionBeforeVisibleCellOffset);
        if (lastCellOffsetInFirstVisibleSection !== undefined && lastSectionBeforeVisibleCellLength > lastCellOffsetInFirstVisibleSection - margin[0]) {
            correctedOffset = lastCellOffsetInFirstVisibleSection - lastSectionBeforeVisibleCellLength;
        }
        set.size[direction] = lastSectionBeforeVisibleCellLength;
        set.translate[direction] = correctedOffset;
        set.scrollLength = lastSectionBeforeVisibleCellScrollLength;
        context.set(lastSectionBeforeVisibleCell, set);
    }
}
ListLayout.Capabilities = capabilities;
ListLayout.Name = 'ListLayout';
ListLayout.Description = 'List-layout with margins, spacing and sticky headers';
module.exports = ListLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutUtility":9}],19:[function(require,module,exports){
var LayoutDockHelper = require('../helpers/LayoutDockHelper');
module.exports = function NavBarLayout(context, options) {
    var dock = new LayoutDockHelper(context, {
            margins: options.margins,
            translateZ: 1
        });
    context.set('background', { size: context.size });
    var node;
    var i;
    var rightItems = context.get('rightItems');
    if (rightItems) {
        for (i = 0; i < rightItems.length; i++) {
            node = context.get(rightItems[i]);
            dock.right(node, options.rightItemWidth || options.itemWidth);
            dock.right(undefined, options.rightItemSpacer || options.itemSpacer);
        }
    }
    var leftItems = context.get('leftItems');
    if (leftItems) {
        for (i = 0; i < leftItems.length; i++) {
            node = context.get(leftItems[i]);
            dock.left(node, options.leftItemWidth || options.itemWidth);
            dock.left(undefined, options.leftItemSpacer || options.itemSpacer);
        }
    }
    dock.fill('title');
};
},{"../helpers/LayoutDockHelper":12}],20:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: false
    };
var direction;
var size;
var ratios;
var total;
var offset;
var index;
var node;
var set = {
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ]
    };
function ProportionalLayout(context, options) {
    size = context.size;
    direction = context.direction;
    ratios = options.ratios;
    total = 0;
    for (index = 0; index < ratios.length; index++) {
        total += ratios[index];
    }
    set.size[0] = size[0];
    set.size[1] = size[1];
    set.translate[0] = 0;
    set.translate[1] = 0;
    node = context.next();
    offset = 0;
    index = 0;
    while (node && index < ratios.length) {
        set.size[direction] = (size[direction] - offset) / total * ratios[index];
        set.translate[direction] = offset;
        context.set(node, set);
        offset += set.size[direction];
        total -= ratios[index];
        index++;
        node = context.next();
    }
}
ProportionalLayout.Capabilities = capabilities;
module.exports = ProportionalLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],21:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var LayoutUtility = require('../LayoutUtility');
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.X,
            Utility.Direction.Y
        ],
        trueSize: true
    };
var size;
var direction;
var revDirection;
var items;
var spacers;
var margins;
var spacing;
var sizeLeft;
var set = {
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ],
        align: [
            0,
            0
        ],
        origin: [
            0,
            0
        ]
    };
var nodeSize;
var offset;
var zIncrement;
function TabBarLayout(context, options) {
    size = context.size;
    direction = context.direction;
    revDirection = direction ? 0 : 1;
    spacing = options.spacing || 0;
    items = context.get('items');
    spacers = context.get('spacers');
    margins = LayoutUtility.normalizeMargins(options.margins);
    zIncrement = options.zIncrement || 0.001;
    set.size[0] = context.size[0];
    set.size[1] = context.size[1];
    set.size[revDirection] -= margins[1 - revDirection] + margins[3 - revDirection];
    set.translate[0] = 0;
    set.translate[1] = 0;
    set.translate[2] = zIncrement;
    set.translate[revDirection] = margins[direction ? 3 : 0];
    set.align[0] = 0;
    set.align[1] = 0;
    set.origin[0] = 0;
    set.origin[1] = 0;
    offset = direction ? margins[0] : margins[3];
    sizeLeft = size[direction] - (offset + (direction ? margins[2] : margins[1]));
    sizeLeft -= (items.length - 1) * spacing;
    for (var i = 0; i < items.length; i++) {
        if (options.itemSize === undefined) {
            nodeSize = Math.round(sizeLeft / (items.length - i));
        } else {
            nodeSize = options.itemSize === true ? context.resolveSize(items[i], size)[direction] : options.itemSize;
        }
        set.scrollLength = nodeSize;
        if (i === 0) {
            set.scrollLength += direction ? margins[0] : margins[3];
        }
        if (i === items.length - 1) {
            set.scrollLength += direction ? margins[2] : margins[1];
        } else {
            set.scrollLength += spacing;
        }
        set.size[direction] = nodeSize;
        set.translate[direction] = offset;
        context.set(items[i], set);
        offset += nodeSize;
        sizeLeft -= nodeSize;
        if (i === options.selectedItemIndex) {
            set.scrollLength = 0;
            set.translate[direction] += nodeSize / 2;
            set.translate[2] = zIncrement * 2;
            set.origin[direction] = 0.5;
            context.set('selectedItemOverlay', set);
            set.origin[direction] = 0;
            set.translate[2] = zIncrement;
        }
        if (i < items.length - 1) {
            if (spacers && i < spacers.length) {
                set.size[direction] = spacing;
                set.translate[direction] = offset;
                context.set(spacers[i], set);
            }
            offset += spacing;
        } else {
            offset += direction ? margins[2] : margins[1];
        }
    }
    set.scrollLength = 0;
    set.size[0] = size[0];
    set.size[1] = size[1];
    set.size[direction] = size[direction];
    set.translate[0] = 0;
    set.translate[1] = 0;
    set.translate[2] = 0;
    set.translate[direction] = 0;
    context.set('background', set);
}
TabBarLayout.Capabilities = capabilities;
TabBarLayout.Name = 'TabBarLayout';
TabBarLayout.Description = 'TabBar widget layout';
module.exports = TabBarLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutUtility":9}],22:[function(require,module,exports){
(function (global){
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var capabilities = {
        sequence: true,
        direction: [
            Utility.Direction.Y,
            Utility.Direction.X
        ],
        scrolling: true,
        trueSize: true
    };
var size;
var direction;
var revDirection;
var node;
var itemSize;
var diameter;
var offset;
var bound;
var angle;
var radius;
var itemAngle;
var radialOpacity;
var set = {
        opacity: 1,
        size: [
            0,
            0
        ],
        translate: [
            0,
            0,
            0
        ],
        rotate: [
            0,
            0,
            0
        ],
        origin: [
            0.5,
            0.5
        ],
        align: [
            0.5,
            0.5
        ],
        scrollLength: undefined
    };
function WheelLayout(context, options) {
    size = context.size;
    direction = context.direction;
    revDirection = direction ? 0 : 1;
    itemSize = options.itemSize || size[direction] / 2;
    diameter = options.diameter || itemSize * 3;
    radius = diameter / 2;
    itemAngle = Math.atan2(itemSize / 2, radius) * 2;
    radialOpacity = options.radialOpacity === undefined ? 1 : options.radialOpacity;
    set.opacity = 1;
    set.size[0] = size[0];
    set.size[1] = size[1];
    set.size[revDirection] = size[revDirection];
    set.size[direction] = itemSize;
    set.translate[0] = 0;
    set.translate[1] = 0;
    set.translate[2] = 0;
    set.rotate[0] = 0;
    set.rotate[1] = 0;
    set.rotate[2] = 0;
    set.scrollLength = itemSize;
    offset = context.scrollOffset;
    bound = Math.PI / 2 / itemAngle * itemSize + itemSize;
    while (offset <= bound) {
        node = context.next();
        if (!node) {
            break;
        }
        if (offset >= -bound) {
            angle = offset / itemSize * itemAngle;
            set.translate[direction] = radius * Math.sin(angle);
            set.translate[2] = radius * Math.cos(angle) - radius;
            set.rotate[revDirection] = direction ? -angle : angle;
            set.opacity = 1 - Math.abs(angle) / (Math.PI / 2) * (1 - radialOpacity);
            context.set(node, set);
        }
        offset += itemSize;
    }
    offset = context.scrollOffset - itemSize;
    while (offset >= -bound) {
        node = context.prev();
        if (!node) {
            break;
        }
        if (offset <= bound) {
            angle = offset / itemSize * itemAngle;
            set.translate[direction] = radius * Math.sin(angle);
            set.translate[2] = radius * Math.cos(angle) - radius;
            set.rotate[revDirection] = direction ? -angle : angle;
            set.opacity = 1 - Math.abs(angle) / (Math.PI / 2) * (1 - radialOpacity);
            context.set(node, set);
        }
        offset -= itemSize;
    }
}
WheelLayout.Capabilities = capabilities;
WheelLayout.Name = 'WheelLayout';
WheelLayout.Description = 'Spinner-wheel/slot-machine layout';
module.exports = WheelLayout;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],23:[function(require,module,exports){
(function (global){
var View = typeof window !== 'undefined' ? window.famous.core.View : typeof global !== 'undefined' ? global.famous.core.View : null;
var Surface = typeof window !== 'undefined' ? window.famous.core.Surface : typeof global !== 'undefined' ? global.famous.core.Surface : null;
var Utility = typeof window !== 'undefined' ? window.famous.utilities.Utility : typeof global !== 'undefined' ? global.famous.utilities.Utility : null;
var ContainerSurface = typeof window !== 'undefined' ? window.famous.surfaces.ContainerSurface : typeof global !== 'undefined' ? global.famous.surfaces.ContainerSurface : null;
var LayoutController = require('../LayoutController');
var ScrollController = require('../ScrollController');
var WheelLayout = require('../layouts/WheelLayout');
var ProportionalLayout = require('../layouts/ProportionalLayout');
var VirtualViewSequence = require('../VirtualViewSequence');
var DatePickerComponents = require('./DatePickerComponents');
var LayoutUtility = require('../LayoutUtility');
function DatePicker(options) {
    View.apply(this, arguments);
    options = options || {};
    this._date = new Date(options.date ? options.date.getTime() : undefined);
    this._components = [];
    this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;
    _createLayout.call(this);
    _updateComponents.call(this);
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
DatePicker.prototype.classes = [
    'ff-widget',
    'ff-datepicker'
];
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
            dampingRatio: 1,
            period: 800
        }
    }
};
function _createRenderable(id, data) {
    var option = this.options.createRenderables[Array.isArray(id) ? id[0] : id];
    if (option instanceof Function) {
        return option.call(this, id, data);
    } else if (!option) {
        return undefined;
    }
    if (data !== undefined && data instanceof Object) {
        return data;
    }
    var surface = new Surface({
            classes: this.classes,
            content: data ? '<div>' + data + '</div>' : undefined
        });
    if (Array.isArray(id)) {
        for (var i = 0; i < id.length; i++) {
            surface.addClass(id[i]);
        }
    } else {
        surface.addClass(id);
    }
    return surface;
}
DatePicker.prototype.setOptions = function (options) {
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
        this.overlay.setLayoutOptions({ itemSize: this.options.wheelLayout.itemSize });
    }
    if (options.scrollController !== undefined) {
        for (i = 0; i < this.scrollWheels.length; i++) {
            this.scrollWheels[i].scrollController.setOptions(options.scrollController);
        }
    }
    return this;
};
DatePicker.prototype.setComponents = function (components) {
    this._components = components;
    _updateComponents.call(this);
    return this;
};
DatePicker.prototype.getComponents = function () {
    return this._components;
};
DatePicker.prototype.setDate = function (date) {
    this._date.setTime(date.getTime());
    _setDateToScrollWheels.call(this, this._date);
    return this;
};
DatePicker.prototype.getDate = function () {
    return this._date;
};
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
            var steps = 0;
            if (currentValue !== destValue) {
                steps = destValue - currentValue;
                if (component.loop) {
                    var revSteps = steps < 0 ? steps + component.upperBound : steps - component.upperBound;
                    if (Math.abs(revSteps) < Math.abs(steps)) {
                        steps = revSteps;
                    }
                }
            }
            if (!steps) {
                scrollWheel.scrollController.goToRenderNode(renderNode);
            } else {
                while (currentValue !== destValue) {
                    viewSequence = steps > 0 ? viewSequence.getNext() : viewSequence.getPrevious();
                    renderNode = viewSequence ? viewSequence.get() : undefined;
                    if (!renderNode) {
                        break;
                    }
                    currentValue = component.getComponent(renderNode.date);
                    if (steps > 0) {
                        scrollWheel.scrollController.goToNextPage();
                    } else {
                        scrollWheel.scrollController.goToPreviousPage();
                    }
                }
            }
        }
    }
}
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
function _createLayout() {
    this.container = new ContainerSurface(this.options.container);
    this.container.setClasses(this.classes);
    this.layout = new LayoutController({
        layout: ProportionalLayout,
        layoutOptions: { ratios: [] },
        direction: Utility.Direction.X
    });
    this.container.add(this.layout);
    this.add(this.container);
}
function _clickItem(scrollWheel, event) {
}
function _scrollWheelScrollStart() {
    this._scrollingCount++;
    if (this._scrollingCount === 1) {
        this._eventOutput.emit('scrollstart', { target: this });
    }
}
function _scrollWheelScrollEnd() {
    this._scrollingCount--;
    if (this._scrollingCount === 0) {
        this._eventOutput.emit('scrollend', {
            target: this,
            date: this._date
        });
    }
}
function _scrollWheelPageChange() {
    this._date = _getDateFromScrollWheels.call(this);
    this._eventOutput.emit('datechange', {
        target: this,
        date: this._date
    });
}
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
        var options = LayoutUtility.combineOptions(this.options.scrollController, {
                layout: WheelLayout,
                layoutOptions: this.options.wheelLayout,
                flow: false,
                direction: Utility.Direction.Y,
                dataSource: viewSequence,
                autoPipeEvents: true
            });
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
    this.layout.setLayoutOptions({ ratios: sizeRatios });
}
function OverlayLayout(context, options) {
    var height = (context.size[1] - options.itemSize) / 2;
    context.set('top', {
        size: [
            context.size[0],
            height
        ],
        translate: [
            0,
            0,
            1
        ]
    });
    context.set('middle', {
        size: [
            context.size[0],
            context.size[1] - height * 2
        ],
        translate: [
            0,
            height,
            1
        ]
    });
    context.set('bottom', {
        size: [
            context.size[0],
            height
        ],
        translate: [
            0,
            context.size[1] - height,
            1
        ]
    });
}
function _createOverlay() {
    this.overlay = new LayoutController({
        layout: OverlayLayout,
        layoutOptions: { itemSize: this.options.wheelLayout.itemSize },
        dataSource: this._overlayRenderables
    });
    this.add(this.overlay);
}
module.exports = DatePicker;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutController":6,"../LayoutUtility":9,"../ScrollController":10,"../VirtualViewSequence":11,"../layouts/ProportionalLayout":20,"../layouts/WheelLayout":22,"./DatePickerComponents":24}],24:[function(require,module,exports){
(function (global){
var Surface = typeof window !== 'undefined' ? window.famous.core.Surface : typeof global !== 'undefined' ? global.famous.core.Surface : null;
var EventHandler = typeof window !== 'undefined' ? window.famous.core.EventHandler : typeof global !== 'undefined' ? global.famous.core.EventHandler : null;
function decimal1(date) {
    return '' + date[this.get]();
}
function decimal2(date) {
    return ('0' + date[this.get]()).slice(-2);
}
function decimal3(date) {
    return ('00' + date[this.get]()).slice(-3);
}
function decimal4(date) {
    return ('000' + date[this.get]()).slice(-4);
}
function Base(options) {
    this._eventOutput = new EventHandler();
    this._pool = [];
    EventHandler.setOutputHandler(this, this._eventOutput);
    if (options) {
        for (var key in options) {
            this[key] = options[key];
        }
    }
}
Base.prototype.step = 1;
Base.prototype.classes = ['item'];
Base.prototype.getComponent = function (date) {
    return date[this.get]();
};
Base.prototype.setComponent = function (date, value) {
    return date[this.set](value);
};
Base.prototype.format = function (date) {
    return 'overide to implement';
};
Base.prototype.createNext = function (renderable) {
    var date = this.getNext(renderable.date);
    return date ? this.create(date) : undefined;
};
Base.prototype.getNext = function (date) {
    date = new Date(date.getTime());
    var newVal = this.getComponent(date) + this.step;
    if (this.upperBound !== undefined && newVal >= this.upperBound) {
        if (!this.loop) {
            return undefined;
        }
        newVal = Math.max(newVal % this.upperBound, this.lowerBound || 0);
    }
    this.setComponent(date, newVal);
    return date;
};
Base.prototype.createPrevious = function (renderable) {
    var date = this.getPrevious(renderable.date);
    return date ? this.create(date) : undefined;
};
Base.prototype.getPrevious = function (date) {
    date = new Date(date.getTime());
    var newVal = this.getComponent(date) - this.step;
    if (this.lowerBound !== undefined && newVal < this.lowerBound) {
        if (!this.loop) {
            return undefined;
        }
        newVal = newVal % this.upperBound;
    }
    this.setComponent(date, newVal);
    return date;
};
Base.prototype.installClickHandler = function (renderable) {
    renderable.on('click', function (event) {
        this._eventOutput.emit('click', {
            target: renderable,
            event: event
        });
    }.bind(this));
};
Base.prototype.createRenderable = function (classes, data) {
    return new Surface({
        classes: classes,
        content: '<div>' + data + '</div>'
    });
};
Base.prototype.create = function (date) {
    date = date || new Date();
    var renderable;
    if (this._pool.length) {
        renderable = this._pool[0];
        this._pool.splice(0, 1);
        renderable.setContent(this.format(date));
    } else {
        renderable = this.createRenderable(this.classes, this.format(date));
        this.installClickHandler(renderable);
    }
    renderable.date = date;
    return renderable;
};
Base.prototype.destroy = function (renderable) {
    this._pool.push(renderable);
};
function Year() {
    Base.apply(this, arguments);
}
Year.prototype = Object.create(Base.prototype);
Year.prototype.constructor = Year;
Year.prototype.classes = [
    'item',
    'year'
];
Year.prototype.format = decimal4;
Year.prototype.sizeRatio = 1;
Year.prototype.step = 1;
Year.prototype.loop = false;
Year.prototype.set = 'setFullYear';
Year.prototype.get = 'getFullYear';
function Month() {
    Base.apply(this, arguments);
}
Month.prototype = Object.create(Base.prototype);
Month.prototype.constructor = Month;
Month.prototype.classes = [
    'item',
    'month'
];
Month.prototype.sizeRatio = 2;
Month.prototype.lowerBound = 0;
Month.prototype.upperBound = 12;
Month.prototype.step = 1;
Month.prototype.loop = true;
Month.prototype.set = 'setMonth';
Month.prototype.get = 'getMonth';
Month.prototype.strings = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
Month.prototype.format = function (date) {
    return this.strings[date.getMonth()];
};
function FullDay() {
    Base.apply(this, arguments);
}
FullDay.prototype = Object.create(Base.prototype);
FullDay.prototype.constructor = FullDay;
FullDay.prototype.classes = [
    'item',
    'fullday'
];
FullDay.prototype.sizeRatio = 2;
FullDay.prototype.step = 1;
FullDay.prototype.set = 'setDate';
FullDay.prototype.get = 'getDate';
FullDay.prototype.format = function (date) {
    return date.toLocaleDateString();
};
function WeekDay() {
    Base.apply(this, arguments);
}
WeekDay.prototype = Object.create(Base.prototype);
WeekDay.prototype.constructor = WeekDay;
WeekDay.prototype.classes = [
    'item',
    'weekday'
];
WeekDay.prototype.sizeRatio = 2;
WeekDay.prototype.lowerBound = 0;
WeekDay.prototype.upperBound = 7;
WeekDay.prototype.step = 1;
WeekDay.prototype.loop = true;
WeekDay.prototype.set = 'setDate';
WeekDay.prototype.get = 'getDate';
WeekDay.prototype.strings = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];
WeekDay.prototype.format = function (date) {
    return this.strings[date.getDay()];
};
function Day() {
    Base.apply(this, arguments);
}
Day.prototype = Object.create(Base.prototype);
Day.prototype.constructor = Day;
Day.prototype.classes = [
    'item',
    'day'
];
Day.prototype.format = decimal1;
Day.prototype.sizeRatio = 1;
Day.prototype.lowerBound = 1;
Day.prototype.upperBound = 32;
Day.prototype.step = 1;
Day.prototype.loop = true;
Day.prototype.set = 'setDate';
Day.prototype.get = 'getDate';
function Hour() {
    Base.apply(this, arguments);
}
Hour.prototype = Object.create(Base.prototype);
Hour.prototype.constructor = Hour;
Hour.prototype.classes = [
    'item',
    'hour'
];
Hour.prototype.format = decimal2;
Hour.prototype.sizeRatio = 1;
Hour.prototype.lowerBound = 0;
Hour.prototype.upperBound = 24;
Hour.prototype.step = 1;
Hour.prototype.loop = true;
Hour.prototype.set = 'setHours';
Hour.prototype.get = 'getHours';
function Minute() {
    Base.apply(this, arguments);
}
Minute.prototype = Object.create(Base.prototype);
Minute.prototype.constructor = Minute;
Minute.prototype.classes = [
    'item',
    'minute'
];
Minute.prototype.format = decimal2;
Minute.prototype.sizeRatio = 1;
Minute.prototype.lowerBound = 0;
Minute.prototype.upperBound = 60;
Minute.prototype.step = 1;
Minute.prototype.loop = true;
Minute.prototype.set = 'setMinutes';
Minute.prototype.get = 'getMinutes';
function Second() {
    Base.apply(this, arguments);
}
Second.prototype = Object.create(Base.prototype);
Second.prototype.constructor = Second;
Second.prototype.classes = [
    'item',
    'second'
];
Second.prototype.format = decimal2;
Second.prototype.sizeRatio = 1;
Second.prototype.lowerBound = 0;
Second.prototype.upperBound = 60;
Second.prototype.step = 1;
Second.prototype.loop = true;
Second.prototype.set = 'setSeconds';
Second.prototype.get = 'getSeconds';
function Millisecond() {
    Base.apply(this, arguments);
}
Millisecond.prototype = Object.create(Base.prototype);
Millisecond.prototype.constructor = Millisecond;
Millisecond.prototype.classes = [
    'item',
    'millisecond'
];
Millisecond.prototype.format = decimal3;
Millisecond.prototype.sizeRatio = 1;
Millisecond.prototype.lowerBound = 0;
Millisecond.prototype.upperBound = 1000;
Millisecond.prototype.step = 1;
Millisecond.prototype.loop = true;
Millisecond.prototype.set = 'setMilliseconds';
Millisecond.prototype.get = 'getMilliseconds';
module.exports = {
    Base: Base,
    Year: Year,
    Month: Month,
    FullDay: FullDay,
    WeekDay: WeekDay,
    Day: Day,
    Hour: Hour,
    Minute: Minute,
    Second: Second,
    Millisecond: Millisecond
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],25:[function(require,module,exports){
(function (global){
var Surface = typeof window !== 'undefined' ? window.famous.core.Surface : typeof global !== 'undefined' ? global.famous.core.Surface : null;
var View = typeof window !== 'undefined' ? window.famous.core.View : typeof global !== 'undefined' ? global.famous.core.View : null;
var LayoutController = require('../LayoutController');
var TabBarLayout = require('../layouts/TabBarLayout');
function TabBar(options) {
    View.apply(this, arguments);
    this._selectedItemIndex = -1;
    options = options || {};
    this.classes = options.classes ? this.classes.concat(options.classes) : this.classes;
    this.layout = new LayoutController(this.options.layoutController);
    this.add(this.layout);
    this.layout.pipe(this._eventOutput);
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
TabBar.prototype.classes = [
    'ff-widget',
    'ff-tabbar'
];
TabBar.DEFAULT_OPTIONS = {
    tabBarLayout: {
        margins: [
            0,
            0,
            0,
            0
        ],
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
function _setSelectedItem(index) {
    if (index !== this._selectedItemIndex) {
        var oldIndex = this._selectedItemIndex;
        this._selectedItemIndex = index;
        this.layout.setLayoutOptions({ selectedItemIndex: index });
        if (oldIndex >= 0 && this._renderables.items[oldIndex].removeClass) {
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
                item: this._renderables.items[index]
            });
        }
    }
}
function _createRenderable(id, data) {
    var option = this.options.createRenderables[id];
    if (option instanceof Function) {
        return option.call(this, id, data);
    } else if (!option) {
        return undefined;
    }
    if (data !== undefined && data instanceof Object) {
        return data;
    }
    var surface = new Surface({
            classes: this.classes,
            content: data ? '<div>' + data + '</div>' : undefined
        });
    surface.addClass(id);
    if (id === 'item') {
        if (this.options.tabBarLayout && this.options.tabBarLayout.itemSize && this.options.tabBarLayout.itemSize === true) {
            surface.setSize(this.layout.getDirection() ? [
                undefined,
                true
            ] : [
                true,
                undefined
            ]);
        }
    }
    return surface;
}
TabBar.prototype.setOptions = function (options) {
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
TabBar.prototype.setItems = function (items) {
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
            if (i < items.length - 1) {
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
TabBar.prototype.getItems = function () {
    return this._renderables.items;
};
TabBar.prototype.getItemSpec = function (index, normalize) {
    return this.layout.getSpec(this._renderables.items[index], normalize);
};
TabBar.prototype.setSelectedItemIndex = function (index) {
    _setSelectedItem.call(this, index);
    return this;
};
TabBar.prototype.getSelectedItemIndex = function () {
    return this._selectedItemIndex;
};
TabBar.prototype.getSize = function () {
    return this.options.size || (this.layout ? this.layout.getSize() : View.prototype.getSize.call(this));
};
module.exports = TabBar;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../LayoutController":6,"../layouts/TabBarLayout":21}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2ZhbW91cy1mbGV4LWdsb2JhbC50ZW1wbGF0ZS5qcyIsInNyYy9BbmltYXRpb25Db250cm9sbGVyLmpzIiwic3JjL0ZsZXhTY3JvbGxWaWV3LmpzIiwic3JjL0Zsb3dMYXlvdXROb2RlLmpzIiwic3JjL0xheW91dENvbnRleHQuanMiLCJzcmMvTGF5b3V0Q29udHJvbGxlci5qcyIsInNyYy9MYXlvdXROb2RlLmpzIiwic3JjL0xheW91dE5vZGVNYW5hZ2VyLmpzIiwic3JjL0xheW91dFV0aWxpdHkuanMiLCJzcmMvU2Nyb2xsQ29udHJvbGxlci5qcyIsInNyYy9WaXJ0dWFsVmlld1NlcXVlbmNlLmpzIiwic3JjL2hlbHBlcnMvTGF5b3V0RG9ja0hlbHBlci5qcyIsInNyYy9sYXlvdXRzL0NvbGxlY3Rpb25MYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9Db3ZlckxheW91dC5qcyIsInNyYy9sYXlvdXRzL0N1YmVMYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9HcmlkTGF5b3V0LmpzIiwic3JjL2xheW91dHMvSGVhZGVyRm9vdGVyTGF5b3V0LmpzIiwic3JjL2xheW91dHMvTGlzdExheW91dC5qcyIsInNyYy9sYXlvdXRzL05hdkJhckxheW91dC5qcyIsInNyYy9sYXlvdXRzL1Byb3BvcnRpb25hbExheW91dC5qcyIsInNyYy9sYXlvdXRzL1RhYkJhckxheW91dC5qcyIsInNyYy9sYXlvdXRzL1doZWVsTGF5b3V0LmpzIiwic3JjL3dpZGdldHMvRGF0ZVBpY2tlci5qcyIsInNyYy93aWRnZXRzL0RhdGVQaWNrZXJDb21wb25lbnRzLmpzIiwic3JjL3dpZGdldHMvVGFiQmFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0WkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiBmYW1vdXNmbGV4ID09PSAndW5kZWZpbmVkJykge1xuICAgIGZhbW91c2ZsZXggPSB7fTtcbn1cblxuZmFtb3VzZmxleC5GbGV4U2Nyb2xsVmlldyA9IHJlcXVpcmUoJy4uL3NyYy9GbGV4U2Nyb2xsVmlldycpO1xuZmFtb3VzZmxleC5GbG93TGF5b3V0Tm9kZSA9IHJlcXVpcmUoJy4uL3NyYy9GbG93TGF5b3V0Tm9kZScpO1xuZmFtb3VzZmxleC5MYXlvdXRDb250ZXh0ID0gcmVxdWlyZSgnLi4vc3JjL0xheW91dENvbnRleHQnKTtcbmZhbW91c2ZsZXguTGF5b3V0Q29udHJvbGxlciA9IHJlcXVpcmUoJy4uL3NyYy9MYXlvdXRDb250cm9sbGVyJyk7XG5mYW1vdXNmbGV4LkxheW91dE5vZGUgPSByZXF1aXJlKCcuLi9zcmMvTGF5b3V0Tm9kZScpO1xuZmFtb3VzZmxleC5MYXlvdXROb2RlTWFuYWdlciA9IHJlcXVpcmUoJy4uL3NyYy9MYXlvdXROb2RlTWFuYWdlcicpO1xuZmFtb3VzZmxleC5MYXlvdXRVdGlsaXR5ID0gcmVxdWlyZSgnLi4vc3JjL0xheW91dFV0aWxpdHknKTtcbmZhbW91c2ZsZXguU2Nyb2xsQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL3NyYy9TY3JvbGxDb250cm9sbGVyJyk7XG5mYW1vdXNmbGV4LlZpcnR1YWxWaWV3U2VxdWVuY2UgPSByZXF1aXJlKCcuLi9zcmMvVmlydHVhbFZpZXdTZXF1ZW5jZScpO1xuZmFtb3VzZmxleC5BbmltYXRpb25Db250cm9sbGVyID0gcmVxdWlyZSgnLi4vc3JjL0FuaW1hdGlvbkNvbnRyb2xsZXInKTtcblxuZmFtb3VzZmxleC53aWRnZXRzID0gZmFtb3VzZmxleC53aWRnZXRzIHx8IHt9O1xuZmFtb3VzZmxleC53aWRnZXRzLkRhdGVQaWNrZXIgPSByZXF1aXJlKCcuLi9zcmMvd2lkZ2V0cy9EYXRlUGlja2VyJyk7XG5mYW1vdXNmbGV4LndpZGdldHMuVGFiQmFyID0gcmVxdWlyZSgnLi4vc3JjL3dpZGdldHMvVGFiQmFyJyk7XG5cbmZhbW91c2ZsZXgubGF5b3V0cyA9IGZhbW91c2ZsZXgubGF5b3V0cyB8fCB7fTtcbmZhbW91c2ZsZXgubGF5b3V0cy5Db2xsZWN0aW9uTGF5b3V0ID0gcmVxdWlyZSgnLi4vc3JjL2xheW91dHMvQ29sbGVjdGlvbkxheW91dCcpO1xuZmFtb3VzZmxleC5sYXlvdXRzLkNvdmVyTGF5b3V0ID0gcmVxdWlyZSgnLi4vc3JjL2xheW91dHMvQ292ZXJMYXlvdXQnKTtcbmZhbW91c2ZsZXgubGF5b3V0cy5DdWJlTGF5b3V0ID0gcmVxdWlyZSgnLi4vc3JjL2xheW91dHMvQ3ViZUxheW91dCcpO1xuZmFtb3VzZmxleC5sYXlvdXRzLkdyaWRMYXlvdXQgPSByZXF1aXJlKCcuLi9zcmMvbGF5b3V0cy9HcmlkTGF5b3V0Jyk7XG5mYW1vdXNmbGV4LmxheW91dHMuSGVhZGVyRm9vdGVyTGF5b3V0ID0gcmVxdWlyZSgnLi4vc3JjL2xheW91dHMvSGVhZGVyRm9vdGVyTGF5b3V0Jyk7XG5mYW1vdXNmbGV4LmxheW91dHMuTGlzdExheW91dCA9IHJlcXVpcmUoJy4uL3NyYy9sYXlvdXRzL0xpc3RMYXlvdXQnKTtcbmZhbW91c2ZsZXgubGF5b3V0cy5OYXZCYXJMYXlvdXQgPSByZXF1aXJlKCcuLi9zcmMvbGF5b3V0cy9OYXZCYXJMYXlvdXQnKTtcbmZhbW91c2ZsZXgubGF5b3V0cy5Qcm9wb3J0aW9uYWxMYXlvdXQgPSByZXF1aXJlKCcuLi9zcmMvbGF5b3V0cy9Qcm9wb3J0aW9uYWxMYXlvdXQnKTtcbmZhbW91c2ZsZXgubGF5b3V0cy5XaGVlbExheW91dCA9IHJlcXVpcmUoJy4uL3NyYy9sYXlvdXRzL1doZWVsTGF5b3V0Jyk7XG5cbmZhbW91c2ZsZXguaGVscGVycyA9IGZhbW91c2ZsZXguaGVscGVycyB8fCB7fTtcbmZhbW91c2ZsZXguaGVscGVycy5MYXlvdXREb2NrSGVscGVyID0gcmVxdWlyZSgnLi4vc3JjL2hlbHBlcnMvTGF5b3V0RG9ja0hlbHBlcicpO1xuIiwidmFyIFZpZXcgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5WaWV3IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuVmlldyA6IG51bGw7XG52YXIgTGF5b3V0Q29udHJvbGxlciA9IHJlcXVpcmUoJy4vTGF5b3V0Q29udHJvbGxlcicpO1xudmFyIFRyYW5zZm9ybSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IG51bGw7XG52YXIgTW9kaWZpZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5Nb2RpZmllciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLk1vZGlmaWVyIDogbnVsbDtcbnZhciBTdGF0ZU1vZGlmaWVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLm1vZGlmaWVycy5TdGF0ZU1vZGlmaWVyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLm1vZGlmaWVycy5TdGF0ZU1vZGlmaWVyIDogbnVsbDtcbnZhciBSZW5kZXJOb2RlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuUmVuZGVyTm9kZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlJlbmRlck5vZGUgOiBudWxsO1xudmFyIFRpbWVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5UaW1lciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVGltZXIgOiBudWxsO1xudmFyIEVhc2luZyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy50cmFuc2l0aW9ucy5FYXNpbmcgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudHJhbnNpdGlvbnMuRWFzaW5nIDogbnVsbDtcbmZ1bmN0aW9uIEFuaW1hdGlvbkNvbnRyb2xsZXIob3B0aW9ucykge1xuICAgIFZpZXcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBfY3JlYXRlTGF5b3V0LmNhbGwodGhpcyk7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cbn1cbkFuaW1hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShWaWV3LnByb3RvdHlwZSk7XG5BbmltYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEFuaW1hdGlvbkNvbnRyb2xsZXI7XG5BbmltYXRpb25Db250cm9sbGVyLkFuaW1hdGlvbiA9IHtcbiAgICBTbGlkZToge1xuICAgICAgICBMZWZ0OiBmdW5jdGlvbiAoc2hvdywgc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBUcmFuc2Zvcm0udHJhbnNsYXRlKHNob3cgPyBzaXplWzBdIDogLXNpemVbMF0sIDAsIDApIH07XG4gICAgICAgIH0sXG4gICAgICAgIFJpZ2h0OiBmdW5jdGlvbiAoc2hvdywgc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBUcmFuc2Zvcm0udHJhbnNsYXRlKHNob3cgPyAtc2l6ZVswXSA6IHNpemVbMF0sIDAsIDApIH07XG4gICAgICAgIH0sXG4gICAgICAgIFVwOiBmdW5jdGlvbiAoc2hvdywgc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBUcmFuc2Zvcm0udHJhbnNsYXRlKDAsIHNob3cgPyBzaXplWzFdIDogLXNpemVbMV0sIDApIH07XG4gICAgICAgIH0sXG4gICAgICAgIERvd246IGZ1bmN0aW9uIChzaG93LCBzaXplKSB7XG4gICAgICAgICAgICByZXR1cm4geyB0cmFuc2Zvcm06IFRyYW5zZm9ybS50cmFuc2xhdGUoMCwgc2hvdyA/IC1zaXplWzFdIDogc2l6ZVsxXSwgMCkgfTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgRmFkZTogZnVuY3Rpb24gKHNob3csIHNpemUsIG9wYWNpdHkpIHtcbiAgICAgICAgcmV0dXJuIHsgb3BhY2l0eTogb3BhY2l0eSA9PT0gdW5kZWZpbmVkID8gMCA6IG9wYWNpdHkgfTtcbiAgICB9LFxuICAgIFpvb206IGZ1bmN0aW9uIChzaG93LCBzaXplLCBzY2FsZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiBUcmFuc2Zvcm0uc2NhbGUoc2NhbGUgPyBzY2FsZVswXSA6IDAuNSwgc2NhbGUgPyBzY2FsZVsxXSA6IDAuNSwgMSksXG4gICAgICAgICAgICBhbGlnbjogW1xuICAgICAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgfVxufTtcbkFuaW1hdGlvbkNvbnRyb2xsZXIuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHRyYW5zaXRpb246IHtcbiAgICAgICAgZHVyYXRpb246IDQwMCxcbiAgICAgICAgY3VydmU6IEVhc2luZy5pbk91dFF1YWRcbiAgICB9LFxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uQ29udHJvbGxlci5BbmltYXRpb24uRmFkZSxcbiAgICBzaG93OiB7fSxcbiAgICBoaWRlOiB7fSxcbiAgICB0cmFuc2ZlcjogeyB6SW5kZXg6IDEwIH0sXG4gICAgekluZGV4T2Zmc2V0OiAwXG59O1xudmFyIEl0ZW1TdGF0ZSA9IHtcbiAgICAgICAgTk9ORTogMCxcbiAgICAgICAgSElERTogMSxcbiAgICAgICAgSElESU5HOiAyLFxuICAgICAgICBTSE9XOiAzLFxuICAgICAgICBTSE9XSU5HOiA0LFxuICAgICAgICBWSVNJQkxFOiA1LFxuICAgICAgICBRVUVVRUQ6IDZcbiAgICB9O1xuZnVuY3Rpb24gVmlld1N0YWNrTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2V0ID0ge1xuICAgICAgICAgICAgc2l6ZTogY29udGV4dC5zaXplLFxuICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcbiAgICB2YXIgdmlld3MgPSBjb250ZXh0LmdldCgndmlld3MnKTtcbiAgICB2YXIgdHJhbnNmZXJhYmxlcyA9IGNvbnRleHQuZ2V0KCd0cmFuc2ZlcmFibGVzJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLm1pbih2aWV3cy5sZW5ndGgsIDIpOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl92aWV3U3RhY2tbaV07XG4gICAgICAgIHN3aXRjaCAoaXRlbS5zdGF0ZSkge1xuICAgICAgICBjYXNlIEl0ZW1TdGF0ZS5ISURFOlxuICAgICAgICBjYXNlIEl0ZW1TdGF0ZS5ISURJTkc6XG4gICAgICAgIGNhc2UgSXRlbVN0YXRlLlZJU0lCTEU6XG4gICAgICAgIGNhc2UgSXRlbVN0YXRlLlNIT1c6XG4gICAgICAgIGNhc2UgSXRlbVN0YXRlLlNIT1dJTkc6XG4gICAgICAgICAgICB2YXIgdmlldyA9IHZpZXdzW2ldO1xuICAgICAgICAgICAgY29udGV4dC5zZXQodmlldywgc2V0KTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdHJhbnNmZXJhYmxlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgaXRlbS50cmFuc2ZlcmFibGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2ZlcmFibGVzW2pdLnJlbmRlck5vZGUgPT09IGl0ZW0udHJhbnNmZXJhYmxlc1trXS5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnNldCh0cmFuc2ZlcmFibGVzW2pdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldC50cmFuc2xhdGVbMl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5zaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnNpemVbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbMl0gKz0gb3B0aW9ucy56SW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIF9jcmVhdGVMYXlvdXQoKSB7XG4gICAgdGhpcy5fcmVuZGVyYWJsZXMgPSB7XG4gICAgICAgIHZpZXdzOiBbXSxcbiAgICAgICAgdHJhbnNmZXJhYmxlczogW11cbiAgICB9O1xuICAgIHRoaXMuX3ZpZXdTdGFjayA9IFtdO1xuICAgIHRoaXMubGF5b3V0ID0gbmV3IExheW91dENvbnRyb2xsZXIoe1xuICAgICAgICBsYXlvdXQ6IFZpZXdTdGFja0xheW91dC5iaW5kKHRoaXMpLFxuICAgICAgICBsYXlvdXRPcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGRhdGFTb3VyY2U6IHRoaXMuX3JlbmRlcmFibGVzXG4gICAgfSk7XG4gICAgdGhpcy5hZGQodGhpcy5sYXlvdXQpO1xuICAgIHRoaXMubGF5b3V0Lm9uKCdsYXlvdXRlbmQnLCBfc3RhcnRBbmltYXRpb25zLmJpbmQodGhpcykpO1xufVxuZnVuY3Rpb24gX2dldFZpZXdTcGVjKGl0ZW0sIHZpZXcsIGlkLCBjYWxsYmFjaykge1xuICAgIGlmICghaXRlbS52aWV3KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHNwZWMgPSB2aWV3LmdldFNwZWMoaWQpO1xuICAgIGlmIChzcGVjKSB7XG4gICAgICAgIGNhbGxiYWNrKHNwZWMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIFRpbWVyLmFmdGVyKF9nZXRWaWV3U3BlYy5iaW5kKHRoaXMsIGl0ZW0sIHZpZXcsIGlkLCBjYWxsYmFjayksIDEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9nZXRUcmFuc2ZlcmFibGUoaXRlbSwgdmlldywgaWQpIHtcbiAgICBpZiAodmlldy5nZXRUcmFuc2ZlcmFibGUpIHtcbiAgICAgICAgcmV0dXJuIHZpZXcuZ2V0VHJhbnNmZXJhYmxlKGlkKTtcbiAgICB9XG4gICAgaWYgKHZpZXcuZ2V0U3BlYyAmJiB2aWV3LmdldCAmJiB2aWV3LnJlcGxhY2UpIHtcbiAgICAgICAgaWYgKHZpZXcuZ2V0KGlkKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmlldy5nZXQoaWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2hvdzogZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5yZXBsYWNlKGlkLCByZW5kZXJhYmxlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGdldFNwZWM6IF9nZXRWaWV3U3BlYy5iaW5kKHRoaXMsIGl0ZW0sIHZpZXcsIGlkKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodmlldy5sYXlvdXQpIHtcbiAgICAgICAgcmV0dXJuIF9nZXRUcmFuc2ZlcmFibGUuY2FsbCh0aGlzLCBpdGVtLCB2aWV3LmxheW91dCwgaWQpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9zdGFydFRyYW5zZmVyYWJsZUFuaW1hdGlvbnMoaXRlbSwgcHJldkl0ZW0pIHtcbiAgICBmb3IgKHZhciBzb3VyY2VJZCBpbiBpdGVtLm9wdGlvbnMudHJhbnNmZXIuaXRlbXMpIHtcbiAgICAgICAgX3N0YXJ0VHJhbnNmZXJhYmxlQW5pbWF0aW9uLmNhbGwodGhpcywgaXRlbSwgcHJldkl0ZW0sIHNvdXJjZUlkKTtcbiAgICB9XG59XG5mdW5jdGlvbiBfc3RhcnRUcmFuc2ZlcmFibGVBbmltYXRpb24oaXRlbSwgcHJldkl0ZW0sIHNvdXJjZUlkKSB7XG4gICAgdmFyIHRhcmdldCA9IGl0ZW0ub3B0aW9ucy50cmFuc2Zlci5pdGVtc1tzb3VyY2VJZF07XG4gICAgdmFyIHRyYW5zZmVyYWJsZSA9IHt9O1xuICAgIHRyYW5zZmVyYWJsZS5zb3VyY2UgPSBfZ2V0VHJhbnNmZXJhYmxlLmNhbGwodGhpcywgcHJldkl0ZW0sIHByZXZJdGVtLnZpZXcsIHNvdXJjZUlkKTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0YXJnZXQpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0cmFuc2ZlcmFibGUudGFyZ2V0ID0gX2dldFRyYW5zZmVyYWJsZS5jYWxsKHRoaXMsIGl0ZW0sIGl0ZW0udmlldywgdGFyZ2V0W2ldKTtcbiAgICAgICAgICAgIGlmICh0cmFuc2ZlcmFibGUudGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0cmFuc2ZlcmFibGUudGFyZ2V0ID0gX2dldFRyYW5zZmVyYWJsZS5jYWxsKHRoaXMsIGl0ZW0sIGl0ZW0udmlldywgdGFyZ2V0KTtcbiAgICB9XG4gICAgaWYgKHRyYW5zZmVyYWJsZS5zb3VyY2UgJiYgdHJhbnNmZXJhYmxlLnRhcmdldCkge1xuICAgICAgICB0cmFuc2ZlcmFibGUuc291cmNlLmdldFNwZWMoZnVuY3Rpb24gKHNvdXJjZVNwZWMpIHtcbiAgICAgICAgICAgIHRyYW5zZmVyYWJsZS5vcmlnaW5hbFNvdXJjZSA9IHRyYW5zZmVyYWJsZS5zb3VyY2UuZ2V0KCk7XG4gICAgICAgICAgICB0cmFuc2ZlcmFibGUuc291cmNlLnNob3cobmV3IFJlbmRlck5vZGUobmV3IE1vZGlmaWVyKHNvdXJjZVNwZWMpKSk7XG4gICAgICAgICAgICB0cmFuc2ZlcmFibGUub3JpZ2luYWxUYXJnZXQgPSB0cmFuc2ZlcmFibGUudGFyZ2V0LmdldCgpO1xuICAgICAgICAgICAgdmFyIHRhcmdldE5vZGUgPSBuZXcgUmVuZGVyTm9kZShuZXcgTW9kaWZpZXIoeyBvcGFjaXR5OiAwIH0pKTtcbiAgICAgICAgICAgIHRhcmdldE5vZGUuYWRkKHRyYW5zZmVyYWJsZS5vcmlnaW5hbFRhcmdldCk7XG4gICAgICAgICAgICB0cmFuc2ZlcmFibGUudGFyZ2V0LnNob3codGFyZ2V0Tm9kZSk7XG4gICAgICAgICAgICB2YXIgekluZGV4TW9kID0gbmV3IE1vZGlmaWVyKHsgdHJhbnNmb3JtOiBUcmFuc2Zvcm0udHJhbnNsYXRlKDAsIDAsIGl0ZW0ub3B0aW9ucy50cmFuc2Zlci56SW5kZXgpIH0pO1xuICAgICAgICAgICAgdmFyIG1vZCA9IG5ldyBTdGF0ZU1vZGlmaWVyKHNvdXJjZVNwZWMpO1xuICAgICAgICAgICAgdHJhbnNmZXJhYmxlLnJlbmRlck5vZGUgPSBuZXcgUmVuZGVyTm9kZSh6SW5kZXhNb2QpO1xuICAgICAgICAgICAgdHJhbnNmZXJhYmxlLnJlbmRlck5vZGUuYWRkKG1vZCkuYWRkKHRyYW5zZmVyYWJsZS5vcmlnaW5hbFNvdXJjZSk7XG4gICAgICAgICAgICBpdGVtLnRyYW5zZmVyYWJsZXMucHVzaCh0cmFuc2ZlcmFibGUpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMudHJhbnNmZXJhYmxlcy5wdXNoKHRyYW5zZmVyYWJsZS5yZW5kZXJOb2RlKTtcbiAgICAgICAgICAgIHRoaXMubGF5b3V0LnJlZmxvd0xheW91dCgpO1xuICAgICAgICAgICAgVGltZXIuYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRyYW5zZmVyYWJsZS50YXJnZXQuZ2V0U3BlYyhmdW5jdGlvbiAodGFyZ2V0U3BlYywgdHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtb2QuaGFsdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlU3BlYy50cmFuc2Zvcm0gfHwgdGFyZ2V0U3BlYy50cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZC5zZXRUcmFuc2Zvcm0odGFyZ2V0U3BlYy50cmFuc2Zvcm0gfHwgVHJhbnNmb3JtLmlkZW50aXR5LCB0cmFuc2l0aW9uIHx8IGl0ZW0ub3B0aW9ucy50cmFuc2Zlci50cmFuc2l0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlU3BlYy5vcGFjaXR5ICE9PSB1bmRlZmluZWQgfHwgdGFyZ2V0U3BlYy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZC5zZXRPcGFjaXR5KHRhcmdldFNwZWMub3BhY2l0eSA9PT0gdW5kZWZpbmVkID8gMSA6IHRhcmdldFNwZWMub3BhY2l0eSwgdHJhbnNpdGlvbiB8fCBpdGVtLm9wdGlvbnMudHJhbnNmZXIudHJhbnNpdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZVNwZWMuc2l6ZSB8fCB0YXJnZXRTcGVjLnNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZC5zZXRTaXplKHRhcmdldFNwZWMuc2l6ZSB8fCBzb3VyY2VTcGVjLnNpemUsIHRyYW5zaXRpb24gfHwgaXRlbS5vcHRpb25zLnRyYW5zZmVyLnRyYW5zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gX2VuZFRyYW5zZmVyYWJsZUFuaW1hdGlvbnMoaXRlbSkge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgaXRlbS50cmFuc2ZlcmFibGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciB0cmFuc2ZlcmFibGUgPSBpdGVtLnRyYW5zZmVyYWJsZXNbal07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fcmVuZGVyYWJsZXMudHJhbnNmZXJhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3JlbmRlcmFibGVzLnRyYW5zZmVyYWJsZXNbaV0gPT09IHRyYW5zZmVyYWJsZS5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMudHJhbnNmZXJhYmxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdHJhbnNmZXJhYmxlLnNvdXJjZS5zaG93KHRyYW5zZmVyYWJsZS5vcmlnaW5hbFNvdXJjZSk7XG4gICAgICAgIHRyYW5zZmVyYWJsZS50YXJnZXQuc2hvdyh0cmFuc2ZlcmFibGUub3JpZ2luYWxUYXJnZXQpO1xuICAgIH1cbiAgICBpdGVtLnRyYW5zZmVyYWJsZXMgPSBbXTtcbiAgICB0aGlzLmxheW91dC5yZWZsb3dMYXlvdXQoKTtcbn1cbmZ1bmN0aW9uIF9zdGFydEFuaW1hdGlvbnMoZXZlbnQpIHtcbiAgICB2YXIgcHJldkl0ZW07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl92aWV3U3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl92aWV3U3RhY2tbaV07XG4gICAgICAgIHN3aXRjaCAoaXRlbS5zdGF0ZSkge1xuICAgICAgICBjYXNlIEl0ZW1TdGF0ZS5ISURFOlxuICAgICAgICAgICAgaXRlbS5zdGF0ZSA9IEl0ZW1TdGF0ZS5ISURJTkc7XG4gICAgICAgICAgICBfc3RhcnRBbmltYXRpb24uY2FsbCh0aGlzLCBpdGVtLCBwcmV2SXRlbSwgZXZlbnQuc2l6ZSwgZmFsc2UpO1xuICAgICAgICAgICAgX3VwZGF0ZVN0YXRlLmNhbGwodGhpcyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBJdGVtU3RhdGUuU0hPVzpcbiAgICAgICAgICAgIGl0ZW0uc3RhdGUgPSBJdGVtU3RhdGUuU0hPV0lORztcbiAgICAgICAgICAgIF9zdGFydEFuaW1hdGlvbi5jYWxsKHRoaXMsIGl0ZW0sIHByZXZJdGVtLCBldmVudC5zaXplLCB0cnVlKTtcbiAgICAgICAgICAgIF91cGRhdGVTdGF0ZS5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcHJldkl0ZW0gPSBpdGVtO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9zdGFydEFuaW1hdGlvbihpdGVtLCBwcmV2SXRlbSwgc2l6ZSwgc2hvdykge1xuICAgIHZhciBhbmltYXRpb24gPSBzaG93ID8gaXRlbS5vcHRpb25zLnNob3cuYW5pbWF0aW9uIDogaXRlbS5vcHRpb25zLmhpZGUuYW5pbWF0aW9uO1xuICAgIHZhciBzcGVjID0gYW5pbWF0aW9uID8gYW5pbWF0aW9uKHNob3csIHNpemUpIDoge307XG4gICAgaXRlbS5tb2QuaGFsdCgpO1xuICAgIHZhciBjYWxsYmFjaztcbiAgICBpZiAoc2hvdykge1xuICAgICAgICBjYWxsYmFjayA9IGl0ZW0uc2hvd0NhbGxiYWNrO1xuICAgICAgICBpZiAoc3BlYy50cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIGl0ZW0ubW9kLnNldFRyYW5zZm9ybShzcGVjLnRyYW5zZm9ybSk7XG4gICAgICAgICAgICBpdGVtLm1vZC5zZXRUcmFuc2Zvcm0oVHJhbnNmb3JtLmlkZW50aXR5LCBpdGVtLm9wdGlvbnMuc2hvdy50cmFuc2l0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3BlYy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGl0ZW0ubW9kLnNldE9wYWNpdHkoc3BlYy5vcGFjaXR5KTtcbiAgICAgICAgICAgIGl0ZW0ubW9kLnNldE9wYWNpdHkoMSwgaXRlbS5vcHRpb25zLnNob3cudHJhbnNpdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNwZWMuYWxpZ24pIHtcbiAgICAgICAgICAgIGl0ZW0ubW9kLnNldEFsaWduKHNwZWMuYWxpZ24pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzcGVjLm9yaWdpbikge1xuICAgICAgICAgICAgaXRlbS5tb2Quc2V0T3JpZ2luKHNwZWMub3JpZ2luKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldkl0ZW0pIHtcbiAgICAgICAgICAgIF9zdGFydFRyYW5zZmVyYWJsZUFuaW1hdGlvbnMuY2FsbCh0aGlzLCBpdGVtLCBwcmV2SXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2sgPSBpdGVtLmhpZGVDYWxsYmFjaztcbiAgICAgICAgaWYgKHNwZWMudHJhbnNmb3JtKSB7XG4gICAgICAgICAgICBpdGVtLm1vZC5zZXRUcmFuc2Zvcm0oc3BlYy50cmFuc2Zvcm0sIGl0ZW0ub3B0aW9ucy5oaWRlLnRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzcGVjLm9wYWNpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaXRlbS5tb2Quc2V0T3BhY2l0eShzcGVjLm9wYWNpdHksIGl0ZW0ub3B0aW9ucy5oaWRlLnRyYW5zaXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIF9jcmVhdGVJdGVtKHZpZXcsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICB2aWV3OiB2aWV3LFxuICAgICAgICAgICAgbW9kOiBuZXcgU3RhdGVNb2RpZmllcigpLFxuICAgICAgICAgICAgc3RhdGU6IEl0ZW1TdGF0ZS5RVUVVRUQsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgc2hvdzoge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0aGlzLm9wdGlvbnMuc2hvdy50cmFuc2l0aW9uIHx8IHRoaXMub3B0aW9ucy50cmFuc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IHRoaXMub3B0aW9ucy5zaG93LmFuaW1hdGlvbiB8fCB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBoaWRlOiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRoaXMub3B0aW9ucy5oaWRlLnRyYW5zaXRpb24gfHwgdGhpcy5vcHRpb25zLnRyYW5zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogdGhpcy5vcHRpb25zLmhpZGUuYW5pbWF0aW9uIHx8IHRoaXMub3B0aW9ucy5hbmltYXRpb25cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRyYW5zZmVyOiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IHRoaXMub3B0aW9ucy50cmFuc2Zlci50cmFuc2l0aW9uIHx8IHRoaXMub3B0aW9ucy50cmFuc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICBpdGVtczogdGhpcy5vcHRpb25zLnRyYW5zZmVyLml0ZW1zIHx8IHt9LFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IHRoaXMub3B0aW9ucy50cmFuc2Zlci56SW5kZXhcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgICAgICAgdHJhbnNmZXJhYmxlczogW11cbiAgICAgICAgfTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBpdGVtLm9wdGlvbnMuc2hvdy50cmFuc2l0aW9uID0gKG9wdGlvbnMuc2hvdyA/IG9wdGlvbnMuc2hvdy50cmFuc2l0aW9uIDogdW5kZWZpbmVkKSB8fCBvcHRpb25zLnRyYW5zaXRpb24gfHwgaXRlbS5vcHRpb25zLnNob3cudHJhbnNpdGlvbjtcbiAgICAgICAgaXRlbS5vcHRpb25zLnNob3cuYW5pbWF0aW9uID0gKG9wdGlvbnMuc2hvdyA/IG9wdGlvbnMuc2hvdy5hbmltYXRpb24gOiB1bmRlZmluZWQpIHx8IG9wdGlvbnMuYW5pbWF0aW9uIHx8IGl0ZW0ub3B0aW9ucy5zaG93LmFuaW1hdGlvbjtcbiAgICAgICAgaXRlbS5vcHRpb25zLnRyYW5zZmVyLnRyYW5zaXRpb24gPSAob3B0aW9ucy50cmFuc2ZlciA/IG9wdGlvbnMudHJhbnNmZXIudHJhbnNpdGlvbiA6IHVuZGVmaW5lZCkgfHwgb3B0aW9ucy50cmFuc2l0aW9uIHx8IGl0ZW0ub3B0aW9ucy50cmFuc2Zlci50cmFuc2l0aW9uO1xuICAgICAgICBpdGVtLm9wdGlvbnMudHJhbnNmZXIuaXRlbXMgPSAob3B0aW9ucy50cmFuc2ZlciA/IG9wdGlvbnMudHJhbnNmZXIuaXRlbXMgOiB1bmRlZmluZWQpIHx8IGl0ZW0ub3B0aW9ucy50cmFuc2Zlci5pdGVtcztcbiAgICAgICAgaXRlbS5vcHRpb25zLnRyYW5zZmVyLnpJbmRleCA9IG9wdGlvbnMudHJhbnNmZXIgJiYgb3B0aW9ucy50cmFuc2Zlci56SW5kZXggIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMudHJhbnNmZXIuekluZGV4IDogaXRlbS5vcHRpb25zLnRyYW5zZmVyLnpJbmRleDtcbiAgICB9XG4gICAgaXRlbS5ub2RlID0gbmV3IFJlbmRlck5vZGUoaXRlbS5tb2QpO1xuICAgIGl0ZW0ubm9kZS5hZGQodmlldyk7XG4gICAgcmV0dXJuIGl0ZW07XG59XG5mdW5jdGlvbiBfdXBkYXRlU3RhdGUoKSB7XG4gICAgdmFyIHByZXZJdGVtO1xuICAgIHZhciBpbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5taW4odGhpcy5fdmlld1N0YWNrLmxlbmd0aCwgMik7IGkrKykge1xuICAgICAgICB2YXIgaXRlbSA9IHRoaXMuX3ZpZXdTdGFja1tpXTtcbiAgICAgICAgaWYgKGl0ZW0uc3RhdGUgPT09IEl0ZW1TdGF0ZS5RVUVVRUQpIHtcbiAgICAgICAgICAgIGlmICghcHJldkl0ZW0gfHwgcHJldkl0ZW0uc3RhdGUgPT09IEl0ZW1TdGF0ZS5WSVNJQkxFIHx8IHByZXZJdGVtLnN0YXRlID09PSBJdGVtU3RhdGUuSElESU5HKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZJdGVtICYmIHByZXZJdGVtLnN0YXRlID09PSBJdGVtU3RhdGUuVklTSUJMRSkge1xuICAgICAgICAgICAgICAgICAgICBwcmV2SXRlbS5zdGF0ZSA9IEl0ZW1TdGF0ZS5ISURFO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpdGVtLnN0YXRlID0gSXRlbVN0YXRlLlNIT1c7XG4gICAgICAgICAgICAgICAgaW52YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS5zdGF0ZSA9PT0gSXRlbVN0YXRlLlZJU0lCTEUgJiYgaXRlbS5oaWRlKSB7XG4gICAgICAgICAgICBpdGVtLnN0YXRlID0gSXRlbVN0YXRlLkhJREU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGl0ZW0uc3RhdGUgPT09IEl0ZW1TdGF0ZS5TSE9XIHx8IGl0ZW0uc3RhdGUgPT09IEl0ZW1TdGF0ZS5ISURFKSB7XG4gICAgICAgICAgICB0aGlzLmxheW91dC5yZWZsb3dMYXlvdXQoKTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2SXRlbSA9IGl0ZW07XG4gICAgfVxuICAgIGlmIChpbnZhbGlkYXRlZCkge1xuICAgICAgICBfdXBkYXRlU3RhdGUuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5sYXlvdXQucmVmbG93TGF5b3V0KCk7XG4gICAgfVxufVxuQW5pbWF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uIChyZW5kZXJhYmxlLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGlmICghcmVuZGVyYWJsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5oaWRlKG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSB0aGlzLl92aWV3U3RhY2subGVuZ3RoID8gdGhpcy5fdmlld1N0YWNrW3RoaXMuX3ZpZXdTdGFjay5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAoaXRlbSAmJiBpdGVtLnZpZXcgPT09IHJlbmRlcmFibGUpIHtcbiAgICAgICAgaXRlbS5oaWRlID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAoaXRlbSAmJiBpdGVtLnN0YXRlICE9PSBJdGVtU3RhdGUuSElESU5HICYmIG9wdGlvbnMpIHtcbiAgICAgICAgaXRlbS5vcHRpb25zLmhpZGUudHJhbnNpdGlvbiA9IChvcHRpb25zLmhpZGUgPyBvcHRpb25zLmhpZGUudHJhbnNpdGlvbiA6IHVuZGVmaW5lZCkgfHwgb3B0aW9ucy50cmFuc2l0aW9uIHx8IGl0ZW0ub3B0aW9ucy5oaWRlLnRyYW5zaXRpb247XG4gICAgICAgIGl0ZW0ub3B0aW9ucy5oaWRlLmFuaW1hdGlvbiA9IChvcHRpb25zLmhpZGUgPyBvcHRpb25zLmhpZGUuYW5pbWF0aW9uIDogdW5kZWZpbmVkKSB8fCBvcHRpb25zLmFuaW1hdGlvbiB8fCBpdGVtLm9wdGlvbnMuaGlkZS5hbmltYXRpb247XG4gICAgfVxuICAgIGl0ZW0gPSBfY3JlYXRlSXRlbS5jYWxsKHRoaXMsIHJlbmRlcmFibGUsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICBpdGVtLnNob3dDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXRlbS5zdGF0ZSA9IEl0ZW1TdGF0ZS5WSVNJQkxFO1xuICAgICAgICBfdXBkYXRlU3RhdGUuY2FsbCh0aGlzKTtcbiAgICAgICAgX2VuZFRyYW5zZmVyYWJsZUFuaW1hdGlvbnMuY2FsbCh0aGlzLCBpdGVtKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIGl0ZW0uaGlkZUNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl92aWV3U3RhY2suaW5kZXhPZihpdGVtKTtcbiAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMudmlld3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5fdmlld1N0YWNrLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGl0ZW0udmlldyA9IHVuZGVmaW5lZDtcbiAgICAgICAgX3VwZGF0ZVN0YXRlLmNhbGwodGhpcyk7XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JlbmRlcmFibGVzLnZpZXdzLnB1c2goaXRlbS5ub2RlKTtcbiAgICB0aGlzLl92aWV3U3RhY2sucHVzaChpdGVtKTtcbiAgICBfdXBkYXRlU3RhdGUuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5BbmltYXRpb25Db250cm9sbGVyLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLl92aWV3U3RhY2subGVuZ3RoID8gdGhpcy5fdmlld1N0YWNrW3RoaXMuX3ZpZXdTdGFjay5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICBpZiAoIWl0ZW0gfHwgaXRlbS5zdGF0ZSA9PT0gSXRlbVN0YXRlLkhJRElORykge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBpdGVtLm9wdGlvbnMuaGlkZS50cmFuc2l0aW9uID0gKG9wdGlvbnMuaGlkZSA/IG9wdGlvbnMuaGlkZS50cmFuc2l0aW9uIDogdW5kZWZpbmVkKSB8fCBvcHRpb25zLnRyYW5zaXRpb24gfHwgaXRlbS5vcHRpb25zLmhpZGUudHJhbnNpdGlvbjtcbiAgICAgICAgaXRlbS5vcHRpb25zLmhpZGUuYW5pbWF0aW9uID0gKG9wdGlvbnMuaGlkZSA/IG9wdGlvbnMuaGlkZS5hbmltYXRpb24gOiB1bmRlZmluZWQpIHx8IG9wdGlvbnMuYW5pbWF0aW9uIHx8IGl0ZW0ub3B0aW9ucy5oaWRlLmFuaW1hdGlvbjtcbiAgICB9XG4gICAgaXRlbS5oaWRlQ2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuX3ZpZXdTdGFjay5pbmRleE9mKGl0ZW0pO1xuICAgICAgICB0aGlzLl9yZW5kZXJhYmxlcy52aWV3cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLl92aWV3U3RhY2suc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaXRlbS52aWV3ID0gdW5kZWZpbmVkO1xuICAgICAgICBfdXBkYXRlU3RhdGUuY2FsbCh0aGlzKTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpO1xuICAgIF91cGRhdGVTdGF0ZS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkFuaW1hdGlvbkNvbnRyb2xsZXIucHJvdG90eXBlLmhhbHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl92aWV3U3RhY2subGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLl92aWV3U3RhY2tbdGhpcy5fdmlld1N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoaXRlbS5zdGF0ZSA9PT0gSXRlbVN0YXRlLlFVRVVFRCB8fCBpdGVtLnN0YXRlID09PSBJdGVtU3RhdGUuU0hPVykge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMudmlld3Muc3BsaWNlKHRoaXMuX3ZpZXdTdGFjay5sZW5ndGggLSAxLCAxKTtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTdGFjay5zcGxpY2UodGhpcy5fdmlld1N0YWNrLmxlbmd0aCAtIDEsIDEpO1xuICAgICAgICAgICAgaXRlbS52aWV3ID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuQW5pbWF0aW9uQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fdmlld1N0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5fdmlld1N0YWNrW2ldO1xuICAgICAgICBpZiAoaXRlbS5zdGF0ZSA9PT0gSXRlbVN0YXRlLlZJU0lCTEUgfHwgaXRlbS5zdGF0ZSA9PT0gSXRlbVN0YXRlLlNIT1cgfHwgaXRlbS5zdGF0ZSA9PT0gSXRlbVN0YXRlLlNIT1dJTkcpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZpZXc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEFuaW1hdGlvbkNvbnRyb2xsZXI7IiwidmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbnZhciBTY3JvbGxDb250cm9sbGVyID0gcmVxdWlyZSgnLi9TY3JvbGxDb250cm9sbGVyJyk7XG52YXIgTGlzdExheW91dCA9IHJlcXVpcmUoJy4vbGF5b3V0cy9MaXN0TGF5b3V0Jyk7XG52YXIgUHVsbFRvUmVmcmVzaFN0YXRlID0ge1xuICAgICAgICBISURERU46IDAsXG4gICAgICAgIFBVTExJTkc6IDEsXG4gICAgICAgIEFDVElWRTogMixcbiAgICAgICAgQ09NUExFVEVEOiAzLFxuICAgICAgICBISURESU5HOiA0XG4gICAgfTtcbmZ1bmN0aW9uIEZsZXhTY3JvbGxWaWV3KG9wdGlvbnMpIHtcbiAgICBTY3JvbGxDb250cm9sbGVyLmNhbGwodGhpcywgTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyhGbGV4U2Nyb2xsVmlldy5ERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpKTtcbiAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhID0gMDtcbiAgICB0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhID0gMDtcbiAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSA9IDA7XG59XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlKTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZsZXhTY3JvbGxWaWV3O1xuRmxleFNjcm9sbFZpZXcuUHVsbFRvUmVmcmVzaFN0YXRlID0gUHVsbFRvUmVmcmVzaFN0YXRlO1xuRmxleFNjcm9sbFZpZXcuQm91bmRzID0gU2Nyb2xsQ29udHJvbGxlci5Cb3VuZHM7XG5GbGV4U2Nyb2xsVmlldy5QYWdpbmF0aW9uTW9kZSA9IFNjcm9sbENvbnRyb2xsZXIuUGFnaW5hdGlvbk1vZGU7XG5GbGV4U2Nyb2xsVmlldy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgbGF5b3V0OiBMaXN0TGF5b3V0LFxuICAgIGRpcmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIHBhZ2luYXRlZDogZmFsc2UsXG4gICAgYWxpZ25tZW50OiAwLFxuICAgIGZsb3c6IGZhbHNlLFxuICAgIG1vdXNlTW92ZTogZmFsc2UsXG4gICAgdXNlQ29udGFpbmVyOiBmYWxzZSxcbiAgICB2aXNpYmxlSXRlbVRocmVzc2hvbGQ6IDAuNSxcbiAgICBwdWxsVG9SZWZyZXNoSGVhZGVyOiB1bmRlZmluZWQsXG4gICAgcHVsbFRvUmVmcmVzaEZvb3RlcjogdW5kZWZpbmVkLFxuICAgIGxlYWRpbmdTY3JvbGxWaWV3OiB1bmRlZmluZWQsXG4gICAgdHJhaWxpbmdTY3JvbGxWaWV3OiB1bmRlZmluZWRcbn07XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zLnB1bGxUb1JlZnJlc2hIZWFkZXIgfHwgb3B0aW9ucy5wdWxsVG9SZWZyZXNoRm9vdGVyIHx8IHRoaXMuX3B1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMucHVsbFRvUmVmcmVzaEhlYWRlcikge1xuICAgICAgICAgICAgdGhpcy5fcHVsbFRvUmVmcmVzaCA9IHRoaXMuX3B1bGxUb1JlZnJlc2ggfHwgW1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3B1bGxUb1JlZnJlc2hbMF0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoWzBdID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTixcbiAgICAgICAgICAgICAgICAgICAgcHJldlN0YXRlOiBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOLFxuICAgICAgICAgICAgICAgICAgICBmb290ZXI6IGZhbHNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2hbMF0ubm9kZSA9IG9wdGlvbnMucHVsbFRvUmVmcmVzaEhlYWRlcjtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLnB1bGxUb1JlZnJlc2hIZWFkZXIgJiYgdGhpcy5fcHVsbFRvUmVmcmVzaCkge1xuICAgICAgICAgICAgdGhpcy5fcHVsbFRvUmVmcmVzaFswXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5wdWxsVG9SZWZyZXNoRm9vdGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoID0gdGhpcy5fcHVsbFRvUmVmcmVzaCB8fCBbXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fcHVsbFRvUmVmcmVzaFsxXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2hbMV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOLFxuICAgICAgICAgICAgICAgICAgICBwcmV2U3RhdGU6IFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU4sXG4gICAgICAgICAgICAgICAgICAgIGZvb3RlcjogdHJ1ZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoWzFdLm5vZGUgPSBvcHRpb25zLnB1bGxUb1JlZnJlc2hGb290ZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5wdWxsVG9SZWZyZXNoRm9vdGVyICYmIHRoaXMuX3B1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2hbMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3B1bGxUb1JlZnJlc2ggJiYgIXRoaXMuX3B1bGxUb1JlZnJlc2hbMF0gJiYgIXRoaXMuX3B1bGxUb1JlZnJlc2hbMV0pIHtcbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2ggPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLnNlcXVlbmNlRnJvbSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0RGF0YVNvdXJjZShub2RlKTtcbn07XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUuZ2V0Q3VycmVudEluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpdGVtID0gdGhpcy5nZXRGaXJzdFZpc2libGVJdGVtKCk7XG4gICAgcmV0dXJuIGl0ZW0gPyBpdGVtLnZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpIDogLTE7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdvVG9QYWdlID0gZnVuY3Rpb24gKGluZGV4LCBub0FuaW1hdGlvbikge1xuICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA8IGluZGV4KSB7XG4gICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgIGlmICghdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAodmlld1NlcXVlbmNlLmdldEluZGV4KCkgPiBpbmRleCkge1xuICAgICAgICB2aWV3U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUodmlld1NlcXVlbmNlLmdldCgpLCBub0FuaW1hdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdldE9mZnNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGU7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdldFBvc2l0aW9uID0gRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdldE9mZnNldDtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5nZXRBYnNvbHV0ZVBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAtKHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQpO1xufTtcbmZ1bmN0aW9uIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgc3RhdGUpIHtcbiAgICBpZiAocHVsbFRvUmVmcmVzaC5zdGF0ZSAhPT0gc3RhdGUpIHtcbiAgICAgICAgcHVsbFRvUmVmcmVzaC5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICBpZiAocHVsbFRvUmVmcmVzaC5ub2RlICYmIHB1bGxUb1JlZnJlc2gubm9kZS5zZXRQdWxsVG9SZWZyZXNoU3RhdHVzKSB7XG4gICAgICAgICAgICBwdWxsVG9SZWZyZXNoLm5vZGUuc2V0UHVsbFRvUmVmcmVzaFN0YXR1cyhzdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0UHVsbFRvUmVmcmVzaChmb290ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fcHVsbFRvUmVmcmVzaCA/IHRoaXMuX3B1bGxUb1JlZnJlc2hbZm9vdGVyID8gMSA6IDBdIDogdW5kZWZpbmVkO1xufVxuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLl9wb3N0TGF5b3V0ID0gZnVuY3Rpb24gKHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIGlmICghdGhpcy5fcHVsbFRvUmVmcmVzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgIHNjcm9sbE9mZnNldCArPSBzaXplW3RoaXMuX2RpcmVjdGlvbl07XG4gICAgfVxuICAgIHZhciBwcmV2SGVpZ2h0O1xuICAgIHZhciBuZXh0SGVpZ2h0O1xuICAgIHZhciB0b3RhbEhlaWdodDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICB2YXIgcHVsbFRvUmVmcmVzaCA9IHRoaXMuX3B1bGxUb1JlZnJlc2hbaV07XG4gICAgICAgIGlmIChwdWxsVG9SZWZyZXNoKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gcHVsbFRvUmVmcmVzaC5ub2RlLmdldFNpemUoKVt0aGlzLl9kaXJlY3Rpb25dO1xuICAgICAgICAgICAgdmFyIHB1bGxMZW5ndGggPSBwdWxsVG9SZWZyZXNoLm5vZGUuZ2V0UHVsbFRvUmVmcmVzaFNpemUgPyBwdWxsVG9SZWZyZXNoLm5vZGUuZ2V0UHVsbFRvUmVmcmVzaFNpemUoKVt0aGlzLl9kaXJlY3Rpb25dIDogbGVuZ3RoO1xuICAgICAgICAgICAgdmFyIG9mZnNldDtcbiAgICAgICAgICAgIGlmICghcHVsbFRvUmVmcmVzaC5mb290ZXIpIHtcbiAgICAgICAgICAgICAgICBwcmV2SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodChmYWxzZSk7XG4gICAgICAgICAgICAgICAgcHJldkhlaWdodCA9IHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBwcmV2SGVpZ2h0ID49IDAgPyBzY3JvbGxPZmZzZXQgLSBwcmV2SGVpZ2h0IDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEhlaWdodCA9IG5leHRIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogbmV4dEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxIZWlnaHQgPSBwcmV2SGVpZ2h0ID49IDAgJiYgbmV4dEhlaWdodCA+PSAwID8gcHJldkhlaWdodCArIG5leHRIZWlnaHQgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsSGVpZ2h0ID49IDAgJiYgdG90YWxIZWlnaHQgPCBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IE1hdGgucm91bmQoc2Nyb2xsT2Zmc2V0IC0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dICsgbmV4dEhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5leHRIZWlnaHQgPSBuZXh0SGVpZ2h0ID09PSB1bmRlZmluZWQgPyBuZXh0SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlKSA6IG5leHRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgbmV4dEhlaWdodCA9IG5leHRIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogbmV4dEhlaWdodDtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBuZXh0SGVpZ2h0ID49IDAgPyBzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0IDogc2l6ZVt0aGlzLl9kaXJlY3Rpb25dICsgMTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldkhlaWdodCA9IHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCA/IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQoZmFsc2UpIDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcHJldkhlaWdodCA9IHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxIZWlnaHQgPSBwcmV2SGVpZ2h0ID49IDAgJiYgbmV4dEhlaWdodCA+PSAwID8gcHJldkhlaWdodCArIG5leHRIZWlnaHQgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsSGVpZ2h0ID49IDAgJiYgdG90YWxIZWlnaHQgPCBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IE1hdGgucm91bmQoc2Nyb2xsT2Zmc2V0IC0gcHJldkhlaWdodCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gLShvZmZzZXQgLSBzaXplW3RoaXMuX2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZpc2libGVQZXJjID0gTWF0aC5tYXgoTWF0aC5taW4ob2Zmc2V0IC8gcHVsbExlbmd0aCwgMSksIDApO1xuICAgICAgICAgICAgc3dpdGNoIChwdWxsVG9SZWZyZXNoLnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU46XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2aXNpYmxlUGVyYyA+PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5BQ1RJVkUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCA+PSAwLjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLlBVTExJTkcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQdWxsVG9SZWZyZXNoU3RhdGUuUFVMTElORzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQgJiYgdmlzaWJsZVBlcmMgPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5BQ1RJVkUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0IDwgMC4yKSB7XG4gICAgICAgICAgICAgICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQdWxsVG9SZWZyZXNoU3RhdGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldCA+PSAwLjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERJTkcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERJTkc6XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldCA8IDAuMikge1xuICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwdWxsVG9SZWZyZXNoLnN0YXRlICE9PSBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHROb2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm9kZTogcHVsbFRvUmVmcmVzaC5ub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogIXB1bGxUb1JlZnJlc2guZm9vdGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDogcHVsbFRvUmVmcmVzaC5mb290ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogIXB1bGxUb1JlZnJlc2guZm9vdGVyID8gLS10aGlzLl9ub2Rlcy5fY29udGV4dFN0YXRlLnByZXZHZXRJbmRleCA6ICsrdGhpcy5fbm9kZXMuX2NvbnRleHRTdGF0ZS5uZXh0R2V0SW5kZXhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgICAgIGlmIChwdWxsVG9SZWZyZXNoLnN0YXRlID09PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aCA9IE1hdGgubWluKG9mZnNldCwgbGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHNldCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemVbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLTAuMDAxXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoOiBzY3JvbGxMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXQuc2l6ZVt0aGlzLl9kaXJlY3Rpb25dID0gTWF0aC5tYXgoTWF0aC5taW4ob2Zmc2V0LCBwdWxsTGVuZ3RoKSwgMCk7XG4gICAgICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVt0aGlzLl9kaXJlY3Rpb25dID0gcHVsbFRvUmVmcmVzaC5mb290ZXIgPyBzaXplW3RoaXMuX2RpcmVjdGlvbl0gLSBsZW5ndGggOiAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX25vZGVzLl9jb250ZXh0LnNldChjb250ZXh0Tm9kZSwgc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUuc2hvd1B1bGxUb1JlZnJlc2ggPSBmdW5jdGlvbiAoZm9vdGVyKSB7XG4gICAgdmFyIHB1bGxUb1JlZnJlc2ggPSBfZ2V0UHVsbFRvUmVmcmVzaC5jYWxsKHRoaXMsIGZvb3Rlcik7XG4gICAgaWYgKHB1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5ID0gdHJ1ZTtcbiAgICB9XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmhpZGVQdWxsVG9SZWZyZXNoID0gZnVuY3Rpb24gKGZvb3Rlcikge1xuICAgIHZhciBwdWxsVG9SZWZyZXNoID0gX2dldFB1bGxUb1JlZnJlc2guY2FsbCh0aGlzLCBmb290ZXIpO1xuICAgIGlmIChwdWxsVG9SZWZyZXNoICYmIHB1bGxUb1JlZnJlc2guc3RhdGUgPT09IFB1bGxUb1JlZnJlc2hTdGF0ZS5BQ1RJVkUpIHtcbiAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuQ09NUExFVEVEKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmlzUHVsbFRvUmVmcmVzaFZpc2libGUgPSBmdW5jdGlvbiAoZm9vdGVyKSB7XG4gICAgdmFyIHB1bGxUb1JlZnJlc2ggPSBfZ2V0UHVsbFRvUmVmcmVzaC5jYWxsKHRoaXMsIGZvb3Rlcik7XG4gICAgcmV0dXJuIHB1bGxUb1JlZnJlc2ggPyBwdWxsVG9SZWZyZXNoLnN0YXRlID09PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFIDogZmFsc2U7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmFwcGx5U2Nyb2xsRm9yY2UgPSBmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICB2YXIgbGVhZGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMubGVhZGluZ1Njcm9sbFZpZXc7XG4gICAgdmFyIHRyYWlsaW5nU2Nyb2xsVmlldyA9IHRoaXMub3B0aW9ucy50cmFpbGluZ1Njcm9sbFZpZXc7XG4gICAgaWYgKCFsZWFkaW5nU2Nyb2xsVmlldyAmJiAhdHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgIHJldHVybiBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5hcHBseVNjcm9sbEZvcmNlLmNhbGwodGhpcywgZGVsdGEpO1xuICAgIH1cbiAgICB2YXIgcGFydGlhbERlbHRhO1xuICAgIGlmIChkZWx0YSA8IDApIHtcbiAgICAgICAgaWYgKGxlYWRpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSBsZWFkaW5nU2Nyb2xsVmlldy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBsZWFkaW5nU2Nyb2xsVmlldy5hcHBseVNjcm9sbEZvcmNlKHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdGhpcy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy5hcHBseVNjcm9sbEZvcmNlKGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0cmFpbGluZ1Njcm9sbFZpZXcuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy5hcHBseVNjcm9sbEZvcmNlKHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlYWRpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0aGlzLmNhblNjcm9sbChkZWx0YSk7XG4gICAgICAgICAgICBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5hcHBseVNjcm9sbEZvcmNlLmNhbGwodGhpcywgcGFydGlhbERlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcuYXBwbHlTY3JvbGxGb3JjZShkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLnVwZGF0ZVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKHByZXZEZWx0YSwgbmV3RGVsdGEpIHtcbiAgICB2YXIgbGVhZGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMubGVhZGluZ1Njcm9sbFZpZXc7XG4gICAgdmFyIHRyYWlsaW5nU2Nyb2xsVmlldyA9IHRoaXMub3B0aW9ucy50cmFpbGluZ1Njcm9sbFZpZXc7XG4gICAgaWYgKCFsZWFkaW5nU2Nyb2xsVmlldyAmJiAhdHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgIHJldHVybiBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHByZXZEZWx0YSwgbmV3RGVsdGEpO1xuICAgIH1cbiAgICB2YXIgcGFydGlhbERlbHRhO1xuICAgIHZhciBkZWx0YSA9IG5ld0RlbHRhIC0gcHJldkRlbHRhO1xuICAgIGlmIChkZWx0YSA8IDApIHtcbiAgICAgICAgaWYgKGxlYWRpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSBsZWFkaW5nU2Nyb2xsVmlldy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArIHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhICs9IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhaWxpbmdTY3JvbGxWaWV3ICYmIGRlbHRhKSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0aGlzLmNhblNjcm9sbChkZWx0YSk7XG4gICAgICAgICAgICBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKyBwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSArPSBkZWx0YTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy51cGRhdGVTY3JvbGxGb3JjZSh0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKyBkZWx0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVsdGEpIHtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSArIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0cmFpbGluZ1Njcm9sbFZpZXcuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy51cGRhdGVTY3JvbGxGb3JjZSh0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKyBwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZWFkaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdGhpcy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICsgcGFydGlhbERlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKyBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5yZWxlYXNlU2Nyb2xsRm9yY2UgPSBmdW5jdGlvbiAoZGVsdGEsIHZlbG9jaXR5KSB7XG4gICAgdmFyIGxlYWRpbmdTY3JvbGxWaWV3ID0gdGhpcy5vcHRpb25zLmxlYWRpbmdTY3JvbGxWaWV3O1xuICAgIHZhciB0cmFpbGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMudHJhaWxpbmdTY3JvbGxWaWV3O1xuICAgIGlmICghbGVhZGluZ1Njcm9sbFZpZXcgJiYgIXRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICByZXR1cm4gU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgZGVsdGEsIHZlbG9jaXR5KTtcbiAgICB9XG4gICAgdmFyIHBhcnRpYWxEZWx0YTtcbiAgICBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICAgIGlmIChsZWFkaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gTWF0aC5tYXgodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBsZWFkaW5nU2Nyb2xsVmlldy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyAwIDogdmVsb2NpdHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFpbGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IE1hdGgubWF4KHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyAwIDogdmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgLT0gZGVsdGE7XG4gICAgICAgICAgICB0cmFpbGluZ1Njcm9sbFZpZXcucmVsZWFzZVNjcm9sbEZvcmNlKHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSA/IHZlbG9jaXR5IDogMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhIC09IGRlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyB2ZWxvY2l0eSA6IDApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gTWF0aC5taW4odGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEsIGRlbHRhID8gMCA6IHZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVhZGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IE1hdGgubWluKHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyAwIDogdmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSAtPSBkZWx0YTtcbiAgICAgICAgICAgIGxlYWRpbmdTY3JvbGxWaWV3LnJlbGVhc2VTY3JvbGxGb3JjZSh0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSA/IHZlbG9jaXR5IDogMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhIC09IGRlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSA/IHZlbG9jaXR5IDogMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmNvbW1pdC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuICAgIGlmICh0aGlzLl9wdWxsVG9SZWZyZXNoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcHVsbFRvUmVmcmVzaCA9IHRoaXMuX3B1bGxUb1JlZnJlc2hbaV07XG4gICAgICAgICAgICBpZiAocHVsbFRvUmVmcmVzaCkge1xuICAgICAgICAgICAgICAgIGlmIChwdWxsVG9SZWZyZXNoLnN0YXRlID09PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFICYmIHB1bGxUb1JlZnJlc2gucHJldlN0YXRlICE9PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlZnJlc2gnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb290ZXI6IHB1bGxUb1JlZnJlc2guZm9vdGVyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwdWxsVG9SZWZyZXNoLnByZXZTdGF0ZSA9IHB1bGxUb1JlZnJlc2guc3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEZsZXhTY3JvbGxWaWV3OyIsInZhciBPcHRpb25zTWFuYWdlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLk9wdGlvbnNNYW5hZ2VyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuT3B0aW9uc01hbmFnZXIgOiBudWxsO1xudmFyIFRyYW5zZm9ybSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IG51bGw7XG52YXIgVmVjdG9yID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLm1hdGguVmVjdG9yIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLm1hdGguVmVjdG9yIDogbnVsbDtcbnZhciBQYXJ0aWNsZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IG51bGw7XG52YXIgU3ByaW5nID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnBoeXNpY3MuZm9yY2VzLlNwcmluZyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLmZvcmNlcy5TcHJpbmcgOiBudWxsO1xudmFyIFBoeXNpY3NFbmdpbmUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMucGh5c2ljcy5QaHlzaWNzRW5naW5lIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnBoeXNpY3MuUGh5c2ljc0VuZ2luZSA6IG51bGw7XG52YXIgTGF5b3V0Tm9kZSA9IHJlcXVpcmUoJy4vTGF5b3V0Tm9kZScpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnRyYW5zaXRpb25zLlRyYW5zaXRpb25hYmxlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnRyYW5zaXRpb25zLlRyYW5zaXRpb25hYmxlIDogbnVsbDtcbmZ1bmN0aW9uIEZsb3dMYXlvdXROb2RlKHJlbmRlck5vZGUsIHNwZWMpIHtcbiAgICBMYXlvdXROb2RlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmNvbnN0cnVjdG9yLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMub3B0aW9ucyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fcGUpIHtcbiAgICAgICAgdGhpcy5fcGUgPSBuZXcgUGh5c2ljc0VuZ2luZSgpO1xuICAgICAgICB0aGlzLl9wZS5zbGVlcCgpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX3Byb3BlcnRpZXMpIHtcbiAgICAgICAgdGhpcy5fcHJvcGVydGllcyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIHRoaXMuX3Byb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXNbcHJvcE5hbWVdLmluaXQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZSkge1xuICAgICAgICB0aGlzLl9sb2NrVHJhbnNpdGlvbmFibGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLmhhbHQoKTtcbiAgICAgICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLnJlc2V0KDEpO1xuICAgIH1cbiAgICB0aGlzLl9zcGVjTW9kaWZpZWQgPSB0cnVlO1xuICAgIHRoaXMuX2luaXRpYWwgPSB0cnVlO1xuICAgIHRoaXMuX3NwZWMuZW5kU3RhdGUgPSB7fTtcbiAgICBpZiAoc3BlYykge1xuICAgICAgICB0aGlzLnNldFNwZWMoc3BlYyk7XG4gICAgfVxufVxuRmxvd0xheW91dE5vZGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShMYXlvdXROb2RlLnByb3RvdHlwZSk7XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBGbG93TGF5b3V0Tm9kZTtcbkZsb3dMYXlvdXROb2RlLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBzcHJpbmc6IHtcbiAgICAgICAgZGFtcGluZ1JhdGlvOiAwLjgsXG4gICAgICAgIHBlcmlvZDogMzAwXG4gICAgfSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG9wYWNpdHk6IHRydWUsXG4gICAgICAgIGFsaWduOiB0cnVlLFxuICAgICAgICBvcmlnaW46IHRydWUsXG4gICAgICAgIHNpemU6IHRydWUsXG4gICAgICAgIHRyYW5zbGF0ZTogdHJ1ZSxcbiAgICAgICAgc2tldzogdHJ1ZSxcbiAgICAgICAgcm90YXRlOiB0cnVlLFxuICAgICAgICBzY2FsZTogdHJ1ZVxuICAgIH0sXG4gICAgcGFydGljbGVSb3VuZGluZzogMC4wMDFcbn07XG52YXIgREVGQVVMVCA9IHtcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgb3BhY2l0eTJEOiBbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBzY2FsZTogW1xuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNrZXc6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdXG4gICAgfTtcbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIHZhciB3YXNTbGVlcGluZyA9IHRoaXMuX3BlLmlzU2xlZXBpbmcoKTtcbiAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiB0aGlzLl9wcm9wZXJ0aWVzKSB7XG4gICAgICAgIHZhciBwcm9wID0gdGhpcy5fcHJvcGVydGllc1twcm9wTmFtZV07XG4gICAgICAgIGlmIChvcHRpb25zLnNwcmluZyAmJiBwcm9wLmZvcmNlKSB7XG4gICAgICAgICAgICBwcm9wLmZvcmNlLnNldE9wdGlvbnModGhpcy5vcHRpb25zLnNwcmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMucHJvcGVydGllcyAmJiBvcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucHJvcGVydGllc1twcm9wTmFtZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcHJvcC5lbmFibGVkID0gdGhpcy5vcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9wLmVuYWJsZWQgPSBbXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucHJvcGVydGllc1twcm9wTmFtZV1cbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh3YXNTbGVlcGluZykge1xuICAgICAgICB0aGlzLl9wZS5zbGVlcCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUuc2V0U3BlYyA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICAgdmFyIHNldDtcbiAgICBpZiAoc3BlYy50cmFuc2Zvcm0pIHtcbiAgICAgICAgc2V0ID0gVHJhbnNmb3JtLmludGVycHJldChzcGVjLnRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGlmICghc2V0KSB7XG4gICAgICAgIHNldCA9IHt9O1xuICAgIH1cbiAgICBzZXQub3BhY2l0eSA9IHNwZWMub3BhY2l0eTtcbiAgICBzZXQuc2l6ZSA9IHNwZWMuc2l6ZTtcbiAgICBzZXQuYWxpZ24gPSBzcGVjLmFsaWduO1xuICAgIHNldC5vcmlnaW4gPSBzcGVjLm9yaWdpbjtcbiAgICB2YXIgb2xkUmVtb3ZpbmcgPSB0aGlzLl9yZW1vdmluZztcbiAgICB2YXIgb2xkSW52YWxpZGF0ZWQgPSB0aGlzLl9pbnZhbGlkYXRlZDtcbiAgICB0aGlzLnNldChzZXQpO1xuICAgIHRoaXMuX3JlbW92aW5nID0gb2xkUmVtb3Zpbmc7XG4gICAgdGhpcy5faW52YWxpZGF0ZWQgPSBvbGRJbnZhbGlkYXRlZDtcbn07XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2ludmFsaWRhdGVkKSB7XG4gICAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIHRoaXMuX3Byb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXNbcHJvcE5hbWVdLmludmFsaWRhdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy50cnVlU2l6ZVJlcXVlc3RlZCA9IGZhbHNlO1xuICAgIHRoaXMudXNlc1RydWVTaXplID0gZmFsc2U7XG59O1xuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChyZW1vdmVTcGVjKSB7XG4gICAgdGhpcy5fcmVtb3ZpbmcgPSB0cnVlO1xuICAgIGlmIChyZW1vdmVTcGVjKSB7XG4gICAgICAgIHRoaXMuc2V0U3BlYyhyZW1vdmVTcGVjKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wZS5zbGVlcCgpO1xuICAgICAgICB0aGlzLl9zcGVjTW9kaWZpZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5faW52YWxpZGF0ZWQgPSBmYWxzZTtcbn07XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUucmVsZWFzZUxvY2sgPSBmdW5jdGlvbiAoZW5hYmxlKSB7XG4gICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLmhhbHQoKTtcbiAgICB0aGlzLl9sb2NrVHJhbnNpdGlvbmFibGUucmVzZXQoMCk7XG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgICB0aGlzLl9sb2NrVHJhbnNpdGlvbmFibGUuc2V0KDEsIHsgZHVyYXRpb246IHRoaXMub3B0aW9ucy5zcHJpbmcucGVyaW9kIHx8IDEwMDAgfSk7XG4gICAgfVxufTtcbmZ1bmN0aW9uIF9nZXRSb3VuZGVkVmFsdWUzRChwcm9wLCBkZWYsIHByZWNpc2lvbiwgbG9ja1ZhbHVlKSB7XG4gICAgaWYgKCFwcm9wIHx8ICFwcm9wLmluaXQpIHtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgICAgcHJvcC5lbmFibGVkWzBdID8gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS54ICsgKHByb3AuZW5kU3RhdGUueCAtIHByb3AuY3VyU3RhdGUueCkgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbiA6IHByb3AuZW5kU3RhdGUueCxcbiAgICAgICAgcHJvcC5lbmFibGVkWzFdID8gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS55ICsgKHByb3AuZW5kU3RhdGUueSAtIHByb3AuY3VyU3RhdGUueSkgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbiA6IHByb3AuZW5kU3RhdGUueSxcbiAgICAgICAgcHJvcC5lbmFibGVkWzJdID8gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS56ICsgKHByb3AuZW5kU3RhdGUueiAtIHByb3AuY3VyU3RhdGUueikgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbiA6IHByb3AuZW5kU3RhdGUuelxuICAgIF07XG59XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUuZ2V0U3BlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZW5kU3RhdGVSZWFjaGVkID0gdGhpcy5fcGUuaXNTbGVlcGluZygpO1xuICAgIGlmICghdGhpcy5fc3BlY01vZGlmaWVkICYmIGVuZFN0YXRlUmVhY2hlZCkge1xuICAgICAgICB0aGlzLl9zcGVjLnJlbW92ZWQgPSAhdGhpcy5faW52YWxpZGF0ZWQ7XG4gICAgICAgIHJldHVybiB0aGlzLl9zcGVjO1xuICAgIH1cbiAgICB0aGlzLl9pbml0aWFsID0gZmFsc2U7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gIWVuZFN0YXRlUmVhY2hlZDtcbiAgICB0aGlzLl9zcGVjLnJlbW92ZWQgPSBmYWxzZTtcbiAgICBpZiAoIWVuZFN0YXRlUmVhY2hlZCkge1xuICAgICAgICB0aGlzLl9wZS5zdGVwKCk7XG4gICAgfVxuICAgIHZhciBzcGVjID0gdGhpcy5fc3BlYztcbiAgICB2YXIgcHJlY2lzaW9uID0gdGhpcy5vcHRpb25zLnBhcnRpY2xlUm91bmRpbmc7XG4gICAgdmFyIGxvY2tWYWx1ZSA9IHRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZS5nZXQoKTtcbiAgICB2YXIgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMub3BhY2l0eTtcbiAgICBpZiAocHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgc3BlYy5vcGFjaXR5ID0gcHJvcC5lbmFibGVkWzBdID8gTWF0aC5yb3VuZChNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBwcm9wLmN1clN0YXRlLngpKSAvIHByZWNpc2lvbikgKiBwcmVjaXNpb24gOiBwcm9wLmVuZFN0YXRlLng7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUub3BhY2l0eSA9IHByb3AuZW5kU3RhdGUueDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLm9wYWNpdHkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUub3BhY2l0eSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuc2l6ZTtcbiAgICBpZiAocHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgc3BlYy5zaXplID0gc3BlYy5zaXplIHx8IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIHNwZWMuc2l6ZVswXSA9IHByb3AuZW5hYmxlZFswXSA/IE1hdGgucm91bmQoKHByb3AuY3VyU3RhdGUueCArIChwcm9wLmVuZFN0YXRlLnggLSBwcm9wLmN1clN0YXRlLngpICogbG9ja1ZhbHVlKSAvIDAuMSkgKiAwLjEgOiBwcm9wLmVuZFN0YXRlLng7XG4gICAgICAgIHNwZWMuc2l6ZVsxXSA9IHByb3AuZW5hYmxlZFsxXSA/IE1hdGgucm91bmQoKHByb3AuY3VyU3RhdGUueSArIChwcm9wLmVuZFN0YXRlLnkgLSBwcm9wLmN1clN0YXRlLnkpICogbG9ja1ZhbHVlKSAvIDAuMSkgKiAwLjEgOiBwcm9wLmVuZFN0YXRlLnk7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUuc2l6ZSA9IHNwZWMuZW5kU3RhdGUuc2l6ZSB8fCBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgICAgICBzcGVjLmVuZFN0YXRlLnNpemVbMF0gPSBwcm9wLmVuZFN0YXRlLng7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUuc2l6ZVsxXSA9IHByb3AuZW5kU3RhdGUueTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLnNpemUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUuc2l6ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuYWxpZ247XG4gICAgaWYgKHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIHNwZWMuYWxpZ24gPSBzcGVjLmFsaWduIHx8IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIHNwZWMuYWxpZ25bMF0gPSBwcm9wLmVuYWJsZWRbMF0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnggKyAocHJvcC5lbmRTdGF0ZS54IC0gcHJvcC5jdXJTdGF0ZS54KSAqIGxvY2tWYWx1ZSkgLyAwLjEpICogMC4xIDogcHJvcC5lbmRTdGF0ZS54O1xuICAgICAgICBzcGVjLmFsaWduWzFdID0gcHJvcC5lbmFibGVkWzFdID8gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS55ICsgKHByb3AuZW5kU3RhdGUueSAtIHByb3AuY3VyU3RhdGUueSkgKiBsb2NrVmFsdWUpIC8gMC4xKSAqIDAuMSA6IHByb3AuZW5kU3RhdGUueTtcbiAgICAgICAgc3BlYy5lbmRTdGF0ZS5hbGlnbiA9IHNwZWMuZW5kU3RhdGUuYWxpZ24gfHwgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgc3BlYy5lbmRTdGF0ZS5hbGlnblswXSA9IHByb3AuZW5kU3RhdGUueDtcbiAgICAgICAgc3BlYy5lbmRTdGF0ZS5hbGlnblsxXSA9IHByb3AuZW5kU3RhdGUueTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLmFsaWduID0gdW5kZWZpbmVkO1xuICAgICAgICBzcGVjLmVuZFN0YXRlLmFsaWduID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5vcmlnaW47XG4gICAgaWYgKHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIHNwZWMub3JpZ2luID0gc3BlYy5vcmlnaW4gfHwgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgc3BlYy5vcmlnaW5bMF0gPSBwcm9wLmVuYWJsZWRbMF0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnggKyAocHJvcC5lbmRTdGF0ZS54IC0gcHJvcC5jdXJTdGF0ZS54KSAqIGxvY2tWYWx1ZSkgLyAwLjEpICogMC4xIDogcHJvcC5lbmRTdGF0ZS54O1xuICAgICAgICBzcGVjLm9yaWdpblsxXSA9IHByb3AuZW5hYmxlZFsxXSA/IE1hdGgucm91bmQoKHByb3AuY3VyU3RhdGUueSArIChwcm9wLmVuZFN0YXRlLnkgLSBwcm9wLmN1clN0YXRlLnkpICogbG9ja1ZhbHVlKSAvIDAuMSkgKiAwLjEgOiBwcm9wLmVuZFN0YXRlLnk7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUub3JpZ2luID0gc3BlYy5lbmRTdGF0ZS5vcmlnaW4gfHwgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgc3BlYy5lbmRTdGF0ZS5vcmlnaW5bMF0gPSBwcm9wLmVuZFN0YXRlLng7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUub3JpZ2luWzFdID0gcHJvcC5lbmRTdGF0ZS55O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwZWMub3JpZ2luID0gdW5kZWZpbmVkO1xuICAgICAgICBzcGVjLmVuZFN0YXRlLm9yaWdpbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIHRyYW5zbGF0ZSA9IHRoaXMuX3Byb3BlcnRpZXMudHJhbnNsYXRlO1xuICAgIHZhciB0cmFuc2xhdGVYO1xuICAgIHZhciB0cmFuc2xhdGVZO1xuICAgIHZhciB0cmFuc2xhdGVaO1xuICAgIGlmICh0cmFuc2xhdGUgJiYgdHJhbnNsYXRlLmluaXQpIHtcbiAgICAgICAgdHJhbnNsYXRlWCA9IHRyYW5zbGF0ZS5lbmFibGVkWzBdID8gTWF0aC5yb3VuZCgodHJhbnNsYXRlLmN1clN0YXRlLnggKyAodHJhbnNsYXRlLmVuZFN0YXRlLnggLSB0cmFuc2xhdGUuY3VyU3RhdGUueCkgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbiA6IHRyYW5zbGF0ZS5lbmRTdGF0ZS54O1xuICAgICAgICB0cmFuc2xhdGVZID0gdHJhbnNsYXRlLmVuYWJsZWRbMV0gPyBNYXRoLnJvdW5kKCh0cmFuc2xhdGUuY3VyU3RhdGUueSArICh0cmFuc2xhdGUuZW5kU3RhdGUueSAtIHRyYW5zbGF0ZS5jdXJTdGF0ZS55KSAqIGxvY2tWYWx1ZSkgLyBwcmVjaXNpb24pICogcHJlY2lzaW9uIDogdHJhbnNsYXRlLmVuZFN0YXRlLnk7XG4gICAgICAgIHRyYW5zbGF0ZVogPSB0cmFuc2xhdGUuZW5hYmxlZFsyXSA/IE1hdGgucm91bmQoKHRyYW5zbGF0ZS5jdXJTdGF0ZS56ICsgKHRyYW5zbGF0ZS5lbmRTdGF0ZS56IC0gdHJhbnNsYXRlLmN1clN0YXRlLnopICogbG9ja1ZhbHVlKSAvIHByZWNpc2lvbikgKiBwcmVjaXNpb24gOiB0cmFuc2xhdGUuZW5kU3RhdGUuejtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0cmFuc2xhdGVYID0gMDtcbiAgICAgICAgdHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRyYW5zbGF0ZVogPSAwO1xuICAgIH1cbiAgICB2YXIgc2NhbGUgPSB0aGlzLl9wcm9wZXJ0aWVzLnNjYWxlO1xuICAgIHZhciBza2V3ID0gdGhpcy5fcHJvcGVydGllcy5za2V3O1xuICAgIHZhciByb3RhdGUgPSB0aGlzLl9wcm9wZXJ0aWVzLnJvdGF0ZTtcbiAgICBpZiAoc2NhbGUgfHwgc2tldyB8fCByb3RhdGUpIHtcbiAgICAgICAgc3BlYy50cmFuc2Zvcm0gPSBUcmFuc2Zvcm0uYnVpbGQoe1xuICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlWCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVZLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVpcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBza2V3OiBfZ2V0Um91bmRlZFZhbHVlM0QuY2FsbCh0aGlzLCBza2V3LCBERUZBVUxULnNrZXcsIHRoaXMub3B0aW9ucy5wYXJ0aWNsZVJvdW5kaW5nLCBsb2NrVmFsdWUpLFxuICAgICAgICAgICAgc2NhbGU6IF9nZXRSb3VuZGVkVmFsdWUzRC5jYWxsKHRoaXMsIHNjYWxlLCBERUZBVUxULnNjYWxlLCB0aGlzLm9wdGlvbnMucGFydGljbGVSb3VuZGluZywgbG9ja1ZhbHVlKSxcbiAgICAgICAgICAgIHJvdGF0ZTogX2dldFJvdW5kZWRWYWx1ZTNELmNhbGwodGhpcywgcm90YXRlLCBERUZBVUxULnJvdGF0ZSwgdGhpcy5vcHRpb25zLnBhcnRpY2xlUm91bmRpbmcsIGxvY2tWYWx1ZSlcbiAgICAgICAgfSk7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUudHJhbnNmb3JtID0gVHJhbnNmb3JtLmJ1aWxkKHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogdHJhbnNsYXRlID8gW1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZS5lbmRTdGF0ZS54LFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZS5lbmRTdGF0ZS55LFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZS5lbmRTdGF0ZS56XG4gICAgICAgICAgICBdIDogREVGQVVMVC50cmFuc2xhdGUsXG4gICAgICAgICAgICBzY2FsZTogc2NhbGUgPyBbXG4gICAgICAgICAgICAgICAgc2NhbGUuZW5kU3RhdGUueCxcbiAgICAgICAgICAgICAgICBzY2FsZS5lbmRTdGF0ZS55LFxuICAgICAgICAgICAgICAgIHNjYWxlLmVuZFN0YXRlLnpcbiAgICAgICAgICAgIF0gOiBERUZBVUxULnNjYWxlLFxuICAgICAgICAgICAgc2tldzogc2tldyA/IFtcbiAgICAgICAgICAgICAgICBza2V3LmVuZFN0YXRlLngsXG4gICAgICAgICAgICAgICAgc2tldy5lbmRTdGF0ZS55LFxuICAgICAgICAgICAgICAgIHNrZXcuZW5kU3RhdGUuelxuICAgICAgICAgICAgXSA6IERFRkFVTFQuc2tldyxcbiAgICAgICAgICAgIHJvdGF0ZTogcm90YXRlID8gW1xuICAgICAgICAgICAgICAgIHJvdGF0ZS5lbmRTdGF0ZS54LFxuICAgICAgICAgICAgICAgIHJvdGF0ZS5lbmRTdGF0ZS55LFxuICAgICAgICAgICAgICAgIHJvdGF0ZS5lbmRTdGF0ZS56XG4gICAgICAgICAgICBdIDogREVGQVVMVC5yb3RhdGVcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0cmFuc2xhdGUpIHtcbiAgICAgICAgaWYgKCFzcGVjLnRyYW5zZm9ybSkge1xuICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm0gPSBUcmFuc2Zvcm0udHJhbnNsYXRlKHRyYW5zbGF0ZVgsIHRyYW5zbGF0ZVksIHRyYW5zbGF0ZVopO1xuICAgICAgICAgICAgc3BlYy5lbmRTdGF0ZS50cmFuc2Zvcm0gPSBUcmFuc2Zvcm0udHJhbnNsYXRlKHRyYW5zbGF0ZS5lbmRTdGF0ZS54LCB0cmFuc2xhdGUuZW5kU3RhdGUueSwgdHJhbnNsYXRlLmVuZFN0YXRlLnopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm1bMTJdID0gdHJhbnNsYXRlWDtcbiAgICAgICAgICAgIHNwZWMudHJhbnNmb3JtWzEzXSA9IHRyYW5zbGF0ZVk7XG4gICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxNF0gPSB0cmFuc2xhdGVaO1xuICAgICAgICAgICAgc3BlYy5lbmRTdGF0ZS50cmFuc2Zvcm1bMTJdID0gdHJhbnNsYXRlLmVuZFN0YXRlLng7XG4gICAgICAgICAgICBzcGVjLmVuZFN0YXRlLnRyYW5zZm9ybVsxM10gPSB0cmFuc2xhdGUuZW5kU3RhdGUueTtcbiAgICAgICAgICAgIHNwZWMuZW5kU3RhdGUudHJhbnNmb3JtWzE0XSA9IHRyYW5zbGF0ZS5lbmRTdGF0ZS56O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BlYy50cmFuc2Zvcm0gPSB1bmRlZmluZWQ7XG4gICAgICAgIHNwZWMuZW5kU3RhdGUudHJhbnNmb3JtID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3BlYztcbn07XG5mdW5jdGlvbiBfc2V0UHJvcGVydHlWYWx1ZShwcm9wLCBwcm9wTmFtZSwgZW5kU3RhdGUsIGRlZmF1bHRWYWx1ZSwgaW1tZWRpYXRlLCBpc1RyYW5zbGF0ZSkge1xuICAgIHByb3AgPSBwcm9wIHx8IHRoaXMuX3Byb3BlcnRpZXNbcHJvcE5hbWVdO1xuICAgIGlmIChwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBwcm9wLmludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHZhbHVlID0gZGVmYXVsdFZhbHVlO1xuICAgICAgICBpZiAoZW5kU3RhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSBlbmRTdGF0ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZW1vdmluZykge1xuICAgICAgICAgICAgdmFsdWUgPSBwcm9wLnBhcnRpY2xlLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvcC5lbmRTdGF0ZS54ID0gdmFsdWVbMF07XG4gICAgICAgIHByb3AuZW5kU3RhdGUueSA9IHZhbHVlLmxlbmd0aCA+IDEgPyB2YWx1ZVsxXSA6IDA7XG4gICAgICAgIHByb3AuZW5kU3RhdGUueiA9IHZhbHVlLmxlbmd0aCA+IDIgPyB2YWx1ZVsyXSA6IDA7XG4gICAgICAgIGlmIChpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHByb3AuY3VyU3RhdGUueCA9IHByb3AuZW5kU3RhdGUueDtcbiAgICAgICAgICAgIHByb3AuY3VyU3RhdGUueSA9IHByb3AuZW5kU3RhdGUueTtcbiAgICAgICAgICAgIHByb3AuY3VyU3RhdGUueiA9IHByb3AuZW5kU3RhdGUuejtcbiAgICAgICAgICAgIHByb3AudmVsb2NpdHkueCA9IDA7XG4gICAgICAgICAgICBwcm9wLnZlbG9jaXR5LnkgPSAwO1xuICAgICAgICAgICAgcHJvcC52ZWxvY2l0eS56ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wLmVuZFN0YXRlLnggIT09IHByb3AuY3VyU3RhdGUueCB8fCBwcm9wLmVuZFN0YXRlLnkgIT09IHByb3AuY3VyU3RhdGUueSB8fCBwcm9wLmVuZFN0YXRlLnogIT09IHByb3AuY3VyU3RhdGUueikge1xuICAgICAgICAgICAgdGhpcy5fcGUud2FrZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgd2FzU2xlZXBpbmcgPSB0aGlzLl9wZS5pc1NsZWVwaW5nKCk7XG4gICAgICAgIGlmICghcHJvcCkge1xuICAgICAgICAgICAgcHJvcCA9IHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZTogbmV3IFBhcnRpY2xlKHsgcG9zaXRpb246IHRoaXMuX2luaXRpYWwgfHwgaW1tZWRpYXRlID8gZW5kU3RhdGUgOiBkZWZhdWx0VmFsdWUgfSksXG4gICAgICAgICAgICAgICAgZW5kU3RhdGU6IG5ldyBWZWN0b3IoZW5kU3RhdGUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcHJvcC5jdXJTdGF0ZSA9IHByb3AucGFydGljbGUucG9zaXRpb247XG4gICAgICAgICAgICBwcm9wLnZlbG9jaXR5ID0gcHJvcC5wYXJ0aWNsZS52ZWxvY2l0eTtcbiAgICAgICAgICAgIHByb3AuZm9yY2UgPSBuZXcgU3ByaW5nKHRoaXMub3B0aW9ucy5zcHJpbmcpO1xuICAgICAgICAgICAgcHJvcC5mb3JjZS5zZXRPcHRpb25zKHsgYW5jaG9yOiBwcm9wLmVuZFN0YXRlIH0pO1xuICAgICAgICAgICAgdGhpcy5fcGUuYWRkQm9keShwcm9wLnBhcnRpY2xlKTtcbiAgICAgICAgICAgIHByb3AuZm9yY2VJZCA9IHRoaXMuX3BlLmF0dGFjaChwcm9wLmZvcmNlLCBwcm9wLnBhcnRpY2xlKTtcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXNbcHJvcE5hbWVdID0gcHJvcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3AucGFydGljbGUuc2V0UG9zaXRpb24odGhpcy5faW5pdGlhbCB8fCBpbW1lZGlhdGUgPyBlbmRTdGF0ZSA6IGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgICAgICBwcm9wLmVuZFN0YXRlLnNldChlbmRTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsICYmICFpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3BlLndha2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICh3YXNTbGVlcGluZykge1xuICAgICAgICAgICAgdGhpcy5fcGUuc2xlZXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdICYmIHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHByb3AuZW5hYmxlZCA9IHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3AuZW5hYmxlZCA9IFtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucHJvcGVydGllc1twcm9wTmFtZV0sXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdLFxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICBwcm9wLmluaXQgPSB0cnVlO1xuICAgICAgICBwcm9wLmludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0SWZORTJEKGExLCBhMikge1xuICAgIHJldHVybiBhMVswXSA9PT0gYTJbMF0gJiYgYTFbMV0gPT09IGEyWzFdID8gdW5kZWZpbmVkIDogYTE7XG59XG5mdW5jdGlvbiBfZ2V0SWZORTNEKGExLCBhMikge1xuICAgIHJldHVybiBhMVswXSA9PT0gYTJbMF0gJiYgYTFbMV0gPT09IGEyWzFdICYmIGExWzJdID09PSBhMlsyXSA/IHVuZGVmaW5lZCA6IGExO1xufVxuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChzZXQsIGRlZmF1bHRTaXplKSB7XG4gICAgaWYgKGRlZmF1bHRTaXplKSB7XG4gICAgICAgIHRoaXMuX3JlbW92aW5nID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2ludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICB0aGlzLnNjcm9sbExlbmd0aCA9IHNldC5zY3JvbGxMZW5ndGg7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gdHJ1ZTtcbiAgICB2YXIgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMub3BhY2l0eTtcbiAgICB2YXIgdmFsdWUgPSBzZXQub3BhY2l0eSA9PT0gREVGQVVMVC5vcGFjaXR5ID8gdW5kZWZpbmVkIDogc2V0Lm9wYWNpdHk7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwgcHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgX3NldFByb3BlcnR5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCAnb3BhY2l0eScsIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBbXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSwgREVGQVVMVC5vcGFjaXR5MkQpO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5hbGlnbjtcbiAgICB2YWx1ZSA9IHNldC5hbGlnbiA/IF9nZXRJZk5FMkQoc2V0LmFsaWduLCBERUZBVUxULmFsaWduKSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodmFsdWUgfHwgcHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgX3NldFByb3BlcnR5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCAnYWxpZ24nLCB2YWx1ZSwgREVGQVVMVC5hbGlnbik7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLm9yaWdpbjtcbiAgICB2YWx1ZSA9IHNldC5vcmlnaW4gPyBfZ2V0SWZORTJEKHNldC5vcmlnaW4sIERFRkFVTFQub3JpZ2luKSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodmFsdWUgfHwgcHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgX3NldFByb3BlcnR5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCAnb3JpZ2luJywgdmFsdWUsIERFRkFVTFQub3JpZ2luKTtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuc2l6ZTtcbiAgICB2YWx1ZSA9IHNldC5zaXplIHx8IGRlZmF1bHRTaXplO1xuICAgIGlmICh2YWx1ZSB8fCBwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBfc2V0UHJvcGVydHlWYWx1ZS5jYWxsKHRoaXMsIHByb3AsICdzaXplJywgdmFsdWUsIGRlZmF1bHRTaXplLCB0aGlzLnVzZXNUcnVlU2l6ZSk7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLnRyYW5zbGF0ZTtcbiAgICB2YWx1ZSA9IHNldC50cmFuc2xhdGU7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3RyYW5zbGF0ZScsIHZhbHVlLCBERUZBVUxULnRyYW5zbGF0ZSwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuc2NhbGU7XG4gICAgdmFsdWUgPSBzZXQuc2NhbGUgPyBfZ2V0SWZORTNEKHNldC5zY2FsZSwgREVGQVVMVC5zY2FsZSkgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3NjYWxlJywgdmFsdWUsIERFRkFVTFQuc2NhbGUpO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5yb3RhdGU7XG4gICAgdmFsdWUgPSBzZXQucm90YXRlID8gX2dldElmTkUzRChzZXQucm90YXRlLCBERUZBVUxULnJvdGF0ZSkgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3JvdGF0ZScsIHZhbHVlLCBERUZBVUxULnJvdGF0ZSk7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLnNrZXc7XG4gICAgdmFsdWUgPSBzZXQuc2tldyA/IF9nZXRJZk5FM0Qoc2V0LnNrZXcsIERFRkFVTFQuc2tldykgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3NrZXcnLCB2YWx1ZSwgREVGQVVMVC5za2V3KTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBGbG93TGF5b3V0Tm9kZTsiLCJmdW5jdGlvbiBMYXlvdXRDb250ZXh0KG1ldGhvZHMpIHtcbiAgICBmb3IgKHZhciBuIGluIG1ldGhvZHMpIHtcbiAgICAgICAgdGhpc1tuXSA9IG1ldGhvZHNbbl07XG4gICAgfVxufVxuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUuc2l6ZSA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLmRpcmVjdGlvbiA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnNjcm9sbE9mZnNldCA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnNjcm9sbFN0YXJ0ID0gdW5kZWZpbmVkO1xuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUuc2Nyb2xsRW5kID0gdW5kZWZpbmVkO1xuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbn07XG5MYXlvdXRDb250ZXh0LnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24gKCkge1xufTtcbkxheW91dENvbnRleHQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChub2RlKSB7XG59O1xuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG5vZGUsIHNldCkge1xufTtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnJlc29sdmVTaXplID0gZnVuY3Rpb24gKG5vZGUpIHtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IExheW91dENvbnRleHQ7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIEVudGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLkVudGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLkVudGl0eSA6IG51bGw7XG52YXIgVmlld1NlcXVlbmNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVmlld1NlcXVlbmNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuVmlld1NlcXVlbmNlIDogbnVsbDtcbnZhciBPcHRpb25zTWFuYWdlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLk9wdGlvbnNNYW5hZ2VyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuT3B0aW9uc01hbmFnZXIgOiBudWxsO1xudmFyIEV2ZW50SGFuZGxlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLkV2ZW50SGFuZGxlciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLkV2ZW50SGFuZGxlciA6IG51bGw7XG52YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4vTGF5b3V0VXRpbGl0eScpO1xudmFyIExheW91dE5vZGVNYW5hZ2VyID0gcmVxdWlyZSgnLi9MYXlvdXROb2RlTWFuYWdlcicpO1xudmFyIExheW91dE5vZGUgPSByZXF1aXJlKCcuL0xheW91dE5vZGUnKTtcbnZhciBGbG93TGF5b3V0Tm9kZSA9IHJlcXVpcmUoJy4vRmxvd0xheW91dE5vZGUnKTtcbnZhciBUcmFuc2Zvcm0gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiBudWxsO1xucmVxdWlyZSgnLi9oZWxwZXJzL0xheW91dERvY2tIZWxwZXInKTtcbmZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIob3B0aW9ucywgbm9kZU1hbmFnZXIpIHtcbiAgICB0aGlzLmlkID0gRW50aXR5LnJlZ2lzdGVyKHRoaXMpO1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2NvbnRleHRTaXplQ2FjaGUgPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xuICAgIHRoaXMuX2NvbW1pdE91dHB1dCA9IHt9O1xuICAgIHRoaXMuX2NsZWFudXBSZWdpc3RyYXRpb24gPSB7XG4gICAgICAgIGNvbW1pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYW51cDogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYW51cChjb250ZXh0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfTtcbiAgICB0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uLnRhcmdldCA9IEVudGl0eS5yZWdpc3Rlcih0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0O1xuICAgIH0uYmluZCh0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLl9ldmVudElucHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRJbnB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRJbnB1dCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIHRoaXMuX2xheW91dCA9IHsgb3B0aW9uczogT2JqZWN0LmNyZWF0ZSh7fSkgfTtcbiAgICB0aGlzLl9sYXlvdXQub3B0aW9uc01hbmFnZXIgPSBuZXcgT3B0aW9uc01hbmFnZXIodGhpcy5fbGF5b3V0Lm9wdGlvbnMpO1xuICAgIHRoaXMuX2xheW91dC5vcHRpb25zTWFuYWdlci5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoTGF5b3V0Q29udHJvbGxlci5ERUZBVUxUX09QVElPTlMpO1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMub3B0aW9ucyk7XG4gICAgaWYgKG5vZGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX25vZGVzID0gbm9kZU1hbmFnZXI7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZmxvdykge1xuICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBMYXlvdXROb2RlTWFuYWdlcihGbG93TGF5b3V0Tm9kZSwgX2luaXRGbG93TGF5b3V0Tm9kZS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBMYXlvdXROb2RlTWFuYWdlcihMYXlvdXROb2RlKTtcbiAgICB9XG4gICAgdGhpcy5zZXREaXJlY3Rpb24odW5kZWZpbmVkKTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxufVxuTGF5b3V0Q29udHJvbGxlci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgZmxvdzogZmFsc2UsXG4gICAgZmxvd09wdGlvbnM6IHtcbiAgICAgICAgcmVmbG93T25SZXNpemU6IHRydWUsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IHRydWUsXG4gICAgICAgICAgICBhbGlnbjogdHJ1ZSxcbiAgICAgICAgICAgIG9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgIHNpemU6IHRydWUsXG4gICAgICAgICAgICB0cmFuc2xhdGU6IHRydWUsXG4gICAgICAgICAgICBza2V3OiB0cnVlLFxuICAgICAgICAgICAgcm90YXRlOiB0cnVlLFxuICAgICAgICAgICAgc2NhbGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgc3ByaW5nOiB7XG4gICAgICAgICAgICBkYW1waW5nUmF0aW86IDAuOCxcbiAgICAgICAgICAgIHBlcmlvZDogMzAwXG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX2luaXRGbG93TGF5b3V0Tm9kZShub2RlLCBzcGVjKSB7XG4gICAgaWYgKCFzcGVjICYmIHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucy5pbnNlcnRTcGVjKSB7XG4gICAgICAgIG5vZGUuc2V0U3BlYyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMuaW5zZXJ0U3BlYyk7XG4gICAgfVxufVxuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuYWxpZ25tZW50ICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5hbGlnbm1lbnQgIT09IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMubm9kZVNwcmluZykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ25vZGVTcHJpbmcgb3B0aW9ucyBoYXZlIGJlZW4gbW92ZWQgaW5zaWRlIGBmbG93T3B0aW9uc2AuIFVzZSBgZmxvd09wdGlvbnMuc3ByaW5nYCBpbnN0ZWFkLicpO1xuICAgICAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKHsgZmxvd09wdGlvbnM6IHsgc3ByaW5nOiBvcHRpb25zLm5vZGVTcHJpbmcgfSB9KTtcbiAgICAgICAgdGhpcy5fbm9kZXMuc2V0Tm9kZU9wdGlvbnModGhpcy5vcHRpb25zLmZsb3dPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucmVmbG93T25SZXNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3JlZmxvd09uUmVzaXplIG9wdGlvbnMgaGF2ZSBiZWVuIG1vdmVkIGluc2lkZSBgZmxvd09wdGlvbnNgLiBVc2UgYGZsb3dPcHRpb25zLnJlZmxvd09uUmVzaXplYCBpbnN0ZWFkLicpO1xuICAgICAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKHsgZmxvd09wdGlvbnM6IHsgcmVmbG93T25SZXNpemU6IG9wdGlvbnMucmVmbG93T25SZXNpemUgfSB9KTtcbiAgICAgICAgdGhpcy5fbm9kZXMuc2V0Tm9kZU9wdGlvbnModGhpcy5vcHRpb25zLmZsb3dPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuaW5zZXJ0U3BlYykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2luc2VydFNwZWMgb3B0aW9ucyBoYXZlIGJlZW4gbW92ZWQgaW5zaWRlIGBmbG93T3B0aW9uc2AuIFVzZSBgZmxvd09wdGlvbnMuaW5zZXJ0U3BlY2AgaW5zdGVhZC4nKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucyh7IGZsb3dPcHRpb25zOiB7IGluc2VydFNwZWM6IG9wdGlvbnMuaW5zZXJ0U3BlYyB9IH0pO1xuICAgICAgICB0aGlzLl9ub2Rlcy5zZXROb2RlT3B0aW9ucyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5yZW1vdmVTcGVjKSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncmVtb3ZlU3BlYyBvcHRpb25zIGhhdmUgYmVlbiBtb3ZlZCBpbnNpZGUgYGZsb3dPcHRpb25zYC4gVXNlIGBmbG93T3B0aW9ucy5yZW1vdmVTcGVjYCBpbnN0ZWFkLicpO1xuICAgICAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKHsgZmxvd09wdGlvbnM6IHsgcmVtb3ZlU3BlYzogb3B0aW9ucy5yZW1vdmVTcGVjIH0gfSk7XG4gICAgICAgIHRoaXMuX25vZGVzLnNldE5vZGVPcHRpb25zKHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmRhdGFTb3VyY2UpIHtcbiAgICAgICAgdGhpcy5zZXREYXRhU291cmNlKG9wdGlvbnMuZGF0YVNvdXJjZSk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxheW91dCkge1xuICAgICAgICB0aGlzLnNldExheW91dChvcHRpb25zLmxheW91dCwgb3B0aW9ucy5sYXlvdXRPcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMubGF5b3V0T3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldExheW91dE9wdGlvbnMob3B0aW9ucy5sYXlvdXRPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zZXREaXJlY3Rpb24ob3B0aW9ucy5kaXJlY3Rpb24pO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5mbG93T3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuZmxvdykge1xuICAgICAgICB0aGlzLl9ub2Rlcy5zZXROb2RlT3B0aW9ucyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5wcmVhbGxvY2F0ZU5vZGVzKSB7XG4gICAgICAgIHRoaXMuX25vZGVzLnByZWFsbG9jYXRlTm9kZXMob3B0aW9ucy5wcmVhbGxvY2F0ZU5vZGVzLmNvdW50IHx8IDAsIG9wdGlvbnMucHJlYWxsb2NhdGVOb2Rlcy5zcGVjKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuZnVuY3Rpb24gX2ZvckVhY2hSZW5kZXJhYmxlKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGFTb3VyY2UgPSB0aGlzLl9kYXRhU291cmNlO1xuICAgIGlmIChkYXRhU291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBkYXRhU291cmNlLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YVNvdXJjZVtpXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRhdGFTb3VyY2UgaW5zdGFuY2VvZiBWaWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIHJlbmRlcmFibGU7XG4gICAgICAgIHdoaWxlIChkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZW5kZXJhYmxlID0gZGF0YVNvdXJjZS5nZXQoKTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2socmVuZGVyYWJsZSk7XG4gICAgICAgICAgICBkYXRhU291cmNlID0gZGF0YVNvdXJjZS5nZXROZXh0KCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YVNvdXJjZVtrZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldERhdGFTb3VyY2UgPSBmdW5jdGlvbiAoZGF0YVNvdXJjZSkge1xuICAgIHRoaXMuX2RhdGFTb3VyY2UgPSBkYXRhU291cmNlO1xuICAgIHRoaXMuX25vZGVzQnlJZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoZGF0YVNvdXJjZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5ldyBWaWV3U2VxdWVuY2UoZGF0YVNvdXJjZSk7XG4gICAgfSBlbHNlIGlmIChkYXRhU291cmNlIGluc3RhbmNlb2YgVmlld1NlcXVlbmNlIHx8IGRhdGFTb3VyY2UuZ2V0TmV4dCkge1xuICAgICAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSBkYXRhU291cmNlO1xuICAgIH0gZWxzZSBpZiAoZGF0YVNvdXJjZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICB0aGlzLl9ub2Rlc0J5SWQgPSBkYXRhU291cmNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QaXBlRXZlbnRzKSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhU291cmNlLnBpcGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UucGlwZSh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UucGlwZSh0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZm9yRWFjaFJlbmRlcmFibGUuY2FsbCh0aGlzLCBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZW5kZXJhYmxlICYmIHJlbmRlcmFibGUucGlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJhYmxlLnBpcGUodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmFibGUucGlwZSh0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXREYXRhU291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhU291cmNlO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldExheW91dCA9IGZ1bmN0aW9uIChsYXlvdXQsIG9wdGlvbnMpIHtcbiAgICBpZiAobGF5b3V0IGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbiA9IGxheW91dDtcbiAgICAgICAgdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcyA9IGxheW91dC5DYXBhYmlsaXRpZXM7XG4gICAgICAgIHRoaXMuX2xheW91dC5saXRlcmFsID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAobGF5b3V0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIHRoaXMuX2xheW91dC5saXRlcmFsID0gbGF5b3V0O1xuICAgICAgICB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgaGVscGVyTmFtZSA9IE9iamVjdC5rZXlzKGxheW91dClbMF07XG4gICAgICAgIHZhciBIZWxwZXIgPSBMYXlvdXRVdGlsaXR5LmdldFJlZ2lzdGVyZWRIZWxwZXIoaGVscGVyTmFtZSk7XG4gICAgICAgIHRoaXMuX2xheW91dC5fZnVuY3Rpb24gPSBIZWxwZXIgPyBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9uczIpIHtcbiAgICAgICAgICAgIHZhciBoZWxwZXIgPSBuZXcgSGVscGVyKGNvbnRleHQsIG9wdGlvbnMyKTtcbiAgICAgICAgICAgIGhlbHBlci5wYXJzZShsYXlvdXRbaGVscGVyTmFtZV0pO1xuICAgICAgICB9IDogdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2xheW91dC5fZnVuY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX2xheW91dC5saXRlcmFsID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldExheW91dE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuICAgIHRoaXMuc2V0RGlyZWN0aW9uKHRoaXMuX2NvbmZpZ3VyZWREaXJlY3Rpb24pO1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldExheW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGF5b3V0LmxpdGVyYWwgfHwgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbjtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zZXRMYXlvdXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9sYXlvdXQub3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXRMYXlvdXRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9sYXlvdXQub3B0aW9ucztcbn07XG5mdW5jdGlvbiBfZ2V0QWN0dWFsRGlyZWN0aW9uKGRpcmVjdGlvbikge1xuICAgIGlmICh0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzICYmIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLmRpcmVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLmRpcmVjdGlvbltpXSA9PT0gZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkaXJlY3Rpb24gPT09IHVuZGVmaW5lZCA/IFV0aWxpdHkuRGlyZWN0aW9uLlkgOiBkaXJlY3Rpb247XG59XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zZXREaXJlY3Rpb24gPSBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5fY29uZmlndXJlZERpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB2YXIgbmV3RGlyZWN0aW9uID0gX2dldEFjdHVhbERpcmVjdGlvbi5jYWxsKHRoaXMsIGRpcmVjdGlvbik7XG4gICAgaWYgKG5ld0RpcmVjdGlvbiAhPT0gdGhpcy5fZGlyZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX2RpcmVjdGlvbiA9IG5ld0RpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgfVxufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldERpcmVjdGlvbiA9IGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICByZXR1cm4gYWN0dWFsID8gdGhpcy5fZGlyZWN0aW9uIDogdGhpcy5fY29uZmlndXJlZERpcmVjdGlvbjtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXRTcGVjID0gZnVuY3Rpb24gKG5vZGUsIG5vcm1hbGl6ZSwgZW5kU3RhdGUpIHtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdHlwZW9mIG5vZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICghdGhpcy5fbm9kZXNCeUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSB0aGlzLl9ub2Rlc0J5SWRbbm9kZV07XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fc3BlY3MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zcGVjcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHNwZWMgPSB0aGlzLl9zcGVjc1tpXTtcbiAgICAgICAgICAgIGlmIChzcGVjLnJlbmRlck5vZGUgPT09IG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW5kU3RhdGUgJiYgc3BlYy5lbmRTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzcGVjID0gc3BlYy5lbmRTdGF0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZSAmJiBzcGVjLnRyYW5zZm9ybSAmJiBzcGVjLnNpemUgJiYgKHNwZWMuYWxpZ24gfHwgc3BlYy5vcmlnaW4pKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSBzcGVjLnRyYW5zZm9ybTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMuYWxpZ24gJiYgKHNwZWMuYWxpZ25bMF0gfHwgc3BlYy5hbGlnblsxXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS50aGVuTW92ZSh0cmFuc2Zvcm0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjLmFsaWduWzBdICogdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGVjLmFsaWduWzFdICogdGhpcy5fY29udGV4dFNpemVDYWNoZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3BlYy5vcmlnaW4gJiYgKHNwZWMub3JpZ2luWzBdIHx8IHNwZWMub3JpZ2luWzFdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLm1vdmVUaGVuKFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtc3BlYy5vcmlnaW5bMF0gKiBzcGVjLnNpemVbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLXNwZWMub3JpZ2luWzFdICogc3BlYy5zaXplWzFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sIHRyYW5zZm9ybSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IHNwZWMub3BhY2l0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IHNwZWMuc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBzcGVjO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucmVmbG93TGF5b3V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnJlc2V0Rmxvd1N0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZmxvdykge1xuICAgICAgICB0aGlzLl9yZXNldEZsb3dTdGF0ZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uIChpbmRleE9ySWQsIHJlbmRlcmFibGUsIGluc2VydFNwZWMpIHtcbiAgICBpZiAoaW5kZXhPcklkIGluc3RhbmNlb2YgU3RyaW5nIHx8IHR5cGVvZiBpbmRleE9ySWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhU291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuX25vZGVzQnlJZCA9IHRoaXMuX2RhdGFTb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX25vZGVzQnlJZFtpbmRleE9ySWRdID09PSByZW5kZXJhYmxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ub2Rlc0J5SWRbaW5kZXhPcklkXSA9IHJlbmRlcmFibGU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuX2RhdGFTb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fZGF0YVNvdXJjZSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5fdmlld1NlcXVlbmNlID0gbmV3IFZpZXdTZXF1ZW5jZSh0aGlzLl9kYXRhU291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGF0YVNvdXJjZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZSB8fCB0aGlzLl9kYXRhU291cmNlO1xuICAgICAgICBpZiAoaW5kZXhPcklkID09PSAtMSkge1xuICAgICAgICAgICAgZGF0YVNvdXJjZS5wdXNoKHJlbmRlcmFibGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGluZGV4T3JJZCA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKGRhdGFTb3VyY2UgPT09IHRoaXMuX3ZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2Uuc3BsaWNlKDAsIDAsIHJlbmRlcmFibGUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl92aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dFZpZXdTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Vmlld1NlcXVlbmNlICYmIG5leHRWaWV3U2VxdWVuY2UuZ2V0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5leHRWaWV3U2VxdWVuY2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGFTb3VyY2Uuc3BsaWNlKDAsIDAsIHJlbmRlcmFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YVNvdXJjZS5zcGxpY2UoaW5kZXhPcklkLCAwLCByZW5kZXJhYmxlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaW5zZXJ0U3BlYykge1xuICAgICAgICB0aGlzLl9ub2Rlcy5pbnNlcnROb2RlKHRoaXMuX25vZGVzLmNyZWF0ZU5vZGUocmVuZGVyYWJsZSwgaW5zZXJ0U3BlYykpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QaXBlRXZlbnRzICYmIHJlbmRlcmFibGUgJiYgcmVuZGVyYWJsZS5waXBlKSB7XG4gICAgICAgIHJlbmRlcmFibGUucGlwZSh0aGlzKTtcbiAgICAgICAgcmVuZGVyYWJsZS5waXBlKHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB9XG4gICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChyZW5kZXJhYmxlLCBpbnNlcnRTcGVjKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zZXJ0KC0xLCByZW5kZXJhYmxlLCBpbnNlcnRTcGVjKTtcbn07XG5mdW5jdGlvbiBfZ2V0Vmlld1NlcXVlbmNlQXRJbmRleChpbmRleCwgc3RhcnRWaWV3U2VxdWVuY2UpIHtcbiAgICB2YXIgdmlld1NlcXVlbmNlID0gc3RhcnRWaWV3U2VxdWVuY2UgfHwgdGhpcy5fdmlld1NlcXVlbmNlO1xuICAgIHZhciBpID0gdmlld1NlcXVlbmNlID8gdmlld1NlcXVlbmNlLmdldEluZGV4KCkgOiBpbmRleDtcbiAgICBpZiAoaW5kZXggPiBpKSB7XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdmlld1NlcXVlbmNlLmdldEluZGV4KCk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA8IGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpbmRleCA8IGkpIHtcbiAgICAgICAgd2hpbGUgKHZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpID0gdmlld1NlcXVlbmNlLmdldEluZGV4KCk7XG4gICAgICAgICAgICBpZiAoaSA9PT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA+IGkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aWV3U2VxdWVuY2U7XG59XG5mdW5jdGlvbiBfZ2V0RGF0YVNvdXJjZUFycmF5KCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2RhdGFTb3VyY2UpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhU291cmNlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fdmlld1NlcXVlbmNlIHx8IHRoaXMuX3ZpZXdTZXF1ZW5jZS5fKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92aWV3U2VxdWVuY2UuXy5hcnJheTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChpbmRleE9ySWQpIHtcbiAgICBpZiAodGhpcy5fbm9kZXNCeUlkIHx8IGluZGV4T3JJZCBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2YgaW5kZXhPcklkID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdGhpcy5fbm9kZXNCeUlkW2luZGV4T3JJZF07XG4gICAgfVxuICAgIHZhciB2aWV3U2VxdWVuY2UgPSBfZ2V0Vmlld1NlcXVlbmNlQXRJbmRleC5jYWxsKHRoaXMsIGluZGV4T3JJZCk7XG4gICAgcmV0dXJuIHZpZXdTZXF1ZW5jZSA/IHZpZXdTZXF1ZW5jZS5nZXQoKSA6IHVuZGVmaW5lZDtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24gKGluZGV4LCBpbmRleDIpIHtcbiAgICB2YXIgYXJyYXkgPSBfZ2V0RGF0YVNvdXJjZUFycmF5LmNhbGwodGhpcyk7XG4gICAgaWYgKCFhcnJheSkge1xuICAgICAgICB0aHJvdyAnLnN3YXAgaXMgb25seSBzdXBwb3J0ZWQgZm9yIGRhdGFTb3VyY2VzIG9mIHR5cGUgQXJyYXkgb3IgVmlld1NlcXVlbmNlJztcbiAgICB9XG4gICAgaWYgKGluZGV4ID09PSBpbmRleDIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHRocm93ICdJbnZhbGlkIGluZGV4ICgnICsgaW5kZXggKyAnKSBzcGVjaWZpZWQgdG8gLnN3YXAnO1xuICAgIH1cbiAgICBpZiAoaW5kZXgyIDwgMCB8fCBpbmRleDIgPj0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHRocm93ICdJbnZhbGlkIHNlY29uZCBpbmRleCAoJyArIGluZGV4MiArICcpIHNwZWNpZmllZCB0byAuc3dhcCc7XG4gICAgfVxuICAgIHZhciByZW5kZXJOb2RlID0gYXJyYXlbaW5kZXhdO1xuICAgIGFycmF5W2luZGV4XSA9IGFycmF5W2luZGV4Ml07XG4gICAgYXJyYXlbaW5kZXgyXSA9IHJlbmRlck5vZGU7XG4gICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIChpbmRleE9ySWQsIHJlbmRlcmFibGUsIG5vQW5pbWF0aW9uKSB7XG4gICAgdmFyIG9sZFJlbmRlcmFibGU7XG4gICAgaWYgKHRoaXMuX25vZGVzQnlJZCB8fCBpbmRleE9ySWQgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdHlwZW9mIGluZGV4T3JJZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb2xkUmVuZGVyYWJsZSA9IHRoaXMuX25vZGVzQnlJZFtpbmRleE9ySWRdO1xuICAgICAgICBpZiAob2xkUmVuZGVyYWJsZSAhPT0gcmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgaWYgKG5vQW5pbWF0aW9uICYmIG9sZFJlbmRlcmFibGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldE5vZGVCeVJlbmRlck5vZGUob2xkUmVuZGVyYWJsZSk7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRSZW5kZXJOb2RlKHJlbmRlcmFibGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX25vZGVzQnlJZFtpbmRleE9ySWRdID0gcmVuZGVyYWJsZTtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvbGRSZW5kZXJhYmxlO1xuICAgIH1cbiAgICB2YXIgYXJyYXkgPSBfZ2V0RGF0YVNvdXJjZUFycmF5LmNhbGwodGhpcyk7XG4gICAgaWYgKCFhcnJheSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoaW5kZXhPcklkIDwgMCB8fCBpbmRleE9ySWQgPj0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHRocm93ICdJbnZhbGlkIGluZGV4ICgnICsgaW5kZXhPcklkICsgJykgc3BlY2lmaWVkIHRvIC5yZXBsYWNlJztcbiAgICB9XG4gICAgb2xkUmVuZGVyYWJsZSA9IGFycmF5W2luZGV4T3JJZF07XG4gICAgaWYgKG9sZFJlbmRlcmFibGUgIT09IHJlbmRlcmFibGUpIHtcbiAgICAgICAgYXJyYXlbaW5kZXhPcklkXSA9IHJlbmRlcmFibGU7XG4gICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gb2xkUmVuZGVyYWJsZTtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24gKGluZGV4LCBuZXdJbmRleCkge1xuICAgIHZhciBhcnJheSA9IF9nZXREYXRhU291cmNlQXJyYXkuY2FsbCh0aGlzKTtcbiAgICBpZiAoIWFycmF5KSB7XG4gICAgICAgIHRocm93ICcubW92ZSBpcyBvbmx5IHN1cHBvcnRlZCBmb3IgZGF0YVNvdXJjZXMgb2YgdHlwZSBBcnJheSBvciBWaWV3U2VxdWVuY2UnO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IGFycmF5Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyAnSW52YWxpZCBpbmRleCAoJyArIGluZGV4ICsgJykgc3BlY2lmaWVkIHRvIC5tb3ZlJztcbiAgICB9XG4gICAgaWYgKG5ld0luZGV4IDwgMCB8fCBuZXdJbmRleCA+PSBhcnJheS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgJ0ludmFsaWQgbmV3SW5kZXggKCcgKyBuZXdJbmRleCArICcpIHNwZWNpZmllZCB0byAubW92ZSc7XG4gICAgfVxuICAgIHZhciBpdGVtID0gYXJyYXkuc3BsaWNlKGluZGV4LCAxKVswXTtcbiAgICBhcnJheS5zcGxpY2UobmV3SW5kZXgsIDAsIGl0ZW0pO1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChpbmRleE9ySWQsIHJlbW92ZVNwZWMpIHtcbiAgICB2YXIgcmVuZGVyTm9kZTtcbiAgICBpZiAodGhpcy5fbm9kZXNCeUlkIHx8IGluZGV4T3JJZCBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2YgaW5kZXhPcklkID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoaW5kZXhPcklkIGluc3RhbmNlb2YgU3RyaW5nIHx8IHR5cGVvZiBpbmRleE9ySWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZW5kZXJOb2RlID0gdGhpcy5fbm9kZXNCeUlkW2luZGV4T3JJZF07XG4gICAgICAgICAgICBpZiAocmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ub2Rlc0J5SWRbaW5kZXhPcklkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl9ub2Rlc0J5SWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbm9kZXNCeUlkW2tleV0gPT09IGluZGV4T3JJZCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5fbm9kZXNCeUlkW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGUgPSBpbmRleE9ySWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZXhPcklkIGluc3RhbmNlb2YgTnVtYmVyIHx8IHR5cGVvZiBpbmRleE9ySWQgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHZhciBhcnJheSA9IF9nZXREYXRhU291cmNlQXJyYXkuY2FsbCh0aGlzKTtcbiAgICAgICAgaWYgKCFhcnJheSB8fCBpbmRleE9ySWQgPCAwIHx8IGluZGV4T3JJZCA+PSBhcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIGluZGV4ICgnICsgaW5kZXhPcklkICsgJykgc3BlY2lmaWVkIHRvIC5yZW1vdmUgKG9yIGRhdGFTb3VyY2UgZG9lc25cXCd0IHN1cHBvcnQgcmVtb3ZlKSc7XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyTm9kZSA9IGFycmF5W2luZGV4T3JJZF07XG4gICAgICAgIHRoaXMuX2RhdGFTb3VyY2Uuc3BsaWNlKGluZGV4T3JJZCwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXhPcklkID0gdGhpcy5fZGF0YVNvdXJjZS5pbmRleE9mKGluZGV4T3JJZCk7XG4gICAgICAgIGlmIChpbmRleE9ySWQgPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5fZGF0YVNvdXJjZS5zcGxpY2UoaW5kZXhPcklkLCAxKTtcbiAgICAgICAgICAgIHJlbmRlck5vZGUgPSBpbmRleE9ySWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX3ZpZXdTZXF1ZW5jZSAmJiByZW5kZXJOb2RlKSB7XG4gICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSBfZ2V0Vmlld1NlcXVlbmNlQXRJbmRleC5jYWxsKHRoaXMsIHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpLCB0aGlzLl9kYXRhU291cmNlKTtcbiAgICAgICAgdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlIHx8IF9nZXRWaWV3U2VxdWVuY2VBdEluZGV4LmNhbGwodGhpcywgdGhpcy5fdmlld1NlcXVlbmNlLmdldEluZGV4KCkgLSAxLCB0aGlzLl9kYXRhU291cmNlKTtcbiAgICAgICAgdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlIHx8IHRoaXMuX2RhdGFTb3VyY2U7XG4gICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZTtcbiAgICB9XG4gICAgaWYgKHJlbmRlck5vZGUgJiYgcmVtb3ZlU3BlYykge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldE5vZGVCeVJlbmRlck5vZGUocmVuZGVyTm9kZSk7XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZShyZW1vdmVTcGVjIHx8IHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucy5yZW1vdmVTcGVjKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVuZGVyTm9kZSkge1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlbmRlck5vZGU7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlQWxsID0gZnVuY3Rpb24gKHJlbW92ZVNwZWMpIHtcbiAgICBpZiAodGhpcy5fbm9kZXNCeUlkKSB7XG4gICAgICAgIHZhciBkaXJ0eSA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5fbm9kZXNCeUlkKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fbm9kZXNCeUlkW2tleV07XG4gICAgICAgICAgICBkaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpcnR5KSB7XG4gICAgICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fZGF0YVNvdXJjZSkge1xuICAgICAgICB0aGlzLnNldERhdGFTb3VyY2UoW10pO1xuICAgIH1cbiAgICBpZiAocmVtb3ZlU3BlYykge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoKTtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlKHJlbW92ZVNwZWMgfHwgdGhpcy5vcHRpb25zLmZsb3dPcHRpb25zLnJlbW92ZVNwZWMpO1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2l6ZSB8fCB0aGlzLm9wdGlvbnMuc2l6ZTtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaWQ7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuY29tbWl0ID0gZnVuY3Rpb24gY29tbWl0KGNvbnRleHQpIHtcbiAgICB2YXIgdHJhbnNmb3JtID0gY29udGV4dC50cmFuc2Zvcm07XG4gICAgdmFyIG9yaWdpbiA9IGNvbnRleHQub3JpZ2luO1xuICAgIHZhciBzaXplID0gY29udGV4dC5zaXplO1xuICAgIHZhciBvcGFjaXR5ID0gY29udGV4dC5vcGFjaXR5O1xuICAgIGlmICh0aGlzLl9yZXNldEZsb3dTdGF0ZSkge1xuICAgICAgICB0aGlzLl9yZXNldEZsb3dTdGF0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbm9kZXMucmVtb3ZlQWxsKCk7XG4gICAgfVxuICAgIGlmIChzaXplWzBdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzBdIHx8IHNpemVbMV0gIT09IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0gfHwgdGhpcy5faXNEaXJ0eSB8fCB0aGlzLl9ub2Rlcy5fdHJ1ZVNpemVSZXF1ZXN0ZWQgfHwgdGhpcy5vcHRpb25zLmFsd2F5c0xheW91dCkge1xuICAgICAgICB2YXIgZXZlbnREYXRhID0ge1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICBvbGRTaXplOiB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlLFxuICAgICAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgZGlydHk6IHRoaXMuX2lzRGlydHksXG4gICAgICAgICAgICAgICAgdHJ1ZVNpemVSZXF1ZXN0ZWQ6IHRoaXMuX25vZGVzLl90cnVlU2l6ZVJlcXVlc3RlZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnbGF5b3V0c3RhcnQnLCBldmVudERhdGEpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZsb3cpIHtcbiAgICAgICAgICAgIHZhciBsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5mbG93T3B0aW9ucy5yZWZsb3dPblJlc2l6ZSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXNEaXJ0eSAmJiAoc2l6ZVswXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSB8fCBzaXplWzFdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzFdKSkge1xuICAgICAgICAgICAgICAgICAgICBsb2NrID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsb2NrICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLnJlbGVhc2VMb2NrKGxvY2spO1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSA9IHNpemVbMF07XG4gICAgICAgIHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0gPSBzaXplWzFdO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gZmFsc2U7XG4gICAgICAgIHZhciBzY3JvbGxFbmQ7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2l6ZSAmJiB0aGlzLm9wdGlvbnMuc2l6ZVt0aGlzLl9kaXJlY3Rpb25dID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzY3JvbGxFbmQgPSAxMDAwMDAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsYXlvdXRDb250ZXh0ID0gdGhpcy5fbm9kZXMucHJlcGFyZUZvckxheW91dCh0aGlzLl92aWV3U2VxdWVuY2UsIHRoaXMuX25vZGVzQnlJZCwge1xuICAgICAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgc2Nyb2xsRW5kOiBzY3JvbGxFbmRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5fbGF5b3V0Ll9mdW5jdGlvbikge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbihsYXlvdXRDb250ZXh0LCB0aGlzLl9sYXlvdXQub3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbm9kZXMucmVtb3ZlTm9uSW52YWxpZGF0ZWROb2Rlcyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMucmVtb3ZlU3BlYyk7XG4gICAgICAgIHRoaXMuX25vZGVzLnJlbW92ZVZpcnR1YWxWaWV3U2VxdWVuY2VOb2RlcygpO1xuICAgICAgICBpZiAoc2Nyb2xsRW5kKSB7XG4gICAgICAgICAgICBzY3JvbGxFbmQgPSAwO1xuICAgICAgICAgICAgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoKTtcbiAgICAgICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUuX2ludmFsaWRhdGVkICYmIG5vZGUuc2Nyb2xsTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbEVuZCArPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zaXplID0gdGhpcy5fc2l6ZSB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGhpcy5fc2l6ZVswXSA9IHRoaXMub3B0aW9ucy5zaXplWzBdO1xuICAgICAgICAgICAgdGhpcy5fc2l6ZVsxXSA9IHRoaXMub3B0aW9ucy5zaXplWzFdO1xuICAgICAgICAgICAgdGhpcy5fc2l6ZVt0aGlzLl9kaXJlY3Rpb25dID0gc2Nyb2xsRW5kO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9ub2Rlcy5idWlsZFNwZWNBbmREZXN0cm95VW5yZW5kZXJlZE5vZGVzKCk7XG4gICAgICAgIHRoaXMuX3NwZWNzID0gcmVzdWx0LnNwZWNzO1xuICAgICAgICB0aGlzLl9jb21taXRPdXRwdXQudGFyZ2V0ID0gcmVzdWx0LnNwZWNzO1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdsYXlvdXRlbmQnLCBldmVudERhdGEpO1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdyZWZsb3cnLCB7IHRhcmdldDogdGhpcyB9KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5mbG93KSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX25vZGVzLmJ1aWxkU3BlY0FuZERlc3Ryb3lVbnJlbmRlcmVkTm9kZXMoKTtcbiAgICAgICAgdGhpcy5fc3BlY3MgPSByZXN1bHQuc3BlY3M7XG4gICAgICAgIHRoaXMuX2NvbW1pdE91dHB1dC50YXJnZXQgPSByZXN1bHQuc3BlY3M7XG4gICAgICAgIGlmIChyZXN1bHQubW9kaWZpZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlZmxvdycsIHsgdGFyZ2V0OiB0aGlzIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciB0YXJnZXQgPSB0aGlzLl9jb21taXRPdXRwdXQudGFyZ2V0O1xuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdGFyZ2V0Lmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICBpZiAodGFyZ2V0W2ldLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIHRhcmdldFtpXS50YXJnZXQgPSB0YXJnZXRbaV0ucmVuZGVyTm9kZS5yZW5kZXIoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXRhcmdldC5sZW5ndGggfHwgdGFyZ2V0W3RhcmdldC5sZW5ndGggLSAxXSAhPT0gdGhpcy5fY2xlYW51cFJlZ2lzdHJhdGlvbikge1xuICAgICAgICB0YXJnZXQucHVzaCh0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKTtcbiAgICB9XG4gICAgaWYgKG9yaWdpbiAmJiAob3JpZ2luWzBdICE9PSAwIHx8IG9yaWdpblsxXSAhPT0gMCkpIHtcbiAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLm1vdmVUaGVuKFtcbiAgICAgICAgICAgIC1zaXplWzBdICogb3JpZ2luWzBdLFxuICAgICAgICAgICAgLXNpemVbMV0gKiBvcmlnaW5bMV0sXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sIHRyYW5zZm9ybSk7XG4gICAgfVxuICAgIHRoaXMuX2NvbW1pdE91dHB1dC5zaXplID0gc2l6ZTtcbiAgICB0aGlzLl9jb21taXRPdXRwdXQub3BhY2l0eSA9IG9wYWNpdHk7XG4gICAgdGhpcy5fY29tbWl0T3V0cHV0LnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbiAgICByZXR1cm4gdGhpcy5fY29tbWl0T3V0cHV0O1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZmxvdykge1xuICAgICAgICB0aGlzLl9yZXNldEZsb3dTdGF0ZSA9IHRydWU7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0Q29udHJvbGxlcjsiLCJ2YXIgVHJhbnNmb3JtID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVHJhbnNmb3JtIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuVHJhbnNmb3JtIDogbnVsbDtcbnZhciBMYXlvdXRVdGlsaXR5ID0gcmVxdWlyZSgnLi9MYXlvdXRVdGlsaXR5Jyk7XG5mdW5jdGlvbiBMYXlvdXROb2RlKHJlbmRlck5vZGUsIHNwZWMpIHtcbiAgICB0aGlzLnJlbmRlck5vZGUgPSByZW5kZXJOb2RlO1xuICAgIHRoaXMuX3NwZWMgPSBzcGVjID8gTGF5b3V0VXRpbGl0eS5jbG9uZVNwZWMoc3BlYykgOiB7fTtcbiAgICB0aGlzLl9zcGVjLnJlbmRlck5vZGUgPSByZW5kZXJOb2RlO1xuICAgIHRoaXMuX3NwZWNNb2RpZmllZCA9IHRydWU7XG4gICAgdGhpcy5faW52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9yZW1vdmluZyA9IGZhbHNlO1xufVxuTGF5b3V0Tm9kZS5wcm90b3R5cGUuc2V0UmVuZGVyTm9kZSA9IGZ1bmN0aW9uIChyZW5kZXJOb2RlKSB7XG4gICAgdGhpcy5yZW5kZXJOb2RlID0gcmVuZGVyTm9kZTtcbiAgICB0aGlzLl9zcGVjLnJlbmRlck5vZGUgPSByZW5kZXJOb2RlO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3NwZWMucmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSB1bmRlZmluZWQ7XG59O1xuTGF5b3V0Tm9kZS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5faW52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnRydWVTaXplUmVxdWVzdGVkID0gZmFsc2U7XG59O1xuTGF5b3V0Tm9kZS5wcm90b3R5cGUuc2V0U3BlYyA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gdHJ1ZTtcbiAgICBpZiAoc3BlYy5hbGlnbikge1xuICAgICAgICBpZiAoIXNwZWMuYWxpZ24pIHtcbiAgICAgICAgICAgIHRoaXMuX3NwZWMuYWxpZ24gPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NwZWMuYWxpZ25bMF0gPSBzcGVjLmFsaWduWzBdO1xuICAgICAgICB0aGlzLl9zcGVjLmFsaWduWzFdID0gc3BlYy5hbGlnblsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zcGVjLmFsaWduID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoc3BlYy5vcmlnaW4pIHtcbiAgICAgICAgaWYgKCFzcGVjLm9yaWdpbikge1xuICAgICAgICAgICAgdGhpcy5fc3BlYy5vcmlnaW4gPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NwZWMub3JpZ2luWzBdID0gc3BlYy5vcmlnaW5bMF07XG4gICAgICAgIHRoaXMuX3NwZWMub3JpZ2luWzFdID0gc3BlYy5vcmlnaW5bMV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc3BlYy5vcmlnaW4gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChzcGVjLnNpemUpIHtcbiAgICAgICAgaWYgKCFzcGVjLnNpemUpIHtcbiAgICAgICAgICAgIHRoaXMuX3NwZWMuc2l6ZSA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3BlYy5zaXplWzBdID0gc3BlYy5zaXplWzBdO1xuICAgICAgICB0aGlzLl9zcGVjLnNpemVbMV0gPSBzcGVjLnNpemVbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc3BlYy5zaXplID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoc3BlYy50cmFuc2Zvcm0pIHtcbiAgICAgICAgaWYgKCFzcGVjLnRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdGhpcy5fc3BlYy50cmFuc2Zvcm0gPSBzcGVjLnRyYW5zZm9ybS5zbGljZSgwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtW2ldID0gc3BlYy50cmFuc2Zvcm1baV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zcGVjLnRyYW5zZm9ybSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5fc3BlYy5vcGFjaXR5ID0gc3BlYy5vcGFjaXR5O1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChzZXQsIHNpemUpIHtcbiAgICB0aGlzLl9pbnZhbGlkYXRlZCA9IHRydWU7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9yZW1vdmluZyA9IGZhbHNlO1xuICAgIHZhciBzcGVjID0gdGhpcy5fc3BlYztcbiAgICBzcGVjLm9wYWNpdHkgPSBzZXQub3BhY2l0eTtcbiAgICBpZiAoc2V0LnNpemUpIHtcbiAgICAgICAgaWYgKCFzcGVjLnNpemUpIHtcbiAgICAgICAgICAgIHNwZWMuc2l6ZSA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgc3BlYy5zaXplWzBdID0gc2V0LnNpemVbMF07XG4gICAgICAgIHNwZWMuc2l6ZVsxXSA9IHNldC5zaXplWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwZWMuc2l6ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNldC5vcmlnaW4pIHtcbiAgICAgICAgaWYgKCFzcGVjLm9yaWdpbikge1xuICAgICAgICAgICAgc3BlYy5vcmlnaW4gPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHNwZWMub3JpZ2luWzBdID0gc2V0Lm9yaWdpblswXTtcbiAgICAgICAgc3BlYy5vcmlnaW5bMV0gPSBzZXQub3JpZ2luWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwZWMub3JpZ2luID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoc2V0LmFsaWduKSB7XG4gICAgICAgIGlmICghc3BlYy5hbGlnbikge1xuICAgICAgICAgICAgc3BlYy5hbGlnbiA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICAgICAgc3BlYy5hbGlnblswXSA9IHNldC5hbGlnblswXTtcbiAgICAgICAgc3BlYy5hbGlnblsxXSA9IHNldC5hbGlnblsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLmFsaWduID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoc2V0LnNrZXcgfHwgc2V0LnJvdGF0ZSB8fCBzZXQuc2NhbGUpIHtcbiAgICAgICAgdGhpcy5fc3BlYy50cmFuc2Zvcm0gPSBUcmFuc2Zvcm0uYnVpbGQoe1xuICAgICAgICAgICAgdHJhbnNsYXRlOiBzZXQudHJhbnNsYXRlIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNrZXc6IHNldC5za2V3IHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNjYWxlOiBzZXQuc2NhbGUgfHwgW1xuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcm90YXRlOiBzZXQucm90YXRlIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHNldC50cmFuc2xhdGUpIHtcbiAgICAgICAgdGhpcy5fc3BlYy50cmFuc2Zvcm0gPSBUcmFuc2Zvcm0udHJhbnNsYXRlKHNldC50cmFuc2xhdGVbMF0sIHNldC50cmFuc2xhdGVbMV0sIHNldC50cmFuc2xhdGVbMl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzLnNjcm9sbExlbmd0aCA9IHNldC5zY3JvbGxMZW5ndGg7XG59O1xuTGF5b3V0Tm9kZS5wcm90b3R5cGUuZ2V0U3BlYyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9zcGVjTW9kaWZpZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zcGVjLnJlbW92ZWQgPSAhdGhpcy5faW52YWxpZGF0ZWQ7XG4gICAgcmV0dXJuIHRoaXMuX3NwZWM7XG59O1xuTGF5b3V0Tm9kZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKHJlbW92ZVNwZWMpIHtcbiAgICB0aGlzLl9yZW1vdmluZyA9IHRydWU7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXROb2RlOyIsInZhciBMYXlvdXRDb250ZXh0ID0gcmVxdWlyZSgnLi9MYXlvdXRDb250ZXh0Jyk7XG52YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4vTGF5b3V0VXRpbGl0eScpO1xudmFyIE1BWF9QT09MX1NJWkUgPSAxMDA7XG5mdW5jdGlvbiBMYXlvdXROb2RlTWFuYWdlcihMYXlvdXROb2RlLCBpbml0TGF5b3V0Tm9kZUZuKSB7XG4gICAgdGhpcy5MYXlvdXROb2RlID0gTGF5b3V0Tm9kZTtcbiAgICB0aGlzLl9pbml0TGF5b3V0Tm9kZUZuID0gaW5pdExheW91dE5vZGVGbjtcbiAgICB0aGlzLl9sYXlvdXRDb3VudCA9IDA7XG4gICAgdGhpcy5fY29udGV4dCA9IG5ldyBMYXlvdXRDb250ZXh0KHtcbiAgICAgICAgbmV4dDogX2NvbnRleHROZXh0LmJpbmQodGhpcyksXG4gICAgICAgIHByZXY6IF9jb250ZXh0UHJldi5iaW5kKHRoaXMpLFxuICAgICAgICBnZXQ6IF9jb250ZXh0R2V0LmJpbmQodGhpcyksXG4gICAgICAgIHNldDogX2NvbnRleHRTZXQuYmluZCh0aGlzKSxcbiAgICAgICAgcmVzb2x2ZVNpemU6IF9jb250ZXh0UmVzb2x2ZVNpemUuYmluZCh0aGlzKSxcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIHRoaXMuX2NvbnRleHRTdGF0ZSA9IHt9O1xuICAgIHRoaXMuX3Bvb2wgPSB7XG4gICAgICAgIGxheW91dE5vZGVzOiB7IHNpemU6IDAgfSxcbiAgICAgICAgcmVzb2x2ZVNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9O1xufVxuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLnByZXBhcmVGb3JMYXlvdXQgPSBmdW5jdGlvbiAodmlld1NlcXVlbmNlLCBub2Rlc0J5SWQsIGNvbnRleHREYXRhKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9maXJzdDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBub2RlLnJlc2V0KCk7XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICB2YXIgY29udGV4dCA9IHRoaXMuX2NvbnRleHQ7XG4gICAgdGhpcy5fbGF5b3V0Q291bnQrKztcbiAgICB0aGlzLl9ub2Rlc0J5SWQgPSBub2Rlc0J5SWQ7XG4gICAgdGhpcy5fdHJ1ZVNpemVSZXF1ZXN0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9yZWV2YWxUcnVlU2l6ZSA9IGNvbnRleHREYXRhLnJlZXZhbFRydWVTaXplIHx8ICFjb250ZXh0LnNpemUgfHwgY29udGV4dC5zaXplWzBdICE9PSBjb250ZXh0RGF0YS5zaXplWzBdIHx8IGNvbnRleHQuc2l6ZVsxXSAhPT0gY29udGV4dERhdGEuc2l6ZVsxXTtcbiAgICB2YXIgY29udGV4dFN0YXRlID0gdGhpcy5fY29udGV4dFN0YXRlO1xuICAgIGNvbnRleHRTdGF0ZS5zdGFydFNlcXVlbmNlID0gdmlld1NlcXVlbmNlO1xuICAgIGNvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2U7XG4gICAgY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZTtcbiAgICBjb250ZXh0U3RhdGUuc3RhcnQgPSB1bmRlZmluZWQ7XG4gICAgY29udGV4dFN0YXRlLm5leHRHZXRJbmRleCA9IDA7XG4gICAgY29udGV4dFN0YXRlLnByZXZHZXRJbmRleCA9IDA7XG4gICAgY29udGV4dFN0YXRlLm5leHRTZXRJbmRleCA9IDA7XG4gICAgY29udGV4dFN0YXRlLnByZXZTZXRJbmRleCA9IDA7XG4gICAgY29udGV4dFN0YXRlLmFkZENvdW50ID0gMDtcbiAgICBjb250ZXh0U3RhdGUucmVtb3ZlQ291bnQgPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5sYXN0UmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICBjb250ZXh0LnNpemVbMF0gPSBjb250ZXh0RGF0YS5zaXplWzBdO1xuICAgIGNvbnRleHQuc2l6ZVsxXSA9IGNvbnRleHREYXRhLnNpemVbMV07XG4gICAgY29udGV4dC5kaXJlY3Rpb24gPSBjb250ZXh0RGF0YS5kaXJlY3Rpb247XG4gICAgY29udGV4dC5yZXZlcnNlID0gY29udGV4dERhdGEucmV2ZXJzZTtcbiAgICBjb250ZXh0LmFsaWdubWVudCA9IGNvbnRleHREYXRhLnJldmVyc2UgPyAxIDogMDtcbiAgICBjb250ZXh0LnNjcm9sbE9mZnNldCA9IGNvbnRleHREYXRhLnNjcm9sbE9mZnNldCB8fCAwO1xuICAgIGNvbnRleHQuc2Nyb2xsU3RhcnQgPSBjb250ZXh0RGF0YS5zY3JvbGxTdGFydCB8fCAwO1xuICAgIGNvbnRleHQuc2Nyb2xsRW5kID0gY29udGV4dERhdGEuc2Nyb2xsRW5kIHx8IGNvbnRleHQuc2l6ZVtjb250ZXh0LmRpcmVjdGlvbl07XG4gICAgcmV0dXJuIGNvbnRleHQ7XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLnJlbW92ZU5vbkludmFsaWRhdGVkTm9kZXMgPSBmdW5jdGlvbiAocmVtb3ZlU3BlYykge1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCAmJiAhbm9kZS5fcmVtb3ZpbmcpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlKHJlbW92ZVNwZWMpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlVmlydHVhbFZpZXdTZXF1ZW5jZU5vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnRTZXF1ZW5jZSAmJiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnRTZXF1ZW5jZS5jbGVhbnVwKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydFNlcXVlbmNlLmNsZWFudXAoKTtcbiAgICB9XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLmJ1aWxkU3BlY0FuZERlc3Ryb3lVbnJlbmRlcmVkTm9kZXMgPSBmdW5jdGlvbiAodHJhbnNsYXRlKSB7XG4gICAgdmFyIHNwZWNzID0gW107XG4gICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHNwZWNzOiBzcGVjcyxcbiAgICAgICAgICAgIG1vZGlmaWVkOiBmYWxzZVxuICAgICAgICB9O1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgdmFyIG1vZGlmaWVkID0gbm9kZS5fc3BlY01vZGlmaWVkO1xuICAgICAgICB2YXIgc3BlYyA9IG5vZGUuZ2V0U3BlYygpO1xuICAgICAgICBpZiAoc3BlYy5yZW1vdmVkKSB7XG4gICAgICAgICAgICB2YXIgZGVzdHJveU5vZGUgPSBub2RlO1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgICAgICBfZGVzdHJveU5vZGUuY2FsbCh0aGlzLCBkZXN0cm95Tm9kZSk7XG4gICAgICAgICAgICByZXN1bHQubW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vZGlmaWVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWMudHJhbnNmb3JtICYmIHRyYW5zbGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxMl0gKz0gdHJhbnNsYXRlWzBdO1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxM10gKz0gdHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxNF0gKz0gdHJhbnNsYXRlWzJdO1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxMl0gPSBNYXRoLnJvdW5kKHNwZWMudHJhbnNmb3JtWzEyXSAqIDEwMDAwMCkgLyAxMDAwMDA7XG4gICAgICAgICAgICAgICAgICAgIHNwZWMudHJhbnNmb3JtWzEzXSA9IE1hdGgucm91bmQoc3BlYy50cmFuc2Zvcm1bMTNdICogMTAwMDAwKSAvIDEwMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMuZW5kU3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMuZW5kU3RhdGUudHJhbnNmb3JtWzEyXSArPSB0cmFuc2xhdGVbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGVjLmVuZFN0YXRlLnRyYW5zZm9ybVsxM10gKz0gdHJhbnNsYXRlWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy5lbmRTdGF0ZS50cmFuc2Zvcm1bMTRdICs9IHRyYW5zbGF0ZVsyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMuZW5kU3RhdGUudHJhbnNmb3JtWzEyXSA9IE1hdGgucm91bmQoc3BlYy5lbmRTdGF0ZS50cmFuc2Zvcm1bMTJdICogMTAwMDAwKSAvIDEwMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMuZW5kU3RhdGUudHJhbnNmb3JtWzEzXSA9IE1hdGgucm91bmQoc3BlYy5lbmRTdGF0ZS50cmFuc2Zvcm1bMTNdICogMTAwMDAwKSAvIDEwMDAwMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHQubW9kaWZpZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BlY3MucHVzaChzcGVjKTtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5hZGRDb3VudCA9IDA7XG4gICAgdGhpcy5fY29udGV4dFN0YXRlLnJlbW92ZUNvdW50ID0gMDtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5nZXROb2RlQnlSZW5kZXJOb2RlID0gZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX2ZpcnN0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnJlbmRlck5vZGUgPT09IHJlbmRlcmFibGUpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5pbnNlcnROb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBub2RlLl9uZXh0ID0gdGhpcy5fZmlyc3Q7XG4gICAgaWYgKHRoaXMuX2ZpcnN0KSB7XG4gICAgICAgIHRoaXMuX2ZpcnN0Ll9wcmV2ID0gbm9kZTtcbiAgICB9XG4gICAgdGhpcy5fZmlyc3QgPSBub2RlO1xufTtcbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5zZXROb2RlT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdGhpcy5fbm9kZU9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgbm9kZSA9IHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLnByZWFsbG9jYXRlTm9kZXMgPSBmdW5jdGlvbiAoY291bnQsIHNwZWMpIHtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgbm9kZXMucHVzaCh0aGlzLmNyZWF0ZU5vZGUodW5kZWZpbmVkLCBzcGVjKSk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgIF9kZXN0cm95Tm9kZS5jYWxsKHRoaXMsIG5vZGVzW2ldKTtcbiAgICB9XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLmNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAocmVuZGVyTm9kZSwgc3BlYykge1xuICAgIHZhciBub2RlO1xuICAgIGlmICh0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0KSB7XG4gICAgICAgIG5vZGUgPSB0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0O1xuICAgICAgICB0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0ID0gbm9kZS5fbmV4dDtcbiAgICAgICAgdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5zaXplLS07XG4gICAgICAgIG5vZGUuY29uc3RydWN0b3IuYXBwbHkobm9kZSwgYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBub2RlID0gbmV3IHRoaXMuTGF5b3V0Tm9kZShyZW5kZXJOb2RlLCBzcGVjKTtcbiAgICAgICAgaWYgKHRoaXMuX25vZGVPcHRpb25zKSB7XG4gICAgICAgICAgICBub2RlLnNldE9wdGlvbnModGhpcy5fbm9kZU9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG5vZGUuX3ByZXYgPSB1bmRlZmluZWQ7XG4gICAgbm9kZS5fbmV4dCA9IHVuZGVmaW5lZDtcbiAgICBub2RlLl92aWV3U2VxdWVuY2UgPSB1bmRlZmluZWQ7XG4gICAgbm9kZS5fbGF5b3V0Q291bnQgPSAwO1xuICAgIGlmICh0aGlzLl9pbml0TGF5b3V0Tm9kZUZuKSB7XG4gICAgICAgIHRoaXMuX2luaXRMYXlvdXROb2RlRm4uY2FsbCh0aGlzLCBub2RlLCBzcGVjKTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLnJlbW92ZUFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX2ZpcnN0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIHZhciBuZXh0ID0gbm9kZS5fbmV4dDtcbiAgICAgICAgX2Rlc3Ryb3lOb2RlLmNhbGwodGhpcywgbm9kZSk7XG4gICAgICAgIG5vZGUgPSBuZXh0O1xuICAgIH1cbiAgICB0aGlzLl9maXJzdCA9IHVuZGVmaW5lZDtcbn07XG5mdW5jdGlvbiBfZGVzdHJveU5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLl9uZXh0KSB7XG4gICAgICAgIG5vZGUuX25leHQuX3ByZXYgPSBub2RlLl9wcmV2O1xuICAgIH1cbiAgICBpZiAobm9kZS5fcHJldikge1xuICAgICAgICBub2RlLl9wcmV2Ll9uZXh0ID0gbm9kZS5fbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9maXJzdCA9IG5vZGUuX25leHQ7XG4gICAgfVxuICAgIG5vZGUuZGVzdHJveSgpO1xuICAgIGlmICh0aGlzLl9wb29sLmxheW91dE5vZGVzLnNpemUgPCBNQVhfUE9PTF9TSVpFKSB7XG4gICAgICAgIHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuc2l6ZSsrO1xuICAgICAgICBub2RlLl9wcmV2ID0gdW5kZWZpbmVkO1xuICAgICAgICBub2RlLl9uZXh0ID0gdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5maXJzdDtcbiAgICAgICAgdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5maXJzdCA9IG5vZGU7XG4gICAgfVxufVxuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLmdldFN0YXJ0RW51bU5vZGUgPSBmdW5jdGlvbiAobmV4dCkge1xuICAgIGlmIChuZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpcnN0O1xuICAgIH0gZWxzZSBpZiAobmV4dCA9PT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0ICYmIHRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydFByZXYgPyB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQuX25leHQgOiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQ7XG4gICAgfSBlbHNlIGlmIChuZXh0ID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0ICYmICF0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnRQcmV2ID8gdGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0Ll9wcmV2IDogdGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0O1xuICAgIH1cbn07XG5mdW5jdGlvbiBfY29udGV4dEdldENyZWF0ZUFuZE9yZGVyTm9kZXMocmVuZGVyTm9kZSwgcHJldikge1xuICAgIHZhciBub2RlO1xuICAgIHZhciBzdGF0ZSA9IHRoaXMuX2NvbnRleHRTdGF0ZTtcbiAgICBpZiAoIXN0YXRlLnN0YXJ0KSB7XG4gICAgICAgIG5vZGUgPSB0aGlzLl9maXJzdDtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLnJlbmRlck5vZGUgPT09IHJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgbm9kZSA9IHRoaXMuY3JlYXRlTm9kZShyZW5kZXJOb2RlKTtcbiAgICAgICAgICAgIG5vZGUuX25leHQgPSB0aGlzLl9maXJzdDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9maXJzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpcnN0Ll9wcmV2ID0gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2ZpcnN0ID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5zdGFydCA9IG5vZGU7XG4gICAgICAgIHN0YXRlLnN0YXJ0UHJldiA9IHByZXY7XG4gICAgICAgIHN0YXRlLnByZXYgPSBub2RlO1xuICAgICAgICBzdGF0ZS5uZXh0ID0gbm9kZTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIGlmIChwcmV2KSB7XG4gICAgICAgIGlmIChzdGF0ZS5wcmV2Ll9wcmV2ICYmIHN0YXRlLnByZXYuX3ByZXYucmVuZGVyTm9kZSA9PT0gcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgc3RhdGUucHJldiA9IHN0YXRlLnByZXYuX3ByZXY7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUucHJldjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzdGF0ZS5uZXh0Ll9uZXh0ICYmIHN0YXRlLm5leHQuX25leHQucmVuZGVyTm9kZSA9PT0gcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgc3RhdGUubmV4dCA9IHN0YXRlLm5leHQuX25leHQ7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUubmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUucmVuZGVyTm9kZSA9PT0gcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgfVxuICAgIGlmICghbm9kZSkge1xuICAgICAgICBub2RlID0gdGhpcy5jcmVhdGVOb2RlKHJlbmRlck5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChub2RlLl9uZXh0KSB7XG4gICAgICAgICAgICBub2RlLl9uZXh0Ll9wcmV2ID0gbm9kZS5fcHJldjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5fcHJldikge1xuICAgICAgICAgICAgbm9kZS5fcHJldi5fbmV4dCA9IG5vZGUuX25leHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9maXJzdCA9IG5vZGUuX25leHQ7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS5fbmV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgbm9kZS5fcHJldiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHByZXYpIHtcbiAgICAgICAgaWYgKHN0YXRlLnByZXYuX3ByZXYpIHtcbiAgICAgICAgICAgIG5vZGUuX3ByZXYgPSBzdGF0ZS5wcmV2Ll9wcmV2O1xuICAgICAgICAgICAgc3RhdGUucHJldi5fcHJldi5fbmV4dCA9IG5vZGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9maXJzdCA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUucHJldi5fcHJldiA9IG5vZGU7XG4gICAgICAgIG5vZGUuX25leHQgPSBzdGF0ZS5wcmV2O1xuICAgICAgICBzdGF0ZS5wcmV2ID0gbm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3RhdGUubmV4dC5fbmV4dCkge1xuICAgICAgICAgICAgbm9kZS5fbmV4dCA9IHN0YXRlLm5leHQuX25leHQ7XG4gICAgICAgICAgICBzdGF0ZS5uZXh0Ll9uZXh0Ll9wcmV2ID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5uZXh0Ll9uZXh0ID0gbm9kZTtcbiAgICAgICAgbm9kZS5fcHJldiA9IHN0YXRlLm5leHQ7XG4gICAgICAgIHN0YXRlLm5leHQgPSBub2RlO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn1cbmZ1bmN0aW9uIF9jb250ZXh0TmV4dCgpIHtcbiAgICBpZiAoIXRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NvbnRleHQucmV2ZXJzZSkge1xuICAgICAgICB0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlID0gdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgIGlmICghdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVuZGVyTm9kZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UuZ2V0KCk7XG4gICAgaWYgKCFyZW5kZXJOb2RlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHZhciBuZXh0U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlO1xuICAgIGlmICghdGhpcy5fY29udGV4dC5yZXZlcnNlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlLmdldE5leHQoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NvbnRleHRTdGF0ZS5sYXN0UmVuZGVyTm9kZSA9PT0gcmVuZGVyTm9kZSkge1xuICAgICAgICB0aHJvdyAnVmlld1NlcXVlbmNlIGlzIGNvcnJ1cHRlZCwgc2hvdWxkIG5ldmVyIGNvbnRhaW4gdGhlIHNhbWUgcmVuZGVyTm9kZSB0d2ljZSwgaW5kZXg6ICcgKyBuZXh0U2VxdWVuY2UuZ2V0SW5kZXgoKTtcbiAgICB9XG4gICAgdGhpcy5fY29udGV4dFN0YXRlLmxhc3RSZW5kZXJOb2RlID0gcmVuZGVyTm9kZTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJOb2RlOiByZW5kZXJOb2RlLFxuICAgICAgICB2aWV3U2VxdWVuY2U6IG5leHRTZXF1ZW5jZSxcbiAgICAgICAgbmV4dDogdHJ1ZSxcbiAgICAgICAgaW5kZXg6ICsrdGhpcy5fY29udGV4dFN0YXRlLm5leHRHZXRJbmRleFxuICAgIH07XG59XG5mdW5jdGlvbiBfY29udGV4dFByZXYoKSB7XG4gICAgaWYgKCF0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmICghdGhpcy5fY29udGV4dC5yZXZlcnNlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgIGlmICghdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVuZGVyTm9kZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UuZ2V0KCk7XG4gICAgaWYgKCFyZW5kZXJOb2RlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHZhciBwcmV2U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlO1xuICAgIGlmICh0aGlzLl9jb250ZXh0LnJldmVyc2UpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NvbnRleHRTdGF0ZS5sYXN0UmVuZGVyTm9kZSA9PT0gcmVuZGVyTm9kZSkge1xuICAgICAgICB0aHJvdyAnVmlld1NlcXVlbmNlIGlzIGNvcnJ1cHRlZCwgc2hvdWxkIG5ldmVyIGNvbnRhaW4gdGhlIHNhbWUgcmVuZGVyTm9kZSB0d2ljZSwgaW5kZXg6ICcgKyBwcmV2U2VxdWVuY2UuZ2V0SW5kZXgoKTtcbiAgICB9XG4gICAgdGhpcy5fY29udGV4dFN0YXRlLmxhc3RSZW5kZXJOb2RlID0gcmVuZGVyTm9kZTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJOb2RlOiByZW5kZXJOb2RlLFxuICAgICAgICB2aWV3U2VxdWVuY2U6IHByZXZTZXF1ZW5jZSxcbiAgICAgICAgcHJldjogdHJ1ZSxcbiAgICAgICAgaW5kZXg6IC0tdGhpcy5fY29udGV4dFN0YXRlLnByZXZHZXRJbmRleFxuICAgIH07XG59XG5mdW5jdGlvbiBfY29udGV4dEdldChjb250ZXh0Tm9kZU9ySWQpIHtcbiAgICBpZiAodGhpcy5fbm9kZXNCeUlkICYmIChjb250ZXh0Tm9kZU9ySWQgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdHlwZW9mIGNvbnRleHROb2RlT3JJZCA9PT0gJ3N0cmluZycpKSB7XG4gICAgICAgIHZhciByZW5kZXJOb2RlID0gdGhpcy5fbm9kZXNCeUlkW2NvbnRleHROb2RlT3JJZF07XG4gICAgICAgIGlmICghcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVuZGVyTm9kZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaiA9IHJlbmRlck5vZGUubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJOb2RlOiByZW5kZXJOb2RlW2ldLFxuICAgICAgICAgICAgICAgICAgICBhcnJheUVsZW1lbnQ6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlbmRlck5vZGU6IHJlbmRlck5vZGUsXG4gICAgICAgICAgICBieUlkOiB0cnVlXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnRleHROb2RlT3JJZDtcbiAgICB9XG59XG5mdW5jdGlvbiBfY29udGV4dFNldChjb250ZXh0Tm9kZU9ySWQsIHNldCkge1xuICAgIHZhciBjb250ZXh0Tm9kZSA9IHRoaXMuX25vZGVzQnlJZCA/IF9jb250ZXh0R2V0LmNhbGwodGhpcywgY29udGV4dE5vZGVPcklkKSA6IGNvbnRleHROb2RlT3JJZDtcbiAgICBpZiAoY29udGV4dE5vZGUpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBjb250ZXh0Tm9kZS5ub2RlO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0Tm9kZS5uZXh0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHROb2RlLmluZGV4IDwgdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXRJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBMYXlvdXRVdGlsaXR5LmVycm9yKCdOb2RlcyBtdXN0IGJlIGxheWVkIG91dCBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IHdlcmUgcmVxdWVzdGVkIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNldEluZGV4ID0gY29udGV4dE5vZGUuaW5kZXg7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHROb2RlLnByZXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dE5vZGUuaW5kZXggPiB0aGlzLl9jb250ZXh0U3RhdGUucHJldlNldEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIExheW91dFV0aWxpdHkuZXJyb3IoJ05vZGVzIG11c3QgYmUgbGF5ZWQgb3V0IGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZXkgd2VyZSByZXF1ZXN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2V0SW5kZXggPSBjb250ZXh0Tm9kZS5pbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUgPSBfY29udGV4dEdldENyZWF0ZUFuZE9yZGVyTm9kZXMuY2FsbCh0aGlzLCBjb250ZXh0Tm9kZS5yZW5kZXJOb2RlLCBjb250ZXh0Tm9kZS5wcmV2KTtcbiAgICAgICAgICAgIG5vZGUuX3ZpZXdTZXF1ZW5jZSA9IGNvbnRleHROb2RlLnZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIG5vZGUuX2xheW91dENvdW50Kys7XG4gICAgICAgICAgICBpZiAobm9kZS5fbGF5b3V0Q291bnQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb250ZXh0U3RhdGUuYWRkQ291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHROb2RlLm5vZGUgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUudXNlc1RydWVTaXplID0gY29udGV4dE5vZGUudXNlc1RydWVTaXplO1xuICAgICAgICBub2RlLnRydWVTaXplUmVxdWVzdGVkID0gY29udGV4dE5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQ7XG4gICAgICAgIG5vZGUuc2V0KHNldCwgdGhpcy5fY29udGV4dC5zaXplKTtcbiAgICAgICAgY29udGV4dE5vZGUuc2V0ID0gc2V0O1xuICAgIH1cbiAgICByZXR1cm4gc2V0O1xufVxuZnVuY3Rpb24gX2NvbnRleHRSZXNvbHZlU2l6ZShjb250ZXh0Tm9kZU9ySWQsIHBhcmVudFNpemUpIHtcbiAgICB2YXIgY29udGV4dE5vZGUgPSB0aGlzLl9ub2Rlc0J5SWQgPyBfY29udGV4dEdldC5jYWxsKHRoaXMsIGNvbnRleHROb2RlT3JJZCkgOiBjb250ZXh0Tm9kZU9ySWQ7XG4gICAgdmFyIHJlc29sdmVTaXplID0gdGhpcy5fcG9vbC5yZXNvbHZlU2l6ZTtcbiAgICBpZiAoIWNvbnRleHROb2RlKSB7XG4gICAgICAgIHJlc29sdmVTaXplWzBdID0gMDtcbiAgICAgICAgcmVzb2x2ZVNpemVbMV0gPSAwO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZVNpemU7XG4gICAgfVxuICAgIHZhciByZW5kZXJOb2RlID0gY29udGV4dE5vZGUucmVuZGVyTm9kZTtcbiAgICB2YXIgc2l6ZSA9IHJlbmRlck5vZGUuZ2V0U2l6ZSgpO1xuICAgIGlmICghc2l6ZSkge1xuICAgICAgICByZXR1cm4gcGFyZW50U2l6ZTtcbiAgICB9XG4gICAgdmFyIGNvbmZpZ1NpemUgPSByZW5kZXJOb2RlLnNpemUgJiYgcmVuZGVyTm9kZS5fdHJ1ZVNpemVDaGVjayAhPT0gdW5kZWZpbmVkID8gcmVuZGVyTm9kZS5zaXplIDogdW5kZWZpbmVkO1xuICAgIGlmIChjb25maWdTaXplICYmIChjb25maWdTaXplWzBdID09PSB0cnVlIHx8IGNvbmZpZ1NpemVbMV0gPT09IHRydWUpKSB7XG4gICAgICAgIGNvbnRleHROb2RlLnVzZXNUcnVlU2l6ZSA9IHRydWU7XG4gICAgICAgIHZhciBiYWNrdXBTaXplID0gcmVuZGVyTm9kZS5fYmFja3VwU2l6ZTtcbiAgICAgICAgaWYgKHJlbmRlck5vZGUuX2NvbnRlbnREaXJ0eSB8fCByZW5kZXJOb2RlLl90cnVlU2l6ZUNoZWNrKSB7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb250ZXh0Tm9kZS50cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbmRlck5vZGUuX3RydWVTaXplQ2hlY2spIHtcbiAgICAgICAgICAgIGlmIChiYWNrdXBTaXplICYmIGNvbmZpZ1NpemUgIT09IHNpemUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3V2lkdGggPSBjb25maWdTaXplWzBdID09PSB0cnVlID8gTWF0aC5tYXgoYmFja3VwU2l6ZVswXSwgc2l6ZVswXSkgOiBzaXplWzBdO1xuICAgICAgICAgICAgICAgIHZhciBuZXdIZWlnaHQgPSBjb25maWdTaXplWzFdID09PSB0cnVlID8gTWF0aC5tYXgoYmFja3VwU2l6ZVsxXSwgc2l6ZVsxXSkgOiBzaXplWzFdO1xuICAgICAgICAgICAgICAgIGJhY2t1cFNpemVbMF0gPSBuZXdXaWR0aDtcbiAgICAgICAgICAgICAgICBiYWNrdXBTaXplWzFdID0gbmV3SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHNpemUgPSBiYWNrdXBTaXplO1xuICAgICAgICAgICAgICAgIHJlbmRlck5vZGUuX2JhY2t1cFNpemUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgYmFja3VwU2l6ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcmVldmFsVHJ1ZVNpemUgfHwgYmFja3VwU2l6ZSAmJiAoYmFja3VwU2l6ZVswXSAhPT0gc2l6ZVswXSB8fCBiYWNrdXBTaXplWzFdICE9PSBzaXplWzFdKSkge1xuICAgICAgICAgICAgcmVuZGVyTm9kZS5fdHJ1ZVNpemVDaGVjayA9IHRydWU7XG4gICAgICAgICAgICByZW5kZXJOb2RlLl9zaXplRGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fdHJ1ZVNpemVSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghYmFja3VwU2l6ZSkge1xuICAgICAgICAgICAgcmVuZGVyTm9kZS5fYmFja3VwU2l6ZSA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBiYWNrdXBTaXplID0gcmVuZGVyTm9kZS5fYmFja3VwU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBiYWNrdXBTaXplWzBdID0gc2l6ZVswXTtcbiAgICAgICAgYmFja3VwU2l6ZVsxXSA9IHNpemVbMV07XG4gICAgfVxuICAgIGNvbmZpZ1NpemUgPSByZW5kZXJOb2RlLl9ub2RlcyA/IHJlbmRlck5vZGUub3B0aW9ucy5zaXplIDogdW5kZWZpbmVkO1xuICAgIGlmIChjb25maWdTaXplICYmIChjb25maWdTaXplWzBdID09PSB0cnVlIHx8IGNvbmZpZ1NpemVbMV0gPT09IHRydWUpKSB7XG4gICAgICAgIGlmICh0aGlzLl9yZWV2YWxUcnVlU2l6ZSB8fCByZW5kZXJOb2RlLl9ub2Rlcy5fdHJ1ZVNpemVSZXF1ZXN0ZWQpIHtcbiAgICAgICAgICAgIGNvbnRleHROb2RlLnVzZXNUcnVlU2l6ZSA9IHRydWU7XG4gICAgICAgICAgICBjb250ZXh0Tm9kZS50cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNpemVbMF0gPT09IHVuZGVmaW5lZCB8fCBzaXplWzBdID09PSB0cnVlIHx8IHNpemVbMV0gPT09IHVuZGVmaW5lZCB8fCBzaXplWzFdID09PSB0cnVlKSB7XG4gICAgICAgIHJlc29sdmVTaXplWzBdID0gc2l6ZVswXTtcbiAgICAgICAgcmVzb2x2ZVNpemVbMV0gPSBzaXplWzFdO1xuICAgICAgICBzaXplID0gcmVzb2x2ZVNpemU7XG4gICAgICAgIGlmIChzaXplWzBdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHNpemVbMF0gPSBwYXJlbnRTaXplWzBdO1xuICAgICAgICB9IGVsc2UgaWYgKHNpemVbMF0gPT09IHRydWUpIHtcbiAgICAgICAgICAgIHNpemVbMF0gPSAwO1xuICAgICAgICAgICAgdGhpcy5fdHJ1ZVNpemVSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29udGV4dE5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaXplWzFdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHNpemVbMV0gPSBwYXJlbnRTaXplWzFdO1xuICAgICAgICB9IGVsc2UgaWYgKHNpemVbMV0gPT09IHRydWUpIHtcbiAgICAgICAgICAgIHNpemVbMV0gPSAwO1xuICAgICAgICAgICAgdGhpcy5fdHJ1ZVNpemVSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29udGV4dE5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzaXplO1xufVxubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXROb2RlTWFuYWdlcjsiLCJ2YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG5mdW5jdGlvbiBMYXlvdXRVdGlsaXR5KCkge1xufVxuTGF5b3V0VXRpbGl0eS5yZWdpc3RlcmVkSGVscGVycyA9IHt9O1xudmFyIENhcGFiaWxpdGllcyA9IHtcbiAgICAgICAgU0VRVUVOQ0U6IDEsXG4gICAgICAgIERJUkVDVElPTl9YOiAyLFxuICAgICAgICBESVJFQ1RJT05fWTogNCxcbiAgICAgICAgU0NST0xMSU5HOiA4XG4gICAgfTtcbkxheW91dFV0aWxpdHkuQ2FwYWJpbGl0aWVzID0gQ2FwYWJpbGl0aWVzO1xuTGF5b3V0VXRpbGl0eS5ub3JtYWxpemVNYXJnaW5zID0gZnVuY3Rpb24gKG1hcmdpbnMpIHtcbiAgICBpZiAoIW1hcmdpbnMpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG1hcmdpbnMpKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYXJnaW5zLFxuICAgICAgICAgICAgbWFyZ2lucyxcbiAgICAgICAgICAgIG1hcmdpbnMsXG4gICAgICAgICAgICBtYXJnaW5zXG4gICAgICAgIF07XG4gICAgfSBlbHNlIGlmIChtYXJnaW5zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIH0gZWxzZSBpZiAobWFyZ2lucy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG1hcmdpbnNbMF0sXG4gICAgICAgICAgICBtYXJnaW5zWzBdLFxuICAgICAgICAgICAgbWFyZ2luc1swXSxcbiAgICAgICAgICAgIG1hcmdpbnNbMF1cbiAgICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKG1hcmdpbnMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYXJnaW5zWzBdLFxuICAgICAgICAgICAgbWFyZ2luc1sxXSxcbiAgICAgICAgICAgIG1hcmdpbnNbMF0sXG4gICAgICAgICAgICBtYXJnaW5zWzFdXG4gICAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG1hcmdpbnM7XG4gICAgfVxufTtcbkxheW91dFV0aWxpdHkuY2xvbmVTcGVjID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgICB2YXIgY2xvbmUgPSB7fTtcbiAgICBpZiAoc3BlYy5vcGFjaXR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2xvbmUub3BhY2l0eSA9IHNwZWMub3BhY2l0eTtcbiAgICB9XG4gICAgaWYgKHNwZWMuc2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsb25lLnNpemUgPSBzcGVjLnNpemUuc2xpY2UoMCk7XG4gICAgfVxuICAgIGlmIChzcGVjLnRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsb25lLnRyYW5zZm9ybSA9IHNwZWMudHJhbnNmb3JtLnNsaWNlKDApO1xuICAgIH1cbiAgICBpZiAoc3BlYy5vcmlnaW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbG9uZS5vcmlnaW4gPSBzcGVjLm9yaWdpbi5zbGljZSgwKTtcbiAgICB9XG4gICAgaWYgKHNwZWMuYWxpZ24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbG9uZS5hbGlnbiA9IHNwZWMuYWxpZ24uc2xpY2UoMCk7XG4gICAgfVxuICAgIHJldHVybiBjbG9uZTtcbn07XG5mdW5jdGlvbiBfaXNFcXVhbEFycmF5KGEsIGIpIHtcbiAgICBpZiAoYSA9PT0gYikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGEgPT09IHVuZGVmaW5lZCB8fCBiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgaSA9IGEubGVuZ3RoO1xuICAgIGlmIChpICE9PSBiLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbkxheW91dFV0aWxpdHkuaXNFcXVhbFNwZWMgPSBmdW5jdGlvbiAoc3BlYzEsIHNwZWMyKSB7XG4gICAgaWYgKHNwZWMxLm9wYWNpdHkgIT09IHNwZWMyLm9wYWNpdHkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEuc2l6ZSwgc3BlYzIuc2l6ZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEudHJhbnNmb3JtLCBzcGVjMi50cmFuc2Zvcm0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFfaXNFcXVhbEFycmF5KHNwZWMxLm9yaWdpbiwgc3BlYzIub3JpZ2luKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS5hbGlnbiwgc3BlYzIuYWxpZ24pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuTGF5b3V0VXRpbGl0eS5nZXRTcGVjRGlmZlRleHQgPSBmdW5jdGlvbiAoc3BlYzEsIHNwZWMyKSB7XG4gICAgdmFyIHJlc3VsdCA9ICdzcGVjIGRpZmY6JztcbiAgICBpZiAoc3BlYzEub3BhY2l0eSAhPT0gc3BlYzIub3BhY2l0eSkge1xuICAgICAgICByZXN1bHQgKz0gJ1xcbm9wYWNpdHk6ICcgKyBzcGVjMS5vcGFjaXR5ICsgJyAhPSAnICsgc3BlYzIub3BhY2l0eTtcbiAgICB9XG4gICAgaWYgKCFfaXNFcXVhbEFycmF5KHNwZWMxLnNpemUsIHNwZWMyLnNpemUpKSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxuc2l6ZTogJyArIEpTT04uc3RyaW5naWZ5KHNwZWMxLnNpemUpICsgJyAhPSAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzIuc2l6ZSk7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS50cmFuc2Zvcm0sIHNwZWMyLnRyYW5zZm9ybSkpIHtcbiAgICAgICAgcmVzdWx0ICs9ICdcXG50cmFuc2Zvcm06ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMS50cmFuc2Zvcm0pICsgJyAhPSAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzIudHJhbnNmb3JtKTtcbiAgICB9XG4gICAgaWYgKCFfaXNFcXVhbEFycmF5KHNwZWMxLm9yaWdpbiwgc3BlYzIub3JpZ2luKSkge1xuICAgICAgICByZXN1bHQgKz0gJ1xcbm9yaWdpbjogJyArIEpTT04uc3RyaW5naWZ5KHNwZWMxLm9yaWdpbikgKyAnICE9ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMi5vcmlnaW4pO1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEuYWxpZ24sIHNwZWMyLmFsaWduKSkge1xuICAgICAgICByZXN1bHQgKz0gJ1xcbmFsaWduOiAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzEuYWxpZ24pICsgJyAhPSAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzIuYWxpZ24pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbkxheW91dFV0aWxpdHkuZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKCdFUlJPUjogJyArIG1lc3NhZ2UpO1xuICAgIHRocm93IG1lc3NhZ2U7XG59O1xuTGF5b3V0VXRpbGl0eS53YXJuaW5nID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmxvZygnV0FSTklORzogJyArIG1lc3NhZ2UpO1xufTtcbkxheW91dFV0aWxpdHkubG9nID0gZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgbWVzc2FnZSA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhcmcgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGlmIChhcmcgaW5zdGFuY2VvZiBPYmplY3QgfHwgYXJnIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgKz0gSlNPTi5zdHJpbmdpZnkoYXJnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgKz0gYXJnO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xufTtcbkxheW91dFV0aWxpdHkuY29tYmluZU9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9uczEsIG9wdGlvbnMyLCBmb3JjZUNsb25lKSB7XG4gICAgaWYgKG9wdGlvbnMxICYmICFvcHRpb25zMiAmJiAhZm9yY2VDbG9uZSkge1xuICAgICAgICByZXR1cm4gb3B0aW9uczE7XG4gICAgfSBlbHNlIGlmICghb3B0aW9uczEgJiYgb3B0aW9uczIgJiYgIWZvcmNlQ2xvbmUpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMyO1xuICAgIH1cbiAgICB2YXIgb3B0aW9ucyA9IFV0aWxpdHkuY2xvbmUob3B0aW9uczEgfHwge30pO1xuICAgIGlmIChvcHRpb25zMikge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9uczIpIHtcbiAgICAgICAgICAgIG9wdGlvbnNba2V5XSA9IG9wdGlvbnMyW2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9wdGlvbnM7XG59O1xuTGF5b3V0VXRpbGl0eS5yZWdpc3RlckhlbHBlciA9IGZ1bmN0aW9uIChuYW1lLCBIZWxwZXIpIHtcbiAgICBpZiAoIUhlbHBlci5wcm90b3R5cGUucGFyc2UpIHtcbiAgICAgICAgTGF5b3V0VXRpbGl0eS5lcnJvcignVGhlIGxheW91dC1oZWxwZXIgZm9yIG5hbWUgXCInICsgbmFtZSArICdcIiBpcyByZXF1aXJlZCB0byBzdXBwb3J0IHRoZSBcInBhcnNlXCIgbWV0aG9kJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlZ2lzdGVyZWRIZWxwZXJzW25hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgTGF5b3V0VXRpbGl0eS53YXJuaW5nKCdBIGxheW91dC1oZWxwZXIgd2l0aCB0aGUgbmFtZSBcIicgKyBuYW1lICsgJ1wiIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCBhbmQgd2lsbCBiZSBvdmVyd3JpdHRlbicpO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdGVyZWRIZWxwZXJzW25hbWVdID0gSGVscGVyO1xufTtcbkxheW91dFV0aWxpdHkudW5yZWdpc3RlckhlbHBlciA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMucmVnaXN0ZXJlZEhlbHBlcnNbbmFtZV07XG59O1xuTGF5b3V0VXRpbGl0eS5nZXRSZWdpc3RlcmVkSGVscGVyID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RlcmVkSGVscGVyc1tuYW1lXTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IExheW91dFV0aWxpdHk7IiwidmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbnZhciBMYXlvdXRDb250cm9sbGVyID0gcmVxdWlyZSgnLi9MYXlvdXRDb250cm9sbGVyJyk7XG52YXIgTGF5b3V0Tm9kZSA9IHJlcXVpcmUoJy4vTGF5b3V0Tm9kZScpO1xudmFyIEZsb3dMYXlvdXROb2RlID0gcmVxdWlyZSgnLi9GbG93TGF5b3V0Tm9kZScpO1xudmFyIExheW91dE5vZGVNYW5hZ2VyID0gcmVxdWlyZSgnLi9MYXlvdXROb2RlTWFuYWdlcicpO1xudmFyIENvbnRhaW5lclN1cmZhY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuc3VyZmFjZXMuQ29udGFpbmVyU3VyZmFjZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5zdXJmYWNlcy5Db250YWluZXJTdXJmYWNlIDogbnVsbDtcbnZhciBUcmFuc2Zvcm0gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiBudWxsO1xudmFyIEV2ZW50SGFuZGxlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLkV2ZW50SGFuZGxlciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLkV2ZW50SGFuZGxlciA6IG51bGw7XG52YXIgR3JvdXAgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5Hcm91cCA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLkdyb3VwIDogbnVsbDtcbnZhciBWZWN0b3IgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMubWF0aC5WZWN0b3IgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMubWF0aC5WZWN0b3IgOiBudWxsO1xudmFyIFBoeXNpY3NFbmdpbmUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMucGh5c2ljcy5QaHlzaWNzRW5naW5lIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnBoeXNpY3MuUGh5c2ljc0VuZ2luZSA6IG51bGw7XG52YXIgUGFydGljbGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMucGh5c2ljcy5ib2RpZXMuUGFydGljbGUgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMucGh5c2ljcy5ib2RpZXMuUGFydGljbGUgOiBudWxsO1xudmFyIERyYWcgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMucGh5c2ljcy5mb3JjZXMuRHJhZyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLmZvcmNlcy5EcmFnIDogbnVsbDtcbnZhciBTcHJpbmcgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMucGh5c2ljcy5mb3JjZXMuU3ByaW5nIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnBoeXNpY3MuZm9yY2VzLlNwcmluZyA6IG51bGw7XG52YXIgU2Nyb2xsU3luYyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5pbnB1dHMuU2Nyb2xsU3luYyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5pbnB1dHMuU2Nyb2xsU3luYyA6IG51bGw7XG52YXIgVmlld1NlcXVlbmNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVmlld1NlcXVlbmNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuVmlld1NlcXVlbmNlIDogbnVsbDtcbnZhciBCb3VuZHMgPSB7XG4gICAgICAgIE5PTkU6IDAsXG4gICAgICAgIFBSRVY6IDEsXG4gICAgICAgIE5FWFQ6IDIsXG4gICAgICAgIEJPVEg6IDNcbiAgICB9O1xudmFyIFNwcmluZ1NvdXJjZSA9IHtcbiAgICAgICAgTk9ORTogJ25vbmUnLFxuICAgICAgICBORVhUQk9VTkRTOiAnbmV4dC1ib3VuZHMnLFxuICAgICAgICBQUkVWQk9VTkRTOiAncHJldi1ib3VuZHMnLFxuICAgICAgICBNSU5TSVpFOiAnbWluaW1hbC1zaXplJyxcbiAgICAgICAgR09UT1NFUVVFTkNFOiAnZ290by1zZXF1ZW5jZScsXG4gICAgICAgIEVOU1VSRVZJU0lCTEU6ICdlbnN1cmUtdmlzaWJsZScsXG4gICAgICAgIEdPVE9QUkVWRElSRUNUSU9OOiAnZ290by1wcmV2LWRpcmVjdGlvbicsXG4gICAgICAgIEdPVE9ORVhURElSRUNUSU9OOiAnZ290by1uZXh0LWRpcmVjdGlvbidcbiAgICB9O1xudmFyIFBhZ2luYXRpb25Nb2RlID0ge1xuICAgICAgICBQQUdFOiAwLFxuICAgICAgICBTQ1JPTEw6IDFcbiAgICB9O1xuZnVuY3Rpb24gU2Nyb2xsQ29udHJvbGxlcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IExheW91dFV0aWxpdHkuY29tYmluZU9wdGlvbnMoU2Nyb2xsQ29udHJvbGxlci5ERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xuICAgIHZhciBsYXlvdXRNYW5hZ2VyID0gbmV3IExheW91dE5vZGVNYW5hZ2VyKG9wdGlvbnMuZmxvdyA/IEZsb3dMYXlvdXROb2RlIDogTGF5b3V0Tm9kZSwgX2luaXRMYXlvdXROb2RlLmJpbmQodGhpcykpO1xuICAgIExheW91dENvbnRyb2xsZXIuY2FsbCh0aGlzLCBvcHRpb25zLCBsYXlvdXRNYW5hZ2VyKTtcbiAgICB0aGlzLl9zY3JvbGwgPSB7XG4gICAgICAgIGFjdGl2ZVRvdWNoZXM6IFtdLFxuICAgICAgICBwZTogbmV3IFBoeXNpY3NFbmdpbmUoKSxcbiAgICAgICAgcGFydGljbGU6IG5ldyBQYXJ0aWNsZSh0aGlzLm9wdGlvbnMuc2Nyb2xsUGFydGljbGUpLFxuICAgICAgICBkcmFnRm9yY2U6IG5ldyBEcmFnKHRoaXMub3B0aW9ucy5zY3JvbGxEcmFnKSxcbiAgICAgICAgZnJpY3Rpb25Gb3JjZTogbmV3IERyYWcodGhpcy5vcHRpb25zLnNjcm9sbEZyaWN0aW9uKSxcbiAgICAgICAgc3ByaW5nVmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgICAgc3ByaW5nRm9yY2U6IG5ldyBTcHJpbmcodGhpcy5vcHRpb25zLnNjcm9sbFNwcmluZyksXG4gICAgICAgIHNwcmluZ0VuZFN0YXRlOiBuZXcgVmVjdG9yKFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdKSxcbiAgICAgICAgZ3JvdXBTdGFydDogMCxcbiAgICAgICAgZ3JvdXBUcmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxEZWx0YTogMCxcbiAgICAgICAgbm9ybWFsaXplZFNjcm9sbERlbHRhOiAwLFxuICAgICAgICBzY3JvbGxGb3JjZTogMCxcbiAgICAgICAgc2Nyb2xsRm9yY2VDb3VudDogMCxcbiAgICAgICAgdW5ub3JtYWxpemVkU2Nyb2xsT2Zmc2V0OiAwLFxuICAgICAgICBpc1Njcm9sbGluZzogZmFsc2VcbiAgICB9O1xuICAgIHRoaXMuX2RlYnVnID0ge1xuICAgICAgICBsYXlvdXRDb3VudDogMCxcbiAgICAgICAgY29tbWl0Q291bnQ6IDBcbiAgICB9O1xuICAgIHRoaXMuZ3JvdXAgPSBuZXcgR3JvdXAoKTtcbiAgICB0aGlzLmdyb3VwLmFkZCh7IHJlbmRlcjogX2lubmVyUmVuZGVyLmJpbmQodGhpcykgfSk7XG4gICAgdGhpcy5fc2Nyb2xsLnBlLmFkZEJvZHkodGhpcy5fc2Nyb2xsLnBhcnRpY2xlKTtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5zY3JvbGxEcmFnLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5kcmFnRm9yY2VJZCA9IHRoaXMuX3Njcm9sbC5wZS5hdHRhY2godGhpcy5fc2Nyb2xsLmRyYWdGb3JjZSwgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuc2Nyb2xsRnJpY3Rpb24uZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLmZyaWN0aW9uRm9yY2VJZCA9IHRoaXMuX3Njcm9sbC5wZS5hdHRhY2godGhpcy5fc2Nyb2xsLmZyaWN0aW9uRm9yY2UsIHRoaXMuX3Njcm9sbC5wYXJ0aWNsZSk7XG4gICAgfVxuICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZS5zZXRPcHRpb25zKHsgYW5jaG9yOiB0aGlzLl9zY3JvbGwuc3ByaW5nRW5kU3RhdGUgfSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbigndG91Y2hzdGFydCcsIF90b3VjaFN0YXJ0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQub24oJ3RvdWNobW92ZScsIF90b3VjaE1vdmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbigndG91Y2hlbmQnLCBfdG91Y2hFbmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbigndG91Y2hjYW5jZWwnLCBfdG91Y2hFbmQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbignbW91c2Vkb3duJywgX21vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZXVwJywgX21vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbignbW91c2Vtb3ZlJywgX21vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9zY3JvbGxTeW5jID0gbmV3IFNjcm9sbFN5bmModGhpcy5vcHRpb25zLnNjcm9sbFN5bmMpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQucGlwZSh0aGlzLl9zY3JvbGxTeW5jKTtcbiAgICB0aGlzLl9zY3JvbGxTeW5jLm9uKCd1cGRhdGUnLCBfc2Nyb2xsVXBkYXRlLmJpbmQodGhpcykpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMudXNlQ29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gbmV3IENvbnRhaW5lclN1cmZhY2UodGhpcy5vcHRpb25zLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFkZCh7XG4gICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYXV0b1BpcGVFdmVudHMpIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlKHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgICAgIEV2ZW50SGFuZGxlci5zZXRJbnB1dEhhbmRsZXIodGhpcy5jb250YWluZXIsIHRoaXMpO1xuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcy5jb250YWluZXIsIHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxufVxuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExheW91dENvbnRyb2xsZXIucHJvdG90eXBlKTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2Nyb2xsQ29udHJvbGxlcjtcblNjcm9sbENvbnRyb2xsZXIuQm91bmRzID0gQm91bmRzO1xuU2Nyb2xsQ29udHJvbGxlci5QYWdpbmF0aW9uTW9kZSA9IFBhZ2luYXRpb25Nb2RlO1xuU2Nyb2xsQ29udHJvbGxlci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgdXNlQ29udGFpbmVyOiBmYWxzZSxcbiAgICBjb250YWluZXI6IHsgcHJvcGVydGllczogeyBvdmVyZmxvdzogJ2hpZGRlbicgfSB9LFxuICAgIHNjcm9sbFBhcnRpY2xlOiB7fSxcbiAgICBzY3JvbGxEcmFnOiB7XG4gICAgICAgIGZvcmNlRnVuY3Rpb246IERyYWcuRk9SQ0VfRlVOQ1RJT05TLlFVQURSQVRJQyxcbiAgICAgICAgc3RyZW5ndGg6IDAuMDAxLFxuICAgICAgICBkaXNhYmxlZDogdHJ1ZVxuICAgIH0sXG4gICAgc2Nyb2xsRnJpY3Rpb246IHtcbiAgICAgICAgZm9yY2VGdW5jdGlvbjogRHJhZy5GT1JDRV9GVU5DVElPTlMuTElORUFSLFxuICAgICAgICBzdHJlbmd0aDogMC4wMDI1LFxuICAgICAgICBkaXNhYmxlZDogZmFsc2VcbiAgICB9LFxuICAgIHNjcm9sbFNwcmluZzoge1xuICAgICAgICBkYW1waW5nUmF0aW86IDEsXG4gICAgICAgIHBlcmlvZDogMzUwXG4gICAgfSxcbiAgICBzY3JvbGxTeW5jOiB7IHNjYWxlOiAwLjIgfSxcbiAgICBvdmVyc2Nyb2xsOiB0cnVlLFxuICAgIHBhZ2luYXRlZDogZmFsc2UsXG4gICAgcGFnaW5hdGlvbk1vZGU6IFBhZ2luYXRpb25Nb2RlLlBBR0UsXG4gICAgcGFnaW5hdGlvbkVuZXJneVRocmVzc2hvbGQ6IDAuMDEsXG4gICAgYWxpZ25tZW50OiAwLFxuICAgIHRvdWNoTW92ZURpcmVjdGlvblRocmVzc2hvbGQ6IHVuZGVmaW5lZCxcbiAgICB0b3VjaE1vdmVOb1ZlbG9jaXR5RHVyYXRpb246IDEwMCxcbiAgICBtb3VzZU1vdmU6IGZhbHNlLFxuICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgbGF5b3V0QWxsOiBmYWxzZSxcbiAgICBhbHdheXNMYXlvdXQ6IGZhbHNlLFxuICAgIGV4dHJhQm91bmRzU3BhY2U6IFtcbiAgICAgICAgMTAwLFxuICAgICAgICAxMDBcbiAgICBdLFxuICAgIGRlYnVnOiBmYWxzZVxufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldE9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zKTtcbiAgICBpZiAodGhpcy5fc2Nyb2xsKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnNjcm9sbFNwcmluZykge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlLnNldE9wdGlvbnMob3B0aW9ucy5zY3JvbGxTcHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLnNjcm9sbERyYWcpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5kcmFnRm9yY2Uuc2V0T3B0aW9ucyhvcHRpb25zLnNjcm9sbERyYWcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnNjcm9sbFN5bmMgJiYgdGhpcy5fc2Nyb2xsU3luYykge1xuICAgICAgICB0aGlzLl9zY3JvbGxTeW5jLnNldE9wdGlvbnMob3B0aW9ucy5zY3JvbGxTeW5jKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuZnVuY3Rpb24gX2luaXRMYXlvdXROb2RlKG5vZGUsIHNwZWMpIHtcbiAgICBpZiAoIXNwZWMgJiYgdGhpcy5vcHRpb25zLmZsb3dPcHRpb25zLmluc2VydFNwZWMpIHtcbiAgICAgICAgbm9kZS5zZXRTcGVjKHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucy5pbnNlcnRTcGVjKTtcbiAgICB9XG59XG5mdW5jdGlvbiBfdXBkYXRlU3ByaW5nKCkge1xuICAgIHZhciBzcHJpbmdWYWx1ZSA9IHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50ID8gdW5kZWZpbmVkIDogdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc3ByaW5nVmFsdWUgIT09IHNwcmluZ1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdWYWx1ZSA9IHNwcmluZ1ZhbHVlO1xuICAgICAgICBpZiAoc3ByaW5nVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZUlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwucGUuZGV0YWNoKHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZUlkKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nRm9yY2VJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zY3JvbGwuc3ByaW5nRm9yY2VJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlSWQgPSB0aGlzLl9zY3JvbGwucGUuYXR0YWNoKHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZSwgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdFbmRTdGF0ZS5zZXQxRChzcHJpbmdWYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwucGUud2FrZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gX21vdXNlRG93bihldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLm1vdXNlTW92ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwubW91c2VNb3ZlKSB7XG4gICAgICAgIHRoaXMucmVsZWFzZVNjcm9sbEZvcmNlKHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuZGVsdGEpO1xuICAgIH1cbiAgICB2YXIgY3VycmVudCA9IFtcbiAgICAgICAgICAgIGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICBldmVudC5jbGllbnRZXG4gICAgICAgIF07XG4gICAgdmFyIHRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUgPSB7XG4gICAgICAgIGRlbHRhOiAwLFxuICAgICAgICBzdGFydDogY3VycmVudCxcbiAgICAgICAgY3VycmVudDogY3VycmVudCxcbiAgICAgICAgcHJldjogY3VycmVudCxcbiAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgcHJldlRpbWU6IHRpbWVcbiAgICB9O1xuICAgIHRoaXMuYXBwbHlTY3JvbGxGb3JjZSh0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmRlbHRhKTtcbn1cbmZ1bmN0aW9uIF9tb3VzZU1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbC5tb3VzZU1vdmUgfHwgIXRoaXMub3B0aW9ucy5lbmFibGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIG1vdmVEaXJlY3Rpb24gPSBNYXRoLmF0YW4yKE1hdGguYWJzKGV2ZW50LmNsaWVudFkgLSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnByZXZbMV0pLCBNYXRoLmFicyhldmVudC5jbGllbnRYIC0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5wcmV2WzBdKSkgLyAoTWF0aC5QSSAvIDIpO1xuICAgIHZhciBkaXJlY3Rpb25EaWZmID0gTWF0aC5hYnModGhpcy5fZGlyZWN0aW9uIC0gbW92ZURpcmVjdGlvbik7XG4gICAgaWYgKHRoaXMub3B0aW9ucy50b3VjaE1vdmVEaXJlY3Rpb25UaHJlc3Nob2xkID09PSB1bmRlZmluZWQgfHwgZGlyZWN0aW9uRGlmZiA8PSB0aGlzLm9wdGlvbnMudG91Y2hNb3ZlRGlyZWN0aW9uVGhyZXNzaG9sZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnByZXYgPSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmN1cnJlbnQ7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuY3VycmVudCA9IFtcbiAgICAgICAgICAgIGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICBldmVudC5jbGllbnRZXG4gICAgICAgIF07XG4gICAgICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldlRpbWUgPSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnRpbWU7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuZGlyZWN0aW9uID0gbW92ZURpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS50aW1lID0gRGF0ZS5ub3coKTtcbiAgICB9XG4gICAgdmFyIGRlbHRhID0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5jdXJyZW50W3RoaXMuX2RpcmVjdGlvbl0gLSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnN0YXJ0W3RoaXMuX2RpcmVjdGlvbl07XG4gICAgdGhpcy51cGRhdGVTY3JvbGxGb3JjZSh0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmRlbHRhLCBkZWx0YSk7XG4gICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5kZWx0YSA9IGRlbHRhO1xufVxuZnVuY3Rpb24gX21vdXNlVXAoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbC5tb3VzZU1vdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdmVsb2NpdHkgPSAwO1xuICAgIHZhciBkaWZmVGltZSA9IHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUudGltZSAtIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldlRpbWU7XG4gICAgaWYgKGRpZmZUaW1lID4gMCAmJiBEYXRlLm5vdygpIC0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS50aW1lIDw9IHRoaXMub3B0aW9ucy50b3VjaE1vdmVOb1ZlbG9jaXR5RHVyYXRpb24pIHtcbiAgICAgICAgdmFyIGRpZmZPZmZzZXQgPSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmN1cnJlbnRbdGhpcy5fZGlyZWN0aW9uXSAtIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldlt0aGlzLl9kaXJlY3Rpb25dO1xuICAgICAgICB2ZWxvY2l0eSA9IGRpZmZPZmZzZXQgLyBkaWZmVGltZTtcbiAgICB9XG4gICAgdGhpcy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5kZWx0YSwgdmVsb2NpdHkpO1xuICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUgPSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBfdG91Y2hTdGFydChldmVudCkge1xuICAgIGlmICghdGhpcy5fdG91Y2hFbmRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX3RvdWNoRW5kRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudDIpIHtcbiAgICAgICAgICAgIGV2ZW50Mi50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl90b3VjaEVuZEV2ZW50TGlzdGVuZXIpO1xuICAgICAgICAgICAgX3RvdWNoRW5kLmNhbGwodGhpcywgZXZlbnQyKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuICAgIH1cbiAgICB2YXIgb2xkVG91Y2hlc0NvdW50ID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgajtcbiAgICB2YXIgdG91Y2hGb3VuZDtcbiAgICB3aGlsZSAoaSA8IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICB2YXIgYWN0aXZlVG91Y2ggPSB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlc1tpXTtcbiAgICAgICAgdG91Y2hGb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgZXZlbnQudG91Y2hlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHRvdWNoID0gZXZlbnQudG91Y2hlc1tqXTtcbiAgICAgICAgICAgIGlmICh0b3VjaC5pZGVudGlmaWVyID09PSBhY3RpdmVUb3VjaC5pZCkge1xuICAgICAgICAgICAgICAgIHRvdWNoRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdG91Y2hGb3VuZCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBldmVudC50b3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkVG91Y2ggPSBldmVudC50b3VjaGVzW2ldO1xuICAgICAgICB0b3VjaEZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzW2pdLmlkID09PSBjaGFuZ2VkVG91Y2guaWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgIHRvdWNoRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdG91Y2hGb3VuZCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBbXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWRUb3VjaC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkVG91Y2guY2xpZW50WVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB2YXIgdGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpZDogY2hhbmdlZFRvdWNoLmlkZW50aWZpZXIsXG4gICAgICAgICAgICAgICAgc3RhcnQ6IGN1cnJlbnQsXG4gICAgICAgICAgICAgICAgY3VycmVudDogY3VycmVudCxcbiAgICAgICAgICAgICAgICBwcmV2OiBjdXJyZW50LFxuICAgICAgICAgICAgICAgIHRpbWU6IHRpbWUsXG4gICAgICAgICAgICAgICAgcHJldlRpbWU6IHRpbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2hhbmdlZFRvdWNoLnRhcmdldC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3RvdWNoRW5kRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvbGRUb3VjaGVzQ291bnQgJiYgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuYXBwbHlTY3JvbGxGb3JjZSgwKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEgPSAwO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF90b3VjaE1vdmUoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmFibGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHByaW1hcnlUb3VjaDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkVG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHRvdWNoID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXNbal07XG4gICAgICAgICAgICBpZiAodG91Y2guaWQgPT09IGNoYW5nZWRUb3VjaC5pZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1vdmVEaXJlY3Rpb24gPSBNYXRoLmF0YW4yKE1hdGguYWJzKGNoYW5nZWRUb3VjaC5jbGllbnRZIC0gdG91Y2gucHJldlsxXSksIE1hdGguYWJzKGNoYW5nZWRUb3VjaC5jbGllbnRYIC0gdG91Y2gucHJldlswXSkpIC8gKE1hdGguUEkgLyAyKTtcbiAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aW9uRGlmZiA9IE1hdGguYWJzKHRoaXMuX2RpcmVjdGlvbiAtIG1vdmVEaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMudG91Y2hNb3ZlRGlyZWN0aW9uVGhyZXNzaG9sZCA9PT0gdW5kZWZpbmVkIHx8IGRpcmVjdGlvbkRpZmYgPD0gdGhpcy5vcHRpb25zLnRvdWNoTW92ZURpcmVjdGlvblRocmVzc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2gucHJldiA9IHRvdWNoLmN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRvdWNoLmN1cnJlbnQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkVG91Y2guY2xpZW50WCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWRUb3VjaC5jbGllbnRZXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIHRvdWNoLnByZXZUaW1lID0gdG91Y2gudGltZTtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2guZGlyZWN0aW9uID0gbW92ZURpcmVjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2gudGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUb3VjaCA9IGogPT09IDAgPyB0b3VjaCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByaW1hcnlUb3VjaCkge1xuICAgICAgICB2YXIgZGVsdGEgPSBwcmltYXJ5VG91Y2guY3VycmVudFt0aGlzLl9kaXJlY3Rpb25dIC0gcHJpbWFyeVRvdWNoLnN0YXJ0W3RoaXMuX2RpcmVjdGlvbl07XG4gICAgICAgIHRoaXMudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEsIGRlbHRhKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEgPSBkZWx0YTtcbiAgICB9XG59XG5mdW5jdGlvbiBfdG91Y2hFbmQoZXZlbnQpIHtcbiAgICB2YXIgcHJpbWFyeVRvdWNoID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoID8gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXNbMF0gOiB1bmRlZmluZWQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudC5jaGFuZ2VkVG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hhbmdlZFRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbaV07XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciB0b3VjaCA9IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzW2pdO1xuICAgICAgICAgICAgaWYgKHRvdWNoLmlkID09PSBjaGFuZ2VkVG91Y2guaWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gMCAmJiB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1ByaW1hcnlUb3VjaCA9IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzWzBdO1xuICAgICAgICAgICAgICAgICAgICBuZXdQcmltYXJ5VG91Y2guc3RhcnRbMF0gPSBuZXdQcmltYXJ5VG91Y2guY3VycmVudFswXSAtICh0b3VjaC5jdXJyZW50WzBdIC0gdG91Y2guc3RhcnRbMF0pO1xuICAgICAgICAgICAgICAgICAgICBuZXdQcmltYXJ5VG91Y2guc3RhcnRbMV0gPSBuZXdQcmltYXJ5VG91Y2guY3VycmVudFsxXSAtICh0b3VjaC5jdXJyZW50WzFdIC0gdG91Y2guc3RhcnRbMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXByaW1hcnlUb3VjaCB8fCB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdmVsb2NpdHkgPSAwO1xuICAgIHZhciBkaWZmVGltZSA9IHByaW1hcnlUb3VjaC50aW1lIC0gcHJpbWFyeVRvdWNoLnByZXZUaW1lO1xuICAgIGlmIChkaWZmVGltZSA+IDAgJiYgRGF0ZS5ub3coKSAtIHByaW1hcnlUb3VjaC50aW1lIDw9IHRoaXMub3B0aW9ucy50b3VjaE1vdmVOb1ZlbG9jaXR5RHVyYXRpb24pIHtcbiAgICAgICAgdmFyIGRpZmZPZmZzZXQgPSBwcmltYXJ5VG91Y2guY3VycmVudFt0aGlzLl9kaXJlY3Rpb25dIC0gcHJpbWFyeVRvdWNoLnByZXZbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICAgICAgdmVsb2NpdHkgPSBkaWZmT2Zmc2V0IC8gZGlmZlRpbWU7XG4gICAgfVxuICAgIHZhciBkZWx0YSA9IHRoaXMuX3Njcm9sbC50b3VjaERlbHRhO1xuICAgIHRoaXMucmVsZWFzZVNjcm9sbEZvcmNlKGRlbHRhLCB2ZWxvY2l0eSk7XG4gICAgdGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGEgPSAwO1xufVxuZnVuY3Rpb24gX3Njcm9sbFVwZGF0ZShldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgb2Zmc2V0ID0gQXJyYXkuaXNBcnJheShldmVudC5kZWx0YSkgPyBldmVudC5kZWx0YVt0aGlzLl9kaXJlY3Rpb25dIDogZXZlbnQuZGVsdGE7XG4gICAgdGhpcy5zY3JvbGwob2Zmc2V0KTtcbn1cbmZ1bmN0aW9uIF9zZXRQYXJ0aWNsZShwb3NpdGlvbiwgdmVsb2NpdHksIHBoYXNlKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlVmFsdWUgPSBwb3NpdGlvbjtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlLnNldFBvc2l0aW9uMUQocG9zaXRpb24pO1xuICAgIH1cbiAgICBpZiAodmVsb2NpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgb2xkVmVsb2NpdHkgPSB0aGlzLl9zY3JvbGwucGFydGljbGUuZ2V0VmVsb2NpdHkxRCgpO1xuICAgICAgICBpZiAob2xkVmVsb2NpdHkgIT09IHZlbG9jaXR5KSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwucGFydGljbGUuc2V0VmVsb2NpdHkxRCh2ZWxvY2l0eSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfY2FsY1Njcm9sbE9mZnNldChub3JtYWxpemUsIHJlZnJlc2hQYXJ0aWNsZSkge1xuICAgIGlmIChyZWZyZXNoUGFydGljbGUgfHwgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwucGFydGljbGVWYWx1ZSA9IHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5nZXRQb3NpdGlvbjFEKCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5wYXJ0aWNsZVZhbHVlID0gTWF0aC5yb3VuZCh0aGlzLl9zY3JvbGwucGFydGljbGVWYWx1ZSAqIDEwMDApIC8gMTAwMDtcbiAgICB9XG4gICAgdmFyIHNjcm9sbE9mZnNldCA9IHRoaXMuX3Njcm9sbC5wYXJ0aWNsZVZhbHVlO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGEgfHwgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YSkge1xuICAgICAgICBzY3JvbGxPZmZzZXQgKz0gdGhpcy5fc2Nyb2xsLnNjcm9sbERlbHRhICsgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YTtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkICYgQm91bmRzLlBSRVYgJiYgc2Nyb2xsT2Zmc2V0ID4gdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uIHx8IHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkICYgQm91bmRzLk5FWFQgJiYgc2Nyb2xsT2Zmc2V0IDwgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uIHx8IHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID09PSBCb3VuZHMuQk9USCkge1xuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3JtYWxpemUpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fc2Nyb2xsLnNjcm9sbERlbHRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YSA9IDA7XG4gICAgICAgICAgICAgICAgX3NldFBhcnRpY2xlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0LCB1bmRlZmluZWQsICdfY2FsY1Njcm9sbE9mZnNldCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLm5vcm1hbGl6ZWRTY3JvbGxEZWx0YSArPSB0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGE7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGEgPSAwO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCAmJiB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgPSAoc2Nyb2xsT2Zmc2V0ICsgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlICsgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uKSAvIDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgKz0gdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLm92ZXJzY3JvbGwpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID09PSBCb3VuZHMuQk9USCB8fCB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9PT0gQm91bmRzLlBSRVYgJiYgc2Nyb2xsT2Zmc2V0ID4gdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uIHx8IHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID09PSBCb3VuZHMuTkVYVCAmJiBzY3JvbGxPZmZzZXQgPCB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24pIHtcbiAgICAgICAgICAgIHNjcm9sbE9mZnNldCA9IHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2Nyb2xsT2Zmc2V0O1xufVxuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuX2NhbGNTY3JvbGxIZWlnaHQgPSBmdW5jdGlvbiAobmV4dCwgbGFzdE5vZGVPbmx5KSB7XG4gICAgdmFyIGNhbGNlZEhlaWdodCA9IDA7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKG5leHQpO1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlLl9pbnZhbGlkYXRlZCkge1xuICAgICAgICAgICAgaWYgKG5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjYWxjZWRIZWlnaHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5zY3JvbGxMZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNhbGNlZEhlaWdodCA9IGxhc3ROb2RlT25seSA/IG5vZGUuc2Nyb2xsTGVuZ3RoIDogY2FsY2VkSGVpZ2h0ICsgbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXh0ICYmIGxhc3ROb2RlT25seSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5leHQgPyBub2RlLl9uZXh0IDogbm9kZS5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGNlZEhlaWdodDtcbn07XG5mdW5jdGlvbiBfY2FsY0JvdW5kcyhzaXplLCBzY3JvbGxPZmZzZXQpIHtcbiAgICB2YXIgcHJldkhlaWdodCA9IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQoZmFsc2UpO1xuICAgIHZhciBuZXh0SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlKTtcbiAgICB2YXIgZW5mb3JlTWluU2l6ZSA9IHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMgJiYgdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcy5zZXF1ZW50aWFsU2Nyb2xsaW5nT3B0aW1pemVkO1xuICAgIHZhciB0b3RhbEhlaWdodDtcbiAgICBpZiAoZW5mb3JlTWluU2l6ZSkge1xuICAgICAgICBpZiAobmV4dEhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHByZXZIZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdG90YWxIZWlnaHQgPSBwcmV2SGVpZ2h0ICsgbmV4dEhlaWdodDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG90YWxIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiB0b3RhbEhlaWdodCA8PSBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID0gQm91bmRzLkJPVEg7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gLW5leHRIZWlnaHQgOiBwcmV2SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5NSU5TSVpFO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgIGlmIChlbmZvcmVNaW5TaXplKSB7XG4gICAgICAgICAgICBpZiAobmV4dEhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHNjcm9sbE9mZnNldCArIG5leHRIZWlnaHQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID0gQm91bmRzLk5FWFQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gLW5leHRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5ORVhUQk9VTkRTO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBmaXJzdFByZXZJdGVtSGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodChmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAobmV4dEhlaWdodCAhPT0gdW5kZWZpbmVkICYmIGZpcnN0UHJldkl0ZW1IZWlnaHQgJiYgc2Nyb2xsT2Zmc2V0ICsgbmV4dEhlaWdodCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSA8PSBmaXJzdFByZXZJdGVtSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuTkVYVDtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBuZXh0SGVpZ2h0IC0gKHNpemVbdGhpcy5fZGlyZWN0aW9uXSAtIGZpcnN0UHJldkl0ZW1IZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuTkVYVEJPVU5EUztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocHJldkhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHNjcm9sbE9mZnNldCAtIHByZXZIZWlnaHQgPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuUFJFVjtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHByZXZIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLlBSRVZCT1VORFM7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgaWYgKHByZXZIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBzY3JvbGxPZmZzZXQgLSBwcmV2SGVpZ2h0ID49IC1zaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID0gQm91bmRzLlBSRVY7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSAtc2l6ZVt0aGlzLl9kaXJlY3Rpb25dICsgcHJldkhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuUFJFVkJPVU5EUztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBuZXh0Qm91bmRzID0gZW5mb3JlTWluU2l6ZSA/IHNpemVbdGhpcy5fZGlyZWN0aW9uXSA6IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIGlmIChuZXh0SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgc2Nyb2xsT2Zmc2V0ICsgbmV4dEhlaWdodCA8PSBuZXh0Qm91bmRzKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9IEJvdW5kcy5ORVhUO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gbmV4dEJvdW5kcyAtIG5leHRIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk5FWFRCT1VORFM7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuTk9ORTtcbiAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5OT05FO1xufVxuZnVuY3Rpb24gX2NhbGNTY3JvbGxUb09mZnNldChzaXplLCBzY3JvbGxPZmZzZXQpIHtcbiAgICB2YXIgc2Nyb2xsVG9SZW5kZXJOb2RlID0gdGhpcy5fc2Nyb2xsLnNjcm9sbFRvUmVuZGVyTm9kZSB8fCB0aGlzLl9zY3JvbGwuZW5zdXJlVmlzaWJsZVJlbmRlck5vZGU7XG4gICAgaWYgKCFzY3JvbGxUb1JlbmRlck5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPT09IEJvdW5kcy5CT1RIIHx8ICF0aGlzLl9zY3JvbGwuc2Nyb2xsVG9EaXJlY3Rpb24gJiYgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPT09IEJvdW5kcy5QUkVWIHx8IHRoaXMuX3Njcm9sbC5zY3JvbGxUb0RpcmVjdGlvbiAmJiB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9PT0gQm91bmRzLk5FWFQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgZm91bmROb2RlO1xuICAgIHZhciBzY3JvbGxUb09mZnNldCA9IDA7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKHRydWUpO1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICAgICAgc2Nyb2xsVG9PZmZzZXQgLT0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUucmVuZGVyTm9kZSA9PT0gc2Nyb2xsVG9SZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBmb3VuZE5vZGUgPSBub2RlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICBzY3JvbGxUb09mZnNldCAtPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgaWYgKCFmb3VuZE5vZGUpIHtcbiAgICAgICAgc2Nyb2xsVG9PZmZzZXQgPSAwO1xuICAgICAgICBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZShmYWxzZSk7XG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8IG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvT2Zmc2V0ICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUucmVuZGVyTm9kZSA9PT0gc2Nyb2xsVG9SZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgZm91bmROb2RlID0gbm9kZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9PZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlID0gbm9kZS5fcHJldjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZm91bmROb2RlKSB7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGwuZW5zdXJlVmlzaWJsZVJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFRvT2Zmc2V0IC0gZm91bmROb2RlLnNjcm9sbExlbmd0aCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gc2Nyb2xsVG9PZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuRU5TVVJFVklTSUJMRTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbFRvT2Zmc2V0ID4gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNpemVbdGhpcy5fZGlyZWN0aW9uXSAtIHNjcm9sbFRvT2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLkVOU1VSRVZJU0lCTEU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmb3VuZE5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9PZmZzZXQgPSAtc2Nyb2xsVG9PZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbFRvT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBzY3JvbGxUb09mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5FTlNVUkVWSVNJQkxFO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsVG9PZmZzZXQgKyBmb3VuZE5vZGUuc2Nyb2xsTGVuZ3RoID4gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNpemVbdGhpcy5fZGlyZWN0aW9uXSAtIChzY3JvbGxUb09mZnNldCArIGZvdW5kTm9kZS5zY3JvbGxMZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLkVOU1VSRVZJU0lCTEU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmb3VuZE5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNjcm9sbFRvT2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5HT1RPU0VRVUVOQ0U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc2Nyb2xsLnNjcm9sbFRvRGlyZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNjcm9sbE9mZnNldCAtIHNpemVbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5HT1RPTkVYVERJUkVDVElPTjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBzY3JvbGxPZmZzZXQgKyBzaXplW3RoaXMuX2RpcmVjdGlvbl07XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuR09UT1BSRVZESVJFQ1RJT047XG4gICAgfVxuICAgIGlmICh0aGlzLl92aWV3U2VxdWVuY2UuY2xlYW51cCkge1xuICAgICAgICB2YXIgdmlld1NlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlO1xuICAgICAgICB3aGlsZSAodmlld1NlcXVlbmNlLmdldCgpICE9PSBzY3JvbGxUb1JlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHRoaXMuX3Njcm9sbC5zY3JvbGxUb0RpcmVjdGlvbiA/IHZpZXdTZXF1ZW5jZS5nZXROZXh0KHRydWUpIDogdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKHRydWUpO1xuICAgICAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIF9zbmFwVG9QYWdlKCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLnBhZ2luYXRlZCB8fCB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCB8fCB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpdGVtO1xuICAgIHN3aXRjaCAodGhpcy5vcHRpb25zLnBhZ2luYXRpb25Nb2RlKSB7XG4gICAgY2FzZSBQYWdpbmF0aW9uTW9kZS5TQ1JPTEw6XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBhZ2luYXRpb25FbmVyZ3lUaHJlc3Nob2xkIHx8IE1hdGguYWJzKHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5nZXRFbmVyZ3koKSkgPD0gdGhpcy5vcHRpb25zLnBhZ2luYXRpb25FbmVyZ3lUaHJlc3Nob2xkKSB7XG4gICAgICAgICAgICBpdGVtID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRoaXMuZ2V0TGFzdFZpc2libGVJdGVtKCkgOiB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgICAgIGlmIChpdGVtICYmIGl0ZW0ucmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUoaXRlbS5yZW5kZXJOb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICBjYXNlIFBhZ2luYXRpb25Nb2RlLlBBR0U6XG4gICAgICAgIGl0ZW0gPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5nZXRMYXN0VmlzaWJsZUl0ZW0oKSA6IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUoaXRlbS5yZW5kZXJOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG59XG5mdW5jdGlvbiBfbm9ybWFsaXplUHJldlZpZXdTZXF1ZW5jZShzY3JvbGxPZmZzZXQpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHZhciBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIHZhciBub3JtYWxpemVOZXh0UHJldiA9IGZhbHNlO1xuICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZShmYWxzZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCAhbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9ybWFsaXplTmV4dFByZXYpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5vZGUuX3ZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgICAgICBub3JtYWxpemVOZXh0UHJldiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IG5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgfHwgc2Nyb2xsT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2Nyb2xsT2Zmc2V0IC09IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAobm9kZS5zY3JvbGxMZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplTmV4dFByZXYgPSBzY3JvbGxPZmZzZXQgPj0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmlld1NlcXVlbmNlID0gbm9kZS5fdmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUuX3ByZXY7XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0O1xufVxuZnVuY3Rpb24gX25vcm1hbGl6ZU5leHRWaWV3U2VxdWVuY2Uoc2Nyb2xsT2Zmc2V0KSB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB2YXIgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IG5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgfHwgIW5vZGUuX3ZpZXdTZXF1ZW5jZSB8fCBzY3JvbGxPZmZzZXQgPiAwICYmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCB8fCBub2RlLnNjcm9sbExlbmd0aCAhPT0gMCkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLnNjcm9sbExlbmd0aCB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSBub2RlLl92aWV3U2VxdWVuY2U7XG4gICAgICAgICAgICBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0ICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG59XG5mdW5jdGlvbiBfbm9ybWFsaXplVmlld1NlcXVlbmNlKHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIHZhciBjYXBzID0gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcztcbiAgICBpZiAoY2FwcyAmJiBjYXBzLmRlYnVnICYmIGNhcHMuZGVidWcubm9ybWFsaXplICE9PSB1bmRlZmluZWQgJiYgIWNhcHMuZGVidWcubm9ybWFsaXplKSB7XG4gICAgICAgIHJldHVybiBzY3JvbGxPZmZzZXQ7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCkge1xuICAgICAgICByZXR1cm4gc2Nyb2xsT2Zmc2V0O1xuICAgIH1cbiAgICB2YXIgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCAmJiBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBfbm9ybWFsaXplTmV4dFZpZXdTZXF1ZW5jZS5jYWxsKHRoaXMsIHNjcm9sbE9mZnNldCk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCAmJiBzY3JvbGxPZmZzZXQgPiAwKSB7XG4gICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBfbm9ybWFsaXplUHJldlZpZXdTZXF1ZW5jZS5jYWxsKHRoaXMsIHNjcm9sbE9mZnNldCk7XG4gICAgfVxuICAgIGlmIChub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID09PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgJiYgc2Nyb2xsT2Zmc2V0ID4gMCkge1xuICAgICAgICAgICAgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IF9ub3JtYWxpemVQcmV2Vmlld1NlcXVlbmNlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmFsaWdubWVudCAmJiBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gX25vcm1hbGl6ZU5leHRWaWV3U2VxdWVuY2UuY2FsbCh0aGlzLCBzY3JvbGxPZmZzZXQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ICE9PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgdmFyIGRlbHRhID0gbm9ybWFsaXplZFNjcm9sbE9mZnNldCAtIHNjcm9sbE9mZnNldDtcbiAgICAgICAgdmFyIHBhcnRpY2xlVmFsdWUgPSB0aGlzLl9zY3JvbGwucGFydGljbGUuZ2V0UG9zaXRpb24xRCgpO1xuICAgICAgICBfc2V0UGFydGljbGUuY2FsbCh0aGlzLCBwYXJ0aWNsZVZhbHVlICsgZGVsdGEsIHVuZGVmaW5lZCwgJ25vcm1hbGl6ZScpO1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiArPSBkZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FwcyAmJiBjYXBzLnNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0IC09IGRlbHRhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0O1xufVxuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0VmlzaWJsZUl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzaXplID0gdGhpcy5fY29udGV4dFNpemVDYWNoZTtcbiAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgKyBzaXplW3RoaXMuX2RpcmVjdGlvbl0gOiB0aGlzLl9zY3JvbGwudW5ub3JtYWxpemVkU2Nyb2xsT2Zmc2V0O1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IHNjcm9sbE9mZnNldCA+IHNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2Nyb2xsT2Zmc2V0ICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBpZiAoc2Nyb2xsT2Zmc2V0ID49IDAgJiYgbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGUuX3ZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpLFxuICAgICAgICAgICAgICAgIHZpZXdTZXF1ZW5jZTogbm9kZS5fdmlld1NlcXVlbmNlLFxuICAgICAgICAgICAgICAgIHJlbmRlck5vZGU6IG5vZGUucmVuZGVyTm9kZSxcbiAgICAgICAgICAgICAgICB2aXNpYmxlUGVyYzogbm9kZS5zY3JvbGxMZW5ndGggPyAoTWF0aC5taW4oc2Nyb2xsT2Zmc2V0LCBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIC0gTWF0aC5tYXgoc2Nyb2xsT2Zmc2V0IC0gbm9kZS5zY3JvbGxMZW5ndGgsIDApKSAvIG5vZGUuc2Nyb2xsTGVuZ3RoIDogMSxcbiAgICAgICAgICAgICAgICBzY3JvbGxPZmZzZXQ6IHNjcm9sbE9mZnNldCAtIG5vZGUuc2Nyb2xsTGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aDogbm9kZS5zY3JvbGxMZW5ndGgsXG4gICAgICAgICAgICAgICAgX25vZGU6IG5vZGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICBzY3JvbGxPZmZzZXQgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSA6IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG4gICAgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoZmFsc2UpO1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS5faW52YWxpZGF0ZWQgfHwgbm9kZS5zY3JvbGxMZW5ndGggPT09IHVuZGVmaW5lZCB8fCBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxPZmZzZXQgLT0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIGlmIChzY3JvbGxPZmZzZXQgPCBzaXplW3RoaXMuX2RpcmVjdGlvbl0gJiYgbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXN1bHQudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgaW5kZXg6IG5vZGUuX3ZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpLFxuICAgICAgICAgICAgICAgIHZpZXdTZXF1ZW5jZTogbm9kZS5fdmlld1NlcXVlbmNlLFxuICAgICAgICAgICAgICAgIHJlbmRlck5vZGU6IG5vZGUucmVuZGVyTm9kZSxcbiAgICAgICAgICAgICAgICB2aXNpYmxlUGVyYzogbm9kZS5zY3JvbGxMZW5ndGggPyAoTWF0aC5taW4oc2Nyb2xsT2Zmc2V0ICsgbm9kZS5zY3JvbGxMZW5ndGgsIHNpemVbdGhpcy5fZGlyZWN0aW9uXSkgLSBNYXRoLm1heChzY3JvbGxPZmZzZXQsIDApKSAvIG5vZGUuc2Nyb2xsTGVuZ3RoIDogMSxcbiAgICAgICAgICAgICAgICBzY3JvbGxPZmZzZXQ6IHNjcm9sbE9mZnNldCxcbiAgICAgICAgICAgICAgICBzY3JvbGxMZW5ndGg6IG5vZGUuc2Nyb2xsTGVuZ3RoLFxuICAgICAgICAgICAgICAgIF9ub2RlOiBub2RlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5mdW5jdGlvbiBfZ2V0VmlzaWJsZUl0ZW0oZmlyc3QpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGRpZmY7XG4gICAgdmFyIHByZXZEaWZmID0gMTAwMDAwMDA7XG4gICAgdmFyIGRpZmZEZWx0YSA9IGZpcnN0ICYmIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPyAtdGhpcy5fY29udGV4dFNpemVDYWNoZVt0aGlzLl9kaXJlY3Rpb25dIDogIWZpcnN0ICYmICF0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5fY29udGV4dFNpemVDYWNoZVt0aGlzLl9kaXJlY3Rpb25dIDogMDtcbiAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICBkaWZmID0gTWF0aC5hYnMoZGlmZkRlbHRhIC0gKHNjcm9sbE9mZnNldCArICghZmlyc3QgPyBub2RlLnNjcm9sbExlbmd0aCA6IDApKSk7XG4gICAgICAgICAgICBpZiAoZGlmZiA+PSBwcmV2RGlmZikge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldkRpZmYgPSBkaWZmO1xuICAgICAgICAgICAgcmVzdWx0LnNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICAgICAgICAgIHJlc3VsdC5fbm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgfVxuICAgIHNjcm9sbE9mZnNldCA9IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG4gICAgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoZmFsc2UpO1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS5faW52YWxpZGF0ZWQgfHwgbm9kZS5zY3JvbGxMZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUuX3ZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0IC09IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgZGlmZiA9IE1hdGguYWJzKGRpZmZEZWx0YSAtIChzY3JvbGxPZmZzZXQgKyAoIWZpcnN0ID8gbm9kZS5zY3JvbGxMZW5ndGggOiAwKSkpO1xuICAgICAgICAgICAgaWYgKGRpZmYgPj0gcHJldkRpZmYpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByZXZEaWZmID0gZGlmZjtcbiAgICAgICAgICAgIHJlc3VsdC5zY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgICAgICByZXN1bHQuX25vZGUgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9wcmV2O1xuICAgIH1cbiAgICBpZiAoIXJlc3VsdC5fbm9kZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXN1bHQuc2Nyb2xsTGVuZ3RoID0gcmVzdWx0Ll9ub2RlLnNjcm9sbExlbmd0aDtcbiAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICByZXN1bHQudmlzaWJsZVBlcmMgPSAoTWF0aC5taW4ocmVzdWx0LnNjcm9sbE9mZnNldCArIHJlc3VsdC5zY3JvbGxMZW5ndGgsIDApIC0gTWF0aC5tYXgocmVzdWx0LnNjcm9sbE9mZnNldCwgLXRoaXMuX2NvbnRleHRTaXplQ2FjaGVbdGhpcy5fZGlyZWN0aW9uXSkpIC8gcmVzdWx0LnNjcm9sbExlbmd0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQudmlzaWJsZVBlcmMgPSAoTWF0aC5taW4ocmVzdWx0LnNjcm9sbE9mZnNldCArIHJlc3VsdC5zY3JvbGxMZW5ndGgsIHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbdGhpcy5fZGlyZWN0aW9uXSkgLSBNYXRoLm1heChyZXN1bHQuc2Nyb2xsT2Zmc2V0LCAwKSkgLyByZXN1bHQuc2Nyb2xsTGVuZ3RoO1xuICAgIH1cbiAgICByZXN1bHQuaW5kZXggPSByZXN1bHQuX25vZGUuX3ZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpO1xuICAgIHJlc3VsdC52aWV3U2VxdWVuY2UgPSByZXN1bHQuX25vZGUuX3ZpZXdTZXF1ZW5jZTtcbiAgICByZXN1bHQucmVuZGVyTm9kZSA9IHJlc3VsdC5fbm9kZS5yZW5kZXJOb2RlO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRGaXJzdFZpc2libGVJdGVtID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfZ2V0VmlzaWJsZUl0ZW0uY2FsbCh0aGlzLCB0cnVlKTtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRMYXN0VmlzaWJsZUl0ZW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9nZXRWaXNpYmxlSXRlbS5jYWxsKHRoaXMsIGZhbHNlKTtcbn07XG5mdW5jdGlvbiBfZ29Ub1NlcXVlbmNlKHZpZXdTZXF1ZW5jZSwgbmV4dCwgbm9BbmltYXRpb24pIHtcbiAgICBpZiAobm9BbmltYXRpb24pIHtcbiAgICAgICAgdGhpcy5fdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIF91cGRhdGVTcHJpbmcuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5oYWx0KCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEZWx0YSA9IDA7XG4gICAgICAgIF9zZXRQYXJ0aWNsZS5jYWxsKHRoaXMsIDAsIDAsICdfZ29Ub1NlcXVlbmNlJyk7XG4gICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxUb1NlcXVlbmNlID0gdmlld1NlcXVlbmNlO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9SZW5kZXJOb2RlID0gdmlld1NlcXVlbmNlLmdldCgpO1xuICAgICAgICB0aGlzLl9zY3JvbGwuZW5zdXJlVmlzaWJsZVJlbmRlck5vZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxUb0RpcmVjdGlvbiA9IG5leHQ7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEaXJ0eSA9IHRydWU7XG4gICAgfVxufVxuZnVuY3Rpb24gX2Vuc3VyZVZpc2libGVTZXF1ZW5jZSh2aWV3U2VxdWVuY2UsIG5leHQpIHtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9TZXF1ZW5jZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9SZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZSA9IHZpZXdTZXF1ZW5jZS5nZXQoKTtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9EaXJlY3Rpb24gPSBuZXh0O1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEaXJ0eSA9IHRydWU7XG59XG5mdW5jdGlvbiBfZ29Ub1BhZ2UoYW1vdW50LCBub0FuaW1hdGlvbikge1xuICAgIHZhciB2aWV3U2VxdWVuY2UgPSAoIW5vQW5pbWF0aW9uID8gdGhpcy5fc2Nyb2xsLnNjcm9sbFRvU2VxdWVuY2UgOiB1bmRlZmluZWQpIHx8IHRoaXMuX3ZpZXdTZXF1ZW5jZTtcbiAgICBpZiAoIXRoaXMuX3Njcm9sbC5zY3JvbGxUb1NlcXVlbmNlICYmICFub0FuaW1hdGlvbikge1xuICAgICAgICB2YXIgZmlyc3RWaXNpYmxlSXRlbSA9IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAoZmlyc3RWaXNpYmxlSXRlbSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gZmlyc3RWaXNpYmxlSXRlbS52aWV3U2VxdWVuY2U7XG4gICAgICAgICAgICBpZiAoYW1vdW50IDwgMCAmJiBmaXJzdFZpc2libGVJdGVtLnNjcm9sbE9mZnNldCA8IDAgfHwgYW1vdW50ID4gMCAmJiBmaXJzdFZpc2libGVJdGVtLnNjcm9sbE9mZnNldCA+IDApIHtcbiAgICAgICAgICAgICAgICBhbW91bnQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLmFicyhhbW91bnQpOyBpKyspIHtcbiAgICAgICAgdmFyIG5leHRWaWV3U2VxdWVuY2UgPSBhbW91bnQgPiAwID8gdmlld1NlcXVlbmNlLmdldE5leHQoKSA6IHZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgICAgICBpZiAobmV4dFZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gbmV4dFZpZXdTZXF1ZW5jZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9nb1RvU2VxdWVuY2UuY2FsbCh0aGlzLCB2aWV3U2VxdWVuY2UsIGFtb3VudCA+PSAwLCBub0FuaW1hdGlvbik7XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvRmlyc3RQYWdlID0gZnVuY3Rpb24gKG5vQW5pbWF0aW9uKSB7XG4gICAgaWYgKCF0aGlzLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICh0aGlzLl92aWV3U2VxdWVuY2UuXyAmJiB0aGlzLl92aWV3U2VxdWVuY2UuXy5sb29wKSB7XG4gICAgICAgIExheW91dFV0aWxpdHkuZXJyb3IoJ1VuYWJsZSB0byBnbyB0byBmaXJzdCBpdGVtIG9mIGxvb3BlZCBWaWV3U2VxdWVuY2UnKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgd2hpbGUgKHZpZXdTZXF1ZW5jZSkge1xuICAgICAgICB2YXIgcHJldiA9IHZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgICAgICBpZiAocHJldiAmJiBwcmV2LmdldCgpKSB7XG4gICAgICAgICAgICB2aWV3U2VxdWVuY2UgPSBwcmV2O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgX2dvVG9TZXF1ZW5jZS5jYWxsKHRoaXMsIHZpZXdTZXF1ZW5jZSwgZmFsc2UsIG5vQW5pbWF0aW9uKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvUHJldmlvdXNQYWdlID0gZnVuY3Rpb24gKG5vQW5pbWF0aW9uKSB7XG4gICAgX2dvVG9QYWdlLmNhbGwodGhpcywgLTEsIG5vQW5pbWF0aW9uKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvTmV4dFBhZ2UgPSBmdW5jdGlvbiAobm9BbmltYXRpb24pIHtcbiAgICBfZ29Ub1BhZ2UuY2FsbCh0aGlzLCAxLCBub0FuaW1hdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ29Ub0xhc3RQYWdlID0gZnVuY3Rpb24gKG5vQW5pbWF0aW9uKSB7XG4gICAgaWYgKCF0aGlzLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICh0aGlzLl92aWV3U2VxdWVuY2UuXyAmJiB0aGlzLl92aWV3U2VxdWVuY2UuXy5sb29wKSB7XG4gICAgICAgIExheW91dFV0aWxpdHkuZXJyb3IoJ1VuYWJsZSB0byBnbyB0byBsYXN0IGl0ZW0gb2YgbG9vcGVkIFZpZXdTZXF1ZW5jZScpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIHZpZXdTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZTtcbiAgICB3aGlsZSAodmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdmlld1NlcXVlbmNlLmdldE5leHQoKTtcbiAgICAgICAgaWYgKG5leHQgJiYgbmV4dC5nZXQoKSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gbmV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9nb1RvU2VxdWVuY2UuY2FsbCh0aGlzLCB2aWV3U2VxdWVuY2UsIHRydWUsIG5vQW5pbWF0aW9uKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nb1RvUmVuZGVyTm9kZSA9IGZ1bmN0aW9uIChub2RlLCBub0FuaW1hdGlvbikge1xuICAgIGlmICghdGhpcy5fdmlld1NlcXVlbmNlIHx8ICFub2RlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLmdldCgpID09PSBub2RlKSB7XG4gICAgICAgIHZhciBuZXh0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzKSA+PSAwO1xuICAgICAgICBfZ29Ub1NlcXVlbmNlLmNhbGwodGhpcywgdGhpcy5fdmlld1NlcXVlbmNlLCBuZXh0LCBub0FuaW1hdGlvbik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgbmV4dFNlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlLmdldE5leHQoKTtcbiAgICB2YXIgcHJldlNlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgd2hpbGUgKChuZXh0U2VxdWVuY2UgfHwgcHJldlNlcXVlbmNlKSAmJiBuZXh0U2VxdWVuY2UgIT09IHRoaXMuX3ZpZXdTZXF1ZW5jZSkge1xuICAgICAgICB2YXIgbmV4dE5vZGUgPSBuZXh0U2VxdWVuY2UgPyBuZXh0U2VxdWVuY2UuZ2V0KCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChuZXh0Tm9kZSA9PT0gbm9kZSkge1xuICAgICAgICAgICAgX2dvVG9TZXF1ZW5jZS5jYWxsKHRoaXMsIG5leHRTZXF1ZW5jZSwgdHJ1ZSwgbm9BbmltYXRpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByZXZOb2RlID0gcHJldlNlcXVlbmNlID8gcHJldlNlcXVlbmNlLmdldCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAocHJldk5vZGUgPT09IG5vZGUpIHtcbiAgICAgICAgICAgIF9nb1RvU2VxdWVuY2UuY2FsbCh0aGlzLCBwcmV2U2VxdWVuY2UsIGZhbHNlLCBub0FuaW1hdGlvbik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBuZXh0U2VxdWVuY2UgPSBuZXh0Tm9kZSA/IG5leHRTZXF1ZW5jZS5nZXROZXh0KCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIHByZXZTZXF1ZW5jZSA9IHByZXZOb2RlID8gcHJldlNlcXVlbmNlLmdldFByZXZpb3VzKCkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmVuc3VyZVZpc2libGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIGlmIChub2RlIGluc3RhbmNlb2YgVmlld1NlcXVlbmNlKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLmdldCgpO1xuICAgIH0gZWxzZSBpZiAobm9kZSBpbnN0YW5jZW9mIE51bWJlciB8fCB0eXBlb2Ygbm9kZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdmFyIHZpZXdTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZTtcbiAgICAgICAgd2hpbGUgKHZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpIDwgbm9kZSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlLmdldE5leHQoKTtcbiAgICAgICAgICAgIGlmICghdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpID4gbm9kZSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl92aWV3U2VxdWVuY2UuZ2V0KCkgPT09IG5vZGUpIHtcbiAgICAgICAgdmFyIG5leHQgPSBfY2FsY1Njcm9sbE9mZnNldC5jYWxsKHRoaXMpID49IDA7XG4gICAgICAgIF9lbnN1cmVWaXNpYmxlU2VxdWVuY2UuY2FsbCh0aGlzLCB0aGlzLl92aWV3U2VxdWVuY2UsIG5leHQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIG5leHRTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgdmFyIHByZXZTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgIHdoaWxlICgobmV4dFNlcXVlbmNlIHx8IHByZXZTZXF1ZW5jZSkgJiYgbmV4dFNlcXVlbmNlICE9PSB0aGlzLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIG5leHROb2RlID0gbmV4dFNlcXVlbmNlID8gbmV4dFNlcXVlbmNlLmdldCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAobmV4dE5vZGUgPT09IG5vZGUpIHtcbiAgICAgICAgICAgIF9lbnN1cmVWaXNpYmxlU2VxdWVuY2UuY2FsbCh0aGlzLCBuZXh0U2VxdWVuY2UsIHRydWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByZXZOb2RlID0gcHJldlNlcXVlbmNlID8gcHJldlNlcXVlbmNlLmdldCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAocHJldk5vZGUgPT09IG5vZGUpIHtcbiAgICAgICAgICAgIF9lbnN1cmVWaXNpYmxlU2VxdWVuY2UuY2FsbCh0aGlzLCBwcmV2U2VxdWVuY2UsIGZhbHNlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5leHRTZXF1ZW5jZSA9IG5leHROb2RlID8gbmV4dFNlcXVlbmNlLmdldE5leHQoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgcHJldlNlcXVlbmNlID0gcHJldk5vZGUgPyBwcmV2U2VxdWVuY2UuZ2V0UHJldmlvdXMoKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuc2Nyb2xsID0gZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgdGhpcy5oYWx0KCk7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERlbHRhICs9IGRlbHRhO1xuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmNhblNjcm9sbCA9IGZ1bmN0aW9uIChkZWx0YSkge1xuICAgIHZhciBzY3JvbGxPZmZzZXQgPSBfY2FsY1Njcm9sbE9mZnNldC5jYWxsKHRoaXMpO1xuICAgIHZhciBwcmV2SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodChmYWxzZSk7XG4gICAgdmFyIG5leHRIZWlnaHQgPSB0aGlzLl9jYWxjU2Nyb2xsSGVpZ2h0KHRydWUpO1xuICAgIHZhciB0b3RhbEhlaWdodDtcbiAgICBpZiAobmV4dEhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHByZXZIZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0b3RhbEhlaWdodCA9IHByZXZIZWlnaHQgKyBuZXh0SGVpZ2h0O1xuICAgIH1cbiAgICBpZiAodG90YWxIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiB0b3RhbEhlaWdodCA8PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChkZWx0YSA8IDAgJiYgbmV4dEhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBuZXh0T2Zmc2V0ID0gdGhpcy5fY29udGV4dFNpemVDYWNoZVt0aGlzLl9kaXJlY3Rpb25dIC0gKHNjcm9sbE9mZnNldCArIG5leHRIZWlnaHQpO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgobmV4dE9mZnNldCwgZGVsdGEpO1xuICAgIH0gZWxzZSBpZiAoZGVsdGEgPiAwICYmIHByZXZIZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgcHJldk9mZnNldCA9IC0oc2Nyb2xsT2Zmc2V0IC0gcHJldkhlaWdodCk7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihwcmV2T2Zmc2V0LCBkZWx0YSk7XG4gICAgfVxuICAgIHJldHVybiBkZWx0YTtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5oYWx0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxUb1NlcXVlbmNlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxUb1JlbmRlck5vZGUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc2Nyb2xsLmVuc3VyZVZpc2libGVSZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgIF9zZXRQYXJ0aWNsZS5jYWxsKHRoaXMsIHVuZGVmaW5lZCwgMCwgJ2hhbHQnKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5pc1Njcm9sbGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Nyb2xsLmlzU2Nyb2xsaW5nO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdldEJvdW5kc1JlYWNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdldFZlbG9jaXR5ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JvbGwucGFydGljbGUuZ2V0VmVsb2NpdHkxRCgpO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdldEVuZXJneSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Nyb2xsLnBhcnRpY2xlLmdldEVuZXJneSgpO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnNldFZlbG9jaXR5ID0gZnVuY3Rpb24gKHZlbG9jaXR5KSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5zZXRWZWxvY2l0eTFEKHZlbG9jaXR5KTtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5hcHBseVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgdGhpcy5oYWx0KCk7XG4gICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50ID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZVN0YXJ0SXRlbSA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPyB0aGlzLmdldExhc3RWaXNpYmxlSXRlbSgpIDogdGhpcy5nZXRGaXJzdFZpc2libGVJdGVtKCk7XG4gICAgfVxuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50Kys7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlICs9IGRlbHRhO1xuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKHByZXZEZWx0YSwgbmV3RGVsdGEpIHtcbiAgICB0aGlzLmhhbHQoKTtcbiAgICBuZXdEZWx0YSAtPSBwcmV2RGVsdGE7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlICs9IG5ld0RlbHRhO1xuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnJlbGVhc2VTY3JvbGxGb3JjZSA9IGZ1bmN0aW9uIChkZWx0YSwgdmVsb2NpdHkpIHtcbiAgICB0aGlzLmhhbHQoKTtcbiAgICBpZiAodGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQgPT09IDEpIHtcbiAgICAgICAgdmFyIHNjcm9sbE9mZnNldCA9IF9jYWxjU2Nyb2xsT2Zmc2V0LmNhbGwodGhpcyk7XG4gICAgICAgIF9zZXRQYXJ0aWNsZS5jYWxsKHRoaXMsIHNjcm9sbE9mZnNldCwgdmVsb2NpdHksICdyZWxlYXNlU2Nyb2xsRm9yY2UnKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnBlLndha2UoKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlID0gMDtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5ID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZVN0YXJ0SXRlbSAmJiB0aGlzLm9wdGlvbnMucGFnaW5hdGVkICYmIHRoaXMub3B0aW9ucy5wYWdpbmF0aW9uTW9kZSA9PT0gUGFnaW5hdGlvbk1vZGUuUEFHRSkge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5nZXRMYXN0VmlzaWJsZUl0ZW0odHJ1ZSkgOiB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0odHJ1ZSk7XG4gICAgICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnJlbmRlck5vZGUgIT09IHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZVN0YXJ0SXRlbS5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUoaXRlbS5yZW5kZXJOb2RlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5wYWdpbmF0aW9uRW5lcmd5VGhyZXNzaG9sZCAmJiBNYXRoLmFicyh0aGlzLl9zY3JvbGwucGFydGljbGUuZ2V0RW5lcmd5KCkpID49IHRoaXMub3B0aW9ucy5wYWdpbmF0aW9uRW5lcmd5VGhyZXNzaG9sZCkge1xuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eSA9IHZlbG9jaXR5IHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2ZWxvY2l0eSA8IDAgJiYgaXRlbS5fbm9kZS5fbmV4dCAmJiBpdGVtLl9ub2RlLl9uZXh0LnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUoaXRlbS5fbm9kZS5fbmV4dC5yZW5kZXJOb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2ZWxvY2l0eSA+PSAwICYmIGl0ZW0uX25vZGUuX3ByZXYgJiYgaXRlbS5fbm9kZS5fcHJldi5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvVG9SZW5kZXJOb2RlKGl0ZW0uX25vZGUuX3ByZXYucmVuZGVyTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdvVG9SZW5kZXJOb2RlKGl0ZW0ucmVuZGVyTm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZVN0YXJ0SXRlbSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgLT0gZGVsdGE7XG4gICAgfVxuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50LS07XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0U3BlYyA9IGZ1bmN0aW9uIChub2RlLCBub3JtYWxpemUpIHtcbiAgICB2YXIgc3BlYyA9IExheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldFNwZWMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoc3BlYyAmJiB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzICYmIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCkge1xuICAgICAgICBzcGVjID0ge1xuICAgICAgICAgICAgb3JpZ2luOiBzcGVjLm9yaWdpbixcbiAgICAgICAgICAgIGFsaWduOiBzcGVjLmFsaWduLFxuICAgICAgICAgICAgb3BhY2l0eTogc3BlYy5vcGFjaXR5LFxuICAgICAgICAgICAgc2l6ZTogc3BlYy5zaXplLFxuICAgICAgICAgICAgcmVuZGVyTm9kZTogc3BlYy5yZW5kZXJOb2RlLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBzcGVjLnRyYW5zZm9ybVxuICAgICAgICB9O1xuICAgICAgICB2YXIgdHJhbnNsYXRlID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB0cmFuc2xhdGVbdGhpcy5fZGlyZWN0aW9uXSA9IHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQ7XG4gICAgICAgIHNwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLnRoZW5Nb3ZlKHNwZWMudHJhbnNmb3JtLCB0cmFuc2xhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gc3BlYztcbn07XG5mdW5jdGlvbiBfbGF5b3V0KHNpemUsIHNjcm9sbE9mZnNldCwgbmVzdGVkKSB7XG4gICAgdGhpcy5fZGVidWcubGF5b3V0Q291bnQrKztcbiAgICB2YXIgc2Nyb2xsU3RhcnQgPSAwIC0gTWF0aC5tYXgodGhpcy5vcHRpb25zLmV4dHJhQm91bmRzU3BhY2VbMF0sIDEpO1xuICAgIHZhciBzY3JvbGxFbmQgPSBzaXplW3RoaXMuX2RpcmVjdGlvbl0gKyBNYXRoLm1heCh0aGlzLm9wdGlvbnMuZXh0cmFCb3VuZHNTcGFjZVsxXSwgMSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5sYXlvdXRBbGwpIHtcbiAgICAgICAgc2Nyb2xsU3RhcnQgPSAtMTAwMDAwMDtcbiAgICAgICAgc2Nyb2xsRW5kID0gMTAwMDAwMDtcbiAgICB9XG4gICAgdmFyIGxheW91dENvbnRleHQgPSB0aGlzLl9ub2Rlcy5wcmVwYXJlRm9yTGF5b3V0KHRoaXMuX3ZpZXdTZXF1ZW5jZSwgdGhpcy5fbm9kZXNCeUlkLCB7XG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLl9kaXJlY3Rpb24sXG4gICAgICAgICAgICByZXZlcnNlOiB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0OiB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gc2Nyb2xsT2Zmc2V0ICsgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDogc2Nyb2xsT2Zmc2V0LFxuICAgICAgICAgICAgc2Nyb2xsU3RhcnQ6IHNjcm9sbFN0YXJ0LFxuICAgICAgICAgICAgc2Nyb2xsRW5kOiBzY3JvbGxFbmRcbiAgICAgICAgfSk7XG4gICAgaWYgKHRoaXMuX2xheW91dC5fZnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbihsYXlvdXRDb250ZXh0LCB0aGlzLl9sYXlvdXQub3B0aW9ucyk7XG4gICAgfVxuICAgIHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgaWYgKHRoaXMuX3Bvc3RMYXlvdXQpIHtcbiAgICAgICAgdGhpcy5fcG9zdExheW91dChzaXplLCBzY3JvbGxPZmZzZXQpO1xuICAgIH1cbiAgICB0aGlzLl9ub2Rlcy5yZW1vdmVOb25JbnZhbGlkYXRlZE5vZGVzKHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucy5yZW1vdmVTcGVjKTtcbiAgICBfY2FsY0JvdW5kcy5jYWxsKHRoaXMsIHNpemUsIHNjcm9sbE9mZnNldCk7XG4gICAgX2NhbGNTY3JvbGxUb09mZnNldC5jYWxsKHRoaXMsIHNpemUsIHNjcm9sbE9mZnNldCk7XG4gICAgX3NuYXBUb1BhZ2UuY2FsbCh0aGlzKTtcbiAgICB2YXIgbmV3U2Nyb2xsT2Zmc2V0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzLCB0cnVlKTtcbiAgICBpZiAoIW5lc3RlZCAmJiBuZXdTY3JvbGxPZmZzZXQgIT09IHNjcm9sbE9mZnNldCkge1xuICAgICAgICByZXR1cm4gX2xheW91dC5jYWxsKHRoaXMsIHNpemUsIG5ld1Njcm9sbE9mZnNldCwgdHJ1ZSk7XG4gICAgfVxuICAgIHNjcm9sbE9mZnNldCA9IF9ub3JtYWxpemVWaWV3U2VxdWVuY2UuY2FsbCh0aGlzLCBzaXplLCBzY3JvbGxPZmZzZXQpO1xuICAgIF91cGRhdGVTcHJpbmcuY2FsbCh0aGlzKTtcbiAgICB0aGlzLl9ub2Rlcy5yZW1vdmVWaXJ0dWFsVmlld1NlcXVlbmNlTm9kZXMoKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnNpemUgJiYgdGhpcy5vcHRpb25zLnNpemVbdGhpcy5fZGlyZWN0aW9uXSA9PT0gdHJ1ZSkge1xuICAgICAgICB2YXIgc2Nyb2xsTGVuZ3RoID0gMDtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKCk7XG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5faW52YWxpZGF0ZWQgJiYgbm9kZS5zY3JvbGxMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxMZW5ndGggKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zaXplID0gdGhpcy5fc2l6ZSB8fCBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgICAgICB0aGlzLl9zaXplWzBdID0gdGhpcy5vcHRpb25zLnNpemVbMF07XG4gICAgICAgIHRoaXMuX3NpemVbMV0gPSB0aGlzLm9wdGlvbnMuc2l6ZVsxXTtcbiAgICAgICAgdGhpcy5fc2l6ZVt0aGlzLl9kaXJlY3Rpb25dID0gc2Nyb2xsTGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gc2Nyb2xsT2Zmc2V0O1xufVxuZnVuY3Rpb24gX2lubmVyUmVuZGVyKCkge1xuICAgIHZhciBzcGVjcyA9IHRoaXMuX3NwZWNzO1xuICAgIGZvciAodmFyIGkzID0gMCwgajMgPSBzcGVjcy5sZW5ndGg7IGkzIDwgajM7IGkzKyspIHtcbiAgICAgICAgaWYgKHNwZWNzW2kzXS5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBzcGVjc1tpM10udGFyZ2V0ID0gc3BlY3NbaTNdLnJlbmRlck5vZGUucmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFzcGVjcy5sZW5ndGggfHwgc3BlY3Nbc3BlY3MubGVuZ3RoIC0gMV0gIT09IHRoaXMuX2NsZWFudXBSZWdpc3RyYXRpb24pIHtcbiAgICAgICAgc3BlY3MucHVzaCh0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHNwZWNzO1xufVxuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuY29tbWl0ID0gZnVuY3Rpb24gY29tbWl0KGNvbnRleHQpIHtcbiAgICB2YXIgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICB0aGlzLl9kZWJ1Zy5jb21taXRDb3VudCsrO1xuICAgIGlmICh0aGlzLl9yZXNldEZsb3dTdGF0ZSkge1xuICAgICAgICB0aGlzLl9yZXNldEZsb3dTdGF0ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbm9kZXMucmVtb3ZlQWxsKCk7XG4gICAgfVxuICAgIHZhciBzY3JvbGxPZmZzZXQgPSBfY2FsY1Njcm9sbE9mZnNldC5jYWxsKHRoaXMsIHRydWUsIHRydWUpO1xuICAgIGlmICh0aGlzLl9zY3JvbGxPZmZzZXRDYWNoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbE9mZnNldENhY2hlID0gc2Nyb2xsT2Zmc2V0O1xuICAgIH1cbiAgICB2YXIgZW1pdEVuZFNjcm9sbGluZ0V2ZW50ID0gZmFsc2U7XG4gICAgdmFyIGVtaXRTY3JvbGxFdmVudCA9IGZhbHNlO1xuICAgIHZhciBldmVudERhdGE7XG4gICAgaWYgKHNpemVbMF0gIT09IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMF0gfHwgc2l6ZVsxXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVsxXSB8fCB0aGlzLl9pc0RpcnR5IHx8IHRoaXMuX3Njcm9sbC5zY3JvbGxEaXJ0eSB8fCB0aGlzLl9ub2Rlcy5fdHJ1ZVNpemVSZXF1ZXN0ZWQgfHwgdGhpcy5vcHRpb25zLmFsd2F5c0xheW91dCB8fCB0aGlzLl9zY3JvbGxPZmZzZXRDYWNoZSAhPT0gc2Nyb2xsT2Zmc2V0KSB7XG4gICAgICAgIGV2ZW50RGF0YSA9IHtcbiAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgIG9sZFNpemU6IHRoaXMuX2NvbnRleHRTaXplQ2FjaGUsXG4gICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgb2xkU2Nyb2xsT2Zmc2V0OiAtKHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQpLFxuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0OiAtKHNjcm9sbE9mZnNldCArIHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0KVxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGUgIT09IHNjcm9sbE9mZnNldCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9zY3JvbGwuaXNTY3JvbGxpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuaXNTY3JvbGxpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Njcm9sbHN0YXJ0JywgZXZlbnREYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVtaXRTY3JvbGxFdmVudCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fc2Nyb2xsLmlzU2Nyb2xsaW5nICYmICF0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCkge1xuICAgICAgICAgICAgZW1pdEVuZFNjcm9sbGluZ0V2ZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdsYXlvdXRzdGFydCcsIGV2ZW50RGF0YSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmxvdyAmJiAodGhpcy5faXNEaXJ0eSB8fCB0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMucmVmbG93T25SZXNpemUgJiYgKHNpemVbMF0gIT09IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMF0gfHwgc2l6ZVsxXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVsxXSkpKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoKTtcbiAgICAgICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZWxlYXNlTG9jayh0cnVlKTtcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzBdID0gc2l6ZVswXTtcbiAgICAgICAgdGhpcy5fY29udGV4dFNpemVDYWNoZVsxXSA9IHNpemVbMV07XG4gICAgICAgIHRoaXMuX2lzRGlydHkgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5ID0gZmFsc2U7XG4gICAgICAgIHNjcm9sbE9mZnNldCA9IF9sYXlvdXQuY2FsbCh0aGlzLCBzaXplLCBzY3JvbGxPZmZzZXQpO1xuICAgICAgICB0aGlzLl9zY3JvbGxPZmZzZXRDYWNoZSA9IHNjcm9sbE9mZnNldDtcbiAgICAgICAgZXZlbnREYXRhLnNjcm9sbE9mZnNldCA9IC0odGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGUgKyB0aGlzLl9zY3JvbGwuZ3JvdXBTdGFydCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9zY3JvbGwuaXNTY3JvbGxpbmcgJiYgIXRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50KSB7XG4gICAgICAgIGVtaXRFbmRTY3JvbGxpbmdFdmVudCA9IHRydWU7XG4gICAgfVxuICAgIHZhciBncm91cFRyYW5zbGF0ZSA9IHRoaXMuX3Njcm9sbC5ncm91cFRyYW5zbGF0ZTtcbiAgICBncm91cFRyYW5zbGF0ZVswXSA9IDA7XG4gICAgZ3JvdXBUcmFuc2xhdGVbMV0gPSAwO1xuICAgIGdyb3VwVHJhbnNsYXRlWzJdID0gMDtcbiAgICBncm91cFRyYW5zbGF0ZVt0aGlzLl9kaXJlY3Rpb25dID0gLXRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0IC0gc2Nyb2xsT2Zmc2V0O1xuICAgIHZhciBzZXF1ZW50aWFsU2Nyb2xsaW5nT3B0aW1pemVkID0gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcyA/IHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCA6IGZhbHNlO1xuICAgIHZhciByZXN1bHQgPSB0aGlzLl9ub2Rlcy5idWlsZFNwZWNBbmREZXN0cm95VW5yZW5kZXJlZE5vZGVzKHNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQgPyBncm91cFRyYW5zbGF0ZSA6IHVuZGVmaW5lZCk7XG4gICAgdGhpcy5fc3BlY3MgPSByZXN1bHQuc3BlY3M7XG4gICAgaWYgKCF0aGlzLl9zcGVjcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQgPSAwO1xuICAgIH1cbiAgICBpZiAoZXZlbnREYXRhKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2xheW91dGVuZCcsIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIGlmIChyZXN1bHQubW9kaWZpZWQpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncmVmbG93JywgeyB0YXJnZXQ6IHRoaXMgfSk7XG4gICAgfVxuICAgIGlmIChlbWl0U2Nyb2xsRXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnc2Nyb2xsJywgZXZlbnREYXRhKTtcbiAgICB9XG4gICAgaWYgKGV2ZW50RGF0YSkge1xuICAgICAgICB2YXIgdmlzaWJsZUl0ZW0gPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5nZXRMYXN0VmlzaWJsZUl0ZW0oKSA6IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAodmlzaWJsZUl0ZW0gJiYgIXRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgfHwgIXZpc2libGVJdGVtICYmIHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgfHwgdmlzaWJsZUl0ZW0gJiYgdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZSAmJiB2aXNpYmxlSXRlbS5yZW5kZXJOb2RlICE9PSB0aGlzLl92aXNpYmxlSXRlbUNhY2hlLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3BhZ2VjaGFuZ2UnLCB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgICAgIG9sZFZpZXdTZXF1ZW5jZTogdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZSA/IHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUudmlld1NlcXVlbmNlIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHZpZXdTZXF1ZW5jZTogdmlzaWJsZUl0ZW0gPyB2aXNpYmxlSXRlbS52aWV3U2VxdWVuY2UgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb2xkSW5kZXg6IHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgPyB0aGlzLl92aXNpYmxlSXRlbUNhY2hlLmluZGV4IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIGluZGV4OiB2aXNpYmxlSXRlbSA/IHZpc2libGVJdGVtLmluZGV4IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHJlbmRlck5vZGU6IHZpc2libGVJdGVtID8gdmlzaWJsZUl0ZW0ucmVuZGVyTm9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBvbGRSZW5kZXJOb2RlOiB0aGlzLl92aXNpYmxlSXRlbUNhY2hlID8gdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZS5yZW5kZXJOb2RlIDogdW5kZWZpbmVkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgPSB2aXNpYmxlSXRlbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoZW1pdEVuZFNjcm9sbGluZ0V2ZW50KSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5pc1Njcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICBldmVudERhdGEgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICBvbGRTaXplOiBzaXplLFxuICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgIG9sZFNjcm9sbE9mZnNldDogLSh0aGlzLl9zY3JvbGwuZ3JvdXBTdGFydCArIHNjcm9sbE9mZnNldCksXG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQ6IC0odGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQgKyBzY3JvbGxPZmZzZXQpXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Njcm9sbGVuZCcsIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIHZhciB0cmFuc2Zvcm0gPSBjb250ZXh0LnRyYW5zZm9ybTtcbiAgICBpZiAoc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCkge1xuICAgICAgICB2YXIgd2luZG93T2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0ICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQ7XG4gICAgICAgIHZhciB0cmFuc2xhdGUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIHRyYW5zbGF0ZVt0aGlzLl9kaXJlY3Rpb25dID0gd2luZG93T2Zmc2V0O1xuICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0udGhlbk1vdmUodHJhbnNmb3JtLCB0cmFuc2xhdGUpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgb3BhY2l0eTogY29udGV4dC5vcGFjaXR5LFxuICAgICAgICBvcmlnaW46IGNvbnRleHQub3JpZ2luLFxuICAgICAgICB0YXJnZXQ6IHRoaXMuZ3JvdXAucmVuZGVyKClcbiAgICB9O1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyLnJlbmRlci5hcHBseSh0aGlzLmNvbnRhaW5lciwgYXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBTY3JvbGxDb250cm9sbGVyOyIsInZhciBFdmVudEhhbmRsZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5FdmVudEhhbmRsZXIgOiBudWxsO1xuZnVuY3Rpb24gVmlydHVhbFZpZXdTZXF1ZW5jZShvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5fID0gb3B0aW9ucy5fIHx8IG5ldyB0aGlzLmNvbnN0cnVjdG9yLkJhY2tpbmcob3B0aW9ucyk7XG4gICAgdGhpcy50b3VjaGVkID0gdHJ1ZTtcbiAgICB0aGlzLnZhbHVlID0gb3B0aW9ucy52YWx1ZSB8fCB0aGlzLl8uZmFjdG9yeS5jcmVhdGUoKTtcbiAgICB0aGlzLmluZGV4ID0gb3B0aW9ucy5pbmRleCB8fCAwO1xuICAgIHRoaXMubmV4dCA9IG9wdGlvbnMubmV4dDtcbiAgICB0aGlzLnByZXYgPSBvcHRpb25zLnByZXY7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fLmV2ZW50T3V0cHV0KTtcbiAgICB0aGlzLnZhbHVlLnBpcGUodGhpcy5fLmV2ZW50T3V0cHV0KTtcbn1cblZpcnR1YWxWaWV3U2VxdWVuY2UuQmFja2luZyA9IGZ1bmN0aW9uIEJhY2tpbmcob3B0aW9ucykge1xuICAgIHRoaXMuZmFjdG9yeSA9IG9wdGlvbnMuZmFjdG9yeTtcbiAgICB0aGlzLmV2ZW50T3V0cHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLmdldFByZXZpb3VzID0gZnVuY3Rpb24gKG5vQ3JlYXRlKSB7XG4gICAgaWYgKHRoaXMucHJldikge1xuICAgICAgICB0aGlzLnByZXYudG91Y2hlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzLnByZXY7XG4gICAgfVxuICAgIGlmIChub0NyZWF0ZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgdmFsdWUgPSB0aGlzLl8uZmFjdG9yeS5jcmVhdGVQcmV2aW91cyh0aGlzLmdldCgpKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMucHJldiA9IG5ldyBWaXJ0dWFsVmlld1NlcXVlbmNlKHtcbiAgICAgICAgXzogdGhpcy5fLFxuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiB0aGlzLmluZGV4IC0gMSxcbiAgICAgICAgbmV4dDogdGhpc1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnByZXY7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uIChub0NyZWF0ZSkge1xuICAgIGlmICh0aGlzLm5leHQpIHtcbiAgICAgICAgdGhpcy5uZXh0LnRvdWNoZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5uZXh0O1xuICAgIH1cbiAgICBpZiAobm9DcmVhdGUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIHZhbHVlID0gdGhpcy5fLmZhY3RvcnkuY3JlYXRlTmV4dCh0aGlzLmdldCgpKTtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMubmV4dCA9IG5ldyBWaXJ0dWFsVmlld1NlcXVlbmNlKHtcbiAgICAgICAgXzogdGhpcy5fLFxuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiB0aGlzLmluZGV4ICsgMSxcbiAgICAgICAgcHJldjogdGhpc1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLm5leHQ7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudG91Y2hlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuZ2V0SW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50b3VjaGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcy5pbmRleDtcbn07XG5WaXJ0dWFsVmlld1NlcXVlbmNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJycgKyB0aGlzLmluZGV4O1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLnByZXY7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLnRvdWNoZWQpIHtcbiAgICAgICAgICAgIG5vZGUubmV4dC5wcmV2ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgbm9kZS5uZXh0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHRoaXMuXy5mYWN0b3J5LmRlc3Ryb3kpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl8uZmFjdG9yeS5kZXN0cm95KG5vZGUudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUudG91Y2hlZCA9IGZhbHNlO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBub2RlID0gdGhpcy5uZXh0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS50b3VjaGVkKSB7XG4gICAgICAgICAgICBub2RlLnByZXYubmV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIG5vZGUucHJldiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0aGlzLl8uZmFjdG9yeS5kZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fLmZhY3RvcnkuZGVzdHJveShub2RlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlLnRvdWNoZWQgPSBmYWxzZTtcbiAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdWaXJ0dWFsVmlld1NlcXVlbmNlLnVuc2hpZnQgaXMgbm90IHN1cHBvcnRlZCBhbmQgc2hvdWxkIG5vdCBiZSBjYWxsZWQnKTtcbiAgICB9XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdWaXJ0dWFsVmlld1NlcXVlbmNlLnB1c2ggaXMgbm90IHN1cHBvcnRlZCBhbmQgc2hvdWxkIG5vdCBiZSBjYWxsZWQnKTtcbiAgICB9XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUuc3BsaWNlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1ZpcnR1YWxWaWV3U2VxdWVuY2Uuc3BsaWNlIGlzIG5vdCBzdXBwb3J0ZWQgYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkJyk7XG4gICAgfVxufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLnN3YXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignVmlydHVhbFZpZXdTZXF1ZW5jZS5zd2FwIGlzIG5vdCBzdXBwb3J0ZWQgYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkJyk7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFZpZXdTZXF1ZW5jZTsiLCJ2YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4uL0xheW91dFV0aWxpdHknKTtcbmZ1bmN0aW9uIExheW91dERvY2tIZWxwZXIoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBzaXplID0gY29udGV4dC5zaXplO1xuICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgIHRoaXMuX2NvbnRleHQgPSBjb250ZXh0O1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuX3ogPSBvcHRpb25zICYmIG9wdGlvbnMudHJhbnNsYXRlWiA/IG9wdGlvbnMudHJhbnNsYXRlWiA6IDA7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5tYXJnaW5zKSB7XG4gICAgICAgIHZhciBtYXJnaW5zID0gTGF5b3V0VXRpbGl0eS5ub3JtYWxpemVNYXJnaW5zKG9wdGlvbnMubWFyZ2lucyk7XG4gICAgICAgIHRoaXMuX2xlZnQgPSBtYXJnaW5zWzNdO1xuICAgICAgICB0aGlzLl90b3AgPSBtYXJnaW5zWzBdO1xuICAgICAgICB0aGlzLl9yaWdodCA9IHNpemVbMF0gLSBtYXJnaW5zWzFdO1xuICAgICAgICB0aGlzLl9ib3R0b20gPSBzaXplWzFdIC0gbWFyZ2luc1syXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9sZWZ0ID0gMDtcbiAgICAgICAgdGhpcy5fdG9wID0gMDtcbiAgICAgICAgdGhpcy5fcmlnaHQgPSBzaXplWzBdO1xuICAgICAgICB0aGlzLl9ib3R0b20gPSBzaXplWzFdO1xuICAgIH1cbn1cbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJ1bGUgPSBkYXRhW2ldO1xuICAgICAgICB2YXIgdmFsdWUgPSBydWxlLmxlbmd0aCA+PSAzID8gcnVsZVsyXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHJ1bGVbMF0gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICB0aGlzLnRvcChydWxlWzFdLCB2YWx1ZSwgcnVsZS5sZW5ndGggPj0gNCA/IHJ1bGVbM10gOiB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJ1bGVbMF0gPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgdGhpcy5sZWZ0KHJ1bGVbMV0sIHZhbHVlLCBydWxlLmxlbmd0aCA+PSA0ID8gcnVsZVszXSA6IHVuZGVmaW5lZCk7XG4gICAgICAgIH0gZWxzZSBpZiAocnVsZVswXSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgdGhpcy5yaWdodChydWxlWzFdLCB2YWx1ZSwgcnVsZS5sZW5ndGggPj0gNCA/IHJ1bGVbM10gOiB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJ1bGVbMF0gPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgICB0aGlzLmJvdHRvbShydWxlWzFdLCB2YWx1ZSwgcnVsZS5sZW5ndGggPj0gNCA/IHJ1bGVbM10gOiB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJ1bGVbMF0gPT09ICdmaWxsJykge1xuICAgICAgICAgICAgdGhpcy5maWxsKHJ1bGVbMV0sIHJ1bGUubGVuZ3RoID49IDMgPyBydWxlWzJdIDogdW5kZWZpbmVkKTtcbiAgICAgICAgfSBlbHNlIGlmIChydWxlWzBdID09PSAnbWFyZ2lucycpIHtcbiAgICAgICAgICAgIHRoaXMubWFyZ2lucyhydWxlWzFdKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5MYXlvdXREb2NrSGVscGVyLnByb3RvdHlwZS50b3AgPSBmdW5jdGlvbiAobm9kZSwgaGVpZ2h0LCB6KSB7XG4gICAgaWYgKGhlaWdodCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodFsxXTtcbiAgICB9XG4gICAgaWYgKGhlaWdodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBzaXplID0gdGhpcy5fY29udGV4dC5yZXNvbHZlU2l6ZShub2RlLCBbXG4gICAgICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgICAgIHRoaXMuX2JvdHRvbSAtIHRoaXMuX3RvcFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIGhlaWdodCA9IHNpemVbMV07XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIHRoaXMuX3RvcCxcbiAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICB0aGlzLl90b3AgKz0gaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLmxlZnQgPSBmdW5jdGlvbiAobm9kZSwgd2lkdGgsIHopIHtcbiAgICBpZiAod2lkdGggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB3aWR0aCA9IHdpZHRoWzBdO1xuICAgIH1cbiAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX2NvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgW1xuICAgICAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB3aWR0aCA9IHNpemVbMF07XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgXSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICBhbGlnbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgdGhpcy5fdG9wLFxuICAgICAgICAgICAgeiA9PT0gdW5kZWZpbmVkID8gdGhpcy5feiA6IHpcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIHRoaXMuX2xlZnQgKz0gd2lkdGg7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0RG9ja0hlbHBlci5wcm90b3R5cGUuYm90dG9tID0gZnVuY3Rpb24gKG5vZGUsIGhlaWdodCwgeikge1xuICAgIGlmIChoZWlnaHQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHRbMV07XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX2NvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgW1xuICAgICAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgICAgIF0pO1xuICAgICAgICBoZWlnaHQgPSBzaXplWzFdO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIGhlaWdodFxuICAgICAgICBdLFxuICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxXG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIHRoaXMuX2xlZnQsXG4gICAgICAgICAgICAtKHRoaXMuX3NpemVbMV0gLSB0aGlzLl9ib3R0b20pLFxuICAgICAgICAgICAgeiA9PT0gdW5kZWZpbmVkID8gdGhpcy5feiA6IHpcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIHRoaXMuX2JvdHRvbSAtPSBoZWlnaHQ7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0RG9ja0hlbHBlci5wcm90b3R5cGUucmlnaHQgPSBmdW5jdGlvbiAobm9kZSwgd2lkdGgsIHopIHtcbiAgICBpZiAod2lkdGggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB3aWR0aCA9IHdpZHRoWzBdO1xuICAgIH1cbiAgICBpZiAobm9kZSkge1xuICAgICAgICBpZiAod2lkdGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSB0aGlzLl9jb250ZXh0LnJlc29sdmVTaXplKG5vZGUsIFtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHdpZHRoID0gc2l6ZVswXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgICAgICAtKHRoaXMuX3NpemVbMF0gLSB0aGlzLl9yaWdodCksXG4gICAgICAgICAgICAgICAgdGhpcy5fdG9wLFxuICAgICAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgdGhpcy5fcmlnaHQgLT0gd2lkdGg7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAobm9kZSwgeikge1xuICAgIHRoaXMuX2NvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgdGhpcy5fcmlnaHQgLSB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIHRoaXMuX3RvcCxcbiAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXREb2NrSGVscGVyLnByb3RvdHlwZS5tYXJnaW5zID0gZnVuY3Rpb24gKG1hcmdpbnMpIHtcbiAgICBtYXJnaW5zID0gTGF5b3V0VXRpbGl0eS5ub3JtYWxpemVNYXJnaW5zKG1hcmdpbnMpO1xuICAgIHRoaXMuX2xlZnQgKz0gbWFyZ2luc1szXTtcbiAgICB0aGlzLl90b3AgKz0gbWFyZ2luc1swXTtcbiAgICB0aGlzLl9yaWdodCAtPSBtYXJnaW5zWzFdO1xuICAgIHRoaXMuX2JvdHRvbSAtPSBtYXJnaW5zWzJdO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dFV0aWxpdHkucmVnaXN0ZXJIZWxwZXIoJ2RvY2snLCBMYXlvdXREb2NrSGVscGVyKTtcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0RG9ja0hlbHBlcjsiLCJ2YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG52YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4uL0xheW91dFV0aWxpdHknKTtcbnZhciBjYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgIHNlcXVlbmNlOiB0cnVlLFxuICAgICAgICBkaXJlY3Rpb246IFtcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlksXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbGluZzogdHJ1ZSxcbiAgICAgICAgdHJ1ZVNpemU6IHRydWUsXG4gICAgICAgIHNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQ6IHRydWVcbiAgICB9O1xudmFyIGNvbnRleHQ7XG52YXIgc2l6ZTtcbnZhciBkaXJlY3Rpb247XG52YXIgYWxpZ25tZW50O1xudmFyIGxpbmVEaXJlY3Rpb247XG52YXIgbGluZUxlbmd0aDtcbnZhciBvZmZzZXQ7XG52YXIgbWFyZ2lucztcbnZhciBtYXJnaW4gPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xudmFyIHNwYWNpbmc7XG52YXIganVzdGlmeTtcbnZhciBpdGVtU2l6ZTtcbnZhciBnZXRJdGVtU2l6ZTtcbnZhciBsaW5lTm9kZXM7XG5mdW5jdGlvbiBfbGF5b3V0TGluZShuZXh0LCBlbmRSZWFjaGVkKSB7XG4gICAgaWYgKCFsaW5lTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICB2YXIgbGluZVNpemUgPSBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIHZhciBsaW5lTm9kZTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGluZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmVTaXplW2RpcmVjdGlvbl0gPSBNYXRoLm1heChsaW5lU2l6ZVtkaXJlY3Rpb25dLCBsaW5lTm9kZXNbaV0uc2l6ZVtkaXJlY3Rpb25dKTtcbiAgICAgICAgbGluZVNpemVbbGluZURpcmVjdGlvbl0gKz0gKGkgPiAwID8gc3BhY2luZ1tsaW5lRGlyZWN0aW9uXSA6IDApICsgbGluZU5vZGVzW2ldLnNpemVbbGluZURpcmVjdGlvbl07XG4gICAgfVxuICAgIHZhciBqdXN0aWZ5T2Zmc2V0ID0ganVzdGlmeVtsaW5lRGlyZWN0aW9uXSA/IChsaW5lTGVuZ3RoIC0gbGluZVNpemVbbGluZURpcmVjdGlvbl0pIC8gKGxpbmVOb2Rlcy5sZW5ndGggKiAyKSA6IDA7XG4gICAgdmFyIGxpbmVPZmZzZXQgPSAoZGlyZWN0aW9uID8gbWFyZ2luc1szXSA6IG1hcmdpbnNbMF0pICsganVzdGlmeU9mZnNldDtcbiAgICB2YXIgc2Nyb2xsTGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsaW5lTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGluZU5vZGUgPSBsaW5lTm9kZXNbaV07XG4gICAgICAgIHZhciB0cmFuc2xhdGUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgIHRyYW5zbGF0ZVtsaW5lRGlyZWN0aW9uXSA9IGxpbmVPZmZzZXQ7XG4gICAgICAgIHRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gbmV4dCA/IG9mZnNldCA6IG9mZnNldCAtIGxpbmVTaXplW2RpcmVjdGlvbl07XG4gICAgICAgIHNjcm9sbExlbmd0aCA9IDA7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBzY3JvbGxMZW5ndGggPSBsaW5lU2l6ZVtkaXJlY3Rpb25dO1xuICAgICAgICAgICAgaWYgKGVuZFJlYWNoZWQgJiYgKG5leHQgJiYgIWFsaWdubWVudCB8fCAhbmV4dCAmJiBhbGlnbm1lbnQpKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMF0gKyBtYXJnaW5zWzJdIDogbWFyZ2luc1szXSArIG1hcmdpbnNbMV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aCArPSBzcGFjaW5nW2RpcmVjdGlvbl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZU5vZGUuc2V0ID0ge1xuICAgICAgICAgICAgc2l6ZTogbGluZU5vZGUuc2l6ZSxcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogdHJhbnNsYXRlLFxuICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoOiBzY3JvbGxMZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgbGluZU9mZnNldCArPSBsaW5lTm9kZS5zaXplW2xpbmVEaXJlY3Rpb25dICsgc3BhY2luZ1tsaW5lRGlyZWN0aW9uXSArIGp1c3RpZnlPZmZzZXQgKiAyO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGluZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmVOb2RlID0gbmV4dCA/IGxpbmVOb2Rlc1tpXSA6IGxpbmVOb2Rlc1tsaW5lTm9kZXMubGVuZ3RoIC0gMSAtIGldO1xuICAgICAgICBjb250ZXh0LnNldChsaW5lTm9kZS5ub2RlLCBsaW5lTm9kZS5zZXQpO1xuICAgIH1cbiAgICBsaW5lTm9kZXMgPSBbXTtcbiAgICByZXR1cm4gbGluZVNpemVbZGlyZWN0aW9uXSArIHNwYWNpbmdbZGlyZWN0aW9uXTtcbn1cbmZ1bmN0aW9uIF9yZXNvbHZlTm9kZVNpemUobm9kZSkge1xuICAgIHZhciBsb2NhbEl0ZW1TaXplID0gaXRlbVNpemU7XG4gICAgaWYgKGdldEl0ZW1TaXplKSB7XG4gICAgICAgIGxvY2FsSXRlbVNpemUgPSBnZXRJdGVtU2l6ZShub2RlLnJlbmRlck5vZGUsIHNpemUpO1xuICAgIH1cbiAgICBpZiAobG9jYWxJdGVtU2l6ZVswXSA9PT0gdHJ1ZSB8fCBsb2NhbEl0ZW1TaXplWzFdID09PSB0cnVlKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBjb250ZXh0LnJlc29sdmVTaXplKG5vZGUsIHNpemUpO1xuICAgICAgICBpZiAobG9jYWxJdGVtU2l6ZVswXSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmVzdWx0WzBdID0gaXRlbVNpemVbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsSXRlbVNpemVbMV0gIT09IHRydWUpIHtcbiAgICAgICAgICAgIHJlc3VsdFsxXSA9IGl0ZW1TaXplWzFdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsSXRlbVNpemU7XG4gICAgfVxufVxuZnVuY3Rpb24gQ29sbGVjdGlvbkxheW91dChjb250ZXh0Xywgb3B0aW9ucykge1xuICAgIGNvbnRleHQgPSBjb250ZXh0XztcbiAgICBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIGFsaWdubWVudCA9IGNvbnRleHQuYWxpZ25tZW50O1xuICAgIGxpbmVEaXJlY3Rpb24gPSAoZGlyZWN0aW9uICsgMSkgJSAyO1xuICAgIGlmIChvcHRpb25zLmd1dHRlciAhPT0gdW5kZWZpbmVkICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICBjb25zb2xlLndhcm4oJ29wdGlvbiBgZ3V0dGVyYCBoYXMgYmVlbiBkZXByZWNhdGVkIGZvciBDb2xsZWN0aW9uTGF5b3V0LCB1c2UgbWFyZ2lucyAmIHNwYWNpbmcgaW5zdGVhZCcpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5ndXR0ZXIgJiYgIW9wdGlvbnMubWFyZ2lucyAmJiAhb3B0aW9ucy5zcGFjaW5nKSB7XG4gICAgICAgIHZhciBndXR0ZXIgPSBBcnJheS5pc0FycmF5KG9wdGlvbnMuZ3V0dGVyKSA/IG9wdGlvbnMuZ3V0dGVyIDogW1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZ3V0dGVyLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMuZ3V0dGVyXG4gICAgICAgICAgICBdO1xuICAgICAgICBtYXJnaW5zID0gW1xuICAgICAgICAgICAgZ3V0dGVyWzFdLFxuICAgICAgICAgICAgZ3V0dGVyWzBdLFxuICAgICAgICAgICAgZ3V0dGVyWzFdLFxuICAgICAgICAgICAgZ3V0dGVyWzBdXG4gICAgICAgIF07XG4gICAgICAgIHNwYWNpbmcgPSBndXR0ZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhvcHRpb25zLm1hcmdpbnMpO1xuICAgICAgICBzcGFjaW5nID0gb3B0aW9ucy5zcGFjaW5nIHx8IDA7XG4gICAgICAgIHNwYWNpbmcgPSBBcnJheS5pc0FycmF5KHNwYWNpbmcpID8gc3BhY2luZyA6IFtcbiAgICAgICAgICAgIHNwYWNpbmcsXG4gICAgICAgICAgICBzcGFjaW5nXG4gICAgICAgIF07XG4gICAgfVxuICAgIG1hcmdpblswXSA9IG1hcmdpbnNbZGlyZWN0aW9uID8gMCA6IDNdO1xuICAgIG1hcmdpblsxXSA9IC1tYXJnaW5zW2RpcmVjdGlvbiA/IDIgOiAxXTtcbiAgICBqdXN0aWZ5ID0gQXJyYXkuaXNBcnJheShvcHRpb25zLmp1c3RpZnkpID8gb3B0aW9ucy5qdXN0aWZ5IDogb3B0aW9ucy5qdXN0aWZ5ID8gW1xuICAgICAgICB0cnVlLFxuICAgICAgICB0cnVlXG4gICAgXSA6IFtcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGZhbHNlXG4gICAgXTtcbiAgICBsaW5lTGVuZ3RoID0gc2l6ZVtsaW5lRGlyZWN0aW9uXSAtIChkaXJlY3Rpb24gPyBtYXJnaW5zWzNdICsgbWFyZ2luc1sxXSA6IG1hcmdpbnNbMF0gKyBtYXJnaW5zWzJdKTtcbiAgICB2YXIgbm9kZTtcbiAgICB2YXIgbm9kZVNpemU7XG4gICAgdmFyIGxpbmVPZmZzZXQ7XG4gICAgdmFyIGJvdW5kO1xuICAgIGlmIChvcHRpb25zLmNlbGxzKSB7XG4gICAgICAgIGlmIChvcHRpb25zLml0ZW1TaXplICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdvcHRpb25zIGBjZWxsc2AgYW5kIGBpdGVtU2l6ZWAgY2Fubm90IGJvdGggYmUgc3BlY2lmaWVkIGZvciBDb2xsZWN0aW9uTGF5b3V0LCBvbmx5IHVzZSBvbmUgb2YgdGhlIHR3bycpO1xuICAgICAgICB9XG4gICAgICAgIGl0ZW1TaXplID0gW1xuICAgICAgICAgICAgKHNpemVbMF0gLSAobWFyZ2luc1sxXSArIG1hcmdpbnNbM10gKyBzcGFjaW5nWzBdICogKG9wdGlvbnMuY2VsbHNbMF0gLSAxKSkpIC8gb3B0aW9ucy5jZWxsc1swXSxcbiAgICAgICAgICAgIChzaXplWzFdIC0gKG1hcmdpbnNbMF0gKyBtYXJnaW5zWzJdICsgc3BhY2luZ1sxXSAqIChvcHRpb25zLmNlbGxzWzFdIC0gMSkpKSAvIG9wdGlvbnMuY2VsbHNbMV1cbiAgICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKCFvcHRpb25zLml0ZW1TaXplKSB7XG4gICAgICAgIGl0ZW1TaXplID0gW1xuICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuaXRlbVNpemUgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICBnZXRJdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLml0ZW1TaXplWzBdID09PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5pdGVtU2l6ZVswXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGl0ZW1TaXplID0gW1xuICAgICAgICAgICAgb3B0aW9ucy5pdGVtU2l6ZVswXSA9PT0gdW5kZWZpbmVkID8gc2l6ZVswXSA6IG9wdGlvbnMuaXRlbVNpemVbMF0sXG4gICAgICAgICAgICBvcHRpb25zLml0ZW1TaXplWzFdID09PSB1bmRlZmluZWQgPyBzaXplWzFdIDogb3B0aW9ucy5pdGVtU2l6ZVsxXVxuICAgICAgICBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGl0ZW1TaXplID0gb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICB9XG4gICAgb2Zmc2V0ID0gY29udGV4dC5zY3JvbGxPZmZzZXQgKyAoYWxpZ25tZW50ID8gMCA6IG1hcmdpblthbGlnbm1lbnRdKTtcbiAgICBib3VuZCA9IGNvbnRleHQuc2Nyb2xsRW5kICsgKGFsaWdubWVudCA/IDAgOiBtYXJnaW5bYWxpZ25tZW50XSk7XG4gICAgbGluZU9mZnNldCA9IDA7XG4gICAgbGluZU5vZGVzID0gW107XG4gICAgd2hpbGUgKG9mZnNldCA8IGJvdW5kKSB7XG4gICAgICAgIG5vZGUgPSBjb250ZXh0Lm5leHQoKTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBfbGF5b3V0TGluZSh0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVTaXplID0gX3Jlc29sdmVOb2RlU2l6ZShub2RlKTtcbiAgICAgICAgbGluZU9mZnNldCArPSAobGluZU5vZGVzLmxlbmd0aCA/IHNwYWNpbmdbbGluZURpcmVjdGlvbl0gOiAwKSArIG5vZGVTaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgICAgICBpZiAobGluZU9mZnNldCA+IGxpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgIG9mZnNldCArPSBfbGF5b3V0TGluZSh0cnVlLCAhbm9kZSk7XG4gICAgICAgICAgICBsaW5lT2Zmc2V0ID0gbm9kZVNpemVbbGluZURpcmVjdGlvbl07XG4gICAgICAgIH1cbiAgICAgICAgbGluZU5vZGVzLnB1c2goe1xuICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgIHNpemU6IG5vZGVTaXplXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvZmZzZXQgPSBjb250ZXh0LnNjcm9sbE9mZnNldCArIChhbGlnbm1lbnQgPyBtYXJnaW5bYWxpZ25tZW50XSA6IDApO1xuICAgIGJvdW5kID0gY29udGV4dC5zY3JvbGxTdGFydCArIChhbGlnbm1lbnQgPyBtYXJnaW5bYWxpZ25tZW50XSA6IDApO1xuICAgIGxpbmVPZmZzZXQgPSAwO1xuICAgIGxpbmVOb2RlcyA9IFtdO1xuICAgIHdoaWxlIChvZmZzZXQgPiBib3VuZCkge1xuICAgICAgICBub2RlID0gY29udGV4dC5wcmV2KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgX2xheW91dExpbmUoZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZVNpemUgPSBfcmVzb2x2ZU5vZGVTaXplKG5vZGUpO1xuICAgICAgICBsaW5lT2Zmc2V0ICs9IChsaW5lTm9kZXMubGVuZ3RoID8gc3BhY2luZ1tsaW5lRGlyZWN0aW9uXSA6IDApICsgbm9kZVNpemVbbGluZURpcmVjdGlvbl07XG4gICAgICAgIGlmIChsaW5lT2Zmc2V0ID4gbGluZUxlbmd0aCkge1xuICAgICAgICAgICAgb2Zmc2V0IC09IF9sYXlvdXRMaW5lKGZhbHNlLCAhbm9kZSk7XG4gICAgICAgICAgICBsaW5lT2Zmc2V0ID0gbm9kZVNpemVbbGluZURpcmVjdGlvbl07XG4gICAgICAgIH1cbiAgICAgICAgbGluZU5vZGVzLnVuc2hpZnQoe1xuICAgICAgICAgICAgbm9kZTogbm9kZSxcbiAgICAgICAgICAgIHNpemU6IG5vZGVTaXplXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbkNvbGxlY3Rpb25MYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xuQ29sbGVjdGlvbkxheW91dC5OYW1lID0gJ0NvbGxlY3Rpb25MYXlvdXQnO1xuQ29sbGVjdGlvbkxheW91dC5EZXNjcmlwdGlvbiA9ICdNdWx0aS1jZWxsIGNvbGxlY3Rpb24tbGF5b3V0IHdpdGggbWFyZ2lucyAmIHNwYWNpbmcnO1xubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uTGF5b3V0OyIsInZhciBVdGlsaXR5ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogbnVsbDtcbnZhciBjYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgIHNlcXVlbmNlOiB0cnVlLFxuICAgICAgICBkaXJlY3Rpb246IFtcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlgsXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5ZXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbGluZzogdHJ1ZVxuICAgIH07XG5mdW5jdGlvbiBDb3ZlckxheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIG5vZGUgPSBjb250ZXh0Lm5leHQoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICB2YXIgZGlyZWN0aW9uID0gY29udGV4dC5kaXJlY3Rpb247XG4gICAgdmFyIGl0ZW1TaXplID0gb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICB2YXIgb3BhY2l0eVN0ZXAgPSAwLjI7XG4gICAgdmFyIHNjYWxlU3RlcCA9IDAuMTtcbiAgICB2YXIgdHJhbnNsYXRlU3RlcCA9IDMwO1xuICAgIHZhciB6U3RhcnQgPSAxMDA7XG4gICAgY29udGV4dC5zZXQobm9kZSwge1xuICAgICAgICBzaXplOiBpdGVtU2l6ZSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNVxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgelN0YXJ0XG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbExlbmd0aDogaXRlbVNpemVbZGlyZWN0aW9uXVxuICAgIH0pO1xuICAgIHZhciB0cmFuc2xhdGUgPSBpdGVtU2l6ZVswXSAvIDI7XG4gICAgdmFyIG9wYWNpdHkgPSAxIC0gb3BhY2l0eVN0ZXA7XG4gICAgdmFyIHpJbmRleCA9IHpTdGFydCAtIDE7XG4gICAgdmFyIHNjYWxlID0gMSAtIHNjYWxlU3RlcDtcbiAgICB2YXIgcHJldiA9IGZhbHNlO1xuICAgIHZhciBlbmRSZWFjaGVkID0gZmFsc2U7XG4gICAgbm9kZSA9IGNvbnRleHQubmV4dCgpO1xuICAgIGlmICghbm9kZSkge1xuICAgICAgICBub2RlID0gY29udGV4dC5wcmV2KCk7XG4gICAgICAgIHByZXYgPSB0cnVlO1xuICAgIH1cbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBjb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgICAgICBzaXplOiBpdGVtU2l6ZSxcbiAgICAgICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBhbGlnbjogW1xuICAgICAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgICAgICAwLjVcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB0cmFuc2xhdGU6IGRpcmVjdGlvbiA/IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHByZXYgPyAtdHJhbnNsYXRlIDogdHJhbnNsYXRlLFxuICAgICAgICAgICAgICAgIHpJbmRleFxuICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICBwcmV2ID8gLXRyYW5zbGF0ZSA6IHRyYW5zbGF0ZSxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIHpJbmRleFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHNjYWxlOiBbXG4gICAgICAgICAgICAgICAgc2NhbGUsXG4gICAgICAgICAgICAgICAgc2NhbGUsXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgICAgICBzY3JvbGxMZW5ndGg6IGl0ZW1TaXplW2RpcmVjdGlvbl1cbiAgICAgICAgfSk7XG4gICAgICAgIG9wYWNpdHkgLT0gb3BhY2l0eVN0ZXA7XG4gICAgICAgIHNjYWxlIC09IHNjYWxlU3RlcDtcbiAgICAgICAgdHJhbnNsYXRlICs9IHRyYW5zbGF0ZVN0ZXA7XG4gICAgICAgIHpJbmRleC0tO1xuICAgICAgICBpZiAodHJhbnNsYXRlID49IHNpemVbZGlyZWN0aW9uXSAvIDIpIHtcbiAgICAgICAgICAgIGVuZFJlYWNoZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZSA9IHByZXYgPyBjb250ZXh0LnByZXYoKSA6IGNvbnRleHQubmV4dCgpO1xuICAgICAgICAgICAgZW5kUmVhY2hlZCA9ICFub2RlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbmRSZWFjaGVkKSB7XG4gICAgICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5kUmVhY2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcHJldiA9IHRydWU7XG4gICAgICAgICAgICBub2RlID0gY29udGV4dC5wcmV2KCk7XG4gICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSA9IGl0ZW1TaXplW2RpcmVjdGlvbl0gLyAyO1xuICAgICAgICAgICAgICAgIG9wYWNpdHkgPSAxIC0gb3BhY2l0eVN0ZXA7XG4gICAgICAgICAgICAgICAgekluZGV4ID0gelN0YXJ0IC0gMTtcbiAgICAgICAgICAgICAgICBzY2FsZSA9IDEgLSBzY2FsZVN0ZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5Db3ZlckxheW91dC5DYXBhYmlsaXRpZXMgPSBjYXBhYmlsaXRpZXM7XG5tb2R1bGUuZXhwb3J0cyA9IENvdmVyTGF5b3V0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ3ViZUxheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGl0ZW1TaXplID0gb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICBjb250ZXh0LnNldChjb250ZXh0Lm5leHQoKSwge1xuICAgICAgICBzaXplOiBpdGVtU2l6ZSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgTWF0aC5QSSAvIDIsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgaXRlbVNpemVbMF0gLyAyLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIGNvbnRleHQuc2V0KGNvbnRleHQubmV4dCgpLCB7XG4gICAgICAgIHNpemU6IGl0ZW1TaXplLFxuICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNVxuICAgICAgICBdLFxuICAgICAgICByb3RhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBNYXRoLlBJIC8gMixcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAtKGl0ZW1TaXplWzBdIC8gMiksXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdXG4gICAgfSk7XG4gICAgY29udGV4dC5zZXQoY29udGV4dC5uZXh0KCksIHtcbiAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgTWF0aC5QSSAvIDIsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtKGl0ZW1TaXplWzFdIC8gMiksXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICBjb250ZXh0LnNldChjb250ZXh0Lm5leHQoKSwge1xuICAgICAgICBzaXplOiBpdGVtU2l6ZSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICBNYXRoLlBJIC8gMixcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGl0ZW1TaXplWzFdIC8gMixcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH0pO1xufTsiLCJpZiAoY29uc29sZS53YXJuKSB7XG4gICAgY29uc29sZS53YXJuKCdHcmlkTGF5b3V0IGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLCB1c2UgQ29sbGVjdGlvbkxheW91dCBpbnN0ZWFkJyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vQ29sbGVjdGlvbkxheW91dCcpOyIsInZhciBMYXlvdXREb2NrSGVscGVyID0gcmVxdWlyZSgnLi4vaGVscGVycy9MYXlvdXREb2NrSGVscGVyJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEhlYWRlckZvb3RlckxheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIGRvY2sgPSBuZXcgTGF5b3V0RG9ja0hlbHBlcihjb250ZXh0LCBvcHRpb25zKTtcbiAgICBkb2NrLnRvcCgnaGVhZGVyJywgb3B0aW9ucy5oZWFkZXJTaXplICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmhlYWRlclNpemUgOiBvcHRpb25zLmhlYWRlckhlaWdodCk7XG4gICAgZG9jay5ib3R0b20oJ2Zvb3RlcicsIG9wdGlvbnMuZm9vdGVyU2l6ZSAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5mb290ZXJTaXplIDogb3B0aW9ucy5mb290ZXJIZWlnaHQpO1xuICAgIGRvY2suZmlsbCgnY29udGVudCcpO1xufTsiLCJ2YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG52YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4uL0xheW91dFV0aWxpdHknKTtcbnZhciBjYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgIHNlcXVlbmNlOiB0cnVlLFxuICAgICAgICBkaXJlY3Rpb246IFtcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlksXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbGluZzogdHJ1ZSxcbiAgICAgICAgdHJ1ZVNpemU6IHRydWUsXG4gICAgICAgIHNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQ6IHRydWVcbiAgICB9O1xudmFyIHNldCA9IHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgc2Nyb2xsTGVuZ3RoOiB1bmRlZmluZWRcbiAgICB9O1xudmFyIG1hcmdpbiA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG5mdW5jdGlvbiBMaXN0TGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICB2YXIgZGlyZWN0aW9uID0gY29udGV4dC5kaXJlY3Rpb247XG4gICAgdmFyIGFsaWdubWVudCA9IGNvbnRleHQuYWxpZ25tZW50O1xuICAgIHZhciByZXZEaXJlY3Rpb24gPSBkaXJlY3Rpb24gPyAwIDogMTtcbiAgICB2YXIgb2Zmc2V0O1xuICAgIHZhciBtYXJnaW5zID0gTGF5b3V0VXRpbGl0eS5ub3JtYWxpemVNYXJnaW5zKG9wdGlvbnMubWFyZ2lucyk7XG4gICAgdmFyIHNwYWNpbmcgPSBvcHRpb25zLnNwYWNpbmcgfHwgMDtcbiAgICB2YXIgbm9kZTtcbiAgICB2YXIgbm9kZVNpemU7XG4gICAgdmFyIGl0ZW1TaXplO1xuICAgIHZhciBnZXRJdGVtU2l6ZTtcbiAgICB2YXIgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbDtcbiAgICB2YXIgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbE9mZnNldDtcbiAgICB2YXIgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aDtcbiAgICB2YXIgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aDtcbiAgICB2YXIgZmlyc3RWaXNpYmxlQ2VsbDtcbiAgICB2YXIgbGFzdE5vZGU7XG4gICAgdmFyIGxhc3RDZWxsT2Zmc2V0SW5GaXJzdFZpc2libGVTZWN0aW9uO1xuICAgIHZhciBpc1NlY3Rpb25DYWxsYmFjayA9IG9wdGlvbnMuaXNTZWN0aW9uQ2FsbGJhY2s7XG4gICAgdmFyIGJvdW5kO1xuICAgIHNldC5zaXplWzBdID0gc2l6ZVswXTtcbiAgICBzZXQuc2l6ZVsxXSA9IHNpemVbMV07XG4gICAgc2V0LnNpemVbcmV2RGlyZWN0aW9uXSAtPSBtYXJnaW5zWzEgLSByZXZEaXJlY3Rpb25dICsgbWFyZ2luc1szIC0gcmV2RGlyZWN0aW9uXTtcbiAgICBzZXQudHJhbnNsYXRlWzBdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzFdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzJdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlW3JldkRpcmVjdGlvbl0gPSBtYXJnaW5zW2RpcmVjdGlvbiA/IDMgOiAwXTtcbiAgICBpZiAob3B0aW9ucy5pdGVtU2l6ZSA9PT0gdHJ1ZSB8fCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnaXRlbVNpemUnKSkge1xuICAgICAgICBpdGVtU2l6ZSA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLml0ZW1TaXplIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgZ2V0SXRlbVNpemUgPSBvcHRpb25zLml0ZW1TaXplO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGl0ZW1TaXplID0gb3B0aW9ucy5pdGVtU2l6ZSA9PT0gdW5kZWZpbmVkID8gc2l6ZVtkaXJlY3Rpb25dIDogb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICB9XG4gICAgbWFyZ2luWzBdID0gbWFyZ2luc1tkaXJlY3Rpb24gPyAwIDogM107XG4gICAgbWFyZ2luWzFdID0gLW1hcmdpbnNbZGlyZWN0aW9uID8gMiA6IDFdO1xuICAgIG9mZnNldCA9IGNvbnRleHQuc2Nyb2xsT2Zmc2V0ICsgbWFyZ2luW2FsaWdubWVudF07XG4gICAgYm91bmQgPSBjb250ZXh0LnNjcm9sbEVuZCArIG1hcmdpblthbGlnbm1lbnRdO1xuICAgIHdoaWxlIChvZmZzZXQgPCBib3VuZCArIHNwYWNpbmcpIHtcbiAgICAgICAgbGFzdE5vZGUgPSBub2RlO1xuICAgICAgICBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZVNpemUgPSBnZXRJdGVtU2l6ZSA/IGdldEl0ZW1TaXplKG5vZGUucmVuZGVyTm9kZSkgOiBpdGVtU2l6ZTtcbiAgICAgICAgbm9kZVNpemUgPSBub2RlU2l6ZSA9PT0gdHJ1ZSA/IGNvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgc2l6ZSlbZGlyZWN0aW9uXSA6IG5vZGVTaXplO1xuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gbm9kZVNpemU7XG4gICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldCArIChhbGlnbm1lbnQgPyBzcGFjaW5nIDogMCk7XG4gICAgICAgIHNldC5zY3JvbGxMZW5ndGggPSBub2RlU2l6ZSArIHNwYWNpbmc7XG4gICAgICAgIGNvbnRleHQuc2V0KG5vZGUsIHNldCk7XG4gICAgICAgIG9mZnNldCArPSBzZXQuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgaXNTZWN0aW9uQ2FsbGJhY2sobm9kZS5yZW5kZXJOb2RlKSkge1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gTWF0aC5tYXgobWFyZ2luWzBdLCBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgICAgIGlmICghZmlyc3RWaXNpYmxlQ2VsbCkge1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwgPSBub2RlO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IG5vZGVTaXplO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0Q2VsbE9mZnNldEluRmlyc3RWaXNpYmxlU2VjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghZmlyc3RWaXNpYmxlQ2VsbCAmJiBvZmZzZXQgPj0gMCkge1xuICAgICAgICAgICAgZmlyc3RWaXNpYmxlQ2VsbCA9IG5vZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGxhc3ROb2RlICYmICFub2RlICYmICFhbGlnbm1lbnQpIHtcbiAgICAgICAgc2V0LnNjcm9sbExlbmd0aCA9IG5vZGVTaXplICsgbWFyZ2luWzBdICsgLW1hcmdpblsxXTtcbiAgICAgICAgY29udGV4dC5zZXQobGFzdE5vZGUsIHNldCk7XG4gICAgfVxuICAgIGxhc3ROb2RlID0gdW5kZWZpbmVkO1xuICAgIG5vZGUgPSB1bmRlZmluZWQ7XG4gICAgb2Zmc2V0ID0gY29udGV4dC5zY3JvbGxPZmZzZXQgKyBtYXJnaW5bYWxpZ25tZW50XTtcbiAgICBib3VuZCA9IGNvbnRleHQuc2Nyb2xsU3RhcnQgKyBtYXJnaW5bYWxpZ25tZW50XTtcbiAgICB3aGlsZSAob2Zmc2V0ID4gYm91bmQgLSBzcGFjaW5nKSB7XG4gICAgICAgIGxhc3ROb2RlID0gbm9kZTtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVTaXplID0gZ2V0SXRlbVNpemUgPyBnZXRJdGVtU2l6ZShub2RlLnJlbmRlck5vZGUpIDogaXRlbVNpemU7XG4gICAgICAgIG5vZGVTaXplID0gbm9kZVNpemUgPT09IHRydWUgPyBjb250ZXh0LnJlc29sdmVTaXplKG5vZGUsIHNpemUpW2RpcmVjdGlvbl0gOiBub2RlU2l6ZTtcbiAgICAgICAgc2V0LnNjcm9sbExlbmd0aCA9IG5vZGVTaXplICsgc3BhY2luZztcbiAgICAgICAgb2Zmc2V0IC09IHNldC5zY3JvbGxMZW5ndGg7XG4gICAgICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBub2RlU2l6ZTtcbiAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gb2Zmc2V0ICsgKGFsaWdubWVudCA/IHNwYWNpbmcgOiAwKTtcbiAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgaWYgKGlzU2VjdGlvbkNhbGxiYWNrICYmIGlzU2VjdGlvbkNhbGxiYWNrKG5vZGUucmVuZGVyTm9kZSkpIHtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IE1hdGgubWF4KG1hcmdpblswXSwgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dKTtcbiAgICAgICAgICAgIGNvbnRleHQuc2V0KG5vZGUsIHNldCk7XG4gICAgICAgICAgICBpZiAoIWxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwpIHtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsID0gbm9kZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsT2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxMZW5ndGggPSBub2RlU2l6ZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsU2Nyb2xsTGVuZ3RoID0gc2V0LnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvZmZzZXQgKyBub2RlU2l6ZSA+PSAwKSB7XG4gICAgICAgICAgICBmaXJzdFZpc2libGVDZWxsID0gbm9kZTtcbiAgICAgICAgICAgIGlmIChsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsKSB7XG4gICAgICAgICAgICAgICAgbGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gPSBvZmZzZXQgKyBub2RlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGxhc3ROb2RlICYmICFub2RlICYmIGFsaWdubWVudCkge1xuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemUgKyBtYXJnaW5bMF0gKyAtbWFyZ2luWzFdO1xuICAgICAgICBjb250ZXh0LnNldChsYXN0Tm9kZSwgc2V0KTtcbiAgICAgICAgaWYgKGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwgPT09IGxhc3ROb2RlKSB7XG4gICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsU2Nyb2xsTGVuZ3RoID0gc2V0LnNjcm9sbExlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgIWxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKGlzU2VjdGlvbkNhbGxiYWNrKG5vZGUucmVuZGVyTm9kZSkpIHtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsID0gbm9kZTtcbiAgICAgICAgICAgICAgICBub2RlU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgfHwgY29udGV4dC5yZXNvbHZlU2l6ZShub2RlLCBzaXplKVtkaXJlY3Rpb25dO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsKSB7XG4gICAgICAgIHZhciBjb3JyZWN0ZWRPZmZzZXQgPSBNYXRoLm1heChtYXJnaW5bMF0sIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQpO1xuICAgICAgICBpZiAobGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gIT09IHVuZGVmaW5lZCAmJiBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID4gbGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gLSBtYXJnaW5bMF0pIHtcbiAgICAgICAgICAgIGNvcnJlY3RlZE9mZnNldCA9IGxhc3RDZWxsT2Zmc2V0SW5GaXJzdFZpc2libGVTZWN0aW9uIC0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aDtcbiAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gY29ycmVjdGVkT2Zmc2V0O1xuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aDtcbiAgICAgICAgY29udGV4dC5zZXQobGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCwgc2V0KTtcbiAgICB9XG59XG5MaXN0TGF5b3V0LkNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdGllcztcbkxpc3RMYXlvdXQuTmFtZSA9ICdMaXN0TGF5b3V0Jztcbkxpc3RMYXlvdXQuRGVzY3JpcHRpb24gPSAnTGlzdC1sYXlvdXQgd2l0aCBtYXJnaW5zLCBzcGFjaW5nIGFuZCBzdGlja3kgaGVhZGVycyc7XG5tb2R1bGUuZXhwb3J0cyA9IExpc3RMYXlvdXQ7IiwidmFyIExheW91dERvY2tIZWxwZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL0xheW91dERvY2tIZWxwZXInKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gTmF2QmFyTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgZG9jayA9IG5ldyBMYXlvdXREb2NrSGVscGVyKGNvbnRleHQsIHtcbiAgICAgICAgICAgIG1hcmdpbnM6IG9wdGlvbnMubWFyZ2lucyxcbiAgICAgICAgICAgIHRyYW5zbGF0ZVo6IDFcbiAgICAgICAgfSk7XG4gICAgY29udGV4dC5zZXQoJ2JhY2tncm91bmQnLCB7IHNpemU6IGNvbnRleHQuc2l6ZSB9KTtcbiAgICB2YXIgbm9kZTtcbiAgICB2YXIgaTtcbiAgICB2YXIgcmlnaHRJdGVtcyA9IGNvbnRleHQuZ2V0KCdyaWdodEl0ZW1zJyk7XG4gICAgaWYgKHJpZ2h0SXRlbXMpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJpZ2h0SXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBjb250ZXh0LmdldChyaWdodEl0ZW1zW2ldKTtcbiAgICAgICAgICAgIGRvY2sucmlnaHQobm9kZSwgb3B0aW9ucy5yaWdodEl0ZW1XaWR0aCB8fCBvcHRpb25zLml0ZW1XaWR0aCk7XG4gICAgICAgICAgICBkb2NrLnJpZ2h0KHVuZGVmaW5lZCwgb3B0aW9ucy5yaWdodEl0ZW1TcGFjZXIgfHwgb3B0aW9ucy5pdGVtU3BhY2VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgbGVmdEl0ZW1zID0gY29udGV4dC5nZXQoJ2xlZnRJdGVtcycpO1xuICAgIGlmIChsZWZ0SXRlbXMpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlZnRJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQuZ2V0KGxlZnRJdGVtc1tpXSk7XG4gICAgICAgICAgICBkb2NrLmxlZnQobm9kZSwgb3B0aW9ucy5sZWZ0SXRlbVdpZHRoIHx8IG9wdGlvbnMuaXRlbVdpZHRoKTtcbiAgICAgICAgICAgIGRvY2subGVmdCh1bmRlZmluZWQsIG9wdGlvbnMubGVmdEl0ZW1TcGFjZXIgfHwgb3B0aW9ucy5pdGVtU3BhY2VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkb2NrLmZpbGwoJ3RpdGxlJyk7XG59OyIsInZhciBVdGlsaXR5ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogbnVsbDtcbnZhciBjYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgIHNlcXVlbmNlOiB0cnVlLFxuICAgICAgICBkaXJlY3Rpb246IFtcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlksXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbGluZzogZmFsc2VcbiAgICB9O1xudmFyIGRpcmVjdGlvbjtcbnZhciBzaXplO1xudmFyIHJhdGlvcztcbnZhciB0b3RhbDtcbnZhciBvZmZzZXQ7XG52YXIgaW5kZXg7XG52YXIgbm9kZTtcbnZhciBzZXQgPSB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9O1xuZnVuY3Rpb24gUHJvcG9ydGlvbmFsTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHJhdGlvcyA9IG9wdGlvbnMucmF0aW9zO1xuICAgIHRvdGFsID0gMDtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCByYXRpb3MubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHRvdGFsICs9IHJhdGlvc1tpbmRleF07XG4gICAgfVxuICAgIHNldC5zaXplWzBdID0gc2l6ZVswXTtcbiAgICBzZXQuc2l6ZVsxXSA9IHNpemVbMV07XG4gICAgc2V0LnRyYW5zbGF0ZVswXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgbm9kZSA9IGNvbnRleHQubmV4dCgpO1xuICAgIG9mZnNldCA9IDA7XG4gICAgaW5kZXggPSAwO1xuICAgIHdoaWxlIChub2RlICYmIGluZGV4IDwgcmF0aW9zLmxlbmd0aCkge1xuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gKHNpemVbZGlyZWN0aW9uXSAtIG9mZnNldCkgLyB0b3RhbCAqIHJhdGlvc1tpbmRleF07XG4gICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldDtcbiAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IHNldC5zaXplW2RpcmVjdGlvbl07XG4gICAgICAgIHRvdGFsIC09IHJhdGlvc1tpbmRleF07XG4gICAgICAgIGluZGV4Kys7XG4gICAgICAgIG5vZGUgPSBjb250ZXh0Lm5leHQoKTtcbiAgICB9XG59XG5Qcm9wb3J0aW9uYWxMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBQcm9wb3J0aW9uYWxMYXlvdXQ7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWVxuICAgICAgICBdLFxuICAgICAgICB0cnVlU2l6ZTogdHJ1ZVxuICAgIH07XG52YXIgc2l6ZTtcbnZhciBkaXJlY3Rpb247XG52YXIgcmV2RGlyZWN0aW9uO1xudmFyIGl0ZW1zO1xudmFyIHNwYWNlcnM7XG52YXIgbWFyZ2lucztcbnZhciBzcGFjaW5nO1xudmFyIHNpemVMZWZ0O1xudmFyIHNldCA9IHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH07XG52YXIgbm9kZVNpemU7XG52YXIgb2Zmc2V0O1xudmFyIHpJbmNyZW1lbnQ7XG5mdW5jdGlvbiBUYWJCYXJMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgZGlyZWN0aW9uID0gY29udGV4dC5kaXJlY3Rpb247XG4gICAgcmV2RGlyZWN0aW9uID0gZGlyZWN0aW9uID8gMCA6IDE7XG4gICAgc3BhY2luZyA9IG9wdGlvbnMuc3BhY2luZyB8fCAwO1xuICAgIGl0ZW1zID0gY29udGV4dC5nZXQoJ2l0ZW1zJyk7XG4gICAgc3BhY2VycyA9IGNvbnRleHQuZ2V0KCdzcGFjZXJzJyk7XG4gICAgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhvcHRpb25zLm1hcmdpbnMpO1xuICAgIHpJbmNyZW1lbnQgPSBvcHRpb25zLnpJbmNyZW1lbnQgfHwgMC4wMDE7XG4gICAgc2V0LnNpemVbMF0gPSBjb250ZXh0LnNpemVbMF07XG4gICAgc2V0LnNpemVbMV0gPSBjb250ZXh0LnNpemVbMV07XG4gICAgc2V0LnNpemVbcmV2RGlyZWN0aW9uXSAtPSBtYXJnaW5zWzEgLSByZXZEaXJlY3Rpb25dICsgbWFyZ2luc1szIC0gcmV2RGlyZWN0aW9uXTtcbiAgICBzZXQudHJhbnNsYXRlWzBdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzFdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzJdID0gekluY3JlbWVudDtcbiAgICBzZXQudHJhbnNsYXRlW3JldkRpcmVjdGlvbl0gPSBtYXJnaW5zW2RpcmVjdGlvbiA/IDMgOiAwXTtcbiAgICBzZXQuYWxpZ25bMF0gPSAwO1xuICAgIHNldC5hbGlnblsxXSA9IDA7XG4gICAgc2V0Lm9yaWdpblswXSA9IDA7XG4gICAgc2V0Lm9yaWdpblsxXSA9IDA7XG4gICAgb2Zmc2V0ID0gZGlyZWN0aW9uID8gbWFyZ2luc1swXSA6IG1hcmdpbnNbM107XG4gICAgc2l6ZUxlZnQgPSBzaXplW2RpcmVjdGlvbl0gLSAob2Zmc2V0ICsgKGRpcmVjdGlvbiA/IG1hcmdpbnNbMl0gOiBtYXJnaW5zWzFdKSk7XG4gICAgc2l6ZUxlZnQgLT0gKGl0ZW1zLmxlbmd0aCAtIDEpICogc3BhY2luZztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvcHRpb25zLml0ZW1TaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG5vZGVTaXplID0gTWF0aC5yb3VuZChzaXplTGVmdCAvIChpdGVtcy5sZW5ndGggLSBpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgPT09IHRydWUgPyBjb250ZXh0LnJlc29sdmVTaXplKGl0ZW1zW2ldLCBzaXplKVtkaXJlY3Rpb25dIDogb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMF0gOiBtYXJnaW5zWzNdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSBpdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMl0gOiBtYXJnaW5zWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0LnNjcm9sbExlbmd0aCArPSBzcGFjaW5nO1xuICAgICAgICB9XG4gICAgICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBub2RlU2l6ZTtcbiAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gb2Zmc2V0O1xuICAgICAgICBjb250ZXh0LnNldChpdGVtc1tpXSwgc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IG5vZGVTaXplO1xuICAgICAgICBzaXplTGVmdCAtPSBub2RlU2l6ZTtcbiAgICAgICAgaWYgKGkgPT09IG9wdGlvbnMuc2VsZWN0ZWRJdGVtSW5kZXgpIHtcbiAgICAgICAgICAgIHNldC5zY3JvbGxMZW5ndGggPSAwO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dICs9IG5vZGVTaXplIC8gMjtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbMl0gPSB6SW5jcmVtZW50ICogMjtcbiAgICAgICAgICAgIHNldC5vcmlnaW5bZGlyZWN0aW9uXSA9IDAuNTtcbiAgICAgICAgICAgIGNvbnRleHQuc2V0KCdzZWxlY3RlZEl0ZW1PdmVybGF5Jywgc2V0KTtcbiAgICAgICAgICAgIHNldC5vcmlnaW5bZGlyZWN0aW9uXSA9IDA7XG4gICAgICAgICAgICBzZXQudHJhbnNsYXRlWzJdID0gekluY3JlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA8IGl0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGlmIChzcGFjZXJzICYmIGkgPCBzcGFjZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBzcGFjaW5nO1xuICAgICAgICAgICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnNldChzcGFjZXJzW2ldLCBzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNwYWNpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvZmZzZXQgKz0gZGlyZWN0aW9uID8gbWFyZ2luc1syXSA6IG1hcmdpbnNbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0LnNjcm9sbExlbmd0aCA9IDA7XG4gICAgc2V0LnNpemVbMF0gPSBzaXplWzBdO1xuICAgIHNldC5zaXplWzFdID0gc2l6ZVsxXTtcbiAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gc2l6ZVtkaXJlY3Rpb25dO1xuICAgIHNldC50cmFuc2xhdGVbMF0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbMV0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbMl0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IDA7XG4gICAgY29udGV4dC5zZXQoJ2JhY2tncm91bmQnLCBzZXQpO1xufVxuVGFiQmFyTGF5b3V0LkNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdGllcztcblRhYkJhckxheW91dC5OYW1lID0gJ1RhYkJhckxheW91dCc7XG5UYWJCYXJMYXlvdXQuRGVzY3JpcHRpb24gPSAnVGFiQmFyIHdpZGdldCBsYXlvdXQnO1xubW9kdWxlLmV4cG9ydHMgPSBUYWJCYXJMYXlvdXQ7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIGNhcGFiaWxpdGllcyA9IHtcbiAgICAgICAgc2VxdWVuY2U6IHRydWUsXG4gICAgICAgIGRpcmVjdGlvbjogW1xuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWSxcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlhcbiAgICAgICAgXSxcbiAgICAgICAgc2Nyb2xsaW5nOiB0cnVlLFxuICAgICAgICB0cnVlU2l6ZTogdHJ1ZVxuICAgIH07XG52YXIgc2l6ZTtcbnZhciBkaXJlY3Rpb247XG52YXIgcmV2RGlyZWN0aW9uO1xudmFyIG5vZGU7XG52YXIgaXRlbVNpemU7XG52YXIgZGlhbWV0ZXI7XG52YXIgb2Zmc2V0O1xudmFyIGJvdW5kO1xudmFyIGFuZ2xlO1xudmFyIHJhZGl1cztcbnZhciBpdGVtQW5nbGU7XG52YXIgcmFkaWFsT3BhY2l0eTtcbnZhciBzZXQgPSB7XG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgc2Nyb2xsTGVuZ3RoOiB1bmRlZmluZWRcbiAgICB9O1xuZnVuY3Rpb24gV2hlZWxMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgZGlyZWN0aW9uID0gY29udGV4dC5kaXJlY3Rpb247XG4gICAgcmV2RGlyZWN0aW9uID0gZGlyZWN0aW9uID8gMCA6IDE7XG4gICAgaXRlbVNpemUgPSBvcHRpb25zLml0ZW1TaXplIHx8IHNpemVbZGlyZWN0aW9uXSAvIDI7XG4gICAgZGlhbWV0ZXIgPSBvcHRpb25zLmRpYW1ldGVyIHx8IGl0ZW1TaXplICogMztcbiAgICByYWRpdXMgPSBkaWFtZXRlciAvIDI7XG4gICAgaXRlbUFuZ2xlID0gTWF0aC5hdGFuMihpdGVtU2l6ZSAvIDIsIHJhZGl1cykgKiAyO1xuICAgIHJhZGlhbE9wYWNpdHkgPSBvcHRpb25zLnJhZGlhbE9wYWNpdHkgPT09IHVuZGVmaW5lZCA/IDEgOiBvcHRpb25zLnJhZGlhbE9wYWNpdHk7XG4gICAgc2V0Lm9wYWNpdHkgPSAxO1xuICAgIHNldC5zaXplWzBdID0gc2l6ZVswXTtcbiAgICBzZXQuc2l6ZVsxXSA9IHNpemVbMV07XG4gICAgc2V0LnNpemVbcmV2RGlyZWN0aW9uXSA9IHNpemVbcmV2RGlyZWN0aW9uXTtcbiAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gaXRlbVNpemU7XG4gICAgc2V0LnRyYW5zbGF0ZVswXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsyXSA9IDA7XG4gICAgc2V0LnJvdGF0ZVswXSA9IDA7XG4gICAgc2V0LnJvdGF0ZVsxXSA9IDA7XG4gICAgc2V0LnJvdGF0ZVsyXSA9IDA7XG4gICAgc2V0LnNjcm9sbExlbmd0aCA9IGl0ZW1TaXplO1xuICAgIG9mZnNldCA9IGNvbnRleHQuc2Nyb2xsT2Zmc2V0O1xuICAgIGJvdW5kID0gTWF0aC5QSSAvIDIgLyBpdGVtQW5nbGUgKiBpdGVtU2l6ZSArIGl0ZW1TaXplO1xuICAgIHdoaWxlIChvZmZzZXQgPD0gYm91bmQpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQubmV4dCgpO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZzZXQgPj0gLWJvdW5kKSB7XG4gICAgICAgICAgICBhbmdsZSA9IG9mZnNldCAvIGl0ZW1TaXplICogaXRlbUFuZ2xlO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVsyXSA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSAtIHJhZGl1cztcbiAgICAgICAgICAgIHNldC5yb3RhdGVbcmV2RGlyZWN0aW9uXSA9IGRpcmVjdGlvbiA/IC1hbmdsZSA6IGFuZ2xlO1xuICAgICAgICAgICAgc2V0Lm9wYWNpdHkgPSAxIC0gTWF0aC5hYnMoYW5nbGUpIC8gKE1hdGguUEkgLyAyKSAqICgxIC0gcmFkaWFsT3BhY2l0eSk7XG4gICAgICAgICAgICBjb250ZXh0LnNldChub2RlLCBzZXQpO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBpdGVtU2l6ZTtcbiAgICB9XG4gICAgb2Zmc2V0ID0gY29udGV4dC5zY3JvbGxPZmZzZXQgLSBpdGVtU2l6ZTtcbiAgICB3aGlsZSAob2Zmc2V0ID49IC1ib3VuZCkge1xuICAgICAgICBub2RlID0gY29udGV4dC5wcmV2KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZnNldCA8PSBib3VuZCkge1xuICAgICAgICAgICAgYW5nbGUgPSBvZmZzZXQgLyBpdGVtU2l6ZSAqIGl0ZW1BbmdsZTtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbMl0gPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgLSByYWRpdXM7XG4gICAgICAgICAgICBzZXQucm90YXRlW3JldkRpcmVjdGlvbl0gPSBkaXJlY3Rpb24gPyAtYW5nbGUgOiBhbmdsZTtcbiAgICAgICAgICAgIHNldC5vcGFjaXR5ID0gMSAtIE1hdGguYWJzKGFuZ2xlKSAvIChNYXRoLlBJIC8gMikgKiAoMSAtIHJhZGlhbE9wYWNpdHkpO1xuICAgICAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgLT0gaXRlbVNpemU7XG4gICAgfVxufVxuV2hlZWxMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xuV2hlZWxMYXlvdXQuTmFtZSA9ICdXaGVlbExheW91dCc7XG5XaGVlbExheW91dC5EZXNjcmlwdGlvbiA9ICdTcGlubmVyLXdoZWVsL3Nsb3QtbWFjaGluZSBsYXlvdXQnO1xubW9kdWxlLmV4cG9ydHMgPSBXaGVlbExheW91dDsiLCJ2YXIgVmlldyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlZpZXcgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5WaWV3IDogbnVsbDtcbnZhciBTdXJmYWNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuU3VyZmFjZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlN1cmZhY2UgOiBudWxsO1xudmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIENvbnRhaW5lclN1cmZhY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuc3VyZmFjZXMuQ29udGFpbmVyU3VyZmFjZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5zdXJmYWNlcy5Db250YWluZXJTdXJmYWNlIDogbnVsbDtcbnZhciBMYXlvdXRDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vTGF5b3V0Q29udHJvbGxlcicpO1xudmFyIFNjcm9sbENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9TY3JvbGxDb250cm9sbGVyJyk7XG52YXIgV2hlZWxMYXlvdXQgPSByZXF1aXJlKCcuLi9sYXlvdXRzL1doZWVsTGF5b3V0Jyk7XG52YXIgUHJvcG9ydGlvbmFsTGF5b3V0ID0gcmVxdWlyZSgnLi4vbGF5b3V0cy9Qcm9wb3J0aW9uYWxMYXlvdXQnKTtcbnZhciBWaXJ0dWFsVmlld1NlcXVlbmNlID0gcmVxdWlyZSgnLi4vVmlydHVhbFZpZXdTZXF1ZW5jZScpO1xudmFyIERhdGVQaWNrZXJDb21wb25lbnRzID0gcmVxdWlyZSgnLi9EYXRlUGlja2VyQ29tcG9uZW50cycpO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG5mdW5jdGlvbiBEYXRlUGlja2VyKG9wdGlvbnMpIHtcbiAgICBWaWV3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5fZGF0ZSA9IG5ldyBEYXRlKG9wdGlvbnMuZGF0ZSA/IG9wdGlvbnMuZGF0ZS5nZXRUaW1lKCkgOiB1bmRlZmluZWQpO1xuICAgIHRoaXMuX2NvbXBvbmVudHMgPSBbXTtcbiAgICB0aGlzLmNsYXNzZXMgPSBvcHRpb25zLmNsYXNzZXMgPyB0aGlzLmNsYXNzZXMuY29uY2F0KG9wdGlvbnMuY2xhc3NlcykgOiB0aGlzLmNsYXNzZXM7XG4gICAgX2NyZWF0ZUxheW91dC5jYWxsKHRoaXMpO1xuICAgIF91cGRhdGVDb21wb25lbnRzLmNhbGwodGhpcyk7XG4gICAgdGhpcy5fb3ZlcmxheVJlbmRlcmFibGVzID0ge1xuICAgICAgICB0b3A6IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ3RvcCcpLFxuICAgICAgICBtaWRkbGU6IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ21pZGRsZScpLFxuICAgICAgICBib3R0b206IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ2JvdHRvbScpXG4gICAgfTtcbiAgICBfY3JlYXRlT3ZlcmxheS5jYWxsKHRoaXMpO1xuICAgIHRoaXMuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xufVxuRGF0ZVBpY2tlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZpZXcucHJvdG90eXBlKTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGF0ZVBpY2tlcjtcbkRhdGVQaWNrZXIucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2ZmLXdpZGdldCcsXG4gICAgJ2ZmLWRhdGVwaWNrZXInXG5dO1xuRGF0ZVBpY2tlci5Db21wb25lbnQgPSBEYXRlUGlja2VyQ29tcG9uZW50cztcbkRhdGVQaWNrZXIuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHBlcnNwZWN0aXZlOiA1MDAsXG4gICAgd2hlZWxMYXlvdXQ6IHtcbiAgICAgICAgaXRlbVNpemU6IDEwMCxcbiAgICAgICAgZGlhbWV0ZXI6IDUwMFxuICAgIH0sXG4gICAgY3JlYXRlUmVuZGVyYWJsZXM6IHtcbiAgICAgICAgaXRlbTogdHJ1ZSxcbiAgICAgICAgdG9wOiBmYWxzZSxcbiAgICAgICAgbWlkZGxlOiBmYWxzZSxcbiAgICAgICAgYm90dG9tOiBmYWxzZVxuICAgIH0sXG4gICAgc2Nyb2xsQ29udHJvbGxlcjoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICBwYWdpbmF0ZWQ6IHRydWUsXG4gICAgICAgIHBhZ2luYXRpb25Nb2RlOiBTY3JvbGxDb250cm9sbGVyLlBhZ2luYXRpb25Nb2RlLlNDUk9MTCxcbiAgICAgICAgbW91c2VNb3ZlOiB0cnVlLFxuICAgICAgICBzY3JvbGxTcHJpbmc6IHtcbiAgICAgICAgICAgIGRhbXBpbmdSYXRpbzogMSxcbiAgICAgICAgICAgIHBlcmlvZDogODAwXG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX2NyZWF0ZVJlbmRlcmFibGUoaWQsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zLmNyZWF0ZVJlbmRlcmFibGVzW0FycmF5LmlzQXJyYXkoaWQpID8gaWRbMF0gOiBpZF07XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvcHRpb24uY2FsbCh0aGlzLCBpZCwgZGF0YSk7XG4gICAgfSBlbHNlIGlmICghb3B0aW9uKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChkYXRhICE9PSB1bmRlZmluZWQgJiYgZGF0YSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgdmFyIHN1cmZhY2UgPSBuZXcgU3VyZmFjZSh7XG4gICAgICAgICAgICBjbGFzc2VzOiB0aGlzLmNsYXNzZXMsXG4gICAgICAgICAgICBjb250ZW50OiBkYXRhID8gJzxkaXY+JyArIGRhdGEgKyAnPC9kaXY+JyA6IHVuZGVmaW5lZFxuICAgICAgICB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShpZCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3VyZmFjZS5hZGRDbGFzcyhpZFtpXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzdXJmYWNlLmFkZENsYXNzKGlkKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cmZhY2U7XG59XG5EYXRlUGlja2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBWaWV3LnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLmxheW91dCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucGVyc3BlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jb250ZXh0LnNldFBlcnNwZWN0aXZlKG9wdGlvbnMucGVyc3BlY3RpdmUpO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICBpZiAob3B0aW9ucy53aGVlbExheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHNbaV0uc2Nyb2xsQ29udHJvbGxlci5zZXRMYXlvdXRPcHRpb25zKG9wdGlvbnMud2hlZWxMYXlvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3ZlcmxheS5zZXRMYXlvdXRPcHRpb25zKHsgaXRlbVNpemU6IHRoaXMub3B0aW9ucy53aGVlbExheW91dC5pdGVtU2l6ZSB9KTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHNbaV0uc2Nyb2xsQ29udHJvbGxlci5zZXRPcHRpb25zKG9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRGF0ZVBpY2tlci5wcm90b3R5cGUuc2V0Q29tcG9uZW50cyA9IGZ1bmN0aW9uIChjb21wb25lbnRzKSB7XG4gICAgdGhpcy5fY29tcG9uZW50cyA9IGNvbXBvbmVudHM7XG4gICAgX3VwZGF0ZUNvbXBvbmVudHMuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5EYXRlUGlja2VyLnByb3RvdHlwZS5nZXRDb21wb25lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xufTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLnNldERhdGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHRoaXMuX2RhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSk7XG4gICAgX3NldERhdGVUb1Njcm9sbFdoZWVscy5jYWxsKHRoaXMsIHRoaXMuX2RhdGUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLmdldERhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGU7XG59O1xuZnVuY3Rpb24gX3NldERhdGVUb1Njcm9sbFdoZWVscyhkYXRlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc2Nyb2xsV2hlZWwgPSB0aGlzLnNjcm9sbFdoZWVsc1tpXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IHNjcm9sbFdoZWVsLmNvbXBvbmVudDtcbiAgICAgICAgdmFyIGl0ZW0gPSBzY3JvbGxXaGVlbC5zY3JvbGxDb250cm9sbGVyLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS52aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSBpdGVtLnZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIHZhciByZW5kZXJOb2RlID0gaXRlbS52aWV3U2VxdWVuY2UuZ2V0KCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gY29tcG9uZW50LmdldENvbXBvbmVudChyZW5kZXJOb2RlLmRhdGUpO1xuICAgICAgICAgICAgdmFyIGRlc3RWYWx1ZSA9IGNvbXBvbmVudC5nZXRDb21wb25lbnQoZGF0ZSk7XG4gICAgICAgICAgICB2YXIgc3RlcHMgPSAwO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSAhPT0gZGVzdFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgc3RlcHMgPSBkZXN0VmFsdWUgLSBjdXJyZW50VmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5sb29wKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXZTdGVwcyA9IHN0ZXBzIDwgMCA/IHN0ZXBzICsgY29tcG9uZW50LnVwcGVyQm91bmQgOiBzdGVwcyAtIGNvbXBvbmVudC51cHBlckJvdW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMocmV2U3RlcHMpIDwgTWF0aC5hYnMoc3RlcHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwcyA9IHJldlN0ZXBzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzdGVwcykge1xuICAgICAgICAgICAgICAgIHNjcm9sbFdoZWVsLnNjcm9sbENvbnRyb2xsZXIuZ29Ub1JlbmRlck5vZGUocmVuZGVyTm9kZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50VmFsdWUgIT09IGRlc3RWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2aWV3U2VxdWVuY2UgPSBzdGVwcyA+IDAgPyB2aWV3U2VxdWVuY2UuZ2V0TmV4dCgpIDogdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGUgPSB2aWV3U2VxdWVuY2UgPyB2aWV3U2VxdWVuY2UuZ2V0KCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gY29tcG9uZW50LmdldENvbXBvbmVudChyZW5kZXJOb2RlLmRhdGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxXaGVlbC5zY3JvbGxDb250cm9sbGVyLmdvVG9OZXh0UGFnZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsV2hlZWwuc2Nyb2xsQ29udHJvbGxlci5nb1RvUHJldmlvdXNQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0RGF0ZUZyb21TY3JvbGxXaGVlbHMoKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLl9kYXRlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2Nyb2xsV2hlZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzY3JvbGxXaGVlbCA9IHRoaXMuc2Nyb2xsV2hlZWxzW2ldO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gc2Nyb2xsV2hlZWwuY29tcG9uZW50O1xuICAgICAgICB2YXIgaXRlbSA9IHNjcm9sbFdoZWVsLnNjcm9sbENvbnRyb2xsZXIuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5zZXRDb21wb25lbnQoZGF0ZSwgY29tcG9uZW50LmdldENvbXBvbmVudChpdGVtLnJlbmRlck5vZGUuZGF0ZSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xufVxuZnVuY3Rpb24gX2NyZWF0ZUxheW91dCgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXJTdXJmYWNlKHRoaXMub3B0aW9ucy5jb250YWluZXIpO1xuICAgIHRoaXMuY29udGFpbmVyLnNldENsYXNzZXModGhpcy5jbGFzc2VzKTtcbiAgICB0aGlzLmxheW91dCA9IG5ldyBMYXlvdXRDb250cm9sbGVyKHtcbiAgICAgICAgbGF5b3V0OiBQcm9wb3J0aW9uYWxMYXlvdXQsXG4gICAgICAgIGxheW91dE9wdGlvbnM6IHsgcmF0aW9zOiBbXSB9LFxuICAgICAgICBkaXJlY3Rpb246IFV0aWxpdHkuRGlyZWN0aW9uLlhcbiAgICB9KTtcbiAgICB0aGlzLmNvbnRhaW5lci5hZGQodGhpcy5sYXlvdXQpO1xuICAgIHRoaXMuYWRkKHRoaXMuY29udGFpbmVyKTtcbn1cbmZ1bmN0aW9uIF9jbGlja0l0ZW0oc2Nyb2xsV2hlZWwsIGV2ZW50KSB7XG59XG5mdW5jdGlvbiBfc2Nyb2xsV2hlZWxTY3JvbGxTdGFydCgpIHtcbiAgICB0aGlzLl9zY3JvbGxpbmdDb3VudCsrO1xuICAgIGlmICh0aGlzLl9zY3JvbGxpbmdDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzY3JvbGxzdGFydCcsIHsgdGFyZ2V0OiB0aGlzIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9zY3JvbGxXaGVlbFNjcm9sbEVuZCgpIHtcbiAgICB0aGlzLl9zY3JvbGxpbmdDb3VudC0tO1xuICAgIGlmICh0aGlzLl9zY3JvbGxpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzY3JvbGxlbmQnLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICBkYXRlOiB0aGlzLl9kYXRlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9zY3JvbGxXaGVlbFBhZ2VDaGFuZ2UoKSB7XG4gICAgdGhpcy5fZGF0ZSA9IF9nZXREYXRlRnJvbVNjcm9sbFdoZWVscy5jYWxsKHRoaXMpO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2RhdGVjaGFuZ2UnLCB7XG4gICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgZGF0ZTogdGhpcy5fZGF0ZVxuICAgIH0pO1xufVxuZnVuY3Rpb24gX3VwZGF0ZUNvbXBvbmVudHMoKSB7XG4gICAgdGhpcy5zY3JvbGxXaGVlbHMgPSBbXTtcbiAgICB0aGlzLl9zY3JvbGxpbmdDb3VudCA9IDA7XG4gICAgdmFyIGRhdGFTb3VyY2UgPSBbXTtcbiAgICB2YXIgc2l6ZVJhdGlvcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gdGhpcy5fY29tcG9uZW50c1tpXTtcbiAgICAgICAgY29tcG9uZW50LmNyZWF0ZVJlbmRlcmFibGUgPSBfY3JlYXRlUmVuZGVyYWJsZS5iaW5kKHRoaXMpO1xuICAgICAgICB2YXIgdmlld1NlcXVlbmNlID0gbmV3IFZpcnR1YWxWaWV3U2VxdWVuY2Uoe1xuICAgICAgICAgICAgICAgIGZhY3Rvcnk6IGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY29tcG9uZW50LmNyZWF0ZSh0aGlzLl9kYXRlKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZhciBvcHRpb25zID0gTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyh0aGlzLm9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlciwge1xuICAgICAgICAgICAgICAgIGxheW91dDogV2hlZWxMYXlvdXQsXG4gICAgICAgICAgICAgICAgbGF5b3V0T3B0aW9uczogdGhpcy5vcHRpb25zLndoZWVsTGF5b3V0LFxuICAgICAgICAgICAgICAgIGZsb3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogVXRpbGl0eS5EaXJlY3Rpb24uWSxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiB2aWV3U2VxdWVuY2UsXG4gICAgICAgICAgICAgICAgYXV0b1BpcGVFdmVudHM6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB2YXIgc2Nyb2xsQ29udHJvbGxlciA9IG5ldyBTY3JvbGxDb250cm9sbGVyKG9wdGlvbnMpO1xuICAgICAgICBzY3JvbGxDb250cm9sbGVyLm9uKCdzY3JvbGxzdGFydCcsIF9zY3JvbGxXaGVlbFNjcm9sbFN0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICBzY3JvbGxDb250cm9sbGVyLm9uKCdzY3JvbGxlbmQnLCBfc2Nyb2xsV2hlZWxTY3JvbGxFbmQuYmluZCh0aGlzKSk7XG4gICAgICAgIHNjcm9sbENvbnRyb2xsZXIub24oJ3BhZ2VjaGFuZ2UnLCBfc2Nyb2xsV2hlZWxQYWdlQ2hhbmdlLmJpbmQodGhpcykpO1xuICAgICAgICB2YXIgc2Nyb2xsV2hlZWwgPSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgc2Nyb2xsQ29udHJvbGxlcjogc2Nyb2xsQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICB2aWV3U2VxdWVuY2U6IHZpZXdTZXF1ZW5jZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHMucHVzaChzY3JvbGxXaGVlbCk7XG4gICAgICAgIGNvbXBvbmVudC5vbignY2xpY2snLCBfY2xpY2tJdGVtLmJpbmQodGhpcywgc2Nyb2xsV2hlZWwpKTtcbiAgICAgICAgZGF0YVNvdXJjZS5wdXNoKHNjcm9sbENvbnRyb2xsZXIpO1xuICAgICAgICBzaXplUmF0aW9zLnB1c2goY29tcG9uZW50LnNpemVSYXRpbyk7XG4gICAgfVxuICAgIHRoaXMubGF5b3V0LnNldERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XG4gICAgdGhpcy5sYXlvdXQuc2V0TGF5b3V0T3B0aW9ucyh7IHJhdGlvczogc2l6ZVJhdGlvcyB9KTtcbn1cbmZ1bmN0aW9uIE92ZXJsYXlMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBoZWlnaHQgPSAoY29udGV4dC5zaXplWzFdIC0gb3B0aW9ucy5pdGVtU2l6ZSkgLyAyO1xuICAgIGNvbnRleHQuc2V0KCd0b3AnLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIGNvbnRleHQuc2l6ZVswXSxcbiAgICAgICAgICAgIGhlaWdodFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdXG4gICAgfSk7XG4gICAgY29udGV4dC5zZXQoJ21pZGRsZScsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgY29udGV4dC5zaXplWzBdLFxuICAgICAgICAgICAgY29udGV4dC5zaXplWzFdIC0gaGVpZ2h0ICogMlxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAxXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICBjb250ZXh0LnNldCgnYm90dG9tJywge1xuICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICBjb250ZXh0LnNpemVbMF0sXG4gICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY29udGV4dC5zaXplWzFdIC0gaGVpZ2h0LFxuICAgICAgICAgICAgMVxuICAgICAgICBdXG4gICAgfSk7XG59XG5mdW5jdGlvbiBfY3JlYXRlT3ZlcmxheSgpIHtcbiAgICB0aGlzLm92ZXJsYXkgPSBuZXcgTGF5b3V0Q29udHJvbGxlcih7XG4gICAgICAgIGxheW91dDogT3ZlcmxheUxheW91dCxcbiAgICAgICAgbGF5b3V0T3B0aW9uczogeyBpdGVtU2l6ZTogdGhpcy5vcHRpb25zLndoZWVsTGF5b3V0Lml0ZW1TaXplIH0sXG4gICAgICAgIGRhdGFTb3VyY2U6IHRoaXMuX292ZXJsYXlSZW5kZXJhYmxlc1xuICAgIH0pO1xuICAgIHRoaXMuYWRkKHRoaXMub3ZlcmxheSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7IiwidmFyIFN1cmZhY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5TdXJmYWNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuU3VyZmFjZSA6IG51bGw7XG52YXIgRXZlbnRIYW5kbGVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogbnVsbDtcbmZ1bmN0aW9uIGRlY2ltYWwxKGRhdGUpIHtcbiAgICByZXR1cm4gJycgKyBkYXRlW3RoaXMuZ2V0XSgpO1xufVxuZnVuY3Rpb24gZGVjaW1hbDIoZGF0ZSkge1xuICAgIHJldHVybiAoJzAnICsgZGF0ZVt0aGlzLmdldF0oKSkuc2xpY2UoLTIpO1xufVxuZnVuY3Rpb24gZGVjaW1hbDMoZGF0ZSkge1xuICAgIHJldHVybiAoJzAwJyArIGRhdGVbdGhpcy5nZXRdKCkpLnNsaWNlKC0zKTtcbn1cbmZ1bmN0aW9uIGRlY2ltYWw0KGRhdGUpIHtcbiAgICByZXR1cm4gKCcwMDAnICsgZGF0ZVt0aGlzLmdldF0oKSkuc2xpY2UoLTQpO1xufVxuZnVuY3Rpb24gQmFzZShvcHRpb25zKSB7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fcG9vbCA9IFtdO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgdGhpc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICB9XG4gICAgfVxufVxuQmFzZS5wcm90b3R5cGUuc3RlcCA9IDE7XG5CYXNlLnByb3RvdHlwZS5jbGFzc2VzID0gWydpdGVtJ107XG5CYXNlLnByb3RvdHlwZS5nZXRDb21wb25lbnQgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHJldHVybiBkYXRlW3RoaXMuZ2V0XSgpO1xufTtcbkJhc2UucHJvdG90eXBlLnNldENvbXBvbmVudCA9IGZ1bmN0aW9uIChkYXRlLCB2YWx1ZSkge1xuICAgIHJldHVybiBkYXRlW3RoaXMuc2V0XSh2YWx1ZSk7XG59O1xuQmFzZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gJ292ZXJpZGUgdG8gaW1wbGVtZW50Jztcbn07XG5CYXNlLnByb3RvdHlwZS5jcmVhdGVOZXh0ID0gZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgICB2YXIgZGF0ZSA9IHRoaXMuZ2V0TmV4dChyZW5kZXJhYmxlLmRhdGUpO1xuICAgIHJldHVybiBkYXRlID8gdGhpcy5jcmVhdGUoZGF0ZSkgOiB1bmRlZmluZWQ7XG59O1xuQmFzZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcbiAgICB2YXIgbmV3VmFsID0gdGhpcy5nZXRDb21wb25lbnQoZGF0ZSkgKyB0aGlzLnN0ZXA7XG4gICAgaWYgKHRoaXMudXBwZXJCb3VuZCAhPT0gdW5kZWZpbmVkICYmIG5ld1ZhbCA+PSB0aGlzLnVwcGVyQm91bmQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbmV3VmFsID0gTWF0aC5tYXgobmV3VmFsICUgdGhpcy51cHBlckJvdW5kLCB0aGlzLmxvd2VyQm91bmQgfHwgMCk7XG4gICAgfVxuICAgIHRoaXMuc2V0Q29tcG9uZW50KGRhdGUsIG5ld1ZhbCk7XG4gICAgcmV0dXJuIGRhdGU7XG59O1xuQmFzZS5wcm90b3R5cGUuY3JlYXRlUHJldmlvdXMgPSBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgIHZhciBkYXRlID0gdGhpcy5nZXRQcmV2aW91cyhyZW5kZXJhYmxlLmRhdGUpO1xuICAgIHJldHVybiBkYXRlID8gdGhpcy5jcmVhdGUoZGF0ZSkgOiB1bmRlZmluZWQ7XG59O1xuQmFzZS5wcm90b3R5cGUuZ2V0UHJldmlvdXMgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XG4gICAgdmFyIG5ld1ZhbCA9IHRoaXMuZ2V0Q29tcG9uZW50KGRhdGUpIC0gdGhpcy5zdGVwO1xuICAgIGlmICh0aGlzLmxvd2VyQm91bmQgIT09IHVuZGVmaW5lZCAmJiBuZXdWYWwgPCB0aGlzLmxvd2VyQm91bmQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbmV3VmFsID0gbmV3VmFsICUgdGhpcy51cHBlckJvdW5kO1xuICAgIH1cbiAgICB0aGlzLnNldENvbXBvbmVudChkYXRlLCBuZXdWYWwpO1xuICAgIHJldHVybiBkYXRlO1xufTtcbkJhc2UucHJvdG90eXBlLmluc3RhbGxDbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgIHJlbmRlcmFibGUub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2NsaWNrJywge1xuICAgICAgICAgICAgdGFyZ2V0OiByZW5kZXJhYmxlLFxuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuQmFzZS5wcm90b3R5cGUuY3JlYXRlUmVuZGVyYWJsZSA9IGZ1bmN0aW9uIChjbGFzc2VzLCBkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBTdXJmYWNlKHtcbiAgICAgICAgY2xhc3NlczogY2xhc3NlcyxcbiAgICAgICAgY29udGVudDogJzxkaXY+JyArIGRhdGEgKyAnPC9kaXY+J1xuICAgIH0pO1xufTtcbkJhc2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgZGF0ZSA9IGRhdGUgfHwgbmV3IERhdGUoKTtcbiAgICB2YXIgcmVuZGVyYWJsZTtcbiAgICBpZiAodGhpcy5fcG9vbC5sZW5ndGgpIHtcbiAgICAgICAgcmVuZGVyYWJsZSA9IHRoaXMuX3Bvb2xbMF07XG4gICAgICAgIHRoaXMuX3Bvb2wuc3BsaWNlKDAsIDEpO1xuICAgICAgICByZW5kZXJhYmxlLnNldENvbnRlbnQodGhpcy5mb3JtYXQoZGF0ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmFibGUgPSB0aGlzLmNyZWF0ZVJlbmRlcmFibGUodGhpcy5jbGFzc2VzLCB0aGlzLmZvcm1hdChkYXRlKSk7XG4gICAgICAgIHRoaXMuaW5zdGFsbENsaWNrSGFuZGxlcihyZW5kZXJhYmxlKTtcbiAgICB9XG4gICAgcmVuZGVyYWJsZS5kYXRlID0gZGF0ZTtcbiAgICByZXR1cm4gcmVuZGVyYWJsZTtcbn07XG5CYXNlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgICB0aGlzLl9wb29sLnB1c2gocmVuZGVyYWJsZSk7XG59O1xuZnVuY3Rpb24gWWVhcigpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5ZZWFyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuWWVhci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBZZWFyO1xuWWVhci5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ3llYXInXG5dO1xuWWVhci5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDQ7XG5ZZWFyLnByb3RvdHlwZS5zaXplUmF0aW8gPSAxO1xuWWVhci5wcm90b3R5cGUuc3RlcCA9IDE7XG5ZZWFyLnByb3RvdHlwZS5sb29wID0gZmFsc2U7XG5ZZWFyLnByb3RvdHlwZS5zZXQgPSAnc2V0RnVsbFllYXInO1xuWWVhci5wcm90b3R5cGUuZ2V0ID0gJ2dldEZ1bGxZZWFyJztcbmZ1bmN0aW9uIE1vbnRoKCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbk1vbnRoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuTW9udGgucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTW9udGg7XG5Nb250aC5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ21vbnRoJ1xuXTtcbk1vbnRoLnByb3RvdHlwZS5zaXplUmF0aW8gPSAyO1xuTW9udGgucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuTW9udGgucHJvdG90eXBlLnVwcGVyQm91bmQgPSAxMjtcbk1vbnRoLnByb3RvdHlwZS5zdGVwID0gMTtcbk1vbnRoLnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbk1vbnRoLnByb3RvdHlwZS5zZXQgPSAnc2V0TW9udGgnO1xuTW9udGgucHJvdG90eXBlLmdldCA9ICdnZXRNb250aCc7XG5Nb250aC5wcm90b3R5cGUuc3RyaW5ncyA9IFtcbiAgICAnSmFudWFyeScsXG4gICAgJ0ZlYnJ1YXJ5JyxcbiAgICAnTWFyY2gnLFxuICAgICdBcHJpbCcsXG4gICAgJ01heScsXG4gICAgJ0p1bmUnLFxuICAgICdKdWx5JyxcbiAgICAnQXVndXN0JyxcbiAgICAnU2VwdGVtYmVyJyxcbiAgICAnT2N0b2JlcicsXG4gICAgJ05vdmVtYmVyJyxcbiAgICAnRGVjZW1iZXInXG5dO1xuTW9udGgucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RyaW5nc1tkYXRlLmdldE1vbnRoKCldO1xufTtcbmZ1bmN0aW9uIEZ1bGxEYXkoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuRnVsbERheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKTtcbkZ1bGxEYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRnVsbERheTtcbkZ1bGxEYXkucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2l0ZW0nLFxuICAgICdmdWxsZGF5J1xuXTtcbkZ1bGxEYXkucHJvdG90eXBlLnNpemVSYXRpbyA9IDI7XG5GdWxsRGF5LnByb3RvdHlwZS5zdGVwID0gMTtcbkZ1bGxEYXkucHJvdG90eXBlLnNldCA9ICdzZXREYXRlJztcbkZ1bGxEYXkucHJvdG90eXBlLmdldCA9ICdnZXREYXRlJztcbkZ1bGxEYXkucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG59O1xuZnVuY3Rpb24gV2Vla0RheSgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5XZWVrRGF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuV2Vla0RheS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWVrRGF5O1xuV2Vla0RheS5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ3dlZWtkYXknXG5dO1xuV2Vla0RheS5wcm90b3R5cGUuc2l6ZVJhdGlvID0gMjtcbldlZWtEYXkucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuV2Vla0RheS5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDc7XG5XZWVrRGF5LnByb3RvdHlwZS5zdGVwID0gMTtcbldlZWtEYXkucHJvdG90eXBlLmxvb3AgPSB0cnVlO1xuV2Vla0RheS5wcm90b3R5cGUuc2V0ID0gJ3NldERhdGUnO1xuV2Vla0RheS5wcm90b3R5cGUuZ2V0ID0gJ2dldERhdGUnO1xuV2Vla0RheS5wcm90b3R5cGUuc3RyaW5ncyA9IFtcbiAgICAnU3VuZGF5JyxcbiAgICAnTW9uZGF5JyxcbiAgICAnVHVlc2RheScsXG4gICAgJ1dlZG5lc2RheScsXG4gICAgJ1RodXJzZGF5JyxcbiAgICAnRnJpZGF5JyxcbiAgICAnU2F0dXJkYXknXG5dO1xuV2Vla0RheS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJpbmdzW2RhdGUuZ2V0RGF5KCldO1xufTtcbmZ1bmN0aW9uIERheSgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5EYXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5EYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGF5O1xuRGF5LnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnZGF5J1xuXTtcbkRheS5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDE7XG5EYXkucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5EYXkucHJvdG90eXBlLmxvd2VyQm91bmQgPSAxO1xuRGF5LnByb3RvdHlwZS51cHBlckJvdW5kID0gMzI7XG5EYXkucHJvdG90eXBlLnN0ZXAgPSAxO1xuRGF5LnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbkRheS5wcm90b3R5cGUuc2V0ID0gJ3NldERhdGUnO1xuRGF5LnByb3RvdHlwZS5nZXQgPSAnZ2V0RGF0ZSc7XG5mdW5jdGlvbiBIb3VyKCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbkhvdXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5Ib3VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhvdXI7XG5Ib3VyLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnaG91cidcbl07XG5Ib3VyLnByb3RvdHlwZS5mb3JtYXQgPSBkZWNpbWFsMjtcbkhvdXIucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5Ib3VyLnByb3RvdHlwZS5sb3dlckJvdW5kID0gMDtcbkhvdXIucHJvdG90eXBlLnVwcGVyQm91bmQgPSAyNDtcbkhvdXIucHJvdG90eXBlLnN0ZXAgPSAxO1xuSG91ci5wcm90b3R5cGUubG9vcCA9IHRydWU7XG5Ib3VyLnByb3RvdHlwZS5zZXQgPSAnc2V0SG91cnMnO1xuSG91ci5wcm90b3R5cGUuZ2V0ID0gJ2dldEhvdXJzJztcbmZ1bmN0aW9uIE1pbnV0ZSgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5NaW51dGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5NaW51dGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWludXRlO1xuTWludXRlLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnbWludXRlJ1xuXTtcbk1pbnV0ZS5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDI7XG5NaW51dGUucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5NaW51dGUucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuTWludXRlLnByb3RvdHlwZS51cHBlckJvdW5kID0gNjA7XG5NaW51dGUucHJvdG90eXBlLnN0ZXAgPSAxO1xuTWludXRlLnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbk1pbnV0ZS5wcm90b3R5cGUuc2V0ID0gJ3NldE1pbnV0ZXMnO1xuTWludXRlLnByb3RvdHlwZS5nZXQgPSAnZ2V0TWludXRlcyc7XG5mdW5jdGlvbiBTZWNvbmQoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuU2Vjb25kLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuU2Vjb25kLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNlY29uZDtcblNlY29uZC5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ3NlY29uZCdcbl07XG5TZWNvbmQucHJvdG90eXBlLmZvcm1hdCA9IGRlY2ltYWwyO1xuU2Vjb25kLnByb3RvdHlwZS5zaXplUmF0aW8gPSAxO1xuU2Vjb25kLnByb3RvdHlwZS5sb3dlckJvdW5kID0gMDtcblNlY29uZC5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDYwO1xuU2Vjb25kLnByb3RvdHlwZS5zdGVwID0gMTtcblNlY29uZC5wcm90b3R5cGUubG9vcCA9IHRydWU7XG5TZWNvbmQucHJvdG90eXBlLnNldCA9ICdzZXRTZWNvbmRzJztcblNlY29uZC5wcm90b3R5cGUuZ2V0ID0gJ2dldFNlY29uZHMnO1xuZnVuY3Rpb24gTWlsbGlzZWNvbmQoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuTWlsbGlzZWNvbmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaWxsaXNlY29uZDtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnbWlsbGlzZWNvbmQnXG5dO1xuTWlsbGlzZWNvbmQucHJvdG90eXBlLmZvcm1hdCA9IGRlY2ltYWwzO1xuTWlsbGlzZWNvbmQucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUubG93ZXJCb3VuZCA9IDA7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDEwMDA7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuc3RlcCA9IDE7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUubG9vcCA9IHRydWU7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuc2V0ID0gJ3NldE1pbGxpc2Vjb25kcyc7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuZ2V0ID0gJ2dldE1pbGxpc2Vjb25kcyc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBCYXNlOiBCYXNlLFxuICAgIFllYXI6IFllYXIsXG4gICAgTW9udGg6IE1vbnRoLFxuICAgIEZ1bGxEYXk6IEZ1bGxEYXksXG4gICAgV2Vla0RheTogV2Vla0RheSxcbiAgICBEYXk6IERheSxcbiAgICBIb3VyOiBIb3VyLFxuICAgIE1pbnV0ZTogTWludXRlLFxuICAgIFNlY29uZDogU2Vjb25kLFxuICAgIE1pbGxpc2Vjb25kOiBNaWxsaXNlY29uZFxufTsiLCJ2YXIgU3VyZmFjZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlN1cmZhY2UgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5TdXJmYWNlIDogbnVsbDtcbnZhciBWaWV3ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVmlldyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlZpZXcgOiBudWxsO1xudmFyIExheW91dENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9MYXlvdXRDb250cm9sbGVyJyk7XG52YXIgVGFiQmFyTGF5b3V0ID0gcmVxdWlyZSgnLi4vbGF5b3V0cy9UYWJCYXJMYXlvdXQnKTtcbmZ1bmN0aW9uIFRhYkJhcihvcHRpb25zKSB7XG4gICAgVmlldy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTE7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5jbGFzc2VzID0gb3B0aW9ucy5jbGFzc2VzID8gdGhpcy5jbGFzc2VzLmNvbmNhdChvcHRpb25zLmNsYXNzZXMpIDogdGhpcy5jbGFzc2VzO1xuICAgIHRoaXMubGF5b3V0ID0gbmV3IExheW91dENvbnRyb2xsZXIodGhpcy5vcHRpb25zLmxheW91dENvbnRyb2xsZXIpO1xuICAgIHRoaXMuYWRkKHRoaXMubGF5b3V0KTtcbiAgICB0aGlzLmxheW91dC5waXBlKHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB0aGlzLl9yZW5kZXJhYmxlcyA9IHtcbiAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgICBzcGFjZXJzOiBbXSxcbiAgICAgICAgYmFja2dyb3VuZDogX2NyZWF0ZVJlbmRlcmFibGUuY2FsbCh0aGlzLCAnYmFja2dyb3VuZCcpLFxuICAgICAgICBzZWxlY3RlZEl0ZW1PdmVybGF5OiBfY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsICdzZWxlY3RlZEl0ZW1PdmVybGF5JylcbiAgICB9O1xuICAgIHRoaXMuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xufVxuVGFiQmFyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlldy5wcm90b3R5cGUpO1xuVGFiQmFyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRhYkJhcjtcblRhYkJhci5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnZmYtd2lkZ2V0JyxcbiAgICAnZmYtdGFiYmFyJ1xuXTtcblRhYkJhci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgdGFiQmFyTGF5b3V0OiB7XG4gICAgICAgIG1hcmdpbnM6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgc3BhY2luZzogMFxuICAgIH0sXG4gICAgY3JlYXRlUmVuZGVyYWJsZXM6IHtcbiAgICAgICAgaXRlbTogdHJ1ZSxcbiAgICAgICAgYmFja2dyb3VuZDogZmFsc2UsXG4gICAgICAgIHNlbGVjdGVkSXRlbU92ZXJsYXk6IGZhbHNlLFxuICAgICAgICBzcGFjZXI6IGZhbHNlXG4gICAgfSxcbiAgICBsYXlvdXRDb250cm9sbGVyOiB7XG4gICAgICAgIGF1dG9QaXBlRXZlbnRzOiB0cnVlLFxuICAgICAgICBsYXlvdXQ6IFRhYkJhckxheW91dCxcbiAgICAgICAgZmxvdzogdHJ1ZSxcbiAgICAgICAgZmxvd09wdGlvbnM6IHtcbiAgICAgICAgICAgIHJlZmxvd09uUmVzaXplOiBmYWxzZSxcbiAgICAgICAgICAgIHNwcmluZzoge1xuICAgICAgICAgICAgICAgIGRhbXBpbmdSYXRpbzogMC44LFxuICAgICAgICAgICAgICAgIHBlcmlvZDogMzAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX3NldFNlbGVjdGVkSXRlbShpbmRleCkge1xuICAgIGlmIChpbmRleCAhPT0gdGhpcy5fc2VsZWN0ZWRJdGVtSW5kZXgpIHtcbiAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhpcy5fc2VsZWN0ZWRJdGVtSW5kZXg7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGF5b3V0LnNldExheW91dE9wdGlvbnMoeyBzZWxlY3RlZEl0ZW1JbmRleDogaW5kZXggfSk7XG4gICAgICAgIGlmIChvbGRJbmRleCA+PSAwICYmIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW29sZEluZGV4XS5yZW1vdmVDbGFzcykge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXNbb2xkSW5kZXhdLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJhYmxlcy5pdGVtc1tpbmRleF0uYWRkQ2xhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW2luZGV4XS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2xkSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgndGFiY2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgb2xkSW5kZXg6IG9sZEluZGV4LFxuICAgICAgICAgICAgICAgIGl0ZW06IHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW2luZGV4XVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfY3JlYXRlUmVuZGVyYWJsZShpZCwgZGF0YSkge1xuICAgIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnMuY3JlYXRlUmVuZGVyYWJsZXNbaWRdO1xuICAgIGlmIChvcHRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICByZXR1cm4gb3B0aW9uLmNhbGwodGhpcywgaWQsIGRhdGEpO1xuICAgIH0gZWxzZSBpZiAoIW9wdGlvbikge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkICYmIGRhdGEgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIHZhciBzdXJmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgICAgICAgY2xhc3NlczogdGhpcy5jbGFzc2VzLFxuICAgICAgICAgICAgY29udGVudDogZGF0YSA/ICc8ZGl2PicgKyBkYXRhICsgJzwvZGl2PicgOiB1bmRlZmluZWRcbiAgICAgICAgfSk7XG4gICAgc3VyZmFjZS5hZGRDbGFzcyhpZCk7XG4gICAgaWYgKGlkID09PSAnaXRlbScpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50YWJCYXJMYXlvdXQgJiYgdGhpcy5vcHRpb25zLnRhYkJhckxheW91dC5pdGVtU2l6ZSAmJiB0aGlzLm9wdGlvbnMudGFiQmFyTGF5b3V0Lml0ZW1TaXplID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzdXJmYWNlLnNldFNpemUodGhpcy5sYXlvdXQuZ2V0RGlyZWN0aW9uKCkgPyBbXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXJmYWNlO1xufVxuVGFiQmFyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBWaWV3LnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLmxheW91dCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudGFiQmFyTGF5b3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5sYXlvdXQuc2V0TGF5b3V0T3B0aW9ucyhvcHRpb25zLnRhYkJhckxheW91dCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxheW91dENvbnRyb2xsZXIpIHtcbiAgICAgICAgdGhpcy5sYXlvdXQuc2V0T3B0aW9ucyhvcHRpb25zLmxheW91dENvbnRyb2xsZXIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5UYWJCYXIucHJvdG90eXBlLnNldEl0ZW1zID0gZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4O1xuICAgIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTE7XG4gICAgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXMgPSBbXTtcbiAgICB0aGlzLl9yZW5kZXJhYmxlcy5zcGFjZXJzID0gW107XG4gICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gX2NyZWF0ZVJlbmRlcmFibGUuY2FsbCh0aGlzLCAnaXRlbScsIGl0ZW1zW2ldKTtcbiAgICAgICAgICAgIGlmIChpdGVtLm9uKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5vbignY2xpY2snLCBfc2V0U2VsZWN0ZWRJdGVtLmJpbmQodGhpcywgaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIGlmIChpIDwgaXRlbXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHZhciBzcGFjZXIgPSBfY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsICdzcGFjZXInLCAnICcpO1xuICAgICAgICAgICAgICAgIGlmIChzcGFjZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMuc3BhY2Vycy5wdXNoKHNwYWNlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubGF5b3V0LnNldERhdGFTb3VyY2UodGhpcy5fcmVuZGVyYWJsZXMpO1xuICAgIGlmICh0aGlzLl9yZW5kZXJhYmxlcy5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgX3NldFNlbGVjdGVkSXRlbS5jYWxsKHRoaXMsIE1hdGgubWF4KE1hdGgubWluKGN1cnJlbnRJbmRleCwgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXMubGVuZ3RoIC0gMSksIDApKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVGFiQmFyLnByb3RvdHlwZS5nZXRJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXM7XG59O1xuVGFiQmFyLnByb3RvdHlwZS5nZXRJdGVtU3BlYyA9IGZ1bmN0aW9uIChpbmRleCwgbm9ybWFsaXplKSB7XG4gICAgcmV0dXJuIHRoaXMubGF5b3V0LmdldFNwZWModGhpcy5fcmVuZGVyYWJsZXMuaXRlbXNbaW5kZXhdLCBub3JtYWxpemUpO1xufTtcblRhYkJhci5wcm90b3R5cGUuc2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICBfc2V0U2VsZWN0ZWRJdGVtLmNhbGwodGhpcywgaW5kZXgpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRhYkJhci5wcm90b3R5cGUuZ2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4O1xufTtcblRhYkJhci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNpemUgfHwgKHRoaXMubGF5b3V0ID8gdGhpcy5sYXlvdXQuZ2V0U2l6ZSgpIDogVmlldy5wcm90b3R5cGUuZ2V0U2l6ZS5jYWxsKHRoaXMpKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRhYkJhcjsiXX0=

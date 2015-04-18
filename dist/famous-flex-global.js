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

},{"../src/FlexScrollView":2,"../src/FlowLayoutNode":3,"../src/LayoutContext":4,"../src/LayoutController":5,"../src/LayoutNode":6,"../src/LayoutNodeManager":7,"../src/LayoutUtility":8,"../src/ScrollController":9,"../src/VirtualViewSequence":10,"../src/helpers/LayoutDockHelper":11,"../src/layouts/CollectionLayout":12,"../src/layouts/CoverLayout":13,"../src/layouts/CubeLayout":14,"../src/layouts/GridLayout":15,"../src/layouts/HeaderFooterLayout":16,"../src/layouts/ListLayout":17,"../src/layouts/NavBarLayout":18,"../src/layouts/ProportionalLayout":19,"../src/layouts/WheelLayout":21,"../src/widgets/DatePicker":22,"../src/widgets/TabBar":24}],2:[function(require,module,exports){
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
},{"./LayoutUtility":8,"./ScrollController":9,"./layouts/ListLayout":17}],3:[function(require,module,exports){
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
    } else {
        spec.opacity = undefined;
    }
    prop = this._properties.size;
    if (prop && prop.init) {
        spec.size = spec.size || [
            0,
            0
        ];
        spec.size[0] = prop.enabled[0] ? Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1 : prop.endState.x;
        spec.size[1] = prop.enabled[1] ? Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1 : prop.endState.y;
    } else {
        spec.size = undefined;
    }
    prop = this._properties.align;
    if (prop && prop.init) {
        spec.align = spec.align || [
            0,
            0
        ];
        spec.align[0] = prop.enabled[0] ? Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1 : prop.endState.x;
        spec.align[1] = prop.enabled[1] ? Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1 : prop.endState.y;
    } else {
        spec.align = undefined;
    }
    prop = this._properties.origin;
    if (prop && prop.init) {
        spec.origin = spec.origin || [
            0,
            0
        ];
        spec.origin[0] = prop.enabled[0] ? Math.round((prop.curState.x + (prop.endState.x - prop.curState.x) * lockValue) / 0.1) * 0.1 : prop.endState.x;
        spec.origin[1] = prop.enabled[1] ? Math.round((prop.curState.y + (prop.endState.y - prop.curState.y) * lockValue) / 0.1) * 0.1 : prop.endState.y;
    } else {
        spec.origin = undefined;
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
    } else if (translate) {
        if (!spec.transform) {
            spec.transform = Transform.translate(translateX, translateY, translateZ);
        } else {
            spec.transform[12] = translateX;
            spec.transform[13] = translateY;
            spec.transform[14] = translateZ;
        }
    } else {
        spec.transform = undefined;
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

},{"./LayoutNode":6}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
LayoutController.prototype.getSpec = function (node, normalize) {
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
LayoutController.prototype.replace = function (indexOrId, renderable) {
    var oldRenderable;
    if (this._nodesById || indexOrId instanceof String || typeof indexOrId === 'string') {
        oldRenderable = this._nodesById[indexOrId];
        if (oldRenderable !== renderable) {
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

},{"./FlowLayoutNode":3,"./LayoutNode":6,"./LayoutNodeManager":7,"./LayoutUtility":8,"./helpers/LayoutDockHelper":11}],6:[function(require,module,exports){
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

},{"./LayoutUtility":8}],7:[function(require,module,exports){
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
},{"./LayoutContext":4,"./LayoutUtility":8}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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
    visibleItemThresshold: 0.5,
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
    if (prevHeight === undefined || nextHeight === undefined) {
        this._scroll.boundsReached = Bounds.NONE;
        this._scroll.springPosition = undefined;
        this._scroll.springSource = SpringSource.NONE;
        return;
    }
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
ScrollController.prototype.getFirstVisibleItem = function (includeNode) {
    var size = this._contextSizeCache;
    var scrollOffset = this.options.alignment ? this._scroll.unnormalizedScrollOffset + size[this._direction] : this._scroll.unnormalizedScrollOffset;
    var node = this._nodes.getStartEnumNode(true);
    var nodeFoundVisiblePerc;
    var nodeFoundScrollOffset;
    var nodeFound;
    while (node) {
        if (!node._invalidated || node.scrollLength === undefined || scrollOffset > size[this._direction]) {
            break;
        }
        scrollOffset += node.scrollLength;
        if (scrollOffset >= 0 && node._viewSequence) {
            nodeFoundVisiblePerc = node.scrollLength ? (Math.min(scrollOffset, size[this._direction]) - Math.max(scrollOffset - node.scrollLength, 0)) / node.scrollLength : 1;
            nodeFoundScrollOffset = scrollOffset - node.scrollLength;
            if (nodeFoundVisiblePerc >= this.options.visibleItemThresshold || nodeFoundScrollOffset >= 0) {
                nodeFound = node;
                break;
            }
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
            var visiblePerc = node.scrollLength ? (Math.min(scrollOffset + node.scrollLength, size[this._direction]) - Math.max(scrollOffset, 0)) / node.scrollLength : 1;
            if (visiblePerc >= this.options.visibleItemThresshold || scrollOffset >= 0) {
                nodeFoundVisiblePerc = visiblePerc;
                nodeFoundScrollOffset = scrollOffset;
                nodeFound = node;
                break;
            }
        }
        node = node._prev;
    }
    return nodeFound ? {
        index: nodeFound._viewSequence.getIndex(),
        viewSequence: nodeFound._viewSequence,
        renderNode: nodeFound.renderNode,
        visiblePerc: nodeFoundVisiblePerc,
        scrollOffset: nodeFoundScrollOffset,
        scrollLength: nodeFound.scrollLength,
        _node: nodeFound
    } : undefined;
};
ScrollController.prototype.getLastVisibleItem = function () {
    var items = this.getVisibleItems();
    var size = this._contextSizeCache;
    for (var i = items.length - 1; i >= 0; i--) {
        var item = items[i];
        if (item.visiblePerc >= this.options.visibleItemThresshold || item.scrollOffset + item.scrollLength <= size[this._direction]) {
            return item;
        }
    }
    return items.length ? items[items.length - 1] : undefined;
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
ScrollController.prototype.setVelocity = function (velocity) {
    return this._scroll.particle.setVelocity1D(velocity);
};
ScrollController.prototype.applyScrollForce = function (delta) {
    this.halt();
    if (this._scroll.scrollForceCount === 0) {
        this._scroll.scrollForceStartItem = this.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
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
            var item = this.alignment ? this.getLastVisibleItem() : this.getFirstVisibleItem();
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

},{"./FlowLayoutNode":3,"./LayoutController":5,"./LayoutNode":6,"./LayoutNodeManager":7,"./LayoutUtility":8}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
},{"../LayoutUtility":8}],12:[function(require,module,exports){
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

},{"../LayoutUtility":8}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
if (console.warn) {
    console.warn('GridLayout has been deprecated and will be removed in the future, use CollectionLayout instead');
}
module.exports = require('./CollectionLayout');
},{"./CollectionLayout":12}],16:[function(require,module,exports){
var LayoutDockHelper = require('../helpers/LayoutDockHelper');
module.exports = function HeaderFooterLayout(context, options) {
    var dock = new LayoutDockHelper(context, options);
    dock.top('header', options.headerSize !== undefined ? options.headerSize : options.headerHeight);
    dock.bottom('footer', options.footerSize !== undefined ? options.footerSize : options.footerHeight);
    dock.fill('content');
};
},{"../helpers/LayoutDockHelper":11}],17:[function(require,module,exports){
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
    while (offset < bound) {
        lastNode = node;
        node = context.next();
        if (!node) {
            if (lastNode && !alignment) {
                set.scrollLength = nodeSize + margin[0] + -margin[1];
                context.set(lastNode, set);
            }
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
    node = undefined;
    offset = context.scrollOffset + margin[alignment];
    bound = context.scrollStart + margin[alignment];
    while (offset > bound) {
        lastNode = node;
        node = context.prev();
        if (!node) {
            if (lastNode && alignment) {
                set.scrollLength = nodeSize + margin[0] + -margin[1];
                context.set(lastNode, set);
                if (lastSectionBeforeVisibleCell === lastNode) {
                    lastSectionBeforeVisibleCellScrollLength = set.scrollLength;
                }
            }
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

},{"../LayoutUtility":8}],18:[function(require,module,exports){
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
},{"../helpers/LayoutDockHelper":11}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{"../LayoutUtility":8}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

},{"../LayoutController":5,"../LayoutUtility":8,"../ScrollController":9,"../VirtualViewSequence":10,"../layouts/ProportionalLayout":19,"../layouts/WheelLayout":21,"./DatePickerComponents":23}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"../LayoutController":5,"../layouts/TabBarLayout":20}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2ZhbW91cy1mbGV4LWdsb2JhbC50ZW1wbGF0ZS5qcyIsInNyYy9GbGV4U2Nyb2xsVmlldy5qcyIsInNyYy9GbG93TGF5b3V0Tm9kZS5qcyIsInNyYy9MYXlvdXRDb250ZXh0LmpzIiwic3JjL0xheW91dENvbnRyb2xsZXIuanMiLCJzcmMvTGF5b3V0Tm9kZS5qcyIsInNyYy9MYXlvdXROb2RlTWFuYWdlci5qcyIsInNyYy9MYXlvdXRVdGlsaXR5LmpzIiwic3JjL1Njcm9sbENvbnRyb2xsZXIuanMiLCJzcmMvVmlydHVhbFZpZXdTZXF1ZW5jZS5qcyIsInNyYy9oZWxwZXJzL0xheW91dERvY2tIZWxwZXIuanMiLCJzcmMvbGF5b3V0cy9Db2xsZWN0aW9uTGF5b3V0LmpzIiwic3JjL2xheW91dHMvQ292ZXJMYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9DdWJlTGF5b3V0LmpzIiwic3JjL2xheW91dHMvR3JpZExheW91dC5qcyIsInNyYy9sYXlvdXRzL0hlYWRlckZvb3RlckxheW91dC5qcyIsInNyYy9sYXlvdXRzL0xpc3RMYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9OYXZCYXJMYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9Qcm9wb3J0aW9uYWxMYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9UYWJCYXJMYXlvdXQuanMiLCJzcmMvbGF5b3V0cy9XaGVlbExheW91dC5qcyIsInNyYy93aWRnZXRzL0RhdGVQaWNrZXIuanMiLCJzcmMvd2lkZ2V0cy9EYXRlUGlja2VyQ29tcG9uZW50cy5qcyIsInNyYy93aWRnZXRzL1RhYkJhci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN6bkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzl2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiBmYW1vdXNmbGV4ID09PSAndW5kZWZpbmVkJykge1xuICAgIGZhbW91c2ZsZXggPSB7fTtcbn1cblxuZmFtb3VzZmxleC5GbGV4U2Nyb2xsVmlldyA9IHJlcXVpcmUoJy4uL3NyYy9GbGV4U2Nyb2xsVmlldycpO1xuZmFtb3VzZmxleC5GbG93TGF5b3V0Tm9kZSA9IHJlcXVpcmUoJy4uL3NyYy9GbG93TGF5b3V0Tm9kZScpO1xuZmFtb3VzZmxleC5MYXlvdXRDb250ZXh0ID0gcmVxdWlyZSgnLi4vc3JjL0xheW91dENvbnRleHQnKTtcbmZhbW91c2ZsZXguTGF5b3V0Q29udHJvbGxlciA9IHJlcXVpcmUoJy4uL3NyYy9MYXlvdXRDb250cm9sbGVyJyk7XG5mYW1vdXNmbGV4LkxheW91dE5vZGUgPSByZXF1aXJlKCcuLi9zcmMvTGF5b3V0Tm9kZScpO1xuZmFtb3VzZmxleC5MYXlvdXROb2RlTWFuYWdlciA9IHJlcXVpcmUoJy4uL3NyYy9MYXlvdXROb2RlTWFuYWdlcicpO1xuZmFtb3VzZmxleC5MYXlvdXRVdGlsaXR5ID0gcmVxdWlyZSgnLi4vc3JjL0xheW91dFV0aWxpdHknKTtcbmZhbW91c2ZsZXguU2Nyb2xsQ29udHJvbGxlciA9IHJlcXVpcmUoJy4uL3NyYy9TY3JvbGxDb250cm9sbGVyJyk7XG5mYW1vdXNmbGV4LlZpcnR1YWxWaWV3U2VxdWVuY2UgPSByZXF1aXJlKCcuLi9zcmMvVmlydHVhbFZpZXdTZXF1ZW5jZScpO1xuXG5mYW1vdXNmbGV4LndpZGdldHMgPSBmYW1vdXNmbGV4LndpZGdldHMgfHwge307XG5mYW1vdXNmbGV4LndpZGdldHMuRGF0ZVBpY2tlciA9IHJlcXVpcmUoJy4uL3NyYy93aWRnZXRzL0RhdGVQaWNrZXInKTtcbmZhbW91c2ZsZXgud2lkZ2V0cy5UYWJCYXIgPSByZXF1aXJlKCcuLi9zcmMvd2lkZ2V0cy9UYWJCYXInKTtcblxuZmFtb3VzZmxleC5sYXlvdXRzID0gZmFtb3VzZmxleC5sYXlvdXRzIHx8IHt9O1xuZmFtb3VzZmxleC5sYXlvdXRzLkNvbGxlY3Rpb25MYXlvdXQgPSByZXF1aXJlKCcuLi9zcmMvbGF5b3V0cy9Db2xsZWN0aW9uTGF5b3V0Jyk7XG5mYW1vdXNmbGV4LmxheW91dHMuQ292ZXJMYXlvdXQgPSByZXF1aXJlKCcuLi9zcmMvbGF5b3V0cy9Db3ZlckxheW91dCcpO1xuZmFtb3VzZmxleC5sYXlvdXRzLkN1YmVMYXlvdXQgPSByZXF1aXJlKCcuLi9zcmMvbGF5b3V0cy9DdWJlTGF5b3V0Jyk7XG5mYW1vdXNmbGV4LmxheW91dHMuR3JpZExheW91dCA9IHJlcXVpcmUoJy4uL3NyYy9sYXlvdXRzL0dyaWRMYXlvdXQnKTtcbmZhbW91c2ZsZXgubGF5b3V0cy5IZWFkZXJGb290ZXJMYXlvdXQgPSByZXF1aXJlKCcuLi9zcmMvbGF5b3V0cy9IZWFkZXJGb290ZXJMYXlvdXQnKTtcbmZhbW91c2ZsZXgubGF5b3V0cy5MaXN0TGF5b3V0ID0gcmVxdWlyZSgnLi4vc3JjL2xheW91dHMvTGlzdExheW91dCcpO1xuZmFtb3VzZmxleC5sYXlvdXRzLk5hdkJhckxheW91dCA9IHJlcXVpcmUoJy4uL3NyYy9sYXlvdXRzL05hdkJhckxheW91dCcpO1xuZmFtb3VzZmxleC5sYXlvdXRzLlByb3BvcnRpb25hbExheW91dCA9IHJlcXVpcmUoJy4uL3NyYy9sYXlvdXRzL1Byb3BvcnRpb25hbExheW91dCcpO1xuZmFtb3VzZmxleC5sYXlvdXRzLldoZWVsTGF5b3V0ID0gcmVxdWlyZSgnLi4vc3JjL2xheW91dHMvV2hlZWxMYXlvdXQnKTtcblxuZmFtb3VzZmxleC5oZWxwZXJzID0gZmFtb3VzZmxleC5oZWxwZXJzIHx8IHt9O1xuZmFtb3VzZmxleC5oZWxwZXJzLkxheW91dERvY2tIZWxwZXIgPSByZXF1aXJlKCcuLi9zcmMvaGVscGVycy9MYXlvdXREb2NrSGVscGVyJyk7XG4iLCJ2YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4vTGF5b3V0VXRpbGl0eScpO1xudmFyIFNjcm9sbENvbnRyb2xsZXIgPSByZXF1aXJlKCcuL1Njcm9sbENvbnRyb2xsZXInKTtcbnZhciBMaXN0TGF5b3V0ID0gcmVxdWlyZSgnLi9sYXlvdXRzL0xpc3RMYXlvdXQnKTtcbnZhciBQdWxsVG9SZWZyZXNoU3RhdGUgPSB7XG4gICAgICAgIEhJRERFTjogMCxcbiAgICAgICAgUFVMTElORzogMSxcbiAgICAgICAgQUNUSVZFOiAyLFxuICAgICAgICBDT01QTEVURUQ6IDMsXG4gICAgICAgIEhJRERJTkc6IDRcbiAgICB9O1xuZnVuY3Rpb24gRmxleFNjcm9sbFZpZXcob3B0aW9ucykge1xuICAgIFNjcm9sbENvbnRyb2xsZXIuY2FsbCh0aGlzLCBMYXlvdXRVdGlsaXR5LmNvbWJpbmVPcHRpb25zKEZsZXhTY3JvbGxWaWV3LkRFRkFVTFRfT1BUSU9OUywgb3B0aW9ucykpO1xuICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgPSAwO1xuICAgIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgPSAwO1xuICAgIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhID0gMDtcbn1cbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUpO1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRmxleFNjcm9sbFZpZXc7XG5GbGV4U2Nyb2xsVmlldy5QdWxsVG9SZWZyZXNoU3RhdGUgPSBQdWxsVG9SZWZyZXNoU3RhdGU7XG5GbGV4U2Nyb2xsVmlldy5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgbGF5b3V0OiBMaXN0TGF5b3V0LFxuICAgIGRpcmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIHBhZ2luYXRlZDogZmFsc2UsXG4gICAgYWxpZ25tZW50OiAwLFxuICAgIGZsb3c6IGZhbHNlLFxuICAgIG1vdXNlTW92ZTogZmFsc2UsXG4gICAgdXNlQ29udGFpbmVyOiBmYWxzZSxcbiAgICB2aXNpYmxlSXRlbVRocmVzc2hvbGQ6IDAuNSxcbiAgICBwdWxsVG9SZWZyZXNoSGVhZGVyOiB1bmRlZmluZWQsXG4gICAgcHVsbFRvUmVmcmVzaEZvb3RlcjogdW5kZWZpbmVkLFxuICAgIGxlYWRpbmdTY3JvbGxWaWV3OiB1bmRlZmluZWQsXG4gICAgdHJhaWxpbmdTY3JvbGxWaWV3OiB1bmRlZmluZWRcbn07XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zLnB1bGxUb1JlZnJlc2hIZWFkZXIgfHwgb3B0aW9ucy5wdWxsVG9SZWZyZXNoRm9vdGVyIHx8IHRoaXMuX3B1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMucHVsbFRvUmVmcmVzaEhlYWRlcikge1xuICAgICAgICAgICAgdGhpcy5fcHVsbFRvUmVmcmVzaCA9IHRoaXMuX3B1bGxUb1JlZnJlc2ggfHwgW1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3B1bGxUb1JlZnJlc2hbMF0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoWzBdID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTixcbiAgICAgICAgICAgICAgICAgICAgcHJldlN0YXRlOiBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOLFxuICAgICAgICAgICAgICAgICAgICBmb290ZXI6IGZhbHNlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2hbMF0ubm9kZSA9IG9wdGlvbnMucHVsbFRvUmVmcmVzaEhlYWRlcjtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLnB1bGxUb1JlZnJlc2hIZWFkZXIgJiYgdGhpcy5fcHVsbFRvUmVmcmVzaCkge1xuICAgICAgICAgICAgdGhpcy5fcHVsbFRvUmVmcmVzaFswXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5wdWxsVG9SZWZyZXNoRm9vdGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoID0gdGhpcy5fcHVsbFRvUmVmcmVzaCB8fCBbXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fcHVsbFRvUmVmcmVzaFsxXSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2hbMV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOLFxuICAgICAgICAgICAgICAgICAgICBwcmV2U3RhdGU6IFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU4sXG4gICAgICAgICAgICAgICAgICAgIGZvb3RlcjogdHJ1ZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9wdWxsVG9SZWZyZXNoWzFdLm5vZGUgPSBvcHRpb25zLnB1bGxUb1JlZnJlc2hGb290ZXI7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5wdWxsVG9SZWZyZXNoRm9vdGVyICYmIHRoaXMuX3B1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2hbMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3B1bGxUb1JlZnJlc2ggJiYgIXRoaXMuX3B1bGxUb1JlZnJlc2hbMF0gJiYgIXRoaXMuX3B1bGxUb1JlZnJlc2hbMV0pIHtcbiAgICAgICAgICAgIHRoaXMuX3B1bGxUb1JlZnJlc2ggPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLnNlcXVlbmNlRnJvbSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgcmV0dXJuIHRoaXMuc2V0RGF0YVNvdXJjZShub2RlKTtcbn07XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUuZ2V0Q3VycmVudEluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpdGVtID0gdGhpcy5nZXRGaXJzdFZpc2libGVJdGVtKCk7XG4gICAgcmV0dXJuIGl0ZW0gPyBpdGVtLnZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpIDogLTE7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdvVG9QYWdlID0gZnVuY3Rpb24gKGluZGV4LCBub0FuaW1hdGlvbikge1xuICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA8IGluZGV4KSB7XG4gICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgIGlmICghdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAodmlld1NlcXVlbmNlLmdldEluZGV4KCkgPiBpbmRleCkge1xuICAgICAgICB2aWV3U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuZ29Ub1JlbmRlck5vZGUodmlld1NlcXVlbmNlLmdldCgpLCBub0FuaW1hdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdldE9mZnNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGU7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdldFBvc2l0aW9uID0gRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmdldE9mZnNldDtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5nZXRBYnNvbHV0ZVBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAtKHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQpO1xufTtcbmZ1bmN0aW9uIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgc3RhdGUpIHtcbiAgICBpZiAocHVsbFRvUmVmcmVzaC5zdGF0ZSAhPT0gc3RhdGUpIHtcbiAgICAgICAgcHVsbFRvUmVmcmVzaC5zdGF0ZSA9IHN0YXRlO1xuICAgICAgICBpZiAocHVsbFRvUmVmcmVzaC5ub2RlICYmIHB1bGxUb1JlZnJlc2gubm9kZS5zZXRQdWxsVG9SZWZyZXNoU3RhdHVzKSB7XG4gICAgICAgICAgICBwdWxsVG9SZWZyZXNoLm5vZGUuc2V0UHVsbFRvUmVmcmVzaFN0YXR1cyhzdGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0UHVsbFRvUmVmcmVzaChmb290ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fcHVsbFRvUmVmcmVzaCA/IHRoaXMuX3B1bGxUb1JlZnJlc2hbZm9vdGVyID8gMSA6IDBdIDogdW5kZWZpbmVkO1xufVxuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLl9wb3N0TGF5b3V0ID0gZnVuY3Rpb24gKHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIGlmICghdGhpcy5fcHVsbFRvUmVmcmVzaCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgIHNjcm9sbE9mZnNldCArPSBzaXplW3RoaXMuX2RpcmVjdGlvbl07XG4gICAgfVxuICAgIHZhciBwcmV2SGVpZ2h0O1xuICAgIHZhciBuZXh0SGVpZ2h0O1xuICAgIHZhciB0b3RhbEhlaWdodDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI7IGkrKykge1xuICAgICAgICB2YXIgcHVsbFRvUmVmcmVzaCA9IHRoaXMuX3B1bGxUb1JlZnJlc2hbaV07XG4gICAgICAgIGlmIChwdWxsVG9SZWZyZXNoKSB7XG4gICAgICAgICAgICB2YXIgbGVuZ3RoID0gcHVsbFRvUmVmcmVzaC5ub2RlLmdldFNpemUoKVt0aGlzLl9kaXJlY3Rpb25dO1xuICAgICAgICAgICAgdmFyIHB1bGxMZW5ndGggPSBwdWxsVG9SZWZyZXNoLm5vZGUuZ2V0UHVsbFRvUmVmcmVzaFNpemUgPyBwdWxsVG9SZWZyZXNoLm5vZGUuZ2V0UHVsbFRvUmVmcmVzaFNpemUoKVt0aGlzLl9kaXJlY3Rpb25dIDogbGVuZ3RoO1xuICAgICAgICAgICAgdmFyIG9mZnNldDtcbiAgICAgICAgICAgIGlmICghcHVsbFRvUmVmcmVzaC5mb290ZXIpIHtcbiAgICAgICAgICAgICAgICBwcmV2SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodChmYWxzZSk7XG4gICAgICAgICAgICAgICAgcHJldkhlaWdodCA9IHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBwcmV2SGVpZ2h0ID49IDAgPyBzY3JvbGxPZmZzZXQgLSBwcmV2SGVpZ2h0IDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEhlaWdodCA9IG5leHRIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogbmV4dEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxIZWlnaHQgPSBwcmV2SGVpZ2h0ID49IDAgJiYgbmV4dEhlaWdodCA+PSAwID8gcHJldkhlaWdodCArIG5leHRIZWlnaHQgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsSGVpZ2h0ID49IDAgJiYgdG90YWxIZWlnaHQgPCBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IE1hdGgucm91bmQoc2Nyb2xsT2Zmc2V0IC0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dICsgbmV4dEhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5leHRIZWlnaHQgPSBuZXh0SGVpZ2h0ID09PSB1bmRlZmluZWQgPyBuZXh0SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlKSA6IG5leHRIZWlnaHQ7XG4gICAgICAgICAgICAgICAgbmV4dEhlaWdodCA9IG5leHRIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogbmV4dEhlaWdodDtcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBuZXh0SGVpZ2h0ID49IDAgPyBzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0IDogc2l6ZVt0aGlzLl9kaXJlY3Rpb25dICsgMTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldkhlaWdodCA9IHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCA/IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQoZmFsc2UpIDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgcHJldkhlaWdodCA9IHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCA/IC0xIDogcHJldkhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxIZWlnaHQgPSBwcmV2SGVpZ2h0ID49IDAgJiYgbmV4dEhlaWdodCA+PSAwID8gcHJldkhlaWdodCArIG5leHRIZWlnaHQgOiAtMTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRvdGFsSGVpZ2h0ID49IDAgJiYgdG90YWxIZWlnaHQgPCBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IE1hdGgucm91bmQoc2Nyb2xsT2Zmc2V0IC0gcHJldkhlaWdodCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gLShvZmZzZXQgLSBzaXplW3RoaXMuX2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZpc2libGVQZXJjID0gTWF0aC5tYXgoTWF0aC5taW4ob2Zmc2V0IC8gcHVsbExlbmd0aCwgMSksIDApO1xuICAgICAgICAgICAgc3dpdGNoIChwdWxsVG9SZWZyZXNoLnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU46XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2aXNpYmxlUGVyYyA+PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5BQ1RJVkUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCA+PSAwLjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLlBVTExJTkcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQdWxsVG9SZWZyZXNoU3RhdGUuUFVMTElORzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQgJiYgdmlzaWJsZVBlcmMgPj0gMSkge1xuICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5BQ1RJVkUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0IDwgMC4yKSB7XG4gICAgICAgICAgICAgICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERFTik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQdWxsVG9SZWZyZXNoU3RhdGUuQ09NUExFVEVEOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldCA+PSAwLjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9zZXRQdWxsVG9SZWZyZXNoU3RhdGUocHVsbFRvUmVmcmVzaCwgUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERJTkcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUHVsbFRvUmVmcmVzaFN0YXRlLkhJRERJTkc6XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldCA8IDAuMikge1xuICAgICAgICAgICAgICAgICAgICBfc2V0UHVsbFRvUmVmcmVzaFN0YXRlKHB1bGxUb1JlZnJlc2gsIFB1bGxUb1JlZnJlc2hTdGF0ZS5ISURERU4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwdWxsVG9SZWZyZXNoLnN0YXRlICE9PSBQdWxsVG9SZWZyZXNoU3RhdGUuSElEREVOKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRleHROb2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm9kZTogcHVsbFRvUmVmcmVzaC5ub2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldjogIXB1bGxUb1JlZnJlc2guZm9vdGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDogcHVsbFRvUmVmcmVzaC5mb290ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogIXB1bGxUb1JlZnJlc2guZm9vdGVyID8gLS10aGlzLl9ub2Rlcy5fY29udGV4dFN0YXRlLnByZXZHZXRJbmRleCA6ICsrdGhpcy5fbm9kZXMuX2NvbnRleHRTdGF0ZS5uZXh0R2V0SW5kZXhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgICAgIGlmIChwdWxsVG9SZWZyZXNoLnN0YXRlID09PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aCA9IGxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aCA9IE1hdGgubWluKG9mZnNldCwgbGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHNldCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemVbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLTAuMDAxXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoOiBzY3JvbGxMZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZXQuc2l6ZVt0aGlzLl9kaXJlY3Rpb25dID0gTWF0aC5tYXgoTWF0aC5taW4ob2Zmc2V0LCBwdWxsTGVuZ3RoKSwgMCk7XG4gICAgICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVt0aGlzLl9kaXJlY3Rpb25dID0gcHVsbFRvUmVmcmVzaC5mb290ZXIgPyBzaXplW3RoaXMuX2RpcmVjdGlvbl0gLSBsZW5ndGggOiAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX25vZGVzLl9jb250ZXh0LnNldChjb250ZXh0Tm9kZSwgc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5GbGV4U2Nyb2xsVmlldy5wcm90b3R5cGUuc2hvd1B1bGxUb1JlZnJlc2ggPSBmdW5jdGlvbiAoZm9vdGVyKSB7XG4gICAgdmFyIHB1bGxUb1JlZnJlc2ggPSBfZ2V0UHVsbFRvUmVmcmVzaC5jYWxsKHRoaXMsIGZvb3Rlcik7XG4gICAgaWYgKHB1bGxUb1JlZnJlc2gpIHtcbiAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5ID0gdHJ1ZTtcbiAgICB9XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmhpZGVQdWxsVG9SZWZyZXNoID0gZnVuY3Rpb24gKGZvb3Rlcikge1xuICAgIHZhciBwdWxsVG9SZWZyZXNoID0gX2dldFB1bGxUb1JlZnJlc2guY2FsbCh0aGlzLCBmb290ZXIpO1xuICAgIGlmIChwdWxsVG9SZWZyZXNoICYmIHB1bGxUb1JlZnJlc2guc3RhdGUgPT09IFB1bGxUb1JlZnJlc2hTdGF0ZS5BQ1RJVkUpIHtcbiAgICAgICAgX3NldFB1bGxUb1JlZnJlc2hTdGF0ZShwdWxsVG9SZWZyZXNoLCBQdWxsVG9SZWZyZXNoU3RhdGUuQ09NUExFVEVEKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbERpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmlzUHVsbFRvUmVmcmVzaFZpc2libGUgPSBmdW5jdGlvbiAoZm9vdGVyKSB7XG4gICAgdmFyIHB1bGxUb1JlZnJlc2ggPSBfZ2V0UHVsbFRvUmVmcmVzaC5jYWxsKHRoaXMsIGZvb3Rlcik7XG4gICAgcmV0dXJuIHB1bGxUb1JlZnJlc2ggPyBwdWxsVG9SZWZyZXNoLnN0YXRlID09PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFIDogZmFsc2U7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmFwcGx5U2Nyb2xsRm9yY2UgPSBmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICB2YXIgbGVhZGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMubGVhZGluZ1Njcm9sbFZpZXc7XG4gICAgdmFyIHRyYWlsaW5nU2Nyb2xsVmlldyA9IHRoaXMub3B0aW9ucy50cmFpbGluZ1Njcm9sbFZpZXc7XG4gICAgaWYgKCFsZWFkaW5nU2Nyb2xsVmlldyAmJiAhdHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgIHJldHVybiBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5hcHBseVNjcm9sbEZvcmNlLmNhbGwodGhpcywgZGVsdGEpO1xuICAgIH1cbiAgICB2YXIgcGFydGlhbERlbHRhO1xuICAgIGlmIChkZWx0YSA8IDApIHtcbiAgICAgICAgaWYgKGxlYWRpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSBsZWFkaW5nU2Nyb2xsVmlldy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBsZWFkaW5nU2Nyb2xsVmlldy5hcHBseVNjcm9sbEZvcmNlKHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdGhpcy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy5hcHBseVNjcm9sbEZvcmNlKGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0cmFpbGluZ1Njcm9sbFZpZXcuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy5hcHBseVNjcm9sbEZvcmNlKHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxlYWRpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0aGlzLmNhblNjcm9sbChkZWx0YSk7XG4gICAgICAgICAgICBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5hcHBseVNjcm9sbEZvcmNlLmNhbGwodGhpcywgcGFydGlhbERlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcuYXBwbHlTY3JvbGxGb3JjZShkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLnVwZGF0ZVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKHByZXZEZWx0YSwgbmV3RGVsdGEpIHtcbiAgICB2YXIgbGVhZGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMubGVhZGluZ1Njcm9sbFZpZXc7XG4gICAgdmFyIHRyYWlsaW5nU2Nyb2xsVmlldyA9IHRoaXMub3B0aW9ucy50cmFpbGluZ1Njcm9sbFZpZXc7XG4gICAgaWYgKCFsZWFkaW5nU2Nyb2xsVmlldyAmJiAhdHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgIHJldHVybiBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHByZXZEZWx0YSwgbmV3RGVsdGEpO1xuICAgIH1cbiAgICB2YXIgcGFydGlhbERlbHRhO1xuICAgIHZhciBkZWx0YSA9IG5ld0RlbHRhIC0gcHJldkRlbHRhO1xuICAgIGlmIChkZWx0YSA8IDApIHtcbiAgICAgICAgaWYgKGxlYWRpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSBsZWFkaW5nU2Nyb2xsVmlldy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArIHBhcnRpYWxEZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhICs9IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhaWxpbmdTY3JvbGxWaWV3ICYmIGRlbHRhKSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0aGlzLmNhblNjcm9sbChkZWx0YSk7XG4gICAgICAgICAgICBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKyBwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSArPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICB0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSArPSBkZWx0YTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy51cGRhdGVTY3JvbGxGb3JjZSh0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKyBkZWx0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVsdGEpIHtcbiAgICAgICAgICAgIFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnVwZGF0ZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSArIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHJhaWxpbmdTY3JvbGxWaWV3KSB7XG4gICAgICAgICAgICBwYXJ0aWFsRGVsdGEgPSB0cmFpbGluZ1Njcm9sbFZpZXcuY2FuU2Nyb2xsKGRlbHRhKTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy51cGRhdGVTY3JvbGxGb3JjZSh0aGlzLl90cmFpbGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKyBwYXJ0aWFsRGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsZWFkaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gdGhpcy5jYW5TY3JvbGwoZGVsdGEpO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICsgcGFydGlhbERlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKz0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgbGVhZGluZ1Njcm9sbFZpZXcudXBkYXRlU2Nyb2xsRm9yY2UodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSArIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX2xlYWRpbmdTY3JvbGxWaWV3RGVsdGEgKz0gZGVsdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBTY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS51cGRhdGVTY3JvbGxGb3JjZS5jYWxsKHRoaXMsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgKyBkZWx0YSk7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhICs9IGRlbHRhO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkZsZXhTY3JvbGxWaWV3LnByb3RvdHlwZS5yZWxlYXNlU2Nyb2xsRm9yY2UgPSBmdW5jdGlvbiAoZGVsdGEsIHZlbG9jaXR5KSB7XG4gICAgdmFyIGxlYWRpbmdTY3JvbGxWaWV3ID0gdGhpcy5vcHRpb25zLmxlYWRpbmdTY3JvbGxWaWV3O1xuICAgIHZhciB0cmFpbGluZ1Njcm9sbFZpZXcgPSB0aGlzLm9wdGlvbnMudHJhaWxpbmdTY3JvbGxWaWV3O1xuICAgIGlmICghbGVhZGluZ1Njcm9sbFZpZXcgJiYgIXRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICByZXR1cm4gU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgZGVsdGEsIHZlbG9jaXR5KTtcbiAgICB9XG4gICAgdmFyIHBhcnRpYWxEZWx0YTtcbiAgICBpZiAoZGVsdGEgPCAwKSB7XG4gICAgICAgIGlmIChsZWFkaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gTWF0aC5tYXgodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBkZWx0YSAtPSBwYXJ0aWFsRGVsdGE7XG4gICAgICAgICAgICBsZWFkaW5nU2Nyb2xsVmlldy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyAwIDogdmVsb2NpdHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFpbGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IE1hdGgubWF4KHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyAwIDogdmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEgLT0gZGVsdGE7XG4gICAgICAgICAgICB0cmFpbGluZ1Njcm9sbFZpZXcucmVsZWFzZVNjcm9sbEZvcmNlKHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSA/IHZlbG9jaXR5IDogMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhIC09IGRlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyB2ZWxvY2l0eSA6IDApO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRyYWlsaW5nU2Nyb2xsVmlldykge1xuICAgICAgICAgICAgcGFydGlhbERlbHRhID0gTWF0aC5taW4odGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RyYWlsaW5nU2Nyb2xsVmlld0RlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIGRlbHRhIC09IHBhcnRpYWxEZWx0YTtcbiAgICAgICAgICAgIHRyYWlsaW5nU2Nyb2xsVmlldy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fdHJhaWxpbmdTY3JvbGxWaWV3RGVsdGEsIGRlbHRhID8gMCA6IHZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVhZGluZ1Njcm9sbFZpZXcpIHtcbiAgICAgICAgICAgIHBhcnRpYWxEZWx0YSA9IE1hdGgubWluKHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEsIGRlbHRhKTtcbiAgICAgICAgICAgIHRoaXMuX3RoaXNTY3JvbGxWaWV3RGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgZGVsdGEgLT0gcGFydGlhbERlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlLmNhbGwodGhpcywgdGhpcy5fdGhpc1Njcm9sbFZpZXdEZWx0YSwgZGVsdGEgPyAwIDogdmVsb2NpdHkpO1xuICAgICAgICAgICAgdGhpcy5fbGVhZGluZ1Njcm9sbFZpZXdEZWx0YSAtPSBkZWx0YTtcbiAgICAgICAgICAgIGxlYWRpbmdTY3JvbGxWaWV3LnJlbGVhc2VTY3JvbGxGb3JjZSh0aGlzLl9sZWFkaW5nU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSA/IHZlbG9jaXR5IDogMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhIC09IGRlbHRhO1xuICAgICAgICAgICAgU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UuY2FsbCh0aGlzLCB0aGlzLl90aGlzU2Nyb2xsVmlld0RlbHRhLCBkZWx0YSA/IHZlbG9jaXR5IDogMCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRmxleFNjcm9sbFZpZXcucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IFNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmNvbW1pdC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuICAgIGlmICh0aGlzLl9wdWxsVG9SZWZyZXNoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcHVsbFRvUmVmcmVzaCA9IHRoaXMuX3B1bGxUb1JlZnJlc2hbaV07XG4gICAgICAgICAgICBpZiAocHVsbFRvUmVmcmVzaCkge1xuICAgICAgICAgICAgICAgIGlmIChwdWxsVG9SZWZyZXNoLnN0YXRlID09PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFICYmIHB1bGxUb1JlZnJlc2gucHJldlN0YXRlICE9PSBQdWxsVG9SZWZyZXNoU3RhdGUuQUNUSVZFKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlZnJlc2gnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb290ZXI6IHB1bGxUb1JlZnJlc2guZm9vdGVyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwdWxsVG9SZWZyZXNoLnByZXZTdGF0ZSA9IHB1bGxUb1JlZnJlc2guc3RhdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IEZsZXhTY3JvbGxWaWV3OyIsInZhciBPcHRpb25zTWFuYWdlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLk9wdGlvbnNNYW5hZ2VyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuT3B0aW9uc01hbmFnZXIgOiBudWxsO1xudmFyIFRyYW5zZm9ybSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IG51bGw7XG52YXIgVmVjdG9yID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLm1hdGguVmVjdG9yIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLm1hdGguVmVjdG9yIDogbnVsbDtcbnZhciBQYXJ0aWNsZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IG51bGw7XG52YXIgU3ByaW5nID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnBoeXNpY3MuZm9yY2VzLlNwcmluZyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLmZvcmNlcy5TcHJpbmcgOiBudWxsO1xudmFyIFBoeXNpY3NFbmdpbmUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMucGh5c2ljcy5QaHlzaWNzRW5naW5lIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnBoeXNpY3MuUGh5c2ljc0VuZ2luZSA6IG51bGw7XG52YXIgTGF5b3V0Tm9kZSA9IHJlcXVpcmUoJy4vTGF5b3V0Tm9kZScpO1xudmFyIFRyYW5zaXRpb25hYmxlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnRyYW5zaXRpb25zLlRyYW5zaXRpb25hYmxlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnRyYW5zaXRpb25zLlRyYW5zaXRpb25hYmxlIDogbnVsbDtcbmZ1bmN0aW9uIEZsb3dMYXlvdXROb2RlKHJlbmRlck5vZGUsIHNwZWMpIHtcbiAgICBMYXlvdXROb2RlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmNvbnN0cnVjdG9yLkRFRkFVTFRfT1BUSU9OUyk7XG4gICAgICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMub3B0aW9ucyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5fcGUpIHtcbiAgICAgICAgdGhpcy5fcGUgPSBuZXcgUGh5c2ljc0VuZ2luZSgpO1xuICAgICAgICB0aGlzLl9wZS5zbGVlcCgpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuX3Byb3BlcnRpZXMpIHtcbiAgICAgICAgdGhpcy5fcHJvcGVydGllcyA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIHRoaXMuX3Byb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXNbcHJvcE5hbWVdLmluaXQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZSkge1xuICAgICAgICB0aGlzLl9sb2NrVHJhbnNpdGlvbmFibGUgPSBuZXcgVHJhbnNpdGlvbmFibGUoMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLmhhbHQoKTtcbiAgICAgICAgdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLnJlc2V0KDEpO1xuICAgIH1cbiAgICB0aGlzLl9zcGVjTW9kaWZpZWQgPSB0cnVlO1xuICAgIHRoaXMuX2luaXRpYWwgPSB0cnVlO1xuICAgIGlmIChzcGVjKSB7XG4gICAgICAgIHRoaXMuc2V0U3BlYyhzcGVjKTtcbiAgICB9XG59XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKExheW91dE5vZGUucHJvdG90eXBlKTtcbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEZsb3dMYXlvdXROb2RlO1xuRmxvd0xheW91dE5vZGUuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHNwcmluZzoge1xuICAgICAgICBkYW1waW5nUmF0aW86IDAuOCxcbiAgICAgICAgcGVyaW9kOiAzMDBcbiAgICB9LFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgb3BhY2l0eTogdHJ1ZSxcbiAgICAgICAgYWxpZ246IHRydWUsXG4gICAgICAgIG9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2l6ZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNsYXRlOiB0cnVlLFxuICAgICAgICBza2V3OiB0cnVlLFxuICAgICAgICByb3RhdGU6IHRydWUsXG4gICAgICAgIHNjYWxlOiB0cnVlXG4gICAgfSxcbiAgICBwYXJ0aWNsZVJvdW5kaW5nOiAwLjAwMVxufTtcbnZhciBERUZBVUxUID0ge1xuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBvcGFjaXR5MkQ6IFtcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNjYWxlOiBbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgc2tldzogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9O1xuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgdmFyIHdhc1NsZWVwaW5nID0gdGhpcy5fcGUuaXNTbGVlcGluZygpO1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHRoaXMuX3Byb3BlcnRpZXMpIHtcbiAgICAgICAgdmFyIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzW3Byb3BOYW1lXTtcbiAgICAgICAgaWYgKG9wdGlvbnMuc3ByaW5nICYmIHByb3AuZm9yY2UpIHtcbiAgICAgICAgICAgIHByb3AuZm9yY2Uuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMuc3ByaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5wcm9wZXJ0aWVzICYmIG9wdGlvbnMucHJvcGVydGllc1twcm9wTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBwcm9wLmVuYWJsZWQgPSB0aGlzLm9wdGlvbnMucHJvcGVydGllc1twcm9wTmFtZV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb3AuZW5hYmxlZCA9IFtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucHJvcGVydGllc1twcm9wTmFtZV0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHdhc1NsZWVwaW5nKSB7XG4gICAgICAgIHRoaXMuX3BlLnNsZWVwKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5zZXRTcGVjID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgICB2YXIgc2V0O1xuICAgIGlmIChzcGVjLnRyYW5zZm9ybSkge1xuICAgICAgICBzZXQgPSBUcmFuc2Zvcm0uaW50ZXJwcmV0KHNwZWMudHJhbnNmb3JtKTtcbiAgICB9XG4gICAgaWYgKCFzZXQpIHtcbiAgICAgICAgc2V0ID0ge307XG4gICAgfVxuICAgIHNldC5vcGFjaXR5ID0gc3BlYy5vcGFjaXR5O1xuICAgIHNldC5zaXplID0gc3BlYy5zaXplO1xuICAgIHNldC5hbGlnbiA9IHNwZWMuYWxpZ247XG4gICAgc2V0Lm9yaWdpbiA9IHNwZWMub3JpZ2luO1xuICAgIHZhciBvbGRSZW1vdmluZyA9IHRoaXMuX3JlbW92aW5nO1xuICAgIHZhciBvbGRJbnZhbGlkYXRlZCA9IHRoaXMuX2ludmFsaWRhdGVkO1xuICAgIHRoaXMuc2V0KHNldCk7XG4gICAgdGhpcy5fcmVtb3ZpbmcgPSBvbGRSZW1vdmluZztcbiAgICB0aGlzLl9pbnZhbGlkYXRlZCA9IG9sZEludmFsaWRhdGVkO1xufTtcbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5faW52YWxpZGF0ZWQpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gdGhpcy5fcHJvcGVydGllcykge1xuICAgICAgICAgICAgdGhpcy5fcHJvcGVydGllc1twcm9wTmFtZV0uaW52YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnRydWVTaXplUmVxdWVzdGVkID0gZmFsc2U7XG4gICAgdGhpcy51c2VzVHJ1ZVNpemUgPSBmYWxzZTtcbn07XG5GbG93TGF5b3V0Tm9kZS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKHJlbW92ZVNwZWMpIHtcbiAgICB0aGlzLl9yZW1vdmluZyA9IHRydWU7XG4gICAgaWYgKHJlbW92ZVNwZWMpIHtcbiAgICAgICAgdGhpcy5zZXRTcGVjKHJlbW92ZVNwZWMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BlLnNsZWVwKCk7XG4gICAgICAgIHRoaXMuX3NwZWNNb2RpZmllZCA9IGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLl9pbnZhbGlkYXRlZCA9IGZhbHNlO1xufTtcbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5yZWxlYXNlTG9jayA9IGZ1bmN0aW9uIChlbmFibGUpIHtcbiAgICB0aGlzLl9sb2NrVHJhbnNpdGlvbmFibGUuaGFsdCgpO1xuICAgIHRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZS5yZXNldCgwKTtcbiAgICBpZiAoZW5hYmxlKSB7XG4gICAgICAgIHRoaXMuX2xvY2tUcmFuc2l0aW9uYWJsZS5zZXQoMSwgeyBkdXJhdGlvbjogdGhpcy5vcHRpb25zLnNwcmluZy5wZXJpb2QgfHwgMTAwMCB9KTtcbiAgICB9XG59O1xuZnVuY3Rpb24gX2dldFJvdW5kZWRWYWx1ZTNEKHByb3AsIGRlZiwgcHJlY2lzaW9uLCBsb2NrVmFsdWUpIHtcbiAgICBpZiAoIXByb3AgfHwgIXByb3AuaW5pdCkge1xuICAgICAgICByZXR1cm4gZGVmO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICBwcm9wLmVuYWJsZWRbMF0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnggKyAocHJvcC5lbmRTdGF0ZS54IC0gcHJvcC5jdXJTdGF0ZS54KSAqIGxvY2tWYWx1ZSkgLyBwcmVjaXNpb24pICogcHJlY2lzaW9uIDogcHJvcC5lbmRTdGF0ZS54LFxuICAgICAgICBwcm9wLmVuYWJsZWRbMV0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnkgKyAocHJvcC5lbmRTdGF0ZS55IC0gcHJvcC5jdXJTdGF0ZS55KSAqIGxvY2tWYWx1ZSkgLyBwcmVjaXNpb24pICogcHJlY2lzaW9uIDogcHJvcC5lbmRTdGF0ZS55LFxuICAgICAgICBwcm9wLmVuYWJsZWRbMl0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnogKyAocHJvcC5lbmRTdGF0ZS56IC0gcHJvcC5jdXJTdGF0ZS56KSAqIGxvY2tWYWx1ZSkgLyBwcmVjaXNpb24pICogcHJlY2lzaW9uIDogcHJvcC5lbmRTdGF0ZS56XG4gICAgXTtcbn1cbkZsb3dMYXlvdXROb2RlLnByb3RvdHlwZS5nZXRTcGVjID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbmRTdGF0ZVJlYWNoZWQgPSB0aGlzLl9wZS5pc1NsZWVwaW5nKCk7XG4gICAgaWYgKCF0aGlzLl9zcGVjTW9kaWZpZWQgJiYgZW5kU3RhdGVSZWFjaGVkKSB7XG4gICAgICAgIHRoaXMuX3NwZWMucmVtb3ZlZCA9ICF0aGlzLl9pbnZhbGlkYXRlZDtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NwZWM7XG4gICAgfVxuICAgIHRoaXMuX2luaXRpYWwgPSBmYWxzZTtcbiAgICB0aGlzLl9zcGVjTW9kaWZpZWQgPSAhZW5kU3RhdGVSZWFjaGVkO1xuICAgIHRoaXMuX3NwZWMucmVtb3ZlZCA9IGZhbHNlO1xuICAgIGlmICghZW5kU3RhdGVSZWFjaGVkKSB7XG4gICAgICAgIHRoaXMuX3BlLnN0ZXAoKTtcbiAgICB9XG4gICAgdmFyIHNwZWMgPSB0aGlzLl9zcGVjO1xuICAgIHZhciBwcmVjaXNpb24gPSB0aGlzLm9wdGlvbnMucGFydGljbGVSb3VuZGluZztcbiAgICB2YXIgbG9ja1ZhbHVlID0gdGhpcy5fbG9ja1RyYW5zaXRpb25hYmxlLmdldCgpO1xuICAgIHZhciBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5vcGFjaXR5O1xuICAgIGlmIChwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBzcGVjLm9wYWNpdHkgPSBwcm9wLmVuYWJsZWRbMF0gPyBNYXRoLnJvdW5kKE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHByb3AuY3VyU3RhdGUueCkpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbiA6IHByb3AuZW5kU3RhdGUueDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLm9wYWNpdHkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLnNpemU7XG4gICAgaWYgKHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIHNwZWMuc2l6ZSA9IHNwZWMuc2l6ZSB8fCBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgICAgICBzcGVjLnNpemVbMF0gPSBwcm9wLmVuYWJsZWRbMF0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnggKyAocHJvcC5lbmRTdGF0ZS54IC0gcHJvcC5jdXJTdGF0ZS54KSAqIGxvY2tWYWx1ZSkgLyAwLjEpICogMC4xIDogcHJvcC5lbmRTdGF0ZS54O1xuICAgICAgICBzcGVjLnNpemVbMV0gPSBwcm9wLmVuYWJsZWRbMV0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnkgKyAocHJvcC5lbmRTdGF0ZS55IC0gcHJvcC5jdXJTdGF0ZS55KSAqIGxvY2tWYWx1ZSkgLyAwLjEpICogMC4xIDogcHJvcC5lbmRTdGF0ZS55O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwZWMuc2l6ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuYWxpZ247XG4gICAgaWYgKHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIHNwZWMuYWxpZ24gPSBzcGVjLmFsaWduIHx8IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgICAgIHNwZWMuYWxpZ25bMF0gPSBwcm9wLmVuYWJsZWRbMF0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnggKyAocHJvcC5lbmRTdGF0ZS54IC0gcHJvcC5jdXJTdGF0ZS54KSAqIGxvY2tWYWx1ZSkgLyAwLjEpICogMC4xIDogcHJvcC5lbmRTdGF0ZS54O1xuICAgICAgICBzcGVjLmFsaWduWzFdID0gcHJvcC5lbmFibGVkWzFdID8gTWF0aC5yb3VuZCgocHJvcC5jdXJTdGF0ZS55ICsgKHByb3AuZW5kU3RhdGUueSAtIHByb3AuY3VyU3RhdGUueSkgKiBsb2NrVmFsdWUpIC8gMC4xKSAqIDAuMSA6IHByb3AuZW5kU3RhdGUueTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLmFsaWduID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5vcmlnaW47XG4gICAgaWYgKHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIHNwZWMub3JpZ2luID0gc3BlYy5vcmlnaW4gfHwgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgc3BlYy5vcmlnaW5bMF0gPSBwcm9wLmVuYWJsZWRbMF0gPyBNYXRoLnJvdW5kKChwcm9wLmN1clN0YXRlLnggKyAocHJvcC5lbmRTdGF0ZS54IC0gcHJvcC5jdXJTdGF0ZS54KSAqIGxvY2tWYWx1ZSkgLyAwLjEpICogMC4xIDogcHJvcC5lbmRTdGF0ZS54O1xuICAgICAgICBzcGVjLm9yaWdpblsxXSA9IHByb3AuZW5hYmxlZFsxXSA/IE1hdGgucm91bmQoKHByb3AuY3VyU3RhdGUueSArIChwcm9wLmVuZFN0YXRlLnkgLSBwcm9wLmN1clN0YXRlLnkpICogbG9ja1ZhbHVlKSAvIDAuMSkgKiAwLjEgOiBwcm9wLmVuZFN0YXRlLnk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BlYy5vcmlnaW4gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHZhciB0cmFuc2xhdGUgPSB0aGlzLl9wcm9wZXJ0aWVzLnRyYW5zbGF0ZTtcbiAgICB2YXIgdHJhbnNsYXRlWDtcbiAgICB2YXIgdHJhbnNsYXRlWTtcbiAgICB2YXIgdHJhbnNsYXRlWjtcbiAgICBpZiAodHJhbnNsYXRlICYmIHRyYW5zbGF0ZS5pbml0KSB7XG4gICAgICAgIHRyYW5zbGF0ZVggPSB0cmFuc2xhdGUuZW5hYmxlZFswXSA/IE1hdGgucm91bmQoKHRyYW5zbGF0ZS5jdXJTdGF0ZS54ICsgKHRyYW5zbGF0ZS5lbmRTdGF0ZS54IC0gdHJhbnNsYXRlLmN1clN0YXRlLngpICogbG9ja1ZhbHVlKSAvIHByZWNpc2lvbikgKiBwcmVjaXNpb24gOiB0cmFuc2xhdGUuZW5kU3RhdGUueDtcbiAgICAgICAgdHJhbnNsYXRlWSA9IHRyYW5zbGF0ZS5lbmFibGVkWzFdID8gTWF0aC5yb3VuZCgodHJhbnNsYXRlLmN1clN0YXRlLnkgKyAodHJhbnNsYXRlLmVuZFN0YXRlLnkgLSB0cmFuc2xhdGUuY3VyU3RhdGUueSkgKiBsb2NrVmFsdWUpIC8gcHJlY2lzaW9uKSAqIHByZWNpc2lvbiA6IHRyYW5zbGF0ZS5lbmRTdGF0ZS55O1xuICAgICAgICB0cmFuc2xhdGVaID0gdHJhbnNsYXRlLmVuYWJsZWRbMl0gPyBNYXRoLnJvdW5kKCh0cmFuc2xhdGUuY3VyU3RhdGUueiArICh0cmFuc2xhdGUuZW5kU3RhdGUueiAtIHRyYW5zbGF0ZS5jdXJTdGF0ZS56KSAqIGxvY2tWYWx1ZSkgLyBwcmVjaXNpb24pICogcHJlY2lzaW9uIDogdHJhbnNsYXRlLmVuZFN0YXRlLno7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0cmFuc2xhdGVaID0gMDtcbiAgICB9XG4gICAgdmFyIHNjYWxlID0gdGhpcy5fcHJvcGVydGllcy5zY2FsZTtcbiAgICB2YXIgc2tldyA9IHRoaXMuX3Byb3BlcnRpZXMuc2tldztcbiAgICB2YXIgcm90YXRlID0gdGhpcy5fcHJvcGVydGllcy5yb3RhdGU7XG4gICAgaWYgKHNjYWxlIHx8IHNrZXcgfHwgcm90YXRlKSB7XG4gICAgICAgIHNwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLmJ1aWxkKHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVgsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlWSxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVaXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgc2tldzogX2dldFJvdW5kZWRWYWx1ZTNELmNhbGwodGhpcywgc2tldywgREVGQVVMVC5za2V3LCB0aGlzLm9wdGlvbnMucGFydGljbGVSb3VuZGluZywgbG9ja1ZhbHVlKSxcbiAgICAgICAgICAgIHNjYWxlOiBfZ2V0Um91bmRlZFZhbHVlM0QuY2FsbCh0aGlzLCBzY2FsZSwgREVGQVVMVC5zY2FsZSwgdGhpcy5vcHRpb25zLnBhcnRpY2xlUm91bmRpbmcsIGxvY2tWYWx1ZSksXG4gICAgICAgICAgICByb3RhdGU6IF9nZXRSb3VuZGVkVmFsdWUzRC5jYWxsKHRoaXMsIHJvdGF0ZSwgREVGQVVMVC5yb3RhdGUsIHRoaXMub3B0aW9ucy5wYXJ0aWNsZVJvdW5kaW5nLCBsb2NrVmFsdWUpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodHJhbnNsYXRlKSB7XG4gICAgICAgIGlmICghc3BlYy50cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHNwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLnRyYW5zbGF0ZSh0cmFuc2xhdGVYLCB0cmFuc2xhdGVZLCB0cmFuc2xhdGVaKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNwZWMudHJhbnNmb3JtWzEyXSA9IHRyYW5zbGF0ZVg7XG4gICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxM10gPSB0cmFuc2xhdGVZO1xuICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm1bMTRdID0gdHJhbnNsYXRlWjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHNwZWMudHJhbnNmb3JtID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3BlYztcbn07XG5mdW5jdGlvbiBfc2V0UHJvcGVydHlWYWx1ZShwcm9wLCBwcm9wTmFtZSwgZW5kU3RhdGUsIGRlZmF1bHRWYWx1ZSwgaW1tZWRpYXRlLCBpc1RyYW5zbGF0ZSkge1xuICAgIHByb3AgPSBwcm9wIHx8IHRoaXMuX3Byb3BlcnRpZXNbcHJvcE5hbWVdO1xuICAgIGlmIChwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBwcm9wLmludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIHZhbHVlID0gZGVmYXVsdFZhbHVlO1xuICAgICAgICBpZiAoZW5kU3RhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdmFsdWUgPSBlbmRTdGF0ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9yZW1vdmluZykge1xuICAgICAgICAgICAgdmFsdWUgPSBwcm9wLnBhcnRpY2xlLmdldFBvc2l0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvcC5lbmRTdGF0ZS54ID0gdmFsdWVbMF07XG4gICAgICAgIHByb3AuZW5kU3RhdGUueSA9IHZhbHVlLmxlbmd0aCA+IDEgPyB2YWx1ZVsxXSA6IDA7XG4gICAgICAgIHByb3AuZW5kU3RhdGUueiA9IHZhbHVlLmxlbmd0aCA+IDIgPyB2YWx1ZVsyXSA6IDA7XG4gICAgICAgIGlmIChpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHByb3AuY3VyU3RhdGUueCA9IHByb3AuZW5kU3RhdGUueDtcbiAgICAgICAgICAgIHByb3AuY3VyU3RhdGUueSA9IHByb3AuZW5kU3RhdGUueTtcbiAgICAgICAgICAgIHByb3AuY3VyU3RhdGUueiA9IHByb3AuZW5kU3RhdGUuejtcbiAgICAgICAgICAgIHByb3AudmVsb2NpdHkueCA9IDA7XG4gICAgICAgICAgICBwcm9wLnZlbG9jaXR5LnkgPSAwO1xuICAgICAgICAgICAgcHJvcC52ZWxvY2l0eS56ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wLmVuZFN0YXRlLnggIT09IHByb3AuY3VyU3RhdGUueCB8fCBwcm9wLmVuZFN0YXRlLnkgIT09IHByb3AuY3VyU3RhdGUueSB8fCBwcm9wLmVuZFN0YXRlLnogIT09IHByb3AuY3VyU3RhdGUueikge1xuICAgICAgICAgICAgdGhpcy5fcGUud2FrZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgd2FzU2xlZXBpbmcgPSB0aGlzLl9wZS5pc1NsZWVwaW5nKCk7XG4gICAgICAgIGlmICghcHJvcCkge1xuICAgICAgICAgICAgcHJvcCA9IHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZTogbmV3IFBhcnRpY2xlKHsgcG9zaXRpb246IHRoaXMuX2luaXRpYWwgfHwgaW1tZWRpYXRlID8gZW5kU3RhdGUgOiBkZWZhdWx0VmFsdWUgfSksXG4gICAgICAgICAgICAgICAgZW5kU3RhdGU6IG5ldyBWZWN0b3IoZW5kU3RhdGUpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcHJvcC5jdXJTdGF0ZSA9IHByb3AucGFydGljbGUucG9zaXRpb247XG4gICAgICAgICAgICBwcm9wLnZlbG9jaXR5ID0gcHJvcC5wYXJ0aWNsZS52ZWxvY2l0eTtcbiAgICAgICAgICAgIHByb3AuZm9yY2UgPSBuZXcgU3ByaW5nKHRoaXMub3B0aW9ucy5zcHJpbmcpO1xuICAgICAgICAgICAgcHJvcC5mb3JjZS5zZXRPcHRpb25zKHsgYW5jaG9yOiBwcm9wLmVuZFN0YXRlIH0pO1xuICAgICAgICAgICAgdGhpcy5fcGUuYWRkQm9keShwcm9wLnBhcnRpY2xlKTtcbiAgICAgICAgICAgIHByb3AuZm9yY2VJZCA9IHRoaXMuX3BlLmF0dGFjaChwcm9wLmZvcmNlLCBwcm9wLnBhcnRpY2xlKTtcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXNbcHJvcE5hbWVdID0gcHJvcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3AucGFydGljbGUuc2V0UG9zaXRpb24odGhpcy5faW5pdGlhbCB8fCBpbW1lZGlhdGUgPyBlbmRTdGF0ZSA6IGRlZmF1bHRWYWx1ZSk7XG4gICAgICAgICAgICBwcm9wLmVuZFN0YXRlLnNldChlbmRTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsICYmICFpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3BlLndha2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICh3YXNTbGVlcGluZykge1xuICAgICAgICAgICAgdGhpcy5fcGUuc2xlZXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdICYmIHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHByb3AuZW5hYmxlZCA9IHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3AuZW5hYmxlZCA9IFtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMucHJvcGVydGllc1twcm9wTmFtZV0sXG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zLnByb3BlcnRpZXNbcHJvcE5hbWVdLFxuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5wcm9wZXJ0aWVzW3Byb3BOYW1lXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICBwcm9wLmluaXQgPSB0cnVlO1xuICAgICAgICBwcm9wLmludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0SWZORTJEKGExLCBhMikge1xuICAgIHJldHVybiBhMVswXSA9PT0gYTJbMF0gJiYgYTFbMV0gPT09IGEyWzFdID8gdW5kZWZpbmVkIDogYTE7XG59XG5mdW5jdGlvbiBfZ2V0SWZORTNEKGExLCBhMikge1xuICAgIHJldHVybiBhMVswXSA9PT0gYTJbMF0gJiYgYTFbMV0gPT09IGEyWzFdICYmIGExWzJdID09PSBhMlsyXSA/IHVuZGVmaW5lZCA6IGExO1xufVxuRmxvd0xheW91dE5vZGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChzZXQsIGRlZmF1bHRTaXplKSB7XG4gICAgaWYgKGRlZmF1bHRTaXplKSB7XG4gICAgICAgIHRoaXMuX3JlbW92aW5nID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX2ludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICB0aGlzLnNjcm9sbExlbmd0aCA9IHNldC5zY3JvbGxMZW5ndGg7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gdHJ1ZTtcbiAgICB2YXIgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMub3BhY2l0eTtcbiAgICB2YXIgdmFsdWUgPSBzZXQub3BhY2l0eSA9PT0gREVGQVVMVC5vcGFjaXR5ID8gdW5kZWZpbmVkIDogc2V0Lm9wYWNpdHk7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgfHwgcHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgX3NldFByb3BlcnR5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCAnb3BhY2l0eScsIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBbXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSwgREVGQVVMVC5vcGFjaXR5MkQpO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5hbGlnbjtcbiAgICB2YWx1ZSA9IHNldC5hbGlnbiA/IF9nZXRJZk5FMkQoc2V0LmFsaWduLCBERUZBVUxULmFsaWduKSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodmFsdWUgfHwgcHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgX3NldFByb3BlcnR5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCAnYWxpZ24nLCB2YWx1ZSwgREVGQVVMVC5hbGlnbik7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLm9yaWdpbjtcbiAgICB2YWx1ZSA9IHNldC5vcmlnaW4gPyBfZ2V0SWZORTJEKHNldC5vcmlnaW4sIERFRkFVTFQub3JpZ2luKSA6IHVuZGVmaW5lZDtcbiAgICBpZiAodmFsdWUgfHwgcHJvcCAmJiBwcm9wLmluaXQpIHtcbiAgICAgICAgX3NldFByb3BlcnR5VmFsdWUuY2FsbCh0aGlzLCBwcm9wLCAnb3JpZ2luJywgdmFsdWUsIERFRkFVTFQub3JpZ2luKTtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuc2l6ZTtcbiAgICB2YWx1ZSA9IHNldC5zaXplIHx8IGRlZmF1bHRTaXplO1xuICAgIGlmICh2YWx1ZSB8fCBwcm9wICYmIHByb3AuaW5pdCkge1xuICAgICAgICBfc2V0UHJvcGVydHlWYWx1ZS5jYWxsKHRoaXMsIHByb3AsICdzaXplJywgdmFsdWUsIGRlZmF1bHRTaXplLCB0aGlzLnVzZXNUcnVlU2l6ZSk7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLnRyYW5zbGF0ZTtcbiAgICB2YWx1ZSA9IHNldC50cmFuc2xhdGU7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3RyYW5zbGF0ZScsIHZhbHVlLCBERUZBVUxULnRyYW5zbGF0ZSwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICB9XG4gICAgcHJvcCA9IHRoaXMuX3Byb3BlcnRpZXMuc2NhbGU7XG4gICAgdmFsdWUgPSBzZXQuc2NhbGUgPyBfZ2V0SWZORTNEKHNldC5zY2FsZSwgREVGQVVMVC5zY2FsZSkgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3NjYWxlJywgdmFsdWUsIERFRkFVTFQuc2NhbGUpO1xuICAgIH1cbiAgICBwcm9wID0gdGhpcy5fcHJvcGVydGllcy5yb3RhdGU7XG4gICAgdmFsdWUgPSBzZXQucm90YXRlID8gX2dldElmTkUzRChzZXQucm90YXRlLCBERUZBVUxULnJvdGF0ZSkgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3JvdGF0ZScsIHZhbHVlLCBERUZBVUxULnJvdGF0ZSk7XG4gICAgfVxuICAgIHByb3AgPSB0aGlzLl9wcm9wZXJ0aWVzLnNrZXc7XG4gICAgdmFsdWUgPSBzZXQuc2tldyA/IF9nZXRJZk5FM0Qoc2V0LnNrZXcsIERFRkFVTFQuc2tldykgOiB1bmRlZmluZWQ7XG4gICAgaWYgKHZhbHVlIHx8IHByb3AgJiYgcHJvcC5pbml0KSB7XG4gICAgICAgIF9zZXRQcm9wZXJ0eVZhbHVlLmNhbGwodGhpcywgcHJvcCwgJ3NrZXcnLCB2YWx1ZSwgREVGQVVMVC5za2V3KTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBGbG93TGF5b3V0Tm9kZTsiLCJmdW5jdGlvbiBMYXlvdXRDb250ZXh0KG1ldGhvZHMpIHtcbiAgICBmb3IgKHZhciBuIGluIG1ldGhvZHMpIHtcbiAgICAgICAgdGhpc1tuXSA9IG1ldGhvZHNbbl07XG4gICAgfVxufVxuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUuc2l6ZSA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLmRpcmVjdGlvbiA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnNjcm9sbE9mZnNldCA9IHVuZGVmaW5lZDtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnNjcm9sbFN0YXJ0ID0gdW5kZWZpbmVkO1xuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUuc2Nyb2xsRW5kID0gdW5kZWZpbmVkO1xuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcbn07XG5MYXlvdXRDb250ZXh0LnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24gKCkge1xufTtcbkxheW91dENvbnRleHQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChub2RlKSB7XG59O1xuTGF5b3V0Q29udGV4dC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG5vZGUsIHNldCkge1xufTtcbkxheW91dENvbnRleHQucHJvdG90eXBlLnJlc29sdmVTaXplID0gZnVuY3Rpb24gKG5vZGUpIHtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IExheW91dENvbnRleHQ7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIEVudGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLkVudGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLkVudGl0eSA6IG51bGw7XG52YXIgVmlld1NlcXVlbmNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVmlld1NlcXVlbmNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuVmlld1NlcXVlbmNlIDogbnVsbDtcbnZhciBPcHRpb25zTWFuYWdlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLk9wdGlvbnNNYW5hZ2VyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuT3B0aW9uc01hbmFnZXIgOiBudWxsO1xudmFyIEV2ZW50SGFuZGxlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLkV2ZW50SGFuZGxlciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLkV2ZW50SGFuZGxlciA6IG51bGw7XG52YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4vTGF5b3V0VXRpbGl0eScpO1xudmFyIExheW91dE5vZGVNYW5hZ2VyID0gcmVxdWlyZSgnLi9MYXlvdXROb2RlTWFuYWdlcicpO1xudmFyIExheW91dE5vZGUgPSByZXF1aXJlKCcuL0xheW91dE5vZGUnKTtcbnZhciBGbG93TGF5b3V0Tm9kZSA9IHJlcXVpcmUoJy4vRmxvd0xheW91dE5vZGUnKTtcbnZhciBUcmFuc2Zvcm0gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiBudWxsO1xucmVxdWlyZSgnLi9oZWxwZXJzL0xheW91dERvY2tIZWxwZXInKTtcbmZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIob3B0aW9ucywgbm9kZU1hbmFnZXIpIHtcbiAgICB0aGlzLmlkID0gRW50aXR5LnJlZ2lzdGVyKHRoaXMpO1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2NvbnRleHRTaXplQ2FjaGUgPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xuICAgIHRoaXMuX2NvbW1pdE91dHB1dCA9IHt9O1xuICAgIHRoaXMuX2NsZWFudXBSZWdpc3RyYXRpb24gPSB7XG4gICAgICAgIGNvbW1pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYW51cDogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYW51cChjb250ZXh0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfTtcbiAgICB0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uLnRhcmdldCA9IEVudGl0eS5yZWdpc3Rlcih0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0O1xuICAgIH0uYmluZCh0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKTtcbiAgICB0aGlzLl9ldmVudElucHV0ID0gbmV3IEV2ZW50SGFuZGxlcigpO1xuICAgIEV2ZW50SGFuZGxlci5zZXRJbnB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRJbnB1dCk7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgRXZlbnRIYW5kbGVyLnNldE91dHB1dEhhbmRsZXIodGhpcywgdGhpcy5fZXZlbnRPdXRwdXQpO1xuICAgIHRoaXMuX2xheW91dCA9IHsgb3B0aW9uczogT2JqZWN0LmNyZWF0ZSh7fSkgfTtcbiAgICB0aGlzLl9sYXlvdXQub3B0aW9uc01hbmFnZXIgPSBuZXcgT3B0aW9uc01hbmFnZXIodGhpcy5fbGF5b3V0Lm9wdGlvbnMpO1xuICAgIHRoaXMuX2xheW91dC5vcHRpb25zTWFuYWdlci5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5jcmVhdGUoTGF5b3V0Q29udHJvbGxlci5ERUZBVUxUX09QVElPTlMpO1xuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyID0gbmV3IE9wdGlvbnNNYW5hZ2VyKHRoaXMub3B0aW9ucyk7XG4gICAgaWYgKG5vZGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX25vZGVzID0gbm9kZU1hbmFnZXI7XG4gICAgfSBlbHNlIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZmxvdykge1xuICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBMYXlvdXROb2RlTWFuYWdlcihGbG93TGF5b3V0Tm9kZSwgX2luaXRGbG93TGF5b3V0Tm9kZS5iaW5kKHRoaXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9ub2RlcyA9IG5ldyBMYXlvdXROb2RlTWFuYWdlcihMYXlvdXROb2RlKTtcbiAgICB9XG4gICAgdGhpcy5zZXREaXJlY3Rpb24odW5kZWZpbmVkKTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxufVxuTGF5b3V0Q29udHJvbGxlci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgZmxvdzogZmFsc2UsXG4gICAgZmxvd09wdGlvbnM6IHtcbiAgICAgICAgcmVmbG93T25SZXNpemU6IHRydWUsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IHRydWUsXG4gICAgICAgICAgICBhbGlnbjogdHJ1ZSxcbiAgICAgICAgICAgIG9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICAgIHNpemU6IHRydWUsXG4gICAgICAgICAgICB0cmFuc2xhdGU6IHRydWUsXG4gICAgICAgICAgICBza2V3OiB0cnVlLFxuICAgICAgICAgICAgcm90YXRlOiB0cnVlLFxuICAgICAgICAgICAgc2NhbGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgc3ByaW5nOiB7XG4gICAgICAgICAgICBkYW1waW5nUmF0aW86IDAuOCxcbiAgICAgICAgICAgIHBlcmlvZDogMzAwXG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX2luaXRGbG93TGF5b3V0Tm9kZShub2RlLCBzcGVjKSB7XG4gICAgaWYgKCFzcGVjICYmIHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucy5pbnNlcnRTcGVjKSB7XG4gICAgICAgIG5vZGUuc2V0U3BlYyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMuaW5zZXJ0U3BlYyk7XG4gICAgfVxufVxuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuYWxpZ25tZW50ICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5hbGlnbm1lbnQgIT09IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuX29wdGlvbnNNYW5hZ2VyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMubm9kZVNwcmluZykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ25vZGVTcHJpbmcgb3B0aW9ucyBoYXZlIGJlZW4gbW92ZWQgaW5zaWRlIGBmbG93T3B0aW9uc2AuIFVzZSBgZmxvd09wdGlvbnMuc3ByaW5nYCBpbnN0ZWFkLicpO1xuICAgICAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKHsgZmxvd09wdGlvbnM6IHsgc3ByaW5nOiBvcHRpb25zLm5vZGVTcHJpbmcgfSB9KTtcbiAgICAgICAgdGhpcy5fbm9kZXMuc2V0Tm9kZU9wdGlvbnModGhpcy5vcHRpb25zLmZsb3dPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucmVmbG93T25SZXNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3JlZmxvd09uUmVzaXplIG9wdGlvbnMgaGF2ZSBiZWVuIG1vdmVkIGluc2lkZSBgZmxvd09wdGlvbnNgLiBVc2UgYGZsb3dPcHRpb25zLnJlZmxvd09uUmVzaXplYCBpbnN0ZWFkLicpO1xuICAgICAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKHsgZmxvd09wdGlvbnM6IHsgcmVmbG93T25SZXNpemU6IG9wdGlvbnMucmVmbG93T25SZXNpemUgfSB9KTtcbiAgICAgICAgdGhpcy5fbm9kZXMuc2V0Tm9kZU9wdGlvbnModGhpcy5vcHRpb25zLmZsb3dPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuaW5zZXJ0U3BlYykge1xuICAgICAgICBjb25zb2xlLndhcm4oJ2luc2VydFNwZWMgb3B0aW9ucyBoYXZlIGJlZW4gbW92ZWQgaW5zaWRlIGBmbG93T3B0aW9uc2AuIFVzZSBgZmxvd09wdGlvbnMuaW5zZXJ0U3BlY2AgaW5zdGVhZC4nKTtcbiAgICAgICAgdGhpcy5fb3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucyh7IGZsb3dPcHRpb25zOiB7IGluc2VydFNwZWM6IG9wdGlvbnMuaW5zZXJ0U3BlYyB9IH0pO1xuICAgICAgICB0aGlzLl9ub2Rlcy5zZXROb2RlT3B0aW9ucyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5yZW1vdmVTcGVjKSB7XG4gICAgICAgIGNvbnNvbGUud2FybigncmVtb3ZlU3BlYyBvcHRpb25zIGhhdmUgYmVlbiBtb3ZlZCBpbnNpZGUgYGZsb3dPcHRpb25zYC4gVXNlIGBmbG93T3B0aW9ucy5yZW1vdmVTcGVjYCBpbnN0ZWFkLicpO1xuICAgICAgICB0aGlzLl9vcHRpb25zTWFuYWdlci5zZXRPcHRpb25zKHsgZmxvd09wdGlvbnM6IHsgcmVtb3ZlU3BlYzogb3B0aW9ucy5yZW1vdmVTcGVjIH0gfSk7XG4gICAgICAgIHRoaXMuX25vZGVzLnNldE5vZGVPcHRpb25zKHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucyk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmRhdGFTb3VyY2UpIHtcbiAgICAgICAgdGhpcy5zZXREYXRhU291cmNlKG9wdGlvbnMuZGF0YVNvdXJjZSk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxheW91dCkge1xuICAgICAgICB0aGlzLnNldExheW91dChvcHRpb25zLmxheW91dCwgb3B0aW9ucy5sYXlvdXRPcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMubGF5b3V0T3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldExheW91dE9wdGlvbnMob3B0aW9ucy5sYXlvdXRPcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZGlyZWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zZXREaXJlY3Rpb24ob3B0aW9ucy5kaXJlY3Rpb24pO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5mbG93T3B0aW9ucyAmJiB0aGlzLm9wdGlvbnMuZmxvdykge1xuICAgICAgICB0aGlzLl9ub2Rlcy5zZXROb2RlT3B0aW9ucyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5wcmVhbGxvY2F0ZU5vZGVzKSB7XG4gICAgICAgIHRoaXMuX25vZGVzLnByZWFsbG9jYXRlTm9kZXMob3B0aW9ucy5wcmVhbGxvY2F0ZU5vZGVzLmNvdW50IHx8IDAsIG9wdGlvbnMucHJlYWxsb2NhdGVOb2Rlcy5zcGVjKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuZnVuY3Rpb24gX2ZvckVhY2hSZW5kZXJhYmxlKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGFTb3VyY2UgPSB0aGlzLl9kYXRhU291cmNlO1xuICAgIGlmIChkYXRhU291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGogPSBkYXRhU291cmNlLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YVNvdXJjZVtpXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRhdGFTb3VyY2UgaW5zdGFuY2VvZiBWaWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIHJlbmRlcmFibGU7XG4gICAgICAgIHdoaWxlIChkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZW5kZXJhYmxlID0gZGF0YVNvdXJjZS5nZXQoKTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbGJhY2socmVuZGVyYWJsZSk7XG4gICAgICAgICAgICBkYXRhU291cmNlID0gZGF0YVNvdXJjZS5nZXROZXh0KCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YVNvdXJjZSkge1xuICAgICAgICAgICAgY2FsbGJhY2soZGF0YVNvdXJjZVtrZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldERhdGFTb3VyY2UgPSBmdW5jdGlvbiAoZGF0YVNvdXJjZSkge1xuICAgIHRoaXMuX2RhdGFTb3VyY2UgPSBkYXRhU291cmNlO1xuICAgIHRoaXMuX25vZGVzQnlJZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAoZGF0YVNvdXJjZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5ldyBWaWV3U2VxdWVuY2UoZGF0YVNvdXJjZSk7XG4gICAgfSBlbHNlIGlmIChkYXRhU291cmNlIGluc3RhbmNlb2YgVmlld1NlcXVlbmNlIHx8IGRhdGFTb3VyY2UuZ2V0TmV4dCkge1xuICAgICAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSBkYXRhU291cmNlO1xuICAgIH0gZWxzZSBpZiAoZGF0YVNvdXJjZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICB0aGlzLl9ub2Rlc0J5SWQgPSBkYXRhU291cmNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QaXBlRXZlbnRzKSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhU291cmNlLnBpcGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UucGlwZSh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UucGlwZSh0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZm9yRWFjaFJlbmRlcmFibGUuY2FsbCh0aGlzLCBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZW5kZXJhYmxlICYmIHJlbmRlcmFibGUucGlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJhYmxlLnBpcGUodGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmFibGUucGlwZSh0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXREYXRhU291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhU291cmNlO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnNldExheW91dCA9IGZ1bmN0aW9uIChsYXlvdXQsIG9wdGlvbnMpIHtcbiAgICBpZiAobGF5b3V0IGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbiA9IGxheW91dDtcbiAgICAgICAgdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcyA9IGxheW91dC5DYXBhYmlsaXRpZXM7XG4gICAgICAgIHRoaXMuX2xheW91dC5saXRlcmFsID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAobGF5b3V0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgIHRoaXMuX2xheW91dC5saXRlcmFsID0gbGF5b3V0O1xuICAgICAgICB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgaGVscGVyTmFtZSA9IE9iamVjdC5rZXlzKGxheW91dClbMF07XG4gICAgICAgIHZhciBIZWxwZXIgPSBMYXlvdXRVdGlsaXR5LmdldFJlZ2lzdGVyZWRIZWxwZXIoaGVscGVyTmFtZSk7XG4gICAgICAgIHRoaXMuX2xheW91dC5fZnVuY3Rpb24gPSBIZWxwZXIgPyBmdW5jdGlvbiAoY29udGV4dCwgb3B0aW9uczIpIHtcbiAgICAgICAgICAgIHZhciBoZWxwZXIgPSBuZXcgSGVscGVyKGNvbnRleHQsIG9wdGlvbnMyKTtcbiAgICAgICAgICAgIGhlbHBlci5wYXJzZShsYXlvdXRbaGVscGVyTmFtZV0pO1xuICAgICAgICB9IDogdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2xheW91dC5fZnVuY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX2xheW91dC5saXRlcmFsID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLnNldExheW91dE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuICAgIHRoaXMuc2V0RGlyZWN0aW9uKHRoaXMuX2NvbmZpZ3VyZWREaXJlY3Rpb24pO1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldExheW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbGF5b3V0LmxpdGVyYWwgfHwgdGhpcy5fbGF5b3V0Ll9mdW5jdGlvbjtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zZXRMYXlvdXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9sYXlvdXQub3B0aW9uc01hbmFnZXIuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXRMYXlvdXRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9sYXlvdXQub3B0aW9ucztcbn07XG5mdW5jdGlvbiBfZ2V0QWN0dWFsRGlyZWN0aW9uKGRpcmVjdGlvbikge1xuICAgIGlmICh0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzICYmIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLmRpcmVjdGlvbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLmRpcmVjdGlvbltpXSA9PT0gZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMuZGlyZWN0aW9uO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkaXJlY3Rpb24gPT09IHVuZGVmaW5lZCA/IFV0aWxpdHkuRGlyZWN0aW9uLlkgOiBkaXJlY3Rpb247XG59XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5zZXREaXJlY3Rpb24gPSBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgdGhpcy5fY29uZmlndXJlZERpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICB2YXIgbmV3RGlyZWN0aW9uID0gX2dldEFjdHVhbERpcmVjdGlvbi5jYWxsKHRoaXMsIGRpcmVjdGlvbik7XG4gICAgaWYgKG5ld0RpcmVjdGlvbiAhPT0gdGhpcy5fZGlyZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuX2RpcmVjdGlvbiA9IG5ld0RpcmVjdGlvbjtcbiAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgfVxufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLmdldERpcmVjdGlvbiA9IGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICByZXR1cm4gYWN0dWFsID8gdGhpcy5fZGlyZWN0aW9uIDogdGhpcy5fY29uZmlndXJlZERpcmVjdGlvbjtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXRTcGVjID0gZnVuY3Rpb24gKG5vZGUsIG5vcm1hbGl6ZSkge1xuICAgIGlmICghbm9kZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2Ygbm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9ub2Rlc0J5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IHRoaXMuX25vZGVzQnlJZFtub2RlXTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLl9zcGVjcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NwZWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc3BlYyA9IHRoaXMuX3NwZWNzW2ldO1xuICAgICAgICAgICAgaWYgKHNwZWMucmVuZGVyTm9kZSA9PT0gbm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemUgJiYgc3BlYy50cmFuc2Zvcm0gJiYgc3BlYy5zaXplICYmIChzcGVjLmFsaWduIHx8IHNwZWMub3JpZ2luKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gc3BlYy50cmFuc2Zvcm07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzcGVjLmFsaWduICYmIChzcGVjLmFsaWduWzBdIHx8IHNwZWMuYWxpZ25bMV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0udGhlbk1vdmUodHJhbnNmb3JtLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy5hbGlnblswXSAqIHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlYy5hbGlnblsxXSAqIHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMub3JpZ2luICYmIChzcGVjLm9yaWdpblswXSB8fCBzcGVjLm9yaWdpblsxXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybSA9IFRyYW5zZm9ybS5tb3ZlVGhlbihbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLXNwZWMub3JpZ2luWzBdICogc3BlYy5zaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1zcGVjLm9yaWdpblsxXSAqIHNwZWMuc2l6ZVsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICAgICAgICBdLCB0cmFuc2Zvcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBzcGVjLm9wYWNpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBzcGVjLnNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gc3BlYztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnJlZmxvd0xheW91dCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5yZXNldEZsb3dTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmZsb3cpIHtcbiAgICAgICAgdGhpcy5fcmVzZXRGbG93U3RhdGUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5pbnNlcnQgPSBmdW5jdGlvbiAoaW5kZXhPcklkLCByZW5kZXJhYmxlLCBpbnNlcnRTcGVjKSB7XG4gICAgaWYgKGluZGV4T3JJZCBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2YgaW5kZXhPcklkID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAodGhpcy5fZGF0YVNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRhU291cmNlID0ge307XG4gICAgICAgICAgICB0aGlzLl9ub2Rlc0J5SWQgPSB0aGlzLl9kYXRhU291cmNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9ub2Rlc0J5SWRbaW5kZXhPcklkXSA9PT0gcmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbm9kZXNCeUlkW2luZGV4T3JJZF0gPSByZW5kZXJhYmxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLl9kYXRhU291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFTb3VyY2UgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5ldyBWaWV3U2VxdWVuY2UodGhpcy5fZGF0YVNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGFTb3VyY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UgfHwgdGhpcy5fZGF0YVNvdXJjZTtcbiAgICAgICAgaWYgKGluZGV4T3JJZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2UucHVzaChyZW5kZXJhYmxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbmRleE9ySWQgPT09IDApIHtcbiAgICAgICAgICAgIGlmIChkYXRhU291cmNlID09PSB0aGlzLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlLnNwbGljZSgwLCAwLCByZW5kZXJhYmxlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLmdldEluZGV4KCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRWaWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFZpZXdTZXF1ZW5jZSAmJiBuZXh0Vmlld1NlcXVlbmNlLmdldCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSBuZXh0Vmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlLnNwbGljZSgwLCAwLCByZW5kZXJhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFTb3VyY2Uuc3BsaWNlKGluZGV4T3JJZCwgMCwgcmVuZGVyYWJsZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGluc2VydFNwZWMpIHtcbiAgICAgICAgdGhpcy5fbm9kZXMuaW5zZXJ0Tm9kZSh0aGlzLl9ub2Rlcy5jcmVhdGVOb2RlKHJlbmRlcmFibGUsIGluc2VydFNwZWMpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGlwZUV2ZW50cyAmJiByZW5kZXJhYmxlICYmIHJlbmRlcmFibGUucGlwZSkge1xuICAgICAgICByZW5kZXJhYmxlLnBpcGUodGhpcyk7XG4gICAgICAgIHJlbmRlcmFibGUucGlwZSh0aGlzLl9ldmVudE91dHB1dCk7XG4gICAgfVxuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAocmVuZGVyYWJsZSwgaW5zZXJ0U3BlYykge1xuICAgIHJldHVybiB0aGlzLmluc2VydCgtMSwgcmVuZGVyYWJsZSwgaW5zZXJ0U3BlYyk7XG59O1xuZnVuY3Rpb24gX2dldFZpZXdTZXF1ZW5jZUF0SW5kZXgoaW5kZXgsIHN0YXJ0Vmlld1NlcXVlbmNlKSB7XG4gICAgdmFyIHZpZXdTZXF1ZW5jZSA9IHN0YXJ0Vmlld1NlcXVlbmNlIHx8IHRoaXMuX3ZpZXdTZXF1ZW5jZTtcbiAgICB2YXIgaSA9IHZpZXdTZXF1ZW5jZSA/IHZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpIDogaW5kZXg7XG4gICAgaWYgKGluZGV4ID4gaSkge1xuICAgICAgICB3aGlsZSAodmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICB2aWV3U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgICAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpO1xuICAgICAgICAgICAgaWYgKGkgPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCBpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5kZXggPCBpKSB7XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgICAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IHZpZXdTZXF1ZW5jZS5nZXRJbmRleCgpO1xuICAgICAgICAgICAgaWYgKGkgPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPiBpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmlld1NlcXVlbmNlO1xufVxuZnVuY3Rpb24gX2dldERhdGFTb3VyY2VBcnJheSgpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9kYXRhU291cmNlKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVNvdXJjZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXdTZXF1ZW5jZSB8fCB0aGlzLl92aWV3U2VxdWVuY2UuXykge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmlld1NlcXVlbmNlLl8uYXJyYXk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoaW5kZXhPcklkKSB7XG4gICAgaWYgKHRoaXMuX25vZGVzQnlJZCB8fCBpbmRleE9ySWQgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdHlwZW9mIGluZGV4T3JJZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25vZGVzQnlJZFtpbmRleE9ySWRdO1xuICAgIH1cbiAgICB2YXIgdmlld1NlcXVlbmNlID0gX2dldFZpZXdTZXF1ZW5jZUF0SW5kZXguY2FsbCh0aGlzLCBpbmRleE9ySWQpO1xuICAgIHJldHVybiB2aWV3U2VxdWVuY2UgPyB2aWV3U2VxdWVuY2UuZ2V0KCkgOiB1bmRlZmluZWQ7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc3dhcCA9IGZ1bmN0aW9uIChpbmRleCwgaW5kZXgyKSB7XG4gICAgdmFyIGFycmF5ID0gX2dldERhdGFTb3VyY2VBcnJheS5jYWxsKHRoaXMpO1xuICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgdGhyb3cgJy5zd2FwIGlzIG9ubHkgc3VwcG9ydGVkIGZvciBkYXRhU291cmNlcyBvZiB0eXBlIEFycmF5IG9yIFZpZXdTZXF1ZW5jZSc7XG4gICAgfVxuICAgIGlmIChpbmRleCA9PT0gaW5kZXgyKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IGFycmF5Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyAnSW52YWxpZCBpbmRleCAoJyArIGluZGV4ICsgJykgc3BlY2lmaWVkIHRvIC5zd2FwJztcbiAgICB9XG4gICAgaWYgKGluZGV4MiA8IDAgfHwgaW5kZXgyID49IGFycmF5Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyAnSW52YWxpZCBzZWNvbmQgaW5kZXggKCcgKyBpbmRleDIgKyAnKSBzcGVjaWZpZWQgdG8gLnN3YXAnO1xuICAgIH1cbiAgICB2YXIgcmVuZGVyTm9kZSA9IGFycmF5W2luZGV4XTtcbiAgICBhcnJheVtpbmRleF0gPSBhcnJheVtpbmRleDJdO1xuICAgIGFycmF5W2luZGV4Ml0gPSByZW5kZXJOb2RlO1xuICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiAoaW5kZXhPcklkLCByZW5kZXJhYmxlKSB7XG4gICAgdmFyIG9sZFJlbmRlcmFibGU7XG4gICAgaWYgKHRoaXMuX25vZGVzQnlJZCB8fCBpbmRleE9ySWQgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdHlwZW9mIGluZGV4T3JJZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb2xkUmVuZGVyYWJsZSA9IHRoaXMuX25vZGVzQnlJZFtpbmRleE9ySWRdO1xuICAgICAgICBpZiAob2xkUmVuZGVyYWJsZSAhPT0gcmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgdGhpcy5fbm9kZXNCeUlkW2luZGV4T3JJZF0gPSByZW5kZXJhYmxlO1xuICAgICAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9sZFJlbmRlcmFibGU7XG4gICAgfVxuICAgIHZhciBhcnJheSA9IF9nZXREYXRhU291cmNlQXJyYXkuY2FsbCh0aGlzKTtcbiAgICBpZiAoIWFycmF5KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChpbmRleE9ySWQgPCAwIHx8IGluZGV4T3JJZCA+PSBhcnJheS5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgJ0ludmFsaWQgaW5kZXggKCcgKyBpbmRleE9ySWQgKyAnKSBzcGVjaWZpZWQgdG8gLnJlcGxhY2UnO1xuICAgIH1cbiAgICBvbGRSZW5kZXJhYmxlID0gYXJyYXlbaW5kZXhPcklkXTtcbiAgICBpZiAob2xkUmVuZGVyYWJsZSAhPT0gcmVuZGVyYWJsZSkge1xuICAgICAgICBhcnJheVtpbmRleE9ySWRdID0gcmVuZGVyYWJsZTtcbiAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBvbGRSZW5kZXJhYmxlO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbiAoaW5kZXgsIG5ld0luZGV4KSB7XG4gICAgdmFyIGFycmF5ID0gX2dldERhdGFTb3VyY2VBcnJheS5jYWxsKHRoaXMpO1xuICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgdGhyb3cgJy5tb3ZlIGlzIG9ubHkgc3VwcG9ydGVkIGZvciBkYXRhU291cmNlcyBvZiB0eXBlIEFycmF5IG9yIFZpZXdTZXF1ZW5jZSc7XG4gICAgfVxuICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHRocm93ICdJbnZhbGlkIGluZGV4ICgnICsgaW5kZXggKyAnKSBzcGVjaWZpZWQgdG8gLm1vdmUnO1xuICAgIH1cbiAgICBpZiAobmV3SW5kZXggPCAwIHx8IG5ld0luZGV4ID49IGFycmF5Lmxlbmd0aCkge1xuICAgICAgICB0aHJvdyAnSW52YWxpZCBuZXdJbmRleCAoJyArIG5ld0luZGV4ICsgJykgc3BlY2lmaWVkIHRvIC5tb3ZlJztcbiAgICB9XG4gICAgdmFyIGl0ZW0gPSBhcnJheS5zcGxpY2UoaW5kZXgsIDEpWzBdO1xuICAgIGFycmF5LnNwbGljZShuZXdJbmRleCwgMCwgaXRlbSk7XG4gICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGluZGV4T3JJZCwgcmVtb3ZlU3BlYykge1xuICAgIHZhciByZW5kZXJOb2RlO1xuICAgIGlmICh0aGlzLl9ub2Rlc0J5SWQgfHwgaW5kZXhPcklkIGluc3RhbmNlb2YgU3RyaW5nIHx8IHR5cGVvZiBpbmRleE9ySWQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChpbmRleE9ySWQgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdHlwZW9mIGluZGV4T3JJZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJlbmRlck5vZGUgPSB0aGlzLl9ub2Rlc0J5SWRbaW5kZXhPcklkXTtcbiAgICAgICAgICAgIGlmIChyZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX25vZGVzQnlJZFtpbmRleE9ySWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuX25vZGVzQnlJZCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9ub2Rlc0J5SWRba2V5XSA9PT0gaW5kZXhPcklkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ub2Rlc0J5SWRba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTm9kZSA9IGluZGV4T3JJZDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChpbmRleE9ySWQgaW5zdGFuY2VvZiBOdW1iZXIgfHwgdHlwZW9mIGluZGV4T3JJZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gX2dldERhdGFTb3VyY2VBcnJheS5jYWxsKHRoaXMpO1xuICAgICAgICBpZiAoIWFycmF5IHx8IGluZGV4T3JJZCA8IDAgfHwgaW5kZXhPcklkID49IGFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgaW5kZXggKCcgKyBpbmRleE9ySWQgKyAnKSBzcGVjaWZpZWQgdG8gLnJlbW92ZSAob3IgZGF0YVNvdXJjZSBkb2VzblxcJ3Qgc3VwcG9ydCByZW1vdmUpJztcbiAgICAgICAgfVxuICAgICAgICByZW5kZXJOb2RlID0gYXJyYXlbaW5kZXhPcklkXTtcbiAgICAgICAgdGhpcy5fZGF0YVNvdXJjZS5zcGxpY2UoaW5kZXhPcklkLCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleE9ySWQgPSB0aGlzLl9kYXRhU291cmNlLmluZGV4T2YoaW5kZXhPcklkKTtcbiAgICAgICAgaWYgKGluZGV4T3JJZCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRhU291cmNlLnNwbGljZShpbmRleE9ySWQsIDEpO1xuICAgICAgICAgICAgcmVuZGVyTm9kZSA9IGluZGV4T3JJZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlICYmIHJlbmRlck5vZGUpIHtcbiAgICAgICAgdmFyIHZpZXdTZXF1ZW5jZSA9IF9nZXRWaWV3U2VxdWVuY2VBdEluZGV4LmNhbGwodGhpcywgdGhpcy5fdmlld1NlcXVlbmNlLmdldEluZGV4KCksIHRoaXMuX2RhdGFTb3VyY2UpO1xuICAgICAgICB2aWV3U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2UgfHwgX2dldFZpZXdTZXF1ZW5jZUF0SW5kZXguY2FsbCh0aGlzLCB0aGlzLl92aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSAtIDEsIHRoaXMuX2RhdGFTb3VyY2UpO1xuICAgICAgICB2aWV3U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2UgfHwgdGhpcy5fZGF0YVNvdXJjZTtcbiAgICAgICAgdGhpcy5fdmlld1NlcXVlbmNlID0gdmlld1NlcXVlbmNlO1xuICAgIH1cbiAgICBpZiAocmVuZGVyTm9kZSAmJiByZW1vdmVTcGVjKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0Tm9kZUJ5UmVuZGVyTm9kZShyZW5kZXJOb2RlKTtcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlKHJlbW92ZVNwZWMgfHwgdGhpcy5vcHRpb25zLmZsb3dPcHRpb25zLnJlbW92ZVNwZWMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChyZW5kZXJOb2RlKSB7XG4gICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVuZGVyTm9kZTtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5yZW1vdmVBbGwgPSBmdW5jdGlvbiAocmVtb3ZlU3BlYykge1xuICAgIGlmICh0aGlzLl9ub2Rlc0J5SWQpIHtcbiAgICAgICAgdmFyIGRpcnR5ID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLl9ub2Rlc0J5SWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ub2Rlc0J5SWRba2V5XTtcbiAgICAgICAgICAgIGRpcnR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlydHkpIHtcbiAgICAgICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9kYXRhU291cmNlKSB7XG4gICAgICAgIHRoaXMuc2V0RGF0YVNvdXJjZShbXSk7XG4gICAgfVxuICAgIGlmIChyZW1vdmVTcGVjKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSgpO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmUocmVtb3ZlU3BlYyB8fCB0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMucmVtb3ZlU3BlYyk7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9zaXplIHx8IHRoaXMub3B0aW9ucy5zaXplO1xufTtcbkxheW91dENvbnRyb2xsZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5pZDtcbn07XG5MYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5jb21taXQgPSBmdW5jdGlvbiBjb21taXQoY29udGV4dCkge1xuICAgIHZhciB0cmFuc2Zvcm0gPSBjb250ZXh0LnRyYW5zZm9ybTtcbiAgICB2YXIgb3JpZ2luID0gY29udGV4dC5vcmlnaW47XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgdmFyIG9wYWNpdHkgPSBjb250ZXh0Lm9wYWNpdHk7XG4gICAgaWYgKHRoaXMuX3Jlc2V0Rmxvd1N0YXRlKSB7XG4gICAgICAgIHRoaXMuX3Jlc2V0Rmxvd1N0YXRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lzRGlydHkgPSB0cnVlO1xuICAgICAgICB0aGlzLl9ub2Rlcy5yZW1vdmVBbGwoKTtcbiAgICB9XG4gICAgaWYgKHNpemVbMF0gIT09IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMF0gfHwgc2l6ZVsxXSAhPT0gdGhpcy5fY29udGV4dFNpemVDYWNoZVsxXSB8fCB0aGlzLl9pc0RpcnR5IHx8IHRoaXMuX25vZGVzLl90cnVlU2l6ZVJlcXVlc3RlZCB8fCB0aGlzLm9wdGlvbnMuYWx3YXlzTGF5b3V0KSB7XG4gICAgICAgIHZhciBldmVudERhdGEgPSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgICAgIG9sZFNpemU6IHRoaXMuX2NvbnRleHRTaXplQ2FjaGUsXG4gICAgICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICBkaXJ0eTogdGhpcy5faXNEaXJ0eSxcbiAgICAgICAgICAgICAgICB0cnVlU2l6ZVJlcXVlc3RlZDogdGhpcy5fbm9kZXMuX3RydWVTaXplUmVxdWVzdGVkXG4gICAgICAgICAgICB9O1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdsYXlvdXRzdGFydCcsIGV2ZW50RGF0YSk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZmxvdykge1xuICAgICAgICAgICAgdmFyIGxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLmZsb3dPcHRpb25zLnJlZmxvd09uUmVzaXplKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0RpcnR5ICYmIChzaXplWzBdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzBdIHx8IHNpemVbMV0gIT09IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2sgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxvY2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSgpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUucmVsZWFzZUxvY2sobG9jayk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzBdID0gc2l6ZVswXTtcbiAgICAgICAgdGhpcy5fY29udGV4dFNpemVDYWNoZVsxXSA9IHNpemVbMV07XG4gICAgICAgIHRoaXMuX2lzRGlydHkgPSBmYWxzZTtcbiAgICAgICAgdmFyIHNjcm9sbEVuZDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaXplICYmIHRoaXMub3B0aW9ucy5zaXplW3RoaXMuX2RpcmVjdGlvbl0gPT09IHRydWUpIHtcbiAgICAgICAgICAgIHNjcm9sbEVuZCA9IDEwMDAwMDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxheW91dENvbnRleHQgPSB0aGlzLl9ub2Rlcy5wcmVwYXJlRm9yTGF5b3V0KHRoaXMuX3ZpZXdTZXF1ZW5jZSwgdGhpcy5fbm9kZXNCeUlkLCB7XG4gICAgICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcmVjdGlvbixcbiAgICAgICAgICAgICAgICBzY3JvbGxFbmQ6IHNjcm9sbEVuZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLl9sYXlvdXQuX2Z1bmN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLl9sYXlvdXQuX2Z1bmN0aW9uKGxheW91dENvbnRleHQsIHRoaXMuX2xheW91dC5vcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9ub2Rlcy5yZW1vdmVOb25JbnZhbGlkYXRlZE5vZGVzKHRoaXMub3B0aW9ucy5mbG93T3B0aW9ucy5yZW1vdmVTcGVjKTtcbiAgICAgICAgdGhpcy5fbm9kZXMucmVtb3ZlVmlydHVhbFZpZXdTZXF1ZW5jZU5vZGVzKCk7XG4gICAgICAgIGlmIChzY3JvbGxFbmQpIHtcbiAgICAgICAgICAgIHNjcm9sbEVuZCA9IDA7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSgpO1xuICAgICAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5faW52YWxpZGF0ZWQgJiYgbm9kZS5zY3JvbGxMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRW5kICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX3NpemUgPSB0aGlzLl9zaXplIHx8IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICB0aGlzLl9zaXplWzBdID0gdGhpcy5vcHRpb25zLnNpemVbMF07XG4gICAgICAgICAgICB0aGlzLl9zaXplWzFdID0gdGhpcy5vcHRpb25zLnNpemVbMV07XG4gICAgICAgICAgICB0aGlzLl9zaXplW3RoaXMuX2RpcmVjdGlvbl0gPSBzY3JvbGxFbmQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX25vZGVzLmJ1aWxkU3BlY0FuZERlc3Ryb3lVbnJlbmRlcmVkTm9kZXMoKTtcbiAgICAgICAgdGhpcy5fc3BlY3MgPSByZXN1bHQuc3BlY3M7XG4gICAgICAgIHRoaXMuX2NvbW1pdE91dHB1dC50YXJnZXQgPSByZXN1bHQuc3BlY3M7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2xheW91dGVuZCcsIGV2ZW50RGF0YSk7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlZmxvdycsIHsgdGFyZ2V0OiB0aGlzIH0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZsb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gdGhpcy5fbm9kZXMuYnVpbGRTcGVjQW5kRGVzdHJveVVucmVuZGVyZWROb2RlcygpO1xuICAgICAgICB0aGlzLl9zcGVjcyA9IHJlc3VsdC5zcGVjcztcbiAgICAgICAgdGhpcy5fY29tbWl0T3V0cHV0LnRhcmdldCA9IHJlc3VsdC5zcGVjcztcbiAgICAgICAgaWYgKHJlc3VsdC5tb2RpZmllZCkge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgncmVmbG93JywgeyB0YXJnZXQ6IHRoaXMgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIHRhcmdldCA9IHRoaXMuX2NvbW1pdE91dHB1dC50YXJnZXQ7XG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSB0YXJnZXQubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG4gICAgICAgIGlmICh0YXJnZXRbaV0ucmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgdGFyZ2V0W2ldLnRhcmdldCA9IHRhcmdldFtpXS5yZW5kZXJOb2RlLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghdGFyZ2V0Lmxlbmd0aCB8fCB0YXJnZXRbdGFyZ2V0Lmxlbmd0aCAtIDFdICE9PSB0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKSB7XG4gICAgICAgIHRhcmdldC5wdXNoKHRoaXMuX2NsZWFudXBSZWdpc3RyYXRpb24pO1xuICAgIH1cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW5bMF0gIT09IDAgfHwgb3JpZ2luWzFdICE9PSAwKSkge1xuICAgICAgICB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0ubW92ZVRoZW4oW1xuICAgICAgICAgICAgLXNpemVbMF0gKiBvcmlnaW5bMF0sXG4gICAgICAgICAgICAtc2l6ZVsxXSAqIG9yaWdpblsxXSxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSwgdHJhbnNmb3JtKTtcbiAgICB9XG4gICAgdGhpcy5fY29tbWl0T3V0cHV0LnNpemUgPSBzaXplO1xuICAgIHRoaXMuX2NvbW1pdE91dHB1dC5vcGFjaXR5ID0gb3BhY2l0eTtcbiAgICB0aGlzLl9jb21taXRPdXRwdXQudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuICAgIHJldHVybiB0aGlzLl9jb21taXRPdXRwdXQ7XG59O1xuTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuY2xlYW51cCA9IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5mbG93KSB7XG4gICAgICAgIHRoaXMuX3Jlc2V0Rmxvd1N0YXRlID0gdHJ1ZTtcbiAgICB9XG59O1xubW9kdWxlLmV4cG9ydHMgPSBMYXlvdXRDb250cm9sbGVyOyIsInZhciBUcmFuc2Zvcm0gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5UcmFuc2Zvcm0gOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbmZ1bmN0aW9uIExheW91dE5vZGUocmVuZGVyTm9kZSwgc3BlYykge1xuICAgIHRoaXMucmVuZGVyTm9kZSA9IHJlbmRlck5vZGU7XG4gICAgdGhpcy5fc3BlYyA9IHNwZWMgPyBMYXlvdXRVdGlsaXR5LmNsb25lU3BlYyhzcGVjKSA6IHt9O1xuICAgIHRoaXMuX3NwZWMucmVuZGVyTm9kZSA9IHJlbmRlck5vZGU7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9pbnZhbGlkYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3JlbW92aW5nID0gZmFsc2U7XG59XG5MYXlvdXROb2RlLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbn07XG5MYXlvdXROb2RlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zcGVjLnJlbmRlck5vZGUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fdmlld1NlcXVlbmNlID0gdW5kZWZpbmVkO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2ludmFsaWRhdGVkID0gZmFsc2U7XG4gICAgdGhpcy50cnVlU2l6ZVJlcXVlc3RlZCA9IGZhbHNlO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnNldFNwZWMgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHRoaXMuX3NwZWNNb2RpZmllZCA9IHRydWU7XG4gICAgaWYgKHNwZWMuYWxpZ24pIHtcbiAgICAgICAgaWYgKCFzcGVjLmFsaWduKSB7XG4gICAgICAgICAgICB0aGlzLl9zcGVjLmFsaWduID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zcGVjLmFsaWduWzBdID0gc3BlYy5hbGlnblswXTtcbiAgICAgICAgdGhpcy5fc3BlYy5hbGlnblsxXSA9IHNwZWMuYWxpZ25bMV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc3BlYy5hbGlnbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNwZWMub3JpZ2luKSB7XG4gICAgICAgIGlmICghc3BlYy5vcmlnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuX3NwZWMub3JpZ2luID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zcGVjLm9yaWdpblswXSA9IHNwZWMub3JpZ2luWzBdO1xuICAgICAgICB0aGlzLl9zcGVjLm9yaWdpblsxXSA9IHNwZWMub3JpZ2luWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NwZWMub3JpZ2luID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoc3BlYy5zaXplKSB7XG4gICAgICAgIGlmICghc3BlYy5zaXplKSB7XG4gICAgICAgICAgICB0aGlzLl9zcGVjLnNpemUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3NwZWMuc2l6ZVswXSA9IHNwZWMuc2l6ZVswXTtcbiAgICAgICAgdGhpcy5fc3BlYy5zaXplWzFdID0gc3BlYy5zaXplWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NwZWMuc2l6ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNwZWMudHJhbnNmb3JtKSB7XG4gICAgICAgIGlmICghc3BlYy50cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtID0gc3BlYy50cmFuc2Zvcm0uc2xpY2UoMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDE2OyBpKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zcGVjLnRyYW5zZm9ybVtpXSA9IHNwZWMudHJhbnNmb3JtW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc3BlYy50cmFuc2Zvcm0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuX3NwZWMub3BhY2l0eSA9IHNwZWMub3BhY2l0eTtcbn07XG5MYXlvdXROb2RlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoc2V0LCBzaXplKSB7XG4gICAgdGhpcy5faW52YWxpZGF0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3NwZWNNb2RpZmllZCA9IHRydWU7XG4gICAgdGhpcy5fcmVtb3ZpbmcgPSBmYWxzZTtcbiAgICB2YXIgc3BlYyA9IHRoaXMuX3NwZWM7XG4gICAgc3BlYy5vcGFjaXR5ID0gc2V0Lm9wYWNpdHk7XG4gICAgaWYgKHNldC5zaXplKSB7XG4gICAgICAgIGlmICghc3BlYy5zaXplKSB7XG4gICAgICAgICAgICBzcGVjLnNpemUgPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHNwZWMuc2l6ZVswXSA9IHNldC5zaXplWzBdO1xuICAgICAgICBzcGVjLnNpemVbMV0gPSBzZXQuc2l6ZVsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLnNpemUgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChzZXQub3JpZ2luKSB7XG4gICAgICAgIGlmICghc3BlYy5vcmlnaW4pIHtcbiAgICAgICAgICAgIHNwZWMub3JpZ2luID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgICAgICBzcGVjLm9yaWdpblswXSA9IHNldC5vcmlnaW5bMF07XG4gICAgICAgIHNwZWMub3JpZ2luWzFdID0gc2V0Lm9yaWdpblsxXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzcGVjLm9yaWdpbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNldC5hbGlnbikge1xuICAgICAgICBpZiAoIXNwZWMuYWxpZ24pIHtcbiAgICAgICAgICAgIHNwZWMuYWxpZ24gPSBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgICAgIHNwZWMuYWxpZ25bMF0gPSBzZXQuYWxpZ25bMF07XG4gICAgICAgIHNwZWMuYWxpZ25bMV0gPSBzZXQuYWxpZ25bMV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3BlYy5hbGlnbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHNldC5za2V3IHx8IHNldC5yb3RhdGUgfHwgc2V0LnNjYWxlKSB7XG4gICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLmJ1aWxkKHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogc2V0LnRyYW5zbGF0ZSB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBza2V3OiBzZXQuc2tldyB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzY2FsZTogc2V0LnNjYWxlIHx8IFtcbiAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJvdGF0ZTogc2V0LnJvdGF0ZSB8fCBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChzZXQudHJhbnNsYXRlKSB7XG4gICAgICAgIHRoaXMuX3NwZWMudHJhbnNmb3JtID0gVHJhbnNmb3JtLnRyYW5zbGF0ZShzZXQudHJhbnNsYXRlWzBdLCBzZXQudHJhbnNsYXRlWzFdLCBzZXQudHJhbnNsYXRlWzJdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zcGVjLnRyYW5zZm9ybSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5zY3JvbGxMZW5ndGggPSBzZXQuc2Nyb2xsTGVuZ3RoO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLmdldFNwZWMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fc3BlY01vZGlmaWVkID0gZmFsc2U7XG4gICAgdGhpcy5fc3BlYy5yZW1vdmVkID0gIXRoaXMuX2ludmFsaWRhdGVkO1xuICAgIHJldHVybiB0aGlzLl9zcGVjO1xufTtcbkxheW91dE5vZGUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChyZW1vdmVTcGVjKSB7XG4gICAgdGhpcy5fcmVtb3ZpbmcgPSB0cnVlO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0Tm9kZTsiLCJ2YXIgTGF5b3V0Q29udGV4dCA9IHJlcXVpcmUoJy4vTGF5b3V0Q29udGV4dCcpO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuL0xheW91dFV0aWxpdHknKTtcbnZhciBNQVhfUE9PTF9TSVpFID0gMTAwO1xuZnVuY3Rpb24gTGF5b3V0Tm9kZU1hbmFnZXIoTGF5b3V0Tm9kZSwgaW5pdExheW91dE5vZGVGbikge1xuICAgIHRoaXMuTGF5b3V0Tm9kZSA9IExheW91dE5vZGU7XG4gICAgdGhpcy5faW5pdExheW91dE5vZGVGbiA9IGluaXRMYXlvdXROb2RlRm47XG4gICAgdGhpcy5fbGF5b3V0Q291bnQgPSAwO1xuICAgIHRoaXMuX2NvbnRleHQgPSBuZXcgTGF5b3V0Q29udGV4dCh7XG4gICAgICAgIG5leHQ6IF9jb250ZXh0TmV4dC5iaW5kKHRoaXMpLFxuICAgICAgICBwcmV2OiBfY29udGV4dFByZXYuYmluZCh0aGlzKSxcbiAgICAgICAgZ2V0OiBfY29udGV4dEdldC5iaW5kKHRoaXMpLFxuICAgICAgICBzZXQ6IF9jb250ZXh0U2V0LmJpbmQodGhpcyksXG4gICAgICAgIHJlc29sdmVTaXplOiBfY29udGV4dFJlc29sdmVTaXplLmJpbmQodGhpcyksXG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICB0aGlzLl9jb250ZXh0U3RhdGUgPSB7fTtcbiAgICB0aGlzLl9wb29sID0ge1xuICAgICAgICBsYXlvdXROb2RlczogeyBzaXplOiAwIH0sXG4gICAgICAgIHJlc29sdmVTaXplOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdXG4gICAgfTtcbn1cbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5wcmVwYXJlRm9yTGF5b3V0ID0gZnVuY3Rpb24gKHZpZXdTZXF1ZW5jZSwgbm9kZXNCeUlkLCBjb250ZXh0RGF0YSkge1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5yZXNldCgpO1xuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgdmFyIGNvbnRleHQgPSB0aGlzLl9jb250ZXh0O1xuICAgIHRoaXMuX2xheW91dENvdW50Kys7XG4gICAgdGhpcy5fbm9kZXNCeUlkID0gbm9kZXNCeUlkO1xuICAgIHRoaXMuX3RydWVTaXplUmVxdWVzdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcmVldmFsVHJ1ZVNpemUgPSBjb250ZXh0RGF0YS5yZWV2YWxUcnVlU2l6ZSB8fCAhY29udGV4dC5zaXplIHx8IGNvbnRleHQuc2l6ZVswXSAhPT0gY29udGV4dERhdGEuc2l6ZVswXSB8fCBjb250ZXh0LnNpemVbMV0gIT09IGNvbnRleHREYXRhLnNpemVbMV07XG4gICAgdmFyIGNvbnRleHRTdGF0ZSA9IHRoaXMuX2NvbnRleHRTdGF0ZTtcbiAgICBjb250ZXh0U3RhdGUuc3RhcnRTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZTtcbiAgICBjb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlID0gdmlld1NlcXVlbmNlO1xuICAgIGNvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UgPSB2aWV3U2VxdWVuY2U7XG4gICAgY29udGV4dFN0YXRlLnN0YXJ0ID0gdW5kZWZpbmVkO1xuICAgIGNvbnRleHRTdGF0ZS5uZXh0R2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5wcmV2R2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5uZXh0U2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5wcmV2U2V0SW5kZXggPSAwO1xuICAgIGNvbnRleHRTdGF0ZS5hZGRDb3VudCA9IDA7XG4gICAgY29udGV4dFN0YXRlLnJlbW92ZUNvdW50ID0gMDtcbiAgICBjb250ZXh0U3RhdGUubGFzdFJlbmRlck5vZGUgPSB1bmRlZmluZWQ7XG4gICAgY29udGV4dC5zaXplWzBdID0gY29udGV4dERhdGEuc2l6ZVswXTtcbiAgICBjb250ZXh0LnNpemVbMV0gPSBjb250ZXh0RGF0YS5zaXplWzFdO1xuICAgIGNvbnRleHQuZGlyZWN0aW9uID0gY29udGV4dERhdGEuZGlyZWN0aW9uO1xuICAgIGNvbnRleHQucmV2ZXJzZSA9IGNvbnRleHREYXRhLnJldmVyc2U7XG4gICAgY29udGV4dC5hbGlnbm1lbnQgPSBjb250ZXh0RGF0YS5yZXZlcnNlID8gMSA6IDA7XG4gICAgY29udGV4dC5zY3JvbGxPZmZzZXQgPSBjb250ZXh0RGF0YS5zY3JvbGxPZmZzZXQgfHwgMDtcbiAgICBjb250ZXh0LnNjcm9sbFN0YXJ0ID0gY29udGV4dERhdGEuc2Nyb2xsU3RhcnQgfHwgMDtcbiAgICBjb250ZXh0LnNjcm9sbEVuZCA9IGNvbnRleHREYXRhLnNjcm9sbEVuZCB8fCBjb250ZXh0LnNpemVbY29udGV4dC5kaXJlY3Rpb25dO1xuICAgIHJldHVybiBjb250ZXh0O1xufTtcbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5yZW1vdmVOb25JbnZhbGlkYXRlZE5vZGVzID0gZnVuY3Rpb24gKHJlbW92ZVNwZWMpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX2ZpcnN0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS5faW52YWxpZGF0ZWQgJiYgIW5vZGUuX3JlbW92aW5nKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZShyZW1vdmVTcGVjKTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLnJlbW92ZVZpcnR1YWxWaWV3U2VxdWVuY2VOb2RlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0U2VxdWVuY2UgJiYgdGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0U2VxdWVuY2UuY2xlYW51cCkge1xuICAgICAgICB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnRTZXF1ZW5jZS5jbGVhbnVwKCk7XG4gICAgfVxufTtcbkxheW91dE5vZGVNYW5hZ2VyLnByb3RvdHlwZS5idWlsZFNwZWNBbmREZXN0cm95VW5yZW5kZXJlZE5vZGVzID0gZnVuY3Rpb24gKHRyYW5zbGF0ZSkge1xuICAgIHZhciBzcGVjcyA9IFtdO1xuICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgICAgICBzcGVjczogc3BlY3MsXG4gICAgICAgICAgICBtb2RpZmllZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX2ZpcnN0O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIHZhciBtb2RpZmllZCA9IG5vZGUuX3NwZWNNb2RpZmllZDtcbiAgICAgICAgdmFyIHNwZWMgPSBub2RlLmdldFNwZWMoKTtcbiAgICAgICAgaWYgKHNwZWMucmVtb3ZlZCkge1xuICAgICAgICAgICAgdmFyIGRlc3Ryb3lOb2RlID0gbm9kZTtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgICAgICAgICAgX2Rlc3Ryb3lOb2RlLmNhbGwodGhpcywgZGVzdHJveU5vZGUpO1xuICAgICAgICAgICAgcmVzdWx0Lm1vZGlmaWVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtb2RpZmllZCkge1xuICAgICAgICAgICAgICAgIGlmIChzcGVjLnRyYW5zZm9ybSAmJiB0cmFuc2xhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm1bMTJdICs9IHRyYW5zbGF0ZVswXTtcbiAgICAgICAgICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm1bMTNdICs9IHRyYW5zbGF0ZVsxXTtcbiAgICAgICAgICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm1bMTRdICs9IHRyYW5zbGF0ZVsyXTtcbiAgICAgICAgICAgICAgICAgICAgc3BlYy50cmFuc2Zvcm1bMTJdID0gTWF0aC5yb3VuZChzcGVjLnRyYW5zZm9ybVsxMl0gKiAxMDAwMDApIC8gMTAwMDAwO1xuICAgICAgICAgICAgICAgICAgICBzcGVjLnRyYW5zZm9ybVsxM10gPSBNYXRoLnJvdW5kKHNwZWMudHJhbnNmb3JtWzEzXSAqIDEwMDAwMCkgLyAxMDAwMDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdC5tb2RpZmllZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzcGVjcy5wdXNoKHNwZWMpO1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fY29udGV4dFN0YXRlLmFkZENvdW50ID0gMDtcbiAgICB0aGlzLl9jb250ZXh0U3RhdGUucmVtb3ZlQ291bnQgPSAwO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLmdldE5vZGVCeVJlbmRlck5vZGUgPSBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUucmVuZGVyTm9kZSA9PT0gcmVuZGVyYWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLmluc2VydE5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgIG5vZGUuX25leHQgPSB0aGlzLl9maXJzdDtcbiAgICBpZiAodGhpcy5fZmlyc3QpIHtcbiAgICAgICAgdGhpcy5fZmlyc3QuX3ByZXYgPSBub2RlO1xuICAgIH1cbiAgICB0aGlzLl9maXJzdCA9IG5vZGU7XG59O1xuTGF5b3V0Tm9kZU1hbmFnZXIucHJvdG90eXBlLnNldE5vZGVPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB0aGlzLl9ub2RlT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9maXJzdDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBub2RlLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICBub2RlID0gdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5maXJzdDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBub2RlLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUucHJlYWxsb2NhdGVOb2RlcyA9IGZ1bmN0aW9uIChjb3VudCwgc3BlYykge1xuICAgIHZhciBub2RlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICBub2Rlcy5wdXNoKHRoaXMuY3JlYXRlTm9kZSh1bmRlZmluZWQsIHNwZWMpKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgX2Rlc3Ryb3lOb2RlLmNhbGwodGhpcywgbm9kZXNbaV0pO1xuICAgIH1cbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUuY3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChyZW5kZXJOb2RlLCBzcGVjKSB7XG4gICAgdmFyIG5vZGU7XG4gICAgaWYgKHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuZmlyc3QpIHtcbiAgICAgICAgbm9kZSA9IHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuZmlyc3Q7XG4gICAgICAgIHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuZmlyc3QgPSBub2RlLl9uZXh0O1xuICAgICAgICB0aGlzLl9wb29sLmxheW91dE5vZGVzLnNpemUtLTtcbiAgICAgICAgbm9kZS5jb25zdHJ1Y3Rvci5hcHBseShub2RlLCBhcmd1bWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBuZXcgdGhpcy5MYXlvdXROb2RlKHJlbmRlck5vZGUsIHNwZWMpO1xuICAgICAgICBpZiAodGhpcy5fbm9kZU9wdGlvbnMpIHtcbiAgICAgICAgICAgIG5vZGUuc2V0T3B0aW9ucyh0aGlzLl9ub2RlT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbm9kZS5fcHJldiA9IHVuZGVmaW5lZDtcbiAgICBub2RlLl9uZXh0ID0gdW5kZWZpbmVkO1xuICAgIG5vZGUuX3ZpZXdTZXF1ZW5jZSA9IHVuZGVmaW5lZDtcbiAgICBub2RlLl9sYXlvdXRDb3VudCA9IDA7XG4gICAgaWYgKHRoaXMuX2luaXRMYXlvdXROb2RlRm4pIHtcbiAgICAgICAgdGhpcy5faW5pdExheW91dE5vZGVGbi5jYWxsKHRoaXMsIG5vZGUsIHNwZWMpO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbn07XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlQWxsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5fZmlyc3Q7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgdmFyIG5leHQgPSBub2RlLl9uZXh0O1xuICAgICAgICBfZGVzdHJveU5vZGUuY2FsbCh0aGlzLCBub2RlKTtcbiAgICAgICAgbm9kZSA9IG5leHQ7XG4gICAgfVxuICAgIHRoaXMuX2ZpcnN0ID0gdW5kZWZpbmVkO1xufTtcbmZ1bmN0aW9uIF9kZXN0cm95Tm9kZShub2RlKSB7XG4gICAgaWYgKG5vZGUuX25leHQpIHtcbiAgICAgICAgbm9kZS5fbmV4dC5fcHJldiA9IG5vZGUuX3ByZXY7XG4gICAgfVxuICAgIGlmIChub2RlLl9wcmV2KSB7XG4gICAgICAgIG5vZGUuX3ByZXYuX25leHQgPSBub2RlLl9uZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2ZpcnN0ID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgbm9kZS5kZXN0cm95KCk7XG4gICAgaWYgKHRoaXMuX3Bvb2wubGF5b3V0Tm9kZXMuc2l6ZSA8IE1BWF9QT09MX1NJWkUpIHtcbiAgICAgICAgdGhpcy5fcG9vbC5sYXlvdXROb2Rlcy5zaXplKys7XG4gICAgICAgIG5vZGUuX3ByZXYgPSB1bmRlZmluZWQ7XG4gICAgICAgIG5vZGUuX25leHQgPSB0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0O1xuICAgICAgICB0aGlzLl9wb29sLmxheW91dE5vZGVzLmZpcnN0ID0gbm9kZTtcbiAgICB9XG59XG5MYXlvdXROb2RlTWFuYWdlci5wcm90b3R5cGUuZ2V0U3RhcnRFbnVtTm9kZSA9IGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgaWYgKG5leHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3Q7XG4gICAgfSBlbHNlIGlmIChuZXh0ID09PSB0cnVlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQgJiYgdGhpcy5fY29udGV4dFN0YXRlLnN0YXJ0UHJldiA/IHRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydC5fbmV4dCA6IHRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydDtcbiAgICB9IGVsc2UgaWYgKG5leHQgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQgJiYgIXRoaXMuX2NvbnRleHRTdGF0ZS5zdGFydFByZXYgPyB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQuX3ByZXYgOiB0aGlzLl9jb250ZXh0U3RhdGUuc3RhcnQ7XG4gICAgfVxufTtcbmZ1bmN0aW9uIF9jb250ZXh0R2V0Q3JlYXRlQW5kT3JkZXJOb2RlcyhyZW5kZXJOb2RlLCBwcmV2KSB7XG4gICAgdmFyIG5vZGU7XG4gICAgdmFyIHN0YXRlID0gdGhpcy5fY29udGV4dFN0YXRlO1xuICAgIGlmICghc3RhdGUuc3RhcnQpIHtcbiAgICAgICAgbm9kZSA9IHRoaXMuX2ZpcnN0O1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUucmVuZGVyTm9kZSA9PT0gcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5jcmVhdGVOb2RlKHJlbmRlck5vZGUpO1xuICAgICAgICAgICAgbm9kZS5fbmV4dCA9IHRoaXMuX2ZpcnN0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpcnN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlyc3QuX3ByZXYgPSBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZmlyc3QgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLnN0YXJ0ID0gbm9kZTtcbiAgICAgICAgc3RhdGUuc3RhcnRQcmV2ID0gcHJldjtcbiAgICAgICAgc3RhdGUucHJldiA9IG5vZGU7XG4gICAgICAgIHN0YXRlLm5leHQgPSBub2RlO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgaWYgKHByZXYpIHtcbiAgICAgICAgaWYgKHN0YXRlLnByZXYuX3ByZXYgJiYgc3RhdGUucHJldi5fcHJldi5yZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBzdGF0ZS5wcmV2ID0gc3RhdGUucHJldi5fcHJldjtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5wcmV2O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHN0YXRlLm5leHQuX25leHQgJiYgc3RhdGUubmV4dC5fbmV4dC5yZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBzdGF0ZS5uZXh0ID0gc3RhdGUubmV4dC5fbmV4dDtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZS5uZXh0O1xuICAgICAgICB9XG4gICAgfVxuICAgIG5vZGUgPSB0aGlzLl9maXJzdDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZS5yZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fbmV4dDtcbiAgICB9XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIG5vZGUgPSB0aGlzLmNyZWF0ZU5vZGUocmVuZGVyTm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5vZGUuX25leHQpIHtcbiAgICAgICAgICAgIG5vZGUuX25leHQuX3ByZXYgPSBub2RlLl9wcmV2O1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlLl9wcmV2KSB7XG4gICAgICAgICAgICBub2RlLl9wcmV2Ll9uZXh0ID0gbm9kZS5fbmV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpcnN0ID0gbm9kZS5fbmV4dDtcbiAgICAgICAgfVxuICAgICAgICBub2RlLl9uZXh0ID0gdW5kZWZpbmVkO1xuICAgICAgICBub2RlLl9wcmV2ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAocHJldikge1xuICAgICAgICBpZiAoc3RhdGUucHJldi5fcHJldikge1xuICAgICAgICAgICAgbm9kZS5fcHJldiA9IHN0YXRlLnByZXYuX3ByZXY7XG4gICAgICAgICAgICBzdGF0ZS5wcmV2Ll9wcmV2Ll9uZXh0ID0gbm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpcnN0ID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZS5wcmV2Ll9wcmV2ID0gbm9kZTtcbiAgICAgICAgbm9kZS5fbmV4dCA9IHN0YXRlLnByZXY7XG4gICAgICAgIHN0YXRlLnByZXYgPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzdGF0ZS5uZXh0Ll9uZXh0KSB7XG4gICAgICAgICAgICBub2RlLl9uZXh0ID0gc3RhdGUubmV4dC5fbmV4dDtcbiAgICAgICAgICAgIHN0YXRlLm5leHQuX25leHQuX3ByZXYgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlLm5leHQuX25leHQgPSBub2RlO1xuICAgICAgICBub2RlLl9wcmV2ID0gc3RhdGUubmV4dDtcbiAgICAgICAgc3RhdGUubmV4dCA9IG5vZGU7XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufVxuZnVuY3Rpb24gX2NvbnRleHROZXh0KCkge1xuICAgIGlmICghdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY29udGV4dC5yZXZlcnNlKSB7XG4gICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UgPSB0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlLmdldE5leHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciByZW5kZXJOb2RlID0gdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZS5nZXQoKTtcbiAgICBpZiAoIXJlbmRlck5vZGUpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIG5leHRTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2U7XG4gICAgaWYgKCF0aGlzLl9jb250ZXh0LnJldmVyc2UpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLm5leHRTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY29udGV4dFN0YXRlLmxhc3RSZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgIHRocm93ICdWaWV3U2VxdWVuY2UgaXMgY29ycnVwdGVkLCBzaG91bGQgbmV2ZXIgY29udGFpbiB0aGUgc2FtZSByZW5kZXJOb2RlIHR3aWNlLCBpbmRleDogJyArIG5leHRTZXF1ZW5jZS5nZXRJbmRleCgpO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0U3RhdGUubGFzdFJlbmRlck5vZGUgPSByZW5kZXJOb2RlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlck5vZGU6IHJlbmRlck5vZGUsXG4gICAgICAgIHZpZXdTZXF1ZW5jZTogbmV4dFNlcXVlbmNlLFxuICAgICAgICBuZXh0OiB0cnVlLFxuICAgICAgICBpbmRleDogKyt0aGlzLl9jb250ZXh0U3RhdGUubmV4dEdldEluZGV4XG4gICAgfTtcbn1cbmZ1bmN0aW9uIF9jb250ZXh0UHJldigpIHtcbiAgICBpZiAoIXRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKCF0aGlzLl9jb250ZXh0LnJldmVyc2UpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICAgICAgaWYgKCF0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciByZW5kZXJOb2RlID0gdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZS5nZXQoKTtcbiAgICBpZiAoIXJlbmRlck5vZGUpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIHByZXZTZXF1ZW5jZSA9IHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2VxdWVuY2U7XG4gICAgaWYgKHRoaXMuX2NvbnRleHQucmV2ZXJzZSkge1xuICAgICAgICB0aGlzLl9jb250ZXh0U3RhdGUucHJldlNlcXVlbmNlID0gdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY29udGV4dFN0YXRlLmxhc3RSZW5kZXJOb2RlID09PSByZW5kZXJOb2RlKSB7XG4gICAgICAgIHRocm93ICdWaWV3U2VxdWVuY2UgaXMgY29ycnVwdGVkLCBzaG91bGQgbmV2ZXIgY29udGFpbiB0aGUgc2FtZSByZW5kZXJOb2RlIHR3aWNlLCBpbmRleDogJyArIHByZXZTZXF1ZW5jZS5nZXRJbmRleCgpO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0U3RhdGUubGFzdFJlbmRlck5vZGUgPSByZW5kZXJOb2RlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlck5vZGU6IHJlbmRlck5vZGUsXG4gICAgICAgIHZpZXdTZXF1ZW5jZTogcHJldlNlcXVlbmNlLFxuICAgICAgICBwcmV2OiB0cnVlLFxuICAgICAgICBpbmRleDogLS10aGlzLl9jb250ZXh0U3RhdGUucHJldkdldEluZGV4XG4gICAgfTtcbn1cbmZ1bmN0aW9uIF9jb250ZXh0R2V0KGNvbnRleHROb2RlT3JJZCkge1xuICAgIGlmICh0aGlzLl9ub2Rlc0J5SWQgJiYgKGNvbnRleHROb2RlT3JJZCBpbnN0YW5jZW9mIFN0cmluZyB8fCB0eXBlb2YgY29udGV4dE5vZGVPcklkID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgdmFyIHJlbmRlck5vZGUgPSB0aGlzLl9ub2Rlc0J5SWRbY29udGV4dE5vZGVPcklkXTtcbiAgICAgICAgaWYgKCFyZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZW5kZXJOb2RlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBqID0gcmVuZGVyTm9kZS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGU6IHJlbmRlck5vZGVbaV0sXG4gICAgICAgICAgICAgICAgICAgIGFycmF5RWxlbWVudDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVuZGVyTm9kZTogcmVuZGVyTm9kZSxcbiAgICAgICAgICAgIGJ5SWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29udGV4dE5vZGVPcklkO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9jb250ZXh0U2V0KGNvbnRleHROb2RlT3JJZCwgc2V0KSB7XG4gICAgdmFyIGNvbnRleHROb2RlID0gdGhpcy5fbm9kZXNCeUlkID8gX2NvbnRleHRHZXQuY2FsbCh0aGlzLCBjb250ZXh0Tm9kZU9ySWQpIDogY29udGV4dE5vZGVPcklkO1xuICAgIGlmIChjb250ZXh0Tm9kZSkge1xuICAgICAgICB2YXIgbm9kZSA9IGNvbnRleHROb2RlLm5vZGU7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHROb2RlLm5leHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dE5vZGUuaW5kZXggPCB0aGlzLl9jb250ZXh0U3RhdGUubmV4dFNldEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIExheW91dFV0aWxpdHkuZXJyb3IoJ05vZGVzIG11c3QgYmUgbGF5ZWQgb3V0IGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZXkgd2VyZSByZXF1ZXN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5uZXh0U2V0SW5kZXggPSBjb250ZXh0Tm9kZS5pbmRleDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29udGV4dE5vZGUucHJldikge1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0Tm9kZS5pbmRleCA+IHRoaXMuX2NvbnRleHRTdGF0ZS5wcmV2U2V0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgTGF5b3V0VXRpbGl0eS5lcnJvcignTm9kZXMgbXVzdCBiZSBsYXllZCBvdXQgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhleSB3ZXJlIHJlcXVlc3RlZCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fY29udGV4dFN0YXRlLnByZXZTZXRJbmRleCA9IGNvbnRleHROb2RlLmluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZSA9IF9jb250ZXh0R2V0Q3JlYXRlQW5kT3JkZXJOb2Rlcy5jYWxsKHRoaXMsIGNvbnRleHROb2RlLnJlbmRlck5vZGUsIGNvbnRleHROb2RlLnByZXYpO1xuICAgICAgICAgICAgbm9kZS5fdmlld1NlcXVlbmNlID0gY29udGV4dE5vZGUudmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgbm9kZS5fbGF5b3V0Q291bnQrKztcbiAgICAgICAgICAgIGlmIChub2RlLl9sYXlvdXRDb3VudCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2NvbnRleHRTdGF0ZS5hZGRDb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGV4dE5vZGUubm9kZSA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS51c2VzVHJ1ZVNpemUgPSBjb250ZXh0Tm9kZS51c2VzVHJ1ZVNpemU7XG4gICAgICAgIG5vZGUudHJ1ZVNpemVSZXF1ZXN0ZWQgPSBjb250ZXh0Tm9kZS50cnVlU2l6ZVJlcXVlc3RlZDtcbiAgICAgICAgbm9kZS5zZXQoc2V0LCB0aGlzLl9jb250ZXh0LnNpemUpO1xuICAgICAgICBjb250ZXh0Tm9kZS5zZXQgPSBzZXQ7XG4gICAgfVxuICAgIHJldHVybiBzZXQ7XG59XG5mdW5jdGlvbiBfY29udGV4dFJlc29sdmVTaXplKGNvbnRleHROb2RlT3JJZCwgcGFyZW50U2l6ZSkge1xuICAgIHZhciBjb250ZXh0Tm9kZSA9IHRoaXMuX25vZGVzQnlJZCA/IF9jb250ZXh0R2V0LmNhbGwodGhpcywgY29udGV4dE5vZGVPcklkKSA6IGNvbnRleHROb2RlT3JJZDtcbiAgICB2YXIgcmVzb2x2ZVNpemUgPSB0aGlzLl9wb29sLnJlc29sdmVTaXplO1xuICAgIGlmICghY29udGV4dE5vZGUpIHtcbiAgICAgICAgcmVzb2x2ZVNpemVbMF0gPSAwO1xuICAgICAgICByZXNvbHZlU2l6ZVsxXSA9IDA7XG4gICAgICAgIHJldHVybiByZXNvbHZlU2l6ZTtcbiAgICB9XG4gICAgdmFyIHJlbmRlck5vZGUgPSBjb250ZXh0Tm9kZS5yZW5kZXJOb2RlO1xuICAgIHZhciBzaXplID0gcmVuZGVyTm9kZS5nZXRTaXplKCk7XG4gICAgaWYgKCFzaXplKSB7XG4gICAgICAgIHJldHVybiBwYXJlbnRTaXplO1xuICAgIH1cbiAgICB2YXIgY29uZmlnU2l6ZSA9IHJlbmRlck5vZGUuc2l6ZSAmJiByZW5kZXJOb2RlLl90cnVlU2l6ZUNoZWNrICE9PSB1bmRlZmluZWQgPyByZW5kZXJOb2RlLnNpemUgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGNvbmZpZ1NpemUgJiYgKGNvbmZpZ1NpemVbMF0gPT09IHRydWUgfHwgY29uZmlnU2l6ZVsxXSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgY29udGV4dE5vZGUudXNlc1RydWVTaXplID0gdHJ1ZTtcbiAgICAgICAgdmFyIGJhY2t1cFNpemUgPSByZW5kZXJOb2RlLl9iYWNrdXBTaXplO1xuICAgICAgICBpZiAocmVuZGVyTm9kZS5fY29udGVudERpcnR5IHx8IHJlbmRlck5vZGUuX3RydWVTaXplQ2hlY2spIHtcbiAgICAgICAgICAgIHRoaXMuX3RydWVTaXplUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnRleHROb2RlLnRydWVTaXplUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVuZGVyTm9kZS5fdHJ1ZVNpemVDaGVjaykge1xuICAgICAgICAgICAgaWYgKGJhY2t1cFNpemUgJiYgY29uZmlnU2l6ZSAhPT0gc2l6ZSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXdXaWR0aCA9IGNvbmZpZ1NpemVbMF0gPT09IHRydWUgPyBNYXRoLm1heChiYWNrdXBTaXplWzBdLCBzaXplWzBdKSA6IHNpemVbMF07XG4gICAgICAgICAgICAgICAgdmFyIG5ld0hlaWdodCA9IGNvbmZpZ1NpemVbMV0gPT09IHRydWUgPyBNYXRoLm1heChiYWNrdXBTaXplWzFdLCBzaXplWzFdKSA6IHNpemVbMV07XG4gICAgICAgICAgICAgICAgYmFja3VwU2l6ZVswXSA9IG5ld1dpZHRoO1xuICAgICAgICAgICAgICAgIGJhY2t1cFNpemVbMV0gPSBuZXdIZWlnaHQ7XG4gICAgICAgICAgICAgICAgc2l6ZSA9IGJhY2t1cFNpemU7XG4gICAgICAgICAgICAgICAgcmVuZGVyTm9kZS5fYmFja3VwU2l6ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBiYWNrdXBTaXplID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZWV2YWxUcnVlU2l6ZSB8fCBiYWNrdXBTaXplICYmIChiYWNrdXBTaXplWzBdICE9PSBzaXplWzBdIHx8IGJhY2t1cFNpemVbMV0gIT09IHNpemVbMV0pKSB7XG4gICAgICAgICAgICByZW5kZXJOb2RlLl90cnVlU2l6ZUNoZWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlbmRlck5vZGUuX3NpemVEaXJ0eSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFiYWNrdXBTaXplKSB7XG4gICAgICAgICAgICByZW5kZXJOb2RlLl9iYWNrdXBTaXplID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIGJhY2t1cFNpemUgPSByZW5kZXJOb2RlLl9iYWNrdXBTaXplO1xuICAgICAgICB9XG4gICAgICAgIGJhY2t1cFNpemVbMF0gPSBzaXplWzBdO1xuICAgICAgICBiYWNrdXBTaXplWzFdID0gc2l6ZVsxXTtcbiAgICB9XG4gICAgY29uZmlnU2l6ZSA9IHJlbmRlck5vZGUuX25vZGVzID8gcmVuZGVyTm9kZS5vcHRpb25zLnNpemUgOiB1bmRlZmluZWQ7XG4gICAgaWYgKGNvbmZpZ1NpemUgJiYgKGNvbmZpZ1NpemVbMF0gPT09IHRydWUgfHwgY29uZmlnU2l6ZVsxXSA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgaWYgKHRoaXMuX3JlZXZhbFRydWVTaXplIHx8IHJlbmRlck5vZGUuX25vZGVzLl90cnVlU2l6ZVJlcXVlc3RlZCkge1xuICAgICAgICAgICAgY29udGV4dE5vZGUudXNlc1RydWVTaXplID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnRleHROb2RlLnRydWVTaXplUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuX3RydWVTaXplUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2l6ZVswXSA9PT0gdW5kZWZpbmVkIHx8IHNpemVbMF0gPT09IHRydWUgfHwgc2l6ZVsxXSA9PT0gdW5kZWZpbmVkIHx8IHNpemVbMV0gPT09IHRydWUpIHtcbiAgICAgICAgcmVzb2x2ZVNpemVbMF0gPSBzaXplWzBdO1xuICAgICAgICByZXNvbHZlU2l6ZVsxXSA9IHNpemVbMV07XG4gICAgICAgIHNpemUgPSByZXNvbHZlU2l6ZTtcbiAgICAgICAgaWYgKHNpemVbMF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2l6ZVswXSA9IHBhcmVudFNpemVbMF07XG4gICAgICAgIH0gZWxzZSBpZiAoc2l6ZVswXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc2l6ZVswXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb250ZXh0Tm9kZS50cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNpemVbMV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2l6ZVsxXSA9IHBhcmVudFNpemVbMV07XG4gICAgICAgIH0gZWxzZSBpZiAoc2l6ZVsxXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgc2l6ZVsxXSA9IDA7XG4gICAgICAgICAgICB0aGlzLl90cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb250ZXh0Tm9kZS50cnVlU2l6ZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNpemU7XG59XG5tb2R1bGUuZXhwb3J0cyA9IExheW91dE5vZGVNYW5hZ2VyOyIsInZhciBVdGlsaXR5ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogbnVsbDtcbmZ1bmN0aW9uIExheW91dFV0aWxpdHkoKSB7XG59XG5MYXlvdXRVdGlsaXR5LnJlZ2lzdGVyZWRIZWxwZXJzID0ge307XG52YXIgQ2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBTRVFVRU5DRTogMSxcbiAgICAgICAgRElSRUNUSU9OX1g6IDIsXG4gICAgICAgIERJUkVDVElPTl9ZOiA0LFxuICAgICAgICBTQ1JPTExJTkc6IDhcbiAgICB9O1xuTGF5b3V0VXRpbGl0eS5DYXBhYmlsaXRpZXMgPSBDYXBhYmlsaXRpZXM7XG5MYXlvdXRVdGlsaXR5Lm5vcm1hbGl6ZU1hcmdpbnMgPSBmdW5jdGlvbiAobWFyZ2lucykge1xuICAgIGlmICghbWFyZ2lucykge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkobWFyZ2lucykpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG1hcmdpbnMsXG4gICAgICAgICAgICBtYXJnaW5zLFxuICAgICAgICAgICAgbWFyZ2lucyxcbiAgICAgICAgICAgIG1hcmdpbnNcbiAgICAgICAgXTtcbiAgICB9IGVsc2UgaWYgKG1hcmdpbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgfSBlbHNlIGlmIChtYXJnaW5zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgbWFyZ2luc1swXSxcbiAgICAgICAgICAgIG1hcmdpbnNbMF0sXG4gICAgICAgICAgICBtYXJnaW5zWzBdLFxuICAgICAgICAgICAgbWFyZ2luc1swXVxuICAgICAgICBdO1xuICAgIH0gZWxzZSBpZiAobWFyZ2lucy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG1hcmdpbnNbMF0sXG4gICAgICAgICAgICBtYXJnaW5zWzFdLFxuICAgICAgICAgICAgbWFyZ2luc1swXSxcbiAgICAgICAgICAgIG1hcmdpbnNbMV1cbiAgICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbWFyZ2lucztcbiAgICB9XG59O1xuTGF5b3V0VXRpbGl0eS5jbG9uZVNwZWMgPSBmdW5jdGlvbiAoc3BlYykge1xuICAgIHZhciBjbG9uZSA9IHt9O1xuICAgIGlmIChzcGVjLm9wYWNpdHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbG9uZS5vcGFjaXR5ID0gc3BlYy5vcGFjaXR5O1xuICAgIH1cbiAgICBpZiAoc3BlYy5zaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2xvbmUuc2l6ZSA9IHNwZWMuc2l6ZS5zbGljZSgwKTtcbiAgICB9XG4gICAgaWYgKHNwZWMudHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2xvbmUudHJhbnNmb3JtID0gc3BlYy50cmFuc2Zvcm0uc2xpY2UoMCk7XG4gICAgfVxuICAgIGlmIChzcGVjLm9yaWdpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsb25lLm9yaWdpbiA9IHNwZWMub3JpZ2luLnNsaWNlKDApO1xuICAgIH1cbiAgICBpZiAoc3BlYy5hbGlnbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNsb25lLmFsaWduID0gc3BlYy5hbGlnbi5zbGljZSgwKTtcbiAgICB9XG4gICAgcmV0dXJuIGNsb25lO1xufTtcbmZ1bmN0aW9uIF9pc0VxdWFsQXJyYXkoYSwgYikge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpID0gYS5sZW5ndGg7XG4gICAgaWYgKGkgIT09IGIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuTGF5b3V0VXRpbGl0eS5pc0VxdWFsU3BlYyA9IGZ1bmN0aW9uIChzcGVjMSwgc3BlYzIpIHtcbiAgICBpZiAoc3BlYzEub3BhY2l0eSAhPT0gc3BlYzIub3BhY2l0eSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS5zaXplLCBzcGVjMi5zaXplKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS50cmFuc2Zvcm0sIHNwZWMyLnRyYW5zZm9ybSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEub3JpZ2luLCBzcGVjMi5vcmlnaW4pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFfaXNFcXVhbEFycmF5KHNwZWMxLmFsaWduLCBzcGVjMi5hbGlnbikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5MYXlvdXRVdGlsaXR5LmdldFNwZWNEaWZmVGV4dCA9IGZ1bmN0aW9uIChzcGVjMSwgc3BlYzIpIHtcbiAgICB2YXIgcmVzdWx0ID0gJ3NwZWMgZGlmZjonO1xuICAgIGlmIChzcGVjMS5vcGFjaXR5ICE9PSBzcGVjMi5vcGFjaXR5KSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxub3BhY2l0eTogJyArIHNwZWMxLm9wYWNpdHkgKyAnICE9ICcgKyBzcGVjMi5vcGFjaXR5O1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEuc2l6ZSwgc3BlYzIuc2l6ZSkpIHtcbiAgICAgICAgcmVzdWx0ICs9ICdcXG5zaXplOiAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzEuc2l6ZSkgKyAnICE9ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMi5zaXplKTtcbiAgICB9XG4gICAgaWYgKCFfaXNFcXVhbEFycmF5KHNwZWMxLnRyYW5zZm9ybSwgc3BlYzIudHJhbnNmb3JtKSkge1xuICAgICAgICByZXN1bHQgKz0gJ1xcbnRyYW5zZm9ybTogJyArIEpTT04uc3RyaW5naWZ5KHNwZWMxLnRyYW5zZm9ybSkgKyAnICE9ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMi50cmFuc2Zvcm0pO1xuICAgIH1cbiAgICBpZiAoIV9pc0VxdWFsQXJyYXkoc3BlYzEub3JpZ2luLCBzcGVjMi5vcmlnaW4pKSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxub3JpZ2luOiAnICsgSlNPTi5zdHJpbmdpZnkoc3BlYzEub3JpZ2luKSArICcgIT0gJyArIEpTT04uc3RyaW5naWZ5KHNwZWMyLm9yaWdpbik7XG4gICAgfVxuICAgIGlmICghX2lzRXF1YWxBcnJheShzcGVjMS5hbGlnbiwgc3BlYzIuYWxpZ24pKSB7XG4gICAgICAgIHJlc3VsdCArPSAnXFxuYWxpZ246ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMS5hbGlnbikgKyAnICE9ICcgKyBKU09OLnN0cmluZ2lmeShzcGVjMi5hbGlnbik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuTGF5b3V0VXRpbGl0eS5lcnJvciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgY29uc29sZS5sb2coJ0VSUk9SOiAnICsgbWVzc2FnZSk7XG4gICAgdGhyb3cgbWVzc2FnZTtcbn07XG5MYXlvdXRVdGlsaXR5Lndhcm5pbmcgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKCdXQVJOSU5HOiAnICsgbWVzc2FnZSk7XG59O1xuTGF5b3V0VXRpbGl0eS5sb2cgPSBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBtZXNzYWdlID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIE9iamVjdCB8fCBhcmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBKU09OLnN0cmluZ2lmeShhcmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSArPSBhcmc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2cobWVzc2FnZSk7XG59O1xuTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zMSwgb3B0aW9uczIsIGZvcmNlQ2xvbmUpIHtcbiAgICBpZiAob3B0aW9uczEgJiYgIW9wdGlvbnMyICYmICFmb3JjZUNsb25lKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zMTtcbiAgICB9IGVsc2UgaWYgKCFvcHRpb25zMSAmJiBvcHRpb25zMiAmJiAhZm9yY2VDbG9uZSkge1xuICAgICAgICByZXR1cm4gb3B0aW9uczI7XG4gICAgfVxuICAgIHZhciBvcHRpb25zID0gVXRpbGl0eS5jbG9uZShvcHRpb25zMSB8fCB7fSk7XG4gICAgaWYgKG9wdGlvbnMyKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvcHRpb25zMikge1xuICAgICAgICAgICAgb3B0aW9uc1trZXldID0gb3B0aW9uczJba2V5XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucztcbn07XG5MYXlvdXRVdGlsaXR5LnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24gKG5hbWUsIEhlbHBlcikge1xuICAgIGlmICghSGVscGVyLnByb3RvdHlwZS5wYXJzZSkge1xuICAgICAgICBMYXlvdXRVdGlsaXR5LmVycm9yKCdUaGUgbGF5b3V0LWhlbHBlciBmb3IgbmFtZSBcIicgKyBuYW1lICsgJ1wiIGlzIHJlcXVpcmVkIHRvIHN1cHBvcnQgdGhlIFwicGFyc2VcIiBtZXRob2QnKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucmVnaXN0ZXJlZEhlbHBlcnNbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBMYXlvdXRVdGlsaXR5Lndhcm5pbmcoJ0EgbGF5b3V0LWhlbHBlciB3aXRoIHRoZSBuYW1lIFwiJyArIG5hbWUgKyAnXCIgaXMgYWxyZWFkeSByZWdpc3RlcmVkIGFuZCB3aWxsIGJlIG92ZXJ3cml0dGVuJyk7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0ZXJlZEhlbHBlcnNbbmFtZV0gPSBIZWxwZXI7XG59O1xuTGF5b3V0VXRpbGl0eS51bnJlZ2lzdGVySGVscGVyID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5yZWdpc3RlcmVkSGVscGVyc1tuYW1lXTtcbn07XG5MYXlvdXRVdGlsaXR5LmdldFJlZ2lzdGVyZWRIZWxwZXIgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyZWRIZWxwZXJzW25hbWVdO1xufTtcbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0VXRpbGl0eTsiLCJ2YXIgTGF5b3V0VXRpbGl0eSA9IHJlcXVpcmUoJy4vTGF5b3V0VXRpbGl0eScpO1xudmFyIExheW91dENvbnRyb2xsZXIgPSByZXF1aXJlKCcuL0xheW91dENvbnRyb2xsZXInKTtcbnZhciBMYXlvdXROb2RlID0gcmVxdWlyZSgnLi9MYXlvdXROb2RlJyk7XG52YXIgRmxvd0xheW91dE5vZGUgPSByZXF1aXJlKCcuL0Zsb3dMYXlvdXROb2RlJyk7XG52YXIgTGF5b3V0Tm9kZU1hbmFnZXIgPSByZXF1aXJlKCcuL0xheW91dE5vZGVNYW5hZ2VyJyk7XG52YXIgQ29udGFpbmVyU3VyZmFjZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5zdXJmYWNlcy5Db250YWluZXJTdXJmYWNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnN1cmZhY2VzLkNvbnRhaW5lclN1cmZhY2UgOiBudWxsO1xudmFyIFRyYW5zZm9ybSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlRyYW5zZm9ybSA6IG51bGw7XG52YXIgRXZlbnRIYW5kbGVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogbnVsbDtcbnZhciBHcm91cCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLkdyb3VwIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuR3JvdXAgOiBudWxsO1xudmFyIFZlY3RvciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5tYXRoLlZlY3RvciA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5tYXRoLlZlY3RvciA6IG51bGw7XG52YXIgUGh5c2ljc0VuZ2luZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLlBoeXNpY3NFbmdpbmUgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMucGh5c2ljcy5QaHlzaWNzRW5naW5lIDogbnVsbDtcbnZhciBQYXJ0aWNsZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5waHlzaWNzLmJvZGllcy5QYXJ0aWNsZSA6IG51bGw7XG52YXIgRHJhZyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmZvcmNlcy5EcmFnIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnBoeXNpY3MuZm9yY2VzLkRyYWcgOiBudWxsO1xudmFyIFNwcmluZyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5waHlzaWNzLmZvcmNlcy5TcHJpbmcgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMucGh5c2ljcy5mb3JjZXMuU3ByaW5nIDogbnVsbDtcbnZhciBTY3JvbGxTeW5jID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmlucHV0cy5TY3JvbGxTeW5jIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmlucHV0cy5TY3JvbGxTeW5jIDogbnVsbDtcbnZhciBWaWV3U2VxdWVuY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5WaWV3U2VxdWVuY2UgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5WaWV3U2VxdWVuY2UgOiBudWxsO1xudmFyIEJvdW5kcyA9IHtcbiAgICAgICAgTk9ORTogMCxcbiAgICAgICAgUFJFVjogMSxcbiAgICAgICAgTkVYVDogMixcbiAgICAgICAgQk9USDogM1xuICAgIH07XG52YXIgU3ByaW5nU291cmNlID0ge1xuICAgICAgICBOT05FOiAnbm9uZScsXG4gICAgICAgIE5FWFRCT1VORFM6ICduZXh0LWJvdW5kcycsXG4gICAgICAgIFBSRVZCT1VORFM6ICdwcmV2LWJvdW5kcycsXG4gICAgICAgIE1JTlNJWkU6ICdtaW5pbWFsLXNpemUnLFxuICAgICAgICBHT1RPU0VRVUVOQ0U6ICdnb3RvLXNlcXVlbmNlJyxcbiAgICAgICAgRU5TVVJFVklTSUJMRTogJ2Vuc3VyZS12aXNpYmxlJyxcbiAgICAgICAgR09UT1BSRVZESVJFQ1RJT046ICdnb3RvLXByZXYtZGlyZWN0aW9uJyxcbiAgICAgICAgR09UT05FWFRESVJFQ1RJT046ICdnb3RvLW5leHQtZGlyZWN0aW9uJ1xuICAgIH07XG52YXIgUGFnaW5hdGlvbk1vZGUgPSB7XG4gICAgICAgIFBBR0U6IDAsXG4gICAgICAgIFNDUk9MTDogMVxuICAgIH07XG5mdW5jdGlvbiBTY3JvbGxDb250cm9sbGVyKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyhTY3JvbGxDb250cm9sbGVyLkRFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XG4gICAgdmFyIGxheW91dE1hbmFnZXIgPSBuZXcgTGF5b3V0Tm9kZU1hbmFnZXIob3B0aW9ucy5mbG93ID8gRmxvd0xheW91dE5vZGUgOiBMYXlvdXROb2RlLCBfaW5pdExheW91dE5vZGUuYmluZCh0aGlzKSk7XG4gICAgTGF5b3V0Q29udHJvbGxlci5jYWxsKHRoaXMsIG9wdGlvbnMsIGxheW91dE1hbmFnZXIpO1xuICAgIHRoaXMuX3Njcm9sbCA9IHtcbiAgICAgICAgYWN0aXZlVG91Y2hlczogW10sXG4gICAgICAgIHBlOiBuZXcgUGh5c2ljc0VuZ2luZSgpLFxuICAgICAgICBwYXJ0aWNsZTogbmV3IFBhcnRpY2xlKHRoaXMub3B0aW9ucy5zY3JvbGxQYXJ0aWNsZSksXG4gICAgICAgIGRyYWdGb3JjZTogbmV3IERyYWcodGhpcy5vcHRpb25zLnNjcm9sbERyYWcpLFxuICAgICAgICBmcmljdGlvbkZvcmNlOiBuZXcgRHJhZyh0aGlzLm9wdGlvbnMuc2Nyb2xsRnJpY3Rpb24pLFxuICAgICAgICBzcHJpbmdWYWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICBzcHJpbmdGb3JjZTogbmV3IFNwcmluZyh0aGlzLm9wdGlvbnMuc2Nyb2xsU3ByaW5nKSxcbiAgICAgICAgc3ByaW5nRW5kU3RhdGU6IG5ldyBWZWN0b3IoW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0pLFxuICAgICAgICBncm91cFN0YXJ0OiAwLFxuICAgICAgICBncm91cFRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbERlbHRhOiAwLFxuICAgICAgICBub3JtYWxpemVkU2Nyb2xsRGVsdGE6IDAsXG4gICAgICAgIHNjcm9sbEZvcmNlOiAwLFxuICAgICAgICBzY3JvbGxGb3JjZUNvdW50OiAwLFxuICAgICAgICB1bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ6IDAsXG4gICAgICAgIGlzU2Nyb2xsaW5nOiBmYWxzZVxuICAgIH07XG4gICAgdGhpcy5fZGVidWcgPSB7XG4gICAgICAgIGxheW91dENvdW50OiAwLFxuICAgICAgICBjb21taXRDb3VudDogMFxuICAgIH07XG4gICAgdGhpcy5ncm91cCA9IG5ldyBHcm91cCgpO1xuICAgIHRoaXMuZ3JvdXAuYWRkKHsgcmVuZGVyOiBfaW5uZXJSZW5kZXIuYmluZCh0aGlzKSB9KTtcbiAgICB0aGlzLl9zY3JvbGwucGUuYWRkQm9keSh0aGlzLl9zY3JvbGwucGFydGljbGUpO1xuICAgIGlmICghdGhpcy5vcHRpb25zLnNjcm9sbERyYWcuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLmRyYWdGb3JjZUlkID0gdGhpcy5fc2Nyb2xsLnBlLmF0dGFjaCh0aGlzLl9zY3JvbGwuZHJhZ0ZvcmNlLCB0aGlzLl9zY3JvbGwucGFydGljbGUpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5zY3JvbGxGcmljdGlvbi5kaXNhYmxlZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwuZnJpY3Rpb25Gb3JjZUlkID0gdGhpcy5fc2Nyb2xsLnBlLmF0dGFjaCh0aGlzLl9zY3JvbGwuZnJpY3Rpb25Gb3JjZSwgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlKTtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlLnNldE9wdGlvbnMoeyBhbmNob3I6IHRoaXMuX3Njcm9sbC5zcHJpbmdFbmRTdGF0ZSB9KTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCd0b3VjaHN0YXJ0JywgX3RvdWNoU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5vbigndG91Y2htb3ZlJywgX3RvdWNoTW92ZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCd0b3VjaGVuZCcsIF90b3VjaEVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCd0b3VjaGNhbmNlbCcsIF90b3VjaEVuZC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZWRvd24nLCBfbW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2V2ZW50SW5wdXQub24oJ21vdXNldXAnLCBfbW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl9ldmVudElucHV0Lm9uKCdtb3VzZW1vdmUnLCBfbW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3Njcm9sbFN5bmMgPSBuZXcgU2Nyb2xsU3luYyh0aGlzLm9wdGlvbnMuc2Nyb2xsU3luYyk7XG4gICAgdGhpcy5fZXZlbnRJbnB1dC5waXBlKHRoaXMuX3Njcm9sbFN5bmMpO1xuICAgIHRoaXMuX3Njcm9sbFN5bmMub24oJ3VwZGF0ZScsIF9zY3JvbGxVcGRhdGUuYmluZCh0aGlzKSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VDb250YWluZXIpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBuZXcgQ29udGFpbmVyU3VyZmFjZSh0aGlzLm9wdGlvbnMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYWRkKHtcbiAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlkO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5hdXRvUGlwZUV2ZW50cykge1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmUodGhpcy5jb250YWluZXIpO1xuICAgICAgICAgICAgRXZlbnRIYW5kbGVyLnNldElucHV0SGFuZGxlcih0aGlzLmNvbnRhaW5lciwgdGhpcyk7XG4gICAgICAgICAgICBFdmVudEhhbmRsZXIuc2V0T3V0cHV0SGFuZGxlcih0aGlzLmNvbnRhaW5lciwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUpO1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTY3JvbGxDb250cm9sbGVyO1xuU2Nyb2xsQ29udHJvbGxlci5Cb3VuZHMgPSBCb3VuZHM7XG5TY3JvbGxDb250cm9sbGVyLlBhZ2luYXRpb25Nb2RlID0gUGFnaW5hdGlvbk1vZGU7XG5TY3JvbGxDb250cm9sbGVyLkRFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICB1c2VDb250YWluZXI6IGZhbHNlLFxuICAgIGNvbnRhaW5lcjogeyBwcm9wZXJ0aWVzOiB7IG92ZXJmbG93OiAnaGlkZGVuJyB9IH0sXG4gICAgdmlzaWJsZUl0ZW1UaHJlc3Nob2xkOiAwLjUsXG4gICAgc2Nyb2xsUGFydGljbGU6IHt9LFxuICAgIHNjcm9sbERyYWc6IHtcbiAgICAgICAgZm9yY2VGdW5jdGlvbjogRHJhZy5GT1JDRV9GVU5DVElPTlMuUVVBRFJBVElDLFxuICAgICAgICBzdHJlbmd0aDogMC4wMDEsXG4gICAgICAgIGRpc2FibGVkOiB0cnVlXG4gICAgfSxcbiAgICBzY3JvbGxGcmljdGlvbjoge1xuICAgICAgICBmb3JjZUZ1bmN0aW9uOiBEcmFnLkZPUkNFX0ZVTkNUSU9OUy5MSU5FQVIsXG4gICAgICAgIHN0cmVuZ3RoOiAwLjAwMjUsXG4gICAgICAgIGRpc2FibGVkOiBmYWxzZVxuICAgIH0sXG4gICAgc2Nyb2xsU3ByaW5nOiB7XG4gICAgICAgIGRhbXBpbmdSYXRpbzogMSxcbiAgICAgICAgcGVyaW9kOiAzNTBcbiAgICB9LFxuICAgIHNjcm9sbFN5bmM6IHsgc2NhbGU6IDAuMiB9LFxuICAgIG92ZXJzY3JvbGw6IHRydWUsXG4gICAgcGFnaW5hdGVkOiBmYWxzZSxcbiAgICBwYWdpbmF0aW9uTW9kZTogUGFnaW5hdGlvbk1vZGUuUEFHRSxcbiAgICBwYWdpbmF0aW9uRW5lcmd5VGhyZXNzaG9sZDogMC4wMSxcbiAgICBhbGlnbm1lbnQ6IDAsXG4gICAgdG91Y2hNb3ZlRGlyZWN0aW9uVGhyZXNzaG9sZDogdW5kZWZpbmVkLFxuICAgIHRvdWNoTW92ZU5vVmVsb2NpdHlEdXJhdGlvbjogMTAwLFxuICAgIG1vdXNlTW92ZTogZmFsc2UsXG4gICAgZW5hYmxlZDogdHJ1ZSxcbiAgICBsYXlvdXRBbGw6IGZhbHNlLFxuICAgIGFsd2F5c0xheW91dDogZmFsc2UsXG4gICAgZXh0cmFCb3VuZHNTcGFjZTogW1xuICAgICAgICAxMDAsXG4gICAgICAgIDEwMFxuICAgIF0sXG4gICAgZGVidWc6IGZhbHNlXG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgTGF5b3V0Q29udHJvbGxlci5wcm90b3R5cGUuc2V0T3B0aW9ucy5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgIGlmICh0aGlzLl9zY3JvbGwpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuc2Nyb2xsU3ByaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nRm9yY2Uuc2V0T3B0aW9ucyhvcHRpb25zLnNjcm9sbFNwcmluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuc2Nyb2xsRHJhZykge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmRyYWdGb3JjZS5zZXRPcHRpb25zKG9wdGlvbnMuc2Nyb2xsRHJhZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2Nyb2xsU3luYyAmJiB0aGlzLl9zY3JvbGxTeW5jKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbFN5bmMuc2V0T3B0aW9ucyhvcHRpb25zLnNjcm9sbFN5bmMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5mdW5jdGlvbiBfaW5pdExheW91dE5vZGUobm9kZSwgc3BlYykge1xuICAgIGlmICghc3BlYyAmJiB0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMuaW5zZXJ0U3BlYykge1xuICAgICAgICBub2RlLnNldFNwZWModGhpcy5vcHRpb25zLmZsb3dPcHRpb25zLmluc2VydFNwZWMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF91cGRhdGVTcHJpbmcoKSB7XG4gICAgdmFyIHNwcmluZ1ZhbHVlID0gdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQgPyB1bmRlZmluZWQgOiB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb247XG4gICAgaWYgKHRoaXMuX3Njcm9sbC5zcHJpbmdWYWx1ZSAhPT0gc3ByaW5nVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1ZhbHVlID0gc3ByaW5nVmFsdWU7XG4gICAgICAgIGlmIChzcHJpbmdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5wZS5kZXRhY2godGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5zcHJpbmdGb3JjZUlkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nRm9yY2VJZCA9IHRoaXMuX3Njcm9sbC5wZS5hdHRhY2godGhpcy5fc2Nyb2xsLnNwcmluZ0ZvcmNlLCB0aGlzLl9zY3JvbGwucGFydGljbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ0VuZFN0YXRlLnNldDFEKHNwcmluZ1ZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5wZS53YWtlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfbW91c2VEb3duKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMubW91c2VNb3ZlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUpIHtcbiAgICAgICAgdGhpcy5yZWxlYXNlU2Nyb2xsRm9yY2UodGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5kZWx0YSk7XG4gICAgfVxuICAgIHZhciBjdXJyZW50ID0gW1xuICAgICAgICAgICAgZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgIGV2ZW50LmNsaWVudFlcbiAgICAgICAgXTtcbiAgICB2YXIgdGltZSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZSA9IHtcbiAgICAgICAgZGVsdGE6IDAsXG4gICAgICAgIHN0YXJ0OiBjdXJyZW50LFxuICAgICAgICBjdXJyZW50OiBjdXJyZW50LFxuICAgICAgICBwcmV2OiBjdXJyZW50LFxuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBwcmV2VGltZTogdGltZVxuICAgIH07XG4gICAgdGhpcy5hcHBseVNjcm9sbEZvcmNlKHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuZGVsdGEpO1xufVxuZnVuY3Rpb24gX21vdXNlTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZSB8fCAhdGhpcy5vcHRpb25zLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbW92ZURpcmVjdGlvbiA9IE1hdGguYXRhbjIoTWF0aC5hYnMoZXZlbnQuY2xpZW50WSAtIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldlsxXSksIE1hdGguYWJzKGV2ZW50LmNsaWVudFggLSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnByZXZbMF0pKSAvIChNYXRoLlBJIC8gMik7XG4gICAgdmFyIGRpcmVjdGlvbkRpZmYgPSBNYXRoLmFicyh0aGlzLl9kaXJlY3Rpb24gLSBtb3ZlRGlyZWN0aW9uKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnRvdWNoTW92ZURpcmVjdGlvblRocmVzc2hvbGQgPT09IHVuZGVmaW5lZCB8fCBkaXJlY3Rpb25EaWZmIDw9IHRoaXMub3B0aW9ucy50b3VjaE1vdmVEaXJlY3Rpb25UaHJlc3Nob2xkKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUucHJldiA9IHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuY3VycmVudDtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5jdXJyZW50ID0gW1xuICAgICAgICAgICAgZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgIGV2ZW50LmNsaWVudFlcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5wcmV2VGltZSA9IHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUudGltZTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5kaXJlY3Rpb24gPSBtb3ZlRGlyZWN0aW9uO1xuICAgICAgICB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnRpbWUgPSBEYXRlLm5vdygpO1xuICAgIH1cbiAgICB2YXIgZGVsdGEgPSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmN1cnJlbnRbdGhpcy5fZGlyZWN0aW9uXSAtIHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuc3RhcnRbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICB0aGlzLnVwZGF0ZVNjcm9sbEZvcmNlKHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuZGVsdGEsIGRlbHRhKTtcbiAgICB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmRlbHRhID0gZGVsdGE7XG59XG5mdW5jdGlvbiBfbW91c2VVcChldmVudCkge1xuICAgIGlmICghdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB2ZWxvY2l0eSA9IDA7XG4gICAgdmFyIGRpZmZUaW1lID0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS50aW1lIC0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5wcmV2VGltZTtcbiAgICBpZiAoZGlmZlRpbWUgPiAwICYmIERhdGUubm93KCkgLSB0aGlzLl9zY3JvbGwubW91c2VNb3ZlLnRpbWUgPD0gdGhpcy5vcHRpb25zLnRvdWNoTW92ZU5vVmVsb2NpdHlEdXJhdGlvbikge1xuICAgICAgICB2YXIgZGlmZk9mZnNldCA9IHRoaXMuX3Njcm9sbC5tb3VzZU1vdmUuY3VycmVudFt0aGlzLl9kaXJlY3Rpb25dIC0gdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZS5wcmV2W3RoaXMuX2RpcmVjdGlvbl07XG4gICAgICAgIHZlbG9jaXR5ID0gZGlmZk9mZnNldCAvIGRpZmZUaW1lO1xuICAgIH1cbiAgICB0aGlzLnJlbGVhc2VTY3JvbGxGb3JjZSh0aGlzLl9zY3JvbGwubW91c2VNb3ZlLmRlbHRhLCB2ZWxvY2l0eSk7XG4gICAgdGhpcy5fc2Nyb2xsLm1vdXNlTW92ZSA9IHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIF90b3VjaFN0YXJ0KGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLl90b3VjaEVuZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5fdG91Y2hFbmRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50Mikge1xuICAgICAgICAgICAgZXZlbnQyLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX3RvdWNoRW5kRXZlbnRMaXN0ZW5lcik7XG4gICAgICAgICAgICBfdG91Y2hFbmQuY2FsbCh0aGlzLCBldmVudDIpO1xuICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgfVxuICAgIHZhciBvbGRUb3VjaGVzQ291bnQgPSB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGg7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBqO1xuICAgIHZhciB0b3VjaEZvdW5kO1xuICAgIHdoaWxlIChpIDwgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBhY3RpdmVUb3VjaCA9IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzW2ldO1xuICAgICAgICB0b3VjaEZvdW5kID0gZmFsc2U7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBldmVudC50b3VjaGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgdG91Y2ggPSBldmVudC50b3VjaGVzW2pdO1xuICAgICAgICAgICAgaWYgKHRvdWNoLmlkZW50aWZpZXIgPT09IGFjdGl2ZVRvdWNoLmlkKSB7XG4gICAgICAgICAgICAgICAgdG91Y2hGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0b3VjaEZvdW5kKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGV2ZW50LnRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoYW5nZWRUb3VjaCA9IGV2ZW50LnRvdWNoZXNbaV07XG4gICAgICAgIHRvdWNoRm91bmQgPSBmYWxzZTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXNbal0uaWQgPT09IGNoYW5nZWRUb3VjaC5pZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgdG91Y2hGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0b3VjaEZvdW5kKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IFtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlZFRvdWNoLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZWRUb3VjaC5jbGllbnRZXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHZhciB0aW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBjaGFuZ2VkVG91Y2guaWRlbnRpZmllcixcbiAgICAgICAgICAgICAgICBzdGFydDogY3VycmVudCxcbiAgICAgICAgICAgICAgICBjdXJyZW50OiBjdXJyZW50LFxuICAgICAgICAgICAgICAgIHByZXY6IGN1cnJlbnQsXG4gICAgICAgICAgICAgICAgdGltZTogdGltZSxcbiAgICAgICAgICAgICAgICBwcmV2VGltZTogdGltZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGFuZ2VkVG91Y2gudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fdG91Y2hFbmRFdmVudExpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW9sZFRvdWNoZXNDb3VudCAmJiB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5hcHBseVNjcm9sbEZvcmNlKDApO1xuICAgICAgICB0aGlzLl9zY3JvbGwudG91Y2hEZWx0YSA9IDA7XG4gICAgfVxufVxuZnVuY3Rpb24gX3RvdWNoTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLmVuYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcHJpbWFyeVRvdWNoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQuY2hhbmdlZFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNoYW5nZWRUb3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzW2ldO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgdG91Y2ggPSB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlc1tqXTtcbiAgICAgICAgICAgIGlmICh0b3VjaC5pZCA9PT0gY2hhbmdlZFRvdWNoLmlkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgbW92ZURpcmVjdGlvbiA9IE1hdGguYXRhbjIoTWF0aC5hYnMoY2hhbmdlZFRvdWNoLmNsaWVudFkgLSB0b3VjaC5wcmV2WzFdKSwgTWF0aC5hYnMoY2hhbmdlZFRvdWNoLmNsaWVudFggLSB0b3VjaC5wcmV2WzBdKSkgLyAoTWF0aC5QSSAvIDIpO1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3Rpb25EaWZmID0gTWF0aC5hYnModGhpcy5fZGlyZWN0aW9uIC0gbW92ZURpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50b3VjaE1vdmVEaXJlY3Rpb25UaHJlc3Nob2xkID09PSB1bmRlZmluZWQgfHwgZGlyZWN0aW9uRGlmZiA8PSB0aGlzLm9wdGlvbnMudG91Y2hNb3ZlRGlyZWN0aW9uVGhyZXNzaG9sZCkge1xuICAgICAgICAgICAgICAgICAgICB0b3VjaC5wcmV2ID0gdG91Y2guY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2guY3VycmVudCA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZWRUb3VjaC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlZFRvdWNoLmNsaWVudFlcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2gucHJldlRpbWUgPSB0b3VjaC50aW1lO1xuICAgICAgICAgICAgICAgICAgICB0b3VjaC5kaXJlY3Rpb24gPSBtb3ZlRGlyZWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0b3VjaC50aW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRvdWNoID0gaiA9PT0gMCA/IHRvdWNoIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocHJpbWFyeVRvdWNoKSB7XG4gICAgICAgIHZhciBkZWx0YSA9IHByaW1hcnlUb3VjaC5jdXJyZW50W3RoaXMuX2RpcmVjdGlvbl0gLSBwcmltYXJ5VG91Y2guc3RhcnRbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICAgICAgdGhpcy51cGRhdGVTY3JvbGxGb3JjZSh0aGlzLl9zY3JvbGwudG91Y2hEZWx0YSwgZGVsdGEpO1xuICAgICAgICB0aGlzLl9zY3JvbGwudG91Y2hEZWx0YSA9IGRlbHRhO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF90b3VjaEVuZChldmVudCkge1xuICAgIHZhciBwcmltYXJ5VG91Y2ggPSB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGggPyB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlc1swXSA6IHVuZGVmaW5lZDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50LmNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkVG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1tpXTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLl9zY3JvbGwuYWN0aXZlVG91Y2hlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHRvdWNoID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXNbal07XG4gICAgICAgICAgICBpZiAodG91Y2guaWQgPT09IGNoYW5nZWRUb3VjaC5pZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSAwICYmIHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3UHJpbWFyeVRvdWNoID0gdGhpcy5fc2Nyb2xsLmFjdGl2ZVRvdWNoZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIG5ld1ByaW1hcnlUb3VjaC5zdGFydFswXSA9IG5ld1ByaW1hcnlUb3VjaC5jdXJyZW50WzBdIC0gKHRvdWNoLmN1cnJlbnRbMF0gLSB0b3VjaC5zdGFydFswXSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1ByaW1hcnlUb3VjaC5zdGFydFsxXSA9IG5ld1ByaW1hcnlUb3VjaC5jdXJyZW50WzFdIC0gKHRvdWNoLmN1cnJlbnRbMV0gLSB0b3VjaC5zdGFydFsxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghcHJpbWFyeVRvdWNoIHx8IHRoaXMuX3Njcm9sbC5hY3RpdmVUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB2ZWxvY2l0eSA9IDA7XG4gICAgdmFyIGRpZmZUaW1lID0gcHJpbWFyeVRvdWNoLnRpbWUgLSBwcmltYXJ5VG91Y2gucHJldlRpbWU7XG4gICAgaWYgKGRpZmZUaW1lID4gMCAmJiBEYXRlLm5vdygpIC0gcHJpbWFyeVRvdWNoLnRpbWUgPD0gdGhpcy5vcHRpb25zLnRvdWNoTW92ZU5vVmVsb2NpdHlEdXJhdGlvbikge1xuICAgICAgICB2YXIgZGlmZk9mZnNldCA9IHByaW1hcnlUb3VjaC5jdXJyZW50W3RoaXMuX2RpcmVjdGlvbl0gLSBwcmltYXJ5VG91Y2gucHJldlt0aGlzLl9kaXJlY3Rpb25dO1xuICAgICAgICB2ZWxvY2l0eSA9IGRpZmZPZmZzZXQgLyBkaWZmVGltZTtcbiAgICB9XG4gICAgdmFyIGRlbHRhID0gdGhpcy5fc2Nyb2xsLnRvdWNoRGVsdGE7XG4gICAgdGhpcy5yZWxlYXNlU2Nyb2xsRm9yY2UoZGVsdGEsIHZlbG9jaXR5KTtcbiAgICB0aGlzLl9zY3JvbGwudG91Y2hEZWx0YSA9IDA7XG59XG5mdW5jdGlvbiBfc2Nyb2xsVXBkYXRlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZW5hYmxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBvZmZzZXQgPSBBcnJheS5pc0FycmF5KGV2ZW50LmRlbHRhKSA/IGV2ZW50LmRlbHRhW3RoaXMuX2RpcmVjdGlvbl0gOiBldmVudC5kZWx0YTtcbiAgICB0aGlzLnNjcm9sbChvZmZzZXQpO1xufVxuZnVuY3Rpb24gX3NldFBhcnRpY2xlKHBvc2l0aW9uLCB2ZWxvY2l0eSwgcGhhc2UpIHtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwucGFydGljbGVWYWx1ZSA9IHBvc2l0aW9uO1xuICAgICAgICB0aGlzLl9zY3JvbGwucGFydGljbGUuc2V0UG9zaXRpb24xRChwb3NpdGlvbik7XG4gICAgfVxuICAgIGlmICh2ZWxvY2l0eSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHZhciBvbGRWZWxvY2l0eSA9IHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5nZXRWZWxvY2l0eTFEKCk7XG4gICAgICAgIGlmIChvbGRWZWxvY2l0eSAhPT0gdmVsb2NpdHkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5zZXRWZWxvY2l0eTFEKHZlbG9jaXR5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIF9jYWxjU2Nyb2xsT2Zmc2V0KG5vcm1hbGl6ZSwgcmVmcmVzaFBhcnRpY2xlKSB7XG4gICAgaWYgKHJlZnJlc2hQYXJ0aWNsZSB8fCB0aGlzLl9zY3JvbGwucGFydGljbGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5wYXJ0aWNsZVZhbHVlID0gdGhpcy5fc2Nyb2xsLnBhcnRpY2xlLmdldFBvc2l0aW9uMUQoKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnBhcnRpY2xlVmFsdWUgPSBNYXRoLnJvdW5kKHRoaXMuX3Njcm9sbC5wYXJ0aWNsZVZhbHVlICogMTAwMCkgLyAxMDAwO1xuICAgIH1cbiAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5fc2Nyb2xsLnBhcnRpY2xlVmFsdWU7XG4gICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxEZWx0YSB8fCB0aGlzLl9zY3JvbGwubm9ybWFsaXplZFNjcm9sbERlbHRhKSB7XG4gICAgICAgIHNjcm9sbE9mZnNldCArPSB0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGEgKyB0aGlzLl9zY3JvbGwubm9ybWFsaXplZFNjcm9sbERlbHRhO1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgJiBCb3VuZHMuUFJFViAmJiBzY3JvbGxPZmZzZXQgPiB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gfHwgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgJiBCb3VuZHMuTkVYVCAmJiBzY3JvbGxPZmZzZXQgPCB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gfHwgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPT09IEJvdW5kcy5CT1RIKSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgPSB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vcm1hbGl6ZSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwubm9ybWFsaXplZFNjcm9sbERlbHRhID0gMDtcbiAgICAgICAgICAgICAgICBfc2V0UGFydGljbGUuY2FsbCh0aGlzLCBzY3JvbGxPZmZzZXQsIHVuZGVmaW5lZCwgJ19jYWxjU2Nyb2xsT2Zmc2V0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwubm9ybWFsaXplZFNjcm9sbERlbHRhICs9IHRoaXMuX3Njcm9sbC5zY3JvbGxEZWx0YTtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEZWx0YSA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50ICYmIHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZSkge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHNjcm9sbE9mZnNldCA9IChzY3JvbGxPZmZzZXQgKyB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgKyB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24pIC8gMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjcm9sbE9mZnNldCArPSB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMub3ZlcnNjcm9sbCkge1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPT09IEJvdW5kcy5CT1RIIHx8IHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID09PSBCb3VuZHMuUFJFViAmJiBzY3JvbGxPZmZzZXQgPiB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gfHwgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPT09IEJvdW5kcy5ORVhUICYmIHNjcm9sbE9mZnNldCA8IHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbikge1xuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0ID0gdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzY3JvbGxPZmZzZXQ7XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5fY2FsY1Njcm9sbEhlaWdodCA9IGZ1bmN0aW9uIChuZXh0LCBsYXN0Tm9kZU9ubHkpIHtcbiAgICB2YXIgY2FsY2VkSGVpZ2h0ID0gMDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUobmV4dCk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUuX2ludmFsaWRhdGVkKSB7XG4gICAgICAgICAgICBpZiAobm9kZS50cnVlU2l6ZVJlcXVlc3RlZCkge1xuICAgICAgICAgICAgICAgIGNhbGNlZEhlaWdodCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlLnNjcm9sbExlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2FsY2VkSGVpZ2h0ID0gbGFzdE5vZGVPbmx5ID8gbm9kZS5zY3JvbGxMZW5ndGggOiBjYWxjZWRIZWlnaHQgKyBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgICAgICBpZiAoIW5leHQgJiYgbGFzdE5vZGVPbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbmV4dCA/IG5vZGUuX25leHQgOiBub2RlLl9wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gY2FsY2VkSGVpZ2h0O1xufTtcbmZ1bmN0aW9uIF9jYWxjQm91bmRzKHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIHZhciBwcmV2SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodChmYWxzZSk7XG4gICAgdmFyIG5leHRIZWlnaHQgPSB0aGlzLl9jYWxjU2Nyb2xsSGVpZ2h0KHRydWUpO1xuICAgIHZhciBlbmZvcmVNaW5TaXplID0gdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcyAmJiB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLnNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQ7XG4gICAgaWYgKHByZXZIZWlnaHQgPT09IHVuZGVmaW5lZCB8fCBuZXh0SGVpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuTk9ORTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk5PTkU7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRvdGFsSGVpZ2h0O1xuICAgIGlmIChlbmZvcmVNaW5TaXplKSB7XG4gICAgICAgIGlmIChuZXh0SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgcHJldkhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0b3RhbEhlaWdodCA9IHByZXZIZWlnaHQgKyBuZXh0SGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b3RhbEhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHRvdGFsSGVpZ2h0IDw9IHNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuQk9USDtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPyAtbmV4dEhlaWdodCA6IHByZXZIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk1JTlNJWkU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgaWYgKGVuZm9yZU1pblNpemUpIHtcbiAgICAgICAgICAgIGlmIChuZXh0SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgc2Nyb2xsT2Zmc2V0ICsgbmV4dEhlaWdodCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuTkVYVDtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSAtbmV4dEhlaWdodDtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk5FWFRCT1VORFM7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGZpcnN0UHJldkl0ZW1IZWlnaHQgPSB0aGlzLl9jYWxjU2Nyb2xsSGVpZ2h0KGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChuZXh0SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgZmlyc3RQcmV2SXRlbUhlaWdodCAmJiBzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0ICsgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDw9IGZpcnN0UHJldkl0ZW1IZWlnaHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9IEJvdW5kcy5ORVhUO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IG5leHRIZWlnaHQgLSAoc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIC0gZmlyc3RQcmV2SXRlbUhlaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5ORVhUQk9VTkRTO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwcmV2SGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgc2Nyb2xsT2Zmc2V0IC0gcHJldkhlaWdodCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9IEJvdW5kcy5QUkVWO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gcHJldkhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuUFJFVkJPVU5EUztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCkge1xuICAgICAgICBpZiAocHJldkhlaWdodCAhPT0gdW5kZWZpbmVkICYmIHNjcm9sbE9mZnNldCAtIHByZXZIZWlnaHQgPj0gLXNpemVbdGhpcy5fZGlyZWN0aW9uXSkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmJvdW5kc1JlYWNoZWQgPSBCb3VuZHMuUFJFVjtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IC1zaXplW3RoaXMuX2RpcmVjdGlvbl0gKyBwcmV2SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5QUkVWQk9VTkRTO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG5leHRCb3VuZHMgPSBlbmZvcmVNaW5TaXplID8gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDogdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlLCB0cnVlKTtcbiAgICAgICAgaWYgKG5leHRIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0IDw9IG5leHRCb3VuZHMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID0gQm91bmRzLk5FWFQ7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBuZXh0Qm91bmRzIC0gbmV4dEhlaWdodDtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuTkVYVEJPVU5EUztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9IEJvdW5kcy5OT05FO1xuICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLk5PTkU7XG59XG5mdW5jdGlvbiBfY2FsY1Njcm9sbFRvT2Zmc2V0KHNpemUsIHNjcm9sbE9mZnNldCkge1xuICAgIHZhciBzY3JvbGxUb1JlbmRlck5vZGUgPSB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9SZW5kZXJOb2RlIHx8IHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZTtcbiAgICBpZiAoIXNjcm9sbFRvUmVuZGVyTm9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9PT0gQm91bmRzLkJPVEggfHwgIXRoaXMuX3Njcm9sbC5zY3JvbGxUb0RpcmVjdGlvbiAmJiB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZCA9PT0gQm91bmRzLlBSRVYgfHwgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvRGlyZWN0aW9uICYmIHRoaXMuX3Njcm9sbC5ib3VuZHNSZWFjaGVkID09PSBCb3VuZHMuTkVYVCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBmb3VuZE5vZGU7XG4gICAgdmFyIHNjcm9sbFRvT2Zmc2V0ID0gMDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBjb3VudCsrO1xuICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8IG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICBzY3JvbGxUb09mZnNldCAtPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5yZW5kZXJOb2RlID09PSBzY3JvbGxUb1JlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIGZvdW5kTm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgIHNjcm9sbFRvT2Zmc2V0IC09IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICBpZiAoIWZvdW5kTm9kZSkge1xuICAgICAgICBzY3JvbGxUb09mZnNldCA9IDA7XG4gICAgICAgIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKGZhbHNlKTtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIGlmICghbm9kZS5faW52YWxpZGF0ZWQgfHwgbm9kZS5zY3JvbGxMZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9PZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZS5yZW5kZXJOb2RlID09PSBzY3JvbGxUb1JlbmRlck5vZGUpIHtcbiAgICAgICAgICAgICAgICBmb3VuZE5vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUb09mZnNldCArPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLl9wcmV2O1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChmb3VuZE5vZGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsVG9PZmZzZXQgLSBmb3VuZE5vZGUuc2Nyb2xsTGVuZ3RoIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gPSBzY3JvbGxUb09mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5FTlNVUkVWSVNJQkxFO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsVG9PZmZzZXQgPiBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIC0gc2Nyb2xsVG9PZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuRU5TVVJFVklTSUJMRTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZvdW5kTm9kZS50cnVlU2l6ZVJlcXVlc3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmVuc3VyZVZpc2libGVSZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUb09mZnNldCA9IC1zY3JvbGxUb09mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsVG9PZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNjcm9sbFRvT2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLkVOU1VSRVZJU0lCTEU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY3JvbGxUb09mZnNldCArIGZvdW5kTm9kZS5zY3JvbGxMZW5ndGggPiBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIC0gKHNjcm9sbFRvT2Zmc2V0ICsgZm91bmROb2RlLnNjcm9sbExlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdTb3VyY2UgPSBTcHJpbmdTb3VyY2UuRU5TVVJFVklTSUJMRTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWZvdW5kTm9kZS50cnVlU2l6ZVJlcXVlc3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmVuc3VyZVZpc2libGVSZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gc2Nyb2xsVG9PZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLkdPVE9TRVFVRU5DRTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsVG9EaXJlY3Rpb24pIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gc2Nyb2xsT2Zmc2V0IC0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc3ByaW5nU291cmNlID0gU3ByaW5nU291cmNlLkdPVE9ORVhURElSRUNUSU9OO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiA9IHNjcm9sbE9mZnNldCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1NvdXJjZSA9IFNwcmluZ1NvdXJjZS5HT1RPUFJFVkRJUkVDVElPTjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ZpZXdTZXF1ZW5jZS5jbGVhbnVwKSB7XG4gICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0KCkgIT09IHNjcm9sbFRvUmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gdGhpcy5fc2Nyb2xsLnNjcm9sbFRvRGlyZWN0aW9uID8gdmlld1NlcXVlbmNlLmdldE5leHQodHJ1ZSkgOiB2aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXModHJ1ZSk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gX3NuYXBUb1BhZ2UoKSB7XG4gICAgaWYgKCF0aGlzLm9wdGlvbnMucGFnaW5hdGVkIHx8IHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50IHx8IHRoaXMuX3Njcm9sbC5zcHJpbmdQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGl0ZW07XG4gICAgc3dpdGNoICh0aGlzLm9wdGlvbnMucGFnaW5hdGlvbk1vZGUpIHtcbiAgICBjYXNlIFBhZ2luYXRpb25Nb2RlLlNDUk9MTDpcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGFnaW5hdGlvbkVuZXJneVRocmVzc2hvbGQgfHwgTWF0aC5hYnModGhpcy5fc2Nyb2xsLnBhcnRpY2xlLmdldEVuZXJneSgpKSA8PSB0aGlzLm9wdGlvbnMucGFnaW5hdGlvbkVuZXJneVRocmVzc2hvbGQpIHtcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5nZXRMYXN0VmlzaWJsZUl0ZW0oKSA6IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvUmVuZGVyTm9kZShpdGVtLnJlbmRlck5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgUGFnaW5hdGlvbk1vZGUuUEFHRTpcbiAgICAgICAgaXRlbSA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPyB0aGlzLmdldExhc3RWaXNpYmxlSXRlbSgpIDogdGhpcy5nZXRGaXJzdFZpc2libGVJdGVtKCk7XG4gICAgICAgIGlmIChpdGVtICYmIGl0ZW0ucmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5nb1RvUmVuZGVyTm9kZShpdGVtLnJlbmRlck5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9ub3JtYWxpemVQcmV2Vmlld1NlcXVlbmNlKHNjcm9sbE9mZnNldCkge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgdmFyIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgdmFyIG5vcm1hbGl6ZU5leHRQcmV2ID0gZmFsc2U7XG4gICAgdmFyIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKGZhbHNlKTtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8ICFub2RlLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub3JtYWxpemVOZXh0UHJldikge1xuICAgICAgICAgICAgdGhpcy5fdmlld1NlcXVlbmNlID0gbm9kZS5fdmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICAgICAgICAgIG5vcm1hbGl6ZU5leHRQcmV2ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbm9kZS50cnVlU2l6ZVJlcXVlc3RlZCB8fCBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxPZmZzZXQgLT0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIGNvdW50Kys7XG4gICAgICAgIGlmIChub2RlLnNjcm9sbExlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICBub3JtYWxpemVOZXh0UHJldiA9IHNjcm9sbE9mZnNldCA+PSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl92aWV3U2VxdWVuY2UgPSBub2RlLl92aWV3U2VxdWVuY2U7XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5fcHJldjtcbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG59XG5mdW5jdGlvbiBfbm9ybWFsaXplTmV4dFZpZXdTZXF1ZW5jZShzY3JvbGxPZmZzZXQpIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIHZhciBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSh0cnVlKTtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8IG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbm9kZS50cnVlU2l6ZVJlcXVlc3RlZCB8fCAhbm9kZS5fdmlld1NlcXVlbmNlIHx8IHNjcm9sbE9mZnNldCA+IDAgJiYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50IHx8IG5vZGUuc2Nyb2xsTGVuZ3RoICE9PSAwKSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgIHNjcm9sbE9mZnNldCArPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUuc2Nyb2xsTGVuZ3RoIHx8IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IG5vZGUuX3ZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50KSB7XG4gICAgICAgICAgICBzY3JvbGxPZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplZFNjcm9sbE9mZnNldDtcbn1cbmZ1bmN0aW9uIF9ub3JtYWxpemVWaWV3U2VxdWVuY2Uoc2l6ZSwgc2Nyb2xsT2Zmc2V0KSB7XG4gICAgdmFyIGNhcHMgPSB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzO1xuICAgIGlmIChjYXBzICYmIGNhcHMuZGVidWcgJiYgY2Fwcy5kZWJ1Zy5ub3JtYWxpemUgIT09IHVuZGVmaW5lZCAmJiAhY2Fwcy5kZWJ1Zy5ub3JtYWxpemUpIHtcbiAgICAgICAgcmV0dXJuIHNjcm9sbE9mZnNldDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3Njcm9sbC5zY3JvbGxGb3JjZUNvdW50KSB7XG4gICAgICAgIHJldHVybiBzY3JvbGxPZmZzZXQ7XG4gICAgfVxuICAgIHZhciBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIGlmICh0aGlzLm9wdGlvbnMuYWxpZ25tZW50ICYmIHNjcm9sbE9mZnNldCA8IDApIHtcbiAgICAgICAgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IF9ub3JtYWxpemVOZXh0Vmlld1NlcXVlbmNlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50ICYmIHNjcm9sbE9mZnNldCA+IDApIHtcbiAgICAgICAgbm9ybWFsaXplZFNjcm9sbE9mZnNldCA9IF9ub3JtYWxpemVQcmV2Vmlld1NlcXVlbmNlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0KTtcbiAgICB9XG4gICAgaWYgKG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPT09IHNjcm9sbE9mZnNldCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCAmJiBzY3JvbGxPZmZzZXQgPiAwKSB7XG4gICAgICAgICAgICBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gX25vcm1hbGl6ZVByZXZWaWV3U2VxdWVuY2UuY2FsbCh0aGlzLCBzY3JvbGxPZmZzZXQpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMuYWxpZ25tZW50ICYmIHNjcm9sbE9mZnNldCA8IDApIHtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgPSBfbm9ybWFsaXplTmV4dFZpZXdTZXF1ZW5jZS5jYWxsKHRoaXMsIHNjcm9sbE9mZnNldCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQgIT09IHNjcm9sbE9mZnNldCkge1xuICAgICAgICB2YXIgZGVsdGEgPSBub3JtYWxpemVkU2Nyb2xsT2Zmc2V0IC0gc2Nyb2xsT2Zmc2V0O1xuICAgICAgICB2YXIgcGFydGljbGVWYWx1ZSA9IHRoaXMuX3Njcm9sbC5wYXJ0aWNsZS5nZXRQb3NpdGlvbjFEKCk7XG4gICAgICAgIF9zZXRQYXJ0aWNsZS5jYWxsKHRoaXMsIHBhcnRpY2xlVmFsdWUgKyBkZWx0YSwgdW5kZWZpbmVkLCAnbm9ybWFsaXplJyk7XG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGwuc3ByaW5nUG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uICs9IGRlbHRhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYXBzICYmIGNhcHMuc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCkge1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQgLT0gZGVsdGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG59XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRWaXNpYmxlSXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNpemUgPSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlO1xuICAgIHZhciBzY3JvbGxPZmZzZXQgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSA6IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSh0cnVlKTtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8IG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQgfHwgc2Nyb2xsT2Zmc2V0ID4gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxPZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIGlmIChzY3JvbGxPZmZzZXQgPj0gMCAmJiBub2RlLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBpbmRleDogbm9kZS5fdmlld1NlcXVlbmNlLmdldEluZGV4KCksXG4gICAgICAgICAgICAgICAgdmlld1NlcXVlbmNlOiBub2RlLl92aWV3U2VxdWVuY2UsXG4gICAgICAgICAgICAgICAgcmVuZGVyTm9kZTogbm9kZS5yZW5kZXJOb2RlLFxuICAgICAgICAgICAgICAgIHZpc2libGVQZXJjOiBub2RlLnNjcm9sbExlbmd0aCA/IChNYXRoLm1pbihzY3JvbGxPZmZzZXQsIHNpemVbdGhpcy5fZGlyZWN0aW9uXSkgLSBNYXRoLm1heChzY3JvbGxPZmZzZXQgLSBub2RlLnNjcm9sbExlbmd0aCwgMCkpIC8gbm9kZS5zY3JvbGxMZW5ndGggOiAxLFxuICAgICAgICAgICAgICAgIHNjcm9sbE9mZnNldDogc2Nyb2xsT2Zmc2V0IC0gbm9kZS5zY3JvbGxMZW5ndGgsXG4gICAgICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoOiBub2RlLnNjcm9sbExlbmd0aCxcbiAgICAgICAgICAgICAgICBfbm9kZTogbm9kZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgfVxuICAgIHNjcm9sbE9mZnNldCA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPyB0aGlzLl9zY3JvbGwudW5ub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ICsgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDogdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldDtcbiAgICBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZShmYWxzZSk7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlLl9pbnZhbGlkYXRlZCB8fCBub2RlLnNjcm9sbExlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IHNjcm9sbE9mZnNldCA8IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHNjcm9sbE9mZnNldCAtPSBub2RlLnNjcm9sbExlbmd0aDtcbiAgICAgICAgaWYgKHNjcm9sbE9mZnNldCA8IHNpemVbdGhpcy5fZGlyZWN0aW9uXSAmJiBub2RlLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHJlc3VsdC51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICBpbmRleDogbm9kZS5fdmlld1NlcXVlbmNlLmdldEluZGV4KCksXG4gICAgICAgICAgICAgICAgdmlld1NlcXVlbmNlOiBub2RlLl92aWV3U2VxdWVuY2UsXG4gICAgICAgICAgICAgICAgcmVuZGVyTm9kZTogbm9kZS5yZW5kZXJOb2RlLFxuICAgICAgICAgICAgICAgIHZpc2libGVQZXJjOiBub2RlLnNjcm9sbExlbmd0aCA/IChNYXRoLm1pbihzY3JvbGxPZmZzZXQgKyBub2RlLnNjcm9sbExlbmd0aCwgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSAtIE1hdGgubWF4KHNjcm9sbE9mZnNldCwgMCkpIC8gbm9kZS5zY3JvbGxMZW5ndGggOiAxLFxuICAgICAgICAgICAgICAgIHNjcm9sbE9mZnNldDogc2Nyb2xsT2Zmc2V0LFxuICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aDogbm9kZS5zY3JvbGxMZW5ndGgsXG4gICAgICAgICAgICAgICAgX25vZGU6IG5vZGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdldEZpcnN0VmlzaWJsZUl0ZW0gPSBmdW5jdGlvbiAoaW5jbHVkZU5vZGUpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuX2NvbnRleHRTaXplQ2FjaGU7XG4gICAgdmFyIHNjcm9sbE9mZnNldCA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPyB0aGlzLl9zY3JvbGwudW5ub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ICsgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dIDogdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUodHJ1ZSk7XG4gICAgdmFyIG5vZGVGb3VuZFZpc2libGVQZXJjO1xuICAgIHZhciBub2RlRm91bmRTY3JvbGxPZmZzZXQ7XG4gICAgdmFyIG5vZGVGb3VuZDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAoIW5vZGUuX2ludmFsaWRhdGVkIHx8IG5vZGUuc2Nyb2xsTGVuZ3RoID09PSB1bmRlZmluZWQgfHwgc2Nyb2xsT2Zmc2V0ID4gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxPZmZzZXQgKz0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIGlmIChzY3JvbGxPZmZzZXQgPj0gMCAmJiBub2RlLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIG5vZGVGb3VuZFZpc2libGVQZXJjID0gbm9kZS5zY3JvbGxMZW5ndGggPyAoTWF0aC5taW4oc2Nyb2xsT2Zmc2V0LCBzaXplW3RoaXMuX2RpcmVjdGlvbl0pIC0gTWF0aC5tYXgoc2Nyb2xsT2Zmc2V0IC0gbm9kZS5zY3JvbGxMZW5ndGgsIDApKSAvIG5vZGUuc2Nyb2xsTGVuZ3RoIDogMTtcbiAgICAgICAgICAgIG5vZGVGb3VuZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldCAtIG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgaWYgKG5vZGVGb3VuZFZpc2libGVQZXJjID49IHRoaXMub3B0aW9ucy52aXNpYmxlSXRlbVRocmVzc2hvbGQgfHwgbm9kZUZvdW5kU2Nyb2xsT2Zmc2V0ID49IDApIHtcbiAgICAgICAgICAgICAgICBub2RlRm91bmQgPSBub2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9uZXh0O1xuICAgIH1cbiAgICBzY3JvbGxPZmZzZXQgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID8gdGhpcy5fc2Nyb2xsLnVubm9ybWFsaXplZFNjcm9sbE9mZnNldCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSA6IHRoaXMuX3Njcm9sbC51bm5vcm1hbGl6ZWRTY3JvbGxPZmZzZXQ7XG4gICAgbm9kZSA9IHRoaXMuX25vZGVzLmdldFN0YXJ0RW51bU5vZGUoZmFsc2UpO1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS5faW52YWxpZGF0ZWQgfHwgbm9kZS5zY3JvbGxMZW5ndGggPT09IHVuZGVmaW5lZCB8fCBzY3JvbGxPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBzY3JvbGxPZmZzZXQgLT0gbm9kZS5zY3JvbGxMZW5ndGg7XG4gICAgICAgIGlmIChzY3JvbGxPZmZzZXQgPCBzaXplW3RoaXMuX2RpcmVjdGlvbl0gJiYgbm9kZS5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgICAgICB2YXIgdmlzaWJsZVBlcmMgPSBub2RlLnNjcm9sbExlbmd0aCA/IChNYXRoLm1pbihzY3JvbGxPZmZzZXQgKyBub2RlLnNjcm9sbExlbmd0aCwgc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSAtIE1hdGgubWF4KHNjcm9sbE9mZnNldCwgMCkpIC8gbm9kZS5zY3JvbGxMZW5ndGggOiAxO1xuICAgICAgICAgICAgaWYgKHZpc2libGVQZXJjID49IHRoaXMub3B0aW9ucy52aXNpYmxlSXRlbVRocmVzc2hvbGQgfHwgc2Nyb2xsT2Zmc2V0ID49IDApIHtcbiAgICAgICAgICAgICAgICBub2RlRm91bmRWaXNpYmxlUGVyYyA9IHZpc2libGVQZXJjO1xuICAgICAgICAgICAgICAgIG5vZGVGb3VuZFNjcm9sbE9mZnNldCA9IHNjcm9sbE9mZnNldDtcbiAgICAgICAgICAgICAgICBub2RlRm91bmQgPSBub2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLl9wcmV2O1xuICAgIH1cbiAgICByZXR1cm4gbm9kZUZvdW5kID8ge1xuICAgICAgICBpbmRleDogbm9kZUZvdW5kLl92aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSxcbiAgICAgICAgdmlld1NlcXVlbmNlOiBub2RlRm91bmQuX3ZpZXdTZXF1ZW5jZSxcbiAgICAgICAgcmVuZGVyTm9kZTogbm9kZUZvdW5kLnJlbmRlck5vZGUsXG4gICAgICAgIHZpc2libGVQZXJjOiBub2RlRm91bmRWaXNpYmxlUGVyYyxcbiAgICAgICAgc2Nyb2xsT2Zmc2V0OiBub2RlRm91bmRTY3JvbGxPZmZzZXQsXG4gICAgICAgIHNjcm9sbExlbmd0aDogbm9kZUZvdW5kLnNjcm9sbExlbmd0aCxcbiAgICAgICAgX25vZGU6IG5vZGVGb3VuZFxuICAgIH0gOiB1bmRlZmluZWQ7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ2V0TGFzdFZpc2libGVJdGVtID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpdGVtcyA9IHRoaXMuZ2V0VmlzaWJsZUl0ZW1zKCk7XG4gICAgdmFyIHNpemUgPSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlO1xuICAgIGZvciAodmFyIGkgPSBpdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgaXRlbSA9IGl0ZW1zW2ldO1xuICAgICAgICBpZiAoaXRlbS52aXNpYmxlUGVyYyA+PSB0aGlzLm9wdGlvbnMudmlzaWJsZUl0ZW1UaHJlc3Nob2xkIHx8IGl0ZW0uc2Nyb2xsT2Zmc2V0ICsgaXRlbS5zY3JvbGxMZW5ndGggPD0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaXRlbXMubGVuZ3RoID8gaXRlbXNbaXRlbXMubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG59O1xuZnVuY3Rpb24gX2dvVG9TZXF1ZW5jZSh2aWV3U2VxdWVuY2UsIG5leHQsIG5vQW5pbWF0aW9uKSB7XG4gICAgaWYgKG5vQW5pbWF0aW9uKSB7XG4gICAgICAgIHRoaXMuX3ZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNwcmluZ1Bvc2l0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICBfdXBkYXRlU3ByaW5nLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuaGFsdCgpO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGVsdGEgPSAwO1xuICAgICAgICBfc2V0UGFydGljbGUuY2FsbCh0aGlzLCAwLCAwLCAnX2dvVG9TZXF1ZW5jZScpO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9TZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvUmVuZGVyTm9kZSA9IHZpZXdTZXF1ZW5jZS5nZXQoKTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLmVuc3VyZVZpc2libGVSZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9EaXJlY3Rpb24gPSBuZXh0O1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGlydHkgPSB0cnVlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9lbnN1cmVWaXNpYmxlU2VxdWVuY2Uodmlld1NlcXVlbmNlLCBuZXh0KSB7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvU2VxdWVuY2UgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvUmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zY3JvbGwuZW5zdXJlVmlzaWJsZVJlbmRlck5vZGUgPSB2aWV3U2VxdWVuY2UuZ2V0KCk7XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbFRvRGlyZWN0aW9uID0gbmV4dDtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGlydHkgPSB0cnVlO1xufVxuZnVuY3Rpb24gX2dvVG9QYWdlKGFtb3VudCwgbm9BbmltYXRpb24pIHtcbiAgICB2YXIgdmlld1NlcXVlbmNlID0gKCFub0FuaW1hdGlvbiA/IHRoaXMuX3Njcm9sbC5zY3JvbGxUb1NlcXVlbmNlIDogdW5kZWZpbmVkKSB8fCB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgaWYgKCF0aGlzLl9zY3JvbGwuc2Nyb2xsVG9TZXF1ZW5jZSAmJiAhbm9BbmltYXRpb24pIHtcbiAgICAgICAgdmFyIGZpcnN0VmlzaWJsZUl0ZW0gPSB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgaWYgKGZpcnN0VmlzaWJsZUl0ZW0pIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IGZpcnN0VmlzaWJsZUl0ZW0udmlld1NlcXVlbmNlO1xuICAgICAgICAgICAgaWYgKGFtb3VudCA8IDAgJiYgZmlyc3RWaXNpYmxlSXRlbS5zY3JvbGxPZmZzZXQgPCAwIHx8IGFtb3VudCA+IDAgJiYgZmlyc3RWaXNpYmxlSXRlbS5zY3JvbGxPZmZzZXQgPiAwKSB7XG4gICAgICAgICAgICAgICAgYW1vdW50ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5hYnMoYW1vdW50KTsgaSsrKSB7XG4gICAgICAgIHZhciBuZXh0Vmlld1NlcXVlbmNlID0gYW1vdW50ID4gMCA/IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCkgOiB2aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICAgICAgaWYgKG5leHRWaWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IG5leHRWaWV3U2VxdWVuY2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBfZ29Ub1NlcXVlbmNlLmNhbGwodGhpcywgdmlld1NlcXVlbmNlLCBhbW91bnQgPj0gMCwgbm9BbmltYXRpb24pO1xufVxuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ29Ub0ZpcnN0UGFnZSA9IGZ1bmN0aW9uIChub0FuaW1hdGlvbikge1xuICAgIGlmICghdGhpcy5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLl8gJiYgdGhpcy5fdmlld1NlcXVlbmNlLl8ubG9vcCkge1xuICAgICAgICBMYXlvdXRVdGlsaXR5LmVycm9yKCdVbmFibGUgdG8gZ28gdG8gZmlyc3QgaXRlbSBvZiBsb29wZWQgVmlld1NlcXVlbmNlJyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgdmlld1NlcXVlbmNlID0gdGhpcy5fdmlld1NlcXVlbmNlO1xuICAgIHdoaWxlICh2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIHByZXYgPSB2aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICAgICAgaWYgKHByZXYgJiYgcHJldi5nZXQoKSkge1xuICAgICAgICAgICAgdmlld1NlcXVlbmNlID0gcHJldjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIF9nb1RvU2VxdWVuY2UuY2FsbCh0aGlzLCB2aWV3U2VxdWVuY2UsIGZhbHNlLCBub0FuaW1hdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ29Ub1ByZXZpb3VzUGFnZSA9IGZ1bmN0aW9uIChub0FuaW1hdGlvbikge1xuICAgIF9nb1RvUGFnZS5jYWxsKHRoaXMsIC0xLCBub0FuaW1hdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ29Ub05leHRQYWdlID0gZnVuY3Rpb24gKG5vQW5pbWF0aW9uKSB7XG4gICAgX2dvVG9QYWdlLmNhbGwodGhpcywgMSwgbm9BbmltYXRpb24pO1xuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdvVG9MYXN0UGFnZSA9IGZ1bmN0aW9uIChub0FuaW1hdGlvbikge1xuICAgIGlmICghdGhpcy5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLl8gJiYgdGhpcy5fdmlld1NlcXVlbmNlLl8ubG9vcCkge1xuICAgICAgICBMYXlvdXRVdGlsaXR5LmVycm9yKCdVbmFibGUgdG8gZ28gdG8gbGFzdCBpdGVtIG9mIGxvb3BlZCBWaWV3U2VxdWVuY2UnKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgd2hpbGUgKHZpZXdTZXF1ZW5jZSkge1xuICAgICAgICB2YXIgbmV4dCA9IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgIGlmIChuZXh0ICYmIG5leHQuZ2V0KCkpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IG5leHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBfZ29Ub1NlcXVlbmNlLmNhbGwodGhpcywgdmlld1NlcXVlbmNlLCB0cnVlLCBub0FuaW1hdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuZ29Ub1JlbmRlck5vZGUgPSBmdW5jdGlvbiAobm9kZSwgbm9BbmltYXRpb24pIHtcbiAgICBpZiAoIXRoaXMuX3ZpZXdTZXF1ZW5jZSB8fCAhbm9kZSkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXQoKSA9PT0gbm9kZSkge1xuICAgICAgICB2YXIgbmV4dCA9IF9jYWxjU2Nyb2xsT2Zmc2V0LmNhbGwodGhpcykgPj0gMDtcbiAgICAgICAgX2dvVG9TZXF1ZW5jZS5jYWxsKHRoaXMsIHRoaXMuX3ZpZXdTZXF1ZW5jZSwgbmV4dCwgbm9BbmltYXRpb24pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIG5leHRTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgdmFyIHByZXZTZXF1ZW5jZSA9IHRoaXMuX3ZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgIHdoaWxlICgobmV4dFNlcXVlbmNlIHx8IHByZXZTZXF1ZW5jZSkgJiYgbmV4dFNlcXVlbmNlICE9PSB0aGlzLl92aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgdmFyIG5leHROb2RlID0gbmV4dFNlcXVlbmNlID8gbmV4dFNlcXVlbmNlLmdldCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAobmV4dE5vZGUgPT09IG5vZGUpIHtcbiAgICAgICAgICAgIF9nb1RvU2VxdWVuY2UuY2FsbCh0aGlzLCBuZXh0U2VxdWVuY2UsIHRydWUsIG5vQW5pbWF0aW9uKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcmV2Tm9kZSA9IHByZXZTZXF1ZW5jZSA/IHByZXZTZXF1ZW5jZS5nZXQoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHByZXZOb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgICBfZ29Ub1NlcXVlbmNlLmNhbGwodGhpcywgcHJldlNlcXVlbmNlLCBmYWxzZSwgbm9BbmltYXRpb24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFNlcXVlbmNlID0gbmV4dE5vZGUgPyBuZXh0U2VxdWVuY2UuZ2V0TmV4dCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBwcmV2U2VxdWVuY2UgPSBwcmV2Tm9kZSA/IHByZXZTZXF1ZW5jZS5nZXRQcmV2aW91cygpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5lbnN1cmVWaXNpYmxlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFZpZXdTZXF1ZW5jZSkge1xuICAgICAgICBub2RlID0gbm9kZS5nZXQoKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUgaW5zdGFuY2VvZiBOdW1iZXIgfHwgdHlwZW9mIG5vZGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2U7XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA8IG5vZGUpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXROZXh0KCk7XG4gICAgICAgICAgICBpZiAoIXZpZXdTZXF1ZW5jZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlICh2aWV3U2VxdWVuY2UuZ2V0SW5kZXgoKSA+IG5vZGUpIHtcbiAgICAgICAgICAgIHZpZXdTZXF1ZW5jZSA9IHZpZXdTZXF1ZW5jZS5nZXRQcmV2aW91cygpO1xuICAgICAgICAgICAgaWYgKCF2aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5fdmlld1NlcXVlbmNlLmdldCgpID09PSBub2RlKSB7XG4gICAgICAgIHZhciBuZXh0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzKSA+PSAwO1xuICAgICAgICBfZW5zdXJlVmlzaWJsZVNlcXVlbmNlLmNhbGwodGhpcywgdGhpcy5fdmlld1NlcXVlbmNlLCBuZXh0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBuZXh0U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UuZ2V0TmV4dCgpO1xuICAgIHZhciBwcmV2U2VxdWVuY2UgPSB0aGlzLl92aWV3U2VxdWVuY2UuZ2V0UHJldmlvdXMoKTtcbiAgICB3aGlsZSAoKG5leHRTZXF1ZW5jZSB8fCBwcmV2U2VxdWVuY2UpICYmIG5leHRTZXF1ZW5jZSAhPT0gdGhpcy5fdmlld1NlcXVlbmNlKSB7XG4gICAgICAgIHZhciBuZXh0Tm9kZSA9IG5leHRTZXF1ZW5jZSA/IG5leHRTZXF1ZW5jZS5nZXQoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKG5leHROb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgICBfZW5zdXJlVmlzaWJsZVNlcXVlbmNlLmNhbGwodGhpcywgbmV4dFNlcXVlbmNlLCB0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcmV2Tm9kZSA9IHByZXZTZXF1ZW5jZSA/IHByZXZTZXF1ZW5jZS5nZXQoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKHByZXZOb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgICBfZW5zdXJlVmlzaWJsZVNlcXVlbmNlLmNhbGwodGhpcywgcHJldlNlcXVlbmNlLCBmYWxzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBuZXh0U2VxdWVuY2UgPSBuZXh0Tm9kZSA/IG5leHRTZXF1ZW5jZS5nZXROZXh0KCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIHByZXZTZXF1ZW5jZSA9IHByZXZOb2RlID8gcHJldlNlcXVlbmNlLmdldFByZXZpb3VzKCkgOiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLnNjcm9sbCA9IGZ1bmN0aW9uIChkZWx0YSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEZWx0YSArPSBkZWx0YTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5jYW5TY3JvbGwgPSBmdW5jdGlvbiAoZGVsdGEpIHtcbiAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzKTtcbiAgICB2YXIgcHJldkhlaWdodCA9IHRoaXMuX2NhbGNTY3JvbGxIZWlnaHQoZmFsc2UpO1xuICAgIHZhciBuZXh0SGVpZ2h0ID0gdGhpcy5fY2FsY1Njcm9sbEhlaWdodCh0cnVlKTtcbiAgICB2YXIgdG90YWxIZWlnaHQ7XG4gICAgaWYgKG5leHRIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBwcmV2SGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdG90YWxIZWlnaHQgPSBwcmV2SGVpZ2h0ICsgbmV4dEhlaWdodDtcbiAgICB9XG4gICAgaWYgKHRvdGFsSGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgdG90YWxIZWlnaHQgPD0gdGhpcy5fY29udGV4dFNpemVDYWNoZVt0aGlzLl9kaXJlY3Rpb25dKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoZGVsdGEgPCAwICYmIG5leHRIZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgbmV4dE9mZnNldCA9IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbdGhpcy5fZGlyZWN0aW9uXSAtIChzY3JvbGxPZmZzZXQgKyBuZXh0SGVpZ2h0KTtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KG5leHRPZmZzZXQsIGRlbHRhKTtcbiAgICB9IGVsc2UgaWYgKGRlbHRhID4gMCAmJiBwcmV2SGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIHByZXZPZmZzZXQgPSAtKHNjcm9sbE9mZnNldCAtIHByZXZIZWlnaHQpO1xuICAgICAgICByZXR1cm4gTWF0aC5taW4ocHJldk9mZnNldCwgZGVsdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGVsdGE7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuaGFsdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9TZXF1ZW5jZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsVG9SZW5kZXJOb2RlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX3Njcm9sbC5lbnN1cmVWaXNpYmxlUmVuZGVyTm9kZSA9IHVuZGVmaW5lZDtcbiAgICBfc2V0UGFydGljbGUuY2FsbCh0aGlzLCB1bmRlZmluZWQsIDAsICdoYWx0Jyk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuaXNTY3JvbGxpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Njcm9sbC5pc1Njcm9sbGluZztcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRCb3VuZHNSZWFjaGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9zY3JvbGwuYm91bmRzUmVhY2hlZDtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5nZXRWZWxvY2l0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc2Nyb2xsLnBhcnRpY2xlLmdldFZlbG9jaXR5MUQoKTtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5zZXRWZWxvY2l0eSA9IGZ1bmN0aW9uICh2ZWxvY2l0eSkge1xuICAgIHJldHVybiB0aGlzLl9zY3JvbGwucGFydGljbGUuc2V0VmVsb2NpdHkxRCh2ZWxvY2l0eSk7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUuYXBwbHlTY3JvbGxGb3JjZSA9IGZ1bmN0aW9uIChkZWx0YSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VTdGFydEl0ZW0gPSB0aGlzLmFsaWdubWVudCA/IHRoaXMuZ2V0TGFzdFZpc2libGVJdGVtKCkgOiB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICB9XG4gICAgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQrKztcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgKz0gZGVsdGE7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUudXBkYXRlU2Nyb2xsRm9yY2UgPSBmdW5jdGlvbiAocHJldkRlbHRhLCBuZXdEZWx0YSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIG5ld0RlbHRhIC09IHByZXZEZWx0YTtcbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgKz0gbmV3RGVsdGE7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuU2Nyb2xsQ29udHJvbGxlci5wcm90b3R5cGUucmVsZWFzZVNjcm9sbEZvcmNlID0gZnVuY3Rpb24gKGRlbHRhLCB2ZWxvY2l0eSkge1xuICAgIHRoaXMuaGFsdCgpO1xuICAgIGlmICh0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCA9PT0gMSkge1xuICAgICAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzKTtcbiAgICAgICAgX3NldFBhcnRpY2xlLmNhbGwodGhpcywgc2Nyb2xsT2Zmc2V0LCB2ZWxvY2l0eSwgJ3JlbGVhc2VTY3JvbGxGb3JjZScpO1xuICAgICAgICB0aGlzLl9zY3JvbGwucGUud2FrZSgpO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2UgPSAwO1xuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRGlydHkgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlU3RhcnRJdGVtICYmIHRoaXMub3B0aW9ucy5wYWdpbmF0ZWQgJiYgdGhpcy5vcHRpb25zLnBhZ2luYXRpb25Nb2RlID09PSBQYWdpbmF0aW9uTW9kZS5QQUdFKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuYWxpZ25tZW50ID8gdGhpcy5nZXRMYXN0VmlzaWJsZUl0ZW0oKSA6IHRoaXMuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5yZW5kZXJOb2RlICE9PSB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VTdGFydEl0ZW0ucmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdvVG9SZW5kZXJOb2RlKGl0ZW0ucmVuZGVyTm9kZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMucGFnaW5hdGlvbkVuZXJneVRocmVzc2hvbGQgJiYgTWF0aC5hYnModGhpcy5fc2Nyb2xsLnBhcnRpY2xlLmdldEVuZXJneSgpKSA+PSB0aGlzLm9wdGlvbnMucGFnaW5hdGlvbkVuZXJneVRocmVzc2hvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHkgPSB2ZWxvY2l0eSB8fCAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmVsb2NpdHkgPCAwICYmIGl0ZW0uX25vZGUuX25leHQgJiYgaXRlbS5fbm9kZS5fbmV4dC5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvVG9SZW5kZXJOb2RlKGl0ZW0uX25vZGUuX25leHQucmVuZGVyTm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmVsb2NpdHkgPj0gMCAmJiBpdGVtLl9ub2RlLl9wcmV2ICYmIGl0ZW0uX25vZGUuX3ByZXYucmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nb1RvUmVuZGVyTm9kZShpdGVtLl9ub2RlLl9wcmV2LnJlbmRlck5vZGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb1RvUmVuZGVyTm9kZShpdGVtLnJlbmRlck5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VTdGFydEl0ZW0gPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlIC09IGRlbHRhO1xuICAgIH1cbiAgICB0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudC0tO1xuICAgIHJldHVybiB0aGlzO1xufTtcblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmdldFNwZWMgPSBmdW5jdGlvbiAobm9kZSwgbm9ybWFsaXplKSB7XG4gICAgdmFyIHNwZWMgPSBMYXlvdXRDb250cm9sbGVyLnByb3RvdHlwZS5nZXRTcGVjLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHNwZWMgJiYgdGhpcy5fbGF5b3V0LmNhcGFiaWxpdGllcyAmJiB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLnNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQpIHtcbiAgICAgICAgc3BlYyA9IHtcbiAgICAgICAgICAgIG9yaWdpbjogc3BlYy5vcmlnaW4sXG4gICAgICAgICAgICBhbGlnbjogc3BlYy5hbGlnbixcbiAgICAgICAgICAgIG9wYWNpdHk6IHNwZWMub3BhY2l0eSxcbiAgICAgICAgICAgIHNpemU6IHNwZWMuc2l6ZSxcbiAgICAgICAgICAgIHJlbmRlck5vZGU6IHNwZWMucmVuZGVyTm9kZSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogc3BlYy50cmFuc2Zvcm1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IFtcbiAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXTtcbiAgICAgICAgdHJhbnNsYXRlW3RoaXMuX2RpcmVjdGlvbl0gPSB0aGlzLl9zY3JvbGxPZmZzZXRDYWNoZSArIHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0O1xuICAgICAgICBzcGVjLnRyYW5zZm9ybSA9IFRyYW5zZm9ybS50aGVuTW92ZShzcGVjLnRyYW5zZm9ybSwgdHJhbnNsYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHNwZWM7XG59O1xuZnVuY3Rpb24gX2xheW91dChzaXplLCBzY3JvbGxPZmZzZXQsIG5lc3RlZCkge1xuICAgIHRoaXMuX2RlYnVnLmxheW91dENvdW50Kys7XG4gICAgdmFyIHNjcm9sbFN0YXJ0ID0gMCAtIE1hdGgubWF4KHRoaXMub3B0aW9ucy5leHRyYUJvdW5kc1NwYWNlWzBdLCAxKTtcbiAgICB2YXIgc2Nyb2xsRW5kID0gc2l6ZVt0aGlzLl9kaXJlY3Rpb25dICsgTWF0aC5tYXgodGhpcy5vcHRpb25zLmV4dHJhQm91bmRzU3BhY2VbMV0sIDEpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMubGF5b3V0QWxsKSB7XG4gICAgICAgIHNjcm9sbFN0YXJ0ID0gLTEwMDAwMDA7XG4gICAgICAgIHNjcm9sbEVuZCA9IDEwMDAwMDA7XG4gICAgfVxuICAgIHZhciBsYXlvdXRDb250ZXh0ID0gdGhpcy5fbm9kZXMucHJlcGFyZUZvckxheW91dCh0aGlzLl92aWV3U2VxdWVuY2UsIHRoaXMuX25vZGVzQnlJZCwge1xuICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogdGhpcy5fZGlyZWN0aW9uLFxuICAgICAgICAgICAgcmV2ZXJzZTogdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgIHNjcm9sbE9mZnNldDogdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHNjcm9sbE9mZnNldCArIHNpemVbdGhpcy5fZGlyZWN0aW9uXSA6IHNjcm9sbE9mZnNldCxcbiAgICAgICAgICAgIHNjcm9sbFN0YXJ0OiBzY3JvbGxTdGFydCxcbiAgICAgICAgICAgIHNjcm9sbEVuZDogc2Nyb2xsRW5kXG4gICAgICAgIH0pO1xuICAgIGlmICh0aGlzLl9sYXlvdXQuX2Z1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMuX2xheW91dC5fZnVuY3Rpb24obGF5b3V0Q29udGV4dCwgdGhpcy5fbGF5b3V0Lm9wdGlvbnMpO1xuICAgIH1cbiAgICB0aGlzLl9zY3JvbGwudW5ub3JtYWxpemVkU2Nyb2xsT2Zmc2V0ID0gc2Nyb2xsT2Zmc2V0O1xuICAgIGlmICh0aGlzLl9wb3N0TGF5b3V0KSB7XG4gICAgICAgIHRoaXMuX3Bvc3RMYXlvdXQoc2l6ZSwgc2Nyb2xsT2Zmc2V0KTtcbiAgICB9XG4gICAgdGhpcy5fbm9kZXMucmVtb3ZlTm9uSW52YWxpZGF0ZWROb2Rlcyh0aGlzLm9wdGlvbnMuZmxvd09wdGlvbnMucmVtb3ZlU3BlYyk7XG4gICAgX2NhbGNCb3VuZHMuY2FsbCh0aGlzLCBzaXplLCBzY3JvbGxPZmZzZXQpO1xuICAgIF9jYWxjU2Nyb2xsVG9PZmZzZXQuY2FsbCh0aGlzLCBzaXplLCBzY3JvbGxPZmZzZXQpO1xuICAgIF9zbmFwVG9QYWdlLmNhbGwodGhpcyk7XG4gICAgdmFyIG5ld1Njcm9sbE9mZnNldCA9IF9jYWxjU2Nyb2xsT2Zmc2V0LmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgaWYgKCFuZXN0ZWQgJiYgbmV3U2Nyb2xsT2Zmc2V0ICE9PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgcmV0dXJuIF9sYXlvdXQuY2FsbCh0aGlzLCBzaXplLCBuZXdTY3JvbGxPZmZzZXQsIHRydWUpO1xuICAgIH1cbiAgICBzY3JvbGxPZmZzZXQgPSBfbm9ybWFsaXplVmlld1NlcXVlbmNlLmNhbGwodGhpcywgc2l6ZSwgc2Nyb2xsT2Zmc2V0KTtcbiAgICBfdXBkYXRlU3ByaW5nLmNhbGwodGhpcyk7XG4gICAgdGhpcy5fbm9kZXMucmVtb3ZlVmlydHVhbFZpZXdTZXF1ZW5jZU5vZGVzKCk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zaXplICYmIHRoaXMub3B0aW9ucy5zaXplW3RoaXMuX2RpcmVjdGlvbl0gPT09IHRydWUpIHtcbiAgICAgICAgdmFyIHNjcm9sbExlbmd0aCA9IDA7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5fbm9kZXMuZ2V0U3RhcnRFbnVtTm9kZSgpO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuX2ludmFsaWRhdGVkICYmIG5vZGUuc2Nyb2xsTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoICs9IG5vZGUuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2l6ZSA9IHRoaXMuX3NpemUgfHwgW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICAgICAgdGhpcy5fc2l6ZVswXSA9IHRoaXMub3B0aW9ucy5zaXplWzBdO1xuICAgICAgICB0aGlzLl9zaXplWzFdID0gdGhpcy5vcHRpb25zLnNpemVbMV07XG4gICAgICAgIHRoaXMuX3NpemVbdGhpcy5fZGlyZWN0aW9uXSA9IHNjcm9sbExlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIHNjcm9sbE9mZnNldDtcbn1cbmZ1bmN0aW9uIF9pbm5lclJlbmRlcigpIHtcbiAgICB2YXIgc3BlY3MgPSB0aGlzLl9zcGVjcztcbiAgICBmb3IgKHZhciBpMyA9IDAsIGozID0gc3BlY3MubGVuZ3RoOyBpMyA8IGozOyBpMysrKSB7XG4gICAgICAgIGlmIChzcGVjc1tpM10ucmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgc3BlY3NbaTNdLnRhcmdldCA9IHNwZWNzW2kzXS5yZW5kZXJOb2RlLnJlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghc3BlY3MubGVuZ3RoIHx8IHNwZWNzW3NwZWNzLmxlbmd0aCAtIDFdICE9PSB0aGlzLl9jbGVhbnVwUmVnaXN0cmF0aW9uKSB7XG4gICAgICAgIHNwZWNzLnB1c2godGhpcy5fY2xlYW51cFJlZ2lzdHJhdGlvbik7XG4gICAgfVxuICAgIHJldHVybiBzcGVjcztcbn1cblNjcm9sbENvbnRyb2xsZXIucHJvdG90eXBlLmNvbW1pdCA9IGZ1bmN0aW9uIGNvbW1pdChjb250ZXh0KSB7XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgdGhpcy5fZGVidWcuY29tbWl0Q291bnQrKztcbiAgICBpZiAodGhpcy5fcmVzZXRGbG93U3RhdGUpIHtcbiAgICAgICAgdGhpcy5fcmVzZXRGbG93U3RhdGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faXNEaXJ0eSA9IHRydWU7XG4gICAgICAgIHRoaXMuX25vZGVzLnJlbW92ZUFsbCgpO1xuICAgIH1cbiAgICB2YXIgc2Nyb2xsT2Zmc2V0ID0gX2NhbGNTY3JvbGxPZmZzZXQuY2FsbCh0aGlzLCB0cnVlLCB0cnVlKTtcbiAgICBpZiAodGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9zY3JvbGxPZmZzZXRDYWNoZSA9IHNjcm9sbE9mZnNldDtcbiAgICB9XG4gICAgdmFyIGVtaXRFbmRTY3JvbGxpbmdFdmVudCA9IGZhbHNlO1xuICAgIHZhciBlbWl0U2Nyb2xsRXZlbnQgPSBmYWxzZTtcbiAgICB2YXIgZXZlbnREYXRhO1xuICAgIGlmIChzaXplWzBdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzBdIHx8IHNpemVbMV0gIT09IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0gfHwgdGhpcy5faXNEaXJ0eSB8fCB0aGlzLl9zY3JvbGwuc2Nyb2xsRGlydHkgfHwgdGhpcy5fbm9kZXMuX3RydWVTaXplUmVxdWVzdGVkIHx8IHRoaXMub3B0aW9ucy5hbHdheXNMYXlvdXQgfHwgdGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGUgIT09IHNjcm9sbE9mZnNldCkge1xuICAgICAgICBldmVudERhdGEgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICBvbGRTaXplOiB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlLFxuICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgIG9sZFNjcm9sbE9mZnNldDogLSh0aGlzLl9zY3JvbGxPZmZzZXRDYWNoZSArIHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0KSxcbiAgICAgICAgICAgIHNjcm9sbE9mZnNldDogLShzY3JvbGxPZmZzZXQgKyB0aGlzLl9zY3JvbGwuZ3JvdXBTdGFydClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICE9PSBzY3JvbGxPZmZzZXQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fc2Nyb2xsLmlzU2Nyb2xsaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2Nyb2xsLmlzU2Nyb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzY3JvbGxzdGFydCcsIGV2ZW50RGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbWl0U2Nyb2xsRXZlbnQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbC5pc1Njcm9sbGluZyAmJiAhdGhpcy5fc2Nyb2xsLnNjcm9sbEZvcmNlQ291bnQpIHtcbiAgICAgICAgICAgIGVtaXRFbmRTY3JvbGxpbmdFdmVudCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgnbGF5b3V0c3RhcnQnLCBldmVudERhdGEpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmZsb3cgJiYgKHRoaXMuX2lzRGlydHkgfHwgdGhpcy5vcHRpb25zLmZsb3dPcHRpb25zLnJlZmxvd09uUmVzaXplICYmIChzaXplWzBdICE9PSB0aGlzLl9jb250ZXh0U2l6ZUNhY2hlWzBdIHx8IHNpemVbMV0gIT09IHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0pKSkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLl9ub2Rlcy5nZXRTdGFydEVudW1Ob2RlKCk7XG4gICAgICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgICAgIG5vZGUucmVsZWFzZUxvY2sodHJ1ZSk7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udGV4dFNpemVDYWNoZVswXSA9IHNpemVbMF07XG4gICAgICAgIHRoaXMuX2NvbnRleHRTaXplQ2FjaGVbMV0gPSBzaXplWzFdO1xuICAgICAgICB0aGlzLl9pc0RpcnR5ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5zY3JvbGxEaXJ0eSA9IGZhbHNlO1xuICAgICAgICBzY3JvbGxPZmZzZXQgPSBfbGF5b3V0LmNhbGwodGhpcywgc2l6ZSwgc2Nyb2xsT2Zmc2V0KTtcbiAgICAgICAgdGhpcy5fc2Nyb2xsT2Zmc2V0Q2FjaGUgPSBzY3JvbGxPZmZzZXQ7XG4gICAgICAgIGV2ZW50RGF0YS5zY3JvbGxPZmZzZXQgPSAtKHRoaXMuX3Njcm9sbE9mZnNldENhY2hlICsgdGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fc2Nyb2xsLmlzU2Nyb2xsaW5nICYmICF0aGlzLl9zY3JvbGwuc2Nyb2xsRm9yY2VDb3VudCkge1xuICAgICAgICBlbWl0RW5kU2Nyb2xsaW5nRXZlbnQgPSB0cnVlO1xuICAgIH1cbiAgICB2YXIgZ3JvdXBUcmFuc2xhdGUgPSB0aGlzLl9zY3JvbGwuZ3JvdXBUcmFuc2xhdGU7XG4gICAgZ3JvdXBUcmFuc2xhdGVbMF0gPSAwO1xuICAgIGdyb3VwVHJhbnNsYXRlWzFdID0gMDtcbiAgICBncm91cFRyYW5zbGF0ZVsyXSA9IDA7XG4gICAgZ3JvdXBUcmFuc2xhdGVbdGhpcy5fZGlyZWN0aW9uXSA9IC10aGlzLl9zY3JvbGwuZ3JvdXBTdGFydCAtIHNjcm9sbE9mZnNldDtcbiAgICB2YXIgc2VxdWVudGlhbFNjcm9sbGluZ09wdGltaXplZCA9IHRoaXMuX2xheW91dC5jYXBhYmlsaXRpZXMgPyB0aGlzLl9sYXlvdXQuY2FwYWJpbGl0aWVzLnNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQgOiBmYWxzZTtcbiAgICB2YXIgcmVzdWx0ID0gdGhpcy5fbm9kZXMuYnVpbGRTcGVjQW5kRGVzdHJveVVucmVuZGVyZWROb2RlcyhzZXF1ZW50aWFsU2Nyb2xsaW5nT3B0aW1pemVkID8gZ3JvdXBUcmFuc2xhdGUgOiB1bmRlZmluZWQpO1xuICAgIHRoaXMuX3NwZWNzID0gcmVzdWx0LnNwZWNzO1xuICAgIGlmICghdGhpcy5fc3BlY3MubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0ID0gMDtcbiAgICB9XG4gICAgaWYgKGV2ZW50RGF0YSkge1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdsYXlvdXRlbmQnLCBldmVudERhdGEpO1xuICAgIH1cbiAgICBpZiAocmVzdWx0Lm1vZGlmaWVkKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3JlZmxvdycsIHsgdGFyZ2V0OiB0aGlzIH0pO1xuICAgIH1cbiAgICBpZiAoZW1pdFNjcm9sbEV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ3Njcm9sbCcsIGV2ZW50RGF0YSk7XG4gICAgfVxuICAgIGlmIChldmVudERhdGEpIHtcbiAgICAgICAgdmFyIHZpc2libGVJdGVtID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA/IHRoaXMuZ2V0TGFzdFZpc2libGVJdGVtKCkgOiB0aGlzLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgaWYgKHZpc2libGVJdGVtICYmICF0aGlzLl92aXNpYmxlSXRlbUNhY2hlIHx8ICF2aXNpYmxlSXRlbSAmJiB0aGlzLl92aXNpYmxlSXRlbUNhY2hlIHx8IHZpc2libGVJdGVtICYmIHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgJiYgdmlzaWJsZUl0ZW0ucmVuZGVyTm9kZSAhPT0gdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZS5yZW5kZXJOb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdwYWdlY2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICBvbGRWaWV3U2VxdWVuY2U6IHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUgPyB0aGlzLl92aXNpYmxlSXRlbUNhY2hlLnZpZXdTZXF1ZW5jZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB2aWV3U2VxdWVuY2U6IHZpc2libGVJdGVtID8gdmlzaWJsZUl0ZW0udmlld1NlcXVlbmNlIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIG9sZEluZGV4OiB0aGlzLl92aXNpYmxlSXRlbUNhY2hlID8gdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZS5pbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICBpbmRleDogdmlzaWJsZUl0ZW0gPyB2aXNpYmxlSXRlbS5pbmRleCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICByZW5kZXJOb2RlOiB2aXNpYmxlSXRlbSA/IHZpc2libGVJdGVtLnJlbmRlck5vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgb2xkUmVuZGVyTm9kZTogdGhpcy5fdmlzaWJsZUl0ZW1DYWNoZSA/IHRoaXMuX3Zpc2libGVJdGVtQ2FjaGUucmVuZGVyTm9kZSA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl92aXNpYmxlSXRlbUNhY2hlID0gdmlzaWJsZUl0ZW07XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVtaXRFbmRTY3JvbGxpbmdFdmVudCkge1xuICAgICAgICB0aGlzLl9zY3JvbGwuaXNTY3JvbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgZXZlbnREYXRhID0ge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgICAgb2xkU2l6ZTogc2l6ZSxcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBvbGRTY3JvbGxPZmZzZXQ6IC0odGhpcy5fc2Nyb2xsLmdyb3VwU3RhcnQgKyBzY3JvbGxPZmZzZXQpLFxuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0OiAtKHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0ICsgc2Nyb2xsT2Zmc2V0KVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzY3JvbGxlbmQnLCBldmVudERhdGEpO1xuICAgIH1cbiAgICB2YXIgdHJhbnNmb3JtID0gY29udGV4dC50cmFuc2Zvcm07XG4gICAgaWYgKHNlcXVlbnRpYWxTY3JvbGxpbmdPcHRpbWl6ZWQpIHtcbiAgICAgICAgdmFyIHdpbmRvd09mZnNldCA9IHNjcm9sbE9mZnNldCArIHRoaXMuX3Njcm9sbC5ncm91cFN0YXJ0O1xuICAgICAgICB2YXIgdHJhbnNsYXRlID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB0cmFuc2xhdGVbdGhpcy5fZGlyZWN0aW9uXSA9IHdpbmRvd09mZnNldDtcbiAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLnRoZW5Nb3ZlKHRyYW5zZm9ybSwgdHJhbnNsYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgIG9wYWNpdHk6IGNvbnRleHQub3BhY2l0eSxcbiAgICAgICAgb3JpZ2luOiBjb250ZXh0Lm9yaWdpbixcbiAgICAgICAgdGFyZ2V0OiB0aGlzLmdyb3VwLnJlbmRlcigpXG4gICAgfTtcbn07XG5TY3JvbGxDb250cm9sbGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMuY29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lci5yZW5kZXIuYXBwbHkodGhpcy5jb250YWluZXIsIGFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWQ7XG4gICAgfVxufTtcbm1vZHVsZS5leHBvcnRzID0gU2Nyb2xsQ29udHJvbGxlcjsiLCJ2YXIgRXZlbnRIYW5kbGVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogbnVsbDtcbmZ1bmN0aW9uIFZpcnR1YWxWaWV3U2VxdWVuY2Uob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuXyA9IG9wdGlvbnMuXyB8fCBuZXcgdGhpcy5jb25zdHJ1Y3Rvci5CYWNraW5nKG9wdGlvbnMpO1xuICAgIHRoaXMudG91Y2hlZCA9IHRydWU7XG4gICAgdGhpcy52YWx1ZSA9IG9wdGlvbnMudmFsdWUgfHwgdGhpcy5fLmZhY3RvcnkuY3JlYXRlKCk7XG4gICAgdGhpcy5pbmRleCA9IG9wdGlvbnMuaW5kZXggfHwgMDtcbiAgICB0aGlzLm5leHQgPSBvcHRpb25zLm5leHQ7XG4gICAgdGhpcy5wcmV2ID0gb3B0aW9ucy5wcmV2O1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuXy5ldmVudE91dHB1dCk7XG4gICAgdGhpcy52YWx1ZS5waXBlKHRoaXMuXy5ldmVudE91dHB1dCk7XG59XG5WaXJ0dWFsVmlld1NlcXVlbmNlLkJhY2tpbmcgPSBmdW5jdGlvbiBCYWNraW5nKG9wdGlvbnMpIHtcbiAgICB0aGlzLmZhY3RvcnkgPSBvcHRpb25zLmZhY3Rvcnk7XG4gICAgdGhpcy5ldmVudE91dHB1dCA9IG5ldyBFdmVudEhhbmRsZXIoKTtcbn07XG5WaXJ0dWFsVmlld1NlcXVlbmNlLnByb3RvdHlwZS5nZXRQcmV2aW91cyA9IGZ1bmN0aW9uIChub0NyZWF0ZSkge1xuICAgIGlmICh0aGlzLnByZXYpIHtcbiAgICAgICAgdGhpcy5wcmV2LnRvdWNoZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5wcmV2O1xuICAgIH1cbiAgICBpZiAobm9DcmVhdGUpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIHZhbHVlID0gdGhpcy5fLmZhY3RvcnkuY3JlYXRlUHJldmlvdXModGhpcy5nZXQoKSk7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzLnByZXYgPSBuZXcgVmlydHVhbFZpZXdTZXF1ZW5jZSh7XG4gICAgICAgIF86IHRoaXMuXyxcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogdGhpcy5pbmRleCAtIDEsXG4gICAgICAgIG5leHQ6IHRoaXNcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5wcmV2O1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLmdldE5leHQgPSBmdW5jdGlvbiAobm9DcmVhdGUpIHtcbiAgICBpZiAodGhpcy5uZXh0KSB7XG4gICAgICAgIHRoaXMubmV4dC50b3VjaGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMubmV4dDtcbiAgICB9XG4gICAgaWYgKG5vQ3JlYXRlKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHZhciB2YWx1ZSA9IHRoaXMuXy5mYWN0b3J5LmNyZWF0ZU5leHQodGhpcy5nZXQoKSk7XG4gICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzLm5leHQgPSBuZXcgVmlydHVhbFZpZXdTZXF1ZW5jZSh7XG4gICAgICAgIF86IHRoaXMuXyxcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogdGhpcy5pbmRleCArIDEsXG4gICAgICAgIHByZXY6IHRoaXNcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5uZXh0O1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnRvdWNoZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzLnZhbHVlO1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLmdldEluZGV4ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudG91Y2hlZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXg7XG59O1xuVmlydHVhbFZpZXdTZXF1ZW5jZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICcnICsgdGhpcy5pbmRleDtcbn07XG5WaXJ0dWFsVmlld1NlcXVlbmNlLnByb3RvdHlwZS5jbGVhbnVwID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBub2RlID0gdGhpcy5wcmV2O1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgIGlmICghbm9kZS50b3VjaGVkKSB7XG4gICAgICAgICAgICBub2RlLm5leHQucHJldiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIG5vZGUubmV4dCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGlmICh0aGlzLl8uZmFjdG9yeS5kZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fLmZhY3RvcnkuZGVzdHJveShub2RlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUucHJldjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlLnRvdWNoZWQgPSBmYWxzZTtcbiAgICAgICAgbm9kZSA9IG5vZGUucHJldjtcbiAgICB9XG4gICAgbm9kZSA9IHRoaXMubmV4dDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAoIW5vZGUudG91Y2hlZCkge1xuICAgICAgICAgICAgbm9kZS5wcmV2Lm5leHQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBub2RlLnByZXYgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodGhpcy5fLmZhY3RvcnkuZGVzdHJveSkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuXy5mYWN0b3J5LmRlc3Ryb3kobm9kZS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS50b3VjaGVkID0gZmFsc2U7XG4gICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLnVuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignVmlydHVhbFZpZXdTZXF1ZW5jZS51bnNoaWZ0IGlzIG5vdCBzdXBwb3J0ZWQgYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkJyk7XG4gICAgfVxufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignVmlydHVhbFZpZXdTZXF1ZW5jZS5wdXNoIGlzIG5vdCBzdXBwb3J0ZWQgYW5kIHNob3VsZCBub3QgYmUgY2FsbGVkJyk7XG4gICAgfVxufTtcblZpcnR1YWxWaWV3U2VxdWVuY2UucHJvdG90eXBlLnNwbGljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdWaXJ0dWFsVmlld1NlcXVlbmNlLnNwbGljZSBpcyBub3Qgc3VwcG9ydGVkIGFuZCBzaG91bGQgbm90IGJlIGNhbGxlZCcpO1xuICAgIH1cbn07XG5WaXJ0dWFsVmlld1NlcXVlbmNlLnByb3RvdHlwZS5zd2FwID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1ZpcnR1YWxWaWV3U2VxdWVuY2Uuc3dhcCBpcyBub3Qgc3VwcG9ydGVkIGFuZCBzaG91bGQgbm90IGJlIGNhbGxlZCcpO1xuICAgIH1cbn07XG5tb2R1bGUuZXhwb3J0cyA9IFZpcnR1YWxWaWV3U2VxdWVuY2U7IiwidmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG5mdW5jdGlvbiBMYXlvdXREb2NrSGVscGVyKGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICB0aGlzLl9zaXplID0gc2l6ZTtcbiAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLl96ID0gb3B0aW9ucyAmJiBvcHRpb25zLnRyYW5zbGF0ZVogPyBvcHRpb25zLnRyYW5zbGF0ZVogOiAwO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMubWFyZ2lucykge1xuICAgICAgICB2YXIgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhvcHRpb25zLm1hcmdpbnMpO1xuICAgICAgICB0aGlzLl9sZWZ0ID0gbWFyZ2luc1szXTtcbiAgICAgICAgdGhpcy5fdG9wID0gbWFyZ2luc1swXTtcbiAgICAgICAgdGhpcy5fcmlnaHQgPSBzaXplWzBdIC0gbWFyZ2luc1sxXTtcbiAgICAgICAgdGhpcy5fYm90dG9tID0gc2l6ZVsxXSAtIG1hcmdpbnNbMl07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fbGVmdCA9IDA7XG4gICAgICAgIHRoaXMuX3RvcCA9IDA7XG4gICAgICAgIHRoaXMuX3JpZ2h0ID0gc2l6ZVswXTtcbiAgICAgICAgdGhpcy5fYm90dG9tID0gc2l6ZVsxXTtcbiAgICB9XG59XG5MYXlvdXREb2NrSGVscGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBydWxlID0gZGF0YVtpXTtcbiAgICAgICAgdmFyIHZhbHVlID0gcnVsZS5sZW5ndGggPj0gMyA/IHJ1bGVbMl0gOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChydWxlWzBdID09PSAndG9wJykge1xuICAgICAgICAgICAgdGhpcy50b3AocnVsZVsxXSwgdmFsdWUsIHJ1bGUubGVuZ3RoID49IDQgPyBydWxlWzNdIDogdW5kZWZpbmVkKTtcbiAgICAgICAgfSBlbHNlIGlmIChydWxlWzBdID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgIHRoaXMubGVmdChydWxlWzFdLCB2YWx1ZSwgcnVsZS5sZW5ndGggPj0gNCA/IHJ1bGVbM10gOiB1bmRlZmluZWQpO1xuICAgICAgICB9IGVsc2UgaWYgKHJ1bGVbMF0gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHQocnVsZVsxXSwgdmFsdWUsIHJ1bGUubGVuZ3RoID49IDQgPyBydWxlWzNdIDogdW5kZWZpbmVkKTtcbiAgICAgICAgfSBlbHNlIGlmIChydWxlWzBdID09PSAnYm90dG9tJykge1xuICAgICAgICAgICAgdGhpcy5ib3R0b20ocnVsZVsxXSwgdmFsdWUsIHJ1bGUubGVuZ3RoID49IDQgPyBydWxlWzNdIDogdW5kZWZpbmVkKTtcbiAgICAgICAgfSBlbHNlIGlmIChydWxlWzBdID09PSAnZmlsbCcpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsbChydWxlWzFdLCBydWxlLmxlbmd0aCA+PSAzID8gcnVsZVsyXSA6IHVuZGVmaW5lZCk7XG4gICAgICAgIH0gZWxzZSBpZiAocnVsZVswXSA9PT0gJ21hcmdpbnMnKSB7XG4gICAgICAgICAgICB0aGlzLm1hcmdpbnMocnVsZVsxXSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuTGF5b3V0RG9ja0hlbHBlci5wcm90b3R5cGUudG9wID0gZnVuY3Rpb24gKG5vZGUsIGhlaWdodCwgeikge1xuICAgIGlmIChoZWlnaHQgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBoZWlnaHQgPSBoZWlnaHRbMV07XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuX2NvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgW1xuICAgICAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b20gLSB0aGlzLl90b3BcbiAgICAgICAgICAgIF0pO1xuICAgICAgICBoZWlnaHQgPSBzaXplWzFdO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIGhlaWdodFxuICAgICAgICBdLFxuICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIHRoaXMuX2xlZnQsXG4gICAgICAgICAgICB0aGlzLl90b3AsXG4gICAgICAgICAgICB6ID09PSB1bmRlZmluZWQgPyB0aGlzLl96IDogelxuICAgICAgICBdXG4gICAgfSk7XG4gICAgdGhpcy5fdG9wICs9IGhlaWdodDtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXREb2NrSGVscGVyLnByb3RvdHlwZS5sZWZ0ID0gZnVuY3Rpb24gKG5vZGUsIHdpZHRoLCB6KSB7XG4gICAgaWYgKHdpZHRoIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgd2lkdGggPSB3aWR0aFswXTtcbiAgICB9XG4gICAgaWYgKHdpZHRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIHNpemUgPSB0aGlzLl9jb250ZXh0LnJlc29sdmVTaXplKG5vZGUsIFtcbiAgICAgICAgICAgICAgICB0aGlzLl9yaWdodCAtIHRoaXMuX2xlZnQsXG4gICAgICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgd2lkdGggPSBzaXplWzBdO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIHRoaXMuX3RvcCxcbiAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICB0aGlzLl9sZWZ0ICs9IHdpZHRoO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLmJvdHRvbSA9IGZ1bmN0aW9uIChub2RlLCBoZWlnaHQsIHopIHtcbiAgICBpZiAoaGVpZ2h0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0WzFdO1xuICAgIH1cbiAgICBpZiAoaGVpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIHNpemUgPSB0aGlzLl9jb250ZXh0LnJlc29sdmVTaXplKG5vZGUsIFtcbiAgICAgICAgICAgICAgICB0aGlzLl9yaWdodCAtIHRoaXMuX2xlZnQsXG4gICAgICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgaGVpZ2h0ID0gc2l6ZVsxXTtcbiAgICB9XG4gICAgdGhpcy5fY29udGV4dC5zZXQobm9kZSwge1xuICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICB0aGlzLl9yaWdodCAtIHRoaXMuX2xlZnQsXG4gICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgXSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdLFxuICAgICAgICBhbGlnbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICB0aGlzLl9sZWZ0LFxuICAgICAgICAgICAgLSh0aGlzLl9zaXplWzFdIC0gdGhpcy5fYm90dG9tKSxcbiAgICAgICAgICAgIHogPT09IHVuZGVmaW5lZCA/IHRoaXMuX3ogOiB6XG4gICAgICAgIF1cbiAgICB9KTtcbiAgICB0aGlzLl9ib3R0b20gLT0gaGVpZ2h0O1xuICAgIHJldHVybiB0aGlzO1xufTtcbkxheW91dERvY2tIZWxwZXIucHJvdG90eXBlLnJpZ2h0ID0gZnVuY3Rpb24gKG5vZGUsIHdpZHRoLCB6KSB7XG4gICAgaWYgKHdpZHRoIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgd2lkdGggPSB3aWR0aFswXTtcbiAgICB9XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgICAgaWYgKHdpZHRoID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gdGhpcy5fY29udGV4dC5yZXNvbHZlU2l6ZShub2RlLCBbXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYm90dG9tIC0gdGhpcy5fdG9wXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB3aWR0aCA9IHNpemVbMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY29udGV4dC5zZXQobm9kZSwge1xuICAgICAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIHRoaXMuX2JvdHRvbSAtIHRoaXMuX3RvcFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAgICAgLSh0aGlzLl9zaXplWzBdIC0gdGhpcy5fcmlnaHQpLFxuICAgICAgICAgICAgICAgIHRoaXMuX3RvcCxcbiAgICAgICAgICAgICAgICB6ID09PSB1bmRlZmluZWQgPyB0aGlzLl96IDogelxuICAgICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHdpZHRoKSB7XG4gICAgICAgIHRoaXMuX3JpZ2h0IC09IHdpZHRoO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXREb2NrSGVscGVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKG5vZGUsIHopIHtcbiAgICB0aGlzLl9jb250ZXh0LnNldChub2RlLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIHRoaXMuX3JpZ2h0IC0gdGhpcy5fbGVmdCxcbiAgICAgICAgICAgIHRoaXMuX2JvdHRvbSAtIHRoaXMuX3RvcFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIHRoaXMuX2xlZnQsXG4gICAgICAgICAgICB0aGlzLl90b3AsXG4gICAgICAgICAgICB6ID09PSB1bmRlZmluZWQgPyB0aGlzLl96IDogelxuICAgICAgICBdXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuTGF5b3V0RG9ja0hlbHBlci5wcm90b3R5cGUubWFyZ2lucyA9IGZ1bmN0aW9uIChtYXJnaW5zKSB7XG4gICAgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhtYXJnaW5zKTtcbiAgICB0aGlzLl9sZWZ0ICs9IG1hcmdpbnNbM107XG4gICAgdGhpcy5fdG9wICs9IG1hcmdpbnNbMF07XG4gICAgdGhpcy5fcmlnaHQgLT0gbWFyZ2luc1sxXTtcbiAgICB0aGlzLl9ib3R0b20gLT0gbWFyZ2luc1syXTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5MYXlvdXRVdGlsaXR5LnJlZ2lzdGVySGVscGVyKCdkb2NrJywgTGF5b3V0RG9ja0hlbHBlcik7XG5tb2R1bGUuZXhwb3J0cyA9IExheW91dERvY2tIZWxwZXI7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5ZLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxpbmc6IHRydWUsXG4gICAgICAgIHRydWVTaXplOiB0cnVlLFxuICAgICAgICBzZXF1ZW50aWFsU2Nyb2xsaW5nT3B0aW1pemVkOiB0cnVlXG4gICAgfTtcbnZhciBjb250ZXh0O1xudmFyIHNpemU7XG52YXIgZGlyZWN0aW9uO1xudmFyIGFsaWdubWVudDtcbnZhciBsaW5lRGlyZWN0aW9uO1xudmFyIGxpbmVMZW5ndGg7XG52YXIgb2Zmc2V0O1xudmFyIG1hcmdpbnM7XG52YXIgbWFyZ2luID0gW1xuICAgICAgICAwLFxuICAgICAgICAwXG4gICAgXTtcbnZhciBzcGFjaW5nO1xudmFyIGp1c3RpZnk7XG52YXIgaXRlbVNpemU7XG52YXIgZ2V0SXRlbVNpemU7XG52YXIgbGluZU5vZGVzO1xuZnVuY3Rpb24gX2xheW91dExpbmUobmV4dCwgZW5kUmVhY2hlZCkge1xuICAgIGlmICghbGluZU5vZGVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgdmFyIGk7XG4gICAgdmFyIGxpbmVTaXplID0gW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICB2YXIgbGluZU5vZGU7XG4gICAgZm9yIChpID0gMDsgaSA8IGxpbmVOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaW5lU2l6ZVtkaXJlY3Rpb25dID0gTWF0aC5tYXgobGluZVNpemVbZGlyZWN0aW9uXSwgbGluZU5vZGVzW2ldLnNpemVbZGlyZWN0aW9uXSk7XG4gICAgICAgIGxpbmVTaXplW2xpbmVEaXJlY3Rpb25dICs9IChpID4gMCA/IHNwYWNpbmdbbGluZURpcmVjdGlvbl0gOiAwKSArIGxpbmVOb2Rlc1tpXS5zaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgIH1cbiAgICB2YXIganVzdGlmeU9mZnNldCA9IGp1c3RpZnlbbGluZURpcmVjdGlvbl0gPyAobGluZUxlbmd0aCAtIGxpbmVTaXplW2xpbmVEaXJlY3Rpb25dKSAvIChsaW5lTm9kZXMubGVuZ3RoICogMikgOiAwO1xuICAgIHZhciBsaW5lT2Zmc2V0ID0gKGRpcmVjdGlvbiA/IG1hcmdpbnNbM10gOiBtYXJnaW5zWzBdKSArIGp1c3RpZnlPZmZzZXQ7XG4gICAgdmFyIHNjcm9sbExlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGluZU5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpbmVOb2RlID0gbGluZU5vZGVzW2ldO1xuICAgICAgICB2YXIgdHJhbnNsYXRlID0gW1xuICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdO1xuICAgICAgICB0cmFuc2xhdGVbbGluZURpcmVjdGlvbl0gPSBsaW5lT2Zmc2V0O1xuICAgICAgICB0cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG5leHQgPyBvZmZzZXQgOiBvZmZzZXQgLSBsaW5lU2l6ZVtkaXJlY3Rpb25dO1xuICAgICAgICBzY3JvbGxMZW5ndGggPSAwO1xuICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoID0gbGluZVNpemVbZGlyZWN0aW9uXTtcbiAgICAgICAgICAgIGlmIChlbmRSZWFjaGVkICYmIChuZXh0ICYmICFhbGlnbm1lbnQgfHwgIW5leHQgJiYgYWxpZ25tZW50KSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbExlbmd0aCArPSBkaXJlY3Rpb24gPyBtYXJnaW5zWzBdICsgbWFyZ2luc1syXSA6IG1hcmdpbnNbM10gKyBtYXJnaW5zWzFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxMZW5ndGggKz0gc3BhY2luZ1tkaXJlY3Rpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVOb2RlLnNldCA9IHtcbiAgICAgICAgICAgIHNpemU6IGxpbmVOb2RlLnNpemUsXG4gICAgICAgICAgICB0cmFuc2xhdGU6IHRyYW5zbGF0ZSxcbiAgICAgICAgICAgIHNjcm9sbExlbmd0aDogc2Nyb2xsTGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIGxpbmVPZmZzZXQgKz0gbGluZU5vZGUuc2l6ZVtsaW5lRGlyZWN0aW9uXSArIHNwYWNpbmdbbGluZURpcmVjdGlvbl0gKyBqdXN0aWZ5T2Zmc2V0ICogMjtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGxpbmVOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsaW5lTm9kZSA9IG5leHQgPyBsaW5lTm9kZXNbaV0gOiBsaW5lTm9kZXNbbGluZU5vZGVzLmxlbmd0aCAtIDEgLSBpXTtcbiAgICAgICAgY29udGV4dC5zZXQobGluZU5vZGUubm9kZSwgbGluZU5vZGUuc2V0KTtcbiAgICB9XG4gICAgbGluZU5vZGVzID0gW107XG4gICAgcmV0dXJuIGxpbmVTaXplW2RpcmVjdGlvbl0gKyBzcGFjaW5nW2RpcmVjdGlvbl07XG59XG5mdW5jdGlvbiBfcmVzb2x2ZU5vZGVTaXplKG5vZGUpIHtcbiAgICB2YXIgbG9jYWxJdGVtU2l6ZSA9IGl0ZW1TaXplO1xuICAgIGlmIChnZXRJdGVtU2l6ZSkge1xuICAgICAgICBsb2NhbEl0ZW1TaXplID0gZ2V0SXRlbVNpemUobm9kZS5yZW5kZXJOb2RlLCBzaXplKTtcbiAgICB9XG4gICAgaWYgKGxvY2FsSXRlbVNpemVbMF0gPT09IHRydWUgfHwgbG9jYWxJdGVtU2l6ZVsxXSA9PT0gdHJ1ZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gY29udGV4dC5yZXNvbHZlU2l6ZShub2RlLCBzaXplKTtcbiAgICAgICAgaWYgKGxvY2FsSXRlbVNpemVbMF0gIT09IHRydWUpIHtcbiAgICAgICAgICAgIHJlc3VsdFswXSA9IGl0ZW1TaXplWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhbEl0ZW1TaXplWzFdICE9PSB0cnVlKSB7XG4gICAgICAgICAgICByZXN1bHRbMV0gPSBpdGVtU2l6ZVsxXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBsb2NhbEl0ZW1TaXplO1xuICAgIH1cbn1cbmZ1bmN0aW9uIENvbGxlY3Rpb25MYXlvdXQoY29udGV4dF8sIG9wdGlvbnMpIHtcbiAgICBjb250ZXh0ID0gY29udGV4dF87XG4gICAgc2l6ZSA9IGNvbnRleHQuc2l6ZTtcbiAgICBkaXJlY3Rpb24gPSBjb250ZXh0LmRpcmVjdGlvbjtcbiAgICBhbGlnbm1lbnQgPSBjb250ZXh0LmFsaWdubWVudDtcbiAgICBsaW5lRGlyZWN0aW9uID0gKGRpcmVjdGlvbiArIDEpICUgMjtcbiAgICBpZiAob3B0aW9ucy5ndXR0ZXIgIT09IHVuZGVmaW5lZCAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdvcHRpb24gYGd1dHRlcmAgaGFzIGJlZW4gZGVwcmVjYXRlZCBmb3IgQ29sbGVjdGlvbkxheW91dCwgdXNlIG1hcmdpbnMgJiBzcGFjaW5nIGluc3RlYWQnKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZ3V0dGVyICYmICFvcHRpb25zLm1hcmdpbnMgJiYgIW9wdGlvbnMuc3BhY2luZykge1xuICAgICAgICB2YXIgZ3V0dGVyID0gQXJyYXkuaXNBcnJheShvcHRpb25zLmd1dHRlcikgPyBvcHRpb25zLmd1dHRlciA6IFtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmd1dHRlcixcbiAgICAgICAgICAgICAgICBvcHRpb25zLmd1dHRlclxuICAgICAgICAgICAgXTtcbiAgICAgICAgbWFyZ2lucyA9IFtcbiAgICAgICAgICAgIGd1dHRlclsxXSxcbiAgICAgICAgICAgIGd1dHRlclswXSxcbiAgICAgICAgICAgIGd1dHRlclsxXSxcbiAgICAgICAgICAgIGd1dHRlclswXVxuICAgICAgICBdO1xuICAgICAgICBzcGFjaW5nID0gZ3V0dGVyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmdpbnMgPSBMYXlvdXRVdGlsaXR5Lm5vcm1hbGl6ZU1hcmdpbnMob3B0aW9ucy5tYXJnaW5zKTtcbiAgICAgICAgc3BhY2luZyA9IG9wdGlvbnMuc3BhY2luZyB8fCAwO1xuICAgICAgICBzcGFjaW5nID0gQXJyYXkuaXNBcnJheShzcGFjaW5nKSA/IHNwYWNpbmcgOiBbXG4gICAgICAgICAgICBzcGFjaW5nLFxuICAgICAgICAgICAgc3BhY2luZ1xuICAgICAgICBdO1xuICAgIH1cbiAgICBtYXJnaW5bMF0gPSBtYXJnaW5zW2RpcmVjdGlvbiA/IDAgOiAzXTtcbiAgICBtYXJnaW5bMV0gPSAtbWFyZ2luc1tkaXJlY3Rpb24gPyAyIDogMV07XG4gICAganVzdGlmeSA9IEFycmF5LmlzQXJyYXkob3B0aW9ucy5qdXN0aWZ5KSA/IG9wdGlvbnMuanVzdGlmeSA6IG9wdGlvbnMuanVzdGlmeSA/IFtcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgdHJ1ZVxuICAgIF0gOiBbXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBmYWxzZVxuICAgIF07XG4gICAgbGluZUxlbmd0aCA9IHNpemVbbGluZURpcmVjdGlvbl0gLSAoZGlyZWN0aW9uID8gbWFyZ2luc1szXSArIG1hcmdpbnNbMV0gOiBtYXJnaW5zWzBdICsgbWFyZ2luc1syXSk7XG4gICAgdmFyIG5vZGU7XG4gICAgdmFyIG5vZGVTaXplO1xuICAgIHZhciBsaW5lT2Zmc2V0O1xuICAgIHZhciBib3VuZDtcbiAgICBpZiAob3B0aW9ucy5jZWxscykge1xuICAgICAgICBpZiAob3B0aW9ucy5pdGVtU2l6ZSAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybignb3B0aW9ucyBgY2VsbHNgIGFuZCBgaXRlbVNpemVgIGNhbm5vdCBib3RoIGJlIHNwZWNpZmllZCBmb3IgQ29sbGVjdGlvbkxheW91dCwgb25seSB1c2Ugb25lIG9mIHRoZSB0d28nKTtcbiAgICAgICAgfVxuICAgICAgICBpdGVtU2l6ZSA9IFtcbiAgICAgICAgICAgIChzaXplWzBdIC0gKG1hcmdpbnNbMV0gKyBtYXJnaW5zWzNdICsgc3BhY2luZ1swXSAqIChvcHRpb25zLmNlbGxzWzBdIC0gMSkpKSAvIG9wdGlvbnMuY2VsbHNbMF0sXG4gICAgICAgICAgICAoc2l6ZVsxXSAtIChtYXJnaW5zWzBdICsgbWFyZ2luc1syXSArIHNwYWNpbmdbMV0gKiAob3B0aW9ucy5jZWxsc1sxXSAtIDEpKSkgLyBvcHRpb25zLmNlbGxzWzFdXG4gICAgICAgIF07XG4gICAgfSBlbHNlIGlmICghb3B0aW9ucy5pdGVtU2l6ZSkge1xuICAgICAgICBpdGVtU2l6ZSA9IFtcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIF07XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLml0ZW1TaXplIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgZ2V0SXRlbVNpemUgPSBvcHRpb25zLml0ZW1TaXplO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5pdGVtU2l6ZVswXSA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMuaXRlbVNpemVbMF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpdGVtU2l6ZSA9IFtcbiAgICAgICAgICAgIG9wdGlvbnMuaXRlbVNpemVbMF0gPT09IHVuZGVmaW5lZCA/IHNpemVbMF0gOiBvcHRpb25zLml0ZW1TaXplWzBdLFxuICAgICAgICAgICAgb3B0aW9ucy5pdGVtU2l6ZVsxXSA9PT0gdW5kZWZpbmVkID8gc2l6ZVsxXSA6IG9wdGlvbnMuaXRlbVNpemVbMV1cbiAgICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgfVxuICAgIG9mZnNldCA9IGNvbnRleHQuc2Nyb2xsT2Zmc2V0ICsgKGFsaWdubWVudCA/IDAgOiBtYXJnaW5bYWxpZ25tZW50XSk7XG4gICAgYm91bmQgPSBjb250ZXh0LnNjcm9sbEVuZCArIChhbGlnbm1lbnQgPyAwIDogbWFyZ2luW2FsaWdubWVudF0pO1xuICAgIGxpbmVPZmZzZXQgPSAwO1xuICAgIGxpbmVOb2RlcyA9IFtdO1xuICAgIHdoaWxlIChvZmZzZXQgPCBib3VuZCkge1xuICAgICAgICBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgX2xheW91dExpbmUodHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlU2l6ZSA9IF9yZXNvbHZlTm9kZVNpemUobm9kZSk7XG4gICAgICAgIGxpbmVPZmZzZXQgKz0gKGxpbmVOb2Rlcy5sZW5ndGggPyBzcGFjaW5nW2xpbmVEaXJlY3Rpb25dIDogMCkgKyBub2RlU2l6ZVtsaW5lRGlyZWN0aW9uXTtcbiAgICAgICAgaWYgKGxpbmVPZmZzZXQgPiBsaW5lTGVuZ3RoKSB7XG4gICAgICAgICAgICBvZmZzZXQgKz0gX2xheW91dExpbmUodHJ1ZSwgIW5vZGUpO1xuICAgICAgICAgICAgbGluZU9mZnNldCA9IG5vZGVTaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgICAgICB9XG4gICAgICAgIGxpbmVOb2Rlcy5wdXNoKHtcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICBzaXplOiBub2RlU2l6ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgb2Zmc2V0ID0gY29udGV4dC5zY3JvbGxPZmZzZXQgKyAoYWxpZ25tZW50ID8gbWFyZ2luW2FsaWdubWVudF0gOiAwKTtcbiAgICBib3VuZCA9IGNvbnRleHQuc2Nyb2xsU3RhcnQgKyAoYWxpZ25tZW50ID8gbWFyZ2luW2FsaWdubWVudF0gOiAwKTtcbiAgICBsaW5lT2Zmc2V0ID0gMDtcbiAgICBsaW5lTm9kZXMgPSBbXTtcbiAgICB3aGlsZSAob2Zmc2V0ID4gYm91bmQpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIF9sYXlvdXRMaW5lKGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGVTaXplID0gX3Jlc29sdmVOb2RlU2l6ZShub2RlKTtcbiAgICAgICAgbGluZU9mZnNldCArPSAobGluZU5vZGVzLmxlbmd0aCA/IHNwYWNpbmdbbGluZURpcmVjdGlvbl0gOiAwKSArIG5vZGVTaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgICAgICBpZiAobGluZU9mZnNldCA+IGxpbmVMZW5ndGgpIHtcbiAgICAgICAgICAgIG9mZnNldCAtPSBfbGF5b3V0TGluZShmYWxzZSwgIW5vZGUpO1xuICAgICAgICAgICAgbGluZU9mZnNldCA9IG5vZGVTaXplW2xpbmVEaXJlY3Rpb25dO1xuICAgICAgICB9XG4gICAgICAgIGxpbmVOb2Rlcy51bnNoaWZ0KHtcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICBzaXplOiBub2RlU2l6ZVxuICAgICAgICB9KTtcbiAgICB9XG59XG5Db2xsZWN0aW9uTGF5b3V0LkNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdGllcztcbkNvbGxlY3Rpb25MYXlvdXQuTmFtZSA9ICdDb2xsZWN0aW9uTGF5b3V0JztcbkNvbGxlY3Rpb25MYXlvdXQuRGVzY3JpcHRpb24gPSAnTXVsdGktY2VsbCBjb2xsZWN0aW9uLWxheW91dCB3aXRoIG1hcmdpbnMgJiBzcGFjaW5nJztcbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbkxheW91dDsiLCJ2YXIgVXRpbGl0eSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy51dGlsaXRpZXMuVXRpbGl0eSA6IG51bGw7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWVxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxpbmc6IHRydWVcbiAgICB9O1xuZnVuY3Rpb24gQ292ZXJMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgaWYgKCFub2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgdmFyIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHZhciBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgdmFyIG9wYWNpdHlTdGVwID0gMC4yO1xuICAgIHZhciBzY2FsZVN0ZXAgPSAwLjE7XG4gICAgdmFyIHRyYW5zbGF0ZVN0ZXAgPSAzMDtcbiAgICB2YXIgelN0YXJ0ID0gMTAwO1xuICAgIGNvbnRleHQuc2V0KG5vZGUsIHtcbiAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHpTdGFydFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxMZW5ndGg6IGl0ZW1TaXplW2RpcmVjdGlvbl1cbiAgICB9KTtcbiAgICB2YXIgdHJhbnNsYXRlID0gaXRlbVNpemVbMF0gLyAyO1xuICAgIHZhciBvcGFjaXR5ID0gMSAtIG9wYWNpdHlTdGVwO1xuICAgIHZhciB6SW5kZXggPSB6U3RhcnQgLSAxO1xuICAgIHZhciBzY2FsZSA9IDEgLSBzY2FsZVN0ZXA7XG4gICAgdmFyIHByZXYgPSBmYWxzZTtcbiAgICB2YXIgZW5kUmVhY2hlZCA9IGZhbHNlO1xuICAgIG5vZGUgPSBjb250ZXh0Lm5leHQoKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICBwcmV2ID0gdHJ1ZTtcbiAgICB9XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgY29udGV4dC5zZXQobm9kZSwge1xuICAgICAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAgICAgMC41XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdHJhbnNsYXRlOiBkaXJlY3Rpb24gPyBbXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBwcmV2ID8gLXRyYW5zbGF0ZSA6IHRyYW5zbGF0ZSxcbiAgICAgICAgICAgICAgICB6SW5kZXhcbiAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgcHJldiA/IC10cmFuc2xhdGUgOiB0cmFuc2xhdGUsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICB6SW5kZXhcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBzY2FsZTogW1xuICAgICAgICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgICAgICAgIHNjYWxlLFxuICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5LFxuICAgICAgICAgICAgc2Nyb2xsTGVuZ3RoOiBpdGVtU2l6ZVtkaXJlY3Rpb25dXG4gICAgICAgIH0pO1xuICAgICAgICBvcGFjaXR5IC09IG9wYWNpdHlTdGVwO1xuICAgICAgICBzY2FsZSAtPSBzY2FsZVN0ZXA7XG4gICAgICAgIHRyYW5zbGF0ZSArPSB0cmFuc2xhdGVTdGVwO1xuICAgICAgICB6SW5kZXgtLTtcbiAgICAgICAgaWYgKHRyYW5zbGF0ZSA+PSBzaXplW2RpcmVjdGlvbl0gLyAyKSB7XG4gICAgICAgICAgICBlbmRSZWFjaGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUgPSBwcmV2ID8gY29udGV4dC5wcmV2KCkgOiBjb250ZXh0Lm5leHQoKTtcbiAgICAgICAgICAgIGVuZFJlYWNoZWQgPSAhbm9kZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5kUmVhY2hlZCkge1xuICAgICAgICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVuZFJlYWNoZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHByZXYgPSB0cnVlO1xuICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBpdGVtU2l6ZVtkaXJlY3Rpb25dIC8gMjtcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gMSAtIG9wYWNpdHlTdGVwO1xuICAgICAgICAgICAgICAgIHpJbmRleCA9IHpTdGFydCAtIDE7XG4gICAgICAgICAgICAgICAgc2NhbGUgPSAxIC0gc2NhbGVTdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuQ292ZXJMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBDb3ZlckxheW91dDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEN1YmVMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgY29udGV4dC5zZXQoY29udGV4dC5uZXh0KCksIHtcbiAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIE1hdGguUEkgLyAyLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIGl0ZW1TaXplWzBdIC8gMixcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICBjb250ZXh0LnNldChjb250ZXh0Lm5leHQoKSwge1xuICAgICAgICBzaXplOiBpdGVtU2l6ZSxcbiAgICAgICAgb3JpZ2luOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgcm90YXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgTWF0aC5QSSAvIDIsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgLShpdGVtU2l6ZVswXSAvIDIpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH0pO1xuICAgIGNvbnRleHQuc2V0KGNvbnRleHQubmV4dCgpLCB7XG4gICAgICAgIHNpemU6IGl0ZW1TaXplLFxuICAgICAgICBvcmlnaW46IFtcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNVxuICAgICAgICBdLFxuICAgICAgICByb3RhdGU6IFtcbiAgICAgICAgICAgIE1hdGguUEkgLyAyLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgLShpdGVtU2l6ZVsxXSAvIDIpLFxuICAgICAgICAgICAgMFxuICAgICAgICBdXG4gICAgfSk7XG4gICAgY29udGV4dC5zZXQoY29udGV4dC5uZXh0KCksIHtcbiAgICAgICAgc2l6ZTogaXRlbVNpemUsXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgTWF0aC5QSSAvIDIsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBpdGVtU2l6ZVsxXSAvIDIsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9KTtcbn07IiwiaWYgKGNvbnNvbGUud2Fybikge1xuICAgIGNvbnNvbGUud2FybignR3JpZExheW91dCBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZSwgdXNlIENvbGxlY3Rpb25MYXlvdXQgaW5zdGVhZCcpO1xufVxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL0NvbGxlY3Rpb25MYXlvdXQnKTsiLCJ2YXIgTGF5b3V0RG9ja0hlbHBlciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvTGF5b3V0RG9ja0hlbHBlcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBIZWFkZXJGb290ZXJMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBkb2NrID0gbmV3IExheW91dERvY2tIZWxwZXIoY29udGV4dCwgb3B0aW9ucyk7XG4gICAgZG9jay50b3AoJ2hlYWRlcicsIG9wdGlvbnMuaGVhZGVyU2l6ZSAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5oZWFkZXJTaXplIDogb3B0aW9ucy5oZWFkZXJIZWlnaHQpO1xuICAgIGRvY2suYm90dG9tKCdmb290ZXInLCBvcHRpb25zLmZvb3RlclNpemUgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZm9vdGVyU2l6ZSA6IG9wdGlvbnMuZm9vdGVySGVpZ2h0KTtcbiAgICBkb2NrLmZpbGwoJ2NvbnRlbnQnKTtcbn07IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5ZLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWFxuICAgICAgICBdLFxuICAgICAgICBzY3JvbGxpbmc6IHRydWUsXG4gICAgICAgIHRydWVTaXplOiB0cnVlLFxuICAgICAgICBzZXF1ZW50aWFsU2Nyb2xsaW5nT3B0aW1pemVkOiB0cnVlXG4gICAgfTtcbnZhciBzZXQgPSB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbExlbmd0aDogdW5kZWZpbmVkXG4gICAgfTtcbnZhciBtYXJnaW4gPSBbXG4gICAgICAgIDAsXG4gICAgICAgIDBcbiAgICBdO1xuZnVuY3Rpb24gTGlzdExheW91dChjb250ZXh0LCBvcHRpb25zKSB7XG4gICAgdmFyIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgdmFyIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHZhciBhbGlnbm1lbnQgPSBjb250ZXh0LmFsaWdubWVudDtcbiAgICB2YXIgcmV2RGlyZWN0aW9uID0gZGlyZWN0aW9uID8gMCA6IDE7XG4gICAgdmFyIG9mZnNldDtcbiAgICB2YXIgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhvcHRpb25zLm1hcmdpbnMpO1xuICAgIHZhciBzcGFjaW5nID0gb3B0aW9ucy5zcGFjaW5nIHx8IDA7XG4gICAgdmFyIG5vZGU7XG4gICAgdmFyIG5vZGVTaXplO1xuICAgIHZhciBpdGVtU2l6ZTtcbiAgICB2YXIgZ2V0SXRlbVNpemU7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGw7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQ7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxMZW5ndGg7XG4gICAgdmFyIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxTY3JvbGxMZW5ndGg7XG4gICAgdmFyIGZpcnN0VmlzaWJsZUNlbGw7XG4gICAgdmFyIGxhc3ROb2RlO1xuICAgIHZhciBsYXN0Q2VsbE9mZnNldEluRmlyc3RWaXNpYmxlU2VjdGlvbjtcbiAgICB2YXIgaXNTZWN0aW9uQ2FsbGJhY2sgPSBvcHRpb25zLmlzU2VjdGlvbkNhbGxiYWNrO1xuICAgIHZhciBib3VuZDtcbiAgICBzZXQuc2l6ZVswXSA9IHNpemVbMF07XG4gICAgc2V0LnNpemVbMV0gPSBzaXplWzFdO1xuICAgIHNldC5zaXplW3JldkRpcmVjdGlvbl0gLT0gbWFyZ2luc1sxIC0gcmV2RGlyZWN0aW9uXSArIG1hcmdpbnNbMyAtIHJldkRpcmVjdGlvbl07XG4gICAgc2V0LnRyYW5zbGF0ZVswXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsyXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVtyZXZEaXJlY3Rpb25dID0gbWFyZ2luc1tkaXJlY3Rpb24gPyAzIDogMF07XG4gICAgaWYgKG9wdGlvbnMuaXRlbVNpemUgPT09IHRydWUgfHwgIW9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2l0ZW1TaXplJykpIHtcbiAgICAgICAgaXRlbVNpemUgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5pdGVtU2l6ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgIGdldEl0ZW1TaXplID0gb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpdGVtU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgPT09IHVuZGVmaW5lZCA/IHNpemVbZGlyZWN0aW9uXSA6IG9wdGlvbnMuaXRlbVNpemU7XG4gICAgfVxuICAgIG1hcmdpblswXSA9IG1hcmdpbnNbZGlyZWN0aW9uID8gMCA6IDNdO1xuICAgIG1hcmdpblsxXSA9IC1tYXJnaW5zW2RpcmVjdGlvbiA/IDIgOiAxXTtcbiAgICBvZmZzZXQgPSBjb250ZXh0LnNjcm9sbE9mZnNldCArIG1hcmdpblthbGlnbm1lbnRdO1xuICAgIGJvdW5kID0gY29udGV4dC5zY3JvbGxFbmQgKyBtYXJnaW5bYWxpZ25tZW50XTtcbiAgICB3aGlsZSAob2Zmc2V0IDwgYm91bmQpIHtcbiAgICAgICAgbGFzdE5vZGUgPSBub2RlO1xuICAgICAgICBub2RlID0gY29udGV4dC5uZXh0KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgaWYgKGxhc3ROb2RlICYmICFhbGlnbm1lbnQpIHtcbiAgICAgICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemUgKyBtYXJnaW5bMF0gKyAtbWFyZ2luWzFdO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuc2V0KGxhc3ROb2RlLCBzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZVNpemUgPSBnZXRJdGVtU2l6ZSA/IGdldEl0ZW1TaXplKG5vZGUucmVuZGVyTm9kZSkgOiBpdGVtU2l6ZTtcbiAgICAgICAgbm9kZVNpemUgPSBub2RlU2l6ZSA9PT0gdHJ1ZSA/IGNvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgc2l6ZSlbZGlyZWN0aW9uXSA6IG5vZGVTaXplO1xuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gbm9kZVNpemU7XG4gICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldCArIChhbGlnbm1lbnQgPyBzcGFjaW5nIDogMCk7XG4gICAgICAgIHNldC5zY3JvbGxMZW5ndGggPSBub2RlU2l6ZSArIHNwYWNpbmc7XG4gICAgICAgIGNvbnRleHQuc2V0KG5vZGUsIHNldCk7XG4gICAgICAgIG9mZnNldCArPSBzZXQuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgaXNTZWN0aW9uQ2FsbGJhY2sobm9kZS5yZW5kZXJOb2RlKSkge1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gTWF0aC5tYXgobWFyZ2luWzBdLCBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgICAgIGlmICghZmlyc3RWaXNpYmxlQ2VsbCkge1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwgPSBub2RlO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IG5vZGVTaXplO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0Q2VsbE9mZnNldEluRmlyc3RWaXNpYmxlU2VjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghZmlyc3RWaXNpYmxlQ2VsbCAmJiBvZmZzZXQgPj0gMCkge1xuICAgICAgICAgICAgZmlyc3RWaXNpYmxlQ2VsbCA9IG5vZGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgbm9kZSA9IHVuZGVmaW5lZDtcbiAgICBvZmZzZXQgPSBjb250ZXh0LnNjcm9sbE9mZnNldCArIG1hcmdpblthbGlnbm1lbnRdO1xuICAgIGJvdW5kID0gY29udGV4dC5zY3JvbGxTdGFydCArIG1hcmdpblthbGlnbm1lbnRdO1xuICAgIHdoaWxlIChvZmZzZXQgPiBib3VuZCkge1xuICAgICAgICBsYXN0Tm9kZSA9IG5vZGU7XG4gICAgICAgIG5vZGUgPSBjb250ZXh0LnByZXYoKTtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBpZiAobGFzdE5vZGUgJiYgYWxpZ25tZW50KSB7XG4gICAgICAgICAgICAgICAgc2V0LnNjcm9sbExlbmd0aCA9IG5vZGVTaXplICsgbWFyZ2luWzBdICsgLW1hcmdpblsxXTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnNldChsYXN0Tm9kZSwgc2V0KTtcbiAgICAgICAgICAgICAgICBpZiAobGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCA9PT0gbGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IHNldC5zY3JvbGxMZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZVNpemUgPSBnZXRJdGVtU2l6ZSA/IGdldEl0ZW1TaXplKG5vZGUucmVuZGVyTm9kZSkgOiBpdGVtU2l6ZTtcbiAgICAgICAgbm9kZVNpemUgPSBub2RlU2l6ZSA9PT0gdHJ1ZSA/IGNvbnRleHQucmVzb2x2ZVNpemUobm9kZSwgc2l6ZSlbZGlyZWN0aW9uXSA6IG5vZGVTaXplO1xuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemUgKyBzcGFjaW5nO1xuICAgICAgICBvZmZzZXQgLT0gc2V0LnNjcm9sbExlbmd0aDtcbiAgICAgICAgc2V0LnNpemVbZGlyZWN0aW9uXSA9IG5vZGVTaXplO1xuICAgICAgICBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0gPSBvZmZzZXQgKyAoYWxpZ25tZW50ID8gc3BhY2luZyA6IDApO1xuICAgICAgICBjb250ZXh0LnNldChub2RlLCBzZXQpO1xuICAgICAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgaXNTZWN0aW9uQ2FsbGJhY2sobm9kZS5yZW5kZXJOb2RlKSkge1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gTWF0aC5tYXgobWFyZ2luWzBdLCBzZXQudHJhbnNsYXRlW2RpcmVjdGlvbl0pO1xuICAgICAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgICAgIGlmICghbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCkge1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwgPSBub2RlO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aCA9IG5vZGVTaXplO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxTY3JvbGxMZW5ndGggPSBzZXQuc2Nyb2xsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCArIG5vZGVTaXplID49IDApIHtcbiAgICAgICAgICAgIGZpcnN0VmlzaWJsZUNlbGwgPSBub2RlO1xuICAgICAgICAgICAgaWYgKGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwpIHtcbiAgICAgICAgICAgICAgICBsYXN0Q2VsbE9mZnNldEluRmlyc3RWaXNpYmxlU2VjdGlvbiA9IG9mZnNldCArIG5vZGVTaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNTZWN0aW9uQ2FsbGJhY2sgJiYgIWxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGwpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKGlzU2VjdGlvbkNhbGxiYWNrKG5vZGUucmVuZGVyTm9kZSkpIHtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsID0gbm9kZTtcbiAgICAgICAgICAgICAgICBub2RlU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgfHwgY29udGV4dC5yZXNvbHZlU2l6ZShub2RlLCBzaXplKVtkaXJlY3Rpb25dO1xuICAgICAgICAgICAgICAgIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQgPSBvZmZzZXQgLSBub2RlU2l6ZTtcbiAgICAgICAgICAgICAgICBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgICAgICAgICAgbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQucHJldigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsKSB7XG4gICAgICAgIHZhciBjb3JyZWN0ZWRPZmZzZXQgPSBNYXRoLm1heChtYXJnaW5bMF0sIGxhc3RTZWN0aW9uQmVmb3JlVmlzaWJsZUNlbGxPZmZzZXQpO1xuICAgICAgICBpZiAobGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gIT09IHVuZGVmaW5lZCAmJiBsYXN0U2VjdGlvbkJlZm9yZVZpc2libGVDZWxsTGVuZ3RoID4gbGFzdENlbGxPZmZzZXRJbkZpcnN0VmlzaWJsZVNlY3Rpb24gLSBtYXJnaW5bMF0pIHtcbiAgICAgICAgICAgIGNvcnJlY3RlZE9mZnNldCA9IGxhc3RDZWxsT2Zmc2V0SW5GaXJzdFZpc2libGVTZWN0aW9uIC0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbExlbmd0aDtcbiAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gY29ycmVjdGVkT2Zmc2V0O1xuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbFNjcm9sbExlbmd0aDtcbiAgICAgICAgY29udGV4dC5zZXQobGFzdFNlY3Rpb25CZWZvcmVWaXNpYmxlQ2VsbCwgc2V0KTtcbiAgICB9XG59XG5MaXN0TGF5b3V0LkNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdGllcztcbkxpc3RMYXlvdXQuTmFtZSA9ICdMaXN0TGF5b3V0Jztcbkxpc3RMYXlvdXQuRGVzY3JpcHRpb24gPSAnTGlzdC1sYXlvdXQgd2l0aCBtYXJnaW5zLCBzcGFjaW5nIGFuZCBzdGlja3kgaGVhZGVycyc7XG5tb2R1bGUuZXhwb3J0cyA9IExpc3RMYXlvdXQ7IiwidmFyIExheW91dERvY2tIZWxwZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL0xheW91dERvY2tIZWxwZXInKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gTmF2QmFyTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICB2YXIgZG9jayA9IG5ldyBMYXlvdXREb2NrSGVscGVyKGNvbnRleHQsIHtcbiAgICAgICAgICAgIG1hcmdpbnM6IG9wdGlvbnMubWFyZ2lucyxcbiAgICAgICAgICAgIHRyYW5zbGF0ZVo6IDFcbiAgICAgICAgfSk7XG4gICAgY29udGV4dC5zZXQoJ2JhY2tncm91bmQnLCB7IHNpemU6IGNvbnRleHQuc2l6ZSB9KTtcbiAgICB2YXIgbm9kZTtcbiAgICB2YXIgaTtcbiAgICB2YXIgcmlnaHRJdGVtcyA9IGNvbnRleHQuZ2V0KCdyaWdodEl0ZW1zJyk7XG4gICAgaWYgKHJpZ2h0SXRlbXMpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHJpZ2h0SXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBjb250ZXh0LmdldChyaWdodEl0ZW1zW2ldKTtcbiAgICAgICAgICAgIGRvY2sucmlnaHQobm9kZSwgb3B0aW9ucy5yaWdodEl0ZW1XaWR0aCB8fCBvcHRpb25zLml0ZW1XaWR0aCk7XG4gICAgICAgICAgICBkb2NrLnJpZ2h0KHVuZGVmaW5lZCwgb3B0aW9ucy5yaWdodEl0ZW1TcGFjZXIgfHwgb3B0aW9ucy5pdGVtU3BhY2VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgbGVmdEl0ZW1zID0gY29udGV4dC5nZXQoJ2xlZnRJdGVtcycpO1xuICAgIGlmIChsZWZ0SXRlbXMpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlZnRJdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbm9kZSA9IGNvbnRleHQuZ2V0KGxlZnRJdGVtc1tpXSk7XG4gICAgICAgICAgICBkb2NrLmxlZnQobm9kZSwgb3B0aW9ucy5sZWZ0SXRlbVdpZHRoIHx8IG9wdGlvbnMuaXRlbVdpZHRoKTtcbiAgICAgICAgICAgIGRvY2subGVmdCh1bmRlZmluZWQsIG9wdGlvbnMubGVmdEl0ZW1TcGFjZXIgfHwgb3B0aW9ucy5pdGVtU3BhY2VyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkb2NrLmZpbGwoJ3RpdGxlJyk7XG59OyIsInZhciBVdGlsaXR5ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLnV0aWxpdGllcy5VdGlsaXR5IDogbnVsbDtcbnZhciBjYXBhYmlsaXRpZXMgPSB7XG4gICAgICAgIHNlcXVlbmNlOiB0cnVlLFxuICAgICAgICBkaXJlY3Rpb246IFtcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlksXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YXG4gICAgICAgIF0sXG4gICAgICAgIHNjcm9sbGluZzogZmFsc2VcbiAgICB9O1xudmFyIGRpcmVjdGlvbjtcbnZhciBzaXplO1xudmFyIHJhdGlvcztcbnZhciB0b3RhbDtcbnZhciBvZmZzZXQ7XG52YXIgaW5kZXg7XG52YXIgbm9kZTtcbnZhciBzZXQgPSB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF1cbiAgICB9O1xuZnVuY3Rpb24gUHJvcG9ydGlvbmFsTGF5b3V0KGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICBzaXplID0gY29udGV4dC5zaXplO1xuICAgIGRpcmVjdGlvbiA9IGNvbnRleHQuZGlyZWN0aW9uO1xuICAgIHJhdGlvcyA9IG9wdGlvbnMucmF0aW9zO1xuICAgIHRvdGFsID0gMDtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCByYXRpb3MubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHRvdGFsICs9IHJhdGlvc1tpbmRleF07XG4gICAgfVxuICAgIHNldC5zaXplWzBdID0gc2l6ZVswXTtcbiAgICBzZXQuc2l6ZVsxXSA9IHNpemVbMV07XG4gICAgc2V0LnRyYW5zbGF0ZVswXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgbm9kZSA9IGNvbnRleHQubmV4dCgpO1xuICAgIG9mZnNldCA9IDA7XG4gICAgaW5kZXggPSAwO1xuICAgIHdoaWxlIChub2RlICYmIGluZGV4IDwgcmF0aW9zLmxlbmd0aCkge1xuICAgICAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gKHNpemVbZGlyZWN0aW9uXSAtIG9mZnNldCkgLyB0b3RhbCAqIHJhdGlvc1tpbmRleF07XG4gICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldDtcbiAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IHNldC5zaXplW2RpcmVjdGlvbl07XG4gICAgICAgIHRvdGFsIC09IHJhdGlvc1tpbmRleF07XG4gICAgICAgIGluZGV4Kys7XG4gICAgICAgIG5vZGUgPSBjb250ZXh0Lm5leHQoKTtcbiAgICB9XG59XG5Qcm9wb3J0aW9uYWxMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xubW9kdWxlLmV4cG9ydHMgPSBQcm9wb3J0aW9uYWxMYXlvdXQ7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG52YXIgY2FwYWJpbGl0aWVzID0ge1xuICAgICAgICBzZXF1ZW5jZTogdHJ1ZSxcbiAgICAgICAgZGlyZWN0aW9uOiBbXG4gICAgICAgICAgICBVdGlsaXR5LkRpcmVjdGlvbi5YLFxuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWVxuICAgICAgICBdLFxuICAgICAgICB0cnVlU2l6ZTogdHJ1ZVxuICAgIH07XG52YXIgc2l6ZTtcbnZhciBkaXJlY3Rpb247XG52YXIgcmV2RGlyZWN0aW9uO1xudmFyIGl0ZW1zO1xudmFyIHNwYWNlcnM7XG52YXIgbWFyZ2lucztcbnZhciBzcGFjaW5nO1xudmFyIHNpemVMZWZ0O1xudmFyIHNldCA9IHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgYWxpZ246IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXVxuICAgIH07XG52YXIgbm9kZVNpemU7XG52YXIgb2Zmc2V0O1xudmFyIHpJbmNyZW1lbnQ7XG5mdW5jdGlvbiBUYWJCYXJMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgZGlyZWN0aW9uID0gY29udGV4dC5kaXJlY3Rpb247XG4gICAgcmV2RGlyZWN0aW9uID0gZGlyZWN0aW9uID8gMCA6IDE7XG4gICAgc3BhY2luZyA9IG9wdGlvbnMuc3BhY2luZyB8fCAwO1xuICAgIGl0ZW1zID0gY29udGV4dC5nZXQoJ2l0ZW1zJyk7XG4gICAgc3BhY2VycyA9IGNvbnRleHQuZ2V0KCdzcGFjZXJzJyk7XG4gICAgbWFyZ2lucyA9IExheW91dFV0aWxpdHkubm9ybWFsaXplTWFyZ2lucyhvcHRpb25zLm1hcmdpbnMpO1xuICAgIHpJbmNyZW1lbnQgPSBvcHRpb25zLnpJbmNyZW1lbnQgfHwgMC4wMDE7XG4gICAgc2V0LnNpemVbMF0gPSBjb250ZXh0LnNpemVbMF07XG4gICAgc2V0LnNpemVbMV0gPSBjb250ZXh0LnNpemVbMV07XG4gICAgc2V0LnNpemVbcmV2RGlyZWN0aW9uXSAtPSBtYXJnaW5zWzEgLSByZXZEaXJlY3Rpb25dICsgbWFyZ2luc1szIC0gcmV2RGlyZWN0aW9uXTtcbiAgICBzZXQudHJhbnNsYXRlWzBdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzFdID0gMDtcbiAgICBzZXQudHJhbnNsYXRlWzJdID0gekluY3JlbWVudDtcbiAgICBzZXQudHJhbnNsYXRlW3JldkRpcmVjdGlvbl0gPSBtYXJnaW5zW2RpcmVjdGlvbiA/IDMgOiAwXTtcbiAgICBzZXQuYWxpZ25bMF0gPSAwO1xuICAgIHNldC5hbGlnblsxXSA9IDA7XG4gICAgc2V0Lm9yaWdpblswXSA9IDA7XG4gICAgc2V0Lm9yaWdpblsxXSA9IDA7XG4gICAgb2Zmc2V0ID0gZGlyZWN0aW9uID8gbWFyZ2luc1swXSA6IG1hcmdpbnNbM107XG4gICAgc2l6ZUxlZnQgPSBzaXplW2RpcmVjdGlvbl0gLSAob2Zmc2V0ICsgKGRpcmVjdGlvbiA/IG1hcmdpbnNbMl0gOiBtYXJnaW5zWzFdKSk7XG4gICAgc2l6ZUxlZnQgLT0gKGl0ZW1zLmxlbmd0aCAtIDEpICogc3BhY2luZztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvcHRpb25zLml0ZW1TaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIG5vZGVTaXplID0gTWF0aC5yb3VuZChzaXplTGVmdCAvIChpdGVtcy5sZW5ndGggLSBpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlU2l6ZSA9IG9wdGlvbnMuaXRlbVNpemUgPT09IHRydWUgPyBjb250ZXh0LnJlc29sdmVTaXplKGl0ZW1zW2ldLCBzaXplKVtkaXJlY3Rpb25dIDogb3B0aW9ucy5pdGVtU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoID0gbm9kZVNpemU7XG4gICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMF0gOiBtYXJnaW5zWzNdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSBpdGVtcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICBzZXQuc2Nyb2xsTGVuZ3RoICs9IGRpcmVjdGlvbiA/IG1hcmdpbnNbMl0gOiBtYXJnaW5zWzFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0LnNjcm9sbExlbmd0aCArPSBzcGFjaW5nO1xuICAgICAgICB9XG4gICAgICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBub2RlU2l6ZTtcbiAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gb2Zmc2V0O1xuICAgICAgICBjb250ZXh0LnNldChpdGVtc1tpXSwgc2V0KTtcbiAgICAgICAgb2Zmc2V0ICs9IG5vZGVTaXplO1xuICAgICAgICBzaXplTGVmdCAtPSBub2RlU2l6ZTtcbiAgICAgICAgaWYgKGkgPT09IG9wdGlvbnMuc2VsZWN0ZWRJdGVtSW5kZXgpIHtcbiAgICAgICAgICAgIHNldC5zY3JvbGxMZW5ndGggPSAwO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dICs9IG5vZGVTaXplIC8gMjtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbMl0gPSB6SW5jcmVtZW50ICogMjtcbiAgICAgICAgICAgIHNldC5vcmlnaW5bZGlyZWN0aW9uXSA9IDAuNTtcbiAgICAgICAgICAgIGNvbnRleHQuc2V0KCdzZWxlY3RlZEl0ZW1PdmVybGF5Jywgc2V0KTtcbiAgICAgICAgICAgIHNldC5vcmlnaW5bZGlyZWN0aW9uXSA9IDA7XG4gICAgICAgICAgICBzZXQudHJhbnNsYXRlWzJdID0gekluY3JlbWVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA8IGl0ZW1zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGlmIChzcGFjZXJzICYmIGkgPCBzcGFjZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNldC5zaXplW2RpcmVjdGlvbl0gPSBzcGFjaW5nO1xuICAgICAgICAgICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnNldChzcGFjZXJzW2ldLCBzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2Zmc2V0ICs9IHNwYWNpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvZmZzZXQgKz0gZGlyZWN0aW9uID8gbWFyZ2luc1syXSA6IG1hcmdpbnNbMV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0LnNjcm9sbExlbmd0aCA9IDA7XG4gICAgc2V0LnNpemVbMF0gPSBzaXplWzBdO1xuICAgIHNldC5zaXplWzFdID0gc2l6ZVsxXTtcbiAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gc2l6ZVtkaXJlY3Rpb25dO1xuICAgIHNldC50cmFuc2xhdGVbMF0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbMV0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbMl0gPSAwO1xuICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IDA7XG4gICAgY29udGV4dC5zZXQoJ2JhY2tncm91bmQnLCBzZXQpO1xufVxuVGFiQmFyTGF5b3V0LkNhcGFiaWxpdGllcyA9IGNhcGFiaWxpdGllcztcblRhYkJhckxheW91dC5OYW1lID0gJ1RhYkJhckxheW91dCc7XG5UYWJCYXJMYXlvdXQuRGVzY3JpcHRpb24gPSAnVGFiQmFyIHdpZGdldCBsYXlvdXQnO1xubW9kdWxlLmV4cG9ydHMgPSBUYWJCYXJMYXlvdXQ7IiwidmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIGNhcGFiaWxpdGllcyA9IHtcbiAgICAgICAgc2VxdWVuY2U6IHRydWUsXG4gICAgICAgIGRpcmVjdGlvbjogW1xuICAgICAgICAgICAgVXRpbGl0eS5EaXJlY3Rpb24uWSxcbiAgICAgICAgICAgIFV0aWxpdHkuRGlyZWN0aW9uLlhcbiAgICAgICAgXSxcbiAgICAgICAgc2Nyb2xsaW5nOiB0cnVlLFxuICAgICAgICB0cnVlU2l6ZTogdHJ1ZVxuICAgIH07XG52YXIgc2l6ZTtcbnZhciBkaXJlY3Rpb247XG52YXIgcmV2RGlyZWN0aW9uO1xudmFyIG5vZGU7XG52YXIgaXRlbVNpemU7XG52YXIgZGlhbWV0ZXI7XG52YXIgb2Zmc2V0O1xudmFyIGJvdW5kO1xudmFyIGFuZ2xlO1xudmFyIHJhZGl1cztcbnZhciBpdGVtQW5nbGU7XG52YXIgcmFkaWFsT3BhY2l0eTtcbnZhciBzZXQgPSB7XG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHRyYW5zbGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIHJvdGF0ZTogW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF0sXG4gICAgICAgIG9yaWdpbjogW1xuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41XG4gICAgICAgIF0sXG4gICAgICAgIGFsaWduOiBbXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjVcbiAgICAgICAgXSxcbiAgICAgICAgc2Nyb2xsTGVuZ3RoOiB1bmRlZmluZWRcbiAgICB9O1xuZnVuY3Rpb24gV2hlZWxMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHNpemUgPSBjb250ZXh0LnNpemU7XG4gICAgZGlyZWN0aW9uID0gY29udGV4dC5kaXJlY3Rpb247XG4gICAgcmV2RGlyZWN0aW9uID0gZGlyZWN0aW9uID8gMCA6IDE7XG4gICAgaXRlbVNpemUgPSBvcHRpb25zLml0ZW1TaXplIHx8IHNpemVbZGlyZWN0aW9uXSAvIDI7XG4gICAgZGlhbWV0ZXIgPSBvcHRpb25zLmRpYW1ldGVyIHx8IGl0ZW1TaXplICogMztcbiAgICByYWRpdXMgPSBkaWFtZXRlciAvIDI7XG4gICAgaXRlbUFuZ2xlID0gTWF0aC5hdGFuMihpdGVtU2l6ZSAvIDIsIHJhZGl1cykgKiAyO1xuICAgIHJhZGlhbE9wYWNpdHkgPSBvcHRpb25zLnJhZGlhbE9wYWNpdHkgPT09IHVuZGVmaW5lZCA/IDEgOiBvcHRpb25zLnJhZGlhbE9wYWNpdHk7XG4gICAgc2V0Lm9wYWNpdHkgPSAxO1xuICAgIHNldC5zaXplWzBdID0gc2l6ZVswXTtcbiAgICBzZXQuc2l6ZVsxXSA9IHNpemVbMV07XG4gICAgc2V0LnNpemVbcmV2RGlyZWN0aW9uXSA9IHNpemVbcmV2RGlyZWN0aW9uXTtcbiAgICBzZXQuc2l6ZVtkaXJlY3Rpb25dID0gaXRlbVNpemU7XG4gICAgc2V0LnRyYW5zbGF0ZVswXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsxXSA9IDA7XG4gICAgc2V0LnRyYW5zbGF0ZVsyXSA9IDA7XG4gICAgc2V0LnJvdGF0ZVswXSA9IDA7XG4gICAgc2V0LnJvdGF0ZVsxXSA9IDA7XG4gICAgc2V0LnJvdGF0ZVsyXSA9IDA7XG4gICAgc2V0LnNjcm9sbExlbmd0aCA9IGl0ZW1TaXplO1xuICAgIG9mZnNldCA9IGNvbnRleHQuc2Nyb2xsT2Zmc2V0O1xuICAgIGJvdW5kID0gTWF0aC5QSSAvIDIgLyBpdGVtQW5nbGUgKiBpdGVtU2l6ZSArIGl0ZW1TaXplO1xuICAgIHdoaWxlIChvZmZzZXQgPD0gYm91bmQpIHtcbiAgICAgICAgbm9kZSA9IGNvbnRleHQubmV4dCgpO1xuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvZmZzZXQgPj0gLWJvdW5kKSB7XG4gICAgICAgICAgICBhbmdsZSA9IG9mZnNldCAvIGl0ZW1TaXplICogaXRlbUFuZ2xlO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVtkaXJlY3Rpb25dID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgc2V0LnRyYW5zbGF0ZVsyXSA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSAtIHJhZGl1cztcbiAgICAgICAgICAgIHNldC5yb3RhdGVbcmV2RGlyZWN0aW9uXSA9IGRpcmVjdGlvbiA/IC1hbmdsZSA6IGFuZ2xlO1xuICAgICAgICAgICAgc2V0Lm9wYWNpdHkgPSAxIC0gTWF0aC5hYnMoYW5nbGUpIC8gKE1hdGguUEkgLyAyKSAqICgxIC0gcmFkaWFsT3BhY2l0eSk7XG4gICAgICAgICAgICBjb250ZXh0LnNldChub2RlLCBzZXQpO1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBpdGVtU2l6ZTtcbiAgICB9XG4gICAgb2Zmc2V0ID0gY29udGV4dC5zY3JvbGxPZmZzZXQgLSBpdGVtU2l6ZTtcbiAgICB3aGlsZSAob2Zmc2V0ID49IC1ib3VuZCkge1xuICAgICAgICBub2RlID0gY29udGV4dC5wcmV2KCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9mZnNldCA8PSBib3VuZCkge1xuICAgICAgICAgICAgYW5nbGUgPSBvZmZzZXQgLyBpdGVtU2l6ZSAqIGl0ZW1BbmdsZTtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbZGlyZWN0aW9uXSA9IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgICAgIHNldC50cmFuc2xhdGVbMl0gPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgLSByYWRpdXM7XG4gICAgICAgICAgICBzZXQucm90YXRlW3JldkRpcmVjdGlvbl0gPSBkaXJlY3Rpb24gPyAtYW5nbGUgOiBhbmdsZTtcbiAgICAgICAgICAgIHNldC5vcGFjaXR5ID0gMSAtIE1hdGguYWJzKGFuZ2xlKSAvIChNYXRoLlBJIC8gMikgKiAoMSAtIHJhZGlhbE9wYWNpdHkpO1xuICAgICAgICAgICAgY29udGV4dC5zZXQobm9kZSwgc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgLT0gaXRlbVNpemU7XG4gICAgfVxufVxuV2hlZWxMYXlvdXQuQ2FwYWJpbGl0aWVzID0gY2FwYWJpbGl0aWVzO1xuV2hlZWxMYXlvdXQuTmFtZSA9ICdXaGVlbExheW91dCc7XG5XaGVlbExheW91dC5EZXNjcmlwdGlvbiA9ICdTcGlubmVyLXdoZWVsL3Nsb3QtbWFjaGluZSBsYXlvdXQnO1xubW9kdWxlLmV4cG9ydHMgPSBXaGVlbExheW91dDsiLCJ2YXIgVmlldyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlZpZXcgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5WaWV3IDogbnVsbDtcbnZhciBTdXJmYWNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuU3VyZmFjZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlN1cmZhY2UgOiBudWxsO1xudmFyIFV0aWxpdHkgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMudXRpbGl0aWVzLlV0aWxpdHkgOiBudWxsO1xudmFyIENvbnRhaW5lclN1cmZhY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuc3VyZmFjZXMuQ29udGFpbmVyU3VyZmFjZSA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5zdXJmYWNlcy5Db250YWluZXJTdXJmYWNlIDogbnVsbDtcbnZhciBMYXlvdXRDb250cm9sbGVyID0gcmVxdWlyZSgnLi4vTGF5b3V0Q29udHJvbGxlcicpO1xudmFyIFNjcm9sbENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9TY3JvbGxDb250cm9sbGVyJyk7XG52YXIgV2hlZWxMYXlvdXQgPSByZXF1aXJlKCcuLi9sYXlvdXRzL1doZWVsTGF5b3V0Jyk7XG52YXIgUHJvcG9ydGlvbmFsTGF5b3V0ID0gcmVxdWlyZSgnLi4vbGF5b3V0cy9Qcm9wb3J0aW9uYWxMYXlvdXQnKTtcbnZhciBWaXJ0dWFsVmlld1NlcXVlbmNlID0gcmVxdWlyZSgnLi4vVmlydHVhbFZpZXdTZXF1ZW5jZScpO1xudmFyIERhdGVQaWNrZXJDb21wb25lbnRzID0gcmVxdWlyZSgnLi9EYXRlUGlja2VyQ29tcG9uZW50cycpO1xudmFyIExheW91dFV0aWxpdHkgPSByZXF1aXJlKCcuLi9MYXlvdXRVdGlsaXR5Jyk7XG5mdW5jdGlvbiBEYXRlUGlja2VyKG9wdGlvbnMpIHtcbiAgICBWaWV3LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5fZGF0ZSA9IG5ldyBEYXRlKG9wdGlvbnMuZGF0ZSA/IG9wdGlvbnMuZGF0ZS5nZXRUaW1lKCkgOiB1bmRlZmluZWQpO1xuICAgIHRoaXMuX2NvbXBvbmVudHMgPSBbXTtcbiAgICB0aGlzLmNsYXNzZXMgPSBvcHRpb25zLmNsYXNzZXMgPyB0aGlzLmNsYXNzZXMuY29uY2F0KG9wdGlvbnMuY2xhc3NlcykgOiB0aGlzLmNsYXNzZXM7XG4gICAgX2NyZWF0ZUxheW91dC5jYWxsKHRoaXMpO1xuICAgIF91cGRhdGVDb21wb25lbnRzLmNhbGwodGhpcyk7XG4gICAgdGhpcy5fb3ZlcmxheVJlbmRlcmFibGVzID0ge1xuICAgICAgICB0b3A6IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ3RvcCcpLFxuICAgICAgICBtaWRkbGU6IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ21pZGRsZScpLFxuICAgICAgICBib3R0b206IF9jcmVhdGVSZW5kZXJhYmxlLmNhbGwodGhpcywgJ2JvdHRvbScpXG4gICAgfTtcbiAgICBfY3JlYXRlT3ZlcmxheS5jYWxsKHRoaXMpO1xuICAgIHRoaXMuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xufVxuRGF0ZVBpY2tlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFZpZXcucHJvdG90eXBlKTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGF0ZVBpY2tlcjtcbkRhdGVQaWNrZXIucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2ZmLXdpZGdldCcsXG4gICAgJ2ZmLWRhdGVwaWNrZXInXG5dO1xuRGF0ZVBpY2tlci5Db21wb25lbnQgPSBEYXRlUGlja2VyQ29tcG9uZW50cztcbkRhdGVQaWNrZXIuREVGQVVMVF9PUFRJT05TID0ge1xuICAgIHBlcnNwZWN0aXZlOiA1MDAsXG4gICAgd2hlZWxMYXlvdXQ6IHtcbiAgICAgICAgaXRlbVNpemU6IDEwMCxcbiAgICAgICAgZGlhbWV0ZXI6IDUwMFxuICAgIH0sXG4gICAgY3JlYXRlUmVuZGVyYWJsZXM6IHtcbiAgICAgICAgaXRlbTogdHJ1ZSxcbiAgICAgICAgdG9wOiBmYWxzZSxcbiAgICAgICAgbWlkZGxlOiBmYWxzZSxcbiAgICAgICAgYm90dG9tOiBmYWxzZVxuICAgIH0sXG4gICAgc2Nyb2xsQ29udHJvbGxlcjoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICBwYWdpbmF0ZWQ6IHRydWUsXG4gICAgICAgIHBhZ2luYXRpb25Nb2RlOiBTY3JvbGxDb250cm9sbGVyLlBhZ2luYXRpb25Nb2RlLlNDUk9MTCxcbiAgICAgICAgbW91c2VNb3ZlOiB0cnVlLFxuICAgICAgICBzY3JvbGxTcHJpbmc6IHtcbiAgICAgICAgICAgIGRhbXBpbmdSYXRpbzogMSxcbiAgICAgICAgICAgIHBlcmlvZDogODAwXG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX2NyZWF0ZVJlbmRlcmFibGUoaWQsIGRhdGEpIHtcbiAgICB2YXIgb3B0aW9uID0gdGhpcy5vcHRpb25zLmNyZWF0ZVJlbmRlcmFibGVzW0FycmF5LmlzQXJyYXkoaWQpID8gaWRbMF0gOiBpZF07XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgIHJldHVybiBvcHRpb24uY2FsbCh0aGlzLCBpZCwgZGF0YSk7XG4gICAgfSBlbHNlIGlmICghb3B0aW9uKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChkYXRhICE9PSB1bmRlZmluZWQgJiYgZGF0YSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgdmFyIHN1cmZhY2UgPSBuZXcgU3VyZmFjZSh7XG4gICAgICAgICAgICBjbGFzc2VzOiB0aGlzLmNsYXNzZXMsXG4gICAgICAgICAgICBjb250ZW50OiBkYXRhID8gJzxkaXY+JyArIGRhdGEgKyAnPC9kaXY+JyA6IHVuZGVmaW5lZFxuICAgICAgICB9KTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShpZCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc3VyZmFjZS5hZGRDbGFzcyhpZFtpXSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBzdXJmYWNlLmFkZENsYXNzKGlkKTtcbiAgICB9XG4gICAgcmV0dXJuIHN1cmZhY2U7XG59XG5EYXRlUGlja2VyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBWaWV3LnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLmxheW91dCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucGVyc3BlY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jb250ZXh0LnNldFBlcnNwZWN0aXZlKG9wdGlvbnMucGVyc3BlY3RpdmUpO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICBpZiAob3B0aW9ucy53aGVlbExheW91dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHNbaV0uc2Nyb2xsQ29udHJvbGxlci5zZXRMYXlvdXRPcHRpb25zKG9wdGlvbnMud2hlZWxMYXlvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3ZlcmxheS5zZXRMYXlvdXRPcHRpb25zKHsgaXRlbVNpemU6IHRoaXMub3B0aW9ucy53aGVlbExheW91dC5pdGVtU2l6ZSB9KTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHNbaV0uc2Nyb2xsQ29udHJvbGxlci5zZXRPcHRpb25zKG9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuRGF0ZVBpY2tlci5wcm90b3R5cGUuc2V0Q29tcG9uZW50cyA9IGZ1bmN0aW9uIChjb21wb25lbnRzKSB7XG4gICAgdGhpcy5fY29tcG9uZW50cyA9IGNvbXBvbmVudHM7XG4gICAgX3VwZGF0ZUNvbXBvbmVudHMuY2FsbCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5EYXRlUGlja2VyLnByb3RvdHlwZS5nZXRDb21wb25lbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9jb21wb25lbnRzO1xufTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLnNldERhdGUgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHRoaXMuX2RhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSk7XG4gICAgX3NldERhdGVUb1Njcm9sbFdoZWVscy5jYWxsKHRoaXMsIHRoaXMuX2RhdGUpO1xuICAgIHJldHVybiB0aGlzO1xufTtcbkRhdGVQaWNrZXIucHJvdG90eXBlLmdldERhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGU7XG59O1xuZnVuY3Rpb24gX3NldERhdGVUb1Njcm9sbFdoZWVscyhkYXRlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNjcm9sbFdoZWVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgc2Nyb2xsV2hlZWwgPSB0aGlzLnNjcm9sbFdoZWVsc1tpXTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IHNjcm9sbFdoZWVsLmNvbXBvbmVudDtcbiAgICAgICAgdmFyIGl0ZW0gPSBzY3JvbGxXaGVlbC5zY3JvbGxDb250cm9sbGVyLmdldEZpcnN0VmlzaWJsZUl0ZW0oKTtcbiAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS52aWV3U2VxdWVuY2UpIHtcbiAgICAgICAgICAgIHZhciB2aWV3U2VxdWVuY2UgPSBpdGVtLnZpZXdTZXF1ZW5jZTtcbiAgICAgICAgICAgIHZhciByZW5kZXJOb2RlID0gaXRlbS52aWV3U2VxdWVuY2UuZ2V0KCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gY29tcG9uZW50LmdldENvbXBvbmVudChyZW5kZXJOb2RlLmRhdGUpO1xuICAgICAgICAgICAgdmFyIGRlc3RWYWx1ZSA9IGNvbXBvbmVudC5nZXRDb21wb25lbnQoZGF0ZSk7XG4gICAgICAgICAgICB2YXIgc3RlcHMgPSAwO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSAhPT0gZGVzdFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgc3RlcHMgPSBkZXN0VmFsdWUgLSBjdXJyZW50VmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5sb29wKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXZTdGVwcyA9IHN0ZXBzIDwgMCA/IHN0ZXBzICsgY29tcG9uZW50LnVwcGVyQm91bmQgOiBzdGVwcyAtIGNvbXBvbmVudC51cHBlckJvdW5kO1xuICAgICAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMocmV2U3RlcHMpIDwgTWF0aC5hYnMoc3RlcHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwcyA9IHJldlN0ZXBzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFzdGVwcykge1xuICAgICAgICAgICAgICAgIHNjcm9sbFdoZWVsLnNjcm9sbENvbnRyb2xsZXIuZ29Ub1JlbmRlck5vZGUocmVuZGVyTm9kZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50VmFsdWUgIT09IGRlc3RWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2aWV3U2VxdWVuY2UgPSBzdGVwcyA+IDAgPyB2aWV3U2VxdWVuY2UuZ2V0TmV4dCgpIDogdmlld1NlcXVlbmNlLmdldFByZXZpb3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlck5vZGUgPSB2aWV3U2VxdWVuY2UgPyB2aWV3U2VxdWVuY2UuZ2V0KCkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVuZGVyTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFZhbHVlID0gY29tcG9uZW50LmdldENvbXBvbmVudChyZW5kZXJOb2RlLmRhdGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxXaGVlbC5zY3JvbGxDb250cm9sbGVyLmdvVG9OZXh0UGFnZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsV2hlZWwuc2Nyb2xsQ29udHJvbGxlci5nb1RvUHJldmlvdXNQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfZ2V0RGF0ZUZyb21TY3JvbGxXaGVlbHMoKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh0aGlzLl9kYXRlKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2Nyb2xsV2hlZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzY3JvbGxXaGVlbCA9IHRoaXMuc2Nyb2xsV2hlZWxzW2ldO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gc2Nyb2xsV2hlZWwuY29tcG9uZW50O1xuICAgICAgICB2YXIgaXRlbSA9IHNjcm9sbFdoZWVsLnNjcm9sbENvbnRyb2xsZXIuZ2V0Rmlyc3RWaXNpYmxlSXRlbSgpO1xuICAgICAgICBpZiAoaXRlbSAmJiBpdGVtLnJlbmRlck5vZGUpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudC5zZXRDb21wb25lbnQoZGF0ZSwgY29tcG9uZW50LmdldENvbXBvbmVudChpdGVtLnJlbmRlck5vZGUuZGF0ZSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xufVxuZnVuY3Rpb24gX2NyZWF0ZUxheW91dCgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG5ldyBDb250YWluZXJTdXJmYWNlKHRoaXMub3B0aW9ucy5jb250YWluZXIpO1xuICAgIHRoaXMuY29udGFpbmVyLnNldENsYXNzZXModGhpcy5jbGFzc2VzKTtcbiAgICB0aGlzLmxheW91dCA9IG5ldyBMYXlvdXRDb250cm9sbGVyKHtcbiAgICAgICAgbGF5b3V0OiBQcm9wb3J0aW9uYWxMYXlvdXQsXG4gICAgICAgIGxheW91dE9wdGlvbnM6IHsgcmF0aW9zOiBbXSB9LFxuICAgICAgICBkaXJlY3Rpb246IFV0aWxpdHkuRGlyZWN0aW9uLlhcbiAgICB9KTtcbiAgICB0aGlzLmNvbnRhaW5lci5hZGQodGhpcy5sYXlvdXQpO1xuICAgIHRoaXMuYWRkKHRoaXMuY29udGFpbmVyKTtcbn1cbmZ1bmN0aW9uIF9jbGlja0l0ZW0oc2Nyb2xsV2hlZWwsIGV2ZW50KSB7XG59XG5mdW5jdGlvbiBfc2Nyb2xsV2hlZWxTY3JvbGxTdGFydCgpIHtcbiAgICB0aGlzLl9zY3JvbGxpbmdDb3VudCsrO1xuICAgIGlmICh0aGlzLl9zY3JvbGxpbmdDb3VudCA9PT0gMSkge1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzY3JvbGxzdGFydCcsIHsgdGFyZ2V0OiB0aGlzIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9zY3JvbGxXaGVlbFNjcm9sbEVuZCgpIHtcbiAgICB0aGlzLl9zY3JvbGxpbmdDb3VudC0tO1xuICAgIGlmICh0aGlzLl9zY3JvbGxpbmdDb3VudCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9ldmVudE91dHB1dC5lbWl0KCdzY3JvbGxlbmQnLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgICBkYXRlOiB0aGlzLl9kYXRlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIF9zY3JvbGxXaGVlbFBhZ2VDaGFuZ2UoKSB7XG4gICAgdGhpcy5fZGF0ZSA9IF9nZXREYXRlRnJvbVNjcm9sbFdoZWVscy5jYWxsKHRoaXMpO1xuICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2RhdGVjaGFuZ2UnLCB7XG4gICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgZGF0ZTogdGhpcy5fZGF0ZVxuICAgIH0pO1xufVxuZnVuY3Rpb24gX3VwZGF0ZUNvbXBvbmVudHMoKSB7XG4gICAgdGhpcy5zY3JvbGxXaGVlbHMgPSBbXTtcbiAgICB0aGlzLl9zY3JvbGxpbmdDb3VudCA9IDA7XG4gICAgdmFyIGRhdGFTb3VyY2UgPSBbXTtcbiAgICB2YXIgc2l6ZVJhdGlvcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY29tcG9uZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gdGhpcy5fY29tcG9uZW50c1tpXTtcbiAgICAgICAgY29tcG9uZW50LmNyZWF0ZVJlbmRlcmFibGUgPSBfY3JlYXRlUmVuZGVyYWJsZS5iaW5kKHRoaXMpO1xuICAgICAgICB2YXIgdmlld1NlcXVlbmNlID0gbmV3IFZpcnR1YWxWaWV3U2VxdWVuY2Uoe1xuICAgICAgICAgICAgICAgIGZhY3Rvcnk6IGNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogY29tcG9uZW50LmNyZWF0ZSh0aGlzLl9kYXRlKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZhciBvcHRpb25zID0gTGF5b3V0VXRpbGl0eS5jb21iaW5lT3B0aW9ucyh0aGlzLm9wdGlvbnMuc2Nyb2xsQ29udHJvbGxlciwge1xuICAgICAgICAgICAgICAgIGxheW91dDogV2hlZWxMYXlvdXQsXG4gICAgICAgICAgICAgICAgbGF5b3V0T3B0aW9uczogdGhpcy5vcHRpb25zLndoZWVsTGF5b3V0LFxuICAgICAgICAgICAgICAgIGZsb3c6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogVXRpbGl0eS5EaXJlY3Rpb24uWSxcbiAgICAgICAgICAgICAgICBkYXRhU291cmNlOiB2aWV3U2VxdWVuY2UsXG4gICAgICAgICAgICAgICAgYXV0b1BpcGVFdmVudHM6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB2YXIgc2Nyb2xsQ29udHJvbGxlciA9IG5ldyBTY3JvbGxDb250cm9sbGVyKG9wdGlvbnMpO1xuICAgICAgICBzY3JvbGxDb250cm9sbGVyLm9uKCdzY3JvbGxzdGFydCcsIF9zY3JvbGxXaGVlbFNjcm9sbFN0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICBzY3JvbGxDb250cm9sbGVyLm9uKCdzY3JvbGxlbmQnLCBfc2Nyb2xsV2hlZWxTY3JvbGxFbmQuYmluZCh0aGlzKSk7XG4gICAgICAgIHNjcm9sbENvbnRyb2xsZXIub24oJ3BhZ2VjaGFuZ2UnLCBfc2Nyb2xsV2hlZWxQYWdlQ2hhbmdlLmJpbmQodGhpcykpO1xuICAgICAgICB2YXIgc2Nyb2xsV2hlZWwgPSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnQsXG4gICAgICAgICAgICAgICAgc2Nyb2xsQ29udHJvbGxlcjogc2Nyb2xsQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICB2aWV3U2VxdWVuY2U6IHZpZXdTZXF1ZW5jZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zY3JvbGxXaGVlbHMucHVzaChzY3JvbGxXaGVlbCk7XG4gICAgICAgIGNvbXBvbmVudC5vbignY2xpY2snLCBfY2xpY2tJdGVtLmJpbmQodGhpcywgc2Nyb2xsV2hlZWwpKTtcbiAgICAgICAgZGF0YVNvdXJjZS5wdXNoKHNjcm9sbENvbnRyb2xsZXIpO1xuICAgICAgICBzaXplUmF0aW9zLnB1c2goY29tcG9uZW50LnNpemVSYXRpbyk7XG4gICAgfVxuICAgIHRoaXMubGF5b3V0LnNldERhdGFTb3VyY2UoZGF0YVNvdXJjZSk7XG4gICAgdGhpcy5sYXlvdXQuc2V0TGF5b3V0T3B0aW9ucyh7IHJhdGlvczogc2l6ZVJhdGlvcyB9KTtcbn1cbmZ1bmN0aW9uIE92ZXJsYXlMYXlvdXQoY29udGV4dCwgb3B0aW9ucykge1xuICAgIHZhciBoZWlnaHQgPSAoY29udGV4dC5zaXplWzFdIC0gb3B0aW9ucy5pdGVtU2l6ZSkgLyAyO1xuICAgIGNvbnRleHQuc2V0KCd0b3AnLCB7XG4gICAgICAgIHNpemU6IFtcbiAgICAgICAgICAgIGNvbnRleHQuc2l6ZVswXSxcbiAgICAgICAgICAgIGhlaWdodFxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMVxuICAgICAgICBdXG4gICAgfSk7XG4gICAgY29udGV4dC5zZXQoJ21pZGRsZScsIHtcbiAgICAgICAgc2l6ZTogW1xuICAgICAgICAgICAgY29udGV4dC5zaXplWzBdLFxuICAgICAgICAgICAgY29udGV4dC5zaXplWzFdIC0gaGVpZ2h0ICogMlxuICAgICAgICBdLFxuICAgICAgICB0cmFuc2xhdGU6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBoZWlnaHQsXG4gICAgICAgICAgICAxXG4gICAgICAgIF1cbiAgICB9KTtcbiAgICBjb250ZXh0LnNldCgnYm90dG9tJywge1xuICAgICAgICBzaXplOiBbXG4gICAgICAgICAgICBjb250ZXh0LnNpemVbMF0sXG4gICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgXSxcbiAgICAgICAgdHJhbnNsYXRlOiBbXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgY29udGV4dC5zaXplWzFdIC0gaGVpZ2h0LFxuICAgICAgICAgICAgMVxuICAgICAgICBdXG4gICAgfSk7XG59XG5mdW5jdGlvbiBfY3JlYXRlT3ZlcmxheSgpIHtcbiAgICB0aGlzLm92ZXJsYXkgPSBuZXcgTGF5b3V0Q29udHJvbGxlcih7XG4gICAgICAgIGxheW91dDogT3ZlcmxheUxheW91dCxcbiAgICAgICAgbGF5b3V0T3B0aW9uczogeyBpdGVtU2l6ZTogdGhpcy5vcHRpb25zLndoZWVsTGF5b3V0Lml0ZW1TaXplIH0sXG4gICAgICAgIGRhdGFTb3VyY2U6IHRoaXMuX292ZXJsYXlSZW5kZXJhYmxlc1xuICAgIH0pO1xuICAgIHRoaXMuYWRkKHRoaXMub3ZlcmxheSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IERhdGVQaWNrZXI7IiwidmFyIFN1cmZhY2UgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5mYW1vdXMuY29yZS5TdXJmYWNlIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuU3VyZmFjZSA6IG51bGw7XG52YXIgRXZlbnRIYW5kbGVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwuZmFtb3VzLmNvcmUuRXZlbnRIYW5kbGVyIDogbnVsbDtcbmZ1bmN0aW9uIGRlY2ltYWwxKGRhdGUpIHtcbiAgICByZXR1cm4gJycgKyBkYXRlW3RoaXMuZ2V0XSgpO1xufVxuZnVuY3Rpb24gZGVjaW1hbDIoZGF0ZSkge1xuICAgIHJldHVybiAoJzAnICsgZGF0ZVt0aGlzLmdldF0oKSkuc2xpY2UoLTIpO1xufVxuZnVuY3Rpb24gZGVjaW1hbDMoZGF0ZSkge1xuICAgIHJldHVybiAoJzAwJyArIGRhdGVbdGhpcy5nZXRdKCkpLnNsaWNlKC0zKTtcbn1cbmZ1bmN0aW9uIGRlY2ltYWw0KGRhdGUpIHtcbiAgICByZXR1cm4gKCcwMDAnICsgZGF0ZVt0aGlzLmdldF0oKSkuc2xpY2UoLTQpO1xufVxuZnVuY3Rpb24gQmFzZShvcHRpb25zKSB7XG4gICAgdGhpcy5fZXZlbnRPdXRwdXQgPSBuZXcgRXZlbnRIYW5kbGVyKCk7XG4gICAgdGhpcy5fcG9vbCA9IFtdO1xuICAgIEV2ZW50SGFuZGxlci5zZXRPdXRwdXRIYW5kbGVyKHRoaXMsIHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgdGhpc1trZXldID0gb3B0aW9uc1trZXldO1xuICAgICAgICB9XG4gICAgfVxufVxuQmFzZS5wcm90b3R5cGUuc3RlcCA9IDE7XG5CYXNlLnByb3RvdHlwZS5jbGFzc2VzID0gWydpdGVtJ107XG5CYXNlLnByb3RvdHlwZS5nZXRDb21wb25lbnQgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIHJldHVybiBkYXRlW3RoaXMuZ2V0XSgpO1xufTtcbkJhc2UucHJvdG90eXBlLnNldENvbXBvbmVudCA9IGZ1bmN0aW9uIChkYXRlLCB2YWx1ZSkge1xuICAgIHJldHVybiBkYXRlW3RoaXMuc2V0XSh2YWx1ZSk7XG59O1xuQmFzZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gJ292ZXJpZGUgdG8gaW1wbGVtZW50Jztcbn07XG5CYXNlLnByb3RvdHlwZS5jcmVhdGVOZXh0ID0gZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgICB2YXIgZGF0ZSA9IHRoaXMuZ2V0TmV4dChyZW5kZXJhYmxlLmRhdGUpO1xuICAgIHJldHVybiBkYXRlID8gdGhpcy5jcmVhdGUoZGF0ZSkgOiB1bmRlZmluZWQ7XG59O1xuQmFzZS5wcm90b3R5cGUuZ2V0TmV4dCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcbiAgICB2YXIgbmV3VmFsID0gdGhpcy5nZXRDb21wb25lbnQoZGF0ZSkgKyB0aGlzLnN0ZXA7XG4gICAgaWYgKHRoaXMudXBwZXJCb3VuZCAhPT0gdW5kZWZpbmVkICYmIG5ld1ZhbCA+PSB0aGlzLnVwcGVyQm91bmQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbmV3VmFsID0gTWF0aC5tYXgobmV3VmFsICUgdGhpcy51cHBlckJvdW5kLCB0aGlzLmxvd2VyQm91bmQgfHwgMCk7XG4gICAgfVxuICAgIHRoaXMuc2V0Q29tcG9uZW50KGRhdGUsIG5ld1ZhbCk7XG4gICAgcmV0dXJuIGRhdGU7XG59O1xuQmFzZS5wcm90b3R5cGUuY3JlYXRlUHJldmlvdXMgPSBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgIHZhciBkYXRlID0gdGhpcy5nZXRQcmV2aW91cyhyZW5kZXJhYmxlLmRhdGUpO1xuICAgIHJldHVybiBkYXRlID8gdGhpcy5jcmVhdGUoZGF0ZSkgOiB1bmRlZmluZWQ7XG59O1xuQmFzZS5wcm90b3R5cGUuZ2V0UHJldmlvdXMgPSBmdW5jdGlvbiAoZGF0ZSkge1xuICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XG4gICAgdmFyIG5ld1ZhbCA9IHRoaXMuZ2V0Q29tcG9uZW50KGRhdGUpIC0gdGhpcy5zdGVwO1xuICAgIGlmICh0aGlzLmxvd2VyQm91bmQgIT09IHVuZGVmaW5lZCAmJiBuZXdWYWwgPCB0aGlzLmxvd2VyQm91bmQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxvb3ApIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbmV3VmFsID0gbmV3VmFsICUgdGhpcy51cHBlckJvdW5kO1xuICAgIH1cbiAgICB0aGlzLnNldENvbXBvbmVudChkYXRlLCBuZXdWYWwpO1xuICAgIHJldHVybiBkYXRlO1xufTtcbkJhc2UucHJvdG90eXBlLmluc3RhbGxDbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAocmVuZGVyYWJsZSkge1xuICAgIHJlbmRlcmFibGUub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2V2ZW50T3V0cHV0LmVtaXQoJ2NsaWNrJywge1xuICAgICAgICAgICAgdGFyZ2V0OiByZW5kZXJhYmxlLFxuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuQmFzZS5wcm90b3R5cGUuY3JlYXRlUmVuZGVyYWJsZSA9IGZ1bmN0aW9uIChjbGFzc2VzLCBkYXRhKSB7XG4gICAgcmV0dXJuIG5ldyBTdXJmYWNlKHtcbiAgICAgICAgY2xhc3NlczogY2xhc3NlcyxcbiAgICAgICAgY29udGVudDogJzxkaXY+JyArIGRhdGEgKyAnPC9kaXY+J1xuICAgIH0pO1xufTtcbkJhc2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgZGF0ZSA9IGRhdGUgfHwgbmV3IERhdGUoKTtcbiAgICB2YXIgcmVuZGVyYWJsZTtcbiAgICBpZiAodGhpcy5fcG9vbC5sZW5ndGgpIHtcbiAgICAgICAgcmVuZGVyYWJsZSA9IHRoaXMuX3Bvb2xbMF07XG4gICAgICAgIHRoaXMuX3Bvb2wuc3BsaWNlKDAsIDEpO1xuICAgICAgICByZW5kZXJhYmxlLnNldENvbnRlbnQodGhpcy5mb3JtYXQoZGF0ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbmRlcmFibGUgPSB0aGlzLmNyZWF0ZVJlbmRlcmFibGUodGhpcy5jbGFzc2VzLCB0aGlzLmZvcm1hdChkYXRlKSk7XG4gICAgICAgIHRoaXMuaW5zdGFsbENsaWNrSGFuZGxlcihyZW5kZXJhYmxlKTtcbiAgICB9XG4gICAgcmVuZGVyYWJsZS5kYXRlID0gZGF0ZTtcbiAgICByZXR1cm4gcmVuZGVyYWJsZTtcbn07XG5CYXNlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKHJlbmRlcmFibGUpIHtcbiAgICB0aGlzLl9wb29sLnB1c2gocmVuZGVyYWJsZSk7XG59O1xuZnVuY3Rpb24gWWVhcigpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5ZZWFyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuWWVhci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBZZWFyO1xuWWVhci5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ3llYXInXG5dO1xuWWVhci5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDQ7XG5ZZWFyLnByb3RvdHlwZS5zaXplUmF0aW8gPSAxO1xuWWVhci5wcm90b3R5cGUuc3RlcCA9IDE7XG5ZZWFyLnByb3RvdHlwZS5sb29wID0gZmFsc2U7XG5ZZWFyLnByb3RvdHlwZS5zZXQgPSAnc2V0RnVsbFllYXInO1xuWWVhci5wcm90b3R5cGUuZ2V0ID0gJ2dldEZ1bGxZZWFyJztcbmZ1bmN0aW9uIE1vbnRoKCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbk1vbnRoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuTW9udGgucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTW9udGg7XG5Nb250aC5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ21vbnRoJ1xuXTtcbk1vbnRoLnByb3RvdHlwZS5zaXplUmF0aW8gPSAyO1xuTW9udGgucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuTW9udGgucHJvdG90eXBlLnVwcGVyQm91bmQgPSAxMjtcbk1vbnRoLnByb3RvdHlwZS5zdGVwID0gMTtcbk1vbnRoLnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbk1vbnRoLnByb3RvdHlwZS5zZXQgPSAnc2V0TW9udGgnO1xuTW9udGgucHJvdG90eXBlLmdldCA9ICdnZXRNb250aCc7XG5Nb250aC5wcm90b3R5cGUuc3RyaW5ncyA9IFtcbiAgICAnSmFudWFyeScsXG4gICAgJ0ZlYnJ1YXJ5JyxcbiAgICAnTWFyY2gnLFxuICAgICdBcHJpbCcsXG4gICAgJ01heScsXG4gICAgJ0p1bmUnLFxuICAgICdKdWx5JyxcbiAgICAnQXVndXN0JyxcbiAgICAnU2VwdGVtYmVyJyxcbiAgICAnT2N0b2JlcicsXG4gICAgJ05vdmVtYmVyJyxcbiAgICAnRGVjZW1iZXInXG5dO1xuTW9udGgucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RyaW5nc1tkYXRlLmdldE1vbnRoKCldO1xufTtcbmZ1bmN0aW9uIEZ1bGxEYXkoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuRnVsbERheS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2UucHJvdG90eXBlKTtcbkZ1bGxEYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRnVsbERheTtcbkZ1bGxEYXkucHJvdG90eXBlLmNsYXNzZXMgPSBbXG4gICAgJ2l0ZW0nLFxuICAgICdmdWxsZGF5J1xuXTtcbkZ1bGxEYXkucHJvdG90eXBlLnNpemVSYXRpbyA9IDI7XG5GdWxsRGF5LnByb3RvdHlwZS5zdGVwID0gMTtcbkZ1bGxEYXkucHJvdG90eXBlLnNldCA9ICdzZXREYXRlJztcbkZ1bGxEYXkucHJvdG90eXBlLmdldCA9ICdnZXREYXRlJztcbkZ1bGxEYXkucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG59O1xuZnVuY3Rpb24gV2Vla0RheSgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5XZWVrRGF5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuV2Vla0RheS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXZWVrRGF5O1xuV2Vla0RheS5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ3dlZWtkYXknXG5dO1xuV2Vla0RheS5wcm90b3R5cGUuc2l6ZVJhdGlvID0gMjtcbldlZWtEYXkucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuV2Vla0RheS5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDc7XG5XZWVrRGF5LnByb3RvdHlwZS5zdGVwID0gMTtcbldlZWtEYXkucHJvdG90eXBlLmxvb3AgPSB0cnVlO1xuV2Vla0RheS5wcm90b3R5cGUuc2V0ID0gJ3NldERhdGUnO1xuV2Vla0RheS5wcm90b3R5cGUuZ2V0ID0gJ2dldERhdGUnO1xuV2Vla0RheS5wcm90b3R5cGUuc3RyaW5ncyA9IFtcbiAgICAnU3VuZGF5JyxcbiAgICAnTW9uZGF5JyxcbiAgICAnVHVlc2RheScsXG4gICAgJ1dlZG5lc2RheScsXG4gICAgJ1RodXJzZGF5JyxcbiAgICAnRnJpZGF5JyxcbiAgICAnU2F0dXJkYXknXG5dO1xuV2Vla0RheS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJpbmdzW2RhdGUuZ2V0RGF5KCldO1xufTtcbmZ1bmN0aW9uIERheSgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5EYXkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5EYXkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRGF5O1xuRGF5LnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnZGF5J1xuXTtcbkRheS5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDE7XG5EYXkucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5EYXkucHJvdG90eXBlLmxvd2VyQm91bmQgPSAxO1xuRGF5LnByb3RvdHlwZS51cHBlckJvdW5kID0gMzI7XG5EYXkucHJvdG90eXBlLnN0ZXAgPSAxO1xuRGF5LnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbkRheS5wcm90b3R5cGUuc2V0ID0gJ3NldERhdGUnO1xuRGF5LnByb3RvdHlwZS5nZXQgPSAnZ2V0RGF0ZSc7XG5mdW5jdGlvbiBIb3VyKCkge1xuICAgIEJhc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cbkhvdXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5Ib3VyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhvdXI7XG5Ib3VyLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnaG91cidcbl07XG5Ib3VyLnByb3RvdHlwZS5mb3JtYXQgPSBkZWNpbWFsMjtcbkhvdXIucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5Ib3VyLnByb3RvdHlwZS5sb3dlckJvdW5kID0gMDtcbkhvdXIucHJvdG90eXBlLnVwcGVyQm91bmQgPSAyNDtcbkhvdXIucHJvdG90eXBlLnN0ZXAgPSAxO1xuSG91ci5wcm90b3R5cGUubG9vcCA9IHRydWU7XG5Ib3VyLnByb3RvdHlwZS5zZXQgPSAnc2V0SG91cnMnO1xuSG91ci5wcm90b3R5cGUuZ2V0ID0gJ2dldEhvdXJzJztcbmZ1bmN0aW9uIE1pbnV0ZSgpIHtcbiAgICBCYXNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5NaW51dGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5NaW51dGUucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTWludXRlO1xuTWludXRlLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnbWludXRlJ1xuXTtcbk1pbnV0ZS5wcm90b3R5cGUuZm9ybWF0ID0gZGVjaW1hbDI7XG5NaW51dGUucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5NaW51dGUucHJvdG90eXBlLmxvd2VyQm91bmQgPSAwO1xuTWludXRlLnByb3RvdHlwZS51cHBlckJvdW5kID0gNjA7XG5NaW51dGUucHJvdG90eXBlLnN0ZXAgPSAxO1xuTWludXRlLnByb3RvdHlwZS5sb29wID0gdHJ1ZTtcbk1pbnV0ZS5wcm90b3R5cGUuc2V0ID0gJ3NldE1pbnV0ZXMnO1xuTWludXRlLnByb3RvdHlwZS5nZXQgPSAnZ2V0TWludXRlcyc7XG5mdW5jdGlvbiBTZWNvbmQoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuU2Vjb25kLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZS5wcm90b3R5cGUpO1xuU2Vjb25kLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNlY29uZDtcblNlY29uZC5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnaXRlbScsXG4gICAgJ3NlY29uZCdcbl07XG5TZWNvbmQucHJvdG90eXBlLmZvcm1hdCA9IGRlY2ltYWwyO1xuU2Vjb25kLnByb3RvdHlwZS5zaXplUmF0aW8gPSAxO1xuU2Vjb25kLnByb3RvdHlwZS5sb3dlckJvdW5kID0gMDtcblNlY29uZC5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDYwO1xuU2Vjb25kLnByb3RvdHlwZS5zdGVwID0gMTtcblNlY29uZC5wcm90b3R5cGUubG9vcCA9IHRydWU7XG5TZWNvbmQucHJvdG90eXBlLnNldCA9ICdzZXRTZWNvbmRzJztcblNlY29uZC5wcm90b3R5cGUuZ2V0ID0gJ2dldFNlY29uZHMnO1xuZnVuY3Rpb24gTWlsbGlzZWNvbmQoKSB7XG4gICAgQmFzZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuTWlsbGlzZWNvbmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlLnByb3RvdHlwZSk7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNaWxsaXNlY29uZDtcbk1pbGxpc2Vjb25kLnByb3RvdHlwZS5jbGFzc2VzID0gW1xuICAgICdpdGVtJyxcbiAgICAnbWlsbGlzZWNvbmQnXG5dO1xuTWlsbGlzZWNvbmQucHJvdG90eXBlLmZvcm1hdCA9IGRlY2ltYWwzO1xuTWlsbGlzZWNvbmQucHJvdG90eXBlLnNpemVSYXRpbyA9IDE7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUubG93ZXJCb3VuZCA9IDA7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUudXBwZXJCb3VuZCA9IDEwMDA7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuc3RlcCA9IDE7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUubG9vcCA9IHRydWU7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuc2V0ID0gJ3NldE1pbGxpc2Vjb25kcyc7XG5NaWxsaXNlY29uZC5wcm90b3R5cGUuZ2V0ID0gJ2dldE1pbGxpc2Vjb25kcyc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBCYXNlOiBCYXNlLFxuICAgIFllYXI6IFllYXIsXG4gICAgTW9udGg6IE1vbnRoLFxuICAgIEZ1bGxEYXk6IEZ1bGxEYXksXG4gICAgV2Vla0RheTogV2Vla0RheSxcbiAgICBEYXk6IERheSxcbiAgICBIb3VyOiBIb3VyLFxuICAgIE1pbnV0ZTogTWludXRlLFxuICAgIFNlY29uZDogU2Vjb25kLFxuICAgIE1pbGxpc2Vjb25kOiBNaWxsaXNlY29uZFxufTsiLCJ2YXIgU3VyZmFjZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmZhbW91cy5jb3JlLlN1cmZhY2UgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbC5mYW1vdXMuY29yZS5TdXJmYWNlIDogbnVsbDtcbnZhciBWaWV3ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZmFtb3VzLmNvcmUuVmlldyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsLmZhbW91cy5jb3JlLlZpZXcgOiBudWxsO1xudmFyIExheW91dENvbnRyb2xsZXIgPSByZXF1aXJlKCcuLi9MYXlvdXRDb250cm9sbGVyJyk7XG52YXIgVGFiQmFyTGF5b3V0ID0gcmVxdWlyZSgnLi4vbGF5b3V0cy9UYWJCYXJMYXlvdXQnKTtcbmZ1bmN0aW9uIFRhYkJhcihvcHRpb25zKSB7XG4gICAgVmlldy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTE7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdGhpcy5jbGFzc2VzID0gb3B0aW9ucy5jbGFzc2VzID8gdGhpcy5jbGFzc2VzLmNvbmNhdChvcHRpb25zLmNsYXNzZXMpIDogdGhpcy5jbGFzc2VzO1xuICAgIHRoaXMubGF5b3V0ID0gbmV3IExheW91dENvbnRyb2xsZXIodGhpcy5vcHRpb25zLmxheW91dENvbnRyb2xsZXIpO1xuICAgIHRoaXMuYWRkKHRoaXMubGF5b3V0KTtcbiAgICB0aGlzLmxheW91dC5waXBlKHRoaXMuX2V2ZW50T3V0cHV0KTtcbiAgICB0aGlzLl9yZW5kZXJhYmxlcyA9IHtcbiAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgICBzcGFjZXJzOiBbXSxcbiAgICAgICAgYmFja2dyb3VuZDogX2NyZWF0ZVJlbmRlcmFibGUuY2FsbCh0aGlzLCAnYmFja2dyb3VuZCcpLFxuICAgICAgICBzZWxlY3RlZEl0ZW1PdmVybGF5OiBfY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsICdzZWxlY3RlZEl0ZW1PdmVybGF5JylcbiAgICB9O1xuICAgIHRoaXMuc2V0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xufVxuVGFiQmFyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmlldy5wcm90b3R5cGUpO1xuVGFiQmFyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFRhYkJhcjtcblRhYkJhci5wcm90b3R5cGUuY2xhc3NlcyA9IFtcbiAgICAnZmYtd2lkZ2V0JyxcbiAgICAnZmYtdGFiYmFyJ1xuXTtcblRhYkJhci5ERUZBVUxUX09QVElPTlMgPSB7XG4gICAgdGFiQmFyTGF5b3V0OiB7XG4gICAgICAgIG1hcmdpbnM6IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSxcbiAgICAgICAgc3BhY2luZzogMFxuICAgIH0sXG4gICAgY3JlYXRlUmVuZGVyYWJsZXM6IHtcbiAgICAgICAgaXRlbTogdHJ1ZSxcbiAgICAgICAgYmFja2dyb3VuZDogZmFsc2UsXG4gICAgICAgIHNlbGVjdGVkSXRlbU92ZXJsYXk6IGZhbHNlLFxuICAgICAgICBzcGFjZXI6IGZhbHNlXG4gICAgfSxcbiAgICBsYXlvdXRDb250cm9sbGVyOiB7XG4gICAgICAgIGF1dG9QaXBlRXZlbnRzOiB0cnVlLFxuICAgICAgICBsYXlvdXQ6IFRhYkJhckxheW91dCxcbiAgICAgICAgZmxvdzogdHJ1ZSxcbiAgICAgICAgZmxvd09wdGlvbnM6IHtcbiAgICAgICAgICAgIHJlZmxvd09uUmVzaXplOiBmYWxzZSxcbiAgICAgICAgICAgIHNwcmluZzoge1xuICAgICAgICAgICAgICAgIGRhbXBpbmdSYXRpbzogMC44LFxuICAgICAgICAgICAgICAgIHBlcmlvZDogMzAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gX3NldFNlbGVjdGVkSXRlbShpbmRleCkge1xuICAgIGlmIChpbmRleCAhPT0gdGhpcy5fc2VsZWN0ZWRJdGVtSW5kZXgpIHtcbiAgICAgICAgdmFyIG9sZEluZGV4ID0gdGhpcy5fc2VsZWN0ZWRJdGVtSW5kZXg7XG4gICAgICAgIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4ID0gaW5kZXg7XG4gICAgICAgIHRoaXMubGF5b3V0LnNldExheW91dE9wdGlvbnMoeyBzZWxlY3RlZEl0ZW1JbmRleDogaW5kZXggfSk7XG4gICAgICAgIGlmIChvbGRJbmRleCA+PSAwICYmIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW29sZEluZGV4XS5yZW1vdmVDbGFzcykge1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXNbb2xkSW5kZXhdLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJhYmxlcy5pdGVtc1tpbmRleF0uYWRkQ2xhc3MpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW2luZGV4XS5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2xkSW5kZXggPj0gMCkge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRPdXRwdXQuZW1pdCgndGFiY2hhbmdlJywge1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICAgICAgb2xkSW5kZXg6IG9sZEluZGV4LFxuICAgICAgICAgICAgICAgIGl0ZW06IHRoaXMuX3JlbmRlcmFibGVzLml0ZW1zW2luZGV4XVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBfY3JlYXRlUmVuZGVyYWJsZShpZCwgZGF0YSkge1xuICAgIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnMuY3JlYXRlUmVuZGVyYWJsZXNbaWRdO1xuICAgIGlmIChvcHRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICByZXR1cm4gb3B0aW9uLmNhbGwodGhpcywgaWQsIGRhdGEpO1xuICAgIH0gZWxzZSBpZiAoIW9wdGlvbikge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkICYmIGRhdGEgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIHZhciBzdXJmYWNlID0gbmV3IFN1cmZhY2Uoe1xuICAgICAgICAgICAgY2xhc3NlczogdGhpcy5jbGFzc2VzLFxuICAgICAgICAgICAgY29udGVudDogZGF0YSA/ICc8ZGl2PicgKyBkYXRhICsgJzwvZGl2PicgOiB1bmRlZmluZWRcbiAgICAgICAgfSk7XG4gICAgc3VyZmFjZS5hZGRDbGFzcyhpZCk7XG4gICAgaWYgKGlkID09PSAnaXRlbScpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy50YWJCYXJMYXlvdXQgJiYgdGhpcy5vcHRpb25zLnRhYkJhckxheW91dC5pdGVtU2l6ZSAmJiB0aGlzLm9wdGlvbnMudGFiQmFyTGF5b3V0Lml0ZW1TaXplID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzdXJmYWNlLnNldFNpemUodGhpcy5sYXlvdXQuZ2V0RGlyZWN0aW9uKCkgPyBbXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXJmYWNlO1xufVxuVGFiQmFyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBWaWV3LnByb3RvdHlwZS5zZXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9ucyk7XG4gICAgaWYgKCF0aGlzLmxheW91dCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMudGFiQmFyTGF5b3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5sYXlvdXQuc2V0TGF5b3V0T3B0aW9ucyhvcHRpb25zLnRhYkJhckxheW91dCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxheW91dENvbnRyb2xsZXIpIHtcbiAgICAgICAgdGhpcy5sYXlvdXQuc2V0T3B0aW9ucyhvcHRpb25zLmxheW91dENvbnRyb2xsZXIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5UYWJCYXIucHJvdG90eXBlLnNldEl0ZW1zID0gZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4O1xuICAgIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4ID0gLTE7XG4gICAgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXMgPSBbXTtcbiAgICB0aGlzLl9yZW5kZXJhYmxlcy5zcGFjZXJzID0gW107XG4gICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gX2NyZWF0ZVJlbmRlcmFibGUuY2FsbCh0aGlzLCAnaXRlbScsIGl0ZW1zW2ldKTtcbiAgICAgICAgICAgIGlmIChpdGVtLm9uKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5vbignY2xpY2snLCBfc2V0U2VsZWN0ZWRJdGVtLmJpbmQodGhpcywgaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIGlmIChpIDwgaXRlbXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgIHZhciBzcGFjZXIgPSBfY3JlYXRlUmVuZGVyYWJsZS5jYWxsKHRoaXMsICdzcGFjZXInLCAnICcpO1xuICAgICAgICAgICAgICAgIGlmIChzcGFjZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyYWJsZXMuc3BhY2Vycy5wdXNoKHNwYWNlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMubGF5b3V0LnNldERhdGFTb3VyY2UodGhpcy5fcmVuZGVyYWJsZXMpO1xuICAgIGlmICh0aGlzLl9yZW5kZXJhYmxlcy5pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgX3NldFNlbGVjdGVkSXRlbS5jYWxsKHRoaXMsIE1hdGgubWF4KE1hdGgubWluKGN1cnJlbnRJbmRleCwgdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXMubGVuZ3RoIC0gMSksIDApKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuVGFiQmFyLnByb3RvdHlwZS5nZXRJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyYWJsZXMuaXRlbXM7XG59O1xuVGFiQmFyLnByb3RvdHlwZS5nZXRJdGVtU3BlYyA9IGZ1bmN0aW9uIChpbmRleCwgbm9ybWFsaXplKSB7XG4gICAgcmV0dXJuIHRoaXMubGF5b3V0LmdldFNwZWModGhpcy5fcmVuZGVyYWJsZXMuaXRlbXNbaW5kZXhdLCBub3JtYWxpemUpO1xufTtcblRhYkJhci5wcm90b3R5cGUuc2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICBfc2V0U2VsZWN0ZWRJdGVtLmNhbGwodGhpcywgaW5kZXgpO1xuICAgIHJldHVybiB0aGlzO1xufTtcblRhYkJhci5wcm90b3R5cGUuZ2V0U2VsZWN0ZWRJdGVtSW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSXRlbUluZGV4O1xufTtcblRhYkJhci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnNpemUgfHwgKHRoaXMubGF5b3V0ID8gdGhpcy5sYXlvdXQuZ2V0U2l6ZSgpIDogVmlldy5wcm90b3R5cGUuZ2V0U2l6ZS5jYWxsKHRoaXMpKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFRhYkJhcjsiXX0=

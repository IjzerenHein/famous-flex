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
 * Animating between famo.us views in awesome ways.
 *
 * @module
 */
define(function(require, exports, module) {

    // import dependencies
    var View = require('famous/core/View');
    var LayoutController = require('./LayoutController');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var RenderNode = require('famous/core/RenderNode');
    var Timer = require('famous/utilities/Timer');
    var Easing = require('famous/transitions/Easing');
    //var Transitionable = require('famous/animations/Transitionable');

    /**
     * @class
     * @param {Object} [options] Configurable options.
     * @param {Object} [options.transition] Transition options (default: `{duration: 400, curve: Easing.inOutQuad}`).
     * @param {Function} [options.animation] Animation function (default: `AnimationController.Animation.Slide.Left`).
     * @param {Number} [options.zIndexOffset] Optional z-index difference between the hiding & showing renderable (default: 0).
     * @param {Object} [options.show] Show specific options.
     * @param {Object} [options.show.transition] Show specific transition options.
     * @param {Function} [options.show.animation] Show specific animation function.
     * @param {Object} [options.hide] Hide specific options.
     * @param {Object} [options.hide.transition] Hide specific transition options.
     * @param {Function} [options.hide.animation] Hide specific animation function.
     * @param {Object} [options.transfer] Transfer options.
     * @param {Object} [options.transfer.transition] Transfer specific transition options.
     * @param {Number} [options.transfer.zIndex] Z-index the tranferables are moved on top while animating (default: 10).
     * @param {Bool} [options.transfer.fastResize] When enabled, scales the renderable i.s.o. resizing when doing the transfer animation (default: true).
     * @param {Array} [options.transfer.items] Ids (key/value) pairs (source-id/target-id) of the renderables that should be transferred.
     * @alias module:AnimationController
     */
    function AnimationController(options) {
        View.apply(this, arguments);

        this._size = [0, 0];
        _createLayout.call(this);

        if (options) {
            this.setOptions(options);
        }
    }
    AnimationController.prototype = Object.create(View.prototype);
    AnimationController.prototype.constructor = AnimationController;

    /**
     * Out of the box supported animations.
     */
    AnimationController.Animation = {
        Slide: {
            Left: function(show, size) {
                return {transform: Transform.translate(show ? size[0] : -size[0], 0, 0)};
            },
            Right: function(show, size) {
                return {transform: Transform.translate(show ? -size[0] : size[0], 0, 0)};
            },
            Up: function(show, size) {
                return {transform: Transform.translate(0, show ? size[1] : -size[1], 0)};
            },
            Down: function(show, size) {
                return {transform: Transform.translate(0, show ? -size[1] : size[1], 0)};
            }
        },
        Fade: function(show, size) {
            return {
                opacity: (this && (this.opacity !== undefined)) ? this.opacity : 0
            };
        },
        Zoom: function(show, size) {
            var scale = (this && (this.scale !== undefined)) ? this.scale : 0.5;
            return {
                transform: Transform.scale(scale, scale, 1),
                align: [0.5, 0.5],
                origin: [0.5, 0.5]
            };
        },
        FadedZoom: function(show, size) {
            var scale = show ? ((this && (this.showScale !== undefined)) ? this.showScale : 0.9) : ((this && (this.hideScale !== undefined)) ? this.hideScale : 1.1);
            return {
                opacity: (this && (this.opacity !== undefined)) ? this.opacity : 0,
                transform: Transform.scale(scale, scale, 1),
                align: [0.5, 0.5],
                origin: [0.5, 0.5]
            };
        }
        /*,
        Flip: {
            Left: function(show, size) {
                return {transform: Transform.rotate(0, show ? Math.PI : -Math.PI, 0)};
            },
            Right: function(show, size) {
                return {transform: Transform.rotate(0, show ? -Math.PI : Math.PI, 0)};
            },
            Up: function(show, size) {
                return {transform: Transform.rotate(show ? Math.PI : -Math.PI, 0, 0)};
            },
            Down: function(show, size) {
                return {transform: Transform.rotate(show ? -Math.PI : Math.PI, 0, 0)};
            }
        }*/
    };

    AnimationController.DEFAULT_OPTIONS = {
        transition: {duration: 400, curve: Easing.inOutQuad},
        animation: AnimationController.Animation.Fade,
        show: {
            // transition,
            // animation
        },
        hide: {
            // transition,
            // animation
        },
        transfer: {
            fastResize: true,
            zIndex: 10 // z-index offset the items are translated while transferring
            // transition,
            // items: {
            //   'image': 'image'
            //   'image': ['image', 'image2']
            // }
        },
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

    /**
     * Stacks the renderables on top of each other
     * with a z-translation of this.options.zIndexOffset.
     */
    function ViewStackLayout(context, options) {
        var set = {
            size: context.size,
            translate: [0, 0, 0]
        };
        this._size[0] = context.size[0];
        this._size[1] = context.size[1];
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

                    // Layout view
                    var view = views[i];
                    context.set(view, set);

                    // Layout any transferables
                    for (var j = 0; j < transferables.length; j++) {
                        for (var k = 0; k < item.transferables.length; k++) {
                            if (transferables[j].renderNode === item.transferables[k].renderNode) {
                                context.set(transferables[j], {
                                    translate: [0, 0, set.translate[2]],
                                    size: [context.size[0], context.size[1]]
                                });
                            }
                        }
                    }

                    // Increase z-index for next view
                    set.translate[2] += options.zIndexOffset;
                    break;
            }
        }
    }

    /**
     * Creates the view-stack layout.
     */
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
        this.layout.on('layoutend', _processAnimations.bind(this));
    }

    /**
     * Gets the spec from a spec.
     */
    function _getViewSpec(item, view, id, callback) {
        if (!item.view) {
            return;
        }
        var spec = view.getSpec(id);
        if (spec && !spec.trueSizeRequested) {
            callback(spec);
        }
        else {
            Timer.after(_getViewSpec.bind(this, item, view, id, callback), 1);
        }
    }

    /**
     * Gets the transferable delegate for the given id.
     */
    function _getTransferable(item, view, id) {
        // 1. If view supports getTransferable, use that
        if (view.getTransferable) {
            return view.getTransferable(id);
        }
        // 2. If view is derived from layoutcontroller, use that
        if (view.getSpec && view.get && view.replace) {
            if (view.get(id) !== undefined) {
                return {
                    get: function() {
                        return view.get(id);
                    },
                    show: function(renderable) {
                        view.replace(id, renderable);
                    },
                    getSpec: _getViewSpec.bind(this, item, view, id)
                };
            }
        }
        // 3. If view has an embedded layout, use that as fallback
        if (view.layout) {
            return _getTransferable.call(this, item, view.layout, id);
        }
    }

    /**
     * Begins visual transfer or renderables from the previous item
     * to the new item.
     */
    function _initTransferableAnimations(item, prevItem, callback) {
        var callbackCount = 0;
        function waitForAll() {
            callbackCount--;
            if (callbackCount === 0) {
                callback();
            }
        }
        for (var sourceId in item.options.transfer.items) {
            if (_initTransferableAnimation.call(this, item, prevItem, sourceId, waitForAll)) {
                callbackCount++;
            }
        }
        if (!callbackCount) {
            callback();
        }
    }
    function _initTransferableAnimation(item, prevItem, sourceId, callback) {
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
        }
        else {
            transferable.target = _getTransferable.call(this, item, item.view, target);
        }
        if (transferable.source && transferable.target) {
            transferable.source.getSpec(function(sourceSpec) {

                // Replace source & target renderables in the views
                // source: dummy-node
                // target: target-renderable with opacity: 0.
                transferable.sourceSpec = sourceSpec;
                transferable.originalSource = transferable.source.get();
                transferable.source.show(new RenderNode(new Modifier(sourceSpec)));
                transferable.originalTarget = transferable.target.get();
                var targetNode = new RenderNode(new Modifier({opacity: 0}));
                targetNode.add(transferable.originalTarget);
                transferable.target.show(targetNode);

                // Take ownership of the source renderable.
                // This renderable will be layouted by the layout-function
                var zIndexMod = new Modifier({
                    transform: Transform.translate(0, 0, item.options.transfer.zIndex)
                });
                transferable.mod = new StateModifier(sourceSpec);
                transferable.renderNode = new RenderNode(zIndexMod);
                transferable.renderNode.add(transferable.mod).add(transferable.originalSource);
                item.transferables.push(transferable);
                this._renderables.transferables.push(transferable.renderNode);
                this.layout.reflowLayout();

                // Wait for the target spec to have settled. This may take a couple render
                // cycles if for instance, this involves a true-size renderable or the
                // renderable is affected by other true-size renderables around itsself.
                Timer.after(function() {
                    var callbackCalled;
                    transferable.target.getSpec(function(targetSpec, transition) {
                        transferable.targetSpec = targetSpec;
                        transferable.transition = transition;
                        if (!callbackCalled) {
                            callback();
                        }
                    }, true);
                }, 1);
            }.bind(this), false);
            return true;
        }
        else {
            return false;
        }
    }
    function _startTransferableAnimations(item, callback) {
        for (var j = 0; j < item.transferables.length; j++) {
            var transferable = item.transferables[j];
            transferable.mod.halt();
            if ((transferable.sourceSpec.opacity !== undefined) || (transferable.targetSpec.opacity !== undefined)) {
                transferable.mod.setOpacity((transferable.targetSpec.opacity === undefined) ? 1 : transferable.targetSpec.opacity, transferable.transition || item.options.transfer.transition);
            }
            if (item.options.transfer.fastResize) {
                if (transferable.sourceSpec.transform || transferable.targetSpec.transform || transferable.sourceSpec.size || transferable.targetSpec.size) {
                    var transform = transferable.targetSpec.transform || Transform.identity;
                    if (transferable.sourceSpec.size && transferable.targetSpec.size) {
                        transform = Transform.multiply(transform, Transform.scale(transferable.targetSpec.size[0] / transferable.sourceSpec.size[0], transferable.targetSpec.size[1] / transferable.sourceSpec.size[1], 1));
                    }
                    transferable.mod.setTransform(transform, transferable.transition || item.options.transfer.transition, callback);
                    callback = undefined;
                }
            }
            else {
                if (transferable.sourceSpec.transform || transferable.targetSpec.transform) {
                    transferable.mod.setTransform(transferable.targetSpec.transform || Transform.identity, transferable.transition || item.options.transfer.transition, callback);
                    callback = undefined;
                }
                if (transferable.sourceSpec.size || transferable.targetSpec.size) {
                    transferable.mod.setSize(transferable.targetSpec.size || transferable.sourceSpec.size, transferable.transition || item.options.transfer.transition, callback);
                    callback = undefined;
                }
            }
        }
        if (callback) {
            callback();
        }
    }

    /**
     * Called whenever the view has been shown and the
     * transferable animations should be ended. This returns
     * the renderables to their original views.
     */
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

    /**
     * Starts a show or hide animation.
     */
    function _processAnimations(event) {
        var prevItem;
        for (var i = 0; i < this._viewStack.length; i++) {
            var item = this._viewStack[i];
            switch (item.state) {
                case ItemState.HIDE:
                    item.state = ItemState.HIDING;
                    _startHideAnimation.call(this, item, prevItem, event.size);
                    _updateState.call(this);
                    break;
                case ItemState.SHOW:
                    item.state = ItemState.SHOWING;
                    _initShowAnimation.call(this, item, prevItem, event.size);
                    _updateState.call(this);
                    break;
            }
            prevItem = item;
        }
    }

    /**
     * Starts the view animation.
     */
    function _initShowAnimation(item, prevItem, size) {
        var spec = item.options.show.animation ? item.options.show.animation.call(undefined, true, size) : {};
        item.startSpec = spec;
        item.endSpec = {
            opacity: 1,
            transform: Transform.identity
        };
        item.mod.halt();
        if (spec.transform) {
            item.mod.setTransform(spec.transform);
        }
        if (spec.opacity !== undefined) {
            item.mod.setOpacity(spec.opacity);
        }
        if (spec.align) {
            item.mod.setAlign(spec.align);
        }
        if (spec.origin) {
            item.mod.setOrigin(spec.origin);
        }
        if (prevItem) {
            _initTransferableAnimations.call(this, item, prevItem, _startShowAnimation.bind(this, item, spec));
        }
        else {
            _startShowAnimation.call(this, item, spec);
        }
    }

    /**
     * Starts the show animation whenever init has completed.
     */
    function _startShowAnimation(item, spec) {
        if (!item.halted) {
            var callback = item.showCallback;
            if (spec.transform) {
                item.mod.setTransform(Transform.identity, item.options.show.transition, callback);
                callback = undefined;
            }
            if (spec.opacity !== undefined) {
                item.mod.setOpacity(1, item.options.show.transition, callback);
                callback = undefined;
            }
            _startTransferableAnimations.call(this, item, callback);
        }
    }

    /**
     * Helper function for interpolating between start/end state based on percentage.
     */
    function _interpolate(start, end, perc) {
        return start + ((end - start) * perc);
    }

    /**
     * Halts a item at a given frame. The frame is provided as a percentage
     * of the whole transition.
     */
    function _haltItemAtFrame(item, perc) {
        item.mod.halt();
        item.halted = true;
        if (item.startSpec && (perc !== undefined)) {
            if ((item.startSpec.opacity !== undefined) && (item.endSpec.opacity !== undefined)) {
                item.mod.setOpacity(_interpolate(item.startSpec.opacity, item.endSpec.opacity, perc));
            }
            if (item.startSpec.transform && item.endSpec.transform) {
                var transform = [];
                for (var i = 0; i < item.startSpec.transform.length; i++) {
                    transform.push(_interpolate(item.startSpec.transform[i], item.endSpec.transform[i], perc));
                }
                item.mod.setTransform(transform);
            }
        }
    }

    /**
     * Starts the hide animation.
     */
    function _startHideAnimation(item, prevItem, size) {
        var spec = item.options.hide.animation ? item.options.hide.animation.call(undefined, false, size) : {};
        item.endSpec = spec;
        item.startSpec = {
            opacity: 1,
            transform: Transform.identity
        };
        if (!item.halted) {
            item.mod.halt();
            var callback = item.hideCallback;
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

    /**
     * Sets the options for an item.
     */
    function _setItemOptions(item, options, callback) {
        item.options = {
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
                zIndex: this.options.transfer.zIndex,
                fastResize: this.options.transfer.fastResize
            }
        };
        if (options) {
            item.options.show.transition = (options.show ? options.show.transition : undefined) || options.transition || item.options.show.transition;
            if (options && options.show && (options.show.animation !== undefined)) {
                item.options.show.animation = options.show.animation;
            }
            else if (options && (options.animation !== undefined)) {
                item.options.show.animation = options.animation;
            }
            item.options.transfer.transition = (options.transfer ? options.transfer.transition : undefined) || options.transition || item.options.transfer.transition;
            item.options.transfer.items = (options.transfer ? options.transfer.items : undefined) || item.options.transfer.items;
            item.options.transfer.zIndex = (options.transfer && (options.transfer.zIndex !== undefined)) ? options.transfer.zIndex : item.options.transfer.zIndex;
            item.options.transfer.fastResize = (options.transfer && (options.transfer.fastResize !== undefined)) ? options.transfer.fastResize : item.options.transfer.fastResize;
        }
        item.showCallback = function() {
            item.showCallback = undefined;
            item.state = ItemState.VISIBLE;
            _updateState.call(this);
            _endTransferableAnimations.call(this, item);
            item.endSpec = undefined;
            item.startSpec = undefined;
            if (callback) {
                callback();
            }
        }.bind(this);
    }

    /**
     * Updates the state.
     */
    function _updateState() {
        var prevItem;
        var invalidated = false;
        for (var i = 0; i < Math.min(this._viewStack.length, 2); i++) {
            var item = this._viewStack[i];
            if (item.state === ItemState.QUEUED) {
                if (!prevItem ||
                    (prevItem.state === ItemState.VISIBLE) ||
                    (prevItem.state === ItemState.HIDING)) {
                    if (prevItem && (prevItem.state === ItemState.VISIBLE)) {
                        prevItem.state = ItemState.HIDE;
                    }
                    item.state = ItemState.SHOW;
                    invalidated = true;
                }
                break;
            }
            else if ((item.state === ItemState.VISIBLE) && item.hide) {
                item.state = ItemState.HIDE;
            }
            if ((item.state === ItemState.SHOW) || (item.state === ItemState.HIDE)) {
                this.layout.reflowLayout();
            }
            prevItem = item;
        }
        if (invalidated) {
            _updateState.call(this);
            this.layout.reflowLayout();
        }
    }

    function _resume() {
        for (var i = 0; i < Math.min(this._viewStack.length, 2); i++) {
            var item = this._viewStack[i];
            if (item.halted) {
                item.halted = false;
                if (item.endSpec) {
                    var callback;
                    switch (item.state) {
                        case ItemState.HIDE:
                        case ItemState.HIDING:
                            callback = item.hideCallback;
                            break;
                        case ItemState.SHOW:
                        case ItemState.SHOWING:
                            callback = item.showCallback;
                            break;
                    }
                    item.mod.halt();
                    if (item.endSpec.transform) {
                        item.mod.setTransform(item.endSpec.transform, item.options.show.transition, callback);
                        callback = undefined;
                    }
                    if (item.endSpec.opacity !== undefined) {
                        item.mod.setOpacity(item.endSpec.opacity, item.options.show.transition, callback);
                    }
                    if (callback) {
                        callback();
                    }
                }
            }
        }
    }

    /**
     * Shows a renderable using an animation and hides the old renderable.
     *
     * When multiple show operations are executed, they are queued and
     * shown in that sequence. Use `.halt` to cancel any pending show
     * operations from the queue.
     *
     * @param {Renderable} renderable View or surface to show
     * @param {Object} [options] Options.
     * @param {Object} [options.transition] Transition options for both show & hide.
     * @param {Function} [options.animation] Animation function for both show & hide.
     * @param {Object} [options.show] Show specific options.
     * @param {Object} [options.show.transition] Show specific transition options.
     * @param {Function} [options.show.animation] Show specific animation function.
     * @param {Object} [options.hide] Hide specific options.
     * @param {Object} [options.hide.transition] Hide specific transition options.
     * @param {Function} [options.hide.animation] Hide specific animation function.
     * @param {Object} [options.transfer] Transfer options.
     * @param {Object} [options.transfer.transition] Transfer specific transition options.
     * @param {Number} [options.transfer.zIndex] Z-index the tranferables are moved on top while animating.
     * @param {Array} [options.transfer.items] Ids (key/value) pairs (source-id/target-id) of the renderables that should be transferred.
     * @param {Function} [callback] Function that is called on completion.
     * @return {AnimationController} this
     */
    AnimationController.prototype.show = function(renderable, options, callback) {
        _resume.call(this, renderable);
        if (!renderable) {
            return this.hide(options, callback);
        }
        var item = this._viewStack.length ? this._viewStack[this._viewStack.length - 1] : undefined;
        if (item && (item.view === renderable)) {
            item.hide = false;
            if (item.state === ItemState.HIDE) {
                item.state = ItemState.QUEUED;
                _setItemOptions.call(this, item, options, callback);
                _updateState.call(this);
            }
            else if (callback) {
                callback();
            }
            return this;
        }
        if (item && (item.state !== ItemState.HIDING) && options) {
            item.options.hide.transition = (options.hide ? options.hide.transition : undefined) || options.transition || item.options.hide.transition;
            if (options && options.hide && (options.hide.animation !== undefined)) {
                item.options.hide.animation = options.hide.animation;
            }
            else if (options && (options.animation !== undefined)) {
                item.options.hide.animation = options.animation;
            }
        }
        item = {
            view: renderable,
            mod: new StateModifier(),
            state: ItemState.QUEUED,
            callback: callback,
            transferables: [] // renderables currently being transfered
        };
        item.node = new RenderNode(item.mod);
        item.node.add(renderable);
        _setItemOptions.call(this, item, options, callback);
        item.hideCallback = function() {
            item.hideCallback = undefined;
            var index = this._viewStack.indexOf(item);
            this._renderables.views.splice(index, 1);
            this._viewStack.splice(index, 1);
            item.view = undefined;
            _updateState.call(this);
            this.layout.reflowLayout();
        }.bind(this);
        this._renderables.views.push(item.node);
        this._viewStack.push(item);
        _updateState.call(this);
        return this;
    };

    /**
     * Hides the current view with an animation.
     *
     * @param {Object} [options] Hide options
     * @param {Object} [options.transition] Hide transition options.
     * @param {Function} [options.animation] Hide animation function.
     * @param {Function} [callback] Function that is called an completion.
     * @return {AnimationController} this
     */
    AnimationController.prototype.hide = function(options, callback) {
        _resume.call(this);
        var item = this._viewStack.length ? this._viewStack[this._viewStack.length - 1] : undefined;
        if (!item || (item.state === ItemState.HIDING)) {
            return this;
        }
        item.hide = true;
        if (options) {
            item.options.hide.transition = (options.hide ? options.hide.transition : undefined) || options.transition || item.options.hide.transition;
            if (options && options.hide && (options.hide.animation !== undefined)) {
                item.options.hide.animation = options.hide.animation;
            }
            else if (options && (options.animation !== undefined)) {
                item.options.hide.animation = options.animation;
            }
        }
        item.hideCallback = function() {
            item.hideCallback = undefined;
            var index = this._viewStack.indexOf(item);
            this._renderables.views.splice(index, 1);
            this._viewStack.splice(index, 1);
            item.view = undefined;
            _updateState.call(this);
            this.layout.reflowLayout();
            if (callback) {
                callback();
            }
        }.bind(this);
        _updateState.call(this);
        return this;
    };

    /**
     * Clears the queue of any pending show animations.
     *
     * @param {Boolean} [stopAnimation] Freezes the current animation.
     * @param {Number} [framePerc] Frame at which to freeze the animation (in percentage).
     * @return {AnimationController} this
     */
    AnimationController.prototype.halt = function(stopAnimation, framePerc) {
        var item;
        for (var i = 0; i < this._viewStack.length; i++) {
            if (stopAnimation) {
                item = this._viewStack[i];
                switch (item.state) {
                    case ItemState.SHOW:
                    case ItemState.SHOWING:
                    case ItemState.HIDE:
                    case ItemState.HIDING:
                    case ItemState.VISIBLE:
                        _haltItemAtFrame(item, framePerc);
                        break;
                }
            }
            else {
                item = this._viewStack[this._viewStack.length - 1];
                if ((item.state === ItemState.QUEUED) || (item.state === ItemState.SHOW)) {
                    this._renderables.views.splice(this._viewStack.length - 1, 1);
                    this._viewStack.splice(this._viewStack.length - 1, 1);
                    item.view = undefined;
                }
                else {
                    break;
                }
            }
        }
        return this;
    };

    /**
     * Aborts the currently active show or hide operation, effectively
     * reversing the animation.
     *
     * @param {Function} [callback] Function that is called on completion.
     * @return {AnimationController} this
     */
    AnimationController.prototype.abort = function(callback) {
        if ((this._viewStack.length >= 2) && (this._viewStack[0].state === ItemState.HIDING) && (this._viewStack[1].state === ItemState.SHOWING)) {
            var prevItem = this._viewStack[0];
            var item = this._viewStack[1];
            var swapSpec;

            item.halted = true;
            swapSpec = item.endSpec;
            item.endSpec = item.startSpec;
            item.startSpec = swapSpec;
            item.state = ItemState.HIDING;
            item.hideCallback = function() {
                item.hideCallback = undefined;
                var index = this._viewStack.indexOf(item);
                this._renderables.views.splice(index, 1);
                this._viewStack.splice(index, 1);
                item.view = undefined;
                _updateState.call(this);
                this.layout.reflowLayout();
            }.bind(this);

            prevItem.halted = true;
            swapSpec = prevItem.endSpec;
            prevItem.endSpec = prevItem.startSpec;
            prevItem.startSpec = swapSpec;
            prevItem.state = ItemState.SHOWING;
            prevItem.showCallback = function() {
                prevItem.showCallback = undefined;
                prevItem.state = ItemState.VISIBLE;
                _updateState.call(this);
                _endTransferableAnimations.call(this, prevItem);
                prevItem.endSpec = undefined;
                prevItem.startSpec = undefined;
                if (callback) {
                    callback();
                }
            }.bind(this);

            _resume.call(this);
        }
        return this;
    };

    /**
     * Gets the currently visible or being shown renderable.
     *
     * @return {Renderable} currently visible view/surface
     */
    AnimationController.prototype.get = function() {
        for (var i = 0; i < this._viewStack.length; i++) {
            var item = this._viewStack[i];
            if ((item.state === ItemState.VISIBLE) ||
                (item.state === ItemState.SHOW) ||
                (item.state === ItemState.SHOWING)) {
                return item.view;
            }
        }
        return undefined;
    };

    /**
     * Gets the size of the view.
     *
     * @return {Array.Number} size
     */
    AnimationController.prototype.getSize = function() {
        return this._size || this.options.size;
    };

    module.exports = AnimationController;
});

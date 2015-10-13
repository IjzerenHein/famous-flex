FlexScrollView
==========

FlexScrollView is a high performance scroll-view for famo.us based on the famous-flex LayoutController technology. The scrollview separates the actual layout algorithm from the scrollview, making it possible to select any layout into the scrollview.

By default FlexScrollView uses the [ListLayout](../docs/layouts/ListLayout.md) layout, which supports features such as [sticky headers](#sticky-headers-listlayout) and [margins & spacing](#margins--spacing-listlayout).


# Index

- [Getting started](#getting-started)
- [API reference](../docs/FlexScrollView.md)
- [Flow mode animations](#flow-mode-animations)
- [Collection layout](#collection-layout)
- [Pagination](#pagination)
- [Inserting & removing items](#inserting--removing-items)
    - [Auto event piping](#auto-event-piping)
    - [Moving & swapping items](#moving--swapping-items)
- [Getting the visible item(s)](#getting-the-visible-items)
- [Scrolling](#scrolling)
- [Margins & spacing](#margins--spacing-listlayout)
- [Direction & alignment](#direction--alignment)
- [Clipping & ContainerSurfaces](#clipping--containersurfaces)
- [Pull to refresh](#pull-to-refresh)
- [Sticky headers](#sticky-headers-listlayout)
- [Advanced effects](#advanced-effects)
    - [Embedded scrollview linking](#embedded-scrollview-linking)
    - [Embedded scrollview scrolling restrictions](#embedded-scrollview-scrolling-restrictions)
- [Events](#events)

# Getting started

To use the FlexScrollView in your project, install famous-flex using npm or bower:

    npm install famous-flex

    bower install famous-flex

To create the FlexScrollView use:

```javascript
var FlexScrollView = require('famous-flex/FlexScrollView');

var scrollView = new FlexScrollView();
this.add(scrollView);
```

# Flow mode animations

By enabling `flow` mode, renderables are smoothly transitioned to their new state whenever items are inserted, removed or the scrollview is resized.

![FlowMode](FlexScrollView/flowmode.gif)

The effect as seen above is created by setting the following options:

```javascript
var scrollView = new FlexScrollView({
    flow: true,             // enable flow-mode (can only be enabled from the constructor)
    flowOptions: {
        spring: {               // spring-options used when transitioning between states
            dampingRatio: 0.8,  // spring damping ratio
            period: 1000        // duration of the animation
        },
        insertSpec: {           // render-spec used when inserting renderables
            opacity: 0          // start opacity is 0, causing a fade-in effect,
            //size: [0, 0],     // uncommented to create a grow-effect
            //transform: Transform.translate(-300, 0, 0) // uncomment for slide-in effect
        }
        //removeSpec: {...},    // render-spec used when removing renderables
    }
});
```

# Collection layout

Any layout can be selected into the FlexScrollView. Even layouts that do not support scrolling can be selected (in that case scrolling is disabled). For instance, to use the multi-cell CollectionLayout layout use:

```javascript
var CollectionLayout = require('famous-flex/layouts/CollectionLayout');

var scrollView = new FlexScrollView({
    layout: CollectionLayout,
    layoutOptions: {
        itemSize: [50, 50],
        margins: [50, 10, 50, 10],
        spacing: [10, 10]
    }
});
```


# Pagination

Pagination causes the scrollview to neatly align the renderables with the edge of the scrollview. This option is disabled by default. To enable it, set the `paginated` option to `true` in the constructor or using `setOptions`:

```javascript
var scrollView = new FlexScrollView({
    paginated: true
});
```

Pagination modes:

![FlowMode](FlexScrollView/PaginationMode.PAGE.gif) ![FlowMode](FlexScrollView/PaginationMode.SCROLL.gif)

|mode                   |description|
|-----------------------|-----------|
|`PaginationMode.PAGE`|Paginates to the page immediately after the last touch/mouse event. **(default)**|
|`PaginationMode.SCROLL`|Scrolls the view but only paginates when the energy of the scroll-particle is below a certain threshold.|

To change the pagination-mode or threshold use:

```javascript
var scrollView = new FlexScrollView({
    paginated: true,
    paginationMode: FlexScrollView.PaginationMode.SCROLL,
    paginationEnergyThreshold: 0.01
});
```


# Inserting & removing items

Inserting & removing items can be done in various ways.

When using the insert/push/remove functions, you can specify a render-spec to animate the renderable when inserting/removing (possible when `flow` mode is enabled).

```javascript
scrollView.insert(0, new Surface({}));  // insert at the beginning
scrollView.insert(3, new Surface({}), {opacity: 0}); // insert after index 3, with fade-in effect
scrollView.insert(-1, new Surface({})); // insert after the end
scrollView.push(new Surface({}));       // insert after the end
scrollView.push(new Surface({}), {size: [0, 0]}); // insert with grow effect
scrollView.remove(0);                   // remove at index 0
scrollView.remove(-1, {opacity: 0});    // remove last item and fade-out
scrollView.removeAll();                 // removes all items
scrollView.replace(0, new Surface({})); // replaces the item at index 0
```

Using `setDataSource` or `sequenceFrom`:

```javascript
// Using an array
scrollView.setDataSource([surface1, surface2, ...]);
scrollView.sequenceFrom([surface1, surface2, ...]);

// Using a ViewSequence
var viewSequence = new LinkedListViewSequence();
viewSequence.push(surface1);
viewSequence.push(surface2);
viewSequence.push(...);
scrollView.setDataSource(viewSequence);
scrollView.sequenceFrom(viewSequence); // or using sequenceFrom
```

## Auto event piping

When inserting renderables, you typically have to pipe the events from the renderable to the scrollview. This step can be automated by enabling the `autoPipeEvents` option.

```javascript
var scrollView = new FlexScrollView({
    autoPipeEvents: true
});

// No need to call surface.pipe, the scrollview does this automatically for you.
scrollView.push(new Surface({
    content: 'My surface'
}));
```

## Moving & swapping items

To move or swap an item, use the following functions:

```javascript
scrollView.move(0, 5);          // move item from index 0 to index 5
scrollView.swap(0, 5);          // swap items at index 0 and 5
```


# Getting the visible item(s)

To get the currently visible items, use the following functions:

```javascript
var arr = scrollView.getVisibleItems();       // array of completely or partially visible items
var first = scrollView.getFirstVisibleItem(); // first visible item
var last = scrollView.getLastVisibleItem();   // last visible item

var index = scrollView.getCurrentIndex();     // quickly get index of first visible item
```

The result of these functions is an object or array of objects with the following properties:

```javascript
var item = {
    index: number,           // index within the data-source
    renderNode: renderable,  // renderable that was added to the datasource
    viewSequence: node,      // view-sequence node associated with the renderable
    visiblePerc: [0..1]      // percentage of how much of the renderable is visible
};
```


# Scrolling

To scroll the view use the following functions:

```javascript
scrollView.goToPage(index);              // scrolls to the renderable at the given index
scrollView.goToFirstPage();              // scrolls to the first renderable
scrollView.goToLastPage();               // scrolls to the last renderable
scrollView.goToPreviousPage();           // scrolls to the previous renderable
scrollView.goToNextPage();               // scrolls to the next renderable
scrollView.goToRenderNode(renderable);   // scrolls to the given renderable

scrollView.scroll(delta);                // scrolls x pixels in previous or next direction
var delta = scrollView.canScroll(delta); // tests whether the view can scroll the given delta

// `ensureVisible` optionally scrolls the view the least amount to ensure
// that the given item is fully visible
scrollView.ensureVisible(index);         // renderable at the given index
scrollView.ensureVisible(viewSequence);  // view-sequence node
scrollView.ensureVisible(renderable);    // renderable
```

By default the FlexScrollView listens to touch-events and mouse-wheel (trackpad) events only. It is also possible to enable scrolling by pressing down on the mouse and moving the mouse. To enable this option use:

```javascript
var scrollView = new FlexScrollView({
    mouseMove: true
});
```

Sometimes it is useful to disable scrolling (through user-inputs). To enable or disable scrolling use the `enabled` option:

```javascript
scrollView.setOptions({
    enabled: false   // disables scrolling through touch/trackpad/mouse events
});
```

By default, the scroll-view uses an overscroll effect when the bounds are reached.
To disable overscroll use:

```javascript
scrollView.setOptions({
    overscroll: false   // disable overscroll
});
```


# Margins & Spacing (ListLayout)

![Margins & Spacing](FlexScrollView/margins-spacing.gif)

Margins and spacing are part of the ListLayout that is selected into the scrollview by default. They can be set in the constructor or by using the `setLayoutOptions()` function:

```javascript
var scrollView = new FlexScrollView({
    layoutOptions: {
        margins: [10, 5, 0, 15], // margins in clockwise order: top, right, bottom, left
        spacing: 5
    }
});
```

Instead of specifying all margins separately, you can also use the shorthand notation:

```javascript
scrollView.setLayoutOptions({ margins: 5 }); // set all margins to 5
scrollView.setLayoutOptions({ margins: [5] }); // set all margins to 5
scrollView.setLayoutOptions({ margins: [5, 10] }); // set top/bottom to 5, left/right to 10
```


# Direction & alignment

Both X and Y directions are supported. By default, content is layed out in the Y-direction. To set the direction, use the constructor options or the `setOptions` function:

```javascript
var Utility = require('famous/utilities/Utility');
var scrollView = new FlexScrollView({
    direction: Utility.Direction.X // set direction to horizontal
});

scrollView.setOptions({
    direction: Utility.Direction.Y // direction & alignment can be changed on the fly
});
```

By default, renderables are aligned to the top (for direction: Y) and to the left (for direction: X). In some cases you may want to align the renderables to the bottom or the right. A good example of this is a chat application. When a keyboard is shown on a tablet or phone, it shifts the whole screen up. In this case you want to align the renderables to the bottom for when the screen is resized.

To set the alignment, use the `alignment` option. The alignment option can have two values, 0 (default) which aligns to the top or left, and 1 for aligning to the bottom or right.

```javascript
// create a vertical scrollview which is aligned to the bottom
var scrollView = new FlexScrollView({
    direction: Utility.Direction.Y,
    alignment: 1
});
```


# Clipping & ContainerSurfaces

When you need to clip the contents of the scrollview so it doesn't overflow, you typically have create a ContainerSurface and embed the scrollview inside it. The FlexScrollView can perform this task for you through the `useContainer` option. When `useContainer` is set to `true`, the scrollview is wrapped inside a ContainerSurface with the properties set to `overflow: hidden` by default:

```javascript
var scrollView = new FlexScrollView({
    useContainer: true // wraps scrollview inside a ContainerSurface
});
```

Use the `container` option to override the options for the ContainerSurface:

```javascript
var scrollView = new FlexScrollView({
    useContainer: true,
    container: { // options passed to the ContainerSurface
        properties: {
            overflow: 'hidden',
            backgroundColor: 'blue'
        }
    }
});
```

**IMPORTANT NOTE:**

In the current version of Chrome, the use of `overflow: hidden` causes z-indexing issues inside the ContainerSurface.
This causes elements to seemingly overlap/underlap each other at random. Basically, the z-translate coordinate from the
`matrix3d` function is ignored and instead the browser uses the DOM ordering for z-translation. There is currently no known
fix for this. The best way to workaround it, is to not use `overflow: hidden` and instead move the surrounding surfaces to
a higher z-index plane and give them a background so that the FlexScrollView scrolls underneath them when overflowing outside
its region.

[https://github.com/Famous/famous/issues/493](https://github.com/Famous/famous/issues/493)


# Sticky headers (ListLayout)

![Sticky Headers](FlexScrollView/stickyheaders.gif)

To enable sticky headers, set the `isSectionCallback` layout-option to a function which returns `true` when a renderable is a section:

```javascript
var scrollView = new FlexScrollView({
    layoutOptions: {
        isSectionCallback: function(renderNode) {
            return renderNode.isSection;
        }
    }
```

A section is a regular renderable, just like any other renderable. In the following example we add a property `isSection` so the section can be detected by the `isSectionCallback()` function. Also, the renderable is moved in front so that it overlaps non-section items.

```javascript
function _createSection() {
    var surface = new Surface({..});
    surface.isSection = true;
    var renderNode = new RenderNode(new Modifier({
        transform: Transform.infront
    }));
    renderNode.add(surface);
    return renderNode;
}
```

To add sections & items, just add them in the order that you want them to be displayed:

``` javascript
scrollView.push(_createSection());
scrollView.push(new Surface({}));
scrollView.push(new Surface({}));
scrollView.push(_createSection());
scrollView.push(new Surface({}));
```


# Pull to refresh

![Pull to refresh](FlexScrollView/pulltorefresh.gif)

To enable pull to refresh, assign a renderable to the `pullToRefreshHeader` or `pullToRefreshFooter` option:

```javascript
var scrollView = new FlexScrollView({
    autoPipeEvents: true,
    pullToRefreshHeader: new Surface({
        size: [undefined, 50], // required
        content: 'pull to refresh header'
    }),
    pullToRefreshHeader: new Surface({...})
});
```

Whenever the user pulls on header or footer, the `refresh` event is emitted:

```javascript
scrollView.on('refresh', function(event) {
    Timer.setTimeout(function() { // perform your refresh logic here

        // On completion, hide the pull to refresh header
        scrollView.hidePullToRefresh();
    }, 2000);
});
```

When using both header and footer pull to refresh, use `event.footer` to check which event was emitted:

```javascript
scrollView.on('refresh', function(event) {
    if (event.footer) {
        fetchNextPage(function() { // perform your logic here

            // when done, hide the pull to refresh footer
            scrollView.hidePullToRefresh(true);
        });
    }
    else {
        fetchPreviousPage(function() { // perform your logic here

            // when done, hide the pull to refresh header
            scrollView.hidePullToRefresh(false);
        });
    }
});
```

To programatically show or hide the pull to refresh renderables, use the following functions:

```javascript
scrollView.showPullToRefresh(footer);
scrollView.hidePullToRefresh(footer);
scrollView.isPullToRefreshVisible(footer);
```

To animate your pull to refresh renderable while pulling, create a custom view and implement the `setPullToRefreshStatus` on it. When pulling starts, stops or changes state, the FlexScrollView will call `setPullToRefreshStatus(state)` on the renderable to indicate these state changes. Additionally, the
FlexScrollView asks the renderable for the desired pull length for triggering the refresh (`getPullToRefreshSize`).

See [famous-refresh-loader](https://github.com/IjzerenHein/famous-refresh-loader) for an example on how to create a responsive pull to refresh view.

Using RefreshLoader:
```javascript
var RefreshLoader = require('famous-refresh-loader/RefreshLoader');

var scrollView = new FlexScrollView({
    autoPipeEvents: true,
    pullToRefreshHeader: new RefreshLoader({
        size: [undefined, 60],
        pullToRefresh: true,
        color: 'green'
        backgroundColor: 'white',
        particleCount: 8,
        particleSize: 7
    })
});
```


# Advanced effects

## Embedded scrollview linking

![Scrollview linking](FlexScrollView/scrollview-linking.gif)

The example above shows a scrollview embedded inside another scrollview. Whenever the bottom (news) scrollview reaches the top, it delegates the scroll-events to the outer scrollview, creating a seemless scrolling experience. To create this effect, set the `leadingScrollView` or `trailingScrollView` options in the constructor:

```javascript
// Create outer scrollview
var scrollView = new FlexScrollView({
    autoPipeEvents: true
});
scrollView.push(new Surface{
    size: [undefined, 100],
    content: 'top surface'
});

// Add embedded scrollview
var embeddedScrollView = new FlexScrollView({
    autoPipeEvents: true,
    leadingScrollView: scrollView
});
scrollView.push(embeddedScrollView, undefined, false); // add, but don't pipe-events!
embeddedScrollView.push(new Surface{
    size: [undefined, 100],
    content: 'top surface'
});
```

Similarly, this can be done for the bottom part of scrollview. In that case, set the `trailingScrollView` option in the constructor:

```javascript
var embeddedScrollView = new FlexScrollView({
    trailingScrollView: scrollView
});
```


## Embedded scrollview scrolling restrictions

![Scrollview restrictions](FlexScrollView/scrollviewrestrictions.gif)

When inserting a horizontal scrollview inside a vertical scrollview (or vice versa), both scrollview's respond to both vertical and horizontal input events. This is because no-one ever scrolls perfectly horizontal or vertical causing both scrollview's to scroll on their axes. To prevent both  scrollview's from scrolling, you can use the following technique:

```javascript
// Create vertical and horizontal scrollview and embed
// one scrollview inside the other one.
var vertScrollView = new FlexScrollView({
    touchMoveDirectionThreshold: 0.5
});
var horzScrollView = new FlexScrollView({
    touchMoveDirectionThreshold: 0.5
});
horzScrollView.push(vertScrollView);

// When the vertical scrollview starts scrolling, capture all events
// and disable scrolling on the horizontal scrollview
vertScrollView.on('scrollstart', function(event) {
    horzScrollView.setOptions({ enabled: false });
    vertScrollView.setOptions({ touchMoveDirectionThreshold: undefined });
});
vertScrollView.on('scrollend', function(event) {
    horzScrollView.setOptions({ enabled: true });
    vertScrollView.setOptions({ touchMoveDirectionThreshold: 0.5 });
});

// When the horizontal scrollview starts scrolling, capture all events
// and disable scrolling on the vertical scrollview
horzScrollView.on('scrollstart', function(event) {
    vertScrollView.setOptions({ enabled: false });
    horzScrollView.setOptions({ touchMoveDirectionThreshold: undefined });
});
horzScrollView.on('scrollend', function(event) {
    vertScrollView.setOptions({ enabled: true });
    horzScrollView.setOptions({ touchMoveDirectionThreshold: 0.5 });
});
```


# Events

The FlexScrollView emits the following events:

|event        |description|
|-------------|-----------|
|`layoutstart`|Emitted before the layout-function is executed.|
|`layoutend`  |Emitted after the layout-function has been executed.|
|`reflow`     |Emitted for every render-cycle that items are reflowing into their new state.|
|`scrollstart`|Emitted when scrolling starts.|
|`scroll`     |Emitted as the content is being scrolled (once for each frame the visible offset has changed).|
|`pagechange` |Emitted whenever the visible page changes.|
|`scrollend`  |Emitted after scrolling stops (when the scroll particle settles).|

These events are passed an event object with the following properties:

```javascript
{
    target: flexScrollView,
    oldSize: [100, 100],
    size: [200, 200],
    oldScrollOffset: Number,
    scrollOffset: Number
}
```

When a pull-to-refresh header or footer is attached, it also emits the `refresh`
event (see [Pull to refresh](#pull-to-refresh)).

*© 2014 - 2015 IjzerenHein*

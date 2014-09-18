famous-flex
==========

Flexible, animated and plugable layout-controller for famo.us, which:

- Smoothly animates renderables between layouts (using physics)
- Makes it easy to layout renderables (without having to create lots of modifiers)
- Is shipped with various commonly used layouts
- Allows you to easily create custom layouts and layout-helpers
- Is very good at creating responsive designs

Above anything, famous-flex is a concept in which renderables are seperated from how
they are layed-out. This makes it possible to change layouts on the fly and animate
the renderables from one layout to another. For instance, you can layout a collection
of renderables using a `GridLayout`, and change that into a `ListLayout`. When using
`FlowLayoutController` the renderables will smoothly transition from the old state
to the new state using physics, particles and springs.

[View the demo here](https://rawgit.com/IjzerenHein/famous-flex-demo/master/dist/index.html)

### Roadmap

Famous-flex is still in its infancy. I am commited in creating a first-class
layout-solution for famo.us that is as performant, pluggable and awesome as
can be. But to do this, I need your support and feedback. Let me know which of
features below are most important to you, by leaving a comment in the corresponding
issue.

- [Scrolling](https://github.com/IjzerenHein/famous-flex/issues/1) (Scrollview/container supporting layout-functions + smooth transitions)
- [Effects](https://github.com/IjzerenHein/famous-flex/issues/2) (Apply after-effects on the renderables)
- [AutoLayout](https://github.com/IjzerenHein/famous-flex/issues/3) (Cassowary constraints)
- [Drag & drop](https://github.com/IjzerenHein/famous-flex/issues/5) (Drag & drop renderables in a layout)

### Index

- [Getting started](#getting-started)
- [LayoutController and FlowLayoutController](#layoutcontroller-and-flowlayoutcontroller)
- [Standard layouts](#standard-layouts)
- [Datasource](#datasource)
- [Layout function](#layout-function)
- [Layout helpers](#layout-helpers)
- [Layout literals](#layout-literals)
- [API reference](#api-reference)


## Getting started

Install using bower or npm:

	bower install famous-flex

	npm install famous-flex

If necessary, add to the requirejs paths config:

```javascript
require.config({
    paths: {
        ...
        'famous-flex': 'node_modules/famous-flex/src',
        ...
    }
});
```

Example of laying out renderables using a CollectionLayout:

```javascript
var FlowLayoutController = require('famous-flex/FlowLayoutController');
var CollectionLayout = require('famous-flex/layouts/CollectionLayout');

// create collection-layout
var layoutController = new FlowLayoutController({
	layout: CollectionLayout,
	layoutOptions: {
		itemSize: [100, 100],
		gutter: [20, 20],
		justify: true
	},
	dataSource: [
		new Surface({content: 'surface1'}),
		new Surface({content: 'surface2'}),
		new Surface({content: 'surface3'})
	]
});
this.add(layoutController);
```

And when you change the layout, `FlowLayoutController` will smoothly animate
the renderables to the their new position, size, etc... It doesn't matter 
whether you change a single layout-option or change the whole layout from 
a CollectionLayout to a ListLayout,  `FlowLayoutController` simply calculates
the new end-state and transitions the renderables from the previous state 
to the new state.

```javascript

// Change the item-size on the existing collection-layout
layoutController.setLayoutOptions({
	itemSize: [200, 200]
});

// Or just completely change the layout function and direction
layoutController.setLayout(ListLayout, itemSize: [300]);
layoutController.setDirection(Utility.Direction.X);

// Change the order of the renderables in the array datasource
var dataSource = layoutController.getDataSource();
var swap = dataSource[0];
dataSource[0] = dataSource[1];
dataSource[1] = swap;
layoutController.setDataSource(dataSource);
```


## LayoutController and FlowLayoutController

Layout-controllers are at the heart of famous-flex. They take a datasource
containing renderables, a layout function as input and render them to the famo.us
render-tree.

`LayoutController` is the most basic and lightweight version of a layout-controller.
It updates the size, transform, etc.. of a renderable instantly after the layout
has changed.

`FlowLayoutController` uses physics to animate renderables from one state to
another. FlowLayoutController really demonstrates the power of famous-flex
in that it can flow renderables from any layout to another layout. Physics, particles
and springs are used to smoothly animate renderables in natural patterns.

For optimal performance, the layout-controller tries to minimize the
execution of the layout-function. The layout function is only executed when:
- A resize occurs
- `setLayout` is called on the layout-controller
- `setLayoutOptions` is called on the layout-controller
- `setDirection` is called on the layout-controller
- `setDataSource` is called on the layout-controller
- `reflowLayout` is called on the layout-controller
- `insert` or `remove` is called on `FlowLayoutController`


## Standard layouts

Famous-flex is shipped with a selection of commonly used layouts. It is also very easy
to [write your own layout functions](#layout-function).

|Layout|Description|
|---|---|
|[GridLayout](docs/layouts/GridLayout.md)|Grid-layout with fixed number of rows & columns.|
|[ListLayout](docs/layouts/ListLayout.md)|Lays out renderables in a horizontal or vertical list.|
|[CollectionLayout](docs/layouts/CollectionLayout.md)|Lays out renderables with a specific width & height.|
|[HeaderFooterLayout](docs/layouts/HeaderFooterLayout.md)|Layout containing a top-header, bottom- footer and content.|
|[NavBarLayout](docs/layouts/NavBarLayout.md)|Layout containing one or more left and right items and a title.|


## Datasource

The data-source contains the renderables that are to be layed-out.
It can be one of three things:

- An `Array`
- A `ViewSequence`
- An `Object` with key/value pairs

Example of an array/sequence of renderables:

```javascript
var layoutController = new LayoutController({
	layout: GridLayout,
	layoutOptions: {
		cells: [3, 1],
	},
	dataSource: [
		new Surface({content: 'surface1'}),
		new Surface({content: 'surface2'}),
		new Surface({content: 'surface3'})
	]
});
```

Example of an object with key/value pairs:

```javascript
var layoutController = new LayoutController({
	layout: NavBarLayout,
	dataSource: {
		'title': new Surface({content: 'title'}),
		'leftItems': [
			new Surface({content: 'btn1'}),
			new Surface({content: 'btn2'})
		]
	}
});
```


## Layout function

A layout is either represented as a `Function` with the following parameters, or a 
[layout literal](#layout-literals).

```javascript
/**
 * @param {LayoutContext} context Context used for enumerating renderables and setting the layout
 * @param {Object} [options] additional options that were passed to the function
 */
function LayoutFunction(context, options) {
	// put your layout-logic here, see LayoutContext for details
};
```

It is easy to create your own layout functions. In order to do this read the [LayoutContext documentation](docs/LayoutContext.md) which contains various examples.


## Layout helpers

Layout helpers are special classes that simplify writing layout functions.

|Helper|Literal|Description|
|---|---|---|
|[LayoutDockHelper](docs/helpers/LayoutDockHelper.md)|`dock`|Layout renderables using docking semantics.|


## Layout literals

Layout literals are objects which describe layouts through a definition rather
than a function. The following example describes the use of a layout literal 
using `dock` semantics:

```javascript
var layoutController = new LayoutController({
	layout: {dock: [
		['top', 'header', 50],
		['bottom', 'footer', 50],
		['fill', 'content']
	]},
	dataSource: {
		header: new Surface({content: 'Header'}),
		footer: new Surface({content: 'Footer'}),
		content: new Surface({content: 'Content'})
	}
});
```

Layout literals are implemented through LayoutHelpers. To create your own
layout literals, perform the following steps:
- Create a LayoutHelper (see [LayoutDockHelper](src/helpers/LayoutDockHelper.js) for an example).
- Implement the `parse` function on the LayoutHelper.
- Register the helper using `LayoutUtility.registerHelper`.


## API reference

|Class|Description|
|---|---|
|[LayoutController](docs/LayoutController.md)|Lays out renderables according to a layout function.|
|[FlowLayoutController](docs/FlowLayoutController.md)|Lays out renderables and smoothly animates between layout states.|
|[LayoutContext](docs/LayoutContext.md)|Context used for writing layout-functions.|
|[LayoutUtility](docs/LayoutUtility.md)|Utility class containing helper functions.|

## Contribute

If you like this project and want to support it, show some love
and give it a star.

## Contact
- 	@IjzerenHein
- 	http://www.gloey.nl
- 	hrutjes@gmail.com

© 2014 - Hein Rutjes

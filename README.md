famous-flex
==========

Flexible, animated and plugable layout-controller for famo.us, which:

- Smoothly animates renderables between layouts (using physics)
- Makes it easy to layout renderables (without having to create lots of modifiers)
- Is shipped with various commonly used layouts
- Allows you to easily create custom layouts and layout-helpers
- Is very good at creating responsive designs

![Screenshot](screenshot.gif)

Above anything, famous-flex is a concept in which renderables are seperated from how
they are layed-out. This makes it possible to change layouts on the fly and animate
the renderables from one layout to another. For instance, you can layout a collection
of renderables using a `GridLayout`, and change that into a `ListLayout`. When using
`FlowLayoutController` the renderables will smoothly transition from the old state
to the new state using physics, particles and springs.

[View the live demo here](https://rawgit.com/IjzerenHein/famous-flex-demo/master/dist/index.html)


### Index

- [Installation](#installation)
- [LayoutController](#flowlayoutcontroller)
- [Layout function](#layout-function)
- [Datasource](#datasource)
- [Standard layouts](#standard-layouts)
- [Layout literals](#layout-literals)
- [Layout helpers](#layout-helpers)
- [FlowLayoutController](#flowlayoutcontroller)
- [API reference](#api-reference)
- [Roadmap](#roadmap)


## Installation

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


## LayoutController

A `LayoutController` lays out renderables based on:
- a layout-function
- a data-source containing renderables
- optional layout-options

Example of laying out renderables using a CollectionLayout:

```javascript
var LayoutController = require('famous-flex/LayoutController');
var CollectionLayout = require('famous-flex/layouts/CollectionLayout'); // import standard layout

// create collection-layout
var layoutController = new LayoutController({
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
this.add(layoutController); // add layout-controller to the render-tree
```


## Layout function

A layout is represented as a `Function`, which takes a `context` argument and
an optional `options` argument. The purpose of the function is to lay-out the 
renderables in the data-source by calling `context.set()` on a renderable.
When `context.set()` is not called on a renderable in the data-source then it is 
not added to the render-tree.

Famous-flex comes shipped with various [standard layouts](#standard-layouts), but 
it is also very easy to create your own layout-functions. 
View [LayoutContext](docs/LayoutContext.md) for more details on creating layout-functions.

```javascript
/**
 * @param {LayoutContext} context Context used for enumerating renderables and setting the layout
 * @param {Object} [options] additional layout-options that are passed to the function
 */
function LayoutFunction(context, options) {

	// simple layout-function that lays out renderables from top to bottom
	var node = context.next();
	var y = 0;
	while (node) {
		context.set(node, {
			size: [context.size[0], 100],
			translate: [0, y, 0]
		});
		y += 100;
		node = context.next();
	}
};
```

For optimal performance, the layout function is only executed when:
- A resize occurs
- `setLayout` is called on the layout-controller
- `setLayoutOptions` is called on the layout-controller
- `setDirection` is called on the layout-controller
- `setDataSource` is called on the layout-controller
- `reflowLayout` is called on the layout-controller


## Datasource

The data-source contains the renderables that are to be layed-out.
It can be one of three things:

- An `Array`
- A `ViewSequence`
- An `Object` with key/value pairs

In case of an `Array` or `ViewSequence`, use `context.next()` in your 
layout-function to enumerate all the renderables in the data-source:

```javascript
var layoutController = new LayoutController({
	layout: function (context, options) {
		var y = 0;
		var node = context.next();
		while (node) {
			context.set(node, {
				size: [context.size[0], 100],
				translate: [0, y, 0]
			});
			y += 100;
			node = context.next();
		}
	},
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

Sometimes it is easier to identify renderables by an id, rather than a 
sequence. In that case use `context.get()` or directly pass the data-source id
to the `context.set()` function:

```javascript
var layoutController = new LayoutController({
	layout: function (context, options) {
		node.set('one', {
			size: [100, 100],
			translate: [0, 0, 0]
		});
		node.set('two', {
			size: [100, 100],
			translate: [100, 0, 0]
		});
		node.set('three', {
			size: [100, 100],
			translate: [200, 0, 0]
		});
	},
	dataSource: {
		'one': new Surface({content: 'one'}),
		'two': new Surface({content: 'two'}),
		'three': new Surface({content: 'three'})
	}
});
```

## Standard layouts

|Layout|DataSource|Description|
|---|---|---|
|[GridLayout](docs/layouts/GridLayout.md)|Sequence/Array|Grid-layout with fixed number of rows & columns.|
|[ListLayout](docs/layouts/ListLayout.md)|Sequence/Array|Lays out renderables in a horizontal or vertical list.|
|[CollectionLayout](docs/layouts/CollectionLayout.md)|Sequence/Array|Lays out renderables with a specific width & height.|
|[HeaderFooterLayout](docs/layouts/HeaderFooterLayout.md)|Id-based|Layout containing a top-header, bottom- footer and content.|
|[NavBarLayout](docs/layouts/NavBarLayout.md)|Id-based|Layout containing one or more left and right items and a title.|


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


## Layout helpers

Layout helpers are special classes that simplify writing layout functions.

|Helper|Literal|Description|
|---|---|---|
|[LayoutDockHelper](docs/helpers/LayoutDockHelper.md)|`dock`|Layout renderables using docking semantics.|


## FlowLayoutController

`FlowLayoutController` extends `LayoutController` and smoothly animates renderables
between different layouts. It doesn't matter whether you change a single layout-option 
or change the whole layout from a CollectionLayout to a ListLayout,  
`FlowLayoutController` simply calculates the new end-state and transitions the renderables
from the previous state to the new state.

```javascript
var flowLC = require('famous-flex/FlowLayoutController');
var CollectionLayout = require('famous-flex/layouts/CollectionLayout');

// create collection-layout
var flowLC = new FlowLayoutController({
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
this.add(flowLC); // add layout-controller to the render-tree

// Change the item-size on the existing collection-layout
flowLC.setLayoutOptions({
	itemSize: [200, 200]
});

// Or just completely change the layout function and direction
flowLC.setLayout(ListLayout, itemSize: [300]);
flowLC.setDirection(Utility.Direction.X);

// Change the order of the renderables in the array datasource
var dataSource = flowLC.getDataSource();
var swap = dataSource[0];
dataSource[0] = dataSource[1];
dataSource[1] = swap;
flowLC.setDataSource(dataSource);
```


## API reference

|Class|Description|
|---|---|
|[LayoutController](docs/LayoutController.md)|Lays out renderables according to a layout function.|
|[FlowLayoutController](docs/FlowLayoutController.md)|Lays out renderables and smoothly animates between layout states.|
|[LayoutContext](docs/LayoutContext.md)|Context used for writing layout-functions.|
|[LayoutUtility](docs/LayoutUtility.md)|Utility class containing helper functions.|


## Roadmap

Famous-flex is still in its infancy. I am commited in creating a first-class
layout-solution for famo.us that is as performant, pluggable and awesome as
can be. But to do this, I need your support and feedback. Let me know which of
features below are most important to you, by leaving a comment in the corresponding
issue.

- [Scrolling](https://github.com/IjzerenHein/famous-flex/issues/1) (Scrollview/container supporting layout-functions + smooth transitions)
- [Effects](https://github.com/IjzerenHein/famous-flex/issues/2) (Apply after-effects on the renderables)
- [AutoLayout](https://github.com/IjzerenHein/famous-flex/issues/3) (Cassowary constraints)
- [Drag & drop](https://github.com/IjzerenHein/famous-flex/issues/5) (Drag & drop renderables in a layout)


## Contribute

If you like this project and want to support it, show some love
and give it a star.


## Contact
- 	@IjzerenHein
- 	http://www.gloey.nl
- 	hrutjes@gmail.com

© 2014 - Hein Rutjes

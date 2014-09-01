famous-flex
==========

Flexible, animated and plugable layout-controller for famo.us, which:

- Smoothly animates renderables between layouts (using physics)
- Makes it easy to layout renderables (without having to create lots of modifiers)
- Is shiped with various commonly used layouts
- Allows you to easily create custom layouts and layout-helpers
- Is very good at creating responsive designs

Above anything, famous-flex is a concept in which renderables are seperated from how
they are layed-out. This makes it possible to change layouts on the fly and animate
the renderables from one layout to another. For instance, you can layout a collection
of renderables using a `GridLayout`, and change that into a `ListLayout`. When using
`FlowLayoutController` the renderables will smoothly transition from the old state
to the new state using physics, particles and springs.

###Roadmap

Famous-flex is still in its infancy. I am commited in creating a first-class
layout-solution for famo.us that is as performant, pluggable and awesome as
can be. But to do this, I need your support and feedback. Let me know which of
features below are most important to you, by leaving a comment in the corresponding
issue.

- Scrolling (Scrolling support using physics, same as Scrollview)
- AutoLayout (Cassowary constraints)
- Drag & drop (Drag & drop renderables in a layout)

### Index

- [Getting started](#getting_started)
- [LayoutController and FlowLayoutController](#layoutcontroller_and_flowlayoutcontroller)
- [Standard layouts](#standard_layouts)
- [Datasource](#datasource)
- [Layout function](#layout-function)
- [Layout helpers](#layout-helpers)
- [API reference](#api_reference)


## Demo

[View the demo here](https://rawgit.com/IjzerenHein/famous-flex-demo/master/index.html)


## Getting started

Install using bower or npm:

	bower install famous-flex

	npm install famous-flex

If necessary, add to the requirejs paths config:

```javascript
require.config({
    paths: {
        ...
        'famous-flex': 'bower_components/famous-flex',
        ...
    }
});
```

Example of laying out renderables using a CollectionLayout:

```javascript
var LayoutController = require('famous-flex/LayoutController');
var CollectionLayout = require('famous-flex-layouts/CollectionLayout');

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
this.add(layoutController);
```


## LayoutController and FlowLayoutController

Layout-controllers are at the heart of famous-flex. They take a datasource
containing renderables, a layout function as input and render them to the famo.us
render-tree. Whenever the datasource or layout changes, the Layout-controller
updates the renderables according to the whishes of the layout function.

`LayoutController` is the most basic and lightweight version of a Layout-controller
and should be used when you don't need any smooth transitions.

`FlowLayoutController` uses physics to animate renderables from one state to
another. FlowLayoutController really demonstrates the power of famous-flex
in that it can flow renderables from any layout to another. Physics, particles
and springs are used to smoothly animate renderables in natural patterns.


## Standard layouts

Famous-flex is shipped with a selection of commonly used layouts. It is also very easy
to [write your own layout functions](#layout_function).

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

A layout is represented as a `Function` with the following parameters:

```javascript
/**
 * @param {Size} size Size in which to layout the renderables
 * @param {LayoutContext} context Context for getting renderables and setting layout
 * @param {Object} [options] additional options that were passed to the function
 */
function LayoutFunction(size, context, options) {
	// put your layout-logic here
};
```
For optimial performance, the layout-controller tries to minimize the
execution of the layout-function. The layout-function is only executed when:

- A resize occurs
- `setLayout` is called on the layout-controller
- `setLayoutOptions` is called on the layout-controller
- `patchLayoutOptions` is called on the layout-controller
- `reflowLayout` is called on the layout-controller
- `insert` or `remove` is called on `FlowLayoutController`

If you make changes to a data-soure, then you must explicitely
call `reflowLayout` to ensure that the layout is updated.


## Layout helpers

Layout helpers are special classes that simplify writing layout functions.

|Helper|Description|
|---|---|
|[LayoutDockHelper](docs/helpers/LayoutDockHelper.md)|Layout renderables using docking semantics.|


## API reference

|Class|Description|
|---|---|
|[LayoutController](docs/LayoutController.md)|Lays out renderables according to a layout function.|
|[FlowLayoutController](docs/FlowLayoutController.md)|Lays out renderables and smoothly animates between layout states.|
|[LayoutContext](docs/LayoutContext.md)|Context used when writing layout-functions.|
|[LayoutUtility](docs/LayoutUtility.md)|View class which encapsulates a maps object.|

## Contribute

If you like this project and want to support it, show some love
and give it a star.

## Contact
- 	@IjzerenHein
- 	http://www.gloey.nl
- 	hrutjes@gmail.com

© 2014 - Hein Rutjes

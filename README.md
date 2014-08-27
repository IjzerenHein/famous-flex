famous-flex
==========

Flexible, animated and plugable layout-controller for famo.us, which:

- Smoothly animates renderables between layouts (using physics)
- Makes it easy to layout renderables (without having to create lots of modifiers)
- Is shiped
- Allows you to easily create custom layouts and layout-helpers

Above anything, famous-flex is a concept in which renderables are seperated from how
they are layed-out. This makes it possible to change layouts on the fly and animate
the renderables from one layout to another. For instance, you can layout a collection
of renderables as a grid, and instantly change that to a list-layout. When using the
`FlowLayoutController' the renderables will smoothly transitions from the old state
to the new state using physics and springs.

Famous-flex comes in two flavors, the lightweight `LayoutController` and the animated
`FlowLayoutController`. `FlowLayoutController` animates the renderables using physics
whenever a reflow occurs, whereas `LayoutController` instantly updates the renderables
when a reflow occurs.

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

- Getting started
- LayoutController
- FlowLayoutController
- Layouts: GridLayout, ListLayout, CollectionLayout, NavbarLayout
- Layout-functions
- Layout-helpers
- Data-source
- Documentation


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

## Layout-function

A layout is represented as a `Function` with the following parameters:

```javascript
/**
 * @param {Array.Number} size Size in which to layout the renderables
 * @param {LayoutNodesContext} nodes Context for getting renderables and setting layout
 * @param {Object} [options] additional options that were passed to the function
 */
function LayoutFunction(size, nodes, options) {
	// put your layout-logic here
};
```
For optimial performance, the layout-controllers try to minimize the
executing of the layout-function. The layout-function is only executed when:

- A resize occurs
- `setLayout` is called on the layout-controller
- `setLayoutOptions` is called on the layout-controller
- `patchLayoutOptions` is called on the layout-controller
- `reflowLayout` is called on the layout-controller
- `insert` or `remove` is called on `FlowLayoutController`

If you make changes to a data-soure, then you must explicitely
call `reflowLayout` to ensure that the layout is updated.

## Layout-helpers

TODO

## DataSource

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

## Documentation

- [API Reference](docs/CollectionView.md)
- [Options](docs/CollectionView.md#module_CollectionView)

## Contribute

If you like this project and want to support it, show some love
and give it a star.

## Contact
- 	@IjzerenHein
- 	http://www.gloey.nl
- 	hrutjes@gmail.com

© 2014 - Hein Rutjes

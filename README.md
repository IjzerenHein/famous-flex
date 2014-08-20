famous-flex
==========

Flexible & plugable layout-controller for famo.us

## Demo

[View the demo here](https://rawgit.com/IjzerenHein/famous-flex-demo/master/index.html)

## Installation

Install using bower:

	bower install famous-flex

## Getting started

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

Example of how to create a ListView:

```javascript
var FlexLayoutController = require('famous-flex/LayoutController');

// create list-view
var layoutController = new LayoutController();
```
TODO

## Documentation

- [API Reference](docs/CollectionView.md)
- [Options](docs/CollectionView.md#module_CollectionView)

## Contribute

Feel free to contribute to this project in any way.
The easiest way to support this project is by giving it a star.

## Contact
- 	@IjzerenHein
- 	http://www.gloey.nl
- 	hrutjes@gmail.com

© 2014 - Hein Rutjes

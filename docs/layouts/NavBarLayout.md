<a name="module_NavBarLayout"></a>
## NavBarLayout
Navigation-bar layout consisting of optionally left and right items and a
title in the middle.

When no item-width is specified, the width of the renderable itsself is used.

|options|type|description|
|---|---|---|
|`[margins]`|Number/Array|Margins shorthand (e.g. 5, [10, 20], [2, 5, 2, 10])|
|`[itemWidth]`|Number|Width of the left & right items|
|`[leftItemWidth]`|Number|Width of the left items|
|`[rightItemWidth]`|Number|Width of the right items|
|`[itemSpacer]`|Number|Space in between items|

Example:

```javascript
var NavBarLayout = require('famous-flex/layouts/NavBarLayout');

var layout = new LayoutController({
  layout: NavBarLayout,
  layoutOptions: {
    margins: [5, 5, 5, 5], // margins to utilize
    itemSpacer: 10,        // space in between items
  },
  dataSource: {
    background: new Surface({properties: {backgroundColor: 'black'}}),
    title: new Surface({content: 'My title'}),
    leftItems:[
      new Surface({
        content: 'left1',
        size: [100, undefined] // use fixed width
      })
    ],
    rightItems: [
      new Surface({
        content: 'right1',
        size: [true, undefined] // use actual width of DOM-node
      }),
      new Surface({
        content: 'right2'
        size: [true, undefined] // use actual width of DOM-node
      })
    ]
  }
});
```


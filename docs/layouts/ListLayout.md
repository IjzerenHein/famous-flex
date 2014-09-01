<a name="module_ListLayout"></a>
#ListLayout
Lays out a collection of renderables from top to bottom or left to right.

|options|type|description|
|---|---|---|
|`[itemSize]`|Number|Height or width in pixels of the list-item|
|`[direction]`|Number|Direction into which to layout: 0 = X, 1 = Y (default)|

Example:

```javascript
new LayoutController({
  layout: ListLayout,
  layoutOptions: {
    itemSize: 40,         // item has height of 40 pixels
  },
  dataSource: [
    new Surface({content: 'item 1'}),
    new Surface({content: 'item 2'}),
    new Surface({content: 'item 3'})
  ]
})
```


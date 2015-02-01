Widget Guidelines
==========

# **Work in progress, check back later..**

Use these guidelines when writing a new famo.us widget for the famous-flex library.

# Index

- [Core guidelines](#getting-started)
- [CSS classes](#css-classes)


# Core guidelines

Always keep in mind these 5 guidelines when creating a widget: 

- Simple API
- High degree of customisability
- Unopinionated where possible (but still get quick results using the defaults)
- Lightweight (it contains as little (boilerplate) code as possible)
- Part of a family of widgets (learn concepts once, apply everywhere)


# CSS classes

A surface that is created by a widget should have at least three CSS classes:

## ff-widget

Using this class, defaults can be configured that apply to all widgets, such as 
setting the font for all widgets:

```css
.ff-widget: {
	font-family: "Roboto";
}
```

## A specific widget class

Each widget has its own unique class-name prefixed by `ff-`. E.g.
`ff-tabbar`, `ff-datepicker`, etc... Using this class-name, styles can be applied
for all surfaces created by that widget.

```css
.ff-tabbar {
	font-family: "Helvetica";
	color: blue;
}
```

## A specific renderable class

Each different type of renderable in a widget has its own class-name (e.g.
`item`, `background`, etc...). Combined with the widget specific class you
can use CSS selectors to style these surfaces:

```css
.ff-tabbar.item {
	color: black;
	backgroundColor: white;
}
.ff-tabbar.item.selected {
	color: white;
	backgroundColor: black;
}
```



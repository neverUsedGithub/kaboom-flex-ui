# Kaboom Flex UI

A modern UI library for kaboom.

# Installation

`npm i kaboom-flex-ui`

# Getting Started

Firstly, import the UI plugin and load it into kaboom.
```js
import flexUIPlugin from "kaboom-flex-ui";

const k = kaboom({
    plugins: [ flexUIPlugin ]
});
```

Then, to create a UI you will have to call the `makeUI` function with a function that returns a UI element.

```js
const mainMenu = k.makeUI(() => k.$box(
    {
        width: 500,
        height: 500,
        background: YELLOW
    },
    k.$text("Hello, World!")
));
```

After defining the UI you will have to add it the current scene using
its `add` method.

```js
mainMenu.add();
```

After a reload you should now see a yellow rectangle on your screen
with the text "Hello, World!".

# Docs

<!-- TSDOC_START -->

## :toolbox: Functions

- [makeUI](#gear-makeui)
- [$box](#gear-$box)
- [$box](#gear-$box)
- [$box](#gear-$box)
- [$text](#gear-$text)
- [$button](#gear-$button)
- [default](#gear-default)

### :gear: makeUI

Defines a UI function that takes a UI generator and returns an object with an add method.

| Function | Type |
| ---------- | ---------- |
| `makeUI` | `(generator: UIGenerator) => UIManager` |

Parameters:

* `generator`: The UI generator function.


### :gear: $box

Creates a UI box element with optional attributes and children elements.
Creates a UI box element with specified attributes and optional children elements.

| Function | Type |
| ---------- | ---------- |
| `$box` | `{ (...children: UIElement[]): UIBoxElement; (attrs: Partial<UIBoxAttributes>, ...children: UIElement[]): UIBoxElement; }` |

Parameters:

* `children`: The children UI elements.
* `attrs`: The attributes for the box element.
* `children`: The children UI elements.


### :gear: $box

Creates a UI box element with optional attributes and children elements.
Creates a UI box element with specified attributes and optional children elements.

| Function | Type |
| ---------- | ---------- |
| `$box` | `{ (...children: UIElement[]): UIBoxElement; (attrs: Partial<UIBoxAttributes>, ...children: UIElement[]): UIBoxElement; }` |

Parameters:

* `children`: The children UI elements.
* `attrs`: The attributes for the box element.
* `children`: The children UI elements.


### :gear: $box

Creates a UI box element with optional attributes and children elements.
Creates a UI box element with specified attributes and optional children elements.

| Function | Type |
| ---------- | ---------- |
| `$box` | `{ (...children: UIElement[]): UIBoxElement; (attrs: Partial<UIBoxAttributes>, ...children: UIElement[]): UIBoxElement; }` |

Parameters:

* `children`: The children UI elements.
* `attrs`: The attributes for the box element.
* `children`: The children UI elements.


### :gear: $text

Creates a UI text element with the specified text and optional attributes.

| Function | Type |
| ---------- | ---------- |
| `$text` | `(text: string, attrs?: Partial<UITextAttributes>) => UITextElement` |

Parameters:

* `text`: The text content.
* `attrs`: Optional attributes for the text element.


### :gear: $button

Creates a UI button element with the specified text and attributes.

| Function | Type |
| ---------- | ---------- |
| `$button` | `(text: string, attrs: UIButtonAttributes) => UIBoxElement` |

Parameters:

* `text`: The text content.
* `attrs`: The attributes for the button element.


### :gear: default

| Function | Type |
| ---------- | ---------- |
| `default` | `(ctx: KaboomCtx) => { readonly makeUI: (generator: UIGenerator) => UIManager; readonly $box: { (...children: UIElement[]): UIBoxElement; (attrs: Partial<...>, ...children: UIElement[]): UIBoxElement; }; readonly $button: (text: string, attrs: UIButtonAttributes) => UIBoxElement; readonly $text: (text: string, attrs?...` |



<!-- TSDOC_END -->
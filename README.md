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
- [makeUI](#gear-makeui)
- [makeUI](#gear-makeui)
- [$box](#gear-$box)
- [$box](#gear-$box)
- [$box](#gear-$box)
- [$text](#gear-$text)
- [$button](#gear-$button)
- [$checkbox](#gear-$checkbox)
- [$input](#gear-$input)
- [default](#gear-default)

### :gear: makeUI

Takes in a Kaboom context and a UI generator function, returning a UI manager.
The UI manager allows addition, removal, and re-addition of UI elements.
Takes in a UI generator function that creates a UI element and returns a UI manager.
The UI manager enables addition, removal, and re-addition of the UI.

| Function | Type |
| ---------- | ---------- |
| `makeUI` | `{ (kaboom: KaboomCtx, generator: UIGenerator): UIManager; (generator: UIGenerator): UIManager; }` |

Parameters:

* `kaboom`: The Kaboom context used for UI creation.
* `generator`: The UI generator function that generates a UI element.
* `generator`: The UI generator function that generates a UI element.


### :gear: makeUI

Takes in a Kaboom context and a UI generator function, returning a UI manager.
The UI manager allows addition, removal, and re-addition of UI elements.
Takes in a UI generator function that creates a UI element and returns a UI manager.
The UI manager enables addition, removal, and re-addition of the UI.

| Function | Type |
| ---------- | ---------- |
| `makeUI` | `{ (kaboom: KaboomCtx, generator: UIGenerator): UIManager; (generator: UIGenerator): UIManager; }` |

Parameters:

* `kaboom`: The Kaboom context used for UI creation.
* `generator`: The UI generator function that generates a UI element.
* `generator`: The UI generator function that generates a UI element.


### :gear: makeUI

Takes in a Kaboom context and a UI generator function, returning a UI manager.
The UI manager allows addition, removal, and re-addition of UI elements.
Takes in a UI generator function that creates a UI element and returns a UI manager.
The UI manager enables addition, removal, and re-addition of the UI.

| Function | Type |
| ---------- | ---------- |
| `makeUI` | `{ (kaboom: KaboomCtx, generator: UIGenerator): UIManager; (generator: UIGenerator): UIManager; }` |

Parameters:

* `kaboom`: The Kaboom context used for UI creation.
* `generator`: The UI generator function that generates a UI element.
* `generator`: The UI generator function that generates a UI element.


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


### :gear: $checkbox

Represents a checkbox element generator function.

| Function | Type |
| ---------- | ---------- |
| `$checkbox` | `(attrs: UICheckboxAttributes) => UIBoxElement` |

Parameters:

* `attrs`: The attributes for the checkbox element.


### :gear: $input

Represents an input element generator function.

| Function | Type |
| ---------- | ---------- |
| `$input` | `(attrs: UIInputAttributes) => UIBoxElement` |

Parameters:

* `attrs`: The attributes for the input element.


### :gear: default

A plugin that provides UI generation functionality.

| Function | Type |
| ---------- | ---------- |
| `default` | `(ctx: KaboomCtx) => { readonly makeUI: { (kaboom: KaboomCtx, generator: UIGenerator): UIManager; (generator: UIGenerator): UIManager; }; ... 4 more ...; readonly $input: (attrs: UIInputAttributes) => UIBoxElement; }` |

Parameters:

* `ctx`: The Kaboom context.



## :factory: UITextElement

Represents a UI text element with specified attributes.

### Methods

- [setParent](#gear-setparent)
- [style](#gear-style)
- [setText](#gear-settext)
- [setKaboom](#gear-setkaboom)
- [getKaboom](#gear-getkaboom)

#### :gear: setParent

| Method | Type |
| ---------- | ---------- |
| `setParent` | `(parent: UIManager) => void` |

#### :gear: style

| Method | Type |
| ---------- | ---------- |
| `style` | `(newAttributes: Partial<UITextAttributes>) => void` |

#### :gear: setText

| Method | Type |
| ---------- | ---------- |
| `setText` | `(text: string) => void` |

#### :gear: setKaboom

| Method | Type |
| ---------- | ---------- |
| `setKaboom` | `(kaboom: KaboomCtx) => void` |

#### :gear: getKaboom

| Method | Type |
| ---------- | ---------- |
| `getKaboom` | `() => KaboomCtx` |


## :factory: UIBoxElement

Represents a UI box element with specified attributes and children elements.

### Methods

- [triggerListener](#gear-triggerlistener)
- [setParent](#gear-setparent)
- [style](#gear-style)
- [getChild](#gear-getchild)
- [setKaboom](#gear-setkaboom)
- [getKaboom](#gear-getkaboom)

#### :gear: triggerListener

| Method | Type |
| ---------- | ---------- |
| `triggerListener` | `(event: string, ...args: any) => void` |

#### :gear: setParent

| Method | Type |
| ---------- | ---------- |
| `setParent` | `(parent: UIManager) => void` |

#### :gear: style

| Method | Type |
| ---------- | ---------- |
| `style` | `(newAttributes: Partial<UIBoxAttributes>) => void` |

#### :gear: getChild

| Method | Type |
| ---------- | ---------- |
| `getChild` | `<U extends UIElement = UIElement>(nth: number) => UIElementPublic<U>` |

#### :gear: setKaboom

| Method | Type |
| ---------- | ---------- |
| `setKaboom` | `(kaboom: KaboomCtx) => void` |

#### :gear: getKaboom

| Method | Type |
| ---------- | ---------- |
| `getKaboom` | `() => KaboomCtx` |


<!-- TSDOC_END -->
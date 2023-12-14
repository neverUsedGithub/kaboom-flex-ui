import {
    AreaComp,
    Color,
    ColorComp,
    EventController,
    GameObj,
    KaboomCtx,
    OpacityComp,
    OutlineComp,
    PosComp,
    RectComp,
    TextComp,
    TextCompOpt,
    ZComp,
} from "kaboom";

export type StrictCursor =
    | "auto"
    | "default"
    | "none"
    | "context-menu"
    | "help"
    | "pointer"
    | "progress"
    | "wait"
    | "cell"
    | "crosshair"
    | "text"
    | "vertical-text"
    | "alias"
    | "copy"
    | "move"
    | "no-drop"
    | "not-allowed"
    | "grab"
    | "grabbing"
    | "all-scroll"
    | "col-resize"
    | "row-resize"
    | "n-resize"
    | "e-resize"
    | "s-resize"
    | "w-resize"
    | "ne-resize"
    | "nw-resize"
    | "se-resize"
    | "sw-resize"
    | "ew-resize"
    | "ns-resize"
    | "nesw-resize"
    | "nwse-resize"
    | "zoom-int"
    | "zoom-out";

/**
 * Represents attributes for a UI box element.
 */
export interface UIBoxAttributes {
    alignX: "left" | "center" | "right";
    alignY: "top" | "center" | "bottom";
    flow: "y" | "x";
    background: Color;
    padding: { left: number; right: number; top: number; bottom: number } | number;
    fit: boolean;
    gap: number;
    height: number | undefined;
    width: number | undefined;
    borderRadius: number;
    outline: Color | undefined;
    outlineWidth: number;
    cursor: StrictCursor;
    opacity: number;

    onMount?: (this: UIElementPublic<UIBoxElement>, object: Exclude<UIBoxElement["kaboomObject"], null>) => any;

    onClick?: (this: UIElementPublic<UIBoxElement>) => any;
    onMouseDown?: (this: UIElementPublic<UIBoxElement>) => any;
    onMousePress?: (this: UIElementPublic<UIBoxElement>) => any;
    onMouseRelease?: (this: UIElementPublic<UIBoxElement>) => any;
    onHover?: (this: UIElementPublic<UIBoxElement>) => any;
    onHoverEnd?: (this: UIElementPublic<UIBoxElement>) => any;
    onHoverUpdate?: (this: UIElementPublic<UIBoxElement>) => any;
}

/**
 * Represents attributes for a UI text element.
 */
export interface UITextAttributes {
    fontFamily: string | undefined;
    lineHeight: number;
    fontSize: number;
    color: Color;
    opacity: number;

    onMount?: (this: UIElementPublic<UITextElement>, object: Exclude<UITextElement["kaboomObject"], null>) => any;
}

/**
 * Represents attributes for a UI button element, extending UI box attributes.
 */
export interface UIButtonAttributes extends Partial<UIBoxAttributes> {
    text?: Partial<UITextAttributes>;
}

export interface UICheckboxAttributes extends Partial<UIBoxAttributes> {
    text?: Partial<UITextAttributes>;
    checked?: boolean;

    onCheck?: (this: UIElementPublic<UIBoxElement>, isChecked: boolean) => any;
}

export interface UIInputAttributes extends Partial<UIBoxAttributes> {
    text?: Partial<UITextAttributes>;
    value?: string;

    onBlur?: (this: UIElementPublic<UIBoxElement>) => any;
    onFocus?: (this: UIElementPublic<UIBoxElement>) => any;
    onFocusUpdate?: (this: UIElementPublic<UIBoxElement>) => any;
    onChange?: (this: UIElementPublic<UIBoxElement>, value: string) => any;
}

/**
 * Represents an element that can be either a UI box or UI text element.
 */
export type UIElement = UIBoxElement | UITextElement;

export type UIElementPublic<T extends UIElement = UIElement> = T extends UIBoxElement
    ? {
          style: (attrs: Partial<T extends UIBoxElement ? UIBoxAttributes : UITextAttributes>) => void;
          getChild: <U extends UIElement = UIElement>(nth: number) => UIElementPublic<U>;
      }
    : {
          style: (attrs: Partial<T extends UIBoxElement ? UIBoxAttributes : UITextAttributes>) => void;
          setText: (text: string) => void;
      };

export interface UIManager {
    add: (parent?: GameObj) => void;
    readd: () => void;
    remove: () => void;
}

const getDefaultTextProperties: () => UITextAttributes = () => ({
    color: rgb(0, 0, 0),
    fontFamily: undefined,
    lineHeight: 0.9,
    fontSize: 30,
    opacity: 1,
});

/**
 * Represents a UI text element with specified attributes.
 */
export class UITextElement {
    public attrs: UITextAttributes;
    public kaboomObject: GameObj<PosComp | ColorComp | ZComp | TextComp | OpacityComp> | null = null;
    private parent: UIManager | null;

    constructor(attrs: Partial<UITextAttributes>, public text: string) {
        this.attrs = Object.assign({}, getDefaultTextProperties(), attrs);
        this.parent = null;
    }

    setParent(parent: UIManager) {
        this.parent = parent;
    }

    style(newAttributes: Partial<UITextAttributes>) {
        this.attrs = Object.assign({}, this.attrs, newAttributes);
        if (!this.parent) throw new Error("no parent?");
        this.parent.readd();
    }

    setText(text: string) {
        this.text = text;
        if (!this.parent) throw new Error("no parent?");
        this.parent.readd();
    }
}

const getDefaultBoxProperties: () => UIBoxAttributes = () => ({
    alignX: "left",
    alignY: "top",
    flow: "x",
    background: rgb(255, 255, 255),
    fit: false,
    gap: 0,
    padding: { left: 0, right: 0, top: 0, bottom: 0 },
    outline: undefined,
    outlineWidth: 0,
    height: undefined,
    width: undefined,
    borderRadius: 0,
    cursor: "default",
    opacity: 1,
});

/**
 * Represents a UI box element with specified attributes and children elements.
 */
export class UIBoxElement {
    public attrs: UIBoxAttributes;
    public kaboomObject: GameObj<
        | PosComp
        | RectComp
        | ColorComp
        | ZComp
        | OutlineComp
        | AreaComp
        | OpacityComp
        | {
              uiElement: UIBoxElement;
          }
    > | null = null;
    private parent: UIManager | null = null;

    constructor(attrs: Partial<UIBoxAttributes>, public children: UIElement[]) {
        this.attrs = Object.assign({}, getDefaultBoxProperties(), attrs);
    }

    triggerListener(event: string, ...args: any) {
        switch (event) {
            case "click":
                this.attrs.onClick && this.attrs.onClick.bind(this)();
                break;

            case "mousedown":
                this.attrs.onMouseDown && this.attrs.onMouseDown.bind(this)();
                break;

            case "mousepress":
                this.attrs.onMousePress && this.attrs.onMousePress.bind(this)();
                break;

            case "mouseup":
                this.attrs.onMouseRelease && this.attrs.onMouseRelease.bind(this)();
                break;

            case "hoverend":
                this.attrs.onHoverEnd && this.attrs.onHoverEnd.bind(this)();
                break;

            case "hoverupdate":
                this.attrs.onHoverUpdate && this.attrs.onHoverUpdate.bind(this)();
                break;

            case "hover":
                this.attrs.onHover && this.attrs.onHover.bind(this)();
                break;

            default:
                throw new Error(`invalid event '${event}'`);
        }
        // if (event in this.eventListeners) for (const listener of this.eventListeners[event]) listener.bind(this)(args);
    }

    setParent(parent: UIManager) {
        this.parent = parent;
    }

    style(newAttributes: Partial<UIBoxAttributes>) {
        this.attrs = Object.assign({}, this.attrs, newAttributes);
        if (!this.parent) throw new Error("no parent?");
        this.parent.readd();
    }

    getChild<U extends UIElement = UIElement>(nth: number) {
        return this.children[nth] as any as UIElementPublic<U>;
    }
}

/**
 * Represents a function that generates a UI element.
 */
export type UIGenerator = () => UIElement;

function getTextOptions(attrs: UITextAttributes): TextCompOpt {
    return {
        size: attrs.fontSize,
        font: attrs.fontFamily,
    };
}

function calculateMinWidth(element: UIElement): number {
    if (element instanceof UIBoxElement) {
        const width =
            element.attrs.flow === "x"
                ? element.children
                      .map(calculateMinWidth)
                      .reduce((a, b) => a + b + element.attrs.gap, -element.attrs.gap)
                : Math.max(...element.children.map(calculateMinWidth));

        const calcWidth =
            width +
            (typeof element.attrs.padding === "number"
                ? element.attrs.padding * 2
                : element.attrs.padding.left + element.attrs.padding.right);

        if (element.attrs.width) return element.attrs.width > calcWidth ? element.attrs.width : calcWidth;

        return calcWidth;
    }

    return formatText({ text: element.text, ...getTextOptions(element.attrs) }).width;
}

function calculateMinHeight(element: UIElement): number {
    if (element instanceof UIBoxElement) {
        const height =
            element.attrs.flow === "x"
                ? Math.max(...element.children.map(calculateMinHeight))
                : element.children
                      .map(calculateMinHeight)
                      .reduce((a, b) => a + b + element.attrs.gap, -element.attrs.gap);

        const calcHeight =
            height +
            (typeof element.attrs.padding === "number"
                ? element.attrs.padding * 2
                : element.attrs.padding.top + element.attrs.padding.bottom);

        if (element.attrs.height) return element.attrs.height > calcHeight ? element.attrs.height : calcHeight;

        return calcHeight;
    }

    return formatText({ text: element.text, ...getTextOptions(element.attrs) }).height * element.attrs.lineHeight;
}

function addElement(
    ctx: UIManager,
    parent: GameObj,
    element: UIElement,
    depth: number = 0,
    elementX: number,
    elementY: number,
    elementWidth?: number,
    elementHeight?: number
): GameObj<PosComp | RectComp> {
    element.setParent(ctx);

    if (element instanceof UIBoxElement) {
        const paddingTop =
            typeof element.attrs.padding === "number" ? element.attrs.padding : element.attrs.padding.top;
        const paddingBottom =
            typeof element.attrs.padding === "number" ? element.attrs.padding : element.attrs.padding.bottom;
        const paddingLeft =
            typeof element.attrs.padding === "number" ? element.attrs.padding : element.attrs.padding.left;
        const paddingRight =
            typeof element.attrs.padding === "number" ? element.attrs.padding : element.attrs.padding.right;

        const minHeight = calculateMinHeight(element);
        const minWidth = calculateMinWidth(element);

        let selfHeight: number = elementHeight ?? minHeight;
        let selfWidth: number = elementWidth ?? minWidth;

        if (selfHeight < minHeight) selfHeight = minHeight;
        if (selfWidth < minWidth) selfWidth = minWidth;

        if (!element.kaboomObject) {
            element.kaboomObject = parent.add([
                pos(elementX ?? 0, elementY ?? 0),
                color(element.attrs.background),
                rect(selfWidth, selfHeight, {
                    radius: element.attrs.borderRadius,
                }),
                z(depth),
                element.attrs.outline && outline(element.attrs.outlineWidth, element.attrs.outline),
                area(),
                opacity(element.attrs.opacity),
                { uiElement: element },
                "kaboom-flex-ui-element",
            ]);

            element.kaboomObject.onClick(() => element.triggerListener("click"));
            element.kaboomObject.onHover(() => {
                if (element.attrs.cursor) setCursor(element.attrs.cursor);
                element.triggerListener("hover");
            });
            element.kaboomObject.onHoverEnd(() => {
                if (element.attrs.cursor) setCursor("default");
                element.triggerListener("hoverend");
            });
            element.kaboomObject.onMouseDown(() => element.triggerListener("mousedown"));
            element.kaboomObject.onMousePress(() => element.triggerListener("mousepress"));
            element.kaboomObject.onMouseRelease(() => element.triggerListener("mouseup"));
            element.kaboomObject.onHoverUpdate(() => element.triggerListener("hoverupdate"));

            if (element.attrs.onMount) element.attrs.onMount.bind(element)(element.kaboomObject);
        } else {
            element.kaboomObject.pos.x = elementX;
            element.kaboomObject.pos.y = elementY;
            element.kaboomObject.color = element.attrs.background;
            element.kaboomObject.width = selfWidth;
            element.kaboomObject.height = selfHeight;
            element.kaboomObject.radius = element.attrs.borderRadius;
            element.kaboomObject.z = depth;
            element.kaboomObject.opacity = element.attrs.opacity;

            if (element.attrs.outline && element.kaboomObject.outline) {
                element.kaboomObject.outline.color = element.attrs.outline;
                element.kaboomObject.outline.width = element.attrs.outlineWidth;
            } else if (element.attrs.outline)
                element.kaboomObject.use(outline(element.attrs.outlineWidth, element.attrs.outline));
            else if (element.kaboomObject.outline) element.kaboomObject.unuse("outline");
        }

        if (element.attrs.flow === "x") {
            let xInset = paddingLeft;
            let contentWidth = 0;
            let fitCount: number = 0;

            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i] instanceof UIBoxElement && (element.children[i] as UIBoxElement).attrs.fit)
                    fitCount++;

                contentWidth += calculateMinWidth(element.children[i]);
                if (i !== element.children.length - 1) contentWidth += element.attrs.gap;
            }

            const freeHorizontal = selfWidth - paddingLeft - paddingRight - contentWidth;
            const xFitSpace = fitCount === 0 ? 0 : freeHorizontal / fitCount;

            if (fitCount === 0) {
                if (element.attrs.alignX === "center") xInset += freeHorizontal / 2;
                else if (element.attrs.alignX === "right") xInset = selfWidth - contentWidth - paddingRight;
            }

            for (let i = 0; i < element.children.length; i++) {
                let childX = xInset;
                let childY = paddingTop;
                let childWidth = calculateMinWidth(element.children[i]);
                let childHeight = calculateMinHeight(element.children[i]);

                if (element.children[i] instanceof UIBoxElement && (element.children[i] as UIBoxElement).attrs.fit)
                    childWidth += xFitSpace;

                if (element.attrs.alignY === "center") childY = (selfHeight - childHeight) / 2;
                else if (element.attrs.alignY === "bottom") childY = selfHeight - paddingBottom - childHeight;

                if (element.children[i] instanceof UIBoxElement && (element.children[i] as UIBoxElement).attrs.fit) {
                    childY = paddingTop;
                    childHeight = selfHeight - paddingTop - paddingBottom;
                }

                xInset += childWidth + element.attrs.gap;
                addElement(
                    ctx,
                    element.kaboomObject,
                    element.children[i],
                    depth + 1,
                    childX,
                    childY,
                    childWidth,
                    childHeight
                );
            }
        } else {
            let yInset = paddingTop;
            let contentHeight = 0;
            let fitCount = 0;

            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i] instanceof UIBoxElement && (element.children[i] as UIBoxElement).attrs.fit)
                    fitCount++;

                contentHeight += calculateMinHeight(element.children[i]);
                if (i !== element.children.length - 1) contentHeight += element.attrs.gap;
            }

            const freeVertical = selfHeight - paddingTop - paddingBottom - contentHeight;
            const yFitSpace = fitCount === 0 ? 0 : freeVertical / fitCount;

            if (fitCount === 0) {
                if (element.attrs.alignY === "center") yInset += freeVertical / 2;
                else if (element.attrs.alignY === "bottom") yInset = selfHeight - contentHeight - paddingBottom;
            }

            for (let i = 0; i < element.children.length; i++) {
                let childX = paddingLeft;
                let childY = yInset;
                let childWidth = calculateMinWidth(element.children[i]);
                let childHeight = calculateMinHeight(element.children[i]);

                if (element.children[i] instanceof UIBoxElement && (element.children[i] as UIBoxElement).attrs.fit)
                    childHeight += yFitSpace;

                if (element.attrs.alignX === "center") childX = (selfWidth - childWidth) / 2;
                else if (element.attrs.alignX === "right") childX = selfWidth - paddingRight - childWidth;

                if (element.children[i] instanceof UIBoxElement && (element.children[i] as UIBoxElement).attrs.fit) {
                    childX = paddingLeft;
                    childWidth = selfWidth - paddingLeft - paddingRight;
                }

                yInset += childHeight + element.attrs.gap;
                addElement(
                    ctx,
                    element.kaboomObject,
                    element.children[i],
                    depth + 1,
                    childX,
                    childY,
                    childWidth,
                    childHeight
                );
            }
        }

        return element.kaboomObject;
    } else {
        if (!element.kaboomObject) {
            element.kaboomObject = parent.add([
                text(element.text, getTextOptions(element.attrs)),
                color(element.attrs.color),
                pos(elementX, elementY),
                z(depth),
                opacity(element.attrs.opacity),
            ]);

            if (element.attrs.onMount) element.attrs.onMount.bind(element)(element.kaboomObject);
        } else {
            element.kaboomObject.pos.x = elementX;
            element.kaboomObject.pos.y = elementY;
            element.kaboomObject.text = element.text;
            element.kaboomObject.color = element.attrs.color;
            element.kaboomObject.opacity = element.attrs.opacity;
            element.kaboomObject.textSize = element.attrs.fontSize;
            if (element.attrs.fontFamily) element.kaboomObject.font = element.attrs.fontFamily;
        }
        return element.kaboomObject;
    }
}

/**
 * Defines a UI function that takes a UI generator and returns an object with an add method.
 * @param generator The UI generator function.
 * @returns An object with an add method.
 */
export function makeUI(generator: UIGenerator): UIManager {
    let uiTree: UIElement;
    let lastRoot: GameObj | null;

    return {
        add(parent) {
            if (lastRoot) return this.readd();
            if (!uiTree) uiTree = generator();

            const uiRoot = make([fixed(), pos(0, 0)]);

            addElement(this, uiRoot, uiTree, 1000, 0, 0);

            if (!parent) add(uiRoot);
            else parent.add(uiRoot);

            lastRoot = uiRoot;
        },

        readd() {
            const uiRoot = make([fixed(), pos(0, 0)]);
            // TODO: uiRoot doesn't need to be used since all the elements have real kaboom objects
            // associated with them, but I can't be bothered to remove it right now
            addElement(this, uiRoot, uiTree, 1000, 0, 0);
        },

        remove() {
            if (!lastRoot) throw new Error("Cannot remove UI since it hasn't been added yet.");

            const children = [uiTree];

            while (children.length > 0) {
                const child = children.shift()!;

                if (child instanceof UIBoxElement) for (const inner of child.children) children.push(inner);

                child.kaboomObject = null;
            }

            lastRoot.destroy();
            lastRoot = null;
        },
    };
}

/**
 * Creates a UI box element with optional attributes and children elements.
 * @param children The children UI elements.
 * @returns A UI box element.
 */
export function $box(...children: UIElement[]): UIBoxElement;

/**
 * Creates a UI box element with specified attributes and optional children elements.
 * @param attrs The attributes for the box element.
 * @param children The children UI elements.
 * @returns A UI box element.
 */
export function $box(attrs: Partial<UIBoxAttributes>, ...children: UIElement[]): UIBoxElement;

export function $box(...children: [Partial<UIBoxAttributes>, ...UIElement[]] | UIElement[]): UIBoxElement {
    if (children[0] instanceof UITextElement || children[0] instanceof UIBoxElement)
        return new UIBoxElement({}, children as UIElement[]);
    return new UIBoxElement(children[0], children.slice(1) as UIElement[]);
}

/**
 * Creates a UI text element with the specified text and optional attributes.
 * @param text The text content.
 * @param attrs Optional attributes for the text element.
 * @returns A UI text element.
 */
export function $text(text: string, attrs?: Partial<UITextAttributes>): UITextElement {
    if (attrs) return new UITextElement(attrs, text);
    return new UITextElement({}, text);
}

/**
 * Creates a UI button element with the specified text and attributes.
 * @param text The text content.
 * @param attrs The attributes for the button element.
 * @returns A UI box element acting as a button.
 */
export function $button(text: string, attrs: UIButtonAttributes) {
    if (!attrs.cursor) attrs.cursor = "pointer";
    const el = $box(attrs, $text(text, attrs.text));

    return el;
}

export function $checkbox(attrs: UICheckboxAttributes) {
    let isChecked = attrs.checked ?? false;

    return $button("✓", {
        ...attrs,
        text: {
            ...attrs.text,
            lineHeight: 0.9,
            opacity: isChecked ? 1 : 0,
        },

        onClick() {
            const textChild = this.getChild<UITextElement>(0);

            isChecked = !isChecked;

            if (isChecked) textChild.style({ opacity: 1 });
            else textChild.style({ opacity: 0 });

            if (attrs.onCheck) attrs.onCheck.bind(this)(isChecked);
        },
    });
}

export function $input(attrs: UIInputAttributes) {
    const expandedAttrs: UITextAttributes = Object.assign({}, getDefaultTextProperties(), attrs.text);
    const cursorWidth = 2;
    const cursorGap = 2;

    let value = "";
    let cursorPos = 0;
    let isFocused = false;

    let lastSwitch = 0;
    let isBlinked = false;

    return $box(
        {
            ...attrs,
            cursor: "text",
            gap: 0,

            onClick() {
                if (attrs.onFocus) attrs.onFocus.bind(this)();
                isFocused = true;

                const cursorElement = this.getChild<UIBoxElement>(1);
                const beforeCursor = this.getChild<UITextElement>(0);
                const afterCursor = this.getChild<UITextElement>(2);

                beforeCursor.setText(value.substring(0, cursorPos));
                afterCursor.setText(value.substring(cursorPos));
                cursorElement.style({ opacity: 1, width: cursorWidth, gap: cursorGap });

                lastSwitch = 0;
                isBlinked = true;
            },

            onMount(object) {
                const cursorElement = this.getChild<UIBoxElement>(1);
                const beforeCursor = this.getChild<UITextElement>(0);
                const afterCursor = this.getChild<UITextElement>(2);

                const updateText = (text: string) => {
                    if (value !== text && attrs.onChange) attrs.onChange.bind(this)(text);

                    beforeCursor.setText(text.substring(0, cursorPos));
                    afterCursor.setText(text.substring(cursorPos));
                    value = text;
                };

                const listeners = [
                    onUpdate(() => {
                        if (!isFocused) return;
                        if (attrs.onFocusUpdate) attrs.onFocusUpdate.bind(this)();

                        lastSwitch += dt() * 1000;

                        if (lastSwitch >= 700) {
                            isBlinked = !isBlinked;
                            cursorElement.style({ opacity: isBlinked ? 1 : 0 });
                            lastSwitch = 0;
                        }
                    }),

                    onClick(() => {
                        if (object.isHovering()) return;
                        if (attrs.onBlur) attrs.onBlur.bind(this)();

                        cursorPos = value.length;
                        cursorElement.style({ opacity: 0, width: 0 });
                        this.style({ gap: 0 });

                        isFocused = false;
                    }),

                    onKeyPressRepeat("left", () => {
                        if (!isFocused || cursorPos === 0) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos--;
                        updateText(value);
                    }),

                    onKeyPressRepeat("right", () => {
                        if (!isFocused || cursorPos === value.length) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos++;
                        updateText(value);
                    }),

                    onKeyPressRepeat("backspace", () => {
                        if (!isFocused || cursorPos === 0) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos--;
                        updateText(value.substring(0, cursorPos) + value.substring(cursorPos + 1));
                    }),

                    onCharInput((ch) => {
                        if (!isFocused) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos++;
                        if (isKeyDown("shift")) ch = ch.toUpperCase();
                        updateText(value.substring(0, cursorPos - 1) + ch + value.substring(cursorPos - 1));
                    }),
                ];

                // Cleanup click listener
                object.onDestroy(() => listeners.forEach((listener) => listener.cancel()));
            },
        },
        $text(value, attrs.text),
        $box({
            opacity: 0,
            background: attrs.text?.color ?? rgb(255, 255, 255),
            width: 0,
            height: formatText({ text: value.length === 0 ? " " : value, ...getTextOptions(expandedAttrs) }).height - 2,
            cursor: "text",
        }),
        $text("", attrs.text)
    );
}

export default function flexUIPlugin(ctx: KaboomCtx) {
    return {
        makeUI,
        $box,
        $button,
        $text,
        $checkbox,
        $input,
    } as const;
}

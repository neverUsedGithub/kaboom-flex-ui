import {
    AreaComp,
    Color,
    ColorComp,
    EventController,
    GameObj,
    KaboomCtx,
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
}

/**
 * Represents attributes for a UI text element.
 */
export interface UITextAttributes {
    fontFamily: string | undefined;
    lineHeight: number;
    fontSize: number;
    color: Color;
}

/**
 * Represents attributes for a UI button element, extending UI box attributes.
 */
export interface UIButtonAttributes extends Partial<UIBoxAttributes> {
    text?: Partial<UITextAttributes>;

    onClick?: (this: UIElementPublic<UIBoxElement>) => any;
    onMouseDown?: (this: UIElementPublic<UIBoxElement>) => any;
    onMouseRelease?: (this: UIElementPublic<UIBoxElement>) => any;
    onHover?: (this: UIElementPublic<UIBoxElement>) => any;
    onHoverEnd?: (this: UIElementPublic<UIBoxElement>) => any;
    onHoverUpdate?: (this: UIElementPublic<UIBoxElement>) => any;
}

/**
 * Represents an element that can be either a UI box or UI text element.
 */
export type UIElement = UIBoxElement | UITextElement;

export type UIElementPublic<T extends UIElement = UIElement> = T extends UIBoxElement
    ? {
          style: (attrs: Partial<T extends UIBoxElement ? UIBoxAttributes : UITextAttributes>) => void;
          getChild: <U extends UIElement = UIElement>(nth: number) => U;
      }
    : { style: (attrs: Partial<T extends UIBoxElement ? UIBoxAttributes : UITextAttributes>) => void };

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
});

/**
 * Represents a UI text element with specified attributes.
 */
class UITextElement {
    public attrs: UITextAttributes;
    public kaboomObject: GameObj<PosComp | ColorComp | ZComp | TextComp> | null = null;
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
});

/**
 * Represents a UI box element with specified attributes and children elements.
 */
class UIBoxElement {
    public attrs: UIBoxAttributes;
    public kaboomObject: GameObj<
        | PosComp
        | RectComp
        | ColorComp
        | ZComp
        | OutlineComp
        | AreaComp
        | {
              uiElement: UIBoxElement;
          }
    > | null = null;
    private eventListeners: Record<string, ((...args: any) => any)[]> = {};
    private isClicking: boolean = false;
    private isHovering: boolean = false;
    private parent: UIManager | null = null;
    private lastController: EventController | null = null;

    constructor(attrs: Partial<UIBoxAttributes>, public children: UIElement[]) {
        this.attrs = Object.assign({}, getDefaultBoxProperties(), attrs);
    }

    private addListener(event: string, listener: (...args: any) => any) {
        if (!(event in this.eventListeners)) this.eventListeners[event] = [];
        this.eventListeners[event].push(listener);
    }

    triggerListener(event: string, ...args: any) {
        if (event in this.eventListeners) for (const listener of this.eventListeners[event]) listener.bind(this)(args);
    }

    setParent(parent: UIManager) {
        this.parent = parent;
    }

    style(newAttributes: Partial<UIBoxAttributes>) {
        this.attrs = Object.assign({}, this.attrs, newAttributes);
        if (!this.parent) throw new Error("no parent?");
        this.parent.readd();
    }

    getChild(nth: number) {
        return this.children[nth] as UIElementPublic;
    }

    on(event: "hover", callback: (this: UIElementPublic<UIBoxElement>) => any): this;
    on(event: "hoverend", callback: (this: UIElementPublic<UIBoxElement>) => any): this;
    on(event: "hoverupdate", callback: (this: UIElementPublic<UIBoxElement>) => any): this;
    on(event: "click", callback: (this: UIElementPublic<UIBoxElement>) => any): this;
    on(event: "mousedown", callback: (this: UIElementPublic<UIBoxElement>) => any): this;
    on(event: "mouseup", callback: (this: UIElementPublic<UIBoxElement>) => any): this;
    on(event: string, callback: (this: UIElementPublic<UIBoxElement>) => any) {
        this.addListener(event, callback);
        return this;
    }
}

/**
 * Represents a function that generates a UI element.
 */
export type UIGenerator = () => UIElement;

function getTextOptions(element: UITextElement): TextCompOpt {
    return {
        size: element.attrs.fontSize,
        font: element.attrs.fontFamily,
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

    return formatText({ text: element.text, ...getTextOptions(element) }).width;
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

    return formatText({ text: element.text, ...getTextOptions(element) }).height * element.attrs.lineHeight;
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
                outline(element.attrs.outlineWidth, element.attrs.outline),
                area(),
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
        } else {
            element.kaboomObject.pos.x = elementX ?? 0;
            element.kaboomObject.pos.y = elementY ?? 0;
            element.kaboomObject.color = element.attrs.background;
            element.kaboomObject.width = selfWidth;
            element.kaboomObject.height = selfHeight;
            element.kaboomObject.radius = element.attrs.borderRadius;
            element.kaboomObject.z = depth;

            if (element.attrs.outline) element.kaboomObject.outline.color = element.attrs.outline;
            if (element.attrs.outlineWidth) element.kaboomObject.outline.width = element.attrs.outlineWidth;
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
                text(element.text, getTextOptions(element)),
                color(element.attrs.color),
                pos(elementX, elementY),
                z(depth),
            ]);
        } else {
            element.kaboomObject.text = element.text;
            element.kaboomObject.color = element.attrs.color;
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

    if (attrs.onClick) el.on("click", attrs.onClick);
    if (attrs.onMouseDown) el.on("mousedown", attrs.onMouseDown);
    if (attrs.onMouseRelease) el.on("mouseup", attrs.onMouseRelease);
    if (attrs.onHover) el.on("hover", attrs.onHover);
    if (attrs.onHoverEnd) el.on("hoverend", attrs.onHoverEnd);
    if (attrs.onHoverUpdate) el.on("hoverupdate", attrs.onHoverUpdate);

    return el;
}

export default function flexUIPlugin(ctx: KaboomCtx) {
    return {
        makeUI,
        $box,
        $button,
        $text,
    } as const;
}

import { AreaComp, Color, GameObj, PosComp, RectComp, TextComp, TextCompOpt } from "kaboom";

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
    onClick: () => any;
}

/**
 * Represents an element that can be either a UI box or UI text element.
 */
export type UIElement = UIBoxElement | UITextElement;

/**
 * Represents a UI text element with specified attributes.
 */
class UITextElement {
    public attrs: UITextAttributes;

    constructor(attrs: Partial<UITextAttributes>, public text: string) {
        const defaultTextProperties: UITextAttributes = {
            color: rgb(0, 0, 0),
            fontFamily: undefined,
            lineHeight: 0.9,
            fontSize: 30,
        };

        this.attrs = Object.assign({}, defaultTextProperties, attrs);
    }
}

/**
 * Represents a UI box element with specified attributes and children elements.
 */
class UIBoxElement {
    public attrs: UIBoxAttributes;
    private eventListeners: Record<string, ((...args: any) => any)[]> = {};

    constructor(attrs: Partial<UIBoxAttributes>, public children: UIElement[]) {
        const defaultBoxProperties: UIBoxAttributes = {
            alignX: "left",
            alignY: "top",
            flow: "x",
            background: rgb(255, 255, 255),
            fit: false,
            gap: 0,
            padding: { left: 0, right: 0, top: 0, bottom: 0 },
            height: undefined,
            width: undefined,
            borderRadius: 0,
        };

        this.attrs = Object.assign({}, defaultBoxProperties, attrs);
    }

    private addListener(event: string, listener: (...args: any) => any) {
        if (!(event in this.eventListeners)) this.eventListeners[event] = [];
        this.eventListeners[event].push(listener);
    }

    private triggerListener(event: string, ...args: any) {
        if (event in this.eventListeners) for (const listener of this.eventListeners[event]) listener(args);
    }

    onClick(callback: () => any) {
        this.addListener("click", callback);
        return this;
    }

    mountTo(gameObject: GameObj<AreaComp>) {
        gameObject.onClick(() => this.triggerListener("click"));
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
    parent: GameObj,
    element: UIElement,
    depth: number = 0,
    elementX: number,
    elementY: number,
    elementWidth?: number,
    elementHeight?: number
): GameObj<PosComp | RectComp> {
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

        const boxObj = parent.add([
            pos(elementX ?? 0, elementY ?? 0),
            color(element.attrs.background),
            rect(selfWidth, selfHeight, {
                radius: element.attrs.borderRadius,
            }),
            z(depth),
            area(),
        ]);

        element.mountTo(boxObj);

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
                addElement(boxObj, element.children[i], depth + 1, childX, childY, childWidth, childHeight);
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
                addElement(boxObj, element.children[i], depth + 1, childX, childY, childWidth, childHeight);
            }
        }

        return boxObj;
    } else {
        return parent.add([
            text(element.text, getTextOptions(element)),
            color(element.attrs.color),
            pos(elementX, elementY),
            z(depth),
        ]);
    }
}

/**
 * Defines a UI function that takes a UI generator and returns an object with an add method.
 * @param generator The UI generator function.
 * @returns An object with an add method.
 */
export default function ui(generator: UIGenerator) {
    return {
        add() {
            const uiTree = generator();
            const uiRoot = make([]);

            addElement(uiRoot, uiTree, 1000, 0, 0);

            add(uiRoot);
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
    return $box(attrs, $text(text)).onClick(attrs.onClick);
}

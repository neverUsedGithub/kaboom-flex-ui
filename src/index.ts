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

/**
 * Represents a cursor type.
 */
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
 * Represents a color in UI.
 */
export type UIColor = Color | [number, number, number];

/**
 * Represents attributes for a UI box element.
 */
export interface UIBoxAttributes {
    alignX: "left" | "center" | "right";
    alignY: "top" | "center" | "bottom";
    flow: "y" | "x";
    background: UIColor;
    padding: { left: number; right: number; top: number; bottom: number } | number;
    fit: boolean;
    gap: number;
    height: number | undefined;
    width: number | undefined;
    borderRadius: number;
    outline: UIColor | undefined;
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
    color: UIColor;
    opacity: number;

    onMount?: (this: UIElementPublic<UITextElement>, object: Exclude<UITextElement["kaboomObject"], null>) => any;
}

/**
 * Represents attributes for a UI button element, extending UI box attributes.
 */
export interface UIButtonAttributes extends Partial<UIBoxAttributes> {
    text?: Partial<UITextAttributes>;
}

/**
 * Represents attributes for a UI checkbox element.
 */
export interface UICheckboxAttributes extends Partial<UIBoxAttributes> {
    text?: Partial<UITextAttributes>;
    checked?: boolean;

    onCheck?: (this: UIElementPublic<UIBoxElement>, isChecked: boolean) => any;
}

/**
 * Represents attributes for a UI input element.
 */
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

/**
 * Represents a public interface for a UI element.
 */
export type UIElementPublic<T extends UIElement = UIElement> = T extends UIBoxElement
    ? {
          style: (attrs: Partial<UIBoxAttributes>) => void;
          getChild: <U extends UIElement = UIElement>(nth: number) => UIElementPublic<U>;
          getKaboom: () => KaboomCtx;
      }
    : {
          style: (attrs: Partial<UITextAttributes>) => void;
          setText: (text: string) => void;
          getKaboom: () => KaboomCtx;
      };

/**
 * Represents a UI manager.
 */
export interface UIManager {
    add: (parent?: GameObj) => void;
    readd: () => void;
    remove: () => void;
}

function getKaboomManager(instance?: KaboomCtx): KaboomCtx {
    if (!instance && typeof (window as any).rgb !== "function")
        throw new Error(
            "Couldn't find global kaboom functions on window. Did you forget to pass in kaboom as a parameter to makeUI?"
        );

    return instance ?? (window as any as KaboomCtx);
}

const getDefaultTextProperties: () => UITextAttributes = () => ({
    color: [0, 0, 0],
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
    private parent: UIManager | null = null;
    private kaboom: KaboomCtx | null = null;

    constructor(attrs: Partial<UITextAttributes>, public text: string) {
        this.attrs = Object.assign({}, getDefaultTextProperties(), attrs);
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

    setKaboom(kaboom: KaboomCtx) {
        this.kaboom = kaboom;
    }

    getKaboom(): KaboomCtx {
        return this.kaboom!;
    }
}

const getDefaultBoxProperties: () => UIBoxAttributes = () => ({
    alignX: "left",
    alignY: "top",
    flow: "x",
    background: [255, 255, 255],
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
    private kaboom: KaboomCtx | null = null;

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

    setKaboom(kaboom: KaboomCtx) {
        this.kaboom = kaboom;
    }

    getKaboom(): KaboomCtx {
        return this.kaboom!;
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

function calculateMinWidth(kaboom: KaboomCtx, element: UIElement): number {
    if (element instanceof UIBoxElement) {
        const width =
            element.attrs.flow === "x"
                ? element.children
                      .map((child) => calculateMinWidth(kaboom, child))
                      .reduce((a, b) => a + b + element.attrs.gap, -element.attrs.gap)
                : Math.max(...element.children.map((child) => calculateMinWidth(kaboom, child)));

        const calcWidth =
            width +
            (typeof element.attrs.padding === "number"
                ? element.attrs.padding * 2
                : element.attrs.padding.left + element.attrs.padding.right);

        if (element.attrs.width) return element.attrs.width > calcWidth ? element.attrs.width : calcWidth;

        return calcWidth;
    }

    return kaboom.formatText({ text: element.text, ...getTextOptions(element.attrs) }).width;
}

function calculateMinHeight(kaboom: KaboomCtx, element: UIElement): number {
    if (element instanceof UIBoxElement) {
        const height =
            element.attrs.flow === "x"
                ? Math.max(...element.children.map((child) => calculateMinHeight(kaboom, child)))
                : element.children
                      .map((child) => calculateMinHeight(kaboom, child))
                      .reduce((a, b) => a + b + element.attrs.gap, -element.attrs.gap);

        const calcHeight =
            height +
            (typeof element.attrs.padding === "number"
                ? element.attrs.padding * 2
                : element.attrs.padding.top + element.attrs.padding.bottom);

        if (element.attrs.height) return element.attrs.height > calcHeight ? element.attrs.height : calcHeight;

        return calcHeight;
    }

    return (
        kaboom.formatText({ text: element.text, ...getTextOptions(element.attrs) }).height * element.attrs.lineHeight
    );
}

function toKaboomColor(kaboom: KaboomCtx, color: UIColor) {
    if (Array.isArray(color)) return kaboom.rgb(color[0], color[1], color[2]);
    return color;
}

function addElement(
    kaboom: KaboomCtx,
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

        const minHeight = calculateMinHeight(kaboom, element);
        const minWidth = calculateMinWidth(kaboom, element);

        let selfHeight: number = elementHeight ?? minHeight;
        let selfWidth: number = elementWidth ?? minWidth;

        if (selfHeight < minHeight) selfHeight = minHeight;
        if (selfWidth < minWidth) selfWidth = minWidth;

        if (!element.kaboomObject) {
            element.kaboomObject = parent.add([
                kaboom.pos(elementX ?? 0, elementY ?? 0),
                kaboom.color(toKaboomColor(kaboom, element.attrs.background)),
                kaboom.rect(selfWidth, selfHeight, {
                    radius: element.attrs.borderRadius,
                }),
                kaboom.z(depth),
                element.attrs.outline &&
                    kaboom.outline(element.attrs.outlineWidth, toKaboomColor(kaboom, element.attrs.outline)),
                kaboom.area(),
                kaboom.opacity(element.attrs.opacity),
                { uiElement: element },
                "kaboom-flex-ui-element",
            ]);

            element.setKaboom(kaboom);

            element.kaboomObject.onClick(() => element.triggerListener("click"));
            element.kaboomObject.onHover(() => {
                if (element.attrs.cursor) kaboom.setCursor(element.attrs.cursor);
                element.triggerListener("hover");
            });
            element.kaboomObject.onHoverEnd(() => {
                if (element.attrs.cursor) kaboom.setCursor("default");
                element.triggerListener("hoverend");
            });
            element.kaboomObject.onMouseDown(() => element.triggerListener("mousedown"));
            element.kaboomObject.onMousePress(() => element.triggerListener("mousepress"));
            element.kaboomObject.onMouseRelease(() => element.triggerListener("mouseup"));
            element.kaboomObject.onHoverUpdate(() => element.triggerListener("hoverupdate"));
        } else {
            element.kaboomObject.pos.x = elementX;
            element.kaboomObject.pos.y = elementY;
            element.kaboomObject.color = toKaboomColor(kaboom, element.attrs.background);
            element.kaboomObject.width = selfWidth;
            element.kaboomObject.height = selfHeight;
            element.kaboomObject.radius = element.attrs.borderRadius;
            element.kaboomObject.z = depth;
            element.kaboomObject.opacity = element.attrs.opacity;

            if (element.attrs.outline && element.kaboomObject.outline) {
                element.kaboomObject.outline.color = toKaboomColor(kaboom, element.attrs.outline);
                element.kaboomObject.outline.width = element.attrs.outlineWidth;
            } else if (element.attrs.outline)
                element.kaboomObject.use(
                    kaboom.outline(element.attrs.outlineWidth, toKaboomColor(kaboom, element.attrs.outline))
                );
            else if (element.kaboomObject.outline) element.kaboomObject.unuse("outline");
        }

        if (element.attrs.flow === "x") {
            let xInset = paddingLeft;
            let contentWidth = 0;
            let fitCount: number = 0;

            for (let i = 0; i < element.children.length; i++) {
                if (element.children[i] instanceof UIBoxElement && (element.children[i] as UIBoxElement).attrs.fit)
                    fitCount++;

                contentWidth += calculateMinWidth(kaboom, element.children[i]);
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
                let childWidth = calculateMinWidth(kaboom, element.children[i]);
                let childHeight = calculateMinHeight(kaboom, element.children[i]);

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
                    kaboom,
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

                contentHeight += calculateMinHeight(kaboom, element.children[i]);
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
                let childWidth = calculateMinWidth(kaboom, element.children[i]);
                let childHeight = calculateMinHeight(kaboom, element.children[i]);

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
                    kaboom,
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
                kaboom.text(element.text, getTextOptions(element.attrs)),
                kaboom.color(toKaboomColor(kaboom, element.attrs.color)),
                kaboom.pos(elementX, elementY),
                kaboom.z(depth),
                kaboom.opacity(element.attrs.opacity),
            ]);

            element.setKaboom(kaboom);
        } else {
            element.kaboomObject.pos.x = elementX;
            element.kaboomObject.pos.y = elementY;
            element.kaboomObject.text = element.text;
            element.kaboomObject.color = toKaboomColor(kaboom, element.attrs.color);
            element.kaboomObject.opacity = element.attrs.opacity;
            element.kaboomObject.textSize = element.attrs.fontSize;
            if (element.attrs.fontFamily) element.kaboomObject.font = element.attrs.fontFamily;
        }
        return element.kaboomObject;
    }
}

function triggerOnMountListeners(manager: UIManager, element: UIElement) {
    if (element instanceof UIBoxElement) {
        if (element.attrs.onMount) element.attrs.onMount.bind(element)(element.kaboomObject!);
        for (const child of element.children) triggerOnMountListeners(manager, child);
    } else {
        if (element.attrs.onMount) element.attrs.onMount.bind(element)(element.kaboomObject!);
    }
}

/**
 * Takes in a Kaboom context and a UI generator function, returning a UI manager.
 * The UI manager allows addition, removal, and re-addition of UI elements.
 * @param kaboom The Kaboom context used for UI creation.
 * @param generator The UI generator function that generates a UI element.
 * @returns A UI manager with methods to add, remove, and re-add UI elements.
 */
export function makeUI(kaboom: KaboomCtx, generator: UIGenerator): UIManager;

/**
 * Takes in a UI generator function that creates a UI element and returns a UI manager.
 * The UI manager enables addition, removal, and re-addition of the UI.
 * @param generator The UI generator function that generates a UI element.
 * @returns A UI manager with methods to add, remove, and re-add UI elements.
 */
export function makeUI(generator: UIGenerator): UIManager;

export function makeUI(generatorOrKaboom: UIGenerator | KaboomCtx, generator?: UIGenerator): UIManager {
    let uiTree: UIElement;
    let lastRoot: GameObj | null;

    const generatorFunc = typeof generatorOrKaboom === "function" ? generatorOrKaboom : generator!;
    const kaboom = getKaboomManager(typeof generatorOrKaboom === "function" ? undefined : generatorOrKaboom);

    return {
        add(parent) {
            if (lastRoot) return this.readd();
            if (!uiTree) uiTree = generatorFunc();

            const uiRoot = kaboom.make([kaboom.fixed(), kaboom.pos(0, 0)]);

            addElement(kaboom, this, uiRoot, uiTree, 1000, 0, 0);

            if (!parent) kaboom.add(uiRoot);
            else parent.add(uiRoot);

            triggerOnMountListeners(this, uiTree);

            lastRoot = uiRoot;
        },

        readd() {
            const uiRoot = kaboom.make([kaboom.fixed(), kaboom.pos(0, 0)]);
            // TODO: uiRoot doesn't need to be used since all the elements have real kaboom objects
            // associated with them, but I can't be bothered to remove it right now
            addElement(kaboom, this, uiRoot, uiTree, 1000, 0, 0);
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

/**
 * Represents a checkbox element generator function.
 * @param attrs The attributes for the checkbox element.
 * @returns A UI box element acting as a checkbox.
 */
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

/**
 * Represents an input element generator function.
 * @param attrs The attributes for the input element.
 * @returns A UI box element acting as an input.
 */
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
                const kaboom = this.getKaboom();
                const cursorElement = this.getChild<UIBoxElement>(1);
                const beforeCursor = this.getChild<UITextElement>(0);
                const afterCursor = this.getChild<UITextElement>(2);

                cursorElement.style({
                    background: attrs.text?.color ?? kaboom.rgb(255, 255, 255),
                    height:
                        kaboom.formatText({ text: value.length === 0 ? " " : value, ...getTextOptions(expandedAttrs) })
                            .height - 2,
                });

                const updateText = (text: string) => {
                    if (value !== text && attrs.onChange) attrs.onChange.bind(this)(text);

                    beforeCursor.setText(text.substring(0, cursorPos));
                    afterCursor.setText(text.substring(cursorPos));
                    value = text;
                };

                const listeners = [
                    kaboom.onUpdate(() => {
                        if (!isFocused) return;
                        if (attrs.onFocusUpdate) attrs.onFocusUpdate.bind(this)();

                        lastSwitch += kaboom.dt() * 1000;

                        if (lastSwitch >= 700) {
                            isBlinked = !isBlinked;
                            cursorElement.style({ opacity: isBlinked ? 1 : 0 });
                            lastSwitch = 0;
                        }
                    }),

                    kaboom.onClick(() => {
                        if (object.isHovering()) return;
                        if (attrs.onBlur) attrs.onBlur.bind(this)();

                        cursorPos = value.length;
                        cursorElement.style({ opacity: 0, width: 0 });
                        this.style({ gap: 0 });

                        isFocused = false;
                    }),

                    kaboom.onKeyPressRepeat("left", () => {
                        if (!isFocused || cursorPos === 0) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos--;
                        updateText(value);
                    }),

                    kaboom.onKeyPressRepeat("right", () => {
                        if (!isFocused || cursorPos === value.length) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos++;
                        updateText(value);
                    }),

                    kaboom.onKeyPressRepeat("backspace", () => {
                        if (!isFocused || cursorPos === 0) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos--;
                        updateText(value.substring(0, cursorPos) + value.substring(cursorPos + 1));
                    }),

                    kaboom.onCharInput((ch) => {
                        if (!isFocused) return;

                        isBlinked = true;
                        lastSwitch = 0;
                        cursorElement.style({ opacity: 1 });

                        cursorPos++;
                        if (kaboom.isKeyDown("shift")) ch = ch.toUpperCase();
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
            width: 0,
            cursor: "text",
        }),
        $text("", attrs.text)
    );
}

/**
 * A plugin that provides UI generation functionality.
 * @param ctx The Kaboom context.
 * @returns UI generation functions.
 */
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

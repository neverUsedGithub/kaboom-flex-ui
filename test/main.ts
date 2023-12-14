import kaboom from "kaboom";
import flexUIPlugin, { UIBoxAttributes, UIButtonAttributes, UITextElement } from "../src";

const k = kaboom({
    plugins: [flexUIPlugin],
});

const rainbowHover: Partial<UIBoxAttributes> = {
    onHoverUpdate() {
        const t = time() * 10;
        const color = hsl2rgb((t / 20) % 1, 0.6, 0.7);

        this.style({
            background: rgb(40, 40, 40),
            outline: color,
        });

        this.getChild(0).style({ color });
    },
    onHoverEnd() {
        this.style({
            background: rgb(20, 20, 20),
            outline: rgb(60, 60, 60),
        });

        this.getChild(0).style({ color: rgb(220, 220, 220) });
    },
};

const darkTheme: Partial<UIButtonAttributes> = {
    background: rgb(20, 20, 20),
    padding: { top: 16, bottom: 16, left: 32, right: 32 },
    borderRadius: 100000,
    outline: rgb(60, 60, 60),
    outlineWidth: 3,
    text: {
        color: rgb(220, 220, 220),
    },
};

const mainMenu = k.makeUI(() => {
    return k.$box(
        {
            background: rgb(10, 10, 10),
            width: width(),
            height: height(),
            alignY: "center",
            alignX: "center",
            flow: "y",
            gap: 32,
        },
        k.$text("My Kaboom Game!", {
            fontSize: 48,
            color: rgb(220, 220, 220),
        }),
        k.$button("Play!", {
            ...darkTheme,
            ...rainbowHover,

            onClick() {
                console.log("You clicked the button!");
            },
        }),
        k.$checkbox({
            ...darkTheme,
            ...rainbowHover,

            borderRadius: 16,
            padding: { top: 16, bottom: 12, left: 18, right: 18 },
            checked: true,
            onCheck(isChecked) {
                console.log("check", isChecked);
            },
        }),
        k.$input({
            ...darkTheme,
            text: {
                color: rgb(220, 220, 220),
            },

            onChange(value) {
                console.log("entered text", value);
            },

            onFocusUpdate() {
                const t = time() * 10;
                const color = hsl2rgb((t / 20) % 1, 0.6, 0.7);

                this.style({
                    background: rgb(40, 40, 40),
                    outline: color,
                });

                this.getChild(0).style({ color });
                this.getChild(1).style({ background: color });
                this.getChild(2).style({ color });
            },

            onBlur() {
                this.style({
                    background: rgb(20, 20, 20),
                    outline: rgb(60, 60, 60),
                });

                this.getChild(0).style({ color: rgb(220, 220, 220) });
                this.getChild(1).style({ background: rgb(220, 220, 220) });
                this.getChild(2).style({ color: rgb(220, 220, 220) });
            },
        })
    );
});

mainMenu.add();

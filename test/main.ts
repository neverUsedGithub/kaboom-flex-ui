import kaboom from "kaboom";
import flexUIPlugin from "../src";

const k = kaboom({
    plugins: [flexUIPlugin],
});

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
            background: rgb(20, 20, 20),
            padding: { top: 16, bottom: 16, left: 32, right: 32 },
            borderRadius: 100000,
            outline: rgb(60, 60, 60),
            outlineWidth: 3,
            text: {
                color: rgb(220, 220, 220),
            },
            onClick() {
                console.log("You clicked the button!");
            },
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
        })
    );
});

mainMenu.add();

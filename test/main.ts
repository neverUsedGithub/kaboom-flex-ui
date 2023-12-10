import kaboom from "kaboom";
import ui, { $box, $button, $text } from "../src";

kaboom();

const mainMenu = ui(() => {
    return $box(
        {
            background: rgb(10, 10, 10),
            width: width(),
            height: height(),
            alignY: "center",
            alignX: "center",
            flow: "y",
            gap: 32
        },
        $text("My Kaboom Game!", {
            fontSize: 48,
            color: rgb(220, 220, 220),
        }),
        $button("Play!", {
            background: rgb(120, 120, 120),
            padding: 16,
            borderRadius: 100000,
            onClick() {
                alert("lets do it!");
            },
        })
    );
});

mainMenu.add();
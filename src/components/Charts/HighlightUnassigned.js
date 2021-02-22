import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";
import { html } from "lit-html";
import Button from "../Button";

export default function HighlightUnassigned(unitsBorders, zoomFunction) {
    return html`
        ${Button(
            "Highlight Unassigned Units",
            "Highlight units which aren't assigned to a district.",
            event => {
                let target = event.originalTarget;

                // Modify the styling of the original target (i.e. the button we
                // just clicked) and then highlight the borders!
                if (!target.active) {
                    // Modify styling.
                    target.className = "button--alternate--clicked";
                    target.active = true;

                    // Highlight unit borders.
                    unitsBorders.setPaintProperties(
                        highlightUnassignedUnitBordersPaintProperty
                    );
                } else {
                    // Set styling.
                    target.className = "button--alternate";
                    target.active = false;

                    // Un-highlight unit borders.
                    unitsBorders.setPaintProperties(unitBordersPaintProperty);
                }
            }
        )}
    `;
}

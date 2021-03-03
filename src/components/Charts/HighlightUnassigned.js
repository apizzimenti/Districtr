
import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";
import { html } from "lit-html";
import toggle from "../Toggle";
import Button from "../Button";

export default function HighlightUnassigned(unitsBorders, zoomFunction) {
    return html`
        <div id="unassigned-checker" class="ui-option ui-option--slim">
            ${toggle("Highlight unassigned units", false, highlight => {
        document.querySelectorAll('.district-row .contiguity-label input').forEach(box => {
            box.checked = false;
        });
        unitsBorders.setPaintProperties(highlight
            ? highlightUnassignedUnitBordersPaintProperty
            : unitBordersPaintProperty
        );
        document.querySelector("#zoom-to-unassigned").style.display = highlight ? "block" : "none";
    })}
            <div id="zoom-to-unassigned" style="display:none">
                ${zoomFunction
        ? html`<button @click="${zoomFunction}">Zoom to unasssigned</button>`
        : ''
    }
            </div>
        </div>
    `;
}

/*
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
*/

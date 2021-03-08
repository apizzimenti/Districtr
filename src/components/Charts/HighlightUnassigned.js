
import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";
import { html } from "lit-html";
import toggle from "../Toggle";
import Button from "../Button";

/**
 * Provides a checkbox to highlight unassigned units and, if possible, zoom to
 * those unassigned units.
 * @param {object} unitsBorders Units object; child of the State object.
 * @param {function} zoomFunction Function which zooms to the unassigned units,
 * if that is available for the current module.
 * @constructor
 */
export default function HighlightUnassigned(unitsBorders, zoomFunction) {
    return html`
        <div id="unassigned-checker" class="ui-option ui-option--slim">
            ${
                toggle("Highlight Unassigned Units", false, highlight => {
                    let selected = document.querySelectorAll(".district-row .contiguity-label input"),
                        unassigned = document.querySelector("#zoom-to-unassigned");
                    
                    // For all the boxes (which should total one box after the
                    // changes made to the pop balance plugin), uncheck the boxes.
                    selected.forEach(box => { box.checked = false });
                    
                    // When checked, highlight unassigned units.
                    unitsBorders.setPaintProperties(
                        highlight ? highlightUnassignedUnitBordersPaintProperty : unitBordersPaintProperty
                    );
                    
                    // If possible, display the button for zooming to unassigned
                    // units.
                    unassigned.style.display = highlight && zoomFunction ? "block" : "none";
                })
            }
        </div>
        <div id="zoom-to-unassigned" style="display:none;">
            <button class="button--alternate" @click="${zoomFunction}">
                Zoom to Unassigned
            </button>
        </div>
    `;
}


import { html } from "lit-html";
import { Tab } from "../components/Tab";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";
import { spatial_abilities } from "../utils";
import populateDatasetInfo from "../components/Charts/DatasetInfo";


function fitToBoundingBox(state, place, data, url) {
    // First, verify that the data provided has the required results. If not,
    // return.
    if (!(data["-1"] && data["-1"].length)) return;
    
    // Find the right separator, construct the suffix and the individual URL
    // using the suffix, and select the desired IDs.
    let sep = place.id.toLowerCase() === "louisiana" ? ";" : ",",
        ids = data["-1"]
            .filter(a => !a.includes(null))
            .sort((a, b) => b.length - a.length)[0],
        suffix = `ids=${ids.slice(0, 100).join(sep)}`,
        individualURL = url + `/findBBox?place=${place.id}&${suffix}`;
    
    // Fetch the bounding boxes.
    fetch(individualURL)
        .then(res => res.json())
        .then(bbox => {
            // Check that the bounding box has nonzero length and its first
            // coordinate is a number (indicating that the rest of the coords
            // are also numbers). Otherwise, it's nested a little deeper.
            if (bbox.length && !isNaN(bbox[0])) bbox = { x: bbox };
            else if (bbox.length) {
                bbox = bbox[0];
                if (bbox.length) bbox = { x: bbox };
            }
            
            // Iterate through the properties of the bounding box and fit the
            // map to the box.
            Object.values(bbox).forEach(box => {
                state.map.fitBounds([
                    [box[0], box[2]],
                    [box[1], box[3]]
                ]);
            });
        });
}

function zoomToUnassigned(editor) {
    let state = editor.state,
        place = state.place,
        saveplan = JSON.stringify(state.serialize()),
        unpainted = spatial_abilities(place.id).find_unpainted,
        url = "//mggg.pythonanywhere.com",
        options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: saveplan
        };
    
    // Fetches data from the PythonAnywhere server, which sends back IDs of
    // unassigned features. For each unassigned feature, we retrieve its
    // bounding box and re-fit the map to the box.
    const _zoom = () => {
        fetch(url + "/unassigned", options)
            .then(res => res.json())
            .catch(err => console.error(err))
            .then(data => fitToBoundingBox(state, place, data, url));
    };
    
    return unpainted ? _zoom : null;
}

const descriptiveNames = {
    "Population": "2010 Census",
    "Population (2018)": "2018 ACS",
    "Population (2019 ACS)": "2019 ACS"
};

/**
 * Decides which population balance chart to use.
 * @param {object} problem The active State's redistricting problem type.
 * @returns {function(object, object): TemplateResult} One of the two population
 * balance charts, depending on the problem type.
 */
function decidePopChart(problem) {
    if (problem.type === "multimember") return MultiMemberPopBalanceChart;
    else return populationBarChart;
}

/**
 * Includes some population-balance addon Charts, including the unassigned
 * population chart and a population deviation percentage counter if we're
 * drawing single-member districts.
 * @param {object} problem The active State's redistricting problem type.
 * @param {Population} pop Population object.
 * @returns {TemplateResult} Population-balance addons.
 */
function popBalanceAddons(problem, pop) {
    return html`
        <dl class="report-data-list">
            ${unassignedPopulation(pop)}
            ${problem.type === "multimember" ? "" : populationDeviation(pop)}
        </dl>
    `;
}

/**
 * A Plugin which creates and displays a population balance tab. This tab is the
 * first open, by default, when the user opens a districting plan.
 * @param {Editor} editor Editor instance passed to the plugin when the Editor
 * is initialized.
 * @constructor
 */
export default function PopulationBalancePlugin(editor) {
    // Initialize a new Tab.
    const tab = new Tab("criteria", "Population", editor.store);
    
    // Create variables to store the active State, the current redistricting
    // Problem, the Parts being edited, the unitsRecord from the Parts, and
    // a chart function depending on the Problem.
    let state = editor.state,
        problem = state.problem,
        parts = state.activeParts,
        units = state.unitsBorders,
        popChart = decidePopChart(problem);
    
    // Add a nameless section for highlighting unassigned units.
    tab.addSection(
        () => html`
            <section class="toolbar-section">
                ${HighlightUnassigned(units, zoomToUnassigned(editor))}
            </section>
        `
    );

    // Create tab reveal sections using the array of Populations. Based on the
    // index of each Population object, determine whether we have the viewer
    // open or closed, by default.
    state.datasets.reverse().forEach((pop, index) => {
        tab.addRevealSection(
            `Population Balance: ${descriptiveNames[pop.name]}`,
            () => html`
                <section class="toolbar-section">
                    <section class="toolbar-inner dataset-info">
                        ${populateDatasetInfo(state)}
                    </section>
                    ${popChart(pop, parts)}
                    ${popBalanceAddons(problem, pop)}
                </section>
            `,
            { isOpen: !(index > 0) }
        );
    });
    
    // Add the tab to the toolbar.
    editor.toolbar.addTab(tab);
}


import { html } from "lit-html";
import { Tab } from "../components/Tab";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";

const descriptiveNames = {
    "Population": "2010 Census",
    "Population (2018)": "2018 ACS",
    "Population (2019)": "2019 ACS"
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
                ${HighlightUnassigned(units)}
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
                    ${popChart(pop, parts)}
                    ${popBalanceAddons(problem, pop, units)}
                </section>
            `,
            { isOpen: !(index > 0) }
        );
    });

    editor.toolbar.addTab(tab);
}

import { html } from "lit-html";
import { Tab } from "../components/Tab";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";
import { spatial_abilities } from "../utils";

export default function PopulationBalancePlugin(editor) {
    const problem = editor.state.plan.problem;
    const state = editor.state;
    const tab = new Tab("criteria", "Population", editor.store);
    
    let plan = editor.state.plan,
        place = editor.state.place.id,
        extra_source = (editor.state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0;
    if (editor.state.units.sourceId === "ma_towns") {
        extra_source = "ma_towns";
    }
    if (editor.state.units.sourceId === "indiana_precincts") {
        extra_source = "indianaprec";
    }
    const placeID = extra_source || place;
    const sep = (placeID === "louisiana") ? ";" : ",";
    
    const zoomToUnassigned = spatial_abilities(editor.state.place.id).find_unpainted
        ? (e) => {
            let saveplan = state.serialize();
            const GERRYCHAIN_URL = "//mggg.pythonanywhere.com";
            fetch(GERRYCHAIN_URL + "/unassigned", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(saveplan),
            })
            .then((res) => res.json())
            .catch((e) => console.error(e))
            .then((data) => {
                if (data["-1"] && data["-1"].length) {
                    const ids = data["-1"].filter(a => !a.includes(null)).sort((a, b) => b.length - a.length)[0];
                    const myurl = `//mggg.pythonanywhere.com/findBBox?place=${placeID}&`;
                    // : `https://mggg-states.subzero.cloud/rest/rpc/bbox_${placeID}?`
                    fetch(`${myurl}ids=${ids.slice(0, 100).join(sep)}`).then(res => res.json()).then((bbox) => {
                        if (bbox.length && typeof bbox[0] === 'number') {
                            bbox = {x: bbox};
                        } else if (bbox.length) {
                            bbox = bbox[0];
                            if (bbox.length) {
                                bbox = {x: bbox};
                            }
                        }
                        Object.values(bbox).forEach(mybbox => {
                            editor.state.map.fitBounds([
                                [mybbox[0], mybbox[2]],
                                [mybbox[1], mybbox[3]]
                            ]);
                        });
                    });
                }
            });
        }
        : null;
    
    if (problem.type === "multimember") {
        tab.addRevealSection(
            "Population Balance",
            () => html`
                ${MultiMemberPopBalanceChart(state.population, state.parts)}
                <dl class="report-data-list">
                    ${unassignedPopulation(state.population)}
                    ${HighlightUnassigned(state.unitsBorders, zoomToUnassigned)}
                </dl>
            `
        );
    } else {
        tab.addRevealSection(
            "Population Balance",
            () =>
                html`
                    ${populationBarChart(state.population, state.activeParts)}
                    <dl class="report-data-list">
                        ${unassignedPopulation(state.population)}
                        ${populationDeviation(state.population)}
                        ${HighlightUnassigned(state.unitsBorders, zoomToUnassigned)}
                    </dl>
                `
        );
    }
    editor.toolbar.addTab(tab);
}

/*
import { html } from "lit-html";
import { Tab } from "../components/Tab";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";
import { spatial_abilities } from "../utils";
import populateDatasetInfo from "../components/Charts/DatasetInfo";

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
/*
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
                ${HighlightUnassigned(editor.state.unitsBorders)}
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
                    ${popBalanceAddons(problem, pop)}
                </section>
            `,
            { isOpen: !(index > 0) }
        );
    });

    editor.toolbar.addTab(tab);
}
*/

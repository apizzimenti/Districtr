import { html } from "lit-html";
import { Tab } from "../components/Tab";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";
import changePopulationDataset from "../components/Charts/ChangePopulationDataset";


export default function PopulationBalancePlugin(editor) {
    const problem = editor.state.plan.problem;
    const state = editor.state;
    const tab = new Tab("criteria", "Population", editor.store);

    if (problem.type === "multimember") {
        tab.addRevealSection(
            "Population Balance",
            () => html`
                ${MultiMemberPopBalanceChart(state.population, state.parts)}
                <dl class="report-data-list">
                    ${unassignedPopulation(state.population)}
                    ${HighlightUnassigned(state.unitsBorders)}
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
                        ${HighlightUnassigned(state.unitsBorders)}
                    </dl>
                `
        );
    }

    // Add a RevealSection for selecting the desired population dataset.
    tab.addRevealSection(
        "Population Dataset",
        () => html`
            <section class="toolbar-section">
                ${changePopulationDataset(editor)}
            </section>
        `
    );

    // Add this tab to the editor toolbar; this is the first tab to be added.
    editor.toolbar.addTab(tab);
}

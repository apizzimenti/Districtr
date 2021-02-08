import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Select from "../Select";
import Parameter from "../Parameter";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

const electionAbrev = {"19Governor": ["GOV19", "2019 Governor"], "19Lt_Governor": ["LTG19", "2019 Lt. Governor"], 
                           "19Treasurer": ["TRES19", "2019 Treasurer"], "19Ag_Comm": ["AGC19", "2019 Commissioner of Agriculture and Forestry"], 
                           "18SOS": ["SOS18", "2018 Secretary of State"], "17Treasurer": ["TRES17", "2017 Treasurer"], 
                           "16US_Sen": ["SEN16", "2016 US Senate"], "16_President": ["PRES16", "2016 US President"], 
                           "15_Governor":["GOV15", "2015 Governor"], "15_SOS": ["SOS15", "2015 Secretary of State"], 
                           "15_Treasurer": ["TRES15", "2015 Treasurer"]};

const candNames = {"EdwardsD_19G_Governor": "J. Edwards (W)","EdwardsD_19P_Governor": "J. Edwards (W)",
                   "GreenupD_18G_SOS": "G. Collins-Greenup (B)","GreenupD_18P_SOS": "G. Collins-Greenup (B)",
                   "JonesD_19P_Lt_Governor": "W. Jones (B)", "EdwardsD_19P_Treasurer": "D. Edwards (B)",
                   "GreenD_19P_Ag_Comm": "M. Green (W)", "EdwardsD_17G_Treasurer": "D. Edwards (B)",
                   "EdwardsD_17P_Treasurer": "D. Edwards (B)", "CampbellD_16G_US_Sen": "F. Campbell (W)",
                   "CampbellD_16P_US_Sen": "F. Campbell (W)", "ClintonD_16G_President": "H. Clinton (W)",
                   "ClintonD_16P_President": "H. Clinton (W)", "EdwardsD_15P_Governor": "J. Edwards (W)",
                   "EdwardsD_15G_Governor": "J. Edwards (W)", "TysonD_15P_SOS": "C. Tyson (B)",};

function getBackgroundColor(value) {
    return `rgba(0, 0, 0, ${Math.min(
        roundToDecimal(Math.max(value, 0) * 0.98 + 0.02, 2),
        1
    )})`;
}

function getCellStyle(value) {
    const background = getBackgroundColor(value);
    const color = value > 0.4 ? "white" : "black";
    return `background: ${background}; color: ${color}`;
}

function getCell(value, width, decimals, simple=false) {
    // const value = subgroup.values(part.id)
    return {
        content: `${roundToDecimal(value * 100, decimals ? 1 : 0)}%`,
        style: (simple ? `color: black` : getCellStyle(value)) + `; width: ${width}; text-align: center;`
    };
}

function getTextCell(value, width) {
    return {
        content: candNames[value] ? candNames[value] : value, //`${value.split("D_")[0]}`,
        style: `background: white; color: black; width: ${width}; text-align: center;`
    };
}

function getRankCell(elect, width) {
    const place = elect.CoC_place;
    const majority = elect.FirstPlace[1] > 0.5;
    const moveon = place === 1 || (place === 2 && !majority)
    const background = moveon ? "limegreen" : "";
    const color = place < 3 ? "black" : "red"
    const suffix = majority ? "M" : "P";
    const desc = place < 3 ? (place === 1 ? "1st" : "2nd") + " place " + (majority ? "(majority)" : "(plurality)") : ""

    return {
        content: html`<div class="elect_tooltip">
                        ${place < 3 ? html`${place + suffix} <span class="elect_tooltiptext">${desc}</span>` 
                                    : "✘"}
                     </div>`,
        style: `background: ${background}; color: ${color}; width: ${width}; text-align: center;`
    };
}

function getElectLabel(elect) {
    const name = electionAbrev[elect.name] ? electionAbrev[elect.name][0] : elect.name;
    const desc = electionAbrev[elect.name] ? electionAbrev[elect.name][1] : "";
    return html`
        <div class="elect_tooltip">${name}
            <span class="elect_tooltiptext">${desc}</span>
        </div>
    `;
    
    
}

function getGenSuccessCell(vote_perc, width) {
    const color = vote_perc > 0.5 ? "limegreen" : "red";
    const mark =  vote_perc > 0.5 ? `✔` : `✘`;
    return {
        content: `${mark}`,
        style: `color: ${color}; width: ${width}; text-align: center;`
    };
}

const cocHeader = html`<div class="elect_tooltip">CoC
                                <span class="elect_tooltiptext">Black Candidate of Choice</span>
                           </div>`;

function getPrimTable(dist, elects, decimals=true) {
    const groupControlHeader = html`<div class="elect_tooltip">Group Control
                                            <span class="elect_tooltiptext">Estimated Black share in the support received by CoC</span>
                                    </div>`;
    const headers = [dist.renderLabel(),cocHeader, "District Vote %", "Rank", "Out Of", groupControlHeader]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = elects.map(elect => ({
        label: getElectLabel(elect),
        entries: [getTextCell(elect.CoC, width*1.75), 
                  getCell(elect.CoC_perc, width, decimals),
                  getRankCell(elect, width), 
                  getTextCell(elect.numCands, width/2), 
                  getCell(elect.GroupControl, width, decimals, true),
                ]
    }));
    return DataTable(headers, rows, true);
}

function getGenTable(dist, elects, decimals=true) {
    const headers = [dist.renderLabel(), cocHeader, "District Vote %", "Success"]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = elects.map(elect => ({
        label: getElectLabel(elect),
        entries: [elect.CoC_proxy_gen ? getTextCell(elect.CoC_proxy_gen, width*2.25) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width*2.25}; text-align: center;`}, 
                  elect.CoC_proxy_gen ? getCell(elect.proxy_perc_gen, width, decimals) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
                  elect.CoC_proxy_gen ? getGenSuccessCell(elect.proxy_perc_gen, width) 
                                  : {content: "N/A", style:`color: white; background: darkblue; width: ${width}; text-align: center;`},
                ]
    }));
    return DataTable(headers, rows, true);
}

function DistrictResults(effectiveness, dist, group) {
    console.log(group);
    return html`
        <div class="ui-option ui-option--slim">
            <h5> Primary Elections Breakdown</h5>
        </div>
        <section class="toolbar-section">
            ${effectiveness[group][dist.id] ? getPrimTable(dist, effectiveness[group][dist.id].electionDetails) : ""}
        </section>
        
        <div class="ui-option ui-option--slim">
            <h5> General Elections Breakdown</h5>
        </div>
        <section class="toolbar-section">
            ${effectiveness[group][dist.id] ? getGenTable(dist, effectiveness[group][dist.id].electionDetails) : ""}
        </section>
    `;
}

// <ul class="option-list">
/* <li class="option-list__item" style="text-align: center;">
In the candidate rank column, M indicates that some candidate won a majority of 
votes in this district, and P indicates a plurality situation. The entries shaded 
green are those elections where the given candidate would have won or advanced to a
runoff in a district-specific election.
</li>
</ul> */

function SelectDist(dists, handler, selectedIndex) {
    return html`
        <select @change="${e => handler(parseInt(e.target.value))}">
            ${dists.map(
                (d, i) => html`
                    <option value="${i}" ?selected=${selectedIndex === i}
                        >${d.displayNumber}</option
                    >
                `
            )}
        </select>
    `;
}


function SelectGroup(groups, handler, selectedIndex) {
    return html`
        <select @change="${e => handler(parseInt(e.target.value))}">
            ${groups.map(
                (g, i) => html`
                    <option value="${i}" ?selected=${selectedIndex === i}
                        >${g}</option
                    >
                `
            )}
        </select>
    `;
}

export default function VRAResultsSection(
    chartID,
    parts,
    effectiveness,
    placeId,
    uiState,
    dispatch
) {
    // console.log(chartID);
    // let districtRes = DistrictResults.bind(null, effectiveness, parts[uiState.charts[chartID].activePartIndex])
    const groups = Object.keys(effectiveness);
    const group_id = chartID + "_g";
    uiState.charts[group_id] = {activePartIndex: 0}

    return html`
        <section class="toolbar-section">
            ${Parameter({
                label: "District:",
                element: SelectDist(parts, i =>
                    dispatch(
                        actions.selectPart({
                            chart: chartID,
                            partIndex: i
                        })
                    ),
                )
            })}
            ${Parameter({
                label: "Minority Group:",
                element: SelectGroup(groups, i =>
                    dispatch(
                        actions.selectPart({
                            chart: group_id,
                            partIndex: i
                        })
                    ),
                )
            })}
            ${DistrictResults(effectiveness, parts[uiState.charts[chartID].activePartIndex],
                              groups[uiState.charts[group_id].activePartIndex])}
        </section>
    `;
}
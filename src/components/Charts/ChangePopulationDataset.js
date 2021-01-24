
import Select from "../Select";


/**
 * Handler for the Select dropdown menu. Consumes an Editor object to re-assign
 * its child State object's active Population, and forces the Editor to
 * re-render plugins when a different available Population dataset is selected.
 * @param {Editor} editor editor object passed from the population balance
 * plugin.
 * @param {Population[]} dataset Population datasets available to the user.
 * @returns {function(*): void} Callback function.
 * @private
 */
function _onDatasetChange(editor, dataset) {
    /**
     * Consumes the index of the selected item in the Select dropdown, switches
     * out the active population for the one selected, and forces the Editor to
     * re-render its plugins (which forces all SVGs to update their data). Used
     * as a callback, passed to a call to Select.
     * @param {number} index Index of the thing selected in the Select menu.
     * @returns {undefined}
     */
    function selectAndRender(index) {
        editor.state.population = dataset[index];
        editor.render();
    }

    return selectAndRender;
}

/**
 * Retrieve available population datasets, add them to a dropdown, and change
 * the active dataset based on which one is selected.
 * @param {Editor} editor Editor instance passed from the population balance
 * plugin.
 * @returns {str} Renderable HTML containing the dropdown menu.
 */
const changePopulationDataset = editor => {
    return Select(
        editor.state.datasets,
        _onDatasetChange(editor, editor.state.datasets)
    );
};

export default changePopulationDataset;

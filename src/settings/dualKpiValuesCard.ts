import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import Card = formattingSettings.SimpleCard;

export class DualKpiValuesCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        displayNameKey: "Visual_Show",
        value: true
    });

    showKpiValuesTop = new formattingSettings.ToggleSwitch({
        name: "showKpiValuesTop",
        displayName: "Show top chart KPI values",
        displayNameKey: "Visual_ShowTopChartKPIValues",
        value: true
    });

    topChartDefaultKpiValue = new formattingSettings.TextInput({
        name: "topChartDefaultKpiValue",
        displayName: "Top chart default KPI text",
        displayNameKey: "Visual_TopChartDefaultKPIText",
        value: "N/A",
        placeholder: "",
    });

    showKpiValuesBottom = new formattingSettings.ToggleSwitch({
        name: "showKpiValuesBottom",
        displayName: "Show bottom chart KPI values",
        displayNameKey: "Visual_ShowBottomChartKPIValues",
        value: true
    });

    bottomChartDefaultKpiValue = new formattingSettings.TextInput({
        name: "bottomChartDefaultKpiValue",
        displayName: "Bottom chart default KPI text",
        displayNameKey: "Visual_BottomChartDefaultKPIText",
        value: "N/A",
        placeholder: "",
    });

    topLevelSlice = this.show;
    name = "dualKpiValues";
    displayName = "Dual KPI Values";
    displayNameKey = "Visual_DualKPIValues";
    slices = [this.showKpiValuesTop, this.topChartDefaultKpiValue, this.showKpiValuesBottom, this.bottomChartDefaultKpiValue];
}

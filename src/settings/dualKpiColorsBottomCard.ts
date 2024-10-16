import powerbi from 'powerbi-visuals-api';
import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import ValidatorType = powerbi.visuals.ValidatorType;
import Card = formattingSettings.SimpleCard;

export class DualKpiColorsBottomCard extends Card {
    matchTopChartOptions = new formattingSettings.ToggleSwitch({
        name: "matchTopChartOptions",
        displayName: "Match top chart settings",
        displayNameKey: "Visual_DualKpiChart_BottomChartColors_MatchTopChartSettings",
        value: true
    });

    dataColor = new formattingSettings.ColorPicker({
        name: "dataColor",
        displayName: "Data color",
        displayNameKey: "Visual_DualKpiColors_DataColor",
        value: { value:  "#01b8aa" },
    });

    textColor = new formattingSettings.ColorPicker({
        name: "textColor",
        displayName: "Text color",
        displayNameKey: "Visual_DualKpiColors_TextColor",
        value: { value: "#212121" },
    });

    opacity = new formattingSettings.Slider({
        name: "opacity",
        displayName: "Chart opacity",
        displayNameKey: "Visual_DualKpiColors_Opacity",
        value: 30,
        options: {
            minValue: { value: 0, type: ValidatorType.Min },
            maxValue: { value: 100, type: ValidatorType.Max },
        }
    });

    name = "dualKpiColorsBottom";
    displayName = "Dual KPI Bottom Chart Colors";
    displayNameKey = "Visual_DualKpiChart_BottomChartColors";
    slices = [this.matchTopChartOptions, this.dataColor, this.textColor, this.opacity];
}
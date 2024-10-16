import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import Card = formattingSettings.SimpleCard;

export class DualKpiAxisCard extends Card {
    topChartAxisMin = new formattingSettings.NumUpDown({
        name: "topChartAxisMin",
        displayName: "Top chart axis min",
        displayNameKey: "Visual_DualKpiAxis_TopChartAxisMin",
        value: null,
    });

    topChartAxisMax = new formattingSettings.NumUpDown({
        name: "topChartAxisMax",
        displayName: "Top chart axis max",
        displayNameKey: "Visual_DualKpiAxis_TopChartAxisMax",
        value: null,
    });

    bottomChartAxisMin = new formattingSettings.NumUpDown({
        name: "bottomChartAxisMin",
        displayName: "Bottom chart axis min",
        displayNameKey: "Visual_DualKpiAxis_BottomChartAxisMin",
        value: null,
    });

    bottomChartAxisMax = new formattingSettings.NumUpDown({
        name: "bottomChartAxisMax",
        displayName: "Bottom chart axis max",
        displayNameKey: "Visual_DualKpiAxis_BottomChartAxisMax",
        value: null,
    });

    topChartZeroLine = new formattingSettings.ToggleSwitch({
        name: "topChartZeroLine",
        displayName: "Top chart zero line",
        displayNameKey: "Visual_DualKpiAxis_TopChartZeroLine",
        value: false
    });

    bottomChartZeroLine = new formattingSettings.ToggleSwitch({
        name: "bottomChartZeroLine",
        displayName: "Bottom chart zero line",
        displayNameKey: "Visual_DualKpiAxis_BottomChartZeroLine",
        value: false
    });

    name = "dualKpiAxis";
    displayName = "Dual KPI Axis Settings";
    displayNameKey = "Visual_DualKpiAxis";
    slices = [this.topChartAxisMin, this.topChartAxisMax, this.bottomChartAxisMin, this.bottomChartAxisMax, this.topChartZeroLine, this.bottomChartZeroLine];
}

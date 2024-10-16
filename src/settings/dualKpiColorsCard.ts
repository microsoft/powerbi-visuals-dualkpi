import powerbi from 'powerbi-visuals-api';
import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import Card = formattingSettings.SimpleCard;
import ValidatorType = powerbi.visuals.ValidatorType;

export class DualKpiColorsCard extends Card {
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

    name = "dualKpiColors";
    displayName = "Dual KPI Top Chart Colors";
    displayNameKey = "Visual_DualKpiColors";
    slices = [this.dataColor, this.textColor, this.opacity];
}
import powerbi from 'powerbi-visuals-api';
import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import IEnumMember = powerbi.IEnumMember;
import ValidatorType = powerbi.visuals.ValidatorType;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import Card = formattingSettings.SimpleCard;
import Model = formattingSettings.Model;
import { DualKpiChartType, PercentType } from './enums';

const percentTypeOptions: IEnumMember[] = [
    { value: PercentType.lastDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_LastDate" },
    { value: PercentType.firstDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_FirstDate" },
    { value: PercentType.previousDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_PreviousDate" },
];

const chartTypeOptions: IEnumMember[] = [
    { value: DualKpiChartType.area, displayName: "Visual_DualKpiChart_Area" },
    { value: DualKpiChartType.line, displayName: "Visual_DualKpiChart_Line" },
];


class DualKpiPropertiesSettingsCard extends Card {
    topChartShow = new formattingSettings.ToggleSwitch({
        name: "topChartShow",
        displayName: "Show top chart",
        displayNameKey: "Visual_ShowTopChart",
        value: true
    });

    bottomChartShow = new formattingSettings.ToggleSwitch({
        name: "bottomChartShow",
        displayName: "Show bottom chart",
        displayNameKey: "Visual_ShowBottomChart",
        value: true
    });

    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "Title text",
        displayNameKey: "Visual_DualKpiProperties_TitleText",
        value: "",
        placeholder: "",
    });

    abbreviateValues = new formattingSettings.ToggleSwitch({
        name: "abbreviateValues",
        displayName: "Abbreviate values",
        displayNameKey: "Visual_DualKpiProperties_AbbreviateValues",
        value: false
    });

    abbreviateHoverValues = new formattingSettings.ToggleSwitch({
        name: "abbreviateHoverValues",
        displayName: "Abbreviate hover values only",
        displayNameKey: "Visual_DualKpiProperties_AbbreviateHoverValues",
        value: false
    });

    shortKpiTooltip = new formattingSettings.ToggleSwitch({
        name: "shortKpiTooltip",
        displayName: "Short KPI tooltip",
        displayNameKey: "Visual_DualKpiProperties_ShortKPITooltip",
        value: false
    });

    hoverDataPercentType = new formattingSettings.ItemDropdown({
        name: "hoverDataPercentType",
        displayName: "Variance type",
        displayNameKey: "Visual_VarianceType",
        items: percentTypeOptions,
        value: percentTypeOptions[0]
    });

    topChartToolTipText = new formattingSettings.TextInput({
        name: "topChartToolTipText",
        displayName: "Top chart tooltip text",
        displayNameKey: "Visual_DualKpiProperties_TopChartToolTipText",
        value: "",
        placeholder: "",
    });

    bottomChartToolTipText = new formattingSettings.TextInput({
        name: "bottomChartToolTipText",
        displayName: "Bottom chart tooltip text",
        displayNameKey: "Visual_DualKpiProperties_BottomChartToolTipText",
        value: "",
        placeholder: "",
    });

    warningTooltipText = new formattingSettings.TextInput({
        name: "warningTooltipText",
        displayName: "Warning tooltip text",
        displayNameKey: "Visual_DualKpiProperties_WarningTooltipText",
        value: "",
        placeholder: "",
    });

    showStaleDataWarning = new formattingSettings.ToggleSwitch({
        name: "showStaleDataWarning",
        displayName: "Show stale data warning",
        displayNameKey: "Visual_DualKpiProperties_ShowStaleDataWarning",
        value: true
    });

    staleDataTooltipText = new formattingSettings.TextInput({
        name: "staleDataTooltipText",
        displayName: "Stale data tooltip text",
        displayNameKey: "Visual_DualKpiProperties_StaleDataTooltipText",
        value: "",
        placeholder: "",
    });

    staleDataThreshold = new formattingSettings.NumUpDown({
        name: "staleDataThreshold",
        displayName: "Stale data threshold",
        displayNameKey: "Visual_DualKpiProperties_StaleDataThreshold",
        value: 2,
    });

    topPercentCalcDate = new formattingSettings.TextInput({
        name: "topPercentCalcDate",
        displayName: "Top - % change start date (mm/dd/yyyy)",
        displayNameKey: "Visual_DualKpiProperties_TopPercentCalcDate",
        value: "",
        placeholder: "",
    });

    bottomPercentCalcDate = new formattingSettings.TextInput({
        name: "bottomPercentCalcDate",
        displayName: "Bottom - % change start date (mm/dd/yyyy)",
        displayNameKey: "Visual_DualKpiProperties_BottomPercentCalcDate",
        value: "",
        placeholder: "",
    });

    name = "dualKpiProperties";
    displayName = "Dual KPI Properties";
    displayNameKey = "Visual_DualKpiProperties";
    slices = [
        this.topChartShow,
        this.bottomChartShow,
        this.titleText,
        this.abbreviateValues,
        this.abbreviateHoverValues,
        this.shortKpiTooltip,
        this.hoverDataPercentType,
        this.topChartToolTipText,
        this.bottomChartToolTipText,
        this.warningTooltipText,
        this.showStaleDataWarning,
        this.staleDataTooltipText,
        this.staleDataThreshold,
        this.topPercentCalcDate,
        this.bottomPercentCalcDate
    ];
}

class DualKpiValuesSettingsCard extends Card {
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

class DualKpiTitleFormattingSettingsCard extends Card {
    fontSizeAutoFormatting = new formattingSettings.ToggleSwitch({
        name: "fontSizeAutoFormatting",
        displayName: "Auto text size",
        displayNameKey: "Visual_TextAutoSize",
        value: true
    });

    font = new formattingSettings.FontControl({
        name: "font",
        displayName: "Font",
        displayNameKey: "Visual_Font",
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Value text size",
            displayNameKey: "Visual_TextSizeValue",
            value: 10
        }),
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Font family",
            displayNameKey: "Visual_TextFontFamily",
            value: "helvetica, arial, sans-serif",
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "isBold",
            displayName: "Bold",
            displayNameKey: "Visual_TextIsBold",
            value: false,
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "isItalic",
            displayName: "Italic",
            displayNameKey: "Visual_TextIsItalic",
            value: false,
        }),
        underline: new formattingSettings.ToggleSwitch({
            name: "isUnderline",
            displayName: "Underline",
            displayNameKey: "Visual_Underline",
            value: false,
        }),
    });

    upperCase = new formattingSettings.ToggleSwitch({
        name: "upperCase",
        displayName :"Uppercase",
        displayNameKey: "Visual_Uppercase",
        value: false,
    });

    name = "dualKpiTitleFormatting";
    displayName = "Dual KPI Title formatting";
    displayNameKey = "Visual_TitleFormatting";
    slices = [
        this.fontSizeAutoFormatting,
        this.font,
        this.upperCase,
    ];
}

class DualKpiValueFormattingSettingsCard extends Card {
    fontSizeAutoFormatting = new formattingSettings.ToggleSwitch({
        name: "fontSizeAutoFormatting",
        displayName: "Auto text size",
        displayNameKey: "Visual_TextAutoSize",
        value: true
    });

    font = new formattingSettings.FontControl({
        name: "font",
        displayName: "Font",
        displayNameKey: "Visual_Font",
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Value text size",
            displayNameKey: "Visual_TextSizeValue",
            value: 16
        }),
        fontFamily: new formattingSettings.FontPicker({
            name: "fontFamily",
            displayName: "Font family",
            displayNameKey: "Visual_TextFontFamily",
            value: "helvetica, arial, sans-serif",
        }),
        bold: new formattingSettings.ToggleSwitch({
            name: "isBold",
            displayName: "Bold",
            displayNameKey: "Visual_TextIsBold",
            value: false,
        }),
        italic: new formattingSettings.ToggleSwitch({
            name: "isItalic",
            displayName: "Italic",
            displayNameKey: "Visual_TextIsItalic",
            value: false,
        }),
        underline: new formattingSettings.ToggleSwitch({
            name: "isUnderline",
            displayName: "Underline",
            displayNameKey: "Visual_Underline",
            value: false,
        }),
    });

    displayUnits = new formattingSettings.AutoDropdown({
        name: "displayUnits",
        displayName: "Display units",
        displayNameKey: "Visual_DisplayUnits",
        value: 1,
    });

    precision = new formattingSettings.NumUpDown({
        name: "precision",
        displayName: "Decimal Places",
        displayNameKey: "Visual_DecimalPlaces",
        value: 0,
        options: {
            minValue: { value: 0, type: ValidatorType.Min },
            maxValue: { value: 17, type: ValidatorType.Max },
        },
    });

    name = "dualKpiValueFormatting";
    displayName = "Dual KPI Value formatting";
    displayNameKey = "Visual_ValueFormatting";
    slices = [this.fontSizeAutoFormatting, this.font, this.displayUnits, this.precision];
}

class DualKpiColorsSettingsCard extends Card {
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

class DualKpiColorsBottomSettingsCard extends Card {
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

class DualKpiAxisSettingsCard extends Card {
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

class DualKpiChartSettingsCard extends Card {
    topChartType = new formattingSettings.ItemDropdown({
        name: "topChartType",
        displayName: "Top chart type",
        displayNameKey: "Visual_DualKpiChart_TopChartType",
        items: chartTypeOptions,
        value: chartTypeOptions[0]
    });

    bottomChartType = new formattingSettings.ItemDropdown({
        name: "bottomChartType",
        displayName: "Bottom chart type",
        displayNameKey: "Visual_DualKpiChart_BottomChartType",
        items: chartTypeOptions,
        value: chartTypeOptions[0]
    });

    name = "dualKpiChart";
    displayName = "Dual KPI Chart Type";
    displayNameKey = "Visual_DualKpiChart";
    slices = [this.topChartType, this.bottomChartType];
}

export class DualKpiSettingsModel extends Model {
    dualKpiProperties = new DualKpiPropertiesSettingsCard();
    dualKpiValues = new DualKpiValuesSettingsCard();
    dualKpiTitleFormatting = new DualKpiTitleFormattingSettingsCard();
    dualKpiValueFormatting = new DualKpiValueFormattingSettingsCard();
    dualKpiColors = new DualKpiColorsSettingsCard();
    dualKpiColorsBottom = new DualKpiColorsBottomSettingsCard();
    dualKpiAxis = new DualKpiAxisSettingsCard();
    dualKpiChart = new DualKpiChartSettingsCard();

    cards = [
        this.dualKpiProperties,
        this.dualKpiValues,
        this.dualKpiTitleFormatting,
        this.dualKpiValueFormatting,
        this.dualKpiColors,
        this.dualKpiColorsBottom,
        this.dualKpiAxis,
        this.dualKpiChart,
    ];

    public validateValues(): void {
        this.dualKpiColors.opacity.value = this.validateOpacity(this.dualKpiColors.opacity.value);
        this.dualKpiColorsBottom.opacity.value = this.validateOpacity(this.dualKpiColorsBottom.opacity.value);

    }

    public setLocalizedOptions(localizationManager: ILocalizationManager) {
        this.setDefaultValues(localizationManager);

        this.setLocalizedDisplayName(percentTypeOptions, localizationManager);
        this.setLocalizedDisplayName(chartTypeOptions, localizationManager);
    }

    private setDefaultValues(localizationManager: ILocalizationManager): void {
        if (!this.dualKpiProperties.titleText.value) {
            this.dualKpiProperties.titleText.value = localizationManager.getDisplayName("Visual_Default_Title");
        }

        if (!this.dualKpiProperties.warningTooltipText.value) {
            this.dualKpiProperties.warningTooltipText.value = localizationManager.getDisplayName("Visual_Default_WarningTooltipText");
        }
    }

    private setLocalizedDisplayName(options: IEnumMember[], localizationManager: ILocalizationManager) {
        options.forEach((option: IEnumMember) => {
            option.displayName = localizationManager.getDisplayName(option.displayName.toString());
        });
    }

    private validateOpacity(opacity: number): number {
        const min = 0;
        const max = 100;

        if (opacity < min) {
            return min;
        } else if (opacity > max) {
            return max;
        } else {
            return opacity;
        }
    }
}
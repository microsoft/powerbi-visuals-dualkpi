import powerbi from 'powerbi-visuals-api';
import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import { PercentType } from '../enums';

import IEnumMember = powerbi.IEnumMember;
import Card = formattingSettings.SimpleCard;

export const percentTypeOptions: IEnumMember[] = [
    { value: PercentType.lastDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_LastDate" },
    { value: PercentType.firstDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_FirstDate" },
    { value: PercentType.previousDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_PreviousDate" },
];

export class DualKpiPropertiesCard extends Card {
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

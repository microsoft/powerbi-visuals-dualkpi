/**
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

import powerbi from 'powerbi-visuals-api';
import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import { PercentType } from '../enums';

import IEnumMember = powerbi.IEnumMember;
import Card = formattingSettings.SimpleCard;
import CompositeCard = formattingSettings.CompositeCard;

export const percentTypeOptions: IEnumMember[] = [
    { value: PercentType.lastDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_LastDate" },
    { value: PercentType.firstDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_FirstDate" },
    { value: PercentType.previousDate, displayName: "Visual_DualKpiProperties_HoverDataPercentType_PreviousDate" },
];

class GeneralSetting extends Card {
    name = "generalSetting";
    displayName = "General";
    displayNameKey = "Visual_DualKpi_General";
    description = "General settings";
    descriptionKey = "Visual_DualKpi_General_Description";
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



    abbreviateValues = new formattingSettings.ToggleSwitch({
        name: "abbreviateValues",
        displayName: "Abbreviate values",
        displayNameKey: "Visual_DualKpiProperties_AbbreviateValues",
        description: "Abbreviate values (e.g. 60000 → 60k)",
        descriptionKey: "Visual_DualKpiProperties_AbbreviateValues_Description",
        value: false,

    });

    abbreviateHoverValues = new formattingSettings.ToggleSwitch({
        name: "abbreviateHoverValues",
        displayName: "Abbreviate hover values only",
        displayNameKey: "Visual_DualKpiProperties_AbbreviateHoverValues",
        description: "Abbreviate hover values only",
        descriptionKey: "Visual_DualKpiProperties_AbbreviateHoverValues_Description",
        value: false
    });



    hoverDataPercentType = new formattingSettings.ItemDropdown({
        name: "hoverDataPercentType",
        displayName: "Variance type",
        displayNameKey: "Visual_VarianceType",
        items: percentTypeOptions,
        value: percentTypeOptions[0]
    });

    showStaleDataWarning = new formattingSettings.ToggleSwitch({
        name: "showStaleDataWarning",
        displayName: "Show stale data warning",
        displayNameKey: "Visual_DualKpiProperties_ShowStaleDataWarning",
        description: "Show stale data warning",
        descriptionKey: "Visual_DualKpiProperties_ShowStaleDataWarning_Description",
        value: true
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
        description: "Top - % change start date (mm/dd/yyyy)",
        descriptionKey: "Visual_DualKpiProperties_TopPercentCalcDate_Description",
        value: "",
        placeholder: "",
    });

    bottomPercentCalcDate = new formattingSettings.TextInput({
        name: "bottomPercentCalcDate",
        displayName: "Bottom - % change start date (mm/dd/yyyy)",
        displayNameKey: "Visual_DualKpiProperties_BottomPercentCalcDate",
        description: "Bottom - % change start date (mm/dd/yyyy)",
        descriptionKey: "Visual_DualKpiProperties_BottomPercentCalcDate_Description",
        value: "",
        placeholder: "",
    });


    slices?: formattingSettings.Slice[] = [
        this.topChartShow,
        this.bottomChartShow,
        this.abbreviateValues,
        this.abbreviateHoverValues,
        this.hoverDataPercentType,
        this.showStaleDataWarning,
        this.staleDataThreshold,
        this.topPercentCalcDate,
        this.bottomPercentCalcDate
    ]
}

class TitleSetting extends Card {
    name = "titleSetting";
    displayName = "Title";
    displayNameKey = "Visual_DualKpi_Title";
    description = "Title text formatting setting";
    descriptionKey = "Visual_DualKpi_Title_Description";
    titleText = new formattingSettings.TextInput({
        name: "titleText",
        displayName: "Title text",
        displayNameKey: "Visual_DualKpiProperties_TitleText",
        value: "",
        placeholder: "",
    });

    font = new formattingSettings.FontControl({
        name: "font",
        displayName: "Font",
        displayNameKey: "Visual_Font",
        fontSize: new formattingSettings.NumUpDown({
            name: "fontSize",
            displayName: "Value text size",
            displayNameKey: "Visual_TextSizeValue",
            value: 32,
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

    textColor = new formattingSettings.ColorPicker({
        name: "textColor",
        displayName: "Text color",
        displayNameKey: "Visual_DualKpiColors_TextColor",
        value: { value: "#212121" },
    });

    fontSizeAutoFormatting = new formattingSettings.ToggleSwitch({
        name: "fontSizeAutoFormatting",
        displayName: "Auto text size",
        displayNameKey: "Visual_TextAutoSize",
        description: "Automatically adjust the text size to fit the visual",
        descriptionKey: "Visual_TextAutoSize_Description",
        value: true,
    });
    slices?: formattingSettings.Slice[] = [
        this.titleText,
        this.font,
        this.textColor,
        this.fontSizeAutoFormatting,
    ]

}
class TooltipSettings extends Card {
    name = "tooltipSetting";
    displayName = "Tooltip";
    displayNameKey = "Visual_DualKpi_Tooltip";
    description = "Tooltip text and display settings";
    descriptionKey = "Visual_DualKpi_Tooltip_Description";
    shortKpiTooltip = new formattingSettings.ToggleSwitch({
        name: "shortKpiTooltip",
        displayName: "Short KPI tooltip",
        displayNameKey: "Visual_DualKpiProperties_ShortKPITooltip",
        value: false,
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

    staleDataTooltipText = new formattingSettings.TextInput({
        name: "staleDataTooltipText",
        displayName: "Stale data tooltip text",
        displayNameKey: "Visual_DualKpiProperties_StaleDataTooltipText",
        value: "",
        placeholder: "",
    });

    slices?: formattingSettings.Slice[] = [
        this.shortKpiTooltip,
        this.topChartToolTipText,
        this.bottomChartToolTipText,
        this.warningTooltipText,
    ]
}

export class DualKpiPropertiesCard extends CompositeCard {

    public generalGroup = new GeneralSetting();
    public titleGroup = new TitleSetting();
    public tooltipGroup = new TooltipSettings();

    name = "dualKpiProperties";
    displayName = "Dual KPI Properties";
    displayNameKey = "Visual_DualKpiProperties";
    groups = [
        this.titleGroup,
        this.tooltipGroup,
        this.generalGroup,
    ];
}

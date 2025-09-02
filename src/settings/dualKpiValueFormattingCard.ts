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

import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';
import Card = formattingSettings.SimpleCard;

export class DualKpiValueFormattingCard extends Card {
    fontSizeAutoFormatting = new formattingSettings.ToggleSwitch({
        name: "fontSizeAutoFormatting",
        displayName: "Auto text size",
        displayNameKey: "Visual_TextAutoSize",
        description: "Automatically adjust the text size to fit the visual",
        descriptionKey: "Visual_TextAutoSize_Description",
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
        descriptionKey: "Visual_Description_DecimalPlaces",
        value: 0,
        options: {
            minValue: { value: 0, type: powerbi.visuals.ValidatorType.Min },
            maxValue: { value: 17, type: powerbi.visuals.ValidatorType.Max },
        },
    });

    name = "dualKpiValueFormatting";
    displayName = "Dual KPI Value formatting";
    displayNameKey = "Visual_ValueFormatting";
    slices = [this.fontSizeAutoFormatting, this.font, this.displayUnits, this.precision];
}
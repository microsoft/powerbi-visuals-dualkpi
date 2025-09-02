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

export class DualKpiTitleFormattingCard extends Card {
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

    textColor = new formattingSettings.ColorPicker({
        name: "textColor",
        displayName: "Text color",
        displayNameKey: "Visual_TextColor",
        value: { value: "#212121" },
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
        this.textColor,
        this.upperCase,
    ];
}
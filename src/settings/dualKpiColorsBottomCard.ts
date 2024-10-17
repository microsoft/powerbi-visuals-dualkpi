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
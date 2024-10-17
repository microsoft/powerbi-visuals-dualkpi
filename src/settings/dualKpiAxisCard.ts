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

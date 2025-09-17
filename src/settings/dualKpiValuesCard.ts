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

export class DualKpiValuesCard extends Card {
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
        description: "Show top chart KPI values",
        descriptionKey: "Visual_ShowTopChartKPIValues",
        value: true
    });

    topChartDefaultKpiValue = new formattingSettings.TextInput({
        name: "topChartDefaultKpiValue",
        displayName: "Top chart default KPI text",
        displayNameKey: "Visual_TopChartDefaultKPIText",
        description: "Default text when no KPI value is available",
        descriptionKey: "Visual_Description_TopChartDefaultKpiValue",
        value: "N/A",
        placeholder: "",
    });

    showKpiValuesBottom = new formattingSettings.ToggleSwitch({
        name: "showKpiValuesBottom",
        displayName: "Show bottom chart KPI values",
        displayNameKey: "Visual_ShowBottomChartKPIValues",
        description: "Show bottom chart KPI values",
        descriptionKey: "Visual_ShowBottomChartKPIValues",
        value: true
    });

    bottomChartDefaultKpiValue = new formattingSettings.TextInput({
        name: "bottomChartDefaultKpiValue",
        displayName: "Bottom chart default KPI text",
        displayNameKey: "Visual_BottomChartDefaultKPIText",
        description: "Bottom chart default KPI text",
        descriptionKey: "Visual_BottomChartDefaultKPIText",
        value: "N/A",
        placeholder: "",
    });

    topLevelSlice = this.show;
    name = "dualKpiValues";
    displayName = "Dual KPI Values";
    displayNameKey = "Visual_DualKPIValues";
    slices = [this.showKpiValuesTop, this.topChartDefaultKpiValue, this.showKpiValuesBottom, this.bottomChartDefaultKpiValue];
}

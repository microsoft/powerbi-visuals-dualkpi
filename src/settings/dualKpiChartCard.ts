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
import { DualKpiChartType } from '../enums';

import IEnumMember = powerbi.IEnumMember;
import Card = formattingSettings.SimpleCard;

export const chartTypeOptions: IEnumMember[] = [
    { value: DualKpiChartType.area, displayName: "Visual_DualKpiChart_Area" },
    { value: DualKpiChartType.line, displayName: "Visual_DualKpiChart_Line" },
];

export class DualKpiChartCard extends Card {
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

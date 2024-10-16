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

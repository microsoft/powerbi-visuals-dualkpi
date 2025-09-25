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

import {
    DualKpiPropertiesCard,
    percentTypeOptions,
    DualKpiValuesCard,
    DualKpiTitleFormattingCard,
    DualKpiValueFormattingCard,
    DualKpiColorsCard,
    DualKpiColorsBottomCard,
    DualKpiAxisCard,
    DualKpiChartCard,
    chartTypeOptions
} from './settings';

import IEnumMember = powerbi.IEnumMember;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import Model = formattingSettings.Model;

export class DualKpiSettingsModel extends Model {
    properties = new DualKpiPropertiesCard();
    values = new DualKpiValuesCard();
    titleFormatting = new DualKpiTitleFormattingCard();
    valueFormatting = new DualKpiValueFormattingCard();
    colors = new DualKpiColorsCard();
    colorsBottom = new DualKpiColorsBottomCard();
    axis = new DualKpiAxisCard();
    chart = new DualKpiChartCard();

    cards = [
        this.properties,
        this.values,
        this.titleFormatting,
        this.valueFormatting,
        this.colors,
        this.colorsBottom,
        this.axis,
        this.chart,
    ];

    public validateValues(): void {
        this.colors.opacity.value = this.validateOpacity(this.colors.opacity.value);
        this.colorsBottom.opacity.value = this.validateOpacity(this.colorsBottom.opacity.value);
        
        // Disable display units when abbreviate values is on
        if (this.properties.generalGroup.abbreviateValues.value) {
            this.valueFormatting.displayUnits.value = 1;
            this.valueFormatting.displayUnits.disabled = true;
            this.valueFormatting.displayUnits.disabledReasonKey = "Visual_Description_AbbreviateValues_On";
            this.valueFormatting.displayUnits.disabledReason = "Visual_Description_AbbreviateValues_On";

            this.valueFormatting.precision.value = 0;
            this.valueFormatting.precision.disabled = true;
            this.valueFormatting.precision.disabledReason = "Visual_Description_AbbreviateValues_On";
            this.valueFormatting.precision.disabledReasonKey = "Visual_Description_AbbreviateValues_On";
        }
    }

    public setLocalizedOptions(localizationManager: ILocalizationManager) {
        this.setDefaultValues(localizationManager);

        this.setLocalizedDisplayName(percentTypeOptions, localizationManager);
        this.setLocalizedDisplayName(chartTypeOptions, localizationManager);
    }

    private setDefaultValues(localizationManager: ILocalizationManager): void {
        if (!this.properties.titleGroup.titleText.value) {
            this.properties.titleGroup.titleText.value = localizationManager.getDisplayName("Visual_Default_Title");
        }

        if (!this.properties.tooltipGroup.warningTooltipText.value) {
            this.properties.tooltipGroup.warningTooltipText.value = localizationManager.getDisplayName("Visual_Default_WarningTooltipText");
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
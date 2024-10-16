import powerbi from 'powerbi-visuals-api';
import { formattingSettings } from 'powerbi-visuals-utils-formattingmodel';

import { DualKpiPropertiesCard, percentTypeOptions } from './settings/dualKpiPropertiesCard';
import { DualKpiValuesCard } from './settings/dualKpiValuesCard';
import { DualKpiTitleFormattingCard } from './settings/dualKpiTitleFormattingCard';
import { DualKpiValueFormattingCard } from './settings/dualKpiValueFormattingCard';
import { DualKpiColorsCard } from './settings/dualKpiColorsCard';
import { DualKpiColorsBottomCard } from './settings/dualKpiColorsBottomCard';
import { DualKpiAxisCard } from './settings/dualKpiAxisCard';
import { DualKpiChartCard, chartTypeOptions } from './settings/dualKpiChartCard';

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
    }

    public setLocalizedOptions(localizationManager: ILocalizationManager) {
        this.setDefaultValues(localizationManager);

        this.setLocalizedDisplayName(percentTypeOptions, localizationManager);
        this.setLocalizedDisplayName(chartTypeOptions, localizationManager);
    }

    private setDefaultValues(localizationManager: ILocalizationManager): void {
        if (!this.properties.titleText.value) {
            this.properties.titleText.value = localizationManager.getDisplayName("Visual_Default_Title");
        }

        if (!this.properties.warningTooltipText.value) {
            this.properties.warningTooltipText.value = localizationManager.getDisplayName("Visual_Default_WarningTooltipText");
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
/*
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

import "./../style/visual.less";
import "@babel/polyfill";

// d3
import * as d3 from "d3";

import * as jQuery from "jquery";

// powerbi
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;

// powerbi.extensibility
import IVisual = powerbi.extensibility.IVisual;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IColorPalette = powerbi.extensibility.IColorPalette;

// powerbi.extensibility.utils.formatting
import { valueFormatter as ValueFormatter } from "powerbi-visuals-utils-formattingutils";
import IValueFormatter = ValueFormatter.IValueFormatter;
import valueFormatter = ValueFormatter.valueFormatter;

import { textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import TextMeasurementService = textMeasurementService.textMeasurementService;
import { DisplayUnitSystemType } from "powerbi-visuals-utils-formattingutils/lib/displayUnitSystem/displayUnitSystemType";

import { ColorHelper } from "powerbi-visuals-utils-colorutils";

import { DualKpiSettings } from "./settings/settings";
import { PercentType } from "./settings/dualKpiPropertiesSettings";
import { DualKpiChartPositionType } from "./enums";

type Selection = d3.Selection<any, any, any, any>;

export interface IDualKpiDataPoint {
    date: Date;
    value: number;
}

export interface ElementScale {
    x: number;
    y: number;
}

export interface IDualKpiData {

    settings: DualKpiSettings;
    // data bound
    topChartName: string;
    bottomChartName: string;
    topValues: Array<IDualKpiDataPoint>;
    bottomValues: Array<IDualKpiDataPoint>;
    topValueAsPercent: boolean;
    bottomValueAsPercent: boolean;

    topPercentCalcDate: Date;
    bottomPercentCalcDate: Date;
    warningState: number;
}

export interface IAxisConfig {
    min: number;
    max: number;
}

export enum DualKpiSize {
    supersmall,
    extrasmall,
    small,
    medium,
    large
}

export type DualKpiSizeClass = "super-small" | "extra-small" | "small" | "medium" | "large";

export interface IDualKpiOptions {
    element: IChartGroup;
    abbreviateValue: boolean;
    abbreviateHoverValue: boolean;
    axisConfig: IAxisConfig;
    hoverDataPercentType: PercentType;
    chartData: Array<IDualKpiDataPoint>;
    chartTitle: string;
    chartType: string;
    position: DualKpiChartPositionType;
    height: number;
    percentChangeStartPoint: IDualKpiDataPoint;
    showZeroLine: boolean;
    tooltipText: string;
    top: number;
    valueAsPercent: boolean;
    width: number;
    showTextOverlay: boolean;
    showDefaultTextOverlay: boolean;
    defaultTextOverlay: string;
    titleFontSize: number;
    valueFontSize: number;
    fontSizeAutoFormattingTitle: boolean;
    fontSizeAutoFormattingValue: boolean;
    isBoldTitle: boolean;
    isBoldValue: boolean;
    isItalicTitle: boolean;
    isItalicValue: boolean;
    fontFamilyTitle: string;
    fontFamilyValue: string;
}

export interface IGroup {
    group: Selection;
    icon: Selection;
    title: Selection;
}

export interface IBottomContainer {
    bottomContainer: Selection;
    chartTitleElement: Selection;
    warning: IGroup;
    info: IGroup;
    dateRangeText: Selection;
}

export interface IHoverDataContainer {
    container: Selection;
    date: Selection;
    text: Selection;
    percent: Selection;
}

export interface IChartOverlay {
    group: Selection;
    title: Selection;
    text: Selection;
    rect: Selection;
    rectTitle: Selection;
}

export interface IChartGroup {
    group: Selection;
    area: Selection;
    yAxis: Selection;
    hoverLine: Selection;
    hoverDataContainer: IHoverDataContainer;
    chartOverlay: IChartOverlay;
    zeroAxis: Selection;
}

export class DualKpi implements IVisual {
    private dataView: DataView;
    private data: IDualKpiData;
    private target: HTMLElement;
    private size: DualKpiSize;
    private sizeCssClass: DualKpiSizeClass;

    private svgRoot: Selection;

    private chartGroupTop: IChartGroup;
    private chartGroupBottom: IChartGroup;

    private bottomContainer: IBottomContainer;
    private mobileTooltip: Selection;
    private valueFormatter: Function;
    private commaNumberFormatter: Function;
    private timeFormatter: Function;
    private dataBisector: Function;

    private chartLeftMargin = 35;
    private touchEventsEnabled: boolean = false;
    private viewport: IViewport;
    private localizationManager: ILocalizationManager;

    private axisNumberFormatter;

    private static DefaultTitleSizes = {
        "super-small": 10,
        "extra-small": 10,
        "small": 12,
        "medium": 14,
        "large": 16
    };

    private static DefaultValueSizes = {
        "super-small": 14,
        "extra-small": 14,
        "small": 26,
        "medium": 32,
        "large": 40
    };

    private static INVISIBLE: string = "invisible";

    private static OPACITY_MIN: number = 0;
    private static OPACITY_MAX: number = 100;

    private titleSize: number = 0;
    private dispatch: any;

    private colorPalette: IColorPalette;
    private colorHelper: ColorHelper;

    constructor(options: VisualConstructorOptions) {
        this.init(options);
    }

    private init(options: VisualConstructorOptions): void {
        this.target = options.element;
        this.size = DualKpiSize.small;
        this.sizeCssClass = "small";
        this.valueFormatter = d3.format(".3s");
        this.axisNumberFormatter = d3.format(".2s");
        this.commaNumberFormatter = d3.format(",");
        this.timeFormatter = d3.timeFormat("%m/%d/%y");
        this.dataBisector = d3.bisector((d: IDualKpiDataPoint) => { return d.date; }).left;
        this.dispatch = d3.dispatch("onDualKpiMouseMove", "onDualKpiMouseOut");
        this.localizationManager = options.host.createLocalizationManager();

        this.colorPalette = options.host.colorPalette;
        this.colorHelper = new ColorHelper(this.colorPalette);

        this.initContainer();
        this.initMouseEvents();
    }

    private initMouseEvents(): void {
        let dispatch = this.dispatch;
        let target = this.target;
        let targetElement = d3.select(target);

        let onMouseMove = function (e: any) {
            dispatch.call("onDualKpiMouseMove", this, d3.mouse(target));
        };

        targetElement.on("mousemove", onMouseMove);
        targetElement.on("mouseout", onMouseMove);
        targetElement.on("touchmove", onMouseMove);
        targetElement.on("touchstart", onMouseMove);

        let onMouseOut = function (e: any) {
            dispatch.call("onDualKpiMouseOut", this);
        };

        targetElement.on("mouseleave", onMouseOut);
        targetElement.on("touchleave", onMouseOut);
    }

    private initContainer(): void {
        const xmlns = "http://www.w3.org/2000/svg";
        let svgElem = document.createElementNS(xmlns, "svg");

        let svgRoot = this.svgRoot = d3.select(svgElem);

        svgRoot
            .attr("class", "dualKpi");

        this.chartGroupTop = this.createChartGroup(svgRoot, DualKpiChartPositionType.top);
        this.chartGroupBottom = this.createChartGroup(svgRoot, DualKpiChartPositionType.bottom);

        this.bottomContainer = this.createBottomContainer(svgRoot);

        this.target.appendChild(svgElem);
    }

    private createBottomContainer(svgRoot: Selection): IBottomContainer {
        let bottomContainer = svgRoot
            .append("g")
            .attr("class", "bottom-title-container")
            .classed("invisible", true);

        let chartTitleElement = bottomContainer
            .append("text")
            .classed("title", true);

        let warningGroup = bottomContainer
            .append("g")
            .classed("warning-group", true);

        let warningIcon = warningGroup
            .append("path")
            .classed("warning-icon", true);

        let warningTitle = warningGroup
            .append("title")
            .classed("warning-title", true);

        let infoGroup = bottomContainer
            .append("g")
            .classed("info-group", true);

        let infoIcon = infoGroup
            .append("path")
            .classed("info-icon", true);

        let infoTitle = infoIcon
            .append("title")
            .classed("info-title", true);

        let dateRangeText = bottomContainer
            .append("text")
            .classed("date-range-text", true)
            .attr("text-anchor", "end");

        return {
            bottomContainer: bottomContainer,
            chartTitleElement: chartTitleElement,
            warning: {
                group: warningGroup,
                icon: warningIcon,
                title: warningTitle
            },
            info: {
                group: infoGroup,
                icon: infoIcon,
                title: infoTitle
            },
            dateRangeText: dateRangeText
        };
    }

    private createChartGroup(svgRoot: Selection, type: DualKpiChartPositionType): IChartGroup {
        let chartGroup: Selection = svgRoot
            .append("g")
            .attr("class", "chartGroup")
            .classed(type === DualKpiChartPositionType.top ? "chartGroupTop" : "chartGroupBottom", true);

        let chartArea = chartGroup
            .append("path")
            .attr("class", "area");

        let yAxis = chartGroup
            .append("g")
            .attr("class", "axis");

        let hoverLine = chartGroup
            .append("line")
            .attr("class", "hoverLine");

        let hoverDataContainer: IHoverDataContainer = this.createHoverDataContainer(chartGroup);
        let chartOverlay: IChartOverlay = this.createChartOverlay(chartGroup);

        let zeroAxis = chartGroup
            .append("path")
            .attr("class", "zero-axis");

        return {
            group: chartGroup,
            area: chartArea,
            yAxis: yAxis,
            hoverLine,
            hoverDataContainer: hoverDataContainer,
            chartOverlay: chartOverlay,
            zeroAxis: zeroAxis
        };
    }

    private createChartOverlay(chartGroup: Selection): IChartOverlay {
        let chartOverlayTextGroup = chartGroup
            .append("g")
            .classed("group", true);

        let title = chartOverlayTextGroup
            .append("text")
            .classed("data-title", true)
            .attr("text-anchor", "middle");

        let text = chartOverlayTextGroup
            .append("text")
            .classed("data-value", true)
            .attr("text-anchor", "middle");

        // this rect is always invisible, used for capture mouse and touch events
        let chartOverlayRect = chartOverlayTextGroup
            .append("rect")
            .attr("style", "stroke: none; fill: #000;opacity:0;");

        let rectTitle = chartOverlayTextGroup
            .append("title");

        return {
            group: chartOverlayTextGroup,
            title: title,
            text: text,
            rect: chartOverlayRect,
            rectTitle: rectTitle
        };
    }

    private static getChartSize(viewport: IViewport): DualKpiSize {
        const height: number = viewport.height,
            width: number = viewport.width;

        if (width < 215 || height < 110) {
            return DualKpiSize.supersmall;
        }

        if (width < 245 || height < 130) {
            return DualKpiSize.extrasmall;
        }

        if (width < 350 || height < 280) {
            return DualKpiSize.small;
        }

        if (width < 450 || height < 450) {
            return DualKpiSize.medium;
        }

        return DualKpiSize.large;
    }

    public update(options: VisualUpdateOptions) {
        let dataView: DataView = this.dataView = options.dataViews && options.dataViews[0];

        if (!dataView ||
            !dataView.metadata ||
            !dataView.metadata.columns) {

            this.displayRootElement(false);

            return;
        }

        let isFirstUpdate = !!this.data,
            data: IDualKpiData = this.data = DualKpi.converter(this.dataView, isFirstUpdate, this.localizationManager, this.colorHelper);

        let availableHeight = options.viewport.height < 90 ? 90 : options.viewport.height,
            availableWidth = options.viewport.width < 220 ? 220 : options.viewport.width,
            chartWidth = availableWidth,
            chartSpaceBetween, chartTitleSpace, iconOffset;

        let size: DualKpiSize = DualKpi.getChartSize({ height: availableHeight, width: availableWidth });

        switch (size) {
            case DualKpiSize.large:
                this.size = DualKpiSize.large;
                this.sizeCssClass = "large";
                iconOffset = -1;
                chartSpaceBetween = 25;
                chartTitleSpace = 46;
                break;
            case DualKpiSize.medium:
                this.size = DualKpiSize.medium;
                this.sizeCssClass = "medium";
                iconOffset = -8;
                chartSpaceBetween = 20;
                chartTitleSpace = 30;
                break;
            case DualKpiSize.small:
                this.size = DualKpiSize.small;
                this.sizeCssClass = "small";
                iconOffset = -6;
                chartSpaceBetween = 15;
                chartTitleSpace = 22;
                break;
            case DualKpiSize.extrasmall:
                this.size = DualKpiSize.extrasmall;
                this.sizeCssClass = "extra-small";
                iconOffset = -8;
                chartSpaceBetween = 12;
                chartTitleSpace = 20;
                break;
            case DualKpiSize.supersmall:
                this.size = DualKpiSize.supersmall;
                this.sizeCssClass = "super-small";
                iconOffset = -8;
                chartSpaceBetween = 10;
                chartTitleSpace = 18;
                break;
            default:
                break;
        }

        this.titleSize = DualKpi.DefaultTitleSizes[this.sizeCssClass];

        this.updateViewport({
            width: availableWidth,
            height: availableHeight
        });

        let chartHeight = (availableHeight - (chartSpaceBetween + chartTitleSpace)) / 2;
        let topChartAxisConfig = { min: data.settings.dualKpiAxis.topChartAxisMin, max: data.settings.dualKpiAxis.topChartAxisMax };
        let bottomChartAxisConfig = { min: data.settings.dualKpiAxis.bottomChartAxisMin, max: data.settings.dualKpiAxis.bottomChartAxisMax };

        let topChartPercentChangeStartPoint = DualKpi.getPercentChangeStartPoint(data.topValues, data.topPercentCalcDate);
        let bottomChartPercentChangeStartPoint = DualKpi.getPercentChangeStartPoint(data.bottomValues, data.bottomPercentCalcDate);

        const wasDataSetRendered: boolean = data.topValues.length > 0 || data.bottomValues.length > 0;

        this.displayRootElement(wasDataSetRendered);

        if (data.settings.dualKpiProperties.topChartShow) {
            this.chartGroupTop.group.classed(DualKpi.INVISIBLE, false);
            this.chartGroupTop.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);

            if (data.topValues.length > 0) {
                this.drawChart({
                    element: this.chartGroupTop,
                    abbreviateValue: data.settings.dualKpiProperties.abbreviateValues,
                    abbreviateHoverValue: data.settings.dualKpiProperties.abbreviateHoverValues,
                    hoverDataPercentType: data.settings.dualKpiProperties.hoverDataPercentType,
                    axisConfig: topChartAxisConfig,
                    chartData: data.topValues,
                    chartTitle: data.topChartName,
                    chartType: data.settings.dualKpiChart.topChartType,
                    height: data.settings.dualKpiProperties.bottomChartShow && data.settings.dualKpiProperties.topChartShow ? chartHeight : chartHeight * 2 + chartSpaceBetween,
                    percentChangeStartPoint: topChartPercentChangeStartPoint,
                    showZeroLine: data.settings.dualKpiAxis.topChartZeroLine,
                    tooltipText: data.settings.dualKpiProperties.topChartToolTipText,
                    top: 0,
                    valueAsPercent: data.topValueAsPercent,
                    width: chartWidth,
                    position: DualKpiChartPositionType["top"],
                    showTextOverlay: data.settings.dualKpiValues.show,
                    showDefaultTextOverlay: !data.settings.dualKpiValues.showKpiValuesTop,
                    defaultTextOverlay: data.settings.dualKpiValues.topChartDefaultKpiValue,
                    fontSizeAutoFormattingTitle: data.settings.dualKpiTitleFormatting.fontSizeAutoFormatting,
                    fontSizeAutoFormattingValue: data.settings.dualKpiValueFormatting.fontSizeAutoFormatting,
                    titleFontSize: data.settings.dualKpiTitleFormatting.fontSize,
                    valueFontSize: data.settings.dualKpiValueFormatting.fontSize,
                    isBoldTitle: data.settings.dualKpiTitleFormatting.isBold,
                    isBoldValue: data.settings.dualKpiValueFormatting.isBold,
                    isItalicTitle: data.settings.dualKpiTitleFormatting.isItalic,
                    isItalicValue: data.settings.dualKpiValueFormatting.isItalic,
                    fontFamilyTitle: data.settings.dualKpiTitleFormatting.fontFamily,
                    fontFamilyValue: data.settings.dualKpiValueFormatting.fontFamily
                });
            }
        } else {
            this.chartGroupTop.group.classed(DualKpi.INVISIBLE, true);
            this.chartGroupTop.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);
        }

        if (data.settings.dualKpiProperties.bottomChartShow) {
            // draw bottom chart
            this.chartGroupBottom.group.classed(DualKpi.INVISIBLE, false);
            this.chartGroupBottom.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);

            if (data.bottomValues.length > 0) {
                this.drawChart({
                    element: this.chartGroupBottom,
                    abbreviateValue: data.settings.dualKpiProperties.abbreviateValues,
                    abbreviateHoverValue: data.settings.dualKpiProperties.abbreviateHoverValues,
                    hoverDataPercentType: data.settings.dualKpiProperties.hoverDataPercentType,
                    axisConfig: bottomChartAxisConfig,
                    chartData: data.bottomValues,
                    chartTitle: data.bottomChartName,
                    chartType: data.settings.dualKpiChart.bottomChartType,
                    height: data.settings.dualKpiProperties.bottomChartShow && data.settings.dualKpiProperties.topChartShow ? chartHeight : chartHeight * 2 + chartSpaceBetween,
                    percentChangeStartPoint: bottomChartPercentChangeStartPoint,
                    showZeroLine: data.settings.dualKpiAxis.bottomChartZeroLine,
                    tooltipText: data.settings.dualKpiProperties.bottomChartToolTipText,
                    top: data.settings.dualKpiProperties.bottomChartShow && data.settings.dualKpiProperties.topChartShow ? chartHeight + chartSpaceBetween : 0,
                    valueAsPercent: data.bottomValueAsPercent,
                    width: chartWidth,
                    position: DualKpiChartPositionType["bottom"],
                    showTextOverlay: data.settings.dualKpiValues.show,
                    showDefaultTextOverlay: !data.settings.dualKpiValues.showKpiValuesBottom,
                    defaultTextOverlay: data.settings.dualKpiValues.bottomChartDefaultKpiValue,
                    fontSizeAutoFormattingTitle: data.settings.dualKpiTitleFormatting.fontSizeAutoFormatting,
                    fontSizeAutoFormattingValue: data.settings.dualKpiValueFormatting.fontSizeAutoFormatting,
                    titleFontSize: data.settings.dualKpiTitleFormatting.fontSize,
                    valueFontSize: data.settings.dualKpiValueFormatting.fontSize,
                    isBoldTitle: data.settings.dualKpiTitleFormatting.isBold,
                    isBoldValue: data.settings.dualKpiValueFormatting.isBold,
                    isItalicTitle: data.settings.dualKpiTitleFormatting.isItalic,
                    isItalicValue: data.settings.dualKpiValueFormatting.isItalic,
                    fontFamilyTitle: data.settings.dualKpiTitleFormatting.fontFamily,
                    fontFamilyValue: data.settings.dualKpiValueFormatting.fontFamily
                });
            }
        } else {
            this.chartGroupBottom.group.classed(DualKpi.INVISIBLE, true);
            this.chartGroupBottom.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);
        }

        if (wasDataSetRendered) {
            this.drawBottomContainer(chartWidth, chartHeight, chartTitleSpace, chartSpaceBetween, iconOffset);
        }
    }

    private displayRootElement(isRootElementVisible: boolean = true): void {
        if (!this.svgRoot) {
            return;
        }

        const display: string = isRootElementVisible
            ? null
            : "none";

        this.svgRoot.style("display", display);
    }

    private updateViewport(viewport: IViewport): void {
        if (!this.viewport || (this.viewport.width !== viewport.width) || (this.viewport.height !== viewport.height)) {
            this.svgRoot
                .attr("width", viewport.width)
                .attr("height", viewport.height);
        }

        this.viewport = viewport;
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        const instances: VisualObjectInstance[] = (DualKpiSettings.enumerateObjectInstances(this.data.settings || DualKpiSettings.getDefault(), options) as VisualObjectInstanceEnumerationObject).instances;

        switch (options.objectName) {
            case "dualKpiColorsBottom": {
                if (this.data.settings.dualKpiColorsBottom.matchTopChartOptions
                    && instances
                    && instances[0]
                    && instances[0].properties
                ) {
                    delete instances[0].properties["dataColor"];
                    delete instances[0].properties["textColor"];
                    delete instances[0].properties["opacity"];
                }

                break;
            }
            case "dualKpiTitleFormatting": {
                if (this.data.settings.dualKpiTitleFormatting.fontSizeAutoFormatting) {
                    delete instances[0].properties["fontSize"];
                }

                break;
            }
            case "dualKpiValueFormatting": {
                if (this.data.settings.dualKpiValueFormatting.fontSizeAutoFormatting) {
                    delete instances[0].properties["fontSize"];
                }

                break;
            }
        }

        return instances || [];
    }

    private static validateOpacity(opacity: number): number {
        if (opacity < this.OPACITY_MIN) {
            return this.OPACITY_MIN;
        } else if (opacity > this.OPACITY_MAX) {
            return this.OPACITY_MAX;
        } else {
            return opacity;
        }
    }

    private static getDaysBetween(date1: Date, date2: Date): number {
        let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        let dayRange = Math.round(Math.abs(date1.getTime() - date2.getTime()) / oneDay);
        return dayRange;
    }

    private static percentFormatter(value: number, showPlusMinus?: boolean): string {
        let prefix = value >= 0 ? "+" : "",
            valueString = (Math.floor(value * 10) / 10) + "%";

        if (showPlusMinus) {
            valueString = prefix + valueString;
        }

        return valueString;
    }

    private static getPercentChange(startValue: number, endValue: number): string {
        if (startValue === 0) {
            return "n/a";
        }

        let diff = endValue - startValue;
        let percentChange = Math.abs(diff / startValue);

        if (endValue < startValue) {
            percentChange = percentChange * -1;
        }

        return this.percentFormatter(percentChange * 100, true);
    }

    private static getPercentChangeStartPoint(chartData: Array<IDualKpiDataPoint>, percentCalcDate: Date): IDualKpiDataPoint {
        if (percentCalcDate !== null) {
            let closestIndex = 0,
                percentCalcDateTime = percentCalcDate.getTime(),
                i, currTime;

            // keep track of closest date to configured date
            // as soon as we find a date that is more recent than configured date
            // break and use the last date that was older than configured date.
            // always break if we find a date that is exactly equal
            for (i = 0; i < chartData.length; i++) {
                currTime = chartData[i].date.getTime();

                if (currTime === percentCalcDateTime) {
                    closestIndex = i;
                    break;
                }
                else if (currTime < percentCalcDateTime) {
                    closestIndex = i;
                }
                else {
                    break;
                }
            }
            return chartData[closestIndex];
        }

        return chartData[0];
    }

    private static getFormatSymbol(format: string): string {
        let symbolPatterns: string[] = [
            "[$]",      // dollar sign
            "[€]",      // euro sign
            "[£]",      // british pound sign
            "[¥]",      // yen / yuan sign
            "[₩]",      // korean won sign
            "[%]",      // percent sign
        ];

        let symbolMatcher: RegExp = new RegExp(symbolPatterns.join("|"), "g");

        let match = symbolMatcher.exec(format);

        if (!match) {
            return undefined;
        }
        else {
            return match[0];
        }
    }

    private static parseSettings(dataView: DataView, isFirstUpdate: boolean, localizationManager: ILocalizationManager, colorHelper: ColorHelper): DualKpiSettings {
        let settings: DualKpiSettings = DualKpiSettings.parse<DualKpiSettings>(dataView);

        if (isFirstUpdate) {
            settings.dualKpiProperties.titleText = localizationManager.getDisplayName("Visual_Default_Title");
            settings.dualKpiProperties.warningTooltipText = localizationManager.getDisplayName("Visual_Default_WarningTooltipText");
        }

        settings.dualKpiColors.opacity = DualKpi.validateOpacity(settings.dualKpiColors.opacity);
        settings.dualKpiColorsBottom.opacity = DualKpi.validateOpacity(settings.dualKpiColorsBottom.opacity);

        settings.dualKpiColors.dataColor = colorHelper.getHighContrastColor("foreground", settings.dualKpiColors.dataColor);
        settings.dualKpiColors.textColor = colorHelper.getHighContrastColor("foreground", settings.dualKpiColors.textColor);
        settings.dualKpiColorsBottom.dataColor = colorHelper.getHighContrastColor("foreground", settings.dualKpiColorsBottom.dataColor);
        settings.dualKpiColorsBottom.textColor = colorHelper.getHighContrastColor("foreground", settings.dualKpiColorsBottom.textColor);

        return settings;
    }

    private static converter(dataView: DataView, isFirstUpdate: boolean, localizationManager: ILocalizationManager, colorHelper: ColorHelper): IDualKpiData {
        let data = {} as IDualKpiData;
        let topValueFormatSymbol = "";
        let bottomValueFormatSymbol = "";
        data.settings = DualKpi.parseSettings(dataView, isFirstUpdate, localizationManager, colorHelper);

        if (data.settings.dualKpiColorsBottom.matchTopChartOptions) {
            data.settings.dualKpiColorsBottom.dataColor = data.settings.dualKpiColors.dataColor;
            data.settings.dualKpiColorsBottom.opacity = data.settings.dualKpiColors.opacity;
            data.settings.dualKpiColorsBottom.textColor = data.settings.dualKpiColors.textColor;
        }

        data.topValues = [];
        data.bottomValues = [];

        let axisCol = -1, topValuesCol = -1, bottomValuesCol = -1, warningStateCol = -1,
            topPercentDateCol = -1, bottomPercentDateCol = -1;

        const categories = dataView.categorical.categories;
        for (let i: number = 0; i < categories.length; i++) {
            let col: DataViewCategoryColumn = categories[i];
            if (col.source && col.source.roles) {
                if (col.source.roles["axis"]) {
                    axisCol = i;
                }
                if (col.source.roles["toppercentdate"]) {
                    topPercentDateCol = i;
                }
                if (col.source.roles["bottompercentdate"]) {
                    bottomPercentDateCol = i;
                }
            }
        }

        const values = dataView.categorical.values;
        for (let i: number = 0; i < values.length; i++) {
            let col: DataViewValueColumn = values[i];
            if (col.source && col.source.roles) {
                if (col.source.roles["topvalues"]) {
                    topValuesCol = i;
                    data.topChartName = col.source.displayName;
                    topValueFormatSymbol = this.getFormatSymbol(col.source.format);
                }
                if (col.source.roles["bottomvalues"]) {
                    bottomValuesCol = i;
                    data.bottomChartName = col.source.displayName;
                    bottomValueFormatSymbol = this.getFormatSymbol(col.source.format);
                }
                if (col.source.roles["warningstate"]) {
                    warningStateCol = i;
                }
            }
        }

        const rowsLength = categories.length > 0 ? categories[0].values.length : (values.length > 0 ? values[0].values.length : 0);

        data.topValueAsPercent = topValueFormatSymbol === "%" ? true : false;
        data.bottomValueAsPercent = bottomValueFormatSymbol === "%" ? true : false;

        // if percent dates are in data use that, otherwise get from formatting pane/default values
        data.topPercentCalcDate = topPercentDateCol > -1 && categories[topPercentDateCol].values[0] ? new Date(<any>categories[topPercentDateCol].values[0]) : new Date(data.settings.dualKpiProperties.topPercentCalcDate);
        data.bottomPercentCalcDate = bottomPercentDateCol > -1 && categories[bottomPercentDateCol].values[0] ? new Date(<any>categories[bottomPercentDateCol].values[0]) : new Date(data.settings.dualKpiProperties.bottomPercentCalcDate);

        for (let i: number = 0; i < rowsLength; i++) {
            let date = null;

            if (axisCol > -1) {
                let timestamp: number = Date.parse(<any>categories[axisCol].values[i]);

                if (!isNaN(timestamp)) {
                    date = new Date(timestamp);
                } else {
                    continue;
                }
            } else {
                date = new Date();
            }

            let topValue = topValuesCol > -1 ? <any>values[topValuesCol].values[i] : 0;
            let bottomValue = bottomValuesCol > -1 ? <any>values[bottomValuesCol].values[i] : 0;

            if (data.topValueAsPercent) {
                topValue *= 100;
            }

            if (data.bottomValueAsPercent) {
                bottomValue *= 100;
            }

            data.topValues.push({
                date: date,
                value: topValue
            });

            data.bottomValues.push({
                date: date,
                value: bottomValue
            });
        }

        if ((warningStateCol > -1) && (rowsLength > 0)) {
            data.warningState = <any>values[warningStateCol].values[rowsLength - 1];
        }

        const sortBy = (key) => {
            return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
        };

        data.topValues.sort(sortBy("date"));
        data.bottomValues.sort(sortBy("date"));
        return data;
    }

    private createHoverDataContainer(chartGroup: Selection): IHoverDataContainer {
        let hoverDataContainer = chartGroup.append("g")
            .attr("class", "hover-data-container")
            .classed(DualKpi.INVISIBLE, true);

        let date = hoverDataContainer.append("text")
            .attr("class", "hover-text date")
            .text("0");

        let text = hoverDataContainer.append("text")
            .attr("class", "hover-text value")
            .attr("text-anchor", "middle")
            .text("0");

        let percent = hoverDataContainer.append("text")
            .attr("class", "hover-text percent")
            .attr("text-anchor", "end")
            .text("0");

        return {
            container: hoverDataContainer,
            date: date,
            text: text,
            percent: percent
        };
    }

    private updateHoverDataContainer(hoverDataContainer: IHoverDataContainer, chartBottom: number, chartLeft: number, chartWidth: number, isTopChart: boolean): void {
        const textColor: string = isTopChart ? this.data.settings.dualKpiColors.textColor : this.data.settings.dualKpiColorsBottom.textColor;
        let hoverDate: Selection = hoverDataContainer.date;
        let centerX = chartWidth / 2;

        if (chartWidth < 300) {
            centerX *= 0.85;
        }

        hoverDate
            .attr("class", "hover-text date")
            .classed(this.sizeCssClass, true)
            .attr("fill", textColor)
            .text("0");

        let hoverValue: Selection = hoverDataContainer.text;
        hoverValue
            .attr("class", "hover-text value")
            .classed(this.sizeCssClass, true)
            .attr("transform", `translate(${centerX},0)`)
            .attr("fill", textColor)
            .text("0");

        let hoverPercent: Selection = hoverDataContainer.percent;
        hoverPercent
            .attr("class", "hover-text percent")
            .classed(this.sizeCssClass, true)
            .text("0")
            .attr("fill", textColor)
            .attr("transform", "translate(" + (chartWidth) + ",0)");

        hoverDataContainer.container
            .attr("transform", "translate(" + 0 + "," + (chartBottom + this.titleSize - 2) + ")");
    }

    private showHoverData(hoverDataContainer: IHoverDataContainer, dataPoint: IDualKpiDataPoint, latestValue: number, hoverDataPercentType: PercentType, valueAsPercent: boolean, abbreviateValue: boolean) {
        let hoverDate: Selection = hoverDataContainer.date;
        hoverDate
            .datum(dataPoint)
            .text((d: IDualKpiDataPoint) => this.timeFormatter(d.date));

        let hoverValue: Selection = hoverDataContainer.text;
        hoverValue
            .datum(dataPoint)
            .text((d: IDualKpiDataPoint) => {
                let value = abbreviateValue ? this.valueFormatter(d.value) : this.commaNumberFormatter(Math.round(d.value));
                if (valueAsPercent) {
                    return DualKpi.percentFormatter(d.value);
                }
                return value;
            });

        let hoverPercent: Selection = hoverDataContainer.percent;
        hoverPercent
            .datum(dataPoint)
            .text((d: IDualKpiDataPoint) => {
                if (valueAsPercent) {
                    let value: number = hoverDataPercentType === PercentType.lastDate ? latestValue - d.value
                        : d.value - latestValue;

                    return DualKpi.percentFormatter(value);
                }
                let leftValue: number = hoverDataPercentType === PercentType.lastDate ? d.value : latestValue,
                    rightValue: number = hoverDataPercentType === PercentType.lastDate ? latestValue : d.value;

                return DualKpi.getPercentChange(leftValue, rightValue);
            });

        this.bottomContainer.bottomContainer.classed("hidden", true);
        hoverDataContainer.container.classed(DualKpi.INVISIBLE, false);
    }

    private hideHoverData(hoverDataContainer: IHoverDataContainer, hoverLine?: Selection) {
        hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);
        this.bottomContainer.bottomContainer.classed("hidden", false);
        if (hoverLine) {
            hoverLine.classed(DualKpi.INVISIBLE, true);
        }
    }

    /*
    *   to show tooltip information on mobile we show a popup on touch event
    */
    private showMobileTooltip(message: string) {
        if (!this.mobileTooltip) {
            this.mobileTooltip = d3.select(this.target).append("div")
                .classed("hidden", true)
                .classed("mobile-tooltip", true);

            this.svgRoot.on("touchstart", () => {
                this.hideMobileTooltip();
            });

            this.mobileTooltip.on("touchstart", () => {
                this.hideMobileTooltip();
            });

            this.touchEventsEnabled = true;
        }
        // prevent hide from being called, and prevent hover interaction from occuring on same event
        (d3.event as TouchEvent).stopPropagation();

        this.mobileTooltip.text(message);
        this.mobileTooltip.classed("hidden", false);
    }

    private hideMobileTooltip() {
        this.mobileTooltip.classed("hidden", true);
    }

    private drawBottomContainer(chartWidth: number, chartHeight: number, chartTitleSpace: number, chartSpaceBetween: number, iconOffset: number): void {
        let infoIconShowing = false;

        let chartTitleElement = this.bottomContainer.chartTitleElement
            .attr("class", "title")
            .classed(this.sizeCssClass, true)
            .text(this.data.settings.dualKpiProperties.titleText);

        let iconWidth = 22;
        let iconScaleTransform = "";
        let iconY = (-chartTitleSpace + (chartTitleSpace / 2) + iconOffset);

        if (this.size === DualKpiSize.small || this.size === DualKpiSize.extrasmall || this.size === DualKpiSize.supersmall) {
            iconScaleTransform = "scale(0.75)";
            iconWidth = 16;
        }

        // add warning icon
        if (this.data.warningState < 0) {
            this.createWarningMessage(chartTitleElement, iconY, iconScaleTransform, iconWidth);
        }

        // add info icon
        if (this.data.topValues.length > 0) {
            let today = new Date();
            let dataDaysOld = DualKpi.getDaysBetween(this.data.topValues[this.data.topValues.length - 1].date, today);
            if (dataDaysOld >= this.data.settings.dualKpiProperties.staleDataThreshold && this.data.settings.dualKpiProperties.showStaleDataWarning) {
                infoIconShowing = true;
                this.createInfoMessage(iconY, iconScaleTransform, iconWidth, chartWidth, dataDaysOld);
            } else {
                this.hideInfoMessage();
            }

            // add day range text
            let dayRange = DualKpi.getDaysBetween(this.data.topValues[0].date, this.data.topValues[this.data.topValues.length - 1].date);
            let dayRangeElement = this.bottomContainer.dateRangeText;
            dayRangeElement
                .attr("class", "date-range-text")
                .classed(this.sizeCssClass, true)
                .text(this.localizationManager.getDisplayName("Visual_BottomContainerText_Last") + dayRange + this.localizationManager.getDisplayName("Visual_BottomContainerText_Days"));

            let dayRangeLeft = chartWidth - 8;
            if (infoIconShowing) {
                dayRangeLeft -= (iconWidth); // width of icon + 8px padding
            }
            dayRangeElement.attr("transform", "translate(" + (dayRangeLeft) + ",0)");
        }

        this.bottomContainer.bottomContainer.attr("transform", "translate(5," + (this.viewport.height - 5) + ")");
        this.bottomContainer.bottomContainer.classed(DualKpi.INVISIBLE, false);
    }

    private createWarningMessage(chartTitleElement, iconY: number, iconScaleTransform: any, iconWidth: number) {
        let warning = this.bottomContainer.warning;
        warning.group
            .attr("transform", "translate(0," + (iconY) + ")");

        let warningIcon = warning.icon;
        warningIcon
            .attr("d", "M24,24H8l8-16L24,24z M9.7,23h12.6L16,10.4L9.7,23z M16.5,19.8h-1v-5.4h1V19.8z M16.5,20.8v1.1h-1v-1.1H16.5z")
            .attr("fill", "#E81123")
            .attr("stroke", "transparent")
            .attr("stroke-width", "5")
            .attr("class", "warning-icon")
            .attr("transform", iconScaleTransform)
            .classed(this.sizeCssClass, true);

        let warningTitle = warning.title;
        warningTitle
            .text(this.data.settings.dualKpiProperties.warningTooltipText);

        // move title over to account for icon
        chartTitleElement.attr("transform", "translate(" + (iconWidth + 6) + ",0)");

        warning.group.on("touchstart", () => this.showMobileTooltip(this.data.settings.dualKpiProperties.warningTooltipText));
    }

    private createInfoMessage(iconY: number, iconScaleTransform: any, iconWidth: number, chartWidth: number, dataDaysOld: number) {
        let infoMessage = this.localizationManager.getDisplayName("Visual_InfoMessage_DataIs") + dataDaysOld
            + this.localizationManager.getDisplayName("Visual_InfoMessage_DaysOld") + this.data.settings.dualKpiProperties.staleDataTooltipText;
        let info = this.bottomContainer.info;
        info.group
            .attr("transform", "translate(" + (chartWidth - iconWidth - 8) + "," + (iconY) + ")");

        let infoIcon = info.icon;
        infoIcon
            .attr("d", "M24,16c0,1.4-0.4,2.8-1,4c-0.7,1.2-1.7,2.2-2.9,2.9c-1.2,0.7-2.5,1-4,1s-2.8-0.4-4-1c-1.2-0.7-2.2-1.7-2.9-2.9 C8.4,18.8,8,17.4,8,16c0-1.5,0.4-2.8,1.1-4c0.8-1.2,1.7-2.2,2.9-2.9S14.6,8,16,8s2.8,0.3,4,1.1c1.2,0.7,2.2,1.7,2.9,2.9 C23.6,13.2,24,14.5,24,16z M12.6,22c1.1,0.6,2.2 0.9,3.4,0.9s2.4-0.3,3.5-0.9c1-0.6,1.9-1.5,2.5-2.6c0.6-1,1-2.2,1-3.4 s-0.3-2.4-1-3.5s-1.5-1.9-2.5-2.5c-1.1-0.6-2.2-1-3.5-1s-2.4,0.4-3.4,1c-1.1,0.6-1.9,1.4-2.6,2.5c-0.6,1.1-0.9,2.2-0.9,3.5 c0,1.2,0.3,2.4,0.9,3.4C10.6,20.5,11.4,21.4,12.6,22z M16.5,17.6h-1v-5.4h1V17.6z M16.5 19.7h-1v-1.1h1V19.7z")
            .attr("fill", "#3599B8")
            .attr("stroke", "transparent")
            .attr("stroke-width", "5")
            .attr("class", "info-icon")
            .attr("transform", iconScaleTransform)
            .classed(this.sizeCssClass, true)
            .classed("hidden", false);

        let infoTitle = info.title;
        infoTitle
            .text(infoMessage);

        info.group.on("touchstart", () => this.showMobileTooltip(infoMessage));
    }

    private hideInfoMessage() {
        let info = this.bottomContainer.info;
        info.icon.classed("hidden", true);
    }

    private drawChart(options: IDualKpiOptions) {
        let chartData: Array<IDualKpiDataPoint> = options.chartData;
        let axisConfig: IAxisConfig = options.axisConfig;
        const latestValue: number = chartData[chartData.length - 1].value,
            isTopChart: boolean = options.position === DualKpiChartPositionType.top,
            dataColor: string = isTopChart ? this.data.settings.dualKpiColors.dataColor : this.data.settings.dualKpiColorsBottom.dataColor,
            chartOpacity: number = isTopChart ? this.data.settings.dualKpiColors.opacity : this.data.settings.dualKpiColorsBottom.opacity,
            axisStrokeHighContrastColor: string = this.colorHelper.getHighContrastColor("foreground", this.data.settings.dualKpiColors.textColor),
            isHighContrastMode: boolean = this.colorHelper.isHighContrast,
            hoverLineStrokeColor: string = "#777";

        let target = this.target;
        let targetPadding = parseInt(jQuery(target).css("padding-left"), 10) || 0;

        let margin = {
            top: 7,
            right: 0,
            bottom: 0,
            left: this.chartLeftMargin
        };

        if (this.size === DualKpiSize.medium || this.size === DualKpiSize.large) {
            margin.left = 40;
        }

        let calcWidth = options.width - margin.right - margin.left,
            calcHeight = options.height - margin.top - margin.bottom,
            minValue = d3.min(chartData, (d) => d.value) || 0,
            maxValue = d3.max(chartData, (d) => d.value) || 0;

        let axisMinValue = axisConfig.min !== null && axisConfig.min !== undefined ? axisConfig.min : minValue;
        let axisMaxValue = axisConfig.max !== null && axisConfig.max !== undefined ? axisConfig.max : maxValue;

        let xScale = d3.scaleTime()
            .domain(d3.extent(chartData, (d) => d.date))
            .range([0, calcWidth]);

        let yScale = d3.scaleLinear()
            .domain([axisMinValue, axisMaxValue])
            .clamp(true)
            .range([calcHeight, 0]);

        let yAxis = d3.axisLeft(yScale)
            .tickValues([axisMinValue, axisMaxValue])
            .tickFormat((d) => {
                let axisTickLabel: string = String(this.axisNumberFormatter(d));
                if (options.valueAsPercent) {
                    axisTickLabel = axisTickLabel + "%";
                }
                return axisTickLabel;
            });

        let seriesRenderer, fill, stroke, strokeWidth;

        if (options.chartType === "area") {
            seriesRenderer = d3.area()
                .x((d: any) => xScale(d.date || new Date()))
                .y0(calcHeight)
                .y1((d: any) => yScale(d.value || 0));

            fill = dataColor;
            stroke = "none";
            strokeWidth = 0;
        } else {
            seriesRenderer = d3.line()
                .x((d: any) => xScale(d.date || new Date()))
                .y((d: any) => yScale(d.value || 0));

            fill = "none";
            stroke = dataColor;
            strokeWidth = 2;
        }

        let chartGroup: IChartGroup = options.element;
        chartGroup.group
            .attr("transform", "translate(" + margin.left + "," + (options.top + margin.top) + ")");

        let chartArea: Selection = chartGroup.area;
        chartArea
            .datum(chartData)
            .attr("style", "opacity: " + (chartOpacity / 100))
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("d", seriesRenderer as any);

        let zeroAxis: Selection = chartGroup.zeroAxis;
        let zeroPointOnAxis = axisMinValue <= 0 && axisMaxValue >= 0 ? true : false;

        // DRAW line for x axis at zero position
        // if formatting option for zero line set to true
        // and if a value of zero is on the y-axis
        if (options.showZeroLine && zeroPointOnAxis) {
            let axisLine = d3.line()
                .x((d: any) => xScale(d.date))
                .y((d: any) => yScale(0));

            zeroAxis
                .datum(chartData)
                .classed("hidden", false)
                .attr("d", axisLine as any);
        } else {
            zeroAxis
                .classed("hidden", true);
        }

        let axis: Selection = chartGroup.yAxis;
        axis
            .attr("class", "axis")
            .classed(this.sizeCssClass, true)
            .classed("axis-colored", !isHighContrastMode)
            .call(yAxis);

        if (isHighContrastMode) {
            let axisTicks: Selection = axis.selectAll("g.tick");
            axisTicks.selectAll("text").attr("fill", axisStrokeHighContrastColor);
            axisTicks.select("line").attr("stroke", axisStrokeHighContrastColor);
            axis.select("path").attr("stroke", axisStrokeHighContrastColor);
            zeroAxis.style("stroke", axisStrokeHighContrastColor);
        }

        /* Add elements for hover behavior ******************************************************/
        let hoverLine: Selection = chartGroup.hoverLine;
        hoverLine
            .classed(DualKpi.INVISIBLE, true)
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", calcHeight)
            .attr("stroke-width", 1)
            .attr("stroke", this.colorHelper.isHighContrast ? axisStrokeHighContrastColor : hoverLineStrokeColor);

        let chartBottom = margin.top + calcHeight;
        let chartLeft = margin.left;

        let hoverDataContainer: IHoverDataContainer = options.element.hoverDataContainer;
        this.updateHoverDataContainer(hoverDataContainer, chartBottom, chartLeft, calcWidth, isTopChart);

        this.dispatch.on("onDualKpiMouseMove." + options.position, ([leftPosition, topPosition]: number[]) => {
            let areaScale: ElementScale = DualKpi.getScale(target);
            let maxWidth: number = options.width - margin.left;

            leftPosition = leftPosition / areaScale.x - margin.left - targetPadding;

            let x = xScale.invert(leftPosition);
            let i = this.dataBisector(chartData, x, 1);
            let dataPoint = chartData[i];

            if ((leftPosition > 0) &&
                (topPosition > 0) &&
                (leftPosition < maxWidth) &&
                (topPosition < (options.height * 2 + 15)) &&
                dataPoint) {

                hoverLine.attr("transform", "translate(" + leftPosition + ", 0)");
                hoverLine.classed(DualKpi.INVISIBLE, false);

                let value: number = options.hoverDataPercentType === PercentType.lastDate ? chartData[chartData.length - 1].value
                    : options.hoverDataPercentType === PercentType.firstDate ? chartData[0].value
                        : chartData[i - 1] ? chartData[i - 1].value : 0;

                this.showHoverData(hoverDataContainer, dataPoint, value, options.hoverDataPercentType, options.valueAsPercent, options.abbreviateHoverValue);
            } else {
                this.hideHoverData(hoverDataContainer, hoverLine);
            }
        });

        this.dispatch.on("onDualKpiMouseOut." + options.position, () => {
            this.hideHoverData(hoverDataContainer, hoverLine);
        });

        if (options.showTextOverlay) {
            this.addOverlayText(options, latestValue, calcHeight, calcWidth, isTopChart);
        } else {
            options.element.chartOverlay.rect.classed(DualKpi.INVISIBLE, true);
            options.element.chartOverlay.title.classed(DualKpi.INVISIBLE, true);
            options.element.chartOverlay.text.classed(DualKpi.INVISIBLE, true);
        }
    }

    private static getScale(element: HTMLElement): ElementScale {
        const clientRect: ClientRect = element.getBoundingClientRect();

        return {
            x: clientRect.width / element.offsetWidth,
            y: clientRect.height / element.offsetHeight
        };
    }

    private applyFontSize(element: Selection, fontSizeAutoFormattingTitle: boolean, fontSize: number) {
        if (!fontSizeAutoFormattingTitle) {
            element.attr("font-size", fontSize);
        } else {
            element.classed(this.sizeCssClass, true);
        }
    }

    private applyBold(element: Selection, isBold: boolean) {
        if (isBold) {
            element.attr("font-weight", "bold");
        } else {
            element.attr("font-weight", null);
        }
    }

    private applyItalic(element: Selection, isItalic: boolean) {
        if (isItalic) {
            element.attr("font-style", "italic");
        } else {
            element.attr("font-style", null);
        }
    }

    private applyFontFamily(element: Selection, fontFamily: string) {
        element.attr("font-family", fontFamily);
    }

    private applyTextStyle(element: Selection, options: IDualKpiOptions, isTitle?: boolean) {
        const fontSizeAutoFormatting: boolean = isTitle ? options.fontSizeAutoFormattingTitle : options.fontSizeAutoFormattingValue,
            fontSize: number = isTitle ? options.titleFontSize : options.valueFontSize,
            isBold: boolean = isTitle ? options.isBoldTitle : options.isBoldValue,
            isItalic: boolean = isTitle ? options.isItalicTitle : options.isItalicValue,
            fontFamily: string = isTitle ? options.fontFamilyTitle : options.fontFamilyValue;

        this.applyFontSize(element, fontSizeAutoFormatting, fontSize);
        this.applyBold(element, isBold);
        this.applyItalic(element, isItalic);
        this.applyFontFamily(element, fontFamily);
    }

    private addOverlayText(options: IDualKpiOptions, latestValue: number, calcHeight: number, calcWidth: number, isTopChart: boolean): void {
        const textColor: string = isTopChart ? this.data.settings.dualKpiColors.textColor : this.data.settings.dualKpiColorsBottom.textColor;
        let chartData: Array<IDualKpiDataPoint> = options.chartData;
        let chartGroup: IChartGroup = options.element;

        let percentChange = DualKpi.getPercentChange(options.percentChangeStartPoint.value, chartData[chartData.length - 1].value);

        let format: string;
        for (let col = 0; col < this.dataView.metadata.columns.length; col++) {
            let column = this.dataView.metadata.columns[col];
            if (column.roles["topvalues"] && isTopChart) {
                format = column.format;
                break;
            }
            if (column.roles["bottomvalues"] && !isTopChart) {
                format = column.format;
                break;
            }
        }

        const formatter: IValueFormatter = valueFormatter.create({
            format: format,
            precision: this.data.settings.dualKpiValueFormatting.precision,
            value: this.data.settings.dualKpiValueFormatting.displayUnits || latestValue,
            displayUnitSystemType: DisplayUnitSystemType.WholeUnits,
        });

        let formattedValue: string;
        if (options.showDefaultTextOverlay) {
            formattedValue = options.defaultTextOverlay;
        } else {
            formattedValue = options.abbreviateValue ? this.valueFormatter(latestValue) : formatter.format(latestValue);
        }

        if (options.valueAsPercent) {
            formattedValue = DualKpi.percentFormatter(latestValue);
            // if value is a percent, only show difference changed, not percent of percent
            percentChange = DualKpi.percentFormatter(chartData[chartData.length - 1].value - options.percentChangeStartPoint.value, true);
        }

        let chartOverlay: IChartOverlay = chartGroup.chartOverlay;
        let dataTitle = chartOverlay.title;
        dataTitle
            .classed(DualKpi.INVISIBLE, true)
            .attr("class", "data-title")
            .attr("fill", textColor)
            .text(options.showDefaultTextOverlay ? "" : options.chartTitle + " (" + percentChange + ")");

        this.applyTextStyle(dataTitle, options, true);

        let dataValue = chartOverlay.text;
        dataValue
            .classed(DualKpi.INVISIBLE, true)
            .attr("class", "data-value")
            .attr("fill", textColor)
            .text(formattedValue);

        this.applyTextStyle(dataValue, options);

        let dataTitleHorzCentering = calcWidth / 2;
        let dataValueHorzCentering = calcWidth / 2;
        let verticalMargin = DualKpi.DefaultValueSizes[this.sizeCssClass];

        // apply centerings, then unhide text
        dataTitle.attr("transform", `translate(${dataTitleHorzCentering}, 0)`);
        dataValue.attr("transform", `translate(${dataValueHorzCentering}, ${verticalMargin})`);

        let verticalCentering = (calcHeight / 2) - verticalMargin / 2; // bump slightly above perfectly vertically centered on chart
        let horizontalCentering = 0;

        chartOverlay.group
            .attr("transform", `translate(${horizontalCentering}, ${verticalCentering})`);

        dataTitle.classed(DualKpi.INVISIBLE, false);
        dataValue.classed(DualKpi.INVISIBLE, false);

        // set rect dimensions
        // add rect to overlay section so that tooltip shows up more easily
        let overlayRect: Selection = chartOverlay.rect;

        // add tooltip
        let percentChangeDesc = percentChange;
        if (!this.data.settings.dualKpiProperties.shortKpiTooltip) {
            percentChangeDesc += this.localizationManager.getDisplayName("Visual_TooltipForPercentageChangeTime")
                + this.timeFormatter(options.percentChangeStartPoint.date);
        }

        let overlayTooltipText: string;
        if (options.showDefaultTextOverlay) {
            overlayTooltipText = formattedValue;
        } else {
            overlayTooltipText = options.tooltipText + " " + percentChangeDesc;
        }

        let overlayTooltip: Selection = chartOverlay.rectTitle;

        overlayTooltip
            .text(overlayTooltipText);

        let dataTitleProps = TextMeasurementService.getSvgMeasurementProperties(dataTitle.node() as SVGTextElement);
        let dataValueProps = TextMeasurementService.getSvgMeasurementProperties(dataValue.node() as SVGTextElement);

        let dataTitleWidth = TextMeasurementService.measureSvgTextWidth(dataTitleProps);
        let dataTitleHeight = TextMeasurementService.measureSvgTextHeight(dataTitleProps);

        let dataValueWidth = TextMeasurementService.measureSvgTextWidth(dataValueProps);
        let dataValueHeight = TextMeasurementService.measureSvgTextHeight(dataValueProps);

        let dataWidth: number = Math.max(dataTitleWidth, dataValueWidth);
        let dataHeight: number = dataTitleHeight + dataValueHeight + (verticalMargin);

        overlayRect
            .attr("width", dataWidth)
            .attr("height", dataHeight)
            .attr("transform", "translate(" + (dataTitleHorzCentering - (dataWidth / 2)) + "," + (-dataValueHeight) + ")");

        overlayRect.on("touchstart", () => this.showMobileTooltip(overlayTooltipText));
        overlayRect.on("mousemove", () => {
            if (this.touchEventsEnabled) {
                (d3.event as Event).stopPropagation();
            }
        });
    }
}  /*close IVisual*/

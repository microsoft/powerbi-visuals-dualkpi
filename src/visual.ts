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

import "../style/visual.less";

// d3
import { Selection as d3Selection, select as d3Select, pointer as d3Pointer } from "d3-selection";
import { format as d3Format } from "d3-format";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { bisector as d3Bisector, min as d3Min, max as d3Max, extent as d3Extent } from "d3-array";
import { dispatch as d3Dispatch, Dispatch } from "d3-dispatch";
import { scaleTime as d3ScaleTime, scaleLinear as d3ScaleLinear, NumberValue } from "d3-scale";
import { axisLeft as d3AxisLeft } from "d3-axis";
import {
    Area as d3Area,
    area as d3CreateArea,
    Line as d3Line,
    line as d3CreateLine,
} from "d3-shape"

// powerbi
import powerbi from "powerbi-visuals-api";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
// powerbi.extensibility.utils.formatting
import {
    valueFormatter as ValueFormatter,
    displayUnitSystemType,
    textMeasurementService,
} from "powerbi-visuals-utils-formattingutils";
import DisplayUnitSystemType = displayUnitSystemType.DisplayUnitSystemType;

// powerbi.extensibility.utils.tooltip
import { ITooltipServiceWrapper, TooltipServiceWrapper } from "powerbi-visuals-utils-tooltiputils";

import { DualKpiChartPositionType, DualKpiChartType } from "./enums";
import { minMax } from "./helper";
import { PercentType } from "./enums";
import { DualKpiSettingsModel } from './dualKpiSettingsModel';

import DataView = powerbi.DataView;
import IViewport = powerbi.IViewport;
import FormattingModel = powerbi.visuals.FormattingModel;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import PrimitiveValue = powerbi.PrimitiveValue;

// powerbi.extensibility
import IVisual = powerbi.extensibility.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IColorPalette = powerbi.extensibility.IColorPalette;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualEventService = powerbi.extensibility.IVisualEventService;

import IValueFormatter = ValueFormatter.IValueFormatter;
import valueFormatter = ValueFormatter;
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { DualKpiPropertiesCard } from "./settings";

type FormatterFunction = (n: number | { valueOf(): number }) => string;

export interface IDualKpiDataPoint {
    date: Date;
    value: number;
}

export interface ElementScale {
    x: number;
    y: number;
}

export interface IDualKpiData {
    settings: DualKpiSettingsModel;
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
    isUnderlineTitle: boolean;
    isUnderlineValue: boolean;
    isUpperCasedTitle: boolean;
    fontFamilyTitle: string;
    fontFamilyValue: string;
}

export interface IGroup {
    group: d3Selection<SVGGElement, unknown, null, undefined>;
    icon: d3Selection<SVGPathElement, unknown, null, undefined>;
    title: d3Selection<SVGPathElement, unknown, null, undefined>;
}

export interface IBottomContainer {
    bottomContainer: d3Selection<SVGGElement, unknown, null, undefined>
    chartTitleElement: d3Selection<SVGTextElement, unknown, null, undefined>;
    warning: IGroup;
    info: IGroup;
    dateRangeText: d3Selection<SVGTextElement, unknown, null, undefined>;
}

export interface IHoverDataContainer {
    container: d3Selection<SVGGElement, unknown, null, undefined>;
    date: d3Selection<SVGTextElement, unknown, null, undefined>;
    text: d3Selection<SVGTextElement, unknown, null, undefined>;
    percent: d3Selection<SVGTextElement, unknown, null, undefined>;
}

export interface IChartOverlay {
    group: d3Selection<SVGGElement, unknown, null, undefined>;
    title: d3Selection<SVGTextElement, unknown, null, undefined>;
    text: d3Selection<SVGTextElement, unknown, null, undefined>;
    rect: d3Selection<SVGRectElement, unknown, null, undefined>;
    rectTitle: d3Selection<SVGGElement, unknown, null, undefined>;
}

export interface IChartGroup {
    group: d3Selection<SVGGElement, unknown, null, undefined>;
    area: d3Selection<SVGPathElement, unknown, null, undefined>;
    yAxis: d3Selection<SVGGElement, unknown, null, undefined>;
    hoverLine: d3Selection<SVGGElement, unknown, null, undefined>;
    zeroAxis: d3Selection<SVGPathElement, unknown, null, undefined>;
    hoverDataContainer: IHoverDataContainer;
    chartOverlay: IChartOverlay;
}

export class DualKpi implements IVisual {
    private dataView: DataView;
    private data: IDualKpiData;
    private target: HTMLElement;
    private size: DualKpiSize;
    private sizeCssClass: DualKpiSizeClass;
    private eventService: IVisualEventService

    private svgRoot: d3Selection<SVGSVGElement, unknown, null, undefined>;

    private chartGroupTop: IChartGroup;
    private chartGroupBottom: IChartGroup;

    private bottomContainer: IBottomContainer;
    private valueFormatter: FormatterFunction;
    private commaNumberFormatter: FormatterFunction;
    private timeFormatter: (date: Date) => string;
    private dataBisector: (array: ArrayLike<IDualKpiDataPoint>, x: Date, lo?: number, hi?: number) => number;

    private chartLeftMargin = 35;
    private viewport: IViewport;

    private axisNumberFormatter: (d: NumberValue) => string;

    private static DefaultTitleSizes = {
        "super-small": 10,
        "extra-small": 11,
        "small": 12,
        "medium": 14,
        "large": 16
    };

    private static DefaultValueSizes = {
        "super-small": 14,
        "extra-small": 18,
        "small": 26,
        "medium": 32,
        "large": 40
    };

    private static INVISIBLE: string = "invisible";

    private static OPACITY_MIN: number = 0;
    private static OPACITY_MAX: number = 100;

    private static MinViewportHeight: number = 90;
    private static MinViewportWidth: number = 220;

    private titleSize: number = 0;
    private dispatch: Dispatch<object>;

    private colorPalette: IColorPalette;
    private colorHelper: ColorHelper;

    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private host: IVisualHost;

    private localizationManager: ILocalizationManager;
    private selectionManager: ISelectionManager;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: DualKpiSettingsModel;

    constructor(options: VisualConstructorOptions) {
        this.init(options);
    }

    private init(options: VisualConstructorOptions): void {
        this.target = options.element;
        this.eventService = options.host.eventService
        this.size = DualKpiSize.small;
        this.sizeCssClass = "small";
        this.valueFormatter = d3Format(".3s");
        this.axisNumberFormatter = d3Format(".2s");
        this.commaNumberFormatter = d3Format(",");
        this.timeFormatter = d3TimeFormat("%m/%d/%y");
        this.dataBisector = d3Bisector((d: IDualKpiDataPoint) => { return d.date; }).left;
        this.dispatch = d3Dispatch("onDualKpiMouseMove", "onDualKpiMouseOut");

        this.host = options.host;
        this.localizationManager = this.host.createLocalizationManager();
        this.selectionManager = this.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService(this.localizationManager);

        this.colorPalette = this.host.colorPalette;
        this.colorHelper = new ColorHelper(this.colorPalette);

        this.tooltipServiceWrapper = new TooltipServiceWrapper(
            {
                tooltipService: this.host.tooltipService,
                rootElement: options.element,
                handleTouchDelay: 0
            });

        this.initContainer();
        this.initMouseEvents();
        this.handleContextMenu(this.target);
    }

    private handleContextMenu(target: HTMLElement): void {
        const visualSelection = d3Select(target);
        visualSelection.on("contextmenu", (event: MouseEvent) => {
            event.preventDefault();

            this.selectionManager.showContextMenu({}, {
                x: event.clientX,
                y: event.clientY
            });
        });
    }

    private initMouseEvents(): void {
        const dispatch = this.dispatch;
        const target = this.target;
        const targetElement = d3Select(target);

        const onMouseMove = function (event: MouseEvent) {
            dispatch.call("onDualKpiMouseMove", this, d3Pointer(event, target));
        };

        targetElement.on("mousemove", onMouseMove);
        targetElement.on("mouseout", onMouseMove);
        targetElement.on("touchmove", onMouseMove);
        targetElement.on("touchstart", onMouseMove);

        const onMouseOut = function () {
            dispatch.call("onDualKpiMouseOut", this);
        };

        targetElement.on("mouseleave", onMouseOut);
        targetElement.on("touchleave", onMouseOut);
    }

    private initContainer(): void {
        const xmlns = "http://www.w3.org/2000/svg";
        const svgElem = document.createElementNS(xmlns, "svg");

        const svgRoot = this.svgRoot = d3Select(svgElem);

        svgRoot
            .attr("class", "dualKpi");

        this.chartGroupTop = this.createChartGroup(svgRoot, DualKpiChartPositionType.top);
        this.chartGroupBottom = this.createChartGroup(svgRoot, DualKpiChartPositionType.bottom);

        this.bottomContainer = this.createBottomContainer(svgRoot);

        this.target.appendChild(svgElem);
    }

    private createBottomContainer(svgRoot: d3Selection<SVGSVGElement, unknown, null, undefined>): IBottomContainer {
        const bottomContainer = svgRoot
            .append("g")
            .attr("class", "bottom-title-container")
            .classed("invisible", true);

        const chartTitleElement = bottomContainer
            .append("text")
            .attr("class", "title")

        const warningGroup = bottomContainer
            .append("g")
            .classed("warning-group", true);

        const warningIcon = warningGroup
            .append("path")
            .classed("warning-icon", true);

        const infoGroup = bottomContainer
            .append("g")
            .classed("info-group", true);

        const infoIcon = infoGroup
            .append("path")
            .classed("info-icon", true);

        const dateRangeText = bottomContainer
            .append("text")
            .classed("date-range-text", true)
            .attr("text-anchor", "end");

        return {
            bottomContainer: bottomContainer,
            chartTitleElement: chartTitleElement,
            warning: {
                group: warningGroup,
                icon: warningIcon,
                title: warningIcon
            },
            info: {
                group: infoGroup,
                icon: infoIcon,
                title: infoIcon
            },
            dateRangeText: dateRangeText
        };
    }

    private createChartGroup(svgRoot: d3Selection<SVGSVGElement, unknown, null, undefined>, type: DualKpiChartPositionType): IChartGroup {
        const chartGroup = svgRoot
            .append("g")
            .attr("class", "chartGroup")
            .classed(type === DualKpiChartPositionType.top ? "chartGroupTop" : "chartGroupBottom", true);

        const chartArea = chartGroup
            .append("path")
            .attr("class", "area");

        const yAxis = chartGroup
            .append("g")
            .attr("class", "axis");

        const hoverLine = chartGroup
            .append("line")
            .attr("class", "hoverLine");

        const hoverDataContainer: IHoverDataContainer = this.createHoverDataContainer(chartGroup);
        const chartOverlay: IChartOverlay = this.createChartOverlay(chartGroup);

        const zeroAxis = chartGroup
            .append("path")
            .attr("class", "zero-axis");

        return {
            group: chartGroup,
            area: chartArea,
            yAxis: yAxis,
            hoverLine,
            zeroAxis: zeroAxis,
            hoverDataContainer: hoverDataContainer,
            chartOverlay: chartOverlay,
        };
    }

    private createChartOverlay(chartGroup: d3Selection<SVGGElement, unknown, null, undefined>): IChartOverlay {
        const chartOverlayTextGroup = chartGroup
            .append("g")
            .classed("group", true);

        const title = chartOverlayTextGroup
            .append("text")
            .classed("data-title", true)
            .attr("text-anchor", "middle");

        const text = chartOverlayTextGroup
            .append("text")
            .classed("data-value", true)
            .attr("text-anchor", "middle");

        // this rect is always invisible, used for capture mouse and touch events
        const chartOverlayRect = chartOverlayTextGroup
            .append("rect")
            .attr("style", "stroke: none; fill: #000;opacity:0;");

        return {
            group: chartOverlayTextGroup,
            title: title,
            text: text,
            rect: chartOverlayRect,
            rectTitle: chartOverlayTextGroup
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
        this.eventService.renderingStarted(options)
        try {
            const dataView: DataView = this.dataView = options.dataViews && options.dataViews[0];
            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns) {

                this.displayRootElement(false);

                return;
            }

            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(DualKpiSettingsModel, dataView);
            this.formattingSettings.validateValues();
            this.formattingSettings.setLocalizedOptions(this.localizationManager);
            this.setHighContrastColors(this.colorHelper);

            const data: IDualKpiData = this.data = DualKpi.converter(this.dataView, this.formattingSettings);

            const availableHeight = options.viewport.height < DualKpi.MinViewportHeight ? DualKpi.MinViewportHeight : options.viewport.height;
            const availableWidth = options.viewport.width < DualKpi.MinViewportWidth ? DualKpi.MinViewportWidth : options.viewport.width;
            const chartWidth = availableWidth;

            const { chartSpaceBetween, chartTitleSpace, iconOffset }: { chartSpaceBetween: number; chartTitleSpace: number; iconOffset: number; } = this.setChartLayout(availableHeight, availableWidth);

            this.titleSize = DualKpi.DefaultTitleSizes[this.sizeCssClass];

            this.updateViewport({
                width: availableWidth,
                height: availableHeight
            });

            const chartHeight = (availableHeight - (chartSpaceBetween + chartTitleSpace)) / 2;
            const wasDataSetRendered: boolean = data.topValues.length > 0 || data.bottomValues.length > 0;

            this.displayRootElement(wasDataSetRendered);
            this.drawTopChart({ data, chartHeight, chartWidth, chartSpaceBetween });
            this.drawBottomChart({ data, chartHeight, chartWidth, chartSpaceBetween });
            this.adjustAxisGroupPosition();

            if (wasDataSetRendered) {
                this.drawBottomContainer(chartWidth, chartHeight, chartTitleSpace, chartSpaceBetween, iconOffset);
            }
            this.eventService.renderingFinished(options)
        } catch (e) {
            console.error(e);
        }
    }

    private adjustAxisGroupPosition() {
        const axisTicks = this.svgRoot.selectAll("g.tick");
        const axisMaxWidth = Math.ceil(Math.max(...axisTicks.nodes().map((x: SVGGElement) => x.getBBox().width))) || 0;

        const topGroupTransform = this.getGroupTransformValue(this.chartGroupTop.group.node());
        const bottomGroupTransform = this.getGroupTransformValue(this.chartGroupBottom.group.node());
        let transformX: number = axisMaxWidth;

        if (this.formattingSettings.properties.generalGroup.topChartShow.value) {
            transformX = Math.max(transformX, topGroupTransform.x);
        }
        if (this.formattingSettings.properties.generalGroup.bottomChartShow.value) {
            transformX = Math.max(transformX, bottomGroupTransform.x);
        }

        if (this.formattingSettings.properties.generalGroup.topChartShow.value) {
            this.chartGroupTop.group.attr("transform", `translate(${Math.max(transformX)}, ${topGroupTransform.y})`);
        }

        if (this.formattingSettings.properties.generalGroup.bottomChartShow.value) {
            this.chartGroupBottom.group.attr("transform", `translate(${Math.max(transformX)}, ${bottomGroupTransform.y})`);
        }
    }

    private getGroupTransformValue(group: SVGGElement): { x: number; y: number; } {
        const transformList = group?.transform?.baseVal;
        if (!transformList || transformList.length === 0) {
            return { x: 0, y: 0 };
        }


        const svgTransformTranslate = Array.from(transformList).find((x) => x.type === SVGTransform.SVG_TRANSFORM_TRANSLATE);

        return svgTransformTranslate
            ? { x: svgTransformTranslate.matrix.e, y: svgTransformTranslate.matrix.f }
            : { x: 0, y: 0 };
    }

    private setChartLayout(availableHeight: number, availableWidth: number) {
        let chartSpaceBetween: number, chartTitleSpace: number, iconOffset: number;
        const size: DualKpiSize = DualKpi.getChartSize({ height: availableHeight, width: availableWidth });

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

        return { chartSpaceBetween, chartTitleSpace, iconOffset };
    }

    private drawTopChart({
        data,
        chartHeight,
        chartWidth,
        chartSpaceBetween,
    }: {
        data: IDualKpiData;
        chartHeight: number;
        chartWidth: number;
        chartSpaceBetween: number;
    }) {
        if (data.settings.properties.generalGroup.topChartShow.value) {
            this.chartGroupTop.group.classed(DualKpi.INVISIBLE, false);
            this.chartGroupTop.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);

            if (data.topValues.length > 0) {
                const topChartAxisConfig = { min: data.settings.axis.topChartAxisMin.value, max: data.settings.axis.topChartAxisMax.value };
                const topChartPercentChangeStartPoint = DualKpi.getPercentChangeStartPoint(data.topValues, data.topPercentCalcDate);
                const chartOptions = this.prepareTopChartOptions({
                    data,
                    element: this.chartGroupTop,
                    axisConfig: topChartAxisConfig,
                    percentChangeStartPoint: topChartPercentChangeStartPoint,
                    chartWidth,
                    chartHeight,
                    chartSpaceBetween
                });

                this.drawChart(chartOptions);
            }
        } else {
            this.chartGroupTop.group.classed(DualKpi.INVISIBLE, true);
            this.chartGroupTop.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);
        }
    }

    private drawBottomChart({
        data,
        chartHeight,
        chartSpaceBetween,
        chartWidth,
    }: {
        data: IDualKpiData
        chartHeight: number;
        chartSpaceBetween: number;
        chartWidth: number;
    }) {
        if (data.settings.properties.generalGroup.bottomChartShow.value) {
            this.chartGroupBottom.group.classed(DualKpi.INVISIBLE, false);
            this.chartGroupBottom.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);

            if (data.bottomValues.length > 0) {
                const bottomChartAxisConfig = { min: data.settings.axis.bottomChartAxisMin.value, max: data.settings.axis.bottomChartAxisMax.value };
                const bottomChartPercentChangeStartPoint = DualKpi.getPercentChangeStartPoint(data.bottomValues, data.bottomPercentCalcDate);
                const chartOptions = this.prepareBottomChartOptions({
                    data,
                    element: this.chartGroupBottom,
                    axisConfig: bottomChartAxisConfig,
                    percentChangeStartPoint: bottomChartPercentChangeStartPoint,
                    chartWidth,
                    chartHeight,
                    chartSpaceBetween
                });

                this.drawChart(chartOptions);
            }
        } else {
            this.chartGroupBottom.group.classed(DualKpi.INVISIBLE, true);
            this.chartGroupBottom.hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);
        }
    }

    private prepareTopChartOptions({
        data,
        element,
        axisConfig,
        percentChangeStartPoint,
        chartWidth,
        chartHeight,
        chartSpaceBetween,
    }: {
        data: IDualKpiData;
        element: IChartGroup;
        axisConfig: { min: number, max: number };
        percentChangeStartPoint: IDualKpiDataPoint;
        chartWidth: number;
        chartHeight: number;
        chartSpaceBetween: number;
    }): IDualKpiOptions {
        const chartOptions: IDualKpiOptions = {
            element: element,
            abbreviateValue: data.settings.properties.generalGroup.abbreviateValues.value,
            abbreviateHoverValue: data.settings.properties.generalGroup.abbreviateHoverValues.value,
            hoverDataPercentType: <PercentType>data.settings.properties.generalGroup.hoverDataPercentType.value.value,
            axisConfig: axisConfig,
            chartData: data.topValues,
            chartTitle: data.topChartName,
            chartType: <DualKpiChartType>data.settings.chart.topChartType.value.value,
            height: data.settings.properties.generalGroup.bottomChartShow.value && data.settings.properties.generalGroup.topChartShow.value ? chartHeight : chartHeight * 2 + chartSpaceBetween,
            percentChangeStartPoint: percentChangeStartPoint,
            showZeroLine: data.settings.axis.topChartZeroLine.value,
            tooltipText: data.settings.properties.tooltipGroup.topChartToolTipText.value,
            top: 0,
            valueAsPercent: data.topValueAsPercent,
            width: chartWidth,
            position: DualKpiChartPositionType["top"],
            showTextOverlay: data.settings.values.show.value,
            showDefaultTextOverlay: !data.settings.values.showKpiValuesTop.value,
            defaultTextOverlay: data.settings.values.topChartDefaultKpiValue.value,
            fontSizeAutoFormattingTitle: data.settings.titleFormatting.fontSizeAutoFormatting.value,
            fontSizeAutoFormattingValue: data.settings.valueFormatting.fontSizeAutoFormatting.value,
            titleFontSize: data.settings.titleFormatting.font.fontSize.value,
            valueFontSize: data.settings.valueFormatting.font.fontSize.value,
            isBoldTitle: data.settings.titleFormatting.font.bold.value,
            isBoldValue: data.settings.valueFormatting.font.bold.value,
            isItalicTitle: data.settings.titleFormatting.font.italic.value,
            isItalicValue: data.settings.valueFormatting.font.italic.value,
            isUnderlineTitle: data.settings.titleFormatting.font.underline.value,
            isUnderlineValue: data.settings.valueFormatting.font.underline.value,
            isUpperCasedTitle: data.settings.titleFormatting.upperCase.value,
            fontFamilyTitle: data.settings.titleFormatting.font.fontFamily.value,
            fontFamilyValue: data.settings.valueFormatting.font.fontFamily.value,
        }

        return chartOptions;
    }

    private prepareBottomChartOptions({
        data,
        element,
        axisConfig,
        percentChangeStartPoint,
        chartWidth,
        chartHeight,
        chartSpaceBetween,
    }: {
        data: IDualKpiData;
        element: IChartGroup;
        axisConfig: { min: number, max: number };
        percentChangeStartPoint: IDualKpiDataPoint;
        chartWidth: number;
        chartHeight: number;
        chartSpaceBetween: number;
    }): IDualKpiOptions {
        const chartOptions: IDualKpiOptions = {
            element: element,
            abbreviateValue: data.settings.properties.generalGroup.abbreviateValues.value,
            abbreviateHoverValue: data.settings.properties.generalGroup.abbreviateHoverValues.value,
            hoverDataPercentType: <PercentType>data.settings.properties.generalGroup.hoverDataPercentType.value.value,
            axisConfig: axisConfig,
            chartData: data.bottomValues,
            chartTitle: data.bottomChartName,
            chartType: <DualKpiChartType>data.settings.chart.bottomChartType.value.value,
            height: data.settings.properties.generalGroup.bottomChartShow.value && data.settings.properties.generalGroup.topChartShow.value ? chartHeight : chartHeight * 2 + chartSpaceBetween,
            percentChangeStartPoint: percentChangeStartPoint,
            showZeroLine: data.settings.axis.bottomChartZeroLine.value,
            tooltipText: data.settings.properties.tooltipGroup.bottomChartToolTipText.value,
            top: data.settings.properties.generalGroup.bottomChartShow.value && data.settings.properties.generalGroup.topChartShow.value ? chartHeight + chartSpaceBetween : 0,
            valueAsPercent: data.bottomValueAsPercent,
            width: chartWidth,
            position: DualKpiChartPositionType["bottom"],
            showTextOverlay: data.settings.values.show.value,
            showDefaultTextOverlay: !data.settings.values.showKpiValuesBottom.value,
            defaultTextOverlay: data.settings.values.bottomChartDefaultKpiValue.value,
            fontSizeAutoFormattingTitle: data.settings.titleFormatting.fontSizeAutoFormatting.value,
            fontSizeAutoFormattingValue: data.settings.valueFormatting.fontSizeAutoFormatting.value,
            titleFontSize: data.settings.titleFormatting.font.fontSize.value,
            valueFontSize: data.settings.valueFormatting.font.fontSize.value,
            isBoldTitle: data.settings.titleFormatting.font.bold.value,
            isBoldValue: data.settings.valueFormatting.font.bold.value,
            isItalicTitle: data.settings.titleFormatting.font.italic.value,
            isItalicValue: data.settings.valueFormatting.font.italic.value,
            isUnderlineTitle: data.settings.titleFormatting.font.underline.value,
            isUnderlineValue: data.settings.valueFormatting.font.underline.value,
            isUpperCasedTitle: data.settings.titleFormatting.upperCase.value,
            fontFamilyTitle: data.settings.titleFormatting.font.fontFamily.value,
            fontFamilyValue: data.settings.valueFormatting.font.fontFamily.value,

        }

        return chartOptions;
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


    public getFormattingModel(): FormattingModel {
        this.updateFormattingModel();

        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    private setHighContrastColors(colorHelper: ColorHelper) {
        if (colorHelper.isHighContrast) {
            this.formattingSettings.colors.dataColor.value.value = colorHelper.getHighContrastColor("foreground", this.formattingSettings.colors.dataColor.value.value);
            this.formattingSettings.colors.textColor.value.value = colorHelper.getHighContrastColor("foreground", this.formattingSettings.colors.textColor.value.value);
            this.formattingSettings.colorsBottom.dataColor.value.value = colorHelper.getHighContrastColor("foreground", this.formattingSettings.colorsBottom.dataColor.value.value);
            this.formattingSettings.colorsBottom.textColor.value.value = colorHelper.getHighContrastColor("foreground", this.formattingSettings.colorsBottom.textColor.value.value);
        }
    }

    private updateFormattingModel(): void {
        if (this.formattingSettings.colorsBottom.matchTopChartOptions.value) {
            this.formattingSettings.colorsBottom.dataColor.visible = false;
            this.formattingSettings.colorsBottom.textColor.visible = false;
            this.formattingSettings.colorsBottom.opacity.visible = false;
        }
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
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const dayRange = Math.round(Math.abs(date1.getTime() - date2.getTime()) / oneDay);
        return dayRange;
    }

    private static percentFormatter(value: number, showPlusMinus?: boolean): string {
        const prefix = value >= 0 ? "+" : "";
        let valueString = (Math.floor(value * 10) / 10) + "%";

        if (showPlusMinus) {
            valueString = prefix + valueString;
        }

        return valueString;
    }

    private static getPercentChange(startValue: number, endValue: number): string {
        if (startValue === 0) {
            return "n/a";
        }

        const diff = endValue - startValue;
        let percentChange = Math.abs(diff / startValue);

        if (endValue < startValue) {
            percentChange = percentChange * -1;
        }

        return this.percentFormatter(percentChange * 100, true);
    }

    private static getPercentChangeStartPoint(chartData: Array<IDualKpiDataPoint>, percentCalcDate: Date): IDualKpiDataPoint {
        if (percentCalcDate !== null) {
            let closestIndex = 0;
            const percentCalcDateTime = percentCalcDate.getTime();

            // keep track of closest date to configured date
            // as soon as we find a date that is more recent than configured date
            // break and use the last date that was older than configured date.
            // always break if we find a date that is exactly equal
            for (let i = 0; i < chartData.length; i++) {
                const currTime = chartData[i].date.getTime();

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
        const symbolPatterns: string[] = [
            "[$]",      // dollar sign
            "[€]",      // euro sign
            "[£]",      // british pound sign
            "[¥]",      // yen / yuan sign
            "[₩]",      // korean won sign
            "[%]",      // percent sign
        ];

        const symbolMatcher: RegExp = new RegExp(symbolPatterns.join("|"), "g");

        const match = symbolMatcher.exec(format);

        if (!match) {
            return undefined;
        }
        else {
            return match[0];
        }
    }

    private static converter(dataView: DataView, settings: DualKpiSettingsModel): IDualKpiData {
        const data = {} as IDualKpiData;
        let topValueFormatSymbol = "";
        let bottomValueFormatSymbol = "";
        data.settings = settings;

        if (data.settings.colorsBottom.matchTopChartOptions.value) {
            data.settings.colorsBottom.dataColor.value.value = data.settings.colors.dataColor.value.value;
            data.settings.colorsBottom.textColor.value.value = data.settings.colors.textColor.value.value;
            data.settings.colorsBottom.opacity.value = data.settings.colors.opacity.value;
        }

        data.topValues = [];
        data.bottomValues = [];

        let axisCol = -1, topValuesCol = -1, bottomValuesCol = -1, warningStateCol = -1,
            topPercentDateCol = -1, bottomPercentDateCol = -1;

        const categories = dataView.categorical.categories;
        for (let i: number = 0; i < categories.length; i++) {
            const col: DataViewCategoryColumn = categories[i];
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
            const col: DataViewValueColumn = values[i];
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
        data.topPercentCalcDate = topPercentDateCol > -1 && categories[topPercentDateCol].values[0] ? new Date(<Exclude<PrimitiveValue, boolean>>categories[topPercentDateCol].values[0]) : new Date(data.settings.properties.generalGroup.topPercentCalcDate.value);
        data.bottomPercentCalcDate = bottomPercentDateCol > -1 && categories[bottomPercentDateCol].values[0] ? new Date(<Exclude<PrimitiveValue, boolean>>categories[bottomPercentDateCol].values[0]) : new Date(data.settings.properties.generalGroup.bottomPercentCalcDate.value);

        for (let i: number = 0; i < rowsLength; i++) {
            let date = null;

            if (axisCol > -1) {
                const timestamp: number = Date.parse(<string>categories[axisCol].values[i]);

                if (!isNaN(timestamp)) {
                    date = new Date(timestamp);
                } else {
                    continue;
                }
            } else {
                date = new Date();
            }

            let topValue: number = topValuesCol > -1 ? <number>values[topValuesCol].values[i] : 0;
            let bottomValue: number = bottomValuesCol > -1 ? <number>values[bottomValuesCol].values[i] : 0;

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
            data.warningState = <number>values[warningStateCol].values[rowsLength - 1];
        }

        const sortBy = (key) => {
            return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
        };

        data.topValues.sort(sortBy("date"));
        data.bottomValues.sort(sortBy("date"));
        return data;
    }

    private createHoverDataContainer(chartGroup: d3Selection<SVGGElement, unknown, null, undefined>): IHoverDataContainer {
        const hoverDataContainer = chartGroup.append("g")
            .attr("class", "hover-data-container")
            .classed(DualKpi.INVISIBLE, true);

        const date = hoverDataContainer.append("text")
            .attr("class", "hover-text date")
            .text("0");

        const text = hoverDataContainer.append("text")
            .attr("class", "hover-text value")
            .attr("text-anchor", "middle")
            .text("0");

        const percent = hoverDataContainer.append("text")
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
        const textColor: string = isTopChart ? this.data.settings.colors.textColor.value.value : this.data.settings.colorsBottom.textColor.value.value;
        const hoverDate = hoverDataContainer.date;
        let centerX = chartWidth / 2;

        if (chartWidth < 300) {
            centerX *= 0.85;
        }

        hoverDate
            .attr("class", "hover-text date")
            .classed(this.sizeCssClass, true)
            .attr("fill", textColor)
            .text("0");

        const hoverValue = hoverDataContainer.text;
        hoverValue
            .attr("class", "hover-text value")
            .classed(this.sizeCssClass, true)
            .attr("transform", `translate(${centerX},0)`)
            .attr("fill", textColor)
            .text("0");

        const hoverPercent = hoverDataContainer.percent;
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
        const hoverDate = hoverDataContainer.date;
        hoverDate
            .datum(dataPoint)
            .text((d: IDualKpiDataPoint) => this.timeFormatter(d.date));

        const hoverValue = hoverDataContainer.text;
        hoverValue
            .datum(dataPoint)
            .text((d: IDualKpiDataPoint) => {
                const value = abbreviateValue ? this.valueFormatter(d.value) : this.commaNumberFormatter(Math.round(d.value));
                if (valueAsPercent) {
                    return DualKpi.percentFormatter(d.value);
                }
                return value;
            });

        const hoverPercent = hoverDataContainer.percent;
        hoverPercent
            .datum(dataPoint)
            .text((d: IDualKpiDataPoint) => {
                if (valueAsPercent) {
                    const value: number = hoverDataPercentType === PercentType.lastDate ? latestValue - d.value
                        : d.value - latestValue;

                    return DualKpi.percentFormatter(value);
                }
                const leftValue: number = hoverDataPercentType === PercentType.lastDate ? d.value : latestValue,
                    rightValue: number = hoverDataPercentType === PercentType.lastDate ? latestValue : d.value;

                return DualKpi.getPercentChange(leftValue, rightValue);
            });

        this.bottomContainer.bottomContainer.classed("hidden", true);
        hoverDataContainer.container.classed(DualKpi.INVISIBLE, false);
    }

    private hideHoverData(hoverDataContainer: IHoverDataContainer, hoverLine?: d3Selection<SVGGElement, unknown, null, undefined>) {
        hoverDataContainer.container.classed(DualKpi.INVISIBLE, true);
        this.bottomContainer.bottomContainer.classed("hidden", false);
        if (hoverLine) {
            hoverLine.classed(DualKpi.INVISIBLE, true);
        }
    }

    private drawBottomContainer(chartWidth: number, chartHeight: number, chartTitleSpace: number, chartSpaceBetween: number, iconOffset: number): void {
        let infoIconShowing = false;

        const chartTitleElement = this.bottomContainer.chartTitleElement
            .text(this.data.settings.properties.titleGroup.titleText.value)
        this.applyTitleStyle(chartTitleElement, this.data.settings.properties);

        let iconWidth = 22;
        let iconScaleTransform = "";
        const iconY = (-chartTitleSpace + (chartTitleSpace / 2) + iconOffset);

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
            const today = new Date();
            const dataDaysOld = DualKpi.getDaysBetween(this.data.topValues[this.data.topValues.length - 1].date, today);
            if (dataDaysOld >= this.data.settings.properties.generalGroup.staleDataThreshold.value && this.data.settings.properties.generalGroup.showStaleDataWarning.value) {
                infoIconShowing = true;
                this.createInfoMessage(iconY, iconScaleTransform, iconWidth, chartWidth, dataDaysOld);
            } else {
                this.hideInfoMessage();
            }

            // add day range text
            const dayRange = DualKpi.getDaysBetween(this.data.topValues[0].date, this.data.topValues[this.data.topValues.length - 1].date);
            const dayRangeElement = this.bottomContainer.dateRangeText;
            dayRangeElement
                .attr("class", "date-range-text")
                .classed(this.sizeCssClass, true)
                .text(this.localizationManager.getDisplayName("Visual_BottomContainerText_Last") + dayRange + this.localizationManager.getDisplayName("Visual_BottomContainerText_Days"));

            let dayRangeLeft = chartWidth - 8;
            if (infoIconShowing) {
                dayRangeLeft -= (iconWidth); // width of icon + 8px padding
            }
            dayRangeElement.attr("transform", "translate(" + (dayRangeLeft) + ",0)");

            const titleMaxWidth = dayRangeLeft - dayRangeElement.node().getBBox().width;
            this.tailorTextByMaxWidth(chartTitleElement, titleMaxWidth);
        }

        this.bottomContainer.bottomContainer.attr("transform", "translate(5," + (this.viewport.height - 5) + ")");
        this.bottomContainer.bottomContainer.classed(DualKpi.INVISIBLE, false);
    }

    private tailorTextByMaxWidth(text: d3Selection<SVGTextElement, unknown, null, undefined>, maxWidth: number) {
        const tailoredText = textMeasurementService.getTailoredTextOrDefault({
            text: text.text(),
            fontSize: text.style("font-size"),
            fontFamily: text.style("font-family"),
        }, maxWidth);

        text.text(tailoredText);
    }

    private createWarningMessage(chartTitleElement, iconY: number, iconScaleTransform: string, iconWidth: number) {
        const warning = this.bottomContainer.warning;
        warning.group
            .attr("transform", "translate(0," + (iconY) + ")");

        const warningIcon = warning.icon;
        warningIcon
            .attr("d", "M24,24H8l8-16L24,24z M9.7,23h12.6L16,10.4L9.7,23z M16.5,19.8h-1v-5.4h1V19.8z M16.5,20.8v1.1h-1v-1.1H16.5z")
            .attr("fill", "#E81123")
            .attr("stroke", "transparent")
            .attr("stroke-width", "5")
            .attr("class", "warning-icon")
            .attr("transform", iconScaleTransform)
            .classed(this.sizeCssClass, true);

        this.tooltipServiceWrapper.addTooltip(
            warning.title,
            () => {
                return [{
                    displayName: null,
                    value: this.data.settings.properties.tooltipGroup.warningTooltipText.value
                }];
            });

        // move title over to account for icon
        chartTitleElement.attr("transform", "translate(" + (iconWidth + 6) + ",0)");
    }

    private createInfoMessage(iconY: number, iconScaleTransform: string, iconWidth: number, chartWidth: number, dataDaysOld: number) {
        const infoMessage = this.localizationManager.getDisplayName("Visual_InfoMessage_DataIs") + dataDaysOld
            + this.localizationManager.getDisplayName("Visual_InfoMessage_DaysOld") + this.data.settings.properties.tooltipGroup.staleDataTooltipText.value;
        const info = this.bottomContainer.info;
        info.group
            .attr("transform", "translate(" + (chartWidth - iconWidth - 8) + "," + (iconY) + ")");

        const infoIcon = info.icon;
        infoIcon
            .attr("d", "M24,16c0,1.4-0.4,2.8-1,4c-0.7,1.2-1.7,2.2-2.9,2.9c-1.2,0.7-2.5,1-4,1s-2.8-0.4-4-1c-1.2-0.7-2.2-1.7-2.9-2.9 C8.4,18.8,8,17.4,8,16c0-1.5,0.4-2.8,1.1-4c0.8-1.2,1.7-2.2,2.9-2.9S14.6,8,16,8s2.8,0.3,4,1.1c1.2,0.7,2.2,1.7,2.9,2.9 C23.6,13.2,24,14.5,24,16z M12.6,22c1.1,0.6,2.2 0.9,3.4,0.9s2.4-0.3,3.5-0.9c1-0.6,1.9-1.5,2.5-2.6c0.6-1,1-2.2,1-3.4 s-0.3-2.4-1-3.5s-1.5-1.9-2.5-2.5c-1.1-0.6-2.2-1-3.5-1s-2.4,0.4-3.4,1c-1.1,0.6-1.9,1.4-2.6,2.5c-0.6,1.1-0.9,2.2-0.9,3.5 c0,1.2,0.3,2.4,0.9,3.4C10.6,20.5,11.4,21.4,12.6,22z M16.5,17.6h-1v-5.4h1V17.6z M16.5 19.7h-1v-1.1h1V19.7z")
            .attr("fill", "#3599B8")
            .attr("stroke", "transparent")
            .attr("stroke-width", "5")
            .attr("class", "info-icon")
            .attr("transform", iconScaleTransform)
            .classed(this.sizeCssClass, true)
            .classed("hidden", false);

        this.tooltipServiceWrapper.addTooltip(
            info.title,
            () => {
                return [{
                    displayName: null,
                    value: infoMessage
                }];
            });
    }

    private hideInfoMessage() {
        const info = this.bottomContainer.info;
        info.icon.classed("hidden", true);
    }

    private drawChart(options: IDualKpiOptions) {
        const chartData: Array<IDualKpiDataPoint> = options.chartData;
        const axisConfig: IAxisConfig = options.axisConfig;
        const latestValue: number = chartData[chartData.length - 1].value,
            isTopChart: boolean = options.position === DualKpiChartPositionType.top,
            dataColor: string = isTopChart ? this.data.settings.colors.dataColor.value.value : this.data.settings.colorsBottom.dataColor.value.value,
            chartOpacity: number = isTopChart ? this.data.settings.colors.opacity.value : this.data.settings.colorsBottom.opacity.value,
            axisStrokeHighContrastColor: string = this.colorHelper.getHighContrastColor("foreground", this.data.settings.colors.textColor.value.value),
            isHighContrastMode: boolean = this.colorHelper.isHighContrast,
            hoverLineStrokeColor: string = "#777";

        const target = this.target;
        const targetStyle = getComputedStyle(target);
        const targetPadding = targetStyle.paddingLeft ? parseInt(targetStyle.paddingLeft, 10) : 0;

        const margin = {
            top: 7,
            right: 0,
            bottom: 0,
            left: this.chartLeftMargin
        };

        if (this.size === DualKpiSize.medium || this.size === DualKpiSize.large) {
            margin.left = 40;
        }

        const calcWidth = options.width - margin.right - margin.left,
            calcHeight = options.height - margin.top - margin.bottom,
            minValue = d3Min(chartData, (d) => d.value) || 0,
            maxValue = d3Max(chartData, (d) => d.value) || 0;

        const axisMinValue = axisConfig.min !== null && axisConfig.min !== undefined ? axisConfig.min : minValue;
        const axisMaxValue = axisConfig.max !== null && axisConfig.max !== undefined ? axisConfig.max : maxValue;

        const xScale = d3ScaleTime()
            .domain(d3Extent(chartData, (d) => d.date))
            .range([0, calcWidth]);

        const yScale = d3ScaleLinear()
            .domain([axisMinValue, axisMaxValue])
            .clamp(true)
            .range([calcHeight, 0]);

        let seriesRenderer: d3Area<IDualKpiDataPoint> | d3Line<IDualKpiDataPoint>, fill: string, stroke: string, strokeWidth: number;

        if (options.chartType === "area") {
            seriesRenderer = d3CreateArea<IDualKpiDataPoint>()
                .x((d) => xScale(d.date || new Date()))
                .y0(calcHeight)
                .y1((d) => yScale(d.value || 0));

            fill = dataColor;
            stroke = "none";
            strokeWidth = 0;
        } else {
            seriesRenderer = d3CreateLine<IDualKpiDataPoint>()
                .x((d) => xScale(d.date || new Date()))
                .y((d) => yScale(d.value || 0));

            fill = "none";
            stroke = dataColor;
            strokeWidth = 2;
        }

        const chartGroup: IChartGroup = options.element;
        chartGroup.group
            .attr("transform", `translate(${margin.left}, ${options.top + margin.top})`)

        const chartArea = chartGroup.area;
        chartArea
            .datum(chartData)
            .attr("style", "opacity: " + (chartOpacity / 100))
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("d", seriesRenderer);

        const zeroAxis = chartGroup.zeroAxis;
        const zeroPointOnAxis = axisMinValue <= 0 && axisMaxValue >= 0 ? true : false;

        // DRAW line for x axis at zero position
        // if formatting option for zero line set to true
        // and if a value of zero is on the y-axis
        if (options.showZeroLine && zeroPointOnAxis) {
            const axisLine = d3CreateLine<IDualKpiDataPoint>()
                .x((d) => xScale(d.date))
                .y(() => yScale(0));

            zeroAxis
                .datum(chartData)
                .classed("hidden", false)
                .attr("d", axisLine);
        } else {
            zeroAxis
                .classed("hidden", true);
        }

        const yAxis = d3AxisLeft(yScale)
            .tickValues([axisMinValue, axisMaxValue])
            .tickFormat((d: NumberValue) => {
                let axisTickLabel: string = String(this.axisNumberFormatter(d));
                if (options.valueAsPercent) {
                    axisTickLabel = axisTickLabel + "%";
                }
                return axisTickLabel;
            })

        const axis = chartGroup.yAxis;
        axis
            .classed("axis", true)
            .classed(this.sizeCssClass, true)
            .classed("axis-colored", !isHighContrastMode)
            .call(yAxis);

        if (isHighContrastMode) {
            const axisTicks = axis.selectAll("g.tick");
            axisTicks.selectAll("text").attr("fill", axisStrokeHighContrastColor);
            axisTicks.select("line").attr("stroke", axisStrokeHighContrastColor);
            axis.select("path").attr("stroke", axisStrokeHighContrastColor);
            zeroAxis.style("stroke", axisStrokeHighContrastColor);
        }

        /* Add elements for hover behavior ******************************************************/
        const hoverLine = chartGroup.hoverLine;
        hoverLine
            .classed(DualKpi.INVISIBLE, true)
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", calcHeight)
            .attr("stroke-width", 1)
            .attr("stroke", this.colorHelper.isHighContrast ? axisStrokeHighContrastColor : hoverLineStrokeColor);

        const chartBottom = margin.top + calcHeight;
        const chartLeft = margin.left;

        const hoverDataContainer: IHoverDataContainer = options.element.hoverDataContainer;
        this.updateHoverDataContainer(hoverDataContainer, chartBottom, chartLeft, calcWidth, isTopChart);

        this.dispatch.on("onDualKpiMouseMove." + options.position, ([leftPosition, topPosition]: number[]) => {
            const areaScale: ElementScale = DualKpi.getScale(target);
            const maxWidth: number = options.width - margin.left;

            leftPosition = leftPosition / areaScale.x - margin.left - targetPadding;

            const x = xScale.invert(leftPosition);
            const i = this.dataBisector(chartData, x, 1);
            const dataPoint = chartData[i];

            if ((leftPosition > 0) &&
                (topPosition > 0) &&
                (leftPosition < maxWidth) &&
                (topPosition < (options.height * 2 + 15)) &&
                dataPoint) {

                hoverLine.attr("transform", "translate(" + leftPosition + ", 0)");
                hoverLine.classed(DualKpi.INVISIBLE, false);

                const value: number = options.hoverDataPercentType === PercentType.lastDate ? chartData[chartData.length - 1].value
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
        const clientRect = element.getBoundingClientRect();

        return {
            x: clientRect.width / element.offsetWidth,
            y: clientRect.height / element.offsetHeight
        };
    }

    private applyTextStyle(element: d3Selection<SVGTextElement, unknown, null, undefined>, options: IDualKpiOptions, isTitle?: boolean) {
        const fontSizeAutoFormatting: boolean = isTitle ? options.fontSizeAutoFormattingTitle : options.fontSizeAutoFormattingValue,
            fontSize: number = isTitle ? options.titleFontSize : options.valueFontSize,
            isBold: boolean = isTitle ? options.isBoldTitle : options.isBoldValue,
            isItalic: boolean = isTitle ? options.isItalicTitle : options.isItalicValue,
            isUnderline: boolean = isTitle ? options.isUnderlineTitle : options.isUnderlineValue,
            fontFamily: string = isTitle ? options.fontFamilyTitle : options.fontFamilyValue;


        if (fontSizeAutoFormatting) {
            element.classed(this.sizeCssClass, true);
        } else {
            element.attr("font-size", fontSize);
        }

        element.attr("font-weight", isBold ? "bold" : "normal");
        element.attr("font-style", isItalic ? "italic" : "normal");
        element.attr("text-decoration", isUnderline ? "underline" : "none");
        element.attr("font-family", fontFamily);
    }

    private addOverlayText(options: IDualKpiOptions, latestValue: number, calcHeight: number, calcWidth: number, isTopChart: boolean): void {
        const textColor: string = isTopChart ? this.data.settings.colors.textColor.value.value : this.data.settings.colorsBottom.textColor.value.value;
        const chartData: Array<IDualKpiDataPoint> = options.chartData;
        const chartGroup: IChartGroup = options.element;

        let percentChange = DualKpi.getPercentChange(options.percentChangeStartPoint.value, chartData[chartData.length - 1].value);

        let format: string;
        for (let col = 0; col < this.dataView.metadata.columns.length; col++) {
            const column = this.dataView.metadata.columns[col];
            if (column.roles["topvalues"] && isTopChart) {
                format = column.format;
                break;
            }
            if (column.roles["bottomvalues"] && !isTopChart) {
                format = column.format;
                break;
            }
        }

        this.data.settings.valueFormatting.precision.value = minMax(this.data.settings.valueFormatting.precision.value, 0, 17);
        const decimalPlaces: number = this.data.settings.valueFormatting.precision.value;

        const formatter: IValueFormatter = valueFormatter.create({
            format: format,
            precision: decimalPlaces,
            value: this.data.settings.valueFormatting.displayUnits.value.valueOf() || latestValue,
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

        const chartOverlay: IChartOverlay = chartGroup.chartOverlay;
        const dataTitle = chartOverlay.title;
        dataTitle
            .classed(DualKpi.INVISIBLE, true)
            .attr("class", "data-title")
            .attr("fill", textColor)
            .classed("uppercased", options.isUpperCasedTitle)
            .text(options.showDefaultTextOverlay ? "" : options.chartTitle + " (" + percentChange + ")");

        this.applyTextStyle(dataTitle, options, true);

        const dataValue = chartOverlay.text;
        dataValue
            .classed(DualKpi.INVISIBLE, true)
            .attr("class", "data-value")
            .attr("fill", textColor)
            .text(formattedValue);

        this.applyTextStyle(dataValue, options);

        const dataTitleHorzCentering = calcWidth / 2;
        const dataValueHorzCentering = calcWidth / 2;
        const verticalMargin = DualKpi.DefaultValueSizes[this.sizeCssClass];

        // apply centerings, then unhide text
        dataTitle.attr("transform", `translate(${dataTitleHorzCentering}, 0)`);
        dataValue.attr("transform", `translate(${dataValueHorzCentering}, ${verticalMargin})`);

        const verticalCentering = (calcHeight / 2) - verticalMargin / 2; // bump slightly above perfectly vertically centered on chart
        const horizontalCentering = 0;

        chartOverlay.group
            .attr("transform", `translate(${horizontalCentering}, ${verticalCentering})`);

        dataTitle.classed(DualKpi.INVISIBLE, false);
        dataValue.classed(DualKpi.INVISIBLE, false);

        // set rect dimensions
        // add rect to overlay section so that tooltip shows up more easily
        // let overlayRect: Selection = chartOverlay.rect;

        // add tooltip
        let percentChangeDesc = percentChange;
        if (!this.data.settings.properties.tooltipGroup.shortKpiTooltip.value) {
            percentChangeDesc += this.localizationManager.getDisplayName("Visual_TooltipForPercentageChangeTime")
                + this.timeFormatter(options.percentChangeStartPoint.date);
        }

        let overlayTooltipText: string;
        if (options.showDefaultTextOverlay) {
            overlayTooltipText = formattedValue;
        } else {
            overlayTooltipText = options.tooltipText + " " + percentChangeDesc;
        }

        this.tooltipServiceWrapper.addTooltip(
            chartOverlay.rectTitle,
            () => {
                return [{
                    displayName: null,
                    value: overlayTooltipText
                }];
            }
        );
    }

    private applyTitleStyle(element: d3Selection<SVGTextElement, unknown, null, undefined>, settings: DualKpiPropertiesCard) {
        const { fontSize, fontFamily, bold, italic, underline } = settings.titleGroup.font;
        const textColor = settings.titleGroup.textColor.value;
        element.attr("class", "title");
        if (settings.titleGroup.fontSizeAutoFormatting.value) {
            element.classed(this.sizeCssClass, true);
        } else {
            element.attr("font-size", fontSize.value)
        }
        element.attr("font-weight", bold.value ? "bold" : "normal")
            .attr("font-style", italic.value ? "italic" : "normal")
            .attr("font-family", fontFamily.value)
            .attr("fill", textColor.value)
            .attr("text-decoration", underline.value ? "underline" : "none");
    }
}  /*close IVisual*/

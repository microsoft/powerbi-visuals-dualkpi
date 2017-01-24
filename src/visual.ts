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

module powerbi.extensibility.visual {

    import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

    export interface Selection extends d3.Selection<SVGElement> {
    };

    export interface IDualKpiDataPoint {
        date: Date;
        value: number;
    }

    export interface ElementScale {
        x: number;
        y: number;
    }

    export interface IDualKpiData {
        // data bound
        topChartName: string;
        bottomChartName: string;
        topValues: Array<IDualKpiDataPoint>;
        bottomValues: Array<IDualKpiDataPoint>;
        topValueAsPercent: boolean;
        bottomValueAsPercent: boolean;
        warningState: number;

        // formatting pane
        title: string;
        abbreviateValues: boolean;
        topChartToolTipText: string;
        bottomChartToolTipText: string;
        warningTooltipText: string;
        showStaleDataWarning: boolean;
        staleDataTooltipText: string;
        staleDataThreshold: number;
        topPercentCalcDate: Date;
        bottomPercentCalcDate: Date;

        dataColor: string;
        textColor: string;
        opacity: number;

        topChartAxisMin: number;
        topChartAxisMax: number;
        bottomChartAxisMin: number;
        bottomChartAxisMax: number;
        topChartZeroLine: boolean;
        bottomChartZeroLine: boolean;

        topChartType: string;
        bottomChartType: string;
    }

    export interface IAxisConfig {
        min: number;
        max: number;
    };

    export enum DualKpiSize {
        extrasmall,
        small,
        medium,
        large
    };

    export type DualKpiSizeClass = "extra-small" | "small" | "medium" | "large";
    export type DualKpiChartPosition = "top" | "bottom";

    export interface IDualKpiOptions {
        element: IChartGroup;
        abbreviateValue: boolean;
        axisConfig: IAxisConfig;
        chartData: Array<IDualKpiDataPoint>;
        chartTitle: string;
        chartType: string;
        position: DualKpiChartPosition;
        height: number;
        percentChangeStartPoint: IDualKpiDataPoint;
        showZeroLine: boolean;
        tooltipText: string;
        top: number;
        valueAsPercent: boolean;
        width: number;
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
        areaRect: Selection;
        yAxis: Selection;
        hoverLine: Selection;
        hoverDataContainer: IHoverDataContainer;
        chartOverlay: IChartOverlay;
        zeroAxis: Selection;
    }

    export class DualKpi implements IVisual {

        private static defaultValues = {
            titleText: "Title",
            abbreviateValues: false,
            topChartToolTipText: "",
            bottomChartToolTipText: "",
            warningTooltipText: "Warning message",
            showStaleDataWarning: true,
            staleDataTooltipText: "",
            staleDataThreshold: 2,
            topPercentCalcDate: null,
            bottomPercentCalcDate: null,

            dataColor: "#01b8aa",
            textColor: "#212121",
            opacity: 30,

            topChartAxisMin: null,
            topChartAxisMax: null,
            bottomChartAxisMin: null,
            bottomChartAxisMax: null,
            topChartZeroLine: false,
            bottomChartZeroLine: false,

            topChartType: "area",
            bottomChartType: "area"
        };

        private static properties = {
            titleText: { objectName: "dualKpiProperties", propertyName: "titleText" },
            abbreviateValues: { objectName: "dualKpiProperties", propertyName: "abbreviateValues" },
            topChartToolTipText: { objectName: "dualKpiProperties", propertyName: "topChartToolTipText" },
            bottomChartToolTipText: { objectName: "dualKpiProperties", propertyName: "bottomChartToolTipText" },
            warningTooltipText: { objectName: "dualKpiProperties", propertyName: "warningTooltipText" },
            showStaleDataWarning: { objectName: "dualKpiProperties", propertyName: "showStaleDataWarning" },
            staleDataTooltipText: { objectName: "dualKpiProperties", propertyName: "staleDataTooltipText" },
            staleDataThreshold: { objectName: "dualKpiProperties", propertyName: "staleDataThreshold" },
            topPercentCalcDate: { objectName: "dualKpiProperties", propertyName: "topPercentCalcDate" },
            bottomPercentCalcDate: { objectName: "dualKpiProperties", propertyName: "bottomPercentCalcDate" },

            dataColor: { objectName: "dualKpiColors", propertyName: "dataColor" },
            textColor: { objectName: "dualKpiColors", propertyName: "textColor" },
            opacity: { objectName: "dualKpiColors", propertyName: "opacity" },

            topChartAxisMin: { objectName: "dualKpiAxis", propertyName: "topChartAxisMin" },
            topChartAxisMax: { objectName: "dualKpiAxis", propertyName: "topChartAxisMax" },
            bottomChartAxisMin: { objectName: "dualKpiAxis", propertyName: "bottomChartAxisMin" },
            bottomChartAxisMax: { objectName: "dualKpiAxis", propertyName: "bottomChartAxisMax" },
            topChartZeroLine: { objectName: "dualKpiAxis", propertyName: "topChartZeroLine" },
            bottomChartZeroLine: { objectName: "dualKpiAxis", propertyName: "bottomChartZeroLine" },

            topChartType: { objectName: "dualKpiChart", propertyName: "topChartType" },
            bottomChartType: { objectName: "dualKpiChart", propertyName: "bottomChartType" }
        };

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
        private eventListeners: Array<any> = [];

        private axisNumberFormatter;

        private static DefaultTitleSizes = {
            "extra-small": 10,
            "small": 12,
            "medium": 14,
            "large": 16
        };

        private static DefaultValueSizes = {
            "extra-small": 14,
            "small": 26,
            "medium": 32,
            "large": 40
        };

        private static OPACITY_MIN: number = 0;
        private static OPACITY_MAX: number = 100;

        private titleSize: number = 0;
        private dispatch: d3.Dispatch = d3.dispatch("onDualKpiMouseMove", "onDualKpiMouseOut");

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
            this.timeFormatter = d3.time.format("%m/%d/%y");
            this.dataBisector = d3.bisector((d: IDualKpiDataPoint) => { return d.date; }).left;

            this.initContainer();
        }

        private initContainer(): void {
            const xmlns = "http://www.w3.org/2000/svg";
            let svgElem = document.createElementNS(xmlns, "svg");

            let svgRoot = this.svgRoot = d3.select(svgElem);

            svgRoot
                .attr("class", "dualKpi")
                .attr("style", "-webkit-tap-highlight-color: transparent;")
                .classed("hidden", true);

            this.chartGroupTop = this.createChartGroup(svgRoot);
            this.chartGroupBottom = this.createChartGroup(svgRoot);

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

        private createChartGroup(svgRoot: Selection): IChartGroup {
            let chartGroup: Selection = svgRoot
                .append("g")
                .attr("class", "chartGroup");

            let chartArea = chartGroup
                .append("path")
                .attr("class", "area");

            let yAxis = chartGroup
                .append("g")
                .attr("class", "axis");

            var areaRect = chartGroup
                .append("rect")
                .style("pointer-events", "all")
                .attr("fill", "transparent")
                .attr("class", "areaRect");

            let hoverLine = chartGroup
                .append("rect")
                .attr("class", "hoverLine");

            let hoverDataContainer: IHoverDataContainer = this.createHoverDataContainer(chartGroup);
            let chartOverlay: IChartOverlay = this.createChartOverlay(chartGroup);

            let zeroAxis = chartGroup
                .append("path")
                .attr("class", "zero-axis");

            this.initMouseEvents(hoverDataContainer, hoverLine);

            return {
                group: chartGroup,
                area: chartArea,
                areaRect: areaRect,
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
                .attr({
                    "text-anchor": "middle"
                });

            let text = chartOverlayTextGroup
                .append("text")
                .classed("data-value", true)
                .attr({
                    "text-anchor": "middle"
                });

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

        private initMouseEvents(hoverDataContainer: IHoverDataContainer, hoverLine: Selection): void {
            let target = this.target;

            let mouseout = (e: MouseEvent) => {
                this.hideHoverData(hoverDataContainer, hoverLine);
            };

            target.addEventListener("mouseout", mouseout, true);
            target.addEventListener("touchleave", mouseout, true);

            this.addClearEvents(() => {
                target.removeEventListener("mouseout", mouseout);
                target.removeEventListener("touchleave", mouseout);
            });
        }

        private clear() {
            this.svgRoot.classed("hidden", true);
        }

        private clearEvents() {
            this.eventListeners.map((event: any) => {
                event.call();
            });
        }

        private addClearEvents(func: any) {
            this.eventListeners.push(func);
        }

        public update(options: VisualUpdateOptions) {
            this.svgRoot.classed("hidden", true);
            this.clearEvents();

            let dataView: DataView = this.dataView = options.dataViews && options.dataViews[0];

            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns) {

                this.clear();
                return;
            }

            let data: IDualKpiData = this.data = DualKpi.converter(this.dataView);

            let availableHeight = options.viewport.height < 90 ? 90 : options.viewport.height,
                availableWidth = options.viewport.width < 220 ? 220 : options.viewport.width,
                chartWidth = availableWidth,
                chartSpaceBetween, chartTitleSpace, iconOffset;

            if (availableHeight >= 450) {
                this.size = DualKpiSize.large;
                this.sizeCssClass = "large";
                iconOffset = -1;
                chartSpaceBetween = 25;
                chartTitleSpace = 46;
            } else if (availableHeight >= 280) {
                this.size = DualKpiSize.medium;
                this.sizeCssClass = "medium";
                iconOffset = -8;
                chartSpaceBetween = 20;
                chartTitleSpace = 30;
            } else if (availableHeight >= 120) {
                this.size = DualKpiSize.small;
                this.sizeCssClass = "small";
                iconOffset = -6;
                chartSpaceBetween = 15;
                chartTitleSpace = 22;
            } else {
                this.size = DualKpiSize.extrasmall;
                this.sizeCssClass = "extra-small";
                iconOffset = -8;
                chartSpaceBetween = 6;
                chartTitleSpace = 18;
            }

            this.titleSize = DualKpi.DefaultTitleSizes[this.sizeCssClass];

            this.updateViewport({
                width: availableWidth,
                height: availableHeight
            });

            let chartHeight = (availableHeight - (chartSpaceBetween + chartTitleSpace)) / 2;
            let topChartAxisConfig = { min: data.topChartAxisMin, max: data.topChartAxisMax };
            let bottomChartAxisConfig = { min: data.bottomChartAxisMin, max: data.bottomChartAxisMax };

            let topChartPercentChangeStartPoint = DualKpi.getPercentChangeStartPoint(data.topValues, data.topPercentCalcDate);
            let bottomChartPercentChangeStartPoint = DualKpi.getPercentChangeStartPoint(data.bottomValues, data.bottomPercentCalcDate);

            // draw top chart
            if (data.topValues.length > 0) {
                this.drawChart({
                    element: this.chartGroupTop,
                    abbreviateValue: data.abbreviateValues,
                    axisConfig: topChartAxisConfig,
                    chartData: data.topValues,
                    chartTitle: data.topChartName,
                    chartType: data.topChartType,
                    height: chartHeight,
                    percentChangeStartPoint: topChartPercentChangeStartPoint,
                    showZeroLine: data.topChartZeroLine,
                    tooltipText: data.topChartToolTipText,
                    top: 0,
                    valueAsPercent: data.topValueAsPercent,
                    width: chartWidth,
                    position: "top"
                });
            }

            // draw bottom chart
            if (data.bottomValues.length > 0) {
                this.drawChart({
                    element: this.chartGroupBottom,
                    abbreviateValue: data.abbreviateValues,
                    axisConfig: bottomChartAxisConfig,
                    chartData: data.bottomValues,
                    chartTitle: data.bottomChartName,
                    chartType: data.bottomChartType,
                    height: chartHeight,
                    percentChangeStartPoint: bottomChartPercentChangeStartPoint,
                    showZeroLine: data.bottomChartZeroLine,
                    tooltipText: data.bottomChartToolTipText,
                    top: chartHeight + chartSpaceBetween,
                    valueAsPercent: data.bottomValueAsPercent,
                    width: chartWidth,
                    position: "bottom"
                });
            }

            if ((data.topValues.length > 0) || (data.bottomValues.length > 0)) {
                this.drawBottomContainer(chartWidth, chartHeight, chartTitleSpace, chartSpaceBetween, iconOffset);
                this.svgRoot.classed("hidden", false);
            }
        }

        private updateViewport(viewport: IViewport): void {
            if (!this.viewport || (this.viewport.width !== viewport.width) || (this.viewport.height !== viewport.height)) {
                this.svgRoot.attr({
                    width: viewport.width,
                    height: viewport.height
                });
            }

            this.viewport = viewport;
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
            let instances: VisualObjectInstance[] = [];
            switch (options.objectName) {
                case "dualKpiProperties":
                    let dualKpiProperties: VisualObjectInstance = {
                        objectName: "dualKpiProperties",
                        displayName: "Dual KPI Properties",
                        selector: null,
                        properties: {
                            titleText: DualKpi.getTitleText(this.dataView),
                            abbreviateValues: DualKpi.getAbbreviateValues(this.dataView),
                            topChartToolTipText: DualKpi.getTopChartToolTipText(this.dataView),
                            bottomChartToolTipText: DualKpi.getBottomChartToolTipText(this.dataView),
                            warningTooltipText: DualKpi.getWarningTooltipText(this.dataView),
                            showStaleDataWarning: DualKpi.getShowStaleDataWarning(this.dataView),
                            staleDataTooltipText: DualKpi.getStaleDataTooltipText(this.dataView),
                            staleDataThreshold: DualKpi.getStaleDataThreshold(this.dataView),
                            topPercentCalcDate: DualKpi.getTopPercentCalcDate(this.dataView),
                            bottomPercentCalcDate: DualKpi.getBottomPercentCalcDate(this.dataView)
                        }
                    };
                    instances.push(dualKpiProperties);
                    break;
                case "dualKpiColors":
                    let dualKpiColors: VisualObjectInstance = {
                        objectName: "dualKpiColors",
                        displayName: "Dual KPI Colors",
                        selector: null,
                        properties: {
                            dataColor: DualKpi.getDataColor(this.dataView),
                            textColor: DualKpi.getTextColor(this.dataView),
                            opacity: DualKpi.getOpacity(this.dataView)
                        }
                    };
                    instances.push(dualKpiColors);
                    break;
                case "dualKpiAxis":
                    let dualKpiAxis: VisualObjectInstance = {
                        objectName: "dualKpiAxis",
                        displayName: "Dual KPI Axis Settings",
                        selector: null,
                        properties: {
                            topChartAxisMin: DualKpi.getTopChartAxisMin(this.dataView),
                            topChartAxisMax: DualKpi.getTopChartAxisMax(this.dataView),
                            bottomChartAxisMin: DualKpi.getBottomChartAxisMin(this.dataView),
                            bottomChartAxisMax: DualKpi.getBottomChartAxisMax(this.dataView),
                            topChartZeroLine: DualKpi.getTopChartZeroLine(this.dataView),
                            bottomChartZeroLine: DualKpi.getBottomChartZeroLine(this.dataView)
                        }
                    };
                    instances.push(dualKpiAxis);
                    break;
                case "dualKpiChart":
                    let dualKpiChart: VisualObjectInstance = {
                        objectName: "dualKpiChart",
                        displayName: "Dual KPI Chart Types",
                        selector: null,
                        properties: {
                            topChartType: DualKpi.getTopChartType(this.dataView),
                            bottomChartType: DualKpi.getBottomChartType(this.dataView)
                        }
                    };
                    instances.push(dualKpiChart);
                    break;
            }
            return instances;
        }

        private static getValue<T>(objects: DataViewObjects, property: any, defaultValue?: T): T {
            if (!objects || !objects[property.objectName]) {
                return defaultValue;
            }

            let objectOrMap = objects[property.objectName];
            let object = <DataViewObject>objectOrMap;
            let propertyValue = <T>object[property.propertyName];

            if (propertyValue === undefined) {
                return defaultValue;
            }

            return propertyValue;
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

        private static getTitleText(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.titleText, DualKpi.defaultValues.titleText);
        }

        private static getAbbreviateValues(dataView: DataView): boolean {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.abbreviateValues, DualKpi.defaultValues.abbreviateValues);
        }

        private static getTopChartToolTipText(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.topChartToolTipText, DualKpi.defaultValues.topChartToolTipText);
        }

        private static getBottomChartToolTipText(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.bottomChartToolTipText, DualKpi.defaultValues.bottomChartToolTipText);
        }

        private static getWarningTooltipText(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.warningTooltipText, DualKpi.defaultValues.warningTooltipText);
        }

        private static getShowStaleDataWarning(dataView: DataView): boolean {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.showStaleDataWarning, DualKpi.defaultValues.showStaleDataWarning);
        }

        private static getStaleDataTooltipText(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.staleDataTooltipText, DualKpi.defaultValues.staleDataTooltipText);
        }

        private static getStaleDataThreshold(dataView: DataView): number {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.staleDataThreshold, DualKpi.defaultValues.staleDataThreshold);
        }

        private static getTopPercentCalcDate(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.topPercentCalcDate, DualKpi.defaultValues.topPercentCalcDate);
        }

        private static getBottomPercentCalcDate(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.bottomPercentCalcDate, DualKpi.defaultValues.bottomPercentCalcDate);
        }

        private static getDataColor(dataView: DataView): Fill {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.dataColor, { solid: { color: DualKpi.defaultValues.dataColor } });
        }

        private static getTextColor(dataView: DataView): Fill {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.textColor, { solid: { color: DualKpi.defaultValues.textColor } });
        }

        private static getOpacity(dataView: DataView): number {
            return dataView && dataView.metadata &&
                this.validateOpacity(DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.opacity, DualKpi.defaultValues.opacity));
        }

        private static getTopChartAxisMin(dataView: DataView): number {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.topChartAxisMin, DualKpi.defaultValues.topChartAxisMin);
        }

        private static getTopChartAxisMax(dataView: DataView): number {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.topChartAxisMax, DualKpi.defaultValues.topChartAxisMax);
        }

        private static getBottomChartAxisMin(dataView: DataView): number {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.bottomChartAxisMin, DualKpi.defaultValues.bottomChartAxisMin);
        }

        private static getBottomChartAxisMax(dataView: DataView): number {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.bottomChartAxisMax, DualKpi.defaultValues.bottomChartAxisMax);
        }

        private static getTopChartZeroLine(dataView: DataView): boolean {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.topChartZeroLine, DualKpi.defaultValues.topChartZeroLine);
        }

        private static getBottomChartZeroLine(dataView: DataView): boolean {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.bottomChartZeroLine, DualKpi.defaultValues.bottomChartZeroLine);
        }

        private static getTopChartType(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.topChartType, DualKpi.defaultValues.topChartType);
        }

        private static getBottomChartType(dataView: DataView): string {
            return dataView && dataView.metadata && DualKpi.getValue(dataView.metadata.objects, DualKpi.properties.bottomChartType, DualKpi.defaultValues.bottomChartType);
        }

        private static getDaysBetween(date1: Date, date2: Date): number {
            let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            let dayRange = Math.round(Math.abs(date1.getTime() - date2.getTime()) / oneDay);
            return dayRange;
        }

        private static percentFormatter(value: number, showPlusMinus?: boolean): string {
            var prefix = value >= 0 ? "+" : "",
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
            //let symbols = [];
            let match = symbolMatcher.exec(format);

            if (!match) {
                return undefined;
            }
            else {
                return match[0];
            }
        }

        private static converter(dataView: DataView): IDualKpiData {
            let data = {} as IDualKpiData;
            let topValueFormatSymbol = "";
            let bottomValueFormatSymbol = "";
            data.topChartName = "";
            data.bottomChartName = "";
            data.topValues = [];
            data.bottomValues = [];
            data.warningState = 0;

            // get formatting pane values
            data.title = DualKpi.getTitleText(dataView);
            data.abbreviateValues = DualKpi.getAbbreviateValues(dataView);
            data.topChartToolTipText = DualKpi.getTopChartToolTipText(dataView);
            data.bottomChartToolTipText = DualKpi.getBottomChartToolTipText(dataView);
            data.warningTooltipText = DualKpi.getWarningTooltipText(dataView);
            data.showStaleDataWarning = DualKpi.getShowStaleDataWarning(dataView);
            data.staleDataTooltipText = DualKpi.getStaleDataTooltipText(dataView);
            data.staleDataThreshold = DualKpi.getStaleDataThreshold(dataView);

            data.dataColor = DualKpi.getDataColor(dataView).solid.color;
            data.textColor = DualKpi.getTextColor(dataView).solid.color;
            data.opacity = DualKpi.getOpacity(dataView);

            data.topChartAxisMin = DualKpi.getTopChartAxisMin(dataView);
            data.topChartAxisMax = DualKpi.getTopChartAxisMax(dataView);
            data.bottomChartAxisMin = DualKpi.getBottomChartAxisMin(dataView);
            data.bottomChartAxisMax = DualKpi.getBottomChartAxisMax(dataView);
            data.topChartZeroLine = DualKpi.getTopChartZeroLine(dataView);
            data.bottomChartZeroLine = DualKpi.getBottomChartZeroLine(dataView);

            data.topChartType = DualKpi.getTopChartType(dataView);
            data.bottomChartType = DualKpi.getBottomChartType(dataView);

            let axisCol = -1, topValuesCol = -1, bottomValuesCol = -1, warningStateCol = -1,
                topPercentDateCol = -1, bottomPercentDateCol = -1,
                rows = [];

            let metadataColumns = dataView.metadata.columns;
            for (let i: number = 0; i < metadataColumns.length; i++) {
                let col: DataViewMetadataColumn = metadataColumns[i];
                if (col.roles) {
                    // not else ifs because in a column can have multiple roles
                    if (col.roles["axis"])
                        axisCol = i;
                    if (col.roles["topvalues"]) {
                        topValuesCol = i;
                        data.topChartName = col.displayName;
                        topValueFormatSymbol = this.getFormatSymbol(col.format);
                    }
                    if (col.roles["bottomvalues"]) {
                        bottomValuesCol = i;
                        data.bottomChartName = col.displayName;
                        bottomValueFormatSymbol = this.getFormatSymbol(col.format);
                    }
                    if (col.roles["warningstate"]) {
                        warningStateCol = i;
                    }
                    if (col.roles["toppercentdate"]) {
                        topPercentDateCol = i;
                    }
                    if (col.roles["bottompercentdate"]) {
                        bottomPercentDateCol = i;
                    }
                }
            }

            if (dataView && dataView.table) {
                rows = dataView.table.rows;
            }

            data.topValueAsPercent = topValueFormatSymbol === "%" ? true : false;
            data.bottomValueAsPercent = bottomValueFormatSymbol === "%" ? true : false;

            // if percent dates are in data use that, otherwise get from formatting pane/default values
            data.topPercentCalcDate = topPercentDateCol > -1 && rows[0] ? new Date(rows[0][topPercentDateCol]) : new Date(DualKpi.getTopPercentCalcDate(dataView));
            data.bottomPercentCalcDate = bottomPercentDateCol > -1 && rows[0] ? new Date(rows[0][bottomPercentDateCol]) : new Date(DualKpi.getBottomPercentCalcDate(dataView));

            for (let i: number = 0; i < rows.length; i++) {
                let date = null;

                if (axisCol > -1) {
                    let timestamp: number = Date.parse(rows[i][axisCol]);

                    if (!isNaN(timestamp)) {
                        date = new Date(timestamp);
                    } else {
                        continue;
                    }
                } else {
                    date = new Date();
                }

                let topValue = topValuesCol > -1 ? rows[i][topValuesCol] : 0;
                let bottomValue = bottomValuesCol > -1 ? rows[i][bottomValuesCol] : 0;

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

            if ((warningStateCol > -1) && (rows.length > 0)) {
                data.warningState = rows[rows.length - 1][warningStateCol];
            }

            return data;
        }

        private createHoverDataContainer(chartGroup: Selection): IHoverDataContainer {
            let hoverDataContainer = chartGroup.append("g")
                .attr("class", "hover-data-container")
                .classed("invisible", true);

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

        private updateHoverDataContainer(hoverDataContainer: IHoverDataContainer, chartBottom: number, chartLeft: number, chartWidth: number): void {
            let hoverDate: Selection = hoverDataContainer.date;
            hoverDate
                .attr("class", "hover-text date")
                .classed(this.sizeCssClass, true)
                .attr("fill", this.data.textColor)
                .text("0");

            let hoverValue: Selection = hoverDataContainer.text;
            hoverValue
                .attr("class", "hover-text value")
                .classed(this.sizeCssClass, true)
                .attr("transform", "translate(" + (chartWidth / 2) + ",0)")
                .attr("fill", this.data.textColor)
                .text("0");

            let hoverPercent: Selection = hoverDataContainer.percent;
            hoverPercent
                .attr("class", "hover-text percent")
                .classed(this.sizeCssClass, true)
                .text("0")
                .attr("fill", this.data.textColor)
                .attr("transform", "translate(" + (chartWidth) + ",0)");

            hoverDataContainer.container
                .attr("transform", "translate(" + 0 + "," + (chartBottom + this.titleSize - 2) + ")");
        }

        private showHoverData(hoverDataContainer: IHoverDataContainer, dataPoint: IDualKpiDataPoint, latestValue: number, valueAsPercent: boolean, abbreviateValue: boolean) {
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
                        return DualKpi.percentFormatter(latestValue - d.value) + " since";
                    }
                    return DualKpi.getPercentChange(d.value, latestValue) + " since";
                });

            this.bottomContainer.bottomContainer.classed("hidden", true);
            hoverDataContainer.container.classed("invisible", false);
        }

        private hideHoverData(hoverDataContainer: IHoverDataContainer, hoverLine?: Selection) {
            hoverDataContainer.container.classed("invisible", true);
            this.bottomContainer.bottomContainer.classed("hidden", false);
            if (hoverLine) {
                hoverLine.classed("hidden", true);
            }
        }

        /*
        *   to show tooltip information on mobile we show a popup on touch event
        */
        private showMobileTooltip(message: string) {
            if (!this.mobileTooltip) {
                this.mobileTooltip = d3.select(this.target).append("div")
                    .classed({ "hidden": true, "mobile-tooltip": true });

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

            this.mobileTooltip.html(message);
            this.mobileTooltip.classed("hidden", false);
        }

        private hideMobileTooltip() {
            this.mobileTooltip.classed("hidden", true);
        }

        private drawBottomContainer(chartWidth: number, chartHeight: number, chartTitleSpace: number, chartSpaceBetween: number, iconOffset: number): void {
            //let warningIconShowing = false;
            let infoIconShowing = false;

            let chartTitleElement = this.bottomContainer.chartTitleElement
                .attr("class", "title")
                .classed(this.sizeCssClass, true)
                .text(this.data.title);

            let iconWidth = 22;
            let iconScaleTransform = "";
            let iconY = (-chartTitleSpace + (chartTitleSpace / 2) + iconOffset);

            if (this.size === DualKpiSize.small || this.size === DualKpiSize.extrasmall) {
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
                if (dataDaysOld >= this.data.staleDataThreshold && this.data.showStaleDataWarning) {
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
                    .text("last " + dayRange + " days");

                let dayRangeLeft = chartWidth - 8;
                if (infoIconShowing) {
                    dayRangeLeft -= (iconWidth);// width of icon + 8px padding
                }
                dayRangeElement.attr("transform", "translate(" + (dayRangeLeft) + ",0)");
            }

            this.bottomContainer.bottomContainer.attr("transform", "translate(5," + (this.viewport.height - 5) + ")");
            this.bottomContainer.bottomContainer.classed("invisible", false);
        }

        private createWarningMessage(chartTitleElement, iconY: number, iconScaleTransform: any, iconWidth: number) {
            let warning = this.bottomContainer.warning;
            warning.group
                .attr("transform", "translate(0," + (iconY) + ")");

            let warningIcon = warning.icon;
            warningIcon
                .attr({
                    "d": "M24,24H8l8-16L24,24z M9.7,23h12.6L16,10.4L9.7,23z M16.5,19.8h-1v-5.4h1V19.8z M16.5,20.8v1.1h-1v-1.1H16.5z",
                    "fill": "#E81123",
                    "stroke": "transparent",
                    "stroke-width": "5",
                    "class": "warning-icon",
                    "transform": iconScaleTransform
                })
                .classed(this.sizeCssClass, true);

            let warningTitle = warning.title;
            warningTitle
                .text(this.data.warningTooltipText);

            // move title over to account for icon
            chartTitleElement.attr("transform", "translate(" + (iconWidth + 6) + ",0)");

            warning.group.on("touchstart", () => this.showMobileTooltip(this.data.warningTooltipText));
        }

        private createInfoMessage(iconY: number, iconScaleTransform: any, iconWidth: number, chartWidth: number, dataDaysOld: number) {
            let infoMessage = "Data is " + dataDaysOld + " days old. " + this.data.staleDataTooltipText;
            let info = this.bottomContainer.info;
            info.group
                .attr("transform", "translate(" + (chartWidth - iconWidth - 8) + "," + (iconY) + ")");

            let infoIcon = info.icon;
            infoIcon
                .attr({
                    "d": "M24,16c0,1.4-0.4,2.8-1,4c-0.7,1.2-1.7,2.2-2.9,2.9c-1.2,0.7-2.5,1-4,1s-2.8-0.4-4-1c-1.2-0.7-2.2-1.7-2.9-2.9 C8.4,18.8,8,17.4,8,16c0-1.5,0.4-2.8,1.1-4c0.8-1.2,1.7-2.2,2.9-2.9S14.6,8,16,8s2.8,0.3,4,1.1c1.2,0.7,2.2,1.7,2.9,2.9 C23.6,13.2,24,14.5,24,16z M12.6,22c1.1,0.6,2.2 0.9,3.4,0.9s2.4-0.3,3.5-0.9c1-0.6,1.9-1.5,2.5-2.6c0.6-1,1-2.2,1-3.4 s-0.3-2.4-1-3.5s-1.5-1.9-2.5-2.5c-1.1-0.6-2.2-1-3.5-1s-2.4,0.4-3.4,1c-1.1,0.6-1.9,1.4-2.6,2.5c-0.6,1.1-0.9,2.2-0.9,3.5 c0,1.2,0.3,2.4,0.9,3.4C10.6,20.5,11.4,21.4,12.6,22z M16.5,17.6h-1v-5.4h1V17.6z M16.5 19.7h-1v-1.1h1V19.7z",
                    "fill": "#3599B8",
                    "stroke": "transparent",
                    "stroke-width": "5", // fills in path so that title tooltip will show
                    "class": "info-icon",
                    "transform": iconScaleTransform
                })
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
            const latestValue: number = chartData[chartData.length - 1].value;

            let target = this.target;
            let targetPadding = parseInt($(target).css("padding-left")) || 0;

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

            let axisMinValue = axisConfig.min !== null ? axisConfig.min : minValue;
            let axisMaxValue = axisConfig.max !== null ? axisConfig.max : maxValue;

            let xScale = d3.time.scale()
                .domain(d3.extent(chartData, (d) => d.date))
                .range([0, calcWidth]);

            let yScale = d3.scale.linear()
                .domain([axisMinValue, axisMaxValue])
                .clamp(true)
                .range([calcHeight, 0]);

            let yAxis = d3.svg.axis()
                .scale(yScale)
                .tickValues([axisMinValue, axisMaxValue])
                .tickFormat((d) => {
                    let axisTickLabel: string = String(this.axisNumberFormatter(d));
                    if (options.valueAsPercent) {
                        axisTickLabel = axisTickLabel + "%";
                    }
                    return axisTickLabel;
                })
                .orient("left");

            let seriesRenderer, fill, stroke, strokeWidth;

            if (options.chartType === "area") {
                seriesRenderer = d3.svg.area()
                    .x((d: any) => xScale(d.date || new Date()))
                    .y0(calcHeight)
                    .y1((d: any) => yScale(d.value || 0));

                fill = this.data.dataColor;
                stroke = "none";
                strokeWidth = 0;
            } else {
                seriesRenderer = d3.svg.line()
                    .x((d: any) => xScale(d.date || new Date()))
                    .y((d: any) => yScale(d.value || 0));

                fill = "none";
                stroke = this.data.dataColor;
                strokeWidth = 2;
            }

            let chartGroup: IChartGroup = options.element;
            chartGroup.group
                .attr("transform", "translate(" + margin.left + "," + (options.top + margin.top) + ")");

            let chartArea: Selection = chartGroup.area;
            chartArea
                .datum(chartData)
                .attr({
                    "style": "opacity: " + (this.data.opacity / 100),
                    "fill": fill,
                    "stroke": stroke,
                    "stroke-width": strokeWidth,
                    "d": seriesRenderer as any
                });

            let zeroAxis: Selection = chartGroup.zeroAxis;
            let zeroPointOnAxis = axisMinValue <= 0 && axisMaxValue >= 0 ? true : false;

            // DRAW line for x axis at zero position
            // if formatting option for zero line set to true
            // and if a value of zero is on the y-axis
            if (options.showZeroLine && zeroPointOnAxis) {
                let axisLine = d3.svg.line()
                    .x((d: any) => xScale(d.date))
                    .y((d: any) => yScale(0));

                zeroAxis
                    .datum(chartData)
                    .classed("hidden", false)
                    .attr({
                        "d": axisLine as any
                    });
            } else {
                zeroAxis
                    .classed("hidden", true);
            }

            let axis: Selection = chartGroup.yAxis;
            axis
                .attr("class", "axis")
                .classed(this.sizeCssClass, true)
                .call(yAxis);

            /* Add elements for hover behavior ******************************************************/
            let hoverLine: Selection = chartGroup.hoverLine;
            hoverLine
                .classed("hidden", true)
                .attr({
                    "width": 1,
                    "height": calcHeight,
                    "fill": "#777"
                });

            let chartBottom = margin.top + calcHeight;
            let chartLeft = margin.left;

            let hoverDataContainer: IHoverDataContainer = options.element.hoverDataContainer;
            this.updateHoverDataContainer(hoverDataContainer, chartBottom, chartLeft, calcWidth);

            let dispatch: any = this.dispatch;

            dispatch.on("onDualKpiMouseMove." + options.position, (leftPosition: number) => {
                hoverLine.classed("hidden", false);
                hoverLine.attr("transform", "translate(" + leftPosition + ",0)");

                let x = xScale.invert(leftPosition);
                let i = this.dataBisector(chartData, x, 1);
                let dataPoint = chartData[i];

                if ((leftPosition >= 0) && dataPoint) {
                    this.showHoverData(hoverDataContainer, dataPoint, latestValue, options.valueAsPercent, options.abbreviateValue);
                } else {
                    this.hideHoverData(hoverDataContainer, hoverLine);
                }
            });

            dispatch.on("onDualKpiMouseOut." + options.position, () => {
                this.hideHoverData(hoverDataContainer, hoverLine);
            });

            let onMouseMove = function (e: any) {
                let leftPosition: number,
                    topPosition: number;
                [leftPosition, topPosition] = d3.mouse(target);

                let areaScale: ElementScale = DualKpi.getScale(target);
                leftPosition = leftPosition / areaScale.x - margin.left - targetPadding;

                console.log('onMouse MOVE');
                dispatch.onDualKpiMouseMove(leftPosition);
            };

            let onMouseOut = function (e: any) {
                console.log('onMouseOut');
                dispatch.onDualKpiMouseOut();
            };

            let areaRect: Selection = chartGroup.areaRect;
            areaRect.attr({
                "width": calcWidth,
                "height": calcHeight
            });

            let targetElement = d3.select(target);
            targetElement.on("mousemove", onMouseMove);
            targetElement.on("touchmove", onMouseMove);
            targetElement.on("touchstart", onMouseMove);
            targetElement.on("mouseout", onMouseOut);

            this.addOverlayText(options, latestValue, calcHeight, calcWidth);
        }

        private static getScale(element: HTMLElement): ElementScale {
            const clientRect: ClientRect = element.getBoundingClientRect();

            return {
                x: clientRect.width / element.offsetWidth,
                y: clientRect.height / element.offsetHeight
            };
        }

        private addOverlayText(options: IDualKpiOptions, latestValue: number, calcHeight: number, calcWidth: number): void {
            let chartData: Array<IDualKpiDataPoint> = options.chartData;
            let chartGroup: IChartGroup = options.element;

            let percentChange = DualKpi.getPercentChange(options.percentChangeStartPoint.value, chartData[chartData.length - 1].value);
            let formattedValue = options.abbreviateValue ? this.valueFormatter(latestValue) : this.commaNumberFormatter(Math.round(latestValue));

            if (options.valueAsPercent) {
                formattedValue = DualKpi.percentFormatter(latestValue);
                // if value is a percent, only show difference changed, not percent of percent
                percentChange = DualKpi.percentFormatter(chartData[chartData.length - 1].value - options.percentChangeStartPoint.value, true);
            }

            let chartOverlay: IChartOverlay = chartGroup.chartOverlay;
            let dataTitle = chartOverlay.title;
            dataTitle
                .classed("invisible", true)
                .attr("class", "data-title")
                .classed(this.sizeCssClass, true)
                .attr("fill", this.data.textColor)
                .text(options.chartTitle + " (" + percentChange + ")");

            let dataValue = chartOverlay.text;
            dataValue
                .classed("invisible", true)
                .attr("class", "data-value")
                .classed(this.sizeCssClass, true)
                .attr("fill", this.data.textColor)
                .text(formattedValue);

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

            dataTitle.classed("invisible", false);
            dataValue.classed("invisible", false);

            // set rect dimensions
            // add rect to overlay section so that tooltip shows up more easily
            let overlayRect: Selection = chartOverlay.rect;

            // add tooltip
            let percentChangeDesc = percentChange + " change since " + this.timeFormatter(options.percentChangeStartPoint.date);
            let overlayTooltipText = options.tooltipText + " " + percentChangeDesc;

            let overlayTooltip: Selection = chartOverlay.rectTitle;

            overlayTooltip
                .text(overlayTooltipText);

            let dataTitleProps = textMeasurementService.getSvgMeasurementProperties(dataTitle.node() as SVGTextElement);
            let dataValueProps = textMeasurementService.getSvgMeasurementProperties(dataValue.node() as SVGTextElement);

            let dataTitleWidth = textMeasurementService.measureSvgTextWidth(dataTitleProps);
            let dataTitleHeight = textMeasurementService.measureSvgTextHeight(dataTitleProps);

            let dataValueWidth = textMeasurementService.measureSvgTextWidth(dataValueProps);
            let dataValueHeight = textMeasurementService.measureSvgTextHeight(dataValueProps);

            let dataWidth: number = Math.max(dataTitleWidth, dataValueWidth);
            let dataHeight: number = dataTitleHeight + dataValueHeight + (verticalMargin);

            overlayRect
                .attr("width", dataWidth)
                .attr("height", dataHeight)
                .attr("transform", "translate(" + (dataTitleHorzCentering - (dataWidth/2)) + "," + (-dataValueHeight) + ")");

            overlayRect.on("touchstart", () => this.showMobileTooltip(overlayTooltipText));
            overlayRect.on("mousemove", () => {
                if (this.touchEventsEnabled) {
                    (d3.event as Event).stopPropagation();
                }
            });
        }
    }  /*close IVisual*/
} /*close export*/

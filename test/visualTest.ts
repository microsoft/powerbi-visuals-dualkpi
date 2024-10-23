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

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import PrimitiveValue = powerbi.PrimitiveValue;

// powerbi.extensibility.utils.test
import { assertColorsMatch, getSolidColorStructuralObject, d3MouseMove } from "powerbi-visuals-utils-testutils";

import { VisualData, getRandomHexColor } from "./visualData";
import { VisualBuilder } from "./visualBuilder";
import { minMax } from "../src/helper";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";

describe("DualKpi", () => {
    let visualBuilder: VisualBuilder;
    let defaultDataViewBuilder: VisualData;
    let dataView: DataView;
    const DefaultWaitForRender = 10;

    beforeEach(() => {
        visualBuilder = new VisualBuilder(1000, 500);
        defaultDataViewBuilder = new VisualData();
        dataView = defaultDataViewBuilder.getDataView();
    });

    describe("Unit tests", () => {
        it("minMax function target is greater than bounds", () => {
            const res = minMax(5, -4, 4);
            expect(res).toBe(4);
        });

        it("minMax function target inside bounds", () => {
            const res = minMax(3, 0, 14);
            expect(res).toBe(3);
        });

        it("minMax function target is lesser that bounds", () => {
            const res = minMax(-3, 0, 14);
            expect(res).toBeNull();
        });

        it("minMax function max is undefined", () => {
            let res = minMax(5, -4, null);
            expect(res).toBe(5);

            res = minMax(5, -4, undefined);
            expect(res).toBe(5);

            res = minMax(-5, -4, null);
            expect(res).toBeNull();
        });

        it("minMax function target == min == max", () => {
            let res = minMax(-1, -1, -1);
            expect(res).toBe(-1);
        });

        it("minMax function target == min", () => {
            let res = minMax(-1, -1, 4);
            expect(res).toBe(-1);
        });

        it("minMax function target == max", () => {
            let res = minMax(5, -4, 5);
            expect(res).toBe(5);
        });

        it("minMax function min is undefined", () => {
            let res = minMax(5, null, 15);
            expect(res).toBe(5);

            res = minMax(5, undefined, 15);
            expect(res).toBe(5);

            res = minMax(-2, null, -3);
            expect(res).toBe(-3);
        });

        it("minMax function target in nullable", () => {
            let res = minMax(null, 0, 15);
            expect(res).toBe(0);

            res = minMax(null, -2, -1);
            expect(res).toBe(-2);

            res = minMax(undefined, 3, 5);
            expect(res).toBe(3);

            res = minMax(undefined, -53, -5);
            expect(res).toBe(-53);

            res = minMax(null, null, -3);
            expect(res).toBe(null);

            res = minMax(undefined, null, -3);
            expect(res).toBe(null);

            res = minMax(undefined, undefined, -3);
            expect(res).toBe(null);
        });
    });

    describe("DOM tests", () => {
        it("svg element created", () => expect(visualBuilder.mainElement).toBeDefined());

        it("both charts should be rendered", (done) => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    topChartShow: true,
                    bottomChartShow: true,
                }
            };

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.pathAreas.length).toBe(2);
                expect(visualBuilder.axisTicks.length).toBe(4);
                done();
            });
        });

        it("top chart should be rendered", (done) => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    topChartShow: true,
                    bottomChartShow: false,
                }
            };

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.pathAreas.length).toBeGreaterThan(1);
                expect(visualBuilder.axisTicks.length).toBe(2);
                done();
            });
        });

        it("bottom chart should be rendered", (done) => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    topChartShow: false,
                    bottomChartShow: true,
                }
            };

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.pathAreas.length).toBeGreaterThan(1);
                expect(visualBuilder.axisTicks.length).toBe(2);
                done();
            });
        });


        it("update with null values", (done) => {
            dataView.categorical!.categories![0].values[0] = null as unknown as PrimitiveValue;
            dataView.categorical!.values![0].values[0] = null as unknown as PrimitiveValue;

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.pathAreas.length).toBeGreaterThan(0);
                done();
            }, DefaultWaitForRender);
        });

        it("changed data with high contrast on with", () => {
            const dataColorTop: string = "#01B8AA",
                textColorTop: string = "#212121",
                chartOpacityTop: number = 10;

            dataView.metadata.objects = {
                dualKpiColors: {
                    dataColor: getSolidColorStructuralObject(dataColorTop),
                    textColor: getSolidColorStructuralObject(textColorTop),
                    opacity: chartOpacityTop
                },
            };

            visualBuilder.visualHost.colorPalette.isHighContrast = true;

            visualBuilder.updateFlushAllD3Transitions(dataView);
            const colorHelper = new ColorHelper(visualBuilder.visualHost.colorPalette);
            const foreground = colorHelper.getHighContrastColor("foreground");

            const opacityStringTop: string = visualBuilder.pathAreaTop?.style.opacity || "0";
            const opacityTop: number = Math.round(parseFloat(opacityStringTop) * 10) / 10;

            expect(opacityTop).toBe(chartOpacityTop / 100);
            assertColorsMatch(getComputedStyle(visualBuilder.pathAreaTop!).fill, foreground);
            assertColorsMatch(getComputedStyle(visualBuilder.titleTop!).fill, foreground);
        });

        it("changed data with high contrast on with random colors", () => {
            const dataColorTop: string = getRandomHexColor(),
                textColorTop: string = getRandomHexColor(),
                chartOpacityTop: number = 10;

            dataView.metadata.objects = {
                dualKpiColors: {
                    dataColor: getSolidColorStructuralObject(dataColorTop),
                    textColor: getSolidColorStructuralObject(textColorTop),
                    opacity: chartOpacityTop
                },
            };

            visualBuilder.visualHost.colorPalette.isHighContrast = true;

            visualBuilder.updateFlushAllD3Transitions(dataView);
            const colorHelper = new ColorHelper(visualBuilder.visualHost.colorPalette);
            const foreground = colorHelper.getHighContrastColor("foreground");

            const opacityStringTop: string = visualBuilder.pathAreaTop?.style.opacity || "0";
            const opacityTop: number = Math.round(parseFloat(opacityStringTop) * 10) / 10;

            expect(opacityTop).toBe(chartOpacityTop / 100);
            assertColorsMatch(getComputedStyle(visualBuilder.pathAreaTop!).fill, foreground);
            assertColorsMatch(getComputedStyle(visualBuilder.titleTop!).fill, foreground);
        });

        it("data area and title should respect color formatting options", () => {
            let dataColorTop: string = getRandomHexColor(),
                textColorTop: string = getRandomHexColor(),
                chartOpacityTop: number = 10,
                dataColorBottom: string = getRandomHexColor(),
                textColorBottom: string = getRandomHexColor(),
                chartOpacityBottom: number = 20;

            dataView.metadata.objects = {
                dualKpiColors: {
                    dataColor: getSolidColorStructuralObject(dataColorTop),
                    textColor: getSolidColorStructuralObject(textColorTop),
                    opacity: chartOpacityTop
                },
                dualKpiColorsBottom: {
                    matchTopChartOptions: false,
                    dataColor: getSolidColorStructuralObject(dataColorBottom),
                    textColor: getSolidColorStructuralObject(textColorBottom),
                    opacity: chartOpacityBottom
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);

            const opacityStringTop: string = visualBuilder.pathAreaTop?.style.opacity || "0",
                opacityTop: number = Math.round(parseFloat(opacityStringTop) * 10) / 10,
                opacityStringBottom: string = visualBuilder.pathAreaBottom?.style.opacity || "0",
                opacityBottom: number = Math.round(parseFloat(opacityStringBottom) * 10) / 10;

            expect(opacityTop).toBe(chartOpacityTop / 100);
            assertColorsMatch(getComputedStyle(visualBuilder.pathAreaTop!).fill, dataColorTop);
            assertColorsMatch(getComputedStyle(visualBuilder.titleTop!).fill, textColorTop);

            expect(opacityBottom).toBe(chartOpacityBottom / 100);
            assertColorsMatch(getComputedStyle(visualBuilder.pathAreaBottom!).fill, dataColorBottom);
            assertColorsMatch(getComputedStyle(visualBuilder.titleBottom!).fill, textColorBottom);
        });

        it("hovering data area should make hover mode elements visible", () => {
            visualBuilder.updateFlushAllD3Transitions(dataView);

            visualBuilder.pathAreas.forEach((pathArea: SVGPathElement) => {
                const bBox = pathArea.getBoundingClientRect();
                d3MouseMove(pathArea as unknown as HTMLElement, bBox.left + 100, bBox.top + 100);
            });

            visualBuilder.chartGroups.forEach((chartGroup: SVGGElement) => {
                const line = chartGroup.querySelector("line")!;
                const hoverContainer = chartGroup.querySelector("g.hover-data-container")!;

                expect(line.classList.contains("invisible")).toBeFalsy();
                expect(hoverContainer.classList.contains("invisible")).toBeFalsy();
            });
        });

        it("should show zero line", () => {
            dataView.metadata.objects = {
                dualKpiAxis: {
                    topChartAxisMin: -30000,
                    topChartAxisMax: 70000,
                    bottomChartAxisMin: 0,
                    bottomChartAxisMax: 100,
                    topChartZeroLine: true,
                    bottomChartZeroLine: false
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.chartGroupTop!.querySelector("path.zero-axis")!.classList.contains("hidden")).toBeFalsy();
            expect(visualBuilder.chartGroupBottom!.querySelector("path.zero-axis")!.classList.contains("hidden")).toBeTruthy();
        });

        // Tooltip is shown above the visual, so we can't access it
        xit("should show title tooltip", () => {
            let topChartToolTipText: string = "Top metric name";
            dataView.metadata.objects = {
                dualKpiProperties: {
                    topChartToolTipText: topChartToolTipText
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);
            // TODO:// check if tooltip is shown
            visualBuilder.groupTop?.dispatchEvent(new MouseEvent("mouseover", { clientX: 0, clientY: 0 }));
            expect(visualBuilder.titleTop!.textContent).toContain(topChartToolTipText);
            expect(visualBuilder.textTop!.textContent).not.toContain("k");

            dataView.metadata.objects = {
                dualKpiProperties: {
                    abbreviateValues: true
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.textTop!.textContent).toContain("k");
        });

        it("charts labels should not overlap", () => {
            let builder: VisualBuilder = new VisualBuilder(250, 150);
            builder.updateFlushAllD3Transitions(dataView);

            let textTopRect = visualBuilder.textTop!.getBoundingClientRect(),
                textBottomRect = visualBuilder.textBottom!.getBoundingClientRect(),
                titleTopRect = visualBuilder.titleTop!.getBoundingClientRect(),
                titleBottomRect = visualBuilder.titleBottom!.getBoundingClientRect();

            expect(titleTopRect.top).not.toBeGreaterThan(textTopRect.bottom);
            expect(titleBottomRect.top).not.toBeGreaterThan(textBottomRect.bottom);
            expect(titleTopRect.bottom).not.toBeGreaterThan(textBottomRect.top);

            builder = new VisualBuilder(500, 300);
            builder.updateFlushAllD3Transitions(dataView);

            textTopRect = visualBuilder.textTop!.getBoundingClientRect(),
                textBottomRect = visualBuilder.textBottom!.getBoundingClientRect(),
                titleTopRect = visualBuilder.titleTop!.getBoundingClientRect(),
                titleBottomRect = visualBuilder.titleBottom!.getBoundingClientRect();

            expect(titleTopRect.top).not.toBeGreaterThan(textTopRect.bottom);
            expect(titleBottomRect.top).not.toBeGreaterThan(textBottomRect.bottom);
            expect(titleTopRect.bottom).not.toBeGreaterThan(textBottomRect.top);

            builder = new VisualBuilder(1000, 500);
            builder.updateFlushAllD3Transitions(dataView);

            textTopRect = visualBuilder.textTop!.getBoundingClientRect(),
                textBottomRect = visualBuilder.textBottom!.getBoundingClientRect(),
                titleTopRect = visualBuilder.titleTop!.getBoundingClientRect(),
                titleBottomRect = visualBuilder.titleBottom!.getBoundingClientRect();

            expect(titleTopRect.top).not.toBeGreaterThan(textTopRect.bottom);
            expect(titleBottomRect.top).not.toBeGreaterThan(textBottomRect.bottom);
            expect(titleTopRect.bottom).not.toBeGreaterThan(textBottomRect.top);
        });

        it("switches off KPI values via formatting options", () => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    showKpiValues: false
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect((<any>(visualBuilder.groups)).visible).toBeFalsy();
        });

        it("shows short style tooltip for KPI group via formatting options", () => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    shortKpiTooltip: true
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.titleTop!.textContent!).not.toContain("change since");
            expect(visualBuilder.titleBottom!.textContent!).not.toContain("change since");
        });

        it("shows single chart if switch display chart is checked", () => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    topChartShow: true,
                    bottomChartShow: false,
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.chartGroupTop!.classList.contains("invisible")).toBeFalsy();
            expect(visualBuilder.chartGroupBottom!.classList.contains("invisible")).toBeTruthy();

            dataView.metadata.objects = {
                dualKpiProperties: {
                    topChartShow: false,
                    bottomChartShow: true,
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.chartGroupTop!.classList.contains("invisible")).toBeTruthy();
            expect(visualBuilder.chartGroupBottom!.classList.contains("invisible")).toBeFalsy();
        });

        it("changes data text style via formatting options", () => {
            dataView.metadata.objects = {
                dualKpiTitleFormatting: {
                    titleFontSizeAutoFormatting: false,
                    isBold: true
                },
                dualKpiValueFormatting: {
                    titleFontSizeAutoFormatting: false,
                    isItalic: true
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);
            expect(getComputedStyle(visualBuilder.titleTop!).fontWeight).toMatch("^((bold)|(700))$");
            expect(getComputedStyle(visualBuilder.textTop!).fontStyle).toBe("italic");
        });

        it("check value format", () => {
            const precision = 3;
            const displayUnits = 1000;
            dataView.metadata.objects = {
                dualKpiValueFormatting: {
                    displayUnits: displayUnits,
                    precision: precision
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.textTop!.textContent!.split(".").pop()!.length).toBe(precision + 1);
            expect(visualBuilder.textTop!.textContent!).toContain("K");
        });
    });
});

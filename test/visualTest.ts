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

// powerbi.extensibility.utils.test
import { assertColorsMatch, getSolidColorStructuralObject, d3MouseMove } from "powerbi-visuals-utils-testutils";

import { VisualData, getRandomHexColor } from "./visualData";
import { VisualBuilder } from "./visualBuilder";
import { minMax } from "../src/helper";

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

    describe("Capabilities tests", () => {
        it("all items having displayName should have displayNameKey property", () => {
            jasmine.getJSONFixtures().fixturesPath = "base";

            let jsonData = getJSONFixture("capabilities.json");

            let objectsChecker: Function = (obj) => {
                for (let property in obj) {
                    let value: any = obj[property];

                    if (value.displayName) {
                        expect(value.displayNameKey).toBeDefined();
                    }

                    if (typeof value === "object") {
                        objectsChecker(value);
                    }
                }
            };

            objectsChecker(jsonData);
        });
    });

    describe("DOM tests", () => {
        it("svg element created", () => expect(visualBuilder.mainElement[0]).toBeInDOM());

        it("update", (done) => {
            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.chartGroup.children("path.area"))
                    .toBeInDOM();
                expect(visualBuilder.chartGroup.children("g.axis").children("g.tick").length)
                    .toBe(4);
                done();
            });
        });

        it("update with null values", (done) => {
            dataView.categorical.categories[0].values[0] = null;
            dataView.categorical.values[0].values[0] = null;

            visualBuilder.updateRenderTimeout(dataView, () => {
                expect(visualBuilder.chartGroup.children("path.area")).toBeInDOM();
                done();
            }, DefaultWaitForRender);
        });

        it("changed data with high contrast on", () => {
            let dataColorTop: string = getRandomHexColor(),
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

            let topChartGroup: JQuery = visualBuilder.chartGroup.first(),
                topGroup: JQuery = visualBuilder.group.first(),
                opacityStringTop: string = $(topChartGroup).children("path.area").css("opacity"),
                opacityTop: number = Math.round(parseFloat(opacityStringTop) * 10) / 10;

            expect(opacityTop).toBe(chartOpacityTop / 100);
            assertColorsMatch($(topChartGroup).children("path.area").css("fill"), "#000000");
            assertColorsMatch($(topGroup).children("text.data-title").css("fill"), "#000000");
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

            let topChartGroup: JQuery = visualBuilder.chartGroup.first(),
                topGroup: JQuery = visualBuilder.group.first(),
                bottomChartGroup: JQuery = visualBuilder.chartGroup.last(),
                bottomGroup: JQuery = visualBuilder.group.last();

            let opacityStringTop: string = $(topChartGroup).children("path.area").css("opacity"),
                opacityTop: number = Math.round(parseFloat(opacityStringTop) * 10) / 10,
                opacityStringBottom: string = $(bottomChartGroup).children("path.area").css("opacity"),
                opacityBottom: number = Math.round(parseFloat(opacityStringBottom) * 10) / 10;

            expect(opacityTop).toBe(chartOpacityTop / 100);
            assertColorsMatch($(topChartGroup).children("path.area").css("fill"), dataColorTop);
            assertColorsMatch($(topGroup).children("text.data-title").css("fill"), textColorTop);

            expect(opacityBottom).toBe(chartOpacityBottom / 100);
            assertColorsMatch($(bottomChartGroup).children("path.area").css("fill"), dataColorBottom);
            assertColorsMatch($(bottomGroup).children("text.data-title").css("fill"), textColorBottom);
        });

        it("hovering data area should make hover mode elements visible", () => {
            visualBuilder.updateFlushAllD3Transitions(dataView);
            d3MouseMove(visualBuilder.chartGroup.children("path.area"), 100, 100);

            expect(visualBuilder.chartGroup.children("line").first().attr("class").indexOf("invisible") < 0).toBeTruthy();
            expect(visualBuilder.chartGroup.children("g.hover-data-container").first().attr("class").indexOf("invisible") < 0).toBeTruthy();
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

            expect(visualBuilder.chartGroup.first().children("path.zero-axis").attr("class").indexOf("hidden") < 0).toBeTruthy();
            expect(visualBuilder.chartGroup.last().children("path.zero-axis").attr("class").indexOf("hidden") >= 0).toBeTruthy();
        });

        xit("should show title tooltip", () => {
            let topChartToolTipText: string = "Top metric name";
            dataView.metadata.objects = {
                dualKpiProperties: {
                    topChartToolTipText: topChartToolTipText
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);
            expect(visualBuilder.group.children("title").first().text().indexOf(topChartToolTipText) >= 0).toBeTruthy();
            expect(visualBuilder.group.children("text.data-value").first().text().indexOf("k") < 0).toBeTruthy();

            dataView.metadata.objects = {
                dualKpiProperties: {
                    abbreviateValues: true
                }
            };

            visualBuilder.updateFlushAllD3Transitions(dataView);
            expect(visualBuilder.group.children("text.data-value").first().text().indexOf("k") >= 0).toBeTruthy();
        });

        it("charts labels should not overlap", () => {
            let builder: VisualBuilder = new VisualBuilder(250, 150);
            builder.updateFlushAllD3Transitions(dataView);

            let topTitleRect: ClientRect = visualBuilder.group.children("text.data-value").first()[0].getBoundingClientRect(),
                bottomTitleRect: ClientRect = visualBuilder.group.children("text.data-value").last()[0].getBoundingClientRect(),
                topTitleValueRect: ClientRect = visualBuilder.group.children("text.data-title").first()[0].getBoundingClientRect(),
                bottomTitleValueRect: ClientRect = visualBuilder.group.children("text.data-title").first()[0].getBoundingClientRect();

            expect(topTitleValueRect.top).not.toBeGreaterThan(topTitleRect.bottom);
            expect(bottomTitleValueRect.top).not.toBeGreaterThan(bottomTitleRect.bottom);
            expect(topTitleValueRect.bottom).not.toBeGreaterThan(bottomTitleRect.top);

            builder = new VisualBuilder(500, 300);
            builder.updateFlushAllD3Transitions(dataView);

            topTitleRect = visualBuilder.group.children("text.data-value").first()[0].getBoundingClientRect(),
                bottomTitleRect = visualBuilder.group.children("text.data-value").last()[0].getBoundingClientRect(),
                topTitleValueRect = visualBuilder.group.children("text.data-title").first()[0].getBoundingClientRect(),
                bottomTitleValueRect = visualBuilder.group.children("text.data-title").first()[0].getBoundingClientRect();

            expect(topTitleValueRect.top).not.toBeGreaterThan(topTitleRect.bottom);
            expect(bottomTitleValueRect.top).not.toBeGreaterThan(bottomTitleRect.bottom);
            expect(topTitleValueRect.bottom).not.toBeGreaterThan(bottomTitleRect.top);

            builder = new VisualBuilder(1000, 500);
            builder.updateFlushAllD3Transitions(dataView);

            topTitleRect = visualBuilder.dataTitleValue.first()[0].getBoundingClientRect(),
                bottomTitleRect = visualBuilder.dataTitleValue.last()[0].getBoundingClientRect(),
                topTitleValueRect = visualBuilder.dataTitle.first()[0].getBoundingClientRect(),
                bottomTitleValueRect = visualBuilder.dataTitle.first()[0].getBoundingClientRect();

            expect(topTitleValueRect.top).not.toBeGreaterThan(topTitleRect.bottom);
            expect(bottomTitleValueRect.top).not.toBeGreaterThan(bottomTitleRect.bottom);
            expect(topTitleValueRect.bottom).not.toBeGreaterThan(bottomTitleRect.top);
        });

        it("switches off KPI values via formatting options", () => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    showKpiValues: false
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect((<any>(visualBuilder.group)).visible).toBeFalsy();
        });

        it("shows short style tooltip for KPI group via formatting options", () => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    shortKpiTooltip: true
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.title.text().indexOf("change since")).toBeLessThan(0);
        });

        it("shows single chart if switch display chart is checked", () => {
            dataView.metadata.objects = {
                dualKpiProperties: {
                    bottomChartShow: false,
                    topChartShow: true
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.chartGroupTop.first().attr("class").indexOf("invisible") < 0).toBeTruthy();
            expect(visualBuilder.chartGroupBottom.first().attr("class").indexOf("invisible") < 0).toBeFalsy();

            dataView.metadata.objects = {
                dualKpiProperties: {
                    bottomChartShow: true,
                    topChartShow: false
                }
            };
            visualBuilder.updateFlushAllD3Transitions(dataView);

            expect(visualBuilder.chartGroupTop.first().attr("class").indexOf("invisible") < 0).toBeFalsy();
            expect(visualBuilder.chartGroupBottom.first().attr("class").indexOf("invisible") < 0).toBeTruthy();
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
            expect(visualBuilder.dataTitle.first().css("font-weight")).toMatch("^((bold)|(700))$");
            expect(visualBuilder.dataTitleValue.first().css("font-style")).toBe("italic");
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
            expect(visualBuilder.dataTitleValue.first().text().split(".").pop().length).toBe(precision + 1);
            expect(visualBuilder.dataTitleValue.first().text().indexOf("K")).toBeGreaterThan(-1);
        });
    });
});

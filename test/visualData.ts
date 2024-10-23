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
import { getRandomNumbers, testDataViewBuilder } from "powerbi-visuals-utils-testutils";
import TestDataViewBuilder = testDataViewBuilder.TestDataViewBuilder;

// powerbi.extensibility.utils.type
import { valueType } from "powerbi-visuals-utils-typeutils";
import ValueType = valueType.ValueType;

export class VisualData extends TestDataViewBuilder {
    public static ColumnAxis: string = "Axis";
    public static ColumnTopValue: string = "Top value";
    public static ColumnBottomValue: string = "Bottom value";

    public valuesAxis = getRandomUniqueSortedDates(100, new Date(2014, 0, 1), new Date(2015, 5, 10));
    public valuesTopValues: number[] = getRandomNumbers(this.valuesAxis.length, 20000, 60000);
    public valuesBottomValues: number[] = getRandomNumbers(this.valuesAxis.length, 1000, 18000);

    public getDataView(columnNames?: string[], emptyValues: boolean = false): DataView {
        return this.createCategoricalDataViewBuilder([
            {
                source: {
                    displayName: VisualData.ColumnAxis,
                    format: "%M/%d/yyyy",
                    type: ValueType.fromDescriptor({ dateTime: true }),
                    roles: { axis: true }
                },
                values: this.valuesAxis
            }
        ], [
                {
                    source: {
                        displayName: VisualData.ColumnTopValue,
                        type: ValueType.fromDescriptor({ numeric: true }),
                        roles: { topvalues: true }
                    },
                    values: this.valuesTopValues
                },
                {
                    source: {
                        displayName: VisualData.ColumnBottomValue,
                        type: ValueType.fromDescriptor({ numeric: true }),
                        roles: { bottomvalues: true }
                    },
                    values: this.valuesBottomValues
                }
            ], <string[]>columnNames).build();
    }
}

export function getRandomHexColor(): string {
    // 16777215 in hex is FFFFFF
    const value = Math.floor(Math.random() * (16777215 + 1))
    const hex = value.toString(16);
    return "#" + hex.padStart(6, "0");
}

function getRandomUniqueSortedDates(count: number, start: Date, end: Date): Date[] {
    return getRandomUniqueDates(count, start, end).sort((a, b) => a.getTime() - b.getTime());
}

function getRandomUniqueDates(count: number, start: Date, end: Date): Date[] {
    return getRandomUniqueNumbers(count, start.getTime(), end.getTime()).map(x => new Date(x));
}

function getRandomUniqueNumbers(count: number, min: number = 0, max: number = 1): number[] {
    let result: number[] = [];
    for (let i = 0; i < count; i++) {
        result.push(getRandomNumber(min, max, result));
    }

    return result;
}

function getRandomNumber(
    min: number,
    max: number,
    exceptionList?: number[],
    changeResult: (num) => number = x => x): number {
    let result = changeResult(Math.random() * (max - min) + min);
    if (exceptionList && exceptionList.length && exceptionList.indexOf(result) > -1) {
        return getRandomNumber(min, max, exceptionList);
    }

    return result;
}


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

// powerbi
import powerbi from "powerbi-visuals-api";

// powerbi.extensibility
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;

// powerbi.extensibility.utils.test
import { VisualBuilderBase } from "powerbi-visuals-utils-testutils";

import { DualKpi } from "../src/visual";

export class VisualBuilder extends VisualBuilderBase<DualKpi> {
    constructor(width: number, height: number) {
        super(width, height);
    }

    public get mainElement() {
        return this.element.children("svg.dualKpi");
    }

    public get chartGroup() {
        return this.mainElement.children("g.chartGroup");
    }

    public get group() {
        return this.chartGroup.children("g.group");
    }

    public get dataArea() {
        return this.group.children("path.area");
    }

    public get dataTitle() {
        return this.group.children("text.data-title");
    }

    public get dataTitleValue() {
        return this.group.children("text.data-value");
    }

    public get title() {
        return this.group.children("title");
    }

    public get chartGroupTop() {
        return this.mainElement.children("g.chartGroupTop");
    }

    public get chartGroupBottom() {
        return this.mainElement.children("g.chartGroupBottom");
    }

    public get instance(): DualKpi {
        return this.visual;
    }

    protected build(options: VisualConstructorOptions): DualKpi {
        return new DualKpi(options);
    }
}

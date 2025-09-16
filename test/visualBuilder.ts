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

    public get mainElement(): SVGSVGElement {
        return this.element.querySelector("svg.dualKpi")!;
    }

    public get chartGroups(): SVGGElement[] {
        return Array.from(this.mainElement.querySelectorAll("g.chartGroup"));
    }

    public get groups(): SVGGElement[] {
        return this.chartGroups.map((chartGroup) => chartGroup.querySelector("g.group") as SVGGElement);
    }

    public get pathAreas() {
        return this.chartGroups.map((chartGroup) => chartGroup.querySelector("path.area") as SVGPathElement);
    }

    public get axis(): SVGGElement[] {
        return this.chartGroups.map((chartGroup) => chartGroup.querySelector("g.axis") as SVGGElement);
    }

    public get axisTicks(): SVGGElement[] {
        const axis = this.axis.map((axis) => Array.from(axis.querySelectorAll<SVGGElement>("g.tick")));
        return axis.reduce((acc, val) => acc.concat(val), []);
    }

    public get chartGroupTop(): SVGGElement | null {
        return this.mainElement.querySelector("g.chartGroupTop") as SVGGElement;
    }

    public get chartGroupBottom(): SVGGElement | null {
        return this.mainElement.querySelector("g.chartGroupBottom");
    }

    public get groupTop(): SVGGElement | null {
        if (!this.chartGroupTop) {
            return null;
        }
        return this.chartGroupTop.querySelector("g.group") as SVGGElement;
    }

    public get groupBottom(): SVGGElement | null {
        if (!this.chartGroupBottom) {
            return null;
        }
        return this.chartGroupBottom.querySelector("g.group") as SVGGElement;
    }

    public get pathAreaTop(): SVGPathElement | null {
        if (!this.chartGroupTop) {
            return null;
        }
        return this.chartGroupTop.querySelector("path.area") as SVGPathElement;4
    }

    public get pathAreaBottom(): SVGPathElement | null {
        if (!this.chartGroupBottom) {
            return null;
        }
        return this.chartGroupBottom.querySelector("path.area") as SVGPathElement;
    }

    public get titleTop(): SVGTitleElement | null {
        if (!this.groupTop) {
            return null;
        }
        return this.groupTop.querySelector<SVGTitleElement>("text.data-title");
    }

    public get titleBottom(): SVGTitleElement | null {
        if (!this.groupBottom) {
            return null;
        }
        return this.groupBottom.querySelector<SVGTitleElement>("text.data-title");
    }

    public get textTop(): SVGTextElement | null {
        if (!this.groupTop) {
            return null;
        }
        return this.groupTop.querySelector<SVGTextElement>("text.data-value");
    }

    public get textBottom(): SVGTextElement | null {
        if (!this.groupBottom) {
            return null;
        }
        return this.groupBottom.querySelector<SVGTextElement>("text.data-value");
    }

    public get chartTitle(): HTMLElement | null {
        if(!this.mainElement) {
            return null;
        }
        return this.mainElement.querySelector<HTMLElement>("text.title");
    }

    protected build(options: VisualConstructorOptions): DualKpi {
        return new DualKpi(options);
    }
}

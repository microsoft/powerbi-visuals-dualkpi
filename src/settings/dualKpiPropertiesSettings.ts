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

namespace powerbi.extensibility.visual {
    export enum PercentType {
        lastDate = <any>"lastDate",
        firstDate = <any>"firstDate",
        previousDate = <any>"previousDate"
    }

    export class DualKpiPropertiesSettings {
        public topChartShow: boolean = true;
        public bottomChartShow: boolean = true;
        public titleText: string = "Title";
        public abbreviateValues: boolean = false;
        public abbreviateHoverValues: boolean = false;
        public shortKpiTooltip: boolean = false;
        public hoverDataPercentType: PercentType = PercentType.lastDate;
        public topChartToolTipText: string = "";
        public bottomChartToolTipText: string = "";
        public warningTooltipText: string = "Warning message";
        public showStaleDataWarning: boolean = true;
        public staleDataTooltipText: string = "";
        public staleDataThreshold: number = 2;
        public topPercentCalcDate: Date = null;
        public bottomPercentCalcDate: Date = null;
    }
}
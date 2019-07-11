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
import {
    TooltipEventArgs, TooltipServiceWrapper as OriginalTooltipServiceWrapper
} from "powerbi-visuals-utils-tooltiputils";

// powerbi.extensibility
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

// powerbi.visuals
import ISelectionId = powerbi.visuals.ISelectionId;
type Selection = d3.Selection<any, any, any, any>;

export const CustomTooltipSeviceWrapper = OriginalTooltipServiceWrapper;
(<any>CustomTooltipSeviceWrapper).prototype.touchEndEventName = function () {
    let eventName: string = "touchend";

    if (window["PointerEvent"]) {
        // IE11
        eventName = "pointerup";
    }

    return eventName;
};
CustomTooltipSeviceWrapper.prototype.addTooltip = function <T>(
    selection: Selection,
    getTooltipInfoDelegate: (args: TooltipEventArgs<T>) => VisualTooltipDataItem[],
    getDataPointIdentity?: (args: TooltipEventArgs<T>) => ISelectionId,
    reloadTooltipDataOnMouseMove?: boolean
): void {
    if (!selection || !this.visualHostTooltipService.enabled()) {
        return;
    }

    let rootNode: Element = this.rootElement;

    // Mouse events
    selection.on("mouseover.tooltip", () => {
        // Ignore mouseover while handling touch events
        if (!this.canDisplayTooltip()) {
            return;
        }

        let tooltipEventArgs = this.makeTooltipEventArgs(rootNode, true, false);
        if (!tooltipEventArgs) {
            return;
        }

        let tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);
        if (tooltipInfo == null) {
            return;
        }

        let selectionIds: ISelectionId[] = this.getSelectionIds(tooltipEventArgs, getDataPointIdentity);

        this.visualHostTooltipService.show({
            coordinates: tooltipEventArgs.coordinates,
            isTouchEvent: false,
            dataItems: tooltipInfo,
            identities: selectionIds
        });
    });

    selection.on("mouseout.tooltip", () => {
        this.visualHostTooltipService.hide({
            isTouchEvent: false,
            immediately: false,
        });
    });

    selection.on("mousemove.tooltip", () => {
        // Ignore mousemove while handling touch events
        if (!this.canDisplayTooltip()) {
            return;
        }

        let tooltipEventArgs = this.makeTooltipEventArgs(rootNode, true, false);
        if (!tooltipEventArgs) {
            return;
        }

        let tooltipInfo: VisualTooltipDataItem[];
        if (reloadTooltipDataOnMouseMove) {
            tooltipInfo = getTooltipInfoDelegate(tooltipEventArgs);

            if (tooltipInfo == null) {
                return;
            }
        }

        let selectionIds: ISelectionId[] = this.getSelectionIds(tooltipEventArgs, getDataPointIdentity);

        this.visualHostTooltipService.move({
            coordinates: tooltipEventArgs.coordinates,
            isTouchEvent: false,
            dataItems: tooltipInfo,
            identities: selectionIds
        });
    });

    // --- Touch events ---
    let touchEndEventName: string = this.touchEndEventName();
    selection.on(touchEndEventName + ".tooltip", () => {
        if (this.handleTouchTimeoutId) {
            clearTimeout(this.handleTouchTimeoutId);
        }

        // At the end of touch action, set a timeout that will let us to ignore the incoming mouse events for a small amount of time
        // TODO: any better way to do this?
        this.handleTouchTimeoutId = window.setTimeout(() => {
            this.handleTouchTimeoutId = undefined;
        }, this.handleTouchDelay);
    });
};
CustomTooltipSeviceWrapper.bind(OriginalTooltipServiceWrapper);

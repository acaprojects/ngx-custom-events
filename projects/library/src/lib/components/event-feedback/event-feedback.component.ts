import { Component, ElementRef, Renderer2, AfterViewInit, Input, OnDestroy, HostListener } from '@angular/core';

declare global {
    interface Window {
        TouchEvent: any;
    }
}

@Component({
    selector: '[feedback]',
    templateUrl: `./event-feedback.component.html`,
    styleUrls: [`./event-feedback.component.scss`]
})
export class EventFeedbackComponent implements AfterViewInit, OnDestroy {
    /** CSS class to add to the root element of the component */
    @Input() public klass = 'default';
    /** Whether feedback radiates from the center of the element or the event location */
    @Input() public center = false;

    /** Whether to show the event feedback element */
    public show: boolean;
    /** Whether to event feedback element is animating */
    public transitioning: boolean;
    /** Whether to release happened before animation has finished */
    public cancelled: boolean;
    /** Offset position of the feedback element */
    public position = { left: '50%', top: '50%' };
    /** Size of the feedback element */
    public size = 64;
    /** Mouse release event listener callback */
    private mouse_release_cancel: () => void;
    /** Touch release event listener callback */
    private touch_release_cancel: () => void;
    /** Cached bounding box of the parent element */
    private cached_box: ClientRect;

    @HostListener('mousedown', ['$event'])
    public handleMouse(e: MouseEvent) { this.handleEvent(e); }

    @HostListener('touchstart', ['$event'])
    public handleTouch(e: any) { this.handleEvent(e); }

    constructor(private element: ElementRef<HTMLElement>, private renderer: Renderer2) {}

    ngOnInit(): void {}

    public ngAfterViewInit(): void {
        setTimeout(() => {
            if (this.element && this.element.nativeElement) {
                const el = this.element.nativeElement;
                this.cached_box = el.getBoundingClientRect();
                this.size = Math.ceil(Math.max(this.cached_box.height, this.cached_box.width) * 1.5);
            }
        });
    }

    public ngOnDestroy(): void {
        // Clear event listeners
        if (this.mouse_release_cancel) {
            this.mouse_release_cancel();
            this.mouse_release_cancel = null;
        }
        if (this.touch_release_cancel) {
            this.touch_release_cancel();
            this.touch_release_cancel = null;
        }
    }

    /**
     * Handle touchstart/mousedown event
     * @param event Event to handle
     */
    private handleEvent(event: any) {
        this.cancelled = false;
        const center = {
            x: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientX : (event as MouseEvent).clientX,
            y: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientY : (event as MouseEvent).clientY
        };
        this.show = true;
        if (!this.cached_box) {
            this.cached_box = this.element.nativeElement.getBoundingClientRect();
            this.size = Math.ceil(Math.max(this.cached_box.height, this.cached_box.width) * 1.5);
        }
        this.position = !this.center
            ? { top: `${center.y - this.cached_box.top}px`, left: `${center.x - this.cached_box.left}px` }
            : { top: '50%', left: '50%' };
        this.mouse_release_cancel = this.renderer.listen('window', 'mouseup', e => this.handleRelease(e));
        this.touch_release_cancel = this.renderer.listen('window', 'touchend', e => this.handleRelease(e));
        this.transitioning = true;
        setTimeout(() => {
            this.transitioning = false;
            if (this.cancelled) {
                this.show = false;
            }
        }, 350);
    }

    /**
     * Handle touchend/mouseup event
     * @param event Event to handle
     */
    private handleRelease(event: any) {
        if (!this.transitioning) {
            this.show = false;
        } else {
            this.cancelled = true;
        }
        if (this.mouse_release_cancel) {
            this.mouse_release_cancel();
            this.mouse_release_cancel = null;
        }
        if (this.touch_release_cancel) {
            this.touch_release_cancel();
            this.touch_release_cancel = null;
        }
    }
}

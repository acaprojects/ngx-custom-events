import { Directive, EventEmitter, ElementRef, Renderer2, AfterViewInit, OnDestroy, Output } from '@angular/core';
// import { CUSTOM_EVENT_LIST } from '../services/custom-event.service';

// CUSTOM_EVENT_LIST.push({
//     id: 'tapped',
//     add: (e, cb) => TappedDirective.add(e, cb),
//     remove: (e, cb) => TappedDirective.remove(e, cb)
// });
// CUSTOM_EVENT_LIST.push({
//     id: 'touchrelease',
//     add: (e, cb) => TappedDirective.add(e, cb),
//     remove: (e, cb) => TappedDirective.remove(e, cb)
// });


declare global {
    interface Window {
        TouchEvent: any;
    }
}

@Directive({
    selector: '[tapped] , [touchrelease]',
    outputs: ['tapped', 'touchrelease']
})
export class TappedDirective implements AfterViewInit, OnDestroy {
    /** Event emitter for tapped user events */
    @Output() public tapped = new EventEmitter<TouchEvent | MouseEvent>();
    /** Event emitter for touchrelease user events */
    @Output() public touchrelease = new EventEmitter<TouchEvent | MouseEvent>();
    /** Pointer movement tolerance for event in pixels */
    public tolerance = 40;
    /** Maximum delay in millisecond that the event is cancelled */
    public max_delay = 1000;
    /** Pointer initiation point */
    private start = { x: -999, y: -999 };
    /** Pointer initiation point */
    private timer: number = null;

    /** Store for event timer */
    private event_timer: number = null;

    private mouse_listener: () => void;
    private mouse_cancel: () => void;
    private touch_listener: () => void;
    private touch_cancel: () => void;

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    public ngAfterViewInit(): void {
        if (this.el && this.el.nativeElement) {
            this.mouse_listener = this.renderer.listen(this.el.nativeElement, 'mousedown', e => this.handleHold(e));
            this.touch_listener = this.renderer.listen(this.el.nativeElement, 'touchstart', e => this.handleHold(e));
        }
    }

    public ngOnDestroy(): void {
        if (this.mouse_listener) {
            this.mouse_listener();
            this.mouse_listener = null;
        }
        if (this.touch_listener) {
            this.touch_listener();
            this.touch_listener = null;
        }
        this.remove();
        this.start = { x: -999, y: -999 };
    }

    /**
     * Remove event listeners for "tapped"/"touchrelease" event handling
     */
    public remove() {
        if (this.mouse_cancel) {
            this.mouse_cancel();
            this.mouse_cancel = null;
        }
        if (this.touch_cancel) {
            this.touch_cancel();
            this.touch_cancel = null;
        }
    }

    /**
     * Handle start of "tapped"/"touchrelease" event
     * @param event Start event object
     */
    public handleHold(event: any) {
        const center = {
            x: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientX : (event as MouseEvent).clientX,
            y: window.TouchEvent && event instanceof TouchEvent ? event.touches[0].clientY : (event as MouseEvent).clientY
        };
        this.start = center;
        this.mouse_listener = this.renderer.listen(window, 'mouseup', e => this.handleRelease(e));
        this.touch_listener = this.renderer.listen(window, 'touchend', e => this.handleRelease(e));
        // Add timeout for ending the event
        this.timer = setTimeout(() => this.remove(), this.max_delay) as any;
    }

    /**
     * Handle end of "tapped"/"touchrelease" event
     * @param event End event object
     */
    public handleRelease(event: any) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.timer = setTimeout(() => {
            const start = this.start;
            const center = {
                x: TouchEvent && event instanceof TouchEvent ? event.touches[0].clientX : (event as MouseEvent).clientX,
                y: TouchEvent && event instanceof TouchEvent ? event.touches[0].clientY : (event as MouseEvent).clientY
            };
            const distance = Math.sqrt(Math.pow(center.x - start.x, 2) + (center.y - start.y, 2));
            // Emit event if the distance is within the tolerence
            if (distance < this.tolerance) {
                if (this.event_timer) {
                    clearTimeout(this.event_timer);
                    this.event_timer = null;
                }
                this.event_timer = setTimeout(() => {
                    this.tapped.emit(event);
                    this.touchrelease.emit(event);
                }, 100) as any;
            }
            this.start = { x: -999, y: -999 };
        }, 50) as any;
    }
}

import { Directive, EventEmitter, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';
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

@Directive({
    selector: '[tapped] , [touchrelease]',
    outputs: ['tapped', 'touchrelease']
})
export class TappedDirective implements AfterViewInit, OnDestroy {
    /** Pointer movement tolerance for event in pixels */
    public static tolerance = 40;
    /** Maximum delay in millisecond that the event is cancelled */
    public static max_delay = 1000;
    /** Pointer initiation point */
    private static start = { x: -999, y: -999 };
    /** Pointer initiation point */
    private static timer: number = null;

    /** Event emitter for "tapped" events */
    public tapped = new EventEmitter<MouseEvent | TouchEvent>();
    /** Event emitter for "touchrelease" events */
    public touchrelease = new EventEmitter<MouseEvent | TouchEvent>();

    /** Store for event timer */
    private event_timer: number = null;

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    public ngAfterViewInit(): void {
        if (this.el && this.el.nativeElement) {
            TappedDirective.add(this.el.nativeElement, e => this.handleEvent(e));
        }
    }

    public ngOnDestroy(): void {
        TappedDirective.remove(this.el.nativeElement);
    }

    /**
     * Emits that a "Tapped" or "TouchRelease" has occurred
     * @param e Event object
     */
    public handleEvent(e: MouseEvent | TouchEvent) {
        if (this.event_timer) {
            clearTimeout(this.event_timer);
            this.event_timer = null;
        }
        this.event_timer = <any>setTimeout(() => {
            this.tapped.emit(e);
            this.touchrelease.emit(e);
        }, 100);
    }

    /**
     * Add required listeners for the handling "tapped"/"touchrelease" events
     * @param el HTML element to listen for events on
     */
    public static add(el: HTMLElement, callback?: (e) => void) {
        el.addEventListener('mousedown', e => TappedDirective.handleHold(e, callback));
        el.addEventListener('touchstart', e => TappedDirective.handleHold(e, callback));
    }

    /**
     * Remove event listeners for "tapped"/"touchrelease" event handling
     * @param el HTML element to remove for event listeners
     */
    public static remove(el: HTMLElement, callback?: (e) => void) {
        el.removeEventListener('mousedown', callback);
        el.removeEventListener('touchstart', callback);
        el.removeEventListener('mouseup', callback);
        el.removeEventListener('touchend', callback);
        TappedDirective.start = { x: -999, y: -999 };
    }

    /**
     * Handle start of "tapped"/"touchrelease" event
     * @param event Start event object
     */
    public static handleHold(event: MouseEvent | TouchEvent, callback?: (e) => void) {
        const center = {
            x: event instanceof TouchEvent ? event.touches[0].clientX : event.clientX,
            y: event instanceof TouchEvent ? event.touches[0].clientY : event.clientY
        };
        TappedDirective.start = center;
        event.target.addEventListener('mouseup', (e: any) => TappedDirective.handleRelease(e, callback));
        event.target.addEventListener('touchend', (e: any) => TappedDirective.handleRelease(e, callback));
        // Add timeout for ending the event
        TappedDirective.timer = <any>(
            setTimeout(() => TappedDirective.remove(event.target as HTMLElement), TappedDirective.max_delay)
        );
    }

    /**
     * Handle end of "tapped"/"touchrelease" event
     * @param event End event object
     */
    public static handleRelease(event: MouseEvent | TouchEvent, callback?: (e) => void) {
        if (TappedDirective.timer) {
            clearTimeout(TappedDirective.timer);
            TappedDirective.timer = null;
        }
        TappedDirective.timer = <any>setTimeout(() => {
            const start = TappedDirective.start;
            if (event instanceof TouchEvent && event.touches.length === 0) {
                event = new MouseEvent('mouseup', { clientX: start.x, clientY: start.y });
            }
            const center = {
                x: event instanceof TouchEvent ? event.touches[0].clientX : event.clientX,
                y: event instanceof TouchEvent ? event.touches[0].clientY : event.clientY
            };
            const distance = Math.sqrt(Math.pow(center.x - start.x, 2) + (center.y - start.y, 2));
            // Emit event if the distance is within the tolerence
            if (distance < TappedDirective.tolerance) {
                if (callback && callback instanceof Function) {
                    callback(event);
                } else {
                    event.target.dispatchEvent(new Event('tapped'));
                    event.target.dispatchEvent(new Event('touchrelease'));
                }
            }
            TappedDirective.start = { x: -999, y: -999 };
        }, 50);
    }
}

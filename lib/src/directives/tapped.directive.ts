import {
    Directive,
    EventEmitter,
    ElementRef,
    Renderer2,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { CUSTOM_EVENT_LIST } from '../services/custom-event.service';

CUSTOM_EVENT_LIST.push({
    id: 'tapped',
    add: (e, cb) => TappedDirective.add(e, cb),
    remove: (e, cb) => TappedDirective.remove(e, cb)
});
CUSTOM_EVENT_LIST.push({
    id: 'touchrelease',
    add: (e, cb) => TappedDirective.add(e, cb),
    remove: (e, cb) => TappedDirective.remove(e, cb)
});

@Directive({
    selector: '[tapped] , [touchrelease]',
    outputs: ['tapped', 'touchrelease']
})
export class TappedDirective implements AfterViewInit, OnDestroy {
    /** Pointer movement tolerance for event in pixels */
    public static tolerance = 40;
    /** Pointer initiation point */
    private static start = { x: -999, y: -999 };

    /** Event emitter for "tapped" events */
    public tapped = new EventEmitter<MouseEvent | TouchEvent>();
    /** Event emitter for "touchrelease" events */
    public touchrelease = new EventEmitter<MouseEvent | TouchEvent>();

    /** Unlisten method for the "tapped" event */
    private _tapped_listen: () => void;
    /** Unlisten method for the "touchrelease" event */
    private _touchrelease_listen: () => void;
    /** Handle event timer */
    private event_timer: number;

    constructor(private el: ElementRef, private renderer: Renderer2) {}

    public ngAfterViewInit(): void {
        if (this.el && this.el.nativeElement) {
            this._tapped_listen = this.renderer.listen(
                this.el.nativeElement,
                'tapped',
                e => this.handleEvent(e)
            );
            this._touchrelease_listen = this.renderer.listen(
                this.el.nativeElement,
                'touchrelease',
                e => this.handleEvent(e)
            );
            TappedDirective.add(this.el.nativeElement);
        }
    }

    public ngOnDestroy(): void {
        if (this._tapped_listen) {
            this._tapped_listen();
            this._tapped_listen = null;
        }
        if (this._touchrelease_listen) {
            this._touchrelease_listen();
            this._touchrelease_listen = null;
        }
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
        }, 50);
    }

    /**
     * Add required listeners for the handling "tapped"/"touchrelease" events
     * @param el HTML element to listen for events on
     */
    public static add(el: HTMLElement, callback?: (e) => void) {
        el.addEventListener('mousedown', e =>
            TappedDirective.handleHold(e, callback)
        );
        el.addEventListener('touchstart', e =>
            TappedDirective.handleHold(e, callback)
        );
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
    public static handleHold(
        event: MouseEvent | TouchEvent,
        callback?: (e) => void
    ) {
        const center = {
            x:
                event instanceof MouseEvent
                    ? event.clientX
                    : event.touches[0].clientX,
            y:
                event instanceof MouseEvent
                    ? event.clientY
                    : event.touches[0].clientY
        };
        TappedDirective.start = center;
        event.target.addEventListener('mouseup', (e: any) =>
            TappedDirective.handleRelease(e, callback)
        );
        event.target.addEventListener('touchend', (e: any) =>
            TappedDirective.handleRelease(e, callback)
        );
        // Add timeout for ending the event
        setTimeout(
            () => TappedDirective.remove(event.target as HTMLElement),
            1000
        );
    }

    /**
     * Handle end of "tapped"/"touchrelease" event
     * @param event End event object
     */
    public static handleRelease(
        event: MouseEvent | TouchEvent,
        callback?: (e) => void
    ) {
        const center = {
            x:
                event instanceof MouseEvent
                    ? event.clientX
                    : event.touches[0].clientX,
            y:
                event instanceof MouseEvent
                    ? event.clientY
                    : event.touches[0].clientY
        };
        const start = TappedDirective.start;
        const distance = Math.sqrt(
            Math.pow(center.x - start.x, 2) + (center.y - start.y, 2)
        );
        // Emit event if the distance is within the tolerence
        if (distance < TappedDirective.tolerance) {
            console.log('Tapped');
            event.target.dispatchEvent(new Event('tapped'));
            event.target.dispatchEvent(new Event('touchrelease'));
            if (callback && callback instanceof Function) {
                callback(event);
            }
        }
        TappedDirective.start = { x: -999, y: -999 };
    }
}

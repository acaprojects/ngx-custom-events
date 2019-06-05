// import { Injectable, Inject } from '@angular/core';
// import { DOCUMENT } from '@angular/common';
// import { EventManagerPlugin } from '@angular/platform-browser/src/dom/events/event_manager';

// export interface ICustomEvent {
//     /** Name or Identifier of the event. i.e. The name that you bind to */
//     id: string;
//     /** Function for adding listeners to the event */
//     add: CustomEventHandlerFn;
//     /** Function for removing listeners of the event */
//     remove: CustomEventHandlerFn;
// }

// export type CustomEventHandlerFn = (
//     el: HTMLElement,
//     callback: (e) => void
// ) => void;

// export const CUSTOM_EVENT_LIST: ICustomEvent[] = [];

// @Injectable()
// export class CustomEventsPlugin extends EventManagerPlugin {
//     constructor(@Inject(DOCUMENT) doc: any, private console: Console) {
//         super(doc);
//     }

//     public supports(event_name: string): boolean {
//         return !!CUSTOM_EVENT_LIST.find(i => i.id === event_name);
//     }

//     public addEventListener(
//         element: HTMLElement,
//         event_name: string,
//         handler: Function
//     ): Function {
//         event_name = event_name.toLowerCase();
//         const event = CUSTOM_EVENT_LIST.find(i => i.id === event_name);
//         if (event) {
//             const zone = this.manager.getZone();

//             return zone.runOutsideAngular(() => {
//                 // Creating the manager bind events, must be done outside of angular
//                 const callback = function(event) {
//                     zone.runGuarded(function() {
//                         handler(event);
//                     });
//                 };
//                 event.add(element, callback);
//                 return () => {
//                     event.remove(element, callback);
//                 };
//             });
//         } else {
//             this.console.warn(
//                 `The event "${event_name}" cannot be bound as there are no define handlers for it`
//             );
//             return null;
//         }
//     }
// }

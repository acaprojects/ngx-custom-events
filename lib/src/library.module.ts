/**
 * @Author: Alex Sorafumo
 * @Email:  alex@yuion.net
 */

import { CommonModule, DOCUMENT } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { TappedDirective } from './directives/tapped.directive';
// import { CustomEventsPlugin } from './services/custom-event.service';
import { EventFeedbackComponent } from './components/event-feedback/event-feedback.component';

import { LIBRARY_SETTINGS } from './settings';

import * as day_api from 'dayjs';
const dayjs = day_api;

const COMPONENTS: Type<any>[] = [EventFeedbackComponent];
const DIRECTIVES: Type<any>[] = [TappedDirective];

@NgModule({
    declarations: [...COMPONENTS, ...DIRECTIVES],
    imports: [CommonModule],
    // providers: [
    //     {
    //         provide: EVENT_MANAGER_PLUGINS,
    //         useClass: CustomEventsPlugin,
    //         multi: true,
    //         deps: [DOCUMENT, Console]
    //     }
    // ],
    exports: [...COMPONENTS, ...DIRECTIVES]
})
class LibraryModule {
    public static version = '0.2.0';
    private static init = false;
    private build = dayjs(1554641597000);

    constructor() {
        if (!LibraryModule.init) {
            const now = dayjs();
            LibraryModule.init = true;
            const build = now.isSame(this.build, 'd')
                ? `Today at ${this.build.format('h:mmA')}`
                : this.build.format('D MMM YYYY, h:mmA');
            LIBRARY_SETTINGS.version(LibraryModule.version, build);
        }
    }
}

export { LibraryModule as ACA_CUSTOM_EVENTS_MODULE };
export { LibraryModule as CustomEventsModule };

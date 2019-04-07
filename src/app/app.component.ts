import { Component, ViewContainerRef, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { AppService } from './services/app.service';

import * as day_api from 'dayjs';
const dayjs = day_api;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

    public model: { [name: string]: any } = {};

    constructor(private view: ViewContainerRef, private service: AppService) {
    }

    public ngOnInit(): void {
        
    }

}

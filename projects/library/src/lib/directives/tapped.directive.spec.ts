import { Output, Component, EventEmitter, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { TappedDirective } from './tapped.directive';
import { By } from '@angular/platform-browser';

@Component({
    selector: 'mock-component',
    template: '<div (tapped)="tapped.emit($event)" (touchrelease)="touchrelease.emit($event)"></div>'
})
export class MockComponent {
    @Output() public tapped = new EventEmitter();
    @Output() public touchrelease = new EventEmitter();
}

describe('TappedDirective', () => {
    let fixture: ComponentFixture<MockComponent>;
    let component: MockComponent;
    let clock: jasmine.Clock;
    let element: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                MockComponent,
                TappedDirective
            ],
            providers: [],
            imports: [CommonModule]
        }).compileComponents();
        clock = jasmine.clock();
        clock.uninstall();
        clock.install();
        fixture = TestBed.createComponent(MockComponent);
        component = fixture.debugElement.componentInstance;
        spyOn(component.tapped, 'emit');
        spyOn(component.touchrelease, 'emit');
        element = fixture.debugElement.query(By.css('div'));
        fixture.detectChanges();
    });

    afterEach(() => {
        clock.uninstall();
    });

    it('should emit event after click', () => {
        const start = new MouseEvent('mousedown', {});
        const end = new MouseEvent('mouseup', {});
        element.triggerEventHandler('mousedown', start);
        clock.tick(100);
        window.dispatchEvent(end);
        clock.tick(200);
        expect(component.tapped.emit).toHaveBeenCalledTimes(1);
        expect(component.tapped.emit).toHaveBeenCalledWith(end);
        expect(component.touchrelease.emit).toHaveBeenCalledTimes(1);
        expect(component.touchrelease.emit).toHaveBeenCalledWith(end);
    });

    it('should emit event after tap', () => {
        const start = new TouchEvent('touchstart', { touches: [new Touch({ identifier: 999, target: element.nativeElement })] });
        const end = new TouchEvent('touchend', { touches: [new Touch({ identifier: 999, target: element.nativeElement })] });
        element.triggerEventHandler('touchstart', start);
        clock.tick(100);
        window.dispatchEvent(end);
        clock.tick(200);
        expect(component.tapped.emit).toHaveBeenCalledTimes(1);
        expect(component.tapped.emit).toHaveBeenCalledWith(end);
        expect(component.touchrelease.emit).toHaveBeenCalledTimes(1);
        expect(component.touchrelease.emit).toHaveBeenCalledWith(end);
    });

    it('should cancel event after time', () => {
        const start = new MouseEvent('mousedown', {});
        const end = new MouseEvent('mouseup', {});
        element.triggerEventHandler('mousedown', start);
        clock.tick(500);
        window.dispatchEvent(end);
        expect(component.tapped.emit).toHaveBeenCalledTimes(0);
        expect(component.touchrelease.emit).toHaveBeenCalledTimes(0);
    });

    it('should cancel event if released outside tolerance', () => {
        const start = new MouseEvent('mousedown', {});
        const end = new MouseEvent('mouseup', { clientX: 40, clientY: 40 });
        element.triggerEventHandler('mousedown', start);
        clock.tick(100);
        window.dispatchEvent(end);
        clock.tick(200);
        expect(component.tapped.emit).toHaveBeenCalledTimes(0);
        expect(component.touchrelease.emit).toHaveBeenCalledTimes(0);
    });
});

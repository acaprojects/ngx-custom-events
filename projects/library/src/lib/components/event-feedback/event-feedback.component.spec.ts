import { Component, ViewChild, DebugElement } from "@angular/core";
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { EventFeedbackComponent } from './event-feedback.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

@Component({
    selector: 'mock-component',
    template: '<div feedback>Test</div>'
})
export class MockComponent {
    @ViewChild(EventFeedbackComponent, { static: true })
    public feedback: EventFeedbackComponent;
}

describe('EventFeedbackComponent', () => {
    let fixture: ComponentFixture<MockComponent>;
    let component: MockComponent;
    let clock: jasmine.Clock;
    let element: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                MockComponent,
                EventFeedbackComponent
            ],
            providers: [],
            imports: [CommonModule]
        }).compileComponents();
        clock = jasmine.clock();
        clock.uninstall();
        clock.install();
        fixture = TestBed.createComponent(MockComponent);
        component = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        element = fixture.debugElement.query(By.css('div'));
        clock.tick(1);
    });

    afterEach(() => {
        clock.uninstall();
    });

    it('should show overlay on press', () => {
        const compiled: HTMLDivElement = fixture.debugElement.nativeElement;
        const feedback = compiled.querySelector('.event-feedback');
        expect(feedback).toBeTruthy();
        expect(feedback.className).not.toContain('show');
        element.triggerEventHandler('mousedown', { clientX: 0, clientY: 0 });
        fixture.detectChanges();
        expect(feedback.className).toContain('show');
    });

    it('should hide overlay on release', () => {
        const compiled: HTMLDivElement = fixture.debugElement.nativeElement;
        const feedback = compiled.querySelector('.event-feedback');
        expect(feedback).toBeTruthy();
        element.triggerEventHandler('mousedown', { clientX: 0, clientY: 0 });
        clock.tick(350);
        fixture.detectChanges();
        expect(feedback.className).toContain('show');
        window.dispatchEvent(new MouseEvent('mouseup', { clientX: 0, clientY: 0 }));
        clock.tick(350);
        fixture.detectChanges();
        expect(feedback.className).not.toContain('show');
        expect(feedback.className).toContain('hide');
    });

    it('should handle touch events', () => {
        const compiled: HTMLDivElement = fixture.debugElement.nativeElement;
        const feedback = compiled.querySelector('.event-feedback');
        expect(feedback).toBeTruthy();
        element.triggerEventHandler('touchstart', { clientX: 0, clientY: 0 });
        clock.tick(350);
        fixture.detectChanges();
        expect(feedback.className).toContain('show');
        window.dispatchEvent(new TouchEvent('touchend', { touches: [new Touch({ clientX: 0, clientY: 0, identifier: 10, target: window })] }));
        clock.tick(350);
        fixture.detectChanges();
        expect(feedback.className).not.toContain('show');
        expect(feedback.className).toContain('hide');
    });

    it('should be able to be centered', () => {
        const compiled: HTMLDivElement = fixture.debugElement.nativeElement;
        component.feedback.center = true;
        const feedback: HTMLDivElement = compiled.querySelector('.event-feedback');
        expect(feedback).toBeTruthy();
        fixture.detectChanges();
        expect(feedback.style.top).toBe('50%');
        expect(feedback.style.left).toBe('50%');
    });
});

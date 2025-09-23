import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureTasks } from './feature-tasks';

describe('FeatureTasks', () => {
  let component: FeatureTasks;
  let fixture: ComponentFixture<FeatureTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureTasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureTasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

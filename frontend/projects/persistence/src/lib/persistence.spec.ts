import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Persistence } from './persistence';

describe('Persistence', () => {
  let component: Persistence;
  let fixture: ComponentFixture<Persistence>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Persistence]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Persistence);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
//import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TwincatConnectorService }  from './logger-mock/logger-mock'
import { Logger } from './logger-mock/logger-mock'



describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [TwincatConnectorService,
        Logger
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'twincat-connector'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('twincat-connector');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('twincat-connector app is running!');
  });
});

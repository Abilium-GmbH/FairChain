import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar'; 
import { CustomSnackbarService } from './custom-snackbar.service';

describe('CustomSnackbarService', () => {
  let service: CustomSnackbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[MatSnackBarModule]
    });
    service = TestBed.inject(CustomSnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import {Injectable, NgZone} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CustomSnackbarService {

  constructor(
    private snackBar: MatSnackBar,
    private zone: NgZone
  ) {

  }

  public open(message: string, action = '', duration = 4000): void {
    this.zone.run(() => {
      this.snackBar.open(message, action, { duration });
    });
  }
}

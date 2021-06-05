import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Implements the Snackbar service, a small pop up that advertice when something happens.
 * In our implmentation it is used to give the user a feedback when he tries to add a group
 * with an already existing name. Another use is at the starting of the program, a snackbar
 * appears to the bottom to ask if the user wants to add a logo node with image input.
 *
 */
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

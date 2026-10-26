import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bill } from './bill.model';
import { BillService } from './bill.service';

@Component({
  selector: 'app-bill-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h3>{{ model.id ? 'Edit Bill #' + model.id : 'Generate New Bill' }}</h3>
      <form (ngSubmit)="save()">
        <input name="customerName" [(ngModel)]="model.customerName" placeholder="Customer name" required>
        <input name="meterNo" [(ngModel)]="model.meterNo" placeholder="Meter no." required>
        <input name="previousReading" type="number" [(ngModel)]="model.previousReading" placeholder="Previous reading" required>
        <input name="currentReading" type="number" [(ngModel)]="model.currentReading" placeholder="Current reading" required>
        <br>
        <button type="submit">{{ model.id ? 'Update' : 'Generate Bill' }}</button>
        @if (model.id) { <button type="button" class="grey" (click)="cancel()">Cancel</button> }
        @if (error) { <p class="error">{{ error }}</p> }
      </form>
    </div>
  `
})
export class BillFormComponent implements OnChanges {
  @Input() bill: Bill | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  model: Bill = this.empty();
  error = '';

  constructor(private api: BillService) {}

  private empty(): Bill {
    return { customerName: '', meterNo: '', previousReading: 0, currentReading: 0 };
  }

  ngOnChanges() {
    this.model = this.bill ? { ...this.bill } : this.empty();
    this.error = '';
  }

  save() {
    const req = this.model.id
      ? this.api.update(this.model.id, this.model)
      : this.api.create(this.model);
    req.subscribe({
      next: () => { this.model = this.empty(); this.error = ''; this.saved.emit(); },
      error: e => this.error = e.error?.message || 'Could not reach the server'
    });
  }

  cancel() { this.model = this.empty(); this.cancelled.emit(); }
}

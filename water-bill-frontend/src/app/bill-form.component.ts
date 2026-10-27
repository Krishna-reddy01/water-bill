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
      <h3>{{ model.id ? 'Edit Bill #' + model.id : 'Generate New Water Bill' }}</h3>
      <form (ngSubmit)="save()">
        <label>Customer name<br>
          <input name="customerName" [(ngModel)]="model.customerName" required></label>
        <label>Water meter no.<br>
          <input name="meterNo" [(ngModel)]="model.meterNo" required></label>
        <label>Connection type<br>
          <select name="connectionType" [(ngModel)]="model.connectionType">
            <option>Domestic</option>
            <option>Commercial</option>
          </select></label>
        <label>Billing month<br>
          <input name="billingMonth" type="month" [(ngModel)]="model.billingMonth" required></label>
        <br>
        <label>Previous reading (KL)<br>
          <input name="previousReading" type="number" min="0" step="0.01" [(ngModel)]="model.previousReading" required></label>
        <label>Current reading (KL)<br>
          <input name="currentReading" type="number" min="0" step="0.01" [(ngModel)]="model.currentReading" required></label>
        <br>
        <button type="submit">{{ model.id ? 'Update' : 'Generate Bill' }}</button>
        @if (model.id) { <button type="button" class="grey" (click)="cancel()">Cancel</button> }
        @if (error) { <p class="error">{{ error }}</p> }
      </form>
    </div>
  `,
  styles: [`label { font-size: 13px; margin-right: 8px; } select { padding: 8px; margin: 4px 8px 8px 0; border: 1px solid #bbb; border-radius: 4px; }`]
})
export class BillFormComponent implements OnChanges {
  @Input() bill: Bill | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  model: Bill = this.empty();
  error = '';

  constructor(private api: BillService) {}

  private empty(): Bill {
    return {
      customerName: '', meterNo: '', connectionType: 'Domestic',
      billingMonth: new Date().toISOString().slice(0, 7),
      previousReading: 0, currentReading: 0
    };
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

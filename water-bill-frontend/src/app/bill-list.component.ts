import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Bill } from './bill.model';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  template: `
    <div class="card" style="overflow-x:auto">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Customer</th><th>Meter</th><th>Type</th><th>Month</th>
            <th>Prev (KL)</th><th>Curr (KL)</th><th>Usage (KL)</th>
            <th>Water ₹</th><th>Sewerage ₹</th><th>Service ₹</th><th>Total ₹</th>
            <th>Due date</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (b of bills; track b.id) {
            <tr>
              <td>{{ b.id }}</td><td>{{ b.customerName }}</td><td>{{ b.meterNo }}</td>
              <td>{{ b.connectionType }}</td><td>{{ b.billingMonth }}</td>
              <td>{{ b.previousReading }}</td><td>{{ b.currentReading }}</td><td>{{ b.usageKL }}</td>
              <td>{{ b.waterCharge }}</td><td>{{ b.sewerageCharge }}</td><td>{{ b.serviceCharge }}</td>
              <td><strong>{{ b.amount }}</strong></td><td>{{ b.dueDate }}</td>
              <td [class]="b.status === 'Paid' ? 'paid' : 'unpaid'">{{ b.status }}</td>
              <td style="white-space:nowrap">
                @if (b.status !== 'Paid') { <button class="ok" (click)="pay.emit(b)">Pay</button> }
                <button (click)="edit.emit(b)">Edit</button>
                <button class="danger" (click)="remove.emit(b)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="15">No bills found.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class BillListComponent {
  @Input() bills: Bill[] = [];
  @Output() pay = new EventEmitter<Bill>();
  @Output() edit = new EventEmitter<Bill>();
  @Output() remove = new EventEmitter<Bill>();
}

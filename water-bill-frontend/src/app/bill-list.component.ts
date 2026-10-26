import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Bill } from './bill.model';

@Component({
  selector: 'app-bill-list',
  standalone: true,
  template: `
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Customer</th><th>Meter</th><th>Prev</th><th>Curr</th>
            <th>Units</th><th>Amount (₹)</th><th>Date</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (b of bills; track b.id) {
            <tr>
              <td>{{ b.id }}</td><td>{{ b.customerName }}</td><td>{{ b.meterNo }}</td>
              <td>{{ b.previousReading }}</td><td>{{ b.currentReading }}</td>
              <td>{{ b.units }}</td><td>{{ b.amount }}</td><td>{{ b.billDate }}</td>
              <td [class]="b.status === 'Paid' ? 'paid' : 'unpaid'">{{ b.status }}</td>
              <td>
                @if (b.status !== 'Paid') { <button class="ok" (click)="pay.emit(b)">Pay</button> }
                <button (click)="edit.emit(b)">Edit</button>
                <button class="danger" (click)="remove.emit(b)">Delete</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="10">No bills found.</td></tr>
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

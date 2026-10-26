import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bill } from './bill.model';
import { BillService } from './bill.service';
import { BillFormComponent } from './bill-form.component';
import { BillListComponent } from './bill-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, BillFormComponent, BillListComponent],
  template: `
    <header><h1>💧 Water Bill Management System</h1></header>
    <div class="container">
      <app-bill-form [bill]="editing()" (saved)="onSaved()" (cancelled)="editing.set(null)" />

      <div class="card">
        <input [(ngModel)]="search" (ngModelChange)="load()" placeholder="Search by name or meter no.">
        <strong>Total: {{ bills().length }}</strong> |
        <strong>Pending: ₹{{ pendingTotal() }}</strong>
      </div>

      <app-bill-list [bills]="bills()" (pay)="pay($event)" (edit)="editing.set($event)" (remove)="remove($event)" />
    </div>
  `
})
export class AppComponent implements OnInit {
  bills = signal<Bill[]>([]);
  editing = signal<Bill | null>(null);
  search = '';

  constructor(private api: BillService) {}

  ngOnInit() { this.load(); }

  load() { this.api.getAll(this.search).subscribe(d => this.bills.set(d)); }

  pendingTotal() {
    return this.bills().filter(b => b.status !== 'Paid').reduce((s, b) => s + (b.amount ?? 0), 0);
  }

  onSaved() { this.editing.set(null); this.load(); }
  pay(b: Bill) { this.api.pay(b.id!).subscribe(() => this.load()); }
  remove(b: Bill) {
    if (confirm(`Delete bill #${b.id}?`)) this.api.remove(b.id!).subscribe(() => this.load());
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bill } from './bill.model';

@Injectable({ providedIn: 'root' })
export class BillService {
  private url = 'http://localhost:3000/api/bills';
  constructor(private http: HttpClient) {}

  getAll(q = ''): Observable<Bill[]> {
    return this.http.get<Bill[]>(q ? `${this.url}?q=${encodeURIComponent(q)}` : this.url);
  }
  create(b: Partial<Bill>) { return this.http.post<Bill>(this.url, b); }
  update(id: number, b: Partial<Bill>) { return this.http.put<Bill>(`${this.url}/${id}`, b); }
  pay(id: number) { return this.http.patch<Bill>(`${this.url}/${id}/pay`, {}); }
  remove(id: number) { return this.http.delete(`${this.url}/${id}`); }
}

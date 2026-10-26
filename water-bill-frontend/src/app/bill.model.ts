export interface Bill {
  id?: number;
  customerName: string;
  meterNo: string;
  previousReading: number;
  currentReading: number;
  units?: number;
  amount?: number;
  billDate?: string;
  status?: 'Paid' | 'Unpaid';
}

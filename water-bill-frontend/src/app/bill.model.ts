export interface Bill {
  id?: number;
  customerName: string;
  meterNo: string;
  connectionType: 'Domestic' | 'Commercial';
  billingMonth: string;
  previousReading: number;
  currentReading: number;
  usageKL?: number;
  waterCharge?: number;
  sewerageCharge?: number;
  serviceCharge?: number;
  amount?: number;
  billDate?: string;
  dueDate?: string;
  status?: 'Paid' | 'Unpaid';
}

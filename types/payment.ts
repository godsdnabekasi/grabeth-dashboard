export interface MidtransConfig {
  clientKey: string;
  baseUrl: string;
  isProduction: boolean;
}

export interface TransactionDetails {
  order_id: string;
  gross_amount: number;
}

export interface CustomerDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface ItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface MidtransRequestBody {
  transaction_details: TransactionDetails;
  customer_details: CustomerDetails;
  item_details?: ItemDetails[];
  payment_type: string;
  bank_transfer?: {
    bank: string;
  };
}

export interface MidtransResponse {
  order_id?: string;
  payment_data?: PaymentData;
  payment_type?: string;
  transaction_id?: string;
  transaction_status?: string;
  transaction_time?: string;
  va_numbers?: VaNumber[];
}

interface VaNumber {
  bank?: string;
  va_number?: string;
}

interface PaymentData {
  status_code?: string;
  status_message?: string;
  currency?: string;
  expiry_time?: string;
  fraud_status?: string;
  gross_amount?: string;
  merchant_id?: string;
  order_id?: string;
  payment_type?: string;
  transaction_id?: string;
  transaction_status?: string;
  transaction_time?: string;
  permata_va_number?: string;
  qr_string?: string;
  actions?: {
    name: string;
    url: string;
  }[];
  va_numbers?: VaNumber[];
}

export interface IPayment {
  id?: string;
  status: TPaymentStatus;
  gateway: string;
  gateway_dump: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export type TPaymentStatus =
  | "pending_payment"
  | "paid"
  | "cancelled"
  | "failed"
  | "refunded"
  | "processing";

export type TTransactionStatus =
  | "settlement"
  | "pending"
  | "expire"
  | "cancel"
  | "deny";

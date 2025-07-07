
export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url?: string;
}

export interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderData } from '@/types/checkout';
import { formatKES } from '@/utils/currency';

interface OrderSummaryProps {
  orderData: OrderData;
}

const OrderSummary = ({ orderData }: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderData.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium">{formatKES(item.price * item.quantity)}</p>
          </div>
        ))}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>{formatKES(orderData.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;

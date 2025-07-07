
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentMethod } from '@/types/checkout';

interface PaymentMethodFieldsProps {
  selectedPaymentMethod: string;
  paymentMethods: PaymentMethod[];
  mpesaPhone: string;
  paypalEmail: string;
  onMpesaPhoneChange: (value: string) => void;
  onPaypalEmailChange: (value: string) => void;
}

const PaymentMethodFields = ({
  selectedPaymentMethod,
  paymentMethods,
  mpesaPhone,
  paypalEmail,
  onMpesaPhoneChange,
  onPaypalEmailChange
}: PaymentMethodFieldsProps) => {
  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);

  if (!selectedPaymentMethod || !selectedMethod) {
    return null;
  }

  return (
    <div className="space-y-4">
      {selectedMethod.type === 'mpesa' && (
        <div className="space-y-2">
          <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
          <Input
            id="mpesa-phone"
            placeholder="254XXXXXXXXX"
            value={mpesaPhone}
            onChange={(e) => onMpesaPhoneChange(e.target.value)}
            required
          />
        </div>
      )}
      
      {selectedMethod.type === 'paypal' && (
        <div className="space-y-2">
          <Label htmlFor="paypal-email">PayPal Email</Label>
          <Input
            id="paypal-email"
            type="email"
            placeholder="your.email@example.com"
            value={paypalEmail}
            onChange={(e) => onPaypalEmailChange(e.target.value)}
            required
          />
        </div>
      )}
    </div>
  );
};

export default PaymentMethodFields;

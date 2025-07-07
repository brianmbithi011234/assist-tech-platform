
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { PaymentMethod } from '@/types/checkout';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

const PaymentMethodSelector = ({
  paymentMethods,
  selectedPaymentMethod,
  onPaymentMethodChange
}: PaymentMethodSelectorProps) => {
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'mpesa':
        return <Smartphone className="h-5 w-5" />;
      case 'paypal':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <Label>Payment Method</Label>
      <RadioGroup
        value={selectedPaymentMethod}
        onValueChange={onPaymentMethodChange}
      >
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg">
            <RadioGroupItem value={method.id} id={method.id} />
            <Label htmlFor={method.id} className="flex items-center space-x-2 cursor-pointer flex-1">
              {getPaymentIcon(method.type)}
              <span>{method.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;

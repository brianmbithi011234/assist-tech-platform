
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  // Mock product data - in real app this would come from API
  const product = {
    id: id || '1',
    name: 'MacBook Pro 16"',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
    description: 'The MacBook Pro 16-inch is designed for pros who need maximum performance and flexibility.',
    category: 'laptops',
    stock: 15,
    specifications: {
      'Processor': 'Apple M3 Pro chip',
      'Memory': '18GB unified memory',
      'Storage': '512GB SSD',
      'Display': '16.2-inch Liquid Retina XDR',
      'Graphics': 'Integrated 18-core GPU',
      'Battery': 'Up to 22 hours',
      'Weight': '4.7 pounds'
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  ${product.price}
                </span>
                <span className="text-lg text-gray-600">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;

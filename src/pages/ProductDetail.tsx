import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { formatKES } from '@/utils/currency';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  image_url: string;
  specifications: any;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url
    });
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getProductImage = (category: string, productName: string) => {
    // Return high-quality images based on product category
    const imageMap: { [key: string]: string } = {
      laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&h=800&fit=crop&crop=center',
      phones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=800&fit=crop&crop=center',
      tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=800&fit=crop&crop=center',
      smart_speakers: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop&crop=center',
      televisions: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&h=800&fit=crop&crop=center',
      game_consoles: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&h=800&fit=crop&crop=center'
    };

    return imageMap[category] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop&crop=center';
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/products" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
              <img
                src={product.image_url || getProductImage(product.category, product.name)}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getProductImage(product.category, product.name);
                }}
              />
            </div>
            
            {/* Trust indicators */}
            <div className="flex justify-around bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <Shield className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <span className="text-xs text-gray-600">Warranty</span>
              </div>
              <div className="text-center">
                <Truck className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <span className="text-xs text-gray-600">Free Shipping</span>
              </div>
              <div className="text-center">
                <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <span className="text-xs text-gray-600">Top Rated</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3 capitalize bg-blue-100 text-blue-800">
                {product.category.replace('_', ' ')}
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatKES(product.price)}
                  </span>
                  <div className="text-right">
                    {product.stock_quantity > 0 ? (
                      <div>
                        <span className="text-lg text-green-600 font-semibold">
                          ✓ In Stock
                        </span>
                        <p className="text-sm text-gray-600">
                          {product.stock_quantity} units available
                        </p>
                      </div>
                    ) : (
                      <span className="text-lg text-red-600 font-semibold">Out of Stock</span>
                    )}
                  </div>
                </div>
                
                {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                  <div className="bg-orange-100 border border-orange-200 p-3 rounded-lg mb-4">
                    <p className="text-orange-800 font-medium">
                      ⚠️ Only {product.stock_quantity} units left in stock!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {product.specifications && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-gray-600 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
            
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Free shipping</strong> on this item. Order now and get it delivered within 2-3 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;

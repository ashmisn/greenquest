import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Tag, MapPin } from 'lucide-react';
import { User } from '../types';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  seller: {
    _id: string;
    fullName: string;
    village: string;
  };
  createdAt: string;
}

// --- Cleaned-up demo products ---
const demoProducts: Product[] = [
  {
    _id: 'demo1',
    title: 'Upcycled Denim Tote Bag',
    description: 'A sturdy and stylish tote bag handmade from reclaimed denim jeans.',
    price: 250,
    imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/3666536858150025435_0',
    seller: { _id: 'seller1', fullName: 'EcoCrafter', village: 'Greenwood' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo2',
    title: 'Decorative Bottle Vases (Set of 3)',
    description: 'Beautifully painted glass bottles, repurposed as elegant vases for your home.',
    price: 150,
    imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/6188315355593607317_0',
    seller: { _id: 'seller2', fullName: 'Artful Recycler', village: 'Rivertown' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo3',
    title: 'Handmade Wooden Birdhouse',
    description: 'A charming birdhouse built from reclaimed pallet wood. Perfect for any garden.',
    price: 300,
    imageUrl: 'http://googleusercontent.com/image_collection/image_retrieval/17373640404737184469_0',
    seller: { _id: 'seller3', fullName: 'WoodWorks', village: 'Oakhaven' },
    createdAt: new Date().toISOString(),
  }
];

const Marketplace: React.FC = () => {
  const { user, login, token } = useAuth(); 
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null); // optional: disable button while buying

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getAllProducts();
        setProducts(data && data.length > 0 ? data : demoProducts);
      } catch (error) {
        console.error("Failed to fetch products, using demo data:", error);
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleBuy = async (product: Product) => {
    if (product._id.startsWith('demo')) {
      alert("This is a demo item and cannot be purchased.");
      return;
    }

    if (!window.confirm(`Are you sure you want to buy "${product.title}" for ${product.price} points?`)) {
      return;
    }

    setBuyingId(product._id);
    try {
      const response = await productAPI.buyProduct(product._id);
      alert(response.message);

      setProducts(prev => prev.filter(p => p._id !== product._id));

      if (user && token) {
        const updatedUser: User = { ...user, points: response.updatedPoints };
        login(token, updatedUser);
      }
    } catch (error: any) {
      alert(`Purchase failed: ${error.response?.data?.message || 'An error occurred.'}`);
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) return <div className="text-center p-10">Loading products...</div>;
  if (!loading && products.length === 0) return <div className="text-center p-10">No products available.</div>;

  return (
    <div className="max-w-6xl mx-auto mt-12 p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Marketplace</h1>
        <Link to="/list-product" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">
          + Sell a Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => {
          const isMyProduct = user?._id === product.seller?._id;
          return (
            <div key={product._id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/400x300'}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold">{product.title}</h3>
                <p className="text-gray-600 mt-2 flex-grow">{product.description}</p>
                <div className="flex items-center text-lg font-bold text-green-600 mt-4">
                  <Tag className="w-5 h-5 mr-2" /> {product.price} Points
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="w-4 h-4 mr-2" /> {product.seller?.fullName || 'Unknown'} from {product.seller?.village || 'Unknown'}
                </div>

                <div className="mt-6">
                  {isMyProduct ? (
                    <p className="text-center text-sm font-semibold text-gray-500 py-2 bg-gray-100 rounded-lg">This is your listing</p>
                  ) : (
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={buyingId === product._id}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-transform hover:scale-105 disabled:opacity-50"
                    >
                      {buyingId === product._id ? 'Processing...' : 'Buy Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;

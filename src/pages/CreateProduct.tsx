import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { UploadCloud, Loader } from 'lucide-react';

const CreateProduct: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // --- MODIFIED: Validation no longer checks for an image ---
    if (!title || !description || !price) {
      setError('Title, description, and price are required fields.');
      return;
    }
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    
    // --- MODIFIED: Only append the image if one was selected ---
    if (image) {
      formData.append('image', image);
    }

    try {
      await productAPI.createProduct(formData);
      alert('Product listed successfully!');
      navigate('/marketplace');
    } catch (err) {
      setError('Failed to list product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">List a Reusable Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-2 border rounded-lg mt-1" 
            placeholder="e.g., Hand-painted Glass Bottles"
            required // Keep text fields required
          />
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full p-2 border rounded-lg mt-1 h-28"
            placeholder="Describe your item..."
            required // Keep text fields required
          ></textarea>
        </div>
        <div>
          <label className="block font-semibold">Price (Points)</label>
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            className="w-full p-2 border rounded-lg mt-1" 
            placeholder="e.g., 150"
            required // Keep text fields required
          />
        </div>
        <div>
            <label className="block font-semibold">Product Image (Optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            {/* --- MODIFIED: Removed 'required' from the input --- */}
                            <input id="file-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">{image ? image.name : 'PNG, JPG, GIF up to 10MB'}</p>
                </div>
            </div>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center disabled:opacity-50"
        >
          {isLoading && <Loader className="animate-spin mr-2" />}
          {isLoading ? 'Listing...' : 'List Product'}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
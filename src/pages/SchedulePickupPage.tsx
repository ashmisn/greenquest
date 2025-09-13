import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickupAPI } from '../services/api';
import { Truck, Send } from 'lucide-react';

const SchedulePickupForm: React.FC = () => {
    const [formData, setFormData] = useState({
        wasteTypes: [] as string[],
        quantity: 'Small Bag (1-5 kg)',
        address: '',
        pickupDate: '',
        timeSlot: '9 AM - 12 PM',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleWasteTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prevState => {
            if (checked) {
                return { ...prevState, wasteTypes: [...prevState.wasteTypes, value] };
            } else {
                return { ...prevState, wasteTypes: prevState.wasteTypes.filter(type => type !== value) };
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.wasteTypes.length === 0) {
            setError('Please select at least one type of waste.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await pickupAPI.schedulePickup(formData);
            alert('Pickup scheduled successfully!');
            navigate('/dashboard'); // Redirect to dashboard after success
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Schedule a New Pickup</h2>
                <p className="text-gray-500">Fill in the details below to request a waste pickup.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Waste (Select all that apply)</label>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {['Plastic', 'E-Waste', 'Organic', 'Paper', 'Glass', 'Metal'].map(type => (
                            <label key={type} className="flex items-center space-x-2">
                                <input type="checkbox" value={type} onChange={handleWasteTypeChange} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">Estimated Quantity</label>
                    <select id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                        <option>Small Bag (1-5 kg)</option>
                        <option>Medium Box (5-15 kg)</option>
                        <option>Large Load (15+ kg)</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Pickup Address</label>
                    <textarea id="address" name="address" value={formData.address} onChange={handleChange} required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" placeholder="Enter your full pickup address, including any landmarks."></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="pickupDate" className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                        <input type="date" id="pickupDate" name="pickupDate" value={formData.pickupDate} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" min={new Date().toISOString().split('T')[0]}/>
                    </div>
                    <div>
                        <label htmlFor="timeSlot" className="block text-sm font-semibold text-gray-700 mb-2">Preferred Time Slot</label>
                        <select id="timeSlot" name="timeSlot" value={formData.timeSlot} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500">
                            <option>9 AM - 12 PM</option>
                            <option>12 PM - 3 PM</option>
                            <option>3 PM - 6 PM</option>
                        </select>
                    </div>
                </div>

                {error && <div className="text-red-600 text-sm text-center font-semibold bg-red-50 p-3 rounded-lg">{error}</div>}

                <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
                    <Send className="w-5 h-5" />
                    {isLoading ? 'Scheduling...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
};

export default SchedulePickupForm;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DateInput from '../components/DateInput';

const CreateLoan = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_name: '',
        business_name: '',
        guarantor_name: '',
        address: '',
        loan_amount: '',
        interest: '',
        total_loan_amount: '0.00',
        loan_date: new Date().toISOString().split('T')[0],
        installment_type: 'daily',
    });
    const [loading, setLoading] = useState(false);

    // Auto-calculate Total Loan Amount when Principal or Interest changes
    useEffect(() => {
        const principal = parseFloat(formData.loan_amount) || 0;
        const interest = parseFloat(formData.interest) || 0;
        setFormData(prev => ({
            ...prev,
            total_loan_amount: (principal + interest).toString()
        }));
    }, [formData.loan_amount, formData.interest]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/loans', formData);
            toast.success('Loan created successfully!');
            navigate(`/loan/${response.data.data.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create loan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ledger-container max-w-3xl">
            <div className="ledger-header flex items-center justify-between">
                <div>
                    <h1 className="ledger-title">Issue New Loan</h1>
                    <p className="text-gray-500 mt-1">Record a new transaction in the daily installment book</p>
                </div>
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-ledger-accent flex items-center gap-1">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Customer Name *</label>
                        <input
                            type="text"
                            name="customer_name"
                            required
                            className="form-input"
                            placeholder="e.g. Rahul Sharma"
                            value={formData.customer_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Business Name *</label>
                        <input
                            type="text"
                            name="business_name"
                            required
                            className="form-input"
                            placeholder="e.g. Sharma Traders"
                            value={formData.business_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Guarantor Name</label>
                        <input
                            type="text"
                            name="guarantor_name"
                            className="form-input"
                            placeholder="e.g. Amit Verma"
                            value={formData.guarantor_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Loan Amount (Principal) (₹) *</label>
                        <input
                            type="number"
                            name="loan_amount"
                            required
                            min="1"
                            step="0.01"
                            className="form-input"
                            placeholder="0.00"
                            value={formData.loan_amount}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Interest Amount (₹) *</label>
                        <input
                            type="number"
                            name="interest"
                            required
                            min="0"
                            step="0.01"
                            className="form-input"
                            placeholder="0.00"
                            value={formData.interest}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Total Loan Amount (₹)</label>
                        <input
                            type="text"
                            name="total_loan_amount"
                            disabled
                            className="form-input bg-gray-50 border-gray-200 font-semibold text-ledger-accent"
                            value={parseFloat(formData.total_loan_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Loan Date *</label>
                        <DateInput
                            name="loan_date"
                            required
                            value={formData.loan_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Installment Type *</label>
                        <select
                            name="installment_type"
                            required
                            className="form-input bg-white cursor-pointer"
                            value={formData.installment_type}
                            onChange={handleChange}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Address</label>
                    <textarea
                        name="address"
                        rows="3"
                        className="form-input"
                        placeholder="Complete address of the customer"
                        value={formData.address}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="pt-4 border-t border-ledger-divider">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full md:w-auto px-8 py-3"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Register Loan Entry
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateLoan;

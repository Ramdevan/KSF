import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DateInput from '../components/DateInput';

const EditLoan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_name: '',
        business_name: '',
        guarantor_name: '',
        address: '',
        loan_amount: '',
        interest: '',
        total_loan_amount: '0.00',
        loan_date: '',
        installment_type: 'daily',
        status: 'active',
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLoanDetails();
    }, [id]);

    const fetchLoanDetails = async () => {
        try {
            const response = await api.get(`/loans/${id}`);
            const loan = response.data.data;
            setFormData({
                customer_name: loan.customer_name || '',
                business_name: loan.business_name || '',
                guarantor_name: loan.guarantor_name || '',
                address: loan.address || '',
                loan_amount: loan.loan_amount || '',
                interest: loan.interest || '',
                total_loan_amount: loan.total_loan_amount || '0.00',
                loan_date: loan.loan_date || '',
                installment_type: loan.installment_type || 'daily',
                status: loan.status || 'active',
            });
        } catch (error) {
            toast.error('Failed to fetch loan details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

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
        setSubmitting(true);
        try {
            await api.put(`/loans/${id}`, formData);
            toast.success('Loan updated successfully!');
            navigate(`/loan/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update loan');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ledger-accent"></div>
            </div>
        );
    }

    return (
        <div className="ledger-container max-w-3xl">
            <div className="ledger-header flex items-center justify-between">
                <div>
                    <h1 className="ledger-title">Edit Loan Entry</h1>
                    <p className="text-gray-500 mt-1">Modify details for loan #L-{id}</p>
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

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Status *</label>
                        <select
                            name="status"
                            required
                            className="form-input bg-white cursor-pointer"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
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
                        disabled={submitting}
                        className="btn-primary w-full md:w-auto px-8 py-3"
                    >
                        {submitting ? 'Updating...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditLoan;

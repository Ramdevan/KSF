import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Save, Trash2, Calendar, ShoppingBag, DollarSign, List } from 'lucide-react';
import toast from 'react-hot-toast';

const OtherExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        expense_name: '',
        amount: '',
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await api.get('/expenses');
            setExpenses(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/expenses', formData);
            toast.success('Expense recorded successfully!');
            setFormData({
                date: new Date().toISOString().split('T')[0],
                expense_name: '',
                amount: '',
            });
            fetchExpenses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record expense');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-800">
                    Are you sure you want to delete this expense?
                </span>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await api.delete(`/expenses/${id}`);
                                toast.success('Expense deleted successfully!');
                                fetchExpenses();
                            } catch (error) {
                                toast.error('Failed to delete expense');
                            }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
        });
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Pagination calculations
    const itemsPerPage = 5;
    const totalPages = Math.ceil((expenses || []).length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentExpenses = (expenses || []).slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="ledger-container">
            <div className="ledger-header">
                <h1 className="ledger-title">Other Expenses</h1>
                <p className="text-gray-500 mt-1">Record and manage general expenses, office supplies, and other costs</p>
            </div>

            {/* Total Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="ledger-card border-l-4 border-l-rose-600 bg-white shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Other Expenses</div>
                    <div className="text-2xl font-bold text-rose-700">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to Create Expense */}
                <div className="lg:col-span-1">
                    <div className="ledger-card bg-white">
                        <h2 className="text-lg font-bold text-ledger-accent border-b pb-3 mb-4 flex items-center gap-2">
                            <List className="w-5 h-5 text-gray-500" />
                            Record Expense
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    className="form-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                                    Expense Name *
                                </label>
                                <input
                                    type="text"
                                    name="expense_name"
                                    required
                                    placeholder="e.g. Office Chairs, Chai Bill"
                                    className="form-input"
                                    value={formData.expense_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    <DollarSign className="w-4 h-4 text-gray-400" />
                                    Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="form-input"
                                    value={formData.amount}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full mt-6 py-2.5"
                            >
                                <Save className="w-4 h-4" />
                                {submitting ? 'Recording...' : 'Record Expense'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Table Listing Expenses */}
                <div className="lg:col-span-2">
                    <div className="ledger-card bg-white overflow-hidden">
                        <h2 className="text-lg font-bold text-ledger-accent border-b pb-3 mb-4">Expense Ledger</h2>

                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ledger-accent"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="ledger-table">
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Date</th>
                                            <th>Expense Name</th>
                                            <th className="text-right">Amount</th>
                                            <th className="text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentExpenses.length > 0 ? (
                                            currentExpenses.map((exp, index) => (
                                                <tr key={exp.id} className="hover:bg-gray-50">
                                                    <td className="font-semibold text-slate-500">{expenses.length - (indexOfFirstItem + index)}</td>
                                                    <td className="text-xs text-gray-600">
                                                        {new Date(exp.date).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="font-medium text-gray-800">
                                                        {exp.expense_name}
                                                    </td>
                                                    <td className="font-mono text-right font-semibold text-rose-700">
                                                        ₹{parseFloat(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => handleDelete(exp.id)}
                                                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete expense"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-gray-500 italic">
                                                    No expenses recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 sm:px-6 bg-slate-50/50 mt-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative ml-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between text-xs">
                                    <div>
                                        <p className="text-slate-500">
                                            Showing <span className="font-semibold text-slate-950">{indexOfFirstItem + 1}</span> to{' '}
                                            <span className="font-semibold text-slate-950">{Math.min(indexOfLastItem, expenses.length)}</span> of{' '}
                                            <span className="font-semibold text-slate-950">{expenses.length}</span> expenses
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-white" aria-label="Pagination">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center rounded-l-xl px-2 py-1 text-slate-500 border border-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            >
                                                &larr; Prev
                                            </button>
                                            
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`relative inline-flex items-center px-3 py-1 font-semibold border-y border-r border-slate-200 focus:z-20 focus:outline-offset-0 transition-colors cursor-pointer ${
                                                        currentPage === page
                                                            ? 'z-10 bg-indigo-600 text-white border-indigo-600'
                                                            : 'text-slate-700 hover:bg-slate-50 bg-white'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center rounded-r-xl px-2 py-1 text-slate-500 border-y border-r border-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            >
                                                Next &rarr;
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherExpenses;

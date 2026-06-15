import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, ArrowLeft, Printer, Info, Wallet, CheckCircle2, Pencil, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DateInput from '../components/DateInput';

const LoanDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
    const [installmentForm, setInstallmentForm] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingInstallmentId, setEditingInstallmentId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: '',
        amount: '',
    });
    const [isUpdatingInstallment, setIsUpdatingInstallment] = useState(false);

    useEffect(() => {
        fetchLedger();
    }, [id]);

    const fetchLedger = async () => {
        try {
            const response = await api.get(`/installments/${id}`);
            setData(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch ledger details');
        } finally {
            setLoading(false);
        }
    };

    const handleInstallmentSubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(installmentForm.amount);
        if (!installmentForm.amount || amt <= 0) {
            return toast.error('Please enter a valid amount');
        }
        if (summary && amt > parseFloat(summary.remainingBalance)) {
            return toast.error(`Payment amount cannot exceed the remaining balance of ₹${parseFloat(summary.remainingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
        }

        setIsSubmitting(true);
        try {
            await api.post('/installments', {
                loanId: id,
                ...installmentForm,
            });
            toast.success('Installment added successfully!');
            setInstallmentForm({ ...installmentForm, amount: '' });
            fetchLedger();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add installment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (inst) => {
        setEditingInstallmentId(inst.id);
        setEditFormData({
            date: inst.date,
            amount: inst.amount,
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (instId) => {
        const amt = parseFloat(editFormData.amount);
        if (!editFormData.amount || amt <= 0) {
            return toast.error('Please enter a valid amount');
        }
        setIsUpdatingInstallment(true);
        try {
            await api.put(`/installments/${instId}`, {
                date: editFormData.date,
                amount: amt,
            });
            toast.success('Installment updated successfully!');
            setEditingInstallmentId(null);
            fetchLedger();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update installment');
        } finally {
            setIsUpdatingInstallment(false);
        }
    };

    const handleDeleteClick = (instId) => {
        toast((t) => (
            <div className="flex flex-col gap-2 py-1">
                <p className="text-sm font-semibold text-gray-800">
                    Are you sure you want to delete this installment?
                </p>
                <p className="text-xs text-gray-500">
                    All subsequent balances will be recalculated.
                </p>
                <div className="flex gap-2 mt-1 justify-end">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await executeDelete(instId);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'top-center',
        });
    };

    const executeDelete = async (instId) => {
        try {
            await api.delete(`/installments/${instId}`);
            toast.success('Installment deleted successfully!');
            fetchLedger();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete installment');
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ledger-accent"></div>
        </div>
    );

    if (!data) return <div className="text-center py-10">Data not found</div>;

    const { loan, installments, summary } = data;

    // Sort: recent (newest date, newest receipt_no) first
    const sortedInstallments = [...(installments || [])].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }
        return b.receipt_no - a.receipt_no;
    });

    // Pagination calculations
    const installmentsPerPage = 20;
    const totalHistoryPages = Math.ceil(sortedInstallments.length / installmentsPerPage);
    const indexOfLastInstallment = currentHistoryPage * installmentsPerPage;
    const indexOfFirstInstallment = indexOfLastInstallment - installmentsPerPage;
    const currentInstallments = sortedInstallments.slice(indexOfFirstInstallment, indexOfLastInstallment);

    return (
        <div className="ledger-container">
            <div className="ledger-header flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="ledger-title">Loan Ledger: #L-{loan.id}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/edit-loan/${loan.id}`)} className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors">
                        <Pencil className="w-4 h-4" />
                        Edit Loan
                    </button>
                    <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors">
                        <Printer className="w-4 h-4" />
                        Print Ledger
                    </button>
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-ledger-accent flex items-center gap-1 text-sm ml-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="ledger-card border-l-4 border-l-ledger-accent">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase">Basic Info</span>
                    </div>
                    <p className="text-sm"><strong>Customer Name:</strong> {loan.customer_name}</p>
                    <p className="text-sm mt-1"><strong>Date:</strong> {new Date(loan.loan_date).toLocaleDateString('en-GB')}</p>
                    <p className="text-sm mt-1"><strong>Installment Type:</strong> <span className="capitalize">{loan.installment_type || 'daily'}</span></p>
                    <p className="text-sm mt-1"><strong>Business:</strong> {loan.business_name || 'N/A'}</p>
                    <p className="text-sm mt-1"><strong>Guarantor:</strong> {loan.guarantor_name || 'N/A'}</p>
                    <p className="text-sm mt-1 text-gray-600"><strong>Address:</strong> {loan.address || 'N/A'}</p>
                    <div className="mt-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            Status: {loan.status}
                        </span>
                    </div>
                </div>

                <div className="ledger-card border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase">Loan Summary</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Principal Amount:</span>
                            <span className="text-sm font-semibold text-gray-800">₹{parseFloat(loan.loan_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Interest:</span>
                            <span className="text-sm font-semibold text-gray-800">₹{parseFloat(loan.interest || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1">
                            <span className="text-sm text-gray-600 font-medium">Total Receivable:</span>
                            <span className="text-sm font-bold text-blue-700">₹{parseFloat(summary.totalLoanAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Paid:</span>
                            <span className="text-sm font-bold text-green-600">₹{parseFloat(summary.totalPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="pt-2 border-t mt-2 flex justify-between">
                            <span className="text-sm font-bold">Remaining:</span>
                            <span className="text-lg font-bold text-ledger-accent">₹{parseFloat(summary.remainingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                <div className="ledger-card border-l-4 border-l-orange-400">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase">Quick Installment</span>
                    </div>
                    {loan.status === 'active' ? (
                        <form onSubmit={handleInstallmentSubmit} className="space-y-3">
                            <input
                                type="number"
                                placeholder="Amount (₹)"
                                className="form-input text-lg font-bold"
                                value={installmentForm.amount}
                                onChange={(e) => setInstallmentForm({ ...installmentForm, amount: e.target.value })}
                                max={summary?.remainingBalance}
                                required
                            />
                            <DateInput
                                className="text-xs"
                                value={installmentForm.date}
                                min={loan.loan_date}
                                onChange={(e) => setInstallmentForm({ ...installmentForm, date: e.target.value })}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full text-sm py-2"
                            >
                                {isSubmitting ? 'Saving...' : 'Add Payment'}
                            </button>
                        </form>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-green-600">
                            <CheckCircle2 className="w-10 h-10 mb-2" />
                            <span className="font-bold">Loan Fully Settled</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg border border-ledger-divider shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-ledger-divider flex items-center justify-between">
                    <h2 className="font-bold text-gray-700 uppercase text-sm tracking-widest">Installment History</h2>
                    <span className="text-xs text-gray-500">{installments.length} Payments recorded</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Receipt No.</th>
                                <th>Date</th>
                                <th>Amount Paid</th>
                                <th>Balance Remaining</th>
                                <th className="text-right pr-6">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentInstallments.length > 0 ? (
                                currentInstallments.map((inst, index) => {
                                    const isEditing = editingInstallmentId === inst.id;
                                    return (
                                        <tr key={inst.id} className={isEditing ? 'bg-amber-50/30' : ''}>
                                            <td className="font-semibold text-slate-500">{installments.length - (indexOfFirstInstallment + index)}</td>
                                            <td className="font-mono">REC-{inst.receipt_no.toString().padStart(4, '0')}</td>
                                            
                                            {isEditing ? (
                                                <td className="w-[180px]">
                                                    <DateInput
                                                        name="date"
                                                        required
                                                        className="py-1 px-2 text-sm min-w-[140px]"
                                                        value={editFormData.date}
                                                        min={loan.loan_date}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>
                                            ) : (
                                                <td>{new Date(inst.date).toLocaleDateString('en-GB')}</td>
                                            )}

                                            {isEditing ? (
                                                <td>
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        required
                                                        min="1"
                                                        step="0.01"
                                                        className="form-input py-1 px-2 text-sm max-w-[120px]"
                                                        value={editFormData.amount}
                                                        onChange={handleEditChange}
                                                    />
                                                </td>
                                            ) : (
                                                <td className="font-bold text-green-600">+ ₹{parseFloat(inst.amount).toLocaleString()}</td>
                                            )}

                                            <td className="font-bold text-ledger-accent">₹{parseFloat(inst.balance).toLocaleString()}</td>
                                            
                                            <td className="text-right pr-6">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateSubmit(inst.id)}
                                                            disabled={isUpdatingInstallment}
                                                            className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded transition-colors"
                                                            title="Save"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingInstallmentId(null)}
                                                            className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditClick(inst)}
                                                            className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 p-1.5 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(inst.id)}
                                                            className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-400 italic">
                                        No installments recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalHistoryPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 sm:px-6 bg-slate-50/50">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentHistoryPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentHistoryPage === 1}
                                className="relative inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))}
                                disabled={currentHistoryPage === totalHistoryPages}
                                className="relative ml-3 inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Showing <span className="font-semibold text-slate-950">{indexOfFirstInstallment + 1}</span> to{' '}
                                    <span className="font-semibold text-slate-950">{Math.min(indexOfLastInstallment, installments.length)}</span> of{' '}
                                    <span className="font-semibold text-slate-950">{installments.length}</span> payments
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-white" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentHistoryPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentHistoryPage === 1}
                                        className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-500 border border-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        <span className="sr-only">Previous</span>
                                        &larr; Prev
                                    </button>

                                    {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentHistoryPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border-y border-r border-slate-200 focus:z-20 focus:outline-offset-0 transition-colors cursor-pointer ${currentHistoryPage === page
                                                    ? 'z-10 bg-indigo-600 text-white border-indigo-600'
                                                    : 'text-slate-700 hover:bg-slate-50 bg-white'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentHistoryPage(prev => Math.min(prev + 1, totalHistoryPages))}
                                        disabled={currentHistoryPage === totalHistoryPages}
                                        className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-slate-500 border-y border-r border-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                    >
                                        <span className="sr-only">Next</span>
                                        Next &rarr;
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoanDetails;

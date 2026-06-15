import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Eye, Plus, Search, User, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const response = await api.get('/loans');
            setLoans(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch loans');
        } finally {
            setLoading(false);
        }
    };

    // Reset pagination to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredLoans = loans.filter(loan =>
        loan.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.toString().includes(searchTerm)
    );

    // Sort: recent (newest loan_date, newest id) first
    const sortedLoans = [...filteredLoans].sort((a, b) => {
        const dateA = new Date(a.loan_date);
        const dateB = new Date(b.loan_date);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }
        return b.id - a.id;
    });

    // Pagination calculations
    const itemsPerPage = 10;
    const totalPages = Math.ceil(sortedLoans.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLoans = sortedLoans.slice(indexOfFirstItem, indexOfLastItem);

    const totalLoanAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.total_loan_amount && parseFloat(loan.total_loan_amount) > 0 ? loan.total_loan_amount : loan.loan_amount || 0), 0);
    const totalInterest = loans.reduce((sum, loan) => sum + parseFloat(loan.interest || 0), 0);
    const totalCustomers = loans.length;
    const activeCustomers = loans.filter(loan => loan.status === 'active').length;
    const closedCustomers = loans.filter(loan => loan.status === 'closed').length;

    return (
        <div className="ledger-container">
            <div className="ledger-header flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="ledger-title">Loan Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage and track your active daily installments</p>
                </div>
                <Link to="/create-loan" className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Create New Loan
                </Link>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                <div className="ledger-card border-l-4 border-l-emerald-600 bg-white p-4 shadow-sm">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Loan Amount</div>
                    <div className="text-lg font-bold text-emerald-700">₹{totalLoanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>

                <div className="ledger-card border-l-4 border-l-blue-600 bg-white p-4 shadow-sm">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Interest</div>
                    <div className="text-lg font-bold text-blue-700">₹{totalInterest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>

                <div className="ledger-card border-l-4 border-l-purple-600 bg-white p-4 shadow-sm">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Customers</div>
                    <div className="text-lg font-bold text-purple-700">{totalCustomers}</div>
                </div>

                <div className="ledger-card border-l-4 border-l-green-600 bg-white p-4 shadow-sm">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Active Customers</div>
                    <div className="text-lg font-bold text-green-700">{activeCustomers}</div>
                </div>

                <div className="ledger-card border-l-4 border-l-gray-400 bg-white p-4 shadow-sm">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Closed Customers</div>
                    <div className="text-lg font-bold text-gray-600">{closedCustomers}</div>
                </div>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    className="form-input !pl-14 h-12 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ledger-accent"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="ledger-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>ID</th>
                                <th>Customer Name</th>
                                <th>Loan Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLoans.length > 0 ? (
                                currentLoans.map((loan, index) => (
                                    <tr key={loan.id} className="hover:bg-gray-50">
                                        <td className="font-semibold text-slate-500">{sortedLoans.length - (indexOfFirstItem + index)}</td>
                                        <td className="font-mono">#L-{loan.id}</td>
                                        <td className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {loan.customer_name}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-2 pl-6 mt-1">
                                                    {loan.business_name && (
                                                        <span className="text-xs text-gray-500 mr-1">
                                                            {loan.business_name}
                                                        </span>
                                                    )}
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                                        loan.installment_type === 'monthly' ? 'bg-purple-100 text-purple-700' :
                                                        loan.installment_type === 'weekly' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {loan.installment_type || 'daily'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-semibold text-ledger-accent">₹{parseFloat(loan.total_loan_amount && parseFloat(loan.total_loan_amount) > 0 ? loan.total_loan_amount : loan.loan_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td>{new Date(loan.loan_date).toLocaleDateString('en-GB')}</td>
                                        <td>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-4">
                                                <Link to={`/loan/${loan.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                                                    <Eye className="w-4 h-4" />
                                                    View Ledger
                                                </Link>
                                                <Link to={`/edit-loan/${loan.id}`} className="text-amber-600 hover:text-amber-800 flex items-center gap-1 font-medium">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                    Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500 italic">
                                        No loans found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-6 sm:px-6 mt-6">
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
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-semibold text-slate-950">{indexOfFirstItem + 1}</span> to{' '}
                                <span className="font-semibold text-slate-950">{Math.min(indexOfLastItem, filteredLoans.length)}</span> of{' '}
                                <span className="font-semibold text-slate-950">{filteredLoans.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-white" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-500 border border-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                >
                                    <span className="sr-only">Previous</span>
                                    &larr; Prev
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold border-y border-r border-slate-200 focus:z-20 focus:outline-offset-0 transition-colors cursor-pointer ${
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
    );
};

export default Dashboard;

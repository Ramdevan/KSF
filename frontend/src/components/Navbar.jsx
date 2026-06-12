import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Book, PlusCircle, LayoutDashboard, Coins, Menu, X, Receipt, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    const navItems = [
        {
            path: '/',
            label: 'Dashboard',
            icon: LayoutDashboard,
        },
        {
            path: '/total-investment',
            label: 'Total Investment',
            icon: Coins,
        },
        {
            path: '/other-expenses',
            label: 'Other Expense',
            icon: Receipt,
        },
        {
            path: '/create-loan',
            label: 'New Loan',
            icon: PlusCircle,
        },
    ];

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="lg:hidden flex items-center justify-between bg-white px-4 h-16 border-b border-gray-200 w-full sticky top-0 z-40 shadow-sm">
                <Link to="/" className="flex items-center gap-2 text-indigo-600 font-sans text-xl font-extrabold tracking-tight">
                    <Book className="w-5 h-5 text-indigo-600" />
                    <span>LoanLedger</span>
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="text-gray-600 hover:text-ledger-accent focus:outline-none p-1 rounded-md hover:bg-gray-100"
                    aria-label="Toggle navigation menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay / Drawer */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div
                className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:fixed lg:h-screen ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand / Logo */}
                <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-indigo-600 font-sans text-xl font-extrabold tracking-tight">
                        <Book className="w-6 h-6 text-indigo-600" />
                        <span>LoanLedger</span>
                    </Link>
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-xl ${
                                    active
                                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="px-4 py-2 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5 text-rose-500" />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Optional Footer */}
                <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-400">
                    &copy; 2026 LoanLedger App
                </div>
            </div>
        </>
    );
};

export default Navbar;

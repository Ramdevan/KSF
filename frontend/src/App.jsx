import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateLoan from './pages/CreateLoan';
import LoanDetails from './pages/LoanDetails';
import TotalInvestment from './pages/TotalInvestment';
import OtherExpenses from './pages/OtherExpenses';
import Login from './pages/Login';

const ProtectedLayout = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            <Navbar />
            <main className="flex-1 p-4 md:p-8 lg:pl-72 w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
};

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedLayout>
                            <Dashboard />
                        </ProtectedLayout>
                    }
                />
                <Route
                    path="/create-loan"
                    element={
                        <ProtectedLayout>
                            <CreateLoan />
                        </ProtectedLayout>
                    }
                />
                <Route
                    path="/total-investment"
                    element={
                        <ProtectedLayout>
                            <TotalInvestment />
                        </ProtectedLayout>
                    }
                />
                <Route
                    path="/other-expenses"
                    element={
                        <ProtectedLayout>
                            <OtherExpenses />
                        </ProtectedLayout>
                    }
                />
                <Route
                    path="/loan/:id"
                    element={
                        <ProtectedLayout>
                            <LoanDetails />
                        </ProtectedLayout>
                    }
                />

                {/* Redirect any other path to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
        </Router>
    );
}

export default App;

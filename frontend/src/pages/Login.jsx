import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Lock, User, Loader2 } from 'lucide-react';
import ksfLogo from '../assets/ksf_logo.png';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                toast.success('Logged in successfully!');
                navigate('/');
            } else {
                toast.error(response.data.message || 'Login failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 flex items-center justify-center mb-4">
                        <img src={ksfLogo} alt="KSF Financial" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                        Daily Loan Ledger
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-gray-400" />
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="form-input"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <Lock className="w-4 h-4 text-gray-400" />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="form-input"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full mt-6 py-3 text-base font-bold flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

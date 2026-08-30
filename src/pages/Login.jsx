import React, { useState } from 'react';
import { ShieldCheck, BarChart3, Users, User, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="h-screen w-full flex font-sans text-gray-800 overflow-hidden bg-[#fafafa]">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-[#081326] relative flex-col justify-center p-10 xl:p-14 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/aboutushero.png" 
            alt="Office Building" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#081326]/90 via-[#081326]/75 to-[#081326]/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-10 xl:mb-12">
            <img src="/logo.png" alt="KTR Consultants Logo" className="h-14 xl:h-16 w-auto" />
          </div>

          <h1 className="text-white text-3xl xl:text-4xl font-bold leading-tight mb-3">
            Welcome Back,<br />
            <span className="text-[#f59e0b]">Admin!</span>
          </h1>
          <div className="w-10 h-1 bg-[#f59e0b] mb-5"></div>

          <p className="text-gray-300 text-sm xl:text-sm leading-relaxed mb-10">
            Login to access your admin panel and manage clients, services, data and more from a single dashboard.
          </p>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-[#f59e0b] w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm xl:text-base mb-0.5">Secure Access</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-[250px]">Your data is protected with advanced security.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center shrink-0">
                <BarChart3 className="text-[#f59e0b] w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm xl:text-base mb-0.5">Powerful Dashboard</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-[250px]">Monitor and manage everything effortlessly.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center shrink-0">
                <Users className="text-[#f59e0b] w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm xl:text-base mb-0.5">Complete Control</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-[250px]">Manage clients, services, inquiries and more in one place.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col items-center justify-center p-4 xl:p-6 relative">
        {/* Subtle background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none rounded-bl-full"></div>

        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 relative z-10 my-auto">
          
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-[#081326] rounded-full flex items-center justify-center mb-4 shadow-md ring-4 ring-gray-50">
              <img src="/main.png" alt="Logo" className="h-12 w-auto" />
            </div>
            <h2 className="text-xl font-bold text-[#081326]">Admin Login</h2>
            <div className="w-6 h-0.5 bg-[#f59e0b] mt-2"></div>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2.5 rounded-lg text-xs font-semibold text-center border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center pt-1">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                className="h-3.5 w-3.5 text-[#f59e0b] focus:ring-[#f59e0b] border-gray-300 rounded cursor-pointer accent-[#081326]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-700 cursor-pointer font-medium">
                Remember Me
              </label>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-[#081326] bg-[#f59e0b] hover:bg-[#d97706] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f59e0b] transition-colors gap-2"
              >
                Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            

          </form>
        </div>

        <div className="mt-4 text-xs text-gray-500 font-medium absolute bottom-4">
          &copy; 2026 <span className="text-gray-800 font-bold">KTR Consultants</span>. All rights reserved.crafted with ❤️ by <span className="text-[#F59E0B] font-bold cursor-pointer hover:underline transition-colors"> <a href="https://digicoders.in" target="_blank">Team Digicoders</a></span>
        </div>
      </div>
    </div>
  );
};

export default Login;

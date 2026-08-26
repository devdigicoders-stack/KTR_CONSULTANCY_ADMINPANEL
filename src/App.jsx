import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import AddNewClient from './pages/AddNewClient';
import EditClient from './pages/EditClient';
import Documents from './pages/Documents';
import Cibil from './pages/Cibil';
import CreditInfo from './pages/CreditInfo';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import AddService from './pages/AddService';
import OnlineApplications from './pages/OnlineApplications';
import Enquiries from './pages/Enquiries';
import CibilCases from './pages/CibilCases';
import CAQuotes from './pages/CAQuotes';
import ChainDeeds from './pages/ChainDeeds';
import PropertyAssessments from './pages/PropertyAssessments';
import EligibilityChecks from './pages/EligibilityChecks';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Users from './pages/Users';

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// AdminRoute component
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/new" element={<AddNewClient />} />
            <Route path="clients/edit/:id" element={<EditClient />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="documents" element={<Documents />} />
            <Route path="cibil" element={<AdminRoute><Cibil /></AdminRoute>} />
            <Route path="credit-info" element={<AdminRoute><CreditInfo /></AdminRoute>} />
            <Route path="services" element={<AdminRoute><Services /></AdminRoute>} />
            <Route path="service-details" element={<AdminRoute><ServiceDetails /></AdminRoute>} />
            <Route path="add-service" element={<AdminRoute><AddService /></AdminRoute>} />
            <Route path="online-applications" element={<AdminRoute><OnlineApplications /></AdminRoute>} />
            <Route path="enquiries" element={<AdminRoute><Enquiries /></AdminRoute>} />
            <Route path="cibil-cases" element={<AdminRoute><CibilCases /></AdminRoute>} />
            <Route path="ca-quotes" element={<AdminRoute><CAQuotes /></AdminRoute>} />
            <Route path="chain-deeds" element={<AdminRoute><ChainDeeds /></AdminRoute>} />
            <Route path="property-assessments" element={<AdminRoute><PropertyAssessments /></AdminRoute>} />
            <Route path="eligibility-checks" element={<AdminRoute><EligibilityChecks /></AdminRoute>} />
            <Route path="reports" element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<Users />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;

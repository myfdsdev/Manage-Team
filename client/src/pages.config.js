/**
 * pages.config.js - Page routing configuration
 */

import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import AttendanceHistory from './pages/AttendanceHistory';
import AttendanceReports from './pages/AttendanceReports';
import Checkout from './pages/Checkout';
import CompleteProfile from './pages/CompleteProfile';
import CompanySetup from './pages/CompanySetup';
import Dashboard from './pages/Dashboard';
import DirectMessages from './pages/DirectMessages';
import EmployeeDetails from './pages/EmployeeDetails';
import Feedback from './pages/Feedback';
import Groups from './pages/Groups';
import LeaveRequests from './pages/LeaveRequests';
import MyProfile from './pages/MyProfile';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProjectBoard from './pages/ProjectBoard';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Welcome from './pages/Welcome';
import __Layout from './Layout.jsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';
import MyStats from './pages/MyStats';
import ResetPassword from './pages/ResetPassword';
import SalaryManagement from './pages/admin/SalaryManagement';
import CompanySettings from './pages/admin/CompanySettings';
import DomainSettings from './pages/admin/DomainSettings';
import MySalary from './pages/MySalary';
import SuperAdmin from './pages/SuperAdmin';
import Training from './pages/Training';
import JoinAdmin from './pages/JoinAdmin';
import JoinMember from './pages/JoinMember';
import PurchaseRequired from './components/PurchaseRequired';

export const PAGES = {
    "AccessDenied": AccessDenied,
    "AdminDashboard": AdminDashboard,
    "AttendanceHistory": AttendanceHistory,
    "AttendanceReports": AttendanceReports,
    "Checkout": Checkout,
    "CompleteProfile": CompleteProfile,
    "CompanySetup": CompanySetup,
    "Dashboard": Dashboard,
    "DirectMessages": DirectMessages,
    "EmployeeDetails": EmployeeDetails,
    "Feedback": Feedback,
    "Groups": Groups,
    "Leaderboard": Leaderboard,
    "LeaveRequests": LeaveRequests,
    "MyProfile": MyProfile,
    "MySalary": MySalary,
    "MyStats": MyStats,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "ProjectBoard": ProjectBoard,
    "Projects": Projects,
    "ResetPassword": ResetPassword,
    "SalaryManagement": SalaryManagement,
    "CompanySettings": CompanySettings,
    "DomainSettings": DomainSettings,
    // Backwards-compat aliases for any old links to the previous salary pages
    "SalaryBoard": SalaryManagement,
    "SalaryConfig": SalaryManagement,
    "Settings": Settings,
    "Training": Training,
    "SuperAdmin": SuperAdmin,
    "Welcome": Welcome,
    "Login": Login,
    "Register": Register,
    "join-admin": JoinAdmin,
    "join-member": JoinMember,
    "no-access": PurchaseRequired,
};

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};

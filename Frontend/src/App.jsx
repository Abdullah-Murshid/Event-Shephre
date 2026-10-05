import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import LandingPage from './pages/public/LandingPage';
import About from './pages/public/About';
import Events from './pages/public/Events';
import EventDetails from './pages/public/EventDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManageEvents from './pages/dashboard/ManageEvents';
import ExhibitorDashboard from './pages/dashboard/ExhibitorDashboard';
import DashboardLayout from './components/layout/DashboardLayout';
import ApplyExhibitor from './pages/public/ApplyExhibitor';
import ManageUsers from './pages/dashboard/ManageUsers';
import ManageBooths from './pages/dashboard/ManageBooths';
import ManageFeedback from './pages/dashboard/ManageFeedback';
import ManageSchedules from './pages/dashboard/ManageSchedules';
import ExhibitorProfile from './pages/dashboard/ExhibitorProfile';
import ExhibitorBooth from './pages/dashboard/ExhibitorBooth';
import AttendeeDashboard from './pages/dashboard/AttendeeDashboard';
import BookmarkedEvents from './pages/dashboard/BookmarkedEvents';
import Inbox from './pages/public/Inbox';

import SpaceBackground from './components/SpaceBackground';

// Standardized Global Layout Wrapper
function PublicLayout() {
  const location = useLocation();
  const isInbox = location.pathname === '/inbox';
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-background relative overflow-x-hidden">
      <Navbar />
      <main className={clsx(
        "flex-grow flex flex-col relative z-10 w-full",
        isInbox && "min-h-[calc(100vh-80px)]"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-grow flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isInbox && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/apply-exhibitor" element={<ApplyExhibitor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Admin Routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/events" element={<ManageEvents />} />
            <Route path="admin/users" element={<ManageUsers />} />
            <Route path="admin/booths" element={<ManageBooths />} />
            <Route path="admin/feedback" element={<ManageFeedback />} />
            <Route path="admin/schedules" element={<ManageSchedules />} />
            
            {/* Exhibitor Routes */}
            <Route path="exhibitor" element={<ExhibitorDashboard />} />
            <Route path="exhibitor/profile" element={<ExhibitorProfile />} />
            <Route path="exhibitor/booth" element={<ExhibitorBooth />} />
            
            {/* Attendee Routes */}
            <Route path="attendee" element={<AttendeeDashboard />} />
            <Route path="attendee/bookmarks" element={<BookmarkedEvents />} />
            <Route path="messages" element={<Inbox />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

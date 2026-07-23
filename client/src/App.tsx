import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CarProvider } from './context/CarContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// User Portal Pages
import Home from './pages/Home';
import CarListing from './pages/CarListing';
import CarDetail from './pages/CarDetail';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

// Admin Portal Pages
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAddCar from './pages/AdminAddCar';
import AdminViewCars from './pages/AdminViewCars';
import AdminEditCar from './pages/AdminEditCar';

function App() {
  return (
    <CarProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-paper text-ink font-body">
          {/* Newspaper Broad Sheet layout frame */}
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<CarListing />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminAnalytics />} />
              <Route path="/admin/add" element={<AdminAddCar />} />
              <Route path="/admin/cars" element={<AdminViewCars />} />
              <Route path="/admin/edit/:id" element={<AdminEditCar />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </CarProvider>
  );
}

export default App;

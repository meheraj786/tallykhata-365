import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { useState } from 'react';
import BottomNav from './components/BottomNav';
import AddTransactionModal from './components/AddTransactionModal';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import More from './pages/More';


function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen md:max-w-[80%] bg-[#f8fafc] md:ml-55  pb-20"> {/* pb for bottom nav */}
        <Routes>
          <Route path="/" element={<Home onAddClick={() => setModalOpen(true)} />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/more" element={<More />} />
        </Routes>

        <AddTransactionModal open={modalOpen} onOpenChange={setModalOpen} />
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
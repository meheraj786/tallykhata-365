import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";
import { initAuthListener, useAuthStore } from "./store/useAuthStore";
import { useLedgerStore } from "./store/useLedgerStore";
import BottomNav from "./components/BottomNav";
import AddCustomerModal from "./components/AddCustomerModal";
import Home from "./pages/Home";
import CustomerDetails from "./pages/CustomerDetails";
import Reports from "./pages/Reports";
import More from "./pages/More";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

function App() {
  const { user, loading } = useAuthStore();
  const setCustomers = useLedgerStore((state) => state.setCustomers);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  useEffect(() => {
    initAuthListener();
  }, []);

  useEffect(() => {
    let unsubCustomers = () => {};
    if (user) {
      const qCust = query(
        collection(db, "users", user.uid, "customers"),
        orderBy("updatedAt", "desc"),
      );
      unsubCustomers = onSnapshot(
        qCust,
        (snap) => {
          setCustomers(
            snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[],
          );
        },
        (err) => console.error(err),
      );
    } else {
      setCustomers([]);
    }
    return () => unsubCustomers();
  }, [user, setCustomers]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-emerald-600 font-bold italic">
        টালিখাতা 365 লোড হচ্ছে...
      </div>
    );

  return (
    <Router>
      <div
        className={
          user
            ? "min-h-screen md:max-w-[80%] bg-[#f8fafc] pb-20 md:ml-55"
            : "min-h-screen w-full bg-[#f8fafc]"
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Home onAddCustomerClick={() => setCustomerModalOpen(true)} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/customer/:id"
            element={user ? <CustomerDetails /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={user ? <Reports /> : <Navigate to="/login" />}
          />
          <Route
            path="/more"
            element={user ? <More /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/" />}
          />
        </Routes>
        {user && (
          <>
            <AddCustomerModal
              open={customerModalOpen}
              onOpenChange={setCustomerModalOpen}
            />
            <BottomNav />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;

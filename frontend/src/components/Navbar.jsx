import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ onSidebarToggle, sidebarOpen }) {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg border-b border-[#E2E8F0] z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-[#0E7490]">
          iAttend
        </Link>

        {/* Buttons + Dropdowns */}
        <div className="relative flex items-center space-x-2 md:space-x-4">

          {/* LOGIN */}
          <div
            className="relative"
            onMouseEnter={() => setShowLogin(true)}
            onMouseLeave={() => setShowLogin(false)}
          >
            <button
              className="px-4 py-2 rounded-lg border border-[#0E7490] text-[#0E7490] hover:bg-[#0E7490] hover:text-white transition"
              onClick={() => setShowLogin((prev) => !prev)}
            >
              Login
            </button>

            {showLogin && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-lg w-40 py-2 z-50">
                <Link to="/login/admin" className="block px-4 py-2 hover:bg-gray-100">Admin</Link>
                <Link to="/login/teacher" className="block px-4 py-2 hover:bg-gray-100">Teacher</Link>
                <Link to="/login/student" className="block px-4 py-2 hover:bg-gray-100">Student</Link>
              </div>
            )}
          </div>

          {/* REGISTER */}
          <div
            className="relative"
            onMouseEnter={() => setShowRegister(true)}
            onMouseLeave={() => setShowRegister(false)}
          >
            <button
              className="px-4 py-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#4F46E5] transition"
              onClick={() => setShowRegister((prev) => !prev)}
            >
              Register
            </button>

            {showRegister && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg border rounded-lg w-40 py-2 z-50">
                <Link to="/register/admin" className="block px-4 py-2 hover:bg-gray-100">Admin</Link>
                <Link to="/register/teacher" className="block px-4 py-2 hover:bg-gray-100">Teacher</Link>
                <Link to="/register/student" className="block px-4 py-2 hover:bg-gray-100">Student</Link>
              </div>
            )}
          </div>

          {/* MOBILE SIDEBAR MENU BUTTON */}
          <button
            onClick={onSidebarToggle}
            className="md:hidden px-3 py-2 bg-indigo-500 text-white rounded-lg"
          >
            {sidebarOpen ? "Close" : "Menu"}
          </button>

        </div>
      </div>
    </nav>
  );
}

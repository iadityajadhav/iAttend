import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

        {/* Text Section */}
        <div>
          <h1 className="text-5xl font-extrabold text-[#0E7490] leading-tight">
            Smart Attendance  
            <span className="text-[#6366F1]"> Made Simple</span>
          </h1>

          <p className="mt-6 text-lg text-[#1E293B] max-w-md">
            iAttend helps institutions automate attendance with ease.  
            Fast, accurate, and designed for teachers, students, and admins.
          </p>

          <div className="mt-8 space-x-4">
            <Link
              to="/login/student"
              className="px-6 py-3 rounded-lg bg-[#0E7490] text-white text-lg hover:bg-[#6366F1] transition"
            >
              Get Started
            </Link>

            <Link
              to="/register/student"
              className="px-6 py-3 rounded-lg border border-[#6366F1] text-[#6366F1] text-lg hover:bg-[#6366F1] hover:text-white transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Illustration Section */}
        <div className="flex justify-center">
          <div className="bg-white shadow-xl border border-[#E2E8F0] rounded-2xl p-8 max-w-sm text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3209/3209273.png"
              alt="Attendance Icon"
              className="w-32 mx-auto mb-6"
            />
            <h2 className="text-2xl font-semibold text-[#1E293B]">
              Track Attendance Effortlessly
            </h2>
            <p className="text-[#475569] mt-2">
              Cloud-based, fast, and reliable — built for modern institutions.
            </p>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-[#1E293B] mb-12">
          Why Choose <span className="text-[#6366F1]">iAttend</span>?
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">

          {/* Feature Card */}
          <div className="bg-white shadow-md p-6 rounded-xl border border-[#E2E8F0] text-center">
            <h3 className="text-xl font-semibold text-[#0E7490]">Fast</h3>
            <p className="text-[#1E293B] mt-2">Mark attendance in seconds.</p>
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl border border-[#E2E8F0] text-center">
            <h3 className="text-xl font-semibold text-[#0E7490]">Accurate</h3>
            <p className="text-[#1E293B] mt-2">Error-free digital logs.</p>
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl border border-[#E2E8F0] text-center">
            <h3 className="text-xl font-semibold text-[#0E7490]">Secure</h3>
            <p className="text-[#1E293B] mt-2">Role-based authentication.</p>
          </div>

        </div>
      </section>

      <center>
        <div className="mt-10 text-sm text-gray-500 pb-[20px]">
          &copy; 2025 iAttend. All rights reserved.
        </div>
      </center>

    </div>
  );
}

import { useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function RegisterStudent() {
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    collegeId: "",
    branch: "",
    year: "",
    sem: "",
    roll: "",
    password: "",
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Validations
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/.test(
      password
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Frontend validations
    if (!validateName(formData.name)) {
      setError("Name must contain only letters and spaces.");
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError(
        "Password must be 8-16 chars, include 1 uppercase, 1 lowercase, 1 number, and 1 special char."
      );
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/register",
        formData
      );

      setMessage(res.data.message);
      setFormData({
        name: "",
        userId: "",
        collegeId: "",
        branch: "",
        year: "",
        sem: "",
        roll: "",
        password: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-16">
        <div className="bg-white w-full max-w-lg shadow-xl rounded-2xl p-8 border border-[#E2E8F0]">
          <h1 className="text-3xl font-bold text-center text-[#0E7490] mb-6">
            Student Registration
          </h1>

          {message && (
            <div className="text-green-600 text-center mb-3 font-medium">
              {message}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-center mb-3 font-medium">{error}</div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-[#1E293B] mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* User ID */}
            <div>
              <label className="block text-[#1E293B] mb-1">User ID</label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* College ID */}
            <div>
              <label className="block text-[#1E293B] mb-1">College ID</label>
              <input
                type="text"
                name="collegeId"
                value={formData.collegeId}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-[#1E293B] mb-1">Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-[#1E293B] mb-1">Year</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block text-[#1E293B] mb-1">Semester</label>
              <input
                type="number"
                name="sem"
                value={formData.sem}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-[#1E293B] mb-1">Roll Number</label>
              <input
                type="number"
                name="roll"
                value={formData.roll}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#1E293B] mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0E7490] hover:bg-[#6366F1] text-white py-3 rounded-lg transition font-semibold disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
import { useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar"; // ✅ Include Navbar

export default function RegisterTeacher() {
  const [formData, setFormData] = useState({
    name: "",
    userId: "",
    collegeId: "",
    password: "",
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Validation functions
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
        "http://localhost:5000/api/teacher/register",
        formData
      );

      setMessage(res.data.message);
      setFormData({ name: "", userId: "", collegeId: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar /> {/* ✅ Navbar always on top */}

      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-16">
        <div className="bg-white w-full max-w-lg shadow-xl rounded-2xl p-8 border border-[#E2E8F0]">
          <h1 className="text-3xl font-bold text-center text-[#0E7490] mb-6">
            Teacher Registration
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
            {/* Full Name */}
            <div>
              <label className="block text-[#1E293B] mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* User ID */}
            <div>
              <label className="block text-[#1E293B] mb-1">User ID</label>
              <input
                type="text"
                name="userId"
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
                value={formData.userId}
                onChange={handleChange}
                required
              />
            </div>

            {/* College ID */}
            <div>
              <label className="block text-[#1E293B] mb-1">College ID</label>
              <input
                type="text"
                name="collegeId"
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
                value={formData.collegeId}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#1E293B] mb-1">Password</label>
              <input
                type="password"
                name="password"
                className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
                value={formData.password}
                onChange={handleChange}
                required
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

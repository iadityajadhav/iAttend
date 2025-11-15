import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { role } = useParams(); // Read role from URL (admin/teacher/student)

  const [formData, setFormData] = useState({
    role: role || "admin", // Default role comes from URL
    userId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Update dropdown if URL role changes
  useEffect(() => {
    if (role) {
      setFormData((prev) => ({ ...prev, role }));
    }
  }, [role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/${formData.role}/login`,
        {
          userId: formData.userId,
          password: formData.password,
        }
      );

      setMessage(res.data.message);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", formData.role);

      setFormData({ ...formData, userId: "", password: "" });

      if (formData.role === "admin") {
        navigate("/admin/profile");
      } else if (formData.role === "teacher") {
        navigate("/teacher/profile");
      } else if (formData.role === "student") {
        navigate("/student/profile");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] py-16">
      <div className="bg-white w-full max-w-md shadow-xl rounded-2xl p-8 border border-[#E2E8F0]">
        <h1 className="text-3xl font-bold text-center text-[#0E7490] mb-6">
          Login
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
          
          {/* Role Selection */}
          <div>
            <label className="block text-[#1E293B] mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#6366F1]"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
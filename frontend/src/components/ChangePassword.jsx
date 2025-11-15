import { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

export default function ChangePassword() {
  const [role, setRole] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get role from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
    }
  }, []);

  const toggleExpand = () => {
    setError("");
    setExpanded(!expanded);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Password validation: 8-16 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,16}$/;

    if (!oldPassword || !newPassword) {
      setError("Both old and new passwords are required");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setError(
        "New password must be 8-16 chars with uppercase, lowercase, number, and special char"
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/${role}/update-password`;
      const res = await axios.put(
        url,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        // Reset fields
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setExpanded(false);

        // Show success modal
        setShowSuccessModal(true);
      } else {
        setError(res.data?.message || "Failed to update password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
    setLoading(false);
  };

  return (
    <div className="mt-6">
      {/* Change Password Button */}
      <button
        onClick={toggleExpand}
        className="w-full text-left px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-indigo-600 transition"
      >
        Change Password
      </button>

      {/* Expandable form */}
      {expanded && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm font-medium">Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter old password"
              className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-cyan-700 text-white hover:bg-cyan-800 disabled:opacity-50 transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-green-700 mb-4">Success!</h3>
            <p className="text-gray-700 mb-6">Password updated successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-6 py-2 rounded-lg bg-cyan-700 text-white hover:bg-cyan-800"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

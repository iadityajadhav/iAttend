import { useState } from "react";
import axios from "axios";

export default function DeleteAccount({ userId, role }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const toggleExpand = () => {
    setError("");
    setSuccessMsg("");
    setExpanded(!expanded);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!confirmText) {
      setError("Please type the confirmation text to delete your account");
      return;
    }

    // Check if user typed exactly "Delete <userId>"
    if (confirmText !== `Delete ${userId}`) {
      setError(
        `Confirmation text does not match. Type exactly: "Delete ${userId}"`
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/${role}/delete-account`;
      const res = await axios.post(
        url,
        { userId, confirmText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Account deletion scheduled");
        setConfirmText("");
        setExpanded(false);
      } else {
        setError(res.data?.message || "Failed to schedule account deletion");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
    setLoading(false);
  };

  return (
    <div className="mt-6">
      {/* Delete Account Button */}
      <button
        onClick={toggleExpand}
        className="w-full text-left px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      >
        Delete Account
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

          <p className="text-gray-700 text-sm">
            Type <span className="font-semibold">Delete {userId}</span> to
            confirm account deletion.
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Delete ${userId}`}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 transition"
          >
            {loading ? "Scheduling..." : "Schedule Deletion"}
          </button>
        </form>
      )}

      {/* Success Modal */}
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-green-700 mb-4">
              Success!
            </h3>
            <p className="text-gray-700 mb-6">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg("")}
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

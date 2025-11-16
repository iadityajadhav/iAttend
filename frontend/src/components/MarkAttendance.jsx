import { useState } from "react";
import axios from "axios";

export default function MarkAttendance() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); 
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleMarkAttendance = async (e) => {
    e.preventDefault();

    if (!code) {
      setMessage("Please enter the attendance code");
      setType("error");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/attendance/mark",
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setType("success");
      setMessage(res.data.message);
      setCode("");

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Try again.";
      setType("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-80 pt-5 p-6">

      {/* PAGE TITLE */}
      <h2 className="text-xl font-bold text-cyan-700 mb-4">
        Mark Attendance
      </h2>

      {/* MESSAGE BOX (MATCHES TakeAttendance STYLE) */}
      {message && (
        <div
          className={`mb-4 p-3 rounded border ${
            type === "success"
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-red-100 text-red-700 border-red-300"
          }`}
        >
          {message}
        </div>
      )}

      {/* INPUT SECTION */}
      <div className="mb-4">
        <label className="font-medium text-gray-700">Attendance Code</label>
        <input
          type="text"
          placeholder="Enter code"
          className="w-full mt-1 p-2 border rounded outline-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      {/* SUBMIT BUTTON — SAME STYLE AS TakeAttendance */}
      <button
        onClick={handleMarkAttendance}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? "Marking..." : "Mark Attendance"}
      </button>

      {/* SMALL FOOTNOTE */}
      <div className="mt-6 text-sm text-gray-600">
        If it shows <b>"Invalid or expired attendance code"</b>, it means there is
        <span className="font-semibold"> no active attendance session</span> right now.
      </div>
    </div>
  );
}

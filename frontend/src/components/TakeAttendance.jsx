import { useState, useEffect } from "react";
import axios from "axios";

export default function TakeAttendance() {
  const token = localStorage.getItem("token");

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // form fields
  const [selectedClass, setSelectedClass] = useState(null);
  const [lectureNumber, setLectureNumber] = useState("");
  const [validForSeconds, setValidForSeconds] = useState("");

  // modal data
  const [showModal, setShowModal] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);

  // Fetch teacher's classes
  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/teacher/my-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setClasses(res.data.classes);
      } else {
        setError(res.data?.message || "Failed to load classes");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
    setLoading(false);
  };

  // Send POST request to start attendance
  const handleStartAttendance = async () => {
    if (!selectedClass)
      return setError("Please select a class");

    if (!lectureNumber || !validForSeconds)
      return setError("Lecture number & validity time are required");

    setError("");

    const payload = {
      branch: selectedClass.branch,
      year: selectedClass.year,
      sem: selectedClass.sem,
      subject: selectedClass.subject,
      lectureNumber: Number(lectureNumber),
      validForSeconds: Number(validForSeconds),
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/attendance/start",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSessionResult(res.data);
        setShowModal(true);

        // Clear fields
        setLectureNumber("");
        setValidForSeconds("");
        setSelectedClass(null);
      } else {
        setError(res.data.message || "Failed to start attendance");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start session");
    }
  };

  if (loading) {
    return <div className="p-6">Loading classes...</div>;
  }

  // --------------- NEW CONDITION ADDED HERE ----------------
  if (classes.length === 0) {
    return (
      <div className="md:ml-80 pt-5 p-6">
        <h2 className="text-xl font-bold text-cyan-700 mb-4">Take Attendance</h2>

        <div className="bg-yellow-100 text-yellow-800 p-4 rounded border border-yellow-300 shadow">
          No classes found.{" "}
          <span className="font-semibold">
            Add classes from "Manage Your Classes" section to take attendance.
          </span>
        </div>
      </div>
    );
  }
  // ----------------------------------------------------------

  return (
    <>
      {/* PAGE CONTENT */}
      <div className="md:ml-80 pt-5 p-6">

        <h2 className="text-xl font-bold text-cyan-700 mb-4">Take Attendance</h2>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded border border-red-300">
            {error}
          </div>
        )}

        {/* CLASS DROPDOWN */}
        <div className="mb-4">
          <label className="font-medium text-gray-700">Select Class</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            value={selectedClass ? selectedClass._id : ""}
            onChange={(e) =>
              setSelectedClass(classes.find((cls) => cls._id === e.target.value))
            }
          >
            <option value="">-- Select Class --</option>

            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {`${cls.branch} - ${cls.year} - Sem ${cls.sem} - ${cls.subject}`}
              </option>
            ))}
          </select>
        </div>

        {/* Auto filled class details */}
        {selectedClass && (
          <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 border rounded">
            <div><strong>Branch:</strong> {selectedClass.branch}</div>
            <div><strong>Year:</strong> {selectedClass.year}</div>
            <div><strong>Semester:</strong> {selectedClass.sem}</div>
            <div><strong>Subject:</strong> {selectedClass.subject}</div>
          </div>
        )}

        {/* Lecture Number */}
        <div className="mb-4">
          <label className="font-medium text-gray-700">Lecture Number</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded"
            value={lectureNumber}
            onChange={(e) => setLectureNumber(e.target.value)}
            placeholder="e.g. 1"
          />
        </div>

        {/* Validity */}
        <div className="mb-4">
          <label className="font-medium text-gray-700">
            Valid For (seconds)
          </label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded"
            value={validForSeconds}
            onChange={(e) => setValidForSeconds(e.target.value)}
            placeholder="e.g. 60"
          />
        </div>

        {/* START BUTTON */}
        <button
          onClick={handleStartAttendance}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Start Attendance
        </button>
      </div>

      {/* MODAL - SHOW GENERATED CODE */}
      {showModal && sessionResult && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg border">

            <h3 className="text-xl font-bold text-indigo-700 mb-3">
              Attendance Session Started
            </h3>

            <p className="text-gray-700 mb-2">
              <strong>Code:</strong> {sessionResult.code}
            </p>

            <p className="text-gray-700 mb-2">
              <strong>Expires At:</strong> {new Date(sessionResult.expiresAt).toLocaleString()}
            </p>

            <p className="text-gray-700 mb-4">
              <strong>Total Students:</strong> {sessionResult.totalStudents}
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

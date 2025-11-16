import { useEffect, useState } from "react";
import axios from "axios";
import TakeAttendance from "./TakeAttendance";

export default function TeacherClasses() {
  const token = localStorage.getItem("token");

  const [availableClasses, setAvailableClasses] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [sem, setSem] = useState("");
  const [subject, setSubject] = useState("");

  const [modalMsg, setModalMsg] = useState("");

  // -----------------------------
  //  Fetch available classes
  // -----------------------------
  useEffect(() => {
    fetchAvailableClasses();
    fetchMyClasses();
  }, []);

  const fetchAvailableClasses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/teacher/available-classes",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableClasses(res.data.classes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyClasses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/teacher/my-classes",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyClasses(res.data.classes);
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // Handle selecting class from dropdown
  // -----------------------------
  const handleSelectClass = (classId) => {
    const cls = availableClasses.find((c) => c._id === classId);
    setSelectedClass(cls);

    if (cls) {
      setBranch(cls.branch);
      setYear(cls.year);
      setSem(cls.sem);
      setSubject(""); // reset subject selection
    }
  };

  // -----------------------------
  // Add class to teacher profile
  // -----------------------------
  const handleAddClass = async () => {
    if (!branch || !year || !sem || !subject) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = { branch, year, sem, subject };

      const res = await axios.post(
        "http://localhost:5000/api/teacher/add-class",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyClasses(res.data.classes);
      setModalMsg("Class Added Successfully!");

      setTimeout(() => setModalMsg(""), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add class");
    }
  };

  // -----------------------------
  // Remove class
  // -----------------------------
  const handleRemoveClass = async (cls) => {
    try {
      const res = await axios.delete(
        "http://localhost:5000/api/teacher/remove-class",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            branch: cls.branch,
            year: cls.year,
            sem: cls.sem,
            subject: cls.subject
          }
        }
      );

      setMyClasses(res.data.classes);
      setModalMsg("Class Removed Successfully!");

      setTimeout(() => setModalMsg(""), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove class");
    }
  };

  return (
    <>
      <TakeAttendance/>
      <div className="md:ml-80 pt-5 p-6">

        {/* SUCCESS MODAL */}
        {modalMsg && (
          <div className="fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
            {modalMsg}
          </div>
        )}

        <h2 className="text-xl font-bold text-cyan-700 mb-4">Manage Your Classes</h2>

        {/* -----------------------------
            ADD CLASS SECTION
        ------------------------------ */}
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Add Class</h3>

          {/* Class Dropdown */}
          <select
            className="w-full p-2 border rounded mb-3"
            onChange={(e) => handleSelectClass(e.target.value)}
          >
            <option value="">Select Class</option>

            {availableClasses.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.branch} - {cls.year} - SEM {cls.sem}
              </option>
            ))}
          </select>

          {/* If class selected → show subject dropdown */}
          {selectedClass && (
            <>
              <select
                className="w-full p-2 border rounded"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {selectedClass.subjects.map((sub, i) => (
                  <option key={i} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddClass}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add Class
              </button>
            </>
          )}
        </div>

        {/* -----------------------------
            MY CLASSES SECTION
        ------------------------------ */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Your Classes</h3>

          {myClasses.length === 0 ? (
            <p className="text-gray-500">No classes added yet.</p>
          ) : (
            <div className="space-y-4">
              {myClasses.map((cls) => (
                <div
                  key={cls._id}
                  className="p-3 border rounded bg-white flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{cls.branch}</p>
                    <p>Year: {cls.year}</p>
                    <p>Sem: {cls.sem}</p>
                    <p>Subject: {cls.subject}</p>
                  </div>

                  <button
                    onClick={() => handleRemoveClass(cls)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

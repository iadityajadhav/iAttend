import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentRecord() {
  const [student, setStudent] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [msg, setMsg] = useState(null);
  const [msgType, setMsgType] = useState("");

  const token = localStorage.getItem("token");

  // Fetch Student Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/student/get-profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStudent(res.data.user);
      } catch (err) {
        console.error("Profile load error:", err);
        setMsg("Failed to load profile");
        setMsgType("error");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Fetch Attendance for selected subject
  const fetchAttendance = async (subject) => {
    if (!student) return;

    setLoadingAttendance(true);
    setAttendance(null);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/student/get-attendance`,
        {
          params: {
            subject,
            branch: student.branch,
            year: student.year,
            sem: student.sem,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAttendance(res.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to fetch attendance. Try again.";

      setAttendance({ error: errorMsg });
    } finally {
      setLoadingAttendance(false);
    }
  };

  if (loadingProfile)
    return (
      <div className="md:ml-80 pt-5 p-6 text-center text-lg text-gray-600">
        Loading...
      </div>
    );

  if (!student)
    return (
      <div className="md:ml-80 pt-5 p-6 text-center text-red-500 text-lg">
        Failed to load your profile
      </div>
    );

  return (
    <div className="md:ml-80 pt-5 p-6">
      {/* PAGE TITLE */}
      <h2 className="text-xl font-bold text-cyan-700 mb-4">
        Your Attendance Records
      </h2>

      {/* TOP MESSAGE BOX */}
      {msg && (
        <div
          className={`mb-4 p-3 rounded border ${
            msgType === "error"
              ? "bg-red-100 text-red-700 border-red-300"
              : "bg-green-100 text-green-700 border-green-300"
          }`}
        >
          {msg}
        </div>
      )}

      {/* STUDENT INFO BOX */}
      <div className="bg-gray-50 p-4 rounded-xl border mb-6 shadow-sm">
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>Branch:</strong> {student.branch}</p>
        <p><strong>Year / Sem:</strong> {student.year} / {student.sem}</p>
        <p><strong>Roll:</strong> {student.roll}</p>
      </div>

      {/* SUBJECT LIST */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Subjects</h3>

      <div className="space-y-3">
        {Array.isArray(student.subjects) && student.subjects.length > 0 ? (
          student.subjects.map((subj, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white border p-4 rounded-xl shadow-sm"
            >
              <span className="text-lg font-medium text-gray-700">{subj}</span>

              <button
                onClick={() => fetchAttendance(subj)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                View Attendance
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 p-4 border rounded-xl bg-gray-50">
            No subjects assigned.
          </div>
        )}
      </div>

      {/* ATTENDANCE RESULT */}
      <div className="mt-8">
        {loadingAttendance && (
          <p className="text-center text-gray-600">Loading attendance...</p>
        )}

        {attendance && attendance.error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl text-center">
            {attendance.error}
          </div>
        )}

        {attendance && attendance.success && (
          <div className="p-6 bg-white border border-green-300 rounded-2xl shadow-md">
            <h3 className="text-xl font-bold text-green-700 text-center mb-4">
              {attendance.subject} Attendance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl shadow-sm text-center">
                <p className="text-gray-600">Total Lectures</p>
                <p className="text-xl font-bold">{attendance.totalLectures}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl shadow-sm text-center">
                <p className="text-gray-600">Present</p>
                <p className="text-xl font-bold text-green-600">
                  {attendance.totalPresent}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl shadow-sm text-center">
                <p className="text-gray-600">Absent</p>
                <p className="text-xl font-bold text-red-600">
                  {attendance.totalAbsent}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl shadow-sm text-center">
                <p className="text-gray-600">Percentage</p>
                <p className="text-xl font-bold text-blue-600">
                  {attendance.attendancePercentage}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

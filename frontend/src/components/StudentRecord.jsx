import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentRecord() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/student/get-profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudent(res.data.user);
    };
    fetchProfile();
  }, []);

  const fetchAttendance = async (subject) => {
    setLoading(true);
    setAttendance(null);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/student/view-attendance",
        {
          params: { subject },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAttendance(res.data);
    } catch (err) {
      console.error(err);
      setAttendance({ error: "Failed to fetch attendance" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:ml-80 p-6">

      <h2 className="text-2xl font-bold text-center text-cyan-700 mb-6">
        My Attendance
      </h2>

      {/* STUDENT INFO */}
      {student && (
        <div className="bg-gray-50 p-4 rounded border mb-6">
          <p><b>Name:</b> {student.name}</p>
          <p><b>Roll:</b> {student.roll}</p>
          <p><b>Branch:</b> {student.branch}</p>
          <p><b>Year / Sem:</b> {student.year} / {student.sem}</p>
        </div>
      )}

      {/* SUBJECT LIST */}
      <div className="space-y-3 mb-6">
        {student?.subjects?.map((sub, i) => (
          <div
            key={i}
            className="flex justify-between bg-white p-4 border rounded"
          >
            <span className="font-semibold">{sub}</span>
            <button
              onClick={() => fetchAttendance(sub)}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              View
            </button>
          </div>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">Loading attendance...</p>
      )}

      {/* ERROR */}
      {attendance?.error && (
        <p className="text-center text-red-500">
          {attendance.error}
        </p>
      )}

      {/* ATTENDANCE DATA */}
      {attendance && attendance.success && (
        <>
          {/* SUMMARY */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded text-center">
              <p>Total Lectures</p>
              <b>{attendance.totalLectures}</b>
            </div>
            <div className="bg-green-100 p-4 rounded text-center">
              <p>Present</p>
              <b>{attendance.present}</b>
            </div>
            <div className="bg-red-100 p-4 rounded text-center">
              <p>Absent</p>
              <b>{attendance.absent}</b>
            </div>
            <div className="bg-blue-100 p-4 rounded text-center">
              <p>Percentage</p>
              <b>{attendance.percentage}%</b>
            </div>
          </div>

          {/* TABLE */}
          {attendance.attendance &&
          attendance.attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border text-center">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">Lecture</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.attendance.map((a, i) => (
                    <tr key={i}>
                      <td className="border p-2">{a.date}</td>
                      <td className="border p-2">{a.lectureNumber}</td>
                      <td
                        className={`border p-2 font-bold ${
                          a.status === "Present"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {a.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-4">
              No attendance record found for this subject.
            </p>
          )}
        </>
      )}
    </div>
  );
}

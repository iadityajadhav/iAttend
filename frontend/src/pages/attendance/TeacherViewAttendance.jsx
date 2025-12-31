import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import HandleProfile from "../../components/HandleProfile";

export default function TeacherViewAttendance() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const branch = params.get("branch");
  const year = params.get("year");
  const sem = params.get("sem");
  const subject = params.get("subject");

  const token = localStorage.getItem("token");

  const [records, setRecords] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");

  // Manual add form
  const [form, setForm] = useState({
    userId: "",
    date: "",
    lectureNumber: "",
    status: "present",
  });

  // ============================
  // FETCH ATTENDANCE
  // ============================
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/attendance/teacher/view",
        {
          params: {
            branch,
            year,
            sem,
            subject,
            date: dateFilter || undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.records || [];

      const colSet = new Set();
      data.forEach((s) =>
        s.attendance.forEach((a) =>
          colSet.add(`${a.date}|${a.lectureNumber}`)
        )
      );

      const sorted = [...colSet].sort((a, b) => {
        const [d1, l1] = a.split("|");
        const [d2, l2] = b.split("|");
        return new Date(d1) - new Date(d2) || l1 - l2;
      });

      setColumns(sorted);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  // ============================
  // TOGGLE ATTENDANCE
  // ============================
  const toggleAttendance = async (student, col) => {
    const [date, lectureNumber] = col.split("|");

    const isPresent = student.attendance.some(
      (a) => a.date === date && a.lectureNumber === Number(lectureNumber)
    );

    if (
      !window.confirm(
        `Mark ${student.name} as ${
          isPresent ? "ABSENT" : "PRESENT"
        }?`
      )
    )
      return;

    await axios.put(
      "http://localhost:5000/api/attendance/teacher/update",
      {
        userId: student.userId,
        subject,
        date,
        lectureNumber,
        status: isPresent ? "absent" : "present",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    fetchAttendance();
  };

  // ============================
  // MANUAL ADD
  // ============================
  const handleManualAdd = async (e) => {
    e.preventDefault();

    await axios.put(
      "http://localhost:5000/api/attendance/teacher/update",
      {
        ...form,
        subject,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setForm({
      userId: "",
      date: "",
      lectureNumber: "",
      status: "present",
    });

    fetchAttendance();
  };

  return (
    <>
      <HandleProfile/>
      <div className="md:ml-80 p-6">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-4">
          Attendance – {subject}
        </h2>

        {/* DATE FILTER */}
        <div className="flex mb-6">
          <h3 className="font-semibold mb-3 pt-[20px] pr-[15px]">
            📒Sort Attendance by Date : 
          </h3> 
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* MANUAL ADD */}
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold mb-3">➕ Add Attendance Manually</h3>

          <form
            onSubmit={handleManualAdd}
            className="grid grid-cols-1 md:grid-cols-5 gap-3"
          >
            <input
              placeholder="Student UserId"
              value={form.userId}
              onChange={(e) =>
                setForm({ ...form, userId: e.target.value })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              className="border p-2 rounded"
              required
            />

            <input
              type="number"
              placeholder="Lecture No"
              value={form.lectureNumber}
              onChange={(e) =>
                setForm({ ...form, lectureNumber: e.target.value })
              }
              className="border p-2 rounded"
              required
            />

            <select
              className="border p-2 rounded"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>

            <button className="bg-indigo-600 text-white rounded px-4 py-2">
              Save
            </button>
          </form>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-center text-gray-500">
            No attendance record found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Roll</th>
                  <th className="border p-2">Name</th>

                  {columns.map((c, i) => {
                    const [d, l] = c.split("|");
                    return (
                      <th key={i} className="border p-2">
                        {d}
                        <br />
                        <small>L{l}</small>
                      </th>
                    );
                  })}

                  <th className="border p-2">%</th>
                </tr>
              </thead>

              <tbody>
                {records.map((s, i) => {
                  let present = 0;

                  return (
                    <tr key={i}>
                      <td className="border p-2">{s.roll}</td>
                      <td className="border p-2">{s.name}</td>

                      {columns.map((c, idx) => {
                        const [d, l] = c.split("|");
                        const found = s.attendance.find(
                          (a) =>
                            a.date === d &&
                            a.lectureNumber === Number(l)
                        );

                        if (found) present++;

                        return (
                          <td
                            key={idx}
                            onClick={() => toggleAttendance(s, c)}
                            className={`border p-2 cursor-pointer font-semibold
                              ${
                                found
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                          >
                            {found ? "P" : "A"}
                          </td>
                        );
                      })}

                      <td className="border p-2 font-bold text-blue-600">
                        {(
                          (present / columns.length) *
                          100
                        ).toFixed(0)}
                        %
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

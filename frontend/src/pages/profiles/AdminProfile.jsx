import { useEffect, useState } from "react";
import axios from "axios";
import HandleProfile from "../../components/HandleProfile";

export default function AdminProfile() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addForm, setAddForm] = useState({
    branch: "",
    year: "",
    sem: "",
    subjects: [""]
  });

  const [editClass, setEditClass] = useState(null); // selected class object
  const [editSubjects, setEditSubjects] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/get-classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data.classes || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load classes");
      setLoading(false);
    }
  };

  // -------------------------------
  // ADD A NEW CLASS
  // -------------------------------
const handleAddClass = async () => {
  try {
    const payload = {
      branch: addForm.branch,
      year: addForm.year,
      sem: Number(addForm.sem),
      subjects: addForm.subjects.filter(s => s.trim() !== "") // remove empty subjects
    };

    const res = await axios.post(
      "http://localhost:5000/api/admin/add-class",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setClasses(res.data.classes);

    // Reset form
    setAddForm({
      branch: "",
      year: "",
      sem: "",
      subjects: [""]
    });

  } catch (err) {
    setError(err.response?.data?.message || "Failed to add class");
  }
};

  // -------------------------------
  // UPDATE CLASS SUBJECTS
  // -------------------------------
  const handleUpdateClass = async () => {
    try {
      const payload = {
        branch: editClass.branch,
        year: editClass.year,
        sem: editClass.sem,
        confirmText,
        subjects: editSubjects.split(",").map(s => s.trim())
      };

      const res = await axios.put(
        "http://localhost:5000/api/admin/update-class",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClasses(res.data.classes);
      setEditClass(null);
      setConfirmText("");
      setEditSubjects("");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  // -------------------------------
  // DELETE CLASS
  // -------------------------------
  const handleDeleteClass = async (cls) => {
    try {
      const payload = {
        branch: cls.branch,
        year: cls.year,
        sem: cls.sem,
        confirmText,
      };

      const res = await axios.delete(
        "http://localhost:5000/api/admin/delete-class",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: payload
        }
      );

      setClasses(res.data.classes);
      setConfirmText("");
      setEditClass(null);
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <HandleProfile/>
      <div className="md:ml-80 pt-5 p-6">
        <h2 className="text-xl font-bold text-cyan-700 mb-4">Manage Classes</h2>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}

        {/* ------------------------------------- */}
        {/* ADD CLASS SECTION */}
        {/* ------------------------------------- */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">Create New Class</h3>

          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="Branch"
              className="p-2 border rounded"
              value={addForm.branch}
              onChange={(e) =>
                setAddForm({ ...addForm, branch: e.target.value })
              }
            />

            <input
              placeholder="Year"
              className="p-2 border rounded"
              value={addForm.year}
              onChange={(e) =>
                setAddForm({ ...addForm, year: e.target.value })
              }
            />

            <input
              placeholder="Sem"
              type="number"
              className="p-2 border rounded"
              value={addForm.sem}
              onChange={(e) =>
                setAddForm({ ...addForm, sem: e.target.value })
              }
            />
          </div>

          {/* SUBJECT FIELDS */}
          <div className="mt-4">
            <label className="font-semibold">Subjects:</label>

            {addForm.subjects.map((sub, index) => (
              <div key={index} className="flex items-center gap-2 mt-2">
                <input
                  placeholder={`Subject ${index + 1}`}
                  className="flex-1 p-2 border rounded"
                  value={sub}
                  onChange={(e) => {
                    const updated = [...addForm.subjects];
                    updated[index] = e.target.value;
                    setAddForm({ ...addForm, subjects: updated });
                  }}
                />

                {/* Remove button (only if > 1 field) */}
                {addForm.subjects.length > 1 && (
                  <button
                    onClick={() => {
                      const updated = addForm.subjects.filter((_, i) => i !== index);
                      setAddForm({ ...addForm, subjects: updated });
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    -
                  </button>
                )}

                {/* Add button (only on last field) */}
                {index === addForm.subjects.length - 1 && (
                  <button
                    onClick={() =>
                      setAddForm({
                        ...addForm,
                        subjects: [...addForm.subjects, ""]
                      })
                    }
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddClass}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Add Class
          </button>
        </div>

        {/* ------------------------------------- */}
        {/* LIST ALL CLASSES */}
        {/* ------------------------------------- */}
        {loading ? (
          <p className="text-gray-600">Loading classes...</p>
        ) : classes.length === 0 ? (
          <p>No classes added yet.</p>
        ) : (
          <div className="space-y-4">
            {classes.map((cls, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-700">
                  {cls.branch} - {cls.year} (Sem {cls.sem})
                </h4>

                <div className="text-sm mt-1">
                  <strong>Subjects:</strong> {cls.subjects.join(", ")}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditClass(cls);
                      setEditSubjects(cls.subjects.join(", "));
                    }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setEditClass(cls)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------- */}
        {/* EDIT / DELETE MODAL */}
        {/* ------------------------------------- */}
        {editClass && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow">
              <h3 className="text-lg font-semibold mb-3">
                Edit Class – {editClass.branch} {editClass.year} (Sem {editClass.sem})
              </h3>

              <textarea
                value={editSubjects}
                onChange={(e) => setEditSubjects(e.target.value)}
                className="w-full border rounded p-2 mb-3"
                placeholder="Subjects (comma-separated)"
              ></textarea>

              <input
                placeholder='Type "Update" or "Delete" to confirm'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full border rounded p-2 mb-3"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditClass(null);
                    setConfirmText("");
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleUpdateClass()}
                  disabled={confirmText !== "Update"}
                  className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-60"
                >
                  Update
                </button>

                <button
                  onClick={() => handleDeleteClass(editClass)}
                  disabled={confirmText !== "Delete"}
                  className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

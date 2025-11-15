import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import DeleteAccount from "./DeleteAccount";
import Navbar from "./Navbar";

export default function HandleProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // Sidebar control for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // decode token & fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      setError("Invalid token. Please login again.");
      setLoading(false);
      return;
    }

    const userRole = decoded.role;
    setRole(userRole);
    fetchProfile(token, userRole);
  }, []);

  const fetchProfile = async (token, userRole) => {
    setLoading(true);
    setError("");
    try {
      const url = `http://localhost:5000/api/${userRole}/get-profile`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.data?.success) {
        setError(res.data?.message || "Failed to fetch profile");
        setLoading(false);
        return;
      }

      const filtered = filterProfileFields(res.data.user);
      setProfile(filtered);
      setFormState(getEditableFields(filtered, userRole));
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch profile");
      setLoading(false);
    }
  };

  const filterProfileFields = (userObj) => {
    if (!userObj) return null;
    const cloned = { ...userObj };
    delete cloned._id;
    delete cloned.subjects;
    delete cloned.createdAt;
    delete cloned.updatedAt;
    delete cloned.__v;
    delete cloned.deleteRequestedAt;
    return cloned;
  };

  const getEditableFields = (filteredProfile, userRole) => {
    if (!filteredProfile) return {};
    const base = {
      name: filteredProfile.name || "",
      userId: filteredProfile.userId || "",
      collegeId: filteredProfile.collegeId || "",
    };
    if (userRole === "student") {
      return {
        ...base,
        branch: filteredProfile.branch || "",
        year: filteredProfile.year || "",
        sem: filteredProfile.sem ?? "",
        roll: filteredProfile.roll ?? "",
      };
    }
    return base;
  };

  const handleChange = (e) =>
    setFormState({ ...formState, [e.target.name]: e.target.value });

  const handleEditToggle = () => {
    setError("");
    if (!isEditing && profile) {
      setFormState(getEditableFields(profile, role));
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !role) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
        return;
      }
      await axios.post(
        `http://localhost:5000/api/${role}/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  const handleSaveClick = () => {
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const submitUpdate = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token || !role) throw new Error("Not authenticated");

      const payload = { ...formState, password: confirmPassword };

      if (role === "student") {
        payload.sem = Number(payload.sem);
        payload.roll = Number(payload.roll);
      }

      const url = `http://localhost:5000/api/${role}/update-profile`;
      const res = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        const filtered = filterProfileFields(res.data.user);
        setProfile(filtered);
        setFormState(getEditableFields(filtered, role));
        setIsEditing(false);
        setShowPasswordModal(false);
      } else {
        setError(res.data?.message || "Failed to update profile");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Update failed");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormState(getEditableFields(profile, role));
    setError("");
  };

  if (loading) {
    return (
      <div className="fixed left-0 top-16 w-80 h-[calc(100vh-4rem)] bg-white shadow-xl flex items-center justify-center border-r border-gray-200">
        <div className="animate-pulse text-gray-700 text-lg">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="fixed left-0 top-16 w-80 h-[calc(100vh-4rem)] bg-white shadow-xl flex items-center justify-center border-r border-gray-200 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <Navbar 
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen} 
      />

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl overflow-y-auto border-r border-gray-200 p-6 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:block z-40`}
      >
        {/* Logout + Title + Edit Buttons */}
        <div className="flex items-center justify-between mb-6">

          <div className="text-center">
            <h2 className="text-lg font-semibold text-cyan-700">
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Profile"}
            </h2>
            <div className="text-xs text-gray-500">{profile?.userId || ""}</div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm rounded-lg border border-cyan-700 text-cyan-700 hover:bg-cyan-700 hover:text-white transition"
              >
                Logout
              </button>
            )}

            {!isEditing ? (
              <button
                onClick={handleEditToggle}
                className="px-3 py-1.5 text-sm rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveClick}
                  className="px-3 py-1.5 text-sm rounded-lg bg-cyan-700 text-white hover:bg-cyan-800"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* PROFILE FIELDS */}
        <div className="space-y-4">
          <Field label="Full Name" editing={isEditing} name="name" value={formState.name} onChange={handleChange} display={profile.name} />
          <Field label="User ID" editing={isEditing} name="userId" value={formState.userId} onChange={handleChange} display={profile.userId} />
          <Field label="College ID" editing={isEditing} name="collegeId" value={formState.collegeId} onChange={handleChange} display={profile.collegeId} />
          {role === "student" && (
            <>
              <Field label="Branch" editing={isEditing} name="branch" value={formState.branch} onChange={handleChange} display={profile.branch} />
              <Field label="Year" editing={isEditing} name="year" value={formState.year} onChange={handleChange} display={profile.year} />
              <Field label="Semester" editing={isEditing} name="sem" type="number" value={formState.sem} onChange={handleChange} display={profile.sem} />
              <Field label="Roll No" editing={isEditing} name="roll" type="number" value={formState.roll} onChange={handleChange} display={profile.roll} />
            </>
          )}

          <ChangePassword />
          <DeleteAccount userId={profile?.userId} role={role} />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
        )}
      </div>

      {/* MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-cyan-700 mb-3">Confirm Changes</h3>
            <p className="text-sm text-gray-600 mb-4">Enter your password to confirm changes:</p>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={submitUpdate}
                disabled={saving || !confirmPassword}
                className="px-4 py-2 rounded-lg bg-cyan-700 text-white hover:bg-cyan-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm & Save"}
              </button>
            </div>

            {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
          </div>
        </div>
      )}
    </>
  );
}

// Reusable Field Component
function Field({ label, editing, name, value, onChange, display, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="text-gray-600 text-sm font-medium">{label}</label>
      {editing ? (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <div className="mt-1 text-gray-800 font-medium">{display || "-"}</div>
      )}
    </div>
  );
}

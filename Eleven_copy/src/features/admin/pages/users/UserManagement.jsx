import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/apiService";
import { Search, Shield, ShieldOff, Trash2 } from "lucide-react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/users/");
      const data = response.data.results || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockUser = async (userId, currentStatus) => {
    try {
      await api.patch(`/auth/users/${userId}/update/`, {
        is_blocked: !currentStatus,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/auth/users/${userToDelete.id}/delete/`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div style={{ width: "24px", height: "24px", border: "2px solid #e5e5e5", borderTopColor: "#000", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 300, letterSpacing: "0.04em" }}>Users</h1>
        <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.25rem" }}>
          Manage your store users and permissions
        </p>
      </div>

      {/* Stats + Search */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          padding: "1rem 1.25rem",
          marginBottom: "1rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "2rem" }}>
          <div>
            <span style={{ fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999" }}>Total</span>
            <p style={{ fontSize: "1.25rem", fontWeight: 300, color: "#000" }}>{users.length}</p>
          </div>
          <div>
            <span style={{ fontSize: "0.6rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#999" }}>Blocked</span>
            <p style={{ fontSize: "1.25rem", fontWeight: 300, color: "#c41e3a" }}>{users.filter((u) => u.is_blocked).length}</p>
          </div>
        </div>

        <div style={{ position: "relative", width: "240px" }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem 0.5rem 2.25rem",
              fontSize: "0.8rem",
              fontFamily: "inherit",
              border: "1px solid #e5e5e5",
              outline: "none",
              background: "#fff",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#000")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e5e5")}
          />
          <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#ccc" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                {["User", "Status", "Role", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1.25rem",
                      textAlign: "left",
                      fontSize: "0.6rem",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#999",
                      background: "#fafafa",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: "1px solid #f5f5f5", transition: "background 0.1s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <td style={{ padding: "0.75rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "32px", height: "32px", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 500, color: "#666" }}>
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 400, color: "#000" }}>{user.name || "Unknown User"}</p>
                        <p style={{ fontSize: "0.7rem", color: "#bbb", marginTop: "0.1rem" }}>{user.email || "No email"}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem" }}>
                    <span style={{
                      fontSize: "0.6rem",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.2rem 0.6rem",
                      border: `1px solid ${user.is_blocked ? "#fecaca" : "#d1fae5"}`,
                      color: user.is_blocked ? "#c41e3a" : "#2d8a4e",
                      background: user.is_blocked ? "#fef2f2" : "#f0fdf4",
                    }}>
                      {user.is_blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem", fontSize: "0.75rem", color: "#888", textTransform: "capitalize" }}>
                    {user.role || "user"}
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem", fontSize: "0.75rem", color: "#888" }}>
                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
                  </td>
                  <td style={{ padding: "0.75rem 1.25rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => toggleBlockUser(user.id, user.is_blocked)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.6rem",
                          fontWeight: 500,
                          fontFamily: "inherit",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          border: `1px solid ${user.is_blocked ? "#d1fae5" : "#fef3cd"}`,
                          background: "#fff",
                          color: user.is_blocked ? "#2d8a4e" : "#b87514",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {user.is_blocked ? <ShieldOff size={12} /> : <Shield size={12} />}
                        {user.is_blocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.35rem 0.6rem",
                          fontSize: "0.6rem",
                          fontWeight: 500,
                          fontFamily: "inherit",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          border: "1px solid #fecaca",
                          background: "#fff",
                          color: "#c41e3a",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "#ccc", fontSize: "0.8rem" }}>
              {searchTerm ? "No users found matching your search" : "No users found"}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
            padding: "1rem",
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              padding: "2rem",
              width: "100%",
              maxWidth: "380px",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 400, marginBottom: "0.75rem" }}>
              Confirm Delete
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "#000" }}>{userToDelete?.name}</strong>?
              This action is permanent.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "1px solid #e5e5e5",
                  background: "#fff",
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "1px solid #c41e3a",
                  background: "#c41e3a",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

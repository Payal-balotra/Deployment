import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Base API URL
  const API_URL = "http://localhost:3001/api/users";

  // Trigger alert toast
  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      addToast(err.message || "Could not retrieve users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submissions (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple client-side validations
    if (!name.trim()) {
      addToast("Please enter a name", "error");
      return;
    }
    if (!email.trim()) {
      addToast("Please enter an email", "error");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast("Please enter a valid email address", "error");
      return;
    }

    setSubmitLoading(true);

    try {
      if (isEditing && editingUserId !== null) {
        // Update Action
        const response = await fetch(`${API_URL}/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to update user");
        }

        // Update list
        setUsers((prev) =>
          prev.map((user) => (user.id === editingUserId ? data : user))
        );
        addToast("User details successfully updated", "success");
        resetForm();
      } else {
        // Create Action
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create user");
        }

        // Prepend new user
        setUsers((prev) => [...prev, data]);
        addToast(`User "${data.name}" registered successfully`, "success");
        resetForm();
      }
    } catch (err: any) {
      addToast(err.message || "Operation failed", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Populate form for editing
  const handleEditClick = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setIsEditing(true);
    setEditingUserId(user.id);
    
    // Scroll smoothly to form on mobile devices
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit mode
  const resetForm = () => {
    setName("");
    setEmail("");
    setIsEditing(false);
    setEditingUserId(null);
  };

  // Delete user
  const handleDelete = async (id: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete the user "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      // Filter user out
      setUsers((prev) => prev.filter((user) => user.id !== id));
      addToast(`User "${userName}" has been removed`, "success");

      // Reset form if currently editing the deleted user
      if (editingUserId === id) {
        resetForm();
      }
    } catch (err: any) {
      addToast(err.message || "Could not delete user", "error");
    }
  };

  return (
    <div className="app-container">
      {/* Visual Header */}
      <header className="header">
        <h1>Cloud Deploy Dashboard</h1>
        <p>
          Secure, premium administrative control panel. Provision user identities,
          manage cloud parameters, and manage active profiles in real-time.
        </p>
      </header>

      {/* Main Dashboard Layout */}
      <main className="dashboard-grid">
        {/* Left Side: Form Panel */}
        <section className="glass-panel">
          <h2 className="panel-title">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-primary)" }}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="16" y1="11" x2="22" y2="11" />
            </svg>
            {isEditing ? "Modify Account" : "Register User"}
            {isEditing && <span className="badge">Edit Mode</span>}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name-input">FULL NAME</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="name-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g., Payal Balotra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email-input">EMAIL ADDRESS</label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="email-input"
                  type="email"
                  className="form-control"
                  placeholder="e.g., payal@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitLoading}
                  required
                />
              </div>
            </div>

            <div className="btn-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <span className="loading-spinner" style={{ width: 16, height: 16 }}></span>
                ) : isEditing ? (
                  "Update Record"
                ) : (
                  "Provision Identity"
                )}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right Side: Users Grid */}
        <section className="glass-panel">
          <h2 className="panel-title">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-secondary)" }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Active Profiles
            <span className="badge" style={{ background: "var(--color-secondary-glow)", color: "#22d3ee", borderColor: "rgba(6, 182, 212, 0.3)" }}>
              {users.length} Total
            </span>
          </h2>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="empty-state" style={{ borderColor: "var(--color-danger-glow)" }}>
              <div className="empty-state-icon" style={{ color: "var(--color-danger)" }}>⚠️</div>
              <h3>Database Connection Error</h3>
              <p style={{ marginTop: 8 }}>{error}</p>
              <button
                className="btn btn-secondary"
                style={{ width: "auto", marginTop: 16 }}
                onClick={fetchUsers}
              >
                Retry Connection
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No Profiles Provisioned</h3>
              <p>Register new users using the control panel on the left.</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div>
                    <div className="user-avatar">
                      {user.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p className="email">{user.email}</p>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className="user-meta">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "2-digit",
                      })}
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn-icon-only edit"
                        title="Edit User Profile"
                        onClick={() => handleEditClick(user)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn-icon-only delete"
                        title="Delete User Record"
                        onClick={() => handleDelete(user.id, user.name)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Global Toast System */}
      <div className="notifications-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span style={{ fontSize: "1.2rem" }}>
              {toast.type === "success" ? "✓" : "⚡"}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
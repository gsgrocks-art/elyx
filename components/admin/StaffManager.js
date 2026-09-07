"use client";

import { useState } from "react";

export default function StaffManager({ initialAdmins, currentAdminId }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add staff account");
      setAdmins((prev) => [...prev, data.admin]);
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin) => {
    if (!confirm(`Remove staff login "${admin.username}"?`)) return;
    const res = await fetch(`/api/admin/staff/${admin.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to remove staff account.");
      return;
    }
    setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={handleAdd} className="mb-6 space-y-3 rounded-xl border border-[var(--color-border)] bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. priya"
              required
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Staff Login"}
        </button>
      </form>

      <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-white">
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-medium text-neutral-800">{admin.username}</span>
              {admin.id === currentAdminId ? (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                  You
                </span>
              ) : null}
            </div>
            {admin.id !== currentAdminId ? (
              <button
                type="button"
                onClick={() => handleDelete(admin)}
                className="text-sm text-rose-600 hover:underline"
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

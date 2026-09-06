"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRef, useState } from "react";

export default function SettingsForm({ initialSettings }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    businessName: initialSettings?.businessName || "",
    logoUrl: initialSettings?.logoUrl || "",
    websiteUrl: initialSettings?.websiteUrl || "",
    whatsappNumber: initialSettings?.whatsappNumber || "",
    primaryColor: initialSettings?.primaryColor || "#3d1560",
    accentColor: initialSettings?.accentColor || "#e6007e",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      update("logoUrl", data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setMessage("Settings saved.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Business Logo</label>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-neutral-50">
            {form.logoUrl ? (
              <Image src={form.logoUrl} alt="Logo" width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-neutral-400">No logo</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Logo"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Business Name</label>
        <input
          type="text"
          value={form.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Website Link</label>
        <input
          type="url"
          value={form.websiteUrl}
          onChange={(e) => update("websiteUrl", e.target.value)}
          placeholder="https://example.com"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          WhatsApp Number <span className="text-neutral-400">(with country code, e.g. 919876543210)</span>
        </label>
        <input
          type="text"
          value={form.whatsappNumber}
          onChange={(e) => update("whatsappNumber", e.target.value)}
          placeholder="919876543210"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Primary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-[var(--color-border)]"
            />
            <input
              type="text"
              value={form.primaryColor}
              onChange={(e) => update("primaryColor", e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Accent Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => update("accentColor", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-[var(--color-border)]"
            />
            <input
              type="text"
              value={form.accentColor}
              onChange={(e) => update("accentColor", e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}

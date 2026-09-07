import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  const settings = getSettings();

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="mb-6 font-heading text-2xl text-[var(--color-primary)]">Business Settings</h1>
        <SettingsForm initialSettings={settings} />
      </div>

      <div>
        <h2 className="mb-4 font-heading text-xl text-[var(--color-primary)]">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

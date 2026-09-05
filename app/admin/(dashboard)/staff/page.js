import { listAdmins } from "@/lib/admins";
import { getCurrentAdmin } from "@/lib/auth";
import StaffManager from "@/components/admin/StaffManager";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const admins = listAdmins();
  const current = await getCurrentAdmin();

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl text-[var(--color-primary)]">Staff Accounts</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Give each staff member their own login so they can add and edit products.
      </p>
      <StaffManager initialAdmins={admins} currentAdminId={current?.id} />
    </div>
  );
}

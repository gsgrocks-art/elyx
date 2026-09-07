import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getAdminById, deleteAdmin } from "@/lib/admins";

export async function DELETE(request, { params }) {
  const { id } = await params;

  const target = getAdminById(id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const current = await getCurrentAdmin();
  if (current && current.id === id) {
    return NextResponse.json(
      { error: "You cannot remove your own account while logged in." },
      { status: 400 }
    );
  }

  try {
    deleteAdmin(id);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

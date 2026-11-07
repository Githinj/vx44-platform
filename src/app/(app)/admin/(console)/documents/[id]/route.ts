import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new NextResponse(null, { status: 404 });

  const { data: document } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!document) return new NextResponse(null, { status: 404 });

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.storage_path, 60);
  if (error) {
    console.error("Document link failed:", error.message);
    return new NextResponse(null, { status: 502 });
  }
  return NextResponse.redirect(data.signedUrl);
}

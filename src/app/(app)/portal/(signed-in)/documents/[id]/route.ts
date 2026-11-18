import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireClient } from "@/lib/auth";

// Sends a client to a one-minute link for one of their organization's files. Row level security
// decides both steps: the documents row must belong to one of their organizations, and the storage
// policy only lets them sign files that such a row points to.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireClient();
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

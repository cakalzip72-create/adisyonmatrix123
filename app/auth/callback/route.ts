import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: owned } = await supabase.from("stores").select("slug").eq("owner_id", user.id).maybeSingle();
        if (owned) return NextResponse.redirect(`${origin}/${owned.slug}/dashboard`);

        const { data: staffRow } = await supabase
          .from("staff")
          .select("stores(slug)")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .maybeSingle();
        const staffStore = staffRow?.stores as unknown as { slug: string } | null;
        if (staffStore?.slug) return NextResponse.redirect(`${origin}/${staffStore.slug}/dashboard`);
      }

      return NextResponse.redirect(`${origin}/onboarding/store`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}

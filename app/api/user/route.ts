import { NextResponse } from "next/server";
import { supabase } from "../../../src/lib/supabaseClient";
import { getUserProfile } from "../../../src/lib/profiles";

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null, profile: null });
    }

    const profile = await getUserProfile(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

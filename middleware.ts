import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: ceci met à jour la session/cookies si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protège /admin/*
  if (req.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/__admin_login"; // ou /login selon ton chemin
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    /*
      On applique le middleware partout (pour gérer la session),
      sauf les fichiers statiques.
    */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

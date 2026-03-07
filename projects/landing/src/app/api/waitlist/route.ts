import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const welcomeEmailHtml = (email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the auto-co waitlist</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#f97316;">auto-co</p>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding-bottom:20px;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;">
                You're on the list.
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-bottom:28px;">
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.7;color:#a1a1aa;">
                We'll email you at <span style="color:#ffffff;">${email}</span> when the hosted beta opens.
                First 50 members get 3 months at 50% off — $24.50/mo instead of $49.
              </p>
              <p style="margin:0;font-size:16px;line-height:1.7;color:#a1a1aa;">
                While you wait: auto-co is open source. You can run the full framework on your machine right now —
                no waitlist, no payment required.
              </p>
            </td>
          </tr>

          <!-- Stats bar -->
          <tr>
            <td style="padding-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:20px;">
                <tr>
                  <td align="center" width="33%" style="padding:8px 0;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:#f97316;">27</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:0.08em;">Cycles run</p>
                  </td>
                  <td align="center" width="33%" style="padding:8px 0;border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:#f97316;">$39</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:0.08em;">Total cost</p>
                  </td>
                  <td align="center" width="33%" style="padding:8px 0;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:#f97316;">14</p>
                    <p style="margin:4px 0 0 0;font-size:11px;color:#52525b;text-transform:uppercase;letter-spacing:0.08em;">AI agents</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTAs -->
          <tr>
            <td style="padding-bottom:36px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="https://runautoco.com/demo"
                      style="display:inline-block;background:#f97316;color:#000000;font-weight:700;font-size:13px;text-decoration:none;padding:10px 20px;border-radius:3px;">
                      See live demo
                    </a>
                  </td>
                  <td>
                    <a href="https://github.com/NikitaDmitrieff/auto-co-meta"
                      style="display:inline-block;background:transparent;color:#a1a1aa;font-weight:600;font-size:13px;text-decoration:none;padding:10px 20px;border:1px solid #2a2a2a;border-radius:3px;">
                      GitHub repo
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:28px;border-top:1px solid #1a1a1a;"></td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#52525b;">
                — Nikita, building auto-co in public<br />
                <a href="https://runautoco.com" style="color:#52525b;">runautoco.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="margin:0;font-size:11px;color:#3f3f46;">
                You're receiving this because you signed up at runautoco.com. No spam, ever.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export async function POST(req: NextRequest) {
  let email: string;

  try {
    const body = await req.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Insert into Supabase
  const { error: dbError } = await supabase
    .from("waitlist_signups")
    .insert({ email, source: "landing" });

  const alreadySignedUp = dbError?.code === "23505";

  if (dbError && !alreadySignedUp) {
    console.error("Supabase insert error:", dbError);
    return NextResponse.json({ error: "Failed to save signup" }, { status: 500 });
  }

  // Send welcome email via Resend (skip gracefully if no API key)
  if (RESEND_API_KEY && !alreadySignedUp) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: "Nikita @ auto-co <hi@runautoco.com>",
        to: email,
        subject: "You're on the auto-co waitlist",
        html: welcomeEmailHtml(email),
      });
    } catch (emailErr) {
      // Log but don't fail the request — signup is already saved
      console.error("Resend email error:", emailErr);
    }
  }

  return NextResponse.json({ success: true, alreadySignedUp });
}

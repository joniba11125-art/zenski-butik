import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type ReservationEmailPayload = {
  productName: string;
  selectedSize: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string | null;
};

function createAdminEmail(payload: ReservationEmailPayload) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h1>Nova rezervacija</h1>
      <p>Stigla je nova rezervacija iz webshopa.</p>

      <h2>Proizvod</h2>
      <p><strong>Naziv:</strong> ${payload.productName}</p>
      <p><strong>Velicina:</strong> ${payload.selectedSize || "-"}</p>

      <h2>Kupac</h2>
      <p><strong>Ime:</strong> ${payload.firstName} ${payload.lastName}</p>
      <p><strong>Telefon:</strong> ${payload.phone}</p>
      <p><strong>Email:</strong> ${payload.email}</p>

      <h2>Poruka</h2>
      <p>${payload.message || "-"}</p>
    </div>
  `;
}

function createCustomerEmail(payload: ReservationEmailPayload) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h1>Rezervacija je zaprimljena</h1>

      <p>Postovana/i ${payload.firstName},</p>

      <p>Hvala na rezervaciji. Zaprimili smo tvoj zahtjev i uskoro cemo te kontaktirati za potvrdu.</p>

      <h2>Detalji rezervacije</h2>
      <p><strong>Proizvod:</strong> ${payload.productName}</p>
      <p><strong>Velicina:</strong> ${payload.selectedSize || "-"}</p>

      <p style="margin-top: 24px;">Zenski Butik</p>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReservationEmailPayload;

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Zenski Butik <onboarding@resend.dev>";

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY nije podesen." },
        { status: 500 }
      );
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL nije podesen." },
        { status: 500 }
      );
    }

    if (!payload.email || !payload.productName) {
      return NextResponse.json(
        { error: "Nedostaju podaci za email." },
        { status: 400 }
      );
    }

    const adminResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nova rezervacija: ${payload.productName}`,
      html: createAdminEmail(payload),
    });

    const customerResult = await resend.emails.send({
      from: fromEmail,
      to: payload.email,
      subject: "Potvrda rezervacije - Zenski Butik",
      html: createCustomerEmail(payload),
    });

    return NextResponse.json({
      success: true,
      adminResult,
      customerResult,
    });
  } catch (error) {
    console.error("Greska pri slanju emaila:", error);

    return NextResponse.json(
      { error: "Email nije poslan." },
      { status: 500 }
    );
  }
}

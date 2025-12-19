import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const {
      monthKey,
      companyName,
      contactName,
      contactEmail,
      productName,
      description,
      link,
      notes,
      webinar,
    } = await request.json();

    // Verify month is open
    const month = await prisma.pOTMMonth.findUnique({
      where: { monthKey },
    });

    if (month && month.status !== "open") {
      return NextResponse.json(
        { error: "This month is not open for applications" },
        { status: 400 }
      );
    }

    // Create application
    await prisma.pOTMApplication.create({
      data: {
        userId,
        monthKey,
        companyName,
        contactName,
        contactEmail,
        productName,
        description,
        link: link || null,
        notes: notes || null,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}


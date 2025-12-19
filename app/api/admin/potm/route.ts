import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const months = await prisma.pOTMMonth.findMany({
      orderBy: { monthKey: "asc" },
    });
    return NextResponse.json(months);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch months" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { monthKey, status, reservedLabel } = await request.json();

    const month = await prisma.pOTMMonth.upsert({
      where: { monthKey },
      update: {
        status,
        reservedLabel: reservedLabel || null,
      },
      create: {
        monthKey,
        status,
        reservedLabel: reservedLabel || null,
      },
    });

    return NextResponse.json(month);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update month" }, { status: 500 });
  }
}


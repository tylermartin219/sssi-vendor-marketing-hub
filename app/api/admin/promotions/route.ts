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

    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promotions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch promotions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const promotion = await prisma.promotion.create({
      data: {
        title: data.title,
        url: data.url,
        blurb: data.blurb,
        imageUrl: data.imageUrl || null,
        ctaLabel: data.ctaLabel || null,
        active: data.active ?? true,
        contentJson: "{}",
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create promotion" }, { status: 500 });
  }
}


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
    const { productId, quantity, notes } = await request.json();
    const qty = parseInt(quantity) || 1;

    // Find or create a pending quote
    let quote = await prisma.quote.findFirst({
      where: {
        userId,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!quote) {
      quote = await prisma.quote.create({
        data: {
          userId,
          status: "pending",
        },
      });
    }

    // Add item to quote
    await prisma.quoteItem.create({
      data: {
        quoteId: quote.id,
        productId,
        qty,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}


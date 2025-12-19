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
    const { quoteId, name } = await request.json();

    // Verify quote belongs to user
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId,
        status: "pending",
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Update quote status
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: "submitted",
        name: name || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit quote" }, { status: 500 });
  }
}


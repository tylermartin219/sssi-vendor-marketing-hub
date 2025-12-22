import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate invoice number: INV-YYYY-NNN
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const latest = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
  });

  let nextNum = 1;
  if (latest) {
    const lastNum = parseInt(latest.invoiceNumber.split("-")[2] || "0");
    nextNum = lastNum + 1;
  }

  return `${prefix}${nextNum.toString().padStart(3, "0")}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { quoteId, invoiceDate, dueDate, billingAddress, notes } = body;

    // Fetch the quote with items and user
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Convert quote items to invoice items
    const invoiceItems = quote.items.map((item) => {
      const unitPrice = item.product.price || 0;
      const quantity = item.qty;
      const total = unitPrice * quantity;

      return {
        productId: item.productId,
        description: item.product.name,
        quantity,
        unitPrice,
        total,
        notes: item.notes,
      };
    });

    const total = invoiceItems.reduce((sum, item) => sum + item.total, 0);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: quote.userId,
        quoteId: quote.id,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        billingAddress: JSON.stringify(billingAddress || {}),
        notes: notes || null,
        total,
        items: {
          create: invoiceItems.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            company: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error creating invoice from quote:", error);
    return NextResponse.json(
      { error: "Failed to create invoice from quote" },
      { status: 500 }
    );
  }
}


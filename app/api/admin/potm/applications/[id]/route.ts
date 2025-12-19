import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, monthKey } = await request.json();

    // Get the application first
    const application = await prisma.pOTMApplication.findUnique({
      where: { id: params.id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Determine the target month (use provided monthKey or keep existing)
    const targetMonthKey = monthKey || application.monthKey;
    const isChangingMonth = monthKey && monthKey !== application.monthKey;
    const wasApproved = application.status === "approved";
    const willBeApproved = status === "approved";
    const finalStatus = status || application.status; // Use provided status or keep existing

    // Update application status and/or month
    const updateData: any = {};
    if (status) updateData.status = status;
    if (monthKey && monthKey !== application.monthKey) updateData.monthKey = monthKey;

    const updatedApplication = await prisma.pOTMApplication.update({
      where: { id: params.id },
      data: updateData,
    });

    // Get the final month key after update
    const finalMonthKey = updatedApplication.monthKey;

    // If changing month and was approved, free up the old month
    if (isChangingMonth && wasApproved) {
      // Check if there are other approved applications for the old month
      const otherApprovedApps = await prisma.pOTMApplication.findFirst({
        where: {
          monthKey: application.monthKey,
          status: "approved",
          id: { not: params.id },
        },
      });

      // If no other approved apps, open the old month
      if (!otherApprovedApps) {
        await prisma.pOTMMonth.upsert({
          where: { monthKey: application.monthKey },
          update: {
            status: "open",
            reservedLabel: null,
          },
          create: {
            monthKey: application.monthKey,
            status: "open",
          },
        });
      }
    }

    // If approved (either was approved and keeping status, or newly approved), reserve the target month
    if (finalStatus === "approved") {
      await prisma.pOTMMonth.upsert({
        where: { monthKey: finalMonthKey },
        update: {
          status: "reserved",
          reservedLabel: `${application.companyName} - ${application.productName}`,
        },
        create: {
          monthKey: finalMonthKey,
          status: "reserved",
          reservedLabel: `${application.companyName} - ${application.productName}`,
        },
      });
    } else if (wasApproved && (finalStatus === "rejected" || finalStatus === "pending")) {
      // If rejecting or resetting a previously approved app, free up the month if no other approved apps
      // Use the final month key (after any month change)
      const otherApprovedApps = await prisma.pOTMApplication.findFirst({
        where: {
          monthKey: finalMonthKey,
          status: "approved",
          id: { not: params.id },
        },
      });

      if (!otherApprovedApps) {
        await prisma.pOTMMonth.upsert({
          where: { monthKey: finalMonthKey },
          update: {
            status: "open",
            reservedLabel: null,
          },
          create: {
            monthKey: finalMonthKey,
            status: "open",
          },
        });
      }
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}


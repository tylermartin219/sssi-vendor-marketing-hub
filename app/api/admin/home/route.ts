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

    // Get or create home content
    let homeContent = await prisma.homeContent.findFirst();

    if (!homeContent) {
      // Create default content
      homeContent = await prisma.homeContent.create({
        data: {
          heroTitle: "Strengthening Our Brand Together",
          heroText: "We love partnering with our manufacturers to create powerful marketing opportunities that benefit us all. By working together, we strengthen our brands, reach more customers, and build lasting relationships that drive mutual success. Explore our collaborative marketing programs designed to amplify your products and grow our shared customer base.",
        },
      });
    }

    return NextResponse.json(homeContent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch home content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { heroTitle, heroText } = await request.json();

    // Update or create home content
    let homeContent = await prisma.homeContent.findFirst();
    
    if (homeContent) {
      homeContent = await prisma.homeContent.update({
        where: { id: homeContent.id },
        data: {
          heroTitle,
          heroText,
        },
      });
    } else {
      homeContent = await prisma.homeContent.create({
        data: {
          heroTitle,
          heroText,
        },
      });
    }

    return NextResponse.json(homeContent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update home content" }, { status: 500 });
  }
}


import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { PromotionCarousel } from "@/components/promotion-carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Gift, Calendar, Download, FileText } from "lucide-react";

export default async function Home() {
  const promotions = await prisma.promotion.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Get home content
  let homeContent = await prisma.homeContent.findFirst();
  if (!homeContent) {
    // Create default if it doesn't exist
    homeContent = await prisma.homeContent.create({
      data: {
        heroTitle: "Strengthening Our Brand Together",
        heroText: "We love partnering with our manufacturers to create powerful marketing opportunities that benefit us all. By working together, we strengthen our brands, reach more customers, and build lasting relationships that drive mutual success. Explore our collaborative marketing programs designed to amplify your products and grow our shared customer base.",
      },
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-12 md:py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {homeContent.heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground whitespace-pre-line">
              {homeContent.heroText}
            </p>
          </div>

          {/* Promotions Carousel */}
          {promotions.length > 0 && (
            <div className="mb-16">
              <PromotionCarousel promotions={promotions} />
            </div>
          )}

          {/* Featured Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Gift className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Co-Branded Swag</CardTitle>
                <CardDescription>
                  Browse our collection of co-branded merchandise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/swag">Shop Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Product of the Month</CardTitle>
                <CardDescription>
                  Apply to feature your product in our monthly spotlight
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/potm">View Calendar</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Download className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Brand Assets</CardTitle>
                <CardDescription>
                  Download logos, guidelines, and marketing materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/assets">Browse Assets</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                  Access helpful guides, links, and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/resources">View Resources</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


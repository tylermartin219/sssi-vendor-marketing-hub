import Link from "next/link";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function PromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Promotions</h1>
          <p className="text-xl text-muted-foreground">
            Discover exclusive marketing opportunities and programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const isActive =
              promo.active &&
              (!promo.startDate || promo.startDate <= now) &&
              (!promo.endDate || promo.endDate >= now);
            const isUpcoming = promo.startDate && promo.startDate > now;

            return (
              <Card key={promo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {promo.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={promo.imageUrl}
                      alt={promo.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{promo.title}</CardTitle>
                    <div className="flex gap-2">
                      {isActive && <Badge>Active</Badge>}
                      {isUpcoming && <Badge variant="secondary">Upcoming</Badge>}
                      {!isActive && !isUpcoming && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {promo.blurb}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {promo.url.startsWith("http") || promo.url.startsWith("/") ? (
                    <Button asChild className="w-full">
                      <a
                        href={promo.url}
                        target={promo.url.startsWith("http") ? "_blank" : "_self"}
                        rel={promo.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {promo.ctaLabel || "Learn More"}
                      </a>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <a href={promo.url} download>
                        {promo.ctaLabel || "Download Now"}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}


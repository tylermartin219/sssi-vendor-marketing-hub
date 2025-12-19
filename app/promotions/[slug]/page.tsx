import { notFound } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function PromotionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const promotion = await prisma.promotion.findFirst({
    where: { url: params.slug },
  });

  if (!promotion) {
    notFound();
  }

  let content: any = {};
  try {
    content = JSON.parse(promotion.contentJson || "{}");
  } catch (e) {
    // Invalid JSON, use empty object
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <Link
          href="/promotions"
          className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block"
        >
          ← Back to Promotions
        </Link>

        {promotion.imageUrl && (
          <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden mb-8">
            <Image
              src={promotion.imageUrl}
              alt={promotion.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{promotion.title}</h1>
          <p className="text-xl text-muted-foreground mb-8">{promotion.blurb}</p>

          {content.overview && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.overview }}
                />
              </CardContent>
            </Card>
          )}

          {content.howItWorks && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.howItWorks }}
                />
              </CardContent>
            </Card>
          )}

          {content.timeline && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.timeline }}
                />
              </CardContent>
            </Card>
          )}

          {promotion.url && promotion.ctaLabel && (
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href={promotion.url}>{promotion.ctaLabel}</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


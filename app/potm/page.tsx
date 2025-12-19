import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { Calendar } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default async function POTMPage() {
  const currentYear = new Date().getFullYear();
  const potmMonths = await prisma.pOTMMonth.findMany({
    where: {
      monthKey: {
        startsWith: currentYear.toString(),
      },
    },
  });

  // Get pending applications count for each month
  const pendingApplications = await prisma.pOTMApplication.findMany({
    where: {
      monthKey: {
        startsWith: currentYear.toString(),
      },
      status: "pending",
    },
    select: {
      monthKey: true,
    },
  });

  // Create a map for quick lookup
  const monthMap = new Map(potmMonths.map((m) => [m.monthKey, m]));
  
  // Count pending applications per month
  const pendingCountMap = new Map<string, number>();
  pendingApplications.forEach((app) => {
    pendingCountMap.set(app.monthKey, (pendingCountMap.get(app.monthKey) || 0) + 1);
  });

  // Generate all 12 months for current year
  const allMonths = months.map((monthName, index) => {
    const monthNum = String(index + 1).padStart(2, "0");
    const monthKey = `${currentYear}-${monthNum}`;
    const potmMonth = monthMap.get(monthKey);
    const pendingCount = pendingCountMap.get(monthKey) || 0;

    return {
      monthKey,
      monthName,
      monthNum: index + 1,
      status: potmMonth?.status || "open",
      reservedLabel: potmMonth?.reservedLabel || null,
      pendingCount,
    };
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Product of the Month</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Increase visibility and get eyeballs on your products with our comprehensive monthly marketing package.
          </p>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 2-3 social media posts throughout the month</li>
                <li>• Video interview with Jake</li>
                <li>• Featured in the first carousel slider on our website</li>
                <li>• Optional webinar add-on ($1,000 extra)</li>
              </ul>
              <p className="mt-4 font-semibold text-lg">
                Base Price: $2,500
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMonths.map((month) => (
            <Card
              key={month.monthKey}
              className={`hover:shadow-lg transition-shadow ${
                month.status === "reserved" ? "opacity-75" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {month.pendingCount > 0 && (
                    <Badge variant="secondary">
                      Pending ({month.pendingCount})
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{month.monthName}</CardTitle>
                {month.reservedLabel && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {month.reservedLabel}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {month.status === "open" ? (
                  <Button asChild className="w-full">
                    <Link href={`/potm/apply?month=${month.monthKey}`}>
                      Apply
                    </Link>
                  </Button>
                ) : (
                  <Button disabled className="w-full" variant="outline">
                    Reserved
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}


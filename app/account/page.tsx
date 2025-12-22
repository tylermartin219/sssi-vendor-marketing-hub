"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";

interface Quote {
  id: string;
  name: string | null;
  status: string;
  createdAt: string;
}

interface POTMApplication {
  id: string;
  monthKey: string;
  productName: string;
  status: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  total: number;
  createdAt: string;
}

export default function AccountPage() {
  const { data: session } = useSession();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [applications, setApplications] = useState<POTMApplication[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      Promise.all([
        fetch("/api/quotes/my").then((res) => res.json()),
        fetch("/api/potm/my-applications").then((res) => res.json()),
        fetch("/api/invoices/my").then((res) => res.json()),
      ]).then(([quotesData, appsData, invoicesData]) => {
        setQuotes(quotesData);
        setApplications(appsData);
        setInvoices(invoicesData);
        setLoading(false);
      });
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container py-12">
          <p>Please sign in to view your account.</p>
        </main>
      </div>
    );
  }

  const monthName = (monthKey: string) => {
    const date = new Date(`${monthKey}-01`);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Account</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <span className="font-semibold">Name:</span> {session.user?.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {session.user?.email}
              </p>
              {(session.user as any)?.company && (
                <p>
                  <span className="font-semibold">Company:</span>{" "}
                  {(session.user as any).company}
                </p>
              )}
              <p>
                <span className="font-semibold">Role:</span>{" "}
                <Badge variant="secondary">{(session.user as any)?.role || "vendor"}</Badge>
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="quotes" className="w-full">
            <TabsList>
              <TabsTrigger value="quotes">Quote Requests</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="applications">POTM Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="quotes">
              <Card>
                <CardHeader>
                  <CardTitle>My Quote Requests</CardTitle>
                  <CardDescription>
                    View the status of your quote requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading...</p>
                  ) : quotes.length === 0 ? (
                    <p className="text-muted-foreground">No quote requests yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">
                              {quote.name || `Quote #${quote.id.slice(0, 8)}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(quote.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              quote.status === "approved"
                                ? "default"
                                : quote.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {quote.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>My Invoices</CardTitle>
                  <CardDescription>
                    View and download your invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading...</p>
                  ) : invoices.length === 0 ? (
                    <p className="text-muted-foreground">No invoices yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">
                              {invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(invoice.invoiceDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              ${invoice.total.toFixed(2)}
                            </Badge>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/invoices/${invoice.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>My POTM Applications</CardTitle>
                  <CardDescription>
                    View the status of your Product of the Month applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p>Loading...</p>
                  ) : applications.length === 0 ? (
                    <p className="text-muted-foreground">No applications yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">{app.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {monthName(app.monthKey)} •{" "}
                              {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              app.status === "approved"
                                ? "default"
                                : app.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}


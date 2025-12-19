"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuoteItem {
  product: {
    name: string;
    category: string;
  };
  quantity: number;
  notes: string | null;
}

interface Quote {
  id: string;
  name: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    company: string | null;
  };
  items: QuoteItem[];
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/quotes")
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Quote Requests</h1>
          <p className="text-muted-foreground">View all quote requests</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <Card key={quote.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {quote.name || `Quote #${quote.id.slice(0, 8)}`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {quote.user.name || quote.user.email}
                        {quote.user.company && ` • ${quote.user.company}`}
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
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Submitted: {new Date(quote.createdAt).toLocaleString()}
                  </p>
                  <div className="space-y-2">
                    {quote.items.map((item, idx) => (
                      <div key={idx} className="text-sm border-l-2 pl-3">
                        <p className="font-semibold">
                          {item.product.name} ({item.quantity}x)
                        </p>
                        {item.notes && (
                          <p className="text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


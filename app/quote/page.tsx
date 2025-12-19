"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import Image from "next/image";

interface QuoteItem {
  id: string;
  product: {
    id: string;
    name: string;
    category: string;
    imagesJson: string;
  };
  quantity: number;
  notes: string | null;
}

interface Quote {
  id: string;
  name: string | null;
  status: string;
  items: QuoteItem[];
}

export default function QuotePage() {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteName, setQuoteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/quotes/current")
      .then((res) => res.json())
      .then((data) => {
        setQuote(data);
        setQuoteName(data?.name || "");
        setLoading(false);
      });
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetch(`/api/quotes/remove-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      // Reload quote
      const res = await fetch("/api/quotes/current");
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  const handleSubmitQuote = async () => {
    if (!quote || quote.items.length === 0) {
      alert("Your quote is empty");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/quotes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quote.id,
          name: quoteName || undefined,
        }),
      });

      if (response.ok) {
        router.push("/quote/success");
      } else {
        alert("Failed to submit quote");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container py-12">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!quote || quote.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container py-12">
          <Card>
            <CardHeader>
              <CardTitle>Your Quote</CardTitle>
              <CardDescription>Your quote is empty</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/swag">Browse Products</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Request a Quote</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quoteName">Quote Name (Optional)</Label>
                <Input
                  id="quoteName"
                  value={quoteName}
                  onChange={(e) => setQuoteName(e.target.value)}
                  placeholder="e.g., Q1 2024 Marketing Materials"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mb-8">
            {quote.items.map((item) => {
              let images: string[] = [];
              try {
                images = JSON.parse(item.product.imagesJson || "[]");
              } catch (e) {
                // Invalid JSON
              }

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {images[0] && (
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{item.product.name}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {item.product.category}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Quantity: {item.quantity}
                            </p>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Notes: {item.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submit Quote Request</CardTitle>
              <CardDescription>
                We'll review your request and get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSubmitQuote}
                disabled={submitting}
                size="lg"
                className="w-full"
              >
                {submitting ? "Submitting..." : "Submit Quote Request"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  imagesJson: string;
  coBrandingNotes: string | null;
  price: number | null;
  quantity: number | null;
  active: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleAddToQuote = async () => {
    if (!product) return;

    setAdding(true);
    try {
      const response = await fetch("/api/quotes/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: product.quantity || 1,
          notes,
        }),
      });

      if (response.ok) {
        router.push("/quote");
      } else {
        alert("Failed to add to quote");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setAdding(false);
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container py-12">
          <p>Product not found</p>
        </main>
      </div>
    );
  }

  let imageUrl = "";
  try {
    const images = JSON.parse(product.imagesJson || "[]");
    imageUrl = images[0] || "";
  } catch (e) {
    // Invalid JSON
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <Link
          href="/swag"
          className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block"
        >
          ← Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            {imageUrl ? (
              <div className="relative h-96 w-full rounded-2xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-96 w-full rounded-2xl bg-gray-200 flex items-center justify-center">
                <ShoppingCart className="h-24 w-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              <p className="text-lg text-muted-foreground">{product.description}</p>
            </div>

            {product.price && product.quantity && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-lg">
                      <span className="font-semibold">${product.price.toFixed(2)}</span> each
                      {product.quantity > 1 && (
                        <span className="text-muted-foreground">
                          {" "}for {product.quantity} qty
                        </span>
                      )}
                    </p>
                    {product.quantity > 1 && (
                      <p className="text-2xl font-bold text-primary">
                        Total: ${(product.price * product.quantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.coBrandingNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Co-Branding Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{product.coBrandingNotes}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Request Quote</CardTitle>
                <CardDescription>
                  Add this item to your quote request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (logo placement, customization, quantity changes, etc.)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requirements, quantity changes, or notes..."
                    rows={4}
                  />
                  {product.quantity && (
                    <p className="text-xs text-muted-foreground">
                      Default quantity: {product.quantity}. If you need a different quantity, please specify in the notes above.
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleAddToQuote}
                  disabled={adding}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {adding ? "Adding..." : "Add to Quote"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Disclaimer:</strong> Prices are estimates and subject to change; images may not be exact, as we may need to choose a different vendor from time to time for price; expect fluctuations; individual pricing changes based on qty. If you want a different quantity than what's listed, put that in the notes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}


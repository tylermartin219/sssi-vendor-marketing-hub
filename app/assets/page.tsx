"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface Asset {
  id: string;
  title: string;
  category: string;
  description: string | null;
  fileUrl: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/assets")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        const cats = Array.from(new Set(data.map((a: Asset) => a.category)));
        setCategories(cats as string[]);
      });
  }, []);

  const filteredAssets = selectedCategory === "all"
    ? assets
    : assets.filter((a) => a.category === selectedCategory);

  const groupedAssets = filteredAssets.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = [];
    }
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Brand Assets</h1>
          <p className="text-xl text-muted-foreground">
            Download logos, guidelines, templates, and marketing materials
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Assets by Category */}
        <div className="space-y-12">
          {Object.entries(groupedAssets).map(([category, categoryAssets]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryAssets.map((asset) => (
                  <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{asset.title}</CardTitle>
                        <Badge variant="secondary">{asset.category}</Badge>
                      </div>
                      {asset.description && (
                        <CardDescription>{asset.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <a href={asset.fileUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No assets found.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}


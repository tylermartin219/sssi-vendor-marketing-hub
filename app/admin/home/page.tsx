"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    heroTitle: "",
    heroText: "",
  });

  useEffect(() => {
    fetch("/api/admin/home")
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          heroTitle: data.heroTitle || "",
          heroText: data.heroText || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Home page content updated successfully!");
      } else {
        alert("Failed to update home page content");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Home Page</h1>
          <p className="text-muted-foreground">
            Update the hero section content on the home page
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>
              The main title and description that appears at the top of the home page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Hero Title *</Label>
                <Input
                  id="heroTitle"
                  value={formData.heroTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, heroTitle: e.target.value })
                  }
                  placeholder="e.g., Strengthening Our Brand Together"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroText">Hero Text *</Label>
                <Textarea
                  id="heroText"
                  value={formData.heroText}
                  onChange={(e) =>
                    setFormData({ ...formData, heroText: e.target.value })
                  }
                  rows={6}
                  placeholder="Enter the hero description text..."
                  required
                />
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


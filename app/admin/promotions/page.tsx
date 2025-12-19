"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Promotion {
  id: string;
  title: string;
  url: string;
  blurb: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  active: boolean;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    blurb: "",
    imageUrl: "",
    ctaLabel: "",
    active: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    const res = await fetch("/api/admin/promotions");
    const data = await res.json();
    setPromotions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing
      ? `/api/admin/promotions/${editing.id}`
      : "/api/admin/promotions";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setOpen(false);
      setEditing(null);
      setFormData({
        title: "",
        url: "",
        blurb: "",
        imageUrl: "",
        ctaLabel: "",
        active: true,
      });
      loadPromotions();
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditing(promo);
    setFormData({
      title: promo.title,
      url: promo.url,
      blurb: promo.blurb,
      imageUrl: promo.imageUrl || "",
      ctaLabel: promo.ctaLabel || "",
      active: promo.active,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
    loadPromotions();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Promotions</h1>
            <p className="text-muted-foreground">Create and edit promotions</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditing(null);
                setFormData({
                  title: "",
                  url: "",
                  blurb: "",
                  imageUrl: "",
                  ctaLabel: "",
                  active: true,
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                New Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Promotion" : "New Promotion"}
                </DialogTitle>
                <DialogDescription>
                  {editing ? "Update promotion details" : "Create a new promotion"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/swag or https://example.com or /downloads/file.pdf"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Can be an internal path (e.g., /swag), external URL (https://...), or download link
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blurb">Blurb *</Label>
                  <Textarea
                    id="blurb"
                    value={formData.blurb}
                    onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaLabel">CTA Button Text</Label>
                  <Input
                    id="ctaLabel"
                    value={formData.ctaLabel}
                    onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                    placeholder="Learn More, Download Now, etc. (defaults to 'Learn More')"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editing ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {promotions.map((promo) => (
            <Card key={promo.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{promo.title}</h3>
                      <Badge variant={promo.active ? "default" : "secondary"}>
                        {promo.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{promo.url}</p>
                    {promo.ctaLabel && (
                      <p className="text-xs text-muted-foreground">CTA: {promo.ctaLabel}</p>
                    )}
                    <p className="text-sm mt-2">{promo.blurb}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(promo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}


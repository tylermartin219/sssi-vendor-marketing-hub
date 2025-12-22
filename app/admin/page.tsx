import Link from "next/link";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Megaphone, Calendar, Image, FileText, ShoppingCart, Users, Home, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const stats = {
    promotions: await prisma.promotion.count(),
    products: await prisma.product.count(),
    quotes: await prisma.quote.count(),
    invoices: await prisma.invoice.count(),
    potmApplications: await prisma.pOTMApplication.count(),
    assets: await prisma.asset.count(),
    resources: await prisma.resource.count(),
    users: await prisma.user.count(),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage content and view system statistics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Promotions</CardTitle>
                <Megaphone className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.promotions}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/promotions">Manage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.products}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/products">Manage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>POTM Months</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.potmApplications}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/potm">Manage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assets</CardTitle>
                <Image className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.assets}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/assets">Manage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resources</CardTitle>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.resources}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/resources">Manage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quote Requests</CardTitle>
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.quotes}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/quotes">View All</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoices</CardTitle>
                <Receipt className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.invoices}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/invoices">Manage</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Users</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.users}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Home Page</CardTitle>
                <Home className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/home">Edit Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


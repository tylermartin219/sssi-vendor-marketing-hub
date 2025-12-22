"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string | null;
  product?: {
    name: string;
  } | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  billingAddress: string;
  notes?: string | null;
  total: number;
  user: {
    name: string | null;
    email: string;
    company: string | null;
  };
  items: InvoiceItem[];
}

export default function InvoiceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && params.id) {
      fetch(`/api/invoices/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setInvoice(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [session, params.id]);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container py-12">
          <p>Please sign in to view this invoice.</p>
        </main>
      </div>
    );
  }

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

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container py-12">
          <p>Invoice not found.</p>
        </main>
      </div>
    );
  }

  const billingAddress = JSON.parse(invoice.billingAddress || "{}");
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Invoice</h1>
              <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
            <Button asChild>
              <a
                href={`/api/invoices/${invoice.id}/pdf`}
                target="_blank"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-semibold">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                </div>
                {invoice.dueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-semibold">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(invoice.total)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">
                  {invoice.user.company || invoice.user.name || invoice.user.email}
                </p>
                {invoice.user.name && invoice.user.company && (
                  <p>{invoice.user.name}</p>
                )}
                {billingAddress.street && <p>{billingAddress.street}</p>}
                {billingAddress.city && (
                  <p>
                    {billingAddress.city}
                    {billingAddress.state && `, ${billingAddress.state}`}
                    {billingAddress.zip && ` ${billingAddress.zip}`}
                  </p>
                )}
                {billingAddress.country && <p>{billingAddress.country}</p>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Description</th>
                      <th className="text-right py-2 px-4">Quantity</th>
                      <th className="text-right py-2 px-4">Unit Price</th>
                      <th className="text-right py-2 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-4">
                          <p className="font-semibold">{item.description}</p>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </td>
                        <td className="text-right py-2 px-4">{item.quantity}</td>
                        <td className="text-right py-2 px-4">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="text-right py-2 px-4 font-semibold">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right py-4 px-4 font-bold">
                        Total:
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-xl text-primary">
                        {formatCurrency(invoice.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  total: number;
  company: {
    id: string;
    name: string;
  };
}

interface Company {
  id: string;
  name: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    quoteId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    notes: "",
    items: [] as InvoiceItem[],
  });

  useEffect(() => {
    loadInvoices();
    loadCompanies();
  }, []);

  const loadInvoices = async () => {
    const res = await fetch("/api/admin/invoices");
    const data = await res.json();
    setInvoices(data);
  };

  const loadCompanies = async () => {
    const res = await fetch("/api/admin/companies");
    const data = await res.json();
    setCompanies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing
      ? `/api/admin/invoices/${editing.id}`
      : "/api/admin/invoices";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setOpen(false);
      setEditing(null);
      resetForm();
      loadInvoices();
    }
  };

  const handleEdit = async (invoice: Invoice) => {
    const res = await fetch(`/api/admin/invoices/${invoice.id}`);
    const data = await res.json();
    
    setEditing(data);
    setFormData({
      companyId: data.companyId,
      quoteId: data.quoteId || "",
      invoiceDate: new Date(data.invoiceDate).toISOString().split("T")[0],
      notes: data.notes || "",
      items: data.items.map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        notes: item.notes,
      })),
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
    loadInvoices();
  };

  const resetForm = () => {
    setFormData({
      companyId: "",
      quoteId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [],
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          notes: null,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total =
        newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const selectedCompany = companies.find((c) => c.id === formData.companyId);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const total = formData.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Invoices</h1>
            <p className="text-muted-foreground">Create and manage invoices</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  resetForm();
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Invoice" : "New Invoice"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyId">Company *</Label>
                    <Select
                      value={formData.companyId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, companyId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date *</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                {selectedCompany && (
                  <div className="space-y-2">
                    <Label>Billing Address (from company)</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {selectedCompany.street && <p>{selectedCompany.street}</p>}
                      <p>
                        {[
                          selectedCompany.city,
                          selectedCompany.state,
                          selectedCompany.zip,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {selectedCompany.country && <p>{selectedCompany.country}</p>}
                      {!selectedCompany.street &&
                        !selectedCompany.city &&
                        !selectedCompany.state && (
                          <p className="text-muted-foreground">
                            No billing address set for this company
                          </p>
                        )}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Line Items</Label>
                    <Button type="button" onClick={addItem} variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="border p-3 rounded-lg space-y-2"
                      >
                        <div className="space-y-1">
                          <Label>Description *</Label>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Unit Price *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Total</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.total}
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>&nbsp;</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Notes</Label>
                          <Input
                            value={item.notes || ""}
                            onChange={(e) =>
                              updateItem(index, "notes", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                    {formData.items.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No items. Click "Add Item" to add line items.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total:</p>
                      <p className="text-xl font-bold">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editing ? "Update" : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{invoice.invoiceNumber}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {invoice.company.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {formatCurrency(invoice.total)}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`/api/admin/invoices/${invoice.id}/pdf`}
                        target="_blank"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(invoice)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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


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
  productId?: string | null;
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
  dueDate?: string | null;
  total: number;
  user: {
    name: string | null;
    email: string;
    company: string | null;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    quoteId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    notes: "",
    items: [] as InvoiceItem[],
  });

  useEffect(() => {
    loadInvoices();
    loadUsers();
    loadProducts();
  }, []);

  const loadInvoices = async () => {
    const res = await fetch("/api/admin/invoices");
    const data = await res.json();
    setInvoices(data);
  };

  const loadUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  };

  const loadProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
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
      body: JSON.stringify({
        ...formData,
        dueDate: formData.dueDate || null,
      }),
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
    
    const billingAddress = JSON.parse(data.billingAddress || "{}");
    
    setEditing(data);
    setFormData({
      userId: data.userId,
      quoteId: data.quoteId || "",
      invoiceDate: new Date(data.invoiceDate).toISOString().split("T")[0],
      dueDate: data.dueDate
        ? new Date(data.dueDate).toISOString().split("T")[0]
        : "",
      billingAddress: {
        street: billingAddress.street || "",
        city: billingAddress.city || "",
        state: billingAddress.state || "",
        zip: billingAddress.zip || "",
        country: billingAddress.country || "",
      },
      notes: data.notes || "",
      items: data.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
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
      userId: "",
      quoteId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      },
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
          notes: "",
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

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const unitPrice = product.price || 0;
      const quantity = product.quantity || 1;
      updateItem(index, "productId", productId);
      updateItem(index, "description", product.name);
      updateItem(index, "unitPrice", unitPrice);
      updateItem(index, "quantity", quantity);
      updateItem(index, "total", unitPrice * quantity);
    }
  };

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
                    <Label htmlFor="userId">Vendor *</Label>
                    <Select
                      value={formData.userId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, userId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.company || user.name || user.email}
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
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Address</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Street"
                      value={formData.billingAddress.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: {
                            ...formData.billingAddress,
                            street: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="City"
                      value={formData.billingAddress.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: {
                            ...formData.billingAddress,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="State"
                      value={formData.billingAddress.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: {
                            ...formData.billingAddress,
                            state: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="ZIP"
                      value={formData.billingAddress.zip}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: {
                            ...formData.billingAddress,
                            zip: e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      placeholder="Country"
                      value={formData.billingAddress.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billingAddress: {
                            ...formData.billingAddress,
                            country: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
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
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label>Product (optional)</Label>
                            <Select
                              value={item.productId || ""}
                              onValueChange={(value) =>
                                handleProductSelect(index, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
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
                      {invoice.user.name || invoice.user.email}
                      {invoice.user.company && ` • ${invoice.user.company}`}
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
                    {invoice.dueDate &&
                      ` • Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
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


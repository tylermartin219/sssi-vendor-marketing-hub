"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function ApplicationDetails({
  application,
  currentMonthKey,
  onUpdate,
}: {
  application: POTMApplication;
  currentMonthKey: string;
  onUpdate: (newMonthKey: string, newStatus?: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(application.monthKey);

  const allMonths = months.map((monthName, index) => {
    const monthNum = String(index + 1).padStart(2, "0");
    const monthKey = `${currentYear}-${monthNum}`;
    return { monthKey, monthName };
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-semibold">Company</Label>
        <p>{application.companyName}</p>
      </div>
      <div>
        <Label className="text-sm font-semibold">Contact</Label>
        <p>{application.contactName}</p>
        <p className="text-sm text-muted-foreground">{application.contactEmail}</p>
      </div>
      <div>
        <Label className="text-sm font-semibold">Product</Label>
        <p>{application.productName}</p>
      </div>
      <div>
        <Label className="text-sm font-semibold">Description</Label>
        <p className="text-sm whitespace-pre-wrap">{application.description}</p>
      </div>
      {application.link && (
        <div>
          <Label className="text-sm font-semibold">Product Link</Label>
          <a
            href={application.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline block"
          >
            {application.link}
          </a>
        </div>
      )}
      {application.notes && (
        <div>
          <Label className="text-sm font-semibold">Additional Notes</Label>
          <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
        </div>
      )}
      <div>
        <Label className="text-sm font-semibold">Status</Label>
        <Badge
          variant={
            application.status === "approved"
              ? "default"
              : application.status === "rejected"
              ? "destructive"
              : "secondary"
          }
        >
          {application.status}
        </Badge>
      </div>
      <div>
        <Label className="text-sm font-semibold">Month</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allMonths.map((m) => (
              <SelectItem key={m.monthKey} value={m.monthKey}>
                {m.monthName} {currentYear}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedMonth !== application.monthKey && (
          <p className="text-xs text-muted-foreground mt-1">
            Month will be changed when you approve, deny, or click "Update Month"
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 pt-4 border-t">
        {selectedMonth !== application.monthKey && (
          <Button
            variant="outline"
            onClick={() => onUpdate(selectedMonth, application.status)}
            className="w-full"
          >
            Update Month Only
          </Button>
        )}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => onUpdate(selectedMonth, "approved")}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onUpdate(selectedMonth, "rejected")}
          >
            <X className="h-4 w-4 mr-2" />
            Deny
          </Button>
        </div>
        {application.status !== "pending" && (
          <Button
            variant="outline"
            onClick={() => onUpdate(selectedMonth, "pending")}
            className="w-full"
          >
            Reset to Pending
          </Button>
        )}
      </div>
    </div>
  );
}

interface POTMApplication {
  id: string;
  monthKey: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  productName: string;
  description: string;
  link: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    company: string | null;
  };
}

export default function AdminPOTMPage() {
  const currentYear = new Date().getFullYear();
  const [potmMonths, setPotmMonths] = useState<any[]>([]);
  const [applications, setApplications] = useState<POTMApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [monthsRes, appsRes] = await Promise.all([
      fetch("/api/admin/potm"),
      fetch("/api/admin/potm/applications"),
    ]);
    const monthsData = await monthsRes.json();
    const appsData = await appsRes.json();
    setPotmMonths(monthsData);
    setApplications(appsData);
    setLoading(false);
  };

  const handleUpdate = async (monthKey: string, status: string, reservedLabel?: string) => {
    await fetch("/api/admin/potm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthKey,
        status,
        reservedLabel: reservedLabel || null,
      }),
    });
    loadData();
  };

  const handleApplicationStatus = async (
    applicationId: string,
    status: string,
    monthKey?: string
  ) => {
    await fetch(`/api/admin/potm/applications/${applicationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, monthKey }),
    });
    loadData();
  };

  const monthMap = new Map(potmMonths.map((m) => [m.monthKey, m]));

  const allMonths = months.map((monthName, index) => {
    const monthNum = String(index + 1).padStart(2, "0");
    const monthKey = `${currentYear}-${monthNum}`;
    const potmMonth = monthMap.get(monthKey);
    const monthApplications = applications.filter((app) => app.monthKey === monthKey);

    return {
      monthKey,
      monthName,
      status: potmMonth?.status || "open",
      reservedLabel: potmMonth?.reservedLabel || "",
      applications: monthApplications,
    };
  });

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
          <h1 className="text-4xl font-bold mb-2">Manage POTM Months & Applications</h1>
          <p className="text-muted-foreground">
            Review applications and approve/deny them. Approving automatically reserves the month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMonths.map((month) => {
            const pendingApps = month.applications.filter(
              (app) => app.status === "pending"
            );
            const approvedApp = month.applications.find(
              (app) => app.status === "approved"
            );

            return (
              <Card key={month.monthKey}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle>{month.monthName}</CardTitle>
                    {pendingApps.length > 0 && (
                      <Badge variant="secondary">Pending ({pendingApps.length})</Badge>
                    )}
                  </div>
                  {month.status === "reserved" && month.reservedLabel && (
                    <p className="text-sm text-muted-foreground">
                      {month.reservedLabel}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Manual override option */}
                  <div className="space-y-2">
                    <Label>Status Override</Label>
                    <Select
                      value={month.status}
                      onValueChange={(value) =>
                        handleUpdate(month.monthKey, value, month.reservedLabel)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                    {month.status === "reserved" && (
                      <Input
                        value={month.reservedLabel}
                        onChange={(e) =>
                          handleUpdate(month.monthKey, month.status, e.target.value)
                        }
                        placeholder="Reserved label"
                        className="mt-2"
                      />
                    )}
                  </div>

                  {/* Applications */}
                  {pendingApps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-sm font-semibold">
                        Pending Applications ({pendingApps.length})
                      </Label>
                      {pendingApps.map((app) => (
                        <Card key={app.id} className="p-3 bg-muted/50">
                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold text-sm">{app.productName}</p>
                              <p className="text-xs text-muted-foreground">
                                {app.companyName} • {app.contactEmail}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() =>
                                  handleApplicationStatus(app.id, "approved")
                                }
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() =>
                                  handleApplicationStatus(app.id, "rejected")
                                }
                              >
                                <X className="h-3 w-3 mr-1" />
                                Deny
                              </Button>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full">
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{app.productName}</DialogTitle>
                                  <DialogDescription>
                                    Application for {month.monthName} {currentYear}
                                  </DialogDescription>
                                </DialogHeader>
                                <ApplicationDetails
                                  application={app}
                                  currentMonthKey={month.monthKey}
                                  onUpdate={(newMonthKey, newStatus) => {
                                    handleApplicationStatus(
                                      app.id,
                                      newStatus || app.status,
                                      newMonthKey
                                    );
                                    setTimeout(() => {
                                      const closeButton = document.querySelector('[role="dialog"] button') as HTMLButtonElement | null;
                                      closeButton?.click();
                                    }, 100);
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {approvedApp && (
                    <div className="pt-2 border-t">
                      <Label className="text-sm font-semibold text-green-600">
                        Approved Application
                      </Label>
                      <Card className="p-3 bg-green-50 dark:bg-green-950 mt-2">
                        <p className="font-semibold text-sm">{approvedApp.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {approvedApp.companyName}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              View Full Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{approvedApp.productName}</DialogTitle>
                              <DialogDescription>
                                Approved application for {month.monthName} {currentYear}
                              </DialogDescription>
                            </DialogHeader>
                            <ApplicationDetails
                              application={approvedApp}
                              currentMonthKey={month.monthKey}
                              onUpdate={(newMonthKey, newStatus) =>
                                handleApplicationStatus(
                                  approvedApp.id,
                                  newStatus || approvedApp.status,
                                  newMonthKey
                                )
                              }
                            />
                          </DialogContent>
                        </Dialog>
                      </Card>
                    </div>
                  )}

                  {month.applications.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No applications yet
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}


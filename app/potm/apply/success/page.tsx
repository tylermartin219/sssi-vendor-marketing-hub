import Link from "next/link";
import { Nav } from "@/components/nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function POTMApplySuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-3xl mb-2">Application Submitted!</CardTitle>
              <CardDescription className="text-lg mb-6">
                Thank you for your application. We'll review it and get back to you soon.
              </CardDescription>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/potm">Back to Calendar</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account">View My Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


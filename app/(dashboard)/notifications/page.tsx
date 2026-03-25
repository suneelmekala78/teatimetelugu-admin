"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { notificationApi } from "@/lib/api/notifications";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsPage() {
  useAuth({ requiredRole: "admin" });
  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Send push notifications, emails, and SMS" />
      <Tabs defaultValue="push">
        <TabsList>
          <TabsTrigger value="push">Push Notification</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>
        <TabsContent value="push" className="mt-6"><PushForm /></TabsContent>
        <TabsContent value="email" className="mt-6"><EmailForm /></TabsContent>
        <TabsContent value="sms" className="mt-6"><SmsForm /></TabsContent>
      </Tabs>
    </div>
  );
}

function PushForm() {
  const [form, setForm] = useState({ topic: "all", title: "", body: "", imageUrl: "" });
  const mutation = useMutation({
    mutationFn: () => notificationApi.sendPush(form),
    onSuccess: () => { toast.success("Push notification sent"); setForm({ topic: "all", title: "", body: "", imageUrl: "" }); },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to send";
      toast.error(message);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notification</CardTitle>
        <CardDescription>Send to a topic (e.g., "all" for all subscribers)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Topic</Label><Input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} /></div>
        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
        <div><Label>Body</Label><Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={3} /></div>
        <div><Label>Image URL (optional)</Label><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} /></div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.title || !form.body}>
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send Push
        </Button>
      </CardContent>
    </Card>
  );
}

function EmailForm() {
  const [form, setForm] = useState({ to: "", subject: "", html: "" });
  const mutation = useMutation({
    mutationFn: () => notificationApi.sendEmail(form),
    onSuccess: () => { toast.success("Email sent"); setForm({ to: "", subject: "", html: "" }); },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to send";
      toast.error(message);
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Send Email</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>To</Label><Input type="email" value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} placeholder="user@example.com" /></div>
        <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} /></div>
        <div><Label>HTML Body</Label><Textarea value={form.html} onChange={(e) => setForm((f) => ({ ...f, html: e.target.value }))} rows={6} /></div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.to || !form.subject || !form.html}>
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send Email
        </Button>
      </CardContent>
    </Card>
  );
}

function SmsForm() {
  const [form, setForm] = useState({ to: "", message: "" });
  const mutation = useMutation({
    mutationFn: () => notificationApi.sendSms(form),
    onSuccess: () => { toast.success("SMS sent"); setForm({ to: "", message: "" }); },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to send";
      toast.error(message);
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle>Send SMS</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Phone Number</Label><Input value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} placeholder="+91..." /></div>
        <div><Label>Message</Label><Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={3} /></div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.to || !form.message}>
          {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send SMS
        </Button>
      </CardContent>
    </Card>
  );
}

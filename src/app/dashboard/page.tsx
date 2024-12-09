"use client";

import { LayoutDashboard, Users, CheckSquare, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StickyNotes } from "@/components/ui/sticky-note";
import { PageHeader } from "@/components/ui/page-header";

const dashboardCards = [
  {
    title: "Tasks",
    icon: CheckSquare,
    stats: {
      main: "12",
      subtext: "Today's Tasks"
    },
    details: [
      { text: "9 completed", value: "75%" }
    ],
    color: "bg-amber-500/10",
    textColor: "text-amber-500",
    progress: 75
  },
  {
    title: "Active Leads",
    icon: Target,
    stats: {
      main: "8",
      subtext: "New Today"
    },
    details: [
      { text: "4 requiring follow-up", icon: Clock },
      { text: "2 deals closed today", icon: CheckSquare }
    ],
    color: "bg-blue-500/10",
    textColor: "text-blue-500"
  },
  {
    title: "Contacts",
    icon: Users,
    stats: {
      main: "20",
      subtext: "Total Contacts"
    },
    details: [
      { text: "0 meetings today", icon: Clock }
    ],
    color: "bg-pink-500/10",
    textColor: "text-pink-500"
  }
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <PageHeader 
        title="Dashboard" 
        icon={LayoutDashboard}
        iconClass="icon-dashboard"
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good Evening!</h1>
        <p className="text-muted-foreground">Here's what's happening today</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dashboard-card card-tasks border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckSquare className="text-orange-500" />
                Tasks
              </div>
            </CardTitle>
            <span className="text-orange-500 text-2xl font-bold animate-counter">12</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Today's Tasks</p>
              <div className="progress-bar-wrapper">
                <div className="progress-bar" style={{ width: '75%' }} />
              </div>
              <p className="text-sm text-muted-foreground">9 completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card card-leads border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Target className="text-blue-500" />
                Active Leads
              </div>
            </CardTitle>
            <span className="text-blue-500 text-2xl font-bold animate-counter">8</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">New Today</p>
              <p className="text-sm text-muted-foreground">4 requiring follow-up</p>
              <p className="text-sm text-muted-foreground">2 deals closed today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card card-contacts border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="text-pink-500" />
                Contacts
              </div>
            </CardTitle>
            <span className="text-pink-500 text-2xl font-bold animate-counter">20</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Contacts</p>
              <p className="text-sm text-muted-foreground">0 meetings today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="dashboard-card card-sales border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="text-purple-500" />
              Sales Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Monthly Goal</p>
              <div className="text-2xl font-bold animate-counter">£50,000</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>Current: £37,500</div>
                  <div className="text-muted-foreground">Remaining: £12,500</div>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card card-activity border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full activity-dot" />
                  <div>
                    <p className="text-sm">New lead assigned to you</p>
                    <p className="text-sm text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

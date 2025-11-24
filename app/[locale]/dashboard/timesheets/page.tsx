"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, Play, Square, Car } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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

type ActivityType =
  | "DRIVING"
  | "MAINTENANCE"
  | "INSPECTION"
  | "FUELING"
  | "CLEANING"
  | "PARKING"
  | "OTHER";

type Timesheet = {
  id: string;
  userId: string;
  userName: string;
  vehicleId: string | null;
  vehicleName: string | null;
  activityType: ActivityType;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  description: string | null;
  location: string | null;
};

function TimesheetsPage() {
  const t = useTranslations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTimesheets, setActiveTimesheets] = useState<Timesheet[]>([
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      vehicleId: "v1",
      vehicleName: "Toyota Camry",
      activityType: "DRIVING",
      startTime: "2024-11-24T08:00:00",
      endTime: null,
      duration: null,
      description: "Route delivery",
      location: "Downtown",
    },
  ]);
  const [completedTimesheets, setCompletedTimesheets] = useState<Timesheet[]>([
    {
      id: "2",
      userId: "user1",
      userName: "John Doe",
      vehicleId: "v2",
      vehicleName: "Honda Civic",
      activityType: "MAINTENANCE",
      startTime: "2024-11-23T14:00:00",
      endTime: "2024-11-23T16:30:00",
      duration: 2.5,
      description: "Oil change and tire rotation",
      location: "Service Center",
    },
    {
      id: "3",
      userId: "user1",
      userName: "John Doe",
      vehicleId: "v3",
      vehicleName: "Ford Transit",
      activityType: "FUELING",
      startTime: "2024-11-23T10:15:00",
      endTime: "2024-11-23T10:30:00",
      duration: 0.25,
      description: "Refuel",
      location: "Gas Station A",
    },
  ]);

  const [formData, setFormData] = useState({
    vehicleId: "",
    activityType: "" as ActivityType,
    description: "",
    location: "",
  });

  const handleStartActivity = () => {
    const newTimesheet: Timesheet = {
      id: Date.now().toString(),
      userId: "user1",
      userName: "Current User",
      vehicleId: formData.vehicleId || null,
      vehicleName: formData.vehicleId ? "Selected Vehicle" : null,
      activityType: formData.activityType,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      description: formData.description,
      location: formData.location,
    };

    setActiveTimesheets([...activeTimesheets, newTimesheet]);
    setIsDialogOpen(false);
    setFormData({
      vehicleId: "",
      activityType: "" as ActivityType,
      description: "",
      location: "",
    });
  };

  const handleEndActivity = (id: string) => {
    const timesheet = activeTimesheets.find((t) => t.id === id);
    if (timesheet) {
      const endTime = new Date().toISOString();
      const start = new Date(timesheet.startTime);
      const end = new Date(endTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      const completedTimesheet: Timesheet = {
        ...timesheet,
        endTime,
        duration: parseFloat(duration.toFixed(2)),
      };

      setCompletedTimesheets([completedTimesheet, ...completedTimesheets]);
      setActiveTimesheets(activeTimesheets.filter((t) => t.id !== id));
    }
  };

  const getActivityBadge = (activity: ActivityType) => {
    const colors = {
      DRIVING: "bg-blue-500",
      MAINTENANCE: "bg-orange-500",
      INSPECTION: "bg-purple-500",
      FUELING: "bg-green-500",
      CLEANING: "bg-cyan-500",
      PARKING: "bg-gray-500",
      OTHER: "bg-gray-400",
    };
    return (
      <Badge className={colors[activity]}>
        {t(`timesheets.${activity.toLowerCase()}`)}
      </Badge>
    );
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return "-";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const hours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
    return formatDuration(hours);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("timesheets.title")}</h1>
          <p className="text-muted-foreground">
            {t("timesheets.totalActivities")}:{" "}
            {activeTimesheets.length + completedTimesheets.length}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Play className="mr-2 h-4 w-4" />
              {t("timesheets.startActivity")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("timesheets.logActivity")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("timesheets.activityType")}</Label>
                <Select
                  value={formData.activityType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      activityType: value as ActivityType,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("timesheets.activityType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRIVING">
                      {t("timesheets.driving")}
                    </SelectItem>
                    <SelectItem value="MAINTENANCE">
                      {t("timesheets.maintenance")}
                    </SelectItem>
                    <SelectItem value="INSPECTION">
                      {t("timesheets.inspection")}
                    </SelectItem>
                    <SelectItem value="FUELING">
                      {t("timesheets.fueling")}
                    </SelectItem>
                    <SelectItem value="CLEANING">
                      {t("timesheets.cleaning")}
                    </SelectItem>
                    <SelectItem value="PARKING">
                      {t("timesheets.parking")}
                    </SelectItem>
                    <SelectItem value="OTHER">
                      {t("timesheets.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("timesheets.vehicle")}</Label>
                <Input
                  placeholder={t("timesheets.vehicle")}
                  value={formData.vehicleId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("timesheets.location")}</Label>
                <Input
                  placeholder={t("timesheets.location")}
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("timesheets.description")}</Label>
                <Textarea
                  placeholder={t("timesheets.description")}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button
                onClick={handleStartActivity}
                className="w-full"
                disabled={!formData.activityType}
              >
                <Play className="mr-2 h-4 w-4" />
                {t("timesheets.startActivity")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Timesheets */}
      {activeTimesheets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              {t("timesheets.activeTimesheets")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTimesheets.map((timesheet) => (
                <div
                  key={timesheet.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getActivityBadge(timesheet.activityType)}
                      {timesheet.vehicleName && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Car className="h-3 w-3" />
                          {timesheet.vehicleName}
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{timesheet.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDateTime(timesheet.startTime)}</span>
                      <span>•</span>
                      <span className="font-medium">
                        {getElapsedTime(timesheet.startTime)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleEndActivity(timesheet.id)}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    {t("timesheets.endActivity")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Timesheets */}
      <Card>
        <CardHeader>
          <CardTitle>{t("timesheets.completedTimesheets")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("timesheets.activity")}</TableHead>
                <TableHead>{t("timesheets.vehicle")}</TableHead>
                <TableHead>{t("timesheets.startTime")}</TableHead>
                <TableHead>{t("timesheets.endTime")}</TableHead>
                <TableHead>{t("timesheets.duration")}</TableHead>
                <TableHead>{t("timesheets.description")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedTimesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>
                    {getActivityBadge(timesheet.activityType)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {timesheet.vehicleName || "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(timesheet.startTime)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {timesheet.endTime
                      ? formatDateTime(timesheet.endTime)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatDuration(timesheet.duration)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {timesheet.description || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TimesheetsPageWithLayout() {
  return (
    <DashboardLayout>
      <TimesheetsPage />
    </DashboardLayout>
  );
}

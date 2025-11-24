"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Clock, Play, Square, Car } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  getActiveTimesheets,
  getTimesheetHistory,
  startTimesheet,
  endTimesheet,
} from "@/actions/timesheets";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTimesheets, setActiveTimesheets] = useState<Timesheet[]>([]);
  const [completedTimesheets, setCompletedTimesheets] = useState<Timesheet[]>(
    []
  );

  const [formData, setFormData] = useState({
    vehicleId: "",
    activityType: "" as ActivityType,
    description: "",
    location: "",
  });

  useEffect(() => {
    loadTimesheets();
  }, []);

  const loadTimesheets = async () => {
    try {
      const [activeResult, historyResult] = await Promise.all([
        getActiveTimesheets(),
        getTimesheetHistory(),
      ]);

      if (activeResult.success && activeResult.data) {
        setActiveTimesheets(
          activeResult.data.map((record) => ({
            id: record.id,
            userId: record.userId,
            userName: record.user.name || record.user.email,
            vehicleId: record.vehicleId,
            vehicleName: record.vehicle?.name || null,
            activityType: record.activityType,
            startTime: new Date(record.startTime).toISOString(),
            endTime: null,
            duration: null,
            description: record.description,
            location: record.location,
          }))
        );
      }

      if (historyResult.success && historyResult.data) {
        setCompletedTimesheets(
          historyResult.data.map((record) => ({
            id: record.id,
            userId: record.userId,
            userName: record.user.name || record.user.email,
            vehicleId: record.vehicleId,
            vehicleName: record.vehicle?.name || null,
            activityType: record.activityType,
            startTime: new Date(record.startTime).toISOString(),
            endTime: record.endTime
              ? new Date(record.endTime).toISOString()
              : null,
            duration: record.duration ? record.duration / 60 : null,
            description: record.description,
            location: record.location,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load timesheets:", error);
    }
  };

  const handleStartActivity = async () => {
    // Double check for active timesheets (UI should prevent this)
    if (activeTimesheets.length > 0) {
      toast({
        title: t("common.error"),
        description:
          "You already have an active timesheet. Please end it first.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.activityType) {
      toast({
        title: t("common.error"),
        description: "Please select an activity type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await startTimesheet({
        activityType: formData.activityType,
        vehicleId: formData.vehicleId || undefined,
        location: formData.location,
        description: formData.description,
      });

      console.log("Start timesheet result:", result);

      if (result.success && result.data) {
        const record = result.data;
        const newTimesheet: Timesheet = {
          id: record.id,
          userId: record.userId,
          userName: record.user.name || record.user.email,
          vehicleId: record.vehicleId,
          vehicleName: record.vehicle?.name || null,
          activityType: record.activityType,
          startTime: new Date(record.startTime).toISOString(),
          endTime: null,
          duration: null,
          description: record.description,
          location: record.location,
        };
        setActiveTimesheets([...activeTimesheets, newTimesheet]);
        setIsDialogOpen(false);
        setFormData({
          vehicleId: "",
          activityType: "" as ActivityType,
          description: "",
          location: "",
        });
        toast({
          title: t("common.success"),
          description: result.message || "Activity started",
        });
      } else {
        console.error("Failed to start timesheet:", result);
        toast({
          title: t("common.error"),
          description: result.message || "Failed to start activity",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Exception starting timesheet:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndActivity = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await endTimesheet(id);

      if (result.success && result.data) {
        const record = result.data;
        const completedTimesheet: Timesheet = {
          id: record.id,
          userId: record.userId,
          userName: record.user.name || record.user.email,
          vehicleId: record.vehicleId,
          vehicleName: record.vehicle?.name || null,
          activityType: record.activityType,
          startTime: new Date(record.startTime).toISOString(),
          endTime: new Date(record.endTime!).toISOString(),
          duration: record.duration ? record.duration / 60 : null,
          description: record.description,
          location: record.location,
        };
        setCompletedTimesheets([completedTimesheet, ...completedTimesheets]);
        setActiveTimesheets(activeTimesheets.filter((t) => t.id !== id));
        toast({
          title: t("common.success"),
          description: result.message || "Activity ended",
        });
      } else {
        toast({
          title: t("common.error"),
          description: result.message || "Failed to end activity",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <Button
              size="lg"
              disabled={activeTimesheets.length > 0}
              title={
                activeTimesheets.length > 0
                  ? "Please end your active timesheet first"
                  : ""
              }
            >
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
                disabled={!formData.activityType || isLoading}
              >
                <Play className="mr-2 h-4 w-4" />
                {isLoading
                  ? t("common.loading")
                  : t("timesheets.startActivity")}
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

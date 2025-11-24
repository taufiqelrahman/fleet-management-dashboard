"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, Plus, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  getTodayShifts,
  getUpcomingShifts,
  getAllShifts,
  createShift,
} from "@/actions/schedules";
import { useToast } from "@/components/ui/use-toast";
import { LoadingScreen, Spinner } from "@/components/ui/spinner";
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

type ShiftType = "MORNING" | "AFTERNOON" | "NIGHT" | "FLEXIBLE";
type ShiftStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

type Shift = {
  id: string;
  userId: string;
  userName: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  notes: string | null;
};

function SchedulesPage() {
  const t = useTranslations();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [upcomingShifts, setUpcomingShifts] = useState<Shift[]>([]);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setIsInitialLoading(true);
    try {
      const [todayResult, upcomingResult, allResult] = await Promise.all([
        getTodayShifts(),
        getUpcomingShifts(),
        getAllShifts(),
      ]);

      const mapShift = (record: {
        id: string;
        userId: string;
        user: { name: string | null; email: string };
        shiftType: ShiftType;
        startTime: Date;
        endTime: Date;
        status: ShiftStatus;
        notes: string | null;
      }): Shift => ({
        id: record.id,
        userId: record.userId,
        userName: record.user.name || record.user.email,
        shiftType: record.shiftType,
        startTime: new Date(record.startTime).toISOString(),
        endTime: new Date(record.endTime).toISOString(),
        status: record.status,
        notes: record.notes,
      });

      if (todayResult.success && todayResult.data) {
        setTodayShifts(todayResult.data.map(mapShift));
      }

      if (upcomingResult.success && upcomingResult.data) {
        setUpcomingShifts(upcomingResult.data.map(mapShift));
      }

      if (allResult.success && allResult.data) {
        setShifts(allResult.data.map(mapShift));
      }
    } catch (error) {
      console.error("Failed to load shifts:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    shiftType: "" as ShiftType,
    startTime: "",
    endTime: "",
    notes: "",
  });

  const handleCreateShift = async () => {
    if (!formData.shiftType || !formData.startTime || !formData.endTime) {
      toast({
        title: t("common.error"),
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createShift({
        shiftType: formData.shiftType,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        notes: formData.notes || undefined,
      });

      if (result.success && result.data) {
        await loadShifts();
        setIsDialogOpen(false);
        setFormData({
          shiftType: "" as ShiftType,
          startTime: "",
          endTime: "",
          notes: "",
        });
        toast({
          title: t("common.success"),
          description: result.message || "Shift created successfully",
        });
      } else {
        toast({
          title: t("common.error"),
          description: result.message || "Failed to create shift",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to create shift:", err);
      toast({
        title: t("common.error"),
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getShiftTypeBadge = (type: ShiftType) => {
    const colors = {
      MORNING: "bg-yellow-500",
      AFTERNOON: "bg-orange-500",
      NIGHT: "bg-blue-500",
      FLEXIBLE: "bg-purple-500",
    };
    return (
      <Badge className={colors[type]}>
        {t(`schedules.${type.toLowerCase()}`)}
      </Badge>
    );
  };

  const getStatusBadge = (status: ShiftStatus) => {
    const colors = {
      SCHEDULED: "bg-blue-500",
      ONGOING: "bg-green-500",
      COMPLETED: "bg-gray-500",
      CANCELLED: "bg-red-500",
    };
    return (
      <Badge className={colors[status]}>
        {t(`schedules.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString();
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)}h`;
  };

  if (isInitialLoading) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("schedules.title")}</h1>
          <p className="text-muted-foreground">
            {t("schedules.todayShifts")}: {todayShifts.length}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              {t("schedules.createShift")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("schedules.createShift")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("schedules.shiftType")}</Label>
                <Select
                  value={formData.shiftType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, shiftType: value as ShiftType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("schedules.shiftType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MORNING">
                      {t("schedules.morning")}
                    </SelectItem>
                    <SelectItem value="AFTERNOON">
                      {t("schedules.afternoon")}
                    </SelectItem>
                    <SelectItem value="NIGHT">
                      {t("schedules.night")}
                    </SelectItem>
                    <SelectItem value="FLEXIBLE">
                      {t("schedules.flexible")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("schedules.startTime")}</Label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("schedules.endTime")}</Label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>{t("common.notes")}</Label>
                <Textarea
                  placeholder={t("common.notes")}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreateShift}
                className="w-full"
                disabled={
                  !formData.shiftType ||
                  !formData.startTime ||
                  !formData.endTime ||
                  isLoading
                }
              >
                {isLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {isLoading ? t("common.loading") : t("schedules.createShift")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Shifts */}
      {todayShifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              {t("schedules.todayShifts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getShiftTypeBadge(shift.shiftType)}
                      {getStatusBadge(shift.status)}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {shift.userName}
                      </div>
                    </div>
                    {shift.notes && (
                      <p className="text-sm text-muted-foreground">
                        {shift.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDateTime(shift.startTime)}</span>
                      <span>→</span>
                      <span>{formatDateTime(shift.endTime)}</span>
                      <span>•</span>
                      <span className="font-medium">
                        {calculateDuration(shift.startTime, shift.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Shifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("schedules.upcomingShifts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("schedules.assignedTo")}</TableHead>
                <TableHead>{t("schedules.shiftType")}</TableHead>
                <TableHead>{t("schedules.startTime")}</TableHead>
                <TableHead>{t("schedules.endTime")}</TableHead>
                <TableHead>{t("timesheets.duration")}</TableHead>
                <TableHead>{t("schedules.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    {shift.userName}
                  </TableCell>
                  <TableCell>{getShiftTypeBadge(shift.shiftType)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(shift.startTime)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(shift.endTime)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {calculateDuration(shift.startTime, shift.endTime)}
                  </TableCell>
                  <TableCell>{getStatusBadge(shift.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>{t("schedules.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("schedules.assignedTo")}</TableHead>
                <TableHead>{t("schedules.shiftType")}</TableHead>
                <TableHead>{t("schedules.startTime")}</TableHead>
                <TableHead>{t("schedules.endTime")}</TableHead>
                <TableHead>{t("timesheets.duration")}</TableHead>
                <TableHead>{t("schedules.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    {shift.userName}
                  </TableCell>
                  <TableCell>{getShiftTypeBadge(shift.shiftType)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(shift.startTime)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateTime(shift.endTime)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {calculateDuration(shift.startTime, shift.endTime)}
                  </TableCell>
                  <TableCell>{getStatusBadge(shift.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SchedulesPageWithLayout() {
  return (
    <DashboardLayout>
      <SchedulesPage />
    </DashboardLayout>
  );
}

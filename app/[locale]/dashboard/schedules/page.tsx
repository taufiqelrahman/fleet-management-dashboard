"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, Plus, Users } from "lucide-react";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      shiftType: "MORNING",
      startTime: "2024-11-25T08:00:00",
      endTime: "2024-11-25T16:00:00",
      status: "SCHEDULED",
      notes: "Regular morning shift",
    },
    {
      id: "2",
      userId: "user2",
      userName: "Jane Smith",
      shiftType: "AFTERNOON",
      startTime: "2024-11-25T16:00:00",
      endTime: "2024-11-25T24:00:00",
      status: "SCHEDULED",
      notes: null,
    },
    {
      id: "3",
      userId: "user1",
      userName: "John Doe",
      shiftType: "MORNING",
      startTime: "2024-11-24T08:00:00",
      endTime: "2024-11-24T16:00:00",
      status: "COMPLETED",
      notes: null,
    },
  ]);

  const [formData, setFormData] = useState({
    shiftType: "" as ShiftType,
    startTime: "",
    endTime: "",
    notes: "",
  });

  const handleCreateShift = () => {
    const newShift: Shift = {
      id: Date.now().toString(),
      userId: "user1",
      userName: "Current User",
      shiftType: formData.shiftType,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: "SCHEDULED",
      notes: formData.notes || null,
    };

    setShifts([...shifts, newShift]);
    setIsDialogOpen(false);
    setFormData({
      shiftType: "" as ShiftType,
      startTime: "",
      endTime: "",
      notes: "",
    });
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

  const todayShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.startTime).toDateString();
    const today = new Date().toDateString();
    return (
      shiftDate === today &&
      shift.status !== "COMPLETED" &&
      shift.status !== "CANCELLED"
    );
  });

  const upcomingShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.startTime);
    const today = new Date();
    return shiftDate > today && shift.status === "SCHEDULED";
  });

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
                  !formData.endTime
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("schedules.createShift")}
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

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  getTodayAttendance,
  getAttendanceHistory,
  clockIn,
  clockOut,
} from "@/actions/attendance";
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
import { Textarea } from "@/components/ui/textarea";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "ON_LEAVE";

type AttendanceRecord = {
  id: string;
  userId: string;
  userName: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  location: string | null;
  notes: string | null;
};

function AttendancePage() {
  const t = useTranslations();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(
            `${position.coords.latitude.toFixed(
              6
            )}, ${position.coords.longitude.toFixed(6)}`
          );
        },
        (error) => {
          console.log("Location error:", error.message);
          setLocation("Location not available");
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      setLocation("Location not supported");
    }

    // Load real data from database
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    setIsInitialLoading(true);
    try {
      const [todayResult, historyResult] = await Promise.all([
        getTodayAttendance(),
        getAttendanceHistory(),
      ]);

      if (todayResult.success && todayResult.data) {
        const record = todayResult.data;
        setTodayRecord({
          id: record.id,
          userId: record.userId,
          userName: record.user.name || record.user.email,
          date: new Date(record.date).toISOString().split("T")[0],
          clockIn: record.clockIn
            ? new Date(record.clockIn).toLocaleTimeString()
            : null,
          clockOut: record.clockOut
            ? new Date(record.clockOut).toLocaleTimeString()
            : null,
          status: record.status,
          location: record.location,
          notes: record.notes,
        });
        setIsClockedIn(!!record.clockIn && !record.clockOut);
      }

      if (historyResult.success && historyResult.data) {
        setAttendanceHistory(
          historyResult.data.map((record) => ({
            id: record.id,
            userId: record.userId,
            userName: record.user.name || record.user.email,
            date: new Date(record.date).toISOString().split("T")[0],
            clockIn: record.clockIn
              ? new Date(record.clockIn).toLocaleTimeString()
              : null,
            clockOut: record.clockOut
              ? new Date(record.clockOut).toLocaleTimeString()
              : null,
            status: record.status,
            location: record.location,
            notes: record.notes,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load attendance data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      const result = await clockIn({ location, notes });

      if (result.success && result.data) {
        const record = result.data;
        setTodayRecord({
          id: record.id,
          userId: record.userId,
          userName: record.user.name || record.user.email,
          date: new Date(record.date).toISOString().split("T")[0],
          clockIn: new Date(record.clockIn).toLocaleTimeString(),
          clockOut: null,
          status: record.status,
          location: record.location,
          notes: record.notes,
        });
        setIsClockedIn(true);
        setNotes("");
        toast({
          title: t("common.success"),
          description: result.message || "Clocked in successfully",
        });
      } else {
        toast({
          title: t("common.error"),
          description: result.message || "Failed to clock in",
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

  const handleClockOut = async () => {
    if (!todayRecord) return;

    setIsLoading(true);
    try {
      const result = await clockOut(todayRecord.id);

      if (result.success && result.data) {
        const record = result.data;
        const updatedRecord = {
          id: record.id,
          userId: record.userId,
          userName: record.user.name || record.user.email,
          date: new Date(record.date).toISOString().split("T")[0],
          clockIn: record.clockIn
            ? new Date(record.clockIn).toLocaleTimeString()
            : null,
          clockOut: new Date(record.clockOut!).toLocaleTimeString(),
          status: record.status,
          location: record.location,
          notes: record.notes,
        };
        setTodayRecord(updatedRecord);
        setIsClockedIn(false);
        setAttendanceHistory([updatedRecord, ...attendanceHistory]);
        toast({
          title: t("common.success"),
          description: result.message || "Clocked out successfully",
        });
      } else {
        toast({
          title: t("common.error"),
          description: result.message || "Failed to clock out",
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

  const getStatusBadge = (status: AttendanceStatus) => {
    const colors = {
      PRESENT: "bg-green-500",
      ABSENT: "bg-red-500",
      LATE: "bg-yellow-500",
      HALF_DAY: "bg-blue-500",
      ON_LEAVE: "bg-gray-500",
    };
    return (
      <Badge className={colors[status]}>
        {t(`attendance.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  if (isInitialLoading) {
    return <LoadingScreen message={t("common.loading")} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("attendance.title")}</h1>
        <p className="text-muted-foreground">
          {isMounted ? (
            <>
              {currentTime.toLocaleDateString()}{" "}
              {currentTime.toLocaleTimeString()}
            </>
          ) : (
            <span className="invisible">Loading...</span>
          )}
        </p>
      </div>

      {/* Clock In/Out Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("attendance.todayAttendance")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {isMounted ? currentTime.toLocaleDateString() : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {isMounted ? currentTime.toLocaleTimeString() : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {location || "Getting location..."}
              </span>
            </div>
          </div>

          {todayRecord && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {t("attendance.status")}:
                </span>
                {getStatusBadge(todayRecord.status)}
              </div>
              {todayRecord.clockIn && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {t("attendance.clockInTime")}:
                  </span>
                  <span className="text-sm">{todayRecord.clockIn}</span>
                </div>
              )}
              {todayRecord.clockOut && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {t("attendance.clockOutTime")}:
                  </span>
                  <span className="text-sm">{todayRecord.clockOut}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("attendance.notes")}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("attendance.notes")}
              disabled={isClockedIn}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            {!isClockedIn ? (
              <Button
                onClick={handleClockIn}
                className="flex-1"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Clock className="mr-2 h-4 w-4" />
                )}
                {isLoading ? t("common.loading") : t("attendance.clockIn")}
              </Button>
            ) : (
              <Button
                onClick={handleClockOut}
                variant="destructive"
                className="flex-1"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Clock className="mr-2 h-4 w-4" />
                )}
                {isLoading ? t("common.loading") : t("attendance.clockOut")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("attendance.attendanceHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("attendance.date")}</TableHead>
                <TableHead>{t("attendance.clockInTime")}</TableHead>
                <TableHead>{t("attendance.clockOutTime")}</TableHead>
                <TableHead>{t("attendance.workingHours")}</TableHead>
                <TableHead>{t("attendance.status")}</TableHead>
                <TableHead>{t("attendance.location")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.map((record) => {
                const hours =
                  record.clockIn && record.clockOut
                    ? (
                        (new Date(`2000-01-01 ${record.clockOut}`).getTime() -
                          new Date(`2000-01-01 ${record.clockIn}`).getTime()) /
                        (1000 * 60 * 60)
                      ).toFixed(1)
                    : "-";

                return (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.clockIn || "-"}</TableCell>
                    <TableCell>{record.clockOut || "-"}</TableCell>
                    <TableCell>{hours}h</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.location || "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AttendancePageWithLayout() {
  return (
    <DashboardLayout>
      <AttendancePage />
    </DashboardLayout>
  );
}

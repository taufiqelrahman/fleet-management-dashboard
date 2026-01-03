"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleForm } from "@/components/forms/vehicle-form";
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "@/hooks/useVehicles";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, FileDown, FileSpreadsheet } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { exportToCSV, exportToPDF } from "@/lib/export";
import type { Vehicle } from "@/lib/types";
import type { VehicleInput } from "@/lib/validation";
import { useTranslations } from "next-intl";

export default function VehiclesPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const { canCreate, canEdit, canDelete } = useRole();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleCreate = async (data: VehicleInput) => {
    try {
      await createVehicle.mutateAsync(data);
      toast({
        title: t("common.success"),
        description: t("vehicles.createSuccess"),
      });
      setIsCreateOpen(false);
    } catch {
      toast({
        title: t("common.error"),
        description: t("errors.generic"),
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (data: VehicleInput) => {
    if (!selectedVehicle) return;

    try {
      await updateVehicle.mutateAsync({
        id: selectedVehicle.id,
        ...data,
      });
      toast({
        title: t("common.success"),
        description: t("vehicles.updateSuccess"),
      });
      setIsEditOpen(false);
      setSelectedVehicle(null);
    } catch {
      toast({
        title: t("common.error"),
        description: t("errors.generic"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;

    try {
      await deleteVehicle.mutateAsync(selectedVehicle.id);
      toast({
        title: t("common.success"),
        description: t("vehicles.deleteSuccess"),
      });
      setIsDeleteOpen(false);
      setSelectedVehicle(null);
    } catch {
      toast({
        title: t("common.error"),
        description: t("errors.generic"),
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-600 bg-green-50";
      case "INACTIVE":
        return "text-red-600 bg-red-50";
      case "MAINTENANCE":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-destructive">{t("errors.generic")}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("vehicles.title")}
            </h1>
            <p className="text-muted-foreground">{t("dashboard.overview")}</p>
          </div>
          <div className="flex gap-2">
            {data && data.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => exportToCSV(data, "vehicles-export")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  {t("common.exportCSV")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportToPDF(data, "vehicles-export")}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  {t("common.exportPDF")}
                </Button>
              </>
            )}
            {canCreate && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("vehicles.addVehicle")}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("vehicles.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">{t("common.loading")}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("vehicles.model")}</TableHead>
                    <TableHead>{t("vehicles.fuelType")}</TableHead>
                    <TableHead>{t("vehicles.plate")}</TableHead>
                    <TableHead>{t("vehicles.statusLabel")}</TableHead>
                    <TableHead>{t("vehicles.driver")}</TableHead>
                    <TableHead>{t("vehicles.lastMaintenance")}</TableHead>
                    {(canEdit || canDelete) && (
                      <TableHead>{t("common.edit")}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data && data.length > 0 ? (
                    data.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          {vehicle.name}
                        </TableCell>
                        <TableCell>{vehicle.type}</TableCell>
                        <TableCell>{vehicle.licensePlate}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              vehicle.status
                            )}`}
                          >
                            {vehicle.status}
                          </span>
                        </TableCell>
                        <TableCell>{vehicle.driverName || "-"}</TableCell>
                        <TableCell>
                          {vehicle.lastMaintenance
                            ? formatDate(vehicle.lastMaintenance)
                            : "-"}
                        </TableCell>
                        {(canEdit || canDelete) && (
                          <TableCell>
                            <div className="flex gap-2">
                              {canEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedVehicle(vehicle);
                                    setIsDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        {t("vehicles.noVehicles")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("vehicles.addVehicle")}</DialogTitle>
            <DialogDescription>
              {t("vehicles.vehicleDetails")}
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            onSubmit={handleCreate}
            isLoading={createVehicle.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("vehicles.editVehicle")}</DialogTitle>
            <DialogDescription>
              {t("vehicles.vehicleDetails")}
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <VehicleForm
              vehicle={selectedVehicle}
              onSubmit={handleEdit}
              isLoading={updateVehicle.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("vehicles.deleteVehicle")}</DialogTitle>
            <DialogDescription>{t("vehicles.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteVehicle.isPending}
            >
              {deleteVehicle.isPending
                ? t("common.loading")
                : t("common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

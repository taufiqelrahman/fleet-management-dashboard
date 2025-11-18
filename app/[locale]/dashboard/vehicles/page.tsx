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
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";
import type { VehicleInput } from "@/lib/validation";

export default function VehiclesPage() {
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
        title: "Success",
        description: "Vehicle created successfully",
      });
      setIsCreateOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create vehicle",
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
        title: "Success",
        description: "Vehicle updated successfully",
      });
      setIsEditOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicle) return;

    try {
      await deleteVehicle.mutateAsync(selectedVehicle.id);
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
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
        <div className="text-destructive">Failed to load vehicles</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
            <p className="text-muted-foreground">Manage your fleet vehicles</p>
          </div>
          {canCreate && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    {(canEdit || canDelete) && <TableHead>Actions</TableHead>}
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
                        No vehicles found
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
            <DialogTitle>Create Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle to your fleet
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
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>Update vehicle information</DialogDescription>
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
            <DialogTitle>Delete Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedVehicle?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteVehicle.isPending}
            >
              {deleteVehicle.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

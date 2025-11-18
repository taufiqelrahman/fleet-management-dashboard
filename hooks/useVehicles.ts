"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/actions/vehicles";
import type { Vehicle } from "@/lib/types";
import type { VehicleInput } from "@/lib/validation";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const result = await getVehicles();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch vehicles");
      }
      return result.data;
    },
    staleTime: 30000,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const result = await getVehicleById(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch vehicle");
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VehicleInput) => {
      const result = await createVehicle(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create vehicle");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Vehicle> & { id: string }) => {
      const { id, ...updates } = data;
      const result = await updateVehicle(id, updates);
      if (!result.success) {
        throw new Error(result.message || "Failed to update vehicle");
      }
      return result.data;
    },
    onMutate: async (updatedVehicle) => {
      await queryClient.cancelQueries({ queryKey: ["vehicles"] });

      const previousVehicles = queryClient.getQueryData(["vehicles"]);

      queryClient.setQueryData(["vehicles"], (old: Vehicle[] | undefined) => {
        if (!old) return old;
        return old.map((v: Vehicle) =>
          v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v
        );
      });

      return { previousVehicles };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousVehicles) {
        queryClient.setQueryData(["vehicles"], context.previousVehicles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteVehicle(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete vehicle");
      }
      return result;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["vehicles"] });

      const previousVehicles = queryClient.getQueryData(["vehicles"]);

      queryClient.setQueryData(["vehicles"], (old: Vehicle[] | undefined) => {
        if (!old) return old;
        return old.filter((v: Vehicle) => v.id !== deletedId);
      });

      return { previousVehicles };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousVehicles) {
        queryClient.setQueryData(["vehicles"], context.previousVehicles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

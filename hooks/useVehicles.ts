"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Vehicle, VehicleWithTrips, ApiResponse } from "@/lib/types";
import type { VehicleInput } from "@/lib/validation";

export function useVehicles() {
  return useQuery<ApiResponse<Vehicle[]>>({
    queryKey: ["vehicles"],
    queryFn: () => apiClient.get("/api/vehicles"),
    staleTime: 30000,
  });
}

export function useVehicle(id: string) {
  return useQuery<ApiResponse<VehicleWithTrips>>({
    queryKey: ["vehicle", id],
    queryFn: () => apiClient.get(`/api/vehicles/${id}`),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VehicleInput) =>
      apiClient.post<ApiResponse<Vehicle>>("/api/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Vehicle> & { id: string }) =>
      apiClient.put<ApiResponse<Vehicle>>("/api/vehicles", data),
    onMutate: async (updatedVehicle) => {
      await queryClient.cancelQueries({ queryKey: ["vehicles"] });

      const previousVehicles = queryClient.getQueryData(["vehicles"]);

      queryClient.setQueryData(["vehicles"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((v: Vehicle) =>
            v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v
          ),
        };
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
    mutationFn: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/vehicles?id=${id}`),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["vehicles"] });

      const previousVehicles = queryClient.getQueryData(["vehicles"]);

      queryClient.setQueryData(["vehicles"], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((v: Vehicle) => v.id !== deletedId),
        };
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

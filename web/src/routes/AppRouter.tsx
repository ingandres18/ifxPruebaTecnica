import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { LoginPage } from "@/features/auth/LoginPage"
import { DashboardPage } from "@/features/dashboard/DashboardPage"
import { VmFormPage } from "@/features/vms/VmFormPage"
import { VmsPage } from "@/features/vms/VmsPage"
import { AdminRoute } from "./AdminRoute"
import { ProtectedRoute } from "./ProtectedRoute"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vms" element={<VmsPage />} />

          {/* Rutas de escritura: protegidas por rol (el formulario se rellena en el Slice 4). */}
          <Route element={<AdminRoute />}>
            <Route path="/vms/new" element={<VmFormPage mode="create" />} />
            <Route path="/vms/:id/edit" element={<VmFormPage mode="edit" />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

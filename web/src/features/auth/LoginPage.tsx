import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/apiClient"
import { usePageTitle } from "@/lib/usePageTitle"

import { loginSchema, type LoginValues } from "./loginSchema"
import { useLogin, useSession } from "./useSession"

export function LoginPage() {
  const { isAuthenticated, isLoading } = useSession()
  const loginMutation = useLogin()
  const navigate = useNavigate()
  usePageTitle("Iniciar sesión")

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  })

  // Si ya hay sesión, no mostramos el login (SPEC §6).
  if (!isLoading && isAuthenticated) return <Navigate to="/" replace />

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values, {
      onSuccess: () => navigate("/", { replace: true }),
      onError: (error) => {
        const message =
          error instanceof ApiError && error.status === 401
            ? "Credenciales inválidas"
            : "No se pudo iniciar sesión. Intenta de nuevo."
        toast.error(message)
      },
    })
  })

  const { errors, isValid } = form.formState

  return (
    <div className="bg-brand-glow relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="mb-8 flex flex-col items-center gap-4">
        <Brand showText={false} className="scale-125" />
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión en tu plataforma de gestión de VMs
          </p>
        </div>
      </div>

      <Card className="w-full max-w-sm border-border/70 shadow-xl shadow-primary/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="tu@correo.com"
                aria-invalid={!!errors.email}
                {...form.register("email")}
              />
              {errors.email && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...form.register("password")}
              />
              {errors.password && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isValid || loginMutation.isPending}
              className="mt-2 shadow-sm shadow-primary/25"
            >
              {loginMutation.isPending && <Loader2 className="animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Cuentas de prueba</p>
            <div className="flex flex-col gap-0.5 font-mono">
              <span>admin@ifx.com · Admin123!</span>
              <span>cliente@ifx.com · Cliente123!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-muted-foreground">Prueba técnica IFX · {new Date().getFullYear()}</p>
    </div>
  )
}

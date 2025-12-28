import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { AdminLoginForm } from "@/components/forms/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-serif text-2xl">
            Admin belépés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}

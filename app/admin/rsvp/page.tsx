"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Download, Trash2, Users, Car, Home } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { RsvpSubmission } from "@/types/content";

export default function RsvpListPage() {
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/rsvp");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch RSVPs:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Biztosan törölni szeretnéd?")) return;
    
    try {
      await fetch(`/api/rsvp/${id}`, { method: "DELETE" });
      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Név",
      "További vendégek",
      "Telefon",
      "Szállás",
      "Szállítás",
      "Segítség",
      "Megjegyzés",
      "Dátum",
    ];
    
    const rows = submissions.map((s) => [
      s.guestName,
      s.additionalGuests.join("; "),
      s.phone || "",
      s.needsAccommodation ? "Igen" : "Nem",
      s.needsTransport ? "Igen" : "Nem",
      s.volunteerOptions.join("; "),
      s.comments || "",
      formatDateTime(s.createdAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvp-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Calculate stats
  const totalGuests = submissions.reduce(
    (acc, s) => acc + 1 + s.additionalGuests.length,
    0
  );
  const needsAccommodation = submissions.filter((s) => s.needsAccommodation).length;
  const needsTransport = submissions.filter((s) => s.needsTransport).length;

  if (loading) {
    return <div className="p-8">Betöltés...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-900">Visszajelzések</h1>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportálás CSV-be
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Összes vendég</p>
              <p className="text-xl font-semibold">{totalGuests}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Szállás kell</p>
              <p className="text-xl font-semibold">{needsAccommodation}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Car className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Szállítás kell</p>
              <p className="text-xl font-semibold">{needsTransport}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Visszajelzések</p>
              <p className="text-xl font-semibold">{submissions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Még nincs visszajelzés.
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Név
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  További vendégek
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Igények
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Dátum
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{submission.guestName}</div>
                    {submission.phone && (
                      <div className="text-sm text-gray-500">{submission.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {submission.additionalGuests.length > 0 ? (
                      <ul className="text-sm">
                        {submission.additionalGuests.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {submission.needsAccommodation && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          <Home className="h-3 w-3 mr-1" />
                          Szállás
                        </span>
                      )}
                      {submission.needsTransport && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          <Car className="h-3 w-3 mr-1" />
                          Szállítás
                        </span>
                      )}
                    </div>
                    {submission.volunteerOptions.length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        Segít: {submission.volunteerOptions.join(", ")}
                      </div>
                    )}
                    {submission.comments && (
                      <div className="mt-1 text-xs text-gray-500 italic">
                        &quot;{submission.comments}&quot;
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDateTime(submission.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSubmission(submission.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

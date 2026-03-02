"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Download, Trash2, Users, Car, Home } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { RsvpSubmission } from "@/types/content";

export default function RsvpListPage() {
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/rsvp");
      if (!res.ok) {
        throw new Error("Failed to fetch RSVPs");
      }
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
      const response = await fetch(`/api/rsvp/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete RSVP");
      }
      setSubmissions((current) => current.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const updateResolution = async (
    id: string,
    field: "accommodationResolved" | "transportResolved",
    value: boolean
  ) => {
    setUpdatingKey(`${id}:${field}`);
    try {
      const response = await fetch(`/api/rsvp/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update resolution status");
      }

      const updated = (await response.json()) as RsvpSubmission;
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id ? updated : submission
        )
      );
    } catch (error) {
      console.error("Failed to update resolution status:", error);
    } finally {
      setUpdatingKey(null);
    }
  };

  const escapeCsvValue = (value: string) => `"${value.replace(/\"/g, "\"\"")}"`;

  const exportToCSV = () => {
    const headers = [
      "Név",
      "További vendégek",
      "Telefon",
      "Szállás",
      "Szállás megoldva",
      "Szállítás",
      "Szállítás megoldva",
      "Segítség",
      "Megjegyzés",
      "Dátum",
    ];

    const rows = submissions.map((s) => [
      s.guestName,
      s.additionalGuests.join("; "),
      s.phone || "",
      s.needsAccommodation ? "Igen" : "Nem",
      s.accommodationResolved ? "Igen" : "Nem",
      s.needsTransport ? "Igen" : "Nem",
      s.transportResolved ? "Igen" : "Nem",
      s.volunteerOptions.join("; "),
      s.comments || "",
      formatDateTime(s.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `rsvp-${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const totalGuests = submissions.reduce(
    (acc, s) => acc + 1 + s.additionalGuests.length,
    0
  );
  const needsAccommodationPending = submissions.filter(
    (s) => s.needsAccommodation && !s.accommodationResolved
  ).length;
  const needsTransportPending = submissions.filter(
    (s) => s.needsTransport && !s.transportResolved
  ).length;

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
              <p className="text-sm text-gray-500">Szállás függőben</p>
              <p className="text-xl font-semibold">{needsAccommodationPending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Car className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Szállítás függőben</p>
              <p className="text-xl font-semibold">{needsTransportPending}</p>
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
                        {submission.additionalGuests.map((guest, index) => (
                          <li key={index}>{guest}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
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
                    <div className="mt-2 flex flex-col gap-2">
                      {submission.needsAccommodation && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              submission.accommodationResolved
                                ? "inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700"
                                : "inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700"
                            }
                          >
                            {submission.accommodationResolved
                              ? "Szállás megoldva"
                              : "Szállás függőben"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              submission.accommodationResolved ||
                              updatingKey ===
                                `${submission.id}:accommodationResolved`
                            }
                            onClick={() =>
                              updateResolution(
                                submission.id,
                                "accommodationResolved",
                                true
                              )
                            }
                          >
                            Szállás megoldása
                          </Button>
                        </div>
                      )}
                      {submission.needsTransport && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              submission.transportResolved
                                ? "inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700"
                                : "inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700"
                            }
                          >
                            {submission.transportResolved
                              ? "Szállítás megoldva"
                              : "Szállítás függőben"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              submission.transportResolved ||
                              updatingKey === `${submission.id}:transportResolved`
                            }
                            onClick={() =>
                              updateResolution(
                                submission.id,
                                "transportResolved",
                                true
                              )
                            }
                          >
                            Szállítás megoldása
                          </Button>
                        </div>
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

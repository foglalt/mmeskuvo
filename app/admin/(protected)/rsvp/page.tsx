"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button, Textarea } from "@/components/ui";
import { Download, Trash2, Users, Car, Home, Heart } from "lucide-react";
import type { RsvpSubmission } from "@/types/content";

const MAX_ADMIN_COMMENT_LENGTH = 2000;

const formatHungarianMonthDay = (date: Date | string) => {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat("hu-HU", {
    month: "long",
    day: "numeric",
  }).formatToParts(parsed);
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${month} ${day}`.trim();
};

const getRequestSummary = (submission: RsvpSubmission) => {
  const requested: string[] = [];
  if (submission.needsAccommodation) {
    requested.push(
      submission.accommodationResolved ? "Szállás (megoldva)" : "Szállás"
    );
  }
  if (submission.needsTransport) {
    requested.push(
      submission.transportResolved ? "Szállítás (megoldva)" : "Szállítás"
    );
  }
  if (submission.volunteerOptions.length > 0) {
    requested.push(
      submission.volunteerResolved ? "Segítség (megoldva)" : "Segítség"
    );
  }
  return requested.length > 0 ? requested.join("; ") : "-";
};

export default function RsvpListPage() {
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [adminCommentDrafts, setAdminCommentDrafts] = useState<
    Record<string, string>
  >({});

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
        const loadedSubmissions = data as RsvpSubmission[];
        setSubmissions(loadedSubmissions);
        setAdminCommentDrafts(
          Object.fromEntries(
            loadedSubmissions.map((submission) => [
              submission.id,
              submission.adminComment ?? "",
            ])
          )
        );
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
    field:
      | "accommodationResolved"
      | "transportResolved"
      | "volunteerResolved",
    value: boolean
  ) => {
    setUpdatingKey(`${id}:${field}`);
    try {
      const response = await fetch(`/api/rsvp/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorPayload?.error || "Failed to update resolution status");
      }

      const updated = (await response.json()) as RsvpSubmission;
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id ? updated : submission
        )
      );
      setAdminCommentDrafts((current) => ({
        ...current,
        [id]: updated.adminComment ?? "",
      }));
    } catch (error) {
      console.error("Failed to update resolution status:", error);
    } finally {
      setUpdatingKey(null);
    }
  };

  const updateAdminComment = async (id: string, adminComment: string) => {
    const normalizedComment = adminComment.slice(0, MAX_ADMIN_COMMENT_LENGTH);
    setUpdatingKey(`${id}:adminComment`);
    try {
      const response = await fetch(`/api/rsvp/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          adminComment: normalizedComment,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorPayload?.error || "Failed to update admin comment");
      }

      const updated = (await response.json()) as RsvpSubmission;
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id ? updated : submission
        )
      );
      setAdminCommentDrafts((current) => ({
        ...current,
        [id]: updated.adminComment ?? "",
      }));
    } catch (error) {
      console.error("Failed to update admin comment:", error);
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleAdminCommentBlur = (
    submission: RsvpSubmission,
    valueFromBlur: string
  ) => {
    const draft = valueFromBlur.slice(0, MAX_ADMIN_COMMENT_LENGTH);
    const saved = submission.adminComment ?? "";
    if (valueFromBlur !== draft) {
      setAdminCommentDrafts((current) => ({
        ...current,
        [submission.id]: draft,
      }));
    }
    if (draft === saved) return;
    void updateAdminComment(submission.id, draft);
  };

  const escapeCsvValue = (value: string) => `"${value.replace(/\"/g, "\"\"")}"`;

  const exportToCSV = () => {
    const headers = [
      "Nevek",
      "Telefon",
      "Igények",
      "Megjegyzés",
      "Admin megjegyzés",
      "Dátum",
    ];

    const rows = submissions.map((s) => [
      [s.guestName, ...s.additionalGuests].join("; "),
      s.phone || "",
      getRequestSummary(s),
      s.comments || "",
      s.adminComment || "",
      formatHungarianMonthDay(s.createdAt),
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
  const needsVolunteerPending = submissions.filter(
    (s) => s.volunteerOptions.length > 0 && !s.volunteerResolved
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Heart className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Segítség függőben</p>
              <p className="text-xl font-semibold">{needsVolunteerPending}</p>
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
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Nevek
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Telefon
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Igények
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Vendég megjegyzés
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Admin megjegyzés
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 whitespace-nowrap">
                  Dátum
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{submission.guestName}</div>
                    {submission.additionalGuests.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-sm text-gray-600">
                        {submission.additionalGuests.map((guest, index) => (
                          <li key={index}>{guest}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 break-words">
                    {submission.phone || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {submission.needsAccommodation && (
                        <label className="inline-flex items-center gap-2 text-sm">
                          <span
                            className={
                              submission.accommodationResolved
                                ? "inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700"
                                : "inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700"
                            }
                          >
                            <Home className="h-3 w-3 mr-1" />
                            Szállás
                          </span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed"
                            checked={submission.accommodationResolved}
                            disabled={
                              updatingKey ===
                                `${submission.id}:accommodationResolved`
                            }
                            onChange={(event) =>
                              updateResolution(
                                submission.id,
                                "accommodationResolved",
                                event.currentTarget.checked
                              )
                            }
                            aria-label="Szállás megoldva"
                          />
                        </label>
                      )}
                      {submission.needsTransport && (
                        <label className="inline-flex items-center gap-2 text-sm">
                          <span
                            className={
                              submission.transportResolved
                                ? "inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700"
                                : "inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700"
                            }
                          >
                            <Car className="h-3 w-3 mr-1" />
                            Szállítás
                          </span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed"
                            checked={submission.transportResolved}
                            disabled={
                              updatingKey === `${submission.id}:transportResolved`
                            }
                            onChange={(event) =>
                              updateResolution(
                                submission.id,
                                "transportResolved",
                                event.currentTarget.checked
                              )
                            }
                            aria-label="Szállítás megoldva"
                          />
                        </label>
                      )}
                      {submission.volunteerOptions.length > 0 && (
                        <label className="inline-flex items-center gap-2 text-sm">
                          <span
                            className={
                              submission.volunteerResolved
                                ? "inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700"
                                : "inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700"
                            }
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Segítség
                          </span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed"
                            checked={submission.volunteerResolved}
                            disabled={
                              updatingKey === `${submission.id}:volunteerResolved`
                            }
                            onChange={(event) =>
                              updateResolution(
                                submission.id,
                                "volunteerResolved",
                                event.currentTarget.checked
                              )
                            }
                            aria-label="Segítség megoldva"
                          />
                        </label>
                      )}
                      {!submission.needsAccommodation &&
                        !submission.needsTransport &&
                        submission.volunteerOptions.length === 0 && (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 break-words">
                    {submission.comments?.trim() || (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      value={adminCommentDrafts[submission.id] ?? ""}
                      onChange={(event) =>
                        setAdminCommentDrafts((current) => ({
                          ...current,
                          [submission.id]: event.target.value,
                        }))
                      }
                      onBlur={(event) =>
                        handleAdminCommentBlur(submission, event.currentTarget.value)
                      }
                      placeholder="Admin megjegyzés..."
                      rows={2}
                      className="min-h-0 text-xs py-1.5"
                      maxLength={MAX_ADMIN_COMMENT_LENGTH}
                      disabled={updatingKey === `${submission.id}:adminComment`}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatHungarianMonthDay(submission.createdAt)}
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

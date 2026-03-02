"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check, Sparkles, Pencil } from "lucide-react";
import { Button, Input, Textarea, Checkbox } from "@/components/ui";

const RSVP_STORAGE_KEY = "wedding-rsvp-submission";

interface StoredRsvpSubmission {
  id: string;
  guestName: string;
  additionalGuests: string[];
  phone?: string;
  needsAccommodation: boolean;
  needsTransport: boolean;
  volunteerOptions: string[];
  comments?: string;
  language: "hu" | "en";
}

interface RsvpFormProps {
  volunteerOptions: string[];
  language: "hu" | "en";
  translations: {
    nameLabel: string;
    namePlaceholder: string;
    addGuest: string;
    phoneLabel: string;
    phonePlaceholder: string;
    accommodation: string;
    transport: string;
    commentsLabel: string;
    commentsPlaceholder: string;
    submit: string;
    success: string;
    error: string;
    alreadySubmittedTitle: string;
    alreadySubmittedDescription: string;
    modify: string;
    summaryName: string;
    summaryAdditionalGuests: string;
    summaryPhone: string;
    summaryAccommodation: string;
    summaryTransport: string;
    summaryVolunteer: string;
    summaryComments: string;
    summaryYes: string;
    summaryNo: string;
    summaryNone: string;
  };
}

const isStoredRsvpSubmission = (
  value: unknown
): value is StoredRsvpSubmission => {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<StoredRsvpSubmission>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.guestName === "string" &&
    Array.isArray(candidate.additionalGuests) &&
    typeof candidate.needsAccommodation === "boolean" &&
    typeof candidate.needsTransport === "boolean" &&
    Array.isArray(candidate.volunteerOptions) &&
    (candidate.language === "hu" || candidate.language === "en")
  );
};

export function RsvpForm({ volunteerOptions, language, translations }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [storedSubmission, setStoredSubmission] = useState<StoredRsvpSubmission | null>(null);
  const [isEditingStoredSubmission, setIsEditingStoredSubmission] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [additionalGuests, setAdditionalGuests] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [needsAccommodation, setNeedsAccommodation] = useState(false);
  const [needsTransport, setNeedsTransport] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string[]>([]);
  const [comments, setComments] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RSVP_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (isStoredRsvpSubmission(parsed)) {
        setStoredSubmission(parsed);
      }
    } catch {
      window.localStorage.removeItem(RSVP_STORAGE_KEY);
    }
  }, []);

  const populateFormFromStoredSubmission = (submission: StoredRsvpSubmission) => {
    setGuestName(submission.guestName);
    setAdditionalGuests(submission.additionalGuests);
    setPhone(submission.phone ?? "");
    setNeedsAccommodation(submission.needsAccommodation);
    setNeedsTransport(submission.needsTransport);
    setSelectedVolunteer(submission.volunteerOptions);
    setComments(submission.comments ?? "");
  };

  const saveSubmissionLocally = (submission: StoredRsvpSubmission) => {
    setStoredSubmission(submission);
    window.localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(submission));
  };

  const addGuest = () => {
    setAdditionalGuests([...additionalGuests, ""]);
  };

  const removeGuest = (index: number) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, value: string) => {
    const updated = [...additionalGuests];
    updated[index] = value;
    setAdditionalGuests(updated);
  };

  const toggleVolunteer = (option: string) => {
    if (selectedVolunteer.includes(option)) {
      setSelectedVolunteer(selectedVolunteer.filter((v) => v !== option));
    } else {
      setSelectedVolunteer([...selectedVolunteer, option]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const trimmedName = guestName.trim();
    const trimmedPhone = phone.trim();
    const trimmedComments = comments.trim();

    const payload: {
      guestName: string;
      additionalGuests: string[];
      needsAccommodation: boolean;
      needsTransport: boolean;
      volunteerOptions: string[];
      language: "hu" | "en";
      phone?: string;
      comments?: string;
    } = {
      guestName: trimmedName,
      additionalGuests: additionalGuests.filter((g) => g.trim() !== ""),
      needsAccommodation,
      needsTransport,
      volunteerOptions: selectedVolunteer,
      language,
    };

    if (trimmedPhone) {
      payload.phone = trimmedPhone;
    }
    if (trimmedComments) {
      payload.comments = trimmedComments;
    }

    try {
      const requestBody = storedSubmission?.id
        ? { id: storedSubmission.id, ...payload }
        : payload;
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to submit RSVP");
      }

      const responseData = await response.json();
      const savedSubmission: StoredRsvpSubmission = {
        id:
          typeof responseData?.id === "string"
            ? responseData.id
            : storedSubmission?.id ?? "",
        guestName: payload.guestName,
        additionalGuests: payload.additionalGuests,
        phone: payload.phone,
        needsAccommodation: payload.needsAccommodation,
        needsTransport: payload.needsTransport,
        volunteerOptions: payload.volunteerOptions,
        comments: payload.comments,
        language: payload.language,
      };

      saveSubmissionLocally(savedSubmission);
      setSubmitStatus("success");
      setIsEditingStoredSubmission(false);
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModify = () => {
    if (!storedSubmission) return;
    populateFormFromStoredSubmission(storedSubmission);
    setIsEditingStoredSubmission(true);
    setSubmitStatus("idle");
  };

  const showForm = !storedSubmission || isEditingStoredSubmission;
  const summaryAdditionalGuests =
    storedSubmission && storedSubmission.additionalGuests.length > 0
      ? storedSubmission.additionalGuests.join(", ")
      : translations.summaryNone;
  const summaryVolunteerOptions =
    storedSubmission && storedSubmission.volunteerOptions.length > 0
      ? storedSubmission.volunteerOptions.join(", ")
      : translations.summaryNone;

  if (!showForm && storedSubmission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/30 bg-gradient-to-br from-emerald-50 via-white to-secondary/60 p-6 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Sparkles className="h-5 w-5" />
              {translations.alreadySubmittedTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {translations.alreadySubmittedDescription}
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {translations.success}
          </span>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-gray-500">{translations.summaryName}</p>
            <p className="font-medium text-gray-900">{storedSubmission.guestName}</p>
          </div>
          <div>
            <p className="text-gray-500">{translations.summaryPhone}</p>
            <p className="font-medium text-gray-900">
              {storedSubmission.phone?.trim() || translations.summaryNone}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">{translations.summaryAdditionalGuests}</p>
            <p className="font-medium text-gray-900">{summaryAdditionalGuests}</p>
          </div>
          <div>
            <p className="text-gray-500">{translations.summaryAccommodation}</p>
            <p className="font-medium text-gray-900">
              {storedSubmission.needsAccommodation
                ? translations.summaryYes
                : translations.summaryNo}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{translations.summaryTransport}</p>
            <p className="font-medium text-gray-900">
              {storedSubmission.needsTransport
                ? translations.summaryYes
                : translations.summaryNo}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">{translations.summaryVolunteer}</p>
            <p className="font-medium text-gray-900">{summaryVolunteerOptions}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">{translations.summaryComments}</p>
            <p className="font-medium text-gray-900">
              {storedSubmission.comments?.trim() || translations.summaryNone}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button type="button" variant="outline" onClick={handleModify}>
            <Pencil className="mr-2 h-4 w-4" />
            {translations.modify}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label={translations.nameLabel}
        placeholder={translations.namePlaceholder}
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        required
      />

      <div className="space-y-3">
        <AnimatePresence>
          {additionalGuests.map((guest, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <Input
                placeholder={`${translations.namePlaceholder} ${index + 2}`}
                value={guest}
                onChange={(e) => updateGuest(index, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGuest(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addGuest}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {translations.addGuest}
        </Button>
      </div>

      <Input
        label={translations.phoneLabel}
        type="tel"
        placeholder={translations.phonePlaceholder}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className="space-y-3">
        <Checkbox
          label={translations.accommodation}
          checked={needsAccommodation}
          onChange={(e) => setNeedsAccommodation(e.target.checked)}
        />
        <Checkbox
          label={translations.transport}
          checked={needsTransport}
          onChange={(e) => setNeedsTransport(e.target.checked)}
        />
      </div>

      {volunteerOptions.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            {volunteerOptions.map((option) => (
              <Checkbox
                key={option}
                label={option}
                checked={selectedVolunteer.includes(option)}
                onChange={() => toggleVolunteer(option)}
              />
            ))}
          </div>
        </div>
      )}

      <Textarea
        label={translations.commentsLabel}
        placeholder={translations.commentsPlaceholder}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows={4}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
        disabled={!guestName.trim()}
      >
        {translations.submit}
      </Button>

      <AnimatePresence>
        {submitStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg"
          >
            <Check className="h-5 w-5" />
            {translations.success}
          </motion.div>
        )}
        {submitStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg"
          >
            <X className="h-5 w-5" />
            {translations.error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

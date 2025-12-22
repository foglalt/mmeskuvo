"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Check } from "lucide-react";
import { Button, Input, Textarea, Checkbox } from "@/components/ui";

interface RsvpFormProps {
  volunteerOptions: string[];
  translations: {
    namePlaceholder: string;
    addGuest: string;
    phonePlaceholder: string;
    accommodation: string;
    transport: string;
    volunteerTitle: string;
    comments: string;
    submit: string;
    success: string;
    error: string;
  };
}

export function RsvpForm({ volunteerOptions, translations }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  
  // Form state
  const [guestName, setGuestName] = useState("");
  const [additionalGuests, setAdditionalGuests] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [needsAccommodation, setNeedsAccommodation] = useState(false);
  const [needsTransport, setNeedsTransport] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string[]>([]);
  const [comments, setComments] = useState("");

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

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          additionalGuests: additionalGuests.filter((g) => g.trim() !== ""),
          phone: phone || undefined,
          needsAccommodation,
          needsTransport,
          volunteerOptions: selectedVolunteer,
          comments: comments || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit RSVP");
      }

      setSubmitStatus("success");
      // Reset form
      setGuestName("");
      setAdditionalGuests([]);
      setPhone("");
      setNeedsAccommodation(false);
      setNeedsTransport(false);
      setSelectedVolunteer([]);
      setComments("");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guest name */}
      <Input
        label="Név / Name"
        placeholder={translations.namePlaceholder}
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        required
      />

      {/* Additional guests */}
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

      {/* Phone */}
      <Input
        label="Telefonszám / Phone (opcionális)"
        type="tel"
        placeholder={translations.phonePlaceholder}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Needs */}
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

      {/* Volunteer options */}
      {volunteerOptions.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {translations.volunteerTitle}
          </label>
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

      {/* Comments */}
      <Textarea
        label="Megjegyzés / Comments"
        placeholder={translations.comments}
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows={4}
      />

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
        disabled={!guestName.trim()}
      >
        {translations.submit}
      </Button>

      {/* Status messages */}
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

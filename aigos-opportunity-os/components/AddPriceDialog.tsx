"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { PriceStatus, ServiceType } from "@/lib/types";
import { SERVICE_LABELS, PRICE_STATUS_LABELS } from "@/lib/labels";
import { Modal, Field } from "./Modal";

const SERVICE_TYPES: ServiceType[] = [
  "Personal Consulting",
  "AI Workshop",
  "Keynote Lecture",
  "Team Training",
  "Creative Direction",
  "AI Content Strategy",
  "Monthly Retainer",
  "Custom Project",
  "Other",
];

const PRICE_STATUSES: PriceStatus[] = [
  "Proposed",
  "Accepted",
  "Rejected",
  "Negotiating",
  "Unknown",
];

interface AddPriceDialogProps {
  open: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  company?: string;
  defaultService?: string;
}

/** Records a price into Price Memory so the system stops guessing. */
export function AddPriceDialog({
  open,
  onClose,
  contactId,
  contactName,
  company,
  defaultService,
}: AddPriceDialogProps) {
  const { addPriceRecord, settings } = useStore();
  const [service, setService] = useState<string>(
    defaultService || "Personal Consulting",
  );
  const [proposed, setProposed] = useState("");
  const [charged, setCharged] = useState("");
  const [status, setStatus] = useState<PriceStatus>("Proposed");
  const [context, setContext] = useState("");

  const canSave = proposed.trim() !== "" || charged.trim() !== "";

  const save = () => {
    if (!canSave) return;
    addPriceRecord({
      contactId,
      contactName,
      company,
      serviceType: service,
      priceProposed: proposed ? Number(proposed) : undefined,
      priceCharged: charged ? Number(charged) : undefined,
      status,
      context: context.trim() || undefined,
    });
    setProposed("");
    setCharged("");
    setContext("");
    setStatus("Proposed");
    onClose();
  };

  return (
    <Modal
      open={open}
      title="רשומת מחיר חדשה"
      subtitle={`${contactName}${company ? ` · ${company}` : ""}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-soft">
            ביטול
          </button>
          <button onClick={save} disabled={!canSave} className="btn-primary">
            שמירה בזיכרון
          </button>
        </>
      }
    >
      <Field label="סוג שירות">
        <select
          className="input"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          {SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>
              {SERVICE_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={`מחיר שהוצע (${settings.defaultCurrency})`}>
          <input
            type="number"
            className="input"
            value={proposed}
            onChange={(e) => setProposed(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label={`מחיר שנגבה (${settings.defaultCurrency})`}>
          <input
            type="number"
            className="input"
            value={charged}
            onChange={(e) => setCharged(e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="סטטוס">
        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value as PriceStatus)}
        >
          {PRICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PRICE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="הקשר (לא חובה)">
        <input
          className="input"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="לדוגמה: סדנה לצוות של 10 אנשים"
        />
      </Field>
    </Modal>
  );
}

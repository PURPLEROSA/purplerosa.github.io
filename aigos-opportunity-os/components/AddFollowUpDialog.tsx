"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { addDays, toISODate } from "@/lib/dateUtils";
import { Modal, Field } from "./Modal";

interface AddFollowUpDialogProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill for an existing contact. */
  contactId?: string;
  contactName?: string;
  email?: string;
  opportunityId?: string;
}

/**
 * Manual follow-up creator.
 * Example: "Dana said: talk to me next month about AI video updates".
 * Creates (or reuses) a contact and a follow-up with a suggested draft.
 */
export function AddFollowUpDialog({
  open,
  onClose,
  contactId,
  contactName,
  email,
  opportunityId,
}: AddFollowUpDialogProps) {
  const { addFollowUp, settings } = useStore();
  const [name, setName] = useState(contactName ?? "");
  const [note, setNote] = useState("");
  const [topic, setTopic] = useState("");
  const [due, setDue] = useState(
    toISODate(addDays(new Date(), settings.defaultFollowUpDays)),
  );

  const lockedContact = Boolean(contactId);
  const canSave = name.trim().length > 1 && note.trim().length > 2 && due;

  const reset = () => {
    if (!lockedContact) setName("");
    setNote("");
    setTopic("");
    setDue(toISODate(addDays(new Date(), settings.defaultFollowUpDays)));
  };

  const save = () => {
    if (!canSave) return;
    addFollowUp({
      contactId,
      contactName: name,
      email,
      note: note.trim(),
      dueDate: due,
      suggestedTopic: topic.trim() || undefined,
      opportunityId,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="הוספת פולואפ"
      subtitle="כתבי במילים שלך מה צריך לזכור. אני אדאג שזה לא ייפול."
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn-soft">
            ביטול
          </button>
          <button onClick={save} disabled={!canSave} className="btn-primary">
            שמירת פולואפ
          </button>
        </>
      }
    >
      <Field label="שם איש/אשת הקשר">
        <input
          className="input"
          value={name}
          disabled={lockedContact}
          onChange={(e) => setName(e.target.value)}
          placeholder="לדוגמה: דנה לוי"
        />
      </Field>

      <Field
        label="מה צריך לזכור?"
        hint="לדוגמה: דנה ביקשה שנדבר עוד חודש על חידושים בוידאו AI."
      >
        <textarea
          className="input min-h-[80px] resize-y"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="במילים שלך…"
        />
      </Field>

      <Field label="נושא לשיחה (לא חובה)">
        <input
          className="input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="לדוגמה: וידאו AI"
        />
      </Field>

      <Field label="מתי לחזור?">
        <input
          type="date"
          className="input"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
      </Field>
    </Modal>
  );
}

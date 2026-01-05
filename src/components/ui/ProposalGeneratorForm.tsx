"use client";

import { useMemo, useState, type FormEvent } from "react";

type ProposalResponse =
  | { ok: true; requestId: string; message: string; proposalUrl?: string }
  | { ok: false; error: string };

function safe(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

const inputClass =
  "mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-black outline-none focus:border-zinc-500";

export function ProposalGeneratorForm() {
  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    businessName: "",
    serviceArea: "",
    industry: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      safe(form.ownerName).length > 1 &&
      safe(form.businessName).length > 1 &&
      safe(form.email).includes("@") &&
      safe(form.serviceArea).length > 1
    );
  }, [form]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLastError(null);
    setSuccessMsg(null);

    if (!canSubmit) {
      setLastError("Please fill the required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ MUST match your route: src/app/api/waitlist/proposals/create/route.ts
      const res = await fetch("/api/waitlist/proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "proposal_page_form" }),
      });

      const data = (await res.json()) as ProposalResponse;

      if (!data.ok) {
        setLastError(data.error || "Something went wrong.");
        return;
      }

      setSuccessMsg(
        data.message || "Request received — check your inbox shortly."
      );
    } catch {
      setLastError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-zinc-800">Name *</span>
        <input
          className={inputClass}
          value={form.ownerName}
          onChange={(e) => setForm((s) => ({ ...s, ownerName: e.target.value }))}
          placeholder="Name"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-800">Email *</span>
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          placeholder="Email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-800">
          Business name *
        </span>
        <input
          className={inputClass}
          value={form.businessName}
          onChange={(e) =>
            setForm((s) => ({ ...s, businessName: e.target.value }))
          }
          placeholder="Business name"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-800">
          Service area *
        </span>
        <input
          className={inputClass}
          value={form.serviceArea}
          onChange={(e) =>
            setForm((s) => ({ ...s, serviceArea: e.target.value }))
          }
          placeholder="e.g. Coogee, Sydney"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-800">Industry</span>
        <input
          className={inputClass}
          value={form.industry}
          onChange={(e) => setForm((s) => ({ ...s, industry: e.target.value }))}
          placeholder="e.g. Plumbing"
        />
      </label>

      {lastError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {lastError}
        </p>
      )}

      {successMsg && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-yellow-300 px-4 py-3 font-semibold text-black hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Generating…" : "Generate Design Proposal"}
      </button>
    </form>
  );
}

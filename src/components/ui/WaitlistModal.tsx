"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: "quote" | "prototype";
}

function safeText(v: unknown) {
    return typeof v === "string" ? v.trim() : "";
}

const QuoteModal = ({ isOpen, onClose, modalType }: QuoteModalProps) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        companySize: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastError, setLastError] = useState("");

    const canSubmit = useMemo(() => {
        return (
            safeText(formData.name).length > 0 &&
            safeText(formData.email).length > 0
        );
    }, [formData]);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        setLastError("");

        const payload = {
            name: safeText(formData.name),
            email: safeText(formData.email),
            role: safeText(formData.role),
            companySize: safeText(formData.companySize),
            message: safeText(formData.message),
            source: `waitlist-modal:${modalType}`,
        };

        if (!payload.name || !payload.email) {
            setLastError("Please enter your name and email.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data?.ok) {
                throw new Error(data?.error || "Submission failed");
            }

            // Success UX
            setFormData({
                name: "",
                email: "",
                role: "",
                companySize: "",
                message: "",
            });
            onClose();
            alert("Thank you — you're on the waitlist.");
        } catch (err) {
            console.error(err);
            setLastError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="mb-6 flex items-center gap-2">
                                <Image
                                    src="/images/aa.png"
                                    alt="Areculateir Logo"
                                    width={32}
                                    height={32}
                                />
                                <span className="text-sm text-zinc-400">ACLR77</span>
                            </div>

                            <h2 className="mb-2 text-2xl font-semibold text-white">
                                Join Waitlist
                            </h2>
                            <p className="mb-6 text-sm text-zinc-400">
                                Get a Free Prototype / MVP built by Areculateir℠.
                            </p>

                            <div className="space-y-4">
                                <input
                                    placeholder="Name *"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white"
                                />

                                <input
                                    type="email"
                                    placeholder="Email *"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full rounded-lg bg-zinc-800 px-4 py-3 text-white"
                                />

                                {lastError && (
                                    <div className="rounded bg-red-500/10 p-2 text-sm text-red-300">
                                        {lastError}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-3 font-semibold text-white disabled:opacity-50"
                                >
                                    {isSubmitting ? "Submitting…" : "Join Waitlist"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default QuoteModal;

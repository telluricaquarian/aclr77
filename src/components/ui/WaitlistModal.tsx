"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: "quote" | "prototype";
}

const QuoteModal = ({ isOpen, onClose, modalType }: QuoteModalProps) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        companySize: "",
        message: "",
    });

    const handleSubmit = () => {
        console.log("Form submitted:", formData);
        // Add your form submission logic here
        onClose();
    };

    const isQuote = modalType === "quote";
    const title = isQuote ? "Join Waitlist" : "Join Waitlist";
    const description = "Get a Free Prototype / Makeshift Build created by Areculateir℠";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                            className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Logo/Brand */}
                            <div className="mb-6 flex items-center gap-2">
                                <div className="text-2xl font-bold text-white">77</div>
                                <div className="text-sm text-zinc-400">ACLR77</div>
                            </div>

                            {/* Title & Description */}
                            <h2 className="mb-2 text-2xl font-semibold text-white">
                                {title}
                            </h2>
                            <p className="mb-6 text-sm text-zinc-400">{description}</p>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400"
                                    >
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400"
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/20"
                                >
                                    Join Waitlist
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
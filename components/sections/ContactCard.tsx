"use client";

import React, { useState } from "react";
import Button from "../UI/Button";

type FormStatus = "idle" | "submitting" | "success" | "error";

/**
 * A simple, reusable Contact Card component.
 * Focused on a clean, premium design with easy customization.
 */
export default function ContactCard() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<FormStatus>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        setErrorMessage("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong.");
            }

            setStatus("success");
            setName("");
            setEmail("");
            setMessage("");
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "Failed to send message.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full gap-4 p-2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Contact Me</h1>
            <span className="text-xs md:text-sm font-subtitle font-medium text-gray-400 tracking-[0.2em] uppercase mb-4">Have an idea or just want to say hi?</span>

            <div className="w-full max-w-lg p-8 rounded-3xl border border-white/10 bg-black/5 backdrop-blur-xl">
                <div className="flex flex-col gap-2 mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-title font-bold text-white">
                        Let&apos;s Get in Touch
                    </h2>
                </div>

                <div className="grid">
                    {/* Success Message */}
                    <div 
                        className={`col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 py-8 text-center transition-all duration-500 ease-out ${
                            status === "success" 
                                ? "opacity-100 translate-y-0" 
                                : "opacity-0 translate-y-8 pointer-events-none"
                        }`}
                    >
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                            <span className="text-3xl text-white">✓</span>
                        </div>
                        <p className="text-2xl font-title font-bold text-white">Message sent!</p>
                        <p className="text-base font-body text-gray-400 max-w-xs">
                            Thanks for reaching out. I&apos;ll get back to you soon.
                        </p>
                        <button
                            onClick={() => setStatus("idle")}
                            className="text-xs font-subtitle font-medium tracking-[0.15em] uppercase text-gray-400 hover:text-white transition-colors duration-300 mt-6 cursor-pointer border-b border-transparent hover:border-white/20 pb-1"
                        >
                            Send another message
                        </button>
                    </div>

                    {/* Form */}
                    <form 
                        className={`col-start-1 row-start-1 flex flex-col gap-8 transition-all duration-500 ease-out ${
                            status !== "success" 
                                ? "opacity-100 translate-y-0" 
                                : "opacity-0 -translate-y-8 pointer-events-none"
                        }`} 
                        onSubmit={handleSubmit}
                    >
                        {/* Name Field */}
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-text focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-gray-600"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-text focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-gray-600"
                            />
                        </div>

                        {/* Message Field */}
                        <div className="flex flex-col gap-4">
                            <textarea
                                rows={6}
                                placeholder="Your Message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-text focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-gray-600 resize-none"
                            />
                        </div>

                        {/* Error message */}
                        {status === "error" && (
                            <p className="text-sm font-body text-red-400 text-center -mt-4">
                                {errorMessage}
                            </p>
                        )}

                        <div className="flex justify-center mt-4">
                            <Button
                                variant="secondary"
                                className="py-4 px-12 text-sm transition-transform active:scale-95"
                                onClick={status === "submitting" ? undefined : undefined}
                            >
                                {status === "submitting" ? "Sending..." : "Submit"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
}

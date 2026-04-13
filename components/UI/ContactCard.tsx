"use client";

import React from "react";
import Button from "./Button";

/**
 * A simple, reusable Contact Card component.
 * Focused on a clean, premium design with easy customization.
 */
export default function ContactCard() {
    return (
        <div className="w-full max-w-lg p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex flex-col gap-2 mb-8 text-center">
                <h2 className="text-3xl md:text-4xl font-title font-bold text-white">
                    Let's Get in Touch
                </h2>
            </div>

            <form className="flex flex-col gap-8">
                {/* Name Field */}
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-text focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-gray-600"
                    />
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-text focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-gray-600"
                    />
                </div>

                {/* Message Field */}
                <div className="flex flex-col gap-4">
                    <textarea
                        rows={6}
                        placeholder="Your Message"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white font-text focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-gray-600 resize-none"
                    />
                </div>

                <div className="flex justify-center mt-4">
                    <Button variant="secondary" className="py-4 text-sm transition-transform active:scale-95">
                        Send Message
                    </Button>
                </div>
            </form>
        </div>
    );
}

"use client";

import React from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    url: string;
};

export default function Modal({ isOpen, onClose, url }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <div
                className="absolute inset-0 bg-black/50 cursor-pointer"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                className="absolute top-4 left-4 text-white hover:text-gray-300 text-4xl font-bold z-50"
                onClick={onClose}
            >
                &times;
            </button>

            {/* Iframe */}
            <iframe
                src={url}
                className="relative z-10 w-[90vw] h-[90vh] bg-white rounded-lg border-none"
                allowFullScreen
            />
        </div>
    );
}

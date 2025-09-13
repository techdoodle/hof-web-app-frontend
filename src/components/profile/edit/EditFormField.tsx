'use client';

import { ReactNode } from 'react';

interface EditFormFieldProps {
    label: string;
    value: string;
    onEdit: () => void;
    isEditing: boolean;
    renderEditForm: () => ReactNode;
}

export function EditFormField({
    label,
    value,
    onEdit,
    isEditing,
    renderEditForm
}: EditFormFieldProps) {
    return (
        <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50 transition-all duration-300 hover:border-gray-600/50 hover:bg-gray-800/40">
            {isEditing ? (
                <div className="animate-fade-in">
                    <h3 className="text-white font-semibold mb-4">{label}</h3>
                    {renderEditForm()}
                </div>
            ) : (
                <button
                    onClick={onEdit}
                    className="w-full text-left group hover:bg-gray-700/20 rounded-xl p-2 -m-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-semibold mb-1 transition-colors duration-200 group-hover:text-primary/90">{label}</h3>
                            <p className="text-gray-400 transition-colors duration-200 group-hover:text-gray-300">{value}</p>
                        </div>
                        <div className="text-gray-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                            <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </button>
            )}
        </div>
    );
}

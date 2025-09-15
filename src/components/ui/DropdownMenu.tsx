'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

export interface DropdownMenuItem {
    id: string;
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    disabled?: boolean;
}

interface DropdownMenuProps {
    trigger: ReactNode;
    items: DropdownMenuItem[];
    className?: string;
    menuClassName?: string;
}

export function DropdownMenu({
    trigger,
    items,
    className = '',
    menuClassName = ''
}: DropdownMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleTriggerClick = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = (item: DropdownMenuItem) => {
        if (!item.disabled) {
            item.onClick();
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger */}
            <button
                onClick={handleTriggerClick}
                className="flex items-center justify-center"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {trigger}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 ${menuClassName}`}
                >
                    <div className="py-1">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                disabled={item.disabled}
                                className={`
                  w-full px-4 py-2 text-left text-sm transition-colors
                  ${item.disabled
                                        ? 'text-gray-500 cursor-not-allowed'
                                        : 'text-white hover:bg-gray-800 active:bg-gray-700'
                                    }
                  flex items-center gap-3
                `}
                            >
                                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

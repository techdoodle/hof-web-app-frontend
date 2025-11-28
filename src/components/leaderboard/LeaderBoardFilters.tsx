"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

type FilterType = "city" | "position" | "gender" | "leaderboard_type";

interface LeaderboardFiltersProps {
  filters: {
    leaderboard_type?: string;
    city: string;
    position: string;
    gender: string;
  };
  filterData: {
    leaderboard_types: Record<string, string>;
    cities: Record<string, string>;
    positions: Record<string, string>;
    gender: Record<string, string>;
  };
  handleFilterClick: (filterType: FilterType, value: string) => void;
  resetFilters: () => void;
}

const FilterDropdown = ({
  label,
  options,
  activeValue,
  onSelect,
}: {
  label: string;
  options: Record<string, string>;
  activeValue: string;
  onSelect: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Get the display label for active value - ADD NULL CHECK
  const activeLabel = options
    ? Object.entries(options).find(
      ([_, value]) => value === activeValue
    )?.[0] || label
    : label;

  return (
    <>
      <div className="relative z-50">
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-all min-w-[120px] justify-between"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 102, 51, 0.5) -40.91%, rgba(0, 204, 102, 0.8) 132.95%)",
          }}
        >
          <span className="truncate">{activeLabel}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>
      {isOpen && options && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed min-w-[120px] max-w-[200px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-[9999]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {Object.entries(options).map(([label, value]) => (
            <button
              key={value}
              onClick={() => {
                onSelect(value);
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-3 text-sm transition-colors
                ${activeValue === value
                  ? "bg-white/10 text-white font-semibold"
                  : "text-gray-300 hover:bg-gray-700/50"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export const LeaderBoardFilters = ({
  filters,
  filterData,
  handleFilterClick,
  resetFilters,
}: LeaderboardFiltersProps) => {
  // ADD NULL CHECKS
  if (!filterData || !filters) {
    return null;
  }
  console.log("filters", filters, filterData);
  return (
    <div className="flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ position: 'relative', zIndex: 50 }}>
      <Button onClick={resetFilters} className="p-2 rounded-full bg-gray-800/80 border border-gray-700/50 text-white text-sm font-medium hover:bg-gray-700/80 transition-all">
        <RefreshCw className="w-4 h-4" />
      </Button>
      {filterData.leaderboard_types && (
        <FilterDropdown
          label="Leaderboard Type"
          options={filterData.leaderboard_types}
          activeValue={(filters.leaderboard_type || (filters as any).type || 'overall')}
          onSelect={(value) => handleFilterClick("leaderboard_type" as FilterType, value)}
        />
      )}
      {filterData.cities && (
        <FilterDropdown
          label="City"
          options={filterData.cities}
          activeValue={filters.city}
          onSelect={(value) => handleFilterClick("city", value)}
        />
      )}
      {filterData.positions && (
        <FilterDropdown
          label="Position"
          options={filterData.positions}
          activeValue={filters.position}
          onSelect={(value) => handleFilterClick("position", value)}
        />
      )}
      {filterData.gender && (
        <FilterDropdown
          label="Gender"
          options={filterData.gender}
          activeValue={filters.gender}
          onSelect={(value) => handleFilterClick("gender", value)}
        />
      )}
    </div>
  );
};

"use client";

{
  /*
    
import { useState } from "react";
import { HorizontalScroll } from "../common/HorizontalScroll";

export const LeaderBoardFilters = ({ filter_data, filters, handleFilterClick }: { filter_data: any, filters: any, handleFilterClick: any }) => {
    console.log("filter_data", filter_data, filters);

    const onClickFilter = (key: string) => {
        if (filters?.type !== filter_data?.leaderboard_types[key]) {
            handleFilterClick("type", filter_data?.leaderboard_types[key]);
        }
    }

    return (
        <HorizontalScroll>
            <div className="flex flex-row gap-2">
                {filter_data && filter_data?.leaderboard_types && Object.keys(filter_data?.leaderboard_types).map((key) => (
                    <div key={key} className="flex flex-row gap-2">
                        <div className="flex flex-row gap-2">
                            <div className="flex flex-row gap-2">
                                <div
                                    className={`text-lg p-3 ${filters?.type === filter_data?.leaderboard_types[key] ? 'border-b border-white rounded-md font-bold' : 'text-gray-300'}`}
                                    onClick={() => onClickFilter(key)}
                                >
                                    {key}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </HorizontalScroll>
    )
}
    
*/
}

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type FilterType = "city" | "position" | "gender";

interface LeaderboardFiltersProps {
  filters: {
    city: string;
    position: string;
    gender: string;
  };
  filterData: {
    cities: Record<string, string>;
    positions: Record<string, string>;
    gender: Record<string, string>;
  };
  handleFilterClick: (filterType: FilterType, value: string) => void;
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get the display label for active value - ADD NULL CHECK
  const activeLabel = options
    ? Object.entries(options).find(
        ([_, value]) => value === activeValue
      )?.[0] || label
    : label;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/80 border border-gray-700/50 text-white text-sm font-medium hover:bg-gray-700/80 transition-all min-w-[120px] justify-between"
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && options && (
        <div className="absolute top-full mt-2 left-0 min-w-[160px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {Object.entries(options).map(([label, value]) => (
            <button
              key={value}
              onClick={() => {
                onSelect(value);
                setIsOpen(false);
              }}
              className={`
                                w-full text-left px-4 py-3 text-sm transition-colors
                                ${
                                  activeValue === value
                                    ? "bg-white/10 text-white font-semibold"
                                    : "text-gray-300 hover:bg-gray-700/50"
                                }
                            `}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LeaderBoardFilters = ({
  filters,
  filterData,
  handleFilterClick,
}: LeaderboardFiltersProps) => {
  // ADD NULL CHECKS
  if (!filterData || !filters) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-hide">
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

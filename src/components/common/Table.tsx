import Image from "next/image";
import { useState } from "react";

// Tooltip component for long text with click/hover support
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = () => setShowTooltip(false);
    const handleClick = () => setShowTooltip(!showTooltip);

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {children}
            {showTooltip && text && (
                <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-xl -top-10 left-0 whitespace-nowrap max-w-xs">
                    {text}
                    <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
}

// Truncated text component with tooltip
function TruncatedText({ text, maxLength = 15 }: { text: string; maxLength?: number }) {
    const shouldTruncate = text && text.length > maxLength;
    const displayText = shouldTruncate ? `${text.substring(0, maxLength)}...` : text;

    if (shouldTruncate) {
        return (
            <Tooltip text={text}>
                <span className="cursor-help">{displayText}</span>
            </Tooltip>
        );
    }

    return <span>{displayText}</span>;
}

export interface TableColumn {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    render?: (value: any, row: any, index: number) => React.ReactNode;
}

export interface TableProps {
    data: any[];
    columns: TableColumn[];
    currentUserId?: number;
    showRank?: boolean;
    className?: string;
}

export function Table({
    data,
    columns,
    currentUserId,
    showRank = true,
    className = ""
}: TableProps) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (columnKey: string) => {
        const column = columns.find(col => col.key === columnKey);
        if (!column?.sortable) return;

        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('desc');
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortColumn) return 0;

        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        // Handle special cases for computed values
        if (sortColumn === 'goalsAssists') {
            aValue = (a.goals || 0) + (a.assists || 0);
            bValue = (b.goals || 0) + (b.assists || 0);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();
        return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    const getCellAlignment = (align?: string) => {
        switch (align) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };

    return (
        <div className={`overflow-x-auto scrollbar-hide ${className}`}>
            <div className="min-w-fit w-full lg:min-w-full">
                {/* Table Header */}
                <div className="flex items-center bg-surface/50 rounded-t-xl p-3 border-b border-primary/20">
                    {showRank && (
                        <div className="flex-none w-12 text-sm font-semibold text-primary">
                            #
                        </div>
                    )}
                    {columns.map((column) => (
                        <div
                            key={column.key}
                            className={`
                                flex-none text-sm font-semibold text-primary cursor-pointer
                                hover:text-primary/80 transition-colors duration-200
                                ${column.width || 'flex-1'}
                                ${getCellAlignment(column.align)}
                                ${column.sortable ? 'select-none' : ''}
                            `}
                            style={column.width ? { width: column.width, minWidth: column.width, maxWidth: column.width } : {}}
                            onClick={() => handleSort(column.key)}
                        >
                            <div className="flex items-center gap-1">
                                {column.label}
                                {column.sortable && (
                                    <span className="text-xs">
                                        {sortColumn === column.key ? (
                                            sortDirection === 'asc' ? '↑' : '↓'
                                        ) : '↕'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table Body */}
                <div className="bg-background/90 rounded-b-xl">
                    {sortedData.map((row, index) => {
                        const isCurrentUser = currentUserId && row.id === currentUserId;

                        return (
                            <div
                                key={`${row.id}-${index}`}
                                className={`
                                    flex items-center p-3 transition-all duration-300 ease-in-out
                                    hover:bg-surface/20
                                    ${isCurrentUser
                                        ? 'bg-primary/10 border-l-4 border-primary shadow-sm'
                                        : 'border-l-4 border-transparent'
                                    }
                                    ${index < sortedData.length - 1 ? 'border-b border-surface/30' : ''}
                                `}
                            >
                                {showRank && (
                                    <div
                                        className={`
                                            flex-none w-10 text-sm font-bold
                                            ${isCurrentUser ? 'text-primary' : 'text-foreground/70'}
                                        `}
                                    >
                                        {row.rank || index + 1}
                                    </div>
                                )}

                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={`
                                            flex-none
                                            ${column.width || 'flex-1'}
                                            ${getCellAlignment(column.align)}
                                        `}
                                        style={column.width ? { width: column.width, minWidth: column.width, maxWidth: column.width } : {}}
                                    >
                                        {column.render ? (
                                            column.render(row[column.key], row, index)
                                        ) : (
                                            <span
                                                className={`
                                                    text-sm
                                                    ${isCurrentUser ? 'text-primary font-semibold' : 'text-foreground'}
                                                `}
                                            >
                                                {row[column.key]}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            {data.length === 0 && (
                <div className="text-center py-12 text-foreground/60">
                    <div className="text-lg mb-2">No data available</div>
                    <div className="text-sm">Check back later for updates</div>
                </div>
            )}
        </div>
    );
}

// Player Avatar Component for table usage
export function PlayerAvatar({
    src,
    name,
    size = 40
}: {
    src?: string;
    name: string;
    size?: number;
}) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const imageSrc = imageError || !src ? "/skeleton.png" : src;

    return (
        <div className="relative shrink-0">
            <Image
                src={imageSrc}
                alt={name}
                width={size}
                height={size}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className={`
                    ${imageLoading ? 'opacity-50' : 'opacity-100'} 
                    rounded-full transition-opacity duration-200
                `}
                style={{ width: size, height: size }}
            />
            {imageLoading && (
                <div
                    className="absolute inset-0 bg-gray-200 animate-pulse rounded-full"
                    style={{ width: size, height: size }}
                />
            )}
        </div>
    );
}

// Export the TruncatedText component for reuse
export { TruncatedText };

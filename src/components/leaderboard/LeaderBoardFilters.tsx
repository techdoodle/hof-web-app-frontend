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
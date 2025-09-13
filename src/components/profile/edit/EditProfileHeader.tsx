import { ChevronLeft } from "lucide-react";

interface EditProfileHeaderProps {
    onBack: () => void;
}

export function EditProfileHeader({ onBack }: EditProfileHeaderProps) {
    return (
        <div className="border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
                {/* Left side - Back button */}
                <button
                    onClick={onBack}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>

                {/* Center - Title */}
                <h1 className="text-lg font-semibold text-white">Edit Profile</h1>

                {/* Right side - empty for balance */}
                <div className="w-7"></div>
            </div>
        </div>
    );
}

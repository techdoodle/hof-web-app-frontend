import { CommonNavbar } from "@/components/common/CommonNavbar";

export default function MatchLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="match-layout flex flex-col min-h-screen max-w-md mx-auto">
            {children}
            <CommonNavbar activeTab="profile" />
        </div>
    );
}
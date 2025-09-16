import YoutubeLinkViewer from "../common/YoutubeLinkViewer";

export default function HighlightLinks({ links, heading }: { links: string[], heading: string }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="text-xl font-rajdhani font-bold text-white">{heading}</div>
            <div className="flex flex-row gap-4">
                {links.map((link) => (
                    <YoutubeLinkViewer key={link} link={link} />
                ))}
            </div>
        </div>
    );
}

export const HofSelectChip = () => {
    return (
        <div className="flex items-center gap-2 bg-hof-select-golden-gradient-light rounded-full p-1 pr-2">
            <div className="w-4 h-4 rounded-full" style={{
                backgroundImage: 'url(/tick-hof-select.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }} />
            <span className={"sm:text-sm text-xs font-normal text-golden"}>HOF Select</span>
        </div>
    )
}

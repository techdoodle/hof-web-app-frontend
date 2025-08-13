import Image from "next/image";

export function ComingSoon() {
    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 ">
                <div className="text-center py-12 flex flex-col justify-center items-center">
                    <div className="">
                        <Image src="/play-placeholder.svg" alt="Play Match" width={200} height={300} className="w-full h-full" />
                    </div>
                    <div className="text-xl font-bold text-white my-4">Coming Soon...</div>
                    <div className="text-gray-400">Hold on tight, we're working on it!</div>
                </div>
            </div>
        </div>
    );
}

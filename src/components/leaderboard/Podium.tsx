import { PodiumFrame } from "../common/PodiumFrame";

export const Podium = (props: { first: any, second: any, third: any }) => {
    return (
        <div className="flex flex-row gap-4 justify-center items-end min-h-[230px]">
            <div className="w-1/4 flex flex-col items-center justify-end">
                <PodiumFrame category="silver" img={props.second.imageUrl ?? "/skeleton.png"} name={props.second.name ?? "User"} score={props.second.score} rank={2} inverse={true} />
            </div>
            <div className="w-1/2 flex flex-col items-center justify-start">
                <PodiumFrame category="gold" img={props.first.imageUrl ?? "/skeleton.png"} name={props.first.name ?? "User"} score={props.first.score} rank={1} inverse={false} />
            </div>
            <div className="w-1/4 flex flex-col items-center justify-end">
                <PodiumFrame category="bronze" img={props.third.imageUrl ?? "/skeleton.png"} name={props.third.name ?? "User"} score={props.third.score} rank={3} inverse={true} />
            </div>
        </div>
    );
}
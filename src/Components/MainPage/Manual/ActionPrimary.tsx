import { ActionProps } from "./ActionSecondary";

import iconArrowRightWhite from '../../../assets/arrow-right-white.png'

export default function ActionPrimary(props: ActionProps) {
    return (
        <div onClick={() => props.onClick()} className="w-full button bg-[rgb(var(--colorBlue))] rounded-[20px] text-white flex items-center justify-center gap-5 pl-[25px] pr-4">
            <img className="m-0" src={props.icon} />
            <p className="flex-grow">{props.title}</p>
            <img className="m-0" src={iconArrowRightWhite} />
        </div>
    )
};

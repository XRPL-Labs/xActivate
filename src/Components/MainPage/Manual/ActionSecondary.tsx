import iconArrowRight from '../../../assets/arrow-right.png'

export type ActionProps = {
    title: string,
    onClick: Function,
    icon: any,
}
export default function ActionSecondary(props: ActionProps) {
    return (
        <div onClick={() => props.onClick()} className="w-full button button--blue rounded-[20px] text-secondary flex items-center justify-center gap-5 pl-[25px] pr-4">
            <img className="m-0" src={props.icon} />
            <p className="flex-grow">{props.title}</p>
            <img className="m-0" src={iconArrowRight} />
        </div>
    )
};

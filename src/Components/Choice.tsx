import iconChevronRight from '../assets/chevron-right.png'

export default function Choice(props: any) {
    return (
        <div onClick={() => props.clickAction()} className="w-full bg-white p-6 border border-[rgb(var(--colorSilver))] rounded-xl flex justify-between items-center">
            <div>
                <p className="text-primary font-bold m-0">{props.title}</p>
                {props.subtitle &&
                    <p className="text-primary m-0">{props.subtitle}</p>
                }
            </div>
            <img className="m-0" src={iconChevronRight} />
        </div>
    )
};

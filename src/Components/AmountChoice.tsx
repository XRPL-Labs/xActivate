type XRPChoiceProps = {
    amount: number,
    onClick: Function,
    isActive: boolean,
    isAvailable: boolean,
    currency: string,
    xAppStyle: string
}

export default function AmountChoice(props: XRPChoiceProps) {

    let highlightStyle = 'bg-white text-black';
    if (props.xAppStyle === 'light') highlightStyle = 'text-white bg-black'

    return (
        <span onClick={() => props.isAvailable ? props.onClick() : ''} className={`block text-lg border border-[rgb(var(--colorLight))] text-center w-full py-4 rounded-lg col-span-1 ${props.isActive ? `${highlightStyle} font-bold` : !props.isAvailable ? 'opacity-25' : 'text-primary '}`}>{props.amount} {props.currency}</span>
    )
};

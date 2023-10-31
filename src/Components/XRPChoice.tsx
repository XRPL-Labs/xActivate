type XRPChoiceProps = {
    amount: number,
    onClick: Function,
    isActive: boolean,
    isAvailable: boolean
}

export default function XRPChoice(props: XRPChoiceProps) {
    return (
        <span onClick={() => props.isAvailable ? props.onClick() : ''} className={`block text-lg border border-[rgb(var(--colorLight))] text-center w-full py-4 rounded-lg col-span-1 ${props.isActive ? 'text-white bg-black font-bold' : !props.isAvailable ? 'opacity-25' : 'text-primary '}`}>{props.amount} XRP</span>
    )
};

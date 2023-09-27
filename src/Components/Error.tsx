type ErrorProps = {
    text: string,
    xumm: any
}

export default function Error(props: ErrorProps) {
    return (
        <div className="fixed inset-0 z-20 w-screen h-screen flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="bg-white rounded-[15px] z-10 p-4 w-full">
                <p className="font-bold tracking-tight text-xl mb-2 m-0">Oh no, an error occured</p>
                <p className="text-left leading-tight w-full m-0">{props.text}</p>
                <p className="m-0 underline text-center mt-2" onClick={() => { props.xumm.xapp.navigate({ xApp: 'xumm.support' }) }}>Open ticket</p>
            </div>
        </div >
    )
};

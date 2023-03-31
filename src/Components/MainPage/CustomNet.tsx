export default function CustomNet(params: any) {
    return (
        <div className="h-screen inset-0 absolute bg-white flex items-center justify-center flex-col px-[20px]">
            <div className="w-8 h-8 rounded-full border-[3px] border-black border-t-white animate-spin"></div>
            <p className="font-bold text-center text-lg">Your account will be automatically funded with 1,000 XRP and the xApp will close itself after completion. Please wait.</p>
        </div>
    )
};

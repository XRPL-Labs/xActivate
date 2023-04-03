export default function DevNet(params: any) {
    return (
        <div className="h-screen inset-0 absolute bg-white flex items-center justify-center flex-col px-[20px]">
            {params.isPrefilling === true ?
                <>
                    <div className="w-8 h-8 rounded-full border-[3px] border-black border-t-white animate-spin"></div>
                    <p className="font-bold text-center text-lg">Your account will be automatically funded with 1,000 XRP and the xApp will close itself after completion. Please wait.</p>
                </>
                :
                <>
                    <div className="w-8 h-5 border-l-[6px] border-b-[6px] -rotate-45 border-green-600 border-t-white"></div>
                    <p className="font-bold text-center text-lg">Your account is automatically funded with 1,000 XRP!</p>
                </>
            }
        </div>
    )
};

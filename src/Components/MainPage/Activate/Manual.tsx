import { useEffect, useState } from "react";
import iconChevronDown from '../../../assets/chevron-down.png'
import iconChevronLeft from '../../../assets/chevron-left.png'
import exchanges from '../../../../exchanges.json'

export default function Manual(props: any) {
    const [activationType, setActivationType] = useState<string>('');
    const [exchange, setExchange] = useState<string>('');
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    useEffect(() => {
        if (exchange !== '') {
            props.toggleMarkdownURL(import.meta.env.VITE_GIT_MD_ENDPOINT + exchange)
        }
    }, [exchange])

    function openOnOffRampXApp() {
        if (typeof (window as any).ReactNativeWebView !== 'undefined') {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                command: 'xAppNavigate',
                xApp: 'xumm.onofframp',
                title: 'XUMM OnOfframp',
                extraData: {
                    ott: props.xAppToken,
                    origin: 'xActivate'
                }
            }))
        }
    }

    return (
        <>
            {activationType === 'exchange' ?
                <>
                    <div className="flex items-start justify-start flex-col">
                        <p className="text-primary font-bold m-0 text-left">Please select the exchange you want to use.</p>
                        <p className="text-sm text-secondary m-0">After you choose an exchange, the instructions for this exchange will be shown.</p>
                        <div className="w-full bg-white px-4 py-[16px] mt-2 border border-[rgb(--var(colorSilver))] rounded-xl flex justify-between items-center relative" onClick={() => { setShowDropdown(!showDropdown) }}>
                            <span>Select an option</span>
                            <img className="m-0" src={iconChevronDown} />
                            <div className={`absolute w-full bg-white px-4 py-2 top-14 border border-[rgb(--var(colorSilver))] rounded-b-xl z-30 max-h-[36vh] overflow-y-scroll ${showDropdown ? 'left-0' : '-left-[110vw]'}`}>
                                {exchanges.map((e: any, index: number) => {
                                    return (
                                        <div key={index} onClick={() => { setExchange(e.url) }} className="py-1">{e.name}</div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                        <button onClick={() => setActivationType('')} className="button button--blue text-black w-full py-[16px] rounded-[20px] flex items-center justify-center gap-2"><img className="m-0" src={iconChevronLeft} /><p className="m-0">Back</p></button>
                    </div>
                </>
                :
                <>
                    <p className="m-0 text-secondary">An account on the XRP Ledger automatically becomes activated when the first 10 XRP are sent to the account. This is needed to ensure the network's stability and prevent spam.</p>
                    <p className="m-0 text-secondary">You can use either an exchange or the Xumm Onramp and Offramp xApp to activate your account on the XRP Ledger.</p>
                    <a href="" className="mt-2 text-[rgb(var(--colorBlue))] font-bold text-left">Read more about account activation</a>
                    <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                        <button onClick={() => openOnOffRampXApp()} className="button bg-[rgb(var(--colorBlue))] text-white w-full py-[16px] rounded-[20px] text-lg">Use On/Offramp</button>
                        <button onClick={() => setActivationType('exchange')} className="w-full underline text-secondary">How to use an exchange?</button>
                    </div>
                </>
            }
        </>
    )
};

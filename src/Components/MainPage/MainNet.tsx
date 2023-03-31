import { useEffect, useState } from "react";
import Choice from "../Choice";
import iconChevronDown from '../../assets/chevron-down.png'
import exchanges from '../../../exchanges.json'

export default function MainNet(props: any) {

    const [activationType, setActivationType] = useState<string>('');
    const [exchange, setExchange] = useState<string>('');
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

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

    useEffect(() => {
        if (exchange !== '') {
            props.toggleMarkdownURL(import.meta.env.VITE_GIT_MD_ENDPOINT + exchange)
        }
    }, [exchange])

    return (
        <div className="w-full h-full flex flex-col items-center">
            <h2 className="text-center text-primary">How do you want to activate your account?</h2>
            {activationType === 'exchange' ?
                <div className="flex items-start justify-start flex-col">
                    <p className="text-primary font-bold m-0 text-left">Please select the exchange you want to use.</p>
                    <p className="text-sm text-secondary m-0">After you choose an exchange, the instructions for this exchange will be shown.</p>
                    <div className="w-full bg-white px-4 py-[16px] mt-2 border border-[rgb(--var(colorSilver))] rounded-xl flex justify-between items-center relative" onClick={() => { setShowDropdown(!showDropdown) }}>
                        <span>Select an option</span>
                        <img className="m-0" src={iconChevronDown} />
                        <div className={`absolute w-full bg-white px-4 py-2 top-14 border border-[rgb(--var(colorSilver))] rounded-b-xl ${showDropdown ? 'left-0' : '-left-[110vw]'}`}>
                            {exchanges.map((e: any, index: number) => {
                                return (
                                    <div key={index} onClick={() => { setExchange(e.url) }} className="py-1">{e.name}</div>
                                )
                            })}
                        </div>
                    </div>

                </div>
                :
                <>
                    <div className="flex flex-col gap-4 mt-8 w-full">
                        <Choice title="Voucher" clickAction={() => alert('hi')} />
                        <Choice title="OnRamp/OffRamp" clickAction={() => openOnOffRampXApp()} />
                        <Choice title="Via Exchange" clickAction={() => setActivationType('exchange')} />
                    </div>
                </>
            }
        </div>
    )
};

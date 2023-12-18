import { useEffect, useState } from "react";
import iconChevronDown from '../../../assets/chevron-down.png'
import iconChevronLeft from '../../../assets/chevron-left.png'
import iconExternalLinkWhite from '../../../assets/external-link-white.png'
import iconExternalLink from '../../../assets/external-link.png'
import iconWallet from '../../../assets/wallet.png'
import iconWalletWhite from '../../../assets/wallet-white.svg'
import iconCoins from '../../../assets/coins.png'
import iconExchange from '../../../assets/exchange.png'
import iconExchangeWhite from '../../../assets/exchange-white.png'
import exchanges from '../../../../exchanges.json'
import AccountActivation from "./AccountActivation";
import ActionPrimary from "../Manual/ActionPrimary";
import ActionSecondary from "../Manual/ActionSecondary";

export default function Manual(props: any) {

    const [exchange, setExchange] = useState<string>('');
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [useExchange, setUseExchange] = useState<boolean>(false);
    const currency = props.nodetype === 'XAHAU' ? 'XAH' : 'XRP';
    const accountReserve = props.nodetype === 'XAHAU' ? 1 : 10;

    let exchangeIcon = iconExchangeWhite;
    let walletIcon = iconWalletWhite;
    let externalLinkIcon = iconExternalLinkWhite;
    if (props.style === 'light') {
        exchangeIcon = iconExchange;
        walletIcon = iconWallet;
        externalLinkIcon = iconExternalLink;
    }

    function openBuySellXApp() {
        if (typeof (window as any).ReactNativeWebView !== 'undefined') {
            (window as any).ReactNativeWebView.postMessage(JSON.stringify({
                command: 'xAppNavigate',
                xApp: 'xumm.buysellxrp',
                title: 'XUMM Buy/Sell XRP',
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
            {props.useExchange === true ?
                <>
                    <div className="flex items-start justify-start flex-col">
                        <p className="text-primary font-bold m-0 text-left mb-2">Please select the exchange you want to use.</p>
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
                    <div className={`fixed max-h-[195px] ${props.xAppStyle === 'light' ? 'bg-theme-tint' : 'bg-[rgb(var(--themeColorBackgroundPrimary))]'} w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0`}>
                        <button onClick={() => { props.setUseExchange(false); setUseExchange(false) }} className="button button--blue text-black w-full py-[16px] rounded-[20px] flex items-center justify-center gap-2"><img className={`m-0 ${props.xAppStyle !== 'light' ? 'filter-white' : ''}`} src={iconChevronLeft} /><p className="m-0 text-primary">Back</p></button>
                    </div>
                </>
                :
                props.useAccount === true ?
                    <>
                        <AccountActivation style={props.xAppStyle} xumm={props.xumm} nodewss={props.nodewss} accountToActivate={props.accountToActivate} setUseAccount={props.setUseAccount} />
                        <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                            <button onClick={() => { props.setUseAccount(false); setUseExchange(false) }} className="button button--blue text-black w-full py-[16px] rounded-[20px] flex items-center justify-center gap-2"><img className={`m-0 ${props.xAppStyle !== 'light' ? 'filter-white' : ''}`} src={iconChevronLeft} /><p className="m-0 text-primary">Back</p></button>
                        </div>
                    </>
                    :
                    <div className="flex flex-col gap-2">
                        <p className="m-0 text-secondary text-center">An account on the {currency} Ledger automatically becomes activated when the first <strong className="text-primary">{accountReserve} {currency}</strong> is sent to it.</p>
                        {
                            currency.toUpperCase() === 'XRP'
                                ? <p className="text-center m-0 -mt-1 font-semibold underline flex items-center justify-center gap-2 text-primary" onClick={() => { props.toggleMarkdownURL('https://raw.githubusercontent.com/XRPL-Labs/Help-Center/main/getting-started/how-to-activate-a-new-xrpl-account.md') }}>More information <span><img className="m-0" src={externalLinkIcon} /></span></p>
                                : <p className="text-center m-0 -mt-1 font-semibold underline flex items-center justify-center gap-2 text-primary" onClick={() => { props.toggleMarkdownURL('https://raw.githubusercontent.com/XRPL-Labs/Help-Center/main/getting-started-with-xumm/activating-a-xahau-account/README.md') }}>More information <span><img className="m-0" src={externalLinkIcon} /></span></p>
                        }

                        <div className="fixed bottom-0 w-full -ml-5 pl-[20px] pr-[22px] pb-8 z-10 bg-transparent">
                            <div className="w-full from-[rgb(var(--themeColorBackgroundPrimary))] to-transparent bg-gradient-to-t h-6"></div>
                            <div className="bg-[rgb(var(--themeColorBackgroundPrimary))] flex gap-2 flex-col w-full">
                                {props.nodetype === 'XAHAU' ?
                                    <ActionPrimary icon={iconWalletWhite} title="Fund with existing account" onClick={() => { props.setUseAccount(true) }} xAppStyle={props.xAppStyle} />
                                    :
                                    <>
                                        <ActionPrimary icon={iconCoins} title="Buy XRP" onClick={() => { openBuySellXApp() }} xAppStyle={props.xAppStyle} />
                                        <ActionSecondary icon={walletIcon} title="Fund with existing account" onClick={() => { props.setUseAccount(true) }} xAppStyle={props.xAppStyle} />
                                        <ActionSecondary icon={exchangeIcon} title="Fund via Exchange" onClick={() => { props.setUseExchange(true); setUseExchange(true); }} xAppStyle={props.xAppStyle} />
                                    </>
                                }
                            </div>
                        </div>
                    </div >
            }
        </>
    )
};

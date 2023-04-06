import { useEffect, useState } from "react";
import iconChevronDown from '../../assets/chevron-down.png'
import iconChevronLeft from '../../assets/chevron-left.png'
import exchanges from '../../../exchanges.json'
import imageAddAccount from '../../assets/image-add-account.png'
import imageAddAccountDark from '../../assets/image-add-account-dark.png'
import Manual from "./Activate/Manual";

async function checkIfTangemCardCanBePrefilled(bearer: string, xAppToken: string) {
    let canBePrefilled = false
    let check = fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${xAppToken}`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${bearer}`,
            'Content-Type': 'application/json',
        }
    }).then((response) => response.json()).then(r => {
        // fetch(`/__log?${encodeURI(JSON.stringify(r, null, 4))}`)

        if (r.eligible === true) {
            canBePrefilled = true;
        }
    });

    return canBePrefilled;
}

export default function MainNet(props: any) {

    let imageActivateAccount = imageAddAccountDark
    if (props.xAppStyle === 'light') {
        imageActivateAccount = imageAddAccount
    }

    fetch(`/__log?${encodeURI(JSON.stringify(props.profile.accounttype, null, 4))}`)

    if (props.profile.accounttype === 'TANGEM') {
        (async () => {
            if (await checkIfTangemCardCanBePrefilled(props.bearer, props.xAppToken)) {
            } else {
            }
        })()
    }

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



    return (
        <div className="w-full h-full flex flex-col items-start relative">
            <div className="w-full flex flex-col">
                <img src={imageActivateAccount} className="w-[40%] mx-auto" />
                <h1 className="text-center text-2xl text-primary">Activate your account</h1>
            </div>
            <Manual xAppToken={props.xAppToken} toggleMarkdownURL={props.toggleMarkdownURL} />
        </div>
    )
};

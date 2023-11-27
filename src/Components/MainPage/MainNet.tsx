import { Suspense, lazy, useEffect, useState } from "react";
import imageAddAccount from '../../assets/image-add-account.png'
import imageAddAccountDark from '../../assets/image-add-account-dark.png'


const Loader = lazy(() => import('./Loader'));
const Manual = lazy(() => import('./Activate/Manual'));
const Tangem = lazy(() => import('./Activate/Tangem'));

export async function checkIfTangemCardCanBePrefilled(bearer: string, xAppToken: string) {
    let check = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${xAppToken}`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${bearer}`,
            'Content-Type': 'application/json',
        }
    })

    let eligibleResult = await check.json();
    if (eligibleResult && eligibleResult.eligible) {
        return eligibleResult;
    }
    return false;
}

export default function MainNet(props: any) {

    let imageActivateAccount = imageAddAccountDark
    if (props.xAppStyle === 'light') {
        imageActivateAccount = imageAddAccount
    }
    const [activationType, setActivationType] = useState<string>('')
    const [useExchange, setUseExchange] = useState(false);
    const [showImage, setShowImage] = useState(true);
    const [amount, setAmount] = useState<number>(0);
    const [canOnOffRamp, setCanOnOffRamp] = useState<boolean>(false);
    const [useAccount, setUseAccount] = useState<boolean>(false);

    useEffect(() => {
        const userXAppsRequest = fetch('https://xumm.app/api/v1/jwt/xapp/shortlist?featured=1', {
            headers: {
                'Authorization': `Bearer ${props.bearer}`,
                'Content-Type': 'application/json',
            }
        }).then((response) => response.json()).then(userXApps => {
            if (userXApps.featured) {
                userXApps.featured.map((flag: any) => {
                    if (flag.identifier === 'xumm.onofframp') {
                        setCanOnOffRamp(true);
                    }
                })
            }
        })

        if (props.profile.accounttype === 'TANGEM') {
            (async () => {
                const prefillCheck = await checkIfTangemCardCanBePrefilled(props.bearer, props.xAppToken)
                fetch(`/__log?${encodeURI(JSON.stringify(prefillCheck, null, 4))}`)
                if (prefillCheck) {
                    // TODO: What if XAHAU?
                    setAmount(parseFloat(prefillCheck.amount.xrp.total));
                    // setAmount(parseFloat('100'));
                    setActivationType('tangem');
                } else {
                    setActivationType('manual');
                }
            })()
        } else {
            setActivationType('manual');
        }
    }, []);

    useEffect(() => {
        setShowImage(!useAccount);
    }, [useAccount])

    return (
        <>
            <div className="w-full h-full flex flex-col items-center relative">
                <div className={`w-full flex flex-col items-center ${!showImage && 'mt-12'}`}>
                    {showImage &&
                        <img src={imageActivateAccount} className="w-[40%] mx-auto" />
                    }
                    <h1 className="text-center text-2xl text-primary">Activate your account</h1>
                </div>
                <Suspense fallback={<Loader />}>
                    {activationType === '' &&
                        <Loader />
                    }
                    {activationType === 'manual' &&
                        <Manual useExchange={useExchange} setUseExchange={setUseExchange} nodetype={props.nodetype} setShowImage={setShowImage} setUseAccount={setUseAccount} useAccount={useAccount} xAppToken={props.xAppToken} toggleMarkdownURL={props.toggleMarkdownURL} canOnOffRamp={canOnOffRamp} xumm={props.xumm} accountToActivate={props.accountToActivate} />
                    }
                    {activationType === 'tangem' &&
                        <Tangem nodetype={props.nodetype} amount={amount} bearer={props.bearer} xAppToken={props.xAppToken} xumm={props.xumm} canOnOffRamp={canOnOffRamp} />
                    }
                </Suspense>
            </div>
        </>
    )
};

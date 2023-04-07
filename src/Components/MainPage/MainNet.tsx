import { Suspense, lazy, useEffect, useState } from "react";
import imageAddAccount from '../../assets/image-add-account.png'
import imageAddAccountDark from '../../assets/image-add-account-dark.png'


const Loader = lazy(() => import('./Loader'));
const Manual = lazy(() => import('./Activate/Manual'));
const Tangem = lazy(() => import('./Activate/Tangem'));

async function checkIfTangemCardCanBePrefilled(bearer: string, xAppToken: string) {
    let check = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${xAppToken}`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${bearer}`,
            'Content-Type': 'application/json',
        }
    })

    let eligibleResult = await check.json();
    if (eligibleResult && eligibleResult.eligible) {
        return eligibleResult.eligible;
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
    const [amount, setAmount] = useState<number>(0);
    const [canOnOffRamp, setCanOnOffRamp] = useState<boolean>(false)

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

                if (prefillCheck) {
                    setAmount(prefillCheck.amount);
                    setActivationType('tangem')
                } else {
                    setActivationType('manual');
                }
            })()
        } else {
            setActivationType('manual');
        }
    }, [])

    return (
        <>
            <div className="w-full h-full flex flex-col items-start relative">
                <div className="w-full flex flex-col">
                    <img src={imageActivateAccount} className="w-[40%] mx-auto" />
                    <h1 className="text-center text-2xl text-primary">Activate your account</h1>
                </div>
                <Suspense fallback={<Loader />}>
                    {activationType === 'manual' &&
                        <Manual setUseExchange={setUseExchange} useExchange={useExchange} xAppToken={props.xAppToken} toggleMarkdownURL={props.toggleMarkdownURL} canOnOffRamp={canOnOffRamp} />
                    }
                    {activationType === 'tangem' &&
                        <Tangem amount={amount} bearer={props.bearer} xAppToken={props.xAppToken} xumm={props.xumm} canOnOffRamp={canOnOffRamp} />
                    }
                </Suspense>
            </div>
        </>
    )
};

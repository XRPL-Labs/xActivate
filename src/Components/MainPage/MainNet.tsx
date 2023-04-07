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
    const [amount, setAmount] = useState<number>(0);

    useEffect(() => {
        if (props.profile.accounttype === 'TANGEM') {
            (async () => {
                const prefillCheck = await checkIfTangemCardCanBePrefilled(props.bearer, props.xAppToken)
                
                if (prefillCheck) {
                    setAmount(prefillCheck.amount);
                    setActivationType('tangem')
                } else {
                    setAmount(150);
                    setActivationType('tangem');
                }
            })()
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
                        <Manual xAppToken={props.xAppToken} toggleMarkdownURL={props.toggleMarkdownURL} />
                    }
                    {activationType === 'tangem' &&
                        <Tangem amount={amount} bearer={props.bearer} xAppToken={props.xAppToken} xumm={props.xumm} />
                    }
                </Suspense>
            </div>
        </>
    )
};

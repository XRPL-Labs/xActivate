import { Suspense, lazy, useEffect, useState } from "react";
import imageAddAccount from '../../assets/image-add-account.png'
import imageAddAccountDark from '../../assets/image-add-account-dark.png'


const Loader = lazy(() => import('./Loader'));
const Manual = lazy(() => import('./Activate/Manual'));
const Tangem = lazy(() => import('./Activate/Tangem'));

export async function checkIfTangemCardCanBePrefilled(bearer: string, xAppToken: string, nodetype: string) {
    return new Promise(async (resolve, reject) => {
        let check = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${xAppToken}?network=${nodetype.toLowerCase()}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${bearer}`,
                'Content-Type': 'application/json',
            }
        })
        let eligibleResult = await check.json();
        console.log({ eligibleResult })
        if (eligibleResult && eligibleResult.eligible) {
            resolve(eligibleResult);
        }
        resolve(false);
    })
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
    const [useAccount, setUseAccount] = useState<boolean>(false);
    const [heightStyle, setHeightStyle] = useState<any>({ maxHeight: 'auto' })

    useEffect(() => {
        if (props.profile.accounttype === 'TANGEM' && props.prefillCheck) {
            // TODO: What if XAHAU?
            if (props.prefillCheck.amount.xrp) {
                setAmount(parseFloat(props.prefillCheck.amount.xrp.total));
            } else if (props.prefillCheck.amount.xah) {
                setAmount(parseFloat(props.prefillCheck.amount.xah.total));
            } else {
                setAmount(0);
            }
            // setAmount(parseFloat('100'));
            setActivationType('tangem');
        } else {
            setActivationType('manual');
        }
    }, []);

    useEffect(() => {
        if (useExchange) {
            setHeightStyle({ maxHeight: 'auto' });
        } else {
            setHeightStyle({ maxHeight: 'calc(100vh - 250px)' })
            // setHeightStyle({ maxHeight: calc('100vh - 252px') })
        }
    }, [useExchange])

    useEffect(() => {
        setShowImage(!useAccount);
    }, [useAccount])

    return (
        <div className={`w-full h-full flex flex-col items-center relative overflow-y-scroll pb-4 ${useExchange || (!useExchange && props.nodetype.includes('XAHAU')) ? 'hmax-auto' : 'hmax-scroll'}`}>
            <div className={`w-full flex flex-col items-center ${!showImage && 'mt-12'}`}>
                {showImage &&
                    <img src={imageActivateAccount} className="w-[40%] mx-auto" />
                }
                <h1 className="text-center text-2xl text-primary">Activate your account</h1>
            </div>
            <Suspense>
                {activationType === '' &&
                    <Loader />
                }
                {activationType === 'manual' &&
                    <Manual useExchange={useExchange} profile={props.profile} setUseExchange={setUseExchange} nodetype={props.nodetype} nodewss={props.profile.nodewss} setShowImage={setShowImage} setUseAccount={setUseAccount} useAccount={useAccount} xAppToken={props.xAppToken} toggleMarkdownURL={props.toggleMarkdownURL} xumm={props.xumm} accountToActivate={props.accountToActivate} xAppStyle={props.xAppStyle} />
                }
                {activationType === 'tangem' &&
                    <Tangem nodetype={props.nodetype} amount={amount} bearer={props.bearer} xAppToken={props.xAppToken} xumm={props.xumm} />
                }
            </Suspense>
        </div>
    )
};

import { Suspense, lazy, useEffect, useState } from "react";
import imageAddAccount from '../../assets/image-add-account.png';
import imageAddAccountDark from '../../assets/image-add-account-dark.png';
import Confetti from "../Confetti";
import { Error as ErrorComponent } from '../Error';

const Loader = lazy(() => import('./Loader'));

async function fundXahauAccount(xAppToken: string): Promise<boolean | any> {
    console.log(import.meta.env.VITE_XAHAU_ACTIVATION_ENDPOINT);

    const activationRequest = await fetch(`${import.meta.env.VITE_XAHAU_ACTIVATION_ENDPOINT}${xAppToken}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const isActivated = await activationRequest.json();
    if (isActivated.accepted === true) {
        return true;
    } else {
        return isActivated;
    }
}

export default function XahauMainPage(props: any) {

    let imageActivateAccount = imageAddAccountDark
    if (props.xAppStyle === 'light') {
        imageActivateAccount = imageAddAccount
    }

    const [isActivating, setIsActivating] = useState<boolean>(true);
    const [isActivated, setIsActivated] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (isActivating) {
            async function activation() {
                const activationAttempt = await fundXahauAccount(props.xAppToken);
                if (activationAttempt === true) {
                    setIsActivated(true);
                } else {
                    setIsActivated(false);
                    setHasError(true);
                    setError(activationAttempt.error);
                }
                setIsActivating(false);
            }

            activation();
        }
    }, []);

    return (
        <div className={`w-full h-full flex flex-col items-center relative overflow-y-scroll pb-4 hmax-auto`}>
            <div className={`w-full flex flex-col items-center mt-12`}>
                <img src={imageActivateAccount} className="w-[40%] mx-auto" />
                <h1 className="text-center text-2xl text-primary">Activating your account</h1>
            </div>
            <Suspense>
                {isActivating &&
                    <Loader />
                }
                {!isActivating && isActivated &&
                    <>
                        <div className="fixed flex items-center left-0 right-0 bottom-0 -top-80 justify-center -z-10 opacity-50">
                            <Confetti />
                            <p className="m-0 text-secondary font-bold">Your account has been activated with 1 XAH!</p>
                        </div>
                    </>
                }
                {!isActivated && hasError && !isActivating &&
                    <ErrorComponent xumm={props.xumm} text="Something went wrong. Please re-open the xApp and if this error keeps occurring, please send in a ticket via Xaman Support." />
                }
            </Suspense>
        </div>
    )
};

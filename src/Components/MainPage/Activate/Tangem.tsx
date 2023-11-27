import { useState } from 'react'
import Confetti from '../../Confetti'
import { Error as ErrorComponent } from "../../Error";
import * as Sentry from "@sentry/react";

export default function Tangem(props: any) {
    const [isActivated, setIsActivated] = useState<boolean>(false);
    const [isActivating, setIsActivating] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const currency = props.nodetype === 'XAHAU' ? 'XAH' : 'XRP';

    async function activateTangemCard(bearer: string) {

        const prefillRequest = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${props.xAppToken}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${bearer}`,
                'Content-Type': 'application/json',
            }
        })
        const prefillResult = await prefillRequest.json();
        fetch(`/__log?${encodeURI(JSON.stringify(prefillResult, null, 4))}`)
        if (prefillResult.activated === true) {
            window.setTimeout(() => {
                setIsActivated(true);
                setIsActivating(false);
            }, 2000)
        } else {
            Sentry.setContext("ActivateTangemError", {
                location: 'After prefill request',
                prefillResult: JSON.stringify(prefillResult, null, 4),
                xAppT: props.xAppToken,
                endpoint: import.meta.env.VITE_XAPP_TANGEM_ENDPOINT,
                bearer: bearer
            })
            setShowError(true);
            setIsActivating(false);
            setErrorMessage("Something went wrong during the activation of your account. Please retry after reopening the xApp or send in a support ticket via Xumm Support.")
            Sentry.captureException(new Error('ActivationTangemError'));
        }

    }
    return (
        <div className="">
            {!isActivated && !isActivating &&
                <>
                    <p className="m-0 text-secondary font-bold mb-4">Congrats! Your Tangem card seems to be eligible to be activated through Xumm.</p>
                    <p className="m-0 text-secondary">Please click the button below to pre fund your Tangem card with <strong>{props.amount} {currency}</strong>.</p>
                </>
            }
            {isActivating && !isActivated &&
                <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 border-8 border-black border-t-transparent animate-spin rounded-full"></div>
                    <p className="m-0 text-secondary font-bold">We're activating your account. Please stand by.</p>
                </div>
            }
            {isActivated && !showError && !isActivating &&
                <>
                    <div className="fixed flex items-center left-0 right-0 bottom-0 -top-80 justify-center -z-10 opacity-50">
                        <Confetti />
                    </div>
                    <p className="m-0 text-secondary font-bold">Your account has succesfully been activated!</p>
                    <p className="m-0 text-secondary">You can now close the xApp.</p>
                </>
            }
            {showError &&
                <ErrorComponent text={errorMessage} xumm={props.xumm} />
            }
            <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0 ">
                <button onClick={() => {
                    isActivated ?
                        props.xumm.xapp.close()
                        :
                        setIsActivating(true); activateTangemCard(props.bearer)
                }} className={`button ${isActivated ? 'bg-black' : 'bg-[rgb(var(--colorBlue))]'} text-white w-full py-[16px] rounded-[20px] text-lg flex items-center justify-center gap-2 active:outline-none focus:outline-none`}>
                    {isActivating && !isActivated ?
                        <>
                            Activating
                        </>
                        :
                        <>
                            {isActivated ? "Close xApp" :
                                'Activate'}
                        </>
                    }
                </button>
            </div>
        </div >
    )

};

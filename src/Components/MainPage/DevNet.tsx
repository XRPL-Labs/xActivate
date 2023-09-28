import { useState } from "react"
import imageAddAccount from '../../assets/image-add-account.png'
import imageAddAccountDark from '../../assets/image-add-account-dark.png'
import { XrplClient } from "xrpl-client"
import Confetti from "../Confetti";
import { Error as ErrorComponent } from "../Error";
import * as Sentry from "@sentry/react";

export default function DevNet(props: any) {

    const [isPrefilling, setIsPrefilling] = useState<boolean>(false);
    const [isPrefilled, setIsPrefilled] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    let imageActivateAccount = imageAddAccountDark
    if (props.xAppStyle === 'light') {
        imageActivateAccount = imageAddAccount
    }

    async function fundAccount() {
        if (props.profile.account === '') return false;
        setIsPrefilling(true);
        const activationRequest = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${props.xAppToken}/auto`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${props.bearer}`,
                'Content-Type': 'application/json',
            }
        });

        const activationResponse = await activationRequest.json();
        if (activationResponse.error) {
            Sentry.setContext("ActivationError", {
                location: 'After activation call',
                activationResponse: JSON.stringify(activationResponse, null, 4),
                userProfile: JSON.stringify(props.profile, null, 4),
                xAppT: props.xAppToken,
                endpoint: `${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${props.xAppToken}/auto`
            })
            Sentry.captureException(new Error('ActivationError'));
            setShowError(true);
            setIsPrefilling(false);
            setErrorMessage("Something went wrong during the activation of your account. Please retry after reopening the xApp or send in a support ticket via Xumm Support.")

            fetch(`/__log?${encodeURI(JSON.stringify(await activationResponse, null, 4))}`)
            return false;

        }


        const XRPLClient = new XrplClient(props.profile.nodewss);
        await XRPLClient.send({
            "command": "account_info",
            "account": props.profile.account,
        }).then(response => {
            fetch(`/__log?${encodeURI(JSON.stringify(response, null, 4))}`)
            if (response && response.account_data.Balance > 10000) {
                setIsPrefilling(false);
                setIsPrefilled(true);
            } else if (response && response.status === 'error') {
                Sentry.setContext("ActivatedAccountFetchError", {
                    location: 'After account_info call',
                    accountInfoResponse: JSON.stringify(response, null, 4),
                    activationResponse: JSON.stringify(activationResponse, null, 4),
                    userProfile: JSON.stringify(props.profile, null, 4),
                    xAppT: props.xAppToken,
                })
                Sentry.captureException(new Error('ActivationError'));
                setShowError(true);
                setIsPrefilling(false);
                setErrorMessage("Something went wrong during the activation of your account. Please retry after reopening the xApp or send in a support ticket via Xumm Support.")
            }
        });
    }

    return (
        <>
            <div className="w-full h-full flex flex-col items-start relative">
                {showError &&
                    <ErrorComponent text={errorMessage} xumm={props.xumm} />
                }
                <div className="w-full flex flex-col">
                    <img src={imageActivateAccount} className="w-[40%] mx-auto" />
                    <h1 className="text-center text-2xl text-primary">Activate your account</h1>
                </div>
                <p className="m-0 text-secondary mb-4">An account on the XRP Ledger automatically becomes activated when the first 10 XRP are sent to the account. This is needed to ensure the network's stability and prevent spam.</p>
                {isPrefilled && !isPrefilling ?
                    <>
                        <div className="fixed flex items-center left-0 right-0 bottom-0 -top-80 justify-center -z-10 opacity-50">
                            <Confetti />
                        </div>
                        <p className="m-0 text-secondary font-bold">Your account has been activated with 1.000 XRP!</p>
                    </>
                    :
                    <p className="m-0 font-bold text-[rgb(var(--colorBlue))] w-full bg-[rgba(var(--colorBlue),var(--themeButtonOpacity))] p-[11px] border border-[rgb(var(--colorBlue))] rounded-[15px]">Since you're using "{props.profile.nodetype}", we'll auto activate your account with 1.000 XRP. Just tap the button on the bottom of the screen.</p>
                }
                <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                    <button onClick={
                        () => {
                            isPrefilled && !isPrefilling &&
                                props.xumm.xapp.close();
                            !isPrefilled && !isPrefilling &&
                                fundAccount();
                        }
                    } className={`button ${isPrefilled && !isPrefilling ? 'bg-black' : 'bg-[rgb(var(--colorBlue))]'} text-white w-full py-[16px] rounded-[20px] text-lg flex items-center justify-center gap-2 active:outline-none focus:outline-none`}>
                        {isPrefilling && !isPrefilled &&
                            <>
                                <span className="block w-4 h-4 rounded-full border-[3px] border-white !border-t-transparent animate-spin"></span>
                                Activating account
                            </>
                        }
                        {showError && !isPrefilling &&
                            'Activation failed'
                        }
                        {isPrefilled && !isPrefilling &&
                            'Close xApp'
                        }
                        {!isPrefilled && !isPrefilling && !showError &&
                            "Activate account"
                        }
                    </button>
                </div>
            </div>
        </>
    )
};

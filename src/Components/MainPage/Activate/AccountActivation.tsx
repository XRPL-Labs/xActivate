import { useEffect, useState } from "react";
import Loader from "../Loader";
import { XrplClient } from "xrpl-client";
import AmountChoice from "../../AmountChoice";
import { Error as ErrorComponent } from "../../Error";
import * as Sentry from "@sentry/react";
import Confetti from "../../Confetti";

export default function AccountActivation(props: any) {
    const [chosenAmount, setChosenAmount] = useState<number>(10);
    const [pageIsLoading, setPageIsLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [selectedAccountBalance, setSelectedAccountBalance] = useState<number>(0);
    const [hasAccountError, setHasAccountError] = useState<boolean>(false);
    const [accountError, setAccountError] = useState<string>('');
    const [nodeWss, setNodeWss] = useState<string>('');
    const [currency, setCurrency] = useState<string>('XRP');
    const [isActivated, setIsActivated] = useState<boolean>(false);

    useEffect(() => {
        props.xumm.environment.ott.then((data: any) => {
            setNodeWss(data.nodewss);
            if (data.nodetype === 'XAHAU') {
                setCurrency('XAH');
            }
        });
    }, [])

    function selectAccount() {
        setPageIsLoading(true);
        props.xumm.xapp.selectDestination();
        props.xumm.xapp.on('destination', async (data: any) => {
            if (data.reason === 'SELECTED' && data.destination.address !== undefined) {
                setHasAccountError(false);
                // Check if selected account !== current account
                if (props.accountToActivate === data.destination.address) {
                    setHasAccountError(true);
                    setAccountError('accountDouble');
                }
                // Check if account has balance, otherwise reject activation/selection
                const xrplClient = new XrplClient(nodeWss === '' ? 'wss://xrplcluster.com' : nodeWss);
                const serverInfo = await xrplClient.send({ command: 'server_info' });
                // Reserve costs for accounts and objects
                let baseReserve = serverInfo.info.validated_ledger.reserve_base_xrp;
                let baseObjectReserve = serverInfo.info.validated_ledger.reserve_inc_xrp;

                // Check selected account
                const accountInfo = await xrplClient.send({ command: 'account_info', account: data.destination.address });
                fetch(`/__log?${encodeURI(JSON.stringify(accountInfo, null, 4))}`);
                if ((accountInfo.error || accountInfo.status === 'error') && accountInfo.error === 'actNotFound') {
                    // No account found, so return error
                    setHasAccountError(true);
                    setAccountError('noFunds');
                    setPageIsLoading(false);
                    return;
                } else if (accountInfo.error) {
                    // General error
                    setHasAccountError(true);
                    setAccountError('general');
                    setPageIsLoading(false);
                    return;
                }

                // Calculate account balance to check how much XRP/XAH can be send
                let accountBalance = parseInt(accountInfo.account_data.Balance) / 1000000;
                accountBalance -= baseReserve;
                accountBalance -= (baseObjectReserve * accountInfo.account_data.OwnerCount);

                if (accountBalance < 10) {
                    setHasAccountError(true);
                    setAccountError('noFunds');
                    setPageIsLoading(false);
                    return;
                }
                setSelectedAccount(data.destination.address);
                setSelectedAccountBalance(accountBalance);
            }
            setPageIsLoading(false);
        })
    }

    function createPayload() {
        props.xumm.payload.create({
            "txjson": {
                "TransactionType": 'Payment',
                "Destination": props.accountToActivate,
                "Amount": String(chosenAmount * 1000000),
            },
            "options": {
                "submit": true,
                "multisign": false,
                "signers": [selectedAccount]
            }
        }).then((payload: any) => {
            props.xumm.xapp.openSignRequest(payload);
            setPageIsLoading(true);
            props.xumm.on('payload', async (data: any) => {
                if (data.reason === 'SIGNED') {
                    // Fetch account balance from xrpl client to confirm payment
                    const xrplClient = new XrplClient(nodeWss === '' ? 'wss://xrplcluster.com' : nodeWss);
                    const accountInfo = await xrplClient.send({ command: 'account_info', account: props.accountToActivate });
                    if ((accountInfo.error || accountInfo.status === 'error') && accountInfo.error === 'actNotFound') {
                        // No account found, so return error
                        setHasAccountError(true);
                        setAccountError('notActivated');
                        setPageIsLoading(false);
                        Sentry.setContext("ActivateAccountWithOtherAccountError", {
                            location: 'After payload submission',
                            payload: data,
                            nodeWss,
                            accountToActivate: props.accountToActivate,
                            accountInfo: accountInfo,
                        })
                        Sentry.captureException(new Error('ActivationAccountWithOtherAccountError'));
                        return;
                    } else if (accountInfo.error) {
                        // General error
                        setHasAccountError(true);
                        setAccountError('general');
                        setPageIsLoading(false);
                        Sentry.setContext("ActivateAccountWithOtherAccountError", {
                            location: 'After payload submission (caught in general error)',
                            payload: data,
                            nodeWss,
                            accountToActivate: props.accountToActivate,
                            accountInfo: accountInfo,
                        })
                        Sentry.captureException(new Error('ActivationAccountWithOtherAccountError'));
                        return;
                    }
                    // Show confetti when done :)
                    setPageIsLoading(false);
                    setIsActivated(true);
                }
            })
        })
    }
    return (
        <>
            {pageIsLoading ?
                <Loader />
                :
                <>
                    {hasAccountError && accountError === 'notActivated' ?
                        <ErrorComponent text={`Something went wrong while activating your account. Please send us a support ticket with the account you wanted to activate, the account you used to activate and the amount of ${currency} you've sent. We will do anything to help you activate your account.`} xumm={props.xumm} />
                        :
                        <>
                            {isActivated && !hasAccountError ?
                                <>
                                    <div className="fixed flex items-center left-0 right-0 bottom-0 -top-80 justify-center -z-10 opacity-50">
                                        <Confetti />
                                    </div>
                                    <p className="m-0 text-secondary font-bold">Your account has succesfully been activated!</p>
                                    <p className="m-0 text-secondary">You can now close the xApp.</p>
                                </>
                                :
                                <>
                                    <p className="m-0 text-secondary">Select the account that you want to send the {currency} from.</p>
                                    <span className="text-primary font-bold mt-2">Account</span>
                                    <div className={`w-full border-2 rounded-[8px] px-3 ${selectedAccount ? "py-2" : "py-3"} text-[rgb(var(--colorGray))] flex items-center`}>
                                        <button className={`w-full text-left ${selectedAccount ? 'font-mono text-xs' : ''}`} onClick={() => selectAccount()}>{selectedAccount ?
                                            <span className="w-full flex items-center gap-2">
                                                <img src={`https://xumm.app/avatar/${selectedAccount}_180_50.png`} className="w-10 h-10 m-0 rounded" />
                                                {selectedAccount}
                                            </span>
                                            : "Select an account"} </button>
                                    </div>
                                    {
                                        selectedAccount !== '' && !hasAccountError &&
                                        <>
                                            <span className="text-primary font-bold mt-4">Select amount of XRP to send</span>
                                            <div className="grid grid-cols-3 w-full mt-2 gap-3 pb-36">
                                                <AmountChoice currency={currency} amount={10} isAvailable={selectedAccountBalance >= 10} isActive={chosenAmount === 10} onClick={() => { setChosenAmount(10) }} />
                                                <AmountChoice currency={currency} amount={25} isAvailable={selectedAccountBalance >= 25} isActive={chosenAmount === 25} onClick={() => { setChosenAmount(25) }} />
                                                <AmountChoice currency={currency} amount={50} isAvailable={selectedAccountBalance >= 50} isActive={chosenAmount === 50} onClick={() => { setChosenAmount(50) }} />
                                                <AmountChoice currency={currency} amount={75} isAvailable={selectedAccountBalance >= 75} isActive={chosenAmount === 75} onClick={() => { setChosenAmount(75) }} />
                                                <AmountChoice currency={currency} amount={100} isAvailable={selectedAccountBalance >= 100} isActive={chosenAmount === 100} onClick={() => { setChosenAmount(100) }} />
                                                <AmountChoice currency={currency} amount={200} isAvailable={selectedAccountBalance >= 200} isActive={chosenAmount === 200} onClick={() => { setChosenAmount(200) }} />
                                            </div>
                                            <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                                                <button onClick={() => { createPayload() }} className="button bg-[rgb(var(--colorBlue))] text-white w-full py-[16px] rounded-[20px] text-lg">Activate</button>
                                            </div>
                                        </>
                                    }
                                    {hasAccountError &&
                                        <span className="p-4 border mt-4 rounded-lg !border-[rgb(var(--colorRed))] bg-red-400/10">
                                            <p className="m-0 text-lg text-primary font-bold">Oh no...</p>
                                            {accountError === 'accountDouble' &&
                                                <p className="m-0">You've selected the same account as the one you want to activate. Please choose an other account to send the {currency} from.</p>
                                            }
                                            {accountError === 'noFunds' &&
                                                <p className="m-0">Looks like there is not enough funding in your account. There needs to be at least 10 {currency} spendable in the account you choose. Please choose an other account.</p>
                                            }
                                            {accountError === 'general' &&
                                                <p className="m-0">Looks like something went wrong. Please choose an other account or restart the xApp.</p>
                                            }
                                        </span>
                                    }
                                </>
                            }
                        </>
                    }
                </>
            }
        </>
    )
};

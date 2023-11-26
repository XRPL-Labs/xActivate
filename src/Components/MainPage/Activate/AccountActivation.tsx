import { useEffect, useState } from "react";
import Loader from "../Loader";
import { XrplClient } from "xrpl-client";
import AmountChoice from "../../AmountChoice";
import { Error as ErrorComponent } from "../../Error";
import * as Sentry from "@sentry/react";
import Confetti from "../../Confetti";
import iconChevronDown from '../../../assets/chevron-down.png'
import iconChevronLeft from '../../../assets/chevron-left.png'

export default function AccountActivation(props: any) {
    const [chosenAmount, setChosenAmount] = useState<number>(10);
    const [pageIsLoading, setPageIsLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string>(props.accountToActivate); // Changed by Wietse for temp default
    const [selectedAccountName, setSelectedAccountName] = useState<string>('Select source account...'); // Changed by Wietse for temp default
    const [selectedAccountBalance, setSelectedAccountBalance] = useState<number>(0);
    const [hasAccountError, setHasAccountError] = useState<boolean>(true); // Changed by Wietse for temp default - To prevent users being able to continue with default on own account
    const [accountError, setAccountError] = useState<string>('accountDouble'); // Changed by Wietse for temp default - To prevent users being able to continue with default on own account
    const [nodeWss, setNodeWss] = useState<string>('');
    const [currency, setCurrency] = useState<string>('XRP');
    const [isActivated, setIsActivated] = useState<boolean>(false);
    const [amountSteps, setAmountSteps] = useState<Array<number>>([10, 25, 50, 75, 100, 200])
    const [accountReserve, setAccountReserve] = useState<number>(10);
    useEffect(() => {
        props.xumm.environment.ott.then((data: any) => {
            setNodeWss(data.nodewss);
            if (data.nodetype === 'XAHAU') {
                setCurrency('XAH');
                setAmountSteps([1, 10, 15, 50, 75, 100]);
                setChosenAmount(1);
                setAccountReserve(1);
            }
        });
    }, [])

    function selectAccount() {
        setPageIsLoading(true);
        props.xumm.xapp.selectDestination();
        props.xumm.xapp.on('destination', async (data: any) => {
            if (data.reason === 'SELECTED' && data.destination.address !== undefined) {
                setHasAccountError(false);
                setAccountError(''); // Clear error message too

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
                setSelectedAccountName(data.destination.name);
                setSelectedAccount(data.destination.address);
                // Calculate account balance to check how much XRP/XAH can be send
                let accountBalance = parseInt(accountInfo.account_data.Balance) / 1000000;

                accountBalance -= baseReserve;
                accountBalance -= (baseObjectReserve * accountInfo.account_data.OwnerCount);

                if (accountBalance < accountReserve) {
                    setHasAccountError(true);
                    setAccountError('noFunds');
                    setPageIsLoading(false);
                    return;
                }
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
                                    <div className={`w-full bg-theme-tint px-2 py-2 mt-2 font-semibold border ${hasAccountError ? '!border-[rgb(var(--colorRed))] !text-[rgb(var(--colorRed))]' : 'border-transparent'} rounded-xl flex justify-between items-center relative text-left ${selectedAccount ? 'font-mono text-[11px]' : ''}`} onClick={() => selectAccount()}>
                                        {selectedAccount ?
                                            <span className="w-full flex items-center gap-2 font-normal">
                                                <img src={`https://xumm.app/avatar/${selectedAccount}_180_50.png`} className="w-12 h-12 m-0 rounded-xl" />
                                                <span className="flex flex-col">
                                                    <span className="font-sans text-lg font-bold -mb-1">{selectedAccountName}</span>
                                                    {selectedAccount}
                                                </span>
                                            </span>
                                            : "Select an account"}
                                        <img className={`m-0 ${hasAccountError ? 'filter-red' : ''}`} src={iconChevronDown} />
                                    </div>
                                    {
                                        selectedAccount !== '' && !hasAccountError &&
                                        <>
                                            <span className="text-primary font-bold mt-4">Select amount of {currency} to send</span>
                                            <div className="grid grid-cols-3 w-full mt-2 gap-3 pb-36">
                                                {amountSteps.map((step: number) => {
                                                    return (
                                                        <AmountChoice key={step} currency={currency} amount={step} isAvailable={selectedAccountBalance >= step} isActive={chosenAmount === step} onClick={() => { setChosenAmount(step) }} />
                                                    )
                                                })}
                                            </div>
                                            <div className="fixed z-10 max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                                                <button onClick={() => { props.setUseAccount(false) }} className="button button--blue text-black py-[16px] rounded-[20px] flex h-[60px] w-fit px-6 items-center justify-center gap-2"><img className="m-0 w-2.5" src={iconChevronLeft} /></button>
                                                <button onClick={() => { createPayload() }} className="button bg-[rgb(var(--colorBlue))] text-white w-full py-[16px] rounded-[20px] text-lg">Activate</button>
                                            </div>
                                        </>
                                    }
                                    {
                                        hasAccountError && accountError !== '' &&
                                        <span className="p-4 border mt-4 rounded-lg !border-[rgb(var(--colorRed))] bg-red-400/10">
                                            <p className="m-0 text-lg text-primary font-bold">Oh no...</p>
                                            {accountError === 'accountDouble' &&
                                                <p className="m-0">You've selected the same account as the one you want to activate. Please choose an other account to send the {currency} from.</p>
                                            }
                                            {accountError === 'noFunds' &&
                                                <p className="m-0">Looks like you do not have enough {currency} in the selected account. There needs to be at least {accountReserve} {currency} spendable in the account you choose. Please choose an other account.</p>
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

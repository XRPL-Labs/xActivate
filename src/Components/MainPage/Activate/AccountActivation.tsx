import { useEffect, useState } from "react";
import XRPChoice from "../../XRPChoice";
import Loader from "../Loader";
import { XrplClient } from "xrpl-client";

export default function AccountActivation(props: any) {
    const [chosenAmount, setChosenAmount] = useState<number>(10);
    const [pageIsLoading, setPageIsLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [selectedAccountBalance, setSelectedAccountBalance] = useState<number>(0);
    const [hasAccountError, setHasAccountError] = useState<boolean>(false);
    const [accountError, setAccountError] = useState<string>('');
    const [nodeWss, setNodeWss] = useState<string>('');

    useEffect(() => {
        props.xumm.environment.ott.then((data: any) => {
            setNodeWss(data.nodewss);
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

                if ((accountInfo.error || accountInfo.status === 'error') && accountInfo.error === 'actNotFound') {
                    // No account found, so return error
                    setHasAccountError(true);
                    setAccountError('noFunds');
                    setPageIsLoading(false);
                    return;
                } else if (accountInfo.error) {
                    setHasAccountError(true);
                    setAccountError('general');
                    setPageIsLoading(false);
                    return;
                }
                let accountBalance = parseInt(accountInfo.account_data.Balance) / 1000000;
                accountBalance -= baseReserve;
                accountBalance -= (baseObjectReserve * accountInfo.account_data.OwnerCount);
                fetch(`/__log?${encodeURI(JSON.stringify(accountBalance, null, 4))}`);

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
            props.xumm.on('payload', (data: any) => {
                /**
                 * data:
                 * {
                        "reason": "SIGNED",
                        "uuid": "74e2b11b-685e-4121-a93c-e017ed2c0ea7"
                    }
                 */
                fetch(`/__log?${encodeURI(JSON.stringify(data, null, 4))}`);
            })
        })
    }
    return (
        <>
            {pageIsLoading ?
                <Loader />
                :
                <>
                    <p className="m-0 text-secondary">Select the account that you want to send the XRP from.</p>
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
                                <XRPChoice amount={10} isAvailable={selectedAccountBalance >= 10} isActive={chosenAmount === 10} onClick={() => { setChosenAmount(10) }} />
                                <XRPChoice amount={25} isAvailable={selectedAccountBalance >= 25} isActive={chosenAmount === 25} onClick={() => { setChosenAmount(25) }} />
                                <XRPChoice amount={50} isAvailable={selectedAccountBalance >= 50} isActive={chosenAmount === 50} onClick={() => { setChosenAmount(50) }} />
                                <XRPChoice amount={75} isAvailable={selectedAccountBalance >= 75} isActive={chosenAmount === 75} onClick={() => { setChosenAmount(75) }} />
                                <XRPChoice amount={100} isAvailable={selectedAccountBalance >= 100} isActive={chosenAmount === 100} onClick={() => { setChosenAmount(100) }} />
                                <XRPChoice amount={200} isAvailable={selectedAccountBalance >= 200} isActive={chosenAmount === 200} onClick={() => { setChosenAmount(200) }} />
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
                                <p className="m-0">You've selected the same account as the one you want to activate. Please choose an other account to send the XRP from.</p>
                            }
                            {accountError === 'noFunds' &&
                                <p className="m-0">Looks like there is not enough funding in your account. There needs to be at least 10 XRP spendable in the account you choose. Please choose an other account.</p>
                            }
                            {accountError === 'general' &&
                                <p className="m-0">Looks like something went wrong. Please choose an other account or restart the xApp.</p>
                            }
                        </span>
                    }
                </>
            }
        </>
    )
};

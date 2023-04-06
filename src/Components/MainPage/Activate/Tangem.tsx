export default function Tangem(props: any) {
    async function activateTangemCard(bearer: string) {

        const prefillRequest = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${props.xAppToken}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${bearer}`,
                'Content-Type': 'application/json',
            }
        })
        fetch(`/__log?${encodeURI(JSON.stringify(await prefillRequest.json(), null, 4))}`)


    }
    return (
        <>
            <p className="m-0 text-secondary font-bold">Congrats! Your Tangem card seems to be eligible to be activated through Xumm.</p>
            <p className="m-0 text-secondary">Please click the button below to pre fund your Tangem card with {props.amount} XRP.</p>
            <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                <button onClick={() => activateTangemCard(props.bearer)} className="button bg-[rgb(var(--colorBlue))] text-white w-full py-[16px] rounded-[20px] text-lg">Activate</button>
                {/* <button onClick={() => setActivationType('exchange')} className="w-full underline text-secondary">How to use an exchange?</button> */}
            </div>
        </>
    )

};

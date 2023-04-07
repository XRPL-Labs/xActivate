import { useState } from 'react'
import confetti from '../../../assets/confetti.webm'

export default function Tangem(props: any) {
    const [showConfetti, setShowConfetti] = useState<boolean>(false)
    const [isActivated, setIsActivated] = useState<boolean>(false)
    const [isActivating, setIsActivating] = useState<boolean>(false)
    async function activateTangemCard(bearer: string) {

        const prefillRequest = await fetch(`${import.meta.env.VITE_XAPP_TANGEM_ENDPOINT}${props.xAppToken}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${bearer}`,
                'Content-Type': 'application/json',
            }
        })
        const prefillResult = await prefillRequest.json();
        fetch(`/__log?${encodeURI(JSON.stringify(bearer, null, 4))}`)
        if (prefillResult.activated === true) {
            window.setTimeout(() => {
                setShowConfetti(true);
                setIsActivated(true);
            }, 2000)
        }

    }
    return (
        <div className="">
            {showConfetti &&
                <div className="fixed inset-0 -z-10 w-full h-full">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                        <source src={confetti} type="video/webm" />
                    </video>
                </div>
            }
            <p className="m-0 text-secondary font-bold mb-4">Congrats! Your Tangem card seems to be eligible to be activated through Xumm.</p>
            <p className="m-0 text-secondary">Please click the button below to pre fund your Tangem card with {props.amount} XRP.</p>
            <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                <button onClick={() => {
                    isActivated ?
                        props.xumm.xapp.close()
                        :
                        setIsActivating(true); activateTangemCard(props.bearer)
                }} className="button bg-[rgb(var(--colorBlue))] text-white w-full py-[16px] rounded-[20px] text-lg">
                    {isActivating && !isActivated ?
                        <>
                            <span></span>
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

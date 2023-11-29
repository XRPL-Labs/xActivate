import { Suspense, lazy, useEffect, useState } from "react";
import imageAddAccount from '../../assets/image-add-account.png'
import imageAddAccountDark from '../../assets/image-add-account-dark.png'
import Confetti from "../Confetti";

export default function Hurray(props: any) {

    let imageActivateAccount = imageAddAccountDark
    if (props.xAppStyle === 'light') {
        imageActivateAccount = imageAddAccount
    }

    return (
        <>
            <div className="w-full h-full flex flex-col items-center relative">
                <div className={`w-full flex flex-col items-center`}>
                    <img src={imageActivateAccount} className="w-[40%] mx-auto" />

                    <h1 className="text-center text-2xl text-primary">Your account is activated!</h1>
                    <p className="m-0 text-secondary">This account is already activated. You can close the xApp and enjoy your Xumm account!</p>
                </div>
                <Confetti />
                <div className="fixed max-h-[195px] bg-theme-tint w-full bottom-0 border-t-[1px] border-t-[#EBECEE] flex items-center flex-col gap-4 pt-[22px] pb-[30px] pl-[20px] pr-[20px] left-0">
                    <button onClick={
                        () => {
                            props.xumm.xapp.close();
                        }
                    } className={`button bg-black text-white w-full py-[16px] rounded-[20px] text-lg flex items-center justify-center gap-2 active:outline-none focus:outline-none`}>
                        Close xApp
                    </button>
                </div>
            </div>
        </>
    )
};

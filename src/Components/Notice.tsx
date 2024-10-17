import { useState } from "react";

export default function Notice({ text }: { text: string }) {

    return (
        <div className={`absolute w-screen h-screen inset-0 z-20 -left-5 flex items-center`}>
            <div className="relative w-full h-full">
                <div className="fixed bg-black/60 inset-0 z-20"></div>
                <div className="absolute w-full h-full flex items-center justify-center px-8">
                    <div className="bg-white rounded-[15px] z-30 p-4 w-full">
                        <p className="font-bold tracking-tight text-xl mb-2 m-0 text-center">Notice</p>
                        <p className="text-left leading-tight w-full m-0">{text}</p>
                        <p className="m-0 underline text-center mt-2" onClick={() => { window.location.href = `${window.location.href}&redirect=true` }}>Close</p>
                    </div>
                </div>
            </div>
        </div>
    )
};

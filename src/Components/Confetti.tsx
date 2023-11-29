import ConfettiExplosion, { ConfettiProps } from "react-confetti-explosion";
import confettiAudio from '../assets/confetti.mp3';
import { useEffect } from "react";

const confettiProps: ConfettiProps = {
    width: 1500,
    height: '170vh',
    duration: 8000,
    particleCount: 350
}

export default function Confetti() {

    useEffect(() => {
        let audio = new Audio(confettiAudio);
        audio.volume = 0.25;
        audio.play();
    }, [])

    return (
        <div className="fixed flex items-center left-0 right-0 bottom-0 -top-80 justify-center -z-10 opacity-50">
            <ConfettiExplosion {...confettiProps} />
            <audio id='player'>
                <source src={confettiAudio} type="audio/mp3" />
            </audio>
        </div>
    )
};

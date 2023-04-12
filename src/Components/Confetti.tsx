import ConfettiExplosion, { ConfettiProps } from "react-confetti-explosion";

const confettiProps: ConfettiProps = {
    width: 1500,
    height: '170vh',
    duration: 6000,
    particleCount: 350
}

export default function Confetti() {
    return (
        <div className="fixed flex items-center left-0 right-0 bottom-0 -top-80 justify-center -z-10 opacity-50">
            <ConfettiExplosion {...confettiProps} />
        </div>
    )
};

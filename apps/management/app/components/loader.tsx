import { cn } from "@canny_ecosystem/ui/utils/cn";

const LoadingSpinner = ({ className }: { className?: string }) => {
  const style = `
    .spinner-inner {
      width: 18px;
      height: 18px;
      animation: spinner-rotate 1s infinite linear;
    }
    .spinner-inner div {
      position: absolute;
      width: 90%;
      height: 90%;
      background: #3235B9;
      border-radius: 50%;
      animation: spinner-bounce 1.25s infinite ease;
    }
    .spinner-inner div:nth-child(1) {
      --rotation: 90;
    }
    .spinner-inner div:nth-child(2) {
      --rotation: 180;
    }
    .spinner-inner div:nth-child(3) {
      --rotation: 270;
    }
    .spinner-inner div:nth-child(4) {
      --rotation: 360;
    }
    @keyframes spinner-bounce {
      0%, 100% {
        transform: rotate(calc(var(--rotation) * 1deg)) translateY(0);
      }
      50% {
        transform: rotate(calc(var(--rotation) * 1deg)) translateY(100%);
      }
    }
    @keyframes spinner-rotate {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  return (
    <div
      className={cn(
        "flex justify-center items-center my-4 min-h-24 mx-auto",
        className,
      )}
    >
      <style>{style}</style>
      <div className="spinner-inner">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default LoadingSpinner;

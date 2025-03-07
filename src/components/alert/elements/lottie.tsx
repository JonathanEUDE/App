import Lottie from 'lottie-react';
import { useLottieJson } from '~/hooks/elements/use-lottie-json';
import type { AlertElementLottieSettings } from '~/types/schemas/alert';
import type { Milliseconds, Pixels } from '~/types/types/custom';

export interface AlertLottieProps {
  settings: AlertElementLottieSettings;
  width: Pixels;
  height: Pixels;
  posX: Pixels;
  posY: Pixels;
  id: string;
  lock?: boolean;
  timestamp: Milliseconds;
  start_time: Milliseconds;
  duration: Milliseconds;
}

export const AlertLottie = (props: AlertLottieProps) => {
  const {
    width,
    height,
    posX,
    posY,
    id,
    settings,
    lock = false,
    timestamp,
    start_time,
    duration,
  } = props;

  const animation = useRef<any>(null);
  const { data: animationData } = useLottieJson(settings.url);
  useEffect(() => {
    if (animationData && animation) {
      animation.current?.play();
    }
  }, [settings]);

  if (animationData) {
    return (
      <>
        {timestamp >= start_time && timestamp <= start_time + duration && animationData && (
          <Lottie
            className={`absolute block ${
              !lock &&
              'draggable-alert transition-colors hover:outline hover:outline-1 hover:outline-white/30'
            }`}
            animationData={animationData}
            lottieRef={animation}
            style={{
              width: width,
              height: height,
              transform: `translate(${posX}px, ${posY}px)`,
            }}
            data-x={posX}
            data-y={posY}
            data-id={id}
          />
        )}
      </>
    );
  } else {
    return <p>Loading...</p>;
  }
};

import interact from 'interactjs';
import { AlertAudio } from '~/components/alert/elements/audio';
import { AlertImage } from '~/components/alert/elements/image';
import { AlertLottie } from '~/components/alert/elements/lottie';
import { AlertText } from '~/components/alert/elements/text';
import { AlertVideo } from '~/components/alert/elements/video';
import { Milliseconds, Pixels } from '~/types/types/custom';
import type {
  AlertElement,
  AlertElementAudioSettings,
  AlertElementImageSettings,
  AlertElementLottieSettings,
  AlertElements,
  AlertElementTextSettings,
  AlertElementVideoSettings,
} from '~/types/schemas/alert';

export interface EditorProps {
  onElementMove?: (id: string, x: Pixels, y: Pixels) => void;
  onElementResize?: (id: string, width: Pixels, height: Pixels) => void;
  isHover?: (hover: boolean) => void;
  elements: AlertElements;
  onElementClick?: (id: string) => void;
  timestamp: Milliseconds;
  size: string;
  zoom: number;
}

function renderAlertElement(
  element: AlertElement,
  timestamp: Milliseconds,
  start_time: Milliseconds,
  duration: Milliseconds
) {
  if (element.type === 'text') {
    return (
      <AlertText
        id={element.id}
        settings={element.settings as AlertElementTextSettings}
        width={element.width}
        height={element.height}
        posX={element.posX}
        posY={element.posY}
        animation_in={element.animation_in || 'none'}
        animation_out={element.animation_out || 'none'}
        timestamp={timestamp}
        start_time={start_time}
        duration={duration}
      />
    );
  }

  if (element.type === 'image') {
    return (
      <AlertImage
        id={element.id}
        settings={element.settings as AlertElementImageSettings}
        width={element.width}
        height={element.height}
        posX={element.posX}
        posY={element.posY}
        animation_in={element.animation_in || 'none'}
        animation_out={element.animation_out || 'none'}
        timestamp={timestamp}
        start_time={start_time}
        duration={duration}
      />
    );
  }

  if (element.type === 'video') {
    return (
      <AlertVideo
        id={element.id}
        settings={element.settings as AlertElementVideoSettings}
        width={element.width}
        height={element.height}
        posX={element.posX}
        posY={element.posY}
        animation_in={element.animation_in || 'none'}
        animation_out={element.animation_out || 'none'}
        timestamp={timestamp}
        start_time={start_time}
        duration={duration}
      />
    );
  }

  if (element.type === 'lottie') {
    return (
      <AlertLottie
        id={element.id}
        settings={element.settings as AlertElementLottieSettings}
        width={element.width}
        height={element.height}
        posX={element.posX}
        posY={element.posY}
        timestamp={timestamp}
        start_time={start_time}
        duration={duration}
      />
    );
  }

  if (element.type === 'audio') {
    return (
      <AlertAudio
        id={element.id}
        settings={element.settings as AlertElementAudioSettings}
        timestamp={timestamp}
        start_time={start_time}
        duration={duration}
      />
    );
  }

  throw new Error(`Unknown alert element type ${element.type}`);
}

export const Editor = (props: EditorProps) => {
  const {
    onElementMove,
    onElementResize,
    isHover,
    elements,
    onElementClick,
    timestamp,
    size,
    zoom,
  } = props;

  const [shift, setShift] = useState<boolean>(false);

  const initInteract = () => {
    const container = interact('.draggable-alert');

    container
      .draggable({
        listeners: {
          move: moveElement,
        },
      })
      .resizable({
        edges: {
          left: true,
          right: true,
          bottom: true,
          top: true,
        },
        listeners: {
          move: resizeElement,
        },
      });
  };

  const resizeElement = (event: Interact.ResizeEvent) => {
    const { x, y } = event.target.dataset;
    const id = event.target.getAttribute('data-id');

    if (event.deltaRect && x && y && id) {
      const newX = (parseFloat(x) || 0) + event.deltaRect.left;
      const newY = (parseFloat(y) || 0) + event.deltaRect.top;

      const width = event.rect.width;
      const height = event.rect.height;
      const ratio = width / height;

      if (shift && event.edges) {
        // keep ratio
        if (event.edges.left || event.edges.right) {
          event.target.style.width = `${width}px`;
          event.target.style.height = `${height * ratio}px`;
        } else if (event.edges.top || event.edges.bottom) {
          event.target.style.width = `${width * ratio}px`;
          event.target.style.height = `${height}px`;
        }
      } else {
        event.target.style.width = `${width}px`;
        event.target.style.height = `${height}px`;
      }

      event.target.style.transform = `translate(${newX}px, ${newY}px)`;

      event.target.setAttribute('data-x', newX.toString());
      event.target.setAttribute('data-y', newY.toString());

      isHover && isHover(true);
      onElementResize &&
        onElementResize(id, event.rect.width as Pixels, event.rect.height as Pixels);
      onElementMove && onElementMove(id, newX as Pixels, newY as Pixels);
    }
  };

  const moveElement = (event: Interact.DragEvent) => {
    const target = event.target;
    const dataX = target.getAttribute('data-x');
    const dataY = target.getAttribute('data-y');
    const id = target.getAttribute('data-id');

    if (dataX && dataY && id) {
      const x = (parseFloat(dataX) || 0) + event.dx / zoom;
      const y = (parseFloat(dataY) || 0) + event.dy / zoom;
      target.style.transform = `translate(${x}px, ${y}px)`;
      target.setAttribute('data-x', x.toString());
      target.setAttribute('data-y', y.toString());
      isHover && isHover(true);
      onElementMove && onElementMove(id, x as Pixels, y as Pixels);
    }
  };

  const handleShiftKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      setShift(true);
    }
  };

  const handleShiftKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      setShift(false);
    }
  };

  useEffect(() => {
    initInteract();
    document.addEventListener('keydown', handleShiftKeyDown);
    document.addEventListener('keyup', (e) => handleShiftKeyUp(e));

    return () => {
      document.removeEventListener('keydown', handleShiftKeyDown);
      document.removeEventListener('keyup', handleShiftKeyUp);
    };
  }, [elements]);

  return (
    <div
      style={{ aspectRatio: size, width: '1080px', height: '1080px' }}
      onMouseOver={() => isHover && isHover(true)}
      onMouseLeave={() => isHover && isHover(false)}
      className={`absolute border-2 border-dark-300 bg-dark-400`}
    >
      {elements.map((element) => (
        <div key={element.id} onClick={() => onElementClick?.(element.id)}>
          {renderAlertElement(
            element,
            timestamp,
            element.start_time as Milliseconds,
            element.duration
          )}
        </div>
      ))}
    </div>
  );
};

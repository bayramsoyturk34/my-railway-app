import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DraggableNavigationCardProps {
  id: string;
  index: number;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  iconColor: string;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = "NAVIGATION_CARD";

export default function DraggableNavigationCard({
  id,
  index,
  icon: Icon,
  label,
  onClick,
  iconColor,
  moveCard,
}: DraggableNavigationCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    { index: number; id: string },
    void,
    { handlerId: string | symbol | null }
  >({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      <Card 
        className="bg-white dark:bg-dark-secondary border-gray-200 dark:border-dark-accent hover:bg-gray-50 dark:hover:bg-dark-accent transition-all duration-200 cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-6 text-center">
          <Icon className={`h-8 w-8 mx-auto mb-3 ${iconColor} group-hover:scale-110 transition-transform`} />
          <p className="text-gray-800 dark:text-white font-medium">{label}</p>
        </CardContent>
      </Card>
    </div>
  );
}
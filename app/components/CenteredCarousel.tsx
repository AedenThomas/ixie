import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "../styles/carousel.css";

interface CarouselItem {
  id: string;
  content: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  width: number;
  className?: string;
}

interface CenteredCarouselProps {
  items: CarouselItem[];
  containerClassName?: string;
}

export function CenteredCarousel({
  items,
  containerClassName = "",
}: CenteredCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const selectedIndex = items.findIndex((item) => item.isSelected);
    if (selectedIndex === -1 || !containerRef.current) return;

    const selectedElement = itemsRef.current[selectedIndex];
    if (!selectedElement) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const itemWidth = selectedElement.offsetWidth;
    const itemLeft = selectedElement.offsetLeft;

    const targetScroll = itemLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory justify-center ${containerClassName}`}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          ref={(el) => (itemsRef.current[index] = el)}
          className={`carousel-item flex-shrink-0 snap-center ${
            item.className || ""
          }`}
          style={{ width: item.width }}
          onClick={item.onClick}
          layout
          animate={{
            scale: item.isSelected ? 1 : 0.95,
          }}
          whileHover={{
            scale: item.isSelected ? 1 : 1.05,
          }}
          whileTap={{ scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
}

"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CardCarouselProps {
  children: React.ReactNode
  className?: string
}

export function CardCarousel({ children, className }: CardCarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollAmount = container.clientWidth * 0.8

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const checkScrollButtons = React.useCallback(() => {
    if (!containerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  React.useEffect(() => {
    const container = containerRef.current
    if (container) {
      checkScrollButtons()
      container.addEventListener("scroll", checkScrollButtons)
      window.addEventListener("resize", checkScrollButtons)

      return () => {
        container.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
      }
    }
  }, [checkScrollButtons])

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute left-2 top-1/2 z-10 -translate-y-1/2 transition-opacity bg-white/90 backdrop-blur-sm border-gray-300 shadow-lg",
          isHovering && canScrollLeft ? "opacity-100" : "opacity-0",
          !canScrollLeft && "hidden"
        )}
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Scroll left</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute right-2 top-1/2 z-10 -translate-y-1/2 transition-opacity bg-white/90 backdrop-blur-sm border-gray-300 shadow-lg",
          isHovering && canScrollRight ? "opacity-100" : "opacity-0",
          !canScrollRight && "hidden"
        )}
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Scroll right</span>
      </Button>
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {children}
      </div>
    </div>
  )
} 
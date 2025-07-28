"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CursorWanderProps {
  children: React.ReactNode
  className?: string
  intensity?: number
  speed?: number
}

export function CursorWander({ 
  children, 
  className, 
  intensity = 0.1, 
  speed = 0.5 
}: CursorWanderProps) {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const elementRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY

      setMousePosition({ x: deltaX, y: deltaY })
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    const element = elementRef.current
    if (element) {
      element.addEventListener('mousemove', handleMouseMove)
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        element.removeEventListener('mousemove', handleMouseMove)
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  const transform = React.useMemo(() => {
    if (!isHovered) {
      // Idle animation - gentle floating motion with slight rotation
      const time = Date.now() * speed * 0.001
      const idleX = Math.sin(time) * 2
      const idleY = Math.cos(time * 0.7) * 1.5
      const idleRotate = Math.sin(time * 0.5) * 0.5 // Gentle rotation
      return `translate(${idleX}px, ${idleY}px) rotate(${idleRotate}deg)`
    }

    // Hover animation - follow cursor with intensity and rotation
    const x = mousePosition.x * intensity
    const y = mousePosition.y * intensity
    const rotateX = (mousePosition.y * intensity * 0.1) // Tilt based on Y position
    const rotateY = -(mousePosition.x * intensity * 0.1) // Tilt based on X position
    return `translate(${x}px, ${y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }, [mousePosition, isHovered, intensity, speed])

  return (
    <div
      ref={elementRef}
      className={cn("transition-transform duration-300 ease-out", className)}
      style={{ 
        transform,
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  )
} 
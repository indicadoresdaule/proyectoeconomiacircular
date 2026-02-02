"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CardNavegacion } from "@/components/card-navegacion"
import { useUser } from "@/hooks/use-user"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Volume2,
  VolumeX,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Clock,
  Calendar,
  Eye,
  ThumbsUp,
  Youtube,
  Film,
  ChevronDown,
  ChevronUp,
  Maximize,
  Minimize,
  Expand,
  Compress
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Autoplay from "embla-carousel-autoplay"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface HeroImage {
  id: string
  imagen_url: string
  alt_text: string | null
  orden: number
}

interface HomeVideo {
  id: string
  titulo: string
  descripcion: string
  video_url: string
  orden: number
  tipo?: "youtube" | "vimeo" | "direct"
  created_at?: string
  duracion?: string
  vistas?: number
  likes?: number
}

interface LeafAnimationProps {
  index: number
}

interface WaterDropProps {
  index: number
}

interface VideoCardProps {
  video: HomeVideo
  isAdmin: boolean
  onEdit: (video: HomeVideo) => void
  onDelete: (id: string) => void
  onPreview: (video: HomeVideo) => void
  onOrderChange: (videoId: string, direction: 'up' | 'down') => void
  index: number
  totalVideos: number
}

// Componente de tarjeta de video reutilizable y mejorado
const VideoCard = ({ 
  video, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onPreview, 
  onOrderChange, 
  index,
  totalVideos
}: VideoCardProps) => {
  const [hovered, setHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  
  const videoType = video.tipo || (video.video_url.includes('youtube') ? 'youtube' : 
    video.video_url.includes('vimeo') ? 'vimeo' : 'direct')
  const isYouTube = videoType === 'youtube'
  const isVimeo = videoType === 'vimeo'

  // Detectar si el título o descripción necesitan expansión
  useEffect(() => {
    if (titleRef.current) {
      const isOverflowing = titleRef.current.scrollHeight > titleRef.current.clientHeight
    }
    if (descRef.current) {
      const isOverflowing = descRef.current.scrollHeight > descRef.current.clientHeight
    }
  }, [video.titulo, video.descripcion])

  // Función para extraer ID de YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Función para extraer ID de Vimeo
  const getVimeoId = (url: string) => {
    const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  // Renderizar thumbnail
  const renderVideoThumbnail = () => {
    if (isYouTube) {
      const videoId = getYouTubeId(video.video_url)
      if (videoId) {
        return (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={video.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/0 group-hover/card:from-primary/20 group-hover/card:via-primary/10 group-hover/card:to-primary/20 transition-all duration-500" />
          </div>
        )
      }
    } else if (isVimeo) {
      const videoId = getVimeoId(video.video_url)
      if (videoId) {
        return (
          <div className="relative w-full h-full overflow-hidden">
            <img
              src={`https://vumbnail.com/${videoId}.jpg`}
              alt={video.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/0 group-hover/card:from-primary/20 group-hover/card:via-primary/10 group-hover/card:to-primary/20 transition-all duration-500" />
          </div>
        )
      }
    }

    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="relative z-10">
          <Play className="size-20 text-white/80 drop-shadow-2xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 animate-pulse-slow" />
      </div>
    )
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cn(
        "group/card relative flex flex-col transition-all duration-500",
        isExpanded ? "row-span-2" : ""
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tarjeta principal */}
      <div className={cn(
        "relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 group-hover/card:-translate-y-2 h-full"
      )}>
        {/* Thumbnail */}
        <div
          className="relative aspect-video overflow-hidden cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800 flex-shrink-0"
          onClick={() => onPreview(video)}
        >
          {renderVideoThumbnail()}

          {/* Badge de plataforma */}
          <div className="absolute top-4 left-4 z-10">
            <Badge
              className={`px-3 py-1.5 font-semibold backdrop-blur-sm border-0 ${isYouTube ? 'bg-red-600/90 hover:bg-red-600' : isVimeo ? 'bg-blue-600/90 hover:bg-blue-600' : 'bg-gray-800/90 hover:bg-gray-800'}`}
            >
              {isYouTube ? 'YouTube' : isVimeo ? 'Vimeo' : 'Video'}
            </Badge>
          </div>

          {/* Controles de administrador */}
          {isAdmin && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                size="icon"
                className="h-9 w-9 bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(video)
                }}
                title="Editar video"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9 bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(video.id)
                }}
                title="Eliminar video"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Botón de play con animación */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative">
              <div className="absolute inset-0 animate-ping-slow rounded-full bg-white/30"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/90 shadow-2xl flex items-center justify-center transform group-hover/card:scale-110 transition-transform duration-300">
                <Play className="h-7 w-7 text-gray-900 ml-0.5" />
              </div>
            </div>
          </div>

          {/* Controles de orden para admin */}
          {isAdmin && (
            <div className="absolute bottom-4 right-4 z-10 flex gap-1">
              {index > 0 && (
                <Button
                  size="icon"
                  className="h-7 w-7 bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOrderChange(video.id, 'up')
                  }}
                  title="Mover hacia arriba"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
              )}
              {index < totalVideos - 1 && (
                <Button
                  size="icon"
                  className="h-7 w-7 bg-white/90 hover:bg-white text-gray-900 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOrderChange(video.id, 'down')
                  }}
                  title="Mover hacia abajo"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Contenido de la tarjeta - MEJORADO */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Encabezado con título */}
          <div className="mb-3">
            <h3 
              ref={titleRef}
              className={cn(
                "font-bold text-gray-900 leading-tight transition-colors duration-300 text-balance",
                !isExpanded ? "line-clamp-2" : ""
              )}
            >
              {video.titulo}
            </h3>
          </div>

          {/* Descripción */}
          <div className={cn(
            "mb-4 flex-grow overflow-hidden transition-all duration-300",
            isExpanded ? "max-h-none" : "max-h-[100px]"
          )}>
            <p 
              ref={descRef}
              className="text-sm text-gray-600 leading-relaxed custom-scrollbar pr-2 text-pretty break-words hyphens-auto"
            >
              {video.descripcion}
            </p>
            
            {/* Indicador de que hay más contenido (solo cuando no está expandido) */}
            {!isExpanded && (
              <div className="absolute bottom-16 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent h-6 pointer-events-none" />
            )}
          </div>

          {/* Botón único para expandir/contraer */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mb-4 text-gray-500 hover:text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              handleToggleExpand()
            }}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Mostrar más
              </>
            )}
          </Button>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-auto">
            <Button
              size="default"
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-md hover:shadow-lg transition-all duration-300 group/play text-nowrap"
              onClick={() => onPreview(video)}
            >
              <Play className="h-4 w-4 mr-2 group-hover/play:scale-110 transition-transform duration-200" />
              Ver Video
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                window.open(video.video_url, "_blank")
              }}
              className="border-gray-300 hover:border-primary hover:bg-primary/5 hover:scale-110 transition-all duration-300 flex-shrink-0"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Efectos visuales */}
        <div className="absolute inset-0 border-2 border-transparent rounded-2xl group-hover/card:border-primary/20 transition-all duration-500 pointer-events-none"></div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/0 group-hover/card:from-primary/5 group-hover/card:via-primary/2 group-hover/card:to-primary/5 transition-all duration-500 pointer-events-none"></div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [videos, setVideos] = useState<HomeVideo[]>([])
  const [loadingImages, setLoadingImages] = useState(true)
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Estado para diálogos de imágenes
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null)
  const [imageFormData, setImageFormData] = useState({
    imagen_url: "",
    alt_text: "",
    orden: 0,
  })

  // Estado para diálogos de videos
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<HomeVideo | null>(null)
  const [videoFormData, setVideoFormData] = useState({
    titulo: "",
    descripcion: "",
    video_url: "",
    orden: 0,
  })

  // Estado para el reproductor de video
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<HomeVideo | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Estado para diálogo de confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'image' | 'video', id: string } | null>(null)

  // Carousel refs para control manual
  const carouselRef = useRef<HTMLDivElement>(null)

  // Estados para animaciones
  const [leafPositions, setLeafPositions] = useState<Array<{
    left: string
    top: string
    animationDelay: string
    animationDuration: string
    transform: string
  }>>([])

  const [waterDropPositions, setWaterDropPositions] = useState<Array<{
    left: string
    animationDelay: string
    animationDuration: string
  }>>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Inicializar animaciones solo en el cliente
  useEffect(() => {
    if (mounted) {
      const leafPos = Array.from({ length: 12 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${Math.random() * 20 + 20}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }))
      setLeafPositions(leafPos)

      const waterPos = Array.from({ length: 8 }).map((_, i) => ({
        left: `${10 + (i * 12)}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
      }))
      setWaterDropPositions(waterPos)
    }
  }, [mounted])

  // Verificar si el usuario es admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()
        setIsAdmin(data.profile?.role === "admin")
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      }
    }

    checkAdmin()
  }, [user])

  // Cargar imágenes del hero
  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/hero-images")
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }
        const data = await response.json()
        const sortedImages = data.sort((a: HeroImage, b: HeroImage) => a.orden - b.orden)
        setHeroImages(sortedImages)
      } catch (error) {
        console.error("Error loading images:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las imágenes.",
          variant: "destructive",
        })
      } finally {
        setLoadingImages(false)
      }
    }

    fetchImages()
  }, [])

  // Cargar videos
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/home-videos")
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }
        const data = await response.json()
        const sortedVideos = data.sort((a: HomeVideo, b: HomeVideo) => a.orden - b.orden)
        const videosWithType = sortedVideos.map((video: HomeVideo, index: number) => ({
          ...video,
          tipo: detectVideoType(video.video_url)
        }))
        setVideos(videosWithType)
      } catch (error) {
        console.error("Error loading videos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los videos.",
          variant: "destructive",
        })
      } finally {
        setLoadingVideos(false)
      }
    }

    fetchVideos()
  }, [])

  // Detectar tipo de video basado en la URL
  const detectVideoType = (url: string): "youtube" | "vimeo" | "direct" => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube'
    } else if (url.includes('vimeo.com')) {
      return 'vimeo'
    }
    return 'direct'
  }

  // Extraer ID de YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Extraer ID de Vimeo
  const getVimeoId = (url: string) => {
    const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  // Funciones para imágenes
  const handleCreateImage = () => {
    const nextOrden = heroImages.length > 0
      ? Math.max(...heroImages.map(img => img.orden)) + 1
      : 0

    setEditingImage(null)
    setImageFormData({
      imagen_url: "",
      alt_text: "",
      orden: nextOrden
    })
    setImageDialogOpen(true)
  }

  const handleEditImage = (image: HeroImage) => {
    setEditingImage(image)
    setImageFormData({
      imagen_url: image.imagen_url,
      alt_text: image.alt_text || "",
      orden: image.orden,
    })
    setImageDialogOpen(true)
  }

  // Función para cambiar el orden de una imagen
  const handleChangeImageOrder = async (imageId: string, direction: 'up' | 'down') => {
    const imageIndex = heroImages.findIndex(img => img.id === imageId)
    if (imageIndex === -1) return

    const newImages = [...heroImages]
    const currentImage = newImages[imageIndex]

    if (direction === 'up' && imageIndex > 0) {
      const previousImage = newImages[imageIndex - 1]
      const tempOrden = currentImage.orden
      currentImage.orden = previousImage.orden
      previousImage.orden = tempOrden
    } else if (direction === 'down' && imageIndex < newImages.length - 1) {
      const nextImage = newImages[imageIndex + 1]
      const tempOrden = currentImage.orden
      currentImage.orden = nextImage.orden
      nextImage.orden = tempOrden
    } else {
      return
    }

    newImages.sort((a, b) => a.orden - b.orden)

    try {
      const updates = newImages.map(img =>
        fetch(`/api/hero-images/${img.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orden: img.orden })
        })
      )

      await Promise.all(updates)
      setHeroImages(newImages)
      toast({
        title: "Orden actualizado",
        description: "El orden de las imágenes se actualizó correctamente.",
      })
    } catch (error) {
      console.error("Error updating image order:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/hero-images/${imageId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar imagen")
      }

      setHeroImages(heroImages.filter((img) => img.id !== imageId))
      toast({
        title: "Imagen eliminada",
        description: "La imagen se eliminó correctamente.",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la imagen.",
        variant: "destructive",
      })
    }
  }

  const handleSaveImage = async () => {
    if (!imageFormData.imagen_url) {
      toast({
        title: "Error",
        description: "La URL de la imagen es obligatoria.",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingImage
        ? `/api/hero-images/${editingImage.id}`
        : "/api/hero-images"
      const method = editingImage ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imageFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar imagen")
      }

      let updatedImages: HeroImage[]
      if (editingImage) {
        updatedImages = heroImages.map((img) =>
          img.id === data.id ? { ...data, orden: imageFormData.orden } : img
        )
      } else {
        updatedImages = [...heroImages, { ...data, orden: imageFormData.orden }]
      }

      updatedImages.sort((a, b) => a.orden - b.orden)
      setHeroImages(updatedImages)

      setImageDialogOpen(false)
      toast({
        title: editingImage ? "Imagen actualizada" : "Imagen creada",
        description: `La imagen se ${editingImage ? "actualizó" : "creó"} correctamente.`,
      })
    } catch (error) {
      console.error("Error saving image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la imagen.",
        variant: "destructive",
      })
    }
  }

  // Funciones para videos
  const handleCreateVideo = () => {
    const nextOrden = videos.length > 0
      ? Math.max(...videos.map(v => v.orden)) + 1
      : 0

    setEditingVideo(null)
    setVideoFormData({
      titulo: "",
      descripcion: "",
      video_url: "",
      orden: nextOrden
    })
    setVideoDialogOpen(true)
  }

  const handleEditVideo = (video: HomeVideo) => {
    setEditingVideo(video)
    setVideoFormData({
      titulo: video.titulo,
      descripcion: video.descripcion,
      video_url: video.video_url,
      orden: video.orden,
    })
    setVideoDialogOpen(true)
  }

  // Función para cambiar el orden de un video
  const handleChangeVideoOrder = async (videoId: string, direction: 'up' | 'down') => {
    const videoIndex = videos.findIndex(v => v.id === videoId)
    if (videoIndex === -1) return

    const newVideos = [...videos]
    const currentVideo = newVideos[videoIndex]

    if (direction === 'up' && videoIndex > 0) {
      const previousVideo = newVideos[videoIndex - 1]
      const tempOrden = currentVideo.orden
      currentVideo.orden = previousVideo.orden
      previousVideo.orden = tempOrden
    } else if (direction === 'down' && videoIndex < newVideos.length - 1) {
      const nextVideo = newVideos[videoIndex + 1]
      const tempOrden = currentVideo.orden
      currentVideo.orden = nextVideo.orden
      nextVideo.orden = tempOrden
    } else {
      return
    }

    newVideos.sort((a, b) => a.orden - b.orden)

    try {
      const updates = newVideos.map(video =>
        fetch(`/api/home-videos/${video.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orden: video.orden })
        })
      )

      await Promise.all(updates)
      const videosWithType = newVideos.map(video => ({
        ...video,
        tipo: detectVideoType(video.video_url)
      }))
      setVideos(videosWithType)
      toast({
        title: "Orden actualizado",
        description: "El orden de los videos se actualizó correctamente.",
      })
    } catch (error) {
      console.error("Error updating video order:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const response = await fetch(`/api/home-videos/${videoId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar video")
      }

      setVideos(videos.filter((v) => v.id !== videoId))
      
      toast({
        title: "Video eliminado",
        description: "El video se eliminó correctamente.",
      })
    } catch (error) {
      console.error("Error deleting video:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el video.",
        variant: "destructive",
      })
    }
  }

  const handleSaveVideo = async () => {
    if (!videoFormData.titulo || !videoFormData.descripcion || !videoFormData.video_url) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingVideo
        ? `/api/home-videos/${editingVideo.id}`
        : "/api/home-videos"
      const method = editingVideo ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoFormData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar video")
      }

      let updatedVideos: HomeVideo[]
      if (editingVideo) {
        updatedVideos = videos.map((v) =>
          v.id === data.id ? { ...data, orden: videoFormData.orden } : v
        )
      } else {
        updatedVideos = [...videos, {
          ...data,
          orden: videoFormData.orden,
          tipo: detectVideoType(data.video_url)
        }]
      }

      updatedVideos.sort((a, b) => a.orden - b.orden)
      setVideos(updatedVideos)

      setVideoDialogOpen(false)
      toast({
        title: editingVideo ? "Video actualizado" : "Video creado",
        description: `El video se ${editingVideo ? "actualizó" : "creó"} correctamente.`,
      })
    } catch (error) {
      console.error("Error saving video:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el video.",
        variant: "destructive",
      })
    }
  }

  // Funciones para el reproductor de video
  const openVideoPreview = (video: HomeVideo) => {
    setSelectedVideo(video)
    setVideoPreviewOpen(true)
    setIsPlaying(true)
  }

  const closeVideoPreview = () => {
    setVideoPreviewOpen(false)
    setSelectedVideo(null)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Manejar eliminación con confirmación
  const confirmDelete = (type: 'image' | 'video', id: string) => {
    setItemToDelete({ type, id })
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!itemToDelete) return

    try {
      if (itemToDelete.type === 'image') {
        await handleDeleteImage(itemToDelete.id)
      } else {
        await handleDeleteVideo(itemToDelete.id)
      }
    } catch (error) {
      console.error("Error in executeDelete:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el elemento.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // Funciones para control manual del carrusel
  const handlePrevious = () => {
    if (carouselRef.current) {
      const prevBtn = carouselRef.current.querySelector('[data-carousel="previous"]') as HTMLElement
      prevBtn?.click()
    }
  }

  const handleNext = () => {
    if (carouselRef.current) {
      const nextBtn = carouselRef.current.querySelector('[data-carousel="next"]') as HTMLElement
      nextBtn?.click()
    }
  }

  // Componente para hojas animadas
  const LeafAnimation = ({ index }: LeafAnimationProps) => {
    if (!mounted || index >= leafPositions.length) return null

    const position = leafPositions[index]
    return (
      <div
        className="absolute opacity-20 animate-leaf-float"
        style={{
          left: position.left,
          top: position.top,
          animationDelay: position.animationDelay,
          animationDuration: position.animationDuration,
          transform: position.transform,
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-white/30"
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.85C7.14 19.15 7.71 18.44 8.29 17.74C9.73 16.06 11.09 14.38 12.27 12.91C14.77 14.825 17.11 16.325 19.34 17.56C19.65 17.74 19.94 17.91 20.23 18.07L22 16.92C21.43 14.1 20.34 10.73 17 8M10 5C10 5 11 4 12 2C13 4 14 5 14 5C14 5 13 6 12 8C11 6 10 5 10 5Z" />
        </svg>
      </div>
    )
  }

  // Componente para gotas de agua
  const WaterDropAnimation = ({ index }: WaterDropProps) => {
    if (!mounted || index >= waterDropPositions.length) return null

    const position = waterDropPositions[index]
    return (
      <div
        className="absolute w-2 h-8 animate-water-drop"
        style={{
          left: position.left,
          animationDelay: position.animationDelay,
          animationDuration: position.animationDuration,
        }}
      >
        <div className="w-full h-full bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
      </div>
    )
  }

  // Skeleton para tarjetas de video
  const VideoCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 animate-pulse">
      <div className="relative aspect-video bg-gray-300" />
      <div className="p-5">
        <div className="h-6 bg-gray-300 rounded mb-3" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-4" />
        <div className="flex gap-2">
          <div className="h-9 flex-1 bg-gray-300 rounded" />
          <div className="h-9 w-9 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="gradient-eco text-white py-8 sm:py-12 md:py-16 lg:py-24 relative">
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <LeafAnimation key={i} index={i} />
            ))}
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <WaterDropAnimation key={i} index={i} />
            ))}
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="max-w-2xl lg:max-w-xl">
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-3 sm:mb-4 animate-glow">
                  Sistema de Seguimiento e Indicadores
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 text-balance leading-tight animate-text-reveal">
                  Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white/90 mb-3 sm:mb-4 text-balance leading-relaxed animate-text-reveal-delay text-pretty">
                  Plataforma integral de monitoreo y evaluación para la gestión
                  sostenible de residuos. Consulte métricas, indicadores de
                  desempeño y objetivos ambientales
                </p>
              </div>

              <div className="relative">
                {!loadingImages && heroImages.length > 0 ? (
                  <div className="relative group" ref={carouselRef}>
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>

                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      plugins={[
                        Autoplay({
                          delay: 5000,
                          stopOnInteraction: true,
                        }),
                      ]}
                      className="w-full relative z-10"
                    >
                      <CarouselContent>
                        {heroImages.map((image, index) => (
                          <CarouselItem key={image.id}>
                            <div className="relative aspect-[16/9] md:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[16/8] rounded-xl overflow-hidden shadow-2xl group/image animate-slide-in-right">
                              <div className="relative w-full h-full">
                                <Image
                                  src={image.imagen_url || "/placeholder.svg"}
                                  alt={image.alt_text || "Imagen del hero"}
                                  fill
                                  className="object-cover transition-all duration-700 group-hover/image:scale-105"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                  priority={index === 0}
                                />
                              </div>

                              {image.alt_text && (
                                <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover/image:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-emerald-900/90 via-teal-800/70 to-transparent p-3 sm:p-4 z-20">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-white text-xs sm:text-sm font-medium text-pretty">
                                      {image.alt_text}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      <CarouselPrevious
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-700 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl opacity-0 group-hover:opacity-100"
                        data-carousel="previous"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </CarouselPrevious>
                      <CarouselNext
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-700 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl opacity-0 group-hover:opacity-100"
                        data-carousel="next"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </CarouselNext>
                    </Carousel>

                    <div className="flex justify-center gap-3 mt-6 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                      {heroImages.map((_, index) => (
                        <div
                          key={index}
                          className="relative w-3 h-3"
                        >
                          <div className="absolute inset-0 bg-emerald-300/30 rounded-full animate-pulse-drop"></div>
                          <div
                            className="absolute inset-0 bg-emerald-400 rounded-full transition-all duration-300 group-hover:scale-125"
                            style={{
                              animationDelay: `${index * 0.5}s`,
                              animationDuration: '2s',
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between mt-3 sm:mt-4 lg:hidden transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8 bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-700 hover:scale-110 transition-transform duration-200 shadow-lg"
                        onClick={handlePrevious}
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 sm:h-8 sm:w-8 bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-700 hover:scale-110 transition-transform duration-200 shadow-lg"
                        onClick={handleNext}
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                ) : loadingImages ? (
                  null
                ) : (
                  null
                )}

                {isAdmin && (
                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateImage}
                      className="h-8 sm:h-9 px-2 sm:px-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm group/btn text-nowrap"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 group-hover/btn:rotate-90 transition-transform duration-300" />
                      Agregar Imagen
                    </Button>
                    {heroImages.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 sm:h-9 px-2 sm:px-3 bg-emerald-600/20 text-white border-emerald-500/30 hover:bg-emerald-500/30 hover:scale-105 transition-all duration-300 text-xs sm:text-sm text-nowrap"
                          >
                            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Gestionar ({heroImages.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="bg-emerald-50 border-emerald-200 min-w-[280px] sm:min-w-[320px] max-w-[320px] sm:max-w-[360px] animate-grow-in"
                          align="end"
                        >
                          <DropdownMenuLabel className="text-xs font-medium text-emerald-800 border-b border-emerald-200 pb-2 flex justify-between items-center">
                            <span>Imágenes del Hero ({heroImages.length})</span>
                            <span className="text-xs text-emerald-600">Orden actual</span>
                          </DropdownMenuLabel>
                          {heroImages.map((image, index) => (
                            <DropdownMenuItem
                              key={image.id}
                              className="flex flex-col items-start gap-1 py-2 px-3 cursor-pointer hover:bg-emerald-100 focus:bg-emerald-100 transition-colors duration-150"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-mono bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded flex-shrink-0">
                                    #{image.orden}
                                  </span>
                                  <span className="text-xs sm:text-sm font-medium text-emerald-900 truncate text-pretty">
                                    {image.alt_text || `Imagen ${index + 1}`}
                                  </span>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  {index > 0 && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-800 hover:scale-110 transition-transform duration-200"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleChangeImageOrder(image.id, 'up')
                                      }}
                                      title="Subir posición"
                                    >
                                      <ArrowUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  )}
                                  {index < heroImages.length - 1 && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-emerald-200 text-emerald-700 hover:text-emerald-800 hover:scale-110 transition-transform duration-200"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleChangeImageOrder(image.id, 'down')
                                      }}
                                      title="Bajar posición"
                                    >
                                      <ArrowDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-emerald-200 text-emerald-700 hover:scale-110 transition-transform duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditImage(image)
                                    }}
                                    title="Editar imagen"
                                  >
                                    <Pencil className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 sm:h-6 sm:w-6 hover:bg-red-100 text-red-600 hover:text-red-700 hover:scale-110 transition-transform duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      confirmDelete('image', image.id)
                                    }}
                                    title="Eliminar imagen"
                                  >
                                    <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="relative w-full h-14 sm:h-16 rounded overflow-hidden border border-emerald-200 group/preview">
                                <Image
                                  src={image.imagen_url}
                                  alt="Preview"
                                  fill
                                  className="object-cover group-hover/preview:scale-110 transition-transform duration-500"
                                  sizes="(max-width: 280px) 100vw"
                                />
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Tarjetas */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-accent-lighter text-accent font-medium text-xs mb-3">
                SECCIONES PRINCIPALES
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 text-balance">
                Navega por el contenido
              </h2>
              <p className="text-foreground/60 max-w-2xl text-sm sm:text-base lg:text-lg text-pretty">
                Accede a detalles sobre nuestros compromisos ecológicos y
                métricas actualizadas de manejo de desechos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <CardNavegacion
                href="/metas"
                titulo="Metas"
                descripcion="Objetivos y compromisos ecológicos establecidos para optimizar el manejo de desechos."
                color="primary"
              />
              <CardNavegacion
                href="/indicadores"
                titulo="Indicadores"
                descripcion="Datos actualizados y visualizaciones sobre composición de desechos y prácticas sostenibles."
                color="accent"
              />
              <CardNavegacion
                href="/avances"
                titulo="Avances"
                descripcion="Monitoreo del progreso e implementación de nuestros programas ecológicos."
                color="accent2"
                deshabilitado={true}
              />
              <CardNavegacion
                href="/reportes"
                titulo="Reportes"
                descripcion="Documentos técnicos, análisis detallados y estudios completos."
                color="accent4"
                deshabilitado={true}
              />
              <CardNavegacion
                href="/formularios"
                titulo="Formularios"
                descripcion="Participa en nuestras encuestas y contribuye con información para mejorar políticas."
                color="accent3"
                deshabilitado={true}
              />
              <CardNavegacion
                href="/integrantes"
                titulo="Nuestro Equipo"
                descripcion="Conoce a los profesionales responsables de la gestión ecológica."
                color="primary"
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN DE VIDEOS - SIMPLIFICADA */}
        {(!loadingVideos && videos.length > 0) || isAdmin ? (
          <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Encabezado de la sección */}
              <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 lg:mb-20">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary font-semibold text-sm mb-4 sm:mb-6 text-nowrap">
                  <Film className="h-4 w-4" />
                  CONTENIDO MULTIMEDIA
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 text-balance">
                  Videos <span className="text-primary">Destacados</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-pretty">
                  Explora nuestra colección de videos sobre gestión de residuos,
                  sostenibilidad y mejores prácticas ambientales.
                </p>
              </div>

              {/* Controles de administrador */}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 sm:mb-12 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Youtube className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Gestión de Videos</h3>
                      <p className="text-sm text-gray-600">{videos.length} videos en la biblioteca</p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {videos.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-11 px-4 border-green-200 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-500 text-nowrap"
                          >
                            <MoreVertical className="h-4 w-4 mr-2" />
                            Ordenar Videos
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="bg-white/95 backdrop-blur-sm border-gray-200 min-w-[240px] shadow-xl"
                          align="end"
                        >
                          <DropdownMenuLabel className="text-sm font-medium text-gray-500 border-b pb-2">
                            Orden de videos ({videos.length})
                          </DropdownMenuLabel>
                          {videos.map((video, index) => (
                            <DropdownMenuItem
                              key={video.id}
                              className="flex items-center justify-between gap-2 py-3 px-4 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                                  #{video.orden}
                                </span>
                                <span className="text-sm truncate text-pretty min-w-0">
                                  {video.titulo}
                                </span>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {index > 0 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 hover:bg-blue-100 text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleChangeVideoOrder(video.id, 'up')
                                    }}
                                    title="Subir posición"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                )}
                                {index < videos.length - 1 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 hover:bg-blue-100 text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleChangeVideoOrder(video.id, 'down')
                                    }}
                                    title="Bajar posición"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <Button
                      onClick={handleCreateVideo}
                      className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all text-nowrap"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Agregar Video
                    </Button>
                  </div>
                </div>
              )}

              {/* Grid de videos */}
              {loadingVideos ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {videos.map((video, index) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      isAdmin={isAdmin}
                      onEdit={handleEditVideo}
                      onDelete={(id) => confirmDelete('video', id)}
                      onPreview={openVideoPreview}
                      onOrderChange={handleChangeVideoOrder}
                      index={index}
                      totalVideos={videos.length}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <div className="max-w-md mx-auto">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Film className="h-12 w-12 text-primary/50" />
                      </div>
                      <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-primary/10 animate-pulse-slow"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 text-balance">No hay videos disponibles</h3>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto text-pretty">
                      Aún no se han agregado videos a la biblioteca. Agrega el primero para comenzar.
                    </p>
                    {isAdmin && (
                      <Button
                        onClick={handleCreateVideo}
                        size="lg"
                        className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-xl hover:shadow-2xl"
                      >
                        <Plus className="h-5 w-5 mr-3" />
                        Agregar primer video
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {/* Sección Informativa */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-lighter text-primary font-medium text-xs mb-4 sm:mb-6">
              SOBRE ESTE PROYECTO
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8 lg:mb-12 text-balance">
              Compromiso ecológico
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="card-elevated p-4 sm:p-6 lg:p-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3 lg:mb-4 text-balance">
                  Nuestra Visión
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-foreground/70 leading-relaxed text-pretty hyphens-auto">
                  Promovemos la sostenibilidad y el manejo responsable de
                  desechos. Este sitio web muestra nuestro trabajo por
                  transparencia, participación comunitaria y mejora continua en
                  políticas ecológicas.
                </p>
              </div>

              <div className="card-elevated p-4 sm:p-6 lg:p-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3 lg:mb-4 text-balance">
                  Economía Circular Aplicada
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-foreground/70 leading-relaxed text-pretty hyphens-auto">
                  Implementamos principios circulares que transforman
                  externalidades negativas en capital ecológico y comunitario.
                  Nuestro enfoque integra análisis de ciclo de vida, diseño
                  regenerativo y cadenas de valor cerradas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modal de Preview de Video */}
      <Dialog open={videoPreviewOpen} onOpenChange={setVideoPreviewOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl w-[95vw] p-0 bg-black border-0 overflow-hidden rounded-lg sm:rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Reproductor de video: {selectedVideo?.titulo}</DialogTitle>
          </DialogHeader>

          {selectedVideo && (
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/90 to-transparent">
                <div className="max-w-[80%] min-w-0">
                  <h3 className="text-white font-bold text-lg sm:text-xl truncate text-balance">{selectedVideo.titulo}</h3>
                  <p className="text-white/70 text-sm truncate text-pretty">{selectedVideo.descripcion}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={closeVideoPreview}
                  className="text-white hover:bg-white/20 flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                  aria-label="Cerrar reproductor"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="relative aspect-video bg-black">
                {detectVideoType(selectedVideo.video_url) === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedVideo.video_url)}?autoplay=1&rel=0&modestbranding=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.titulo}
                    aria-label={`Reproductor de YouTube: ${selectedVideo.titulo}`}
                  />
                ) : detectVideoType(selectedVideo.video_url) === 'vimeo' ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${getVimeoId(selectedVideo.video_url)}?autoplay=1&title=0&byline=0&portrait=0`}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.titulo}
                    aria-label={`Reproductor de Vimeo: ${selectedVideo.titulo}`}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={selectedVideo.video_url}
                    className="w-full h-full"
                    controls
                    autoPlay
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    aria-label={`Video: ${selectedVideo.titulo}`}
                  />
                )}
              </div>

              {detectVideoType(selectedVideo.video_url) === 'direct' && (
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
                      aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                    >
                      {isPlaying ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-sm" aria-hidden="true" />
                      ) : (
                        <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
                      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20 h-9 w-9 sm:h-10 sm:w-10"
                      aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                      <Maximize2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6 bg-gray-900">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm line-clamp-2 text-pretty">{selectedVideo.descripcion}</p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(selectedVideo.video_url, "_blank")}
                    className="bg-primary hover:bg-primary/90 text-white border-0 whitespace-nowrap h-9 sm:h-10 px-3 sm:px-4 text-sm mt-2 sm:mt-0 hover:scale-105 transition-all duration-200 flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5 sm:mr-2" />
                    Abrir original
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para Imágenes */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingImage ? "Editar Imagen" : "Agregar Imagen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="imagen_url">URL de la Imagen *</Label>
              <Input
                id="imagen_url"
                value={imageFormData.imagen_url}
                onChange={(e) =>
                  setImageFormData({
                    ...imageFormData,
                    imagen_url: e.target.value,
                  })
                }
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full break-words"
              />
            </div>
            <div>
              <Label htmlFor="alt_text">Texto Alternativo</Label>
              <Input
                id="alt_text"
                value={imageFormData.alt_text}
                onChange={(e) =>
                  setImageFormData({
                    ...imageFormData,
                    alt_text: e.target.value,
                  })
                }
                placeholder="Descripción de la imagen"
                className="w-full break-words"
              />
            </div>
            <div>
              <Label htmlFor="orden_img">Orden *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="orden_img"
                  type="number"
                  min="0"
                  value={imageFormData.orden}
                  onChange={(e) =>
                    setImageFormData({
                      ...imageFormData,
                      orden: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1"
                />
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  Actual: {heroImages.length} imágenes
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-pretty">
                Número más bajo aparece primero. Usa flechas en el menú de gestión para reordenar.
              </p>
            </div>
            {imageFormData.imagen_url && (
              <div className="mt-4">
                <Label>Vista Previa</Label>
                <div className="relative aspect-[16/9] md:aspect-[16/10] lg:aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 mt-1.5">
                  <Image
                    src={imageFormData.imagen_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 400px) 100vw"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-pretty">
                  Dimensiones recomendadas: 16:9 para móvil, 16:10 para tablet, 16:9 para desktop
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setImageDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveImage}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Videos */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVideo ? "Editar Video" : "Agregar Video"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={videoFormData.titulo}
                onChange={(e) =>
                  setVideoFormData({ ...videoFormData, titulo: e.target.value })
                }
                placeholder="Título del video"
                className="w-full break-words"
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={videoFormData.descripcion}
                onChange={(e) =>
                  setVideoFormData({
                    ...videoFormData,
                    descripcion: e.target.value,
                  })
                }
                placeholder="Descripción del video"
                rows={5}
                className="w-full resize-y break-words min-h-[120px] max-h-[300px] text-pretty"
              />
              <p className="text-xs text-gray-500 mt-1 text-pretty">
                La descripción completa será visible en las tarjetas con scroll suave
              </p>
            </div>
            <div>
              <Label htmlFor="video_url">URL del Video *</Label>
              <Input
                id="video_url"
                value={videoFormData.video_url}
                onChange={(e) =>
                  setVideoFormData({
                    ...videoFormData,
                    video_url: e.target.value,
                  })
                }
                placeholder="https://youtube.com/watch?v=..."
                className="w-full break-words"
              />
              <p className="text-xs text-muted-foreground mt-1 text-pretty">
                Soporta YouTube, Vimeo y enlaces directos a videos
              </p>
            </div>
            <div>
              <Label htmlFor="orden_vid">Orden *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="orden_vid"
                  type="number"
                  min="0"
                  value={videoFormData.orden}
                  onChange={(e) =>
                    setVideoFormData({
                      ...videoFormData,
                      orden: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="flex-1"
                />
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  Actual: {videos.length} videos
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-pretty">
                Número más bajo aparece primero. Usa flechas en el botón "Ordenar" para reordenar.
              </p>
            </div>
            {videoFormData.video_url && (
              <div className="mt-4">
                <Label>Vista Previa del Enlace</Label>
                <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded break-words text-pretty">
                  {detectVideoType(videoFormData.video_url) === 'youtube' && (
                    <span className="flex items-center gap-1">
                      <span className="text-red-500 font-medium">YouTube</span> detectado
                    </span>
                  )}
                  {detectVideoType(videoFormData.video_url) === 'vimeo' && (
                    <span className="flex items-center gap-1">
                      <span className="text-blue-500 font-medium">Vimeo</span> detectado
                    </span>
                  )}
                  {detectVideoType(videoFormData.video_url) === 'direct' && (
                    <span className="text-amber-500 font-medium">Enlace directo a video</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setVideoDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveVideo}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              Esta acción no se puede deshacer. {itemToDelete?.type === 'image'
                ? 'La imagen será eliminada permanentemente.'
                : 'El video será eliminado permanentemente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        @keyframes leaf-float {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(var(--start-rotate, 0deg));
          }
          25% { 
            transform: translateY(-40px) translateX(20px) rotate(calc(var(--start-rotate, 0deg) + 90deg));
          }
          50% { 
            transform: translateY(-20px) translateX(-20px) rotate(calc(var(--start-rotate, 0deg) + 180deg));
          }
          75% { 
            transform: translateY(20px) translateX(30px) rotate(calc(var(--start-rotate, 0deg) + 270deg));
          }
        }

        @keyframes water-drop {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(300px);
            opacity: 0;
          }
        }

        @keyframes plant-sway {
          0%, 100% { transform: translateX(0) rotate(-2deg); }
          50% { transform: translateX(10px) rotate(2deg); }
        }

        @keyframes plant-sway-reverse {
          0%, 100% { transform: translateX(0) rotate(2deg); }
          50% { transform: translateX(-10px) rotate(-2deg); }
        }

        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 5px rgba(72, 187, 120, 0.3);
          }
          50% { 
            box-shadow: 0 0 20px rgba(72, 187, 120, 0.6);
          }
        }

        @keyframes text-reveal {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulse-drop {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.2);
            opacity: 0.6;
          }
        }

        @keyframes grow-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-leaf-float {
          animation: leaf-float linear infinite;
        }

        .animate-water-drop {
          animation: water-drop linear infinite;
        }

        .animate-plant-sway {
          animation: plant-sway 8s ease-in-out infinite;
        }

        .animate-plant-sway-reverse {
          animation: plant-sway-reverse 8s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .animate-text-reveal {
          animation: text-reveal 1s ease-out forwards;
        }

        .animate-text-reveal-delay {
          animation: text-reveal 1s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-shimmer-slow {
          animation: shimmer-slow 3s infinite;
        }

        .animate-pulse-drop {
          animation: pulse-drop 2s ease-in-out infinite;
        }

        .animate-grow-in {
          animation: grow-in 0.2s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          animation-delay: 0.3s;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        .gradient-eco {
          background: linear-gradient(135deg, #0e8b4d 0%, #24b12f 25%, #17a72f 50%, #13642e 75%, #0b632d 100%);
          position: relative;
          overflow: hidden;
        }

        .gradient-eco::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(
              circle at 20% 80%,
              rgba(34, 197, 94, 0.15) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(20, 184, 166, 0.15) 0%,
              transparent 50%
            );
          pointer-events: none;
          animation: sunlight-shift 20s ease-in-out infinite alternate;
        }

        @keyframes sunlight-shift {
          0% {
            background-position: 20% 80%, 80% 20%;
          }
          100% {
            background-position: 30% 70%, 70% 30%;
          }
        }

        .gradient-eco::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(11, 65, 30, 0.03) 0%, transparent 2%),
            radial-gradient(circle at 90% 40%, rgba(14, 247, 99, 0.03) 0%, transparent 2%),
            radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.03) 0%, transparent 2%),
            radial-gradient(circle at 30% 60%, rgba(34, 197, 94, 0.03) 0%, transparent 2%),
            radial-gradient(circle at 70% 10%, rgba(34, 197, 94, 0.03) 0%, transparent 2%);
          background-size: 200px 200px;
          pointer-events: none;
        }

        .break-words {
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .overflow-y-auto {
          overflow-y: auto;
        }

        .max-h-\[90vh\] {
          max-height: 90vh;
        }

        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        .leading-snug {
          line-height: 1.375;
        }

        .leading-relaxed {
          line-height: 1.625;
        }

        /* Utilidades de texto modernas */
        .text-balance {
          text-wrap: balance;
        }

        .text-pretty {
          text-wrap: pretty;
        }

        .text-nowrap {
          text-wrap: nowrap;
        }

        .hyphens-auto {
          hyphens: auto;
        }

        /* Scrollbar personalizado para las descripciones */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
          border: 2px solid transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }

        /* Utilidades de flexbox para evitar desbordamiento */
        .min-w-0 {
          min-width: 0;
        }

        .flex-shrink-0 {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}

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
  ArrowDown
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
}

interface LeafAnimationProps {
  index: number
}

interface WaterDropProps {
  index: number
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
  const [itemToDelete, setItemToDelete] = useState<{type: 'image' | 'video', id: string} | null>(null)

  // Carousel refs para control manual
  const carouselRef = useRef<HTMLDivElement>(null)
  const videosCarouselRef = useRef<HTMLDivElement>(null)

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
      // Generar posiciones para hojas
      const leafPos = Array.from({ length: 12 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${Math.random() * 20 + 20}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }))
      setLeafPositions(leafPos)

      // Generar posiciones para gotas de agua
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
        // Ordenar las imágenes por el campo 'orden'
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
        // Ordenar videos por el campo 'orden'
        const sortedVideos = data.sort((a: HomeVideo, b: HomeVideo) => a.orden - b.orden)
        // Detectar tipo de video
        const videosWithType = sortedVideos.map((video: HomeVideo) => ({
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
    // Calcular el siguiente orden disponible
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
      // Intercambiar órdenes
      const tempOrden = currentImage.orden
      currentImage.orden = previousImage.orden
      previousImage.orden = tempOrden
    } else if (direction === 'down' && imageIndex < newImages.length - 1) {
      const nextImage = newImages[imageIndex + 1]
      // Intercambiar órdenes
      const tempOrden = currentImage.orden
      currentImage.orden = nextImage.orden
      nextImage.orden = tempOrden
    } else {
      return
    }

    // Ordenar la lista por el nuevo orden
    newImages.sort((a, b) => a.orden - b.orden)
    
    try {
      // Actualizar ambas imágenes en la base de datos
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

      // Ordenar las imágenes después de guardar
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
    // Calcular el siguiente orden disponible
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
      // Intercambiar órdenes
      const tempOrden = currentVideo.orden
      currentVideo.orden = previousVideo.orden
      previousVideo.orden = tempOrden
    } else if (direction === 'down' && videoIndex < newVideos.length - 1) {
      const nextVideo = newVideos[videoIndex + 1]
      // Intercambiar órdenes
      const tempOrden = currentVideo.orden
      currentVideo.orden = nextVideo.orden
      nextVideo.orden = tempOrden
    } else {
      return
    }

    // Ordenar la lista por el nuevo orden
    newVideos.sort((a, b) => a.orden - b.orden)
    
    try {
      // Actualizar ambos videos en la base de datos
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

      // Ordenar los videos después de guardar
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

  // Renderizar thumbnail de video basado en tipo
  const renderVideoThumbnail = (video: HomeVideo) => {
    const videoType = detectVideoType(video.video_url)

    if (videoType === 'youtube') {
      const videoId = getYouTubeId(video.video_url)
      if (videoId) {
        return (
          <div className="relative w-full h-full">
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={video.titulo}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )
      }
    } else if (videoType === 'vimeo') {
      const videoId = getVimeoId(video.video_url)
      if (videoId) {
        return (
          <div className="relative w-full h-full">
            <img
              src={`https://vumbnail.com/${videoId}.jpg`}
              alt={video.titulo}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )
      }
    }

    // Thumbnail por defecto
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        <Play className="size-16 text-white drop-shadow-lg" />
      </div>
    )
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

  const handleVideosPrevious = () => {
    if (videosCarouselRef.current) {
      const prevBtn = videosCarouselRef.current.querySelector('[data-carousel="previous"]') as HTMLElement
      prevBtn?.click()
    }
  }

  const handleVideosNext = () => {
    if (videosCarouselRef.current) {
      const nextBtn = videosCarouselRef.current.querySelector('[data-carousel="next"]') as HTMLElement
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

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full">
        {/* Hero Section con Carrusel de Imágenes - ANIMACIONES AMBIENTALES */}
        <section className="gradient-eco text-white py-8 sm:py-12 md:py-16 lg:py-24 relative overflow-hidden">
          {/* Hojas flotantes animadas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <LeafAnimation key={i} index={i} />
            ))}
          </div>

          {/* Gotas de agua cayendo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <WaterDropAnimation key={i} index={i} />
            ))}
          </div>

          {/* Plantas decorativas en los bordes */}
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-48 h-48 animate-plant-sway">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100"
                fill="currentColor"
                className="text-white/20"
              >
                <path d="M30,95 Q40,70 50,85 Q60,70 70,95" />
                <path d="M40,95 Q45,80 50,90 Q55,80 60,95" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none">
            <div className="absolute bottom-0 right-0 w-48 h-48 animate-plant-sway-reverse">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 100 100"
                fill="currentColor"
                className="text-white/20"
              >
                <path d="M70,95 Q60,70 50,85 Q40,70 30,95" />
                <path d="M60,95 Q55,80 50,90 Q45,80 40,95" />
              </svg>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Contenido izquierdo - CON EFECTOS DE ENTRADA NATURAL */}
              <div className="max-w-2xl lg:max-w-xl">
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-3 sm:mb-4 animate-glow">
                  Sistema de Seguimiento e Indicadores
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 text-balance leading-tight animate-text-reveal">
                  Seguimiento e Indicadores para la Gestión de Residuos Domiciliarios
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white/90 mb-3 sm:mb-4 text-balance leading-relaxed animate-text-reveal-delay">
                  Plataforma integral de monitoreo y evaluación para la gestión
                  sostenible de residuos. Consulte métricas, indicadores de
                  desempeño y objetivos ambientales
                </p>
                
                {/* Brillo sutil en el texto */}
                <div className="relative inline-block mt-4">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500/0 via-emerald-400/20 to-green-500/0 blur-lg animate-shimmer-slow"></div>
                </div>
              </div>

              {/* Carrusel de imágenes derecho - CON EFECTOS NATURALES */}
              <div className="relative">
                {/* SOLO MUESTRA EL CARRUSEL SI HAY IMÁGENES */}
                {!loadingImages && heroImages.length > 0 ? (
                  <div className="relative group" ref={carouselRef}>
                    {/* Marco natural con efecto de luz */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
                    
                    {/* Plantitas decorativas en las esquinas del carrusel */}
                    <div className="absolute -top-3 -left-3 w-12 h-12 opacity-20">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-300">
                        <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5 s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z"/>
                      </svg>
                    </div>
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 opacity-20">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" className="text-teal-300">
                        <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5 s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z"/>
                      </svg>
                    </div>
                    
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
                            {/* CONTENEDOR CON EFECTO DE HOJA FLOTANTE - ANIMACIÓN DE ENTRADA DESDE LA DERECHA */}
                            <div className="relative aspect-[16/9] md:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[16/8] rounded-xl overflow-hidden shadow-2xl group/image animate-slide-in-right">
                              {/* Efecto de luz natural en hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/0 via-teal-400/10 to-transparent opacity-0 group-hover/image:opacity-30 transition-opacity duration-500 z-10"></div>
                              
                              {/* Pequeñas hojas decorativas */}
                              <div className="absolute top-4 left-4 w-8 h-8 opacity-0 group-hover/image:opacity-20 transition-opacity duration-500">
                                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.85C7.14,19.15 7.71,18.44 8.29,17.74C9.73,16.06 11.09,14.38 12.27,12.91C14.77,14.825 17.11,16.325 19.34,17.56C19.65,17.74 19.94,17.91 20.23,18.07L22,16.92C21.43,14.1 20.34,10.73 17,8M10,5C10,5 11,4 12,2C13,4 14,5 14,5C14,5 13,6 12,8C11,6 10,5 10,5Z"/>
                                </svg>
                              </div>
                              
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
                              
                              {/* Overlay con efecto de crecimiento */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-500"></div>
                              
                              {image.alt_text && (
                                <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover/image:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-emerald-900/90 via-teal-800/70 to-transparent p-3 sm:p-4 z-20">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-white text-xs sm:text-sm font-medium">
                                      {image.alt_text}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      
                      {/* Botones del carrusel con estilo natural */}
                      <CarouselPrevious 
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                        data-carousel="previous"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      </CarouselPrevious>
                      <CarouselNext 
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                        data-carousel="next"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </CarouselNext>
                    </Carousel>

                    {/* Indicadores de progreso con estilo de gotas */}
                    <div className="flex justify-center gap-3 mt-6">
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

                    {/* Botones responsive para móvil con estilo natural */}
                    <div className="flex justify-between mt-3 sm:mt-4 lg:hidden">
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
                        className="h-7 w-7 sm:h-8 sm:h-8 bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-700 hover:scale-110 transition-transform duration-200 shadow-lg"
                        onClick={handleNext}
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                ) : loadingImages ? (
                  // MUESTRA NADA DURANTE LA CARGA
                  null
                ) : (
                  // NO MUESTRA NADA CUANDO NO HAY IMÁGENES
                  null
                )}

                {/* SOLO MUESTRA BOTONES ADMIN SI HAY IMÁGENES O SI ES ADMIN */}
                {isAdmin && (
                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateImage}
                      className="h-8 sm:h-9 px-2 sm:px-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm group/btn"
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
                            className="h-8 sm:h-9 px-2 sm:px-3 bg-emerald-600/20 text-white border-emerald-500/30 hover:bg-emerald-500/30 hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
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
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">
                                    #{image.orden}
                                  </span>
                                  <span className="text-xs sm:text-sm font-medium text-emerald-900 truncate max-w-[120px] sm:max-w-[150px]">
                                    {image.alt_text || `Imagen ${index + 1}`}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  {/* Botones con efecto de hoja */}
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
                              {/* VISTA PREVIA CON EFECTO DE CRECIMIENTO */}
                              <div className="relative w-full h-14 sm:h-16 rounded overflow-hidden border border-emerald-200 group/preview">
                                <Image
                                  src={image.imagen_url}
                                  alt="Preview"
                                  fill
                                  className="object-cover group-hover/preview:scale-110 transition-transform duration-500"
                                  sizes="(max-width: 280px) 100vw"
                                />
                                <div className="absolute inset-0 bg-emerald-900/0 group-hover/preview:bg-emerald-900/30 transition-colors duration-500"></div>
                                {/* Pequeña hoja decorativa */}
                                <div className="absolute top-1 right-1 w-4 h-4 opacity-0 group-hover/preview:opacity-50 transition-opacity duration-300">
                                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-300">
                                    <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.85C7.14,19.15 7.71,18.44 8.29,17.74C9.73,16.06 11.09,14.38 12.27,12.91C14.77,14.825 17.11,16.325 19.34,17.56C19.65,17.74 19.94,17.91 20.23,18.07L22,16.92C21.43,14.1 20.34,10.73 17,8M10,5C10,5 11,4 12,2C13,4 14,5 14,5C14,5 13,6 12,8C11,6 10,5 10,5Z"/>
                                  </svg>
                                </div>
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
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Navega por el contenido
              </h2>
              <p className="text-foreground/60 max-w-2xl text-sm sm:text-base lg:text-lg">
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

        {/* Sección de Videos - CON PREVIEW Y ORDEN */}
        {(!loadingVideos && videos.length > 0) || isAdmin ? (
          <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-secondary-bg border-y border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-primary-lighter text-primary font-medium text-xs mb-2 sm:mb-3">
                    CONTENIDO MULTIMEDIA
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    Videos Destacados
                  </h2>
                  <p className="text-foreground/60 mt-1 sm:mt-2 max-w-2xl text-sm sm:text-base">
                    Mira nuestros videos sobre gestión de residuos y sostenibilidad
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    {videos.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 sm:h-10 px-2 sm:px-3"
                          >
                            <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Ordenar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          className="bg-white/95 backdrop-blur-sm border-gray-200 min-w-[220px] sm:min-w-[240px]"
                          align="end"
                        >
                          <DropdownMenuLabel className="text-xs font-medium text-gray-500 border-b pb-2">
                            Orden de videos ({videos.length})
                          </DropdownMenuLabel>
                          {videos.map((video, index) => (
                            <DropdownMenuItem 
                              key={video.id}
                              className="flex items-center justify-between gap-2 py-2 px-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                  #{video.orden}
                                </span>
                                <span className="text-xs sm:text-sm truncate max-w-[120px]">
                                  {video.titulo}
                                </span>
                              </div>
                              <div className="flex gap-0.5">
                                {index > 0 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 hover:bg-blue-100 text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleChangeVideoOrder(video.id, 'up')
                                    }}
                                    title="Subir posición"
                                  >
                                    <ArrowUp className="h-2.5 w-2.5" />
                                  </Button>
                                )}
                                {index < videos.length - 1 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5 hover:bg-blue-100 text-blue-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleChangeVideoOrder(video.id, 'down')
                                    }}
                                    title="Bajar posición"
                                  >
                                    <ArrowDown className="h-2.5 w-2.5" />
                                  </Button>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <Button onClick={handleCreateVideo} className="shrink-0 h-9 sm:h-10 px-3 sm:px-4">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Agregar Video
                    </Button>
                  </div>
                )}
              </div>

              {videos.length > 0 ? (
                <div className="relative group" ref={videosCarouselRef}>
                  <Carousel
                    opts={{
                      align: "start",
                      loop: false,
                      slidesToScroll: 1,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-3 sm:-ml-4">
                      {/* Los videos ya están ordenados por el estado videos */}
                      {videos.map((video) => {
                        const videoType = detectVideoType(video.video_url)
                        const isYouTube = videoType === 'youtube'
                        const isVimeo = videoType === 'vimeo'
                        const isDirect = videoType === 'direct'

                        return (
                          <CarouselItem
                            key={video.id}
                            className="pl-3 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                          >
                            <div className="card-elevated p-3 sm:p-4 h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group/item">
                              {/* Thumbnail del video con overlay interactivo */}
                              <div 
                                className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 mb-3 sm:mb-4 cursor-pointer"
                                onClick={() => openVideoPreview(video)}
                              >
                                {renderVideoThumbnail(video)}
                                
                                {/* Overlay con botón de play */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/item:bg-black/30 transition-all duration-300">
                                  <div className="transform scale-100 group-hover/item:scale-110 transition-transform duration-300">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
                                      <Play className="h-6 w-6 sm:h-8 sm:w-8 text-primary ml-0.5 sm:ml-1" />
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Indicador de duración (simulado) */}
                                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black/70 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                  {isYouTube ? 'YouTube' : isVimeo ? 'Vimeo' : 'Video'}
                                </div>
                                
                                {/* Mostrar el número de orden */}
                                <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                                  #{video.orden}
                                </div>
                                
                                {isAdmin && (
                                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-20 flex gap-0.5 sm:gap-1">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          size="icon"
                                          className="h-6 w-6 sm:h-8 sm:w-8 bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
                                          aria-label="Opciones del video"
                                        >
                                          <MoreVertical className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent 
                                        className="bg-white/95 backdrop-blur-sm border-gray-200 min-w-[140px] sm:min-w-[160px]"
                                        align="end"
                                      >
                                        <DropdownMenuItem 
                                          className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 text-xs sm:text-sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditVideo(video)
                                          }}
                                        >
                                          <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2 text-gray-600" />
                                          <span className="text-gray-700">Editar video</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 text-xs sm:text-sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            confirmDelete('video', video.id)
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                                          <span>Eliminar video</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                )}
                              </div>
                              
                              {/* Contenido del video */}
                              <div className="flex-grow">
                                <h3 className="font-bold text-base sm:text-lg text-foreground mb-1.5 sm:mb-2 line-clamp-1">
                                  {video.titulo}
                                </h3>
                                <p className="text-xs sm:text-sm text-foreground/70 mb-3 sm:mb-4 line-clamp-2 flex-grow">
                                  {video.descripcion}
                                </p>
                              </div>
                              
                              {/* Botones de acción */}
                              <div className="flex gap-1.5 sm:gap-2 mt-auto">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-primary hover:bg-primary/90 h-8 sm:h-9 text-xs sm:text-sm"
                                  onClick={() => openVideoPreview(video)}
                                >
                                  <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 hidden sm:inline" />
                                  <Play className="h-3 w-3 sm:h-4 sm:w-4 inline sm:hidden" />
                                  <span className="hidden sm:inline">Ver Ahora</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(video.video_url, "_blank")
                                  }}
                                  className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                                  title="Abrir en nueva pestaña"
                                >
                                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="sr-only">Abrir en nueva pestaña</span>
                                </Button>
                              </div>
                            </div>
                          </CarouselItem>
                        )
                      })}
                    </CarouselContent>
                    
                    <CarouselPrevious 
                      className="absolute -left-10 sm:-left-12 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white hover:bg-gray-50 text-gray-900 border shadow-lg hidden lg:flex"
                      data-carousel="previous"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </CarouselPrevious>
                    <CarouselNext 
                      className="absolute -right-10 sm:-right-12 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white hover:bg-gray-50 text-gray-900 border shadow-lg hidden lg:flex"
                      data-carousel="next"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </CarouselNext>
                  </Carousel>
                  
                  {/* Botones responsive para videos */}
                  <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 lg:hidden">
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
                      onClick={handleVideosPrevious}
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
                      onClick={handleVideosNext}
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="h-6 w-6 sm:h-8 sm:w-8 text-primary/50" />
                    </div>
                    <p className="text-foreground/60 mb-3 sm:mb-4 text-sm sm:text-base">No hay videos disponibles.</p>
                    {isAdmin && (
                      <Button onClick={handleCreateVideo} variant="outline" className="h-9 sm:h-10 px-3 sm:px-4">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Agregar el primer video
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
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8 lg:mb-12">
              Compromiso ecológico
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <div className="card-elevated p-4 sm:p-6 lg:p-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3 lg:mb-4">
                  Nuestra Visión
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-foreground/70 leading-relaxed">
                  Promovemos la sostenibilidad y el manejo responsable de
                  desechos. Este sitio web muestra nuestro trabajo por
                  transparencia, participación comunitaria y mejora continua en
                  políticas ecológicas.
                </p>
              </div>

              <div className="card-elevated p-4 sm:p-6 lg:p-8">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3 lg:mb-4">
                  Economía Circular Aplicada
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-foreground/70 leading-relaxed">
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
        <DialogContent className="max-w-3xl lg:max-w-4xl w-[95vw] p-0 bg-black border-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Reproductor de video: {selectedVideo?.titulo}</DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="relative">
              {/* Encabezado personalizado */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="max-w-[75%]">
                  <h3 className="text-white font-bold text-base sm:text-lg truncate">{selectedVideo.titulo}</h3>
                  <p className="text-white/70 text-xs sm:text-sm truncate">{selectedVideo.descripcion}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={closeVideoPreview}
                  className="text-white hover:bg-white/20 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                  aria-label="Cerrar reproductor"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              {/* Reproductor */}
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

              {/* Controles personalizados para videos directos */}
              {detectVideoType(selectedVideo.video_url) === 'direct' && (
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                      aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                    >
                      {isPlaying ? (
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-sm" aria-hidden="true" />
                      ) : (
                        <Play className="h-4 w-4 sm:h-6 sm:w-6" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                      aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                      aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                      <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Pie del modal */}
              <div className="p-3 sm:p-4 bg-black">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-white/70 text-xs sm:text-sm line-clamp-2">{selectedVideo.descripcion}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedVideo.video_url, "_blank")}
                    className="text-white border-white/30 hover:bg-white/10 whitespace-nowrap h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
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
        <DialogContent className="sm:max-w-md">
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
                <div className="text-xs text-gray-500">
                  Actual: {heroImages.length} imágenes
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Número más bajo aparece primero. Usa flechas en el menú de gestión para reordenar.
              </p>
            </div>
            {imageFormData.imagen_url && (
              <div className="mt-4">
                <Label>Vista Previa</Label>
                {/* VISTA PREVIA CON DIMENSIONES PROPORCIONALES AL HERO */}
                <div className="relative aspect-[16/9] md:aspect-[16/10] lg:aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 mt-1.5">
                  <Image
                    src={imageFormData.imagen_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 400px) 100vw"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Dimensiones recomendadas: 16:9 para móvil, 16:10 para tablet, 16:9 para desktop
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
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
        <DialogContent className="sm:max-w-md">
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
                rows={3}
              />
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
              />
              <p className="text-xs text-muted-foreground mt-1">
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
                <div className="text-xs text-gray-500">
                  Actual: {videos.length} videos
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Número más bajo aparece primero. Usa flechas en el botón "Ordenar" para reordenar.
              </p>
            </div>
            {videoFormData.video_url && (
              <div className="mt-4">
                <Label>Vista Previa del Enlace</Label>
                <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded">
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
          <DialogFooter>
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
            <AlertDialogDescription>
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

      {/* Estilos CSS globales */}
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

        @keyframes plant-grow {
          0% { 
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% { 
            transform: scale(1.2) rotate(180deg);
            opacity: 0.5;
          }
          100% { 
            transform: scale(1) rotate(360deg);
            opacity: 0.3;
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

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
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

        .animate-plant-grow {
          animation: plant-grow 2s ease-in-out infinite;
        }

        .animate-grow-in {
          animation: grow-in 0.2s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          animation-delay: 0.3s;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        /* Mantener el color original del hero */
        .gradient-eco {
          background: linear-gradient(135deg, #0e8b4d 0%, #24b12f 25%, #17a72f 50%, #13642e 75%, #0b632d 100%);
          position: relative;
          overflow: hidden;
        }

        /* Efecto de luz solar filtrada */
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

        /* Patrón de hojas muy sutiles de fondo */
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
      `}</style>
    </div>
  )
}

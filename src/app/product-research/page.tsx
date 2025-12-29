"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Script from 'next/script';
import { Card } from "@/components/ui/card";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { getProductVideos, transformVideoForDisplay, type TikTokVideo } from "@/lib/tiktok-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Search,
  TrendingUp,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Star,
  Eye,
  Heart,
  Share,
  Filter as _Filter,
  SortAsc as _SortAsc,
  MoreVertical,
} from "lucide-react";

// Sample trending products data
const _trendingProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Earbuds",
    category: "Electronics",
    tiktokViews: "2.3M",
    engagement: "8.5%",
    trend: "+15%",
    price: "$29.99",
    image: "🎧",
    tags: ["Tech", "Audio", "Wireless"],
  },
  {
    id: 2,
    name: "LED Strip Lights",
    category: "Home Decor",
    tiktokViews: "1.8M",
    engagement: "12.3%",
    trend: "+22%",
    price: "$19.99",
    image: "💡",
    tags: ["Home", "Lighting", "RGB"],
  },
  {
    id: 3,
    name: "Phone Camera Lens Kit",
    category: "Photography",
    tiktokViews: "1.5M",
    engagement: "9.7%",
    trend: "+8%",
    price: "$24.99",
    image: "📷",
    tags: ["Photography", "Mobile", "Lens"],
  },
  {
    id: 4,
    name: "Skincare Face Roller",
    category: "Beauty",
    tiktokViews: "3.1M",
    engagement: "15.2%",
    trend: "+31%",
    price: "$15.99",
    image: "✨",
    tags: ["Beauty", "Skincare", "Wellness"],
  },
  {
    id: 5,
    name: "Portable Phone Stand",
    category: "Accessories",
    tiktokViews: "900K",
    engagement: "6.8%",
    trend: "+5%",
    price: "$12.99",
    image: "📱",
    tags: ["Accessories", "Mobile", "Stand"],
  },
  {
    id: 6,
    name: "Car Air Freshener",
    category: "Automotive",
    tiktokViews: "1.2M",
    engagement: "7.4%",
    trend: "+12%",
    price: "$8.99",
    image: "🚗",
    tags: ["Car", "Fragrance", "Auto"],
  },
];

// Sample TikTok ads data
const featuredTikTokAds = [
  {
    id: 1,
    title: "Viral LED Strip Setup",
    creator: "@homedecor_queen",
    views: "2.8M",
    likes: "342K",
    shares: "28K",
    product: "Smart RGB LED Strips",
    price: "$19.99",
    engagement: "12.2%",
    thumbnail: "💡",
    tags: ["Home", "LED", "Setup", "Viral"],
  },
  {
    id: 2,
    title: "Morning Skincare Routine",
    creator: "@skincare_sarah",
    views: "1.9M",
    likes: "289K",
    shares: "15K",
    product: "Jade Face Roller",
    price: "$15.99",
    engagement: "15.3%",
    thumbnail: "✨",
    tags: ["Skincare", "Beauty", "Morning", "Routine"],
  },
  {
    id: 3,
    title: "Phone Camera Hacks",
    creator: "@tech_tips_daily",
    views: "3.2M",
    likes: "456K",
    shares: "52K",
    product: "Phone Lens Kit",
    price: "$24.99",
    engagement: "14.2%",
    thumbnail: "📷",
    tags: ["Tech", "Photography", "Hacks", "Mobile"],
  },
  {
    id: 4,
    title: "Car Organization Ideas",
    creator: "@organize_everything",
    views: "1.4M",
    likes: "198K",
    shares: "22K",
    product: "Car Organizer Set",
    price: "$22.99",
    engagement: "14.1%",
    thumbnail: "🚗",
    tags: ["Car", "Organization", "Storage", "Travel"],
  },
  {
    id: 5,
    title: "Workout Gear Essentials",
    creator: "@fitness_life_hacks",
    views: "2.1M",
    likes: "315K",
    shares: "38K",
    product: "Resistance Bands Set",
    price: "$17.99",
    engagement: "14.9%",
    thumbnail: "💪",
    tags: ["Fitness", "Workout", "Exercise", "Health"],
  },
  {
    id: 6,
    title: "Smart Kitchen Gadgets",
    creator: "@kitchen_innovator",
    views: "1.7M",
    likes: "245K",
    shares: "32K",
    product: "Multi-Function Kitchen Tool",
    price: "$21.99",
    engagement: "13.8%",
    thumbnail: "🍳",
    tags: ["Kitchen", "Gadgets", "Cooking", "Innovation"],
  },
  {
    id: 7,
    title: "DIY Home Decor Tips",
    creator: "@home_style_guru",
    views: "2.4M",
    likes: "378K",
    shares: "45K",
    product: "Decorative Wall Panels",
    price: "$18.99",
    engagement: "15.7%",
    thumbnail: "🏠",
    tags: ["Home", "Decor", "DIY", "Interior"],
  },
];

// VideoJS Player Component
function VideoPlayer({ src, adId, autoplay = false }: { src: string; adId: number; autoplay?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const isInitializedRef = useRef(false);

  // Handle play/pause on hover, let Video.js handle control visibility
  const handleMouseEnter = () => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      player.play().catch((e: any) => console.log('Play error:', e));
    }
  };

  const handleMouseLeave = (event: MouseEvent) => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;

    // Get the element we're moving to
    const relatedTarget = event.relatedTarget as HTMLElement;

    // If moving to control bar or its children, don't pause
    if (relatedTarget && (
      relatedTarget.closest('.vjs-control-bar') ||
      relatedTarget.classList.contains('vjs-control-bar')
    )) {
      return;
    }

    // Only pause if truly leaving the video area
    player.pause();
  };

  // Simplified approach - no control bar event listeners, use CSS hover instead

  useEffect(() => {
    // Prevent double initialization
    if (isInitializedRef.current) return;

    // Add delay to ensure DOM is ready and Video.js is loaded
    const initializePlayer = async () => {
      if (!videoRef.current) {
        return;
      }

      // Ensure Video.js is available
      if (typeof videojs === 'undefined') {
        console.error('Video.js not loaded!');
        return;
      }

      // Check if already initialized
      if (playerRef.current && !playerRef.current.isDisposed()) {
        return;
      }

      const videoElement = videoRef.current;

      // Small delay to ensure DOM is stable
      await new Promise(resolve => setTimeout(resolve, 150));

      // Double check the element still exists
      if (!videoRef.current) return;

      isInitializedRef.current = true;
    
      const player = videojs(videoElement, {
        controls: true, // Enable Video.js default controls
        fluid: false,
        responsive: true,
        aspectRatio: '9:16',
        muted: true,
        preload: 'metadata',
        playsinline: true,
        userActions: {
          hotkeys: true
        },
        sources: [{
          src: src,
          type: 'video/mp4'
        }]
      });

    player.ready(() => {
      console.log('Player ready for ad:', adId);
      
      // Configure controls using correct Video.js component names
      const controlBar = (player as any).controlBar;
      
      // Let Video.js handle control bar visibility naturally
      
      // Hide unwanted controls (using actual component property names)
      if (controlBar.currentTimeDisplay) controlBar.currentTimeDisplay.hide();
      if (controlBar.timeDivider) controlBar.timeDivider.hide(); 
      if (controlBar.durationDisplay) controlBar.durationDisplay.hide();
      if (controlBar.liveControl) controlBar.liveControl.hide();
      if (controlBar.seekToLiveControl) controlBar.seekToLiveControl.hide();
      if (controlBar.customControlSpacer) controlBar.customControlSpacer.hide();
      if (controlBar.playbackRateMenuButton) controlBar.playbackRateMenuButton.hide();
      if (controlBar.chaptersButton) controlBar.chaptersButton.hide();
      if (controlBar.descriptionsButton) controlBar.descriptionsButton.hide();
      if (controlBar.subsCapsButton) controlBar.subsCapsButton.hide();
      if (controlBar.audioButton) controlBar.audioButton.hide();
      
      // Show our desired controls: play, mute, progress, time, fullscreen
      if (controlBar.playToggle) controlBar.playToggle.show();
      
      // Show mute button specifically
      if (controlBar.muteToggle) {
        controlBar.muteToggle.show();
      } else if (controlBar.volumePanel) {
        controlBar.volumePanel.show();
        // Hide volume slider but keep mute button
        if (controlBar.volumePanel.volumeControl) {
          controlBar.volumePanel.volumeControl.hide();
        }
        if (controlBar.volumePanel.muteToggle) {
          controlBar.volumePanel.muteToggle.show();
        }
      }
      
      if (controlBar.progressControl) controlBar.progressControl.show();
      if (controlBar.remainingTimeDisplay) controlBar.remainingTimeDisplay.show();
      if (controlBar.fullscreenToggle) controlBar.fullscreenToggle.show();

      // Autoplay if requested
      if (autoplay) {
        player.play?.()?.catch?.((e: any) => console.log('Autoplay error:', e));
      }
    });

      playerRef.current = player;

      // Add play/pause event listeners, let Video.js handle control visibility
      if (containerRef.current) {
        const container = containerRef.current;
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave as EventListener);
      }

    setIsPlayerReady(true);
  };

  // Call the async initialization function
  initializePlayer();

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Remove play/pause event listeners
      if (containerRef.current) {
        const container = containerRef.current;
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave as EventListener);
      }

      // Properly dispose of the player
      const player = playerRef.current;
      if (player && typeof player.dispose === 'function' && !player.isDisposed()) {
        try {
          player.dispose();
        } catch (e) {
          // Silently handle disposal errors
        }
      }

      // Clear references
      playerRef.current = null;
      isInitializedRef.current = false;
      setIsPlayerReady(false);
    };
  }, []);

  // Handle autoplay prop changes (e.g., when sheet opens/closes)
  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed()) return;

    if (autoplay) {
      player.play?.()?.catch?.((e: any) => console.log('Autoplay error:', e));
    } else {
      player.pause?.();
    }
  }, [autoplay]);

  return (
    <div ref={containerRef} className="h-full w-full bg-black relative">
      {!isPlayerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-sm">Loading...</div>
        </div>
      )}
      <video 
        ref={videoRef}
        className="video-js vjs-default-skin h-full w-full bg-black"
      />
    </div>
  );
}

// Transform TikTok API data to match our display format
interface DisplayVideo {
  id: string;
  title: string;
  creator: string;
  views: string;
  likes: string;
  shares: string;
  comments: string;
  engagement: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  rawLikes: number; // For filtering
  region: string; // For country filtering (e.g., "US", "BR", "GB", "AU", "FR")
}

// Map region codes to filter IDs
const REGION_MAP: Record<string, string> = {
  'US': 'us',
  'AU': 'australia',
  'BR': 'brazil',
  'GB': 'uk',
  'FR': 'france',
};

// Industry keywords for filtering (matches video title/content)
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  pets: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'animal', 'fur'],
  apparel: ['fashion', 'clothes', 'dress', 'shirt', 'pants', 'shoes', 'outfit', 'wear', 'style'],
  appliances: ['appliance', 'kitchen', 'blender', 'mixer', 'vacuum', 'cleaner'],
  household: ['home', 'house', 'room', 'decor', 'furniture', 'storage', 'organizer'],
  vehicle: ['car', 'auto', 'vehicle', 'truck', 'motorcycle', 'driving'],
  beauty: ['beauty', 'skincare', 'makeup', 'cosmetic', 'skin', 'face', 'hair', 'nail'],
  baby: ['baby', 'kid', 'child', 'toddler', 'maternity', 'mom', 'parent'],
  tech: ['tech', 'gadget', 'electronic', 'phone', 'computer', 'smart', 'wireless', 'bluetooth'],
  sports: ['sport', 'fitness', 'gym', 'workout', 'exercise', 'outdoor', 'hiking', 'camping'],
};

export default function ProductResearchPage() {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedLikesFilter, setSelectedLikesFilter] = useState("top61-100");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tiktokVideos, setTiktokVideos] = useState<DisplayVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<DisplayVideo | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);

  // Language state from settings
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [frenchEnabled, setFrenchEnabled] = useState(false);
  const [portugueseEnabled, setPortugueseEnabled] = useState(false);
  const [germanEnabled, setGermanEnabled] = useState(false);
  const [italianEnabled, setItalianEnabled] = useState(false);
  const [spanishEnabled, setSpanishEnabled] = useState(false);

  const router = useRouter();

  // Available languages based on enabled settings
  const availableLanguages = [
    { id: "english", label: "English", enabled: true },
    { id: "french", label: "Français", enabled: frenchEnabled },
    { id: "portuguese", label: "Português", enabled: portugueseEnabled },
    { id: "german", label: "Deutsch", enabled: germanEnabled },
    { id: "italian", label: "Italiano", enabled: italianEnabled },
    { id: "spanish", label: "Español", enabled: spanishEnabled },
  ];

  // Fetch TikTok videos on mount
  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true);
      setError(null);
      try {
        const videos = await getProductVideos(30); // Single API call for fast load

        if (videos.length > 0) {
          const transformed: DisplayVideo[] = videos.map(video => ({
            ...transformVideoForDisplay(video),
            rawLikes: video.digg_count || 0,
            region: video.region || '',
          }));
          setTiktokVideos(transformed);
        } else {
          // Fallback to mock data if API fails
          setTiktokVideos(featuredTikTokAds.map((ad, index) => ({
            id: ad.id.toString(),
            title: ad.title,
            creator: ad.creator,
            views: ad.views,
            likes: ad.likes,
            shares: ad.shares,
            comments: '0',
            engagement: ad.engagement,
            thumbnail: ad.thumbnail,
            videoUrl: '', // Will use hardcoded URLs as fallback
            duration: 0,
            rawLikes: parseInt(ad.likes.replace(/[KM]/g, '')) * (ad.likes.includes('M') ? 1000000 : ad.likes.includes('K') ? 1000 : 1),
            region: 'US',
          })));
        }
      } catch (err) {
        console.error('Error fetching TikTok videos:', err);
        setError('Failed to load videos');
        // Fallback to mock data
        setTiktokVideos(featuredTikTokAds.map((ad) => ({
          id: ad.id.toString(),
          title: ad.title,
          creator: ad.creator,
          views: ad.views,
          likes: ad.likes,
          shares: ad.shares,
          comments: '0',
          engagement: ad.engagement,
          thumbnail: ad.thumbnail,
          videoUrl: '',
          duration: 0,
          rawLikes: parseInt(ad.likes.replace(/[KM]/g, '')) * (ad.likes.includes('M') ? 1000000 : ad.likes.includes('K') ? 1000 : 1),
          region: 'US',
        })));
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideos();
  }, []);

  // Toggle country filter
  const toggleCountryFilter = (countryId: string) => {
    setSelectedCountries(prev =>
      prev.includes(countryId)
        ? prev.filter(c => c !== countryId)
        : [...prev, countryId]
    );
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Toggle industry filter
  const toggleIndustryFilter = (industryId: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industryId)
        ? prev.filter(i => i !== industryId)
        : [...prev, industryId]
    );
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Filter videos by search, industry, likes percentage and country
  const getFilteredVideos = useCallback(() => {
    if (tiktokVideos.length === 0) return [];

    // First apply search filter
    let filtered = tiktokVideos;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = tiktokVideos.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.creator.toLowerCase().includes(query)
      );
    }

    // Apply country filter if any countries are selected
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(video => {
        const videoCountryId = REGION_MAP[video.region] || '';
        return selectedCountries.includes(videoCountryId);
      });
    }

    // Apply industry filter if any industries are selected
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(video => {
        const titleLower = video.title.toLowerCase();
        return selectedIndustries.some(industry => {
          const keywords = INDUSTRY_KEYWORDS[industry] || [];
          return keywords.some(keyword => titleLower.includes(keyword));
        });
      });
    }

    // Sort by likes descending to establish ranking
    const sorted = [...filtered].sort((a, b) => b.rawLikes - a.rawLikes);
    const totalCount = sorted.length;

    if (totalCount === 0) return [];

    // Apply likes percentage filter (if not "all")
    if (selectedLikesFilter === 'all') {
      return sorted; // Return all videos sorted by likes
    }

    // "Top 1%-30%" means top 30% by likes, "Top 31%-60%" means middle, "Top 61%-100%" means bottom 40%
    let startPercent = 0;
    let endPercent = 100;

    switch (selectedLikesFilter) {
      case 'top1-30':
        startPercent = 0;
        endPercent = 30;
        break;
      case 'top31-60':
        startPercent = 30;
        endPercent = 60;
        break;
      case 'top61-100':
        startPercent = 60;
        endPercent = 100;
        break;
    }

    const startIndex = Math.floor(totalCount * (startPercent / 100));
    const endIndex = Math.ceil(totalCount * (endPercent / 100));

    return sorted.slice(startIndex, endIndex);
  }, [tiktokVideos, selectedLikesFilter, selectedCountries, selectedIndustries, searchQuery]);

  const filteredVideos = getFilteredVideos();

  // Pagination settings - 4 rows x 4 columns = 16 videos per page
  const adsPerPage = 16;
  const totalAds = filteredVideos.length;
  const maxPages = 6; // Limit to 6 pages max
  const calculatedPages = Math.ceil(totalAds / adsPerPage);
  const totalPages = Math.min(calculatedPages, maxPages);

  // Calculate current ads to display
  const startIndex = (currentPage - 1) * adsPerPage;
  const endIndex = startIndex + adsPerPage;
  const currentAds = filteredVideos.slice(startIndex, endIndex);

  useEffect(() => {
    console.log('Video.js loaded via npm import');

    // Video.js styling following official creator guidelines
    const style = document.createElement('style');
    style.textContent = `
      /* Video.js custom styling based on official creator guidelines */
      .video-js {
        /* Base font size controls the size of everything, not just text */
        font-size: 10px;
        width: 100% !important;
        height: 100% !important;
        border-radius: 12px 12px 0 0;
        
        /* Main font color changes the ICON COLORS as well as the text */
        color: #fff;
      }
      
      /* Hide big play button completely */
      .video-js .vjs-big-play-button {
        display: none !important;
      }
      
      /* Control bar styling - let Video.js handle visibility, just style it */
      .video-js .vjs-control-bar {
        /* Custom styling only */
        background-color: #2B333F;
        background-color: rgba(43, 51, 63, 0.7);
        height: 3em;
        padding: 0 0.5em;
        align-items: center;
        /* Ensure controls are clickable */
        pointer-events: auto !important;
        z-index: 2;
      }
      
      /* Slider styling (progress bar) */
      .video-js .vjs-slider {
        background-color: #5a6470;
        background-color: rgba(90, 100, 112, 0.5);
      }
      
      /* Progress bar and volume level colors */
      .video-js .vjs-volume-level,
      .video-js .vjs-play-progress,
      .video-js .vjs-slider-bar {
        background: #fff;
      }
      
      /* Load progress styling */
      .video-js .vjs-load-progress {
        background: rgba(90, 100, 112, 0.5);
      }
      
      .video-js .vjs-load-progress div {
        background: rgba(90, 100, 112, 0.75);
      }
      
      /* Progress control takes up available space */
      .video-js .vjs-progress-control {
        flex: 1;
        margin: 0 0.5em;
      }
      
      /* Time display */
      .video-js .vjs-remaining-time {
        font-size: 1em;
        color: #fff;
        margin-left: 0.3em;
      }
      
      /* Hide unwanted controls */
      .video-js .vjs-volume-control,
      .video-js .vjs-current-time,
      .video-js .vjs-time-divider,
      .video-js .vjs-duration,
      .video-js .vjs-live-control,
      .video-js .vjs-seek-to-live-control,
      .video-js .vjs-custom-control-spacer,
      .video-js .vjs-playback-rate,
      .video-js .vjs-chapters-button,
      .video-js .vjs-descriptions-button,
      .video-js .vjs-subs-caps-button,
      .video-js .vjs-audio-button,
      .video-js .vjs-picture-in-picture-control,
      .video-js .vjs-spacer,
      .video-js .vjs-flexible-width-spacer {
        display: none !important;
      }
      
      /* Show only our desired controls: play, mute, progress, time, fullscreen */
      .video-js .vjs-play-control,
      .video-js .vjs-mute-control,
      .video-js .vjs-volume-panel .vjs-mute-control,
      .video-js .vjs-progress-control,
      .video-js .vjs-remaining-time,
      .video-js .vjs-fullscreen-control {
        display: flex !important;
        align-items: center;
        justify-content: center;
        /* Ensure all controls are clickable */
        pointer-events: auto !important;
        cursor: pointer;
      }
      
      /* Ensure volume panel shows but hide the slider */
      .video-js .vjs-volume-panel {
        display: flex !important;
        pointer-events: auto !important;
      }
      
      .video-js .vjs-volume-panel .vjs-volume-control {
        display: none !important;
      }
      
      /* Let Video.js handle all control visibility - no custom hover overrides */
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const _getTrendColor = (trend: string) => {
    const value = parseInt(trend.replace(/[+%]/g, ""));
    if (value >= 20) return "text-green-600";
    if (value >= 10) return "text-blue-600";
    return "text-orange-600";
  };

  const _getTrendBgColor = (trend: string) => {
    const value = parseInt(trend.replace(/[+%]/g, ""));
    if (value >= 20) return "bg-green-500/10";
    if (value >= 10) return "bg-blue-500/10";
    return "bg-orange-500/10";
  };

  return (
    <div className="h-full w-full px-8 py-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center space-x-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Search className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-foreground text-4xl font-medium">Product Research</h1>
          </div>
          <p className="text-muted-foreground">
            You can determine what products to sell by what&apos;s trending on TikTok.{" "}
            <a
              href="#"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 underline"
            >
              Click here to learn more
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="featured-ads" className="w-full">
          <TabsList className="border-border mb-6 h-auto justify-start rounded-none border-0 border-b bg-transparent p-0">
            <TabsTrigger
              value="featured-ads"
              className="data-[state=active]:border-primary hover:text-primary mr-8 flex items-center gap-3 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-4 text-base font-medium transition-colors data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <img src="/tiktok_color_icon.png" alt="TikTok" className="h-6 w-6" />
              Featured TikTok Ads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured-ads" className="mt-0">
            {/* Search and Filter Bar */}
            <div className="mb-8 flex items-center gap-4">
              <div className="relative flex-1 rounded-xl shadow-[0_0_0_1px_rgba(60,66,87,0.16)] hover:shadow-[0_0_0_1px_rgba(60,66,87,0.16),0_2px_8px_rgba(60,66,87,0.1)] focus-within:shadow-[0_0_0_1px_rgba(60,66,87,0.16),0_2px_8px_rgba(60,66,87,0.1)] transition-shadow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search TikTok ads, creators, or products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setCurrentPage(1);
                    }
                  }}
                  className="h-14 pl-12 text-base border-0 focus-visible:ring-0 shadow-none rounded-xl"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="hover:bg-muted h-14 border-0 px-8 shadow-none">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 24 24"
                      className="-mr-1 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 14L4 5V3H20V5L14 14V20L10 22V14Z" />
                    </svg>
                    <span className="text-lg font-light">Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[360px] sm:max-w-[80vw]">
                  <div className="flex h-full flex-col p-6">
                    <SheetHeader className="pb-4">
                      <SheetTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Filter Ads
                      </SheetTitle>
                      <SheetDescription className="text-muted-foreground text-base">
                        Apply filters to find the most relevant TikTok ads for your research.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mb-6 flex-1 overflow-y-auto">
                      <Accordion
                        type="multiple"
                        defaultValue={["engagement", "categories", "metrics"]}
                        className="w-full space-y-4 pb-4"
                      >
                        <AccordionItem
                          value="engagement"
                          className="border-border bg-card rounded-lg border"
                        >
                          <AccordionTrigger className="rounded-t-lg px-4 py-4 text-base font-semibold hover:no-underline sm:text-lg [&[data-state=open]]:rounded-b-none">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                              Filter by Country
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-4">
                            <div className="ml-4 space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="us"
                                  checked={selectedCountries.includes('us')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('us')}
                                />
                                <label
                                  htmlFor="us"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  United States
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="australia"
                                  checked={selectedCountries.includes('australia')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('australia')}
                                />
                                <label
                                  htmlFor="australia"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Australia
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="brazil"
                                  checked={selectedCountries.includes('brazil')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('brazil')}
                                />
                                <label
                                  htmlFor="brazil"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Brazil
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="uk"
                                  checked={selectedCountries.includes('uk')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('uk')}
                                />
                                <label
                                  htmlFor="uk"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  United Kingdom
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="france"
                                  checked={selectedCountries.includes('france')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('france')}
                                />
                                <label
                                  htmlFor="france"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  France
                                </label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="categories"
                          className="border-border bg-card rounded-lg border"
                        >
                          <AccordionTrigger className="rounded-t-lg px-4 py-4 text-base font-semibold hover:no-underline sm:text-lg [&[data-state=open]]:rounded-b-none">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-600">
                                <Star className="h-5 w-5 text-white" />
                              </div>
                              Filter by Industry
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-4">
                            <div className="ml-4 space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="pets"
                                  checked={selectedIndustries.includes('pets')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('pets')}
                                />
                                <label
                                  htmlFor="pets"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Pets
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="apparel"
                                  checked={selectedIndustries.includes('apparel')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('apparel')}
                                />
                                <label
                                  htmlFor="apparel"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Apparel & Accessories
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="appliances"
                                  checked={selectedIndustries.includes('appliances')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('appliances')}
                                />
                                <label
                                  htmlFor="appliances"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Appliances
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="household"
                                  checked={selectedIndustries.includes('household')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('household')}
                                />
                                <label
                                  htmlFor="household"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Household Products
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="vehicle"
                                  checked={selectedIndustries.includes('vehicle')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('vehicle')}
                                />
                                <label
                                  htmlFor="vehicle"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Vehicle & Transportation
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="beauty"
                                  checked={selectedIndustries.includes('beauty')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('beauty')}
                                />
                                <label
                                  htmlFor="beauty"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Beauty & Personal Care
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="baby"
                                  checked={selectedIndustries.includes('baby')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('baby')}
                                />
                                <label
                                  htmlFor="baby"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Baby, Kids & Maternity
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="tech"
                                  checked={selectedIndustries.includes('tech')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('tech')}
                                />
                                <label
                                  htmlFor="tech"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Tech & Electronics
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="sports"
                                  checked={selectedIndustries.includes('sports')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('sports')}
                                />
                                <label
                                  htmlFor="sports"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Sports & Outdoor
                                </label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="metrics"
                          className="border-border bg-card rounded-lg border [&:last-child]:border-b"
                        >
                          <AccordionTrigger className="rounded-t-lg px-4 py-4 text-base font-semibold hover:no-underline sm:text-lg [&[data-state=open]]:rounded-b-none">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                                <Eye className="h-5 w-5 text-white" />
                              </div>
                              Filter by Likes
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-4">
                            <div className="ml-4">
                              <RadioGroup
                                value={selectedLikesFilter}
                                onValueChange={value => {
                                  if (value === "top1-30" || value === "top31-60") {
                                    setShowUpgradeDialog(true);
                                    return;
                                  }
                                  setSelectedLikesFilter(value);
                                  setCurrentPage(1);
                                }}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="all"
                                    id="all"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="all"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    All Videos
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="top1-30"
                                    id="top1-30"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="top1-30"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Top 1% - 30%
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="top31-60"
                                    id="top31-60"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="top31-60"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Top 31% - 60%
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="top61-100"
                                    id="top61-100"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="top61-100"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Top 61% - 100%
                                  </label>
                                </div>
                              </RadioGroup>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Upgrade Dialog */}
                    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">Upgrade Plan</DialogTitle>
                          <DialogDescription className="text-base">
                            Please UPGRADE to use these paid features and remove limitations
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>

                    <div className="border-border border-t pt-6">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12 flex-1 bg-gradient-to-r text-base font-semibold transition-all duration-200">
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          className="hover:bg-muted h-12 flex-1 text-base font-medium transition-colors"
                          onClick={() => {
                            // Clear all filters
                            setSelectedCountries([]);
                            setSelectedIndustries([]);
                            setSelectedLikesFilter('top61-100');
                            setCurrentPage(1);
                          }}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Filter Status Row */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="sm">
                    {selectedLikesFilter === 'all' ? 'All Videos' :
                     selectedLikesFilter === 'top1-30' ? 'Top 1% - 30%' :
                     selectedLikesFilter === 'top31-60' ? 'Top 31% - 60%' :
                     'Top 61% - 100%'}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[360px] sm:max-w-[80vw]">
                  <div className="flex h-full flex-col p-6">
                    <SheetHeader className="pb-4">
                      <SheetTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Filter Ads
                      </SheetTitle>
                      <SheetDescription className="text-muted-foreground text-base">
                        Apply filters to find the most relevant TikTok ads for your research.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mb-6 flex-1 overflow-y-auto">
                      <Accordion
                        type="multiple"
                        defaultValue={["engagement", "categories", "metrics"]}
                        className="w-full space-y-4 pb-4"
                      >
                        <AccordionItem
                          value="engagement"
                          className="border-border bg-card rounded-lg border"
                        >
                          <AccordionTrigger className="rounded-t-lg px-4 py-4 text-base font-semibold hover:no-underline sm:text-lg [&[data-state=open]]:rounded-b-none">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                                <TrendingUp className="h-5 w-5 text-white" />
                              </div>
                              Filter by Country
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-4">
                            <div className="ml-4 space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="us-2"
                                  checked={selectedCountries.includes('us')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('us')}
                                />
                                <label
                                  htmlFor="us-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  United States
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="australia-2"
                                  checked={selectedCountries.includes('australia')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('australia')}
                                />
                                <label
                                  htmlFor="australia-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Australia
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="brazil-2"
                                  checked={selectedCountries.includes('brazil')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('brazil')}
                                />
                                <label
                                  htmlFor="brazil-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Brazil
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="uk-2"
                                  checked={selectedCountries.includes('uk')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('uk')}
                                />
                                <label
                                  htmlFor="uk-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  United Kingdom
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="france-2"
                                  checked={selectedCountries.includes('france')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleCountryFilter('france')}
                                />
                                <label
                                  htmlFor="france-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  France
                                </label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="categories"
                          className="border-border bg-card rounded-lg border"
                        >
                          <AccordionTrigger className="rounded-t-lg px-4 py-4 text-base font-semibold hover:no-underline sm:text-lg [&[data-state=open]]:rounded-b-none">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-600">
                                <Star className="h-5 w-5 text-white" />
                              </div>
                              Filter by Industry
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-4">
                            <div className="ml-4 space-y-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="pets-2"
                                  checked={selectedIndustries.includes('pets')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('pets')}
                                />
                                <label
                                  htmlFor="pets-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Pets
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="apparel-2"
                                  checked={selectedIndustries.includes('apparel')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('apparel')}
                                />
                                <label
                                  htmlFor="apparel-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Apparel & Accessories
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="appliances-2"
                                  checked={selectedIndustries.includes('appliances')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('appliances')}
                                />
                                <label
                                  htmlFor="appliances-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Appliances
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="household-2"
                                  checked={selectedIndustries.includes('household')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('household')}
                                />
                                <label
                                  htmlFor="household-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Household Products
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="vehicle-2"
                                  checked={selectedIndustries.includes('vehicle')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('vehicle')}
                                />
                                <label
                                  htmlFor="vehicle-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Vehicle & Transportation
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="beauty-2"
                                  checked={selectedIndustries.includes('beauty')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('beauty')}
                                />
                                <label
                                  htmlFor="beauty-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Beauty & Personal Care
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="baby-2"
                                  checked={selectedIndustries.includes('baby')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('baby')}
                                />
                                <label
                                  htmlFor="baby-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Baby, Kids & Maternity
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="tech-2"
                                  checked={selectedIndustries.includes('tech')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('tech')}
                                />
                                <label
                                  htmlFor="tech-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Tech & Electronics
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="sports-2"
                                  checked={selectedIndustries.includes('sports')}
                                  className="border-foreground/40 data-[state=checked]:border-primary"
                                  onCheckedChange={() => toggleIndustryFilter('sports')}
                                />
                                <label
                                  htmlFor="sports-2"
                                  className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Sports & Outdoor
                                </label>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem
                          value="metrics"
                          className="border-border bg-card rounded-lg border [&:last-child]:border-b"
                        >
                          <AccordionTrigger className="rounded-t-lg px-4 py-4 text-base font-semibold hover:no-underline sm:text-lg [&[data-state=open]]:rounded-b-none">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600">
                                <Eye className="h-5 w-5 text-white" />
                              </div>
                              Filter by Likes
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-8 pb-4">
                            <div className="ml-4">
                              <RadioGroup
                                value={selectedLikesFilter}
                                onValueChange={value => {
                                  if (value === "top1-30" || value === "top31-60") {
                                    setShowUpgradeDialog(true);
                                    return;
                                  }
                                  setSelectedLikesFilter(value);
                                  setCurrentPage(1);
                                }}
                                className="space-y-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="all"
                                    id="all-2"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="all-2"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    All Videos
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="top1-30"
                                    id="top1-30-2"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="top1-30-2"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Top 1% - 30%
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="top31-60"
                                    id="top31-60-2"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="top31-60-2"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Top 31% - 60%
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="top61-100"
                                    id="top61-100-2"
                                    className="border-foreground/40"
                                  />
                                  <label
                                    htmlFor="top61-100-2"
                                    className="cursor-pointer text-base leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    Top 61% - 100%
                                  </label>
                                </div>
                              </RadioGroup>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    {/* Upgrade Dialog */}
                    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">Upgrade Plan</DialogTitle>
                          <DialogDescription className="text-base">
                            Please UPGRADE to use these paid features and remove limitations
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>

                    <div className="border-border border-t pt-6">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12 flex-1 bg-gradient-to-r text-base font-semibold transition-all duration-200">
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          className="hover:bg-muted h-12 flex-1 text-base font-medium transition-colors"
                          onClick={() => {
                            // Clear all filters
                            setSelectedCountries([]);
                            setSelectedIndustries([]);
                            setSelectedLikesFilter('top61-100');
                            setCurrentPage(1);
                          }}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              {/* Country filter badges */}
              {selectedCountries.map(country => (
                <Button
                  key={country}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => toggleCountryFilter(country)}
                >
                  {country === 'us' ? 'United States' :
                   country === 'australia' ? 'Australia' :
                   country === 'brazil' ? 'Brazil' :
                   country === 'uk' ? 'United Kingdom' :
                   country === 'france' ? 'France' : country}
                  <span className="ml-1 text-xs">×</span>
                </Button>
              ))}
            </div>

            {/* Video Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[9/16] rounded-t-xl" />
                    <div className="bg-gray-100 h-16 rounded-b-lg" />
                  </div>
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentAds.map((ad, index) => {
                return (
                <div key={ad.id} className="group relative flex flex-col w-full transition-all duration-300 ease-out shadow-sm shadow-black/10 hover:shadow-md hover:shadow-black/15 rounded-xl overflow-hidden">
                  {/* Video Container */}
                  <div className="relative overflow-hidden bg-gray-900 aspect-[9/16] w-full rounded-t-xl">
                    <VideoPlayer
                      key={`video-${ad.id}`}
                      src={ad.videoUrl || `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`}
                      adId={index + 1}
                    />
                    
                    {/* Video Title Overlay (shown by default, hidden on hover) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity group-hover:opacity-0">
                      <h3 className="text-xs font-medium text-white truncate">
                        {ad.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Stats Section - Attached to video */}
                  <div className="bg-card rounded-b-lg px-2 py-2 transition-all duration-200 h-16 flex items-center justify-between">
                    {/* Default metadata view */}
                    <div className="grid grid-cols-3 h-full text-xs text-muted-foreground group-hover:hidden flex-1">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="text-xs font-medium">Views</span>
                        <span className="text-xs">{ad.views}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="text-xs font-medium">Likes</span>
                        <span className="text-xs">{ad.likes}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="text-xs font-medium">Shares</span>
                        <span className="text-xs">{ad.shares}</span>
                      </div>
                    </div>

                    {/* Learn More button on hover */}
                    <div className="hidden group-hover:flex h-full items-center justify-center flex-1">
                      <Button
                        variant="outline"
                        className="border border-orange-500 text-orange-500 bg-transparent  hover:text-orange-600 hover:border-orange-600 text-base font-medium transition-all duration-200 px-8 py-3 min-w-[140px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVideo(ad);
                          setIsDetailsSheetOpen(true);
                        }}
                      >
                        LEARN MORE
                      </Button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            )}

            {/* Pagination */}
            {totalPages >= 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {/* Page Count Display */}
                <span className="text-base font-medium text-muted-foreground min-w-[80px] text-center">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Ad Details Sheet */}
            <Sheet open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen}>
              <SheetContent
                side="right"
                className="w-full sm:w-[888px] sm:max-w-[888px] overflow-y-auto p-0"
              >
                {selectedVideo && (
                  <div className="flex h-full flex-col">
                    <SheetHeader className="border-b px-6 py-4">
                      <SheetTitle className="text-xl font-semibold">Ad Details</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                      <div className="flex flex-col lg:flex-row gap-6 p-6">
                        {/* Video Player Section */}
                        <div className="w-full lg:w-[300px] flex-shrink-0">
                          <div className="aspect-[9/16] w-full rounded-xl overflow-hidden bg-black">
                            <VideoPlayer
                              key={`details-video-${selectedVideo.id}`}
                              src={selectedVideo.videoUrl || `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`}
                              adId={parseInt(selectedVideo.id) || 1}
                              autoplay={true}
                            />
                          </div>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 space-y-6">
                          {/* Video Data */}
                          <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-base font-semibold mb-4">Video Data</h3>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50">
                                <span className="text-sm text-muted-foreground mb-1">Likes</span>
                                <span className="text-lg font-semibold">{selectedVideo.likes}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50">
                                <span className="text-sm text-muted-foreground mb-1">Comments</span>
                                <span className="text-lg font-semibold">{selectedVideo.comments}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50">
                                <span className="text-sm text-muted-foreground mb-1">Shares</span>
                                <span className="text-lg font-semibold">{selectedVideo.shares}</span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/50">
                                <span className="text-sm text-muted-foreground mb-1">CTR</span>
                                <span className="text-lg font-semibold">{selectedVideo.engagement}</span>
                              </div>
                            </div>
                          </div>

                          {/* Video Information */}
                          <div className="rounded-lg border bg-card p-4">
                            <h3 className="text-base font-semibold mb-4">Video Information</h3>
                            <div className="space-y-4">
                              {/* Video Description */}
                              <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 18H17V16H7V18Z" fill="currentColor"></path>
                                    <path d="M17 14H7V12H17V14Z" fill="currentColor"></path>
                                    <path d="M7 10H11V8H7V10Z" fill="currentColor"></path>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"></path>
                                  </svg>
                                  <span>Video Description</span>
                                </div>
                                <p className="text-sm">{selectedVideo.title || 'No description available'}</p>
                              </div>

                              {/* Video Duration */}
                              <div className="flex items-center gap-2 text-sm">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg">
                                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.71L11 12.41V7h2v4.59l3.71 3.71-1.42 1.41z"></path>
                                </svg>
                                <span className="text-muted-foreground">Video Duration</span>
                                <span className="ml-auto font-medium">{selectedVideo.duration ? `${selectedVideo.duration.toFixed(2)}s` : 'N/A'}</span>
                              </div>

                              {/* Country/Region */}
                              <div className="flex items-center gap-2 text-sm">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg">
                                  <path fill="none" d="M0 0h24v24H0z"></path>
                                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path>
                                </svg>
                                <span className="text-muted-foreground">Country/Region</span>
                                <span className="ml-auto font-medium">
                                  {selectedVideo.region === 'US' ? 'United States' :
                                   selectedVideo.region === 'AU' ? 'Australia' :
                                   selectedVideo.region === 'BR' ? 'Brazil' :
                                   selectedVideo.region === 'GB' ? 'United Kingdom' :
                                   selectedVideo.region === 'FR' ? 'France' :
                                   selectedVideo.region || 'Unknown'}
                                </span>
                              </div>

                              {/* Creator */}
                              <div className="flex items-center gap-2 text-sm">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg">
                                  <path fill="none" d="M0 0h24v24H0z"></path>
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                                </svg>
                                <span className="text-muted-foreground">Creator</span>
                                <span className="ml-auto font-medium">{selectedVideo.creator}</span>
                              </div>

                              {/* Views */}
                              <div className="flex items-center gap-2 text-sm">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Views</span>
                                <span className="ml-auto font-medium">{selectedVideo.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Change Language Dialog */}
            <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
              <DialogContent className="w-[560px] max-h-[258px] p-0 gap-0">
                <DialogHeader className="border-b px-6 py-4">
                  <DialogTitle className="text-base font-semibold">Change Language</DialogTitle>
                  <DialogDescription className="hidden" />
                </DialogHeader>

                <div className="px-6 py-6 space-y-6 flex-1">
                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    You can change the language of your product.
                  </div>

                  {/* Currently Selected Language Only */}
                  <div>
                    <RadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={selectedLanguage} id="current-language" />
                        <label htmlFor="current-language" className="text-sm font-medium cursor-pointer">
                          {selectedLanguage}
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Settings Link */}
                  <button
                    onClick={() => {
                      setIsLanguageDialogOpen(false);
                      router.push('/settings?tab=Product_settings#Multilingual');
                    }}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                  >
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.68735 4.00008L11.294 1.39348C11.6845 1.00295 12.3176 1.00295 12.7082 1.39348L15.3148 4.00008H19.0011C19.5533 4.00008 20.0011 4.4478 20.0011 5.00008V8.68637L22.6077 11.293C22.9982 11.6835 22.9982 12.3167 22.6077 12.7072L20.0011 15.3138V19.0001C20.0011 19.5524 19.5533 20.0001 19.0011 20.0001H15.3148L12.7082 22.6067C12.3176 22.9972 11.6845 22.9972 11.294 22.6067L8.68735 20.0001H5.00106C4.44877 20.0001 4.00106 19.5524 4.00106 19.0001V15.3138L1.39446 12.7072C1.00393 12.3167 1.00393 11.6835 1.39446 11.293L4.00106 8.68637V5.00008C4.00106 4.4478 4.44877 4.00008 5.00106 4.00008H8.68735ZM6.00106 6.00008V9.5148L3.51578 12.0001L6.00106 14.4854V18.0001H9.51578L12.0011 20.4854L14.4863 18.0001H18.0011V14.4854L20.4863 12.0001L18.0011 9.5148V6.00008H14.4863L12.0011 3.5148L9.51578 6.00008H6.00106ZM12.0011 16.0001C9.79192 16.0001 8.00106 14.2092 8.00106 12.0001C8.00106 9.79094 9.79192 8.00008 12.0011 8.00008C14.2102 8.00008 16.0011 9.79094 16.0011 12.0001C16.0011 14.2092 14.2102 16.0001 12.0011 16.0001ZM12.0011 14.0001C13.1056 14.0001 14.0011 13.1047 14.0011 12.0001C14.0011 10.8955 13.1056 10.0001 12.0011 10.0001C10.8965 10.0001 10.0011 10.8955 10.0011 12.0001C10.0011 13.1047 10.8965 14.0001 12.0011 14.0001Z"></path>
                    </svg>
                    Language Setting
                  </button>
                </div>

                {/* Footer with OK Button */}
                <div className="border-t px-6 py-4 flex justify-end gap-3">
                  <Button
                    onClick={() => setIsLanguageDialogOpen(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    OK
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

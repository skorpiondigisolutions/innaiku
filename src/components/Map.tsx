"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo, useLayoutEffect } from "react";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from "@mui/icons-material/Menu";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import HistoryIcon from "@mui/icons-material/History";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CheckIcon from '@mui/icons-material/Check';
import { Share2 } from "lucide-react";
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EditLocationAltOutlinedIcon from '@mui/icons-material/EditLocationAltOutlined';
import ShareLocationOutlinedIcon from '@mui/icons-material/ShareLocationOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import { HiDownload } from "react-icons/hi";
import { ArrowLeft } from "lucide-react";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchBox from "./SearchBox";
import SidebarSearchBox from "./SidebarSearchBox";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "../config/apiConfig";
import { trackEvent } from "@/firebase/analytics";
import { logEvent } from "firebase/analytics";
import Image from "next/image";
import MobilePlaceSidebar from './MobilePlaceSidebar';
import ImageIcon from '@mui/icons-material/Image';
import { Classic } from "@theme-toggles/react";
import "@theme-toggles/react/css/Classic.css";
import { useTheme } from "next-themes";

interface Place {
  title: string;
  lat: number;
  lng: number;
  subtitle?: string;
  photos?: string[];
  reviews?: unknown[];
}

type MenuItem = {
  name: string;
  description?: string;
  price: number | string;
};

type MenuCategory = {
  name: string;
  photos: string[];
  items: MenuItem[];
};

type Category = {
  name: string;
  shop_ids: number[];
};

type FoodItem = {
  id: number;
  name: string;
  price: string;
  cuisine: string;
  discount?: string;
  rating?: string;
  product_url?: string;
  shop_id: number;
  images?: string[];
  created_at?: string;
};

export type RecentPlace = {
  shopId?: number;
  place_id?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  lat: number;
  lng: number;
  timestamp: number;
  rating?: number;
  userRatingsTotal?: number;
  priceText?: string;
  category?: string;
  nativeName?: string
  ratingBreakdown?: { [stars: number]: number };
  isFavorite?: boolean;
  reviews?: google.maps.places.PlaceReview[];
  photos?: string[];
  allPhotos?: string[];
  fullAddress?: string;
  plusCode?: string;
  applink?: string;
  about?: string;
  serviceability?: string;
  openCloseTiming?: string;
  highlights?: string[],
  cuisines?: string[];
  itemsByCuisine?: Record<string, FoodItem[]>;
};

export interface Shop {
  shopId: number;
  imageUrls: string[];
  name: string;
  applink: string;
  menu: string[];
  cuisine: string;
  lat: string;
  lng: string;
  about: string;
  address: string;
  openCloseTiming: string;
  createdAt: string;
  serviceability: string;
  priceText?: string;
  rating?: number;
  userRatingsTotal?: number;
  cuisines?: string[];
  itemsByCuisine?: Record<string, FoodItem[]>;
  allPhotos?: string[];
}

export type CombinedItem =
  | { type: "recent"; data: RecentPlace }
  | { type: "suggestion"; data: Shop }
  | { type: "home" }
  | { type: "more" };


export type SidebarCombinedItem =
  | { type: "recent"; data: RecentPlace }
  | { type: "suggestion"; data: Shop }
  | { type: "home" }
  | { type: "more" };

interface GroupTag {
  name: string;
  count: number;
  places: RecentPlace[];
}

const getStaticMapUrl = (map: google.maps.Map, type: "satellite" | "roadmap") => {
  const center = map.getCenter();
  const zoom = map.getZoom();
  const lat = center?.lat();
  const lng = center?.lng();
  const mapType = type === "satellite" ? "satellite" : "roadmap";

  const styleParam =
    type === "roadmap"
      ? "&style=feature:all|element:labels|visibility:off"
      : "";

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=200x200&maptype=${mapType}${styleParam}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
};

const CATEGORY_MAP: Record<string, string> = {
  accounting: "Accounting",
  bakery: "Bakery",
  bar: "Bar",
  beauty_salon: "Beauty Salon",
  cafe: "Cafe",
  restaurant: "Restaurant",
  meal_takeaway: "Restaurant",
  meal_delivery: "Restaurant",
  casino: "Casino",
  bar_and_grill: "Bar & Grill",
  atm: "ATM",
  bank: "Bank",
  bicycle_store: "Bicycle Store",
  book_store: "Book Store",
  clothing_store: "Clothing Store",
  convenience_store: "Convenience Store",
  department_store: "Department Store",
  electronics_store: "Electronics Store",
  florist: "Florist",
  furniture_store: "Furniture Store",
  hardware_store: "Hardware Store",
  home_goods_store: "Home Goods Store",
  jewelry_store: "Jewelry Store",
  liquor_store: "Liquor Store",
  pet_store: "Pet Store",
  pharmacy: "Pharmacy",
  shoe_store: "Shoe Store",
  shopping_mall: "Shopping Mall",
  store: "Store",
  supermarket: "Supermarket",
  amusement_park: "Amusement Park",
  aquarium: "Aquarium",
  art_gallery: "Art Gallery",
  bowling_alley: "Bowling Alley",
  movie_theater: "Movie Theater",
  museum: "Museum",
  night_club: "Night Club",
  park: "Park",
  stadium: "Stadium",
  zoo: "Zoo",
  tourist_attraction: "Tourist Attraction",
  campground: "Campground",
  rv_park: "RV Park",
  moving_company: "Moving Company",
  airport: "Airport",
  bus_station: "Bus Station",
  car_dealer: "Car Dealer",
  car_rental: "Car Rental",
  car_repair: "Car Repair",
  car_wash: "Car Wash",
  gas_station: "Gas Station",
  parking: "Parking",
  subway_station: "Subway Station",
  taxi_stand: "Taxi Stand",
  train_station: "Train Station",
  transit_station: "Transit Station",
  travel_agency: "Travel Agency",
  dentist: "Dentist",
  doctor: "Doctor",
  hospital: "Hospital",
  health_and_wellness: "Health & Wellness",
  insurance_agency: "Insurance Agency",
  lawyer: "Lawyer",
  physiotherapist: "Physiotherapist",
  plumber: "Plumber",
  school: "School",
  primary_school: "Primary School",
  secondary_school: "Secondary School",
  university: "University",
  library: "Library",
  church: "Church",
  mosque: "Mosque",
  hindu_temple: "Hindu Temple",
  synagogue: "Synagogue",
  city_hall: "City Hall",
  local_government_office: "Government Office",
  courthouse: "Courthouse",
  police: "Police",
  fire_station: "Fire Station",
  post_office: "Post Office",
  embassy: "Embassy",
  electrician: "Electrician",
  locksmith: "Locksmith",
  painter: "Painter",
  roofing_contractor: "Contractor",
  establishment: "Establishment",
  point_of_interest: "Point of Interest",
  geocode: "Geocode",
};

function getReadableCategory(place: google.maps.places.PlaceResult): string {
  if (!place.types || place.types.length === 0) return "Point of Interest";

  const PRIORITY_TYPES = [
    "restaurant", "cafe", "bar", "bakery",
    "lodging", "hotel", "hostel",
    "office", "store", "supermarket",
    "school", "university", "gym", "park",
    "beach", "Natural_feature", "museum", "stadium",
    "church", "mosque", "hindu_temple", "synagogue",
    "hospital", "airport", "zoo", "shopping_mall"
  ];

  for (const type of PRIORITY_TYPES) {
    if (place.types.includes(type)) {
      return CATEGORY_MAP[type] || type.replace(/_/g, " ");
    }
  }
  const nonGeneric = place.types.find(
    t => !["establishment", "point_of_interest"].includes(t)
  );
  if (nonGeneric) {
    return CATEGORY_MAP[nonGeneric] || nonGeneric.replace(/_/g, " ");
  }

  return "Point of Interest";
}

const LIGHT_MAP_STYLES = [
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  }
];

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#FFFFFF" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFFFFF" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.attraction",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  }
];

const Map = () => {
  const mapRef = useRef(null);
  const overlayInstancesRef = useRef<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isSatellite, setIsSatellite] = React.useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [recentSidebar, setRecentSidebar] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [topSidebar, setTopSidebar] = useState<"saved" | "recent" | null>(null);
  const [focusedInput, setFocusedInput] = useState<"start" | "destination" | null>(null);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const [recentPlaces, setRecentPlaces] = useState<RecentPlace[]>([]);
  const [sidebarSearchValue, setSidebarSearchValue] = useState("");
  const [showSidebarSuggestions, setShowSidebarSuggestions] = useState(false);
  const savedSidebarSearchBoxRef = useRef<HTMLDivElement>(null);
  const recentSidebarSearchBoxRef = useRef<HTMLDivElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPlaceTitles, setSelectedPlaceTitles] = useState<string[]>([]);
  const isAnySelected = selectedPlaceTitles.length > 0;
  const isDirectionEnabled = isAnySelected && selectedPlaceTitles.length <= 10;
  const SavedIcon = topSidebar === "saved" ? BookmarkRoundedIcon : BookmarkBorderIcon;
  const FavIcon = topSidebar === "saved" ? FavoriteIcon : FavoriteBorderIcon;
  const [menuSidebar, setMenuSidebar] = useState(false);
  const arrowScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [sidebarHighlightedIndex, setSidebarHighlightedIndex] = useState(-1);
  const suggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const fullSidebarSuggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const halfSidebarSuggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const savedSidebarSuggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const recentSidebarSuggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const saveMenuRef = useRef<HTMLDivElement>(null);
  const [startLocation, setStartLocation] = useState("");
  const [destinationLocation, setDestinationLocation] = useState("");
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionSidebarRef = useRef<HTMLDivElement>(null);
  const [travelInfo, setTravelInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const activeRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const altPolylinesRef = useRef<google.maps.Polyline[]>([]);
  const [nextInputToFill, setNextInputToFill] = useState<"start" | "destination">("start");
  const [startCoords, setStartCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const startMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const [startSuggestions, setStartSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const directionBoxRef = useRef<HTMLDivElement>(null);
  const startingPlaceInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [startHighlightedIndex, setStartHighlightedIndex] = useState(-1);
  const [destHighlightedIndex, setDestHighlightedIndex] = useState(-1);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const sidebarMarkerRef = useRef<google.maps.Marker | null>(null);
  const [recentSelectedPlace, setRecentSelectedPlace] = useState<RecentPlace | null>(null);
  const [showRecentDetailsSidebar, setShowRecentDetailsSidebar] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const stickyScrollRef = useRef<HTMLDivElement>(null);
  const [detailsActiveTab, setDetailsActiveTab] = useState("overview");
  const recentSelectedMarkerRef = useRef<google.maps.Marker | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);
  const [favoriteList, setFavoriteList] = useState<string | null>(null);
  const [favoritePlaceList, setFavoritePlaceList] = useState<RecentPlace[]>([]);
  const [locationCopied, setLocationCopied] = useState(false);
  const [placeSidebar, setPlaceSidebar] = useState<"full" | "half" | null>(null);
  const [fullSidebarSelectedPlace, setFullSidebarSelectedPlace] = useState<RecentPlace | null>(null);
  const [fullSidebarActiveTab, setFullSidebarActiveTab] = useState("fullsidebarOverview");
  const [addressFSCopied, setFSAddressCopied] = useState(false);
  const [plusCodeFSCopied, setFSPlusCodeCopied] = useState(false);
  const [locationFSCopied, setFSLocationCopied] = useState(false);
  const [locationHSCopied, setHSLocationCopied] = useState(false);
  const fullSidebarContentRef = useRef<HTMLDivElement | null>(null);
  const [searchOrigin, setSearchOrigin] = useState<"home" | "sidebar" | null>(null);
  const locateMeMarkerRef = useRef<google.maps.Marker | null>(null);
  const categoryMarkersRef = useRef<google.maps.Marker[]>([]);
  const [keepHalfSidebarOpen, setKeepHalfSidebarOpen] = useState(false);
  const fullSidebarSearchBoxRef = useRef<HTMLDivElement>(null);
  const halfSidebarSearchBoxRef = useRef<HTMLDivElement>(null);
  const firstSearchBoxRef = useRef<HTMLDivElement>(null);
  const secondSearchBoxRef = useRef<HTMLDivElement>(null);
  const firstSuggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const secondSuggestionBoxRef = useRef<HTMLDivElement | null>(null);
  const [overviewFSImages, setOverviewFSImages] = useState<string[]>([]);
  const [menuFSImages, setMenuFSImages] = useState<string[]>([]);
  const [highlightFSImages, setHighlightFSImages] = useState<string[]>([]);
  const [menuFSCategories, setMenuFSCategories] = useState<MenuCategory[]>([]);
  const [menuActiveFSTab, setmenuActiveFSTab] = useState<string>("");
  const [menuLeftArrow, setMenuLeftArrow] = useState(false);
  const [menuRightArrow, setMenuRightArrow] = useState(true);
  const menuScrollRef = useRef<HTMLDivElement | null>(null);
  const [overviewDSImages, setOverviewDSImages] = useState<string[]>([]);
  const [menuDSImages, setMenuDSImages] = useState<string[]>([]);
  const [highlightDSImages, setHighlightDSImages] = useState<string[]>([]);
  const [menuDSCategories, setMenuDSCategories] = useState<MenuCategory[]>([]);
  const [menuActiveDSTab, setmenuActiveDSTab] = useState<string>("");
  const [menuDSLeftArrow, setDSMenuLeftArrow] = useState(false);
  const [menuDSRightArrow, setDSMenuRightArrow] = useState(true);
  const menuDSScrollRef = useRef<HTMLDivElement | null>(null);
  const fullSidebarRef = useRef<HTMLDivElement | null>(null);
  const halfSidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarDragging, setSidebarDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [sidebarStartHeight, setSidebarStartHeight] = useState(0);
  const [sidebarHeight, setSidebarHeight] = useState(window.innerWidth < 768 ? window.innerHeight * 0.5 : window.innerHeight);
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const activePlaceMarkerRef = useRef<google.maps.Marker | null>(null);
  const [noMatches, setNoMatches] = useState(false);
  const [suggestions, setSuggestions] = useState<Shop[]>([]);
  const [relatedPlaces, setRelatedPlaces] = useState<Shop[]>([]);
  const [sidebarSuggestions, setSidebarSuggestions] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [extraShopImages, setExtraShopImages] = useState<Record<string, string[]>>({});
  const initialZoomRef = useRef<number>(11);
  const categoryModeRef = useRef(false);
  const [halfSidebarShopRatings, setHalfSidebarShopRatings] = useState<Record<number, number>>({});
  const [halfSidebarShopPrices, setHalfSidebarShopPrices] = useState<Record<number, string>>({});
  const initialCenterRef = useRef({ lat: 13.0827, lng: 80.2707 });
  const categoryBoundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const [isExploreButton, setIsExploreButton] = useState(false);
  const [exploreButtonKey, setExploreButtonKey] = useState(0);



  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileTheme, setIsMobileTheme] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobileTheme(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && mapInstanceRef.current && allShops?.length > 0) {
      exploreButtonFunction();
    }
  }, [allShops, mapInstanceRef]);

  const restoreCategoryView = () => {
    if (categoryBoundsRef.current && mapInstanceRef.current && keepHalfSidebarOpen) {
      const isMobileView = window.innerWidth < 768;
      const padding = { top: 80, bottom: 50, left: 50, right: 50 };

      if (!isMobileView) {
        const sidebarEl = document.getElementById("halfSidebar");
        const sidebarWidth = sidebarEl?.offsetWidth || 410;
        padding.left = sidebarWidth + 50;
      } else {
        const drawerHeight = window.innerHeight * 0.5;
        padding.bottom = drawerHeight + 20;
        padding.top = 180;
        padding.left = 30;
        padding.right = 30;
      }
      mapInstanceRef.current.fitBounds(categoryBoundsRef.current, padding);
    }
  };

  {/*Reset map to initial view when closed the half sidebar which was opened by clicking explore option*/ }
  const resetMapForMobile = () => {
    if (mapInstanceRef.current) {
      if (initialCenterRef.current) {
        const bounds = new google.maps.LatLngBounds(initialCenterRef.current);

        mapInstanceRef.current.fitBounds(bounds, {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        });
      }

      mapInstanceRef.current.setZoom(initialZoomRef.current);
    }
  };

  {/*API for shop price range*/ }
  const fetchShopPriceText = async (shopId: number): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/getFoodPriceRange?shop_id=${shopId}`);
      if (!res.ok) return null;

      const data = await res.json();
      return data.range_display ?? null;
    } catch (err) {
      console.error("Price fetch error:", err);
      return null;
    }
  };

  {/*useEffect for shop price range*/ }
  useEffect(() => {
    if (!relatedPlaces || relatedPlaces.length === 0) return;

    let cancelled = false;

    const loadPriceTexts = async () => {
      const map: Record<number, string> = {};

      for (const p of relatedPlaces) {
        if (p.shopId == null) continue;

        try {
          const priceText = await fetchShopPriceText(p.shopId);
          if (!cancelled && priceText !== null) {
            map[p.shopId] = priceText;
          }
        } catch (e) {
          console.warn(`Failed to fetch priceText for shop ${p.shopId}`, e);
        }
      }

      if (!cancelled) setHalfSidebarShopPrices(map);
    };

    loadPriceTexts();

    return () => {
      cancelled = true;
    };
  }, [relatedPlaces]);

  {/*API for shop rating*/ }
  const fetchShopRating = async (shopId: number): Promise<number | null> => {
    try {
      const res = await fetch(
        `${API_URL}/getShopRatingAverage?shop_id=${shopId}`
      );
      if (!res.ok) return null;

      const data = await res.json();
      return data.average_rating ?? null;
    } catch (err) {
      console.error("Rating fetch error:", err);
      return null;
    }
  };

  {/*useEffect for shop rating*/ }
  useEffect(() => {
    if (!relatedPlaces || relatedPlaces.length === 0) return;

    let cancelled = false;

    const loadRatings = async () => {
      const map: Record<number, number> = {};

      for (const p of relatedPlaces) {
        if (p.shopId == null) continue;

        try {
          const rating = await fetchShopRating(p.shopId);
          if (!cancelled && rating !== null) {
            map[p.shopId] = rating;
          }
        } catch (e) {
          console.warn(`Failed to fetch rating for shop ${p.shopId}`, e);
        }
      }

      if (!cancelled) setHalfSidebarShopRatings(map);
    };

    loadRatings();

    return () => {
      cancelled = true;
    };
  }, [relatedPlaces]);

  function useDummy(..._args: unknown[]) {
    void _args;
  }
  useDummy(
    recentSidebar,
    isLocationSelected,
    isDirectionEnabled,
    SavedIcon,
    showLeftArrow,
    showRightArrow,
    showSaveMenu,
    travelInfo,
    routes,
    activeRouteIndex,
    addressFSCopied,
    plusCodeFSCopied,
    locationFSCopied,
    activeShop,
    setFSAddressCopied,
    setFSPlusCodeCopied,
    setFSLocationCopied,
    selectedCategory,
  );

  const closeCategoryMode = () => {
    categoryModeRef.current = false;
    categoryMarkersRef.current.forEach(m => m.setMap(null));
    categoryMarkersRef.current = [];

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(initialZoomRef.current);
    }
  };

  {/*Shop details will show when category tile is cliked*/ }
  const runCategorySearch = async (shopIds: number[]) => {
    if (!mapInstanceRef.current) return;

    categoryMarkersRef.current.forEach((m) => m.setMap(null));
    categoryMarkersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    const fetchedShops: Shop[] = [];

    try {
      for (const id of shopIds) {
        const res = await fetch(`${API_URL}/getShopByID?shop_id=${id}`);
        const shop = await res.json();

        if (!shop || !shop.lat || !shop.lng) continue;

        fetchedShops.push(shop);

        const location = new google.maps.LatLng(Number(shop.lat), Number(shop.lng));

        const marker = new google.maps.Marker({
          position: location,
          map: mapInstanceRef.current!,
          title: shop.name,
          icon: {
            url: "https://cdn-icons-png.flaticon.com/128/4287/4287725.png",
            scaledSize: new google.maps.Size(32, 34),
            //url: theme === "dark" ? "/location-light.png" : "/location-dark.png",
            //scaledSize: new google.maps.Size(32, 70),
          },
        });

        marker.addListener("click", () => {
          handleShopSuggestion(shop, () => {
            setPlaceSidebar("full");
            setKeepHalfSidebarOpen(true);
          });
        });

        categoryMarkersRef.current.push(marker);
        bounds.extend(location);
      }

      setRelatedPlaces(fetchedShops);
      setPlaceSidebar("half");
      setKeepHalfSidebarOpen(true);
      setSearchOrigin("home");

      categoryBoundsRef.current = bounds;

      {/*
        setTimeout(() => {
        const sidebarEl = document.getElementById("halfSidebar");
        const sidebarWidth = sidebarEl?.offsetWidth || 0;
        const sidebarHeight = sidebarEl?.offsetHeight || 0;

        const padding = { top: 50, bottom: 50, left: 50, right: 50 };
        if (window.innerWidth >= 768) {
          padding.left = sidebarWidth + 50;
        } else {
          padding.top = 150;
          padding.bottom = sidebarHeight + 50;
        }

        mapInstanceRef.current!.fitBounds(bounds, padding);
      }, 300);
      */}

      setTimeout(() => {
        const isMobileView = window.innerWidth < 768;
        const padding = { top: 80, bottom: 50, left: 50, right: 50 };

        if (!isMobileView) {
          const sidebarEl = document.getElementById("halfSidebar");
          const sidebarWidth = sidebarEl?.offsetWidth || 410;
          padding.left = sidebarWidth + 50;
        } else {
          const drawerHeight = window.innerHeight * 0.5;
          padding.bottom = drawerHeight + 20;
          padding.top = 120;
        }

        if (mapInstanceRef.current && !bounds.isEmpty()) {
          mapInstanceRef.current.fitBounds(bounds, padding);
        }
      }, 400);
    } catch (err) {
      console.error("Category shop fetch error:", err);
    }
  };

  // Update URL icon of runCategorySearch search when theme changes
  useEffect(() => {
    if (categoryMarkersRef.current) {
      categoryMarkersRef.current.forEach((marker) => {
        marker.setIcon({
          url: 'https://cdn-icons-png.flaticon.com/128/4287/4287725.png',
          scaledSize: new google.maps.Size(32, 34),
          //url: theme === "dark" ? "/location-light.png" : "/location-dark.png",
          //scaledSize: new google.maps.Size(32, 70),
        });
      });
    }
  }, [theme]);


  {/*Fetch Category types from API*/ }
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/getShopCuisine`);
        const data = await res.json();

        const grouped: Record<string, number[]> = {};

        data.forEach((item: { name: string; shop_id: number }) => {

          const cleaned = item.name
            .replace(/[‐-–—]/g, "-")
            .toLowerCase()
            .trim();

          const cuisines = cleaned.split(",").map(c => c.trim());

          cuisines.forEach((cuisine) => {
            if (!grouped[cuisine]) grouped[cuisine] = [];
            grouped[cuisine].push(item.shop_id);
          });
        });

        const finalCategories = Object.keys(grouped).map((cuisine) => ({
          name: cuisine
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(" "),
          shop_ids: grouped[cuisine],
        }));

        setCategories(finalCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  {/*Shop food imaged for Half sidebar*/ }
  useEffect(() => {
    const loadAllExtraImages = async () => {
      const result: Record<string, string[]> = {};

      for (const place of relatedPlaces) {
        const images = await fetchShopImages(String(place.shopId));
        result[place.shopId] = images;
      }

      setExtraShopImages(result);
    };

    if (relatedPlaces.length > 0) {
      loadAllExtraImages();
    }
  }, [relatedPlaces]);

  {/*HalfSidebar Menu button*/ }
  const halfSidebarPlaceSelect = async (shopId: string | number) => {
    const shop = allShops.find(s => String(s.shopId) === String(shopId));
    if (!shop || !mapInstanceRef.current) return;

    addToHistory(shop);

    const position = new google.maps.LatLng(Number(shop.lat), Number(shop.lng));

    const marker = new google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: shop.name,
    });

    if (activePlaceMarkerRef.current) {
      activePlaceMarkerRef.current.setMap(null);
    }
    activePlaceMarkerRef.current = marker;

    const { cuisines, itemsByCuisine } = await fetchShopCuisines(String(shop.shopId));
    const additionalImages = await fetchShopImages(String(shop.shopId));
    const allFSPhotos = [...shop.imageUrls || [], ...(shop.menu || []), ...additionalImages];

    {/*Fetch shop rating*/ }
    let shopRating: number | undefined = undefined;
    try {
      const fetchedRating = await fetchShopRating(shop.shopId);
      if (fetchedRating !== null) shopRating = fetchedRating;
    } catch (err) {
      console.warn(`Failed to fetch rating for shop ${shop.shopId}`, err);
    }

    {/* Fetch shop priceText */ }
    let shopPriceRange: string | undefined = undefined;
    try {
      const fetchedPrice = await fetchShopPriceText(shop.shopId);
      if (fetchedPrice !== null) shopPriceRange = fetchedPrice;
    } catch (err) {
      console.warn(`Failed to fetch priceText for shop ${shop.shopId}`, err);
    }

    const newPlace: RecentPlace = {
      shopId: shop.shopId,
      title: shop.name,
      nativeName: undefined,
      subtitle: shop.address,
      imageUrl: shop.imageUrls[0],
      photos: shop.menu || [],
      allPhotos: allFSPhotos || [],
      highlights: additionalImages || [],
      lat: Number(shop.lat),
      lng: Number(shop.lng),
      timestamp: Date.now(),
      fullAddress: shop.address,
      plusCode: "",
      rating: shopRating ?? 4.5,
      userRatingsTotal: undefined,
      priceText: shopPriceRange ?? "₹200 – 400",
      category: shop.cuisine || "Shop",
      reviews: [],
      applink: shop.applink || "",
      about: shop.about,
      serviceability: shop.serviceability,
      openCloseTiming: shop.openCloseTiming,
      cuisines: cuisines || [],
      itemsByCuisine: itemsByCuisine || {},
    };

    setRecentPlaces(prev => {
      const updated = [newPlace, ...prev.filter(p => p.title !== shop.name)];
      const sliced = updated.slice(0, 20);
      localStorage.setItem("recent_places", JSON.stringify(sliced));
      return sliced;
    });

    setFullSidebarSelectedPlace({
      ...newPlace,
      isFavorite: favoritePlaceList.some((p) => p.title === newPlace.title),
    });

    setPlaceSidebar("full");
    setSearchValue(shop.name);
    setFullSidebarActiveTab("fullSidebarMenu");
    setKeepHalfSidebarOpen(true);
    centerPlaceOnMap(position);
  };

  {/*Recent sidebar Middle part download button*/ }
  const getMatchedShop = (place: RecentPlace) => {
    return (
      allShops.find(
        shop =>
          Number(shop.lat) === place.lat &&
          Number(shop.lng) === place.lng
      ) ||

      allShops.find(
        shop => shop.name.toLowerCase() === place.title.toLowerCase()
      ) ||

      allShops.find(
        shop =>
          shop.address.toLowerCase() ===
          (place.subtitle?.toLowerCase() || "")
      )
    );
  };

  const handleAppDownload = (place: RecentPlace) => {
    const shop = getMatchedShop(place);

    trackEvent("download_button_click", {
      shop_id: shop?.shopId,
      shop_name: shop?.name,
      source: "map_card",
    });

    window.open(
      shop?.applink ??
      "https://play.google.com/store/games?device=windows",
      "_blank"
    );
  };

  const handleShopDownload = (shop: Shop) => {
    trackEvent("download_button_click", {
      shop_id: shop.shopId,
      shop_name: shop.name,
      source: "shop_list",
    });

    window.open(
      shop?.applink ??
      "https://play.google.com/store/games?device=windows",
      "_blank"
    );
  };

  const exploreButtonFunction = () => {
    if (!mapInstanceRef.current) return;
    if (!allShops || allShops.length === 0) return;

    closeCategoryMode();
    setExploreButtonKey(prev => prev + 1);
    setRelatedPlaces(allShops);
    setIsExploreButton(true);
    setPlaceSidebar("half");
    setKeepHalfSidebarOpen(true);
    setSearchOrigin("home");

    allShops.forEach(shop => {
      if (!shop.lat || !shop.lng) return;

      const marker = new google.maps.Marker({
        position: { lat: Number(shop.lat), lng: Number(shop.lng) },
        map: mapInstanceRef.current!,
        title: shop.name,
        icon: {
          url: "",
          scaledSize: new google.maps.Size(30, 30),
        },
      });

      marker.addListener("click", () => handleOpenShopSidebar(shop.shopId));

      categoryMarkersRef.current.push(marker);
    });

    const bounds = new google.maps.LatLngBounds();
    allShops.forEach(shop => bounds.extend({ lat: Number(shop.lat), lng: Number(shop.lng) }));

    {/*
    const sidebarEl = document.getElementById("halfSidebar");
    const sidebarWidth = sidebarEl?.offsetWidth || 0;
    const sidebarHeight = sidebarEl?.offsetHeight || 0;

    const windowWidth = window.innerWidth;
    
    let padding = { top: 50, bottom: 50, left: 50, right: 50 };

    if (windowWidth >= 768) {
      padding = {
        top: 50,
        bottom: 50,
        left: sidebarWidth + 50,
        right: 50,
      };
    } else {
      padding = {
        top: 150,
        bottom: sidebarHeight + 50,
        left: 50,
        right: 50,
      };
    }
    mapInstanceRef.current.fitBounds(bounds, padding);
    */}

    setTimeout(() => {
      const isMobileView = window.innerWidth < 768;
      const padding = { top: 50, bottom: 50, left: 50, right: 50 };

      if (!isMobileView) {
        const sidebarEl = document.getElementById("halfSidebar");
        const sidebarWidth = sidebarEl?.offsetWidth || 410;
        padding.left = sidebarWidth + 50;
      } else {
        //const actualDrawerHeight = 148; 
        //padding.bottom = actualDrawerHeight + 40; 
        const actualDrawerHeight = window.innerHeight * 0.5;
        padding.bottom = actualDrawerHeight + 20;
        padding.top = 180;
        padding.left = 30;
        padding.right = 30;
      }

      if (mapInstanceRef.current && !bounds.isEmpty()) {
        mapInstanceRef.current.fitBounds(bounds, padding);
      }
    }, 400);
  }

  useEffect(() => {
    const handleSidebarDragResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarHeight(window.innerHeight); // desktop - full height
      } else {
        setSidebarHeight(window.innerHeight * 0.5); // mobile - half height
      }
    };
    window.addEventListener("resize", handleSidebarDragResize);
    return () => window.removeEventListener("resize", handleSidebarDragResize);
  }, []);


  // Start drag
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (window.innerWidth >= 768) return; // disable drag on desktop
    setSidebarDragging(true);
    setStartY("touches" in e ? e.touches[0].clientY : e.clientY);
    setSidebarStartHeight(sidebarHeight);
  }, [sidebarHeight]);

  // Move drag
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!sidebarDragging) return;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const delta = startY - clientY;
    let newHeight = sidebarStartHeight + delta;

    // Sidebar drag height from 20% to 100%
    const minHeight = window.innerHeight * 0.2;
    const maxHeight = window.innerHeight;
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    setSidebarHeight(newHeight);
  }, [sidebarDragging, startY, sidebarStartHeight]);

  const handleDragEnd = useCallback(() => {
    setSidebarDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchend", handleDragEnd);
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const handleMenuScroll = () => {
    const el = menuScrollRef.current;
    if (!el) return;

    const isAtStart = el.scrollLeft <= 10;
    const isAtEnd = el.scrollWidth - el.scrollLeft - el.clientWidth <= 10;

    setMenuLeftArrow(!isAtStart);
    setMenuRightArrow(!isAtEnd);
  };

  const handleDSMenuScroll = () => {
    const el = menuDSScrollRef.current;
    if (!el) return;

    const isAtStart = el.scrollLeft <= 10;
    const isAtEnd = el.scrollWidth - el.scrollLeft - el.clientWidth <= 10;

    setDSMenuLeftArrow(!isAtStart);
    setDSMenuRightArrow(!isAtEnd);
  };

  useEffect(() => {
    handleMenuScroll();
  }, []);

  useEffect(() => {
    handleDSMenuScroll();
  }, []);

  useEffect(() => {
    if (!fullSidebarSelectedPlace) return;

    const photos = fullSidebarSelectedPlace.photos || [];
    const highlights = fullSidebarSelectedPlace.highlights || [];
    const cuisines = fullSidebarSelectedPlace.cuisines || [];
    const itemsByCuisine = fullSidebarSelectedPlace.itemsByCuisine || {};

    setOverviewFSImages([...photos, ...highlights]);
    setMenuFSImages(photos);
    setHighlightFSImages(highlights);

    const dynamicCategories = cuisines.map((c) => ({
      name: c,
      photos: photos,
      items: itemsByCuisine[c] || []
    }));

    setMenuFSCategories(dynamicCategories);

  }, [fullSidebarSelectedPlace]);


  useEffect(() => {
    if (!recentSelectedPlace) return;

    const photos = recentSelectedPlace.photos || [];
    const highlights = recentSelectedPlace.highlights || [];
    const cuisines = recentSelectedPlace.cuisines || [];
    const itemsByCuisine = recentSelectedPlace.itemsByCuisine || {};

    setOverviewDSImages([...photos, ...highlights]);
    setMenuDSImages(photos);
    setHighlightDSImages(highlights);

    const dynamicDSCategories = cuisines.map((c) => ({
      name: c,
      photos: photos,
      items: itemsByCuisine[c] || []
    }));

    setMenuDSCategories(dynamicDSCategories);

  }, [recentSelectedPlace]);

  const availableTabs = useMemo(() => {
    const tabs: { key: string; label: string }[] = [];

    if (overviewFSImages.length > 0) {
      tabs.push({ key: "overview", label: "Overview" });
    }

    menuFSCategories.forEach((cat) => {
      tabs.push({ key: cat.name, label: cat.name });
    });

    return tabs;
  }, [overviewFSImages, menuFSCategories]);

  const availableDSTabs = useMemo(() => {
    const tabs: { key: string; label: string }[] = [];

    if (overviewDSImages.length > 0) {
      tabs.push({ key: "overview", label: "Overview" });
    }

    menuDSCategories.forEach((cat) => {
      tabs.push({ key: cat.name, label: cat.name });
    });

    return tabs;
  }, [overviewDSImages, menuDSCategories]);

  useEffect(() => {
    if (availableTabs.length > 0) {
      setmenuActiveFSTab((prev) => prev || availableTabs[0].key);
    }
  }, [availableTabs]);

  useEffect(() => {
    if (availableDSTabs.length > 0) {
      setmenuActiveDSTab((prev) => prev || availableDSTabs[0].key);
    }
  }, [availableDSTabs]);

  useEffect(() => {
    if (fullSidebarActiveTab !== "fullSidebarMenu") {
      setmenuActiveFSTab(availableTabs[0]?.key || "");
    }
  }, [fullSidebarActiveTab, availableTabs]);

  useEffect(() => {
    if (detailsActiveTab !== "menu") {
      setmenuActiveDSTab(availableDSTabs[0]?.key || "");
    }
  }, [detailsActiveTab, availableDSTabs]);

  const closeButtonFunction = () => {
    setSearchValue("");
    setSuggestions([]);
    setIsLocationSelected(false);
    setShowSuggestions(false);
    if (placeSidebar === "full" && keepHalfSidebarOpen) {
      setPlaceSidebar("half");
      setKeepHalfSidebarOpen(true);
      restoreCategoryView();
    } else {
      setPlaceSidebar(null);
      setKeepHalfSidebarOpen(false);
      closeCategoryMode();
      resetMapForMobile();
    }
    if (placeSidebar === "half")
    //if (placeSidebar === "half" || (placeSidebar === "full" && window.innerWidth < 768))
    {
      clearCategoryMarkers();
    }
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (sidebarMarkerRef.current) {
      sidebarMarkerRef.current.setMap(null);
      sidebarMarkerRef.current = null;
    }
    if (window.innerWidth < 768) {
      setSidebarHeight(window.innerHeight * 0.5);
    }

    activePlaceMarkerRemover();
    setNoMatches(false);
  };

  useEffect(() => {
    if (halfSidebarRef.current) {
      halfSidebarRef.current.scrollTop = 0;
    }
  }, [relatedPlaces, placeSidebar]);

  const clearCategoryMarkers = () => {
    if (categoryMarkersRef.current && categoryMarkersRef.current.length > 0) {
      categoryMarkersRef.current.forEach((marker) => marker.setMap(null));
      categoryMarkersRef.current = [];
    }
  };

  const convertRecentPlaceToShop = (place: RecentPlace): Shop => ({
    shopId: place.shopId!,
    name: place.title,
    address: place.fullAddress || "",
    lat: String(place.lat),
    lng: String(place.lng),
    imageUrls: place.highlights || place.photos || (place.imageUrl ? [place.imageUrl] : []),
    menu: place.photos || [],
    cuisine: place.category || "Shop",
    applink: place.applink || "",
    about: place.about || "",
    serviceability: place.serviceability || "",
    openCloseTiming: place.openCloseTiming || "",
    createdAt: new Date().toISOString(),
    priceText: place.priceText,
    rating: place.rating,
    userRatingsTotal: place.userRatingsTotal,
    cuisines: place.cuisines,
    itemsByCuisine: place.itemsByCuisine
  });

  const handleRecentPlaceClickResponsive = (place: RecentPlace) => {
    const width = window.innerWidth;

    if (width >= 1024) {
      handleDetailsRecentPlaceClick(place);
    } else {
      const shop = convertRecentPlaceToShop(place);

      handleShopSuggestion(shop, () => {
        setPlaceSidebar("full");
      });
    }
  };

  useEffect(() => {
    if (fullSidebarContentRef.current) {
      fullSidebarContentRef.current.scrollTo(0, 0);
    }
  }, [fullSidebarActiveTab]);

  useEffect(() => {
    if (stickyScrollRef.current) {
      stickyScrollRef.current.scrollTo(0, 0);
    }
  }, [detailsActiveTab]);

  useEffect(() => {
    if (placeSidebar === "full" || placeSidebar === "half") {
      setTopSidebar(null);
    }
  }, [placeSidebar]);

  useEffect(() => {
    if (topSidebar === "saved" || topSidebar === "recent" || showSidebar) {
      setSearchValue("");
      setSuggestions([]);
      setIsLocationSelected(false);
      setShowSuggestions(false);

      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    }
  }, [topSidebar, showSidebar]);

  useEffect(() => {
    if (topSidebar === "saved" || topSidebar === "recent") {
      setSidebarSearchValue("");
      setSidebarSuggestions([]);
      setIsLocationSelected(false);
      setShowSidebarSuggestions(false);
      setRecentSelectedPlace(null);

      if (sidebarMarkerRef.current) {
        sidebarMarkerRef.current.setMap(null);
        sidebarMarkerRef.current = null;
      }
    }
  }, [topSidebar]);

  useEffect(() => {
    const stored = localStorage.getItem("favorite_places");
    if (stored) {
      try {
        const parsed: RecentPlace[] = JSON.parse(stored);
        setFavoritePlaceList(parsed);
      } catch (e) {
        console.error("Failed to parse favorite_places", e);
      }
    }
  }, []);

  {/*
  const handleLocationShare = () => {
    if (!recentSelectedPlace) return;

    const link = `https://www.google.com/maps?q=${recentSelectedPlace.lat},${recentSelectedPlace.lng}`;

    navigator.clipboard.writeText(link).then(() => {
      setLocationCopied(true);
      setTimeout(() => setLocationCopied(false), 2000); 
    });
  };
  
  const handleFSLocationShare = () => {
    if (!fullSidebarSelectedPlace) return;

    const link = `https://www.google.com/maps?q=${fullSidebarSelectedPlace.lat},${fullSidebarSelectedPlace.lng}`;

    navigator.clipboard.writeText(link).then(() => {
      setFSLocationCopied(true);
      setTimeout(() => setFSLocationCopied(false), 2000); 
    });
  };
  */}

  const handleFSLocationShare = () => {
    if (!fullSidebarSelectedPlace) return;

    let linkToCopy = "";
    if (fullSidebarSelectedPlace.applink) {
      linkToCopy = fullSidebarSelectedPlace.applink;
    }
    else {
      linkToCopy = `https://www.google.com/maps?q=${fullSidebarSelectedPlace.lat},${fullSidebarSelectedPlace.lng}`;
    }
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setFSLocationCopied(true);
      setTimeout(() => setFSLocationCopied(false), 2000);
    });
  };

  const handleLocationShare = () => {
    if (!recentSelectedPlace) return;

    let linkToCopy = "";
    if (recentSelectedPlace.applink) {
      linkToCopy = recentSelectedPlace.applink;
    }
    else {
      linkToCopy = `https://www.google.com/maps?q=${recentSelectedPlace.lat},${recentSelectedPlace.lng}`;
    }
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setLocationCopied(true);
      setTimeout(() => setLocationCopied(false), 2000);
    });
  };

  const handleHSLocationShare = (place: typeof relatedPlaces[0]) => {
    if (!place) return;

    const linkToCopy = place.applink
      ? place.applink
      : `https://www.google.com/maps?q=${place.lat},${place.lng}`;

    navigator.clipboard.writeText(linkToCopy).then(() => {
      setHSLocationCopied(true);
      setTimeout(() => setHSLocationCopied(false), 2000);
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem("favorite_places");
    if (stored) {
      try {
        const parsed: RecentPlace[] = JSON.parse(stored);
        setFavoritePlaceList(parsed);
      } catch (e) {
        console.error("Failed to parse favorite_places", e);
      }
    }
  }, []);

  useEffect(() => {
    setShowRecentDetailsSidebar(false);
    setRecentSelectedPlace(null);
    setFavoriteList(null);
  }, [topSidebar]);

  const handleAddressCopy = () => {
    navigator.clipboard.writeText(
      recentSelectedPlace?.fullAddress || "Address not available"
    );
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 1000);
  };

  const handleFSAddressCopy = () => {
    navigator.clipboard.writeText(
      fullSidebarSelectedPlace?.fullAddress || "Address not available"
    );
    setFSAddressCopied(true);
    setTimeout(() => setFSAddressCopied(false), 1000);
  };

  const fullSidebarTabs = [
    { id: "fullSidebarOverview", label: "Overview" },
    { id: "fullSidebarMenu", label: "Menu" },
    { id: "fullSidebarReviews", label: "Reviews" },
    //{ id: "fullSidebarAbout", label: "About" },
  ];

  const handleDetailsRecentPlaceClick = (place: RecentPlace) => {
    setRecentSelectedPlace(place);
    setShowRecentDetailsSidebar(true);

    if (mapInstanceRef.current && place.lat && place.lng) {
      const position = new google.maps.LatLng(place.lat, place.lng);

      mapInstanceRef.current.setZoom(15);

      mapInstanceRef.current.panTo(position);

      const leftSidebarWidth = 410;
      const mapDiv = mapInstanceRef.current.getDiv();
      const mapWidth = mapDiv.offsetWidth;
      const remainingWidth = mapWidth - leftSidebarWidth;

      mapInstanceRef.current.panBy(-remainingWidth / 2, 0);

      if (recentSelectedMarkerRef.current) {
        recentSelectedMarkerRef.current.setMap(null);
      }
      recentSelectedMarkerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: place.title,
      });
    }
  };

  useEffect(() => {
    if ((!showRecentDetailsSidebar || topSidebar !== 'recent') && recentSelectedMarkerRef.current) {
      recentSelectedMarkerRef.current.setMap(null);
      recentSelectedMarkerRef.current = null;
    }
  }, [showRecentDetailsSidebar, topSidebar]);

  const detailsTabs = [
    { id: "overview", label: "Overview" },
    { id: "menu", label: "Menu" },
    { id: "reviews", label: "Reviews" },
    //{ id: "about", label: "About" },
  ];

  useEffect(() => {
    if (recentSelectedPlace) {
      setDetailsActiveTab("overview");

      if (stickyScrollRef.current) {
        stickyScrollRef.current.scrollTop = 0;
      }
    }
  }, [recentSelectedPlace]);

  useEffect(() => {
    const container = stickyScrollRef.current;

    const handleScroll = () => {
      if (container && detailsActiveTab === "overview") {
        //setShowStickyHeader(container.scrollTop > 30);
        setShowStickyHeader(container.scrollTop > 400);
      }
    };

    if (container && detailsActiveTab === "overview") {
      container.addEventListener("scroll", handleScroll);
    }

    if (detailsActiveTab !== "overview") {
      setShowStickyHeader(false);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [detailsActiveTab]);


  function StarRating({ rating }: { rating: number }) {
    return (
      <span className="flex items-center gap-[2px]">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          if (rating >= starValue) {
            return <FaStar key={index} color="#fbbc04" />;
          } else if (rating >= starValue - 0.5) {
            return <FaStarHalfAlt key={index} color="#fbbc04" />;
          } else {
            return <FaRegStar key={index} color="#dadce0" />;
          }
        })}
      </span>
    );
  }

  function getLanguageCodeFromAddress(
    components: google.maps.GeocoderAddressComponent[]
  ): string {
    const stateComp = components.find((c) =>
      c.types.includes("administrative_area_level_1")
    );
    const state = stateComp?.long_name || "";

    if (state.includes("Kerala")) return "ml";
    if (state.includes("Tamil Nadu")) return "ta";
    if (state.includes("Karnataka")) return "kn";
    if (state.includes("Telangana") || state.includes("Andhra Pradesh"))
      return "te";
    if (state.includes("Maharashtra")) return "mr";
    if (state.includes("West Bengal")) return "bn";

    return "hi";
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isStart: boolean) => {
    const suggestions = isStart ? startSuggestions : destSuggestions;
    const highlightedIndex = isStart ? startHighlightedIndex : destHighlightedIndex;
    const setHighlightedIndex = isStart ? setStartHighlightedIndex : setDestHighlightedIndex;

    const selectSuggestion = (index: number) => {
      handleDirectionSidebarSelectSuggestion(
        suggestions[index].place_id,
        isStart
      );
      setHighlightedIndex(-1);
    };

    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        if (prev < suggestions.length - 1) return prev + 1;
        return -1;
      });
    }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        if (prev > -1) return prev - 1;
        return suggestions.length - 1;
      });
    }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        selectSuggestion(highlightedIndex);
      } else {
        selectSuggestion(0);
      }
      setTimeout(() => {
        if (isStart) {
          destinationInputRef.current?.focus();
        } else {
          calculateRoute();
        }
      }, 0);
    }
  };

  useEffect(() => {
    if (showSidebar) {
      setTimeout(() => {
        startingPlaceInputRef.current?.focus();
      }, 0);
    }
  }, [showSidebar]);

  const formatPredictionStateOnly = (secondaryText: string) => {
    const parts = secondaryText.split(",").map(p => p.trim());
    return parts.length > 1 ? parts[0] : parts[1];
  };

  const fetchStartLocationSuggestions = (input: string) => {
    if (!input.trim()) {
      setStartSuggestions([]);
      return;
    }
    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "in" },
      },
      (predictions, status) => {
        console.log("Raw predictions:", predictions?.length, predictions?.map(p => p.description));

        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const processed = predictions.slice(0, 5).map(pred => ({
            ...pred,
            structured_formatting: {
              ...pred.structured_formatting,
              secondary_text: formatPredictionStateOnly(pred.structured_formatting.secondary_text),
            }
          }));
          setStartSuggestions(processed);
          setShowStartSuggestions(true);
        } else {
          setStartSuggestions([]);
        }
      }
    );
  };

  const fetchDestinationSuggestions = (input: string) => {
    if (!input.trim()) {
      setDestSuggestions([]);
      return;
    }
    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "in" },
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const processed = predictions.slice(0, 5).map(pred => ({
            ...pred,
            structured_formatting: {
              ...pred.structured_formatting,
              secondary_text: formatPredictionStateOnly(pred.structured_formatting.secondary_text),
            }
          }));
          setDestSuggestions(processed);
          setShowDestSuggestions(true);
        } else {
          setDestSuggestions([]);
        }
      }
    );
  };

  const handleDirectionSidebarSelectSuggestion = (placeId: string, isStart: boolean) => {
    const service = new google.maps.places.PlacesService(mapInstanceRef.current!);

    service.getDetails({ placeId }, (place, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        place &&
        place.geometry &&
        place.geometry.location
      ) {
        const { lat, lng } = place.geometry.location;
        const latLng = { lat: lat(), lng: lng() };

        mapInstanceRef.current?.panTo(latLng);
        mapInstanceRef.current?.setZoom(15);

        if (isStart) {
          setStartLocation(place.name || "");
          setStartCoords(latLng);
          setShowStartSuggestions(false);
        } else {
          setDestinationLocation(place.name || "");
          setDestinationCoords(latLng);
          setShowDestSuggestions(false);
        }

        const title = place.name || "";
        const components = place.address_components || [];
        const stateComp = components.find(c => c.types.includes("administrative_area_level_1"));
        const state = stateComp?.long_name || "";

        let subtitle = "";
        if (title !== state) {
          subtitle = state;
        }

        const photo = place.photos?.[0];
        const imageUrl = photo?.getUrl({ maxWidth: 400 });
        const timestamp = Date.now();

        setRecentPlaces((prev) => {
          const newPlace = { title, subtitle, imageUrl, lat: latLng.lat, lng: latLng.lng, timestamp };
          const updated = [newPlace, ...prev.filter((p) => p.title !== title)];
          const sliced = updated.slice(0, 20);
          localStorage.setItem("recent_places", JSON.stringify(sliced));
          return sliced;
        });

      } else {
        if (isStart) {
          setStartCoords(null);
        } else {
          setDestinationCoords(null);
        }
      }
    });
  };

  const destinationIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 24 24" fill="#f44336">
      <g transform="scale(0.9) translate(3.6 3.6)">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </g>
    </svg>
  `;

  const startIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" fill="white" stroke="black" stroke-width="2" />
    </svg>
  `;

  const svgToDataURL = (svg: string) =>
    "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);

  const handleRecentPlaceClick = (place: RecentPlace) => {
    if (nextInputToFill === "start") {
      setStartLocation(place.title);
      setStartCoords({ lat: place.lat, lng: place.lng });
      setNextInputToFill("destination");
    } else {
      setDestinationLocation(place.title);
      setDestinationCoords({ lat: place.lat, lng: place.lng });
      setNextInputToFill("start");
    }
  };

  const placeStartMarker = useCallback((position: google.maps.LatLngLiteral) => {
    if (startMarkerRef.current) startMarkerRef.current.setMap(null);
    startMarkerRef.current = new google.maps.Marker({
      position,
      map: mapInstanceRef.current!,
      icon: {
        url: svgToDataURL(startIconSvg),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16),
      },
    });
  }, [startIconSvg]);

  const placeDestinationMarker = useCallback((position: google.maps.LatLngLiteral) => {
    console.log("Placing destination marker at:", position);
    if (destinationMarkerRef.current) destinationMarkerRef.current.setMap(null);
    destinationMarkerRef.current = new google.maps.Marker({
      position,
      map: mapInstanceRef.current!,
      icon: {
        url: svgToDataURL(destinationIconSvg),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16),
      },
    });
  }, [destinationIconSvg]);

  useEffect(() => {
    if (startCoords) {
      placeStartMarker(startCoords);
    } else if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
    }
  }, [startCoords, placeStartMarker]);

  useEffect(() => {
    console.log("Destination coords:", destinationCoords);
    if (destinationCoords) {
      placeDestinationMarker(destinationCoords);
    } else if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
    }
  }, [destinationCoords, placeDestinationMarker]);

  const drawRoutes = useCallback((routes: google.maps.DirectionsRoute[], activeIndex: number) => {
    altPolylinesRef.current.forEach(poly => poly.setMap(null));
    altPolylinesRef.current = [];

    routes.forEach((route, index) => {
      const isActive = index === activeIndex;

      const outlinePolyline = new google.maps.Polyline({
        path: route.overview_path,
        strokeColor: isActive ? "#0a11d8" : "#8096E0",
        strokeOpacity: 1,
        strokeWeight: isActive ? 8 : 6,
        map: mapInstanceRef.current,
        zIndex: 1
      });

      const polyline = new google.maps.Polyline({
        path: route.overview_path,
        strokeColor: isActive ? "#0f53ff" : "#B8C9FF",
        strokeOpacity: 1,
        strokeWeight: isActive ? 6 : 4,
        icons: [],
        map: mapInstanceRef.current,
        zIndex: isActive ? 2 : 1
      });

      const handleClick = () => {
        setActiveRouteIndex(index);
        drawRoutes(routes, index);
      };
      outlinePolyline.addListener("click", handleClick);
      polyline.addListener("click", handleClick);

      altPolylinesRef.current.push(outlinePolyline, polyline);

      if (isActive && mapInstanceRef.current) {
        const bounds = new google.maps.LatLngBounds();
        route.legs.forEach(leg => {
          leg.steps.forEach(step => {
            step.path.forEach(latlng => bounds.extend(latlng));
          });
        });

        const sidebarWidth = directionSidebarRef.current?.offsetWidth || 0;
        mapInstanceRef.current.fitBounds(bounds, {
          left: sidebarWidth,
          top: 50,
          right: 50,
          bottom: 50
        });
      }
    });
  }, []);

  const calculateRoute = useCallback(() => {
    if (!startLocation || !destinationLocation || !mapInstanceRef.current) return;

    const directionsService = new google.maps.DirectionsService();

    if (activeRendererRef.current) {
      activeRendererRef.current.setMap(null);
      activeRendererRef.current = null;
    }
    altPolylinesRef.current.forEach(poly => poly.setMap(null));
    altPolylinesRef.current = [];

    if (!startCoords || !destinationCoords) {
      console.warn("Start or destination coordinates missing.");
      return;
    }

    directionsService.route(
      {
        origin: startCoords,
        destination: destinationCoords,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setRoutes(result.routes);
          setActiveRouteIndex(0);
          drawRoutes(result.routes, 0);
        }
      }
    );
  }, [startLocation, destinationLocation, startCoords, destinationCoords, drawRoutes]);

  const closeSidebar = () => {
    setShowSidebar(false);
    setTravelInfo(null);

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections(null);
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    if (altPolylinesRef.current) {
      altPolylinesRef.current.forEach(poly => poly.setMap(null));
      altPolylinesRef.current = [];
    }

    setStartLocation("");
    setDestinationLocation("");
    setStartCoords(null);
    setDestinationCoords(null);
  };

  useEffect(() => {
    if (startLocation && destinationLocation) {
      calculateRoute();
    }
  }, [startLocation, destinationLocation, calculateRoute]);

  useEffect(() => {
    const stored = localStorage.getItem("recent_places");
    if (stored) {
      try {
        const parsed: RecentPlace[] = JSON.parse(stored);
        setRecentPlaces(parsed);
      } catch (e) {
        console.error("Failed to parse recent_places", e);
      }
    }
  }, []);

  const handleYourLocationClick = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = new google.maps.LatLng(latitude, longitude);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo(location);
          mapInstanceRef.current.setZoom(15);
        }

        if (nextInputToFill === "start") {
          setStartCoords({ lat: latitude, lng: longitude });
        } else {
          setDestinationCoords({ lat: latitude, lng: longitude });
        }

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
          let address = "Your Location";
          if (status === "OK" && results && results[0]) {
            address = results[0].formatted_address;
          }
          if (nextInputToFill === "start") {
            setStartLocation(address);
            setNextInputToFill("destination");
          } else {
            setDestinationLocation(address);
            setNextInputToFill("start");
          }
        });
      },
      (error) => {
        console.warn("Geolocation error:", error);
        alert("Failed to get your location. Please check permissions.");
      }
    );
  };

  useEffect(() => {
    if (showSuggestions) {
      setHighlightedIndex(-1);
    }
  }, [showSuggestions, searchValue]);

  useEffect(() => {
    if (!showSidebarSuggestions || !sidebarSearchValue.trim()) {
      setSidebarHighlightedIndex(-1);
    }
  }, [showSidebarSuggestions, sidebarSearchValue]);

  const scrollCategory = (direction: "left" | "right") => {
    if (!arrowScrollRef.current) return;
    const scrollAmount = 200;
    arrowScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCategoryScroll = () => {
    const container = arrowScrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      handleCategoryScroll();
    });
  }, [categories]);

  function getDistanceKm(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function isPlaceTooBroad(place: Place) {
    const title = place.title.toLowerCase();
    const subtitle = place.subtitle?.toLowerCase() || "";

    const isSame = title === subtitle;
    const isMajorCity = [
      "mumbai", "chennai", "delhi", "bangalore", "hyderabad", "ahmedabad", "kolkata"
    ].includes(title);
    const containsBroadWord = ["state", "district", "india", "region", "zone", "country", "union territory"].some(
      word => title.includes(word) || subtitle.includes(word)
    );
    const isGeneric = !subtitle && title.split(" ").length === 1;

    return isSame || isMajorCity || containsBroadWord || isGeneric;
  }

  function groupNearbyPlaces(places: Place[], radius = 40) {
    const filtered = places.filter(p => !isPlaceTooBroad(p));
    const groups: Place[][] = [];
    const visited = new Set<number>();

    for (let i = 0; i < filtered.length; i++) {
      if (visited.has(i)) continue;
      const group: Place[] = [filtered[i]];
      visited.add(i);

      for (let j = i + 1; j < filtered.length; j++) {
        if (
          !visited.has(j) &&
          getDistanceKm(filtered[i], filtered[j]) < radius
        ) {
          group.push(filtered[j]);
          visited.add(j);
        }
      }

      if (group.length > 1) {
        groups.push(group);
      }
    }

    return groups;
  }

  function generateTagName(group: Place[]) {
    const uniqueTitles = [...new Set(group.map(p => p.title))];
    if (uniqueTitles.length === 1) return uniqueTitles[0];
    if (uniqueTitles.length === 2) return `${uniqueTitles[0]} & ${uniqueTitles[1]}`;
    return `${uniqueTitles[0]} & Nearby`;
  }

  const groupedPlaces = groupNearbyPlaces(recentPlaces);
  const groupTags = groupedPlaces.map(group => ({
    name: generateTagName(group),
    count: group.length,
    places: group.map(p => ({
      ...p,
      timestamp: (p as RecentPlace).timestamp ?? Date.now(),
      nativeName: (p as RecentPlace).nativeName ?? undefined,
      subtitle: (p as RecentPlace).subtitle ?? "",
      imageUrl: (p as RecentPlace).imageUrl ?? "",
      photos: (p as RecentPlace).photos ?? [],
      fullAddress: (p as RecentPlace).fullAddress ?? "",
      plusCode: (p as RecentPlace).plusCode ?? "",
      rating: (p as RecentPlace).rating ?? undefined,
      userRatingsTotal: (p as RecentPlace).userRatingsTotal ?? undefined,
      priceText: (p as RecentPlace).priceText ?? undefined,
      category: (p as RecentPlace).category ?? "Shop",
      reviews: (p as RecentPlace).reviews ?? [],
    })) as RecentPlace[],
  }));

  const hasGroups = groupTags.length > 0;

  const filteredPlaces: RecentPlace[] =
    !hasGroups
      ? recentPlaces
      : selectedTags.length === 0
        ? recentPlaces
        : recentPlaces
          .filter((place: RecentPlace) =>
            groupTags.some(
              (tag: GroupTag) =>
                selectedTags.includes(tag.name) &&
                tag.places.some(
                  (p: RecentPlace) =>
                    p.title === place.title && p.subtitle === place.subtitle
                )
            )
          )
          .sort((a: RecentPlace, b: RecentPlace) => b.timestamp - a.timestamp);

  useEffect(() => {
    const stored = localStorage.getItem("recent_places");
    if (stored) {
      try {
        const parsed: RecentPlace[] = JSON.parse(stored);
        setRecentPlaces(parsed);
      } catch (e) {
        console.error("Failed to parse recent_places", e);
      }
    }
  }, []);

  const handleSelectSuggestion = (placeId: string, onComplete?: () => void) => {
    setSearchOrigin("home");

    const service = new google.maps.places.PlacesService(mapInstanceRef.current!);

    service.getDetails({ placeId, language: "en" }, (placeEn, statusEn) => {
      if (
        statusEn === google.maps.places.PlacesServiceStatus.OK &&
        placeEn &&
        placeEn.geometry
      ) {
        const location = placeEn.geometry.location;

        if (location) {
          //mapInstanceRef.current?.panTo(location);
          //mapInstanceRef.current?.setZoom(15);

          if (markerRef.current) {
            markerRef.current.setMap(null);
          }

          markerRef.current = new google.maps.Marker({
            position: location,
            map: mapInstanceRef.current!,
            title: placeEn.name,
          });
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(location);

          const sidebarEl = document.getElementById("fullSidebar");
          const sidebarWidth = sidebarEl?.offsetWidth || 0;
          const sidebarHeight = sidebarEl?.offsetHeight || 0;

          const windowWidth = window.innerWidth;

          let padding = { top: 50, bottom: 50, left: 50, right: 50 };

          if (windowWidth >= 768) {
            padding = {
              top: 50,
              bottom: 50,
              left: sidebarWidth + 50,
              right: 50,
            };
          } else {
            padding = {
              top: 150,
              bottom: sidebarHeight + 50,
              left: 50,
              right: 50,
            };
          }
          mapInstanceRef.current?.fitBounds(bounds, padding);
        }

        const title = placeEn.name || "";
        const components = placeEn.address_components || [];

        let subtitle = "";
        const cityComp = components.find((c) =>
          c.types.includes("locality") || c.types.includes("administrative_area_level_2")
        );
        const stateComp2 = components.find((c) =>
          c.types.includes("administrative_area_level_1")
        );

        const city = cityComp?.long_name || "";
        const state2 = stateComp2?.long_name || "";

        if (city && state2 && title !== city) {
          subtitle = `${city}, ${state2}`;
        } else if (state2 && title !== state2) {
          subtitle = state2;
        }

        const rating = typeof placeEn.rating === "number" ? placeEn.rating : undefined;
        const userRatingsTotal = typeof placeEn.user_ratings_total === "number" ? placeEn.user_ratings_total : undefined;
        const priceLevel = typeof placeEn.price_level === "number" ? placeEn.price_level : undefined;
        let priceText: string | undefined;

        if (placeEn.types?.includes("restaurant")) {
          priceText = "₹200 – 400";
        } else if (priceLevel !== undefined) {
          priceText = "₹".repeat(priceLevel)
        }


        let category = getReadableCategory(placeEn);
        if (category.toLowerCase() === "establishment") {
          category = "Software Company";
        }

        const photo = placeEn.photos?.[0];
        const imageUrl = photo?.getUrl({ maxWidth: 400 });
        const lat = location?.lat();
        const lng = location?.lng();
        const timestamp = Date.now();
        const photos = placeEn.photos?.map(p => p.getUrl({ maxWidth: 400 })) || [];
        const fullAddress = placeEn.formatted_address || "";
        const plusCode = placeEn.plus_code?.compound_code || placeEn.plus_code?.global_code || "";

        let ratingBreakdown: { [stars: number]: number } | undefined;
        if (placeEn.reviews && placeEn.reviews.length > 0) {
          ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          placeEn.reviews.forEach((r) => {
            const star = typeof r.rating === "number" && r.rating >= 1 && r.rating <= 5 ? r.rating : undefined;
            if (star !== undefined) {
              ratingBreakdown![star] = (ratingBreakdown![star] || 0) + 1;
            }
          });
        }

        const langCode = getLanguageCodeFromAddress(components);

        service.getDetails({ placeId, language: langCode }, (placeLocal, statusLocal) => {
          let nativeName: string | undefined = undefined;
          if (
            statusLocal === google.maps.places.PlacesServiceStatus.OK &&
            placeLocal?.name &&
            placeLocal.name !== title
          ) {
            nativeName = placeLocal.name;
          }

          setSearchValue(title);

          const newPlace: RecentPlace = {
            title,
            nativeName,
            subtitle,
            imageUrl,
            photos,
            lat: lat!,
            lng: lng!,
            timestamp,
            fullAddress,
            plusCode,
            rating,
            userRatingsTotal,
            priceText,
            category,
            reviews: placeEn.reviews || [],
          };

          setRecentPlaces((prev) => {
            const updated = [newPlace, ...prev.filter((p) => p.title !== title)];
            const sliced = updated.slice(0, 20);
            localStorage.setItem("recent_places", JSON.stringify(sliced));
            return sliced;
          });

          setIsLocationSelected(true);
          setShowSuggestions(false);
          setSuggestions([]);
          setPlaceSidebar("full");
          setFullSidebarActiveTab("fullSidebarOverview");
          setTimeout(() => {
            if (fullSidebarContentRef.current) {
              fullSidebarContentRef.current.scrollTop = 0;
            }
          }, 0);

          const autocompleteService = new google.maps.places.AutocompleteService();
          autocompleteService.getPlacePredictions(
            {
              input: title,
              componentRestrictions: { country: "in" },
            },
            (predictions, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                //setSuggestions(predictions.slice(0, 5));
                setShowSuggestions(false);
              } else {
                setSuggestions([]);
              }
            }
          );
          if (onComplete) onComplete();
        })
      }
    });
  };

  const handleSidebarSelectSuggestion = (placeId: string, onComplete?: () => void) => {
    setSearchOrigin("sidebar");

    const service = new google.maps.places.PlacesService(mapInstanceRef.current!);

    service.getDetails({ placeId, language: "en" }, (placeEn, statusEn) => {
      if (
        statusEn === google.maps.places.PlacesServiceStatus.OK &&
        placeEn &&
        placeEn.geometry
      ) {
        const location = placeEn.geometry.location;

        if (location) {
          //mapInstanceRef.current?.panTo(location);
          //mapInstanceRef.current?.setZoom(15);

          if (sidebarMarkerRef.current) {
            sidebarMarkerRef.current.setMap(null);
          }

          sidebarMarkerRef.current = new google.maps.Marker({
            position: location,
            map: mapInstanceRef.current!,
            title: placeEn.name,
          });

          const bounds = new google.maps.LatLngBounds();
          bounds.extend(location);

          const sidebarEl = document.getElementById("fullSidebar");
          const sidebarWidth = sidebarEl?.offsetWidth || 0;
          const sidebarHeight = sidebarEl?.offsetHeight || 0;

          const windowWidth = window.innerWidth;

          let padding = { top: 50, bottom: 50, left: 50, right: 50 };

          if (windowWidth >= 768) {
            padding = {
              top: 50,
              bottom: 50,
              left: sidebarWidth + 50,
              right: 50,
            };
          } else {
            padding = {
              top: 150,
              bottom: sidebarHeight + 50,
              left: 50,
              right: 50,
            };
          }
          mapInstanceRef.current?.fitBounds(bounds, padding);
        }

        const title = placeEn.name || "";
        const components = placeEn.address_components || [];

        let subtitle = "";
        const cityComp = components.find((c) =>
          c.types.includes("locality") || c.types.includes("administrative_area_level_2")
        );
        const stateComp2 = components.find((c) =>
          c.types.includes("administrative_area_level_1")
        );

        const city = cityComp?.long_name || "";
        const state2 = stateComp2?.long_name || "";

        if (city && state2 && title !== city) {
          subtitle = `${city}, ${state2}`;
        } else if (state2 && title !== state2) {
          subtitle = state2;
        }

        const rating = typeof placeEn.rating === "number" ? placeEn.rating : undefined;
        const userRatingsTotal = typeof placeEn.user_ratings_total === "number" ? placeEn.user_ratings_total : undefined;
        const priceLevel = typeof placeEn.price_level === "number" ? placeEn.price_level : undefined;
        let priceText: string | undefined;

        if (placeEn.types?.includes("restaurant")) {
          priceText = "₹200 – 400";
        } else if (priceLevel !== undefined) {
          priceText = "₹".repeat(priceLevel)
        }


        let category = getReadableCategory(placeEn);
        if (category.toLowerCase() === "establishment") {
          category = "Software Company";
        }

        const photo = placeEn.photos?.[0];
        const imageUrl = photo?.getUrl({ maxWidth: 400 });
        const lat = location?.lat();
        const lng = location?.lng();
        const timestamp = Date.now();
        const photos = placeEn.photos?.map(p => p.getUrl({ maxWidth: 400 })) || [];
        const fullAddress = placeEn.formatted_address || "";
        const plusCode = placeEn.plus_code?.compound_code || placeEn.plus_code?.global_code || "";

        let ratingBreakdown: { [stars: number]: number } | undefined;
        if (placeEn.reviews && placeEn.reviews.length > 0) {
          ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          placeEn.reviews.forEach((r) => {
            const star = typeof r.rating === "number" && r.rating >= 1 && r.rating <= 5 ? r.rating : undefined;
            if (star !== undefined) {
              ratingBreakdown![star] = (ratingBreakdown![star] || 0) + 1;
            }
          });
        }

        const langCode = getLanguageCodeFromAddress(components);

        service.getDetails({ placeId, language: langCode }, (placeLocal, statusLocal) => {
          let nativeName: string | undefined = undefined;
          if (
            statusLocal === google.maps.places.PlacesServiceStatus.OK &&
            placeLocal?.name &&
            placeLocal.name !== title
          ) {
            nativeName = placeLocal.name;
          }

          setSidebarSearchValue(title);

          const newPlace = {
            title,
            nativeName,
            subtitle,
            imageUrl,
            photos,
            lat: lat!,
            lng: lng!,
            timestamp,
            fullAddress,
            plusCode,
            rating,
            userRatingsTotal,
            priceText,
            category,
            reviews: placeEn.reviews || [],
          };

          setRecentPlaces((prev) => {
            const updated = [newPlace, ...prev.filter((p) => p.title !== title)];
            const sliced = updated.slice(0, 20);
            localStorage.setItem("recent_places", JSON.stringify(sliced));
            return sliced;
          });

          setIsLocationSelected(true);
          setShowSidebarSuggestions(false);
          setSidebarSuggestions([]);
          setPlaceSidebar("full");
          setFullSidebarActiveTab("fullSidebarOverview");
          setTimeout(() => {
            if (fullSidebarContentRef.current) {
              fullSidebarContentRef.current.scrollTop = 0;
            }
          }, 0);

          const autocompleteService = new google.maps.places.AutocompleteService();
          autocompleteService.getPlacePredictions(
            {
              input: title,
              componentRestrictions: { country: "in" },
            },
            (predictions, status) => {
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                //setSidebarSuggestions(predictions.slice(0, 5));
                setShowSidebarSuggestions(false);
              } else {
                setSidebarSuggestions([]);
              }
            }
          )
          if (onComplete) onComplete();
        });
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !(
          (searchBoxRef.current &&
            searchBoxRef.current.contains(event.target as Node)) ||
          (suggestionBoxRef.current &&
            suggestionBoxRef.current.contains(event.target as Node)) ||
          (fullSidebarSearchBoxRef.current &&
            fullSidebarSearchBoxRef.current.contains(event.target as Node)) ||
          (fullSidebarSuggestionBoxRef.current &&
            fullSidebarSuggestionBoxRef.current.contains(event.target as Node)) ||
          (halfSidebarSearchBoxRef.current &&
            halfSidebarSearchBoxRef.current.contains(event.target as Node)) ||
          (halfSidebarSuggestionBoxRef.current &&
            halfSidebarSuggestionBoxRef.current.contains(event.target as Node))
        )
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !(
          (savedSidebarSearchBoxRef.current &&
            savedSidebarSearchBoxRef.current.contains(event.target as Node)) ||
          (savedSidebarSuggestionBoxRef.current &&
            savedSidebarSuggestionBoxRef.current.contains(event.target as Node)) ||
          (recentSidebarSearchBoxRef.current &&
            recentSidebarSearchBoxRef.current.contains(event.target as Node)) ||
          (recentSidebarSuggestionBoxRef.current &&
            recentSidebarSuggestionBoxRef.current.contains(event.target as Node)) ||
          (firstSearchBoxRef.current &&
            firstSearchBoxRef.current.contains(event.target as Node)) ||
          (firstSuggestionBoxRef.current &&
            firstSuggestionBoxRef.current.contains(event.target as Node)) ||
          (secondSearchBoxRef.current &&
            secondSearchBoxRef.current.contains(event.target as Node)) ||
          (secondSuggestionBoxRef.current &&
            secondSuggestionBoxRef.current.contains(event.target as Node))
        )
      ) {
        setShowSidebarSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        saveMenuRef.current &&
        !saveMenuRef.current.contains(event.target as Node)
      ) {
        setShowSaveMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/getAllShops`)
      .then(res => res.json())
      .then((data: Shop[]) => setAllShops(data))
      .catch(err => console.error(err));
  }, []);

  const handleOpenShopSidebar = (shopId: number) => {
    const shop = allShops.find((s: Shop) => s.shopId === shopId);
    if (shop) {
      setActiveShop(shop);
      setPlaceSidebar("full");
    }
  };

  const activePlaceMarkerRemover = () => {
    if (activePlaceMarkerRef.current) {
      activePlaceMarkerRef.current.setMap(null);
      activePlaceMarkerRef.current = null;
    }
  };

  {/*API for shop's cuisine*/ }
  const fetchShopCuisines = async (shopId: string): Promise<{ cuisines: string[]; itemsByCuisine: Record<string, FoodItem[]>; }> => {
    try {
      const response = await fetch(
        `${API_URL}/getFoodDetails?shop_id=${shopId}`
      );

      if (!response.ok) {
        return { cuisines: [], itemsByCuisine: {} };
      }

      const foodItems = (await response.json()) as FoodItem[];

      const cuisines: string[] = [
        ...new Set(foodItems.map((item) => item.cuisine).filter(Boolean)),
      ];

      const itemsByCuisine: Record<string, FoodItem[]> = {};

      cuisines.forEach((cuisine) => {
        itemsByCuisine[cuisine] = foodItems.filter(
          (item) => item.cuisine === cuisine
        );
      });

      return { cuisines, itemsByCuisine };
    } catch (err) {
      console.error("Failed to fetch cuisines:", err);
      return { cuisines: [], itemsByCuisine: {} };
    }
  };

  {/*API for extra image*/ }
  const fetchShopImages = async (shopId: string): Promise<string[]> => {
    try {
      const response = await fetch(
        `${API_URL}/getFoodDetails?shop_id=${shopId}`
      );
      if (response.ok) {
        const foodItems = await response.json() as FoodItem[];
        return foodItems.flatMap((item) => item.images || []);
      }
    } catch (err) {
      console.error("Failed to fetch additional images:", err);
    }
    return [];
  };

  const handleShopSuggestion = useCallback(async (shop: Shop, onComplete?: () => void) => {
    setSearchOrigin("home");

    const location = new google.maps.LatLng(Number(shop.lat), Number(shop.lng));

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: location,
      map: mapInstanceRef.current!,
      title: shop.name,
    });

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(location);

    const isMobileView = window.innerWidth < 768;
    const padding = { top: 50, bottom: 50, left: 50, right: 50 };

    if (!isMobileView) {
      const sidebarEl = document.getElementById("fullSidebar");
      const sidebarWidth = sidebarEl?.offsetWidth || 410;
      padding.left = sidebarWidth + 50;
    } else {
      const drawerHeight = window.innerHeight * 0.5;
      padding.bottom = drawerHeight + 20;
      padding.top = 150;
    }

    mapInstanceRef.current?.fitBounds(bounds, padding);

    setSearchValue(shop.name);

    const { cuisines, itemsByCuisine } = await fetchShopCuisines(String(shop.shopId));
    const additionalImages = await fetchShopImages(String(shop.shopId));
    const allFSPhotos = [...shop.imageUrls || [], ...(shop.menu || []), ...additionalImages];

    {/*Fetch shop rating*/ }
    let shopRating: number | undefined = undefined;
    try {
      const fetchedRating = await fetchShopRating(shop.shopId);
      if (fetchedRating !== null) shopRating = fetchedRating;
    } catch (err) {
      console.warn(`Failed to fetch rating for shop ${shop.shopId}`, err);
    }

    {/* Fetch shop priceText */ }
    let shopPriceRange: string | undefined = undefined;
    try {
      const fetchedPrice = await fetchShopPriceText(shop.shopId);
      if (fetchedPrice !== null) shopPriceRange = fetchedPrice;
    } catch (err) {
      console.warn(`Failed to fetch priceText for shop ${shop.shopId}`, err);
    }

    const newPlace: RecentPlace = {
      shopId: shop.shopId,
      title: shop.name,
      nativeName: undefined,
      subtitle: shop.address,
      imageUrl: shop.imageUrls[0],
      photos: shop.menu || [],
      allPhotos: allFSPhotos || [],
      highlights: additionalImages || [],
      lat: Number(shop.lat),
      lng: Number(shop.lng),
      timestamp: Date.now(),
      fullAddress: shop.address,
      plusCode: "",
      rating: shopRating ?? 4.5,
      userRatingsTotal: undefined,
      priceText: shopPriceRange ?? "₹200 – 400",
      category: shop.cuisine || "Shop",
      reviews: [],
      applink: shop.applink || "",
      about: shop.about,
      serviceability: shop.serviceability,
      openCloseTiming: shop.openCloseTiming,
      cuisines: cuisines || [],
      itemsByCuisine: itemsByCuisine || {}
    };

    setRecentPlaces(prev => {
      const updated = [newPlace, ...prev.filter(p => p.title !== shop.name)];
      const sliced = updated.slice(0, 20);
      localStorage.setItem("recent_places", JSON.stringify(sliced));
      return sliced;
    });

    setFullSidebarSelectedPlace({
      ...newPlace,
      isFavorite: favoritePlaceList.some((p) => p.title === newPlace.title),
    });

    setIsLocationSelected(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setPlaceSidebar("full");
    setFullSidebarActiveTab("fullSidebarOverview");

    setTimeout(() => {
      if (fullSidebarContentRef.current) {
        fullSidebarContentRef.current.scrollTop = 0;
      }
    }, 0);

    if (onComplete) onComplete();
  }, [favoritePlaceList]);

  function centerPlaceOnMap(position: google.maps.LatLng) {
    const map = mapInstanceRef.current!;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(position);

    {/*
      const sidebarEl = document.getElementById("fullSidebar");
      const sidebarWidth = sidebarEl?.offsetWidth || 0;
      const sidebarHeight = sidebarEl?.offsetHeight || 0;
    
      let padding = { top: 50, bottom: 50, left: 50, right: 50 };
      if (window.innerWidth >= 768) {
        padding = { top: 50, bottom: 50, left: sidebarWidth + 50, right: 50 };
      } else {
        padding = { top: 150, bottom: sidebarHeight + 50, left: 50, right: 50 };
      }
      map.fitBounds(bounds, padding);
    */}

    const isMobileView = window.innerWidth < 768;
    const padding = { top: 50, bottom: 50, left: 50, right: 50 };

    if (!isMobileView) {
      const sidebarEl = document.getElementById("fullSidebar");
      const sidebarWidth = sidebarEl?.offsetWidth || 410;
      padding.left = sidebarWidth + 50;
    } else {
      const drawerHeight = window.innerHeight * 0.5;
      padding.bottom = drawerHeight + 20;
      padding.top = 150;
    }
    map.fitBounds(bounds, padding);
  }

  const addToHistory = useCallback(async (shop: Shop) => {
    const { cuisines, itemsByCuisine } = await fetchShopCuisines(String(shop.shopId));
    const additionalImages = await fetchShopImages(String(shop.shopId));
    const allFSPhotos = [...shop.imageUrls || [], ...(shop.menu || []), ...additionalImages];

    {/*Fetch shop rating*/ }
    let shopRating: number | undefined = undefined;
    try {
      const fetchedRating = await fetchShopRating(shop.shopId);
      if (fetchedRating !== null) shopRating = fetchedRating;
    } catch (err) {
      console.warn(`Failed to fetch rating for shop ${shop.shopId}`, err);
    }

    {/* Fetch shop priceText */ }
    let shopPriceRange: string | undefined = undefined;
    try {
      const fetchedPrice = await fetchShopPriceText(shop.shopId);
      if (fetchedPrice !== null) shopPriceRange = fetchedPrice;
    } catch (err) {
      console.warn(`Failed to fetch priceText for shop ${shop.shopId}`, err);
    }

    const newPlace: RecentPlace = {
      shopId: shop.shopId,
      title: shop.name,
      nativeName: undefined,
      subtitle: shop.address,
      imageUrl: shop.imageUrls?.[0],
      photos: shop.menu || [],
      highlights: additionalImages || [],
      allPhotos: allFSPhotos || [],
      lat: Number(shop.lat),
      lng: Number(shop.lng),
      timestamp: Date.now(),
      fullAddress: shop.address,
      plusCode: "",
      rating: shopRating ?? 4.5,
      userRatingsTotal: undefined,
      priceText: shopPriceRange ?? "₹200 – 400",
      category: shop.cuisine || "Shop",
      reviews: [],
      applink: shop.applink || "",
      about: shop.about,
      serviceability: shop.serviceability,
      openCloseTiming: shop.openCloseTiming,
      cuisines: cuisines || [],
      itemsByCuisine: itemsByCuisine || {}
    };

    setRecentPlaces(prev => {
      const updated = [newPlace, ...prev.filter(p => p.title !== shop.name)];
      const sliced = updated.slice(0, 20);
      localStorage.setItem("recent_places", JSON.stringify(sliced));
      return sliced;
    });
  }, []);

  useEffect(() => {
    const loadGoogleMapsScript = (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        if (typeof window.google === "object" && typeof window.google.maps === "object") {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src^="https://maps.googleapis.com/maps/api/js"]'
        );
        if (existingScript) {
          existingScript.addEventListener("load", () => resolve());
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);

        document.head.appendChild(script);
      });
    };

    const fetchShops = async (): Promise<Shop[]> => {
      try {
        const response = await fetch(`${API_URL}/getAllShops`);
        if (!response.ok) throw new Error("Failed to fetch shops");
        const data: Shop[] = await response.json();
        return data;
      } catch (err) {
        console.error(err);
        return [];
      }
    };

    loadGoogleMapsScript().then(async () => {
      if (mapRef.current && inputRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 13.0827, lng: 80.2707 },
          zoom: 11,
          minZoom: 3,
          maxZoom: 20,
          gestureHandling: "greedy",
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          disableDefaultUI: true,
          restriction: {
            latLngBounds: {
              north: 85,
              south: -85,
              west: -180,
              east: 180,
            },
            strictBounds: true,
          },
          draggableCursor: "default",
          draggingCursor: "move",

          styles: theme === 'dark' ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,

        });

        mapInstanceRef.current = map;

        const shops = await fetchShops();

        const shopRatings: Record<number, number> = {};
        await Promise.all(
          shops.map(async (shop) => {
            if (!shop.shopId) return;
            try {
              const rating = await fetchShopRating(shop.shopId);
              if (rating !== null) shopRatings[shop.shopId] = rating;
            } catch (err) {
              console.warn(`Failed to fetch rating for shop ${shop.shopId}`, err);
            }
          })
        );

        const shopPrices: Record<number, string> = {};
        await Promise.all(
          shops.map(async (shop) => {
            if (!shop.shopId) return;
            try {
              const priceRange = await fetchShopPriceText(shop.shopId);
              if (priceRange !== null) shopPrices[shop.shopId] = priceRange;
            } catch (err) {
              console.warn(`Failed to fetch price range for shop ${shop.shopId}`, err);
            }
          })
        );


        class RestaurantLabel extends google.maps.OverlayView {
          private div: HTMLDivElement | null = null;
          private position: google.maps.LatLng;
          private data: Shop;
          private rating: number | undefined;
          private priceRange: string | undefined;
          private marker: google.maps.Marker | null = null;
          private infoWindow: google.maps.InfoWindow | null = null;

          constructor(position: google.maps.LatLng, data: Shop, rating?: number, priceRange?: string) {
            super();
            this.position = position;
            this.data = data;
            this.rating = rating;
            this.priceRange = priceRange;
          }

          onAdd() {
            this.div = document.createElement("div");
            this.div.style.position = "absolute";
            this.div.style.cursor = "pointer";
            this.div.style.fontFamily = "Arial, sans-serif";
            this.div.style.fontSize = "12px";
            this.div.style.background = "transparent";
            this.div.style.borderRadius = "4px";
            this.div.style.padding = "4px 6px";
            this.div.style.whiteSpace = "nowrap";
            this.div.style.cursor = "pointer";

            this.div.innerHTML = `
                <img class="label-icon" src="https://cdn-icons-png.flaticon.com/128/4287/4287725.png" {/*src="${theme === 'dark' ? '/location-light.png' : '/location-dark.png'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; "/>
                <div class="label-text">
                <div class="label-name" style="font-size:14px; color:${theme === 'dark' ? 'white' : 'black'}">${this.data.name}</div>
                ${this.data.cuisine ? `<div class="label-cuisine" style="font-size:12px; color:${theme === 'dark' ? 'white' : 'black'}">${this.data.cuisine}</div>` : ""}
              </div>
              </div>
            `;

            overlayInstancesRef.current.push(this);

            this.div.addEventListener("click", async () => {
              const shop = this.data;
              if (!shop) return;

              addToHistory(shop);

              const marker = new google.maps.Marker({
                position: this.position,
                map: this.getMap()!,
                title: shop.name,
              });

              if (activePlaceMarkerRef.current) {
                activePlaceMarkerRef.current.setMap(null);
              }
              activePlaceMarkerRef.current = marker;

              // API for cuisines
              let cuisines: string[] = [];
              const itemsByCuisine: Record<string, FoodItem[]> = {};

              try {
                const response = await fetch(`${API_URL}/getFoodDetails?shop_id=${shop.shopId}`);

                if (response.ok) {
                  const foodItems = (await response.json()) as FoodItem[];
                  cuisines = [...new Set(foodItems.map(item => item.cuisine ?? ""))].filter(Boolean);

                  cuisines.forEach(cuisine => {
                    itemsByCuisine[cuisine] = foodItems.filter(item => item.cuisine === cuisine);
                  });
                }
              } catch (err) {
                console.error("Failed to fetch cuisines:", err);
              }

              // API for extra image
              let additionalImages: string[] = [];
              try {
                const response = await fetch(`${API_URL}/getFoodDetails?shop_id=${shop.shopId}`);
                if (response.ok) {
                  const foodItems = await response.json() as FoodItem[];
                  additionalImages = foodItems.flatMap((item) => item.images || []);
                }
              } catch (err) {
                console.error("Failed to fetch additional images:", err);
              }

              const allFSPhotos = [...shop.imageUrls || [], ...(shop.menu || []), ...additionalImages];

              const newPlace: RecentPlace = {
                shopId: shop.shopId,
                title: shop.name,
                nativeName: undefined,
                subtitle: shop.address,
                imageUrl: shop.imageUrls[0],
                photos: shop.menu || [],
                allPhotos: allFSPhotos || [],
                highlights: additionalImages || [],
                lat: Number(shop.lat),
                lng: Number(shop.lng),
                timestamp: Date.now(),
                fullAddress: shop.address,
                plusCode: "",
                rating: this.rating ?? 4.5,
                userRatingsTotal: undefined,
                priceText: this.priceRange ?? "₹200 – 400",
                category: shop.cuisine || "Shop",
                reviews: [],
                applink: shop.applink || "",
                about: shop.about,
                serviceability: shop.serviceability,
                openCloseTiming: shop.openCloseTiming,
                cuisines: cuisines || [],
                itemsByCuisine: itemsByCuisine || {}
              };

              setRecentPlaces(prev => {
                const updated = [newPlace, ...prev.filter(p => p.title !== shop.name)];
                const sliced = updated.slice(0, 20);
                localStorage.setItem("recent_places", JSON.stringify(sliced));
                return sliced;
              });

              setFullSidebarSelectedPlace({
                ...newPlace,
                isFavorite: favoritePlaceList.some((p) => p.title === newPlace.title),
              });

              setPlaceSidebar("full");
              setSearchOrigin("home");
              setSearchValue(shop.name);
              centerPlaceOnMap(new google.maps.LatLng(parseFloat(shop.lat), parseFloat(shop.lng)));
              setFullSidebarActiveTab("fullSidebarOverview");
            });

            // Hover InfoWindow
            const firstImage = (this.data.imageUrls && this.data.imageUrls.length > 0 && this.data.imageUrls[0]) || "https://via.placeholder.com/180x120?text=No+Image";
            //const category = (this.data.cuisine || "").split(",")[0].trim();
            const tooltip = document.createElement("div");
            tooltip.style.position = "absolute";
            tooltip.style.background = "white";
            tooltip.style.padding = "0px";
            tooltip.style.border = "1px solid #ccc";
            tooltip.style.borderRadius = "8px";
            tooltip.style.fontSize = "14px";
            tooltip.style.fontFamily = "Arial, sans-serif";
            tooltip.style.whiteSpace = "nowrap";
            tooltip.style.pointerEvents = "none";
            tooltip.style.display = "none";
            tooltip.style.color = "black";
            tooltip.innerHTML = `
              <div style="display:flex; flex-direction:column; gap:8px;">
                <img 
                  src="${firstImage}" 
                  style="
                    width:240px;
                    height:120px;
                    object-fit:cover;
                    object-position:top;
                    border-radius:8px 8px 0px 0px;
                  "
                />

                <div style="padding:2px 14px 12px; display:flex; flex-direction:column; gap:4px;">
                  <div style="font-size:17px; font-family:sans-serif; font-weight:600; color:black;">
                    ${this.data.name}
                  </div>

                  <div style="display:flex; margin-top:1px; align-items:center; gap:5px; font-size:12.5px; color:black; line-height:1;">
                    <span>${this.rating || "4.5"}</span>

                    <span style="display:flex; align-items:center; gap:1px;">
                      ${[1, 2, 3, 4, 5].map(i => `
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                            fill="${i <= Math.round(this.rating || 4) ? '#f4b400' : '#ddd'}"
                            viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
                                  9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      `).join("")}
                    </span>

                    ${this.data.userRatingsTotal
                ? `<span style="color:#777;">(${Number(this.data.userRatingsTotal).toLocaleString()})</span>`
                : ""
              }
                  </div>

                  <div style="display:flex; margin-top:1px; align-items:center; gap:6px; font-size:12.5px; color:black;">
                    ${this.data.cuisine ? `<span>${this.data.cuisine}</span>` : ""}
                    ${this.priceRange
                ? `<span><b>·</b></span>
                          <span>₹${this.priceRange}</span>`
                : `<span><b>·</b></span>
                          <span>₹200 – 400</span>`
              }
                  </div>

                  <div style="font-size:12.5px; margin-top:1px; color:black;">
                    ${this.data.openCloseTiming
                ? `Open ${this.data.openCloseTiming.split('–')[0]} <b>·</b> <span style="color:red;">Closes ${this.data.openCloseTiming.split('–')[1]}</span>`
                : `Open 10am <b>·</b> <span style="color:red;"> Closes 10pm</span>`
              }
                  </div>
                </div>
              </div>
            `;
            this.div.appendChild(tooltip);

            {/*
            this.div.addEventListener("mouseover", () => {
              const map = this.getMap() as google.maps.Map;
              const zoom = map.getZoom() || 0;
  
              if (zoom >= 2) { 
                  tooltip.style.display = "block";
                }
              });
  
              this.div.addEventListener("mousemove", (e) => {
              const map = this.getMap() as google.maps.Map;
              const zoom = map.getZoom() || 0;
  
              if (zoom >= 2) { 
                tooltip.style.left = e.offsetX + 20 + "px";
                tooltip.style.top = e.offsetY - 20 + "px";
              }
            });
            */}

            this.div.addEventListener("mouseover", () => {
              const map = this.getMap() as google.maps.Map;
              const zoom = map.getZoom() || 0;

              if (zoom >= 2) {
                const rect = this.div!.getBoundingClientRect();
                tooltip.style.left = rect.width - 5 + "px"
                tooltip.style.top = "0px";
                tooltip.style.display = "block";
              }

              if (zoom >= 2) {
                const iconEl = this.div!.querySelector(".label-icon") as HTMLElement;
                const iconWidth = iconEl.getBoundingClientRect().width;
                tooltip.style.left = iconWidth + 6 + "px";
                tooltip.style.top = "0px";
                tooltip.style.zIndex = "999999";
                tooltip.style.display = "block";
              }
            });

            this.div.addEventListener("mouseout", () => {
              tooltip.style.display = "none";
            });

            const panes = this.getPanes();
            panes?.overlayMouseTarget.appendChild(this.div);
          }

          updateTheme(newTheme: string) {
            if (!this.div) return;
            const nameEl = this.div.querySelector(".label-name") as HTMLElement;
            const cuisineEl = this.div.querySelector(".label-cuisine") as HTMLElement;
            const imgEl = this.div.querySelector(".label-icon") as HTMLImageElement;

            if (nameEl) nameEl.style.color = newTheme === 'dark' ? 'white' : 'black';
            if (cuisineEl) cuisineEl.style.color = newTheme === 'dark' ? 'white' : 'black';
            //if (imgEl) imgEl.src = newTheme === 'dark' ? '/location-light.png' : '/location-dark.png';
            if (imgEl) imgEl.src = newTheme === 'dark' ? 'https://cdn-icons-png.flaticon.com/128/4287/4287725.png' : 'https://cdn-icons-png.flaticon.com/128/4287/4287725.png';
          }

          draw() {
            if (!this.div) return;

            if (categoryModeRef.current === true) {
              const textEl = this.div.querySelector(".label-text") as HTMLElement;
              const iconEl = this.div.querySelector(".label-icon") as HTMLElement;

              if (textEl) textEl.style.display = "none";
              if (iconEl) iconEl.style.display = "none";

              return; // stop further styling
            }
            const projection = this.getProjection();
            const pos = projection.fromLatLngToDivPixel(this.position);

            if (pos) {
              const iconEl = this.div.querySelector(".label-icon") as HTMLElement;
              const rect = this.div.getBoundingClientRect();

              let iconHeight = rect.height;
              let iconWidth = rect.width;

              if (iconEl) {
                const iconRect = iconEl.getBoundingClientRect();
                iconHeight = iconRect.height;
                iconWidth = iconRect.width;
              }

              this.div.style.left = pos.x - iconWidth / 1.5 + "px";
              this.div.style.top = pos.y - iconHeight + "px";
            }

            const map = this.getMap() as google.maps.Map;
            const zoom = map.getZoom() || 0;

            const textEl = this.div.querySelector(".label-text") as HTMLElement;
            const iconEl = this.div.querySelector(".label-icon") as HTMLElement;

            if (zoom < 12) {
              // Both hidden
              if (textEl) textEl.style.display = "none";
              if (iconEl) iconEl.style.display = "block";
            } else if (zoom < 14) {
              // only icon
              if (textEl) textEl.style.display = "none";
              if (iconEl) iconEl.style.display = "block";
            } else if (zoom >= 14 && zoom < 18) {
              // icon + name
              if (textEl) {
                textEl.style.display = "none";
              }
              if (iconEl) iconEl.style.display = "block";
            } else {
              // everything
              if (textEl) {
                textEl.style.display = "block";
                textEl.style.fontSize = "14px";
              }
              if (iconEl) iconEl.style.display = "block";
            }
          }

          onRemove() {
            if (this.div && this.div.parentNode) {
              this.div.parentNode.removeChild(this.div);
            }
            overlayInstancesRef.current = overlayInstancesRef.current.filter(i => i !== this);
          }
        }

        shops.forEach((shop: Shop) => {
          const position = new google.maps.LatLng(parseFloat(shop.lat), parseFloat(shop.lng));
          const overlay = new RestaurantLabel(position, shop, shopRatings[shop.shopId], shopPrices[shop.shopId]);
          overlay.setMap(mapInstanceRef.current);
        });

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          const clickedLat = e.latLng?.lat();
          const clickedLng = e.latLng?.lng();
          if (clickedLat !== undefined && clickedLng !== undefined) {
            const shop = allShops.find(
              (s) => Number(s.lat) === clickedLat && Number(s.lng) === clickedLng
            );
            if (shop) {
              handleShopSuggestion(shop, () => setPlaceSidebar("full"));
            }
          }
        });
      }
    });
  }, [allShops]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({
        styles: theme === 'dark' ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
      });
      overlayInstancesRef.current.forEach(overlay => {
        if (overlay.updateTheme) {
          overlay.updateTheme(theme);
        }
      });
    }
  }, [theme]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const updateThumbnail = () => {
      const nextType = isSatellite ? "roadmap" : "satellite";
      const url = getStaticMapUrl(map, nextType);
      setThumbnailUrl(url);
    };

    updateThumbnail();

    const idleListener = google.maps.event.addListener(map, "idle", updateThumbnail);
    return () => {
      google.maps.event.removeListener(idleListener);
    };
  }, [isSatellite]);

  useEffect(() => {
    const interval = setInterval(() => {
      const map = mapInstanceRef.current;
      if (map && map.getCenter() && map.getZoom()) {
        const url = getStaticMapUrl(map, "satellite");
        setThumbnailUrl(url);
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const SidebarItem = ({ icon, text, onClick, }: { icon?: React.ReactNode; text: string; onClick?: () => void; }) => (
    <div
      className="group flex items-center gap-[20px] cursor-pointer"
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      <span className="text-[#202124] group-hover:text-gray-500">{text}</span>
    </div>
  );

  const combinedList = useMemo<CombinedItem[]>(() => {
    if (searchValue.trim() !== "") {
      const matchingRecent = recentPlaces.filter((place) =>
        place.title.toLowerCase().startsWith(searchValue.toLowerCase())
      );

      const remainingSlots = 5 - matchingRecent.length;
      const trimmedSuggestions = suggestions.slice(0, Math.max(0, remainingSlots));

      const mappedRecent: CombinedItem[] = matchingRecent.map((place) => ({
        type: "recent",
        data: place,
      }));

      const mappedSuggestions: CombinedItem[] = trimmedSuggestions.map((suggestion) => ({
        type: "suggestion",
        data: suggestion,
      }));

      return [...mappedRecent, ...mappedSuggestions];
    }

    const list: CombinedItem[] = recentPlaces
      .slice(0, recentPlaces.length >= 5 ? 5 : 4)
      .map((place) => ({ type: "recent", data: place }));

    if (recentPlaces.length >= 0) {
      list.push({ type: "more" });
    }

    return list;
  }, [searchValue, suggestions, recentPlaces]);

  const sidebarCombinedList = useMemo<SidebarCombinedItem[]>(() => {
    if (sidebarSearchValue.trim() !== "") {
      const matchingRecent = recentPlaces.filter((place) =>
        place.title.toLowerCase().startsWith(sidebarSearchValue.toLowerCase())
      );

      const remainingSlots = 5 - matchingRecent.length;
      const trimmedSuggestions = sidebarSuggestions.slice(0, Math.max(0, remainingSlots));

      const sidebarMappedRecent: SidebarCombinedItem[] = matchingRecent.map((place) => ({
        type: "recent",
        data: place,
      }));

      const sidebarMappedSuggestions: SidebarCombinedItem[] = trimmedSuggestions.map((suggestion) => ({
        type: "suggestion",
        data: suggestion,
      }));

      return [...sidebarMappedRecent, ...sidebarMappedSuggestions];
    }

    const sidebarList: SidebarCombinedItem[] = recentPlaces
      .slice(0, recentPlaces.length >= 5 ? 5 : 4)
      .map((place) => ({ type: "recent", data: place }));

    if (recentPlaces.length >= 0) {
      sidebarList.push({ type: "more" });
    }

    return sidebarList;
  }, [sidebarSearchValue, sidebarSuggestions, recentPlaces]);

  const fetchDetailedPlaces = async (results: google.maps.places.PlaceResult[]) => {
    const detailedResults = await Promise.all(
      results.map((place) =>
        new Promise<RecentPlace>((resolve) => {
          if (!place.place_id) return resolve(null!);

          const service = new google.maps.places.PlacesService(mapInstanceRef.current!);
          service.getDetails({ placeId: place.place_id, language: "en" }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && details) {
              const components = details.address_components || [];
              const cityComp = components.find(c => c.types.includes("locality") || c.types.includes("administrative_area_level_2"));
              const stateComp = components.find(c => c.types.includes("administrative_area_level_1"));
              const city = cityComp?.long_name || "";
              const state = stateComp?.long_name || "";
              const subtitle = city && state && details.name !== city ? `${city}, ${state}` : state;

              let priceText;
              if (details.types?.includes("restaurant")) priceText = "₹200 – 400";
              else if (details.price_level !== undefined) priceText = "₹".repeat(details.price_level);

              let category = getReadableCategory(details);
              if (category.toLowerCase() === "establishment") category = "Software Company";

              const photos = details.photos?.map(p => p.getUrl({ maxWidth: 400 })) || [];
              const imageUrl = photos[0];

              const ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
              details.reviews?.forEach((r) => {
                const star = r.rating;
                if (star && star >= 1 && star <= 5) {
                  ratingBreakdown[star as 1 | 2 | 3 | 4 | 5] += 1;
                }
              });

              resolve({
                place_id: details.place_id,
                title: details.name || "Unnamed Place",
                subtitle,
                imageUrl,
                photos,
                lat: details.geometry?.location?.lat() || 0,
                lng: details.geometry?.location?.lng() || 0,
                timestamp: Date.now(),
                rating: details.rating,
                userRatingsTotal: details.user_ratings_total,
                priceText,
                category,
                reviews: details.reviews || [],
                fullAddress: details.formatted_address,
                plusCode: details.plus_code?.compound_code || details.plus_code?.global_code,
                ratingBreakdown,
              });
            } else resolve(null!);
          });
        })
      )
    );
    return detailedResults.filter(r => r !== null);
  };

  return (
    <div className="relative w-full h-screen">
      {/*Bottom nav*/}
      <div className={`flex flex-row md:hidden fixed bottom-0 left-0 w-full ${theme === 'dark' ? 'bg-[#192123] text-[#9dedfb]' : 'bg-[#f1f6f7] text-black'} z-60 shadow-md py-2  pb-[calc(env(safe-area-inset-bottom)+8px)]`}>
        <div className="flex flex-row items-center justify-evenly w-full">
          <div
            onClick={exploreButtonFunction}
            className="flex flex-col items-center gap-[8px] cursor-pointer"
          >
            <LocationOnIcon style={{ fontSize: '25px' }} className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-black'}`} />
            <span className="text-[12px] tracking-wide font-medium">Explore</span>
          </div>

          <div
            className="flex flex-col items-center gap-[8px] cursor-pointer"
            onClick={() => {
              if (topSidebar !== "saved") {
                setTopSidebar("saved");
                setPlaceSidebar(null);
                clearCategoryMarkers();
                activePlaceMarkerRemover();
              }
            }}
          >
            <FavIcon style={{ fontSize: '25px' }} className={`${topSidebar === "saved" ? "text-red-500" : theme === 'dark' ? "text-[#9dedfb]" : "text-black"}`} />
            <span className="text-[12px] tracking-wide font-medium">Favorite</span>
          </div>

          <div
            className="flex flex-col items-center gap-[8px] cursor-pointer"
            onClick={() => {
              if (recentPlaces.length > 0 && topSidebar !== "recent") {
                setTopSidebar("recent");
                setPlaceSidebar(null);
                clearCategoryMarkers();
                activePlaceMarkerRemover();
              }
            }}
          >
            <HistoryIcon style={{ fontSize: '25px' }} className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-black'} rotate-45`} />
            <span className="text-[12px] tracking-wide font-medium">Recents</span>
          </div>
        </div>
      </div>


      <div className={`hidden md:flex flex-col absolute top-0 left-0 w-[70px] h-full ${theme === 'dark' ? 'bg-[#192123] text-[#9dedfb]' : 'bg-[#f1f6f7] text-black'} z-100 shadow-md items-center justify-between pt-6 pb-5`}>
        <div className="flex flex-col items-center">
          <div
            onClick={exploreButtonFunction}
            className="flex flex-col items-center gap-[6px] cursor-pointer"
          >
            <LocationOnIcon style={{ fontSize: '25px' }} className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-black'}`} />
            <span className="text-[12px] tracking-wide font-medium">Explore</span>
          </div>

          <div
            className="flex flex-col items-center gap-[8px] cursor-pointer mt-[30px]"
            onClick={() => {
              if (topSidebar !== "saved") {
                setTopSidebar("saved");
                setPlaceSidebar(null);
                clearCategoryMarkers();
                closeCategoryMode();
                activePlaceMarkerRemover();
              }
            }}
          >
            <FavIcon style={{ fontSize: '25px' }} className={`${topSidebar === "saved" ? "text-red-500" : theme === 'dark' ? "text-[#9dedfb]" : "text-black"}`} />
            <span className="text-[12px] tracking-wide font-medium">Favorite</span>
          </div>

          <div
            className="flex flex-col items-center gap-[0px] cursor-pointer mt-[22px]"
            onClick={() => {
              if (recentPlaces.length > 0 && topSidebar !== "recent") {
                setTopSidebar("recent");
                setPlaceSidebar(null);
                clearCategoryMarkers();
                closeCategoryMode();
                activePlaceMarkerRemover();
              }
            }}
          >
            <HistoryIcon
              style={{ fontSize: '40px' }}
              className={`rotate-45 p-2 rounded-full transition 
                ${recentPlaces.length === 0 ? 'text-gray-400' : theme === 'dark' ? "text-[#9dedfb]" : "text-black"}`}
            />

            <span className={`text-[12px] tracking-wide font-medium
              ${recentPlaces.length === 0 ? 'text-gray-400' : theme === 'dark' ? "text-[#9dedfb]" : "text-black"}`}
            >
              Recents
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-[6px] cursor-pointer">
          <Image
            src="/logo.png"
            alt="Logo"
            width={42}
            height={42}
            unoptimized
            className="w-[50px] h-[50px] shadow-lg rounded-full object-cover"
          />
        </div>

      </div>

      {/*Menu Sidebar*/}
      <div>
        <div
          className={`fixed inset-0 bg-black z-[998] transition-opacity duration-300 ease-in-out ${menuSidebar ? "opacity-30 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          onClick={() => setMenuSidebar(false)}
        />

        <div
          className={`fixed top-0 left-0 w-[320px] h-full bg-white z-[999] shadow-lg py-[10px] overflow-y-auto
            transition-transform duration-300 ease-in-out transform ${menuSidebar ? "translate-x-0" : "-translate-x-full"
            }`}
        >

          <div className="flex items-center justify-between pl-[22px] pr-[28px] mb-[18px]">
            <Image src="/logo.png" alt="Google Maps" width={100} height={24} unoptimized className="h-[24px]" />
            <button
              onClick={() => setMenuSidebar(false)}
              className="text-[17px] text-gray-800 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-[10px] text-[14.5px] text-[#202124] px-[22px]">
            <SidebarItem
              icon={<BookmarkBorderIcon style={{ fontSize: "24px" }} className="text-gray-600 group-hover:text-gray-500" />}
              text="Saved"
              onClick={() => {
                setTopSidebar("saved");
                setPlaceSidebar(null);
                setMenuSidebar(false);
              }}
            />
            <SidebarItem
              icon={<HistoryIcon style={{ fontSize: "24px" }} className="rotate-45 text-gray-600 group-hover:text-gray-500" />}
              text="Recents"
              onClick={() => {
                setTopSidebar("recent");
                setPlaceSidebar(null);
                setMenuSidebar(false);
              }}
            />
            <SidebarItem icon={<EditLocationAltOutlinedIcon style={{ fontSize: "24px" }} className="text-gray-600 group-hover:text-gray-500" />} text="Your contributions" />
            <SidebarItem icon={<ShareLocationOutlinedIcon style={{ fontSize: "24px" }} className="text-gray-600 group-hover:text-gray-500" />} text="Location sharing" />
            <SidebarItem icon={<TimelineOutlinedIcon style={{ fontSize: "24px" }} className="text-gray-600 group-hover:text-gray-500" />} text="Your timeline" />
            <SidebarItem icon={<ShieldOutlinedIcon style={{ fontSize: "24px" }} className="text-gray-600 group-hover:text-gray-500" />} text="Your data in Maps" />
          </div>

          <hr className="my-[12px]" />

          <div className="space-y-[10px] text-[14.5px] text-[#202124] px-[22px]">
            <SidebarItem icon={<LinkOutlinedIcon style={{ fontSize: "24px" }} className="text-gray-600 group-hover:text-gray-500" />} text="Share or embed map" />
            <SidebarItem icon={<PrintOutlinedIcon style={{ fontSize: "24px" }} className="text-gray-600 group-hover:text-gray-500" />} text="Print" />
            <SidebarItem text="Add your business" />
            <SidebarItem text="Edit the map" />
          </div>

          <hr className="my-[12px]" />

          <div className="space-y-[10px] text-[14.5px] px-[22px] text-[#202124]">
            <SidebarItem text="Tips and tricks" />
            <SidebarItem text="Get help" />
            <SidebarItem text="Consumer information" />
          </div>

          <hr className="my-[12px]" />

          <div className="space-y-[10px] text-[14.5px] text-[#202124] px-[22px]">
            <SidebarItem text="Language" />
            <SidebarItem text="Search settings" />
            <SidebarItem text="Maps activity" />
          </div>
        </div>
      </div>

      {/*Saved Sidebar*/}
      <div
        className={`fixed ${theme === 'dark' ? 'bg-[#131313] text-white' : 'bg-white text-black'} shadow-2xl z-30 transition-transform duration-300 flex flex-col
          bottom-0 left-0 md:top-0 md:left-[70px] w-full md:w-[410px] h-full md:translate-y-0
          ${topSidebar === "saved" ? "z-50" : "z-30"}
          ${topSidebar === "saved" ? "translate-y-0" : "translate-y-full"}
          ${topSidebar === 'saved' ? 'md:translate-x-0' : 'md:-translate-x-[410px]'}`}
      >
        {/*Search box for saved*/}
        <div className="pt-3">
          <div className="relative px-[18px]" ref={savedSidebarSearchBoxRef}>
            <div
              className={`relative ${theme === 'dark' ? 'bg-[#393939] border-[#393939]' : 'bg-white border-gray-200'} border w-full md:w-[375px] ${showSidebarSuggestions ? "rounded-t-xl" : "rounded-full"
                }`}
            >
              <div className={`flex items-center ${favoriteList ? "pl-[12px] pr-[16px] md:pl-[18px] md:pr-[20px]" : "pl-6 pr-5 md:pr-4"} py-[12px]`}>

                {favoriteList && (
                  <button
                    onClick={() => setFavoriteList(null)}
                    className="text-[#007B8A] mr-[18px] flex items-center justify-center "
                  >
                    <ArrowLeft style={{ fontSize: "20px" }} />
                  </button>
                )}

                <input
                  ref={inputRef}
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Search Google Maps"
                  value={sidebarSearchValue}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      if (combinedList.length > 0) {
                        e.preventDefault();
                        setSidebarHighlightedIndex((prev) => {
                          if (prev < sidebarCombinedList.length - 1) return prev + 1;
                          return -1;
                        });
                      }
                      return;
                    }

                    if (e.key === "ArrowUp") {
                      if (combinedList.length > 0) {
                        e.preventDefault();
                        setSidebarHighlightedIndex((prev) => {
                          if (prev === -1) return sidebarCombinedList.length - 1;
                          return prev - 1;
                        });
                      }
                      return;
                    }

                    if (e.key === "Enter") {
                      const selectedItem = sidebarCombinedList[sidebarHighlightedIndex];

                      if (selectedItem) {
                        if (selectedItem.type === "recent") {
                          const shop = allShops.find((s) => s.name === selectedItem.data.title);
                          if (shop) {
                            handleShopSuggestion(shop, () => setPlaceSidebar("full"));
                          } else {
                            console.warn("Shop not found for recent item:", selectedItem.data.title);
                          }
                        } else if (selectedItem.type === "suggestion") {
                          const shop = allShops.find(
                            (s) => s.name === selectedItem.data.name
                          );
                          if (shop) {
                            handleShopSuggestion(shop, () => {
                              setPlaceSidebar("full");
                            });
                          }
                        } else if (selectedItem.type === "home") {
                          alert("Set Home clicked");
                        } else if (selectedItem.type === "more") {
                          exploreButtonFunction();
                        }
                        setShowSidebarSuggestions(false);
                      }
                      else if (sidebarSearchValue.trim()) {
                        const query = sidebarSearchValue.trim().toLowerCase();

                        if (!searchOrigin || searchOrigin !== "sidebar") {
                          setSearchOrigin("sidebar");
                        }

                        const filteredShops = allShops.filter(shop =>
                          shop.name.toLowerCase().includes(query)
                        );

                        if (filteredShops.length > 0) {
                          setRelatedPlaces(filteredShops)
                          setPlaceSidebar("half");
                        } else {
                          setRelatedPlaces([]);
                          setPlaceSidebar("half");
                        }
                        setShowSidebarSuggestions(false);
                      }
                    }
                  }}

                  onChange={(e) => {
                    const value = e.target.value;
                    setSidebarSearchValue(value);
                    setShowSidebarSuggestions(true);

                    if (!value.trim()) {
                      setSidebarSuggestions([]);
                      return;
                    }

                    const filtered = allShops.filter((shop) =>
                      shop.name.toLowerCase().includes(value.toLowerCase()) ||
                      shop.address.toLowerCase().includes(value.toLowerCase()) ||
                      shop.cuisine.toLowerCase().includes(value.toLowerCase())
                    );

                    setSidebarSuggestions(filtered.slice(0, 5));

                    setNoMatches(filtered.length === 0);
                  }}
                  onFocus={() => setShowSidebarSuggestions(true)}

                  className={`flex-1 outline-none border-none bg-transparent text-[14.5px] pr-[18px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                />
                <div
                  className="relative group"
                  onClick={() => {
                    setShowSidebarSuggestions(true);
                    inputRef.current?.focus();
                  }}
                >
                  <SearchIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} text-[22px] cursor-pointer`} />

                  <div
                    className="pointer-events-none absolute bottom-[-40px] left-[20px] -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] 
                    rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100"
                  >
                    Search
                  </div>
                </div>

                <div className="mr-[30px]" />

                <div className="relative group">
                  <div
                    className="w-[20px] h-[20px] bg-tranparent rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setSidebarSearchValue("");
                      setSidebarSuggestions([]);
                      setIsLocationSelected(false);
                      setShowSidebarSuggestions(false);
                      setTopSidebar(null);
                      setIsExploreButton(false);
                      closeCategoryMode();
                      clearCategoryMarkers();

                      if (placeSidebar === "full" && keepHalfSidebarOpen) {
                        setPlaceSidebar("half");
                        setKeepHalfSidebarOpen(true);
                        restoreCategoryView();
                      } else {
                        setPlaceSidebar(null);
                        setKeepHalfSidebarOpen(false);
                        closeCategoryMode();
                        resetMapForMobile();
                      }
                      if (placeSidebar === "half")
                      //if (placeSidebar === "half" || (placeSidebar === "full" && window.innerWidth < 768))
                      {
                        clearCategoryMarkers();
                      }
                      if (markerRef.current) {
                        markerRef.current.setMap(null);
                        markerRef.current = null;
                      }
                      if (sidebarMarkerRef.current) {
                        sidebarMarkerRef.current.setMap(null);
                        sidebarMarkerRef.current = null;
                      }
                      if (window.innerWidth < 768) {
                        setSidebarHeight(window.innerHeight * 0.5);
                      }

                      activePlaceMarkerRemover();
                      setNoMatches(false);
                    }}
                  >
                    <span className={`text-[18px] font-bold ${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'}`}>✕</span>
                  </div>
                  <div className="pointer-events-none absolute bottom-[-42px] left-1/2 -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100">
                    Close
                  </div>
                </div>
              </div>
            </div>
            {showSidebarSuggestions && (
              <div ref={savedSidebarSuggestionBoxRef} className="absolute top-full left-[18px] w-[calc(100%-36px)] md:w-[375px] z-40">
                <div className={`${theme === 'dark' ? 'bg-[#393939]' : 'bg-white '} shadow-lg rounded-b-xl border-t border-gray-200 py-[7px]`}>
                  {sidebarCombinedList.length > 0 && (
                    <>
                      <div className="flex flex-col space-y-[0px]">
                        {sidebarCombinedList.map((item, index) => {
                          const isHighlighted = sidebarHighlightedIndex === index;
                          const baseClass = `${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} cursor-pointer px-[12px] md:px-[16px] pt-[10px] pb-[12px] flex items-center justify-between 
                                             ${isHighlighted ? (theme === 'dark' ? "bg-gray-800" : "bg-gray-100") : ""}`;


                          const isInputEmpty = sidebarSearchValue.trim() === "";

                          if (item.type === "recent") {
                            const place = item.data as RecentPlace;
                            return (
                              <div
                                key={`recent-${place.lat}-${place.lng}-${place.timestamp}`}
                                className={`px-[14px] md:px-[20px] ${baseClass} group`}
                                onMouseDown={() => {
                                  setSidebarSearchValue(place.title);
                                  setShowSidebarSuggestions(true);

                                  const shop = allShops.find((s) => s.name === place.title);
                                  if (shop) {
                                    handleShopSuggestion(shop);
                                  } else {
                                    console.warn("Shop not found for recent place:", place.title);
                                  }
                                }}
                              >
                                <div className="flex bg-red-00 items-center justify-between w-full group">
                                  <div className={`flex bg-blue- items-center ${isInputEmpty ? "gap-[12px]" : "gap-[13px]"} overflow-hidden`}>
                                    {isInputEmpty ? (
                                      <div className={`md:w-10 md:h-10 ${theme === 'dark' ? 'bg-[#2a2b2f]' : 'bg-[#f2f2f2]'} rounded-full flex items-center justify-center`}>
                                        <AccessTimeIcon className={`${theme === 'dark' ? 'text-white' : 'text-black'} w-6 h-6`} />
                                      </div>
                                    ) : (
                                      <div className="py-[8px] bg-transparent flex items-center justify-center">
                                        <AccessTimeIcon className={`w-9 h-9 ${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: "21px" }} />
                                      </div>
                                    )}

                                    {isInputEmpty ? (
                                      <div className="flex flex-col max-w-[80%] md:max-w-[240px]">
                                        <span className={`font-medium text-[14.5px]  ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                                          {place.title}
                                        </span>
                                        {place.subtitle && (
                                          <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'} text-[14px] truncate`}>
                                            {place.subtitle}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className={`text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} font-medium truncate`}>
                                        {place.title}
                                        {place.subtitle && (
                                          <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} font-normal pl-[6px]`}>{place.subtitle}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {isInputEmpty && (
                                    <button
                                      tabIndex={-1}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setRecentPlaces((prev) => {
                                          const updated = prev.filter(
                                            (p) => !(p.lat === place.lat && p.lng === place.lng)
                                          );
                                          localStorage.setItem("recent_places", JSON.stringify(updated));
                                          return updated;
                                        });
                                      }}
                                      className={`opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all duration-150 px-[8px] py-[4px] font-bold text-[14px] cursor-pointer rounded-full ${theme === 'dark' ? 'text-white hover:bg-[#2a2b2f]' : 'text-black hover:bg-gray-200'}`}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "suggestion") {
                            const shop = item.data;
                            return (
                              <div
                                key={shop.shopId}
                                className={baseClass}
                                onMouseDown={() => handleShopSuggestion(shop)}
                              >
                                <div className="flex items-center gap-[10px] overflow-hidden">
                                  <div className="w-9 h-9 bg-transparent rounded-full flex items-center justify-center">
                                    <LocationOnIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'}`} style={{ fontSize: "21px" }} />
                                  </div>
                                  <span className={`font-medium tracking-wide text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} truncate w-full`}>
                                    {shop.name}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "more") {
                            return (
                              <div
                                key="more"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  exploreButtonFunction();
                                  setShowSidebarSuggestions(false);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  exploreButtonFunction();
                                  setShowSidebarSuggestions(false);
                                }}
                                className={` px-[12px] py-[12px] flex items-center justify-center cursor-pointer 
                                  ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} 
                                  ${sidebarHighlightedIndex === index
                                    ? (theme === 'dark' ? "bg-gray-800 text-white" : "bg-gray-100 text-[#007B8A]")
                                    : (theme === 'dark' ? "text-white" : "text-white")
                                  }`}
                              >
                                <span className="text-[14.5px] tracking-wide font-medium">
                                  See all shops list
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </>
                  )}
                  {noMatches && (
                    <div className={`px-[20px] py-[12px] text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      <p className={`font-medium text-[15px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Sorry, can&apos;t find that place name.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/*Favorite place tab*/}
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-start px-[26px] pt-[18px] pb-[16px] border-b justify-start border-gray-200">
            <h2 className={`text-[20px] font-sans font-normal ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Favorites</h2>
            <div className={`flex items-center ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} text-[14px] tracking-wide mt-[4px]`}>
              {/*<LockIcon style={{ fontSize: "14px" }} className="mr-[3px]"/> */}
              {/*Private <b className="mx-1">·</b> */} {favoritePlaceList.length} places
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-[14px] py-[14px]">
            {favoritePlaceList.length === 0 ? (
              <div className="px-[12px] py-[22px]">
                <span className={`flex text-[18px] ${theme === 'dark' ? 'text-white' : 'text-black'} font-sans font-medium tracking-wide text-center justify-center`}>
                  List is empty
                </span>
              </div>
            ) : (
              favoritePlaceList.map((place, index) => {
                //const isFavorite = place.isFavorite ?? true;
                return (
                  <div
                    key={index}
                    onClick={() => handleRecentPlaceClickResponsive(place)}
                    className={`w-full mb-[14px] transition-colors rounded-[16px] px-[12px] duration-200 cursor-pointer group 
                      ${recentSelectedPlace?.title === place.title
                        ? (theme === 'dark' ? "bg-gray-900" : "bg-gray-200")
                        : (theme === 'dark' ? "group hover:bg-gray-800" : "group hover:bg-gray-100")
                      }`}
                  >
                    <div className="flex items-center justify-between py-[10px]">
                      <div className="flex items-start gap-[16px]">
                        <div className="relative w-[64px] h-[64px]">
                          <Image
                            src={place.imageUrl || "/fallback.jpg"}
                            alt={place.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/fallback.jpg";
                            }}
                            width={64}
                            height={64}
                            unoptimized
                            className={`w-full h-full rounded-[10px] object-fit bg-white`}
                          />

                          <button
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setFavoritePlaceList((prevFavs) => {
                                const updatedFavs = prevFavs.filter((p) => p.title !== place.title);
                                localStorage.setItem("favorite_places", JSON.stringify(updatedFavs));
                                return updatedFavs;
                              });

                              setRecentPlaces((prev) => {
                                const updated = prev.map((p) =>
                                  p.title === place.title ? { ...p, isFavorite: false } : p
                                );
                                localStorage.setItem("recent_places", JSON.stringify(updated));
                                return updated;
                              });

                              setRecentSelectedPlace((prev) =>
                                prev && prev.title === place.title ? { ...prev, isFavorite: false } : prev
                              );
                            }}
                            className={`absolute -top-[22px] -left-[12px] w-[30px] h-[30px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'text-black bg-white hover:bg-[#f2f2f2]'} shadow-[0_2px_8px_rgba(0,0,0,0.3)] font-semibold text-[16px] 
                              transition-opacity duration-200 opacity-0 group-hover:opacity-100`}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex flex-col gap-[8px] max-w-[245px] leading-none">
                          <span className={`font-medium text-[16.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                            {place.title}
                          </span>

                          {place.rating ? (
                            <>
                              <span className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-x-[4px]`}>
                                <span>{place.rating}</span>
                                <StarRating rating={place.rating} />
                                {place.userRatingsTotal && (
                                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                    ({place.userRatingsTotal.toLocaleString()})
                                  </span>
                                )}
                                {place.priceText && (
                                  <>
                                    <span><b>·</b></span>
                                    <span>{place.priceText}</span>
                                  </>
                                )}
                              </span>

                              {place.category && (
                                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate pb-[2px]`}>
                                  {place.category}
                                </span>
                              )}
                            </>
                          ) : (
                            place.subtitle && (
                              <>
                                <span className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-x-[4px]`}>
                                  <span>{4.5}</span>
                                  <StarRating rating={4.5} />
                                  {place.userRatingsTotal && (
                                    <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                      (548)
                                    </span>
                                  )}
                                  {place.priceText || (
                                    <>
                                      <span className="hidden md:inline"><b>·</b></span>
                                      <span className="hidden md:inline">₹200 – 400</span>
                                    </>
                                  )}
                                </span>

                                {place.category && (
                                  <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate pb-[2px]`}>
                                    {place.category}
                                  </span>
                                )}
                              </>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/*Recents Sidebar*/}
      <div
        className={`fixed ${theme === 'dark' ? 'bg-[#131313] text-white' : 'bg-white text-black'} shadow-2xl z-30 transition-transform duration-300 flex flex-col
          bottom-0 left-0 md:top-0 md:left-[70px] w-full md:w-[410px] h-full md:translate-y-0
          ${topSidebar === "recent" ? "z-40" : "z-30"}
          ${topSidebar === "recent" ? "translate-y-0" : "translate-y-full"}
          ${topSidebar === 'recent' ? 'md:translate-x-0' : 'md:-translate-x-[410px]'}`}
      >
        {/*Search box for recent*/}
        {/*Top Part*/}
        <div className="pt-3 pb-[14px] border-b border-gray-300">
          <div className="relative px-[18px]" ref={recentSidebarSearchBoxRef}>
            <div
              className={`relative ${theme === 'dark' ? 'bg-[#393939] border-[#393939]' : 'bg-white border-gray-200'} border w-full md:w-[375px] ${showSidebarSuggestions ? "rounded-t-xl" : "rounded-full"
                }`}
            >
              <div className="flex items-center pl-6 pr-5 md:pr-4 py-[12px]">
                <input
                  ref={inputRef}
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Search Google Maps"
                  value={sidebarSearchValue}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      if (combinedList.length > 0) {
                        e.preventDefault();
                        setSidebarHighlightedIndex((prev) => {
                          if (prev < sidebarCombinedList.length - 1) return prev + 1;
                          return -1;
                        });
                      }
                      return;
                    }

                    if (e.key === "ArrowUp") {
                      if (combinedList.length > 0) {
                        e.preventDefault();
                        setSidebarHighlightedIndex((prev) => {
                          if (prev === -1) return sidebarCombinedList.length - 1;
                          return prev - 1;
                        });
                      }
                      return;
                    }

                    if (e.key === "Enter") {
                      const selectedItem = sidebarCombinedList[sidebarHighlightedIndex];

                      if (selectedItem) {
                        if (selectedItem.type === "recent") {
                          const shop = allShops.find((s) => s.name === selectedItem.data.title);
                          if (shop) {
                            handleShopSuggestion(shop, () => setPlaceSidebar("full"));
                          } else {
                            console.warn("Shop not found for recent item:", selectedItem.data.title);
                          }
                        } else if (selectedItem.type === "suggestion") {
                          const shop = allShops.find(
                            (s) => s.name === selectedItem.data.name
                          );
                          if (shop) {
                            handleShopSuggestion(shop, () => {
                              setPlaceSidebar("full");
                            });
                          }
                        } else if (selectedItem.type === "home") {
                          alert("Set Home clicked");
                        } else if (selectedItem.type === "more") {
                          exploreButtonFunction();
                        }
                        setShowSidebarSuggestions(false);
                      }
                      else if (sidebarSearchValue.trim()) {
                        const query = sidebarSearchValue.trim().toLowerCase();

                        if (!searchOrigin || searchOrigin !== "sidebar") {
                          setSearchOrigin("sidebar");
                        }

                        const filteredShops = allShops.filter(shop =>
                          shop.name.toLowerCase().includes(query)
                        );

                        if (filteredShops.length > 0) {
                          setRelatedPlaces(filteredShops)
                          setPlaceSidebar("half");
                        } else {
                          setRelatedPlaces([]);
                          setPlaceSidebar("half");
                        }
                        setShowSidebarSuggestions(false);
                      }
                    }
                  }}

                  onChange={(e) => {
                    const value = e.target.value;
                    setSidebarSearchValue(value);
                    setShowSidebarSuggestions(true);

                    if (!value.trim()) {
                      setSidebarSuggestions([]);
                      return;
                    }

                    const filtered = allShops.filter((shop) =>
                      shop.name.toLowerCase().includes(value.toLowerCase()) ||
                      shop.address.toLowerCase().includes(value.toLowerCase()) ||
                      shop.cuisine.toLowerCase().includes(value.toLowerCase())
                    );

                    setSidebarSuggestions(filtered.slice(0, 5));

                    setNoMatches(filtered.length === 0);
                  }}
                  onFocus={() => setShowSidebarSuggestions(true)}

                  className={`flex-1 outline-none border-none bg-transparent text-[14.5px] pr-[18px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                />
                <div
                  className="relative group"
                  onClick={() => {
                    setShowSidebarSuggestions(true);
                    inputRef.current?.focus();
                  }}
                >
                  <SearchIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} text-[22px] cursor-pointer`} />

                  <div
                    className="pointer-events-none absolute bottom-[-40px] left-[20px] -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] 
                    rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100"
                  >
                    Search
                  </div>
                </div>

                <div className="mr-[30px]" />

                <div className="relative group">
                  <div
                    className="w-[20px] h-[20px] bg-tranparent rounded-full flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setSidebarSearchValue("");
                      setSidebarSuggestions([]);
                      setIsLocationSelected(false);
                      setShowSidebarSuggestions(false);
                      setShowRecentDetailsSidebar(false);
                      setRecentSelectedPlace(null);
                      setTopSidebar(null);
                      closeCategoryMode();
                      clearCategoryMarkers();
                      if (placeSidebar === "full" && keepHalfSidebarOpen) {
                        setPlaceSidebar("half");
                        setKeepHalfSidebarOpen(true);
                        restoreCategoryView();
                      } else {
                        setPlaceSidebar(null);
                        setKeepHalfSidebarOpen(false);
                        closeCategoryMode();
                        resetMapForMobile();
                      }
                      if (placeSidebar === "half")
                      //if (placeSidebar === "half" || (placeSidebar === "full" && window.innerWidth < 768))
                      {
                        clearCategoryMarkers();
                      }
                      if (markerRef.current) {
                        markerRef.current.setMap(null);
                        markerRef.current = null;
                      }
                      if (sidebarMarkerRef.current) {
                        sidebarMarkerRef.current.setMap(null);
                        sidebarMarkerRef.current = null;
                      }
                      if (window.innerWidth < 768) {
                        setSidebarHeight(window.innerHeight * 0.5);
                      }

                      activePlaceMarkerRemover();
                      setNoMatches(false);
                    }}
                  >
                    <span className={`text-[18px] font-bold ${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'}`}>✕</span>
                  </div>
                  <div className="pointer-events-none absolute bottom-[-42px] left-1/2 -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100">
                    Close
                  </div>
                </div>
              </div>
            </div>
            {showSidebarSuggestions && (
              <div ref={recentSidebarSuggestionBoxRef} className="absolute top-full left-[18px] w-[calc(100%-36px)] md:w-[375px] z-40">
                <div className={`${theme === 'dark' ? 'bg-[#393939]' : 'bg-white '} shadow-lg rounded-b-xl border-t border-gray-200 py-[7px]`}>
                  {sidebarCombinedList.length > 0 && (
                    <>
                      <div className="flex flex-col space-y-[0px]">
                        {sidebarCombinedList.map((item, index) => {
                          const isHighlighted = sidebarHighlightedIndex === index;
                          const baseClass = `${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} cursor-pointer px-[12px] md:px-[16px] pt-[10px] pb-[12px] flex items-center justify-between 
                                             ${isHighlighted ? (theme === 'dark' ? "bg-gray-800" : "bg-gray-100") : ""}`;


                          const isInputEmpty = sidebarSearchValue.trim() === "";

                          if (item.type === "recent") {
                            const place = item.data as RecentPlace;
                            return (
                              <div
                                key={`recent-${place.lat}-${place.lng}-${place.timestamp}`}
                                className={`px-[14px] md:px-[20px] ${baseClass} group`}
                                onMouseDown={() => {
                                  setSidebarSearchValue(place.title);
                                  setShowSidebarSuggestions(true);

                                  const shop = allShops.find((s) => s.name === place.title);
                                  if (shop) {
                                    handleShopSuggestion(shop);
                                  } else {
                                    console.warn("Shop not found for recent place:", place.title);
                                  }
                                }}
                              >
                                <div className="flex bg-red-00 items-center justify-between w-full group">
                                  <div className={`flex bg-blue- items-center ${isInputEmpty ? "gap-[12px]" : "gap-[13px]"} overflow-hidden`}>
                                    {isInputEmpty ? (
                                      <div className={`md:w-10 md:h-10 ${theme === 'dark' ? 'bg-[#2a2b2f]' : 'bg-[#f2f2f2]'} rounded-full flex items-center justify-center`}>
                                        <AccessTimeIcon className={`${theme === 'dark' ? 'text-white' : 'text-black'} w-6 h-6`} />
                                      </div>
                                    ) : (
                                      <div className="py-[8px] bg-transparent flex items-center justify-center">
                                        <AccessTimeIcon className={`w-9 h-9 ${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: "21px" }} />
                                      </div>
                                    )}

                                    {isInputEmpty ? (
                                      <div className="flex flex-col max-w-[80%] md:max-w-[240px]">
                                        <span className={`font-medium text-[14.5px]  ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                                          {place.title}
                                        </span>
                                        {place.subtitle && (
                                          <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'} text-[14px] truncate`}>
                                            {place.subtitle}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className={`text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} font-medium truncate`}>
                                        {place.title}
                                        {place.subtitle && (
                                          <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} font-normal pl-[6px]`}>{place.subtitle}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {isInputEmpty && (
                                    <button
                                      tabIndex={-1}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setRecentPlaces((prev) => {
                                          const updated = prev.filter(
                                            (p) => !(p.lat === place.lat && p.lng === place.lng)
                                          );
                                          localStorage.setItem("recent_places", JSON.stringify(updated));
                                          return updated;
                                        });
                                      }}
                                      className={`opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all duration-150 px-[8px] py-[4px] font-bold text-[14px] cursor-pointer rounded-full ${theme === 'dark' ? 'text-white hover:bg-[#2a2b2f]' : 'text-black hover:bg-gray-200'}`}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "suggestion") {
                            const shop = item.data;
                            return (
                              <div
                                key={shop.shopId}
                                className={baseClass}
                                onMouseDown={() => handleShopSuggestion(shop)}
                              >
                                <div className="flex items-center gap-[10px] overflow-hidden">
                                  <div className="w-9 h-9 bg-transparent rounded-full flex items-center justify-center">
                                    <LocationOnIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'}`} style={{ fontSize: "21px" }} />
                                  </div>
                                  <span className={`font-medium tracking-wide text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} truncate w-full`}>
                                    {shop.name}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "more") {
                            return (
                              <div
                                key="more"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  exploreButtonFunction();
                                  setShowSidebarSuggestions(false);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  exploreButtonFunction();
                                  setShowSidebarSuggestions(false);
                                }}
                                className={` px-[12px] py-[12px] flex items-center justify-center cursor-pointer 
                                  ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} 
                                  ${sidebarHighlightedIndex === index
                                    ? (theme === 'dark' ? "bg-gray-800 text-white" : "bg-gray-100 text-[#007B8A]")
                                    : (theme === 'dark' ? "text-white" : "text-white")
                                  }`}
                              >
                                <span className="text-[14.5px] tracking-wide font-medium">
                                  See all shops list
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </>
                  )}
                  {noMatches && (
                    <div className={`px-[20px] py-[12px] text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      <p className={`font-medium text-[15px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Sorry, can&apos;t find that place name.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/*Grouping Part*/}
          <div className="mt-[17px] flex flex-col gap-[14px] relative ml-[26px] mr-[24px]">
            <span className={`text-[19.5px] font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Recents</span>

            {groupTags.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center mb-[8px]">
                <>
                  <span
                    onClick={() => setSelectedTags([])}
                    className={`text-[14px] rounded-[10px] tracking-wider py-[6px] gap-[3px] cursor-pointer flex items-center ${selectedTags.length === 0
                      ? "pl-[6px] pr-[12px] bg-gray-300 text-black"
                      : "px-[12px] bg-gray-200 text-black"
                      }`}
                  >
                    {selectedTags.length === 0 && <CheckIcon style={{ fontSize: "16px" }} />} All
                  </span>

                  {groupTags.map((tag, i) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <span
                        key={i}
                        onClick={() =>
                          setSelectedTags((prev) =>
                            isSelected
                              ? prev.filter((t) => t !== tag.name)
                              : [...prev, tag.name]
                          )
                        }
                        className={`text-[14px] rounded-[10px] pl-[10px] pr-[14px] py-[6px] cursor-pointer flex items-center gap-[6px] ${isSelected
                          ? "bg-gray-300 text-black"
                          : "bg-gray-200 text-black"
                          }`}
                      >
                        {isSelected ? (<CheckIcon style={{ fontSize: "16px" }} />) : (<LocationOnIcon style={{ fontSize: "16px" }} />)}
                        {tag.name} {tag.count}
                      </span>
                    );
                  })}
                </>
              </div>
            )}
          </div>
        </div>

        {/* Recent Places */} {/*Middle Part*/}
        <div className="overflow-y-auto flex-1 px-[14px]">
          <div className="px-[12px] pt-[21px] pb-[14px]">
            <span className={`text-[17px] font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Last 3 days ({filteredPlaces.length})
            </span>
          </div>

          {filteredPlaces.map((place, index) => {
            //const isSelected = selectedPlaceTitles.includes(place.title);
            const isFavorite = recentPlaces.find((p) => p.title === place.title)?.isFavorite ?? favoritePlaceList.some((p) => p.title === place.title);

            return (
              <div
                key={index}
                /*onClick={() => handleDetailsRecentPlaceClick(place)} */
                onClick={() => handleRecentPlaceClickResponsive(place)}
                className={`w-full bg-transparent mb-[14px] transition-colors rounded-[16px] px-[12px] duration-200 cursor-pointer group 
                  ${recentSelectedPlace?.title === place.title
                    ? (theme === 'dark' ? "bg-[#131313]" : "bg-gray-200")
                    : (theme === 'dark' ? "group hover:bg-gray-800" : "group hover:bg-gray-100")
                  }`}
              >
                <div className="flex items-center justify-between py-[10px]">
                  <div className="flex items-start gap-[14px]">
                    <div className="relative w-[64px] h-[64px]">
                      <Image
                        src={place.imageUrl || "/fallback.jpg"}
                        alt={place.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/fallback.jpg";
                        }}
                        width={64}
                        height={64}
                        unoptimized
                        className="w-full h-full rounded-[10px] object-fit bg-white"
                      />

                      <button
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setRecentPlaces((prev) => {
                            const updated = prev.filter((_, i) => i !== index);
                            localStorage.setItem("recent_places", JSON.stringify(updated));
                            return updated;
                          });
                          setSelectedPlaceTitles((prevSelected) =>
                            prevSelected.filter((title) => title !== place.title)
                          );
                        }}
                        className={`absolute cursor-pointer -top-[22px] -left-[12px] w-[30px] h-[30px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'text-black bg-white hover:bg-[#f2f2f2]'} shadow-[0_2px_8px_rgba(0,0,0,0.3)] text-black font-semibold text-[16px] 
                          transition-opacity duration-200 opacity-0 group-hover:opacity-100`}
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-col gap-[8px] responsive-width leading-none">
                      <span className={`font-medium text-[16.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                        {place.title}
                      </span>

                      {place.rating ? (
                        <>
                          <span className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-x-[4px]`}>
                            <span>{place.rating}</span>
                            <StarRating rating={place.rating} />
                            {place.userRatingsTotal && (
                              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                ({place.userRatingsTotal.toLocaleString()})
                              </span>
                            )}
                            {place.priceText && (
                              <>
                                <span className="hidden md:inline"><b>·</b></span>
                                <span className="hidden md:inline">₹{place.priceText}</span>
                              </>
                            )}
                          </span>

                          {place.category && (
                            <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate pb-[2px]`}>
                              {place.category}
                            </span>
                          )}
                        </>
                      ) : (
                        place.subtitle && (
                          /*
                          <span className="text-gray-600 text-[14.5px] truncate">
                            {place.subtitle !== place.title
                              ? `${place.title}, ${place.subtitle}`
                              : place.subtitle}
                          </span>
                          */

                          <>
                            <span className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-x-[4px]`}>
                              <span>{4.5}</span>
                              <StarRating rating={4.5} />
                              {place.userRatingsTotal && (
                                <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                  (548)
                                </span>
                              )}
                              {place.priceText || (
                                <>
                                  <span className="hidden md:inline"><b>·</b></span>
                                  <span className="hidden md:inline">₹200 – 400</span>
                                </>
                              )}
                            </span>

                            {place.category && (
                              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate pb-[2px]`}>
                                {place.category}
                              </span>
                            )}
                          </>
                        )
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-[14px] pr-[4px]">
                    <div className="relative group/fav">
                      <button
                        onMouseDown={(e) => {
                          e.stopPropagation();

                          const newFavoriteStatus = !isFavorite;

                          setRecentPlaces((prev) => {
                            const updated = prev.map((p, i) =>
                              i === index ? { ...p, isFavorite: newFavoriteStatus } : p
                            );
                            localStorage.setItem("recent_places", JSON.stringify(updated));
                            return updated;
                          });

                          setFavoritePlaceList((prevFavs) => {
                            let updatedFavs;
                            if (!newFavoriteStatus) {
                              updatedFavs = prevFavs.filter((p) => p.title !== place.title);
                            } else {
                              updatedFavs = [{ ...place, isFavorite: true }, ...prevFavs];
                            }
                            localStorage.setItem("favorite_places", JSON.stringify(updatedFavs));
                            return updatedFavs;
                          });

                          setRecentSelectedPlace((prev) =>
                            prev && prev.title === place.title
                              ? { ...prev, isFavorite: newFavoriteStatus }
                              : prev
                          );

                          setFullSidebarSelectedPlace((prev) =>
                            prev && prev.title === place.title ? { ...prev, isFavorite: newFavoriteStatus } : prev
                          );
                        }}
                        className="cursor-pointer rounded-full transition"
                      >
                        {isFavorite ? (
                          <FavoriteIcon className="text-red-500" style={{ fontSize: "22px" }} />
                        ) : (
                          <FavoriteBorderIcon className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: "22px" }} />
                        )}
                      </button>

                      <span className="absolute left-[-25px] top-[35px] -translate-y-1/2 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover/fav:opacity-100 whitespace-nowrap transition z-50">
                        {isFavorite ? "Remove" : "Favorite"}
                      </span>
                    </div>

                    <div className="relative group/dl">
                      <button
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppDownload(place);
                        }}
                        className="cursor-pointer  rounded-full transition"
                      >
                        <HiDownload className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: "22px" }} />
                      </button>
                      <span className="absolute left-[-25px] top-[35px] -translate-y-1/2 bg-black text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover/dl:opacity-100 whitespace-nowrap transition">
                        Order Now
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Sidebar */}
      <div
        className={`fixed top-[52%] -translate-y-1/2 left-[0px] md:left-[500px] h-[90%] ${theme === 'dark' ? 'md:bg-[#131313] text-white' : 'md:bg-white text-black'} shadow-2xl z-30 transition-transform duration-300 w-[360px] rounded-[20px] flex flex-col ${showRecentDetailsSidebar ? "translate-x-0" : "-translate-x-[790px]"
          }`}
      >
        <div ref={stickyScrollRef} className="overflow-y-auto h-full rounded-[20px] relative">

          {detailsActiveTab === "overview" && showStickyHeader && (
            <div className={`sticky top-0 left-0 w-full h-[58px] ${theme === 'dark' ? 'md:bg-[#131313] text-white' : 'md:bg-white text-black'} rounded-t-[20px] z-20 flex items-center justify-between transition-opacity duration-200  shadow-[0px_1px_2px_rgba(0,0,0,0.4)]`}>
              <h2 className="font-medium text-[17.5px] truncate pointer-events-none tracking-wide pl-[18px] max-w-[80%]">
                {recentSelectedPlace?.title}
              </h2>
              <button
                onClick={() => {
                  setShowRecentDetailsSidebar(false);
                  setRecentSelectedPlace(null);
                }}
                className={`absolute right-4 w-[34px] h-[34px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'text-white hover:bg-[#2a2b2f]' : 'text-black hover:bg-gray-200'} text-[18px] font-bold cursor-pointer`}
              >
                ✕
              </button>
            </div>
          )}

          {detailsActiveTab === "overview" && (
            <>
              <div className="relative w-full h- bg-gray-200 rounded-t-[20px] overflow-hidden">
                <Image
                  src={recentSelectedPlace?.imageUrl || "/fallback.jpg"}
                  alt={recentSelectedPlace?.title || "Place"}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/fallback.jpg";
                  }}
                  width={800}
                  height={400}
                  unoptimized
                  className="w-full h-full object-fit rounded-t-[20px]"
                />

                <button
                  onClick={() => {
                    setShowRecentDetailsSidebar(false);
                    setRecentSelectedPlace(null);
                  }}
                  className="absolute top-[14px] right-4 w-[34px] h-[34px] flex items-center justify-center rounded-full bg-white hover:bg-gray-200 shadow-md text-black text-[18px] font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="pt-[14px] px-[24px] flex flex-col gap-[2px] max-w-[360px]">
                <span className={`font-medium text-[21.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                  {recentSelectedPlace?.title}
                </span>

                {recentSelectedPlace?.nativeName && (
                  <span className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                    {recentSelectedPlace?.nativeName}
                  </span>
                )}

                {recentSelectedPlace?.rating ? (
                  <>
                    <span className={`mt-[2px] text-[13.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-[4px]`}>
                      <span>{recentSelectedPlace?.rating}</span>
                      <StarRating rating={recentSelectedPlace?.rating} />
                      {recentSelectedPlace?.userRatingsTotal && (
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                          ({recentSelectedPlace?.userRatingsTotal.toLocaleString()})
                        </span>
                      )}
                      {recentSelectedPlace?.priceText && (
                        <>
                          <span><b>·</b></span>
                          <span>₹{recentSelectedPlace?.priceText}</span>
                        </>
                      )}
                    </span>

                    {recentSelectedPlace?.category && (
                      <span className={`mt-[2px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate`}>
                        {recentSelectedPlace?.category}
                      </span>
                    )}
                  </>
                ) : (
                  recentSelectedPlace?.subtitle && (
                    /*
                    <span className="text-gray-600 text-[14.5px] truncate pt-[2px]">
                      {recentSelectedPlace.subtitle}
                    </span>
                    */
                    <>
                      <span className={`mt-[2px] text-[13.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-[4px]`}>
                        <span>{4.5}</span>
                        <StarRating rating={4.5} />
                        {recentSelectedPlace?.userRatingsTotal || (
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                            (548)
                          </span>
                        )}
                        {recentSelectedPlace?.priceText && (
                          <>
                            <span><b>·</b></span>
                            <span>₹200 – 400</span>
                          </>
                        )}
                      </span>

                      {recentSelectedPlace?.category && (
                        <span className={`mt-[2px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate`}>
                          {recentSelectedPlace?.category}
                        </span>
                      )}
                    </>
                  )
                )}
              </div>
            </>
          )}

          {detailsActiveTab !== "overview" && (
            <div className={`sticky top-0 z-30 ${theme === 'dark' ? 'md:bg-[#131313]' : 'md:bg-white'}`}>
              <div className={`relative top-0 left-0 w-full pt-[18px] pb-[16px]  ${theme === 'dark' ? 'md:bg-[#131313] text-white' : 'md:bg-white text-black'} rounded-t-[20px] z-20 flex items-center justify-between text-black transition-opacity duration-200`}>
                <button
                  onClick={() => {
                    setDetailsActiveTab("overview");
                  }}
                  className={`absolute left-4 w-[34px] h-[34px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'text-white' : 'text-black hover:bg-gray-200'} cursor-pointer`}
                >
                  <ArrowLeft size={22} strokeWidth={2} />
                </button>
                <h2 className="font-medium text-[17.5px] truncate pointer-events-none tracking-wide mx-auto text-center max-w-[220px]">
                  {recentSelectedPlace?.title}
                </h2>
                <button
                  onClick={() => {
                    setShowRecentDetailsSidebar(false);
                    setRecentSelectedPlace(null);
                  }}
                  className={`absolute right-4 w-[34px] h-[34px] flex items-center justify-center rounded-full  ${theme === 'dark' ? 'text-white hover:bg-[#2a2b2f]' : 'text-black hover:bg-gray-200'} text-[18px] font-bold cursor-pointer`}
                >
                  ✕
                </button>
              </div>

              <div className={`flex justify-around border-b ${theme === 'dark' ? 'bg-[#131313] border-gray-200' : 'bg-white border-gray-400'}`}>
                {detailsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`relative py-[10px] text-[14px] tracking-wide font-medium${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-600 hover:text-black'} cursor-pointer`}
                    onClick={() => setDetailsActiveTab(tab.id)}
                  >
                    {tab.label}
                    {detailsActiveTab === tab.id && (
                      <span className={`absolute bottom-0 left-0 w-full h-[2px] ${theme === 'dark' ? 'bg-[#9dedfb]' : 'bg-[#007B8A]'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {detailsActiveTab === "overview" && (
            <>
              <div className={`flex justify-around px-[4px] border-b ${theme === 'dark' ? 'bg-[#131313] border-gray-200' : 'bg-white border-gray-400'}`}>
                {detailsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`relative py-[10px] text-[14px] tracking-wide font-medium ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-600 hover:text-black'} mt-[6px] cursor-pointer`}
                    onClick={() => setDetailsActiveTab(tab.id)}
                  >
                    {tab.label}
                    {detailsActiveTab === tab.id && (
                      <span className={`absolute bottom-0 left-0 w-full h-[2px] ${theme === 'dark' ? 'bg-[#9dedfb]' : 'bg-[#007B8A]'}`} />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className={`pb-[14px] text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
            ${detailsActiveTab === "menu" ? "pt-[8px]" : "pt-[14px]"}`}
          >
            {detailsActiveTab === "overview" && (
              <>
                <div className={`flex justify-around px-[12px] pb-[12px] border-b border-gray-300 ${theme === 'dark' ? 'bg-[#131313]' : 'bg-white'}`}>
                  {/*
                  <button 
                    onClick={() => {
                      setShowRecentDetailsSidebar(false);
                      setTopSidebar(null);
                      setShowSidebar(true);

                      if (recentSelectedPlace) {
                        setDestinationLocation(recentSelectedPlace.title);
                        setDestinationCoords({
                          lat: recentSelectedPlace.lat,
                          lng: recentSelectedPlace.lng,
                        });
                      }
                    }}
                    className="flex flex-col items-center text-[12.5px] tracking-wide text-gray-700 hover:text-black cursor-pointer"
                  >
                    <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-[#007B8A] mb-[7px]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="21px"
                        height="21px"
                        fill="white"
                      >
                        <path d="M17.17,11l-1.59,1.59L17,14l4-4l-4-4l-1.41,1.41L17.17,9L9,9c-1.1,0-2,0.9-2,2v9h2v-9L17.17,11z" />
                      </svg>
                    </div>
                    Directions
                  </button>
                  */}

                  <button
                    onClick={() => {
                      if (!recentSelectedPlace) return;

                      setFavoritePlaceList((prevFavs) => {
                        let updatedFavs;
                        let isNowFavorite;

                        if (recentSelectedPlace.isFavorite) {
                          updatedFavs = prevFavs.filter((p) => p.title !== recentSelectedPlace.title);
                          isNowFavorite = false;
                        } else {
                          const alreadyExists = prevFavs.some((p) => p.title === recentSelectedPlace.title);
                          updatedFavs = alreadyExists
                            ? prevFavs
                            : [{ ...recentSelectedPlace, isFavorite: true }, ...prevFavs];
                          isNowFavorite = true;
                        }

                        localStorage.setItem("favorite_places", JSON.stringify(updatedFavs));

                        setRecentPlaces((prev) =>
                          prev.map((p) =>
                            p.title === recentSelectedPlace.title
                              ? { ...p, isFavorite: isNowFavorite }
                              : p
                          )
                        );

                        setRecentSelectedPlace((prev) =>
                          prev ? { ...prev, isFavorite: isNowFavorite } : prev
                        );

                        setFullSidebarSelectedPlace((prev) =>
                          prev && prev.title === recentSelectedPlace.title
                            ? { ...prev, isFavorite: isNowFavorite }
                            : prev
                        );

                        return updatedFavs;
                      });
                    }}
                    className={`flex flex-col items-center text-[12.5px] tracking-wide ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-700 hover:text-black'} cursor-pointer`}
                  >
                    <div className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} mb-[6px]`}>
                      {favoritePlaceList.some((p) => p.title === recentSelectedPlace?.title) ? (
                        <FavoriteIcon style={{ fontSize: "22px" }} className="text-red-500" />
                      ) : (
                        <FavoriteBorderIcon style={{ fontSize: "22px" }} className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-medium`} />
                      )}
                    </div>
                    {favoritePlaceList.some((p) => p.title === recentSelectedPlace?.title) ? "Remove" : "Favorite"}
                  </button>

                  <button
                    aria-label={`Download "${recentSelectedPlace?.title}" app`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (recentSelectedPlace) {
                        handleAppDownload(recentSelectedPlace);
                      }
                    }}
                    className={`flex flex-col items-center text-[12.5px] tracking-wide ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-700 hover:text-black'} cursor-pointer`}>
                    <div className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} mb-[6px]`}>
                      <HiDownload style={{ fontSize: "22px" }} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                    </div>
                    Order Now
                  </button>

                  <div className="relative group">
                    <button
                      onClick={handleLocationShare}
                      className={`flex flex-col items-center text-[12.5px] tracking-wide ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-700 hover:text-black'} cursor-pointer`}
                    >
                      <div className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} mb-[6px]`}>
                        <Share2 size={18} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                      </div>
                      Share
                    </button>
                  </div>
                </div>

                {/*
                <div
                  onClick={() => {
                    setDetailsActiveTab("about");
                  }}
                  className="flex items-center justify-between px-[22px] py-[18px] border-b border-gray-300 bg-white hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center text-[14px] tracking-wide text-gray-800 flex-wrap">
                    <CheckIcon style={{ fontSize: "19px" }} className="text-green-600" />
                    <span className="ml-[3px]">Dine-in</span>
                    <span className="mx-[6px]"><b>·</b></span>

                    <CheckIcon style={{ fontSize: "19px" }} className="text-green-600" />
                    <span className="ml-[3px]">Takeaway</span>
                    <span className="mx-[6px]"><b>·</b></span>

                    <CheckIcon style={{ fontSize: "19px" }} className="text-green-600" />
                    <span className="ml-[3px]">Delivery</span>
                  </div>

                  <ChevronRightIcon className="text-gray-600" />
                </div>
                */}

                <div className={`pt-[14px] pb-[16px] border-b border-gray-300 ${theme === 'dark' ? 'bg-[#131313]' : 'bg-white'}`}>
                  <div className={`group relative w-full flex items-start pl-[24px] pr-[16px] py-2 ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} cursor-pointer`}>
                    <LocationOnIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} mr-[24px] mt-[2px]`} />

                    <p className={`flex-1 text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-800'} leading-snug tracking-wide`}>
                      {recentSelectedPlace?.fullAddress || "Address not available"}
                    </p>

                    <button
                      onClick={handleAddressCopy}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-[6px] cursor-pointer"
                    >
                      <ContentCopyIcon style={{ fontSize: "18px" }} className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />

                      <span className="absolute left-0 top-[36px] bg-black text-white text-[12px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition tracking-wide">
                        Copy address
                      </span>
                    </button>

                    {addressCopied && (
                      <span className="absolute right-0 -top-[22px] bg-black text-white text-[12px] px-[6px] py-[4px] tracking-wide rounded">
                        Copied to clipboard
                      </span>
                    )}
                  </div>

                  <div className={`w-full flex items-center px-[24px] py-2 ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} cursor-pointer`}>
                    <AccessTimeIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} mr-[24px] font-bold`} />
                    <p className={`flex-1 text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-800'} tracking-wide`}>
                      {recentSelectedPlace?.openCloseTiming ? (
                        <>
                          {(() => {
                            const [openTime, closeTime] = recentSelectedPlace.openCloseTiming.split("–");
                            return (
                              <>
                                Open {openTime.trim()} <b>·</b> <span className={`${theme === 'dark' ? 'text-red-300' : 'text-red-500'}`}>Closes {closeTime?.trim() || "soon"}</span>
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <span>Open 10am <b>·</b> <span className={`${theme === 'dark' ? 'text-red-300' : 'text-red-500'}`}>Closes 10pm</span></span>
                      )}
                    </p>
                  </div>

                  <button className={`w-full flex items-center px-[24px] py-2 ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} rounded-none`}>
                    <PaymentsIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} mr-[24px]`} />
                    <div className="flex flex-col">
                      <p className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-800'} tracking-wide`}> {recentSelectedPlace?.priceText || "₹200 – 400"} per person</p>
                    </div>
                  </button>

                  {/* 
                  <div className="group relative w-full flex items-center pl-[24px] pr-[16px] py-2 hover:bg-gray-100 cursor-pointer">
                    <AdjustIcon className="text-[#007B8A] mr-[24px]" />

                    <p className="flex-1 text-[14px] text-gray-800 leading-snug tracking-wide">
                      {recentSelectedPlace?.plusCode || "Plus code not available"}
                    </p>

                    <button
                      onClick={handlePlusCodeCopy}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-[6px] cursor-pointer"
                    >
                      <ContentCopyIcon style={{fontSize:"18px"}} className="text-gray-600" />

                      <span className="absolute left-0 top-[32px] bg-black text-white text-[12px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition tracking-wide">
                        Copy plus code
                      </span>
                    </button>

                    {plusCodeCopied && (
                      <span className="absolute right-0 -top-[24px] bg-black text-white text-[12px] px-[6px] py-[4px] tracking-wide rounded">
                        Copied to clipboard
                      </span>
                    )}
                  </div>

                  <button className="w-full flex items-center px-[24px] py-2 hover:bg-gray-100 rounded-none">
                    <SecurityIcon className="text-[#007B8A] mr-[24px]" />
                    <p className="text-[14px] tracking-wide text-gray-800">Claim this business</p>
                  </button>

                  <button className="w-full flex items-center px-[24px] py-2 hover:bg-gray-100 rounded-none">
                    <HistoryIcon className="text-[#007B8A] mr-[24px]" />
                    <p className="text-[14px] tracking-wide text-gray-800">Your Maps activity</p>
                  </button>

                  <button className="w-full flex items-center px-[24px] py-2 hover:bg-gray-100 rounded-none">
                    <LabelIcon className="text-[#007B8A] mr-[24px]" />
                    <p className="text-[14px] tracking-wide text-gray-800">Add a label</p>
                  </button>

                  <button className="w-1/2 mt-[16px] mx-auto flex items-center justify-center py-[10px] rounded-full bg-[#CCF3F9] hover:bg-gray-100 text-black text-[14px] tracking-wide font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="black"
                      className="w-4 h-4 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                    Suggest an edit
                  </button>
                  */}
                </div>

                {/* 
                <div className="bg-white py-[14px] border-b border-gray-300">
                  <h3 className="text-[16px] font-sans font-medium tracking-wide text-black mb-[14px] px-[24px]">
                    Add missing information
                  </h3>

                  <div className="cursor-pointer hover:bg-gray-100 p-2 ">
                    <div className="px-[16px] flex items-center gap-[24px]">
                      <CallIcon style={{fontSize:"24px"}} className="text-gray-600" />
                      <span className="text-[14.5px] tracking-wide text-gray-800">Add place's phone number</span>
                    </div>
                  </div>

                  <div className="cursor-pointer hover:bg-gray-100 p-2">
                    <div className="px-[16px] flex items-center gap-[24px]">
                      <AccessTimeIcon style={{fontSize:"24px"}} className="text-gray-600" />
                      <span className="text-[14.5px] tracking-wide text-gray-800">Add hours</span>
                    </div>
                  </div>

                  <div className="cursor-pointer hover:bg-gray-100 p-2">
                    <div className="px-[16px] flex items-center gap-[24px]">
                      <PublicIcon style={{fontSize:"24px"}} className="text-gray-600" />
                      <span className="text-[14.5px] tracking-wide text-gray-800">Add website</span>
                    </div>
                  </div>
                </div>
                */}

                <div className="py-[14px] border-b border-gray-300">
                  {(recentSelectedPlace?.photos?.length ?? 0) > 0 && (
                    <div>
                      <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] px-[24px] md:px-[26px] mb-[10px]`}>
                        Menu & highlights
                      </h2>

                      <div className="flex gap-3 mt-[18px] overflow-x-auto px-[16px]">
                        {recentSelectedPlace?.photos?.slice(0, 2).map((url: string, idx: number) => (
                          <div key={idx} className="relative min-w-[150px]">
                            <Image
                              src={url}
                              alt={`Menu highlight ${idx + 1}`}
                              width={160}
                              height={180}
                              unoptimized
                              className="w-[160px] h-[180px] object-fit rounded-lg bg-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-[16px] flex justify-center">
                        <button
                          onClick={() => setDetailsActiveTab("menu")}
                          className={`${theme === 'dark' ? 'text-white md:text-[#9dedfb] md:hover:text-white' : 'text-black md:text-[#007B8A] md:hover:text-black'} font-sans text-[14px] font-medium tracking-wide`}
                        >
                          See more
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-[14px] pb-[7px]">
                  <div className="px-[24px] pb-[18px] border-b border-gray-300">
                    <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] mb-[10px]`}>
                      Review summary
                    </h2>
                    <div className="flex items-center justify-between mt-[14px]">
                      {(() => {
                        const userRatingsTotal = recentSelectedPlace?.userRatingsTotal ?? 4.5;
                        const breakdown: Record<number, number> =
                          recentSelectedPlace?.ratingBreakdown as Record<number, number> ||
                          (() => {
                            if (!userRatingsTotal) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                            const base = userRatingsTotal;
                            const five = base - 0.3;
                            const four = base - 0.6;
                            const three = base - 1.5;
                            const two = base - 1;
                            const one = 2;

                            return { 5: five, 4: four, 3: three, 2: two, 1: one };
                          })();

                        return (
                          <div className="flex flex-col gap-[3px] w-[200px]">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = breakdown[star] || 0;
                              const total = userRatingsTotal || 1;
                              const percent = (count / total) * 100;

                              return (
                                <div key={star} className="flex items-center gap-2 text-[14px]">
                                  <span className={`w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{star}</span>
                                  <div className="flex-1 h-2 bg-gray-200 rounded">
                                    <div
                                      className="h-2 bg-yellow-400 rounded"
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                      <div className="flex flex-col items-center gap-[6px]">
                        <span className={`text-[42px] leading-none font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {recentSelectedPlace?.rating?.toFixed(1)}
                        </span>
                        <StarRating rating={recentSelectedPlace?.rating || 4.5} />
                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'} text-[12.5px]`}>
                          {/*{recentSelectedPlace?.userRatingsTotal?.toLocaleString()} reviews*/}
                        </span>
                      </div>
                    </div>

                    <div className="mt-[22px] flex justify-center">
                      <button className={`flex items-center gap-2 px-[14px] py-2 rounded-full ${theme === 'dark' ? 'bg-[#00373e] text-white' : 'bg-[#CCF3F9] hover:bg-gray-100 text-black'} font-medium text-[14.5px] tracking-wide`}>
                        <RateReviewIcon style={{ fontSize: "18px" }} />
                        Write a review
                      </button>
                    </div>
                  </div>
                  {recentSelectedPlace?.reviews && recentSelectedPlace.reviews.length > 0 && (
                    <div>
                      <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] px-[24px] mt-[16px]`}>
                        Reviews
                      </h2>
                      {recentSelectedPlace.reviews.slice(0, 2).map((review, index) => (
                        <div
                          key={index}
                          className="border-b last:border-b-0 border-gray-300 pt-[16px] pb-[18px] last:pb-0 flex gap-3"
                        >
                          <div className="px-[24px]">
                            <div className="flex items-center gap-[12px]">
                              <Image
                                src={
                                  review.profile_photo_url
                                    ? review.profile_photo_url.replace("http://", "https://")
                                    : "https://www.gravatar.com/avatar/?d=mp&s=40"
                                }
                                alt={review.author_name}
                                width={36}
                                height={36}
                                unoptimized
                                onError={(e) => {
                                  e.currentTarget.src = "https://www.gravatar.com/avatar/?d=mp&s=40";
                                }}
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <span className={`font-medium text-[16px] tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                {review.author_name}
                              </span>
                            </div>

                            <div className="flex items-center gap-[10px] mt-[12px]">
                              <StarRating rating={review.rating ?? 0} />
                              <span className={`text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                {review.relative_time_description}
                              </span>
                            </div>

                            {review.text && (
                              <p className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mt-[6px]`}>
                                {review.text}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-[14px] flex justify-center">
                    <button
                      onClick={() => setDetailsActiveTab("reviews")}
                      className={`${theme === 'dark' ? 'text-white md:text-[#9dedfb] md:hover:text-white' : 'text-black md:text-[#007B8A] md:hover:text-black'} font-sans text-[14px] font-medium tracking-wide`}
                    >
                      More reviews
                    </button>
                  </div>
                </div>
              </>
            )}

            {/*
            {detailsActiveTab === "menu" && (
              <div>
                <h2 className="font-sans font-medium tracking-wide text-black text-[16px] mt-[4px] px-[24px]">Menu</h2>

                {recentSelectedPlace?.photos?.length ? (
                  <div className="grid grid-cols-2 gap-3 mt-[16px] px-[14px]">
                    {recentSelectedPlace.photos.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Menu photo ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 tracking-wide mt-[10px] px-[24px]">No menu photos available.</p>
                )}
              </div>
            )}
            */}

            {detailsActiveTab === "menu" && (
              <>
                {availableDSTabs.length > 1 && (
                  <div className={`flex flex-nowrap justify-evenly gap-[12px] md:gap-[14px] px-[20px] md:px-[24px] overflow-x-auto scrollbar-hide pb-[8px] border-b ${theme === 'dark' ? 'bg-[#131313] border-gray-200' : 'bg-white border-gray-400'}`}>
                    {availableDSTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setmenuActiveDSTab(tab.key)}
                        className={`px-[10px] py-[6px] md:py-2 text-[13px] md:text-[14px] rounded-[10px] transition-all duration-200 cursor-pointer font-sans font-medium tracking-wide whitespace-nowrap
                          ${menuActiveDSTab === tab.key ? (theme === 'dark' ? "bg-[#2a2b2f]" : "bg-gray-300") : "bg-transparent"}
                          ${theme === 'dark' ? (menuActiveDSTab === tab.key ? "text-white" : "text-gray-200") : (menuActiveDSTab === tab.key ? "text-black" : "text-gray-600")}
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-0">
                  {menuActiveDSTab === "overview" && overviewDSImages.length > 0 && (
                    <>
                      <div className="border-b border-gray-300 pb-[20px]">
                        <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] my-[14px] px-[24px] md:px-[26px]`}>
                          Menu
                        </h2>

                        <div className="relative w-full px-[0px] md:px-[2px] group">
                          {menuDSImages.length > 2 && (
                            <button
                              onClick={() => {
                                if (menuDSScrollRef.current) {
                                  menuDSScrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
                                }
                              }}
                              className={`absolute left-[12px] top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'bg-white text-black'} rounded-full shadow-md p-2 transition-all duration-200 cursor-pointer
                                  lg:opacity-0 lg:group-hover:opacity-100 ${menuDSLeftArrow ? "block" : "hidden"}`}
                            >
                              <ChevronLeft size={20} />
                            </button>
                          )}
                          <div
                            ref={menuDSScrollRef}
                            onScroll={handleDSMenuScroll}
                            className="flex overflow-x-auto gap-[12px] md:gap-[10px] scroll-smooth scrollbar-hide pl-[24px]"
                          >
                            {menuDSImages.map((url, idx) => (
                              <Image
                                key={idx}
                                src={url}
                                alt={`Overview photo ${idx + 1}`}
                                width={130}
                                height={130}
                                unoptimized
                                className="flex-shrink-0 w-[130px] h-[130px] md:w-[120px] md:h-[120px] object-fit bg-white rounded-lg mr-[0px] last:mr-[24px]"
                              />
                            ))}
                          </div>
                          {menuDSImages.length > 2 && (
                            <button
                              onClick={() => {
                                if (menuDSScrollRef.current) {
                                  menuDSScrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
                                }
                              }}
                              className={`absolute right-[14px] top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'bg-white text-black'} rounded-full shadow-md p-2 transition-all duration-200 cursor-pointer
                                lg:opacity-0 lg:group-hover:opacity-100 ${menuDSRightArrow ? "block" : "hidden"}`}
                            >
                              <ChevronRight size={20} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] mt-[18px] mb-[16px] px-[24px] md:px-[26px]`}>Highlights</h2>
                        <div className="grid grid-cols-2 gap-3 px-[24px] md:px-[26px]">
                          {highlightDSImages.map((url, idx) => (
                            <Image
                              key={idx}
                              src={url}
                              alt={`Overview photo ${idx + 1}`}
                              width={600}
                              height={240}
                              unoptimized
                              className="w-full h-56 md:h-60 object-fit bg-white rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {menuDSCategories.map((cat) => {
                    const showItems = Array.isArray(cat.items) && cat.items.length > 0;
                    if (!showItems) return null;
                    if (menuActiveDSTab !== cat.name) return null;

                    return (
                      <div key={cat.name} className="space-y-4">
                        {cat.items.map((item: MenuItem, idx: number) => (
                          <div
                            key={idx}
                            className="border-b last:border-none border-gray-300 py-[12px] mb-0"
                          >
                            <div className="px-[24px] md:px-[26px] flex flex-1 justify-between">
                              <div className="w-[75%]">
                                <h3 className={`font-sans font-medium tracking-wide text-[14px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {item.name}
                                </h3>
                                <p className={`text-[13px] font-sans ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-[2px]`}>
                                  {item.description}
                                </p>
                              </div>
                              <div className={`text-right whitespace-nowrap font-sans font-medium ${theme === 'dark' ? 'text-white' : 'text-black'} text-[14px]`}>
                                ₹{Number(item.price).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {detailsActiveTab === "reviews" && recentSelectedPlace && (
              <div>
                <div className="px-[24px] pt-[20px] pb-[20px]">
                  <div className="flex items-center justify-between">
                    {(() => {
                      const userRatingsTotal = recentSelectedPlace.userRatingsTotal ?? 4.5;
                      const breakdown: Record<number, number> =
                        recentSelectedPlace.ratingBreakdown as Record<number, number> ||
                        (() => {
                          if (!userRatingsTotal) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                          const base = userRatingsTotal;
                          const five = base - 0.3;
                          const four = base - 0.6;
                          const three = base - 1.5;
                          const two = base - 1;
                          const one = 2;

                          return { 5: five, 4: four, 3: three, 2: two, 1: one };
                        })();

                      return (
                        <div className="flex flex-col gap-[3px] w-[200px]">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = breakdown[star] || 0;
                            const total = userRatingsTotal || 1;
                            const percent = (count / total) * 100;

                            return (
                              <div key={star} className="flex items-center gap-2 text-[14px]">
                                <span className={`w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{star}</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded">
                                  <div
                                    className="h-2 bg-yellow-400 rounded"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <div className="flex flex-col items-center gap-[6px]">
                      <span className={`text-[42px] leading-none font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        {recentSelectedPlace.rating?.toFixed(1)}
                      </span>
                      <StarRating rating={recentSelectedPlace.rating || 4.5} />
                      <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'} text-[12.5px]`}>
                        {/*{recentSelectedPlace.userRatingsTotal?.toLocaleString()} reviews*/}
                      </span>
                    </div>
                  </div>

                  <div className="mt-[22px] flex justify-center">
                    <button className={`flex items-center gap-2 px-[14px] py-2 rounded-full ${theme === 'dark' ? 'bg-[#00373e] text-white' : 'bg-[#CCF3F9] hover:bg-gray-100 text-black'} font-medium text-[14.5px] tracking-wide`}>
                      <RateReviewIcon style={{ fontSize: "18px" }} />
                      Write a review
                    </button>
                  </div>
                </div>

                {recentSelectedPlace.reviews && recentSelectedPlace.reviews.length > 0 && (
                  <div>
                    {recentSelectedPlace.reviews.map((review, index) => (
                      <div
                        key={index}
                        className="border-t border-gray-300 pt-5 pb-5 last:pb-4 flex gap-3"
                      >
                        <div className="px-[24px]">
                          <div className="flex items-center gap-[12px]">
                            <Image
                              src={
                                review.profile_photo_url
                                  ? review.profile_photo_url.replace("http://", "https://")
                                  : "https://www.gravatar.com/avatar/?d=mp&s=40"
                              }
                              onError={(e) => (e.currentTarget.src = "https://www.gravatar.com/avatar/?d=mp&s=40")}
                              alt={review.author_name}
                              width={36}
                              height={36}
                              unoptimized
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            <span className={`font-medium text-[16px] tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                              {review.author_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-[10px] mt-[12px]">
                            <StarRating rating={review.rating ?? 0} />
                            <span className={`text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                              {review.relative_time_description}
                            </span>
                          </div>

                          {review.text && (
                            <p className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mt-[6px]`}>
                              {review.text}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/*
            {detailsActiveTab === "about" && (
              <div>
                {Object.entries(aboutTabData).map(([category, items], idx, arr) => (
                  <div
                    key={category}
                    className={`${
                      idx !== arr.length - 1 ? "border-b border-gray-300 mb-[12px]" : ""
                    }`}
                  >
                    <div className="px-[24px] pt-[6px] pb-[18px]">
                      <h3 className="text-[14px] tracking-wide text-black font-sans font-semibold capitalize mb-[14px]">
                        {category.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <ul className="grid grid-cols-2 gap-y-[10px] gap-x-[20px]">
                        {items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-[4px] text-[14.5px] text-gray-700"
                          >
                            <CheckIcon style={{ fontSize: "18px" }} /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
            */}
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto absolute top-1 left-[0px] md:left-[72px] md:right-[10px] z-10 flex flex-col md:flex-row items-start md:items-center gap-[18px] md:gap-[28px] lg:gap-[34px] xl:gap-[40px] px-4 py-2 text-black">
        {/* Search bar */}
        <div className="flex items-center gap-[10px] w-full md:w-auto">
          <div className="flex items-center md:hidden flex-shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-[40px] h-[40px] object-cover rounded-full"
            />
          </div>
          <div className="relative flex-1 min-w-0" ref={searchBoxRef}>
            <div
              className={`relative ${theme === 'dark' ? 'bg-[#393939]' : 'bg-white'} shadow-2xl w-full md:w-[300px] lg:w-[320px] xl:w-[375px] ${showSuggestions ? "rounded-t-xl" : "rounded-full"
                }`}
            >
              <div className="flex items-center pl-5 pr-5 md:pr-4 py-[12px]">
                <input
                  ref={inputRef}
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Search Google Maps"
                  value={searchValue}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      if (combinedList.length > 0) {
                        e.preventDefault();
                        setHighlightedIndex((prev) => {
                          if (prev < combinedList.length - 1) return prev + 1;
                          return -1;
                        });
                      }
                      return;
                    }

                    if (e.key === "ArrowUp") {
                      if (combinedList.length > 0) {
                        e.preventDefault();
                        setHighlightedIndex((prev) => {
                          if (prev === -1) return combinedList.length - 1;
                          return prev - 1;
                        });
                      }
                      return;
                    }

                    if (e.key === "Enter") {
                      const selectedItem = combinedList[highlightedIndex];

                      if (selectedItem) {
                        if (selectedItem.type === "recent") {
                          const shop = allShops.find((s) => s.name === selectedItem.data.title);
                          if (shop) {
                            handleShopSuggestion(shop, () => setPlaceSidebar("full"));
                          } else {
                            console.warn("Shop not found for recent item:", selectedItem.data.title);
                          }
                        } else if (selectedItem.type === "suggestion") {
                          const shop = allShops.find(
                            (s) => s.name === selectedItem.data.name
                          );
                          if (shop) {
                            handleShopSuggestion(shop, () => {
                              setPlaceSidebar("full");
                            });
                          }
                        } else if (selectedItem.type === "home") {
                          alert("Set Home clicked");
                        } else if (selectedItem.type === "more") {
                          exploreButtonFunction();
                        }
                        setShowSuggestions(false);
                      }
                      else if (searchValue.trim()) {
                        const query = searchValue.trim().toLowerCase();

                        if (!searchOrigin || searchOrigin !== "home") {
                          setSearchOrigin("home");
                        }

                        const filteredShops = allShops.filter(shop =>
                          shop.name.toLowerCase().includes(query)
                        );

                        if (filteredShops.length > 0) {
                          setRelatedPlaces(filteredShops)
                          setPlaceSidebar("half");
                        } else {
                          setRelatedPlaces([]);
                          setPlaceSidebar("half");
                        }
                        setShowSuggestions(false);
                      }
                    }
                  }}

                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    setShowSuggestions(true);

                    if (!value.trim()) {
                      setSuggestions([]);
                      return;
                    }

                    const filtered = allShops.filter((shop) =>
                      shop.name.toLowerCase().includes(value.toLowerCase()) ||
                      shop.address.toLowerCase().includes(value.toLowerCase()) ||
                      shop.cuisine.toLowerCase().includes(value.toLowerCase())
                    );

                    setSuggestions(filtered.slice(0, 5));

                    setNoMatches(filtered.length === 0);
                  }}
                  onFocus={() => setShowSuggestions(true)}

                  className={`flex-1 outline-none border-none bg-transparent text-[14.5px] pr-[18px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                />

                <div
                  className="absolute right-2 md:right-3 w-[40px] h-[40px] flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    setShowSuggestions(true);
                    inputRef.current?.focus();
                  }}
                >
                  <SearchIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} text-[22px]`} />

                  <div
                    className="pointer-events-none absolute bottom-[-40px] left-[20px] -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] 
                    rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100"
                  >
                    Search
                  </div>
                </div>

                <div className="mr-[4px]" />
                {/*
                <div className="mr-[30px]" />

                <div className="relative group">
                  {isLocationSelected ? (
                    <>
                      <div
                        className="w-[20px] h-[20px] bg-tranparent rounded-full flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          setSearchValue("");
                          setSuggestions([]);
                          setIsLocationSelected(false);
                          setShowSuggestions(false);
                          if (markerRef.current) {
                              markerRef.current.setMap(null);
                              markerRef.current = null;
                            }
                        }}
                      >
                        <span className="text-[18px] font-bold text-[#007B8A]">✕</span>
                      </div>
                      <div className="pointer-events-none absolute bottom-[-42px] left-1/2 -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100">
                        Close
                      </div>
                    </>
                  ) : (
                    <>
                      <div 
                        className="w-[20px] h-[20px] bg-[#007B8A] rounded-full flex items-center justify-center cursor-pointer"
                        onClick={() => setShowSidebar(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="18px"
                          height="18px"
                          fill="white"
                        >
                          <path d="M17.17,11l-1.59,1.59L17,14l4-4l-4-4l-1.41,1.41L17.17,9L9,9c-1.1,0-2,0.9-2,2v9h2v-9L17.17,11z" />
                        </svg>
                      </div>
                      <div className="pointer-events-none absolute bottom-[-42px] left-1/2 -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100">
                        Directions
                      </div>
                    </>
                  )}
                </div>
                */}
              </div>
            </div>

            {/* Suggestion Row */}
            {showSuggestions && (
              <div ref={suggestionBoxRef} className="absolute top-full left-0 w-full md:w-[300px] lg:w-[320px] xl:w-[375px] z-20">
                <div className={`${theme === 'dark' ? 'bg-[#393939]' : 'bg-white '} shadow-lg rounded-b-xl border-t border-gray-200 pt-[8px] pb-[10px]`}>
                  {combinedList.length > 0 && (
                    <>
                      <div className="flex flex-col space-y-[0px]">
                        {combinedList.map((item, index) => {
                          const isHighlighted = highlightedIndex === index;
                          const baseClass = `${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} cursor-pointer px-[12px] md:px-[16px] pt-[10px] pb-[12px] flex items-center justify-between 
                                             ${isHighlighted ? (theme === 'dark' ? "bg-gray-800" : "bg-gray-100") : ""}`;

                          const isInputEmpty = searchValue.trim() === "";

                          if (item.type === "recent") {
                            const place = item.data as RecentPlace;
                            return (
                              <div
                                key={`recent-${place.lat}-${place.lng}-${place.timestamp}`}
                                className={`px-[14px] md:px-[20px] ${baseClass} group`}
                                onMouseDown={() => {
                                  setSearchValue(place.title);
                                  setShowSuggestions(true);

                                  const shop = allShops.find((s) => s.name === place.title);
                                  if (shop) {
                                    handleShopSuggestion(shop);
                                  } else {
                                    console.warn("Shop not found for recent place:", place.title);
                                  }
                                }}
                              >
                                <div className="flex bg-red-00 items-center justify-between w-full group">
                                  <div className={`flex bg-blue- items-center ${isInputEmpty ? "gap-[12px]" : "gap-[13px]"} overflow-hidden`}>
                                    {isInputEmpty ? (
                                      <div className={`md:w-10 md:h-10 ${theme === 'dark' ? 'bg-[#2a2b2f]' : 'bg-[#f2f2f2]'} rounded-full flex items-center justify-center`}>
                                        <AccessTimeIcon className={`${theme === 'dark' ? 'text-white' : 'text-black'} w-6 h-6`} />
                                      </div>
                                    ) : (
                                      <div className="py-[8px] bg-transparent flex items-center justify-center">
                                        <AccessTimeIcon className={`w-9 h-9 ${theme === 'dark' ? 'text-white' : 'text-black'}`} style={{ fontSize: "21px" }} />
                                      </div>
                                    )}

                                    {isInputEmpty ? (
                                      <div className="flex flex-col max-w-[80%] md:max-w-[240px]">
                                        <span className={`font-medium text-[14.5px]  ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                                          {place.title}
                                        </span>
                                        {place.subtitle && (
                                          <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'} text-[14px] truncate`}>
                                            {place.subtitle}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <div className={`text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} font-medium truncate`}>
                                        {place.title}
                                        {place.subtitle && (
                                          <span className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'} font-normal pl-[6px]`}>{place.subtitle}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {isInputEmpty && (
                                    <button
                                      tabIndex={-1}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setRecentPlaces((prev) => {
                                          const updated = prev.filter(
                                            (p) => !(p.lat === place.lat && p.lng === place.lng)
                                          );
                                          localStorage.setItem("recent_places", JSON.stringify(updated));
                                          return updated;
                                        });
                                      }}
                                      className={`opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all duration-150 px-[8px] py-[4px] font-bold text-[14px] cursor-pointer rounded-full ${theme === 'dark' ? 'text-white hover:bg-[#2a2b2f]' : 'text-black hover:bg-gray-200'}`}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "suggestion") {
                            const shop = item.data;
                            return (
                              <div
                                key={shop.shopId}
                                className={baseClass}
                                onMouseDown={() => handleShopSuggestion(shop)}
                              >
                                <div className="flex items-center gap-[10px] overflow-hidden">
                                  <div className="w-9 h-9 bg-transparent rounded-full flex items-center justify-center">
                                    <LocationOnIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'}`} style={{ fontSize: "21px" }} />
                                  </div>
                                  <span className={`font-medium tracking-wide text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} truncate w-full`}>
                                    {shop.name}
                                  </span>
                                </div>
                              </div>
                            );
                          }

                          if (item.type === "more") {
                            return (
                              <div
                                key="more"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  exploreButtonFunction();
                                  setShowSuggestions(false);
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  exploreButtonFunction();
                                  setShowSuggestions(false);
                                }}
                                className={`
                                  px-[12px] py-[12px] flex items-center justify-center cursor-pointer 
                                  ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} 
                                  ${highlightedIndex === index
                                    ? (theme === 'dark' ? "bg-gray-800 text-white" : "bg-gray-100 text-[#007B8A]")
                                    : (theme === 'dark' ? "text-white" : "text-white")
                                  }`}
                              >
                                <span className="text-[14.5px] tracking-wide font-medium">
                                  See all shops list
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </>
                  )}
                  {noMatches && (
                    <div className={`px-[20px] py-[12px] text-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      <p className={`font-medium text-[15px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Sorry, can&apos;t find that place name.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden items-center flex-shrink-0">
            <div className={`w-[40px] h-[40px] ${theme === 'dark' ? 'bg-[#2a2b2f]' : 'bg-white'} shadow-md rounded-full flex items-center justify-center`}>
              {mounted && isMobileTheme && (
                <Classic
                  {...({
                    duration: 750,
                    toggled: theme === 'dark',
                    onToggle: () => setTheme(theme === 'light' ? 'dark' : 'light'),
                    className: `${theme === 'dark' ? 'text-white' : 'text-black'} text-[24px]`
                  } as any)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {!showSidebar && !['saved', 'recent'].includes(topSidebar ?? '') && (
          <div className="relative category-width">
            <button
              onClick={() => scrollCategory("left")}
              className={`absolute left-[-14px] top-1/2 -translate-y-1/2 z-10 ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'bg-white text-black hover:bg-gray-100'} shadow rounded-full p-[8px] cursor-pointer ${showLeftArrow ? "block" : "hidden"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
            </button>

            <div
              ref={arrowScrollRef}
              className="overflow-x-auto whitespace-nowrap scrollbar-hide px-1 md:px-6"
              onScroll={handleCategoryScroll}
            >
              <div className="flex items-center gap-[8px]">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className={`flex items-center gap-[5px] ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'bg-white text-black hover:bg-gray-100'} rounded-full px-[10px] py-[6px] shadow-2xl text-[14px] whitespace-nowrap tracking-wide font-medium cursor-pointer`}
                    onClick={() => {
                      categoryModeRef.current = true;
                      {/*categoryModeRef.current = false;*/ }
                      setSelectedCategory(cat.name);
                      runCategorySearch(cat.shop_ids);
                    }}
                  >
                    <RestaurantIcon style={{ fontSize: "18px" }} />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => scrollCategory("right")}
              className={`absolute right-[-12px] top-1/2 -translate-y-1/2 z-10 ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'bg-white text-black hover:bg-gray-100'} shadow rounded-full p-[8px] cursor-pointer ${showRightArrow ? "block" : "hidden"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>
            </button>
          </div>
        )}

        <div className="hidden md:flex items-center flex-shrink-0 ml-auto">
          <div className={`w-[40px] h-[40px] ${theme === 'dark' ? 'bg-[#2a2b2f]' : 'bg-white'} shadow-md rounded-full flex items-center justify-center`}>
            {mounted && !isMobileTheme && (
              <Classic
                {...({
                  duration: 750,
                  toggled: theme === 'dark',
                  onToggle: () => setTheme(theme === 'light' ? 'dark' : 'light'),
                  className: `${theme === 'dark' ? 'text-white' : 'text-black'} text-[24px]`
                } as any)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Direction Sidebar */}
      <div
        ref={directionSidebarRef}
        className={`fixed bg-white text-black shadow-2xl z-30 transition-transform duration-300 flex flex-col
          bottom-0 left-0 md:top-0 md:left-[70px] w-full md:w-[410px] h-full md:translate-y-0
          ${showSidebar ? 'translate-y-0' : 'translate-y-full'}
          ${showSidebar ? 'md:translate-x-0' : 'md:-translate-x-[410px]'}`}
      >
        {/* Tabs and Inputs */}
        <div className="py-4 border-b border-gray-300">
          <div className="flex items-center justify-end mt-1 mr-[20px] relative group">
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[18px] text-black hover:bg-gray-200 transition duration-150 relative cursor-pointer"
              onClick={closeSidebar}
              aria-label="Close directions"
            >
              ✕
            </button>
            <div className="pointer-events-none absolute bottom-[-32px] right-[-30px] translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-100">
              Close directions
            </div>
          </div>

          <div className="flex items-start gap-[18px] pl-[26px] pr-[20px] mt-6">
            <div className="flex flex-col items-center mt-[14px]">
              <div className="w-[13px] h-[13px] border-[2px] border-black rounded-full mb-[10px]"></div>
              <div className="flex flex-col items-center gap-[4px] mb-[10px]">
                <div className="w-[2px] h-[2px] bg-black rounded-full"></div>
                <div className="w-[2px] h-[2px] bg-black rounded-full"></div>
                <div className="w-[2px] h-[2px] bg-black rounded-full"></div>
              </div>
              <LocationOnIcon style={{ fontSize: '21px' }} className="text-red-500" />
            </div>

            <div ref={directionBoxRef} className="flex flex-col w-full max-w-md gap-3">
              <div className="relative group">
                <input
                  ref={startingPlaceInputRef}
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Choose starting point, or click on the map"
                  value={startLocation}
                  onChange={(e) => {
                    setStartLocation(e.target.value);
                    fetchStartLocationSuggestions(e.target.value);
                  }}
                  className={`w-full pl-2 ${focusedInput === "start" ? "pr-[44px]" : "pr-3"
                    } py-2 border border-black rounded-[8px] text-[14.5px] focus:outline-none focus:ring-1 focus:ring-[#007D8A]`}

                  onFocus={() => {
                    setFocusedInput("start");
                    setShowDestSuggestions(false);
                  }}
                  onBlur={() => {
                    setFocusedInput(null);
                    setStartHighlightedIndex(-1);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, true)}
                />
                {focusedInput === "start" && (
                  <SearchIcon
                    className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#007D8A]"
                    style={{ fontSize: "24px" }}
                  />
                )}
                <div className="pointer-events-none absolute bottom-[-18px] left-[18px] bg-black text-white text-[14.5px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-100">
                  Choose starting point, or click on the map...
                </div>

                {showStartSuggestions && startSuggestions.length > 0 && (
                  <div className="absolute top-[105px] left-[-65px] w-[410px] bg-white shadow-lg pt-[8px] pb-[10px] z-20 border-t border-gray-300 overflow-hidden">
                    {startSuggestions.map((suggestion, i) => (
                      <div
                        key={suggestion.place_id}
                        className={`flex items-center px-[24px] py-2 cursor-pointer ${startHighlightedIndex === i ? "bg-gray-100" : "hover:bg-gray-100"}`}
                        onMouseDown={() => handleDirectionSidebarSelectSuggestion(suggestion.place_id, true)}
                      >
                        <LocationOnIcon className="text-[#007B8A] mr-[26px]" />
                        <div className="flex items-center text-[14px] whitespace-nowrap overflow-hidden">
                          <span className="font-medium text-gray-900">
                            {suggestion.structured_formatting.main_text}
                          </span>
                          &nbsp;
                          <span className="text-gray-500">
                            {suggestion.structured_formatting.secondary_text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative group">
                <input
                  ref={destinationInputRef}
                  type="text"
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  placeholder="Choose destination..."
                  value={destinationLocation}
                  onChange={(e) => {
                    setDestinationLocation(e.target.value);
                    fetchDestinationSuggestions(e.target.value);
                  }}
                  className={`w-full pl-2 ${focusedInput === "destination" ? "pr-[44px]" : "pr-3"}
                    py-2 border border-black rounded-[8px] text-[14.5px] focus:outline-none focus:ring-1 focus:ring-[#007D8A]`}
                  onFocus={() => {
                    setFocusedInput("destination");
                    setShowStartSuggestions(false);
                  }}
                  onBlur={() => {
                    setFocusedInput(null);
                    setDestHighlightedIndex(-1);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, false)}
                />
                {focusedInput === "destination" && (
                  <SearchIcon
                    className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#007D8A]"
                    style={{ fontSize: "24px" }}
                  />
                )}
                <div className="pointer-events-none absolute bottom-[-20px] left-[20px] bg-black text-white text-[14.5px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-100">
                  Choose destination...
                </div>
                {showDestSuggestions && destSuggestions.length > 0 && (
                  <div className="absolute top-[55px] left-[-65px] w-[410px] bg-white shadow-lg pt-[8px] pb-[10px] z-20 border-t border-gray-300 overflow-hidden">
                    {destSuggestions.map((suggestion, i) => (
                      <div
                        key={suggestion.place_id}
                        className={`flex items-center px-[24px] py-2 cursor-pointer ${destHighlightedIndex === i ? "bg-gray-100" : "hover:bg-gray-100"}`}
                        onMouseDown={() => handleDirectionSidebarSelectSuggestion(suggestion.place_id, false)}
                      >
                        <LocationOnIcon className="text-[#007B8A] mr-[26px]" />
                        <div className="flex items-center text-[14px] whitespace-nowrap overflow-hidden">
                          <span className="font-medium text-gray-900">
                            {suggestion.structured_formatting.main_text}
                          </span>
                          &nbsp;
                          <span className="text-gray-500">
                            {suggestion.structured_formatting.secondary_text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              className="mt-7 cursor-pointer relative group"
              onClick={() => {
                setStartLocation(destinationLocation);
                setDestinationLocation(startLocation);
                setStartCoords(destinationCoords);
                setDestinationCoords(startCoords);
              }}
            >
              <SwapVertIcon style={{ fontSize: '28px' }} className="text-black" />
              <div className="pointer-events-none absolute bottom-[-34px] right-[-90px] translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap z-100">
                Reverse starting point and destination
              </div>
            </div>
          </div>
        </div>

        {/* Recent Places */}
        <div className="overflow-y-auto flex-1 py-2">
          <div
            className="w-full group hover:bg-[#f2f2f2] cursor-pointer transition-colors duration-200"
            onClick={handleYourLocationClick}
          >
            <div className="flex items-center gap-3 px-[20px] py-[10px]">
              <div className="w-10 h-10 bg-[#CCF3F9] rounded-full flex items-center justify-center">
                <MyLocationIcon className="text-black" style={{ fontSize: '24px' }} />
              </div>
              <div className="flex flex-col max-w-[220px]">
                <span className="text-[14.5px] font-medium text-black truncate">Your location</span>
              </div>
            </div>
          </div>

          {recentPlaces.map((place, index) => (
            <div
              key={index}
              className="w-full group hover:bg-[#f2f2f2] cursor-pointer transition-colors duration-200"
              onClick={() => handleRecentPlaceClick(place)}
            >
              <div className="flex items-center gap-3 px-[20px] py-[10px]">
                <div className="w-10 h-10 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                  <AccessTimeIcon className="text-black" style={{ fontSize: '26px' }} />
                </div>
                <div className="flex flex-col max-w-[300px]">
                  <span className="font-medium text-[14.5px] text-black truncate">{place.title}</span>
                  {place.subtitle && (
                    <span className="text-gray-600 text-[14px] truncate">{place.subtitle}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Place Sidebar */}
      <div
        id="fullSidebar"
        ref={fullSidebarRef}
        style={{ height: window.innerWidth < 768 ? `${sidebarHeight}px` : "100vh" }}
        className={`fixed bg-transparent ${theme === 'dark' ? 'md:bg-[#131313] text-white' : 'md:bg-white text-black'} z-30 hidden md:flex flex-col
          bottom-0 left-0 md:top-0 md:left-[70px] w-full md:w-[410px] h-[50%] md:h-full md:translate-y-0
          transition-[transform,height] duration-300 overflow-hidden
          ${placeSidebar === "full" ? "z-40" : "z-30"}
          ${placeSidebar === "full" ? "translate-y-0" : "translate-y-full"}
          ${placeSidebar === "full" ? "md:translate-x-0" : "md:-translate-x-[410px]"}`}
      >

        <div className="flex flex-col h-full">
          <MobilePlaceSidebar isOpen={placeSidebar === "full"}>
            {/*
          {placeSidebar === "full" && (
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="md:hidden w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-gray-400 rounded-full" />
            </div>
          )}
          */}

            <div className={`hidden md:block py-3 px-4 top-0 z-10 bg-transparent w-full
            ${fullSidebarActiveTab === "fullSidebarOverview" ? "absolute left-0" : "sticky"}`}
            >
              {searchOrigin === "sidebar" ? (
                <SidebarSearchBox
                  topSidebarSearchBoxRef={firstSearchBoxRef}
                  topSidebarSuggestionBoxRef={firstSuggestionBoxRef}
                  inputRef={inputRef}
                  sidebarSearchValue={sidebarSearchValue}
                  fetchDetailedPlaces={fetchDetailedPlaces}
                  setSidebarSearchValue={setSidebarSearchValue}
                  showSidebarSuggestions={showSidebarSuggestions}
                  setShowSidebarSuggestions={setShowSidebarSuggestions}
                  sidebarCombinedList={sidebarCombinedList}
                  sidebarHighlightedIndex={sidebarHighlightedIndex}
                  setSidebarHighlightedIndex={setSidebarHighlightedIndex}
                  placeSidebar={placeSidebar}
                  topSidebar={topSidebar}
                  setTopSidebar={setTopSidebar}
                  setPlaceSidebar={setPlaceSidebar}
                  setShowSidebar={setShowSidebar}
                  setRecentSidebar={setRecentSidebar}
                  handleSidebarSelectSuggestion={handleSidebarSelectSuggestion}
                  setSidebarSuggestions={setSidebarSuggestions}
                  setIsLocationSelected={setIsLocationSelected}
                  setRecentPlaces={setRecentPlaces}
                  setRelatedPlaces={setRelatedPlaces}
                  mapInstanceRef={mapInstanceRef}
                  recentPlaces={recentPlaces}
                  markerRef={markerRef}
                  sidebarMarkerRef={sidebarMarkerRef}
                  clearCategoryMarkers={clearCategoryMarkers}
                  keepHalfSidebarOpen={keepHalfSidebarOpen}
                  setKeepHalfSidebarOpen={setKeepHalfSidebarOpen}
                  sidebarHeight={sidebarHeight}
                  setSidebarHeight={setSidebarHeight}
                  activePlaceMarkerRemover={activePlaceMarkerRemover}
                  handleShopSuggestion={handleShopSuggestion}
                  searchOrigin={searchOrigin}
                  setSearchOrigin={setSearchOrigin}
                  noMatches={noMatches}
                  setNoMatches={setNoMatches}
                  allShops={allShops}
                  exploreButtonFunction={exploreButtonFunction}
                  closeCategoryMode={closeCategoryMode}
                  restoreCategoryView={restoreCategoryView}
                  setIsExploreButton={setIsExploreButton}
                  resetMapForMobile={resetMapForMobile}
                />
              ) : searchOrigin === "home" ? (
                <SearchBox
                  placeSidebarSearchBoxRef={fullSidebarSearchBoxRef}
                  placeSidebarSuggestionBoxRef={fullSidebarSuggestionBoxRef}
                  inputRef={inputRef}
                  searchValue={searchValue}
                  fetchDetailedPlaces={fetchDetailedPlaces}
                  setSearchValue={setSearchValue}
                  showSuggestions={showSuggestions}
                  setShowSuggestions={setShowSuggestions}
                  combinedList={combinedList}
                  highlightedIndex={highlightedIndex}
                  setHighlightedIndex={setHighlightedIndex}
                  placeSidebar={placeSidebar}
                  topSidebar={topSidebar}
                  setTopSidebar={setTopSidebar}
                  setPlaceSidebar={setPlaceSidebar}
                  setShowSidebar={setShowSidebar}
                  setRecentSidebar={setRecentSidebar}
                  handleSelectSuggestion={handleSelectSuggestion}
                  setSuggestions={setSuggestions}
                  setIsLocationSelected={setIsLocationSelected}
                  setRecentPlaces={setRecentPlaces}
                  setRelatedPlaces={setRelatedPlaces}
                  mapInstanceRef={mapInstanceRef}
                  recentPlaces={recentPlaces}
                  markerRef={markerRef}
                  sidebarMarkerRef={sidebarMarkerRef}
                  clearCategoryMarkers={clearCategoryMarkers}
                  keepHalfSidebarOpen={keepHalfSidebarOpen}
                  setKeepHalfSidebarOpen={setKeepHalfSidebarOpen}
                  sidebarHeight={sidebarHeight}
                  setSidebarHeight={setSidebarHeight}
                  activePlaceMarkerRemover={activePlaceMarkerRemover}
                  handleShopSuggestion={handleShopSuggestion}
                  searchOrigin={searchOrigin}
                  setSearchOrigin={setSearchOrigin}
                  noMatches={noMatches}
                  setNoMatches={setNoMatches}
                  allShops={allShops}
                  exploreButtonFunction={exploreButtonFunction}
                  closeCategoryMode={closeCategoryMode}
                  restoreCategoryView={restoreCategoryView}
                  setIsExploreButton={setIsExploreButton}
                  resetMapForMobile={resetMapForMobile}
                />
              ) : null}
            </div>

            {fullSidebarActiveTab !== "fullSidebarOverview" && (
              <div className={`sticky top-0 z-[100] md:z-0 ${theme === 'dark' ? 'bg-[#131313]' : 'bg-white'}`}>
                <div className={`relative top-[-2px] left-0 w-full pt-[12px] pb-[10px] ${theme === 'dark' ? 'bg-[#131313] text-white' : 'bg-white text-black'} z-[100] flex md:hidden items-center justify-between transition-opacity duration-200`}>
                  <button
                    onClick={() => {
                      setFullSidebarActiveTab("fullSidebarOverview");
                    }}
                    className={`absolute left-4 w-[34px] h-[34px] flex items-center justify-center rounded-full hover:bg-gray-200 ${theme === 'dark' ? 'text-white' : 'text-black'} cursor-pointer`}
                  >
                    <ArrowLeft size={22} strokeWidth={2} />
                  </button>
                  <h2 className="font-medium text-[17.5px] truncate pointer-events-none tracking-wide mx-auto text-center max-w-[220px]">
                    {fullSidebarSelectedPlace?.title}
                  </h2>
                  <button
                    onClick={() => {
                      setFullSidebarSelectedPlace(null);
                      closeButtonFunction();
                    }}
                    className={`absolute right-4 w-[34px] h-[34px] flex items-center justify-center rounded-full hover:bg-gray-200 ${theme === 'dark' ? 'text-white' : 'text-black'} text-[18px] font-bold cursor-pointer`}
                  >
                    ✕
                  </button>
                </div>

                <div className={`flex justify-around border-b ${theme === 'dark' ? 'bg-[#131313] border-gray-200' : 'bg-white border-gray-400'}`}>
                  {fullSidebarTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`relative py-[10px] text-[14px] tracking-wide font-medium ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-600 hover:text-black'} cursor-pointer`}
                      onClick={() => setFullSidebarActiveTab(tab.id)}
                    >
                      {tab.label}
                      {fullSidebarActiveTab === tab.id && (
                        <span className={`absolute bottom-0 left-0 w-full h-[2px] ${theme === 'dark' ? 'bg-[#9dedfb]' : 'bg-[#007B8A]'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={fullSidebarContentRef} className="overflow-y-auto flex-1 relative">
              {fullSidebarActiveTab === "fullSidebarOverview" && (
                <>
                  <div className="hidden md:flex relative w-full h-80 bg-gray-200 overflow-hidden">
                    <Image
                      src={fullSidebarSelectedPlace?.imageUrl || "/fallback.jpg"}
                      alt={fullSidebarSelectedPlace?.title || "Place"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/fallback.jpg";
                      }}
                      width={800}
                      height={240}
                      unoptimized
                      className="w-full h-full object-fit"
                    />
                  </div>

                  <div className="md:hidden relative w-full h-[260px] bg-white overflow-hidden">
                    <div className="flex w-full h-full overflow-x-auto snap-none scroll-smooth no-scrollbar gap-x-[12px] px-[12px]">
                      {(() => {
                        const photos = fullSidebarSelectedPlace?.allPhotos || [];
                        if (photos.length === 0) {
                          return <Image src="/fallback.jpg" alt="Place" fill className="object-cover rounded-xl" />;
                        }

                        return (
                          <>
                            <div className="relative flex-shrink-0 w-[90%] h-full rounded-xl overflow-hidden">
                              <Image
                                src={photos[0]}
                                alt="hero"
                                width={800}
                                height={240}
                                unoptimized
                                className="w-full h-full object-fit"
                              />
                            </div>

                            {photos.length > 1 && (
                              <div className="flex-shrink-0 w-[50%] h-full flex flex-col gap-[12px]">
                                <div className="relative flex-1 w-full rounded-xl overflow-hidden">
                                  <Image src={photos[1]} alt="img-1" fill unoptimized className="object-fit" />
                                </div>
                                {photos[2] && (
                                  <div className="relative flex-1 w-full rounded-xl overflow-hidden">
                                    <Image src={photos[2]} alt="img-2" fill unoptimized className="object-fit" />
                                  </div>
                                )}
                              </div>
                            )}

                            {photos.length > 3 && (
                              <div className="flex-shrink-0 w-[50%] h-full flex flex-col gap-[12px] pr-[0px]">
                                <div className="relative flex-1 w-full rounded-xl overflow-hidden ">
                                  <Image src={photos[3]} alt="img-3" fill unoptimized className="object-fit" />
                                </div>
                                {photos[4] && (
                                  <div
                                    className="relative flex-1 w-full cursor-pointer rounded-xl overflow-hidden"
                                    onClick={() => {
                                      if (photos.length > 5) setFullSidebarActiveTab("fullSidebarMenu");
                                    }}
                                  >
                                    <Image src={photos[4]} alt="img-4" fill unoptimized className="object-fit" />

                                    {photos.length > 5 && (
                                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center">
                                        <ImageIcon style={{ fontSize: '24px' }} />
                                        <span className="text-[12px] font-bold">View More</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <button
                      onClick={() => {
                        setFullSidebarSelectedPlace(null);
                        closeButtonFunction();
                        activePlaceMarkerRemover();
                      }}
                      className="absolute top-[14px] right-4 w-[34px] h-[34px] flex md:hidden items-center justify-center rounded-full bg-white hover:bg-gray-200 shadow-md text-black text-[18px] font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="pt-[14px] px-[24px] md:px-[26px] flex flex-col gap-[2px] max-w-[360px]">
                    <span className={`font-medium text-[21.5px] ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                      {fullSidebarSelectedPlace?.title}
                    </span>

                    {fullSidebarSelectedPlace?.nativeName && (
                      <span className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`}>
                        {fullSidebarSelectedPlace?.nativeName}
                      </span>
                    )}

                    {fullSidebarSelectedPlace?.rating ? (
                      <>
                        <span className={`mt-[2px] text-[13.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-[4px]`}>
                          <span>{fullSidebarSelectedPlace?.rating}</span>
                          <StarRating rating={fullSidebarSelectedPlace?.rating} />
                          {fullSidebarSelectedPlace?.userRatingsTotal && (
                            <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                              ({fullSidebarSelectedPlace?.userRatingsTotal.toLocaleString()})
                            </span>
                          )}
                          {fullSidebarSelectedPlace?.priceText && (
                            <>
                              <span><b>·</b></span>
                              <span>₹{fullSidebarSelectedPlace?.priceText}</span>
                            </>
                          )}
                        </span>

                        {fullSidebarSelectedPlace?.category && (
                          <span className={`mt-[2px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate`}>
                            {fullSidebarSelectedPlace?.category}
                          </span>
                        )}
                      </>
                    ) : (
                      fullSidebarSelectedPlace?.subtitle && (
                        /*
                        <span className="text-gray-600 text-[14.5px] truncate pt-[2px]">
                          {fullSidebarSelectedPlace.subtitle}
                        </span>
                        */

                        <>
                          <span className={`mt-[2px] text-[13.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} flex items-center gap-[4px]`}>
                            <span>{4.5}</span>
                            <StarRating rating={4.5} />
                            {fullSidebarSelectedPlace?.userRatingsTotal || (
                              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                (548)
                              </span>
                            )}
                            {fullSidebarSelectedPlace?.priceText || (
                              <>
                                <span><b>·</b></span>
                                <span>₹200 – 400</span>
                              </>
                            )}
                          </span>

                          {fullSidebarSelectedPlace?.category && (
                            <span className={`mt-[2px] ${theme === 'dark' ? 'text-white' : 'text-gray-600'} text-[14px] truncate`}>
                              {fullSidebarSelectedPlace?.category}
                            </span>
                          )}
                        </>
                      )
                    )}
                  </div>
                </>
              )}

              {fullSidebarActiveTab === "fullSidebarOverview" && (
                <>
                  <div className={`flex justify-around border-b ${theme === 'dark' ? 'bg-[#131313] border-gray-200' : 'bg-white border-gray-400'}`}>
                    {fullSidebarTabs.map((tab) => (
                      <button
                        key={tab.id}
                        className={`relative py-[10px] text-[14.5px] tracking-wide font-medium  ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-600 hover:text-black'} mt-[6px] cursor-pointer`}
                        onClick={() => setFullSidebarActiveTab(tab.id)}
                      >
                        {tab.label}
                        {fullSidebarActiveTab === tab.id && (
                          <span className={`absolute bottom-0 left-0 w-full h-[2px] ${theme === 'dark' ? 'bg-[#9dedfb]' : 'bg-[#007B8A]'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className={`pb-[10px] md:pb-[14px] text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'}
              ${fullSidebarActiveTab === "fullSidebarMenu" ? "pt-[8px]" : "pt-[14px]"}`}
              >
                {fullSidebarActiveTab === "fullSidebarOverview" && (
                  <>
                    <div className={`flex justify-around px-[4px] md:px-[6px] pb-[12px] border-b border-gray-300 ${theme === 'dark' ? 'bg-[#131313]' : 'bg-white'}`}>
                      {/*
                    <button 
                      onClick={() => {
                        setPlaceSidebar(null);
                        setShowSidebar(true);
  
                        if (fullSidebarSelectedPlace) {
                          setDestinationLocation(fullSidebarSelectedPlace.title);
                          setDestinationCoords({
                            lat: fullSidebarSelectedPlace.lat,
                            lng: fullSidebarSelectedPlace.lng,
                          });
                        }
                      }}
                      className="flex flex-col items-center text-[12.5px] tracking-wide text-gray-700 hover:text-black cursor-pointer"
                    >
                      <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-[#007B8A] mb-[7px]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="21px"
                          height="21px"
                          fill="white"
                        >
                          <path d="M17.17,11l-1.59,1.59L17,14l4-4l-4-4l-1.41,1.41L17.17,9L9,9c-1.1,0-2,0.9-2,2v9h2v-9L17.17,11z" />
                        </svg>
                      </div>
                      Directions
                    </button>
                    */}

                      <button
                        onClick={() => {
                          if (!fullSidebarSelectedPlace) return;

                          setFavoritePlaceList((prevFavs) => {
                            let updatedFavs;
                            let isNowFavorite;

                            if (fullSidebarSelectedPlace.isFavorite) {
                              updatedFavs = prevFavs.filter((p) => p.title !== fullSidebarSelectedPlace.title);
                              isNowFavorite = false;
                            } else {
                              const alreadyExists = prevFavs.some((p) => p.title === fullSidebarSelectedPlace.title);
                              updatedFavs = alreadyExists
                                ? prevFavs
                                : [{ ...fullSidebarSelectedPlace, isFavorite: true }, ...prevFavs];
                              isNowFavorite = true;
                            }

                            localStorage.setItem("favorite_places", JSON.stringify(updatedFavs));

                            setRecentPlaces((prev) =>
                              prev.map((p) =>
                                p.title === fullSidebarSelectedPlace.title
                                  ? { ...p, isFavorite: isNowFavorite }
                                  : p
                              )
                            );

                            setFullSidebarSelectedPlace((prev) =>
                              prev ? { ...prev, isFavorite: isNowFavorite } : prev
                            );

                            return updatedFavs;
                          });
                        }}
                        className={`flex flex-col items-center text-[12.5px] tracking-wide ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-700 hover:text-black'} cursor-pointer`}
                      >
                        <div className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} mb-[6px]`}>
                          {fullSidebarSelectedPlace?.isFavorite ? (
                            <FavoriteIcon style={{ fontSize: "22px" }} className="text-red-500" />
                          ) : (
                            <FavoriteBorderIcon style={{ fontSize: "22px" }} className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-medium`} />
                          )}
                        </div>
                        {fullSidebarSelectedPlace?.isFavorite ? "Remove" : "Favorite"}
                      </button>

                      <button
                        aria-label={`Download "${fullSidebarSelectedPlace?.title}" app`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (fullSidebarSelectedPlace) {
                            handleAppDownload(fullSidebarSelectedPlace);
                          }
                        }}
                        className={`flex flex-col items-center text-[12.5px] tracking-wide ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-700 hover:text-black'} cursor-pointer`}>
                        <div className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} mb-[6px]`}>
                          <HiDownload style={{ fontSize: "22px" }} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                        </div>
                        Order Now
                      </button>

                      <div className="relative group">
                        <button
                          onClick={handleFSLocationShare}
                          className={`flex flex-col items-center text-[12.5px] tracking-wide ${theme === 'dark' ? 'text-[#9dedfb] hover:text-white' : 'text-gray-700 hover:text-black'} cursor-pointer`}
                        >
                          <div className={`w-[40px] h-[40px] flex items-center justify-center rounded-full ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} mb-[6px]`}>
                            <Share2 size={18} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                          </div>
                          Share
                        </button>
                      </div>
                    </div>

                    {/*
                  <div
                    onClick={() => {
                      setFullSidebarActiveTab("fullSidebarAbout");
                    }}
                    className="flex items-center justify-between px-[22px] py-[22px] border-b border-gray-300 bg-white hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center text-[14px] tracking-wide text-gray-800 flex-wrap">
                      <CheckIcon style={{ fontSize: "19px" }} className="text-green-600" />
                      <span className="ml-[3px]">Dine-in</span>
                      <span className="mx-[6px]"><b>·</b></span>
  
                      <CheckIcon style={{ fontSize: "19px" }} className="text-green-600" />
                      <span className="ml-[3px]">Takeaway</span>
                      <span className="mx-[6px]"><b>·</b></span>
  
                      <CheckIcon style={{ fontSize: "19px" }} className="text-green-600" />
                      <span className="ml-[3px]">Delivery</span>
                    </div>
  
                    <ChevronRightIcon className="text-gray-600" />
                  </div>
                  */}

                    <div className={`pt-[14px] pb-[22px] border-b border-gray-300 ${theme === 'dark' ? 'bg-[#131313]' : 'bg-white'}`}>
                      <div className={`group relative w-full flex items-start pl-[24px] pr-[20px] py-2 ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} cursor-pointer`}>
                        <LocationOnIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} mr-[24px] mt-[2px]`} />

                        <p className={`flex-1 text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-800'} leading-snug tracking-wide`}>
                          {fullSidebarSelectedPlace?.fullAddress || "Address not available"}
                        </p>

                        <button
                          onClick={handleFSAddressCopy}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-[6px] cursor-pointer"
                        >
                          <ContentCopyIcon style={{ fontSize: "18px" }} className={`${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />

                          <span className="absolute left-0 top-[36px] bg-black text-white text-[12px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition tracking-wide">
                            Copy address
                          </span>
                        </button>

                        {addressFSCopied && (
                          <span className="absolute right-0 -top-[22px] bg-black text-white text-[12px] px-[6px] py-[4px] tracking-wide rounded">
                            Copied to clipboard
                          </span>
                        )}
                      </div>

                      <div className={`w-full flex items-center px-[24px] py-2 ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} cursor-pointer`}>
                        <AccessTimeIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} mr-[24px] font-bold`} />
                        <p className={`flex-1 text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-800'} tracking-wide`}>
                          {fullSidebarSelectedPlace?.openCloseTiming ? (
                            <>
                              {(() => {
                                const [openTime, closeTime] = fullSidebarSelectedPlace.openCloseTiming.split("–");
                                return (
                                  <>
                                    Open {openTime.trim()} <b>·</b> <span className={`${theme === 'dark' ? 'text-red-300' : 'text-red-500'}`}>Closes {closeTime?.trim() || "soon"}</span>
                                  </>
                                );
                              })()}
                            </>
                          ) : (
                            <span>Open 10am <b>·</b> <span className={`${theme === 'dark' ? 'text-red-300' : 'text-red-500'}`}>Closes 10pm</span></span>
                          )}
                        </p>
                      </div>

                      <button className={`w-full flex items-center px-[24px] py-2 ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} rounded-none`}>
                        <PaymentsIcon className={`${theme === 'dark' ? 'text-[#9dedfb]' : 'text-[#007B8A]'} mr-[24px]`} />
                        <div className="flex flex-col">
                          <p className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-800'} tracking-wide`}> {fullSidebarSelectedPlace?.priceText || "₹200 – 400"} per person</p>
                        </div>
                      </button>

                      {/*
                    <div className="group relative w-full flex items-center pl-[24px] pr-[16px] py-2 hover:bg-gray-100 cursor-pointer">
                      <AdjustIcon className="text-[#007B8A] mr-[24px]" />
  
                      <p className="flex-1 text-[14px] text-gray-800 leading-snug tracking-wide">
                        {fullSidebarSelectedPlace?.plusCode || "Plus code not available"}
                      </p>
  
                      <button
                        onClick={handleFSPlusCodeCopy}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-[6px] cursor-pointer"
                      >
                        <ContentCopyIcon style={{fontSize:"18px"}} className="text-gray-600" />
  
                        <span className="absolute left-0 top-[32px] bg-black text-white text-[12px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition tracking-wide">
                          Copy plus code
                        </span>
                      </button>
  
                      {plusCodeFSCopied && (
                        <span className="absolute right-0 -top-[24px] bg-black text-white text-[12px] px-[6px] py-[4px] tracking-wide rounded">
                          Copied to clipboard
                        </span>
                      )}
                    </div>
                    
                    
                    <button className="w-full flex items-center px-[24px] py-2 hover:bg-gray-100 rounded-none">
                      <SecurityIcon className="text-[#007B8A] mr-[24px]" />
                      <p className="text-[14px] tracking-wide text-gray-800">Claim this business</p>
                    </button>
  
                    <button className="w-full flex items-center px-[24px] py-2 hover:bg-gray-100 rounded-none">
                      <HistoryIcon className="text-[#007B8A] mr-[24px]" />
                      <p className="text-[14px] tracking-wide text-gray-800">Your Maps activity</p>
                    </button>
  
                    <button className="w-full flex items-center px-[24px] py-2 hover:bg-gray-100 rounded-none">
                      <LabelIcon className="text-[#007B8A] mr-[24px]" />
                      <p className="text-[14px] tracking-wide text-gray-800">Add a label</p>
                    </button>
  
                    <button className="w-1/2 mt-[16px] mx-auto flex items-center justify-center py-[10px] rounded-full bg-[#CCF3F9] hover:bg-gray-100 text-black text-[14px] tracking-wide font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="black"
                        className="w-4 h-4 mr-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                        />
                      </svg>
                      Suggest an edit
                    </button>
                    */}
                    </div>

                    {/*
                  <div className="bg-white pt-[16px] pb-[14px] border-b border-gray-300">
                    <h3 className="text-[16px] font-sans font-medium tracking-wide text-black mb-[14px] px-[24px] md:px-[26px]">
                      Add missing information
                    </h3>
  
                    <div className="cursor-pointer hover:bg-gray-100 p-2 ">
                      <div className="px-[18px] flex items-center gap-[24px]">
                        <CallIcon style={{fontSize:"24px"}} className="text-gray-600" />
                        <span className="text-[14.5px] tracking-wide text-gray-800">Add place's phone number</span>
                      </div>
                    </div>
  
                    <div className="cursor-pointer hover:bg-gray-100 p-2">
                      <div className="px-[18px] flex items-center gap-[24px]">
                        <AccessTimeIcon style={{fontSize:"24px"}} className="text-gray-600" />
                        <span className="text-[14.5px] tracking-wide text-gray-800">Add hours</span>
                      </div>
                    </div>
  
                    <div className="cursor-pointer hover:bg-gray-100 p-2">
                      <div className="px-[18px] flex items-center gap-[24px]">
                        <PublicIcon style={{fontSize:"24px"}} className="text-gray-600" />
                        <span className="text-[14.5px] tracking-wide text-gray-800">Add website</span>
                      </div>
                    </div>
                  </div>
                  */}

                    <div className="py-[16px] border-b border-gray-300">
                      {(fullSidebarSelectedPlace?.photos?.length ?? 0) > 0 && (
                        <div>
                          <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] px-[24px] md:px-[26px] mb-[10px]`}>
                            Menu & highlights
                          </h2>

                          <div className="flex justify-between gap-[12px] md:justify-none md:gap-[14px] mt-[18px] overflow-x-auto px-[22px] md:px-[24px]">
                            {fullSidebarSelectedPlace?.photos?.slice(0, 2).map((url: string, idx: number) => (
                              <div key={idx} className="relative flex-1 min-w-0 md:flex-none">
                                <Image
                                  src={url}
                                  alt={`Menu highlight ${idx + 1}`}
                                  width={174}
                                  height={200}
                                  unoptimized
                                  className="w-full md:w-[174px] h-[200px] object-fit rounded-lg bg-white"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="mt-[18px] flex justify-center">
                            <button
                              onClick={() => setFullSidebarActiveTab("fullSidebarMenu")}
                              className={`${theme === 'dark' ? 'text-white md:text-[#9dedfb] md:hover:text-white' : 'text-black md:text-[#007B8A] md:hover:text-black'} font-sans text-[14px] font-medium tracking-wide`}
                            >
                              See more
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-[16px] pb-[8px]">
                      <div className="px-[24px] md:px-[26px] pb-[22px] border-b border-gray-300">
                        <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] mb-[10px]`}>
                          Review summary
                        </h2>
                        <div className="flex items-center justify-between mt-[14px]">
                          {(() => {
                            const userRatingsTotal = fullSidebarSelectedPlace?.userRatingsTotal ?? 4.5;
                            const breakdown: Record<number, number> =
                              fullSidebarSelectedPlace?.ratingBreakdown as Record<number, number> ||
                              (() => {
                                if (!userRatingsTotal) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                                const base = userRatingsTotal;
                                const five = base - 0.3;
                                const four = base - 0.6;
                                const three = base - 1.5;
                                const two = base - 1;
                                const one = 2;

                                return { 5: five, 4: four, 3: three, 2: two, 1: one };
                              })();

                            return (
                              <div className="flex flex-col gap-[3px] w-[65%] md:w-[240px]">
                                {[5, 4, 3, 2, 1].map((star) => {
                                  const count = breakdown[star] || 0;
                                  const total = userRatingsTotal || 1;
                                  const percent = (count / total) * 100;

                                  return (
                                    <div key={star} className="flex items-center gap-2 text-[14px]">
                                      <span className={`w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{star}</span>
                                      <div className="flex-1 h-2 bg-gray-200 rounded">
                                        <div
                                          className="h-2 bg-yellow-400 rounded"
                                          style={{ width: `${percent}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          <div className="flex flex-col items-center gap-[6px]">
                            <span className={`text-[42px] leading-none font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                              {fullSidebarSelectedPlace?.rating?.toFixed(1)}
                            </span>
                            <StarRating rating={fullSidebarSelectedPlace?.rating || 4.5} />
                            <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'} text-[12.5px]`}>
                              {/*{fullSidebarSelectedPlace?.userRatingsTotal?.toLocaleString()} reviews*/}
                            </span>
                          </div>
                        </div>

                        <div className="mt-[22px] flex justify-center">
                          <button className={`flex items-center gap-2 px-[14px] py-2 rounded-full ${theme === 'dark' ? 'bg-[#00373e] text-white' : 'bg-[#CCF3F9] hover:bg-gray-100 text-black'} font-medium text-[14.5px] tracking-wide`}>
                            <RateReviewIcon style={{ fontSize: "18px" }} />
                            Write a review
                          </button>
                        </div>
                      </div>
                      {fullSidebarSelectedPlace?.reviews && fullSidebarSelectedPlace.reviews.length > 0 && (
                        <div>
                          <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] px-[24px] md:px-[26px] mt-[16px]`}>
                            Reviews
                          </h2>
                          {fullSidebarSelectedPlace.reviews.slice(0, 2).map((review, index) => (
                            <div
                              key={index}
                              className="border-b last:border-b-0 border-gray-300 pt-[16px] pb-[18px] last:pb-[0px] flex gap-3"
                            >
                              <div className="px-[24px] md:px-[26px]">
                                <div className="flex items-center gap-[12px]">
                                  <Image
                                    src={
                                      review.profile_photo_url
                                        ? review.profile_photo_url.replace("http://", "https://")
                                        : "https://www.gravatar.com/avatar/?d=mp&s=40"
                                    }
                                    alt={review.author_name}
                                    width={36}
                                    height={36}
                                    unoptimized
                                    onError={(e) => {
                                      e.currentTarget.src = "https://www.gravatar.com/avatar/?d=mp&s=40";
                                    }}
                                    className="w-9 h-9 rounded-full object-cover"
                                  />
                                  <span className={`font-medium text-[16px] tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                    {review.author_name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-[10px] mt-[12px]">
                                  <StarRating rating={review.rating ?? 0} />
                                  <span className={`text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                    {review.relative_time_description}
                                  </span>
                                </div>

                                {review.text && (
                                  <p className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mt-[6px]`}>
                                    {review.text}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-[14px] flex justify-center">
                        <button
                          onClick={() => setFullSidebarActiveTab("fullSidebarReviews")}
                          className={`${theme === 'dark' ? 'text-white md:text-[#9dedfb] md:hover:text-white' : 'text-black md:text-[#007B8A] md:hover:text-black'} font-sans text-[14px] font-medium tracking-wide`}
                        >
                          More reviews
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/*
              {fullSidebarActiveTab === "fullSidebarMenu" && (
                <div>
                  <h2 className="font-sans font-medium tracking-wide text-black text-[16px] mt-[6px] px-[24px] md:px-[26px]">Menu</h2>
  
                  {fullSidebarSelectedPlace?.photos?.length ? (
                    <div className="grid grid-cols-2 gap-3 mt-[20px] px-[24px] md:px-[26px]">
                      {fullSidebarSelectedPlace.photos.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Menu photo ${idx + 1}`}
                          className="w-full h-56 md:h-60 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 tracking-wide mt-[10px] px-[24px]">No menu photos available.</p>
                  )}
                </div>
              )}
              */}

                {fullSidebarActiveTab === "fullSidebarMenu" && (
                  <>
                    {availableTabs.length > 1 && (
                      <div className={`flex flex-nowrap justify-evenly gap-[12px] md:gap-[14px] px-[20px] md:px-[24px] overflow-x-auto scrollbar-hide pb-[8px] border-b ${theme === 'dark' ? 'bg-[#131313] border-gray-200' : 'bg-white border-gray-400'}`}>
                        {availableTabs.map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setmenuActiveFSTab(tab.key)}
                            className={`px-[10px] py-[6px] md:py-2 text-[13px] md:text-[14px] rounded-[10px] transition-all duration-200 cursor-pointer font-sans font-medium tracking-wide whitespace-nowrap
                                ${menuActiveFSTab === tab.key ? (theme === 'dark' ? "bg-[#2a2b2f]" : "bg-gray-300") : "bg-transparent"}
                                ${theme === 'dark' ? (menuActiveFSTab === tab.key ? "text-white" : "text-gray-200") : (menuActiveFSTab === tab.key ? "text-black" : "text-gray-600")}
                              `}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="px-0">
                      {menuActiveFSTab === "overview" && overviewFSImages.length > 0 && (
                        <>
                          <div className="border-b border-gray-300 pb-[20px]">
                            <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] my-[14px] px-[24px] md:px-[26px]`}>
                              Menu
                            </h2>

                            <div className="relative w-full px-[0px] md:px-[2px] group">
                              {menuFSImages.length > 2 && (
                                <button
                                  onClick={() => {
                                    if (menuScrollRef.current) {
                                      menuScrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
                                    }
                                  }}
                                  className={`absolute left-[12px] top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'bg-white text-black'} rounded-full shadow-md p-2 transition-all duration-200 cursor-pointer
                                  lg:opacity-0 lg:group-hover:opacity-100 ${menuLeftArrow ? "block" : "hidden"}`}
                                >
                                  <ChevronLeft size={20} />
                                </button>
                              )}
                              <div
                                ref={menuScrollRef}
                                onScroll={handleMenuScroll}
                                className="flex overflow-x-auto gap-[12px] md:gap-[10px] scroll-smooth scrollbar-hide pl-[24px]"
                              >
                                {menuFSImages.map((url, idx) => (
                                  <Image
                                    key={idx}
                                    src={url}
                                    alt={`Overview photo ${idx + 1}`}
                                    width={130}
                                    height={130}
                                    unoptimized
                                    className="flex-shrink-0 w-[130px] h-[130px] md:w-[120px] md:h-[120px] object-fit bg-white rounded-lg mr-[0px] last:mr-[24px]"
                                  />
                                ))}
                              </div>
                              {menuFSImages.length > 2 && (
                                <button
                                  onClick={() => {
                                    if (menuScrollRef.current) {
                                      menuScrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
                                    }
                                  }}
                                  className={`absolute right-[14px] top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'bg-[#2a2b2f] text-white' : 'bg-white text-black'} rounded-full shadow-md p-2 transition-all duration-200 cursor-pointer
                                  lg:opacity-0 lg:group-hover:opacity-100 ${menuRightArrow ? "block" : "hidden"}`}
                                >
                                  <ChevronRight size={20} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <h2 className={`font-sans font-medium tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'} text-[16px] mt-[18px] mb-[16px] px-[24px] md:px-[26px]`}>Highlights</h2>
                            <div className="grid grid-cols-2 gap-3 px-[24px] md:px-[26px] mb-[6px] md:mb-0">
                              {highlightFSImages.map((url, idx) => (
                                <Image
                                  key={idx}
                                  src={url}
                                  alt={`Overview photo ${idx + 1}`}
                                  width={600}
                                  height={240}
                                  unoptimized
                                  className="w-full h-56 md:h-60 object-fit rounded-lg bg-white"
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {menuFSCategories.map((cat) => {
                        const showItems = Array.isArray(cat.items) && cat.items.length > 0;
                        if (!showItems) return null;
                        if (menuActiveFSTab !== cat.name) return null;

                        return (
                          <div key={cat.name} className="space-y-4">
                            {cat.items.map((item: MenuItem, idx: number) => (
                              <div
                                key={idx}
                                className="border-b last:border-none border-gray-300 py-[12px] mb-0"
                              >
                                <div className="px-[24px] md:px-[26px] flex flex-1 justify-between">
                                  <div className="w-[75%]">
                                    <h3 className={`font-sans font-medium tracking-wide text-[14px] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                      {item.name}
                                    </h3>
                                    <p className={`text-[13px] font-sans ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-[2px]`}>
                                      {item.description}
                                    </p>
                                  </div>
                                  <div className={`text-right whitespace-nowrap font-sans font-medium ${theme === 'dark' ? 'text-white' : 'text-black'} text-[14px]`}>
                                    ₹{Number(item.price).toLocaleString("en-IN")}

                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {fullSidebarActiveTab === "fullSidebarReviews" && fullSidebarSelectedPlace && (
                  <div>
                    <div className="px-[24px] md:px-[26px] pt-[20px] pb-[20px]">
                      <div className="flex items-center justify-between">
                        {(() => {
                          const userRatingsTotal = fullSidebarSelectedPlace.userRatingsTotal ?? 4.5;
                          const breakdown: Record<number, number> =
                            fullSidebarSelectedPlace.ratingBreakdown as Record<number, number> ||
                            (() => {
                              if (!userRatingsTotal) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

                              const base = userRatingsTotal;
                              const five = base - 0.3;
                              const four = base - 0.6;
                              const three = base - 1.5;
                              const two = base - 1;
                              const one = 2;

                              return { 5: five, 4: four, 3: three, 2: two, 1: one };
                            })();

                          return (
                            <div className="flex flex-col gap-[3px] w-[65%] md:w-[250px]">
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = breakdown[star] || 0;
                                const total = userRatingsTotal || 1;
                                const percent = (count / total) * 100;

                                return (
                                  <div key={star} className="flex items-center gap-2 text-[14px]">
                                    <span className={`w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{star}</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded">
                                      <div
                                        className="h-2 bg-yellow-400 rounded"
                                        style={{ width: `${percent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        <div className="flex flex-col items-center gap-[6px]">
                          <span className={`text-[42px] leading-none font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            {fullSidebarSelectedPlace.rating?.toFixed(1)}
                          </span>
                          <StarRating rating={fullSidebarSelectedPlace.rating || 4.5} />
                          <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-500'} text-[12.5px]`}>
                            {/* {fullSidebarSelectedPlace.userRatingsTotal?.toLocaleString()} reviews */}
                          </span>
                        </div>
                      </div>

                      <div className="mt-[22px] flex justify-center">
                        <button className={`flex items-center gap-2 px-[14px] py-2 rounded-full ${theme === 'dark' ? 'bg-[#00373e] text-white' : 'bg-[#CCF3F9] hover:bg-gray-100 text-black'} font-medium text-[14.5px] tracking-wide`}>
                          <RateReviewIcon style={{ fontSize: "18px" }} />
                          Write a review
                        </button>
                      </div>
                    </div>

                    {fullSidebarSelectedPlace.reviews && fullSidebarSelectedPlace.reviews.length > 0 && (
                      <div>
                        {fullSidebarSelectedPlace.reviews.map((review, index) => (
                          <div
                            key={index}
                            className="border-t border-gray-300 pt-5 pb-5 last:pb-4 flex gap-3"
                          >
                            <div className="px-[24px] md:px-[26px]">
                              <div className="flex items-center gap-[12px]">
                                <Image
                                  src={
                                    review.profile_photo_url
                                      ? review.profile_photo_url.replace("http://", "https://")
                                      : "https://www.gravatar.com/avatar/?d=mp&s=40"
                                  }
                                  onError={(e) => (e.currentTarget.src = "https://www.gravatar.com/avatar/?d=mp&s=40")}
                                  alt={review.author_name}
                                  width={36}
                                  height={36}
                                  unoptimized
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                                <span className={`font-medium text-[16px] tracking-wide ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {review.author_name}
                                </span>
                              </div>

                              <div className="flex items-center gap-[10px] mt-[12px]">
                                <StarRating rating={review.rating ?? 0} />
                                <span className={`text-[14.5px] ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                                  {review.relative_time_description}
                                </span>
                              </div>

                              {review.text && (
                                <p className={`text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mt-[6px]`}>
                                  {review.text}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/*
              {fullSidebarActiveTab === "fullSidebarAbout" && (
                <div>
                  {Object.entries(fullSidebarAboutData).map(([category, items], idx, arr) => (
                    <div
                      key={category}
                      className={`${
                        idx !== arr.length - 1 ? "border-b border-gray-300 mb-[14px]" : ""
                      }`}
                    >
                      <div className="px-[24px] md:px-[26px] pt-[8px] pb-[22px]">
                        <h3 className="text-[14px] tracking-wide text-black font-sans font-semibold capitalize mb-[14px]">
                          {category.replace(/([A-Z])/g, " $1")}
                        </h3>
                        <ul className="grid grid-cols-2 gap-y-[10px] gap-x-[20px]">
                          {items.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-[4px] text-[14.5px] text-gray-700"
                            >
                              <CheckIcon style={{ fontSize: "18px" }} /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              */}
              </div>
            </div>
          </MobilePlaceSidebar>
        </div>
      </div>

      {/* Half Place Sidebar */}
      <div
        id="halfSidebar"
        ref={halfSidebarRef}
        style={{ height: window.innerWidth < 768 ? `${sidebarHeight}px` : "100vh", }}
        className={`fixed bg-transparent ${theme === 'dark' ? 'md:bg-[#131313] text-white' : 'md:bg-white text-black'} flex flex-col
          bottom-0 left-0 md:top-0 md:left-[70px] w-full md:w-[410px] h-[50%] md:h-full md:translate-y-0
          transition-[transform,height] duration-300 overflow-hidden
          ${placeSidebar === "half" ? "z-40" : "z-30"}
          ${placeSidebar === "half" ? "translate-y-0" : "translate-y-full"}
          ${placeSidebar === "half" ? "md:translate-x-0" : "md:-translate-x-[410px]"}
        `}
      >

        {/* <MobilePlaceSidebar isOpen={placeSidebar === "half"} initialSnap={isExploreButton ? "148px" : 0.5}> */}

        <MobilePlaceSidebar isOpen={placeSidebar === "half"} key={exploreButtonKey}>

          {/*
          {placeSidebar === "half" && (
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="md:hidden w-full py-3 flex justify-center cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1.5 bg-gray-400 rounded-full" />
            </div>
          )}
          */}

          <div className="hidden md:block py-[12px] px-[18px]">
            {searchOrigin === "sidebar" ? (
              <SidebarSearchBox
                topSidebarSearchBoxRef={secondSearchBoxRef}
                topSidebarSuggestionBoxRef={secondSuggestionBoxRef}
                inputRef={inputRef}
                sidebarSearchValue={sidebarSearchValue}
                fetchDetailedPlaces={fetchDetailedPlaces}
                setSidebarSearchValue={setSidebarSearchValue}
                showSidebarSuggestions={showSidebarSuggestions}
                setShowSidebarSuggestions={setShowSidebarSuggestions}
                sidebarCombinedList={sidebarCombinedList}
                sidebarHighlightedIndex={sidebarHighlightedIndex}
                setSidebarHighlightedIndex={setSidebarHighlightedIndex}
                placeSidebar={placeSidebar}
                topSidebar={topSidebar}
                setTopSidebar={setTopSidebar}
                setPlaceSidebar={setPlaceSidebar}
                setShowSidebar={setShowSidebar}
                setRecentSidebar={setRecentSidebar}
                handleSidebarSelectSuggestion={handleSidebarSelectSuggestion}
                setSidebarSuggestions={setSidebarSuggestions}
                setIsLocationSelected={setIsLocationSelected}
                setRecentPlaces={setRecentPlaces}
                setRelatedPlaces={setRelatedPlaces}
                mapInstanceRef={mapInstanceRef}
                recentPlaces={recentPlaces}
                markerRef={markerRef}
                sidebarMarkerRef={sidebarMarkerRef}
                clearCategoryMarkers={clearCategoryMarkers}
                keepHalfSidebarOpen={keepHalfSidebarOpen}
                setKeepHalfSidebarOpen={setKeepHalfSidebarOpen}
                sidebarHeight={sidebarHeight}
                setSidebarHeight={setSidebarHeight}
                activePlaceMarkerRemover={activePlaceMarkerRemover}
                handleShopSuggestion={handleShopSuggestion}
                searchOrigin={searchOrigin}
                setSearchOrigin={setSearchOrigin}
                noMatches={noMatches}
                setNoMatches={setNoMatches}
                allShops={allShops}
                exploreButtonFunction={exploreButtonFunction}
                closeCategoryMode={closeCategoryMode}
                restoreCategoryView={restoreCategoryView}
                setIsExploreButton={setIsExploreButton}
                resetMapForMobile={resetMapForMobile}
              />
            ) : searchOrigin === "home" ? (
              <SearchBox
                placeSidebarSearchBoxRef={halfSidebarSearchBoxRef}
                placeSidebarSuggestionBoxRef={halfSidebarSuggestionBoxRef}
                inputRef={inputRef}
                searchValue={searchValue}
                fetchDetailedPlaces={fetchDetailedPlaces}
                setSearchValue={setSearchValue}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                combinedList={combinedList}
                highlightedIndex={highlightedIndex}
                setHighlightedIndex={setHighlightedIndex}
                placeSidebar={placeSidebar}
                topSidebar={topSidebar}
                setTopSidebar={setTopSidebar}
                setPlaceSidebar={setPlaceSidebar}
                setShowSidebar={setShowSidebar}
                setRecentSidebar={setRecentSidebar}
                handleSelectSuggestion={handleSelectSuggestion}
                setSuggestions={setSuggestions}
                setIsLocationSelected={setIsLocationSelected}
                setRecentPlaces={setRecentPlaces}
                setRelatedPlaces={setRelatedPlaces}
                mapInstanceRef={mapInstanceRef}
                recentPlaces={recentPlaces}
                markerRef={markerRef}
                sidebarMarkerRef={sidebarMarkerRef}
                clearCategoryMarkers={clearCategoryMarkers}
                keepHalfSidebarOpen={keepHalfSidebarOpen}
                setKeepHalfSidebarOpen={setKeepHalfSidebarOpen}
                sidebarHeight={sidebarHeight}
                setSidebarHeight={setSidebarHeight}
                activePlaceMarkerRemover={activePlaceMarkerRemover}
                handleShopSuggestion={handleShopSuggestion}
                searchOrigin={searchOrigin}
                setSearchOrigin={setSearchOrigin}
                noMatches={noMatches}
                setNoMatches={setNoMatches}
                allShops={allShops}
                exploreButtonFunction={exploreButtonFunction}
                closeCategoryMode={closeCategoryMode}
                restoreCategoryView={restoreCategoryView}
                setIsExploreButton={setIsExploreButton}
                resetMapForMobile={resetMapForMobile}
              />
            ) : null}
          </div>

          <div ref={halfSidebarRef} className="overflow-y-auto flex-1 py-[2px]">
            <div className="pt-[2px] md:pt-[4px]">
              {relatedPlaces.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-[16px] md:px-[24px]">
                    <h1 className={`text-[20px] ${theme === 'dark' ? 'text-white' : 'text-black'} font-sans font-normal tracking-wide`}>
                      Results
                    </h1>
                    <button
                      className={`md:hidden w-[34px] h-[34px] flex items-center justify-center rounded-full hover:bg-gray-200 ${theme === 'dark' ? 'text-white' : 'text-black'} text-[17px] font-bold`}
                      onClick={() => {
                        closeButtonFunction();
                        //closeCategoryMode();
                        setIsExploreButton(false);
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {relatedPlaces.map((place, index) => {
                    const name = place.name || "Unnamed Place";
                    const category = place.cuisine || "";
                    //const category = (place.cuisine || "").split(",")[0].trim();
                    const address = place.address || "";
                    const image = place.imageUrls || [];
                    const photo = place.imageUrls[0] || "";
                    const priceRange = halfSidebarShopPrices[place.shopId] ? `${halfSidebarShopPrices[place.shopId]}` : "";
                    const shopRating = halfSidebarShopRatings[place.shopId] ?? 4.5;
                    const totalRatings = "";
                    const allPhotos = [...place.imageUrls, ...place.menu, ...(extraShopImages[place.shopId] || [])]

                    return (
                      <div
                        key={index}
                        onClick={async () => {
                          const shop = allShops.find(s => s.shopId === place.shopId);
                          if (!shop || !mapInstanceRef.current) return;

                          addToHistory(shop);

                          const position = new google.maps.LatLng(Number(shop.lat), Number(shop.lng));

                          const marker = new google.maps.Marker({
                            position,
                            map: mapInstanceRef.current,
                            title: shop.name,
                          });

                          if (activePlaceMarkerRef.current) {
                            activePlaceMarkerRef.current.setMap(null);
                          }
                          activePlaceMarkerRef.current = marker;

                          const { cuisines, itemsByCuisine } = await fetchShopCuisines(String(shop.shopId));
                          const additionalImages = await fetchShopImages(String(shop.shopId));
                          const allFSPhotos = [...shop.imageUrls || [], ...(shop.menu || []), ...additionalImages];

                          {/*Fetch shop rating*/ }
                          let shopRating: number | undefined = undefined;
                          try {
                            const fetchedRating = await fetchShopRating(shop.shopId);
                            if (fetchedRating !== null) shopRating = fetchedRating;
                          } catch (err) {
                            console.warn(`Failed to fetch rating for shop ${shop.shopId}`, err);
                          }

                          {/* Fetch shop priceText */ }
                          let shopPriceRange: string | undefined = undefined;
                          try {
                            const fetchedPrice = await fetchShopPriceText(shop.shopId);
                            if (fetchedPrice !== null) shopPriceRange = fetchedPrice;
                          } catch (err) {
                            console.warn(`Failed to fetch priceText for shop ${shop.shopId}`, err);
                          }

                          const newPlace: RecentPlace = {
                            shopId: shop.shopId,
                            title: shop.name,
                            nativeName: undefined,
                            subtitle: shop.address,
                            imageUrl: shop.imageUrls[0],
                            photos: shop.menu || [],
                            highlights: additionalImages || [],
                            allPhotos: allFSPhotos || [],
                            lat: Number(shop.lat),
                            lng: Number(shop.lng),
                            timestamp: Date.now(),
                            fullAddress: shop.address,
                            plusCode: "",
                            rating: shopRating ?? 4.5,
                            userRatingsTotal: undefined,
                            priceText: shopPriceRange ?? "₹200 – 400",
                            category: shop.cuisine || "Shop",
                            reviews: [],
                            applink: shop.applink || "",
                            about: shop.about,
                            serviceability: shop.serviceability,
                            openCloseTiming: shop.openCloseTiming,
                            cuisines: cuisines || [],
                            itemsByCuisine: itemsByCuisine || {}
                          };

                          setRecentPlaces(prev => {
                            const updated = [newPlace, ...prev.filter(p => p.title !== shop.name)];
                            const sliced = updated.slice(0, 20);
                            localStorage.setItem("recent_places", JSON.stringify(sliced));
                            return sliced;
                          });

                          setFullSidebarSelectedPlace({
                            ...newPlace,
                            isFavorite: favoritePlaceList.some((p) => p.title === newPlace.title),
                          });

                          setPlaceSidebar("full");
                          setSearchValue(shop.name);
                          setFullSidebarActiveTab("fullSidebarOverview");
                          setKeepHalfSidebarOpen(true);
                          centerPlaceOnMap(position);
                        }}
                        className={`flex items-start gap-[22px] pl-[0px] md:pl-[24px] md:pr-[20px] ${theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-200'} cursor-pointer border-b border-gray-300
                          ${index === 0 ? 'pt-[10px] pb-[14px]' : 'pt-[14px] pb-[14px]'} md:py-[14px]`}
                      >
                        <div className="hidden md:flex flex-col flex-1 overflow-hidden">
                          <div className="flex flex-row items-start justify-between gap-[12px]">
                            <div className="flex flex-col flex-1">
                              <div className="font-medium font-sans tracking-wide text-[16px] leading-snug">
                                {name}
                              </div>

                              <div className={`flex items-center text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mt-[3px]`}>
                                {shopRating && (
                                  <>
                                    <span className="font-medium">{shopRating}</span>
                                    <span className="ml-[5px]"><StarRating rating={shopRating} /></span>
                                    {totalRatings && (
                                      <span className={`ml-[5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>({totalRatings})</span>
                                    )}
                                    {priceRange && (
                                      <>
                                        <span className="mx-[4px] hidden md:inline"><b>·</b></span>
                                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'} hidden md:inline`}>₹{priceRange}</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className={`text-[14px] tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-[3px]`}>
                                {category} <b>·</b> {address}
                              </div>

                              <div className={`text-[14px] tracking-wide theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-[3px]`}>
                                {place.openCloseTiming ? (
                                  <>
                                    {(() => {
                                      const [openTime, closeTime] = place.openCloseTiming.split("–");
                                      return (
                                        <>
                                          Open {openTime.trim()} <b>·</b> <span className={` ${theme === 'dark' ? 'text-red-300' : 'text-red-500'}`}>Closes {closeTime?.trim() || "soon"}</span>
                                        </>
                                      );
                                    })()}
                                  </>
                                ) : (
                                  <span>Open 10am <b>·</b> <span className="text-red-500">Closes 10pm</span></span>
                                )}
                              </div>
                            </div>

                            {photo && (
                              <Image
                                src={photo}
                                alt={name}
                                width={85}
                                height={85}
                                unoptimized
                                className="hidden md:flex w-[85px] h-[85px] rounded-md object-cover flex-shrink-0"
                              />
                            )}
                          </div>

                          <div className="flex flex-row mt-[14px] items-center justify-between">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                halfSidebarPlaceSelect(place.shopId)
                              }}
                              className={`flex flex-row items-center gap-[4px] cursor-pointer ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} px-[12px] py-[6px] rounded-full`}
                            >
                              <MenuIcon style={{ fontSize: '20px' }} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                              <span className="text-[12px] tracking-wide font-medium">Menu</span>
                            </div>

                            <div
                              className={`flex flex-row items-center gap-[4px] cursor-pointer ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} px-[12px] py-[6px] rounded-full`}
                              aria-label={`Download "${place.name}" app`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShopDownload(place);
                              }}
                            >
                              <HiDownload style={{ fontSize: '18px' }} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                              <span className="text-[12px] tracking-wide font-medium">Order Now</span>
                            </div>

                            <div
                              className={`flex flex-row items-center gap-[4px] cursor-pointer ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} px-[12px] py-[6px] rounded-full`}
                              onClick={(e) => {
                                e.stopPropagation();

                                //const isNowFavorite = favoritePlaceList.some((p) => p.title === place.name);

                                setFavoritePlaceList((prevFavs) => {
                                  const isNowFavorite = prevFavs.some((p) => p.shopId === place.shopId);

                                  let updatedFavs;

                                  if (isNowFavorite) {
                                    updatedFavs = prevFavs.filter((p) => p.shopId !== place.shopId);
                                  } else {
                                    const favPlace: RecentPlace = {
                                      shopId: place.shopId,
                                      title: place.name,
                                      subtitle: place.address,
                                      imageUrl: place.imageUrls?.[0],
                                      photos: place.menu || [],
                                      highlights: extraShopImages?.[place.shopId] || [],
                                      lat: Number(place.lat),
                                      lng: Number(place.lng),
                                      timestamp: Date.now(),
                                      fullAddress: place.address,
                                      plusCode: "",
                                      rating: shopRating,
                                      userRatingsTotal: place.userRatingsTotal,
                                      priceText: priceRange,
                                      category: place.cuisine || "Shop",
                                      reviews: [],
                                      applink: place.applink,
                                      about: place.about,
                                      serviceability: place.serviceability,
                                      openCloseTiming: place.openCloseTiming,
                                      cuisines: place.cuisines || [],
                                      itemsByCuisine: place.itemsByCuisine || {},
                                      isFavorite: true
                                    };

                                    updatedFavs = [favPlace, ...prevFavs];
                                  }

                                  localStorage.setItem("favorite_places", JSON.stringify(updatedFavs));
                                  return updatedFavs;
                                });
                              }}
                            >
                              {favoritePlaceList.some((p) => p.title === place.name) ? (
                                <>
                                  <FavoriteIcon style={{ fontSize: "20px" }} className="text-red-500" />
                                  <span className="text-[12px] tracking-wide font-medium">Remove</span>
                                </>
                              ) : (
                                <>
                                  <FavoriteBorderIcon style={{ fontSize: "20px" }} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                                  <span className="text-[12px] tracking-wide font-medium">Favorite</span>
                                </>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHSLocationShare(place);
                              }}
                              className={`flex flex-row items-center gap-[4px] cursor-pointer ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} px-[12px] py-[6px] rounded-full`}
                            >
                              <Share2 size={18} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                              <span className="text-[12px] tracking-wide font-medium">Share</span>
                            </button>
                          </div>
                        </div>

                        {/*Mobile View*/}
                        <div className="md:hidden flex flex-col flex-1 overflow-hidden">

                          <div className="flex flex-row items-center justify-between px-[16px] w-full">
                            {/* Left Side - Shop details */}
                            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                              <div className="font-medium font-sans tracking-wide text-[16px] leading-snug mr-[16px] md:mr-[0px] break-words line-clamp-2">
                                {name}
                              </div>

                              <div className={`flex items-center text-[14px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'} mt-[3px]`}>
                                {shopRating && (
                                  <>
                                    <span className="font-medium">{shopRating}</span>
                                    <span className="ml-[5px]"><StarRating rating={shopRating} /></span>
                                    {totalRatings && (
                                      <span className={`ml-[5px] ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>({totalRatings})</span>
                                    )}
                                    {priceRange && (
                                      <>
                                        <span className="mx-[4px] inline"><b>·</b></span>
                                        <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'} inline`}>₹{priceRange}</span>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className={`text-[14px] tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-600'} mt-[3px]`}>
                                {place.openCloseTiming ? (
                                  (() => {
                                    const [openTime, closeTime] = place.openCloseTiming.split("–");
                                    return (
                                      <>
                                        Open {openTime.trim()} <b>·</b> <span className={`${theme === 'dark' ? 'text-red-300' : 'text-red-500'}`}>Closes {closeTime?.trim() || "soon"}</span>
                                      </>
                                    );
                                  })()
                                ) : (
                                  <span>Open 10am <b>·</b> <span className="text-red-500">Closes 10pm</span></span>
                                )}
                              </div>
                            </div>

                            {/* Right Side - Button*/}
                            <div
                              className="flex flex-row items-center gap-[4px] cursor-pointer bg-green-500 hover:bg-green-600 px-[12px] py-[6px] rounded-full whitespace-nowrap ml-[10px]"
                              aria-label={`Download "${place.name}" app`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShopDownload(place);
                              }}
                            >
                              <HiDownload style={{ fontSize: '18px' }} className={`${theme === 'dark' ? 'text-white' : 'text-white'}`} />
                              <span className={`text-[12px] tracking-wide font-medium ${theme === 'dark' ? 'text-white' : 'text-white'}`}>Order Now</span>
                            </div>
                          </div>

                          <div className="mt-[8px] flex gap-2 px-[16px] overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                            {Array.isArray(image) ? (
                              /* Only show up to 6 items if there are many, otherwise show all*/
                              allPhotos.slice(0, allPhotos.length > 5 ? 6 : 5).map((url, i) => {
                                const isSixth = i === 5;
                                const hasMore = allPhotos.length > 6;

                                return (
                                  <div
                                    key={i}
                                    className="relative flex-shrink-0 cursor-pointer"
                                    onClick={(e) => {
                                      if (isSixth && hasMore) {
                                        e.stopPropagation();
                                        halfSidebarPlaceSelect(place.shopId);
                                      }
                                    }}
                                  >
                                    <Image
                                      src={url}
                                      alt={`${name}-${i}`}
                                      width={85}
                                      height={85}
                                      unoptimized
                                      className="w-[85px] h-[85px] rounded-md object-fit flex-shrink-0"
                                    />

                                    {/* Show More if it's 6th image and more than 6 */}
                                    {isSixth && hasMore && (
                                      <div className="absolute inset-0 bg-black/50 rounded-md flex flex-col items-center justify-center text-white">
                                        <ImageIcon style={{ fontSize: '20px' }} />
                                        <span className="text-[12px] font-medium">More</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              photo && (
                                <Image
                                  src={photo}
                                  alt={name}
                                  width={85}
                                  height={85}
                                  unoptimized
                                  className="w-[85px] h-[85px] rounded-md object-fit flex-shrink-0"
                                />
                              )
                            )}
                          </div>

                          <div className="flex flex-row px-[16px] mt-[16px] items-center gap-[12px] overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory touch-pan-x select-none">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                halfSidebarPlaceSelect(place.shopId)
                              }}
                              className={`flex flex-row items-center gap-[4px] cursor-pointer ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} px-[12px] py-[6px] rounded-full whitespace-nowrap`}
                            >
                              <MenuIcon style={{ fontSize: '20px' }} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                              <span className="text-[12px] tracking-wide font-medium">Menu</span>
                            </div>

                            <div
                              className={`flex flex-row items-center gap-[4px] cursor-pointer ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} px-[12px] py-[6px] rounded-full whitespace-nowrap`}
                              onClick={(e) => {
                                e.stopPropagation();

                                //const isNowFavorite = favoritePlaceList.some((p) => p.title === place.name);

                                setFavoritePlaceList((prevFavs) => {
                                  const isNowFavorite = prevFavs.some((p) => p.shopId === place.shopId);

                                  let updatedFavs;

                                  if (isNowFavorite) {
                                    updatedFavs = prevFavs.filter((p) => p.shopId !== place.shopId);
                                  } else {
                                    const favPlace: RecentPlace = {
                                      shopId: place.shopId,
                                      title: place.name,
                                      subtitle: place.address,
                                      imageUrl: place.imageUrls?.[0],
                                      photos: place.menu || [],
                                      highlights: extraShopImages?.[place.shopId] || [],
                                      lat: Number(place.lat),
                                      lng: Number(place.lng),
                                      timestamp: Date.now(),
                                      fullAddress: place.address,
                                      plusCode: "",
                                      rating: shopRating,
                                      userRatingsTotal: place.userRatingsTotal,
                                      priceText: priceRange,
                                      category: place.cuisine || "Shop",
                                      reviews: [],
                                      applink: place.applink,
                                      about: place.about,
                                      serviceability: place.serviceability,
                                      openCloseTiming: place.openCloseTiming,
                                      cuisines: place.cuisines || [],
                                      itemsByCuisine: place.itemsByCuisine || {},
                                      isFavorite: true
                                    };

                                    updatedFavs = [favPlace, ...prevFavs];
                                  }

                                  localStorage.setItem("favorite_places", JSON.stringify(updatedFavs));
                                  return updatedFavs;
                                });
                              }}
                            >
                              {favoritePlaceList.some((p) => p.title === place.name) ? (
                                <>
                                  <FavoriteIcon style={{ fontSize: "20px" }} className="text-red-500" />
                                  <span className="text-[12px] tracking-wide font-medium">Remove</span>
                                </>
                              ) : (
                                <>
                                  <FavoriteBorderIcon style={{ fontSize: "20px" }} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                                  <span className="text-[12px] tracking-wide font-medium">Favorite</span>
                                </>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHSLocationShare(place);
                              }}
                              className={`flex flex-row items-center gap-[4px] cursor-pointer ${theme === 'dark' ? 'bg-[#00373e]' : 'bg-[#CCF3F9] hover:bg-gray-100'} px-[12px] py-[6px] rounded-full whitespace-nowrap`}
                            >
                              <Share2 size={18} className={`${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                              <span className="text-[12px] tracking-wide font-medium">Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className={`py-4 text-center font-sans ${theme === 'dark' ? 'text-white' : 'text-gray-700'} text-[14px] tracking-wide`}>
                    You have reached the end of the list.
                  </div>
                </>
              ) : (
                <div className="px-[24px] text-black pt-[6px]">
                  <p className="font-sans font-medium text-[17px] tracking-wide">
                    Sorry, can&apos;t find <span className="font-medium">&quot;{searchValue}&quot;</span>
                  </p>
                  <p className="font-sans mt-[6px] text-[14.5px] tracking-wide text-gray-600">
                    Make sure your search is spelled correctly. Try adding a correct restaurant name.
                  </p>
                </div>
              )}
            </div>
          </div>
        </MobilePlaceSidebar>
      </div>

      {/* Toggle thumbnail */}
      {!showRecentDetailsSidebar && (
        <div
          className={`absolute z-20 bottom-[calc(var(--safe-area-bottom,0px)+80px+max(0px,min(var(--current-sidebar-height,0px),220px)-60px))] md:bottom-5 left-[20px] md:left-[90px] w-20 h-20 rounded-[8px] overflow-hidden shadow-lg border-2 cursor-pointer group md:transition-[left] md:duration-300 md:ease-in-out transition-[bottom] duration-0 ease-linear
          ${showSidebar ? "md:left-[500px]" : ""}
          ${placeSidebar === "full" ? "md:left-[500px]" : ""}
          ${placeSidebar === "half" ? "md:left-[500px]" : ""}
          ${topSidebar === "recent" ? "md:left-[500px]" : ""}
          ${topSidebar === "saved" ? "md:left-[500px]" : ""}
          ${isSatellite ? 'border-black bg-black' : 'border-white bg-white'}`}
          onClick={() => {
            const currentType = mapInstanceRef.current?.getMapTypeId();
            const nextType =
              currentType === google.maps.MapTypeId.HYBRID
                ? google.maps.MapTypeId.ROADMAP
                : google.maps.MapTypeId.HYBRID;

            mapInstanceRef.current?.setMapTypeId(nextType);
            setIsSatellite(nextType === google.maps.MapTypeId.HYBRID);
          }}
        >
          {thumbnailUrl && (
            <>
              <Image
                src={thumbnailUrl}
                alt="Map"
                fill
                sizes="100%"
                unoptimized
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-95 rounded-[8px]"
              />
              <div
                className={`absolute bottom-0 left-0 w-full bg-transparent text-[12px] font-medium text-center py-[4px]
                  ${isSatellite ? 'text-black' : 'text-white'}`}
              >
                {isSatellite ? "Map" : "Satellite"}
              </div>
            </>
          )}
        </div>
      )}

      {/* Locate Me Button */}
      <button
        onClick={() => {
          if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const userLocation = new google.maps.LatLng(latitude, longitude);
              const map = mapInstanceRef.current;
              if (!map) return;

              if (locateMeMarkerRef.current) {
                locateMeMarkerRef.current.setPosition(userLocation);
              } else {
                locateMeMarkerRef.current = new google.maps.Marker({
                  position: userLocation,
                  map: map,
                  title: "Your Location",
                });
              }

              let nearestShop: Shop | null = null;
              let minDistance = Infinity;

              (allShops as Shop[]).forEach((shop) => {
                const d = Math.sqrt(
                  Math.pow(parseFloat(shop.lat) - latitude, 2) +
                  Math.pow(parseFloat(shop.lng) - longitude, 2)
                );
                if (d < minDistance) {
                  minDistance = d;
                  nearestShop = shop;
                }
              });

              const screenHeight = window.innerHeight;
              const screenWidth = window.innerWidth;
              const isMobileView = window.innerWidth < 768;
              let padding = { top: 0, bottom: 0, left: 0, right: 0 };
              if (screenWidth >= 1280) {
                padding = {
                  top: Math.round(screenHeight * 0.20),
                  bottom: Math.round(screenHeight * 0.0),
                  left: Math.round(screenWidth * 0.10),
                  right: Math.round(screenWidth * 0.10),
                };
              } else if (screenWidth >= 1024) {
                padding = {
                  top: Math.round(screenHeight * 0.20),
                  bottom: Math.round(screenHeight * 0.10),
                  left: Math.round(screenWidth * 0.10),
                  right: Math.round(screenWidth * 0.10),
                };
              } else if (screenWidth >= 768) {
                padding = {
                  top: Math.round(screenHeight * 0.20),
                  bottom: Math.round(screenHeight * 0.10),
                  left: Math.round(screenWidth * 0.20),
                  right: Math.round(screenWidth * 0.10),
                };
              } else {
                padding = {
                  top: Math.round(screenHeight * 0.20),
                  bottom: Math.round(screenHeight * 0.20),
                  left: Math.round(screenWidth * 0.10),
                  right: Math.round(screenWidth * 0.10),
                };
              }

              if (placeSidebar === "full" || placeSidebar === "half") {
                const sidebarId = placeSidebar === "full" ? "fullSidebar" : "halfSidebar";

                if (!isMobileView) {
                  const sidebarEl = document.getElementById(sidebarId);
                  const sidebarWidth = sidebarEl?.offsetWidth || 410;
                  if (screenWidth < 1024) {
                    padding.left = sidebarWidth + 100;
                  } else {
                    padding.left = sidebarWidth + 70;
                  }
                } else {
                  const drawerHeight = window.innerHeight * 0.5;
                  padding.bottom = drawerHeight + 20;
                  padding.top = 180;
                  padding.left = 30;
                  padding.right = 30;
                }
              }

              if (nearestShop) {
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(userLocation);
                const shopData = nearestShop as Shop;

                const shopLocation = new google.maps.LatLng(
                  parseFloat(shopData.lat),
                  parseFloat(shopData.lng)
                );

                bounds.extend(shopLocation);

                map.fitBounds(bounds, padding);
                const listener = google.maps.event.addListener(map, 'idle', () => {
                  const currentZoom = map.getZoom();
                  if (currentZoom && currentZoom > 15) {
                    map.setZoom(15);
                  }
                  google.maps.event.removeListener(listener);
                });
              } else {
                map.panTo(userLocation);
                map.setZoom(15);
              }
            },
            (error) => console.warn("Geolocation error:", error)
          );
        }}
        className={`absolute z-10 right-[20px] bottom-[calc(var(--safe-area-bottom,0px)+160px+max(0px,min(var(--current-sidebar-height,0px),220px)-60px))] 
                    md:bottom-[100px] w-[34px] h-[34px] flex items-center justify-center ${theme === 'dark' ? 'bg-[#2a2b2f]' : 'bg-white'} rounded-[8px] shadow-md hover:scale-105 md:transition-transform transition-[bottom] duration-0 ease-linear`}
      >
        <MyLocationIcon className={`${theme === 'dark' ? 'text-white' : 'text-black'} cursor-pointer`} style={{ width: 22, height: 22 }} />
      </button>

      {/* Custom Zoom Controls */}
      <div
        className={`absolute z-10 right-[20px] bottom-[calc(var(--safe-area-bottom,0px)+84px+max(0px,min(var(--current-sidebar-height,0px),220px)-60px))] 
                    md:bottom-[24px] flex flex-col ${theme === 'dark' ? 'bg-[#2a2b2f]' : 'bg-white'} rounded-[8px] shadow-md overflow-hidden transition-[bottom] duration-0 ease-linear`
        }
      >
        <button
          className="w-[34px] h-[34px] flex items-center justify-center transition-transform duration-200 ease-in cursor-pointer"
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) {
              const zoom = map.getZoom();
              if (typeof zoom === "number") {
                map.setZoom(zoom + 1);
              }
            }
          }}
        >
          <span className={`text-[22px] font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} hover:scale-110`}>
            +
          </span>
        </button>

        <div className="px-1">
          <div className={`w-full h-[1px] ${theme === 'dark' ? 'bg-gray-300' : 'bg-gray-700'}`} />
        </div>

        <button
          className="w-[34px] h-[34px] flex items-center justify-center transition-transform duration-200 ease-in cursor-pointer"
          onClick={() => {
            const map = mapInstanceRef.current;
            if (map) map.setZoom((map.getZoom() ?? 0) - 1);
          }}
        >
          <span className={`text-[22px] font-bold ${theme === 'dark' ? 'text-white' : 'text-black'} hover:scale-110`}>
            −
          </span>
        </button>
      </div>

      {/*Details sidebar's overview tab's share button toolip */}
      <div>
        {locationCopied && (
          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 bg-black z-50 text-white text-[14px] md:text-[16px] whitespace-nowrap tracking-wide font-sans font-medium px-[14px] py-[12px]">
            Copied to clipboard
          </div>
        )}
      </div>

      <div>
        {locationFSCopied && (
          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 bg-black z-50 text-white text-[14px] md:text-[16px] whitespace-nowrap tracking-wide font-sans font-medium px-[14px] py-[12px]">
            Copied to clipboard
          </div>
        )}
      </div>

      <div>
        {locationHSCopied && (
          <div className="absolute bottom-[5px] left-1/2 -translate-x-1/2 bg-black z-50 text-white text-[14px] md:text-[16px] whitespace-nowrap tracking-wide font-sans font-medium px-[14px] py-[12px] rounded-md">
            Copied to clipboard
          </div>
        )}
      </div>


      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default Map;
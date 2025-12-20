import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { RecentPlace, SidebarCombinedItem, Shop } from "./Map";

type Props = {
  topSidebarSearchBoxRef: React.RefObject<HTMLDivElement | null>;
  topSidebarSuggestionBoxRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  clearCategoryMarkers: () => void;
  keepHalfSidebarOpen: boolean;   
  setKeepHalfSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

  sidebarSearchValue: string;
  setSidebarSearchValue: (value: string) => void;

  showSidebarSuggestions: boolean;
  setShowSidebarSuggestions: (value: boolean) => void;

  sidebarCombinedList: SidebarCombinedItem[];
  sidebarHighlightedIndex: number;
  setSidebarHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;

  topSidebar: "saved" | "recent" | null;
  setTopSidebar: React.Dispatch<React.SetStateAction<"saved" | "recent" | null>>;

  placeSidebar: "full" | "half" | null;
  setPlaceSidebar: React.Dispatch<React.SetStateAction<"full" | "half" | null>>

  setShowSidebar: (val: boolean) => void;
  setRecentSidebar: (val: boolean) => void;

  handleSidebarSelectSuggestion: (placeId: string, cb?: () => void) => void;
  handleShopSuggestion: (shop: Shop, onComplete?: () => void) => void;

  //setSidebarSuggestions: React.Dispatch<React.SetStateAction<google.maps.places.AutocompletePrediction[]>>;
  setSidebarSuggestions: React.Dispatch<React.SetStateAction<Shop[]>>;
  setIsLocationSelected: React.Dispatch<React.SetStateAction<boolean>>;
  setRecentPlaces: React.Dispatch<React.SetStateAction<RecentPlace[]>>;
  setRelatedPlaces: React.Dispatch<React.SetStateAction<Shop[]>>;
  mapInstanceRef: React.RefObject<google.maps.Map | null>;
  recentPlaces: RecentPlace[];
  fetchDetailedPlaces: (results: google.maps.places.PlaceResult[]) => Promise<RecentPlace[]>;
  markerRef: React.RefObject<google.maps.Marker | null>;
  sidebarMarkerRef: React.RefObject<google.maps.Marker | null>;
  activePlaceMarkerRemover: () => void;
  searchOrigin: "home" | "sidebar" | null;
  setSearchOrigin: React.Dispatch<React.SetStateAction<"home" | "sidebar" | null>>;
  noMatches: boolean;
  setNoMatches: React.Dispatch<React.SetStateAction<boolean>>;
  allShops: Shop[];
  exploreButtonFunction: () => void;
  sidebarHeight: number;
  setSidebarHeight: React.Dispatch<React.SetStateAction<number>>;

  closeCategoryMode: () => void;
  restoreCategoryView: () => void;
  setIsExploreButton: React.Dispatch<React.SetStateAction<boolean>>;
  resetMapForMobile: () => void;
};

export default function SidebarSearchBox({
  topSidebarSearchBoxRef,
  topSidebarSuggestionBoxRef,
  inputRef,
  sidebarSearchValue,
  setSidebarSearchValue,
  showSidebarSuggestions,
  setShowSidebarSuggestions,
  sidebarCombinedList,
  sidebarHighlightedIndex,
  setSidebarHighlightedIndex,
  placeSidebar,
  setPlaceSidebar,
  setTopSidebar,
  setSidebarSuggestions,
  setIsLocationSelected,
  setRecentPlaces,
  setRelatedPlaces,
  markerRef,
  sidebarMarkerRef,
  clearCategoryMarkers,
  keepHalfSidebarOpen,
  setKeepHalfSidebarOpen,
  activePlaceMarkerRemover,
  handleShopSuggestion,
  searchOrigin,
  setSearchOrigin,
  noMatches,
  setNoMatches,
  allShops,
  exploreButtonFunction,
  setSidebarHeight,
  closeCategoryMode,
  restoreCategoryView,
  setIsExploreButton,
  resetMapForMobile,
}: Props) {
  return (
    <div className="relative" ref={topSidebarSearchBoxRef}>
      <div 
        className={`relative bg-white border w-full md:w-[375px] ${
          showSidebarSuggestions ? "border-gray-200 rounded-t-xl" : "border-gray-300 rounded-full"
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
                if (sidebarCombinedList.length > 0) {
                  e.preventDefault();
                  setSidebarHighlightedIndex((prev) => {
                    if (prev < sidebarCombinedList.length - 1) return prev + 1;
                    return -1;
                  });
                }
                return;
              }

              if (e.key === "ArrowUp") {
                if (sidebarCombinedList.length > 0) {
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
          
            className="flex-1 outline-none border-none bg-transparent text-[14.5px] pr-[18px] text-black"
          />
          <div 
            className="relative group"
            onClick={() => {
              setShowSidebarSuggestions(true);  
              inputRef.current?.focus();
            }}
          >
            <SearchIcon className="text-[#007B8A] text-[22px] cursor-pointer" />

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
                setIsExploreButton(false);
                setTopSidebar(null);
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
              <span className="text-[18px] font-bold text-[#007B8A]">✕</span>
            </div>
            <div className="pointer-events-none absolute bottom-[-42px] left-1/2 -translate-x-1/2 bg-black text-white text-[14px] px-2 py-[2px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-100">
              Close
            </div>
          </div>
        </div>
      </div>

      {showSidebarSuggestions && (
        <div ref={topSidebarSuggestionBoxRef} className="absolute top-full left-0 w-full md:w-[375px] z-20">
          <div className="bg-white shadow-lg rounded-b-xl border-t border-gray-200 pt-[8px] pb-[10px]">
            {sidebarCombinedList.length > 0 && (
              <>
              <div className="flex flex-col space-y-[0px]">
                {sidebarCombinedList.map((item, index) => {
                  const isHighlighted = sidebarHighlightedIndex === index;
                  const baseClass = `hover:bg-gray-100 cursor-pointer px-[16px] pt-[10px] pb-[12px] flex items-center justify-between ${
                    isHighlighted ? "bg-gray-100" : ""
                  }`;

                  const isInputEmpty = sidebarSearchValue.trim() === "";

                  if (item.type === "recent") {
                    const place = item.data as RecentPlace;
                    return (
                      <div
                        key={`recent-${place.lat}-${place.lng}-${place.timestamp}`}
                        className={`px-[20px] ${baseClass} group`}
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
                        <div className="flex items-center justify-between w-full group">
                          <div className={`flex items-center ${isInputEmpty ? "gap-[10px]" : "gap-[13px]"} overflow-hidden`}>
                            {isInputEmpty ? (
                              <div className="w-10 h-10 bg-[#f2f2f2] rounded-full flex items-center justify-center">
                                <AccessTimeIcon className="text-black w-6 h-6" />
                              </div>
                            ) : (
                              <div className="py-[8px] bg-transparent flex items-center justify-center">
                                <AccessTimeIcon className="w-9 h-9 text-black" style={{fontSize:"21px"}} />
                              </div>
                            )}

                            {isInputEmpty ? (
                              <div className="flex flex-col max-w-[220px]">
                                <span className="font-medium text-[14.5px] text-black truncate">
                                  {place.title}
                                </span>
                                {place.subtitle && (
                                  <span className="text-gray-600 text-[14px] truncate">
                                    {place.subtitle}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-[14.5px] text-black font-medium truncate">
                                {place.title}
                                {place.subtitle && (
                                  <span className="text-gray-500 font-normal pl-[6px]">{place.subtitle}</span>
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
                                e.stopPropagation();
                                setRecentPlaces((prev) => {
                                  const updated = prev.filter(
                                    (p) => !(p.lat === place.lat && p.lng === place.lng)
                                  );
                                  localStorage.setItem("recent_places", JSON.stringify(updated));
                                  return updated;
                                });
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-150 px-[8px] py-[4px] font-bold text-[14px] cursor-pointer rounded-full hover:bg-gray-200"
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
                            <LocationOnIcon className="text-[#007B8A]" style={{ fontSize: "21px" }} />
                          </div>
                          <span className="font-medium tracking-wide text-[14.5px] text-black truncate w-full">
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
                          setShowSidebarSuggestions(false)
                        }}
                        className={`hover:bg-gray-100 px-[12px] py-[12px] flex items-center justify-center cursor-pointer ${
                          sidebarHighlightedIndex === index ? "bg-gray-100 text-[#007B8A]" : "text-[#007B8A]"
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
              <div className="px-[20px] py-[12px] text-center text-black">
                <p className="font-medium text-[15px] text-black">
                  Sorry, can&apos;t find that place name.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

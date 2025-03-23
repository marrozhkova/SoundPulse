import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { RadioBrowserApi } from "radio-browser-api";
import { useTranslation } from "react-i18next";
import "../styles/StationsList.css";
import countries from "../data/countries.json";

export const FetchContext = createContext({
  nextStation: () => {},
  previousStation: () => {},
});

export const FetchProvider = ({ children }) => {
  const { t } = useTranslation();
  const audioRef = useRef(new Audio());

  // Search parameters
  const [lang, setLang] = useState("");
  const [country, setCountry] = useState("");
  const [limit, setLimit] = useState(300);
  const [codec, setCodec] = useState("");
  const [bitrate, setBitrate] = useState(0);

  // Station state
  const [stations, setStations] = useState([]);
  const [currentStation, setCurrentStation] = useState(null);
  const [stationGenre, setStationGenre] = useState(null);
  const [filteredStations, setFilteredStations] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Pagination state
  const [displayedStations, setDisplayedStations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  //LikeComponent.jsx
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const [showFavorites, setShowFavorites] = useState(false);

  const [displayMode, setDisplayMode] = useState("all"); // 'all', 'favorites', 'genre'
  const [searchTerm, setSearchTerm] = useState(""); // Add after other state declarations

  // Add search state
  const [searchResults, setSearchResults] = useState([]);

  // Pagination handlers
  const updateDisplayedStations = useCallback(
    (stationsArray, page) => {
      try {
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedStations = stationsArray.slice(start, end);

        setDisplayedStations(paginatedStations);
        setHasMore(stationsArray.length > end);
        setCurrentPage(page);
      } catch (error) {
        console.error("Pagination error:", error);
        setErrorMessage(t("Error updating station list"));
      }
    },
    [itemsPerPage]
  );

  const like = useCallback(() => {
    if (!currentStation) return;

    // Check if station is already in favorites
    const isAlreadyFavorite = favorites.some(
      (fav) => fav.id === currentStation.id
    );

    if (isAlreadyFavorite) {
      console.log("Station already in favorites:", currentStation.name);
      return; // Do nothing if already favorited
    }

    // Add to favorites only if not already present
    const newFavorites = [...favorites, currentStation];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    console.log("Added to favorites:", currentStation.name);
  }, [currentStation, favorites]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favouriteStations");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);
  useEffect(() => {
    console.log("Current favorites:", favorites);
  }, [favorites]);

  const deleteFavorite = useCallback((stationId) => {
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.filter((fav) => fav.id !== stationId);
      localStorage.setItem("favouriteStations", JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Add new state for disliked stations
  const [dislikedStations, setDislikedStations] = useState(() => {
    const saved = localStorage.getItem("dislikedStations");
    return saved ? JSON.parse(saved) : [];
  });

  // Add dislike handler
  const handleDislike = useCallback((station) => {
    if (!station) return;

    setDislikedStations((prev) => {
      const isDisliked = prev.some((s) => s.id === station.id);
      const newDislikes = isDisliked
        ? prev.filter((s) => s.id !== station.id)
        : [...prev, station];

      localStorage.setItem("dislikedStations", JSON.stringify(newDislikes));
      console.log("Updated disliked stations:", newDislikes);
      return newDislikes;
    });
  }, []);

  // Add isDisliked check
  const isDisliked = useCallback(
    (stationId) => {
      return dislikedStations.some((station) => station.id === stationId);
    },
    [dislikedStations]
  );

  // API setup and station fetching
  const API_SERVERS = [
    "https://de1.api.radio-browser.info",
    "https://at1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://fr1.api.radio-browser.info",
    "https://de2.api.radio-browser.info",
    "https://de3.api.radio-browser.info",
    "https://uk1.api.radio-browser.info",
    "https://uk2.api.radio-browser.info",
    "https://us1.api.radio-browser.info",
    "https://us2.api.radio-browser.info",
    "https://fi1.api.radio-browser.info",
    "https://pl1.api.radio-browser.info",
    "https://ru1.api.radio-browser.info",
    "https://ca1.api.radio-browser.info",
    "https://au1.api.radio-browser.info",
    "https://br1.api.radio-browser.info",
    "https://za1.api.radio-browser.info",
    "https://in1.api.radio-browser.info",
    "https://jp1.api.radio-browser.info",
    "https://sg1.api.radio-browser.info",
  ];
  const API_BASE_URL = API_SERVERS[0];

  const setupApi = useCallback(
    async (genre) => {
      try {
        setIsLoading(true);

        // Try each server until one works
        for (const server of API_SERVERS) {
          try {
            console.log(`Trying to fetch from: ${server}`);
            const api = new RadioBrowserApi(server, fetch.bind(window), {
              headers: {
                "User-Agent": "SoundPulse Radio/1.0",
                "Content-Type": "application/json",
              },
              mode: "cors",
            });

            const searchParams = {
              limit,
              hidebroken: true,
              ...(lang && { language: lang }),
              ...(country && { country }),
              ...(stationGenre &&
                stationGenre !== "all" && { tag: stationGenre }),
              ...(codec && { codec }),
              ...(bitrate > 0 && { bitrate }),
            };

            console.log("Fetching stations with params:", searchParams);
            const rawStations = await api.searchStations(searchParams);
            console.log(
              `Successfully fetched ${rawStations.length} stations from ${server}`
            );

            // Keep full stations array in memory
            let allStations = rawStations;

            // Filter unique stations and exclude disliked ones
            const seenNames = new Set();
            const uniqueStations = allStations.filter((station) => {
              if (!station.url || !station.name || !station.urlResolved)
                return false;
              const duplicate = seenNames.has(station.name);
              const isDislikedStation = dislikedStations.some(
                (s) => s.id === station.id
              );
              seenNames.add(station.name);
              return !duplicate && !isDislikedStation;
            });

            console.log("Filtered stations:", uniqueStations.length);
            setStations(uniqueStations);
            updateDisplayedStations(uniqueStations, 0);
            return uniqueStations;
          } catch (error) {
            console.log(`Failed to fetch from ${server}, trying next...`);
            continue;
          }
        }

        // If all servers fail
        throw new Error("All API servers failed");
      } catch (error) {
        console.error("Failed to fetch stations:", error);
        setErrorMessage(t("Failed to fetch stations"));
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [
      lang,
      country,
      stationGenre,
      limit,
      codec,
      bitrate,
      dislikedStations,
      updateDisplayedStations,
    ]
  );

  const nextPage = useCallback(() => {
    if (hasMore) updateDisplayedStations(stations, currentPage + 1);
  }, [hasMore, stations, currentPage, updateDisplayedStations]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) updateDisplayedStations(stations, currentPage - 1);
  }, [currentPage, stations, updateDisplayedStations]);

  // Audio control handlers
  const [isChangingStation, setIsChangingStation] = useState(false); // Add this state

  // Add check for disliked station
  const handleStationClick = async (station) => {
    if (isChangingStation) return;

    try {
      setIsChangingStation(true);
      setErrorMessage(t("Loading..."));
      setIsLoading(true);

      // Clear any previous error states
      setErrorMessage("");

      // Only check if station is disliked, but don't show message
      if (isDisliked(station.id)) {
        setIsPlaying(false);
        return;
      }

      // Stop and cleanup current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.removeEventListener("playing", null);
        audioRef.current.removeEventListener("error", null);
      }

      setIsPlaying(false);
      setCurrentStation(station);

      const streamUrl = station.urlResolved || station.url;
      if (!streamUrl) {
        setIsLoading(false);
        setErrorMessage(t("No valid stream URL found"));
        return;
      }

      const tryPlay = async (url) => {
        try {
          const audio = new Audio(url);
          let playbackStarted = false;

          const onPlaying = () => {
            playbackStarted = true;
            setIsPlaying(true);
            setIsLoading(false);
            setErrorMessage("");
            localStorage.setItem("lastPlayedStation", JSON.stringify(station));
          };

          const onError = () => {
            if (!playbackStarted) {
              setIsPlaying(false);
              setIsLoading(false);
              setErrorMessage(
                t("Cannot play this station. Please try another one.")
              );
            }
          };

          audio.addEventListener("playing", onPlaying);
          audio.addEventListener("error", onError);

          audioRef.current = audio;
          await audio.play();
        } catch (error) {
          throw error;
        }
      };

      await tryPlay(streamUrl);
    } catch (error) {
      console.error("Station playback failed:", error);
      setIsPlaying(false);
      setIsLoading(false);
      setErrorMessage(t("Cannot play this station. Please try another one."));
    } finally {
      setIsChangingStation(false);
    }
  };

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !currentStation) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setErrorMessage("");
          })
          .catch((error) => {
            console.error("Playback error:", error);
            setIsPlaying(false);
            setErrorMessage(t("Cannot resume playback. Please try again."));
          });
      }
    } catch (error) {
      console.error("PlayPause error:", error);
      setIsPlaying(false);
      setErrorMessage(t("Playback control failed"));
    }
  }, [currentStation, isPlaying, t]);

  // Reset function
  const resetToDefaults = useCallback(() => {
    setLang("");
    setCountry("");
    setLimit(300);
    setCodec("");
    setBitrate(0);
    setStationGenre("all");
    setCurrentStation(null);
    setCurrentPage(0);
  }, []);

  // Effects
  useEffect(() => {
    if (stations.length > 0) {
      updateDisplayedStations(stations, currentPage);
    }
  }, [itemsPerPage, stations, currentPage, updateDisplayedStations]);

  useEffect(() => {
    let mounted = true;
    const fetchStations = async () => {
      if (!stationGenre) return;
      try {
        const fetchedStations = await setupApi(stationGenre);
        if (mounted) setStations(fetchedStations);
      } catch (error) {
        if (mounted) {
          setStations([]);
          setErrorMessage(t("Failed to load stations"));
        }
      }
    };

    fetchStations();
    return () => {
      mounted = false;
    };
  }, [stationGenre, setupApi]);

  useEffect(() => {
    resetToDefaults();
    setupApi("all");
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Add effect to reset error message on mount
  useEffect(() => {
    setErrorMessage("");
  }, []);

  // Add this effect after other useEffect declarations
  useEffect(() => {
    const lastPlayedStation = localStorage.getItem("lastPlayedStation");
    if (lastPlayedStation) {
      const station = JSON.parse(lastPlayedStation);
      console.log("Loaded last played station:", station);
      setCurrentStation(station);

      // Initialize audio source without autoplay
      const streamUrl = station.urlResolved || station.url;
      if (streamUrl && audioRef.current) {
        audioRef.current.src = streamUrl;
        // Pre-load the audio
        audioRef.current.load();
      }
    } else {
      console.log("No last played station found");
    }
  }, []);

  // Add effect to log disliked stations changes
  useEffect(() => {
    console.log("Current disliked stations:", dislikedStations);
  }, [dislikedStations]);

  // Add effect to log initial disliked stations
  useEffect(() => {
    const savedDislikes = localStorage.getItem("dislikedStations");
    if (savedDislikes) {
      console.log(
        "Loaded disliked stations from storage:",
        JSON.parse(savedDislikes)
      );
    }
  }, []);

  useEffect(() => {
    if (stations.length > 0) {
      // Filter out disliked stations from current stations
      const filteredStations = stations.filter(
        (station) => !dislikedStations.some((s) => s.id === station.id)
      );
      setStations(filteredStations);
      updateDisplayedStations(filteredStations, 0);
    }
  }, [dislikedStations]); // Re-run when disliked stations change

  // Update getStationsToDisplay function
  const getStationsToDisplay = useCallback(() => {
    console.log("Current display mode:", displayMode, {
      favorites: favorites?.length,
      searchResults: searchResults?.length,
      displayed: displayedStations?.length,
      currentPage,
      itemsPerPage,
    });

    switch (displayMode) {
      case "search":
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedResults = searchResults.slice(start, end);
        setHasMore(searchResults.length > end);
        console.log("Search pagination:", {
          total: searchResults.length,
          showing: paginatedResults.length,
          start,
          end,
          page: currentPage,
          hasMore: searchResults.length > end,
        });
        return paginatedResults;

      case "favorites":
        return favorites || [];
      default:
        return displayedStations;
    }
  }, [
    displayMode,
    favorites,
    displayedStations,
    searchResults,
    currentPage,
    itemsPerPage,
  ]);

  // Update fetchTopStations with CORS and multiple servers
  const fetchTopStations = async () => {
    try {
      setIsLoading(true);

      for (const server of API_SERVERS) {
        try {
          console.log(`Trying to fetch top stations from: ${server}`);
          const response = await fetch(`${server}/json/stations/topvote/5`, {
            headers: {
              "User-Agent": "SoundPulse Radio/1.0",
              "Content-Type": "application/json",
            },
            mode: "cors",
          });

          if (!response.ok) {
            console.log(`Failed to fetch from ${server}, trying next...`);
            continue;
          }

          const data = await response.json();
          console.log(`Successfully fetched ${data.length} top stations`);
          setStations(data);
          updateDisplayedStations(data, 0);
          setCurrentPage(0);
          return;
        } catch (error) {
          console.log(`Error with ${server}:`, error);
          continue;
        }
      }

      // If all servers fail
      throw new Error("All servers failed to fetch top stations");
    } catch (error) {
      console.error("Error fetching top stations:", error);
      setErrorMessage(t("Failed to fetch top stations"));
    } finally {
      setIsLoading(false);
    }
  };

  const changeDisplayMode = useCallback(
    (mode, selectedGenre = null) => {
      setDisplayMode(mode);

      if (mode === "favorites") {
        setErrorMessage("");
        console.log("Changing to favorites mode:", {
          favorites: favorites,
          count: favorites?.length || 0,
        });
        return; // Don't modify stations or displayedStations for favorites
      }

      if (mode === "genre" && selectedGenre) {
        console.log("Changing to genre mode:", selectedGenre);
        setStationGenre(selectedGenre);
        setupApi(selectedGenre);
        return;
      }

      if (mode === "topvote") {
        console.log("Changing to top voted stations mode");
        fetchTopStations();
        return;
      }

      // For "all" mode
      console.log("Changing to all stations mode");
      setStationGenre("all");
      setupApi("all");
    },
    [favorites, setupApi, fetchTopStations]
  );

  const getRandomStation = useCallback(async () => {
    try {
      if (!stations || stations.length === 0) {
        setErrorMessage(t("No stations available"));
        return;
      }

      setIsLoading(true);
      const randomIndex = Math.floor(Math.random() * stations.length);
      const randomStation = stations[randomIndex];

      if (randomStation) {
        await handleStationClick(randomStation);
        changeDisplayMode("all"); // Reset display mode to show all stations
        console.log("Playing random station:", randomStation.name);
      }
    } catch (error) {
      console.error("Error playing random station:", error);
      setErrorMessage(t("Failed to play random station"));
    } finally {
      setIsLoading(false);
    }
  }, [stations, handleStationClick, changeDisplayMode, setErrorMessage, t]);

  // Add navigation functions
  const nextStation = useCallback(async () => {
    if (!stations.length || !currentStation) return;

    try {
      const currentIndex = stations.findIndex(
        (station) => station.id === currentStation.id
      );
      const nextIndex = (currentIndex + 1) % stations.length;
      await handleStationClick(stations[nextIndex]);
    } catch (error) {
      console.error("Next station error:", error);
      setErrorMessage(t("Failed to play next station"));
    }
  }, [currentStation, stations, handleStationClick, setErrorMessage, t]);

  const previousStation = useCallback(async () => {
    if (!stations.length || !currentStation) return;

    try {
      const currentIndex = stations.findIndex(
        (station) => station.id === currentStation.id
      );
      const prevIndex =
        currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
      await handleStationClick(stations[prevIndex]);
    } catch (error) {
      console.error("Previous station error:", error);
      setErrorMessage(t("Failed to play previous station"));
    }
  }, [currentStation, stations, handleStationClick, setErrorMessage, t]);

  // Update searchStationsByName function pagination part
  const searchStationsByName = useCallback(
    async (searchValue) => {
      if (!searchValue.trim()) {
        setDisplayMode("all");
        return;
      }

      try {
        setIsLoading(true);

        for (const server of API_SERVERS) {
          try {
            console.log(`Searching on ${server} for: "${searchValue}"`);

            const response = await fetch(
              `${server}/json/stations/search?name=${encodeURIComponent(
                searchValue
              )}&limit=100`,
              {
                headers: {
                  "User-Agent": "RadioBrowserApp/1.0",
                  "Content-Type": "application/json",
                },
                mode: "cors",
              }
            );

            if (!response.ok) {
              console.log(`Search failed on ${server}, trying next...`);
              continue;
            }

            const results = await response.json();
            console.log(`Raw results from ${server}:`, results.length);

            // Only filter for valid URLs, no dislike check
            const filteredResults = results.filter((station) => {
              if (!station.name) {
                console.log("Rejected - no name:", station);
                return false;
              }

              const hasValidUrl = Boolean(station.url || station.urlResolved);
              if (!hasValidUrl) {
                console.log("Rejected - no valid URL:", station.name);
                return false;
              }

              return true;
            });

            console.log(`Filtered results: ${filteredResults.length} stations`);

            if (filteredResults.length > 0) {
              setStations(filteredResults);
              setSearchResults(filteredResults);
              setDisplayMode("search");
              setCurrentPage(0);
              // Don't use updateDisplayedStations here, let getStationsToDisplay handle pagination
              setHasMore(filteredResults.length > itemsPerPage);
              return;
            }
          } catch (error) {
            console.log(`Error with ${server}:`, error);
            continue;
          }
        }

        throw new Error("No stations found");
      } catch (error) {
        console.error("Search error:", error);
        setErrorMessage(t("No stations found matching your search"));
        setSearchResults([]);
        setDisplayedStations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [updateDisplayedStations, t, itemsPerPage]
  );

  // Update nextSearchPage function
  const nextSearchPage = useCallback(() => {
    if (displayMode === "search") {
      const nextPage = currentPage + 1;
      const totalPages = Math.ceil(searchResults.length / itemsPerPage);
      if (nextPage < totalPages) {
        setCurrentPage(nextPage);
        console.log(`Moving to search page ${nextPage + 1} of ${totalPages}`);
      }
    }
  }, [displayMode, currentPage, searchResults.length, itemsPerPage]);

  // Update previousSearchPage function
  const previousSearchPage = useCallback(() => {
    if (displayMode === "search" && currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      console.log(`Moving to search page ${prevPage + 1}`);
    }
  }, [displayMode, currentPage]);

  // Add this function in the FetchProvider component
  const searchStationsByFilters = useCallback(
    async (filters) => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        // Trim and validate all filter values
        const trimmedFilters = Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (typeof value === "string") {
              const trimmed = value.trim();
              if (trimmed) acc[key] = trimmed;
            } else {
              acc[key] = value; // Keep non-string values (like arrays) as is
            }
            return acc;
          },
          {}
        );

        // Use imported countries data for mapping
        let countrycode = "";
        if (trimmedFilters.country) {
          const countryKey = Object.keys(countries).find(
            (key) => key.toLowerCase() === trimmedFilters.country.toLowerCase()
          );
          countrycode = countryKey
            ? countries[countryKey]
            : trimmedFilters.country.toUpperCase();
        }

        console.log(
          "Using country code:",
          countrycode,
          "for country:",
          trimmedFilters.country
        );

        for (const server of API_SERVERS) {
          try {
            const params = new URLSearchParams({
              limit: "100",
              hidebroken: true,
              ...(trimmedFilters.name && { name: trimmedFilters.name }),
              ...(countrycode && { countrycode }),
              ...(trimmedFilters.language && {
                language: trimmedFilters.language.toLowerCase(),
              }),
              ...(trimmedFilters.genre && {
                tag: trimmedFilters.genre.toLowerCase(),
              }),
              ...(trimmedFilters.bitrate && {
                bitrateMin: trimmedFilters.bitrate,
              }),
              ...(trimmedFilters.codec?.length && {
                codec: trimmedFilters.codec.join(","),
              }),
            });

            console.log(
              `Searching on ${server} with params:`,
              params.toString()
            );

            const response = await fetch(
              `${server}/json/stations/search?${params}`,
              {
                headers: {
                  "User-Agent": "RadioBrowserApp/1.0",
                  "Content-Type": "application/json",
                },
                mode: "cors",
              }
            );

            if (!response.ok) {
              console.log(`Server ${server} returned ${response.status}`);
              continue;
            }

            const results = await response.json();
            console.log(`Found ${results.length} stations on ${server}`);

            // Filter valid stations
            const filteredResults = results.filter(
              (station) => station.name && (station.url || station.urlResolved)
            );

            console.log(
              `After filtering: ${filteredResults.length} valid stations`
            );

            if (filteredResults.length > 0) {
              // Update all necessary states
              setStations(filteredResults);
              setSearchResults(filteredResults);
              setDisplayMode("search");
              setCurrentPage(0);

              // Calculate initial pagination
              const initialResults = filteredResults.slice(0, itemsPerPage);
              setDisplayedStations(initialResults);
              setHasMore(filteredResults.length > itemsPerPage);

              console.log("Search pagination initialized:", {
                total: filteredResults.length,
                showing: initialResults.length,
                hasMore: filteredResults.length > itemsPerPage,
              });

              return;
            }
          } catch (error) {
            console.log(`Error with ${server}:`, error.message);
            continue;
          }
        }

        throw new Error("No stations found");
      } catch (error) {
        console.error("Filter search error:", error.message);
        setErrorMessage(t("No stations found matching your filters"));
        setSearchResults([]);
        setDisplayedStations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage, t]
  );

  const contextValue = useMemo(
    () => ({
      // Station data
      stations,
      currentStation,
      stationGenre,
      filteredStations,
      displayedStations,

      // UI state
      isLoading,
      isPlaying,
      errorMessage,
      currentPage,
      hasMore,
      audioRef,

      // LikeComponent.jsx
      favorites,
      like,
      showFavorites,
      setShowFavorites,

      // Actions
      setIsPlaying,
      setCurrentStation,
      setStationGenre,
      setErrorMessage,
      updateDisplayedStations,
      nextPage,
      previousPage,
      setupApi,
      setLimit,
      setFilteredStations,
      resetToDefaults,
      setItemsPerPage,
      handleStationClick,
      setFavorites,

      // Display mode
      displayMode,
      changeDisplayMode,
      getStationsToDisplay,

      deleteFavorite,
      getRandomStation,
      handlePlayPause,
      fetchTopStations,

      // Dislike functionality
      handleDislike,
      isDisliked,
      dislikedStations,

      // Navigation functions
      nextStation,
      previousStation,

      // Search functionality
      searchStationsByName,
      searchTerm,
      setSearchTerm,

      // Search pagination
      nextSearchPage,
      previousSearchPage,

      // Filter search functionality
      searchStationsByFilters,
    }),
    [
      stations,
      currentStation,
      stationGenre,
      filteredStations,
      displayedStations,
      isLoading,
      isPlaying,
      errorMessage,
      currentPage,
      hasMore,
      audioRef,
      favorites,
      like,
      showFavorites,
      setShowFavorites,
      setIsPlaying,
      setCurrentStation,
      setStationGenre,
      setErrorMessage,
      updateDisplayedStations,
      nextPage,
      previousPage,
      setupApi,
      setLimit,
      setFilteredStations,
      resetToDefaults,
      setItemsPerPage,
      handleStationClick,
      setFavorites,
      displayMode,
      changeDisplayMode,
      getStationsToDisplay,
      deleteFavorite,
      getRandomStation,
      handlePlayPause,
      fetchTopStations,
      handleDislike,
      isDisliked,
      dislikedStations,
      nextStation,
      previousStation,
      searchStationsByName,
      searchTerm,
      setSearchTerm,
      nextSearchPage,
      previousSearchPage,
      searchStationsByFilters,
    ]
  );

  return (
    <FetchContext.Provider value={contextValue}>
      {children}
    </FetchContext.Provider>
  );
};

export const useFetch = () => {
  const context = useContext(FetchContext);
  if (!context) {
    throw new Error(t("useFetch must be used within a FetchProvider"));
  }
  return context;
};

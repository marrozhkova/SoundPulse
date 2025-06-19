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
  useEffect(
    (messageKey) => {
      setErrorMessage(t(messageKey));
    },
    [t]
  );

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
      (fav) => fav.stationuuid === currentStation.stationuuid
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
      const newFavorites = prevFavorites.filter(
        (fav) => fav.stationuuid !== stationId
      );
      localStorage.setItem("favouriteStations", JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Add new state for disliked stations
  const [dislikedStations, setDislikedStations] = useState(() => {
    const saved = localStorage.getItem("dislikedStations");
    return saved ? JSON.parse(saved) : [];
  });

  // Update handleDislike function to ensure proper ID handling
  const handleDislike = useCallback((station) => {
    if (!station || !station.stationuuid) return; // Changed from id to stationuuid

    setDislikedStations((prev) => {
      // Check if station is already disliked
      const isDisliked = prev.some(
        (s) => s.stationuuid === station.stationuuid
      ); // Changed from id to stationuuid

      if (isDisliked) {
        // Remove from disliked stations
        const newDislikes = prev.filter(
          (s) => s.stationuuid !== station.stationuuid
        ); // Changed from id to stationuuid
        console.log(
          `Removed station ${station.name} (UUID: ${station.stationuuid}) from dislikes`
        );
        localStorage.setItem("dislikedStations", JSON.stringify(newDislikes));
        return newDislikes;
      } else {
        // Add to disliked stations
        const newDislikes = [
          ...prev,
          { stationuuid: station.stationuuid, name: station.name },
        ]; // Changed from id to stationuuid
        console.log(
          `Added station ${station.name} (UUID: ${station.stationuuid}) to dislikes`
        );
        localStorage.setItem("dislikedStations", JSON.stringify(newDislikes));
        return newDislikes;
      }
    });
  }, []);

  // Update isDisliked function for strict ID comparison
  const isDisliked = useCallback(
    (stationId) => {
      if (!stationId) return false;
      return dislikedStations.some(
        (station) => station.stationuuid === stationId
      );
    },
    [dislikedStations]
  );

  // Update API_SERVERS to use only working HTTPS endpoints
  const API_SERVERS = [
    "https://de2.api.radio-browser.info", // Keep this as it's working
    "https://nl1.api.radio-browser.info", // Change to HTTPS
  ];

  // Update fetchWithRetry function
  const fetchWithRetry = async (endpoint, params = {}) => {
    for (const server of API_SERVERS) {
      try {
        const url = new URL(`${server}/json/${endpoint}`);
        Object.entries({
          ...params,
          hidebroken: true,
        }).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString());
          }
        });

        console.log(`Attempting fetch to: ${url.toString()}`);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": "RadioBrowser/1.0",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Basic validation only - let setupApi handle detailed filtering
        if (!Array.isArray(data)) {
          console.warn(`Invalid response format from ${server}`);
          continue;
        }

        return data; // Return raw data for further processing
      } catch (error) {
        console.error(`Fetch failed for ${server}:`, error);
        continue;
      }
    }
    throw new Error("All servers failed to respond with valid data");
  };

  // Update setupApi function with better dislike handling
  const setupApi = useCallback(
    async (genre) => {
      try {
        setIsLoading(true);

        const searchParams = {
          limit,
          hidebroken: true,
          ...(lang && { language: lang }),
          ...(country && { country }),
          ...(stationGenre && stationGenre !== "all" && { tag: stationGenre }),
          ...(codec && { codec }),
          ...(bitrate > 0 && { bitrate }),
        };

        const stations = await fetchWithRetry("stations/search", searchParams);

        // Debug logs
        console.log("First station example:", {
          id: stations[0]?.stationuuid, // Changed from id to stationuuid
          name: stations[0]?.name,
          url: stations[0]?.url,
        });

        console.log(
          "Disliked stations IDs:",
          dislikedStations.map((s) => s.stationuuid) // Changed from id to stationuuid
        );

        const validStations = stations.filter((station) => {
          // Basic validation
          if (
            !station ||
            !station.url ||
            !station.name ||
            !station.stationuuid
          ) {
            // Changed from id to stationuuid
            return false;
          }

          // Convert IDs to strings for comparison
          const stationId = String(station.stationuuid); // Changed from id to stationuuid
          const isDislikedStation = dislikedStations.some(
            (d) => String(d.stationuuid) === stationId // Changed from id to stationuuid
          );

          if (isDislikedStation) {
            console.log(
              `Station ${station.name} (UUID: ${stationId}) is disliked`
            );
          }

          return !isDislikedStation;
        });

        console.log({
          totalStations: stations.length,
          validStations: validStations.length,
          dislikedIds: dislikedStations.map((s) => s.stationuuid), // Changed from id to stationuuid
        });

        if (validStations.length === 0) {
          setErrorMessage(t("No stations available"));
          return [];
        }

        setStations(validStations);
        updateDisplayedStations(validStations, 0);
        return validStations;
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
      t,
    ]
  );

  const retryFetch = async (url, options, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;

        console.warn(
          `Attempt ${i + 1}/${maxRetries} failed with status ${response.status}`
        );
      } catch (error) {
        console.warn(`Attempt ${i + 1}/${maxRetries} failed:`, error.message);
        if (i === maxRetries - 1) throw error;
      }
      // Add exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
    throw new Error(`Failed after ${maxRetries} retries`);
  };

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
      if (isDisliked(station.stationuuid)) {
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
        (station) =>
          !dislikedStations.some((s) => s.stationuuid === station.stationuuid)
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

  const fetchTopStations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithRetry("stations/topvote/5");
      setStations(data);
      updateDisplayedStations(data, 0);
      setCurrentPage(0);
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
        (station) => station.stationuuid === currentStation.stationuuid
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
        (station) => station.stationuuid === currentStation.stationuuid
      );
      const prevIndex =
        currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
      await handleStationClick(stations[prevIndex]);
    } catch (error) {
      console.error("Previous station error:", error);
      setErrorMessage(t("Failed to play previous station"));
    }
  }, [currentStation, stations, handleStationClick, setErrorMessage, t]);

  const searchStationsByName = useCallback(
    async (searchValue) => {
      if (!searchValue.trim()) {
        setDisplayMode("all");
        return;
      }

      try {
        setIsLoading(true);
        const results = await fetchWithRetry("stations/search", {
          name: searchValue,
          limit: 100,
        });

        const filteredResults = results.filter(
          (station) => station.name && (station.url || station.urlResolved)
        );

        if (filteredResults.length > 0) {
          setStations(filteredResults);
          setSearchResults(filteredResults);
          setDisplayMode("search");
          setCurrentPage(0);
          setHasMore(filteredResults.length > itemsPerPage);
        } else {
          throw new Error("No stations found");
        }
      } catch (error) {
        console.error("Search error:", error);
        setErrorMessage(t("No stations found matching your search"));
        setSearchResults([]);
        setDisplayedStations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [itemsPerPage, t]
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
                method: "POST",
                headers: {
                  "User-Agent": "RadioBrowserApp/1.0",
                  "Content-Type": "application/json",
                },
                mode: "cors",
                redirect: "follow",
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

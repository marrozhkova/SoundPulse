import { useContext, useEffect, useState } from "react";
import { FetchContext } from "../contexts/FetchContext";
import { useTranslation } from "react-i18next";
import img from "../images/logos/SoundPulse_signet.png";
import "../styles/StationsList.css";

// Add default value for itemsPerPage
const defaultItemsPerPage = 12;

const StationsList = () => {
  const { t } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const {
    displayMode,
    getStationsToDisplay,
    currentStation,
    isLoading,
    hasMore,
    nextPage,
    previousPage,
    currentPage,
    nextSearchPage, // Add these
    previousSearchPage, // Add these
    setItemsPerPage,
    stationGenre,
    handleStationClick,
    deleteFavorite,
    favorites,
    itemsPerPage,
  } = useContext(FetchContext);

  // Add new state for favorites pagination
  const [favoritesPage, setFavoritesPage] = useState(0);
  const [displayedFavorites, setDisplayedFavorites] = useState([]);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(false);

  // Update useEffect for favorites pagination without debug logs
  useEffect(() => {
    if (displayMode === "favorites" && Array.isArray(favorites)) {
      const perPage = itemsPerPage || defaultItemsPerPage;
      const start = favoritesPage * perPage;
      const end = start + perPage;
      const slicedFavorites = favorites.slice(start, end);

      setDisplayedFavorites(slicedFavorites);
      setHasMoreFavorites(favorites.length > end);
    }
  }, [favorites, favoritesPage, itemsPerPage, displayMode]);

  // Update effect for empty page handling without debug logs
  useEffect(() => {
    if (
      displayMode === "favorites" &&
      displayedFavorites.length === 0 &&
      favoritesPage > 0
    ) {
      setFavoritesPage((prev) => prev - 1);
    }
  }, [displayedFavorites, favoritesPage, displayMode]);

  // Add navigation handlers for favorites
  const nextFavoritesPage = () => {
    if (hasMoreFavorites) {
      setFavoritesPage((prev) => prev + 1);
    }
  };

  const previousFavoritesPage = () => {
    if (favoritesPage > 0) {
      setFavoritesPage((prev) => prev - 1);
    }
  };

  // Update delete handler without debug logs
  const handleDelete = (e, stationId) => {
    e.stopPropagation();
    deleteFavorite(stationId);

    const itemsOnCurrentPage = displayedFavorites.length;
    if (itemsOnCurrentPage === 1 && favoritesPage > 0) {
      setFavoritesPage((prev) => prev - 1);
    }
  };

  // Update resize handler without debug logs
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width <= 480) {
        setItemsPerPage(6);
      } else if (width <= 768) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(12);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setItemsPerPage]);

  const stationsToDisplay = getStationsToDisplay();

  const getEmptyMessage = () => {
    switch (displayMode) {
      case "favorites":
        return t("No favorites yet");
      case "search":
      case "filter":
        return t("No stations found matching your demand"); // Generic message for both search and filter
      case "genre":
        return t("No stations found in this genre");
      default:
        return t("No stations found");
    }
  };

  // Update the isEmpty check
  const isEmpty =
    (displayMode === "favorites" && (!favorites || favorites.length === 0)) ||
    ((displayMode === "search" || displayMode === "filter") &&
      (!stationsToDisplay || stationsToDisplay.length === 0)) ||
    (displayMode === "genre" &&
      (!stationsToDisplay || stationsToDisplay.length === 0));

  // Update the showPagination check to include search mode
  const showPagination =
    (displayMode === "all" ||
      displayMode === "genre" ||
      displayMode === "search") &&
    stationsToDisplay?.length > 0 &&
    !isEmpty;

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className={`stations-container ${isEmpty ? "empty-state" : ""}`}>
      <h2 className="h2 text-center">
        {displayMode === "genre" && stationGenre
          ? `${t("Radio Stations")} - ${t(stationGenre)}`
          : displayMode === "favorites"
          ? t("My Favorites")
          : displayMode === "topvote"
          ? t("Top-5 Channels")
          : t("Radio Stations")}
      </h2>

      {isEmpty ? (
        <div className="empty-message">{getEmptyMessage()}</div>
      ) : (
        <>
          {displayMode === "favorites" ? (
            <>
              <div className="stations-list">
                {displayedFavorites?.map((station, index) => (
                  <div
                    key={index}
                    className={`station-item ${
                      currentStation?.id === station.id ? "active" : ""
                    }`}
                    onClick={() => handleStationClick(station)}
                  >
                    {displayMode === "favorites" && (
                      <div className="delete-container">
                        <button
                          className="delete-button"
                          onClick={(e) => handleDelete(e, station.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 69 14"
                            className="svgIcon bin-top"
                          >
                            <g clipPath="url(#clip0_35_24)">
                              <path
                                fill="black"
                                d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                              ></path>
                            </g>
                            <defs>
                              <clipPath id="clip0_35_24">
                                <rect
                                  fill="white"
                                  height="14"
                                  width="69"
                                ></rect>
                              </clipPath>
                            </defs>
                          </svg>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 69 57"
                            className="svgIcon bin-bottom"
                          >
                            <g clipPath="url(#clip0_35_22)">
                              <path
                                fill="black"
                                d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                              ></path>
                            </g>
                            <defs>
                              <clipPath id="clip0_35_22">
                                <rect
                                  fill="white"
                                  height="57"
                                  width="69"
                                ></rect>
                              </clipPath>
                            </defs>
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="station-logo">
                      <img
                        src={station.favicon || img}
                        alt="radiostation logo"
                      />
                    </div>
                    <div className="station-description">
                      <p className="text-m">{station.name}</p>
                      <p className="text-xs">
                        {station.country}:
                        {truncateText(
                          Array.isArray(station.tags)
                            ? station.tags.join(", ")
                            : typeof station.tags === "string"
                            ? station.tags
                                .split(/(?=[A-Z])/)
                                .join(", ")
                                .toLowerCase()
                            : station.tags,
                          150
                        )}
                      </p>
                      <p className="text-xs">
                        {station.codec} • {station.bitrate}kbps
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Update the favorites pagination controls */}
              {favorites?.length > (itemsPerPage || defaultItemsPerPage) && (
                <div className="pagination-controls">
                  {/* Only show Previous button if not on first page */}
                  {favoritesPage > 0 && (
                    <button
                      className="button button-next-prev"
                      onClick={previousFavoritesPage}
                    >
                      {t("Previous")}
                    </button>
                  )}
                  {/* Only show Next button if there are more favorites */}
                  {hasMoreFavorites && (
                    <button
                      className="button button-next-prev"
                      onClick={nextFavoritesPage}
                    >
                      {t("Next")}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="stations-list">
                {stationsToDisplay?.map((station, index) => (
                  <div
                    key={index}
                    className={`station-item ${
                      currentStation?.id === station.id ? "active" : ""
                    }`}
                    onClick={() => handleStationClick(station)}
                  >
                    {" "}
                    {displayMode === "favorites" && (
                      <button
                        className="delete-button"
                        onClick={(e) => handleDelete(e, station.id)}
                      >
                        <MdDelete size={24} />
                      </button>
                    )}
                    <div className="station-logo">
                      <img
                        src={station.favicon || img}
                        alt="radiostation logo"
                      />
                    </div>
                    <div className="station-description">
                      <p className="text-m">{station.name}</p>
                      <p className="text-xs">
                        {station.country}:{" "}
                        {truncateText(
                          Array.isArray(station.tags)
                            ? station.tags.join(", ")
                            : typeof station.tags === "string"
                            ? station.tags
                                .split(/(?=[A-Z])/)
                                .join(", ")
                                .toLowerCase()
                            : station.tags,
                          150
                        )}
                      </p>
                      <p className="text-xs">
                        {station.codec} • {station.bitrate}kbps
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Update the pagination controls section */}
              {showPagination && displayMode !== "topvote" && (
                <div className="pagination-controls">
                  {currentPage > 0 && (
                    <button
                      className="button button-next-prev"
                      onClick={
                        displayMode === "search"
                          ? previousSearchPage
                          : previousPage
                      }
                      disabled={isLoading}
                    >
                      {t("Previous")}
                    </button>
                  )}
                  {hasMore && (
                    <button
                      className="button button-next-prev"
                      onClick={
                        displayMode === "search" ? nextSearchPage : nextPage
                      }
                      disabled={isLoading}
                    >
                      {t("Next")}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StationsList;

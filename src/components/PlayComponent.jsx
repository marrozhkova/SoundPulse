import "../styles/PlayComponent.css";
import { FetchContext } from "../contexts/FetchContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const PlayComponent = () => {
  // Translations and context
  const { t } = useTranslation();
  const {
    currentStation,
    isLoading,
    isPlaying,
    togglePlay,
    handleStationClick,
    displayedStations,
    errorMessage,
  } = useContext(FetchContext);

  // Control handlers
  const handlePlayPause = () => {
    if (!currentStation || isLoading) return;
    togglePlay();
  };

  // Navigation handler
  const changeStation = (direction) => {
    if (!displayedStations.length) return;

    const currentIndex = displayedStations.findIndex(
      (station) => station.id === currentStation?.id
    );

    let newIndex;
    if (direction === -1 && currentIndex === 0) {
      newIndex = displayedStations.length - 1;
    } else if (
      direction === 1 &&
      currentIndex === displayedStations.length - 1
    ) {
      newIndex = 0;
    } else {
      newIndex = currentIndex + direction;
    }

    handleStationClick(displayedStations[newIndex]);
  };

  // Format tags helper
  const formatTags = (tags) => {
    if (Array.isArray(tags)) return tags.join(", ");
    if (typeof tags === "string") {
      return tags
        .split(/(?=[A-Z])/)
        .join(", ")
        .toLowerCase();
    }
    return tags;
  };

  return (
    <>
      {/* Player controls */}
      <div className="play-component">
        <button
          onClick={handlePlayPause}
          disabled={!currentStation || isLoading}
          className={isPlaying ? "playing" : ""}
        >
          {isPlaying ? t("Pause") : t("Play")}
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="previous-component">
        <button onClick={() => changeStation(-1)}>{t("Previous")}</button>
      </div>
      <div className="next-component">
        <button onClick={() => changeStation(1)}>{t("Next")}</button>
      </div>

      {/* Station information */}
      <div className="information-component">
        {errorMessage ? (
          <p className="error-message">{errorMessage}</p>
        ) : (
          currentStation && (
            <>
              <h3>{currentStation.name}</h3>
              <p>
                {currentStation.country}: {formatTags(currentStation.tags)}
              </p>
              <p>
                {currentStation.codec} • {currentStation.bitrate}kbps
              </p>
            </>
          )
        )}
      </div>
    </>
  );
};

export default PlayComponent;

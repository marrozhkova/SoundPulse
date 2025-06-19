import {
  EmailShareButton,
  FacebookShareButton,
  HatenaShareButton,
  InstapaperShareButton,
  LineShareButton,
  LinkedinShareButton,
  LivejournalShareButton,
  MailruShareButton,
  OKShareButton,
  PinterestShareButton,
  PocketShareButton,
  RedditShareButton,
  TelegramShareButton,
  ThreadsShareButton,
  BlueskyShareButton,
  ViberShareButton,
  VKShareButton,
  WhatsappShareButton,
  WorkplaceShareButton,
  EmailIcon,
  BlueskyIcon,
  FacebookIcon,
  HatenaIcon,
  InstapaperIcon,
  LineIcon,
  LinkedinIcon,
  LivejournalIcon,
  MailruIcon,
  OKIcon,
  PinterestIcon,
  PocketIcon,
  RedditIcon,
  TelegramIcon,
  ThreadsIcon,
  ViberIcon,
  VKIcon,
  WhatsappIcon,
  WorkplaceIcon,
} from "react-share";
import React, { useContext } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaHeart,
  FaThumbsDown,
  FaShare,
} from "react-icons/fa";
import VolumeController from "./VolumeController";
import { FetchContext } from "../contexts/FetchContext";
import { UserContext } from "../contexts/UserContext";
import "../styles/Player.css";
import player from "/player.webp";

const Player = ({ audio }) => {
  const { t } = useTranslation();
  const {
    currentStation,
    isLoading,
    isPlaying,
    handlePlayPause,
    errorMessage,
    stations,
    nextStation,
    previousStation,
    isDisliked,
    handleStationClick,
    handleDislike,
    like,
  } = useContext(FetchContext);
  const { isAuthenticated } = useContext(UserContext);
  const handleLike = () => {
    if (currentStation) {
      like();
      console.log("Liking current station:", currentStation);
    }
  };

  const onDislike = () => {
    if (currentStation) {
      handleDislike(currentStation);
      console.log("Disliking current station:", currentStation);

      if (isPlaying) {
        handleNextStation();
      }
    }
  };
  const url = window.location.href;
  const size = 32;
  const [isShare, setIsShare] = useState(false);
  const containerRef = useRef(null);
  const shareButtonRef = useRef(null);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    setIsShare((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareButtonRef.current?.contains(event.target)) {
        return;
      }
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsShare(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsShare(false);
      }
    };

    if (isShare) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscKey);
      };
    }
  }, [isShare]);

  const [lastSuccessfulIndex, setLastSuccessfulIndex] = useState(-1);

  const handleNextStation = async () => {
    try {
      if (!stations?.length) {
        console.log("No stations available");
        return;
      }

      let currentIndex = currentStation
        ? stations.findIndex(
            (s) => s.stationuuid === currentStation.stationuuid
          )
        : lastSuccessfulIndex;

      if (currentIndex < 0 || currentIndex >= stations.length) {
        currentIndex = -1;
      }

      console.log("Next station clicked, current index:", currentIndex);

      const targetIndex = (currentIndex + 1) % stations.length;
      console.log(`Moving to station index: ${targetIndex}`);

      try {
        await handleStationClick(stations[targetIndex]);
        setLastSuccessfulIndex(targetIndex);
      } catch (error) {
        console.log("Station failed, trying next one");
        if (targetIndex + 1 < stations.length) {
          await handleStationClick(stations[targetIndex + 1]);
          setLastSuccessfulIndex(targetIndex + 1);
        }
      }
    } catch (error) {
      console.error("Error changing station:", error);
    }
  };

  const handlePreviousStation = async () => {
    try {
      if (!stations?.length) {
        console.log("No stations available");
        return;
      }

      let currentIndex = currentStation
        ? stations.findIndex(
            (s) => s.stationuuid === currentStation.stationuuid
          )
        : lastSuccessfulIndex;

      if (currentIndex < 0 || currentIndex >= stations.length) {
        currentIndex = stations.length;
      }

      console.log("Previous station clicked, current index:", currentIndex);

      const targetIndex =
        currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
      console.log(`Moving to station index: ${targetIndex}`);

      try {
        await handleStationClick(stations[targetIndex]);
        setLastSuccessfulIndex(targetIndex);
      } catch (error) {
        console.log("Station failed, trying previous one");
        if (targetIndex > 0) {
          await handleStationClick(stations[targetIndex - 1]);
          setLastSuccessfulIndex(targetIndex - 1);
        }
      }
    } catch (error) {
      console.error("Error changing station:", error);
    }
  };

  useEffect(() => {
    if (currentStation && stations?.length) {
      const index = stations.findIndex(
        (s) => s.stationuuid === currentStation.stationuuid
      );
      if (index !== -1) {
        setLastSuccessfulIndex(index);
      }
    }
  }, [currentStation, stations]);

  const truncateStationName = (name) => {
    if (name.length > 28) {
      return name.substring(0, 28) + "...";
    }
    return name;
  };

  return (
    <div className="padding-section">
      <div className="player-container ">
        <img src={player} alt="Player" className="player-background" />

        <div className="now-playing-info">
          <div className="station-content">
            <div className="station-text">
              {isLoading ? (
                <p className="message loading">{t("Loading...")}</p>
              ) : errorMessage ? (
                <p className="message error">{errorMessage}</p>
              ) : currentStation ? (
                <>
                  <h3 title={currentStation.name}>
                    {truncateStationName(currentStation.name)}
                  </h3>
                  <p className="station-country">{currentStation.country}</p>
                  <p className="quality">
                    {currentStation.codec} • {currentStation.bitrate}kbps
                  </p>
                </>
              ) : (
                <p className="message select">
                  {t("Select a station to play")}
                </p>
              )}
            </div>
            {currentStation && (
              <div className="station-actions">
                <button
                  className="action-button like-button"
                  onClick={handleLike}
                  disabled={!isAuthenticated}
                >
                  <FaHeart size={24} />
                </button>
                <button
                  className={`action-button dislike-button ${
                    isDisliked(currentStation?.stationuuid) ? "active" : ""
                  }`}
                  onClick={onDislike}
                  disabled={!isAuthenticated}
                >
                  <FaThumbsDown size={24} />
                </button>
                <button
                  onClick={handleShare}
                  className={`action-button share-button ${
                    isShare ? "active" : ""
                  }`}
                  ref={shareButtonRef}
                >
                  <FaShare size={24} />
                </button>
                {isShare && (
                  <div className="socialShare" ref={containerRef}>
                    <EmailShareButton
                      url={url}
                      subject="Check this out"
                      size={size}
                    >
                      <EmailIcon size={size} round />
                    </EmailShareButton>
                    <FacebookShareButton url={url} size={size}>
                      <FacebookIcon size={size} round />
                    </FacebookShareButton>
                    <HatenaShareButton url={url} size={size}>
                      <HatenaIcon size={size} round />
                    </HatenaShareButton>
                    <InstapaperShareButton url={url} size={size}>
                      <InstapaperIcon size={size} round />
                    </InstapaperShareButton>
                    <LineShareButton url={url} size={size}>
                      <LineIcon size={size} round />
                    </LineShareButton>
                    <LinkedinShareButton url={url} size={size}>
                      <LinkedinIcon size={size} round />
                    </LinkedinShareButton>
                    <LivejournalShareButton url={url} size={size}>
                      <LivejournalIcon size={size} round />
                    </LivejournalShareButton>
                    <MailruShareButton url={url} size={size}>
                      <MailruIcon size={size} round />
                    </MailruShareButton>
                    <OKShareButton url={url} size={size}>
                      <OKIcon size={size} round />
                    </OKShareButton>
                    <PinterestShareButton url={url} size={size}>
                      <PinterestIcon size={size} round />
                    </PinterestShareButton>
                    <PocketShareButton url={url} size={size}>
                      <PocketIcon size={size} round />
                    </PocketShareButton>
                    <RedditShareButton url={url} size={size}>
                      <RedditIcon size={size} round />
                    </RedditShareButton>
                    <TelegramShareButton url={url} size={size}>
                      <TelegramIcon size={size} round />
                    </TelegramShareButton>
                    <ThreadsShareButton url={url} size={size}>
                      <ThreadsIcon size={size} round />
                    </ThreadsShareButton>
                    <BlueskyShareButton url={url} size={size}>
                      <BlueskyIcon size={size} round />
                    </BlueskyShareButton>
                    <ViberShareButton url={url} size={size}>
                      <ViberIcon size={size} round />
                    </ViberShareButton>
                    <VKShareButton url={url} size={size}>
                      <VKIcon size={size} round />
                    </VKShareButton>
                    <WhatsappShareButton url={url} size={size}>
                      <WhatsappIcon size={size} round />
                    </WhatsappShareButton>
                    <WorkplaceShareButton url={url} size={size}>
                      <WorkplaceIcon size={size} round />
                    </WorkplaceShareButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="volume-controller-position">
          <VolumeController audio={audio} />
        </div>

        <button
          className="previous-button"
          onClick={handlePreviousStation}
          disabled={!stations?.length}
        >
          <FaStepBackward size={24} />
        </button>

        <button
          className="play-button"
          onClick={handlePlayPause}
          disabled={
            !currentStation ||
            isLoading ||
            isDisliked(currentStation?.stationuuid)
          }
        >
          {isPlaying ? (
            <FaPause size={30} className="fa-pause" />
          ) : (
            <FaPlay size={30} className="fa-play" />
          )}
        </button>

        <button
          className="next-button"
          onClick={handleNextStation}
          disabled={!stations?.length}
        >
          <FaStepForward size={24} />
        </button>
      </div>
    </div>
  );
};

export default Player;

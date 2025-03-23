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
import { useState, useEffect, useRef } from "react";
import "../styles/LikeComponent.css";
import { useContext } from "react";
import { FetchContext } from "../contexts/FetchContext";

const LikeComponent = () => {
  const { like, currentStation, handleDislike, isDisliked, favorites } =
    useContext(FetchContext);

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
    }
  };

  const url = window.location.href;
  const size = 32;
  const [isShare, setIsShare] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsShare(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleShare = () => {
    setIsShare(!isShare);
    // console.log("Share state:", !isShare);
  };

  return (
    <div ref={containerRef} className="buttons-container">
      <button onClick={handleShare} className={`${isShare ? "active" : ""}`}>
        Share
      </button>
      <button
        onClick={handleLike}
        className={
          currentStation &&
          favorites?.some((fav) => fav.id === currentStation.id)
            ? "active"
            : ""
        }
      >
        Like
      </button>
      <button
        onClick={onDislike}
        className={isDisliked(currentStation?.id) ? "active" : ""}
      >
        Dislike
      </button>
      {isShare && (
        <div className="socialShare">
          <EmailShareButton url={url} subject="Check this out" size={size}>
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
  );
};
export default LikeComponent;

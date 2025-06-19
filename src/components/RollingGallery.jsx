import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useAnimation,
  useTransform,
} from "framer-motion";
import { useContext } from "react";
import { FetchContext } from "../contexts/FetchContext";
import "../styles/RollingGallery.css";

import all from "/carousal/all.webp";
import classical from "/carousal/classical.webp";
import country from "/carousal/country.webp";
import dance from "/carousal/dance.webp";
import disco from "/carousal/disco.webp";
import house from "/carousal/house.webp";
import jazz from "/carousal/jazz.webp";
import pop from "/carousal/pop.webp";
import retro from "/carousal/retro.webp";
import rock from "/carousal/rock.webp";
import ska from "/carousal/ska.webp";
import blues from "/carousal/blues.webp";
import reggae from "/carousal/reggae.webp";

const IMGS = [
  all,
  classical,
  country,
  dance,
  disco,
  house,
  jazz,
  pop,
  retro,
  rock,
  ska,
  blues,
  reggae,
];

const getDragFactor = () => {
  if (window.innerWidth >= 1440) return 0.02;
  if (window.innerWidth >= 1024) return 0.015;
  if (window.innerWidth >= 768) return 0.012;
  return 0.01;
};

const RollingGallery = ({ autoplay = false, pauseOnHover = false }) => {
  const { setStationGenre, changeDisplayMode } = useContext(FetchContext);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const [isScreenSizeSm, setIsScreenSizeSm] = useState(
    window.innerWidth <= 640
  );

  // Layout calculations - updated
  const SINGLE_IMAGE_WIDTH =
    window.innerWidth >= 1440
      ? 160
      : window.innerWidth >= 1024
      ? 140
      : window.innerWidth >= 768
      ? 120
      : 100;

  const MIN_SPACING = 10;
  const baseWidth = containerWidth;
  const circumference = Math.PI * baseWidth;

  // Updated optimal count calculation
  const calculateOptimalCount = () => {
    const minImages =
      window.innerWidth >= 1440
        ? 16
        : window.innerWidth >= 1024
        ? 14
        : window.innerWidth >= 768
        ? 12
        : 10;
    const maxImages = IMGS.length * 3; // Increased maximum images for larger screens

    // Calculate based on circumference and fixed spacing
    const count = Math.floor(
      circumference / (SINGLE_IMAGE_WIDTH + MIN_SPACING)
    );

    // Ensure count is within bounds and is even
    return Math.max(minImages, Math.min(maxImages, Math.floor(count / 2) * 2));
  };

  const optimalImageCount = calculateOptimalCount();
  const repeatedImages = Array(optimalImageCount)
    .fill(0)
    .map((_, index) => IMGS[index % IMGS.length]);

  const faceCount = repeatedImages.length;
  const faceWidth = SINGLE_IMAGE_WIDTH;
  const spacing = MIN_SPACING;
  const radius = baseWidth / 2;
  const dragFactor = getDragFactor();

  // Motion controls
  const rotation = useMotionValue(0);
  const controls = useAnimation();
  const transform = useTransform(
    rotation,
    (value) => `rotate3d(0, 1, 0, ${value}deg)`
  );

  // Event handlers
  const handleGenreSelect = (url) => {
    const genre = url.split("/").pop().split(".")[0];
    changeDisplayMode("genre", genre);
  };

  const handleDrag = (_, info) =>
    rotation.set(rotation.get() + info.offset.x * dragFactor);

  const handleDragEnd = (_, info) => {
    controls.start({
      rotateY: rotation.get() + info.velocity.x * dragFactor,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20,
        mass: 0.1,
        ease: "easeOut",
      },
    });
  };

  const handleMouseEnter = () => {
    if (!autoplay || !pauseOnHover) return;
    const currentRotation = rotation.get();
    controls.start({
      rotateY: [currentRotation, currentRotation - 360],
      transition: {
        duration: 200,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  };

  const handleMouseLeave = () => {
    if (!autoplay || !pauseOnHover) return;
    const currentRotation = rotation.get();
    controls.start({
      rotateY: [currentRotation, currentRotation - 360],
      transition: {
        duration: 50,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
  };

  const getItemStyle = (index) => ({
    width: `${faceWidth}px`,
    transform: `rotateY(${
      index * (360 / faceCount)
    }deg) translateZ(${radius}px)`,
    margin: `0 ${spacing}px`,
  });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setIsScreenSizeSm(window.innerWidth <= 640);
      }
    };

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    updateWidth();
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    controls.start({
      rotateY: [0, -360],
      transition: {
        duration: 50,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    });
    return () => controls.stop();
  }, [autoplay, controls]);

  return (
    <div className="gallery-container padding-section" ref={containerRef}>
      <div className="gallery-gradient gallery-gradient-left" />
      <div className="gallery-gradient gallery-gradient-right" />
      <div className="gallery-content">
        <motion.div
          drag="x"
          className="gallery-track"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform,
            rotateY: rotation,
            width: "100%",
            transformStyle: "preserve-3d",
          }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          {repeatedImages.map((url, i) => (
            <div key={i} className="gallery-item" style={getItemStyle(i)}>
              <img
                src={url}
                alt="gallery"
                className="gallery-img"
                onClick={() => handleGenreSelect(url)}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RollingGallery;

import { useEffect, useRef, useState } from "react";
import "../styles/VolumeController.css";

const VolumeController = ({ audio }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const circleRef = useRef(null);
  const dotRef = useRef(null);

  // Position handlers
  const updateDotPosition = (angle) => {
    if (!circleRef.current || !dotRef.current) return;

    const radius = 40;
    const centerOffset = 50;
    const adjustedAngle = angle - Math.PI / 2;

    const dotX = centerOffset + radius * Math.cos(adjustedAngle);
    const dotY = centerOffset + radius * Math.sin(adjustedAngle);

    dotRef.current.style.left = `${dotX}%`;
    dotRef.current.style.top = `${dotY}%`;
    dotRef.current.style.transform = "translate(-50%, -50%)";
  };

  const calculateAngle = (e) => {
    if (!circleRef.current) return 0;

    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;

    let angle = Math.atan2(y, x) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  };

  const updateVolume = (e) => {
    const angle = calculateAngle(e);
    const normalizedVolume = (angle / (2 * Math.PI) + 0.75) % 1;
    setVolume(normalizedVolume);
    updateDotPosition(angle);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        updateVolume(e);
      }
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const initialAngle = volume * 2 * Math.PI;
    updateDotPosition(initialAngle);
  }, []);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
      const angle = ((volume - 0.75) * 2 * Math.PI) % (2 * Math.PI);
      updateDotPosition(angle);
    }
  }, [audio, volume]);

  return (
    <div className="volume-container">
      <div className="controller">
        <div
          className="circle"
          ref={circleRef}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            updateVolume(e);
          }}
        >
          <div
            className="dot"
            ref={dotRef}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
          />
          <div className="volume-display">{Math.round(volume * 100)}%</div>
        </div>
      </div>
    </div>
  );
};

export default VolumeController;

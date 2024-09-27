import React, { useState, useEffect } from "react";
import { Camera, Eye, Brain, Fingerprint } from "lucide-react";
<style>
  @import url('https://fonts.googleapis.com/css2?family=Anta&display=swap');
</style>;

const AnimatedSherlock = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const letters = "SHERLOCK".split("");
  const icons = [Camera, Eye, Brain, Fingerprint];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500); // Duration of the wave animation
    }, 2000); // Interval between animations

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sherlock-container">
      <img src="img/sherlock.png" className="sherlock-image" alt="Sherlock" />
      <div className="letter-container">
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`letter ${isAnimating ? "animate" : ""}`}
            style={{ "--index": index }}
          >
            {letter}
          </span>
        ))}
      </div>
      <style jsx>{`
        .sherlock-container {
          display: flex;
          align-items: center; /* Ensures image and text are vertically centered */
          height: 50px; /* Adjust as needed for desired height */
          justify-content: center;
        }
        .sherlock-image {
          width: 50px; /* Ensures the image matches the height of the text */
          height: 50px;
          object-fit: contain; /* Ensures the image scales proportionally */
        }
        .letter-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .letter {
          font-family: "Anta", sans-serif;
          font-size: 35px; /* Adjust to match the image size */
          font-weight: bold;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 5px;
          position: relative;
          transition: all 0.2s ease;
        }
        .letter.animate {
          animation: waveAnimation 0.5s ease-in-out;
          animation-fill-mode: forwards;
          animation-delay: calc(var(--index) * 0.05s);
        }
        @keyframes waveAnimation {
          0% {
            transform: translateY(0) scale(1);
            color: rgba(255, 255, 255, 0.7);
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            color: rgba(255, 255, 255, 1);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          }
          100% {
            transform: translateY(0) scale(1);
            color: rgba(255, 255, 255, 0.7);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedSherlock;

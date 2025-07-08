import { useState } from "react";
import styles from "../css/Tooltip.module.css";

const Tooltip = ({
  children,
  text,
  position = "top",
  delay = 300,
  className = "",
  theme = "default",
  size = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getTooltipClasses = () => {
    const baseClasses = `${styles.tooltip} ${styles[position]} ${styles[theme]}`;
    return size ? `${baseClasses} ${styles[size]}` : baseClasses;
  };

  const getArrowClasses = () => {
    return `${styles.arrow} ${styles[`arrow-${position}`]} ${
      styles[`arrow-${theme}`]
    }`;
  };

  return (
    <div className={styles.container}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className={className}
      >
        {children}
      </div>

      {isVisible && (
        <div className={getTooltipClasses()}>
          {text}
          <div className={getArrowClasses()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

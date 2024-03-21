import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

const ThemeToggleImage = ({
  darkImg,
  lightImg,
  alt,
  width = "100%",
  centerInDiv = false,
}) => {
  const { colorMode } = useColorMode();

  if (centerInDiv) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={colorMode === "dark" ? darkImg : lightImg}
          alt={alt}
          width={width}
        />
      </div>
    );
  } else {
    return (
      <img
        src={colorMode === "dark" ? darkImg : lightImg}
        alt={alt}
        width={width}
      />
    );
  }
};

export default ThemeToggleImage;

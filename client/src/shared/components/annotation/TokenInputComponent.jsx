import { TextField } from "@mui/material";
import { getTokenWidth } from "../../utils/token";

const TokenInputComponent = ({
  token,
  tokenRef,
  tokenIndex,
  onChange,
  onContextMenu,
  onClick,
  tokenColor,
  tokenBgColor,
}) => {
  // Fallback function that does nothing if no handler is provided
  const noop = () => {};
  return (
    <TextField
      sx={{
        textAlign: "center",
        "::selection": {
          background: "transparent",
        },
        "& .MuiInputBase-input": {
          textAlign: "center",
          width: token.currentValue
            ? getTokenWidth(token.currentValue)
            : "auto", // Adjust getTokenWidth to handle undefined
          color: tokenColor,
          backgroundColor: tokenBgColor,
          borderRadius: "4px",
        },
        "& .MuiInputBase-root": {
          disableUnderline: true,
        },
      }}
      ref={tokenRef}
      variant="standard"
      tokenindex={tokenIndex}
      key={token._id}
      onChange={onChange || noop}
      autoComplete="off"
      value={token.currentValue}
      InputProps={{
        disableUnderline: true,
      }}
      title={`value: ${token.value} | replacement: ${token.replacement} | suggestion: ${token.suggestion}`}
      onContextMenu={onContextMenu || noop}
      contextMenu="none"
      onClick={onClick || noop}
    />
  );
};

export default TokenInputComponent;

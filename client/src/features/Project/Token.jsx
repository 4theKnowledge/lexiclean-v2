import { useState, useEffect, useContext, useRef } from "react";
import {
  Typography,
  Stack,
  TextField,
  Popover,
  Divider,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditPopover from "./EditPopover";
import { alpha } from "@mui/material/styles";
import { ProjectContext } from "../../shared/context/ProjectContext";
import { getTokenWidth } from "../../shared/utils/token";
import SpanEntityAnnotation from "./SpanEntityAnnotation";
import { useTheme } from "@mui/material/styles";

export const TokenInputComponent = styled(TextField)((props) => ({
  textAlign: "center",
  "::selection": {
    background: "transparent",
  },
}));

export const SpanComponent = styled(Typography)((props) => ({
  userSelect: "none",
  zIndex: 1000,
  cursor: "pointer",
  height: "3px",
  margin: "0 4px",
  backgroundColor: alpha(props.color, 0.75),
  "&:hover": {
    backgroundColor: props.color,
  },
}));

const Token = ({ textId, token, tokenIndex }) => {
  const hasReplacement = token.replacement !== null || token.replacement === "";
  const hasSuggestion = token.suggestion !== null || token.suggestion === "";
  const isOutOfVocab = !token.en;
  const [editing, setEditing] = useState(false);
  const tokenRef = useRef(null);
  const [state, dispatch] = useContext(ProjectContext);
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handlePrimaryPopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePrimaryPopoverClose = () => {
    setAnchorEl(null);
    console.log(token);
    dispatch({
      type: "UPDATE_TOKEN_VALUE",
      payload: {
        textId,
        tokenIndex,
        newValue: hasReplacement
          ? token.replacement
          : hasSuggestion
          ? token.suggestion
          : token.value,
      },
    });
  };

  const handleTokenEdit = (e, newToken) => {
    dispatch({
      type: "UPDATE_TOKEN_VALUE",
      payload: { textId, tokenIndex, newValue: newToken },
    });
    if (token.currentValue !== newToken) {
      handlePrimaryPopoverOpen(e);
    }
  };

  useEffect(() => {
    if (
      (token.value !== token.currentValue ||
        (token.replacement && token.value === token.currentValue)) &&
      token.currentValue !== token.suggestion &&
      token.currentValue !== token.replacement
    ) {
      setEditing(true);
    } else {
      setEditing(false);
      setAnchorEl(null);
    }
  }, [token.currentValue]);

  const tokenHasSpan = editing || hasReplacement || hasSuggestion;

  const tokenIsEmpty = token.currentValue === "";

  const getBaseColor = () => {
    if (tokenIsEmpty) return theme.palette.token.empty;
    if (editing) return theme.palette.token.editing;
    if (hasReplacement) return theme.palette.token.replacement;
    if (hasSuggestion) return theme.palette.token.suggestion;
    if (isOutOfVocab) return theme.palette.token.oov;
    return theme.palette.text.secondary;
  };

  const getOpacity = () => {
    return state.tokenizeTextId === null || state.tokenizeTextId === textId
      ? 1
      : 0.25;
  };

  const tokenColor = alpha(getBaseColor(), getOpacity());

  const handleTokenSelect = (tokenId) => {
    if (state.selectedToken && state.selectedToken._id === tokenId) {
      dispatch({
        type: "SET_VALUE",
        payload: { selectedToken: null, selectedTextId: null },
      });
    } else {
      dispatch({
        type: "SET_VALUE",
        payload: { selectedToken: token, selectedTextId: textId },
      });
    }
  };

  const getBgColor = (tokenColor) => {
    if (state.selectedToken && state.selectedToken._id === token._id)
      return alpha(tokenColor, 0.1);
    if (tokenIsEmpty) return alpha(theme.palette.token.empty, 0.2);
    return;
  };

  const tokenBgColor = getBgColor(tokenColor);

  return (
    <Stack
      key={tokenIndex}
      direction="column"
      id="token-container"
      tokenindex={tokenIndex}
    >
      <TokenInputComponent
        ref={tokenRef}
        variant="standard"
        tokenindex={tokenIndex}
        key={token._id}
        onChange={(e) => handleTokenEdit(e, e.target.value)}
        autoComplete="off"
        value={token.currentValue}
        inputProps={{
          style: {
            textAlign: "center",
            width: getTokenWidth(token.currentValue),
            color: tokenColor,
            backgroundColor: tokenBgColor,
            borderRadius: 4,
          },
        }}
        InputProps={{
          disableUnderline: true,
        }}
        title={`value: ${token.value} | replacement: ${token.replacement} | suggestion: ${token.suggestion}`}
        onContextMenu={(e) => {
          e.preventDefault();
          handlePrimaryPopoverOpen(e);
        }}
        contextMenu="none"
        onClick={() => handleTokenSelect(token._id)}
      />
      {tokenHasSpan && (
        <SpanComponent
          color={tokenColor}
          onClick={(e) => handlePrimaryPopoverOpen(e)}
          title="Click to modify"
        />
      )}
      <Stack direction="column" mt={0.25}>
        {token.tags
          .filter((labelId) => labelId !== "en")
          .map((labelId) => (
            <SpanEntityAnnotation
              key={`${token._id}-${labelId}`}
              tokenId={token._id}
              labelId={labelId}
              textId={textId}
            />
          ))}
      </Stack>
      <Popover
        id="edit-span-popover"
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePrimaryPopoverClose}
        disableRestoreFocus
        disableAutoFocus={true}
        disableEnforceFocus={true}
        elevation={0}
        PaperProps={{
          sx: {
            display: "flex",
            border: "1px solid",
            borderColor: alpha(tokenColor, 0.5),
          },
        }}
      >
        <Box>
          <Box
            sx={{
              textAlign: "center",
              backgroundColor: alpha(tokenColor, 0.5),
            }}
          >
            <Typography variant="body2" color={tokenColor} fontWeight="bold">
              {tokenIsEmpty
                ? "Removed"
                : hasReplacement
                ? "Replacement"
                : hasSuggestion
                ? "Suggestion"
                : editing
                ? "Editing"
                : null}
            </Typography>
          </Box>
          <Divider />
          <EditPopover
            textId={textId}
            tokenId={token._id}
            tokenIndex={tokenIndex}
            handlePopoverClose={handlePrimaryPopoverClose}
            setAnchorEl={setAnchorEl}
            originalValue={token.value}
            currentValue={token.currentValue}
            hasSuggestion={hasSuggestion}
            hasReplacement={hasReplacement}
            editing={editing}
          />
        </Box>
      </Popover>
    </Stack>
  );
};

export default Token;

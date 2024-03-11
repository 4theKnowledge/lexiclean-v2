import {
  Stack,
  Tooltip,
  Chip,
  Typography,
  Divider,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  Save as SaveIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { useContext, useState } from "react";
import { ProjectContext } from "../..//shared/context/project-context";
import axios from "axios";
import JoinFullIcon from "@mui/icons-material/JoinFull";
import { getGPTCorrection } from "../../shared/api/llm";
import { useModal } from "../../shared/context/ModalContext";
import { teal } from "@mui/material/colors";
import { useAppContext } from "../../shared/context/AppContext";

const getMostRecentDate = (dates) => {
  /**
   * Takes an array of UTC date strings in the format "yyyy-mm-ddThh:mm:ss.ssssss" and returns the most recent date as a UTC Date object.
   * @param {Array} dates - An array of UTC date strings.
   * @returns {Date} The most recent date in UTC format.
   */
  // Convert each date string to a Date object and store in an array
  const dateObjects = dates.map((dateString) => new Date(dateString));

  // Use the reduce() method to find the maximum Date object in the array
  const maxDate = dateObjects.reduce(
    (max, date) => (date > max ? date : max),
    new Date(0)
  );

  // Return the maximum date as a UTC Date object
  return new Date(
    Date.UTC(
      maxDate.getFullYear(),
      maxDate.getMonth(),
      maxDate.getDate(),
      maxDate.getHours(),
      maxDate.getMinutes(),
      maxDate.getSeconds(),
      maxDate.getMilliseconds()
    )
  );
};

const ActionTray = ({ textId, textIndex }) => {
  const [state, dispatch] = useContext(ProjectContext);
  const { state: appState } = useAppContext();

  const tokenCount = Object.values(state.texts[textId].tokens).length ?? 0;
  const { openModal } = useModal();

  const handleSave = async (textId, saveState) => {
    axios
      .patch("/api/text/save", {
        textIds: [textId],
        saved: saveState,
      })
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: "SAVE_TEXTS",
            payload: { textIds: [textId], saveState: saveState },
          });
        }
      });

    axios
      .get(`/api/project/progress/${state.projectId}`)
      .then((response) => {
        if (response.status === 200) {
          dispatch({ type: "SET_VALUE", payload: response.data });
        }
      })
      .catch((error) => console.log(`Error: ${error}`));
  };

  const handleTokenizeText = () => {
    dispatch({
      type: "SET_VALUE",
      payload: {
        tokenizeTextId: state.tokenizeTextId == textId ? null : textId,
      },
    });
  };

  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const renderSuggestionResponse = (currentTextValue, formattedResponse) => {
    return (
      <>
        <Typography gutterBottom>
          Suggestion for input:{" "}
          <span style={{ color: teal[900] }}>{currentTextValue}</span>
        </Typography>
        <Box
          margin="auto"
          sx={{
            overflow: "auto",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            padding: "16px",
            maxHeight: 400,
          }}
        >
          <Typography
            component="pre"
            variant="body2"
            style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
          >
            <code>{formattedResponse}</code>
          </Typography>
        </Box>
      </>
    );
  };

  const handleAISuggestion = async () => {
    try {
      setLoadingSuggestion(true);

      const currentTextValue = Object.values(state.texts[textId].tokens)
        .map((t) => t.currentValue)
        .join(" ");
      const response = await getGPTCorrection({
        text: currentTextValue,
        openAIKey: appState.user.openAIKey,
      });

      if (!response) {
        throw new Error("No suggestion available.");
      }

      const formattedResponse = JSON.stringify(JSON.parse(response), null, 2);
      const llmResponse = renderSuggestionResponse(
        currentTextValue,
        formattedResponse
      );

      openModal(llmResponse, "AI Suggestion");
    } catch (error) {
      console.error("handleAISuggestion error:", error);
      openModal(`Error: ${error.message}`, "AI Suggestion Error");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={2}>
        <Tooltip
          title={
            state.texts[textId].saved ? "Click to unsave" : "Click to save"
          }
          placement="top"
        >
          <Chip
            label={state.texts[textId].saved ? "Unsave" : "Save"}
            size="small"
            icon={<SaveIcon />}
            color={state.texts[textId].saved ? "success" : "warning"}
            variant={state.texts[textId].saved ? "contained" : "outlined"}
            clickable
            onClick={() => handleSave(textId, !state.texts[textId].saved)}
          />
        </Tooltip>
        <Tooltip
          title={
            state.tokenizeTextId === textId
              ? "Click to cancel concatenation"
              : "Click to concatenate tokens"
          }
          placement="top"
        >
          <Chip
            clickable
            label="Concatenate"
            size="small"
            icon={<JoinFullIcon />}
            color={state.tokenizeTextId === textId ? "primary" : "default"}
            variant={state.tokenizeTextId === textId ? "contained" : "outlined"}
            onClick={handleTokenizeText}
            disabled={
              state.tokenizeTextId !== null && state.tokenizeTextId !== textId
            }
          />
        </Tooltip>
        <Divider orientation="vertical" flexItem />
        <Chip
          clickable
          label="AI Suggestion"
          size="small"
          color="primary"
          icon={
            loadingSuggestion ? (
              <CircularProgress size={16} />
            ) : (
              <AutoAwesomeIcon />
            )
          }
          onClick={handleAISuggestion}
        />
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          fontWeight: 500,
          fontSize: "0.75rem",
        }}
      >
        <Tooltip title="Number of tokens in this item" arrow placement="top">
          <Typography fontSize="inherit" sx={{ cursor: "help" }}>
            {tokenCount} tokens
          </Typography>
        </Tooltip>
        <Tooltip
          title={
            <Stack direction="column" spacing={1}>
              <Typography variant="caption">
                External ID:{" "}
                {state.texts[textId].identifiers === undefined
                  ? "Unavailable"
                  : state.texts[textId].identifiers.join(", ")}
              </Typography>
              <Typography variant="caption">
                Rank: {state.texts[textId].rank}
              </Typography>
              <Typography variant="caption">
                Weight: {Math.round(state.texts[textId].weight * 1000) / 1000}
              </Typography>
            </Stack>
          }
          arrow
          placement="top"
        >
          <Typography
            fontSize="inherit"
            sx={{
              fontWeight: 900,
              cursor: "help",
            }}
          >
            {textIndex + 1 + (state.pageNumber - 1) * state.pageLimit}
          </Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
};

export default ActionTray;

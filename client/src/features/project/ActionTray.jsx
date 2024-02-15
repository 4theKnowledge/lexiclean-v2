import {
  Stack,
  Tooltip,
  Chip,
  Typography,
  Divider,
  CircularProgress,
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

  const handleAISuggestion = async () => {
    try {
      setLoadingSuggestion(true);

      const currentTextValue = Object.values(state.texts[textId].tokens)
        .map((t) => t.currentValue)
        .join(" ");
      const response = await getGPTCorrection(currentTextValue);
      console.log("handleAISuggestion:", response);
      openModal(<div>{response}</div>, "AI Suggestion");
    } catch (error) {
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
          // color: theme.palette.neutral.main,
          fontSize: "0.75rem",
        }}
      >
        <Tooltip title="Number of tokens in this item" arrow placement="top">
          <Typography fontSize="inherit" sx={{ cursor: "help" }}>
            {tokenCount} tokens
          </Typography>
        </Tooltip>
        <Tooltip
          title={`${
            state.texts[textId].identifiers === undefined
              ? "No external id"
              : state.texts[textId].identifiers.join(", ")
          }`}
          arrow
          placement="top"
        >
          <Typography
            fontSize="inherit"
            sx={{
              fontWeight: 900,
              //   color: theme.palette.primary.main,
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

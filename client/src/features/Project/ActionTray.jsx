import {
  Stack,
  Tooltip,
  Chip,
  Typography,
  Divider,
  CircularProgress,
  Box,
  Menu,
  MenuList,
  MenuItem,
  Badge,
} from "@mui/material";
import {
  Save as SaveIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import { useContext, useState } from "react";
import { ProjectContext } from "../..//shared/context/ProjectContext";
import JoinFullIcon from "@mui/icons-material/JoinFull";
import { getGPTCorrection } from "../../shared/api/llm";
import { useModal } from "../../shared/context/ModalContext";
import { teal } from "@mui/material/colors";
import { useAppContext } from "../../shared/context/AppContext";
import useProjectActions from "../../shared/hooks/api/project";
import FlagIcon from "@mui/icons-material/Flag";
import { Link, useParams } from "react-router-dom";
import useAnnotationActions from "../../shared/hooks/api/annotation";

const ActionTray = ({ textId, textIndex }) => {
  const [state, dispatch] = useContext(ProjectContext);
  const { state: appState } = useAppContext();
  const tokenCount = Object.values(state.texts[textId].tokens).length ?? 0;
  const { openModal } = useModal();
  const { saveTexts } = useProjectActions();
  const { projectId } = useParams();

  const handleSave = async (textId, saveState) => {
    await saveTexts({
      projectId,
      textIds: [textId],
      isSaved: saveState,
    });
  };

  const handleTokenizeText = () => {
    dispatch({
      type: "SET_VALUE",
      payload: {
        tokenizeTextId: state.tokenizeTextId === textId ? null : textId,
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
            "Concatenation is currently unavailable"
            // state.tokenizeTextId === textId
            //   ? "Click to cancel concatenation"
            //   : "Click to concatenate tokens"
          }
          placement="top"
        >
          <span>
            <Chip
              clickable
              disabled
              // disabled={
              //   state.tokenizeTextId !== null && state.tokenizeTextId !== textId
              // }
              label="Concatenate"
              size="small"
              icon={<JoinFullIcon />}
              color={state.tokenizeTextId === textId ? "primary" : "default"}
              variant={
                state.tokenizeTextId === textId ? "contained" : "outlined"
              }
              onClick={handleTokenizeText}
            />
          </span>
        </Tooltip>
        <TrayFlagChip textId={textId} />
        <Divider orientation="vertical" flexItem />
        <Tooltip title="Click to get AI suggestion" placement="top">
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
        </Tooltip>
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

const TrayFlagChip = ({ textId }) => {
  const { projectId } = useParams();

  const [state, dispatch] = useContext(ProjectContext);
  const { addFlag, deleteFlag } = useAnnotationActions();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFlagClick = async (event) => {
    const flagIndex = event.target.value;

    const flagId = state.project.flags[flagIndex]._id;

    if (state.texts[textId].flags.includes(flagId)) {
      // if flag exists, delete
      // console.log("flag exists");
      await deleteFlag({ textId, flagId });
    } else {
      // if flag doesn't exist, add
      // console.log("flag not exist");
      await addFlag({ textId, flagId });
    }
  };

  return (
    <>
      <Tooltip title="Click to add/remove flag(s) on this text" placement="top">
        <Badge
          badgeContent={state.texts[textId].flags.length}
          max={9}
          color="primary"
        >
          <Chip
            clickable
            label="Flags"
            size="small"
            icon={<FlagIcon />}
            variant={"outlined"}
            onClick={handleOpen}
          />
        </Badge>
      </Tooltip>
      <Menu
        id="flag-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuList dense>
          {state.project.flags.length > 0 ? (
            state.project.flags.map((option, index) => (
              <FlagMenuItem
                state={state}
                textId={textId}
                option={option._id}
                label={option.name}
                onClick={handleFlagClick}
                index={index}
              />
            ))
          ) : (
            <Box
              p={0.5}
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
            >
              <Typography variant="caption">No Flags Added</Typography>
              <Typography
                variant="caption"
                as={Link}
                to={`/dashboard/${projectId}`}
              >
                Visit Dashboard to Add
              </Typography>
            </Box>
          )}
        </MenuList>
      </Menu>
    </>
  );
};

const FlagMenuItem = ({ state, textId, option, label, onClick, index }) => {
  const hasFlag = state.texts[textId].flags.includes(option);

  return (
    <Tooltip
      title={`Click to ${hasFlag ? "remove" : "apply"} ${label} flag`}
      placement="right"
    >
      <MenuItem
        onClick={onClick}
        sx={{ textTransform: "capitalize" }}
        value={index}
        selected={hasFlag}
      >
        {label}
      </MenuItem>
    </Tooltip>
  );
};

export default ActionTray;

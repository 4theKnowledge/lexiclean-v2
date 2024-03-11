import { IconButton, Stack, Tooltip } from "@mui/material";
import { useContext } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweep from "@mui/icons-material/DeleteSweep";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { ProjectContext } from "../../shared/context/project-context";
import axiosInstance from "../../shared/api/axiosInstance";
import { useSnackbar } from "../../shared/context/SnackbarContext";

const TagPopover = ({ textId, tokenId, entityLabelId }) => {
  const [state, dispatch] = useContext(ProjectContext);
  const { dispatch: snackbarDispatch } = useSnackbar();

  const handleDelete = async ({ applyAll = false }) => {
    try {
      const response = await axiosInstance.patch(
        `/api/token/meta/remove/one/${tokenId}`,
        { entityLabelId }
      );

      if (response.status === 200) {
        dispatch({
          type: "DELETE_TAG",
          payload: {
            applyAll,
            tokenId,
            tags: response.data,
            textId: textId,
          },
        });
        snackbarDispatch({
          type: "SHOW",
          message: `Successfully deleted label`,
          severity: "success",
        });
      } else {
        throw new Error("Failed to delete label.");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ p: "0.25rem 0.5rem 0.25rem 0.5rem" }}
    >
      <Tooltip title="Apply all is currently unavailable">
        <span>
          <IconButton size="small" disabled>
            <ContentPasteIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      {/* <MenuItem>
        <ListItemIcon>
          <CheckCircleOutlineIcon />
        </ListItemIcon>
        <ListItemText>Apply</ListItemText>
      </MenuItem> */}
      <Tooltip title="Click to remove this token's label">
        <IconButton size="small" onClick={handleDelete}>
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      {/* <MenuItem disabled>
        <ListItemIcon>
          <DeleteSweep />
        </ListItemIcon>
        <ListItemText>Remove All</ListItemText>
      </MenuItem> */}
    </Stack>
  );
};

export default TagPopover;

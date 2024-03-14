import { IconButton, Stack, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweep from "@mui/icons-material/DeleteSweep";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import useAnnotationActions from "../../shared/hooks/api/annotation";

const TagPopover = ({ textId, tokenId, entityLabelId }) => {
  const { deleteLabelAction, applyLabelAction } = useAnnotationActions();

  const handleDelete = async ({ applyAll = false }) => {
    await deleteLabelAction({ textId, tokenId, entityLabelId, applyAll });
  };

  const handleApplyAll = async () => {
    await applyLabelAction({ textId, tokenId, entityLabelId, applyAll: true });
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ p: "0.25rem 0.5rem 0.25rem 0.5rem" }}
    >
      <Tooltip title="Click to apply this label to all similar tokens">
        <IconButton size="small" onClick={handleApplyAll}>
          <ContentPasteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      {/* TODO: conditionally render accept one and accept all */}
      <Tooltip title="Click to remove this token's label">
        <IconButton size="small" onClick={handleDelete}>
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Click to remove this label from all similar tokens">
        <IconButton
          size="small"
          onClick={() => handleDelete({ applyAll: true })}
        >
          <DeleteSweep fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default TagPopover;

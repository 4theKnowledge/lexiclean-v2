import { useState, useContext } from "react";
import { Typography, Popover, Box, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { ProjectContext } from "../../shared/context/project-context";
import TagPopover from "./TagPopover";
import { teal } from "@mui/material/colors";

const TagSpanComponent = styled(Typography)((props) => ({
  userSelect: "none",
  zIndex: 1000,
  cursor: "pointer",
  height: "20px",
  margin: "0 4px",
  fontSize: 10,
  textAlign: "left",
  padding: 2,
  backgroundColor: alpha(props.color, 0.5),
  border: "1px solid",
  borderRadius: "4px",
  borderColor: alpha(props.color, 0.75),
  "&:hover": {
    backgroundColor: props.color,
    color: "black",
  },
}));

const SpanEntityAnnotation = ({ textId, tokenId, labelId }) => {
  const [state, dispatch] = useContext(ProjectContext);

  const [tagAnchorEl, setTagAnchorEl] = useState(null);
  const handleTagPopoverOpen = (event) => {
    setTagAnchorEl(event.currentTarget);
  };
  const handleTagPopoverClose = () => {
    setTagAnchorEl(null);
  };
  const tagOpen = Boolean(tagAnchorEl);

  // Early return if `state.project` is undefined, `state.project.schemaMap` is undefined, or `labelId` is undefined
  if (!state.project || !state.project.schemaMap || !labelId) {
    // Optionally, return a placeholder, error message, or null to render nothing
    return <div>Project data or label ID is missing.</div>; // Or return null to render nothing
  }

  const labelDetails = state.project.schemaMap[labelId];

  return (
    <>
      <TagSpanComponent
        color={labelDetails ? labelDetails.color : teal[500]}
        onClick={handleTagPopoverOpen}
      >
        {labelDetails ? labelDetails.name : "Undefined Label"}
      </TagSpanComponent>
      <Popover
        id="tag-span-popover"
        open={tagOpen}
        anchorEl={tagAnchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handleTagPopoverClose}
        disableRestoreFocus
        disableAutoFocus={true}
        disableEnforceFocus={true}
        elevation={0}
        PaperProps={{
          sx: {
            display: "flex",
            border: "1px solid",
            borderColor: labelDetails
              ? alpha(labelDetails.color, 0.5)
              : teal[300],
          },
        }}
      >
        <Box display="flex" flexDirection="column">
          <Box
            sx={{
              textAlign: "center",
              backgroundColor: alpha(labelDetails.color, 0.5),
            }}
          >
            <Typography
              variant="body2"
              color={labelDetails.color}
              fontWeight="bold"
            >
              {labelDetails.name}
            </Typography>
          </Box>
          <Divider />
          <TagPopover
            tokenId={tokenId}
            entityLabelId={labelId}
            textId={textId}
          />
        </Box>
      </Popover>
    </>
  );
};

export default SpanEntityAnnotation;

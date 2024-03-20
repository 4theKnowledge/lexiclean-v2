import { useState, useEffect } from "react";
import { CirclePicker, TwitterPicker } from "react-color";
import {
  Grid,
  Typography,
  List,
  ListItem,
  IconButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Stack,
  Button,
  TextField,
  Paper,
  Box,
  Tooltip,
  Badge,
  Alert,
  AlertTitle,
  ListItemButton,
} from "@mui/material";
import { getContrastTextColor } from "../utils/create";
import NotesIcon from "@mui/icons-material/Notes";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

const SchemaEditor = ({
  values,
  updateValue,
  disableTextEditor = false,
  disabled = false,
}) => {
  const tagTemplate = {
    name: "",
    description: "",
    color: "#e0f2f1",
    fileName: "",
    data: [],
    deletable: true,
    editRestiction: false,
    isReplacements: false,
  };
  const [currentTag, setCurrentTag] = useState(tagTemplate);
  const [tagNames, setTagNames] = useState(values.tags.map((t) => t.name));
  const [selectedTagIndex, setSelectedTagIndex] = useState(null);

  const createTag = (tag) => {
    // console.log("Creating Tag");
    updateValue({ key: "tags", value: [...values.tags, tag] });
  };

  const createNewTag = () => {
    // console.log("createNewTag", currentTag);
    createTag(currentTag);
    setCurrentTag(tagTemplate);
    setSelectedTagIndex();
  };

  const handleTagValuesChange = (e) => {
    setCurrentTag((prevState) => ({
      ...prevState,
      data: e.target.value.split("\n"),
    }));
  };

  const deleteTag = (index) => {
    // console.log("Deleting Tag");
    const newTags = values.tags.filter((_, idx) => idx !== index);
    updateValue({ key: "tags", value: newTags });
    setCurrentTag(tagTemplate);
    setSelectedTagIndex();
  };

  const selectTag = (index) => {
    if (index === selectedTagIndex) {
      setCurrentTag(tagTemplate);
      setSelectedTagIndex(null);
    } else {
      // console.log("Selected Tag");
      setSelectedTagIndex(index);
      setCurrentTag(values.tags[index]);
    }
  };

  const updateExistingTag = (index) => {
    // console.log("Updating Existing Tag");
    // Clone the current tags array
    const updatedTags = [...values.tags];

    // Replace the tag at the given index with currentTag
    updatedTags[index] = currentTag;

    // Update the values.tags with the modified array
    updateValue("tags", updatedTags);

    // Erase editor data
    setCurrentTag(tagTemplate);
    setSelectedTagIndex();
  };

  // const readFile = (name, meta) => {
  //   let reader = new FileReader();
  //   reader.readAsText(meta);
  //   reader.onload = () => {
  //     const fileExt = meta.name.split(".").slice(-1)[0];
  //     if (fileExt === "txt") {
  //       setCurrentTag({
  //         ...currentTag,
  //         fileName: meta.name,
  //         data: reader.result.split("\n").filter((line) => line !== ""),
  //       });
  //     }
  //   };
  // };

  useEffect(() => {
    setTagNames(values.tags.map((t) => t.name));
  }, [values.tags]);

  // console.log("selectedTagIndex", selectedTagIndex);
  // console.log("currentTag", currentTag);

  return (
    <Grid container p={1}>
      <Grid item xs={6} p="0rem 0.5rem">
        <TagContainer
          tags={values.tags}
          deleteTag={deleteTag}
          selectTag={selectTag}
          selectedTagIndex={selectedTagIndex}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={6} p="0rem 0.5rem">
        <TagCreator
          currentTag={currentTag}
          setCurrentTag={setCurrentTag}
          disabled={disabled}
        />
        <TagDataEditor
          currentTag={currentTag}
          handleTagValuesChange={handleTagValuesChange}
          disabled={disableTextEditor || disabled}
        />

        {/* // TODO: do not permit tags with the same names being used...
       const disableCreateUpdateBtn = currentTag.name === ""; // || tagNames.includes(currentTag.name); */}
        <TagCreateUpdateUploadButtons
          createUpdateFunction={
            selectedTagIndex !== null
              ? () => updateExistingTag(selectedTagIndex)
              : createNewTag
          }
          disableCreateUpdateBtn={currentTag.name === ""}
          isUpdateContext={selectedTagIndex !== null}
          tagNames={tagNames}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

const TagContainer = ({
  tags,
  deleteTag,
  selectTag,
  selectedTagIndex,
  disabled = false,
}) => {
  const hasTags = tags.length !== 0;
  return (
    <Box
      component={Paper}
      variant="outlined"
      sx={{
        border: (theme) =>
          !hasTags && `1px dashed ${theme.palette.borders.accent}`,
        backgroundColor: (theme) => !hasTags && theme.palette.background.accent,
        height: "100%",
        display: !hasTags && "flex",
        alignItems: !hasTags && "center",
        justifyContent: !hasTags && "center",
      }}
      p={2}
    >
      {!hasTags ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography>
            This project has no entity labels - create one!
          </Typography>
          <ArrowCircleRightIcon
            sx={{ fontSize: 32, color: "text.secondary" }}
          />
        </Box>
      ) : (
        <List>
          {tags.map((tag, index) => {
            return index === selectedTagIndex ? (
              <Box
                component={Paper}
                sx={{
                  background: (theme) =>
                    index === selectedTagIndex &&
                    theme.palette.background.accent,
                  borderRadius: "0 1rem 1rem 0",
                }}
                variant="outlined"
              >
                <TagListItem
                  tag={tag}
                  index={index}
                  selectTag={selectTag}
                  deleteTag={deleteTag}
                  disabled={disabled}
                />
              </Box>
            ) : (
              <TagListItem
                tag={tag}
                index={index}
                selectTag={selectTag}
                deleteTag={deleteTag}
                disabled={disabled}
              />
            );
          })}
        </List>
      )}
    </Box>
  );
};

const TagListItem = ({
  tag,
  index,
  selectTag,
  deleteTag,
  disabled = false,
}) => {
  return (
    <ListItem
      secondaryAction={
        <IconButton
          aria-label="delete"
          onClick={() => deleteTag(index)}
          disabled={!tag.deletable || disabled}
          color="error"
        >
          <Tooltip title="Click to delete this label">
            <DeleteIcon />
          </Tooltip>
        </IconButton>
      }
    >
      <ListItemButton onClick={() => selectTag(index)}>
        <ListItemAvatar>
          <Badge
            badgeContent={tag.data.length}
            color="primary"
            showZero
            max={99}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            title={`This tag has ${tag.data.length} values associated with it.`}
          >
            <Avatar
              sx={{
                bgcolor: tag.color,
                color: getContrastTextColor(tag.color),
              }}
            >
              {tag.name[0]}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={<Typography fontWeight={700}>{tag.name}</Typography>}
          secondary={tag.description}
        />
      </ListItemButton>
    </ListItem>
  );
};

const TagCreator = ({ currentTag, setCurrentTag, disabled = false }) => {
  return (
    <Box component={Paper} variant="outlined" p={2}>
      <Stack direction="column" spacing={2} alignItems="left">
        <Box>
          <Typography color="text.secondary" fontWeight={500} gutterBottom>
            Give your entity label a name (unique):
          </Typography>
          <TextField
            disabled={disabled}
            InputProps={{
              style: {
                color: getContrastTextColor(currentTag.color),
                backgroundColor: currentTag.color,
              },

              readOnly: currentTag.editRestiction,
            }}
            InputLabelProps={{
              style: { color: getContrastTextColor(currentTag.color) },
            }}
            placeholder="Label name"
            value={currentTag.name}
            onChange={(e) =>
              setCurrentTag({ ...currentTag, name: e.target.value })
            }
            fullWidth
            autoComplete="false"
          />
        </Box>
        <Box>
          <Typography color="text.secondary" gutterBottom fontWeight={500}>
            Give your entity label a description (optional):
          </Typography>
          <TextField
            disabled={disabled}
            InputProps={{
              style: {
                color: getContrastTextColor(currentTag.color),
                backgroundColor: currentTag.color,
              },

              readOnly: currentTag.editRestiction,
            }}
            InputLabelProps={{
              style: { color: getContrastTextColor(currentTag.color) },
            }}
            placeholder="Label description"
            value={currentTag.description}
            onChange={(e) =>
              setCurrentTag({ ...currentTag, description: e.target.value })
            }
            fullWidth
            autoComplete="false"
          />
        </Box>
        <Box>
          <Typography color="text.secondary" gutterBottom fontWeight={500}>
            Give your entity label a color:
          </Typography>
          <CirclePicker
            color={currentTag.color}
            onChange={(color) =>
              setCurrentTag({ ...currentTag, color: color.hex })
            }
            onChangeComplete={(color) =>
              setCurrentTag({ ...currentTag, color: color.hex })
            }
          />
        </Box>
      </Stack>
    </Box>
  );
};

const TagDataEditor = ({
  currentTag,
  handleTagValuesChange,
  disabled = false,
}) => {
  return (
    <Box mt={2}>
      <TextField
        id="tag-data-input-textfield"
        fullWidth
        placeholder={
          disabled
            ? "Info: Values can only be specified on project creation"
            : "Enter or paste in new-line separated label values"
        }
        multiline
        rows={disabled ? 1 : 10}
        value={currentTag?.data.join("\n")}
        onChange={handleTagValuesChange}
        disabled={disabled}
      />
    </Box>
  );
};

const TagCreateUpdateUploadButtons = ({
  createUpdateFunction,
  disableCreateUpdateBtn,
  isUpdateContext,
  tagNames,
  disabled = true,
}) => {
  return (
    <Box display="flex" justifyContent="center" width="100%" mt={2}>
      {/* <Button
        component="label"
        variant="contained"
        disabled={disabled}
        startIcon={<FileUploadIcon />}
      >
        <Tooltip title="Click to upload a label file gazetteer">
          Upload label value gazetteer
        </Tooltip>
      </Button> */}
      {/* <Button
      component="label"
      variant="contained"
      disabled
      startIcon={<NotesIcon />}
    >
      <Tooltip title="Click to enter a dictionary">
        Manual Entry
      </Tooltip>
    </Button> */}
      <Button
        variant="contained"
        onClick={createUpdateFunction}
        disabled={disableCreateUpdateBtn || disabled}
      >
        {isUpdateContext ? "Update" : "Create"}
      </Button>
    </Box>
  );
};

export default SchemaEditor;

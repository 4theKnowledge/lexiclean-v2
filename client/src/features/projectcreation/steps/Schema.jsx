import { useState } from "react";
import { CompactPicker } from "react-color";
import { grey } from "@mui/material/colors";
import BrushIcon from "@mui/icons-material/Brush";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CreateIcon from "@mui/icons-material/Create";
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
  Divider,
} from "@mui/material";

const Schema = (props) => {
  const { values, updateValue } = props;

  const addTag = (tag) => {
    updateValue("tags", [...values["tags"], tag]);
  };

  const deleteTag = (index) => {
    const newTags = values["tags"].filter((_, idx) => idx !== index);
    updateValue("tags", newTags);
  };

  return (
    <Grid container xs={12} p={8}>
      <Stack direction="column" mb={2}>
        <Typography variant="h6">Create Token Classification Tag</Typography>
        <Typography variant="caption">
          Note: Tag names must have underscores instead of white space and
          gazetteers must be in .txt file format
        </Typography>
      </Stack>
      <TagList tags={values["tags"]} addTag={addTag} deleteTag={deleteTag} />
    </Grid>
  );
};

const TagList = ({ tags, addTag, deleteTag }) => {
  const tagTemplate = { name: "", color: grey[500], fileName: "", data: "" };

  const [currentTag, setCurrentTag] = useState(tagTemplate);
  const addNewTag = () => {
    addTag(currentTag);
    setCurrentTag(tagTemplate);
  };

  const handleDelete = (index) => {
    deleteTag(index);
  };

  const readFile = (name, meta) => {
    let reader = new FileReader();
    reader.readAsText(meta);
    reader.onload = () => {
      const fileExt = meta.name.split(".").slice(-1)[0];
      if (fileExt === "txt") {
        setCurrentTag({
          ...currentTag,
          fileName: meta.name,
          data: reader.result.split("\n").filter((line) => line !== ""),
        });
      }
    };
  };

  return (
    <Grid item xs={12} md={12}>
      <Grid
        container
        item
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        p={2}
        component={Paper}
        variant="outlined"
      >
        <Grid item xs={4}>
          <TextField
            sx={{ bgcolor: currentTag.color, color: "white" }}
            label="Tag name"
            value={currentTag.name}
            onChange={(e) =>
              setCurrentTag({ ...currentTag, name: e.target.value })
            }
          />
        </Grid>
        <Grid item xs={4}>
          <CompactPicker
            color={currentTag.color}
            onChange={(color) =>
              setCurrentTag({ ...currentTag, color: color.hex })
            }
            onChangeComplete={(color) =>
              setCurrentTag({ ...currentTag, color: color.hex })
            }
          />
        </Grid>
        <Grid item xs={4}>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" disabled>
              Upload Dictionary
            </Button>
            <Button variant="contained" disabled>
              Manually Enter Dictionary
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Stack direction="column" spacing={2}>
        <Button
          variant="contained"
          onClick={addNewTag}
          disabled={currentTag.name === ""}
        >
          Create tag
        </Button>
      </Stack>
      <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
        Created Tags
      </Typography>
      <List>
        {tags.map((tag, index) => (
          <>
            <ListItem
              secondaryAction={
                <Stack direction="row" spacing={0}>
                  <IconButton aria-label="upload">
                    <FileUploadIcon />
                  </IconButton>
                  <IconButton aria-label="create">
                    <CreateIcon />
                  </IconButton>
                  <IconButton aria-label="color">
                    <BrushIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    onClick={() => handleDelete(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: tag.color }}>{tag.name[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={tag.name === "" ? "Enter tag name" : tag.name}
                secondary={`tag number ${index}`}
              />
            </ListItem>
            <Divider />
          </>
        ))}
      </List>
    </Grid>
  );
};

// const TagContainer = () => {
//   const dispatch = useDispatch();
//   const metaTags = useSelector(selectMetaTags);

//   const DEFAULT_COLOR = "#eceff1";

//   const [showModal, setShowModal] = useState(false);

//   const [tempColor, setTempColor] = useState(DEFAULT_COLOR);
//   const [tempMetaTag, setTempMetaTag] = useState("");
//   const [tempData, setTempData] = useState();

//   const readFile = (name, meta) => {
//     let reader = new FileReader();
//     reader.readAsText(meta);
//     reader.onload = () => {
//       const fileExt = meta.name.split(".").slice(-1)[0];
//       if (fileExt === "txt") {
//         // console.log(reader.result.split("\n").filter((line) => line !== ""));

//         setTempData({
//           fileName: meta.name,
//           data: reader.result.split("\n").filter((line) => line !== ""),
//         });

//         // dispatch(
//         //   setMetaTagData(
//         //     {
//         //       name: name,
//         //       fileName: meta.name,
//         //       data: reader.result.split("\n").filter(line => line !== "")
//         //     }
//         //   )
//         // );
//       }
//     };
//   };

//   const popover = (key) => (
//     <Popover id="popover-color">
//       <Popover.Title>Select Color</Popover.Title>
//       <Popover.Content>
//         <CompactPicker
//           color={tempColor}
//           onChange={(color) => editMetaTag(key, color.hex)}
//           onChangeComplete={(color) => editMetaTag(key, color.hex)}
//         />
//       </Popover.Content>
//     </Popover>
//   );

//   const infoPopover = (content, format) => {
//     return (
//       <Popover id="popover-info">
//         <Popover.Title>Information</Popover.Title>
//         <Popover.Content>
//           <p>{content}</p>
//           <code style={{ whiteSpace: "pre-wrap" }}>{format}</code>
//         </Popover.Content>
//       </Popover>
//     );
//   };

//   const infoOverlay = (info) => {
//     return (
//       <OverlayTrigger
//         trigger="click"
//         placement="right"
//         overlay={infoPopover(info.content, info.format)}
//       >
//         <HelpIcon
//           // id="info-label"
//           style={{ marginRight: "0.25rem" }}
//         />
//       </OverlayTrigger>
//     );
//   };

//   const addMetaTag = () => {
//     if (tempMetaTag !== "") {
//       if (tempData) {
//         // If the tag has associated data
//         // console.log("TAG WITH DATA!");
//         dispatch(
//           setMetaTags({ [tempMetaTag]: { ...tempData, color: tempColor } })
//         );
//       } else {
//         // If the tag does not have associated data
//         // console.log("TAG WITHOUT DATA!");
//         dispatch(
//           setMetaTags({
//             [tempMetaTag]: { fileName: null, data: [], color: tempColor },
//           })
//         );
//       }

//       // Reset states
//       setTempMetaTag("");
//       setTempColor(DEFAULT_COLOR);
//       // document.getElementById("formControlTempMetaTag").value = null; // essentially resets form
//       setTempData(null);
//     }
//   };

//   const removeMetaTag = (tagName) => {
//     dispatch(deleteMetaTag(tagName));
//   };

//   const editMetaTag = (tagName, color) => {
//     dispatch(
//       setMetaTags({ [tagName]: { ...metaTags[tagName], color: color } })
//     );
//   };

//   const getFontColor = (color) => {
//     // Get token contrast ratio (tests white against color) if < 4.5 then sets font color to black
//     const hexToRgb = (hex) =>
//       hex
//         .replace(
//           /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
//           (m, r, g, b) => "#" + r + r + g + g + b + b
//         )
//         .substring(1)
//         .match(/.{2}/g)
//         .map((x) => parseInt(x, 16));

//     const luminance = (r, g, b) => {
//       let a = [r, g, b].map((v) => {
//         v /= 255;
//         return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
//       });
//       return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
//     };

//     const contrast = (rgb1, rgb2) => {
//       let lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
//       let lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
//       let brightest = Math.max(lum1, lum2);
//       let darkest = Math.min(lum1, lum2);
//       return (brightest + 0.05) / (darkest + 0.05);
//     };

//     const ratioWhite = contrast(hexToRgb(color), [255, 255, 255]);
//     const ratioBlack = contrast(hexToRgb(color), [0, 0, 0]);

//     return ratioWhite > ratioBlack ? "white" : "black";
//   };

//   return (
//     <>
//       <GazetteerModal
//         showModal={showModal}
//         handleClose={() => setShowModal(false)}
//         tempData={tempData}
//         setTempData={setTempData}
//       />

//       <Row className="schema">
//         <Col sm={12} md={4}>
//           <Card style={{ height: "35vh" }}>
//             <Card.Header id="section-subtitle">
//               <div style={{ display: "flex" }}>
//                 {infoOverlay(infoContent["tags"])}
//                 <p style={{ margin: "0", padding: "0" }}>Add Tag</p>
//               </div>
//             </Card.Header>
//             <Card.Body>
//               <Form.Group>
//                 <Row>
//                   <Col>
//                     <Form.Label>Name</Form.Label>
//                     <Form.Control
//                       type="text"
//                       size="sm"
//                       style={{ width: "100%" }}
//                       placeholder="Enter a name"
//                       value={tempMetaTag}
//                       onChange={(e) => setTempMetaTag(e.target.value)}
//                     />
//                   </Col>
//                   <Col>
//                     <Form.Label>Color</Form.Label>
//                     <Form.Control
//                       type="color"
//                       size="sm"
//                       id="exampleColorInput"
//                       defaultValue={DEFAULT_COLOR}
//                       title="Choose your color"
//                       style={{ width: "50px", cursor: "pointer" }}
//                       onChange={(e) => setTempColor(e.target.value)}
//                     />
//                   </Col>
//                 </Row>
//               </Form.Group>

//               <Form.Group>
//                 <Form.Label>Add Gazetteer</Form.Label>
//                 <Col>
//                   <div
//                     style={{
//                       display: "flex",
//                     }}
//                   >
//                     <label id="upload-btn">
//                       <input
//                         type="file"
//                         onChange={(e) =>
//                           readFile(tempMetaTag, e.target.files[0])
//                         }
//                       />
//                       Upload File
//                     </label>
//                     <label
//                       id="upload-btn"
//                       style={{ marginLeft: "0.25rem" }}
//                       onClick={() => setShowModal(true)}
//                     >
//                       Enter Manually
//                     </label>
//                   </div>
//                 </Col>
//               </Form.Group>

//               <Row>
//                 <Col
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     marginTop: "1rem",
//                   }}
//                 >
//                   <Button
//                     size="sm"
//                     variant="dark"
//                     disabled={tempMetaTag === ""}
//                     onClick={() => addMetaTag()}
//                   >
//                     Add
//                   </Button>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col sm={12} md={8}>
//           <Card style={{ height: "35vh" }}>
//             <Card.Header id="section-subtitle">Tags</Card.Header>
//             <Card.Body>
//               {Object.keys(metaTags).length > 0 ? (
//                 <Row id="preview-row">
//                   <Col>
//                     {Object.keys(metaTags).map((key) => (
//                       <Row>
//                         <Col sm={12} md={4}>
//                           <Row>
//                             <div
//                               id="create-tag-preview"
//                               style={{
//                                 backgroundColor: metaTags[key].color,
//                                 color: getFontColor(metaTags[key].color),
//                               }}
//                             >
//                               {key[0]}
//                             </div>
//                             <div id="create-tag-text">{key}</div>
//                           </Row>
//                         </Col>
//                         <Col
//                           sm={12}
//                           md={4}
//                           style={{
//                             padding: "0.5rem",
//                             justifyContent: "center",
//                           }}
//                         >
//                           {metaTags[key].fileName
//                             ? metaTags[key].fileName
//                             : "No data uploaded"}
//                         </Col>
//                         <Col sm={12} md={4}>
//                           <Row
//                             style={{
//                               display: "flex",
//                               justifyContent: "right",
//                             }}
//                           >
//                             {/* <div
//                               id="edit-button"
//                               onClick={() => setShowModal(true)}
//                             >
//                               <IoPencil />
//                             </div> */}
//                             <OverlayTrigger
//                               trigger="click"
//                               placement="left"
//                               overlay={popover(key)}
//                               rootClose
//                             >
//                               <div id="edit-button">
//                                 <BrushIcon />
//                               </div>
//                             </OverlayTrigger>
//                             <div id="create-tag-remove-button">
//                               <CloseIcon onClick={() => removeMetaTag(key)} />
//                             </div>
//                           </Row>
//                         </Col>
//                       </Row>
//                     ))}
//                   </Col>
//                 </Row>
//               ) : (
//                 <div
//                   style={{
//                     textAlign: "center",
//                     alignItems: "center",
//                     height: "20vh",
//                     backgroundColor: "rgba(0,0,0,0.025)",
//                     border: "1px solid #b0bec5",
//                     lineHeight: "20vh",
//                     color: "grey",
//                   }}
//                 >
//                   No Tags Created
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </>
//   );
// };

// const GazetteerModal = ({ showModal, handleClose, tempData, setTempData }) => {
//   // useEffect(() => {
//   //   console.log(tempData);
//   // }, [tempData]);

//   return (
//     <Modal show={showModal} onHide={handleClose}>
//       <Modal.Header closeButton>
//         <Modal.Title>Manual Entry</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <textarea
//           style={{
//             width: "100%",
//             backgroundColor: "rgba(0,0,0,0.025)",
//             padding: "0.5rem",
//             overflowY: "auto",
//             height: "20vh",
//             outline: "none !important",
//             border: "1px solid #b0bec5",
//             resize: "none",
//           }}
//           // className="preview-container-editable"
//           placeholder="Enter tokens"
//           onChange={(e) =>
//             setTempData((prevState) => ({
//               ...prevState,
//               fileName: "manual entry",
//               data: e.target.value.split("\n"),
//             }))
//           }
//           value={tempData && tempData.data.join("\n")}
//           wrap="off"
//         />
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" size="sm" onClick={handleClose}>
//           Close
//         </Button>
//         <Button variant="primary" size="sm" onClick={handleClose}>
//           Save Changes
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

export default Schema;

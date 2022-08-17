import { useEffect, useState } from "react";
import { CompactPicker } from "react-color";
import { useDispatch, useSelector } from "react-redux";
import { deleteMetaTag, selectMetaTags, setMetaTags } from "../createStepSlice";

import { grey } from "@mui/material/colors";

import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CreateIcon from '@mui/icons-material/Create';

import { Grid, Typography, List, ListItem, IconButton, ListItemAvatar, Avatar, ListItemText, Stack, Button, TextField } from "@mui/material"

const infoContent = {
  tags: {
    title: "Meta Tags",
    content:
      "Meta tags are used to give tokens contextual classifications.\nHere meta tag classes can be specified and a gazetteer uploaded (if available in .txt file format) or entered manually.",
    format: ".txt\nc/o\no/h\nu/s\n",
  },
};

const Schema = () => {

  const [tags, setTags] = useState([])

  return (
    <Grid>
      <Grid>
        <p
          style={{
            fontSize: "10px",
            color: "grey",
            marginBottom: "0.5em",
          }}
        >
          Note: Tag names must have underscores instead of white space and
          gazetteers must be in .txt file format
        </p>
        {/* <TagContainer /> */}
        <TagList tags={tags} setTags={setTags} />
      </Grid>
    </Grid>
  );
};


const TagList = ({ tags, setTags }) => {
  const tagTemplate = { 'name': '', 'colour': grey[500], 'fileName': '', 'data': '' }

  const [currentTag, setCurrentTag] = useState(tagTemplate)
  const addNewTag = () => {
    setTags([...tags, currentTag])
    setCurrentTag(tagTemplate)
  }

  const handleDelete = (index) => {
    console.log(index)
    setTags(prevState => prevState.filter((_, idx) => idx !== index))
  }


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


  console.log('currentTag', currentTag)

  return (
    <Grid item xs={12} md={12}>
      <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
        Create Token Classification Tag
      </Typography>
      <Stack direction="column" spacing={2}>
        <TextField
          sx={{ bgcolor: currentTag.colour, color: 'white' }}
          label="name" value={currentTag.name} onChange={(e) => setCurrentTag({ ...currentTag, 'name': e.target.value })} />
        <CompactPicker
          color={currentTag.colour}
          onChange={(color) => setCurrentTag({ ...currentTag, 'colour': color.hex })}
          onChangeComplete={(color) => setCurrentTag({ ...currentTag, 'colour': color.hex })}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="contained" disableElevation>Upload Dictionary</Button>
          <Button variant="contained" disableElevation>Manually Enter Dictionary</Button>
        </Stack>
        <Button variant="contained" onClick={addNewTag} disabled={currentTag.name === ''}>Create tag</Button>
      </Stack>
      <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
        Created Tags
      </Typography>
      <List>
        {tags.map((tag, index) => (
          <ListItem
            sx={{ border: '1px solid orange' }}
            secondaryAction={
              <Stack direction="row" spacing={0}>
                <IconButton aria-label="upload">
                  <FileUploadIcon />
                </IconButton>
                <IconButton aria-label="create">
                  <CreateIcon />
                </IconButton>
                <IconButton aria-label="colour">
                  <BrushIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: tag.colour }}>{tag.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={tag.name === '' ? 'Enter tag name' : tag.name}
              secondary={`tag number ${index}`}
            />
          </ListItem>
        ))}
      </List >
    </Grid >
  )
}



// const TagContainer = () => {
//   const dispatch = useDispatch();
//   const metaTags = useSelector(selectMetaTags);

//   const DEFAULT_COLOUR = "#eceff1";

//   const [showModal, setShowModal] = useState(false);

//   const [tempColour, setTempColour] = useState(DEFAULT_COLOUR);
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
//     <Popover id="popover-colour">
//       <Popover.Title>Select Colour</Popover.Title>
//       <Popover.Content>
//         <CompactPicker
//           color={tempColour}
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
//           setMetaTags({ [tempMetaTag]: { ...tempData, colour: tempColour } })
//         );
//       } else {
//         // If the tag does not have associated data
//         // console.log("TAG WITHOUT DATA!");
//         dispatch(
//           setMetaTags({
//             [tempMetaTag]: { fileName: null, data: [], colour: tempColour },
//           })
//         );
//       }

//       // Reset states
//       setTempMetaTag("");
//       setTempColour(DEFAULT_COLOUR);
//       // document.getElementById("formControlTempMetaTag").value = null; // essentially resets form
//       setTempData(null);
//     }
//   };

//   const removeMetaTag = (tagName) => {
//     dispatch(deleteMetaTag(tagName));
//   };

//   const editMetaTag = (tagName, colour) => {
//     dispatch(
//       setMetaTags({ [tagName]: { ...metaTags[tagName], colour: colour } })
//     );
//   };

//   const getFontColour = (colour) => {
//     // Get token contrast ratio (tests white against colour) if < 4.5 then sets font color to black
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

//     const ratioWhite = contrast(hexToRgb(colour), [255, 255, 255]);
//     const ratioBlack = contrast(hexToRgb(colour), [0, 0, 0]);

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
//                     <Form.Label>Colour</Form.Label>
//                     <Form.Control
//                       type="color"
//                       size="sm"
//                       id="exampleColorInput"
//                       defaultValue={DEFAULT_COLOUR}
//                       title="Choose your color"
//                       style={{ width: "50px", cursor: "pointer" }}
//                       onChange={(e) => setTempColour(e.target.value)}
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
//                                 backgroundColor: metaTags[key].colour,
//                                 color: getFontColour(metaTags[key].colour),
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
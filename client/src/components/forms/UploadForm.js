import React, { useState, useEffect } from 'react'
import { Button, Form, Col, Table, OverlayTrigger, Popover } from 'react-bootstrap';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { MdAddCircle, MdRemoveCircle, MdBrush } from 'react-icons/md';
import { CompactPicker } from 'react-color';


const DEFAULT_COLOUR = "#9B9B9B"
const REPLACE_COLOUR = "#99BF9C"

const schema = yup.object().shape({
    projectName: yup.string().required(),
    projectDescription: yup.string().required(),
  });
  
export default function UploadForm({ setShowUpload, setIsSubmitting }) {
    const [fileData, setFileData] = useState({'textFile': {'meta': null, 'data': null}, 'rpFile': {'meta': null, 'data': null}})
    const [dataFileLoaded, setDataFileLoaded] = useState(false);
    
    // States for handling metatag creation
    const [tempMetaTag, setTempMetaTag] = useState('');
    const [tempData, setTempData] = useState({meta: null, data: null});
    const [tempColour, setTempColour] = useState(DEFAULT_COLOUR)
    const [metaTags, setMetaTags] = useState({});
    

    const [formSubmitted, setFormSubmitted] = useState(false);
    
    useEffect(() => {
      console.log('meta tags', metaTags);
    }, [metaTags])


    const readFile = (fileKey, fileMeta) => {
        let reader = new FileReader();
        reader.readAsText(fileMeta);
        reader.onload = () => {
            console.log(fileMeta)
            const fileExtension = fileMeta.name.split('.').slice(-1)[0];

            if (fileExtension === 'txt'){
                // Split lines and remove any documents that are empty
                const newFileData = {"meta": fileMeta, "data": reader.result.split('\n').filter(line => line !== "")}
                console.log('file data for', fileKey, newFileData);
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}))
                if (fileKey === 'textFile'){
                  console.log('input data', newFileData);
                  setDataFileLoaded(true);
                }

                setTempData(prevState => ({...prevState, [fileKey]: newFileData}))  // NEW


            } else if (fileExtension === 'json'){
                // JSON is read as a string - converts to Object
                const newFileData = {"meta": fileMeta, "data": JSON.parse(reader.result)}
                console.log('json data', newFileData);
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}))


            } else if (fileExtension === 'csv'){
                console.log('reading .csv')
                // console.log(reader.result);

                // Process CSV by splitting on \n and then splitting on commas
                // Skips empty rows
                // Rows will the be used to build 
                // TODO: investigate if this process needs to be made async...
                const rowsObject = reader.result.split('\n').filter(line => line !== "").map(line => ({[line.split(',')[0].trim()]: line.split(',')[1].trim()}));
                console.log(rowsObject);

                // Combine row objects into { str2: str1} objects
                const csvData = Object.assign({}, ...rowsObject);
                
                console.log(csvData);
                const newFileData = {"meta": fileMeta, "data": csvData};
                setFileData(prevState => ({...prevState, [fileKey]: newFileData}));
            }
        }
    }


    const addMetaTag = () => {
      console.log('adding meta tag')
      console.log(tempMetaTag)
      if (tempMetaTag !== '' && tempData){
        console.log('adding ', tempData, 'to meta tags')
        if (Object.keys(tempData).includes(tempMetaTag)){
          tempData[tempMetaTag]['colour'] = tempColour
          console.log(tempData);
          setMetaTags(prevState => ({...prevState, ...tempData}));
        } else {
          setMetaTags(prevState => ({...prevState, [tempMetaTag]: {meta: null, data: [], colour: tempColour}}))
        }

        // Reset states
        setTempMetaTag('');
        setTempColour(DEFAULT_COLOUR)
        document.getElementById('formControlTempMetaTag').value = null; // essentially resets form
        setTempData({meta: null, data: null, colour: null});
      } 
    }

    const removeMetaTag = (tagName) => {
      console.log(`removing ${tagName} tag`);
      setMetaTags(prevState => Object.fromEntries(Object.entries(prevState).filter(([key, value]) => key !== tagName)));

      console.log(metaTags);
    }

    const createProject = async (values) => {
        if (fileData['textFile'].data.length > 0){
          // Only require raw texts, users might not have any other artifacts.
          console.log('raw texts loaded')

          const maps = Object.keys(metaTags).map(tagKey => ({"type": tagKey, "colour": metaTags[tagKey].colour,"tokens": metaTags[tagKey].data}))

          console.log('maps', maps);

          if (fileData["rpFIle"] && Object.keys(fileData["rpFile"].data).length > 0){
            // add replacements to maps if they exist
            maps.push({"type": "rp", "colour": REPLACE_COLOUR, "replacements": fileData["rpFile"].data})
          } else {
            maps.push({"type": "rp", "colour": REPLACE_COLOUR,"replacements": {}})
          }

          console.log('maps', maps);

          const formPayload = {
            name: values.projectName,
            description: values.projectDescription,
            texts: fileData['textFile'].data,
            maps: maps
          }

          console.log('form payload', formPayload)

          if (formSubmitted === false){
            console.log('submitting...');
            setIsSubmitting(true);
            const response = await axios.post('/api/project/create', formPayload);

            if (response.status === 200){
                console.log('response of create project', response);
                setFormSubmitted(true);
                setShowUpload(false);
            }
          }
        }
    }


    const popover = (
      <Popover id="popover-colour">
        <Popover.Title>
          Select Colour
          </Popover.Title>
        <Popover.Content>
          <CompactPicker
            color={tempColour}
            onChange={color => setTempColour(color.hex)}
            onChangeComplete={color => setTempColour(color.hex)}

          />
        </Popover.Content>
      </Popover>
    )


    return (
    <Formik
      validationSchema={schema}
      onSubmit={(values) => createProject(values)}
      initialValues={{
        projectName: '',
        projectDescription: '',
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        values,
        touched,
        isValid,
        errors,
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationFormik01">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                name="projectName"
                value={values.projectName}
                onChange={handleChange}
                isValid={touched.projectName && !errors.projectName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectName}
              </Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationFormik02">
              <Form.Label>Project Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Description"
                name="projectDescription"
                value={values.projectDescription}
                onChange={handleChange}
                isValid={touched.projectDescription && !errors.projectDescription}
              />
              <Form.Control.Feedback type="invalid">
                {errors.projectDescription}
              </Form.Control.Feedback>
            </Form.Group>
        </Form.Row>

        <Form.Group>
          <Form.Row>
                <Col>
                    <Form.File
                        id="exampleFormControlFile1"
                        label="Raw text documents"
                        onChange={(e) => setFileData(prevState => ({...prevState, "textFile": {"meta": e.target.files[0], "data": readFile("textFile", e.target.files[0])}}))}
                    />
                    <Form.Text id="passwordHelpBlock" muted>
                        Raw text documents are those that will be annotated for lexical normalisation.
                        These should be in text (.txt) format.
                    </Form.Text>
                </Col>
                <Col>
                    <Form.File
                        id="exampleFormControlFile3"
                        label="Replacements"
                        onChange={(e) => setFileData(prevState => ({...prevState, "rpFile": {"meta": e.target.files[0], "data": readFile("rpFile", e.target.files[0])}}))}
                        />
                    <Form.Text id="passwordHelpBlock" muted>
                        Replacements should be in .csv or .json file format.
                    </Form.Text>
                </Col>
            </Form.Row>
        </Form.Group>

        <h3>Meta Tags</h3>
        <small>
          Meta tags are used to give tokens higher level classifications. Here meta tag classes can be defined and mappings can be uploaded (if available).
        </small>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Upload</th>
              <th>Colour</th>
              <th>Add</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td ><input type="text" style={{width: '8em'}} value={tempMetaTag} onChange={e => setTempMetaTag(e.target.value)}></input></td>
              <td>
                <Form.File
                    id="formControlTempMetaTag"
                    onChange={(e) => {console.log(e.target.files); setTempData({[tempMetaTag]: {"meta": e.target.files[0], "data": readFile(tempMetaTag, e.target.files[0])}})}}
                />
              </td>
              <td>
                <OverlayTrigger trigger="click" placement="left" overlay={popover}>
                  <Button style={{borderColor: tempColour, backgroundColor: tempColour, padding: '0.2em'}}>
                    <MdBrush/>
                  </Button>
                </OverlayTrigger>
              </td>
              <td>
                {
                  tempMetaTag !== '' ?
                  <MdAddCircle style={{fontSize: '22px', color: '#28a745'}} onClick={() => addMetaTag()}/>
                  : null
                }
              </td>
            </tr>
            {
              Object.keys(metaTags).length > 0?
              Object.keys(metaTags).map(key => (<tr>
                <td>{key}</td>
                <td>{metaTags[key].meta ? metaTags[key].meta.name : 'No data uploaded'}</td>
                <td>
                  <Button style={{borderColor: metaTags[key].colour, backgroundColor: metaTags[key].colour, padding: '0.2em'}}>
                    <MdBrush style={{color: 'white'}}/>
                  </Button>
                </td>
                <td>
                  <MdRemoveCircle style={{fontSize: '22px', color: '#dc3545'}} onClick={() => removeMetaTag(key)}/>
                </td>
              </tr>))
              : null
            }
          </tbody>
        </Table>
        <small>Suggested: <i>domain_specific</i>, <i>sensitive</i>, <i>noise</i></small>
        <br/>
        <small>(Note: please use underscores between words instead of white space)</small>

        <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: '4em'}}>
          <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button type="submit">Create Project</Button>
        </div>

        </Form>
      )}
    </Formik>
    )
}

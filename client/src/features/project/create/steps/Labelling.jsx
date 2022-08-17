// import { Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { selectLabellingActions, setStepData } from "../createStepSlice";

import HelpIcon from '@mui/icons-material/Help';

import { Grid } from "@mui/material"

const Labelling = () => {
  const dispatch = useDispatch();
  const actions = useSelector(selectLabellingActions);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p
          id="section-title"
          style={{
            backgroundColor: "white",
            fontSize: "1.5rem",
            textAlign: "center",
            padding: "0",
            margin: "0",
          }}
        >
          Automatic Labelling Settings
        </p>
        <span
          style={{
            display: "block",
            borderColor: "#bdbdbd",
            borderTopStyle: "solid",
            borderTopWidth: "2px",
            width: "75px",
            margin: "auto",
            marginTop: "0.5rem",
            marginBottom: "1.5rem",
          }}
        />
      </div>
      <Grid style={{ margin: "0rem 0.25rem 0rem 0.25rem" }}>
        <Grid sm={12} md={6}>
          <h1 id="section-subtitle">
            <HelpIcon /> Information
          </h1>
          When LexiClean processes your corpora, it uses an inverse tf-idf
          of masked out-of-vocabulary tokens to identify documents that will
          give biggest 'bang-for-buck' normalisations. Additionally,
          additional automatic labelling functions can be applied as seen on
          the right.
          <p style={{ marginTop: "0.5rem" }}>
            <strong>Label digits as in-vocabulary:</strong> Considers digits
            (1, 22, 388, etc) as in-vocabulary.
          </p>
        </Grid>
        <Grid sm={12} md={6}>
          <h1 id="section-subtitle">Actions</h1>
          {/* <Form.Check
            type="checkbox"
            label="Label digits as in-vocabulary"
            title="Labels digits as in-vocabulary. Examples such as 001 and 21/2 will be excluded from automatic OOV classification"
            name="detectDigitsCheck"
            style={{ fontSize: "14px" }}
            checked={actions.detectDigits}
            onChange={(e) =>
              dispatch(setStepData({ detectDigits: e.target.checked }))
            }
          /> */}
          {/* <Form.Check
                type="checkbox"
                label="Exclude tokens as out-of-vocabulary"
                name="detectSpecialTokensCheck"
                style={{ fontSize: "14px" }}
                disabled
                // checked={values.detectDigits}
                // onChange={(e) =>
                //   setFieldValue("detectDigits", e.target.checked)
                // }
              /> */}
          {/* <Form.Control
                type="text"
                disabled={true}
                // {!values.removeCharacters}
                placeholder={""}
                // name="charsRemove"
                // value={values.charsRemove}
                // onChange={(e) => {
                //   setFieldValue("charsRemove", e.target.value);
                //   setRemoveCharSet(e.target.value);
                // }}
                autoComplete="off"
                style={{ fontSize: "14px", marginBottom: "0.5rem" }}
              /> */}
        </Grid>
      </Grid>
    </>
  );
};


export default Labelling
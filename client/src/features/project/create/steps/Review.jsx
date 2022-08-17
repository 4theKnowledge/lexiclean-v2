import { useSelector } from "react-redux";
import { selectSteps } from "../createStepSlice";

import { Grid, Chip } from "@mui/material"

const Review = () => {
  const steps = useSelector(selectSteps);

  const keyToNaturalMap = {
    lowercase: "Lower Case",
    removeDuplicates: "Remove Duplicates",
    removeChars: "Remove Special Characters",
    detectDigits: "Detect Digits",
  };

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
          Review and Create
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

      <Grid>
        <Grid
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Grid sm={12} md={4}>
            <p id="section-subtitle">Details</p>
          </Grid>
          <Grid sm={12} md={8}>
            <Grid>
              <Chip style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                Name: {steps.filter(s => s.name === 'details')[0].data.name}
              </Chip>
              <Chip style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                Description: {steps.filter(s => s.name === 'details')[0].data.description}
              </Chip>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Grid sm={12} md={4}>
            <p id="section-subtitle">Uploads</p>
          </Grid>

          <Grid sm={12} md={8}>
            <Grid>
              <Chip style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                {steps.filter(s => s.name === 'upload')[0].data.corpus.length} Documents
              </Chip>
              <Chip style={{ backgroundColor: "#cfd8dc", margin: "0.125rem" }}>
                {Object.keys(steps.filter(s => s.name === 'upload')[0].data.replacements).length}{" "}
                Replacements
              </Chip>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Grid sm={12} md={4}>
            <p id="section-subtitle">Preprocessing</p>
          </Grid>

          <Grid sm={12} md={8}>
            <Grid>
              {Object.keys(steps.filter(s => s.name === 'preprocessing')[0].data).filter(
                (action) => steps.filter(s => s.name === 'preprocessing')[0].data[action]
              ).length === 0 ? (
                <Chip
                  style={{ backgroundColor: "#eceff1", margin: "0.125rem" }}
                >
                  No Actions Applied
                </Chip>
              ) : (
                Object.keys(steps.filter(s => s.name === 'preprocessing')[0].data)
                  .filter((action) => steps.filter(s => s.name === 'preprocessing')[0].data[action])
                  .map((action) => {
                    return (
                      <Chip
                        style={{
                          backgroundColor: "#cfd8dc",
                          margin: "0.125rem",
                        }}
                      >
                        {keyToNaturalMap[action]}
                      </Chip>
                    );
                  })
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Grid sm={12} md={4}>
            <p id="section-subtitle">Schema</p>
          </Grid>

          <Grid sm={12} md={8}>
            <Grid>
              {Object.keys(steps.filter(s => s.name === 'schema')[0].data.metaTags).length === 0 ? (
                <Chip
                  style={{ backgroundColor: "#eceff1", margin: "0.125rem" }}
                >
                  No Tags Created
                </Chip>
              ) : (
                Object.keys(steps.filter(s => s.name === 'schema')[0].data.metaTags).map((tag) => {
                  return (
                    <Chip
                      style={{
                        backgroundColor: steps.filter(s => s.name === 'schema')[0].data.metaTags[tag].colour,
                        margin: "0.125rem",
                      }}
                    >
                      {tag}
                    </Chip>
                  );
                })
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          style={{
            borderBottom: "1px solid lightgrey",
            margin: "1rem 4rem",
            padding: "0.5rem 0rem",
          }}
        >
          <Grid sm={12} md={4}>
            <p id="section-subtitle">Automatic Labelling</p>
          </Grid>

          <Grid sm={12} md={8}>
            <Grid>
              {Object.keys(steps.filter(s => s.name === 'labelling')[0].data).filter(
                (action) => steps.filter(s => s.name === 'labelling')[0].data[action]
              ).length === 0 ? (
                <Chip
                  style={{ backgroundColor: "#eceff1", margin: "0.125rem" }}
                >
                  No Actions Applied
                </Chip>
              ) : (
                Object.keys(steps.filter(s => s.name === 'labelling')[0].data)
                  .filter((action) => steps.filter(s => s.name === 'labelling')[0].data[action])
                  .map((action) => {
                    return (
                      <Chip
                        style={{
                          backgroundColor: "#cfd8dc",
                          margin: "0.125rem",
                        }}
                      >
                        {keyToNaturalMap[action]}
                      </Chip>
                    );
                  })
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Review;
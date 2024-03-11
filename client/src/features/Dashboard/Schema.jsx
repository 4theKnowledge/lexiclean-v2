import StyledCard from "./StyledCard";
import SchemaEditor from "../../shared/components/SchemeEditor";
import { Alert, AlertTitle, Box } from "@mui/material";

const Schema = ({ loading, data, handleUpdateSchema }) => {
  return (
    <StyledCard title="Schema">
      <Box p="0rem 1rem">
        <Alert severity="info">
          <AlertTitle>Schema Modification</AlertTitle>
          This area allows you to adjust your project's entity schema. It's
          important to note that adding new or editing existing entity labels is
          possible, but removing them is not currently supported. Each entity
          label features a badge, reflecting the count of gazetteer words or
          phrases linked to it. These terms were used during the project setup
          for initial annotations. To select a label, simply left-click on it.
          If you wish to deselect a label, left-click on it once more.
        </Alert>
      </Box>
      {data && data.details.tags && (
        <SchemaEditor
          values={{
            tags: data.details.tags.map((t) => ({ ...t, data: [] })),
          }}
          updateValue={handleUpdateSchema}
          disableTextEditor={true}
        />
      )}
    </StyledCard>
  );
};

export default Schema;

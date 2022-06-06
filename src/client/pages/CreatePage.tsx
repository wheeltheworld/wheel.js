import React from "react";
import axios from "axios";
import FormGenerator from "../components/FormGenerator";
import { useHistory } from "react-router-dom";
import useManifest from "../utils/hooks/useManifest";
import { Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useNotification } from "../utils/hooks/useNotification";
import { cleanData, RelationModifies } from "../utils/funcs/cleanData";

interface CreatePageProps {
  moduleName: string;
  modelName: string;
}

const CreatePage: React.FC<CreatePageProps> = ({ moduleName, modelName }) => {
  const { endpoint, manifest, get } = useManifest();
  const { push } = useHistory();
  const { success, error } = useNotification();

  if (!manifest) {
    return null;
  }

  const model = get({ moduleName, modelName });
  const { fields, label } = model;

  const handleSubmit = async (data: any, modifies: RelationModifies) => {
    try {
      const { data: ent } = await axios.post(
        endpoint({
          modelName,
          moduleName,
        }),
        cleanData(model, data, modifies)
      );
      const indexable = fields.indexables[0]?.name;
      success({
        title: `Success`,
        description: `${label} created successfully`,
      });
      if (indexable) {
        push(`/_/${moduleName}/${modelName}/${indexable}/${ent[indexable]}`);
      } else {
        push(`/_/${moduleName}/${modelName}`);
      }
    } catch (e) {
      error({
        title: `Error`,
        description: `${e}`,
      });
    }
  };

  return (
    <>
      <Button as={RouterLink} to={`/_/${moduleName}/${modelName}`}>
        Go Back
      </Button>
      <FormGenerator
        onSubmit={handleSubmit}
        moduleName={moduleName}
        modelName={modelName}
      />
    </>
  );
};

export default CreatePage;

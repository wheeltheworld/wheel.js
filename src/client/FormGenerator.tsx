import React, { FormEventHandler, useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import DataField from "./DataField";
import type { Field } from "src/shared/manifest";

interface FormGeneratorProps {
  initValues?: any;
  fields: Field[];
  onChange?: (values: any) => void;
  onSubmit?: (values: any) => void;
}

const FormGenerator: React.FC<FormGeneratorProps> = ({
  fields,
  onChange,
  onSubmit,
  initValues,
}) => {
  const [data, setData] = useState<Record<string, string>>(initValues || {});
  const handleChange = (name: string) => (value: any) => {
    setData({ ...data, [name]: value });
  };

  useEffect(() => {
    onChange?.(data);
  }, [data]);

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    onSubmit?.(data);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <DataField
          onChange={handleChange(field.name)}
          value={data[field.name]}
          key={field.name}
          type={field.type}
        />
      ))}
    </Box>
  );
};

export default FormGenerator;

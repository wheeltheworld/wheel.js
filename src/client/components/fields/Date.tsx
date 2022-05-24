import { Box, Flex, Input } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import type { IDate } from "../../../shared/IDate";

interface DateProps {
  value: IDate;
  onChange: (value: IDate) => void;
  readOnly: boolean;
}

const Date: React.FC<DateProps> = ({ value, onChange, readOnly }) => {
  const [date, setDate] = useState<Partial<IDate>>(value || {});
  const [error, setError] = useState<string>("");
  const [shouldShowError, setShouldShowError] = useState(false);
  const handleChange =
    (type: keyof IDate) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setDate({
        ...date,
        [type]: e.target.value ? Number(e.target.value) : null,
      });
      setShouldShowError(true);
    };

  useEffect(() => {
    if (!date.day || !date.month || !date.year) {
      setError("Please fill the date");
    } else {
      onChange?.(date as IDate);
    }
  }, [date]);

  return (
    <>
      <Flex gap="10px" alignItems="center">
        <Input
          onChange={handleChange("day")}
          value={date.day}
          width="80px"
          readOnly={readOnly}
        />
        /
        <Input
          onChange={handleChange("month")}
          value={date.month}
          width="80px"
          readOnly={readOnly}
        />
        /
        <Input
          onChange={handleChange("year")}
          value={date.year}
          width="80px"
          readOnly={readOnly}
        />
      </Flex>
      <Box color="lightgray">dd/mm/yyyy</Box>
      {shouldShowError && error && <Box color="red.500">{error}</Box>}
    </>
  );
};

export default Date;
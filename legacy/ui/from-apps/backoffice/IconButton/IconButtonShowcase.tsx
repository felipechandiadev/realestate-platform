import React from "react";
import IconButton from "./IconButton";

export default function IconButtonShowcase() {
  const variants = [
    "contained-primary",
    "contained-secondary",
    "text",
    "basic",
    "outlined",
  ];
  return (
    <>
    <IconButton icon="home" variant="containedPrimary" size={'lg'} />
    <IconButton icon="settings" variant="containedSecondary" size={'md'} />
    <IconButton icon="settings" variant="text" size={'md'} />
    <IconButton icon="settings" variant="basic" size={'md'} />
    <IconButton icon="settings" variant="outlined" size={'xl'} />
    </>
  );
}

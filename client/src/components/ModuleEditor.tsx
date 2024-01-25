import * as React from "react";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useUser } from "../hooks/useUser";
import { ApiClient } from "../hooks/ApiClient";
import { LongMenuProps } from "../types";

export default function LongMenu({editObject, dataName, dataDescription, id, moduleCompletion, deleteObject}: LongMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [dataNameLocal, setDataNameLocal] = useState(dataName);
  const [dataDescriptionLocal, setDataDescriptionLocal] = useState(dataDescription);
  const [openModal, setOpenModal] = useState(false);
  const handleClick = (event : any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleOpenModal = () => {
    setDataNameLocal(dataName);
    setDataDescriptionLocal(dataDescription);
    setOpenModal(true);
    setAnchorEl(null); // Close the menu when the modal opens
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const { user } = useUser();
  const { put, del } = ApiClient();

  async function handleModuleEdit() {
    try {
      await put(`/module/edit/${id}`, {
        name: dataNameLocal,
        description: dataDescriptionLocal,
        completion: moduleCompletion,
        email: user.email,
      });
      editObject({
        name: dataNameLocal,
        description: dataDescriptionLocal,
        id: id,
        completion: moduleCompletion
      });
      handleCloseModal();
    } catch (error : any) {
      console.error(error);
      alert(error.response ? error.response.data : error);
    }
  }

  async function handleModuleDelete() {
    try {
      const result = await del(`/module/delete/${id}`);
      console.log(result);
      deleteObject(id);
      handleClose();
    } catch (error : any) {
      console.error(error);
      alert(error.message ? error.message : error);
    }
  }

  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem key={"edit"} onClick={handleOpenModal}>
          Edit
        </MenuItem>
        <MenuItem key={"delete"} onClick={handleModuleDelete}>
          Delete
        </MenuItem>
      </Menu>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Edit Object</DialogTitle>
        <DialogContent>
          <TextField
            value={dataNameLocal}
            onChange={(e) => setDataNameLocal(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            value={dataDescriptionLocal}
            onChange={(e) => setDataDescriptionLocal(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" onClick={handleModuleEdit}>
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
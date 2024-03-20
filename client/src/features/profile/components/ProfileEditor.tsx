import React, { useState, useMemo, useCallback, ReactElement } from "react";
import { Button, Modal } from "@mui/material";
import { Profile } from "../../../types";
import { useHotKeys } from "../../../hooks/useHotKeys";
import { useProfileUpdater } from "../hooks/useProfile";
import { HiCheck } from "react-icons/hi";
import { HiBackspace } from "react-icons/hi";
import TextBox from "./TextBox";

interface ProfileEditorProps {
    accountId: number,
    profile: Profile,
    open: boolean,
    onSave: (newProfile: Profile) => void,
    onCancel: () => void
}

const DEFAULT_BORDER = "border-[0.8px] border-solid border-[rgb(219, 219, 219)]";

export default function ProfileEditor({accountId, profile, open, onSave, onCancel}: ProfileEditorProps) {
    const [newProfile, setNewProfile] = useState<Profile>({...profile});
    const { mutateAsync: updateProfile } = useProfileUpdater(accountId);
    const { handleEnterPress } = useHotKeys();

    const saveChanges = useCallback(async () => {
        await updateProfile(newProfile);
        onSave(newProfile);
    }, [newProfile, updateProfile, onSave]);

    const textBoxes = useMemo<ReactElement[]>(() => {
        const requiredFields: string[] = ["username", "firstName", "lastName"];
        const noTextInput: string[] = ["profilePicture"];
        const result: ReactElement[] = [];
        for(const [key, value] of Object.entries(newProfile)) {
            if(typeof value === "number" || noTextInput.includes(key)) {
                continue;
            }
            
            result.push(
                <TextBox
                    name={key} 
                    value={value}
                    onEnterPress={(event: React.KeyboardEvent) => handleEnterPress(event, saveChanges)}
                    onChange={(event: React.ChangeEvent) => {
                        const editedProfile: Profile = {...newProfile};
                        editedProfile[key] = (event.target as HTMLInputElement).value;
                        setNewProfile(editedProfile);
                    }}
                    required={requiredFields.includes(key)}
                    isTextArea={key === "bio"}
                />
            );
        }
        return result;
    }, [newProfile, setNewProfile, saveChanges, handleEnterPress]);

    const disabled = useMemo(() => {
        return newProfile.username === "" || newProfile.firstName === "" || newProfile.lastName === "";
    }, [newProfile]);

    return (
        <Modal
          className="absolute float-left flex items-center justify-center top-2/4 left-2/4 "
          open={open}
          onClose={onCancel}
        >
            <div className={`bg-white w-2/4 flex flex-col items-center justify-start p-4 gap-5 ${DEFAULT_BORDER}`}>
                <div className="w-full flex justify-center border-b border-black">
                    <h1 className="font-headlineFont text-5xl pb-2">Edit Profile</h1>
                </div>
                <div className={`flex flex-col justify-around content-normal p-2.5 mx-10 my-7 gap-2.5 w-4/5`}>
                    {textBoxes}
                </div>
                <div className={"flex flex-row gap-5 justify-center"}> 
                    <Button 
                        variant="contained" 
                        onClick={saveChanges} 
                        size="large" 
                        startIcon={<HiCheck />}
                        disabled={disabled}
                    >
                        Confirm
                    </Button>
                    <Button variant="contained" onClick={onCancel} size="large" startIcon={<HiBackspace />}>Cancel</Button>
                </div>
            </div>
        </Modal>
    );
}

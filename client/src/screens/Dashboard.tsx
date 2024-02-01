import React, { useState, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { ApiClient } from "../hooks/ApiClient";
import profilePicture from "../resources/Default_Profile_Picture.jpg";
import useProfile from "../hooks/useProfile";
import { useHotKeys } from "../hooks/useHotKeys";
import { emptyProfile, Profile } from "../types";

interface ProfileActionProps {
  variable: string,
  input: string | number,
}

const STYLE = {
  containerHeight: "h-[90vh]",
  containerWidth: "w-[40vw]",
  aboutMeSize: "h-[25vh] w-[28vw]",
  borderValues: "border-[0.8px] border-solid border-[rgb(219, 219, 219)]",
  defaultGap: "gap-[5px]",
  flexRow: "flex flex-row",
  flexColumn: "flex flex-col"
}

const INFORMATION_CONTAINER_STYLE = `${STYLE.containerHeight} ${STYLE.containerWidth} ${STYLE.borderValues} ${STYLE.flexColumn} justify-around content-normal p-[10px] mx-[40px] mt-[24px] ${STYLE.defaultGap} text-[24px]`;
const TEXT_ENTRY_STYLE = `flex flex-row ${STYLE.defaultGap} justify-between`;
const VARIABLE_DISPLAY_STYLE = `flex flex-row ${STYLE.defaultGap} justify-between text-start`;
const BUTTON_STYLE = `h-[40px] ${STYLE.borderValues} rounded px-[8px] text-[16px] bg-[#8C1515] text-white`

const PROFILE_VARIABLES = {
  username: "username",
  firstName: "first_name",
  lastName: "last_name",
  profilePicture: "profile_picture",
  jobTitle: "job_title",
  bio: "bio"
}

const PROFILE_ACTIONS = new Map();
PROFILE_ACTIONS.set(PROFILE_VARIABLES.username, (profile : Profile, input : string) => {return {...profile, username: input}});
PROFILE_ACTIONS.set(PROFILE_VARIABLES.firstName, (profile : Profile, input : string) => {return {...profile, firstName: input}});
PROFILE_ACTIONS.set(PROFILE_VARIABLES.lastName, (profile : Profile, input : string) => {return {...profile, lastName: input}});
PROFILE_ACTIONS.set(PROFILE_VARIABLES.profilePicture, (profile: Profile, input : string) => {return {...profile, profilePicture: input}});
PROFILE_ACTIONS.set(PROFILE_VARIABLES.jobTitle, (profile : Profile, input : string) => {return {...profile, jobTitle: input}});
PROFILE_ACTIONS.set(PROFILE_VARIABLES.bio, (profile : Profile, input : string) => {return {...profile, bio: input}});

function updateProfile(profile : Profile, action : ProfileActionProps): Profile {
  if(typeof action.input === "number") {
    return {
      ...profile,
      id: action.input
    };
  }
  
  const actionFunction = PROFILE_ACTIONS.get(action.variable);
  if(typeof actionFunction === "function") {
    return actionFunction(profile, action.input);
  }
  return profile;
}

function DashboardScreen() {
  const [profileState, dispatch] = useReducer(updateProfile, emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const { user, removeUser } = useUser();
  const { put, del } = ApiClient();
  const { data: profileData, isLoading, error } = useProfile();
  const { handleEnterPress } = useHotKeys();

  useEffect(() => {
    console.log("re-rendered...");
    if(isLoading || error) {
      return;
    }

    for(const [key, value] of Object.entries(profileData)) {
      console.log(`Profile data: ${value}`);
      if(typeof value !== "number" && typeof value !== "string") {
        break;
      }  
      dispatch({variable: key, input: value});
    }
  }, [profileData, isLoading, error]);

  async function saveChanges() {
    try {
      await put(`/profile/edit/${profileState.id}`, {
        username: profileState.username,
        firstName: profileState.firstName,
        lastName: profileState.lastName,
        profilePicture: profileState.profilePicture,
        jobTitle: profileState.jobTitle,
        bio: profileState.bio,
      });
      setEditMode(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message ? error.message : error);
    }
  }

  async function deleteAccount() {
    try {
      await del(`/profile/delete/${profileState.id}`);
      await del(`/auth/delete/${user.email}`);
      removeUser();
      navigate("/#");
    } catch (error: any) {
      console.error(error);
      alert(error.response ? error.response : error);
    }
  }
  if (isLoading) {
    return <div>This is loading...</div>
  }
  if (error) {
    console.log(error)
    return <div>This is an error</div>
  }
  return (
    <div className={`w-[100vw] ${STYLE.flexRow} justify-center items-center py-[10px] my-[20px] mx-[10px] ${STYLE.defaultGap}`}>
      <div className={`h-[90vh] ${STYLE.containerWidth} ${STYLE.borderValues} ${STYLE.flexRow} items-center m-[10px] py-[25px] px-[10px] ${STYLE.defaultGap}`}>
        <img src={profilePicture} alt="pfp here" className="h-[10vh] w-[5vw] rounded-full"/>
        {editMode ? (
          <input
            id="username"
            name="profile"
            type="text"
            placeholder="username"
            value={profileState.username}
            defaultValue={profileState.username}
            onKeyUp={(event) => {handleEnterPress(event, saveChanges)}}
            onChange={(event) => {
              dispatch({variable: PROFILE_VARIABLES.username, input: event.target.value});
            }}
          />
        ) : (
          <p className="text-[30px] mb-[10px]">{profileState.username}</p>
        )}
      </div>
      {editMode ? (
        <div className={INFORMATION_CONTAINER_STYLE}>
          <div className={TEXT_ENTRY_STYLE}>
            <label htmlFor="firstName">First name:</label>
            <input
              className={`${STYLE.borderValues}`}
              id="firstName"
              name="profile"
              type="text"
              placeholder="First Name"
              value={profileState.firstName}
              defaultValue={profileState.firstName}
              onKeyUp={(event) => {handleEnterPress(event, saveChanges)}}
              onChange={(event) => {
                dispatch({variable: PROFILE_VARIABLES.firstName, input: event.target.value});
              }}
            />
          </div>
          <div className={TEXT_ENTRY_STYLE}>
            <label htmlFor="lastName">Last name:</label>
            <input
              className={`${STYLE.borderValues}`}
              id="lastName"
              name="profile"
              type="text"
              placeholder="Last Name"
              value={profileState.lastName}
              defaultValue={profileState.lastName}
              onKeyUp={(event) => {handleEnterPress(event, saveChanges)}}
              onChange={(event) => {
                dispatch({variable: PROFILE_VARIABLES.lastName, input: event.target.value});
              }}
            />
          </div>
          <div className={TEXT_ENTRY_STYLE}>
            <label htmlFor="jobTitle">Job title:</label>
            <input
              className={`${STYLE.borderValues}`}
              id="jobTitle"
              name="profile"
              type="text"
              placeholder="Job Title"
              value={profileState.jobTitle}
              defaultValue={profileState.jobTitle}
              onKeyUp={(event) => {handleEnterPress(event, saveChanges)}}
              onChange={(event) => {
                dispatch({variable: PROFILE_VARIABLES.jobTitle, input: event.target.value});
              }}
            />
          </div>
          <p>About Me:</p>
          <input
            id="bio"
            name="profile"
            type="textarea"
            placeholder="bio"
            value={profileState.bio}
            defaultValue={profileState.bio}
            onKeyUp={(event) => {handleEnterPress(event, saveChanges)}}
            onChange={(event) => {
              dispatch({variable: PROFILE_VARIABLES.bio, input: event.target.value});
            }}
            className={`${STYLE.aboutMeSize} px-[8px] text-[16px] ${STYLE.borderValues}`}
          />
        </div>
      ) : (
        <div className={INFORMATION_CONTAINER_STYLE}>
          <div className={VARIABLE_DISPLAY_STYLE}>
            <p>First name:</p> 
            <p>{profileState.firstName ? profileState.firstName : ""}</p>
          </div>  
          <div className={VARIABLE_DISPLAY_STYLE}>
            <p>Last name:</p>
            <p>{profileState.lastName ? profileState.lastName : ""}</p>
          </div>
          <div className={VARIABLE_DISPLAY_STYLE}>
            <p>Job title:</p> 
            <p>{profileState.jobTitle ? profileState.jobTitle : ""}</p>
          </div>
          <p>About Me:</p>
          <br />
          <div className={`${STYLE.aboutMeSize}`}>
            <p>{profileState.bio ? profileState.bio : ""}</p>
          </div>
        </div>
      )}
      <div className={`${STYLE.flexColumn} ${STYLE.defaultGap}`}>
        {editMode ? (
          <button className={BUTTON_STYLE} onClick={saveChanges}>
            Confirm
          </button>
        ) : (
          <button
            className={BUTTON_STYLE}
            onClick={() => {
              setEditMode(true);
            }}
          >
            Edit Profile
          </button>
        )}
        <button className={BUTTON_STYLE} onClick={deleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default DashboardScreen;
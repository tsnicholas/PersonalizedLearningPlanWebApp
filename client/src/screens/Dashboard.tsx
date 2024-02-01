import React, { useEffect, useReducer } from "react";
import profilePicture from "../resources/Default_Profile_Picture.jpg";
import useProfile from "../hooks/useProfile";
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
  const { data: profileData, isLoading, error } = useProfile();

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

  if (isLoading) {
    return <div>This is loading...</div>
  }
  if (error) {
    console.log(error)
    return <div>This is an error</div>
  }
  return (
    <div className={`w-[100vw] ${STYLE.flexRow} justify-center items-center py-[10px] my-[20px] mx-[10px] ${STYLE.defaultGap}`}>
      <div className={`h-[90vh] ${STYLE.containerWidth} ${STYLE.borderValues} ${STYLE.flexRow} items-top m-[10px] py-[25px] px-[10px] ${STYLE.defaultGap}`}>
        <img src={profilePicture} alt="pfp here" className="h-[10vh] w-[5vw] rounded-full"/>
            <div className={`w-[100vw] ${STYLE.flexColumn} justify-left items-top py-[10px] my-[20px] mx-[10px] ${STYLE.defaultGap}`}>
                <p className="text-[30px] mb-[10px]">Name: {profileState.firstName} {profileState.lastName}</p>
                <p className="text-[30px] mb-[10px]">Company:</p>
                <p className="text-[30px] mb-[10px]">Title: {profileState.jobTitle}</p>
                <p className="text-[30px] mb-[10px]">Bio: {profileState.bio}</p>
            </div>
      </div>
      <div className={`h-[90vh] ${STYLE.containerWidth} ${STYLE.borderValues} ${STYLE.flexColumn} items-center m-[10px] py-[25px] px-[10px] ${STYLE.defaultGap}`}>

        <p className="text-[30px] mb-[10px]">{profileState.firstName} {profileState.lastName}</p>
        <p className="text-[30px] mb-[10px]">{profileState.firstName} {profileState.lastName}</p>
      </div>
    </div>
  );
}

export default DashboardScreen;
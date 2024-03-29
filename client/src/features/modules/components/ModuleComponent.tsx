import React, { useState } from "react";
import CreationModal from "./CreationModal";
import ModuleItem from "./ModuleItem";
import { useModules, useModuleUpdater, useModuleRemover } from "../hooks/useModules";
import { Module } from "../../../types";

interface ModuleComponentProps {
  accountId: number
}

const ModuleComponent = ({accountId}: ModuleComponentProps) => {
  const { data: modules, isLoading, error } = useModules(accountId);
  const { mutateAsync: updateModule } = useModuleUpdater();
  const { mutateAsync: deleteModule } = useModuleRemover();
  const [ open, setOpen ] = useState(false);

  function openModal() {
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }
  
  if (isLoading) {
    return <div>Loading, please wait...</div>;
  }

  if (error) {
    return <div>An error has occurred. Please refresh the page and try again.</div>;
  }

  return (
    <div className="flex flex-wrap w-full h-full justify-start gap-[5%]">
      {modules?.map((module: any) => (
        <ModuleItem
          key={module.module_id}
          module={{...module, id: module.module_id, name: module.module_name, completion: module.completion_percent}}
          editModule={async (module: Module) => {await updateModule(module)}}
          deleteModule={async (id: number) => {await deleteModule(id)}}
        />
      ))}
      <div className="flex flex-col transition-transform rounded border border-solid border-black w-[300px] h-[500px] duration-300 shadow-md hover:scale-105 hover:shadow-lg">
        <button
          onClick={openModal}
          className="bg-transparent block h-full w-full no-underline items-center justify-center bg-white"
        >
          <h1>+</h1>
        </button>
        <CreationModal
          accountId={accountId}
          modalTitle="Create a new module"
          open={open}
          closeModal={closeModal}
        />
      </div>
    </div>
  );
};

export default ModuleComponent;

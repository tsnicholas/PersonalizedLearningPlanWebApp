import React from "react";
import {
  Box,
  Button,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import "./GoalStepper.css";
import PropTypes from "prop-types";

export default function GoalStepper({
  restGoalProgress,
  addGoalProgress,
  steps,
  addGoal,
}) {
  GoalStepper.propTypes = {
    restGoalProgress: PropTypes.func,
    addGoalProgress: PropTypes.func,
    steps: PropTypes.array,
    addGoal: PropTypes.func,
  };
  const [activeStep, setActiveStep] = React.useState(0);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    addGoalProgress();
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    restGoalProgress();
  };

  return (
    <div>
      {steps.length === 0 ? (
        <div className="empty-message">Empty</div>
      ) : (
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{ width: 1, display: "flex" }}
        >
          {steps.map((step, index) => (
            <Step key={step.name} sx={{}}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Last step</Typography>
                  ) : null
                }
                sx={{ fontSize: "1.2rem" }}
              >
                {step.name}
              </StepLabel>

              <StepContent>
                <div className="step-content">
                  <Typography
                    sx={{ fontSize: "1.2rem", fontFamily: "var(--bodyFont)" }}
                  >
                    {step.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        sx={{ mt: 1, mr: 1, fontSize: "1rem" }}
                      >
                        {index === steps.length - 1 ? "Finish" : "Complete"}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1, fontSize: "1rem" }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </div>
              </StepContent>
            </Step>
          ))}
          <Step key={"stepcreate"} sx={{}} active={true}>
            <Box sx={{ mb: 2, marginLeft: "1%" }}>
              <div>
                <Button
                  variant="contained"
                  onClick={() => addGoal({ name: "New Goal", description: "" })}
                  sx={{ mt: 1, mr: 1, fontSize: "1rem" }}
                >
                  Create a new Goal
                </Button>
              </div>
            </Box>
          </Step>
        </Stepper>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";
import ReactMarkdown from "react-markdown";

const PlantDoc = () => {
  const [plantTypes, setPlantTypes] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assessment states
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inEditing, setInEditing] = useState(false);
  const [userResponses, setUserResponses] = useState([]);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(false);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const [fadeTransition, setFadeTransition] = useState(false);

  // AI analysis states
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // New state for analysis
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Fetch all plant types on component mount
  useEffect(() => {
    const fetchPlantTypes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${Helpers.apiUrl}user/plant-types/all`,
          Helpers.getAuthHeaders()
        );

        if (response.data && response.data.data) {
          setPlantTypes(response.data.data);
          setFilteredPlants(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching plant types:", err);
        setError("Failed to load plant types. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlantTypes();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter plants based on search term
    if (term.trim() === "") {
      setFilteredPlants(plantTypes);
    } else {
      const filtered = plantTypes.filter((plant) =>
        plant.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPlants(filtered);
    }
  };

  // Generate a random pastel color for bubbles
  const getRandomPastelColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 70%, 80%, 0.8)`;
  };

  // Handle plant bubble click - fetch questionnaire
  const handlePlantClick = async (plant) => {
    try {
      setSelectedPlant(plant);
      setLoadingQuestionnaire(true);
      setAssessmentMode(true);
      setQuestionnaireCompleted(false);
      setUserResponses([]);
      setCurrentQuestionIndex(0);
      setAiAnalysis(null);

      const response = await axios.get(
        `${Helpers.apiUrl}user/questionnaire/plant-type/${plant.id}`,
        Helpers.getAuthHeaders()
      );

      if (response.data) {
        // Sort questions by order
        const sortedQuestions = response.data.questions.sort(
          (a, b) => a.order - b.order
        );
        const questData = {
          ...response.data,
          questions: sortedQuestions,
        };
        setQuestionnaire(questData);
      }
    } catch (err) {
      console.error("Error fetching questionnaire:", err);
      setError("Failed to load questionnaire. Please try again later.");
    } finally {
      setLoadingQuestionnaire(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionText, answerText) => {
    // Start fade transition
    setFadeTransition(true);

    // Store the question and selected answer
    const newResponse = {
      question: questionText,
      answer: answerText,
      questionIndex: currentQuestionIndex,
    };

    // Check if we're updating an existing answer
    const existingIndex = userResponses.findIndex(
      (r) => r.questionIndex === currentQuestionIndex
    );

    let updatedResponses;
    if (existingIndex >= 0) {
      // Update existing answer
      updatedResponses = [...userResponses];
      updatedResponses[existingIndex] = newResponse;
      setUserResponses(updatedResponses);
    } else {
      // Add new answer
      updatedResponses = [...userResponses, newResponse];
      setUserResponses(updatedResponses);
    }

    // Move to next question or complete if done
    setTimeout(() => {
      if (
        currentQuestionIndex < questionnaire.questions.length - 1 &&
        !inEditing
      ) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // All questions answered, mark as completed
        setQuestionnaireCompleted(true);
        setInEditing(false);
      }
      setFadeTransition(false);
    }, 300); // Delay to match CSS transition
  };

  // Handle back button click
  const handleBackClick = () => {
    // If we have answers and not at review screen, show warning
    if (userResponses.length > 0 && !questionnaireCompleted) {
      setShowDiscardWarning(true);
    } else {
      resetAssessment();
    }
  };

  // Reset assessment and return to plant selection
  const resetAssessment = () => {
    setAssessmentMode(false);
    setSelectedPlant(null);
    setQuestionnaire(null);
    setIsAnalyzing(false)
    setCurrentQuestionIndex(0);
    setUserResponses([]);
    setQuestionnaireCompleted(false);
    setShowDiscardWarning(false);
    setAiAnalysis(null);
  };

  // Handle question selection from summary (to edit an answer)
  const handleQuestionEdit = (questionIndex) => {
    setQuestionnaireCompleted(false);
    setCurrentQuestionIndex(questionIndex);
    setInEditing(true);
    setAiAnalysis(null);
  };

  // Get color based on question status
  const getQuestionStatusColor = (index) => {
    const answered = userResponses.some((r) => r.questionIndex === index);
    if (currentQuestionIndex === index) return "border-blue-500 bg-blue-50";
    if (answered) return "border-green-500 bg-green-50";
    return "border-gray-300 bg-gray-50";
  };

  // Submit assessment to the API for AI analysis
  const submitAssessmentForAnalysis = async () => {
    try {
      setLoadingAnalysis(true);
      setIsAnalyzing(true);
      // Create a formatted string of the assessment
      const formattedResponses = userResponses
        .sort((a, b) => a.questionIndex - b.questionIndex)
        .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
        .join("\n\n");

      // Add plant name for context
      const assessmentText = `Plant: ${selectedPlant.name}\n\n${formattedResponses}`;

      // Send to API for analysis
      const response = await axios.post(
        `${Helpers.apiUrl}user/openai/generate-response`,
        { text: assessmentText, plant_type_id:selectedPlant.id },
        Helpers.getAuthHeaders()
      );

      if (response.data && response.data.data) {
        setAiAnalysis(response.data.data);
      }
    } catch (err) {
      console.error("Error submitting assessment for analysis:", err);
      setError(
        "Failed to generate plant health analysis. Please try again later."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="p-4  max-w-6xl mx-auto min-h-screen">
      {/* Plant Browse Mode */}
      {!assessmentMode && (
        <>
          <h1 className="text-2xl font-bold text-center mb-6">
            Your Plant's Health Companion
          </h1>

          {/* Search bar */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-green-500 focus:border-green-500"
              placeholder="Search for plants..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          {/* Loading state for initial plant list */}
          {loading && (
            <div className="flex justify-center my-12">
              <Loader />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Plant type bubbles */}
          {!loading && !error && (
            <div className="flex flex-wrap justify-center gap-4">
              {filteredPlants.length > 0 ? (
                filteredPlants.map((plant) => (
                  <div
                    key={plant.id}
                    onClick={() => handlePlantClick(plant)}
                    className="rounded-full py-3 px-6 text-center cursor-pointer transform transition duration-300 hover:scale-105 shadow-md flex items-center justify-center"
                    style={{
                      backgroundColor: getRandomPastelColor(),
                      minWidth: "120px",
                    }}
                  >
                    <span className="font-medium text-gray-800">
                      {plant.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 p-6 w-full">
                  No plants found matching your search.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Assessment Mode */}
      {assessmentMode && (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          {/* Assessment Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div className="flex items-center">
              <button
                onClick={handleBackClick}
                className="mr-4 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
              </button>
              <h2 className="text-xl font-bold">
                {selectedPlant?.name} Health Assessment
              </h2>
            </div>

            {/* Progress indicator */}
            {!questionnaireCompleted && questionnaire && (
              <div className="flex items-center">
                {questionnaire.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 mx-1 rounded-full ${
                      index <= currentQuestionIndex
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Loading state for questionnaire */}
          {loadingQuestionnaire && (
            <div className="flex justify-center my-12">
              <Loader />
            </div>
          )}

          {/* Questionnaire Content */}
          {!loadingQuestionnaire &&
            questionnaire &&
            !questionnaireCompleted && (
              <div
                className={`transition-opacity duration-300 ${
                  fadeTransition ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="mb-2 text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of{" "}
                  {questionnaire.questions.length}
                </div>

                <h3 className="text-lg font-medium mb-6 transition-all duration-300 transform">
                  {questionnaire.questions[currentQuestionIndex].question_text}
                </h3>

                <div className="flex flex-wrap gap-3 mt-4">
                  {questionnaire.questions[currentQuestionIndex].answers.map(
                    (answer) => {
                      // Check if this answer is currently selected
                      const isSelected = userResponses.some(
                        (r) =>
                          r.questionIndex === currentQuestionIndex &&
                          r.answer === answer.answer_text
                      );

                      return (
                        <div
                          key={answer.id}
                          onClick={() =>
                            handleAnswerSelect(
                              questionnaire.questions[currentQuestionIndex]
                                .question_text,
                              answer.answer_text
                            )
                          }
                          className={`rounded-full py-2 px-4 text-center cursor-pointer transform transition duration-300 hover:scale-105 shadow-md ${
                            isSelected
                              ? "ring-2 ring-green-500 ring-offset-2"
                              : ""
                          }`}
                          style={{ backgroundColor: getRandomPastelColor() }}
                        >
                          <span className="font-medium text-gray-800">
                            {answer.answer_text}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

          {/* Assessment Completion / Review Page */}
          {!loadingQuestionnaire && questionnaireCompleted && (
            <div className="py-4">
              {!isAnalyzing && (
                <>
                  <h3 className="text-xl font-medium mb-4 text-green-600">
                    Assessment Complete!
                  </h3>
                  <p className="mb-6">
                    Review your responses below. Click on any question to edit
                    your answer.
                  </p>
                  <div className="space-y-4 mb-8">
                    {questionnaire.questions.map((question, index) => {
                      const response = userResponses.find(
                        (r) => r.questionIndex === index
                      );

                      return (
                        <div
                          key={index}
                          onClick={() => handleQuestionEdit(index)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${getQuestionStatusColor(
                            index
                          )}`}
                        >
                          <p className="font-medium">
                            Q{index + 1}: {question.question_text}
                          </p>
                          {response ? (
                            <p className="text-gray-700 mt-2">
                              A: {response.answer}
                            </p>
                          ) : (
                            <p className="text-yellow-600 mt-2">
                              Not answered yet
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              {/* Loading Analysis State */}
              {loadingAnalysis && (
                <div className="flex flex-col items-center my-8">
                  <Loader />
                  <p className="text-gray-600 mt-4">
                    Analyzing your plant's health...
                  </p>
                </div>
              )}

              {/* AI Analysis Results - Using ReactMarkdown for formatted display */}
              {aiAnalysis && !loadingAnalysis && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 analysis-container">
                  <h3 className="text-xl font-semibold text-green-800 mb-4">
                    Plant Health Analysis
                  </h3>
                  <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                {aiAnalysis ? (
                  <button
                    onClick={resetAssessment}
                    className="bg-green-600 text-white rounded-lg px-6 py-2 hover:bg-green-700 transition"
                  >
                    Start New Assessment
                  </button>
                ) : (
                  <button
                    onClick={submitAssessmentForAnalysis}
                    className="bg-green-600 text-white rounded-lg px-6 py-2 hover:bg-green-700 transition"
                    disabled={loadingAnalysis}
                  >
                    Analyze Plant Health
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Discard Warning Dialog */}
          {showDiscardWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
                <h3 className="text-lg font-medium mb-3">
                  Discard Assessment?
                </h3>
                <p className="text-gray-600 mb-6">
                  Your progress will be lost. Are you sure you want to return to
                  plant selection?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDiscardWarning(false)}
                    className="px-4 py-2 text-gray-700 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={resetAssessment}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Discard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSS for properly styling the markdown content */}
      <style jsx global>{`
        .analysis-container h1,
        .analysis-container h2,
        .analysis-container h3,
        .analysis-container h4,
        .analysis-container h5,
        .analysis-container h6 {
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
          color: #2d3748;
        }

        .analysis-container h1 {
          font-size: 1.5rem;
        }
        .analysis-container h2 {
          font-size: 1.25rem;
        }
        .analysis-container h3 {
          font-size: 1.125rem;
        }

        .analysis-container p {
          margin-bottom: 1em;
        }

        .analysis-container ul,
        .analysis-container ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }

        .analysis-container li {
          margin-bottom: 0.25em;
          list-style-type: disc;
        }

        .analysis-container ol li {
          list-style-type: decimal;
        }

        .analysis-container strong {
          font-weight: 600;
        }

        .analysis-container em {
          font-style: italic;
        }

        .analysis-container blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1em;
          font-style: italic;
          margin-left: 0;
          margin-right: 0;
          color: #4a5568;
        }

        .analysis-container code {
          background-color: #f7fafc;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default PlantDoc;

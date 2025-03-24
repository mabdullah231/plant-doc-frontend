import React, { useState, useEffect } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";
;
const AdminQuestionnaires = () => {
  const [plantTypes, setPlantTypes] = useState([]); // All plant types
  const [groupedQuestionnaires, setGroupedQuestionnaires] = useState([]); // All plant types
  const [selectedPlantType, setSelectedPlantType] = useState(null); // Selected plant type for editing
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const [questionInputs, setQuestionInputs] = useState([
    { text: "", answers: [{ id: null, text: "" }] },
  ]); // Form inputs with answer IDs
  const [expandedPlantId, setExpandedPlantId] = useState(null); // Expanded plant type in the table
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // Plant ID for delete confirmation
  const user = Helpers.getAuthUser(); // Get the authenticated user
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [loading, setLoading] = useState(false)

  // Fetch all plant types and their questionnaires
  useEffect(() => {
    fetchPlantTypes();
    fetchQuestionnaires();
  }, []);

  const fetchPlantTypes = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${Helpers.apiUrl}admin/plant-types/all`,
        Helpers.getAuthHeaders()
      );
      setPlantTypes(response.data.data || []); // Ensure empty state is handled
      console.log("Plant", response.data.data);
    } catch (error) {
      console.error("Error fetching plant types:", error);
    }
  };

  const fetchQuestionnaires = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${Helpers.apiUrl}admin/questionnaire/all`, // Fetch all questionnaires
        Helpers.getAuthHeaders()
      );

      // Ensure we access the correct data structure
      const questionnaires = response.data.questionnaires?.map(
        (questionnaire) => ({
          id: questionnaire.plant_type_id, // Use plant type ID as the unique identifier
          name: questionnaire.plant_type?.name || "Unknown Plant", // Include plant type name
          questions:
          questionnaire.answers.length > 0
              ? [
                  {
                    id: questionnaire.id,
                    text: questionnaire.question_text,
                    answers: questionnaire.answers.map((a) => a.answer_text),
                  },
                ]
              : [],
        })
      );

      // Remove duplicate plant types and group their questions
      const groupedQuestionnaires = [];
      questionnaires?.forEach((q) => {
        const existing = groupedQuestionnaires.find((gq) => gq.id === q.id);
        if (existing) {
          existing.questions.push(...q.questions);
        } else {
          groupedQuestionnaires.push(q);
        }
      });

      setGroupedQuestionnaires(groupedQuestionnaires); // Update state with the fetched questionnaires
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
    } finally{
      setLoading(false)
    }
  };

  // Handle form submission (add/update questionnaire)
  const handleAddQuestionnaire = async (e) => {
    e.preventDefault();
    if (!selectedPlantType || !questionInputs.every((q) => q.text.trim()))
      return;

    try {
      setLoading(true)
      const payload = {
        plant_type_id: selectedPlantType.id,
        questions: questionInputs.map((q, index) => ({
          id: q.id || null, // Include question ID for updates
          question_text: q.text,
          order: index + 1,
          answers: q.answers.map((a) => ({
            id: a.id || null, // Include answer ID for updates
            answer_text: a.text,
          })),
        })),
      };

      console.log("Saving payload:", payload);

      const response = await axios.post(
        `${Helpers.apiUrl}admin/questionnaire/manage`,
        payload,
        Helpers.getAuthHeaders()
      );

      if (response.status === 200) {
        Helpers.toast("success", "Questionnaire saved successfully!");
        setShowForm(false);
        setSelectedPlantType(null);
        setQuestionInputs([{ text: "", answers: [{ id: null, text: "" }] }]);
        fetchQuestionnaires(); // Refresh the list
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      Helpers.toast("error", "Failed to save questionnaire.");
    } finally{
      setLoading(false)
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (plantTypeId, e) => {
    e.stopPropagation();
    setDeleteConfirmation(plantTypeId);
  };

  // Hide delete confirmation
  const hideDeleteConfirmation = (e) => {
    e.stopPropagation();
    setDeleteConfirmation(null);
  };

  // Delete a questionnaire for a specific plant type
  const handleDeleteQuestionnaire = async (plantTypeId, e) => {
    e.stopPropagation();
    try {
      setLoading(true)
      const response = await axios.delete(
        `${Helpers.apiUrl}admin/questionnaire/${plantTypeId}`,
        Helpers.getAuthHeaders()
      );

      if (response.status === 200) {
        Helpers.toast("success", "Questionnaire deleted successfully!");
        setDeleteConfirmation(null); // Reset delete confirmation
        fetchQuestionnaires(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      Helpers.toast("error", "Failed to delete questionnaire.");
    } finally{
      setLoading(false)
    }
  };

  // Toggle form visibility and reset state
  const toggleForm = () => {
    setShowForm(!showForm);
    setSelectedPlantType(null);
    setQuestionInputs([{ text: "", answers: [{ id: null, text: "" }] }]);
  };

  const handlePlantTypeSelect = async (e) => {
    const plantId = parseInt(e.target.value);
    const plant = plantTypes.find((p) => p.id === plantId);
    setSelectedPlantType(plant);

    // Fetch the questionnaire for the selected plant type
    try {
      const response = await axios.get(
        `${Helpers.apiUrl}admin/questionnaire/plant-type/${plantId}`,
        Helpers.getAuthHeaders()
      );
      console.log("Questionnaire data:", response.data);

      if (response.data.questions && response.data.questions.length > 0) {
        setQuestionInputs(
          response.data.questions.map((q) => ({
            id: q.id,
            text: q.question_text,
            answers: q.answers.map((a) => ({
              id: a.id, // Store answer ID
              text: a.answer_text,
            })),
          }))
        );
      } else {
        setQuestionInputs([{ text: "", answers: [{ id: null, text: "" }] }]); // Reset form if no questionnaire exists
      }
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      // If error, reset form
      setQuestionInputs([{ text: "", answers: [{ id: null, text: "" }] }]);
    }
  };

  // Add a new question input
  const handleAddQuestionInput = () => {
    setQuestionInputs([
      ...questionInputs,
      { text: "", answers: [{ id: null, text: "" }] },
    ]);
  };


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupedQuestionnaires.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    Helpers.scrollToTop()  
  };

  // Add a new answer input to a specific question
  const handleAddAnswerInput = (questionIndex) => {
    const newQuestionInputs = [...questionInputs];
    newQuestionInputs[questionIndex].answers.push({ id: null, text: "" });
    setQuestionInputs(newQuestionInputs);
  };

  // Update a question's text
  const handleQuestionInputChange = (questionIndex, value) => {
    const newQuestionInputs = [...questionInputs];
    newQuestionInputs[questionIndex].text = value;
    setQuestionInputs(newQuestionInputs);
  };

  // Update an answer's text
  const handleAnswerInputChange = (questionIndex, answerIndex, value) => {
    const newQuestionInputs = [...questionInputs];
    newQuestionInputs[questionIndex].answers[answerIndex].text = value;
    setQuestionInputs(newQuestionInputs);
  };

  // Toggle expansion of a plant type's questions in the table
  const toggleExpandPlant = (plantId) => {
    setExpandedPlantId(expandedPlantId === plantId ? null : plantId);
    // Reset delete confirmation when toggling expansion
    setDeleteConfirmation(null);
  };

  // Chunk array into groups of specified size
  const chunkArray = (array, size) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center my-12">
          <Loader/>
        </div>
      ) : showForm ? (
        <div className="mb-6 w-full">
          <h3 className="text-xl font-medium mb-4">Add/Edit Questionnaire</h3>
          <form onSubmit={handleAddQuestionnaire} className="w-full">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Plant Type
              </label>
              <select
                onChange={handlePlantTypeSelect}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select a plant type</option>
                {plantTypes.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>

            {questionInputs.map((question, questionIndex) => (
              <div key={questionIndex} className="mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question {questionIndex + 1}
                  </label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) =>
                      handleQuestionInputChange(questionIndex, e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Enter question"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Possible Answers
                  </label>
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={answer.text}
                        onChange={(e) =>
                          handleAnswerInputChange(
                            questionIndex,
                            answerIndex,
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder={`Answer ${answerIndex + 1}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddAnswerInput(questionIndex)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    + Add another answer
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddQuestionInput}
                className="mb-4 text-white bg-gray-600 hover:bg-gray-400 cursor-pointer transition focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Add Another Question
              </button>
              <button
                type="submit"
                className="mb-4 text-white bg-gray-600 hover:bg-gray-400 cursor-pointer transition focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Save Questionnaire
              </button>
              <button
                type="button"
                onClick={toggleForm}
                className="mb-4 text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-between">
          <h2 className="text-2xl font-medium mb-4">Admin Questionnaires</h2>
          <button
            onClick={toggleForm}
            className="mb-4 text-white bg-gray-600 hover:bg-gray-400 cursor-pointer transition focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Add New Questionnaire
          </button>
        </div>
      )}

      {!showForm && !loading &&  (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Plant Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Questions
                </th>
                {user?.user_type === "0" && (
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((plant) => (
                <React.Fragment key={plant.id}>
                  <tr
                    className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpandPlant(plant.id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {plant.name}
                    </td>
                    <td className="px-6 py-4">
                      {plant.questions.length > 0
                        ? `${plant.questions.length} question(s)`
                        : "No questions"}
                    </td>
                    {user?.user_type === "0" && (

                    <td className="px-6 py-4">
                      {deleteConfirmation === plant.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) =>
                              handleDeleteQuestionnaire(plant.id, e)
                            }
                            className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={hideDeleteConfirmation}
                            className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => showDeleteConfirmation(plant.id, e)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                    )}
                  </tr>
                  {expandedPlantId === plant.id &&
                    plant.questions.map((question) => (
                      <tr key={question.id} className="bg-gray-50">
                        <td colSpan="3" className="px-6 py-4">
                          <div className="pl-4">
                            <p className="font-medium text-gray-900 mb-2">
                              {question.text}
                            </p>
                            {/* Group answers into rows of 3 */}
                            {chunkArray(question.answers, 3).map(
                              (answerChunk, chunkIndex) => (
                                <div
                                  key={chunkIndex}
                                  className="flex flex-wrap gap-x-4 mb-1"
                                >
                                  {answerChunk.map((answer, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center"
                                    >
                                      <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                      <span className="text-gray-700">
                                        {answer}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
                  <span className="text-sm text-gray-700">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, plantTypes.length)} of {plantTypes.length} entries
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(plantTypes.length / itemsPerPage)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionnaires;
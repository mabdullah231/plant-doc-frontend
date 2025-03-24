import React, { useState, useEffect } from "react";
import axios from "axios";
import Helpers from "../../../Config/Helpers";
import Loader from "../../../Components/Common/Loader";


const AdminSettings = () => {
  // State to store settings
  const [settings, setSettings] = useState({
    api_key: "",
    model: "gpt-3.5-turbo", // Default model
    temperature: 0.5,
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });

  // Predefined list of models
  const models = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "davinci", label: "Davinci" },
    { value: "curie", label: "Curie" },
  ];

  // Fetch settings from the Laravel backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${Helpers.apiUrl}admin/openai/view-config`,
          Helpers.getAuthHeaders()
        );
        
        if (response.data && response.data.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching OpenAI settings:", error);
        setSaveStatus({
          message: "Failed to load settings. Please try again.",
          type: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  // Handle form submission (update settings)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus({ message: "", type: "" });
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${Helpers.apiUrl}admin/openai/manage-config`,
        settings,
        Helpers.getAuthHeaders()
      );

      if (response.status === 200) {
        setSaveStatus({
          message: "Settings updated successfully!",
          type: "success"
        });
      }
    } catch (error) {
      console.error("Error updating OpenAI settings:", error);
      setSaveStatus({
        message: "Failed to update settings. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // if (loading && !settings.model) {
  //   return ;
  // }

  return (
    <> {loading ? <div className="p-4"><Loader/></div> :
    <div className="p-4">
      <h2 className="text-2xl font-medium mb-4">AI API Settings</h2>

      {saveStatus.message && (
        <div 
          className={`p-3 mb-4 rounded-lg ${
            saveStatus.type === "success" 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="text"
            name="api_key"
            value={settings.api_key}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Enter OpenAI API Key"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key will be stored securely.
          </p>
        </div>

        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            name="model"
            value={settings.model}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          >
            {models.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the OpenAI model to use for AI features.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature: {settings.temperature}
          </label>
          <input
            type="range"
            name="temperature"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={handleInputChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>More precise (0)</span>
            <span>More creative (1)</span>
          </div>
        </div> */}

        <button
          type="submit"
          disabled={loading}
          className="text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>}
    </>
  );
};

export default AdminSettings;
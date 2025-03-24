import React, { useEffect, useState } from "react";
import Helpers from "../../../Config/Helpers";
import axios from "axios";
import Loader from "../../../Components/Common/Loader";

const AdminPlantTypes = () => {
  const [showForm, setShowForm] = useState(false);
  const [plantTypes, setPlantTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null); // Track selected plant for editing
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const user = Helpers.getAuthUser(); // Get the authenticated user

  // Fetch plant types from API
  const fetchPlantTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Helpers.apiUrl}admin/plant-types/all`, Helpers.getAuthHeaders());
      setPlantTypes(response.data.data.length > 0 ? response.data.data : []); // Ensure empty state is handled
    } catch (error) {
      console.error("Error fetching plant types:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle add/edit plant type (Single API Call)
  const handleManagePlantType = async (event) => {
    event.preventDefault();
    const plantData = {
      ...(selectedPlant?.id && { id: selectedPlant.id }), // Include id only if editing
      name: event.target.name.value,
      description: event.target.description.value,
    };

    try {
      setLoading(true);
      const response = await axios.post(`${Helpers.apiUrl}admin/plant-types/manage`, plantData, Helpers.getAuthHeaders());
      if (selectedPlant) {
        setPlantTypes(plantTypes.map((p) => (p.id === selectedPlant.id ? response.data.data : p)));
        Helpers.toast("success", "Plant Type Updated Successfully");
      } else {
        setPlantTypes([...plantTypes, response.data.data]);
        Helpers.toast("success", "Plant Type Added Successfully");
      }
      setShowForm(false);
      setSelectedPlant(null);
    } catch (error) {
      console.error("Error managing plant type:", error);
      if (selectedPlant) {
        Helpers.toast("error", "Failed to update Plant Type");
      } else {
        Helpers.toast("error", "Failed to add plant type");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete plant type
  const handleDeletePlantType = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${Helpers.apiUrl}admin/plant-types/delete/${id}`, Helpers.getAuthHeaders());
      setPlantTypes(plantTypes.filter((plant) => plant.id !== id));
      Helpers.toast("success", "Plant Type Deleted Successfully");
    } catch (error) {
      console.error("Error deleting plant type:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open edit form with selected plant data
  const handleEditClick = (plant) => {
    setSelectedPlant(plant);
    setShowForm(true);
  };

  // Reset form state
  const handleCancel = () => {
    setShowForm(false);
    setSelectedPlant(null);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = plantTypes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
    Helpers.scrollToTop()  
  };

  useEffect(() => {
    fetchPlantTypes();
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center my-12">
          <Loader />
        </div>
      ) : showForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-medium text-gray-800">{selectedPlant ? "Edit Plant Type" : "Add Plant Type"}</h2>
          <form onSubmit={handleManagePlantType} className="mx-auto my-2">
            <div className="mb-5">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={selectedPlant ? selectedPlant.name : ""}
                className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5"
                required
              />
            </div>
            <div className="mb-5">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                defaultValue={selectedPlant ? selectedPlant.description : ""}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-gray-500 focus:border-gray-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="mb-4 text-white bg-gray-600 hover:bg-gray-500 cursor-pointer transition focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              {selectedPlant ? "Update Plant Type" : "Add Plant Type"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="ml-2 text-gray-900 cursor-pointer transition bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Cancel
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-medium text-gray-800">Plant Types</h2>
            <button
              onClick={() => setShowForm(true)}
              className="text-white bg-gray-600 hover:bg-gray-500 cursor-pointer transition focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Add New Plant Type
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {plantTypes.length === 0 ? (
              <p className="text-center text-gray-500 p-4">No entries found</p>
            ) : (
              <>
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">#</th>
                      <th scope="col" className="px-6 py-3">Name</th>
                      <th scope="col" className="px-6 py-3">Description</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((plant, index) => (
                      <tr key={plant.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {indexOfFirstItem + index + 1}
                        </th>
                        <td className="px-6 py-4">{plant.name}</td>
                        <td className="px-6 py-4">{plant.description}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEditClick(plant)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          {user?.user_type === "0" && (
                            <button
                              onClick={() => handleDeletePlantType(plant.id)}
                              className="ml-2 font-medium text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
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
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPlantTypes;
import React, { useEffect, useState } from "react";
import Helpers from "../../../Config/Helpers";
import axios from "axios";
import Loader from "../../../Components/Common/Loader";
import ReactMarkdown from "react-markdown";


const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null); // Track selected report for modal
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false); // For animation control

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Helpers.apiUrl}user/user-reports/all`, Helpers.getAuthHeaders());
      setReports(response.data.data.length > 0 ? response.data.data : []); // Ensure empty state is handled
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete report
  const handleDeleteReport = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${Helpers.apiUrl}user/user-reports/delete/${id}`, Helpers.getAuthHeaders());
      setReports(reports.filter((report) => report.id !== id));
      Helpers.toast("success", "Report Deleted Successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal with selected report data
  const handleViewClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    setIsModalOpen(true); // Trigger animation
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false); // Trigger closing animation
    setTimeout(() => {
      setShowModal(false);
      setSelectedReport(null);
    }, 300); // Wait for animation to complete
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    Helpers.scrollToTop();
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-4 ">
      {loading ? (
        <div className="flex justify-center my-12">
          <Loader />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl text-gray-800 font-medium">Reports</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {reports.length === 0 ? (
              <p className="p-4 text-center text-gray-500">No reports found</p>
            ) : (
              <>
                <table className="text-gray-500 text-left text-sm w-full">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                    <tr>
                      <th scope="col" className="px-6 py-3">#</th>
                      <th scope="col" className="px-6 py-3">Plant Name</th>
                      <th scope="col" className="px-6 py-3">Date Created</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.reverse().map((report, index) => (
                      <tr key={report.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <th scope="row" className="text-gray-900 font-medium px-6 py-4 whitespace-nowrap">
                          {indexOfFirstItem + index + 1}
                        </th>
                        <td className="px-6 py-4">{report.plant_type.name}</td>
                        <td className="px-6 py-4">{new Date(report.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewClick(report)}
                            className="text-blue-600 font-medium hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-red-600 font-medium hover:underline ml-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex bg-gray-50 border-gray-200 border-t justify-between p-4 items-center">
                  <span className="text-gray-700 text-sm">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, reports.length)} of {reports.length} entries
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-gray-200 rounded-lg text-gray-700 text-sm disabled:opacity-50 font-medium hover:bg-gray-300 px-4 py-2"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(reports.length / itemsPerPage)}
                      className="bg-gray-200 rounded-lg text-gray-700 text-sm disabled:opacity-50 font-medium hover:bg-gray-300 px-4 py-2"
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

      {/* Modal for viewing report */}
      {showModal && selectedReport && (
  <div className="fixed inset-0 flex justify-center items-center p-4 z-50 backdrop-filter backdrop-blur-xs">
    <div
      className={`bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh] transform transition-all duration-300 ${
        isModalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-800 text-xl font-semibold">Report Details</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 text-2xl cursor-pointer hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg analysis-container mb-8">
              <h3 className="text-green-800 text-xl font-semibold mb-4">
                Plant Health Analysis
              </h3>
              <div className="lg:prose-lg max-w-none md:prose-base prose prose-sm space-y-4">
                <ReactMarkdown>{selectedReport.ai_diagnosis}</ReactMarkdown>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="bg-gray-600 rounded-lg text-center text-sm text-white cursor-pointer focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium hover:bg-gray-500 mt-4 px-5 py-2.5 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
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

export default Reports;
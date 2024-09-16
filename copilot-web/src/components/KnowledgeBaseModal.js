import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X, Trash2, Upload, Loader, FileText } from "lucide-react";
import "../styles/KnowledgeBaseModal.css";

const Alert = ({ children, variant = "default" }) => (
  <div
    className={`alert ${
      variant === "destructive" ? "alert-danger" : "alert-primary"
    } mb-3`}
    role="alert"
  >
    {children}
  </div>
);

const KnowledgeBaseModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/list_files");
      setFiles(response.data);
    } catch (error) {
      setError("Failed to fetch files. Please try again.");
    } finally {
      setIsLoading(false);
      setSuccessMessage("");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    } else {
      setSelectedFiles([]);
    }
  }, [isOpen, fetchFiles]);

  const handleFileSelect = (filename) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8000/delete_files", {
        files: selectedFiles,
      });
      fetchFiles();
      setSelectedFiles([]);
    } catch (error) {
      setError("Failed to delete files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedUploadFiles, setSelectedUploadFiles] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");

  const handleUpload = async () => {
    if (selectedUploadFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage("");
    const formData = new FormData();
    for (let i = 0; i < selectedUploadFiles.length; i++) {
      formData.append("files", selectedUploadFiles[i]);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Files uploaded successfully:", response.data);
      fetchFiles();
      setSelectedUploadFiles([]);
      setSuccessMessage("Files uploaded successfully!");
      // Reset file input
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    setSelectedUploadFiles(Array.from(e.target.files));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    setSelectedUploadFiles(Array.from(files));
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title ms-4">Knowledge Base</h3>
            <div className="d-flex align-items-center" style={{ width: "25%" }}>
              <button
                onClick={handleUpload}
                className="btn btn-success btn-sm btn-icon me-2"
                disabled={selectedUploadFiles.length === 0}
              >
                <Upload size={14} className="me-1" />
                Upload
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger btn-sm btn-icon me-2"
                disabled={selectedFiles.length === 0}
              >
                <Trash2 size={14} className="me-1" />
                Delete
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-icon me-2"
                aria-label="Close"
                onClick={onClose}
              >
                <X size={14} className="me-1" />
                Close
              </button>
            </div>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <div
                  className={`upload-area ${dragOver ? "drag-over" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ height: "100%", padding: "20px" }}
                >
                  <FileText size={24} className="mb-2" />
                  <p className="mb-2" style={{ fontSize: "0.9rem" }}>
                    Drag and drop files here or
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="file-input"
                    id="file-input"
                  />
                </div>
              </div>
              <div className="col-md-6">{/* This column is now empty */}</div>
            </div>

            {selectedUploadFiles.length > 0 && (
              <div className="mb-3">
                <p className="mb-1">
                  {selectedUploadFiles.length} file(s) selected for upload
                </p>
                <ul className="list-unstyled">
                  {selectedUploadFiles.map((file, index) => (
                    <li
                      key={index}
                      className="text-muted"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="file-list"
              style={{ height: "calc(100vh - 300px)", overflowY: "auto" }}
            >
              <table className="table table-bordered table-striped w-100">
                <thead
                  className="stickytop-0 bg-white shadow-sm z-10"
                  style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: 1,
                  }}
                >
                  <tr>
                    <th scope="col"></th>
                    <th scope="col">File Name</th>
                    <th scope="col">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.name}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.name)}
                          onChange={() => handleFileSelect(file.name)}
                        />
                      </td>
                      <td>{file.name}</td>
                      <td>{file.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modal footer removed */}

          {isLoading && (
            <div className="loading-overlay">
              <Loader size={48} className="spinner-border text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;

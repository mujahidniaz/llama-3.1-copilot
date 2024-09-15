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
      setFiles(response.data.files);
    } catch (error) {
      setError("Failed to fetch files. Please try again.");
    } finally {
      setIsLoading(false);
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

  const handleUpload = async () => {
    if (selectedUploadFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    for (let i = 0; i < selectedUploadFiles.length; i++) {
      formData.append("files", selectedUploadFiles[i]);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/upload_files",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log("Files uploaded successfully:", response.data);
      fetchFiles();
      setSelectedUploadFiles([]);
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
            <h5 className="modal-title">Knowledge Base</h5>
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={onClose}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {error && <Alert variant="destructive">{error}</Alert>}

            <div
              className={`upload-area ${dragOver ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileText size={48} className="mb-3" />
              <p>Drag and drop files here or use the buttons below</p>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <label htmlFor="file-input" className="btn btn-primary btn-icon">
                  <Upload size={18} />
                  Select Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="form-control-file"
                  id="file-input"
                  style={{ maxWidth: '50%' }}
                />
              </div>
            </div>

            {selectedUploadFiles.length > 0 && (
              <div className="mt-3">
                <p>{selectedUploadFiles.length} file(s) selected</p>
                <button
                  onClick={handleUpload}
                  className="btn btn-success btn-icon"
                >
                  <Upload size={18} />
                  Upload Files
                </button>
              </div>
            )}

            <div className="file-list mt-4">
              <table className="table table-bordered table-striped w-100">
                <thead>
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
          <div className="modal-footer">
            <button
              onClick={handleDelete}
              disabled={selectedFiles.length === 0 || isLoading}
              className="btn btn-danger btn-icon"
            >
              <Trash2 size={18} />
              Delete Selected
            </button>
          </div>

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

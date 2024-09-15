import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Trash2, Upload, Loader } from "lucide-react";
import "../styles/KnowledgeBaseModal.css";
const Alert = ({ children, variant = "default" }) => (
  <div
    className={`alert ${
      variant === "destructive" ? "alert-danger" : "alert-primary"
    }`}
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

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    } else {
      setSelectedFiles([]);
    }
  }, [isOpen]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/list_files");
      setFiles(response.data.files);
    } catch (error) {
      setError("Failed to fetch files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await axios.post("http://localhost:8000/upload_files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Files uploaded successfully:", response.data);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

            <div className="table-responsive">
              <table className="table table-bordered">
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
              className="btn btn-danger"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Selected
            </button>
            <label className="btn btn-primary">
              <Upload size={18} className="mr-2" />
              Upload Files
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="d-none"
                disabled={isLoading}
              />
            </label>
          </div>

          {isLoading && (
            <div className="d-flex justify-content-center">
              <Loader size={48} className="spinner-border text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseModal;

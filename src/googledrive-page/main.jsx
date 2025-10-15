import {
  createRoot,
  render,
  StrictMode,
  useState,
  useEffect,
  createInterpolateElement,
} from "@wordpress/element";
import { Button, TextControl, Spinner, Notice } from "@wordpress/components";

import "./scss/style.scss";

const domElement = document.getElementById(
  window.wpmudevDriveTest.dom_element_id
);

const WPMUDEV_DriveTest = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    window.wpmudevDriveTest.authStatus || false
  );
  const [hasCredentials, setHasCredentials] = useState(
    window.wpmudevDriveTest.hasCredentials || false
  );
  const [showCredentials, setShowCredentials] = useState(
    !window.wpmudevDriveTest.hasCredentials
  );
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [notice, setNotice] = useState({ message: "", type: "" });
  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "",
  });

  // Load files when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowCredentials(false);
      showNotice("Google Drive successfully connected.");
      loadFiles();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });
    setTimeout(() => setNotice({ message: "", type: "" }), 5000);
  };

  const handleSaveCredentials = async () => {
    if (!credentials.clientId || !credentials.clientSecret) {
      showNotice("Please enter both Client ID and Client Secret", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "/wp-json/wpmudev/v1/drive/save-credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save credentials");
      setHasCredentials(true);
      setShowCredentials(false);
      showNotice("Credentials saved successfully!");
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/wp-json/wpmudev/v1/drive/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        showNotice("Authorization URL not received.", "error");
      }
    } catch (err) {
      showNotice("Failed to start authentication.", "error");
      console.error(err);
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/wp-json/wpmudev/v1/drive/files");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load files");
      setFiles(data.files || []);
      showNotice("Files loaded successfully!");
    } catch (error) {
      setFiles([]);
      showNotice(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      showNotice("Please select a file to upload", "error");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const response = await fetch("/wp-json/wpmudev/v1/drive/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Upload failed");

      showNotice(`Uploaded: ${data.file.name}`);
      setUploadFile(null);
      loadFiles(); // Refresh list
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName, mimeType) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/wp-json/wpmudev/v1/drive/download?file_id=${fileId}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Download failed");

      // Convert base64 to blob and trigger download
      const byteCharacters = atob(data.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType || data.mimeType });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotice(`Downloaded: ${fileName}`);
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName) {
      showNotice("Folder name is required", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/wp-json/wpmudev/v1/drive/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create folder");

      showNotice(`Folder created: ${data.folder.name}`);
      setFolderName("");
      loadFiles();
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Optionally, reload page after authentication callback
  useEffect(() => {
    // If redirected after OAuth, reload to update auth status
    if (window.location.search.includes("auth=success")) {
      setIsAuthenticated(true);
      loadFiles();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <>
      <div className="sui-header">
        <h1 className="sui-header-title">Google Drive Test</h1>
        <p className="sui-description">
          Test Google Drive API integration for applicant assessment
        </p>
      </div>

      {notice.message && (
        <Notice status={notice.type} isDismissible onRemove="">
          {notice.message}
        </Notice>
      )}

      {showCredentials ? (
        <div className="sui-box">
          <div className="sui-box-header">
            <h2 className="sui-box-title">Set Google Drive Credentials</h2>
          </div>
          <div className="sui-box-body">
            <div className="sui-box-settings-row">
              <TextControl
                help={createInterpolateElement(
                  "You can get Client ID from <a>Google Cloud Console</a>. Make sure to enable Google Drive API.",
                  {
                    a: (
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }
                )}
                label="Client ID"
                value={credentials.clientId}
                onChange={(value) =>
                  setCredentials({ ...credentials, clientId: value })
                }
              />
            </div>

            <div className="sui-box-settings-row">
              <TextControl
                help={createInterpolateElement(
                  "You can get Client Secret from <a>Google Cloud Console</a>.",
                  {
                    a: (
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }
                )}
                label="Client Secret"
                value={credentials.clientSecret}
                onChange={(value) =>
                  setCredentials({ ...credentials, clientSecret: value })
                }
                type="password"
              />
            </div>

            <div className="sui-box-settings-row">
              <span>
                Please use this URL{" "}
                <em>{window.wpmudevDriveTest.redirectUri}</em> in your Google
                API's <strong>Authorized redirect URIs</strong> field.
              </span>
            </div>

            <div className="sui-box-settings-row">
              <p>
                <strong>Required scopes for Google Drive API:</strong>
              </p>
              <ul>
                <li>https://www.googleapis.com/auth/drive.file</li>
                <li>https://www.googleapis.com/auth/drive.readonly</li>
              </ul>
            </div>
          </div>
          <div className="sui-box-footer">
            <div className="sui-actions-right">
              <Button
                variant="primary"
                onClick={handleSaveCredentials}
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Save Credentials"}
              </Button>
            </div>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="sui-box">
          <div className="sui-box-header">
            <h2 className="sui-box-title">Authenticate with Google Drive</h2>
          </div>
          <div className="sui-box-body">
            <div className="sui-box-settings-row">
              <p>
                Please authenticate with Google Drive to proceed with the test.
              </p>
              <p>
                <strong>
                  This test will require the following permissions:
                </strong>
              </p>
              <ul>
                <li>View and manage Google Drive files</li>
                <li>Upload new files to Drive</li>
                <li>Create folders in Drive</li>
              </ul>
            </div>
          </div>
          <div className="sui-box-footer">
            <div className="sui-actions-left">
              <Button
                variant="secondary"
                onClick={() => setShowCredentials(true)}
              >
                Change Credentials
              </Button>
            </div>
            <div className="sui-actions-right">
              <Button
                variant="primary"
                onClick={handleAuth}
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Authenticate with Google Drive"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* File Upload Section */}
          <div className="sui-box">
            <div className="sui-box-header">
              <h2 className="sui-box-title">Upload File to Drive</h2>
            </div>
            <div className="sui-box-body">
              <div className="sui-box-settings-row">
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="drive-file-input"
                />
                {uploadFile && (
                  <p>
                    <strong>Selected:</strong> {uploadFile.name} (
                    {Math.round(uploadFile.size / 1024)} KB)
                  </p>
                )}
              </div>
            </div>
            <div className="sui-box-footer">
              <div className="sui-actions-right">
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={isLoading || !uploadFile}
                >
                  {isLoading ? <Spinner /> : "Upload to Drive"}
                </Button>
              </div>
            </div>
          </div>

          {/* Create Folder Section */}
          <div className="sui-box">
            <div className="sui-box-header">
              <h2 className="sui-box-title">Create New Folder</h2>
            </div>
            <div className="sui-box-body">
              <div className="sui-box-settings-row">
                <TextControl
                  label="Folder Name"
                  value={folderName}
                  onChange={setFolderName}
                  placeholder="Enter folder name"
                />
              </div>
            </div>
            <div className="sui-box-footer">
              <div className="sui-actions-right">
                <Button
                  variant="secondary"
                  onClick={handleCreateFolder}
                  disabled={isLoading || !folderName.trim()}
                >
                  {isLoading ? <Spinner /> : "Create Folder"}
                </Button>
              </div>
            </div>
          </div>

          {/* Files List Section */}
          <div className="sui-box">
            <div className="sui-box-header">
              <h2 className="sui-box-title">Your Drive Files</h2>
              <div className="sui-actions-right">
                <Button
                  variant="secondary"
                  onClick={loadFiles}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : "Refresh Files"}
                </Button>
              </div>
            </div>
            <div className="sui-box-body">
              {isLoading ? (
                <div className="drive-loading">
                  <Spinner />
                  <p>Loading files...</p>
                </div>
              ) : files.length > 0 ? (
                <div className="drive-files-grid">
                  {files.map((file) => (
                    <div key={file.id} className="drive-file-item">
                      <div className="file-info">
                        <strong>{file.name}</strong>
                        <small>
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString()
                            : "Unknown date"}
                        </small>
                      </div>
                      <div className="file-actions">
                        {file.webViewLink && (
                          <Button
                            variant="link"
                            size="small"
                            href={file.webViewLink}
                            target="_blank"
                          >
                            View in Drive
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() =>
                            handleDownload(file.id, file.name, file.mimeType)
                          }
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sui-box-settings-row">
                  <p>
                    No files found in your Drive. Upload a file or create a
                    folder to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

if (createRoot) {
  createRoot(domElement).render(
    <StrictMode>
      <WPMUDEV_DriveTest />
    </StrictMode>
  );
} else {
  render(
    <StrictMode>
      <WPMUDEV_DriveTest />
    </StrictMode>,
    domElement
  );
}

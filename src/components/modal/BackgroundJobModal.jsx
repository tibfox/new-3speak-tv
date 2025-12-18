import { useNavigate } from "react-router-dom";
import { useLegacyUpload } from "../../context/LegacyUploadContext";
import "./BackgroundJobModal.scss"
export default function BackgroundJobModal() {
  const { hasBackgroundJob } = useLegacyUpload();
  const navigate = useNavigate()

  if (!hasBackgroundJob) return null;

  return (
    <div className="upload-warning-modals">
      <div className="modal-card">
        <h3>Background job running</h3>
        <p>
          A video upload is currently running in the background.
          You can continue browsing, but please don’t start another upload.
        </p>
        <button onClick={()=>navigate("/profile")}>View Progress</button>
      </div>
    </div>
  );
}

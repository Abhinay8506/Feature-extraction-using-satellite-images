import React, { useState } from "react";
import axios from "axios";
import './styles.css';

const NDWIApp = () => {
  const [image, setImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setOutputImage(null); // Reset output image when a new file is selected
    }
  };

  // Submit image to backend
  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true); // Start loading state
      const response = await axios.post(
        "http://localhost:5000/process-ndwi", // Backend URL
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data); // Log response to check for errors or data
      if (response.data.outputImage) {
        setOutputImage(response.data.outputImage); // Set the processed image if successful
      } else {
        alert("Error: " + response.data.error); // Show error if any
      }
      setLoading(false); // End loading state
    } catch (error) {
      console.error("Error processing the image:", error);
      alert("Failed to process the image. Please try again.");
      setLoading(false); // End loading state
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>NDWI Water Body Detection</h1>
      
      {/* File input */}
      <input
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleImageChange}
        style={{ marginBottom: "20px" }}
      />
      <br />
      
      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Submit"}
      </button>
      
      {/* Image output */}
      <div style={{ marginTop: "30px" }}>
        {outputImage && (
          <>
            <h3>Processed Image:</h3>
            <img
              src={`data:image/png;base64,${outputImage}`} // Base64 image string
              alt="Processed Water Body Detection"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default NDWIApp;

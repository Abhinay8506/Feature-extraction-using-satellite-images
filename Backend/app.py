from flask import Flask, request, jsonify
import base64
from io import BytesIO
from PIL import Image
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/process-ndwi', methods=['POST'])
def process_ndwi():
    # Get the uploaded image file
    file = request.files.get('image')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    
    try:
        # Log file details before processing
        file.seek(0)  # Ensure we are at the start of the file
        print(f"Received file: {file.filename}, size: {len(file.read())} bytes")
        
        # Reset file pointer after reading for further processing
        file.seek(0)
        
        # Open the uploaded image
        img = Image.open(file).convert("RGB")
        
        # Convert image to numpy array
        img_array = np.array(img)

        # Assuming the image is an NDWI image where blue/white represents water
        # Convert image to grayscale if it isn't already
        if img_array.ndim == 3:  # If RGB
            grayscale_img = np.dot(img_array[..., :3], [0.299, 0.587, 0.114])  # Convert to grayscale
        else:  # Already grayscale
            grayscale_img = img_array

        # Apply threshold to detect water (for example, NDWI > 0.3 is water)
        water_mask = (grayscale_img > 128).astype(np.uint8) * 255  # 128 is a threshold for water detection in NDWI
        
        # Convert the water mask to an image
        result_img = Image.fromarray(water_mask).convert("L")
        buffered = BytesIO()
        result_img.save(buffered, format="PNG")
        encoded_img = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({"outputImage": encoded_img})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("===========================================")
    print("      Flask Server is Running!            ")
    print("===========================================")
    print("  You can now test the NDWI Processing API ")
    print("    Access it at: http://127.0.0.1:5000/   ")
    print("===========================================")
    app.run(debug=True)

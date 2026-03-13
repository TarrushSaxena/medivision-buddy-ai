from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
import io
from PIL import Image
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageData(BaseModel):
    image_data: str

# In a real scenario, we load the model here:
# MODEL_PATH = "models/densenet201_covid.h5"
# if os.path.exists(MODEL_PATH):
#     import tensorflow as tf
#     model = tf.keras.models.load_model(MODEL_PATH)
# else:
#     model = None

def preprocess_image(base64_string):
    # Remove the data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    # Decode base64 string
    img_data = base64.b64decode(base64_string)
    img = Image.open(io.BytesIO(img_data)).convert('RGB')
    
    # Convert to numpy array
    img_array = np.array(img)
    
    # Convert RGB to Grayscale for CLAHE
    gray_image = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    clahe_image = clahe.apply(gray_image)
    
    # Convert back to RGB format sizes expected by DenseNet201
    clahe_rgb = cv2.cvtColor(clahe_image, cv2.COLOR_GRAY2RGB)
    
    # Resize to the input shape expected by the model (e.g., 224x224 or 256x256)
    # The notebook doesn't specify the exact input size in the previewed code, but 224x224 is standard for DenseNet
    resized_img = cv2.resize(clahe_rgb, (224, 224))
    
    # Normalize pixel values
    normalized_img = resized_img / 255.0
    
    # Add batch dimension
    return np.expand_dims(normalized_img, axis=0)

@app.post("/predict/xray")
async def predict_xray(data: ImageData):
    try:
        # 1. Preprocess the image
        processed_image = preprocess_image(data.image_data)
        
        # 2. Predict using the model
        # if model is not None:
        #     predictions = model.predict(processed_image)[0]
        #     # Interpret predictions based on the class indices from the notebook
        #     # Assuming classes: 0: COVID-19, 1: Lung_Opacity, 2: Normal, 3: Viral Pneumonia
        #     pass
        # else:
        
        # --- MOCK PREDICTION ---
        # While we wait for the real weights file, we return a mock structured response
        import random
        scores = {
            "covid19": random.uniform(0.0, 0.3),
            "pneumonia": random.uniform(0.0, 0.3),
            "lung_opacity": random.uniform(0.0, 0.3),
            "normal": random.uniform(0.5, 0.9),
        }
        total = sum(scores.values())
        normalized = {k: round((v / total) * 100, 1) for k, v in scores.items()}
        
        max_class = max(normalized, key=normalized.get)
        max_conf = normalized[max_class]
        
        return {
            "prediction": max_class,
            "confidence": max_conf,
            "all_predictions": normalized
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

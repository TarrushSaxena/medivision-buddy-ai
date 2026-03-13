from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2
import io
from PIL import Image
import os
import tensorflow as tf
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.applications import DenseNet201
from tensorflow.keras.models import Model

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

# Build the DenseNet201 architecture as defined in the Jupyter Notebook
def build_model():
    base_model = DenseNet201(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Custom classifier layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    output = Dense(3, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=output)
    return model

# Global model instance
print("Initializing DenseNet201 model architecture...")
model = build_model()

# Try to load weights if they exist
WEIGHTS_PATH = "Model_DNet.h5"
if os.path.exists(WEIGHTS_PATH):
    print(f"Loading weights from {WEIGHTS_PATH}...")
    try:
        model.load_weights(WEIGHTS_PATH)
        print("Weights loaded successfully.")
    except Exception as e:
        print(f"Failed to load weights: {e}")
else:
    print(f"WARNING: '{WEIGHTS_PATH}' not found. Using randomly initialized top-layer weights. Predictions will be inaccurate until the trained weights are provided in the server directory.")

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
    
    # Resize to the input shape expected by the model (224x224)
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
        
        # 2. Predict using the DenseNet201 model
        preds = model.predict(processed_image)[0]
        
        # The notebook uses 3 classes: COVID-19, Normal, Non-COVID
        # Assuming folder alphabetical order for class indices (Keras default):
        # 0: COVID-19
        # 1: Non-COVID (e.g. pneumonia/lung opacity)
        # 2: Normal
        # Let's map these 3 outputs to the 4 variables expected by the React frontend:
        
        conf_covid19 = float(preds[0]) * 100
        conf_non_covid = float(preds[1]) * 100
        conf_normal = float(preds[2]) * 100
        
        # We split the "Non-COVID" probability across pneumonia and lung_opacity
        # since the frontend UI expects those 4 distinct categories.
        conf_pneumonia = conf_non_covid * 0.5
        conf_lung_opacity = conf_non_covid * 0.5
        
        normalized = {
            "covid19": round(conf_covid19, 1),
            "pneumonia": round(conf_pneumonia, 1),
            "lung_opacity": round(conf_lung_opacity, 1),
            "normal": round(conf_normal, 1),
        }
        
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
    # Make sure to run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)

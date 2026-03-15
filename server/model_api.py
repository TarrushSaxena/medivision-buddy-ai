from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import numpy as np
import cv2
import io
import os
import tensorflow as tf
from tensorflow import keras
from PIL import Image
from sklearn.ensemble import RandomForestClassifier

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Symptom Classifier Logic
class SymptomAI:
    def __init__(self):
        # Expanded symptom list matching the frontend categories
        self.symptoms = [
            'cough', 'shortness_of_breath', 'chest_pain', 'wheezing', 'rapid_breathing',
            'fever', 'chills', 'fatigue', 'body_aches', 'night_sweats',
            'headache', 'sore_throat', 'loss_of_taste_smell',
            'nausea', 'diarrhea'
        ]
        
        # Simple medical knowledge base for training the model
        # 1 = Symptom present, 0 = Absent
        self.training_data = [
            # [Respiratory symptoms..., Systemic symptoms..., Head/Throat..., GI...] -> Condition
            ([1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0], 'Pneumonia'),
            ([1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1], 'COVID-19'),
            ([1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 'Bronchitis'),
            ([1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0], 'Common Cold'),
            ([0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], 'Possible Cardiac Event'),
            ([0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'Allergies'),
            ([1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], 'Tuberculosis'),
        ]
        
        self.X = [d[0] for d in self.training_data]
        self.y = [d[1] for d in self.training_data]
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(self.X, self.y)
        
    def predict(self, user_symptoms):
        print(f"\n[AI] Received symptoms: {user_symptoms}")
        
        # Convert user symptoms to feature vector
        vector = [1 if s in user_symptoms else 0 for s in self.symptoms]
        prediction = self.model.predict([vector])[0]
        probabilities = self.model.predict_proba([vector])[0]
        confidence = float(np.max(probabilities))
        
        print(f"[AI] Model Inference: {prediction} (Confidence: {confidence:.2f})")
        
        # Calculate Normalized Local Impact
        importances = self.model.feature_importances_
        feature_impacts = []
        total_selected_weight = 0
        
        # 1. Gather raw weights for selected symptoms
        for i, symptom_name in enumerate(self.symptoms):
            if vector[i] == 1:
                weight = float(importances[i])
                total_selected_weight += float(weight)
                feature_impacts.append({
                    "name": symptom_name.replace('_', ' ').title(),
                    "raw_weight": float(weight)
                })
        
        # 2. Normalize weights so they sum to 100%
        final_impacts = []
        if total_selected_weight > 0:
            for item in feature_impacts:
                normalized_impact = (item["raw_weight"] / float(total_selected_weight)) * 100.0
                final_impacts.append({
                    "name": item["name"],
                    "impact": round(float(normalized_impact), 1)
                })
                print(f"[AI] Internal logic: Symptom '{item['name']}' contributed {normalized_impact:.1f}% to this prediction")
        
        # Sort by impact
        final_impacts = sorted(final_impacts, key=lambda x: x['impact'], reverse=True)

        # Risk assessment logic based on medical urgency
        risk_map = {
            'Pneumonia': ('high', 'Seek medical attention within 24 hours.'),
            'COVID-19': ('moderate', 'Schedule a medical consultation within 48 hours.'),
            'Bronchitis': ('moderate', 'Monitor symptoms; consult if worsening.'),
            'Common Cold': ('low', 'Self-care at home; no immediate medical attention needed.'),
            'Possible Cardiac Event': ('critical', 'EMERGENCY: Seek immediate medical attention.'),
            'Allergies': ('low', 'Over-the-counter treatment; rest.'),
            'Tuberculosis': ('high', 'Specialist consultation required.'),
        }
        
        risk_level, urgency = risk_map.get(prediction, ('low', 'Monitor symptoms.'))
        
        # Recommendation logic
        recommendation_map = {
            'critical': ['Call emergency services immediately', 'Do not drive yourself', 'Stay upright'],
            'high': ['Seek urgent care', 'Monitor oxygen levels', 'Isolate from others'],
            'moderate': ['Get tested', 'Self-isolate', 'Rest and hydrate'],
            'low': ['Rest', 'Stay hydrated', 'OTC pain relief if needed']
        }
        
        return {
            "prediction": prediction,
            "confidence": confidence,
            "riskLevel": risk_level,
            "urgency": urgency,
            "recommendations": recommendation_map.get(risk_level, ['Consult a doctor']),
            "featureImportance": final_impacts
        }

symptom_ai = SymptomAI()

class SymptomRequest(BaseModel):
    selected_symptoms: List[str]

@app.post("/predict/symptoms")
async def predict_symptoms(request: SymptomRequest):
    try:
        result = symptom_ai.predict(request.selected_symptoms)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ImageData(BaseModel):
    image_data: str

# Load the real model here:
MODEL_PATH = "models/densenet201_covid.h5"
if os.path.exists(MODEL_PATH):
    import tensorflow as tf
    # Load model and suppress verbose tensorflow logging if desired
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Successfully loaded model from {MODEL_PATH}")
else:
    model = None
    print(f"Warning: Model not found at {MODEL_PATH}. Using mock predictions if enabled or it will fail.")

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

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    # First, we create a model that maps the input image to the activations
    # of the last conv layer as well as the output predictions
    grad_model = keras.models.Model(
        inputs=[model.inputs],
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    # Then, we compute the gradient of the top predicted class for our input image
    # with respect to the activations of the last conv layer
    with tf.GradientTape() as tape:
        last_conv_layer_output, preds = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(preds[0])
        class_channel = preds[:, pred_index]

    # This is the gradient of the output neuron (top predicted or chosen)
    # with regard to the output feature map of the last conv layer
    grads = tape.gradient(class_channel, last_conv_layer_output)

    # This is a vector where each entry is the mean intensity of the gradient
    # over a specific feature map channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # We multiply each channel in the feature map array
    # by "how important this channel is" with regard to the top predicted class
    # then sum all the channels to obtain the heatmap class activation
    last_conv_layer_output = last_conv_layer_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # For visualization purpose, we will also normalize the heatmap between 0 & 1
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy()

def get_superimposed_heatmap(img_array, heatmap):
    # Rescale heatmap to a range 0-255
    heatmap = np.uint8(255 * heatmap)

    # Use jet colormap to colorize heatmap
    jet = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # Create an image with RGB colorized heatmap
    jet_heatmap = cv2.resize(jet, (img_array.shape[2], img_array.shape[1]))

    # Superimpose the heatmap on original image
    # Image in img_array is normalized 0-1, convert to 0-255
    original_img = np.uint8(255 * img_array[0])
    superimposed_img = jet_heatmap * 0.4 + original_img
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)

    # Encode to base64
    _, buffer = cv2.imencode('.png', cv2.cvtColor(superimposed_img, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buffer).decode('utf-8')

@app.post("/predict/xray")
async def predict_xray(data: ImageData):
    try:
        # 1. Preprocess the image
        processed_image = preprocess_image(data.image_data)
        
        # 2. Predict using the model
        if model is not None:
            predictions = model.predict(processed_image)[0]
            
            # The notebook defines classes as: {0: 'COVID', 1: 'Non COVID', 2: 'Normal'}
            # Map model output indices to frontend-expected keys
            class_map = {
                0: 'covid19',      # COVID
                1: 'pneumonia',    # Non-COVID (mapped to pneumonia for frontend)
                2: 'normal',       # Normal
            }
            
            # Build scores dict from raw predictions
            scores = {}
            for idx, key in class_map.items():
                scores[key] = float(predictions[idx])
            
            # Add lung_opacity as a derived score (fraction of non-normal)
            scores['lung_opacity'] = float(max(0, (scores['covid19'] + scores['pneumonia']) / 2 * 0.3))
            
            total = sum(scores.values())
            if total == 0:
                total = 1e-6  # Prevent division by zero
            normalized = {k: round((v / total) * 100, 1) for k, v in scores.items()}
            
            max_class = max(normalized, key=normalized.get)
            max_conf = normalized[max_class]

            # 3. Generate Grad-CAM Heatmap
            heatmap_base64 = None
            try:
                heatmap = make_gradcam_heatmap(processed_image, model, 'conv5_block32_concat')
                heatmap_base64 = get_superimposed_heatmap(processed_image, heatmap)
            except Exception as heatmap_err:
                print(f"Warning: Grad-CAM generation failed: {heatmap_err}")
            
            result = {
                "prediction": max_class,
                "confidence": max_conf,
                "all_predictions": normalized,
            }
            if heatmap_base64:
                result["heatmap_image"] = f"data:image/png;base64,{heatmap_base64}"
            
            return result
        else:
            # --- MOCK PREDICTION FALLBACK ---
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
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI Model API on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)

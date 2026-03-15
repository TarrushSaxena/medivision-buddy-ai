# Checking if GPU is activated
import tensorflow as tf
tf.config.list_physical_devices('GPU')

# Cell to import necessary library
import numpy as np
import pandas as pd
import cv2
import random
from tqdm import tqdm
import matplotlib.pyplot as plt

from tensorflow import keras
from sklearn import metrics

import os
%matplotlib inline

# Cell to clean directory from previous test files or useless files:

#import shutil
shutil.rmtree('/kaggle/working/COVID-EX-Qu-dataset')
#os.remove('/kaggle/working/Model_DNet.h5')

# This cells is made to set the different directories used in this notebook
groups = ['COVID-19', 'Normal', 'Non-COVID']
sets = ['Val', 'Test', 'Train']
# Define base pat
base_path = '/kaggle/input/covidqu/Lung Segmentation Data/Lung Segmentation Data'
destination_path = '/kaggle/working/COVID-EX-Qu-dataset'
destination_path_masked = '/kaggle/working/COVID-EX-Qu-dataset_MASKED'

# Only run this cell if working files are not in kaggle working directory
import shutil
for sett in sets:
  for group in groups:
    ima_dir = os.path.join(base_path, sett, group)
    for dos in tqdm(os.listdir(ima_dir)):
        if dos=="images":
            shutil.copytree(os.path.join(ima_dir, dos), os.path.join(destination_path, sett, group, dos))

# Checking data integrity after Kaggle input to output directory
n_covid = 0
n_noncovid = 0
n_normal = 0
#----Reference number from COVID-EX-qu Kaggle------------
ref_covid = 11956
ref_noncovid = 11263
ref_normal = 10701
#-------------------------------------------------------
for sett in sets:
  for group in groups:
    ima_dir = os.path.join(destination_path, sett, group)
    for dos in os.listdir(ima_dir):
      num = len(os.listdir(os.path.join(ima_dir, dos)))
      print(f"In the set {sett}, there are {num} {dos} of {group}")
      if group =="COVID-19" and dos=='images':
        n_covid += len(os.listdir(os.path.join(ima_dir, dos)))
      if group =="Non-COVID" and dos=='images':
        n_noncovid += len(os.listdir(os.path.join(ima_dir, dos)))
      if group =="Normal" and dos=='images':
        n_normal += len(os.listdir(os.path.join(ima_dir, dos)))

print(f"\nThere are {n_covid} COVID images found, {n_covid/ref_covid *100}% of the original dataset from Kaggle.")
print(f"There are {n_noncovid} non-COVID images, {n_noncovid/ref_noncovid *100}% of the original dataset from Kaggle.")
print(f"There are {n_normal} normal images, {n_normal/ref_normal *100}% of the original dataset from Kaggle.")

def preprocessing_viz (endpoint):
        # Visual test of the future preprocessing:
    # Evaluation of the CLAHE performance

    sett = random.choice(sets)
    group = random.choice(groups)

    directory_path = os.path.join(destination_path, sett, group, 'images')

    files = os.listdir(directory_path)
    random_file = random.choice(files)

    image_path = os.path.join(directory_path, random_file)

    image = cv2.imread(image_path)

    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Initialize CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    # Apply CLAHE
    clahe_image = clahe.apply(gray_image)
    # Create a new figure with two subplots
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    # Display the original image in the first subplot
    axes[0].imshow(gray_image, cmap='gray')
    axes[0].set_title('Original Image')
    axes[0].axis('off')

    # Display the CLAHE-enhanced image in the second subplot
    axes[1].imshow(cv2.cvtColor(clahe_image, cv2.COLOR_GRAY2RGB))
    axes[1].set_title('CLAHE Enhanced Image')
    axes[1].axis('off')
    plt.show()

preprocessing_viz ('images')

# Implementation of the CLAHE preprocessing:
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def preprocess_image(img):
    # Check if image is RGB and convert to grayscale
    if len(img.shape) == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Ensure image is of type uint8 for CLAHE
    img = img.astype('uint8')
    
    # Apply CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)
    
    # Convert grayscale back to RGB
    img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    
    # Normalize the image to [0, 1]
    img = img.astype('float32') / 255.0
    
    return img

# Data generators with the custom preprocessing function
train_data_generator = ImageDataGenerator(preprocessing_function=preprocess_image)
val_data_generator = ImageDataGenerator(preprocessing_function=preprocess_image)
test_data_generator = ImageDataGenerator(preprocessing_function=preprocess_image)

# Preparation of the data set using image generator
batch_size = 32
train_generator = train_data_generator.flow_from_directory(directory=os.path.join(destination_path, 'Train'),
                                                           class_mode="sparse",
                                                           target_size=(224, 224),
                                                           batch_size=batch_size)

val_generator = val_data_generator.flow_from_directory(directory=os.path.join(destination_path, 'Val'),
                                                         class_mode="sparse",
                                                         target_size=(224, 224),
                                                         batch_size=batch_size)

test_generator = test_data_generator.flow_from_directory(directory=os.path.join(destination_path, 'Test'),
                                                          class_mode="sparse",
                                                          target_size=(224, 224),
                                                          batch_size=batch_size, shuffle=False)
# shuffle=False argument is very important for model evaluation

# Visual check of images in generators:

class_names = {
    0: 'COVID',
    1: 'Non COVID',
    2: 'Normal'
}
# Function to visualize images from a batch
def visualize_images(image_batch, label_batch, num_images=5):
    plt.figure(figsize=(15, 8))
    for i in range(num_images):
        plt.subplot(1, num_images, i+1)
        plt.imshow(image_batch[i])
        plt.title(f"Label: {class_names[label_batch[i]]}")
        plt.axis('off')
    plt.show()

# Retrieve a batch of images and labels from the generator
train_generator.reset()
batch_images, batch_labels = train_generator[1]

# Visualize the batch of images
visualize_images(batch_images, batch_labels)

#Main architecture of the model
import tensorflow as tf
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.applications import DenseNet201
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam

def build_model():
    base_model = DenseNet201(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

    # Freeze the pre-trained layers
    for layer in base_model.layers:
        layer.trainable = False
    for layer in base_model.layers[137:]: # Comment line if not fine tuned
        layer.trainable = True            # Comment line if not fine tuned

    # Add custom classifier layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    output = Dense(3, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=output)

    # Compile the model
    optimizer = Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer,
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])

    return model

# Model
Model_DNet = build_model()

# Checking of model layers
Model_DNet.summary()

# Definition of callbacks:
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping

reduce_learning_rate = ReduceLROnPlateau(
                                    monitor="val_loss",
                                    patience=3, #si val_loss stagne sur 3 epochs consécutives selon la valeur min_delta
                                    min_delta= 0.01,
                                    factor=0.1,  # On réduit le learning rate d'un facteur 0.1
                                    cooldown = 4, # On attend 4 epochs avant de réitérer 
                                    verbose=1)

# MODEL TRAINING:
nb_img_train = train_generator.samples
nb_img_val = val_generator.samples
history_densenet = Model_DNet.fit(train_generator, 
                                epochs = 30,
                                steps_per_epoch = nb_img_train//batch_size,
                                validation_data=val_generator,
                                validation_steps=nb_img_val//batch_size,
                                callbacks = [reduce_learning_rate]
                                )

# Loss and accuracy analysis during training
def plot_model_history (history):
    plt.figure(figsize=(12,4))
    plt.subplot(121)
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model loss by epoch')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'val'], loc='right')

    plt.subplot(122)
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Model acc by epoch')
    plt.ylabel('acc')
    plt.xlabel('epoch')
    plt.legend(['train', 'val'], loc='right')
    plt.show()

plot_model_history(history_densenet)

from tensorflow.keras.models import load_model
Model_DNet_m = load_model('/kaggle/working/Model_DNet_m_freezed.h5')
Model_DNet = load_model('/kaggle/working/Model_DNet_freezed.h5')

Model_DNet.load_weights('/kaggle/working/DNet_B_v0_image_freezed.weights.h5')

# Model evaluation on test generator data
evaluation = Model_DNet.evaluate(test_generator)

# Print the evaluation metrics
print("Test Loss:", evaluation[0])
print("Test Accuracy:", evaluation[1])

# Confusion_ matrix:

import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report

# Generate predictions on the test data
predictions = Model_DNet.predict(test_generator)
# Get the predicted classes
predicted_classes = np.argmax(predictions, axis=1)
# Get the true classes
true_classes = test_generator.classes

# Calculate the confusion matrix
conf_matrix = confusion_matrix(true_classes, predicted_classes)
print(classification_report(true_classes, predicted_classes))
# Plot the heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=test_generator.class_indices.keys(), yticklabels=test_generator.class_indices.keys())
plt.xlabel('Predicted labels')
plt.ylabel('True labels')
plt.title('Confusion Matrix_Optimized DenseNet')
plt.show()

# Visualization of results on images from test_generator data:
class_names = {
    0: 'COVID',
    1: 'Non COVID',
    2: 'Normal'
}

# Function to apply the model on a batch of images and visualize the results
def apply_model_and_visualize_multiple_images(model, data_generator, num_images=12):
    plt.figure(figsize=(15, 15))
    data_generator.reset()
    
    for i in range(num_images):
        # Retrieve one image and its label from the generatorl 
        batch_images, batch_labels = random.choice(data_generator)
        image = batch_images[0]  # Take the first image from the batch
        label = round(batch_labels[0])  # Corresponding label
        
        # Reshape the image to (1, height, width, channels) for model prediction
        image = np.expand_dims(image, axis=0)
        
        # Apply the trained model to obtain prediction
        prediction = model.predict(image)
        
        # Round the predicted label to the nearest integer
        predicted_label = np.argmax(prediction)
        
        # Convert integer labels to class names
        true_class_name = class_names[label]
        predicted_class_name = class_names[predicted_label]
        
        # Visualize the result
        plt.subplot(4, 3, i+1)
        plt.imshow(image[0])
        
        # Determine title color based on whether true and predicted labels match
        title_color = 'green' if true_class_name == predicted_class_name else 'red'
        
        plt.title(f"True Label: {true_class_name}\nPredicted Label: {predicted_class_name}", color=title_color)
        plt.axis('off')
    plt.show()

# Example usage for applying the model on multiple images from the validation set
apply_model_and_visualize_multiple_images(Model_DNet, test_generator, num_images=12)

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    # First, we create a model that maps the input image to the activations
    # of the last conv layer as well as the output predictions
    grad_model = keras.models.Model(inputs = model.input, outputs = [model.get_layer(last_conv_layer_name).output, model.output])

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

def plot_gradcam_results (model, data, model_layer, num_image=10):
    model.layers[-1].activation = None
    for i in range(num_image):
        batch_images, batch_labels = random.choice(data)
        batch_image = batch_images[:num_image]  # Take the first image from the batch
        batch_label = batch_labels[:num_image]  # Corresponding label
        img_array = batch_image[i]
        image = np.expand_dims(img_array, axis=0)

        # Make the prediction
        prediction = model.predict(image)

        # Create the heatmap
        heatmap = make_gradcam_heatmap(image, model, model_layer)

        # Resize the heatmap to the original image size
        heatmap = tf.expand_dims(heatmap, axis=-1)  # Add an extra channel dimension
        heatmap = tf.image.resize(heatmap, (img_array.shape[0], img_array.shape[1]))

        # Convert the heatmap to numpy array
        heatmap = heatmap.numpy()
        heatmap = np.abs(heatmap-1) # Red and blue are reversed, probably because cv2 and tensorflow dont use the same default colors - This will make them appear as I want

        # Normalize the heatmap
        heatmap = np.uint8(255 * heatmap)

        # Apply colormap (jet or any other)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

        # Convert heatmap to float32 and scale to [0, 1]
        heatmap = heatmap.astype(np.float32) / 255

        # Superimpose both images
        superimposed_img = cv2.addWeighted(img_array, 0.5, heatmap, 0.5, 0)

        # Get predicted and true labels
        true_label = batch_label[i]
        true_class_name = class_names[true_label]
        predicted_label = np.argmax(prediction[0])
        predicted_class_name = class_names[predicted_label]

        title_color = 'green' if true_label == predicted_label else 'red'

        # Plot the original image and the Grad-CAM heatmap
        plt.figure(figsize=(15, 5))
        plt.suptitle('Image {} - Predicted label: {} | True label: {}'.format(i+1, predicted_class_name, true_class_name), fontsize=16, x=0.5, y=0.98, horizontalalignment='right', color=title_color)
        plt.subplot(1, 2, 1)
        plt.imshow(img_array)
        plt.title('Original')
        plt.axis('off')

        plt.subplot(1, 2, 2)
        plt.imshow(superimposed_img)
        plt.title('Grad-CAM Heatmap')
        plt.axis('off')

        plt.show()

plot_gradcam_results (Model_DNet, test_generator, 'conv5_block32_concat')

Model_DNet_m = build_model()
# If model weights were saved in previous session, un-comment following commande:
#Model_DNet_m.load_weights('/kaggle/working/DNet_B_v0_masked_freezed.weights.h5')

#During 1st session or if persistance was not set to "Files...", un-comment following lines:
for sett in sets:
  for group in groups:
    
    image_folder = os.path.join(base_path, sett, group, 'images')
    masks_folder = os.path.join(base_path, sett, group, 'lung masks')
    output_dir = os.path.join(destination_path_masked, sett, group, 'masked images')
   
    os.makedirs(output_dir, exist_ok=True)

    images = sorted(os.listdir(image_folder))

    for image_name in tqdm(images):
        img_path = os.path.join(image_folder, image_name)
        mask_path = os.path.join(masks_folder, image_name)  # Assuming mask names are the same as image names

        img = cv2.imread(img_path)
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)

        masked_image = cv2.bitwise_and(img, img, mask=mask)

        output_path = os.path.join(output_dir, f'masked_{image_name[:-4]}.png')  # Save as PNG
        
        cv2.imwrite(output_path, masked_image)

    print(f"{sett} {group} masked images saved successfully.")

# Preparation of the data set using image generator on masked images
batch_size = 32
train_generator_m = train_data_generator.flow_from_directory(directory=os.path.join(destination_path_masked, 'Train'),
                                                           class_mode="sparse",
                                                           target_size=(224, 224),
                                                           batch_size=batch_size)

val_generator_m = val_data_generator.flow_from_directory(directory=os.path.join(destination_path_masked, 'Val'),
                                                         class_mode="sparse",
                                                         target_size=(224, 224),
                                                         batch_size=batch_size)

test_generator_m = test_data_generator.flow_from_directory(directory=os.path.join(destination_path_masked, 'Test'),
                                                          class_mode="sparse",
                                                          target_size=(224, 224),
                                                          batch_size=batch_size, shuffle=False)
# shuffle=False argument is very important for model evaluation

# Visual check of images in generators:

# Retrieve a batch of images and labels from the generator
train_generator_m.reset()
batch_images, batch_labels = train_generator_m[1]

# Visualize the batch of images
visualize_images(batch_images, batch_labels)

#Training of the model of masked images
nb_img_train = train_generator_m.samples
nb_img_val = val_generator_m.samples
history_densenet_m = Model_DNet_m.fit(train_generator_m, 
                                epochs = 30,
                                steps_per_epoch = nb_img_train//batch_size,
                                validation_data=val_generator_m,
                                validation_steps=nb_img_val//batch_size,
                                callbacks = [reduce_learning_rate]
                                )

# Loss and accuracy analysis during training

plot_model_history(history_densenet_m)

# Model evaluation on test generator data
evaluation = Model_DNet_m.evaluate(test_generator_m)

# Print the evaluation metrics
print("Test Loss:", evaluation[0])
print("Test Accuracy:", evaluation[1])

# Confusion_ matrix:

import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report

# Generate predictions on the test data
predictions = Model_DNet_m.predict(test_generator_m)
# Get the predicted classes
predicted_classes = np.argmax(predictions, axis=1)
# Get the true classes
true_classes = test_generator_m.classes

# Calculate the confusion matrix
conf_matrix = confusion_matrix(true_classes, predicted_classes)
print(classification_report(true_classes, predicted_classes))
# Plot the heatmap
plt.figure(figsize=(10, 8))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=test_generator_m.class_indices.keys(), yticklabels=test_generator_m.class_indices.keys())
plt.xlabel('Predicted labels')
plt.ylabel('True labels')
plt.title('Confusion Matrix_Optimized DenseNet')
plt.show()

apply_model_and_visualize_multiple_images(Model_DNet_m, test_generator_m, num_images=12)

plot_gradcam_results (Model_DNet_m, test_generator_m, 'conv5_block32_concat')

#If session re-loaded or any future use of the model: 
#Model_DNet.load_weights('/kaggle/working/COVID-EX-Qu-dataset/Models/DNet_B_v0.weights.h5')

#Model saving
#Model_DNet.save_weights('/kaggle/working/model_densenet.weights.h5')
Model_DNet_m.save_weights('/kaggle/working/model_densenet_masked.weights.h5')

Model_DNet.save('/kaggle/working/Model_DNet.h5') 
#Model_DNet_m.save('/kaggle/working/Model_DNet_m_unfreezed.h5')


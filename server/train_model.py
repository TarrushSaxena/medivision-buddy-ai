import tensorflow as tf
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.applications import DenseNet201
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping
import cv2
import numpy as np
import os
import ssl
ssl._create_default_https_context = ssl._create_unverified_context

print("Checking if GPU is activated...")
print(tf.config.list_physical_devices('GPU'))

def preprocess_image(img):
    if len(img.shape) == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img = img.astype('uint8')
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)
    img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
    img = img.astype('float32') / 255.0
    return img

def build_model():
    base_model = DenseNet201(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    for layer in base_model.layers:
        layer.trainable = False
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.2)(x)
    output = Dense(3, activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=output)
    optimizer = Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer,
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    return model

if __name__ == '__main__':
    base_path = '/Users/anubhavpoddar/Desktop/Medivision/models/Test'
    
    print("Preparing data generators...")
    train_data_generator = ImageDataGenerator(preprocessing_function=preprocess_image)
    val_data_generator = ImageDataGenerator(preprocessing_function=preprocess_image)

    batch_size = 32
    train_generator = train_data_generator.flow_from_directory(
        directory=os.path.join(base_path, 'Train'),
        class_mode="sparse",
        target_size=(224, 224),
        batch_size=batch_size
    )

    val_generator = val_data_generator.flow_from_directory(
        directory=os.path.join(base_path, 'Val'),
        class_mode="sparse",
        target_size=(224, 224),
        batch_size=batch_size
    )

    print("Building model...")
    model = build_model()
    
    reduce_learning_rate = ReduceLROnPlateau(
        monitor="val_loss",
        patience=3, 
        min_delta=0.01,
        factor=0.1,  
        cooldown=4, 
        verbose=1
    )
    
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )

    print("Starting training...")
    nb_img_train = train_generator.samples
    nb_img_val = val_generator.samples
    
    # We will train for a shorter number of epochs since wait time is a factor, normally this is 30
    EPOCHS = 3
    
    history = model.fit(
        train_generator, 
        epochs=EPOCHS,
        steps_per_epoch=nb_img_train//batch_size,
        validation_data=val_generator,
        validation_steps=nb_img_val//batch_size,
        callbacks=[reduce_learning_rate, early_stopping]
    )
    
    save_path = '/Users/anubhavpoddar/Desktop/Medivision/server/models/densenet201_covid.h5'
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    model.save(save_path)
    print(f"Model saved successfully to {save_path}")

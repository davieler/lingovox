from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import whisperx
import os
import json
DATAPATH = os.path.join(os.path.dirname(__file__), "data/")

####################################################################################################
app = FastAPI() # Instancia de FastAPI

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
####################################################################################################
device = "cpu"
batch_size = 16
compute_type = "int8"

model = whisperx.load_model("large-v2", device, compute_type=compute_type) # Load model
####################################################################################################

async def audio_transcription(file_path: str):
    try:
        audio = whisperx.load_audio(file_path)
        transcription = model.transcribe(audio, batch_size=batch_size)
        return transcription["segments"] # Return transcription segmented by time
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/")
async def upload_audio(audio_file: UploadFile = File(...)):
    try:
        with open(DATAPATH + audio_file.filename, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer) # Save file
        transcription = await audio_transcription(DATAPATH + audio_file.filename) # Process audio

        return {"transcription": transcription} # Return transcription segmented by time
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
####################################################################################################

@app.post("/translate/")
async def translate_audio(audio_file: UploadFile = File(...), language: str = Form(...)):
    try:
        contents = await audio_file.read()

        # Save file in server with other name
        file_path = f"output_{audio_file.filename}"

        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        return FileResponse(file_path, media_type="audio/wav") # Return file (test)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
####################################################################################################

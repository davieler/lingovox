from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import json

app = FastAPI() # Instancia de FastAPI

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_audio(audio_file: UploadFile = File(...)):
    try:
        file_path = f"./{audio_file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer) # Save file in server
        return {"text_to_translate": audio_file.filename} # Return filename (test)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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




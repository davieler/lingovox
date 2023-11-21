# pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
# pip install git+https://github.com/m-bain/whisperx.git
# pip install git+https://github.com/m-bain/whisperx.git --upgrade

import whisperx
import os
DATAPATH = os.path.join(os.path.dirname(__file__), "data/")

device = "cpu"
batch_size = 16
compute_type = "int8"
audio_file = "Tian - Al azar.mp3"

# Load model and audio
model = whisperx.load_model("large-v2", device, compute_type=compute_type)
audio = whisperx.load_audio(audio_file)

# Transcribe
result = model.transcribe(audio, batch_size=batch_size)

# Print result
print(result["segments"])

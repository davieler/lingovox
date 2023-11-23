"use client";

import React, { useState, useEffect } from 'react';
import './page.css';

function Page() {
    const [language, set_language] = useState('es'); // output language
    const [audio_file, set_audio_file] = useState(null); // audio file
    const [transcription, set_transcription] = useState(null); // transcription of the audio file
    const [textarea, set_textarea] = useState(''); // textarea of the transcription
    const [audio_file_uploaded, set_audio_file_uploaded] = useState(false); // audio file uploaded

    const set_textarea_transform = (text) => {
        // Revert the text of the textarea to the transcription
        // and update the transcription
        /*
        de aterrizaje serían las Bahamas basta para calcular el pasa no pasa si en teoría sí -> [0.009, 5.464]
        
        {
            "start": 0.009,
            "end": 5.464,
            "text": "de aterrizaje serían las Bahamas basta para calcular el pasa no pasa si en teoría sí"
        }
        */
        set_textarea(text);
        set_transcription(text.split('\n').map((line) => {
            const [text, time] = line.split(' -> ');
            const [start, end] = time.split(', ');
            return {
                start: parseFloat(start.replace('[', '')),
                end: parseFloat(end.replace(']', '')),
                text: text,
            }
        }));
    }

    const handle_language_change = (event) => {
        set_language(event.target.value);
    }

    const handle_audio_upload = (event) => {
        const file = event.target.files[0]; // get the file
        set_audio_file(file); // set the file
        set_audio_file_uploaded(false); // set the audio_file_uploaded to false
    }

    const handle_submit_upload = async (event) => {
        event.preventDefault();
        if (audio_file) { // if the audio file is selected
            set_textarea('Uploading...');

            const formData = new FormData();
            formData.append('audio_file', audio_file);

            try {
                const response = await fetch('http://localhost:8000/upload/', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error('Error to send audio file');
                }
                // Update the text of the audio file (speech to text)
                const data = await response.json();
                set_transcription(data.transcription); // set the transcription

                /*
                transcription = [
                    {
                        "start": 0.0,
                        "end": 0.5,
                        "text": "Hola, mi nombre es Carlos y soy gay."
                    },
                    {
                        "start": 0.5,
                        "end": 1.0,
                        "text": "¿Cómo estás?"
                    }
                    # Otros segmentos de texto
                ]

                
                */
                set_audio_file_uploaded(true); // set the audio_file_uploaded to true

                // Update the textarea of the transcription
                let text = data.transcription.map((segment) => `${segment.text} -> [${segment.start}, ${segment.end}]`).join('\n');
                
                set_textarea(text); // set the textarea
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            alert('You need to select an audio file first');
        }
    }

    const handle_submit_translate = async (event) => {
        event.preventDefault();
        if (audio_file_uploaded) { // if the audio file is uploaded
            const form = new FormData();
            form.append('language', language);
            form.append('audio_file', audio_file);

            try {
                const response = await fetch('http://localhost:8000/translate/', {
                    method: 'POST',
                    body: form,
                });
                if (!response.ok) {
                    throw new Error('Error to translate audio file');
                }
                // "Download" the audio file translated
                const blob = await response.blob();

                // Simulate a mouse click:
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'translated_audio.wav');
                link.click();
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            alert('You need to upload an audio file first');
        }
    }

    return (
        <div>
            <header> {/* title */}
                <h1>Lingovox</h1>
            </header>
            <main> {/* forms */}
                <form className="upload-class" onSubmit={handle_submit_upload}>
                    <div>
                        <input type="file"
                            accept="audio/*"
                            onChange={handle_audio_upload}
                        />
                        <button type="submit">Upload</button>
                    </div>
                    <textarea name="transcription"
                        readOnly={!audio_file_uploaded} // if the audio file is not uploaded, textarea is read only
                        value={textarea}
                        onChange={(event) => set_textarea_transform(event.target.value)} // edit the transcription in the textarea
                    >
                    </textarea>
                </form>
                <form className="translate-class" onSubmit={handle_submit_translate}>
                    <select value={language} onChange={handle_language_change}>
                        <option value="es">Spanish</option>
                        <option value="en">English</option>
                        <option value="pt">Portuguese</option>
                        <option value="fr">French</option>
                    </select>
                    <button type="submit">Translate</button>
                </form>
            </main>
        </div>
    );
}

export default Page;

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import logging

# Importing the wrapper function
from bg_remove import remove_bg

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pro Background Remover API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        logger.info(f"Processing image: {file.filename}")
        image_bytes = await file.read()
        
        # Background removal call
        result = remove_bg(image_bytes)

        # Preparing response buffer
        buf = io.BytesIO()
        result.save(buf, format="PNG", optimize=True)
        buf.seek(0)

        return StreamingResponse(
            buf, 
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename=no_bg_{file.filename}.png"}
        )

    except Exception as e:
        logger.error(f"Error processing {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error during processing")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "u2net"}
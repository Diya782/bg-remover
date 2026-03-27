import io
import numpy as np
import cv2
from PIL import Image
from transparent_background import Remover

class UniversalBackgroundRemover:
    def __init__(self):
        self.remover = Remover(mode='base', device='cpu') 

    def process(self, image_bytes: bytes) -> Image.Image:
        img_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_np = np.array(img_pil)
        
        result_rgba = self.remover.process(img_pil, type='rgba')
        ai_mask = np.array(result_rgba)[:, :, 3]

        is_art = self._is_black_white_art(img_np)

        if is_art:
            final_alpha = self._refine_art_mask(img_np, ai_mask)
        else:
          
            final_alpha = self._refine_general_mask(ai_mask)
        
        return Image.fromarray(np.dstack((img_np, final_alpha)), mode="RGBA")

    def _is_black_white_art(self, img):
        hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
        avg_saturation = np.mean(hsv[:, :, 1])
        
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        return avg_saturation < 30 and laplacian_var > 1000

    def _refine_general_mask(self, ai_mask):
       
        _, alpha = cv2.threshold(ai_mask, 100, 255, cv2.THRESH_BINARY)
        
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)
        
        return cv2.GaussianBlur(alpha, (3, 3), 0)

    def _refine_art_mask(self, img, ai_mask):
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        _, binary = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        drawing_mask = np.zeros_like(gray)
        if contours:
            cv2.drawContours(drawing_mask, contours, -1, 255, thickness=cv2.FILLED)
        
        return cv2.bitwise_or(ai_mask, drawing_mask)

engine = UniversalBackgroundRemover()

def remove_bg(image_bytes: bytes) -> Image.Image:
    return engine.process(image_bytes)
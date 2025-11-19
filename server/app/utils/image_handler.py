import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
from flask import current_app


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def save_image(file):
    """Save uploaded image and return filename"""
    if file and allowed_file(file.filename):
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Resize and optimize image
        img = Image.open(file)
        
        # Convert RGBA to RGB if necessary
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Resize if too large (max 1200px width)
        max_width = 1200
        if img.width > max_width:
            ratio = max_width / img.width
            new_size = (max_width, int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        
        # Save optimized image
        img.save(filepath, quality=85, optimize=True)
        
        return filename, filepath
    return None, None


def delete_image(filename):
    """Delete image file"""
    try:
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
    except Exception as e:
        print(f"Error deleting image: {e}")
    return False
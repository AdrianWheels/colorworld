import os
from PIL import Image

def resize_icons():
    # Use absolute paths or relative to execution context
    base_dir = os.getcwd()
    source_dir = os.path.join(base_dir, "public", "Icons")
    target_dir = os.path.join(base_dir, "public", "Icons", "web")
    
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        print(f"Created directory: {target_dir}")

    # List only files in the source directory
    files = [f for f in os.listdir(source_dir) if os.path.isfile(os.path.join(source_dir, f)) and f.lower().endswith('.png')]
    
    print(f"Found {len(files)} PNG images to process.")

    for filename in files:
        source_path = os.path.join(source_dir, filename)
        target_path = os.path.join(target_dir, filename)
        
        try:
            with Image.open(source_path) as img:
                # Resize to 64x64 using high quality resampling
                # Standard web icon size often 24, 32, 48, 64. Using 64 for good quality.
                resized_img = img.resize((64, 64), Image.Resampling.LANCZOS)
                
                # Save optimized
                resized_img.save(target_path, "PNG", optimize=True)
                print(f"Resized {filename} to 64x64 and saved to {target_path}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    resize_icons()
